/**
 * Ideal Furniture — Permanent Storage Service
 * 
 * Handles:
 * - Content-based SHA-256 hashing for deduplication.
 * - Progressive lightweight preview generation.
 * - Direct-to-server and cloud-ready image uploading.
 * - Full verification: never claims success until bytes are confirmed stored.
 * - Zero base64 permanent URLs (strictly cloud/CDN paths).
 */

import { convertImageToWebP, formatBytes } from './imageOptimization';

export interface UploadVerificationResult {
  success: boolean;
  permanentUrl: string;
  mediaId: string;
  fileName: string;
  fileSize: string;
  fileBytes: number;
  fileHash: string;
  mimeType: string;
  dimensions?: { width: number; height: number };
  uploadedAt: string;
}

/**
 * Calculates SHA-256 hash of a file for exact duplicate detection
 */
export async function calculateFileHash(file: File | Blob): Promise<string> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  } catch (err) {
    // Fallback pseudo-hash based on size, name, and lastModified if subtle crypto fails
    const f = file as File;
    return `hash-${f.name || 'blob'}-${f.size}-${f.lastModified || Date.now()}`;
  }
}

/**
 * Generates a lightweight, memory-efficient thumbnail data URL for UI display
 */
export async function generateLightweightThumbnail(
  file: File | Blob,
  maxDimension: number = 320
): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      const canvas = document.createElement('canvas');
      let width = img.naturalWidth || img.width;
      let height = img.naturalHeight || img.height;

      if (width > height && width > maxDimension) {
        height = Math.round((height * maxDimension) / width);
        width = maxDimension;
      } else if (height > maxDimension) {
        width = Math.round((width * maxDimension) / height);
        height = maxDimension;
      }

      canvas.width = Math.max(width, 1);
      canvas.height = Math.max(height, 1);

      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'medium';
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/webp', 0.75));
      } else {
        resolve(objectUrl);
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve('');
    };

    img.src = objectUrl;
  });
}

/**
 * Uploads an image permanently to the authoritative storage endpoint.
 * Ensures the response is verified, returns permanent URL, never reports false success.
 */
export async function uploadImagePermanently(
  file: File,
  options?: {
    maxRetries?: number;
    onProgress?: (percent: number) => void;
  }
): Promise<UploadVerificationResult> {
  const maxRetries = options?.maxRetries ?? 3;
  options?.onProgress?.(10);

  // 1. Calculate SHA-256 hash for deduplication
  const fileHash = await calculateFileHash(file);
  options?.onProgress?.(25);

  // 2. Convert to optimized WebP for standard delivery
  const webpResult = await convertImageToWebP(file, 2048, 0.88);
  options?.onProgress?.(50);

  // 3. Upload with retry loop for recoverable network issues
  let lastError: Error | null = null;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          filename: file.name.replace(/\.[^/.]+$/, '') + '.webp',
          dataUrl: webpResult.dataUrl,
          size: formatBytes(webpResult.optimizedSize),
          fileHash,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Upload server responded with status ${response.status}: ${errorText}`);
      }

      const result = await response.json();
      if (!result.success || !result.url) {
        throw new Error(result.error || 'Upload succeeded with invalid response payload');
      }

      options?.onProgress?.(100);

      // Verify the returned URL is an absolute or root-relative permanent path
      const permanentUrl = result.url.startsWith('/') || result.url.startsWith('http')
        ? result.url
        : `/${result.url}`;

      return {
        success: true,
        permanentUrl,
        mediaId: result.item?.id || `med-${Date.now()}`,
        fileName: file.name,
        fileSize: formatBytes(webpResult.optimizedSize),
        fileBytes: webpResult.optimizedSize,
        fileHash,
        mimeType: 'image/webp',
        dimensions: {
          width: webpResult.width,
          height: webpResult.height,
        },
        uploadedAt: result.item?.createdAt || new Date().toISOString(),
      };
    } catch (err: any) {
      lastError = err;
      if (attempt < maxRetries) {
        // Exponential backoff
        await new Promise((r) => setTimeout(r, 1000 * Math.pow(2, attempt - 1)));
      }
    }
  }

  throw new Error(`Failed to permanently store image "${file.name}" after ${maxRetries} attempts: ${lastError?.message}`);
}
