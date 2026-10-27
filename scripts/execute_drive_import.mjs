import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
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

// Perceptual difference hash (dHash) for visual duplicate detection
function computeDHash(buffer) {
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

async function main() {
  const folderId = '15ocJRJZuMF2N3SOEsxTHrREvXV3ifmC4';
  console.log(`\n=============================================================`);
  console.log(`🚀 STARTING GOOGLE DRIVE CATALOG IMPORT`);
  console.log(`📂 Folder: https://drive.google.com/drive/folders/${folderId}`);
  console.log(`=============================================================\n`);

  console.log('🔍 Scraping file list from Google Drive folder...');
  const res = await fetch(`https://drive.google.com/drive/folders/${folderId}`);
  const html = await res.text();

  const regex = /data-id=\"([a-zA-Z0-9_-]{25,45})\"/g;
  const fileIds = [];
  let m;
  while ((m = regex.exec(html)) !== null) {
    if (m[1] !== folderId && !fileIds.includes(m[1])) {
      fileIds.push(m[1]);
    }
  }

  console.log(`📦 Found ${fileIds.length} images in Google Drive folder.`);
  if (fileIds.length === 0) {
    console.error('No files found.');
    process.exit(1);
  }

  const db = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
  const processedVisualHashes = new Map();

  let downloadedCount = 0;
  let visualDuplicatesSkipped = 0;
  let junkSkipped = 0;
  let addedCount = 0;

  for (let idx = 0; idx < fileIds.length; idx++) {
    const fileId = fileIds[idx];
    console.log(`\n-------------------------------------------------------------`);
    console.log(`[${idx + 1}/${fileIds.length}] Processing file ID: ${fileId}...`);

    // Check if this GDrive file is already in db.products
    if (db.products.some((p) => p.images && p.images[0] && p.images[0].includes(fileId.slice(0, 8)))) {
      console.log(`   ✅ Already added to catalog in previous run. Skipping.`);
      continue;
    }

    try {
      const cdnUrl = `https://lh3.googleusercontent.com/d/${fileId}=s1600`;
      const imgRes = await fetch(cdnUrl);
      if (!imgRes.ok) {
        console.log(`   ⚠️ Failed to fetch image (HTTP ${imgRes.status}), skipping.`);
        continue;
      }

      const buf = Buffer.from(await imgRes.arrayBuffer());
      if (buf.length < 2000) {
        console.log(`   ⚠️ File too small (${buf.length} bytes), skipping.`);
        continue;
      }

      downloadedCount++;

      // 1. VISUAL DUPLICATE DETECTION (pixel hash)
      const vHash = computeDHash(buf);
      let isVisualDuplicate = false;
      for (const [prevId, prevHash] of processedVisualHashes.entries()) {
        const dist = hammingDistance(vHash, prevHash);
        if (dist <= 4) {
          console.log(`   👁️ VISUAL DUPLICATE DETECTED (matches file ${prevId}, dist=${dist}). AUTO-SKIPPED!`);
          isVisualDuplicate = true;
          visualDuplicatesSkipped++;
          break;
        }
      }
      if (isVisualDuplicate) continue;

      processedVisualHashes.set(fileId, vHash);

      // Save locally
      const filename = `gdrive_${fileId.slice(0, 8)}_${Date.now()}.jpg`;
      const localPath = path.resolve(UPLOADS_DIR, filename);
      fs.writeFileSync(localPath, buf);
      const publicUrl = `/uploads/${filename}`;

      // 2. AI MULTIMODAL VISION INSPECTION
      const base64Data = buf.toString('base64');
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

      let aiResult = null;
      for (let attempt = 1; attempt <= 2; attempt++) {
        try {
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
            let parsed = JSON.parse(aiResp.text);
            if (Array.isArray(parsed)) parsed = parsed[0];
            aiResult = parsed;
            break;
          }
        } catch (e) {
          if (attempt === 1) await new Promise((r) => setTimeout(r, 1500));
        }
      }

      // 3. JUNK & NON-FURNITURE FILTER
      if (!aiResult || aiResult.isFurniture === false || aiResult.decision === 'REJECT') {
        console.log(`   🗑️ REJECTED FAZOOL / NON-FURNITURE IMAGE. Auto-deleted.`);
        junkSkipped++;
        if (fs.existsSync(localPath)) fs.unlinkSync(localPath);
        continue;
      }

      // 4. ADD TO CATALOG
      const title = aiResult.title || `Royal Handcrafted ${aiResult.subCategory || 'Furniture'} Creation`;
      const category = aiResult.category || 'Living Room Furniture';
      const subCategory = aiResult.subCategory || 'Luxury Furniture';
      const productCode = `IF-${Math.floor(1000 + Math.random() * 9000)}`;
      const cleanSlug = `${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${productCode.toLowerCase()}`;

      const newProduct = {
        id: `prod-${Date.now()}-${idx}`,
        name: title,
        slug: cleanSlug,
        productCode,
        category,
        subCategory,
        spaces: [
          category.includes('Bedroom')
            ? 'Master Bedroom'
            : (category.includes('Dining')
              ? 'Dining Room'
              : (category.includes('Office') ? 'Executive Office' : 'Living Room Suites')),
        ],
        shortDescription: aiResult.description || `Handcrafted ${category.toLowerCase()} piece by Ideal Furniture Lahore.`,
        longDescription: `${aiResult.description || ''} Mastercrafted from solid seasoned timber with artisanal mortise-and-tenon joinery.`,
        material: aiResult.wood || 'Solid Seasoned Hardwood',
        finish: 'Natural Satin Hand-Rubbed Wax',
        dimensions: 'Standard Showroom Specifications',
        seatingOrSize: 'Standard',
        wood: aiResult.wood || 'Solid Seasoned Hardwood',
        upholstery: aiResult.upholstery || 'Tailored Poshish',
        leadTime: '3 to 4 Weeks',
        madeIn: 'Lahore, Pakistan',
        images: [publicUrl],
        tags: ['Solid Wood', 'Handcrafted', category, subCategory],
        isFeatured: addedCount < 8,
        isPublished: true, // Live in catalog!
        seoTitle: `${title} | Ideal Furniture Lahore`,
        seoDescription: aiResult.description || `Handcrafted ${category} in Pakistan.`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      db.products.unshift(newProduct);
      addedCount++;
      console.log(`   ✨ LIVE IN CATALOG: "${title}"`);
      console.log(`      📁 ${category} > ${subCategory} | Timber: ${newProduct.wood} | Poshish: ${newProduct.upholstery}`);

      // Save database immediately for live persistence
      fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));

      // Safe pacing between items to prevent Google API rate spikes
      await new Promise((r) => setTimeout(r, 600));
    } catch (err) {
      console.warn(`   ⚠️ Error processing ${fileId}:`, err.message);
    }
  }

  // Final database save
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));

  console.log(`\n=============================================================`);
  console.log(`🎉 GOOGLE DRIVE IMPORT & CATALOGING COMPLETE!`);
  console.log(`   📥 Total Downloaded: ${downloadedCount}`);
  console.log(`   👁️ Visually Duplicate Skipped: ${visualDuplicatesSkipped}`);
  console.log(`   🗑️ Faltu / Non-Furniture Rejected: ${junkSkipped}`);
  console.log(`   ✨ Live Products Added to Catalog: ${addedCount}`);
  console.log(`=============================================================\n`);
}

main().catch(console.error);
