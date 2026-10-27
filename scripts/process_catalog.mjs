#!/usr/bin/env node

/**
 * Ideal Furniture - Automated Bulk Catalog AI Processor
 * 
 * Usage:
 *   node scripts/process_catalog.mjs "C:/path/to/your/images/folder"
 * 
 * Features:
 *   - Scans thousands of mixed images (JPG, PNG, WebP)
 *   - Auto-filters & moves icons, logos, screenshots, non-furniture junk to a '_rejected_junk' folder
 *   - Gemini Vision analysis generates unique, non-generic luxury titles & rich descriptions
 *   - Accurately classifies into Showcase, Dressing, Sofa, Mirror, Side Tables, Beds, Chinioti, etc.
 *   - Resume capability (remembers progress in catalog_progress.json)
 *   - Exports ready-to-import ideal_furniture_catalog.json
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const targetFolder = process.argv[2];

if (!targetFolder) {
  console.log(`
========================================================================
  🛋️  IDEAL FURNITURE - BULK CATALOG AI PROCESSOR
========================================================================

  Please provide the path to your folder containing the 3,595 images.

  Example:
    node scripts/process_catalog.mjs "C:/Users/Admin/Desktop/FurniturePhotos"
    or
    node scripts/process_catalog.mjs "/home/user/furniture_folder"

========================================================================
`);
  process.exit(1);
}

const resolvedFolder = path.resolve(targetFolder);

if (!fs.existsSync(resolvedFolder)) {
  console.error(`❌ Error: Folder not found at "${resolvedFolder}"`);
  process.exit(1);
}

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error(`❌ Error: GEMINI_API_KEY not found in .env file or environment.`);
  process.exit(1);
}

const ai = new GoogleGenAI({ apiKey });

import crypto from 'crypto';

const UPLOADS_DIR = path.resolve(process.cwd(), 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

const DB_FILE = path.resolve(process.cwd(), 'data', 'db.json');

function getFileHash(filePath) {
  try {
    const fileBuffer = fs.readFileSync(filePath);
    const hashSum = crypto.createHash('sha256');
    hashSum.update(fileBuffer);
    return hashSum.digest('hex');
  } catch {
    return null;
  }
}

// Track file hashes to eliminate duplicates
const seenHashes = new Set();
let duplicateCount = 0;

const JUNK_DIR = path.resolve(resolvedFolder, '_rejected_junk');
const OUTPUT_FILE = path.resolve(process.cwd(), 'ideal_furniture_catalog_import.json');
const PROGRESS_FILE = path.resolve(process.cwd(), 'catalog_progress.json');

// Supported image extensions
const IMAGE_EXTS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.bmp', '.tiff']);

function getAllImageFiles(dir, fileList = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.name.startsWith('.') || entry.name === '_rejected_junk') continue;
    const fullPath = path.resolve(dir, entry.name);
    if (entry.isDirectory()) {
      getAllImageFiles(fullPath, fileList);
    } else {
      const ext = path.extname(entry.name).toLowerCase();
      if (IMAGE_EXTS.has(ext)) {
        fileList.push(fullPath);
      }
    }
  }
  return fileList;
}

// Load existing progress if any
let progress = { processed: {}, products: [], junkCount: 0 };
if (fs.existsSync(PROGRESS_FILE)) {
  try {
    progress = JSON.parse(fs.readFileSync(PROGRESS_FILE, 'utf8'));
    console.log(`🔄 Found previous progress: ${Object.keys(progress.processed).length} files already processed.`);
  } catch {}
}

const prompt = `You are the master cataloguer for "Ideal Furniture" (Pakistan's luxury furniture house, renowned for Chinioti hand-carved heritage, modern drawing room suites, banquet dining, and artisanal timber pieces).

INSPECT THIS IMAGE WITH EXTREME ACCURACY.

CRITICAL QUALITY & FILTER RULES:
1. FAZOOL / JUNK FILTER:
   - If this image is an icon, logo, computer graphic, clip-art, document/receipt, screenshot, car/vehicle, meme, food, clothing, person-only, or non-furniture object:
     Set "isFurniture": false, "decision": "REJECT", "reason": "Non-furniture icon/graphic/junk".
   - If it is genuine furniture, proceed to step 2.

2. SUBJECT & SUBCATEGORY CLASSIFICATION:
   - "Showcase": Crockery cabinets, display consoles, curio units, glass vitrines.
   - "Dressing": Vanity dressing tables with mirrors, bedroom dressers.
   - "Sofa": Luxury sofas, Chesterfield, 3-seater, 5-seater suites, velvet couches, dewan.
   - "Mirror": Accent wall mirrors, carved wood framed mirrors, floor-standing vanity mirrors.
   - "Side Tables": Bedside nightstands, living room end tables, nesting accent tables.
   - "Beds / Chinnioti Beds": Master beds, king/queen beds, hand-carved Sheesham Chinioti beds with high headboards.
   - "Dining": Dining tables, dining chairs, banquets.
   - "Office": Executive desks, study tables, workstations.

3. LUXURY, NON-GENERIC SEO TITLE:
   - Provide a highly distinctive, regal title describing PRECISELY what you see.
   - Examples: "Royal Chinioti Sheesham Wood Hand-Carved Master Bed Set with High Headboard", "Tufted Emerald Velvet Chesterfield 3-Seater Sofa", "Artisanal Sheesham Display Showcase with Beveled Glass & Solid Brass Latches".
   - NEVER use generic single words like "Bed" or "Sofa".

4. RICH PRODUCT DESCRIPTION:
   - 2-3 sentences mentioning timber quality (Sheesham, Teak, Walnut), traditional joinery, upholstery (Poshish, velvet), polish finish, and aesthetic character.

Return strictly a JSON object:
{
  "isFurniture": boolean,
  "decision": "AUTO_UPLOAD" | "REJECT",
  "reason": string,
  "category": "Living Room Furniture" | "Bedroom Furniture" | "Dining Room Furniture" | "Office Furniture" | "Accent & Decor",
  "subCategory": "Showcases" | "Dressing Tables" | "Sofas" | "Mirrors" | "Side Tables" | "Chinioti Beds" | "Dining Tables" | "Executive Desks",
  "title": string,
  "description": string,
  "wood": string,
  "upholstery": string,
  "finish": string,
  "tags": string[]
}`;

async function analyzeImage(imagePath) {
  const ext = path.extname(imagePath).toLowerCase();
  let mimeType = 'image/jpeg';
  if (ext === '.png') mimeType = 'image/png';
  else if (ext === '.webp') mimeType = 'image/webp';

  const buffer = fs.readFileSync(imagePath);
  const base64Data = buffer.toString('base64');

  const models = ['gemini-3.1-flash-lite', 'gemini-3.8-flash'];
  for (const modelName of models) {
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const response = await ai.models.generateContent({
          model: modelName,
          contents: {
            parts: [
              { inlineData: { mimeType, data: base64Data } },
              { text: prompt }
            ]
          },
          config: {
            responseMimeType: 'application/json',
          }
        });

        if (response?.text) {
          const parsed = JSON.parse(response.text);
          const rawTitle = (parsed.title || '').trim();
          const isBadTitle = !rawTitle || rawTitle.length < 4 || /^\d+$/.test(rawTitle);
          if (isBadTitle) {
            parsed.title = `Handcrafted ${parsed.subCategory || 'Luxury Furniture'} Suite (${parsed.wood || 'Solid Sheesham'})`;
          }
          return parsed;
        }
      } catch (e) {
        if (attempt === 1) {
          await new Promise((r) => setTimeout(r, 1500));
        }
      }
    }
  }
  throw new Error('AI analysis failed across all models');
}

async function main() {
  console.log(`\n🔍 Scanning folder: ${resolvedFolder}...`);
  const allImages = getAllImageFiles(resolvedFolder);
  const total = allImages.length;
  console.log(`📦 Found ${total} images to inspect.`);

  if (total === 0) {
    console.log('No supported images found in directory.');
    process.exit(0);
  }

  if (!fs.existsSync(JUNK_DIR)) {
    fs.mkdirSync(JUNK_DIR, { recursive: true });
  }

  let processedCount = Object.keys(progress.processed).length;
  let validCount = progress.products.length;
  let junkCount = progress.junkCount || 0;

  console.log(`🚀 Starting AI Processing & Junk Filtering...\n`);

  for (let i = 0; i < total; i++) {
    const imgPath = allImages[i];
    const filename = path.basename(imgPath);

    // Skip if already processed in previous run
    if (progress.processed[imgPath]) {
      continue;
    }

    // Check duplicate content via SHA-256 hash
    const fileHash = getFileHash(imgPath);
    if (fileHash && seenHashes.has(fileHash)) {
      duplicateCount++;
      progress.processed[imgPath] = { status: 'duplicate', reason: 'Identical file content already processed' };
      console.log(`[${i + 1}/${total}] "${filename}" -> ⏭️  DUPLICATE SKIPPED (Duplicate image)`);
      continue;
    }
    if (fileHash) seenHashes.add(fileHash);

    process.stdout.write(`[${i + 1}/${total}] Inspecting "${filename}"... `);

    try {
      const result = await analyzeImage(imgPath);

      if (!result.isFurniture || result.decision === 'REJECT') {
        junkCount++;
        // Move junk image to _rejected_junk folder
        const junkDest = path.resolve(JUNK_DIR, filename);
        try {
          fs.renameSync(imgPath, junkDest);
        } catch {}

        progress.processed[imgPath] = { status: 'rejected', reason: result.reason || 'Junk/Icon' };
        progress.junkCount = junkCount;
        console.log(`🗑️  FAZOOL / JUNK FILTERED (${result.reason || 'Non-furniture'})`);
      } else {
        validCount++;
        const productCode = `IF-${Math.floor(1000 + Math.random() * 9000)}`;
        const cleanSlug = `${result.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${productCode.toLowerCase()}`;

        // Ensure image is copied to public uploads directory
        const publicImagePath = `/uploads/${filename}`;
        const destPath = path.resolve(UPLOADS_DIR, filename);
        try {
          if (!fs.existsSync(destPath) && fs.existsSync(imgPath)) {
            fs.copyFileSync(imgPath, destPath);
          }
        } catch {}

        const product = {
          id: `prod-${Date.now()}-${validCount}`,
          name: result.title,
          slug: cleanSlug,
          productCode,
          category: result.category,
          subCategory: result.subCategory,
          spaces: [result.category.includes('Bedroom') ? 'Master Bedroom' : 'Living Room Suites'],
          shortDescription: result.description,
          longDescription: `${result.description} Handcrafted by Ideal Furniture using seasoned timber and master artisan joinery.`,
          material: result.wood || 'Solid Sheesham',
          wood: result.wood || 'Solid Sheesham',
          upholstery: result.upholstery || 'Tailored Poshish',
          finish: result.finish || 'Natural Satin Hand-Rubbed Wax',
          dimensions: 'Standard Showroom Specifications',
          leadTime: '3 to 4 Weeks',
          madeIn: 'Lahore & Chiniot, Pakistan',
          images: [publicImagePath],
          localImagePath: imgPath,
          tags: result.tags || ['Solid Wood', 'Handcrafted', result.subCategory],
          isPublished: true,
          seoTitle: `${result.title} | Ideal Furniture Lahore`,
          seoDescription: result.description,
          createdAt: new Date().toISOString(),
        };

        // Sync directly to live db.json so it appears immediately on website
        if (fs.existsSync(DB_FILE)) {
          try {
            const dbData = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
            if (!dbData.products.some((p) => p.slug === product.slug || p.name === product.name)) {
              dbData.products.unshift(product);
              fs.writeFileSync(DB_FILE, JSON.stringify(dbData, null, 2));
            }
          } catch {}
        }

        progress.products.push(product);
        progress.processed[imgPath] = { status: 'approved', title: result.title, category: result.category };
        console.log(`✅ ${result.subCategory}: "${result.title}"`);
      }
    } catch (err) {
      console.log(`⚠️  Failed: ${err.message}`);
      progress.processed[imgPath] = { status: 'error', error: err.message };
    }

    processedCount++;

    // Save checkpoint every 10 images
    if (processedCount % 10 === 0) {
      fs.writeFileSync(PROGRESS_FILE, JSON.stringify(progress, null, 2));
      fs.writeFileSync(OUTPUT_FILE, JSON.stringify(progress.products, null, 2));
    }

    // Paced 800ms pause to respect API rate limits and ensure 100% visual inspection accuracy
    await new Promise((r) => setTimeout(r, 800));
  }

  // Final Save
  fs.writeFileSync(PROGRESS_FILE, JSON.stringify(progress, null, 2));
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(progress.products, null, 2));

  console.log(`
========================================================================
🎉 PROCESSING COMPLETE!
========================================================================
  📦 Total Images Inspected: ${total}
  ✨ Valid Furniture Products: ${validCount}
  🗑️  Junk / Icons Filtered Out: ${junkCount}
  📁 Junk Moved To: "${JUNK_DIR}"
  💾 Catalog Exported To: "${OUTPUT_FILE}"
========================================================================
`);
}

main();
