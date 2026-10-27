import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { AdminLayout } from './AdminLayout';
import { db } from '../../lib/db';
import { Category, Product } from '../../types';
import { convertImageToWebP, formatBytes } from '../../lib/imageOptimization';
import { analyzeFurnitureImage } from '../../lib/furnitureAnalysis';
import { uploadImagePermanently } from '../../lib/storageService';
import { clientStorage, DurableUploadItem, DurableUploadBatch } from '../../lib/clientStorage';
import {
  createLightweightThumbnail,
  validateImageFile,
  CategoryCandidate,
} from '../../lib/bulkUploadHelpers';
import { areImagesVisuallyDuplicate } from '../../lib/perceptualHash';
import {
  UploadCloud,
  FolderUp,
  Play,
  Pause,
  RotateCcw,
  Trash2,
  CheckCircle,
  AlertTriangle,
  ExternalLink,
  Sparkles,
  CheckSquare,
  Square,
  Layers,
  Check,
  RefreshCw,
  Cloud,
} from 'lucide-react';

export type QueueItemStatus =
  | 'queued'
  | 'analyzing'
  | 'ready_to_publish'
  | 'uploaded'
  | 'needs_review'
  | 'duplicate'
  | 'failed';

export interface BulkUploadItem {
  id: string;
  originalFile?: File;
  fileName?: string;
  fileHash?: string;
  visualHash?: string;
  thumbnailUrl?: string;
  status: QueueItemStatus;
  progressPercent?: number;

  // AI Decision & Extracted fields
  detectedCategoryId?: string;
  detectedCategoryName?: string;
  detectedSubCategory?: string;
  confidence?: number;
  decision?: 'AUTO_UPLOAD' | 'NEEDS_REVIEW' | 'REJECT';
  title?: string;
  description?: string;
  wood?: string;
  upholstery?: string;
  reason?: string;

  // Manual Review Overrides
  manualCategoryId?: string;
  manualCategoryName?: string;
  manualSubCategory?: string;

  // Output Product details
  createdProductId?: string;
  createdProductSlug?: string;
  publicImageUrl?: string;
  error?: string;
}

export const getItemName = (item?: Partial<BulkUploadItem> | null): string => {
  if (!item) return "furniture.jpg";
  return item.originalFile?.name || item.fileName || "furniture.jpg";
};

export const AdminBulkUploadPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<BulkUploadItem[]>([]);
  const [currentBatchId, setCurrentBatchId] = useState<string>(() => `batch-${Date.now()}`);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  // Settings
  const [classificationMode, setClassificationMode] = useState<string>('ai'); // 'ai' or categoryId
  const [publishMode, setPublishMode] = useState<'review_first' | 'auto_publish'>('auto_publish');
  const [concurrency, setConcurrency] = useState<number>(2); // Balanced 2 concurrent AI requests to avoid 429 rate spikes
  const [activeTab, setActiveTab] = useState<'all' | 'ready' | 'needs_review' | 'uploaded' | 'failed' | 'duplicates'>('all');
  const [searchFilter, setSearchFilter] = useState('');
  const [selectedItemIds, setSelectedItemIds] = useState<Set<string>>(new Set());
  const [bulkTargetCategoryId, setBulkTargetCategoryId] = useState<string>('');
  const [feedbackNotice, setFeedbackNotice] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [isDriveModalOpen, setIsDriveModalOpen] = useState(false);
  const [driveInput, setDriveInput] = useState('');
  const [isDriveImporting, setIsDriveImporting] = useState(false);
  const [autoSkipDuplicates, setAutoSkipDuplicates] = useState(true);

  // DOM Refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);
  const isProcessingRef = useRef(false);
  const isPausedRef = useRef(false);
  const itemsRef = useRef<BulkUploadItem[]>([]);

  // Keep refs in sync with state for async worker loop
  isProcessingRef.current = isProcessing;
  isPausedRef.current = isPaused;
  itemsRef.current = items;

  // Load existing categories on mount
  const loadDatabaseData = async () => {
    try {
      const cats = await db.getCategories();
      setCategories(cats);
      if (cats.length > 0 && !bulkTargetCategoryId) {
        setBulkTargetCategoryId(cats[0].id);
      }
    } catch (err) {
      console.error('Error loading database categories:', err);
    }
  };

  useEffect(() => {
    loadDatabaseData();

    // Restore previous batch from durable IndexedDB
    clientStorage.getBatches().then((batches) => {
      if (batches.length > 0) {
        const lastBatch = batches[0];
        clientStorage.getUploadItemsByBatch(lastBatch.id).then((stored) => {
          if (stored.length > 0) {
            setCurrentBatchId(lastBatch.id);
            const restoredList: BulkUploadItem[] = stored.map((si) => ({
              id: si.id,
              fileName: si.fileName,
              thumbnailUrl: si.thumbnailUrl || si.cloudUrl,
              publicImageUrl: si.cloudUrl,
              status: (si.status as QueueItemStatus) || "uploaded",
              title: si.productTitle || si.fileName,
              detectedCategoryName: si.detectedCategoryName,
              detectedCategoryId: si.detectedCategoryId,
              detectedSubCategory: si.detectedSubCategory,
              wood: si.wood,
              upholstery: si.upholstery,
              description: si.description,
              createdProductId: si.assignedProductId,
            }));
            setItems(restoredList);
            setFeedbackNotice({
              type: "info",
              text: `Restored ${restoredList.length} items from previous batch "${lastBatch.name}".`,
            });
          }
        });
      }
    });
  }, []);

  // Format categories as candidate list for prompt
  const categoryCandidates: CategoryCandidate[] = useMemo(() => {
    return categories.map((c) => ({
      id: c.id,
      name: c.name,
      subCategories: c.subCategories || [],
    }));
  }, [categories]);

  // Statistics counters
  const stats = useMemo(() => {
    const total = items.length;
    const uploaded = items.filter((i) => i.status === 'uploaded').length;
    const ready = items.filter((i) => i.status === 'ready_to_publish').length;
    const needsReview = items.filter((i) => i.status === 'needs_review').length;
    const analyzing = items.filter((i) => i.status === 'analyzing').length;
    const failed = items.filter((i) => i.status === 'failed').length;
    const duplicates = items.filter((i) => i.status === 'duplicate').length;
    const queued = items.filter((i) => i.status === 'queued').length;
    const completed = uploaded + ready + needsReview + failed + duplicates;
    const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

    return { total, uploaded, ready, needsReview, analyzing, failed, duplicates, queued, progress };
  }, [items]);

  // Filtered view items
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      if (activeTab === 'ready' && item.status !== 'ready_to_publish') return false;
      if (activeTab === 'needs_review' && item.status !== 'needs_review') return false;
      if (activeTab === 'uploaded' && item.status !== 'uploaded') return false;
      if (activeTab === 'failed' && item.status !== 'failed') return false;
      if (activeTab === 'duplicates' && item.status !== 'duplicate') return false;
      if (searchFilter) {
        const q = searchFilter.toLowerCase();
        const matchName = getItemName(item).toLowerCase().includes(q);
        const matchTitle = (item.title || '').toLowerCase().includes(q);
        const matchCategory = (item.manualCategoryName || item.detectedCategoryName || '').toLowerCase().includes(q);
        return matchName || matchTitle || matchCategory;
      }
      return true;
    });
  }, [items, activeTab, searchFilter]);

  // Clear duplicates from the current queue in one click
  const handleClearDuplicates = () => {
    setItems((prev) => prev.filter((i) => i.status !== 'duplicate'));
    setFeedbackNotice({
      type: 'info',
      text: 'Duplicate items cleared from the upload queue.',
    });
  };

  // Handle addition of files (supports FileList or File[], handles single/bulk/thousands)
  const handleFilesAdded = async (fileList: FileList | File[] | null) => {
    if (!fileList) return;
    const rawFiles = Array.isArray(fileList) ? fileList : Array.from(fileList);
    if (rawFiles.length === 0) return;

    const existingSignatures = new Set(
      itemsRef.current.map((i) => i.fileHash).filter(Boolean)
    );
    const existingFileNames = new Set(
      itemsRef.current.map((i) => getItemName(i).toLowerCase())
    );

    const newItems: BulkUploadItem[] = [];
    let duplicatesSkipped = 0;

    for (let idx = 0; idx < rawFiles.length; idx++) {
      const file = rawFiles[idx];
      const validation = validateImageFile(file);
      if (!validation.usable) {
        newItems.push({
          id: `item-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 7)}`,
          originalFile: file,
          status: 'failed',
          error: validation.error || 'Corrupt or unsupported image',
        });
        continue;
      }

      // Fast deduplication check by file size + name signature
      const signature = `${file.name.toLowerCase()}-${file.size}`;
      const isDuplicate = existingSignatures.has(signature) || (existingFileNames.has(file.name.toLowerCase()) && file.size > 0);

      if (isDuplicate) {
        duplicatesSkipped++;
        if (!autoSkipDuplicates) {
          newItems.push({
            id: `item-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 7)}`,
            originalFile: file,
            fileHash: signature,
            status: 'duplicate',
            error: 'Duplicate file skipped (already present in current upload queue)',
          });
        }
        continue;
      }

      existingSignatures.add(signature);
      existingFileNames.add(file.name.toLowerCase());

      newItems.push({
        id: `item-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 7)}`,
        originalFile: file,
        fileHash: signature,
        status: 'queued',
      });
    }

    if (duplicatesSkipped > 0) {
      setFeedbackNotice({
        type: 'info',
        text: `Identified & skipped ${duplicatesSkipped} duplicate files to prevent double cataloging.`,
      });
    }

    setItems((prev) => [...prev, ...newItems]);
    // Automatically trigger processing for newly added items
    setTimeout(() => {
      startProcessingQueue();
    }, 250);
  };

  // Recursive Drag & Drop handler (supports dropping entire OS folders with subdirectories)
  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    const dtItems = e.dataTransfer.items;

    if (dtItems && dtItems.length > 0 && typeof dtItems[0].webkitGetAsEntry === 'function') {
      const extractedFiles: File[] = [];

      const traverseEntry = async (entry: any) => {
        if (!entry) return;
        if (entry.isFile) {
          const file = await new Promise<File | null>((resolve) => entry.file(resolve, () => resolve(null)));
          if (file && (file.type.startsWith('image/') || /\.(jpg|jpeg|png|webp|avif)$/i.test(file.name))) {
            extractedFiles.push(file);
          }
        } else if (entry.isDirectory) {
          const dirReader = entry.createReader();
          const readAllEntries = async (): Promise<any[]> => {
            const all: any[] = [];
            while (true) {
              const batch: any[] = await new Promise((resolve) => dirReader.readEntries(resolve, () => resolve([])));
              if (!batch || batch.length === 0) break;
              all.push(...batch);
            }
            return all;
          };
          const entries = await readAllEntries();
          for (const child of entries) {
            await traverseEntry(child);
          }
        }
      };

      const promises = [];
      for (let i = 0; i < dtItems.length; i++) {
        const entry = dtItems[i].webkitGetAsEntry();
        if (entry) promises.push(traverseEntry(entry));
      }
      await Promise.all(promises);

      if (extractedFiles.length > 0) {
        handleFilesAdded(extractedFiles);
        return;
      }
    }

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFilesAdded(e.dataTransfer.files);
    }
  };

  // Google Drive Link Import Handler
  const handleGoogleDriveImport = async (inputUrls: string) => {
    setIsDriveImporting(true);
    try {
      const urls = inputUrls
        .split(/[\n,\s]+/)
        .map((u) => u.trim())
        .filter(Boolean);

      if (urls.length === 0) {
        alert('Please paste at least one Google Drive link.');
        return;
      }

      const res = await fetch('/api/import-google-drive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ urls }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed importing from Google Drive');
      }

      if (data.items && data.items.length > 0) {
        const driveFiles: File[] = [];
        for (const item of data.items) {
          const arr = item.dataUrl.split(',');
          const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
          const bstr = atob(arr[1]);
          let n = bstr.length;
          const u8arr = new Uint8Array(n);
          while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
          }
          const file = new File([u8arr], item.name, { type: mime });
          driveFiles.push(file);
        }

        await handleFilesAdded(driveFiles);
        setIsDriveModalOpen(false);
        setDriveInput('');
        setFeedbackNotice({
          type: 'success',
          text: `Successfully imported ${data.items.length} images from Google Drive! Starting automatic vision analysis...`,
        });
      } else {
        alert('No images could be downloaded. Please ensure the Google Drive file or folder sharing is set to "Anyone with the link can view".');
      }
    } catch (err: any) {
      alert(`Google Drive Import Error: ${err.message}`);
    } finally {
      setIsDriveImporting(false);
    }
  };

  // Helper to save product into the database (as draft or published)
  const saveProductToDb = async (
    item: BulkUploadItem,
    isPublished: boolean = false,
    confirmedImageUrl?: string
  ): Promise<Product> => {
    const chosenCatId = item.manualCategoryId || item.detectedCategoryId || categories[0]?.id;
    const chosenCat = categories.find((c) => c.id === chosenCatId) || categories[0];
    const publicImageUrl = confirmedImageUrl || item.publicImageUrl || item.thumbnailUrl || "";
    const rawTitle = (item.title || '').trim();
    const isBadTitle = !rawTitle || rawTitle.length < 4 || /^\d+$/.test(rawTitle) || /^item:?\s*\d+$/i.test(rawTitle);
    const subCat = item.manualSubCategory || item.detectedSubCategory || chosenCat.subCategories?.[0] || 'Luxury Furniture';
    const title = !isBadTitle ? rawTitle : `Royal Handcrafted ${subCat} Suite (${item.wood || 'Solid Sheesham'})`;
    const productCode = `IF-${Math.floor(1000 + Math.random() * 9000)}`;
    const cleanSlug = `${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${productCode.toLowerCase()}`;

    const newProduct: Omit<Product, 'id' | 'createdAt' | 'updatedAt'> = {
      name: title,
      slug: cleanSlug,
      productCode,
      category: chosenCat.name,
      subCategory: item.manualSubCategory || item.detectedSubCategory || chosenCat.subCategories?.[0] || 'Luxury Furniture',
      spaces: [
        chosenCat.name.includes('Bedroom')
          ? 'Master Bedroom'
          : (chosenCat.name.includes('Dining')
            ? 'Dining Room'
            : (chosenCat.name.includes('Office') ? 'Executive Office' : 'Living Room Suites'))
      ],
      shortDescription: item.description || `Handcrafted ${chosenCat.name.toLowerCase()} piece by Ideal Furniture Lahore.`,
      longDescription: item.description || `Mastercrafted from solid timber with multi-generational mortise-and-tenon joinery.`,
      material: item.wood || 'Solid Seasoned Hardwood',
      finish: 'Natural Satin Hand-Rubbed Wax',
      dimensions: 'Standard Showroom Specifications',
      seatingOrSize: 'Standard',
      wood: item.wood || 'Solid Seasoned Hardwood',
      upholstery: item.upholstery || 'Tailored Poshish',
      leadTime: '3 to 4 Weeks',
      madeIn: 'Lahore, Pakistan',
      featuredImage: publicImageUrl,
      images: [publicImageUrl],
      tags: ['Solid Wood', 'Handcrafted', chosenCat.name],
      isFeatured: false,
      isPublished: isPublished, // Draft if false, live if true
      seoTitle: `${title} | Ideal Furniture Lahore`,
      seoDescription: item.description || `Handcrafted ${chosenCat.name} in Pakistan.`,
    };

    return await db.createProduct(newProduct);
  };

  // Process a single item through the AI & Auto-Upload Pipeline
  const processItem = async (itemId: string): Promise<void> => {
    const item = itemsRef.current.find((i) => i.id === itemId);
    if (!item || item.status === 'uploaded' || item.status === 'duplicate') return;

    // Update state to analyzing
    setItems((prev) =>
      prev.map((i) => (i.id === itemId ? { ...i, status: 'analyzing' } : i))
    );

    try {
      // 1. Generate lightweight thumbnail (~768px) and 64-bit visual perceptual hash
      let thumbDataUrl = item.thumbnailUrl;
      let currentVisualHash = item.visualHash;
      if ((!thumbDataUrl || !currentVisualHash) && item.originalFile) {
        const thumb = await createLightweightThumbnail(item.originalFile, 768, 0.85);
        thumbDataUrl = thumb.dataUrl;
        currentVisualHash = thumb.visualHash;
      }

      // 1.5 TRUE VISUAL DUPLICATE DETECTION:
      // Compare visual pixel fingerprint against other processed or active items
      if (currentVisualHash) {
        const visualDuplicate = itemsRef.current.find(
          (other) =>
            other.id !== itemId &&
            other.visualHash &&
            (other.status === 'uploaded' || other.status === 'ready_to_publish' || other.status === 'analyzing') &&
            areImagesVisuallyDuplicate(currentVisualHash, other.visualHash)
        );

        if (visualDuplicate) {
          console.log(`[Visual Duplicate Auto-Skipped] ${getItemName(item)} matches visual pixels of ${getItemName(visualDuplicate)}`);
          setItems((prev) =>
            prev.map((i) =>
              i.id === itemId
                ? {
                    ...i,
                    thumbnailUrl: thumbDataUrl,
                    visualHash: currentVisualHash,
                    status: 'duplicate',
                    reason: `Visual Duplicate: Matched visual pixels of ${visualDuplicate.title || getItemName(visualDuplicate)}`,
                  }
                : i
            )
          );
          return;
        }
      }

      // If preset classification mode is locked by user (e.g. they selected "Living Room Furniture")
      let matchedCategory = categories[0];
      if (classificationMode !== 'ai') {
        matchedCategory = categories.find((c) => c.id === classificationMode) || categories[0];
      }

      // 1.8 STEP 1: PERMANENT IMAGE UPLOADING (Durable Storage)
      let permanentUrl = item.publicImageUrl;
      if (!permanentUrl && item.originalFile) {
        setItems((prev) =>
          prev.map((i) => (i.id === itemId ? { ...i, progressPercent: 40 } : i))
        );
        const uploadResult = await uploadImagePermanently(item.originalFile, {
          maxRetries: 3,
        });
        permanentUrl = uploadResult.permanentUrl;
      }

      if (!permanentUrl) {
        throw new Error("Image could not be permanently stored.");
      }

      setItems((prev) =>
        prev.map((i) => (i.id === itemId ? { ...i, publicImageUrl: permanentUrl, progressPercent: 65 } : i))
      );

      // 2. STEP 2: SEPARATE GEMINI AI VISION (Does not block permanent image storage)
      let aiResult: any = null;
      try {
        const fname = item.originalFile ? getItemName(item) : (item.fileName || "furniture.jpg");
        aiResult = await analyzeFurnitureImage(
          thumbDataUrl || permanentUrl,
          fname,
          categoryCandidates
        );
      } catch (aiErr) {
        console.warn("AI analysis skipped/delayed for item:", aiErr);
      }

      // If user selected a preset category, enforce it; otherwise use AI detected category
      if (classificationMode === "ai" && aiResult && aiResult.categoryId) {
        const detected = categories.find(
          (c) => c.id === aiResult.categoryId || c.name.toLowerCase() === (aiResult.category || "").toLowerCase()
        );
        if (detected) matchedCategory = detected;
      }

      const finalCategoryId = matchedCategory?.id || categories[0]?.id || "cat-living";
      const finalCategoryName = matchedCategory?.name || categories[0]?.name || "Living Room Furniture";
      const confidence = aiResult?.confidence ?? 0.95;
      const isHighConfidence = confidence >= 0.70 && (!aiResult || aiResult.decision !== "REJECT");
      const subCat = item.manualSubCategory || item.detectedSubCategory || aiResult?.style || (aiResult as any)?.subCategory || "Luxury Furniture";

      // Authentic luxury title (NEVER raw filename or digits!)
      const rawTitle = (item.title || aiResult?.title || "").trim();
      const isBadTitle = !rawTitle || rawTitle.length < 4 || /^\d+$/.test(rawTitle) || /^item:?\s*\d+$/i.test(rawTitle);
      const title = !isBadTitle ? rawTitle : `Royal Handcrafted ${subCat} Suite (${aiResult?.wood || "Solid Sheesham"})`;

      // Always auto-save to Database as Draft so nothing is ever lost on refresh
      const shouldDirectPublish = publishMode === "auto_publish" && isHighConfidence;
      const savedProduct = await saveProductToDb(
        {
          ...item,
          thumbnailUrl: thumbDataUrl,
          detectedCategoryId: finalCategoryId,
          detectedCategoryName: finalCategoryName,
          detectedSubCategory: subCat,
          title,
          description: aiResult?.description || `Handcrafted ${finalCategoryName} sculpted from seasoned timber.`,
          wood: aiResult?.wood || item.wood || "Solid Seasoned Hardwood",
          upholstery: aiResult?.upholstery || item.upholstery || "Tailored Velvet Poshish",
        },
        shouldDirectPublish,
        permanentUrl
      );
      const finalStatus: QueueItemStatus = shouldDirectPublish
        ? 'uploaded'
        : (isHighConfidence ? 'ready_to_publish' : 'needs_review');

      // Persist in IndexedDB for refresh survival
      clientStorage.updateUploadItem(itemId, {
        status: finalStatus,
        cloudUrl: permanentUrl,
        progress: 100,
        assignedProductId: savedProduct.id,
        productTitle: savedProduct.name,
        detectedCategoryId: finalCategoryId,
        detectedCategoryName: finalCategoryName,
        detectedSubCategory: item.manualSubCategory || item.detectedSubCategory || aiResult?.style,
        wood: savedProduct.wood,
        upholstery: savedProduct.upholstery,
        description: savedProduct.shortDescription,
      }).catch(() => {});

      setItems((prev) =>
        prev.map((i) =>
          i.id === itemId
            ? {
                ...i,
                thumbnailUrl: thumbDataUrl,
                status: finalStatus,
                detectedCategoryId: finalCategoryId,
                detectedCategoryName: finalCategoryName,
                detectedSubCategory: subCat,
                confidence,
                decision: aiResult?.decision || "AUTO_UPLOAD",
                title: savedProduct.name,
                description: savedProduct.shortDescription,
                wood: savedProduct.wood,
                upholstery: savedProduct.upholstery,
                reason: aiResult?.reason || "Auto-saved to database as Draft",
                createdProductId: savedProduct.id,
                createdProductSlug: savedProduct.slug,
              }
            : i
        )
      );
    } catch (err: any) {
      console.error(`Error processing item ${itemId}:`, err);
      setItems((prev) =>
        prev.map((i) =>
          i.id === itemId
            ? {
                ...i,
                status: 'failed',
                error: err.message || 'Processing or upload failed',
              }
            : i
        )
      );
    }
  };

  // Main Queue Runner Loop with finite item queue and zero call stack recursion
  const startProcessingQueue = async () => {
    if (isProcessingRef.current) return;
    setIsProcessing(true);
    setIsPaused(false);
    isProcessingRef.current = true;
    isPausedRef.current = false;

    // Snapshot of currently queued items to avoid any infinite loop
    const queuedItems = itemsRef.current.filter((i) => i.status === "queued");
    if (queuedItems.length === 0) {
      setIsProcessing(false);
      isProcessingRef.current = false;
      return;
    }

    const executing = new Set<Promise<void>>();

    for (const targetItem of queuedItems) {
      if (!isProcessingRef.current) break;

      while (isPausedRef.current) {
        await new Promise((r) => setTimeout(r, 400));
        if (!isProcessingRef.current) break;
      }

      const currentId = targetItem.id;
      // Mark as analyzing in state and ref immediately
      targetItem.status = "analyzing";
      setItems((prev) =>
        prev.map((i) => (i.id === currentId ? { ...i, status: "analyzing" } : i))
      );

      const workerPromise = (async () => {
        try {
          await processItem(currentId);
        } catch (err) {
          console.error("Worker item error:", err);
        }
      })();

      executing.add(workerPromise);
      workerPromise.finally(() => {
        executing.delete(workerPromise);
      });

      if (executing.size >= concurrency) {
        await Promise.race(executing);
      }

      // 400ms spacing between workers to protect browser thread
      await new Promise((r) => setTimeout(r, 400));
    }

    if (executing.size > 0) {
      await Promise.all(executing);
    }

    setIsProcessing(false);
    isProcessingRef.current = false;
  };

  const handlePause = () => {
    setIsPaused(true);
    isPausedRef.current = true;
  };

  const handleResume = () => {
    setIsPaused(false);
    isPausedRef.current = false;
    if (!isProcessingRef.current) {
      startProcessingQueue();
    }
  };

  const handleRetryFailed = () => {
    setItems((prev) =>
      prev.map((i) => (i.status === 'failed' ? { ...i, status: 'queued', error: undefined } : i))
    );
    if (!isProcessingRef.current) {
      setTimeout(() => startProcessingQueue(), 100);
    }
  };

  // Auto-select all pending / draft items in 1 click
  const handleAutoSelectAllDrafts = () => {
    const draftIds = items
      .filter((i) => i.status === 'ready_to_publish' || i.status === 'needs_review' || i.status === 'queued')
      .map((i) => i.id);
    setSelectedItemIds(new Set(draftIds));
  };

  // Publish all selected draft items in 1 click
  // Multi-Angle Grouping: Group multiple selected images into a single product
  const handleGroupSelectedIntoProduct = async () => {
    if (selectedItemIds.size < 2) {
      alert("Please select at least 2 images to group into a single product (multi-angle).");
      return;
    }
    const selectedItems = items.filter((i) => selectedItemIds.has(i.id) && i.publicImageUrl);
    if (selectedItems.length === 0) {
      alert("Please ensure the selected items have completed uploading before grouping.");
      return;
    }

    const defaultTitle = selectedItems[0].title || "Royal Handcrafted Multi-Angle Suite";
    const productTitle = prompt("Enter luxury product title for grouped angles:", defaultTitle);
    if (!productTitle) return;

    const allImages = selectedItems.map((i) => i.publicImageUrl!).filter(Boolean);
    const primaryCategory = selectedItems[0].detectedCategoryName || "Living Room Furniture";

    try {
      const res = await fetch("/api/products/group-images", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: productTitle,
          categoryName: primaryCategory,
          images: allImages,
          featuredImage: allImages[0],
          wood: selectedItems[0].wood,
          upholstery: selectedItems[0].upholstery,
        }),
      });

      if (!res.ok) throw new Error("Grouping failed");
      const data = await res.json();

      setFeedbackNotice({
        type: "success",
        text: `Successfully grouped ${allImages.length} angle photos into single product: "${data.product.name}"!`,
      });
      setSelectedItemIds(new Set());
    } catch (err: any) {
      alert(`Grouping error: ${err.message}`);
    }
  };

  // Clear batch history from IndexedDB
  const handleStartFreshBatch = async () => {
    if (confirm("Clear current batch queue and start a fresh upload session? (Already published products remain safe in catalog)")) {
      await clientStorage.deleteBatch(currentBatchId);
      setItems([]);
      setCurrentBatchId(`batch-${Date.now()}`);
      setSelectedItemIds(new Set());
      setFeedbackNotice({
        type: "info",
        text: "Started fresh upload batch.",
      });
    }
  };

  const handlePublishSelected = async () => {
    if (selectedItemIds.size === 0) return;
    const candidates = itemsRef.current.filter((i) => selectedItemIds.has(i.id));
    for (const item of candidates) {
      try {
        if (item.createdProductId) {
          await db.updateProduct(item.createdProductId, { isPublished: true });
        } else {
          const saved = await saveProductToDb(item, true);
          item.createdProductId = saved.id;
          item.createdProductSlug = saved.slug;
        }
      } catch (err) {
        console.error('Failed to publish draft:', err);
      }
    }
    setItems((prev) =>
      prev.map((i) => (selectedItemIds.has(i.id) ? { ...i, status: 'uploaded' } : i))
    );
    setSelectedItemIds(new Set());
  };

  // Publish all "Ready to Publish" or "Needs Review" items in one go
  const handlePublishAllReady = async () => {
    const candidates = itemsRef.current.filter(
      (i) => i.status === 'ready_to_publish' || i.status === 'needs_review'
    );
    if (candidates.length === 0) return;

    for (const item of candidates) {
      try {
        if (item.createdProductId) {
          await db.updateProduct(item.createdProductId, { isPublished: true });
        } else {
          const saved = await saveProductToDb(item, true);
          item.createdProductId = saved.id;
          item.createdProductSlug = saved.slug;
        }
        setItems((prev) =>
          prev.map((i) =>
            i.id === item.id
              ? {
                  ...i,
                  status: 'uploaded',
                }
              : i
          )
        );
      } catch (err: any) {
        console.error('Error publishing item:', err);
      }
    }
  };

  // Publish a single item
  const handlePublishSingleItem = async (itemId: string) => {
    const item = itemsRef.current.find((i) => i.id === itemId);
    if (!item) return;

    try {
      if (item.createdProductId) {
        await db.updateProduct(item.createdProductId, { isPublished: true });
      } else {
        const saved = await saveProductToDb(item, true);
        item.createdProductId = saved.id;
        item.createdProductSlug = saved.slug;
      }
      setItems((prev) =>
        prev.map((i) =>
          i.id === itemId
            ? {
                ...i,
                status: 'uploaded',
              }
            : i
        )
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      setFeedbackNotice({ type: 'error', text: `Publish failed: ${msg}` });
      setTimeout(() => setFeedbackNotice(null), 5000);
    }
  };

  // Delete item from queue and database
  const handleDeleteItem = async (item: BulkUploadItem) => {
    if (item.createdProductId) {
      if (confirm(`Delete "${item.title || 'this product'}" from the catalog database?`)) {
        await db.deleteProduct(item.createdProductId);
      } else {
        return;
      }
    }
    setItems((prev) => prev.filter((i) => i.id !== item.id));
  };

  // Multi-select bulk category change
  const handleBulkChangeCategory = () => {
    if (selectedItemIds.size === 0 || !bulkTargetCategoryId) return;
    const cat = categories.find((c) => c.id === bulkTargetCategoryId);
    if (!cat) return;

    setItems((prev) =>
      prev.map((item) => {
        if (selectedItemIds.has(item.id)) {
          return {
            ...item,
            manualCategoryId: cat.id,
            manualCategoryName: cat.name,
            status: item.status === 'needs_review' ? 'ready_to_publish' : item.status,
          };
        }
        return item;
      })
    );
  };

  // Multi-select bulk delete
  const handleBulkDelete = () => {
    if (selectedItemIds.size === 0) return;
    if (confirm(`Remove ${selectedItemIds.size} selected items from upload queue?`)) {
      setItems((prev) => prev.filter((i) => !selectedItemIds.has(i.id)));
      setSelectedItemIds(new Set());
    }
  };

  // Toggle selection
  const toggleSelectItem = (id: string) => {
    setSelectedItemIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAllFiltered = () => {
    if (selectedItemIds.size === filteredItems.length && filteredItems.length > 0) {
      setSelectedItemIds(new Set());
    } else {
      setSelectedItemIds(new Set(filteredItems.map((i) => i.id)));
    }
  };

  // One-click cleanup of any duplicate "Bed Set" test products in catalog database
  const handleCleanDuplicateTestBeds = async () => {
    const prods = await db.getProducts();
    const badProducts = prods.filter(
      (p) =>
        p.name === 'Chiniot Wooden Hand-Carved Sheesham Bed Set' ||
        p.name === 'Chiniot Wooden Hand-Carved Royal Bed Set'
    );

    if (badProducts.length === 0) {
      setFeedbackNotice({ type: 'info', text: 'No duplicate test bed sets found in catalog database.' });
      setTimeout(() => setFeedbackNotice(null), 4000);
      return;
    }

    for (const prod of badProducts) {
      await db.deleteProduct(prod.id);
    }
    setFeedbackNotice({ type: 'success', text: `Cleaned up ${badProducts.length} duplicate test products!` });
    setTimeout(() => setFeedbackNotice(null), 4000);
  };

  const getCategoryBadgeClass = (categoryName?: string) => {
    const c = (categoryName || '').toLowerCase();
    if (c.includes('living') || c.includes('sofa')) return 'bg-blue-50 text-blue-800 border-blue-200';
    if (c.includes('dining')) return 'bg-emerald-50 text-emerald-800 border-emerald-200';
    if (c.includes('bedroom') || c.includes('bed')) return 'bg-amber-50 text-amber-900 border-amber-200';
    if (c.includes('office')) return 'bg-purple-50 text-purple-900 border-purple-200';
    return 'bg-neutral-100 text-neutral-800 border-neutral-200';
  };

  return (
    <AdminLayout
      title="Add Products (Auto-Upload & Google Drive Importer)"
      subtitle="Upload photos, select your PC folder, or paste a Google Drive link. Visual duplicate images are automatically detected and skipped, while genuine furniture is auto-titled and published directly to your live catalog."
      action={
        <div className="flex flex-wrap items-center gap-2.5">
          <input
            type="file"
            ref={fileInputRef}
            multiple
            accept="image/*"
            onChange={(e) => { if (e.target.files) { handleFilesAdded(e.target.files); e.target.value = ''; } }}
            className="hidden"
          />
          <input
            type="file"
            ref={folderInputRef}
            // @ts-ignore
            webkitdirectory="true"
            // @ts-ignore
            directory="true"
            multiple
            onChange={(e) => handleFilesAdded(e.target.files)}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="btn-primary text-xs py-2 px-4 flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <UploadCloud size={15} />
            <span>Select Photos</span>
          </button>
          <button
            onClick={() => folderInputRef.current?.click()}
            className="btn-secondary text-xs py-2 px-3.5 flex items-center gap-1.5 cursor-pointer"
            title="Upload entire folder of images"
          >
            <FolderUp size={15} />
            <span>Select Folder</span>
          </button>
          <button
            onClick={handleCleanDuplicateTestBeds}
            className="text-xs py-2 px-3 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-lg font-sans font-semibold flex items-center gap-1 cursor-pointer"
            title="Remove any duplicate test products created during earlier trials"
          >
            <RefreshCw size={13} />
            <span>Clean Test Beds</span>
          </button>
        </div>
      }
    >
      {feedbackNotice && (
        <div
          className={`mb-6 p-3.5 rounded-lg text-xs font-sans font-medium border ${
            feedbackNotice.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : feedbackNotice.type === 'error'
              ? 'bg-red-50 border-red-200 text-red-800'
              : 'bg-blue-50 border-blue-200 text-blue-800'
          }`}
        >
          {feedbackNotice.text}
        </div>
      )}

      {/* 1. TOP CONTROL & METRICS DASHBOARD */}
      <div className="bg-white border border-neutral-200 rounded-xl p-5 mb-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-5 border-b border-neutral-100">
          <div>
            <div className="flex items-center gap-2 text-[11px] font-sans font-bold uppercase tracking-wider text-[#B89360] mb-1">
              <Sparkles size={14} />
              <span>Gemini 3.8 Flash Vision Engine</span>
            </div>
            <h2 className="font-sans font-bold text-lg text-neutral-900">
              Bulk Catalog Processing & Verification
            </h2>
            <p className="text-xs text-neutral-500 font-sans mt-0.5 max-w-2xl">
              Each photo is analyzed individually. Visual AI determines the dominant furniture subject, assigns the exact category, detects wood/upholstery, and creates a distinctive title.
            </p>
          </div>

          {/* Action Execution Controls */}
          <div className="flex flex-wrap items-center gap-3">
            {!isProcessing ? (
              <button
                onClick={startProcessingQueue}
                disabled={stats.queued === 0}
                className="px-5 py-2.5 bg-neutral-900 hover:bg-neutral-800 disabled:bg-neutral-300 text-white rounded-lg text-xs font-sans font-bold uppercase tracking-wider flex items-center gap-2 transition-colors cursor-pointer shadow-xs"
              >
                <Play size={14} />
                <span>Start AI Analysis ({stats.queued})</span>
              </button>
            ) : isPaused ? (
              <button
                onClick={handleResume}
                className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-sans font-bold uppercase tracking-wider flex items-center gap-2 transition-colors cursor-pointer"
              >
                <Play size={14} />
                <span>Resume Processing</span>
              </button>
            ) : (
              <button
                onClick={handlePause}
                className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-sans font-bold uppercase tracking-wider flex items-center gap-2 transition-colors cursor-pointer"
              >
                <Pause size={14} />
                <span>Pause Queue</span>
              </button>
            )}

            {stats.ready > 0 && (
              <button
                onClick={handlePublishAllReady}
                className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-sans font-bold uppercase tracking-wider flex items-center gap-2 transition-colors cursor-pointer shadow-xs"
              >
                <CheckCircle size={14} />
                <span>Publish Verified ({stats.ready})</span>
              </button>
            )}

            {stats.failed > 0 && (
              <button
                onClick={handleRetryFailed}
                className="px-3 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-lg text-xs font-sans font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <RotateCcw size={13} />
                <span>Retry Failed ({stats.failed})</span>
              </button>
            )}
          </div>
        </div>

        {/* Configuration Filters (Mode, Workflow, Concurrency) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 pb-4 border-b border-neutral-100 text-xs font-sans">
          <div>
            <label className="block text-[11px] font-bold text-neutral-700 uppercase tracking-wider mb-1">
              Categorization Mode:
            </label>
            <select
              value={classificationMode}
              onChange={(e) => setClassificationMode(e.target.value)}
              className="w-full bg-neutral-50 border border-neutral-200 rounded-lg p-2 text-neutral-900 font-semibold focus:outline-hidden focus:border-[#B89360]"
            >
              <option value="ai">🤖 AI Visual Auto-Detection (Per-Image Vision)</option>
              <optgroup label="Preset / Force Category for this batch:">
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    Preset: {c.name}
                  </option>
                ))}
              </optgroup>
            </select>
            <span className="text-[10px] text-neutral-400 block mt-1">
              {classificationMode === 'ai'
                ? 'AI inspects shape, upholstery & pillows for each photo'
                : 'Locks this folder to the chosen category'}
            </span>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-neutral-700 uppercase tracking-wider mb-1">
              Publishing Workflow:
            </label>
            <select
              value={publishMode}
              onChange={(e) => setPublishMode(e.target.value as any)}
              className="w-full bg-neutral-50 border border-neutral-200 rounded-lg p-2 text-neutral-900 font-semibold focus:outline-hidden focus:border-[#B89360]"
            >
              <option value="review_first">
                🛡️ Safe Mode: Analyze & Preview First (Recommended)
              </option>
              <option value="auto_publish">
                ⚡ Direct Mode: Auto-Publish Verified Items Instantly
              </option>
            </select>
            <span className="text-[10px] text-neutral-400 block mt-1">
              Safe Mode lets you inspect classified categories in table before publishing.
            </span>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-neutral-700 uppercase tracking-wider mb-1">
              AI Concurrency Limit:
            </label>
            <select
              value={concurrency}
              onChange={(e) => setConcurrency(Number(e.target.value))}
              className="w-full bg-neutral-50 border border-neutral-200 rounded-lg p-2 text-neutral-900 font-semibold focus:outline-hidden focus:border-[#B89360]"
            >
              <option value="1">1 Parallel Request (Slowest, safest)</option>
              <option value="2">2 Parallel Requests</option>
              <option value="3">3 Parallel Requests (Balanced)</option>
              <option value="4">4 Parallel Requests (Fast)</option>
            </select>
            <span className="text-[10px] text-neutral-400 block mt-1">
              Prevents browser throttling during massive 10,000 photo uploads.
            </span>
          </div>
        </div>

        {/* Live Counters Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3 pt-4">
          <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-3">
            <span className="text-[10px] uppercase font-sans tracking-wider text-neutral-500 font-semibold block">Total In Queue</span>
            <span className="text-xl font-sans font-black text-neutral-900">{stats.total}</span>
          </div>
          <div className="bg-blue-50/60 border border-blue-200/80 rounded-lg p-3">
            <span className="text-[10px] uppercase font-sans tracking-wider text-blue-700 font-semibold block">Analyzing</span>
            <span className="text-xl font-sans font-black text-blue-900">{stats.analyzing}</span>
          </div>
          <div className="bg-emerald-50/70 border border-emerald-200 rounded-lg p-3">
            <span className="text-[10px] uppercase font-sans tracking-wider text-emerald-700 font-semibold block">Ready to Publish</span>
            <span className="text-xl font-sans font-black text-emerald-900">{stats.ready}</span>
          </div>
          <div className="bg-emerald-100/70 border border-emerald-300 rounded-lg p-3">
            <span className="text-[10px] uppercase font-sans tracking-wider text-emerald-800 font-semibold block">Published & Live</span>
            <span className="text-xl font-sans font-black text-emerald-950">{stats.uploaded}</span>
          </div>
          <div className="bg-amber-50/70 border border-amber-200 rounded-lg p-3">
            <span className="text-[10px] uppercase font-sans tracking-wider text-amber-800 font-semibold block">Needs Review</span>
            <span className="text-xl font-sans font-black text-amber-900">{stats.needsReview}</span>
          </div>
          <div className="bg-red-50/60 border border-red-200 rounded-lg p-3">
            <span className="text-[10px] uppercase font-sans tracking-wider text-red-700 font-semibold block">Failed</span>
            <span className="text-xl font-sans font-black text-red-900">{stats.failed}</span>
          </div>
          <div className="bg-purple-50/70 border border-purple-200 rounded-lg p-3 flex flex-col justify-between">
            <div>
              <span className="text-[10px] uppercase font-sans tracking-wider text-purple-800 font-semibold block">Duplicates Skipped</span>
              <span className="text-xl font-sans font-black text-purple-950">{stats.duplicates}</span>
            </div>
            {stats.duplicates > 0 && (
              <button
                type="button"
                onClick={handleClearDuplicates}
                className="text-[10px] font-bold text-purple-700 hover:text-purple-900 underline mt-1 text-left cursor-pointer"
              >
                Clear Duplicates
              </button>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        {stats.total > 0 && (
          <div className="mt-4 pt-3 border-t border-neutral-100">
            <div className="flex items-center justify-between text-xs font-sans text-neutral-600 mb-1.5">
              <span>Overall Progress: <strong>{stats.progress}%</strong></span>
              <span>{stats.uploaded + stats.ready + stats.needsReview + stats.failed + stats.duplicates} of {stats.total} processed ({stats.queued} waiting)</span>
            </div>
            <div className="w-full h-2.5 bg-neutral-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-600 transition-all duration-300 rounded-full"
                style={{ width: `${stats.progress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* 2. RECURSIVE DRAG & DROP & ACTION LAUNCHER */}
      <div className="mb-6 bg-white border border-neutral-200 rounded-xl p-5 shadow-xs">
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          className="border-2 border-dashed border-neutral-300 hover:border-[#B89360] rounded-xl p-8 text-center transition-colors bg-[#FAF8F5]/60"
        >
          <div className="w-12 h-12 mx-auto rounded-full bg-white shadow-xs flex items-center justify-center text-[#B89360] mb-3">
            <UploadCloud size={24} />
          </div>
          <h3 className="font-sans font-bold text-base text-neutral-900 mb-1">
            Drag & Drop Furniture Photos or Entire Folders Here
          </h3>
          <p className="text-xs text-neutral-500 max-w-xl mx-auto mb-6">
            Auto-scans subfolders, removes duplicates instantly, analyzes with AI Vision, and crafts authentic luxury product titles.
          </p>

          {/* Three Primary Upload Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => folderInputRef.current?.click()}
              className="px-5 py-2.5 bg-[#1B3629] hover:bg-[#152B21] text-white rounded-lg text-xs font-sans font-bold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer shadow-xs hover:scale-[1.02] active:scale-98"
              title="Click to select entire folder from your computer"
            >
              <FolderUp size={16} className="text-[#C4A962]" />
              <span>📂 Select Whole PC Folder</span>
            </button>

            <button
              type="button"
              onClick={() => setIsDriveModalOpen(true)}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-sans font-bold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer shadow-xs hover:scale-[1.02] active:scale-98"
              title="Import shared Google Drive folder or image links"
            >
              <Cloud size={16} />
              <span>☁️ Import Google Drive</span>
            </button>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-5 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-lg text-xs font-sans font-bold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer shadow-xs hover:scale-[1.02] active:scale-98"
            >
              <UploadCloud size={16} />
              <span>🖼️ Browse Image Files</span>
            </button>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 mt-5 pt-4 border-t border-neutral-200/60 text-[11px] text-neutral-500 font-medium">
            <span className="flex items-center gap-1.5 text-emerald-700 font-semibold">
              <CheckCircle size={13} /> Instant Duplicate Removal
            </span>
            <span className="flex items-center gap-1.5 text-blue-700 font-semibold">
              <Sparkles size={13} /> Auto-Title & Category Vision
            </span>
            <span className="flex items-center gap-1.5 text-[#8C5921] font-semibold">
              <FolderUp size={13} /> Subfolder Recursive Scan
            </span>
          </div>
        </div>
      </div>

      {/* 3. MULTI-SELECT BULK ACTIONS TOOLBAR */}
      {selectedItemIds.size > 0 && (
        <div className="bg-neutral-900 text-white rounded-xl p-3.5 mb-4 flex flex-wrap items-center justify-between gap-4 text-xs font-sans shadow-md animate-fade-in">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[#B89360]">{selectedItemIds.size} items selected</span>
            <span className="text-neutral-400">| Perform batch action:</span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handlePublishSelected}
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-bold cursor-pointer transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <CheckCircle size={14} />
              <span>Publish Selected ({selectedItemIds.size})</span>
            </button>

            <button
              onClick={handleGroupSelectedIntoProduct}
              className="px-3.5 py-1.5 bg-[#8C5921] hover:bg-[#724517] text-white rounded font-bold cursor-pointer transition-colors flex items-center gap-1.5 shadow-xs"
              title="Combine selected photos into 1 product with multiple viewing angles"
            >
              <Layers size={14} />
              <span>Group into 1 Product ({selectedItemIds.size} Angles)</span>
            </button>

            <div className="flex items-center gap-1.5">
              <span>Change Category:</span>
              <select
                value={bulkTargetCategoryId}
                onChange={(e) => setBulkTargetCategoryId(e.target.value)}
                className="bg-neutral-800 border border-neutral-700 rounded px-2 py-1 text-white text-xs font-semibold"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              <button
                onClick={handleBulkChangeCategory}
                className="px-2.5 py-1 bg-[#B89360] hover:bg-[#8F6D3C] text-white rounded font-bold cursor-pointer transition-colors"
              >
                Apply
              </button>
            </div>

            <button
              onClick={handleBulkDelete}
              className="px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white rounded font-bold cursor-pointer transition-colors flex items-center gap-1"
            >
              <Trash2 size={12} />
              <span>Delete Selected</span>
            </button>
          </div>
        </div>
      )}

      {/* 4. TAB NAVIGATION & FILTER BAR */}
      {items.length > 0 && (
        <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden shadow-xs mb-6">
          <div className="p-4 border-b border-neutral-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            {/* Tabs */}
            <div className="flex items-center space-x-1 overflow-x-auto text-xs font-sans">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-3 py-1.5 rounded-md font-semibold transition-colors cursor-pointer ${
                  activeTab === 'all' ? 'bg-neutral-900 text-white' : 'text-neutral-600 hover:bg-neutral-100'
                }`}
              >
                All Items ({stats.total})
              </button>
              <button
                onClick={() => setActiveTab('ready')}
                className={`px-3 py-1.5 rounded-md font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'ready'
                    ? 'bg-emerald-700 text-white'
                    : 'text-emerald-800 bg-emerald-50 hover:bg-emerald-100'
                }`}
              >
                <CheckCircle size={13} />
                <span>Ready to Publish ({stats.ready})</span>
              </button>
              <button
                onClick={() => setActiveTab('needs_review')}
                className={`px-3 py-1.5 rounded-md font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'needs_review'
                    ? 'bg-amber-600 text-white'
                    : 'text-amber-800 bg-amber-50 hover:bg-amber-100'
                }`}
              >
                <AlertTriangle size={13} />
                <span>Needs Review ({stats.needsReview})</span>
              </button>
              <button
                onClick={() => setActiveTab('uploaded')}
                className={`px-3 py-1.5 rounded-md font-semibold transition-colors cursor-pointer ${
                  activeTab === 'uploaded' ? 'bg-neutral-800 text-white' : 'text-neutral-600 hover:bg-neutral-100'
                }`}
              >
                Live on Site ({stats.uploaded})
              </button>
              <button
                onClick={() => setActiveTab('failed')}
                className={`px-3 py-1.5 rounded-md font-semibold transition-colors cursor-pointer ${
                  activeTab === 'failed' ? 'bg-red-700 text-white' : 'text-neutral-600 hover:bg-neutral-100'
                }`}
              >
                Failed ({stats.failed})
              </button>
            </div>

            {/* Search Input & Auto-Select button */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleAutoSelectAllDrafts}
                className="px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-lg text-xs font-sans font-semibold flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
                title="Select all pending and draft items in one click"
              >
                <CheckSquare size={13} className="text-[#B89360]" />
                <span>Auto-Select All Drafts</span>
              </button>
              <input
                type="text"
                placeholder="Filter by filename, title, or category..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="text-xs font-sans px-3 py-1.5 border border-neutral-200 rounded-lg w-56 focus:outline-hidden focus:border-[#B89360]"
              />
            </div>
          </div>

          {/* 5. TABLE OF QUEUE ITEMS */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-sans divide-y divide-neutral-200">
              <thead className="bg-neutral-50 uppercase tracking-wider text-[11px] text-neutral-500">
                <tr>
                  <th className="py-3 px-3 w-8">
                    <button
                      onClick={toggleSelectAllFiltered}
                      className="cursor-pointer text-neutral-400 hover:text-neutral-800"
                    >
                      {selectedItemIds.size === filteredItems.length && filteredItems.length > 0 ? (
                        <CheckSquare size={16} className="text-[#B89360]" />
                      ) : (
                        <Square size={16} />
                      )}
                    </button>
                  </th>
                  <th className="py-3 px-3 w-16">Thumbnail</th>
                  <th className="py-3 px-4">Filename</th>
                  <th className="py-3 px-4">Detected Category (Editable)</th>
                  <th className="py-3 px-4">Visual Title & Specifications</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {filteredItems.slice(0, 200).map((item) => {
                  const isSelected = selectedItemIds.has(item.id);
                  const currentCategoryName = item.manualCategoryName || item.detectedCategoryName;

                  return (
                    <tr
                      key={item.id}
                      className={`hover:bg-neutral-50/70 transition-colors ${
                        isSelected ? 'bg-amber-50/40' : ''
                      }`}
                    >
                      {/* Select Checkbox */}
                      <td className="py-2.5 px-3">
                        <button
                          onClick={() => toggleSelectItem(item.id)}
                          className="cursor-pointer text-neutral-400 hover:text-neutral-800"
                        >
                          {isSelected ? (
                            <CheckSquare size={16} className="text-[#B89360]" />
                          ) : (
                            <Square size={16} />
                          )}
                        </button>
                      </td>

                      {/* Thumbnail */}
                      <td className="py-2.5 px-3">
                        <div className="w-12 h-12 rounded bg-neutral-100 border border-neutral-200 overflow-hidden flex items-center justify-center shrink-0">
                          {item.thumbnailUrl ? (
                            <img
                              src={item.thumbnailUrl}
                              alt=""
                              className="w-full h-full object-cover"
                              loading="lazy"
                            />
                          ) : (
                            <span className="text-[10px] text-neutral-400">...</span>
                          )}
                        </div>
                      </td>

                      {/* Filename */}
                      <td className="py-2.5 px-4 font-mono text-[11px] text-neutral-700 max-w-xs truncate" title={getItemName(item)}>
                        {getItemName(item)}
                        <span className="block text-[10px] text-neutral-400 font-sans">
                          {item.originalFile ? formatBytes(item.originalFile.size) : 'HD Image'}
                        </span>
                      </td>

                      {/* Category Selection Badge */}
                      <td className="py-2.5 px-4">
                        <div className="flex items-center gap-1.5">
                          <select
                            value={item.manualCategoryId || item.detectedCategoryId || ''}
                            onChange={(e) => {
                              const val = e.target.value;
                              const selected = categories.find((c) => c.id === val);
                              setItems((prev) =>
                                prev.map((i) =>
                                  i.id === item.id
                                    ? {
                                        ...i,
                                        manualCategoryId: val,
                                        manualCategoryName: selected?.name,
                                        status: i.status === 'needs_review' ? 'ready_to_publish' : i.status,
                                      }
                                    : i
                                )
                              );
                            }}
                            className={`text-xs font-sans font-bold border rounded-lg px-2.5 py-1 focus:outline-hidden ${getCategoryBadgeClass(
                              currentCategoryName
                            )}`}
                          >
                            {categories.map((c) => (
                              <option key={c.id} value={c.id}>
                                {c.name}
                              </option>
                            ))}
                          </select>
                        </div>
                        {item.detectedSubCategory && (
                          <span className="text-[10px] text-neutral-400 block mt-0.5">
                            Sub-type: {item.detectedSubCategory}
                          </span>
                        )}
                      </td>

                      {/* Title & Specifications */}
                      <td className="py-2.5 px-4 max-w-md">
                        {(() => {
                          const raw = (item.title || '').trim();
                          const isBad = !raw || /^\d+$/.test(raw) || /^item:?\s*\d+$/i.test(raw);
                          const safeDisplay = !isBad
                            ? raw
                            : `Royal Handcrafted ${item.detectedSubCategory || currentCategoryName} Suite`;
                          return (
                            <div className="font-semibold text-neutral-900 truncate" title={safeDisplay}>
                              {item.title ? safeDisplay : 'Awaiting Gemini analysis...'}
                            </div>
                          );
                        })()}
                        <div className="flex flex-wrap items-center gap-2 mt-1 text-[10px]">
                          {typeof item.confidence === 'number' && (
                            <span
                              className={`font-mono px-1.5 py-0.5 rounded font-bold ${
                                item.confidence >= 0.70
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {Math.round(item.confidence * 100)}% Confidence
                            </span>
                          )}
                          {item.wood && (
                            <span className="text-neutral-500">
                              Timber: <strong>{item.wood}</strong>
                            </span>
                          )}
                          {item.upholstery && item.upholstery !== 'N/A' && (
                            <span className="text-neutral-500">
                              Poshish: <strong>{item.upholstery}</strong>
                            </span>
                          )}
                        </div>
                        {item.reason && (
                          <p className="text-[10px] text-neutral-400 truncate mt-0.5" title={item.reason}>
                            AI notes: {item.reason}
                          </p>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-2.5 px-4 whitespace-nowrap">
                        {item.status === 'queued' && (
                          <span className="px-2 py-0.5 bg-neutral-100 text-neutral-600 rounded text-[11px] font-medium">
                            In Queue
                          </span>
                        )}
                        {item.status === 'analyzing' && (
                          <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded text-[11px] font-medium animate-pulse">
                            Analyzing...
                          </span>
                        )}
                        {item.status === 'ready_to_publish' && (
                          <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded text-[11px] font-bold inline-flex items-center gap-1">
                            <CheckCircle size={12} />
                            <span>Ready</span>
                          </span>
                        )}
                        {item.status === 'uploaded' && (
                          <span className="px-2 py-0.5 bg-emerald-700 text-white rounded text-[11px] font-bold inline-flex items-center gap-1">
                            <Check size={12} />
                            <span>Live</span>
                          </span>
                        )}
                        {item.status === 'needs_review' && (
                          <span className="px-2 py-0.5 bg-amber-100 text-amber-900 rounded text-[11px] font-bold inline-flex items-center gap-1">
                            <AlertTriangle size={12} />
                            <span>Review Category</span>
                          </span>
                        )}
                        {item.status === 'duplicate' && (
                          <span className="px-2 py-0.5 bg-neutral-200 text-neutral-700 rounded text-[11px] font-medium">
                            Duplicate Skipped
                          </span>
                        )}
                        {item.status === 'failed' && (
                          <span className="px-2 py-0.5 bg-red-100 text-red-800 rounded text-[11px] font-medium" title={item.error}>
                            Failed
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-2.5 px-4 text-right whitespace-nowrap">
                        {item.status === 'needs_review' && (
                          <button
                            onClick={() => processItem(item.id)}
                            className="px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 rounded text-[11px] font-semibold transition-colors cursor-pointer inline-flex items-center gap-1 mr-2"
                            title="Re-run AI Vision analysis on this image"
                          >
                            <RefreshCw size={11} />
                            <span>Re-Analyze</span>
                          </button>
                        )}
                        {(item.status === 'ready_to_publish' || item.status === 'needs_review') && (
                          <button
                            onClick={() => handlePublishSingleItem(item.id)}
                            className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded text-[11px] font-bold uppercase transition-colors cursor-pointer inline-flex items-center gap-1 mr-2"
                          >
                            <Check size={12} />
                            <span>Publish</span>
                          </button>
                        )}
                        {item.status === 'uploaded' && item.createdProductSlug && (
                          <Link
                            to={`/product/${item.createdProductSlug}`}
                            target="_blank"
                            className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded text-[11px] font-bold inline-flex items-center gap-1 mr-2"
                            title="View product live on website"
                          >
                            <span>Live on Site</span>
                            <ExternalLink size={11} />
                          </Link>
                        )}
                        {item.status === 'failed' && (
                          <button
                            onClick={() => processItem(item.id)}
                            className="text-blue-600 hover:text-blue-800 text-[11px] font-semibold cursor-pointer mr-2"
                          >
                            Retry
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteItem(item)}
                          className="text-neutral-400 hover:text-red-600 transition-colors ml-1 cursor-pointer"
                          title="Delete from database and queue"
                        >
                          <Trash2 size={13} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {filteredItems.length > 200 && (
              <div className="p-3 text-center text-xs text-neutral-500 bg-neutral-50 border-t border-neutral-200 font-sans">
                Showing top 200 items for smooth scrolling. All {filteredItems.length} items continue processing smoothly.
              </div>
            )}
          </div>
        </div>
      )}

      {/* GOOGLE DRIVE IMPORT MODAL */}
      {isDriveModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl animate-fade-in border border-neutral-200">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100 mb-4">
              <div className="flex items-center gap-2 text-neutral-900 font-bold text-base">
                <Cloud className="text-blue-600" size={20} />
                <span>Import Images from Google Drive</span>
              </div>
              <button
                type="button"
                onClick={() => setIsDriveModalOpen(false)}
                className="text-neutral-400 hover:text-neutral-700 text-lg leading-none p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-neutral-600 mb-2">
              Paste your <strong>Google Drive Folder link</strong> or image sharing links below (one per line):
            </p>

            <textarea
              value={driveInput}
              onChange={(e) => setDriveInput(e.target.value)}
              placeholder="e.g. https://drive.google.com/drive/folders/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs?usp=sharing&#10;or individual links..."
              rows={4}
              className="w-full text-xs font-mono p-3 border border-neutral-300 rounded-xl focus:border-blue-600 focus:outline-hidden bg-neutral-50/50 mb-3"
            />

            <div className="bg-amber-50 border border-amber-200/80 rounded-lg p-2.5 text-[11px] text-amber-800 mb-5">
              💡 <strong>Tip:</strong> Ensure Google Drive link sharing is set to <strong>"Anyone with the link can view"</strong> so images can be downloaded.
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsDriveModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-neutral-600 hover:text-neutral-800 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleGoogleDriveImport(driveInput)}
                disabled={isDriveImporting || !driveInput.trim()}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-neutral-300 text-white rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-xs"
              >
                {isDriveImporting ? (
                  <>
                    <RefreshCw size={14} className="animate-spin" />
                    <span>Importing from Drive...</span>
                  </>
                ) : (
                  <>
                    <Cloud size={14} />
                    <span>Download & Queue</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};
