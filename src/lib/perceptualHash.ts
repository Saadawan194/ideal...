/**
 * Perceptual Image Hashing (dHash) for Visual Duplicate Detection
 * Detects whether two images depict the exact same visual content regardless of:
 * - Different filenames (e.g. 10033.jpg vs pinterest_sofa_42.jpg)
 * - Different resolutions (e.g. 600x600 vs 1920x1080)
 * - Different formats (JPEG vs PNG vs WebP)
 * - Different compression levels
 */

/**
 * Computes a 64-bit visual difference hash from an Image, HTMLCanvasElement, or data URL
 */
export async function computePerceptualHash(
  imageSource: string | File | HTMLCanvasElement
): Promise<string> {
  return new Promise((resolve) => {
    if (imageSource instanceof HTMLCanvasElement) {
      return resolve(getHashFromCanvas(imageSource));
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';

    const cleanup = () => {
      if (typeof imageSource !== 'string' && !(imageSource instanceof HTMLCanvasElement)) {
        try {
          URL.revokeObjectURL(img.src);
        } catch {}
      }
    };

    img.onload = () => {
      try {
        // 9x8 canvas for dHash: compares horizontal gradients
        const canvas = document.createElement('canvas');
        canvas.width = 9;
        canvas.height = 8;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) {
          cleanup();
          return resolve('');
        }

        ctx.drawImage(img, 0, 0, 9, 8);
        const hash = getHashFromCanvas(canvas);
        cleanup();
        resolve(hash);
      } catch {
        cleanup();
        resolve('');
      }
    };

    img.onerror = () => {
      cleanup();
      resolve('');
    };

    if (typeof imageSource === 'string') {
      img.src = imageSource;
    } else {
      img.src = URL.createObjectURL(imageSource);
    }
  });
}

function getHashFromCanvas(sourceCanvas: HTMLCanvasElement): string {
  let sampleCanvas = sourceCanvas;
  if (sourceCanvas.width !== 9 || sourceCanvas.height !== 8) {
    sampleCanvas = document.createElement('canvas');
    sampleCanvas.width = 9;
    sampleCanvas.height = 8;
    const ctx = sampleCanvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return '';
    ctx.drawImage(sourceCanvas, 0, 0, 9, 8);
  }

  const ctx = sampleCanvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return '';
  const imgData = ctx.getImageData(0, 0, 9, 8).data;

  let hash = '';
  for (let y = 0; y < 8; y++) {
    for (let x = 0; x < 8; x++) {
      const idxLeft = (y * 9 + x) * 4;
      const idxRight = (y * 9 + (x + 1)) * 4;
      // Perceptual human eye grayscale luminance
      const lumLeft =
        imgData[idxLeft] * 0.299 +
        imgData[idxLeft + 1] * 0.587 +
        imgData[idxLeft + 2] * 0.114;
      const lumRight =
        imgData[idxRight] * 0.299 +
        imgData[idxRight + 1] * 0.587 +
        imgData[idxRight + 2] * 0.114;
      hash += lumLeft > lumRight ? '1' : '0';
    }
  }
  return hash;
}

/**
 * Computes the Hamming distance (number of bit differences) between two 64-bit hashes
 */
export function hammingDistance(hash1: string, hash2: string): number {
  if (!hash1 || !hash2 || hash1.length !== hash2.length) return 999;
  let dist = 0;
  for (let i = 0; i < hash1.length; i++) {
    if (hash1[i] !== hash2[i]) dist++;
  }
  return dist;
}

/**
 * Returns true if two images are visual duplicates.
 * A distance of <= 6 out of 64 bits means > 90% visual similarity.
 */
export function areImagesVisuallyDuplicate(
  hash1: string,
  hash2: string,
  maxDistanceThreshold = 6
): boolean {
  if (!hash1 || !hash2) return false;
  return hammingDistance(hash1, hash2) <= maxDistanceThreshold;
}
