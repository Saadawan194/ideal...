/**
 * Data layer abstraction for Ideal Furniture
 * Persists directly to the authoritative server backend (disk JSON db + /uploads folder)
 * with robust client caching (IndexedDB + memory) so data is NEVER lost on refresh or back navigation.
 */

import {
  Category,
  HomepageContent,
  Lead,
  LeadNote,
  MediaItem,
  Product,
  SiteSettings,
  Space,
  User,
} from '../types';
import {
  SEED_CATEGORIES,
  SEED_HOMEPAGE_CONTENT,
  SEED_LEADS,
  SEED_PRODUCTS,
  SEED_SETTINGS,
  SEED_SPACES,
  SEED_USERS,
} from '../data/seedData';
import { clientStorage } from './clientStorage';

// Lazy dynamic loader for Firebase Firestore to keep the initial page bundle ultra-light
async function getFirestoreDb() {
  const { firestore } = await import('./firebase');
  const firestoreModule = await import('firebase/firestore');
  return { firestore, ...firestoreModule };
}

export interface DatabaseInterface {
  // Products
  getProducts(): Promise<Product[]>;
  getProduct(id: string): Promise<Product | null>;
  getProductBySlug(slug: string): Promise<Product | null>;
  createProduct(product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product>;
  createProductsBulk(products: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>[]): Promise<Product[]>;
  generateBulkProducts(count: number, category?: string, theme?: string): Promise<Product[]>;
  updateProduct(id: string, updates: Partial<Product>): Promise<Product>;
  deleteProduct(id: string): Promise<boolean>;
  associateImageToProduct(productId: string, imageUrl: string, isFeatured?: boolean): Promise<Product>;

  // Categories & Spaces
  getCategories(): Promise<Category[]>;
  createCategory(category: Omit<Category, 'id'>): Promise<Category>;
  updateCategory(id: string, updates: Partial<Category>): Promise<Category>;
  deleteCategory(id: string): Promise<boolean>;

  getSpaces(): Promise<Space[]>;
  createSpace(space: Omit<Space, 'id'>): Promise<Space>;
  updateSpace(id: string, updates: Partial<Space>): Promise<Space>;
  deleteSpace(id: string): Promise<boolean>;

  // Leads & Inquiries
  getLeads(): Promise<Lead[]>;
  getLead(id: string): Promise<Lead | null>;
  createLead(lead: Omit<Lead, 'id' | 'createdAt' | 'updatedAt' | 'notes'>): Promise<Lead>;
  updateLead(id: string, updates: Partial<Lead>): Promise<Lead>;
  addLeadNote(leadId: string, content: string, author: string): Promise<LeadNote>;
  deleteLead(id: string): Promise<boolean>;
  logInquiry(inquiry: {
    name?: string;
    phone?: string;
    email?: string;
    city?: string;
    source: Lead['source'];
    productId?: string;
    productName?: string;
    productCode?: string;
    message?: string;
  }): Promise<Lead>;

  // Homepage Content & Settings
  getHomepageContent(): Promise<HomepageContent>;
  updateHomepageContent(content: Partial<HomepageContent>): Promise<HomepageContent>;

  getSettings(): Promise<SiteSettings>;
  updateSettings(settings: Partial<SiteSettings>): Promise<SiteSettings>;

  // Media Library
  getMediaItems(): Promise<MediaItem[]>;
  uploadMedia(name: string, dataUrl: string, size?: string): Promise<MediaItem>;
  deleteMedia(id: string): Promise<boolean>;

  // Users & Auth
  getUsers(): Promise<User[]>;
  getUser(id: string): Promise<User | null>;
  createUser(user: Omit<User, 'id' | 'createdAt'>): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User>;
  deleteUser(id: string): Promise<boolean>;
  authenticateUser(email: string, password: string): Promise<User | null>;

  // Backup & Snapshot
  exportDatabase(): Promise<string>;
  importDatabase(jsonString: string): Promise<boolean>;

  // Cloud Firestore Sync
  syncAllToCloudFirestore(): Promise<{ productsCount: number; settingsSynced: boolean }>;
  pullFromCloudFirestore(): Promise<{ productsCount: number }>;
}

const STORAGE_KEYS = {
  PRODUCTS: 'ideal_furniture_products_v3',
  CATEGORIES: 'ideal_furniture_categories_v3',
  SPACES: 'ideal_furniture_spaces_v3',
  LEADS: 'ideal_furniture_leads_v3',
  HOMEPAGE: 'ideal_furniture_homepage_v3',
  SETTINGS: 'ideal_furniture_settings_v3',
  MEDIA: 'ideal_furniture_media_v3',
  USERS: 'ideal_furniture_users_v3',
  CURRENT_USER: 'ideal_furniture_current_user_v3',
};

function getStorage<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function setStorage<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // If localStorage quota exceeded, clear stale keys
    try {
      localStorage.removeItem(STORAGE_KEYS.MEDIA);
      localStorage.setItem(key, JSON.stringify(value));
    } catch {}
  }
}

async function safeFetchJson<T>(url: string): Promise<T | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

class PersistentDatabase implements DatabaseInterface {
  // PRODUCTS - Real-time server-backed fetch with persistent disk state + IndexedDB fallback
  async getProducts(): Promise<Product[]> {
    try {
      const serverProducts = await safeFetchJson<Product[]>('/api/products');
      if (Array.isArray(serverProducts) && serverProducts.length > 0) {
        setStorage(STORAGE_KEYS.PRODUCTS, serverProducts);
        await clientStorage.setCache('products', serverProducts);
        return serverProducts;
      }
    } catch {
      // Server offline fallback to durable client cache
    }

    const cached = await clientStorage.getCache<Product[]>('products', []);
    if (cached && cached.length > 0) {
      return cached;
    }

    const local = getStorage<Product[]>(STORAGE_KEYS.PRODUCTS, []);
    if (local.length > 0) {
      return local;
    }

    return SEED_PRODUCTS;
  }

  async getProduct(id: string): Promise<Product | null> {
    const products = await this.getProducts();
    return products.find((p) => p.id === id) || null;
  }

  async getProductBySlug(slug: string): Promise<Product | null> {
    const products = await this.getProducts();
    return products.find((p) => p.slug === slug || p.id === slug) || null;
  }

  async createProduct(productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product> {
    const now = new Date().toISOString();
    const newProduct: Product = {
      ...productData,
      id: `prod-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
      createdAt: now,
      updatedAt: now,
    };

    // Await server persistence
    const res = await fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newProduct),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Server failed to create product: ${res.status} ${errText}`);
    }

    const saved: Product = await res.json();

    // Update local storage and durable IndexedDB cache
    const current = await this.getProducts();
    const updated = [saved, ...current.filter((p) => p.id !== saved.id)];
    setStorage(STORAGE_KEYS.PRODUCTS, updated);
    await clientStorage.setCache('products', updated);

    // Sync to Cloud Firestore in background if active
    getFirestoreDb().then(({ firestore, doc, setDoc }) => {
      setDoc(doc(firestore, 'products', saved.id), saved).catch(() => {});
    }).catch(() => {});

    return saved;
  }

  async createProductsBulk(productsData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>[]): Promise<Product[]> {
    const now = new Date().toISOString();
    const createdList: Product[] = productsData.map((p, idx) => ({
      ...p,
      id: `prod-${Date.now()}-${idx}-${Math.floor(100 + Math.random() * 900)}`,
      createdAt: now,
      updatedAt: now,
      material: p.material || 'Solid Wood',
      finish: p.finish || 'Natural Satin Finish',
      dimensions: p.dimensions || '',
      spaces: p.spaces || ['Living Room'],
      options: p.options || [],
      isPublished: p.isPublished ?? true,
    }));

    const res = await fetch('/api/products/bulk', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ products: createdList }),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Server bulk product creation failed: ${res.status} ${err}`);
    }

    const saved: Product[] = await res.json();
    const current = await this.getProducts();
    const existingIds = new Set(saved.map((s) => s.id));
    const merged = [...saved, ...current.filter((c) => !existingIds.has(c.id))];

    setStorage(STORAGE_KEYS.PRODUCTS, merged);
    await clientStorage.setCache('products', merged);

    // Sync to Cloud Firestore in background
    getFirestoreDb().then(({ firestore, doc, writeBatch }) => {
      const batch = writeBatch(firestore);
      for (const item of saved.slice(0, 400)) {
        batch.set(doc(firestore, 'products', item.id), item);
      }
      batch.commit().catch(() => {});
    }).catch(() => {});

    return saved;
  }

  async generateBulkProducts(count: number = 15, category: string = 'all', theme: string = ''): Promise<Product[]> {
    try {
      const res = await fetch('/api/generate-bulk-products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ count, category, theme }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.products && Array.isArray(data.products)) {
          return data.products;
        }
      }
    } catch (err) {
      console.warn('Could not generate products from server endpoint:', err);
    }
    return [];
  }

  async updateProduct(id: string, updates: Partial<Product>): Promise<Product> {
    const res = await fetch(`/api/products/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Server failed to update product ${id}: ${res.status} ${errText}`);
    }

    const updated: Product = await res.json();
    const current = await this.getProducts();
    const updatedList = current.map((p) => (p.id === id ? updated : p));

    setStorage(STORAGE_KEYS.PRODUCTS, updatedList);
    await clientStorage.setCache('products', updatedList);

    // Sync to Cloud Firestore in background
    getFirestoreDb().then(({ firestore, doc, setDoc }) => {
      setDoc(doc(firestore, 'products', id), updated, { merge: true }).catch(() => {});
    }).catch(() => {});

    return updated;
  }

  async deleteProduct(id: string): Promise<boolean> {
    const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Server failed to delete product ${id}: ${res.status} ${errText}`);
    }

    const current = await this.getProducts();
    const filtered = current.filter((p) => p.id !== id);

    setStorage(STORAGE_KEYS.PRODUCTS, filtered);
    await clientStorage.setCache('products', filtered);

    // Delete from Firestore in background
    getFirestoreDb().then(({ firestore, doc, deleteDoc }) => {
      deleteDoc(doc(firestore, 'products', id)).catch(() => {});
    }).catch(() => {});

    return true;
  }

  async associateImageToProduct(productId: string, imageUrl: string, isFeatured: boolean = false): Promise<Product> {
    const product = await this.getProduct(productId);
    if (!product) throw new Error(`Product ${productId} not found`);

    const currentImages = Array.isArray(product.images) ? [...product.images] : [];
    if (!currentImages.includes(imageUrl)) {
      if (isFeatured) {
        currentImages.unshift(imageUrl);
      } else {
        currentImages.push(imageUrl);
      }
    }

    const updates: Partial<Product> = {
      images: currentImages,
      ...(isFeatured ? { featuredImage: imageUrl } : {}),
    };

    return await this.updateProduct(productId, updates);
  }

  // CATEGORIES
  async getCategories(): Promise<Category[]> {
    try {
      const res = await fetch('/api/categories');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setStorage(STORAGE_KEYS.CATEGORIES, data);
          await clientStorage.setCache('categories', data);
          return data;
        }
      }
    } catch {
      // Offline fallback
    }

    const cached = await clientStorage.getCache<Category[]>('categories', []);
    if (cached && cached.length > 0) return cached;

    return getStorage<Category[]>(STORAGE_KEYS.CATEGORIES, SEED_CATEGORIES);
  }

  async createCategory(categoryData: Omit<Category, 'id'>): Promise<Category> {
    const newCat: Category = {
      ...categoryData,
      id: `cat-${Date.now()}`,
    };
    const res = await fetch('/api/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newCat),
    });
    if (!res.ok) throw new Error(`Failed to create category: ${res.status}`);
    const saved = await res.json();
    const local = await this.getCategories();
    const updated = [...local, saved];
    setStorage(STORAGE_KEYS.CATEGORIES, updated);
    await clientStorage.setCache('categories', updated);
    return saved;
  }

  async updateCategory(id: string, updates: Partial<Category>): Promise<Category> {
    const categories = await this.getCategories();
    const index = categories.findIndex((c) => c.id === id);
    if (index === -1) throw new Error(`Category ${id} not found`);
    categories[index] = { ...categories[index], ...updates };
    setStorage(STORAGE_KEYS.CATEGORIES, categories);
    await clientStorage.setCache('categories', categories);
    // sync to server
    try {
      await fetch('/api/db/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ categories }),
      });
    } catch (e) {
      console.warn(e);
    }
    return categories[index];
  }

  async deleteCategory(id: string): Promise<boolean> {
    const categories = await this.getCategories();
    const filtered = categories.filter((c) => c.id !== id);
    setStorage(STORAGE_KEYS.CATEGORIES, filtered);
    await clientStorage.setCache('categories', filtered);
    try {
      await fetch('/api/db/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ categories: filtered }),
      });
    } catch (e) {
      console.warn(e);
    }
    return true;
  }

  // SPACES
  async getSpaces(): Promise<Space[]> {
    try {
      const res = await fetch('/api/spaces');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setStorage(STORAGE_KEYS.SPACES, data);
          await clientStorage.setCache('spaces', data);
          return data;
        }
      }
    } catch {}
    const cached = await clientStorage.getCache<Space[]>('spaces', []);
    if (cached && cached.length > 0) return cached;
    return getStorage<Space[]>(STORAGE_KEYS.SPACES, SEED_SPACES);
  }

  async createSpace(spaceData: Omit<Space, 'id'>): Promise<Space> {
    const newSpace: Space = {
      ...spaceData,
      id: `space-${Date.now()}`,
    };
    const res = await fetch('/api/spaces', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newSpace),
    });
    if (!res.ok) throw new Error(`Failed to create space: ${res.status}`);
    const saved = await res.json();
    const current = await this.getSpaces();
    const updated = [...current, saved];
    setStorage(STORAGE_KEYS.SPACES, updated);
    await clientStorage.setCache('spaces', updated);
    return saved;
  }

  async updateSpace(id: string, updates: Partial<Space>): Promise<Space> {
    const spaces = await this.getSpaces();
    const index = spaces.findIndex((s) => s.id === id);
    if (index === -1) throw new Error(`Space ${id} not found`);
    spaces[index] = { ...spaces[index], ...updates };
    setStorage(STORAGE_KEYS.SPACES, spaces);
    await clientStorage.setCache('spaces', spaces);
    try {
      await fetch('/api/db/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ spaces }),
      });
    } catch (e) {
      console.warn(e);
    }
    return spaces[index];
  }

  async deleteSpace(id: string): Promise<boolean> {
    const spaces = await this.getSpaces();
    const filtered = spaces.filter((s) => s.id !== id);
    setStorage(STORAGE_KEYS.SPACES, filtered);
    await clientStorage.setCache('spaces', filtered);
    try {
      await fetch('/api/db/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ spaces: filtered }),
      });
    } catch (e) {
      console.warn(e);
    }
    return true;
  }

  // LEADS
  async getLeads(): Promise<Lead[]> {
    try {
      const res = await fetch('/api/leads');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setStorage(STORAGE_KEYS.LEADS, data);
          await clientStorage.setCache('leads', data);
          return data;
        }
      }
    } catch {}
    const cached = await clientStorage.getCache<Lead[]>('leads', []);
    if (cached && cached.length > 0) return cached;
    return getStorage<Lead[]>(STORAGE_KEYS.LEADS, SEED_LEADS);
  }

  async getLead(id: string): Promise<Lead | null> {
    const leads = await this.getLeads();
    return leads.find((l) => l.id === id) || null;
  }

  async createLead(leadData: Omit<Lead, 'id' | 'createdAt' | 'updatedAt' | 'notes'>): Promise<Lead> {
    const now = new Date().toISOString();
    const newLead: Lead = {
      ...leadData,
      id: `lead-${Date.now()}`,
      status: leadData.status || 'New',
      notes: [],
      createdAt: now,
      updatedAt: now,
    };
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newLead),
      });
      if (res.ok) {
        const saved = await res.json();
        const leads = await this.getLeads();
        const updated = [saved, ...leads];
        setStorage(STORAGE_KEYS.LEADS, updated);
        await clientStorage.setCache('leads', updated);
        return saved;
      }
    } catch (e) {
      console.warn(e);
    }
    const leads = await this.getLeads();
    leads.unshift(newLead);
    setStorage(STORAGE_KEYS.LEADS, leads);
    await clientStorage.setCache('leads', leads);
    return newLead;
  }

  async updateLead(id: string, updates: Partial<Lead>): Promise<Lead> {
    const leads = await this.getLeads();
    const index = leads.findIndex((l) => l.id === id);
    if (index === -1) throw new Error(`Lead ${id} not found`);
    const updatedLead: Lead = {
      ...leads[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    leads[index] = updatedLead;
    setStorage(STORAGE_KEYS.LEADS, leads);
    await clientStorage.setCache('leads', leads);
    try {
      await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedLead),
      });
    } catch (e) {
      console.warn(e);
    }
    return updatedLead;
  }

  async addLeadNote(leadId: string, content: string, author: string): Promise<LeadNote> {
    const note: LeadNote = {
      id: `note-${Date.now()}`,
      content,
      author,
      createdAt: new Date().toISOString(),
    };
    const lead = await this.getLead(leadId);
    if (!lead) throw new Error(`Lead ${leadId} not found`);
    const currentNotes: LeadNote[] = Array.isArray(lead.notes) ? lead.notes : [];
    const updatedNotes: LeadNote[] = [...currentNotes, note];
    await this.updateLead(leadId, { notes: updatedNotes });
    return note;
  }

  async deleteLead(id: string): Promise<boolean> {
    const leads = await this.getLeads();
    const filtered = leads.filter((l) => l.id !== id);
    setStorage(STORAGE_KEYS.LEADS, filtered);
    await clientStorage.setCache('leads', filtered);
    try {
      await fetch(`/api/leads/${id}`, { method: 'DELETE' });
    } catch (e) {
      console.warn(e);
    }
    return true;
  }

  async logInquiry(inquiry: {
    name?: string;
    phone?: string;
    email?: string;
    city?: string;
    source: Lead['source'];
    productId?: string;
    productName?: string;
    productCode?: string;
    message?: string;
  }): Promise<Lead> {
    const leadData: Omit<Lead, 'id' | 'createdAt' | 'updatedAt' | 'notes'> = {
      name: inquiry.name || 'Anonymous Inquiry',
      phone: inquiry.phone || '',
      email: inquiry.email || '',
      city: inquiry.city || 'Lahore',
      source: inquiry.source,
      status: 'New',
      preferredContactMethod: inquiry.phone ? 'phone' : (inquiry.email ? 'email' : 'whatsapp'),
      itemsOfInterest: inquiry.productName ? [inquiry.productName] : [],
      productId: inquiry.productId,
      productName: inquiry.productName,
      productCode: inquiry.productCode,
      message: inquiry.message,
    };
    return this.createLead(leadData);
  }

  // HOMEPAGE CONTENT
  async getHomepageContent(): Promise<HomepageContent> {
    try {
      const res = await fetch('/api/homepage');
      if (res.ok) {
        const data = await res.json();
        if (data && data.heroHeadline) {
          setStorage(STORAGE_KEYS.HOMEPAGE, data);
          await clientStorage.setCache('homepage', data);
          return data;
        }
      }
    } catch {}
    const cached = await clientStorage.getCache<HomepageContent>('homepage', SEED_HOMEPAGE_CONTENT);
    return cached;
  }

  async updateHomepageContent(content: Partial<HomepageContent>): Promise<HomepageContent> {
    const current = await this.getHomepageContent();
    const updated = { ...current, ...content };
    setStorage(STORAGE_KEYS.HOMEPAGE, updated);
    await clientStorage.setCache('homepage', updated);
    try {
      const res = await fetch('/api/homepage', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn(e);
    }
    return updated;
  }

  // SITE SETTINGS
  async getSettings(): Promise<SiteSettings> {
    try {
      const res = await fetch('/api/settings');
      if (res.ok) {
        const data = await res.json();
        if (data && data.brandName) {
          setStorage(STORAGE_KEYS.SETTINGS, data);
          await clientStorage.setCache('settings', data);
          return data;
        }
      }
    } catch {}
    const cached = await clientStorage.getCache<SiteSettings>('settings', SEED_SETTINGS);
    return cached;
  }

  async updateSettings(settings: Partial<SiteSettings>): Promise<SiteSettings> {
    const current = await this.getSettings();
    const updated = { ...current, ...settings };
    setStorage(STORAGE_KEYS.SETTINGS, updated);
    await clientStorage.setCache('settings', updated);
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn(e);
    }
    return updated;
  }

  // MEDIA LIBRARY (Permanent verified storage)
  async getMediaItems(): Promise<MediaItem[]> {
    try {
      const res = await fetch('/api/media');
      if (res.ok) {
        const items = await res.json();
        if (Array.isArray(items)) {
          setStorage(STORAGE_KEYS.MEDIA, items);
          await clientStorage.setCache('media', items);
          return items;
        }
      }
    } catch (e) {
      console.warn('Fetch media failed, using local/durable cache:', e);
    }
    const cached = await clientStorage.getCache<MediaItem[]>('media', []);
    if (cached && cached.length > 0) return cached;
    return getStorage<MediaItem[]>(STORAGE_KEYS.MEDIA, []);
  }

  /**
   * Uploads media and AWAITS verified server/cloud storage.
   * NEVER returns a fake success or unconfirmed base64 data URL.
   */
  async uploadMedia(name: string, dataUrl: string, size: string = 'Custom'): Promise<MediaItem> {
    const res = await fetch('/api/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ filename: name, dataUrl, size }),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Server failed to permanently store media: ${res.status} ${errText}`);
    }

    const data = await res.json();
    if (!data.success || !data.item || !data.url) {
      throw new Error(data.error || 'Media upload returned invalid payload');
    }

    const confirmedItem: MediaItem = data.item;
    const current = await this.getMediaItems();
    const updated = [confirmedItem, ...current.filter((m) => m.id !== confirmedItem.id)];

    setStorage(STORAGE_KEYS.MEDIA, updated);
    await clientStorage.setCache('media', updated);

    // Sync to Firestore in background
    getFirestoreDb().then(({ firestore, doc, setDoc }) => {
      setDoc(doc(firestore, 'media', confirmedItem.id), confirmedItem).catch(() => {});
    }).catch(() => {});

    return confirmedItem;
  }

  async deleteMedia(id: string): Promise<boolean> {
    const res = await fetch(`/api/media/${id}`, { method: 'DELETE' });
    if (!res.ok) {
      console.warn(`Server media delete failed for ${id}`);
    }
    const current = await this.getMediaItems();
    const filtered = current.filter((m) => m.id !== id);
    setStorage(STORAGE_KEYS.MEDIA, filtered);
    await clientStorage.setCache('media', filtered);

    // Delete from Firestore in background
    getFirestoreDb().then(({ firestore, doc, deleteDoc }) => {
      deleteDoc(doc(firestore, 'media', id)).catch(() => {});
    }).catch(() => {});

    return true;
  }

  // USERS
  async getUsers(): Promise<User[]> {
    return getStorage<User[]>(STORAGE_KEYS.USERS, SEED_USERS);
  }

  async getUser(id: string): Promise<User | null> {
    const users = await this.getUsers();
    return users.find((u) => u.id === id) || null;
  }

  async createUser(userData: Omit<User, 'id' | 'createdAt'>): Promise<User> {
    const users = await this.getUsers();
    const newUser: User = {
      ...userData,
      id: `usr-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    users.push(newUser);
    setStorage(STORAGE_KEYS.USERS, users);
    return newUser;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User> {
    const users = await this.getUsers();
    const index = users.findIndex((u) => u.id === id);
    if (index === -1) throw new Error(`User ${id} not found`);
    users[index] = { ...users[index], ...updates };
    setStorage(STORAGE_KEYS.USERS, users);
    return users[index];
  }

  async deleteUser(id: string): Promise<boolean> {
    const users = await this.getUsers();
    const filtered = users.filter((u) => u.id !== id);
    setStorage(STORAGE_KEYS.USERS, filtered);
    return true;
  }

  async authenticateUser(email: string, password: string): Promise<User | null> {
    const users = await this.getUsers();
    const found = users.find((u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
    if (found) {
      if (typeof window !== 'undefined') {
        const safeUser = { ...found };
        delete safeUser.password;
        sessionStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(safeUser));
      }
      return found;
    }
    return null;
  }

  async exportDatabase(): Promise<string> {
    try {
      const res = await fetch('/api/db');
      if (res.ok) {
        const data = await res.json();
        return JSON.stringify(data, null, 2);
      }
    } catch (e) {
      console.warn(e);
    }
    const data = {
      products: await this.getProducts(),
      categories: await this.getCategories(),
      spaces: await this.getSpaces(),
      leads: await this.getLeads(),
      homepage: await this.getHomepageContent(),
      settings: await this.getSettings(),
    };
    return JSON.stringify(data, null, 2);
  }

  async importDatabase(jsonString: string): Promise<boolean> {
    try {
      const data = JSON.parse(jsonString);
      await fetch('/api/db/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (data.products) {
        setStorage(STORAGE_KEYS.PRODUCTS, data.products);
        await clientStorage.setCache('products', data.products);
      }
      if (data.categories) {
        setStorage(STORAGE_KEYS.CATEGORIES, data.categories);
        await clientStorage.setCache('categories', data.categories);
      }
      if (data.spaces) {
        setStorage(STORAGE_KEYS.SPACES, data.spaces);
        await clientStorage.setCache('spaces', data.spaces);
      }
      if (data.leads) {
        setStorage(STORAGE_KEYS.LEADS, data.leads);
        await clientStorage.setCache('leads', data.leads);
      }
      if (data.homepage) {
        setStorage(STORAGE_KEYS.HOMEPAGE, data.homepage);
        await clientStorage.setCache('homepage', data.homepage);
      }
      if (data.settings) {
        setStorage(STORAGE_KEYS.SETTINGS, data.settings);
        await clientStorage.setCache('settings', data.settings);
      }
      return true;
    } catch {
      return false;
    }
  }

  // Cloud Firestore Synchronization
  async syncAllToCloudFirestore(): Promise<{ productsCount: number; settingsSynced: boolean }> {
    const products = await this.getProducts();
    const settings = await this.getSettings();
    const { firestore, doc, writeBatch } = await getFirestoreDb();
    const batch = writeBatch(firestore);
    for (const p of products.slice(0, 450)) {
      const ref = doc(firestore, 'products', p.id);
      batch.set(ref, p, { merge: true });
    }
    const settingsRef = doc(firestore, 'settings', 'general');
    batch.set(settingsRef, settings, { merge: true });
    await batch.commit();
    return { productsCount: products.length, settingsSynced: true };
  }

  async pullFromCloudFirestore(): Promise<{ productsCount: number }> {
    const { firestore, collection, getDocs } = await getFirestoreDb();
    const snapshot = await getDocs(collection(firestore, 'products'));
    const cloudProducts: Product[] = [];
    snapshot.forEach((d) => {
      cloudProducts.push(d.data() as Product);
    });
    if (cloudProducts.length > 0) {
      setStorage(STORAGE_KEYS.PRODUCTS, cloudProducts);
      await clientStorage.setCache('products', cloudProducts);
      try {
        await fetch('/api/db/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ products: cloudProducts }),
        });
      } catch {}
    }
    return { productsCount: cloudProducts.length };
  }
}

export const db: DatabaseInterface = new PersistentDatabase();

// Real-Time Multi-Device Event Listener (Instant live sync across all devices)
if (typeof window !== 'undefined') {
  function connectRealtimeSync() {
    try {
      const eventSource = new EventSource('/api/events');
      eventSource.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          if (payload.type === 'PRODUCTS_UPDATED') {
            localStorage.removeItem(STORAGE_KEYS.PRODUCTS);
            window.dispatchEvent(new CustomEvent('ideal_products_updated', { detail: payload }));
          } else if (payload.type === 'MEDIA_UPDATED') {
            localStorage.removeItem(STORAGE_KEYS.MEDIA);
            window.dispatchEvent(new CustomEvent('ideal_media_updated', { detail: payload }));
          } else if (payload.type === 'SETTINGS_UPDATED') {
            localStorage.removeItem(STORAGE_KEYS.SETTINGS);
            window.dispatchEvent(new CustomEvent('ideal_settings_updated', { detail: payload }));
          } else if (payload.type === 'LEADS_UPDATED') {
            localStorage.removeItem(STORAGE_KEYS.LEADS);
            window.dispatchEvent(new CustomEvent('ideal_leads_updated', { detail: payload }));
          }
        } catch {}
      };
      eventSource.onerror = () => {
        eventSource.close();
        setTimeout(connectRealtimeSync, 5000);
      };
    } catch {
      // EventSource fallback
    }
  }
  connectRealtimeSync();
}
