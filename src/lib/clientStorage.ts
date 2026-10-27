/**
 * Ideal Furniture — High-Capacity IndexedDB Client Storage Engine
 * 
 * Provides rock-solid, multi-gigabyte persistence for:
 * 1. Product catalog, categories, media library, and site settings.
 * 2. 3,000-image bulk upload batches, individual upload queue items,
 *    per-file statuses, and resumption tokens across browser refreshes.
 */

const DB_NAME = 'ideal_furniture_durable_v1';
const DB_VERSION = 1;

export interface DurableUploadItem {
  id: string;
  batchId: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  fileHash?: string;
  status:
    | 'pending'
    | 'uploading'
    | 'uploaded'
    | 'analyzing'
    | 'needs_review'
    | 'ready_to_publish'
    | 'published'
    | 'failed'
    | 'cancelled';
  progress: number;
  cloudUrl?: string;
  thumbnailUrl?: string;
  assignedProductId?: string;
  productTitle?: string;
  detectedCategoryId?: string;
  detectedCategoryName?: string;
  detectedSubCategory?: string;
  wood?: string;
  upholstery?: string;
  description?: string;
  errorMessage?: string;
  createdAt: number;
  updatedAt: number;
}

export interface DurableUploadBatch {
  id: string;
  name: string;
  totalFiles: number;
  completedFiles: number;
  failedFiles: number;
  status: 'active' | 'paused' | 'completed' | 'cancelled';
  createdAt: number;
  updatedAt: number;
}

class DurableClientDatabase {
  private dbPromise: Promise<IDBDatabase> | null = null;

  private getDB(): Promise<IDBDatabase> {
    if (this.dbPromise) return this.dbPromise;

    if (typeof window === 'undefined' || !window.indexedDB) {
      return Promise.reject(new Error('IndexedDB is not supported in this environment'));
    }

    this.dbPromise = new Promise((resolve, reject) => {
      const request = window.indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Key-Value Store for application cache
        if (!db.objectStoreNames.contains('app_cache')) {
          db.createObjectStore('app_cache', { keyPath: 'key' });
        }

        // Upload Batches Store
        if (!db.objectStoreNames.contains('upload_batches')) {
          db.createObjectStore('upload_batches', { keyPath: 'id' });
        }

        // Upload Queue Items Store (Indexed by batchId and status for fast querying)
        if (!db.objectStoreNames.contains('upload_items')) {
          const itemsStore = db.createObjectStore('upload_items', { keyPath: 'id' });
          itemsStore.createIndex('batchId', 'batchId', { unique: false });
          itemsStore.createIndex('status', 'status', { unique: false });
          itemsStore.createIndex('fileHash', 'fileHash', { unique: false });
        }

        // Media Library Metadata Store
        if (!db.objectStoreNames.contains('media_records')) {
          db.createObjectStore('media_records', { keyPath: 'id' });
        }
      };

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });

    return this.dbPromise;
  }

  // --- GENERAL KEY-VALUE CACHE ---

  async setCache<T>(key: string, value: T): Promise<void> {
    try {
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction('app_cache', 'readwrite');
        const store = tx.objectStore('app_cache');
        const req = store.put({ key, value, updatedAt: Date.now() });
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    } catch {
      // Fallback to localStorage if IndexedDB transaction fails
      try {
        localStorage.setItem(`idb_fallback_${key}`, JSON.stringify(value));
      } catch {}
    }
  }

  async getCache<T>(key: string, fallback: T): Promise<T> {
    try {
      const db = await this.getDB();
      return new Promise((resolve) => {
        const tx = db.transaction('app_cache', 'readonly');
        const store = tx.objectStore('app_cache');
        const req = store.get(key);
        req.onsuccess = () => {
          if (req.result && req.result.value !== undefined) {
            resolve(req.result.value as T);
          } else {
            resolve(fallback);
          }
        };
        req.onerror = () => resolve(fallback);
      });
    } catch {
      try {
        const raw = localStorage.getItem(`idb_fallback_${key}`);
        if (raw) return JSON.parse(raw);
      } catch {}
      return fallback;
    }
  }

  // --- BULK UPLOAD BATCHES ---

  async saveBatch(batch: DurableUploadBatch): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('upload_batches', 'readwrite');
      const store = tx.objectStore('upload_batches');
      const req = store.put(batch);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  async getBatches(): Promise<DurableUploadBatch[]> {
    try {
      const db = await this.getDB();
      return new Promise((resolve) => {
        const tx = db.transaction('upload_batches', 'readonly');
        const store = tx.objectStore('upload_batches');
        const req = store.getAll();
        req.onsuccess = () => {
          const list = (req.result as DurableUploadBatch[]) || [];
          list.sort((a, b) => b.createdAt - a.createdAt);
          resolve(list);
        };
        req.onerror = () => resolve([]);
      });
    } catch {
      return [];
    }
  }

  async getBatch(id: string): Promise<DurableUploadBatch | null> {
    try {
      const db = await this.getDB();
      return new Promise((resolve) => {
        const tx = db.transaction('upload_batches', 'readonly');
        const store = tx.objectStore('upload_batches');
        const req = store.get(id);
        req.onsuccess = () => resolve(req.result || null);
        req.onerror = () => resolve(null);
      });
    } catch {
      return null;
    }
  }

  // --- UPLOAD QUEUE ITEMS (Large Batch Scalable) ---

  async saveUploadItems(items: DurableUploadItem[]): Promise<void> {
    if (!items || items.length === 0) return;
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('upload_items', 'readwrite');
      const store = tx.objectStore('upload_items');
      for (const item of items) {
        store.put(item);
      }
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  async updateUploadItem(id: string, updates: Partial<DurableUploadItem>): Promise<DurableUploadItem | null> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('upload_items', 'readwrite');
      const store = tx.objectStore('upload_items');
      const getReq = store.get(id);
      getReq.onsuccess = () => {
        const existing = getReq.result as DurableUploadItem;
        if (!existing) {
          resolve(null);
          return;
        }
        const updated: DurableUploadItem = {
          ...existing,
          ...updates,
          updatedAt: Date.now(),
        };
        const putReq = store.put(updated);
        putReq.onsuccess = () => resolve(updated);
        putReq.onerror = () => reject(putReq.error);
      };
      getReq.onerror = () => reject(getReq.error);
    });
  }

  async getUploadItemsByBatch(batchId: string): Promise<DurableUploadItem[]> {
    try {
      const db = await this.getDB();
      return new Promise((resolve) => {
        const tx = db.transaction('upload_items', 'readonly');
        const store = tx.objectStore('upload_items');
        const index = store.index('batchId');
        const req = index.getAll(batchId);
        req.onsuccess = () => resolve((req.result as DurableUploadItem[]) || []);
        req.onerror = () => resolve([]);
      });
    } catch {
      return [];
    }
  }

  async findUploadItemByHash(fileHash: string): Promise<DurableUploadItem | null> {
    if (!fileHash) return null;
    try {
      const db = await this.getDB();
      return new Promise((resolve) => {
        const tx = db.transaction('upload_items', 'readonly');
        const store = tx.objectStore('upload_items');
        const index = store.index('fileHash');
        const req = index.get(fileHash);
        req.onsuccess = () => resolve((req.result as DurableUploadItem) || null);
        req.onerror = () => resolve(null);
      });
    } catch {
      return null;
    }
  }

  async deleteBatch(batchId: string): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(['upload_batches', 'upload_items'], 'readwrite');
      const batchStore = tx.objectStore('upload_batches');
      const itemsStore = tx.objectStore('upload_items');

      batchStore.delete(batchId);

      const index = itemsStore.index('batchId');
      const req = index.getAllKeys(batchId);
      req.onsuccess = () => {
        const keys = req.result;
        for (const key of keys) {
          itemsStore.delete(key);
        }
      };

      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }
}

export const clientStorage = new DurableClientDatabase();
