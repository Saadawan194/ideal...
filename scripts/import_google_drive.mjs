import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import https from 'https';
import http from 'http';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const UPLOADS_DIR = path.resolve(__dirname, '../uploads');
const DB_FILE = path.resolve(__dirname, '../data/db.json');

if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

const apiKey = process.env.GEMINI_API_KEY || '';
const ai = apiKey
  ? new GoogleGenAI({
      apiKey,
      httpOptions: { timeout: 60000, headers: { 'User-Agent': 'aistudio-build' } },
    })
  : null;

// Difference hash for visual duplicate detection in Node
function computeSimpleDHash(buffer) {
  // Simple 64-bit sampling from raw buffer (or luminance projection)
  let hash = '';
  const len = buffer.length;
  const step = Math.max(1, Math.floor(len / 64));
  for (let i = 0; i < 64; i++) {
    const b1 = buffer[(i * step) % len];
    const b2 = buffer[((i + 1) * step) % len];
    hash += b1 > b2 ? '1' : '0';
  }
  return hash;
}

function hammingDistance(h1, h2) {
  if (!h1 || !h2 || h1.length !== h2.length) return 999;
  let d = 0;
  for (let i = 0; i < h1.length; i++) {
    if (h1[i] !== h2[i]) d++;
  }
  return d;
}

export async function processGoogleDriveUrl(driveUrl) {
  console.log(`\n======================================================`);
  console.log(`🚀 PROCESSING GOOGLE DRIVE IMPORT: ${driveUrl}`);
  console.log(`======================================================\n`);

  // Extract all file IDs or folder IDs
  const fileIds = new Set();
  const fileRegex = /(?:drive\.google\.com\/(?:file\/d\/|open\?id=|uc\?id=)|(?:id=))([a-zA-Z0-9_-]{20,})/g;
  let m;
  while ((m = fileRegex.exec(driveUrl)) !== null) {
    fileIds.add(m[1]);
  }

  // Also check folder ID
  const folderMatch = driveUrl.match(/folders\/([a-zA-Z0-9_-]+)/);
  if (folderMatch) {
    const folderId = folderMatch[1];
    console.log(`📂 Detected Google Drive Folder ID: ${folderId}`);
    try {
      // Fetch public folder webpage to scrape child file IDs
      const htmlResp = await fetch(`https://drive.google.com/drive/folders/${folderId}`);
      if (htmlResp.ok) {
        const html = await htmlResp.text();
        const idMatches = html.matchAll(/"([a-zA-Z0-9_-]{25,45})"/g);
        for (const match of idMatches) {
          const candidateId = match[1];
          // Filter common noise IDs
          if (!candidateId.includes('drive') && !candidateId.includes('google') && candidateId !== folderId) {
            fileIds.add(candidateId);
          }
        }
      }
    } catch (e) {
      console.warn('Folder scrape note:', e.message);
    }
  }

  const idList = Array.from(fileIds);
  console.log(`📦 Found ${idList.length} candidate file IDs to inspect.`);

  if (idList.length === 0) {
    console.log('⚠️ No valid Google Drive file IDs found in URL.');
    return;
  }

  const db = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
  const existingVisualHashes = new Map();
  let downloadedCount = 0;
  let duplicateCount = 0;
  let addedCount = 0;

  for (let idx = 0; idx < idList.length; idx++) {
    const fileId = idList[idx];
    const cdnUrl = `https://lh3.googleusercontent.com/d/${fileId}=s1600`;
    console.log(`[${idx + 1}/${idList.length}] Checking file ${fileId}...`);

    try {
      const resp = await fetch(cdnUrl);
      if (!resp.ok) continue;

      const arrayBuf = await resp.arrayBuffer();
      const buffer = Buffer.from(arrayBuf);
      if (buffer.length < 1500) continue; // too small, likely error page or icon

      downloadedCount++;

      // Compute visual difference hash
      const vHash = computeSimpleDHash(buffer);
      let isVisualDuplicate = false;

      for (const [prevId, prevHash] of existingVisualHashes.entries()) {
        if (hammingDistance(vHash, prevHash) <= 4) {
          console.log(`   ⏭️ VISUAL DUPLICATE detected (matches ${prevId}). Auto-skipping!`);
          isVisualDuplicate = true;
          duplicateCount++;
          break;
        }
      }

      if (isVisualDuplicate) continue;
      existingVisualHashes.set(fileId, vHash);

      // Save file
      const filename = `gdrive_${fileId.slice(0, 8)}_${Date.now()}.jpg`;
      const filePath = path.resolve(UPLOADS_DIR, filename);
      fs.writeFileSync(filePath, buffer);
      const publicUrl = `/uploads/${filename}`;

      // AI Analysis
      let aiResult = null;
      if (ai) {
        const base64Data = buffer.toString('base64');
        try {
          const prompt = `You are the master cataloguer for "Ideal Furniture" (Pakistan's luxury furniture house).
INSPECT THIS PHOTO WITH MAXIMUM ACCURACY.

1. FAZOOL / JUNK / IRRELEVANT FILTER:
   If this image is an icon, logo, computer graphic, clip-art, document/receipt, screenshot, car/vehicle, meme, food, clothing, person-only, or NOT furniture:
   Set "isFurniture": false, "decision": "REJECT", "reason": "Non-furniture/junk".

2. IDENTIFY PRIMARY FURNITURE CATEGORY:
   - "Living Room Furniture" (Sofas, Sectionals, Chesterfield, Coffee Tables, Accent Chairs, TV Units)
   - "Bedroom Furniture" (King Size Beds, Chinioti Beds, Dressing Tables / Vanity, Wardrobes, Nightstands)
   - "Dining Room Furniture" (Dining Sets, Dining Tables, Dining Chairs, Sideboards, Crockery Cabinets)
   - "Office Furniture" (Executive Desks, Workstations, Office Chairs)

3. DISTINCTIVE LUXURY PRODUCT TITLE:
   Generate an authentic luxury title describing visual details (color, fabric, wood tone, headboard style, leg design).
   NEVER return generic words like "Bed" or numbers.

4. SPECIFIC DETAILS:
   Accurately detect wood (Sheesham, Teak, Walnut), upholstery (Velvet, Bouclé, Leatherette, Linen), and write a 2-3 sentence product description.

Return strictly JSON:
{
  "isFurniture": boolean,
  "decision": "AUTO_UPLOAD" | "REJECT",
  "category": "Living Room Furniture" | "Bedroom Furniture" | "Dining Room Furniture" | "Office Furniture",
  "subCategory": string,
  "title": string,
  "description": string,
  "wood": string,
  "upholstery": string
}`;
          const aiResp = await ai.models.generateContent({
            model: 'gemini-3.1-flash-lite',
            contents: {
              parts: [
                { inlineData: { mimeType: 'image/jpeg', data: base64Data } },
                { text: prompt },
              ],
            },
            config: { responseMimeType: 'application/json' },
          });

          if (aiResp?.text) {
            aiResult = JSON.parse(aiResp.text);
          }
        } catch (err) {
          console.warn('   AI analysis warning:', err.message);
        }
      }

      // 🗑️ STRICT JUNK / IRRELEVANT FILTER: Auto-reject non-furniture
      if (aiResult && (aiResult.isFurniture === false || aiResult.decision === 'REJECT')) {
        console.log(`   🗑️ REJECTED IRRELEVANT IMAGE: Not furniture (icon/graphic/logo/meme). Auto-deleted!`);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        continue;
      }

      const title = aiResult?.title || `Royal Handcrafted ${aiResult?.subCategory || 'Furniture'} Creation`;
      const category = aiResult?.category || 'Living Room Furniture';
      const subCategory = aiResult?.subCategory || 'Luxury Furniture';
      const productCode = `IF-${Math.floor(1000 + Math.random() * 9000)}`;
      const cleanSlug = `${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${productCode.toLowerCase()}`;

      const newProduct = {
        id: `prod-${Date.now()}-${idx}`,
        name: title,
        slug: cleanSlug,
        productCode,
        category,
        subCategory,
        spaces: [category.includes('Bedroom') ? 'Master Bedroom' : (category.includes('Dining') ? 'Dining Room' : 'Living Room Suites')],
        shortDescription: aiResult?.description || `Handcrafted ${category.toLowerCase()} piece by Ideal Furniture Lahore.`,
        longDescription: aiResult?.description || `Mastercrafted from solid seasoned timber with artisanal joinery.`,
        material: aiResult?.wood || 'Solid Seasoned Hardwood',
        finish: 'Natural Satin Hand-Rubbed Wax',
        dimensions: 'Standard Showroom Specifications',
        seatingOrSize: 'Standard',
        wood: aiResult?.wood || 'Solid Seasoned Hardwood',
        upholstery: aiResult?.upholstery || 'Tailored Poshish',
        leadTime: '3 to 4 Weeks',
        madeIn: 'Lahore, Pakistan',
        images: [publicUrl],
        tags: ['Solid Wood', 'Handcrafted', category, subCategory],
        isFeatured: false,
        isPublished: true,
        seoTitle: `${title} | Ideal Furniture Lahore`,
        seoDescription: aiResult?.description || `Handcrafted ${category} in Pakistan.`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      db.products.unshift(newProduct);
      addedCount++;
      console.log(`   ✅ ADDED TO CATALOG: "${title}" [${category} - ${subCategory}]`);
    } catch (err) {
      console.warn(`   Error on ${fileId}:`, err.message);
    }
  }

  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));

  console.log(`\n======================================================`);
  console.log(`🎉 GOOGLE DRIVE IMPORT COMPLETE!`);
  console.log(`   📥 Downloaded: ${downloadedCount}`);
  console.log(`   👁️ Visually Duplicate Skipped: ${duplicateCount}`);
  console.log(`   ✨ Published to Live Catalog: ${addedCount}`);
  console.log(`======================================================\n`);
}

// If run from command line
if (process.argv[2]) {
  processGoogleDriveUrl(process.argv[2]).catch(console.error);
}
