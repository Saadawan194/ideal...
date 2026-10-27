import { Category } from '../types';
import { computePerceptualHash } from './perceptualHash';

export interface CategoryCandidate {
  id: string;
  name: string;
  subCategories: string[];
}

export interface ImageAnalysisRequest {
  imageBase64: string;
  mimeType?: string;
  originalFilename: string;
  categories: CategoryCandidate[];
}

export interface ImageAnalysisDecision {
  categoryId: string;
  categoryName: string;
  subCategory?: string;
  confidence: number; // 0.00 to 1.00
  title: string;
  description: string;
  wood?: string;
  upholstery?: string;
  decision: 'AUTO_UPLOAD' | 'NEEDS_REVIEW' | 'REJECT';
  reason?: string;
}

export async function computeFileHash(file: File): Promise<string> {
  // Compute SHA-256 hash using Web Crypto API
  try {
    const buffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  } catch (e) {
    // Fallback pseudo-hash based on size and name if crypto is restricted
    return `hash_${file.size}_${file.name.replace(/[^a-zA-Z0-9]/g, '_')}`;
  }
}

/**
 * Creates an ultra-lightweight thumbnail dataURL (~768px) strictly for AI vision analysis
 * and UI display, preserving browser RAM when handling thousands of queued images.
 * Also generates a 64-bit visual perceptual hash for visual duplicate detection.
 */
export async function createLightweightThumbnail(
  file: File,
  maxDimension = 768,
  quality = 0.85
): Promise<{ dataUrl: string; width: number; height: number; visualHash: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed reading file for thumbnail'));
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error('Failed decoding image for thumbnail'));
      img.onload = async () => {
        let { width, height } = img;
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return reject(new Error('Canvas 2D unavailable'));

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        const visualHash = await computePerceptualHash(canvas);

        resolve({ dataUrl, width, height, visualHash });
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
}

/**
 * Validates whether an image file is clearly unusable (corrupt, empty, zero-sized)
 */
export function validateImageFile(file: File): { usable: boolean; error?: string } {
  if (!file || file.size === 0) {
    return { usable: false, error: 'Empty file (0 bytes)' };
  }
  const validExtensions = /\.(jpe?g|png|webp|avif|heic|tiff?|bmp)$/i;
  const isImageMime = file.type.startsWith('image/') || validExtensions.test(file.name);
  if (!isImageMime) {
    return { usable: false, error: 'Not an image file format' };
  }
  return { usable: true };
}
