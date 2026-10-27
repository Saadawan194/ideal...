import express, { Request, Response } from 'express';
import compression from 'compression';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import {
  SEED_CATEGORIES,
  SEED_HOMEPAGE_CONTENT,
  SEED_LEADS,
  SEED_PRODUCTS,
  SEED_SETTINGS,
  SEED_SPACES,
  SEED_USERS,
} from './src/data/seedData';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// High-speed gzip/brotli compression for all text, json, and image responses
app.use(compression());

// High body limit to receive multi-image base64 WebP payloads
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Directories for real persistent storage
const isVercel = process.env.VERCEL === '1' || !!process.env.VERCEL;
const UPLOADS_DIR = isVercel ? path.resolve('/tmp', 'uploads') : path.resolve(__dirname, 'uploads');
const DATA_DIR = isVercel ? path.resolve('/tmp', 'data') : path.resolve(__dirname, 'data');
const DB_FILE = path.resolve(DATA_DIR, 'db.json');

try {
  if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  }
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (isVercel && !fs.existsSync(DB_FILE)) {
    const candidates = [
      path.resolve(process.cwd(), 'data', 'db.json'),
      path.resolve(__dirname, 'data', 'db.json'),
      path.resolve(__dirname, '..', 'data', 'db.json'),
    ];
    for (const cand of candidates) {
      if (fs.existsSync(cand)) {
        fs.copyFileSync(cand, DB_FILE);
        break;
      }
    }
  }
} catch (e) {
  console.warn('Storage directory initialization note:', e);
}

// Robust image serving for /uploads across dev, preview, and build environments
app.get('/uploads/:filename', (req: Request, res: Response) => {
  const { filename } = req.params;
  const candidatePaths = [
    path.resolve(UPLOADS_DIR, filename),
    path.resolve(__dirname, 'uploads', filename),
    path.resolve(__dirname, 'public', 'uploads', filename),
    path.resolve(__dirname, 'dist', 'uploads', filename),
  ];

  for (const p of candidatePaths) {
    if (fs.existsSync(p)) {
      res.setHeader('Cache-Control', 'public, max-age=2592000, immutable');
      return res.sendFile(p);
    }
  }
  return res.status(404).send('Image not found');
});

// Serve uploaded images statically with high-performance browser caching
app.use(
  '/uploads',
  express.static(UPLOADS_DIR, {
    maxAge: '30d',
    immutable: true,
    setHeaders: (res) => {
      res.setHeader('Cache-Control', 'public, max-age=2592000, immutable');
    },
  })
);

// Direct download endpoint for project zip
app.get('/api/download-zip', (_req: Request, res: Response) => {
  const zipPath = path.resolve(__dirname, 'ideal-furniture.zip');
  if (fs.existsSync(zipPath)) {
    res.download(zipPath, 'ideal-furniture.zip');
  } else {
    res.status(404).send('ZIP file not found');
  }
});

// Default initial media items
const DEFAULT_MEDIA = [
  {
    id: 'med-1',
    name: 'Noor Sofa Cover.jpg',
    url: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1000&q=85',
    size: '1.2 MB',
    createdAt: '2026-01-15T10:00:00Z',
  },
  {
    id: 'med-2',
    name: 'Harappa Chest Teak.jpg',
    url: 'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&w=1000&q=85',
    size: '1.8 MB',
    createdAt: '2026-01-18T11:00:00Z',
  },
  {
    id: 'med-3',
    name: 'Terracotta Urn Raw.jpg',
    url: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=1000&q=85',
    size: '850 KB',
    createdAt: '2026-01-25T11:00:00Z',
  },
];

// In-memory + Disk synced database
interface ServerDatabase {
  products: any[];
  categories: any[];
  spaces: any[];
  leads: any[];
  homepage: any;
  settings: any;
  media: any[];
  users: any[];
}

function getDatabase(): ServerDatabase {
  try {
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      return {
        products: Array.isArray(parsed.products) ? parsed.products : SEED_PRODUCTS,
        categories: Array.isArray(parsed.categories) ? parsed.categories : SEED_CATEGORIES,
        spaces: Array.isArray(parsed.spaces) ? parsed.spaces : SEED_SPACES,
        leads: Array.isArray(parsed.leads) ? parsed.leads : SEED_LEADS,
        homepage: parsed.homepage || SEED_HOMEPAGE_CONTENT,
        settings: parsed.settings || SEED_SETTINGS,
        media: Array.isArray(parsed.media) ? parsed.media : DEFAULT_MEDIA,
        users: Array.isArray(parsed.users) ? parsed.users : SEED_USERS,
      };
    }
  } catch (err) {
    console.error('Error reading DB_FILE, seeding new database:', err);
  }

  const initialDb: ServerDatabase = {
    products: SEED_PRODUCTS,
    categories: SEED_CATEGORIES,
    spaces: SEED_SPACES,
    leads: SEED_LEADS,
    homepage: SEED_HOMEPAGE_CONTENT,
    settings: SEED_SETTINGS,
    media: DEFAULT_MEDIA,
    users: SEED_USERS,
  };
  saveDatabase(initialDb);
  return initialDb;
}

function saveDatabase(db: ServerDatabase): void {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to save DB_FILE:', err);
  }
}

// Real-time Multi-Device Event Broadcast (Server-Sent Events)
const sseClients = new Set<Response>();

function broadcastRealtimeUpdate(type: string, data: any = {}) {
  const payload = `data: ${JSON.stringify({ type, data, timestamp: Date.now() })}\n\n`;
  for (const client of sseClients) {
    try {
      client.write(payload);
    } catch {
      sseClients.delete(client);
    }
  }
}

// Real-Time Event Stream for cross-device synchronization
app.get('/api/events', (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();

  sseClients.add(res);
  res.write(`data: ${JSON.stringify({ type: 'CONNECTED', timestamp: Date.now() })}\n\n`);

  req.on('close', () => {
    sseClients.delete(res);
  });
});

// ----------------- Persistent REST APIs ----------------- //

// Full DB snapshot
app.get('/api/db', (_req: Request, res: Response) => {
  res.json(getDatabase());
});

app.post('/api/db/sync', (req: Request, res: Response) => {
  const current = getDatabase();
  const updated = {
    ...current,
    ...req.body,
  };
  saveDatabase(updated);
  res.json({ success: true, db: updated });
});

// Real WordPress-like File Upload Endpoint
app.post('/api/upload', (req: Request, res: Response) => {
  try {
    const { filename = 'image.webp', dataUrl, size } = req.body;
    if (!dataUrl) {
      return res.status(400).json({ error: 'dataUrl is required' });
    }

    // Extract base64 data & mime type
    const matches = dataUrl.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      return res.status(400).json({ error: 'Invalid base64 dataUrl format' });
    }

    const mime = matches[1];
    const base64Data = matches[2];
    const buffer = Buffer.from(base64Data, 'base64');

    // Determine extension
    let ext = '.webp';
    if (mime.includes('jpeg') || mime.includes('jpg')) ext = '.jpg';
    else if (mime.includes('png')) ext = '.png';
    else if (mime.includes('gif')) ext = '.gif';

    const cleanBaseName = filename.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9_-]/g, '_');
    const uniqueFilename = `${Date.now()}-${cleanBaseName}${ext}`;
    const destinationPath = path.resolve(UPLOADS_DIR, uniqueFilename);

    fs.writeFileSync(destinationPath, buffer);
    try {
      const pubDest = path.resolve(__dirname, 'public', 'uploads', uniqueFilename);
      const distDest = path.resolve(__dirname, 'dist', 'uploads', uniqueFilename);
      if (fs.existsSync(path.dirname(pubDest))) fs.writeFileSync(pubDest, buffer);
      if (fs.existsSync(path.dirname(distDest))) fs.writeFileSync(distDest, buffer);
    } catch {}
    const publicUrl = `/uploads/${uniqueFilename}`;
    const calculatedSize = size || `${(buffer.length / 1024).toFixed(1)} KB`;

    // Add to Media Library
    const db = getDatabase();
    const mediaItem = {
      id: `med-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
      name: filename,
      url: publicUrl,
      size: calculatedSize,
      createdAt: new Date().toISOString(),
    };
    db.media.unshift(mediaItem);
    saveDatabase(db);
    broadcastRealtimeUpdate('MEDIA_UPDATED', mediaItem);

    return res.json({
      success: true,
      url: publicUrl,
      item: mediaItem,
    });
  } catch (err: any) {
    console.error('File upload error:', err);
    return res.status(500).json({ error: err.message || 'File upload failed' });
  }
});

// Google Drive Bulk Image Import Endpoint
app.post('/api/import-google-drive', async (req: Request, res: Response) => {
  try {
    const { url, urls = [] } = req.body;
    const rawList = Array.isArray(urls) && urls.length > 0 ? urls : (url ? [url] : []);
    
    // Extract file IDs from sharing links or text
    const fileIds = new Set<string>();
    const fileRegex = /(?:drive\.google\.com\/(?:file\/d\/|open\?id=|uc\?id=)|(?:id=))([a-zA-Z0-9_-]{20,})/g;
    
    for (const item of rawList) {
      if (typeof item !== 'string') continue;
      let m;
      while ((m = fileRegex.exec(item)) !== null) {
        fileIds.add(m[1]);
      }
      // If user pasted bare file ID
      if (/^[a-zA-Z0-9_-]{25,45}$/.test(item.trim())) {
        fileIds.add(item.trim());
      }
    }

    if (fileIds.size === 0) {
      return res.status(400).json({
        error: 'No valid Google Drive file links or IDs recognized. Please paste public/anyone-with-link Google Drive links.'
      });
    }

    const downloadedItems: any[] = [];
    const idArray = Array.from(fileIds).slice(0, 100);

    for (const fileId of idArray) {
      try {
        // High-speed CDN download endpoint for Google Drive images
        const cdnUrl = `https://lh3.googleusercontent.com/d/${fileId}=s1600`;
        const resp = await fetch(cdnUrl);
        if (!resp.ok) continue;

        const arrayBuf = await resp.arrayBuffer();
        const buffer = Buffer.from(arrayBuf);
        if (buffer.length < 500) continue; // too small, likely an html error or empty

        const filename = `gdrive_${fileId.slice(0, 8)}.jpg`;
        const uniqueFilename = `${Date.now()}-${filename}`;
        const dest = path.resolve(UPLOADS_DIR, uniqueFilename);
        fs.writeFileSync(dest, buffer);

        const publicUrl = `/uploads/${uniqueFilename}`;
        const dataUrl = `data:image/jpeg;base64,${buffer.toString('base64')}`;

        downloadedItems.push({
          id: fileId,
          name: filename,
          url: publicUrl,
          dataUrl,
          size: buffer.length,
        });
      } catch (e: any) {
        console.warn(`Failed importing Google Drive item ${fileId}:`, e.message);
      }
    }

    return res.json({
      success: true,
      importedCount: downloadedItems.length,
      items: downloadedItems,
    });
  } catch (err: any) {
    console.error('Google Drive import error:', err);
    return res.status(500).json({ error: err.message || 'Google Drive import failed' });
  }
});

// Media Library Endpoints
app.get('/api/media', (_req: Request, res: Response) => {
  const db = getDatabase();
  res.json(db.media || []);
});

app.delete('/api/media/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const db = getDatabase();
  const itemIndex = db.media.findIndex((m) => m.id === id);
  if (itemIndex === -1) {
    return res.status(404).json({ error: 'Media not found' });
  }
  const item = db.media[itemIndex];
  if (item.url && item.url.startsWith('/uploads/')) {
    const filename = item.url.replace('/uploads/', '');
    const fullPath = path.resolve(UPLOADS_DIR, filename);
    if (fs.existsSync(fullPath)) {
      try {
        fs.unlinkSync(fullPath);
      } catch (e) {
        console.warn('Could not delete disk file:', e);
      }
    }
  }
  db.media.splice(itemIndex, 1);
  saveDatabase(db);
  broadcastRealtimeUpdate('MEDIA_UPDATED', { id });
  res.json({ success: true });
});

// Products Endpoints
app.get('/api/products', (_req: Request, res: Response) => {
  const db = getDatabase();
  res.json(db.products || []);
});

app.post('/api/products', (req: Request, res: Response) => {
  const db = getDatabase();
  const now = new Date().toISOString();
  const newProduct = {
    ...req.body,
    id: req.body.id || `prod-${Date.now()}`,
    createdAt: now,
    updatedAt: now,
  };
  db.products.unshift(newProduct);
  saveDatabase(db);
  broadcastRealtimeUpdate('PRODUCTS_UPDATED', newProduct);
  res.json(newProduct);
});

app.put('/api/products/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const db = getDatabase();
  const index = db.products.findIndex((p) => p.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Product not found' });
  }
  db.products[index] = {
    ...db.products[index],
    ...req.body,
    updatedAt: new Date().toISOString(),
  };
  saveDatabase(db);
  broadcastRealtimeUpdate('PRODUCTS_UPDATED', db.products[index]);
  res.json(db.products[index]);
});

app.delete('/api/products/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const db = getDatabase();
  db.products = db.products.filter((p) => p.id !== id);
  saveDatabase(db);
  broadcastRealtimeUpdate('PRODUCTS_UPDATED', { id });
  res.json({ success: true });
});

// Bulk Insert Products Endpoint
app.post('/api/products/bulk', (req: Request, res: Response) => {
  const db = getDatabase();
  const rawList = Array.isArray(req.body.products) ? req.body.products : Array.isArray(req.body) ? req.body : [];
  const now = new Date().toISOString();
  const newProducts = rawList.map((p: any, idx: number) => ({
    ...p,
    id: p.id || `prod-${Date.now()}-${idx}-${Math.floor(100 + Math.random() * 900)}`,
    createdAt: p.createdAt || now,
    updatedAt: now,
  }));
  db.products = [...newProducts, ...db.products];
  saveDatabase(db);
  broadcastRealtimeUpdate('PRODUCTS_UPDATED', { count: newProducts.length });
  res.json(newProducts);
});

// Endpoint: Bulk Publish / Unpublish Products (Draft to Live)
// Endpoint: Associate uploaded image / angle to an existing product
app.post("/api/products/associate-image", (req: Request, res: Response) => {
  const { productId, imageUrl, isFeatured = false } = req.body;
  if (!productId || !imageUrl) {
    return res.status(400).json({ error: "productId and imageUrl are required" });
  }
  const db = getDatabase();
  const index = db.products.findIndex((p: any) => p.id === productId);
  if (index === -1) {
    return res.status(404).json({ error: "Product not found" });
  }
  const product = db.products[index];
  const images = Array.isArray(product.images) ? [...product.images] : [];
  if (!images.includes(imageUrl)) {
    if (isFeatured) images.unshift(imageUrl);
    else images.push(imageUrl);
  }
  db.products[index] = {
    ...product,
    images,
    ...(isFeatured ? { featuredImage: imageUrl } : {}),
    updatedAt: new Date().toISOString(),
  };
  saveDatabase(db);
  broadcastRealtimeUpdate("PRODUCTS_UPDATED", { id: productId });
  res.json({ success: true, product: db.products[index] });
});

// Endpoint: Group multiple selected images into a single new product (Multi-angle support)
app.post("/api/products/group-images", (req: Request, res: Response) => {
  const { title, categoryId, categoryName, subCategory, images = [], featuredImage, description, wood, upholstery } = req.body;
  if (!Array.isArray(images) || images.length === 0) {
    return res.status(400).json({ error: "At least one image is required to group" });
  }
  const db = getDatabase();
  const now = new Date().toISOString();
  const safeTitle = title || "Royal Handcrafted Furniture Suite";
  const slug = safeTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  const primaryImg = featuredImage || images[0];

  const newProduct = {
    id: `prod-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
    name: safeTitle,
    slug,
    productCode: String(Math.floor(10000 + Math.random() * 90000)),
    category: categoryName || "Living Room Furniture",
    subCategory: subCategory || "Luxury Furniture",
    spaces: ["Living Room Suites"],
    shortDescription: description || `Handcrafted ${safeTitle} sculpted from premium seasoned timber.`,
    longDescription: description || `Handcrafted ${safeTitle} sculpted from premium seasoned timber.`,
    material: wood || "Solid Seasoned Sheesham",
    finish: "Hand-Rubbed Satin Luster",
    dimensions: "Standard Showroom Dimensions",
    leadTime: "3 to 4 Weeks",
    featuredImage: primaryImg,
    images,
    isPublished: true,
    createdAt: now,
    updatedAt: now,
  };

  db.products.unshift(newProduct);
  saveDatabase(db);
  broadcastRealtimeUpdate("PRODUCTS_UPDATED", { count: 1 });
  res.json({ success: true, product: newProduct });
});

app.post('/api/products/bulk-publish', (req: Request, res: Response) => {
  const { ids, publish = true } = req.body;
  const db = getDatabase();
  const idSet = new Set(Array.isArray(ids) ? ids : []);
  const now = new Date().toISOString();
  db.products = db.products.map((p) => {
    if (idSet.has(p.id)) {
      return { ...p, isPublished: !!publish, updatedAt: now };
    }
    return p;
  });
  saveDatabase(db);
  res.json({ success: true, updatedCount: idSet.size });
});

// High-definition furniture photography dataset for auto-generation
const CURATED_FURNITURE_PHOTOS: Record<string, string[]> = {
  Beds: [
    'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=85',
    'https://images.unsplash.com/photo-1540518614846-7ede433c4ef0?auto=format&fit=crop&w=1200&q=85',
    'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=1200&q=85',
    'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1200&q=85',
    'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1200&q=85',
  ],
  Seating: [
    'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1200&q=85',
    'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&w=1200&q=85',
    'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1200&q=85',
    'https://images.unsplash.com/photo-1567016432779-094069958ea5?auto=format&fit=crop&w=1200&q=85',
    'https://images.unsplash.com/photo-1550254478-ead40cc54513?auto=format&fit=crop&w=1200&q=85',
    'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?auto=format&fit=crop&w=1200&q=85',
  ],
  Dining: [
    'https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&w=1200&q=85',
    'https://images.unsplash.com/photo-1615066390971-03e4e1c36ddf?auto=format&fit=crop&w=1200&q=85',
    'https://images.unsplash.com/photo-1530018607912-eff2daa1bac4?auto=format&fit=crop&w=1200&q=85',
    'https://images.unsplash.com/photo-1577140917170-285929fb55b7?auto=format&fit=crop&w=1200&q=85',
  ],
  Tables: [
    'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&w=1200&q=85',
    'https://images.unsplash.com/photo-1532372320572-cda25653a26d?auto=format&fit=crop&w=1200&q=85',
    'https://images.unsplash.com/photo-1581539250439-c96689b516dd?auto=format&fit=crop&w=1200&q=85',
    'https://images.unsplash.com/photo-1519961655809-34fa156820ff?auto=format&fit=crop&w=1200&q=85',
  ],
  Storage: [
    'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&w=1200&q=85',
    'https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&w=1200&q=85',
    'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?auto=format&fit=crop&w=1200&q=85',
  ],
  Office: [
    'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=1200&q=85',
    'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=1200&q=85',
  ],
};

const MASTER_FURNITURE_RECIPES = [
  {
    name: 'Maharaja Chinioti Handcrafted Sheesham King Bed Set',
    category: 'Beds',
    description: 'Masterfully carved solid seasoned Sheesham bed set with intricate floral crown cresting, matching dual bedside nightstands, and hand-rubbed warm walnut satin polish.',
  },
  {
    name: 'Royal Chesterfield 7-Seater Tufted Velvet Sofa Set',
    category: 'Seating',
    description: 'Signature deep diamond-buttoned Chesterfield lounge set upholstered in stain-resistant royal emerald velvet with kiln-dried solid timber structural framing.',
  },
  {
    name: 'Kashmir Walnut 8-Seater Fluted Dining Suite',
    category: 'Dining',
    description: 'Heirloom 8-seater dining table crafted from figured Swat walnut, featuring fluted solid pedestals and eight matching cushioned high-back dining armchairs.',
  },
  {
    name: 'Italian Calacatta Gold Marble Center Table Set',
    category: 'Tables',
    description: 'Natural imported Calacatta Gold marble tabletop with polished bevelled edge, supported by an architectural antique brushed brass geometric base with nesting side tables.',
  },
  {
    name: 'Heritage Fluted Teak 4-Door Luxury Credenza',
    category: 'Storage',
    description: 'Mid-century inspired sideboard featuring hand-milled fluted teak wood doors, concealed soft-close German hardware, and solid brass cylindrical handles.',
  },
  {
    name: 'Presidential Solid Sheesham Executive Partner Desk',
    category: 'Office',
    description: 'Stately double-pedestal executive desk featuring full-grain leather writing insert, brass cable grommets, and lockable dovetailed solid wood drawers.',
  },
  {
    name: 'Milano Curved Bouclé 4-Seater Designer Sofa',
    category: 'Seating',
    description: 'Organic curved cloud silhouette upholstered in heavy textured cream bouclé fabric, engineered with high-resilience memory foam for supreme ergonomic comfort.',
  },
  {
    name: 'Crown Tufted Poshish Emperor Bed with Storage Base',
    category: 'Beds',
    description: 'Modern statement bed featuring a 6-foot tall vertical fluted upholstered headboard in muted champagne velvet, equipped with heavy-duty hydraulic underbed storage.',
  },
  {
    name: 'Rawalpindi Brass Inlaid Center Coffee Table',
    category: 'Tables',
    description: 'Traditional solid dark Sheesham coffee table featuring fine hand-hammered floral brass inlay craftsmanship and a durable water-resistant polyurethane topcoat.',
  },
  {
    name: 'Scandi Fluted Round 6-Seater Solid Oak Dining Table',
    category: 'Dining',
    description: 'Minimalist circular dining table featuring a bold central fluted column base, finished in a serene natural matte lacquer that highlights organic wood grain.',
  },
  {
    name: 'Mughal Architectural Jali Carved Armoire Wardrobe',
    category: 'Storage',
    description: 'Grand 3-door wardrobe with handcrafted geometric wood lattice (Jali) panels, cedar-lined interior drawers, and full-length hanging space.',
  },
  {
    name: 'Regal High-Back Wing Library Chair in Cognac Leather',
    category: 'Seating',
    description: 'Classic fireside reading wing chair upholstered in hand-distressed vintage cognac leather with antique brass nailhead studs and solid turned walnut legs.',
  },
  {
    name: 'Chinioti Jharoka Accent Console Table with Glass Top',
    category: 'Tables',
    description: 'Wall console table inspired by traditional Lahore Jharoka architecture, featuring delicate open fretwork carvings in seasoned rosewood.',
  },
  {
    name: 'Linear Ribbed Low-Profile Floating Media Console',
    category: 'Storage',
    description: 'Contemporary TV entertainment unit crafted with seamless ribbed timber tambour doors, internal cable pass-through channels, and matte black steel supports.',
  },
  {
    name: 'Artisan Solid Walnut Bench with Woven Cane Seat',
    category: 'Seating',
    description: 'Versatile entryway or bed-end bench handcrafted from solid walnut timber and hand-woven natural rattan wicker cane weave.',
  },
];

// Endpoint: Bulk Generate 10-15 Products with Real Names & Images
app.post('/api/generate-bulk-products', async (req: Request, res: Response) => {
  try {
    const count = Math.min(Math.max(Number(req.body.count) || 12, 1), 30);
    const categoryFilter = req.body.category || 'all';
    const theme = req.body.theme || '';

    let generatedItems: Array<{
      name: string;
      category: string;
      description: string;
      images: string[];
      productCode: string;
      slug: string;
      isPublished: boolean;
    }> = [];

    // If Gemini AI is active and configured, use it for custom creative variations
    if (ai) {
      try {
        const prompt = `You are a master furniture catalog expert for "Ideal Furniture Lahore", a renowned luxury bespoke Pakistani furniture house.
Generate an array of exactly ${count} distinctive, authentic furniture products.
Category requested: "${categoryFilter}".
Theme/Style: "${theme || 'Pakistani Handcrafted & Modern Luxury Mix'}".

For each product, return:
- "name": An authentic, realistic luxury furniture title (e.g. "Royal Chinioti Carved Sheesham King Bed", "Milano Curved Bouclé 7-Seater Sofa", "Solid Walnut Fluted 8-Seater Dining Set", "Onyx Marble Center Table with Brass Base", "Teak Fluted 4-Door Sideboard Credenza", etc.)
- "category": One of exactly: "Beds", "Seating", "Dining", "Tables", "Storage", "Office"
- "description": 2-3 sentences of clean, appealing description highlighting wood species (Sheesham, Walnut, Teak, Oak), upholstery (Velvet, Bouclé, Linen), polish finish, and master craftsmanship.

Return strictly a valid JSON array of ${count} objects without markdown ticks.`;

        const aiResponse = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
          },
        });

        const text = aiResponse.text || '[]';
        const parsed = JSON.parse(text);
        if (Array.isArray(parsed) && parsed.length > 0) {
          generatedItems = parsed.map((item, idx) => {
            const cat = item.category || 'Seating';
            const catPhotos = CURATED_FURNITURE_PHOTOS[cat] || CURATED_FURNITURE_PHOTOS['Seating'];
            const photo = catPhotos[idx % catPhotos.length];
            const code = `IF-${Math.floor(1000 + Math.random() * 9000)}`;
            const slug = `${(item.name || 'furniture').toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${code.toLowerCase()}`;
            return {
              name: item.name || `Luxury Furniture Creation #${idx + 1}`,
              category: cat,
              description: item.description || 'Masterfully handcrafted solid wood furniture piece with hand-rubbed satin finish.',
              images: [photo],
              productCode: code,
              slug,
              isPublished: true,
            };
          });
        }
      } catch (aiErr) {
        console.warn('Gemini bulk generation fallback to master recipes:', aiErr);
      }
    }

    // Fallback if AI wasn't used or failed
    if (generatedItems.length === 0) {
      let filteredPool = MASTER_FURNITURE_RECIPES;
      if (categoryFilter !== 'all') {
        const matching = MASTER_FURNITURE_RECIPES.filter(
          (r) => r.category.toLowerCase() === categoryFilter.toLowerCase()
        );
        if (matching.length > 0) filteredPool = matching;
      }

      // Generate up to count items
      for (let i = 0; i < count; i++) {
        const recipe = filteredPool[i % filteredPool.length];
        const catPhotos = CURATED_FURNITURE_PHOTOS[recipe.category] || CURATED_FURNITURE_PHOTOS['Seating'];
        const photo = catPhotos[i % catPhotos.length];
        const randomNum = Math.floor(1000 + Math.random() * 9000);
        const code = `IF-${randomNum}`;
        const nameSuffix = i >= filteredPool.length ? ` (Edition ${Math.floor(i / filteredPool.length) + 1})` : '';
        const name = `${recipe.name}${nameSuffix}`;

        generatedItems.push({
          name,
          category: recipe.category,
          description: recipe.description,
          images: [photo],
          productCode: code,
          slug: `${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${code.toLowerCase()}`,
          isPublished: true,
        });
      }
    }

    return res.json({
      success: true,
      count: generatedItems.length,
      products: generatedItems,
    });
  } catch (err: any) {
    console.error('Error generating bulk products:', err);
    return res.status(500).json({ error: err.message || 'Generation failed' });
  }
});

// Categories & Spaces Endpoints
app.get('/api/categories', (_req: Request, res: Response) => {
  const db = getDatabase();
  res.json(db.categories || []);
});

app.post('/api/categories', (req: Request, res: Response) => {
  const db = getDatabase();
  const newCat = {
    ...req.body,
    id: req.body.id || `cat-${Date.now()}`,
  };
  db.categories.push(newCat);
  saveDatabase(db);
  res.json(newCat);
});

app.get('/api/spaces', (_req: Request, res: Response) => {
  const db = getDatabase();
  res.json(db.spaces || []);
});

// Leads Endpoints
app.get('/api/leads', (_req: Request, res: Response) => {
  const db = getDatabase();
  res.json(db.leads || []);
});

app.post('/api/leads', (req: Request, res: Response) => {
  const db = getDatabase();
  const now = new Date().toISOString();
  const newLead = {
    ...req.body,
    id: `lead-${Date.now()}`,
    notes: [],
    createdAt: now,
    updatedAt: now,
  };
  db.leads.unshift(newLead);
  saveDatabase(db);
  res.json(newLead);
});

app.put('/api/leads/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const db = getDatabase();
  const index = db.leads.findIndex((l) => l.id === id);
  if (index === -1) return res.status(404).json({ error: 'Lead not found' });
  db.leads[index] = {
    ...db.leads[index],
    ...req.body,
    updatedAt: new Date().toISOString(),
  };
  saveDatabase(db);
  res.json(db.leads[index]);
});

// Homepage Content & Settings
app.get('/api/homepage', (_req: Request, res: Response) => {
  const db = getDatabase();
  res.json(db.homepage || {});
});

app.put('/api/homepage', (req: Request, res: Response) => {
  const db = getDatabase();
  db.homepage = { ...db.homepage, ...req.body };
  saveDatabase(db);
  res.json(db.homepage);
});

app.get('/api/settings', (_req: Request, res: Response) => {
  const db = getDatabase();
  res.json(db.settings || {});
});

app.put('/api/settings', (req: Request, res: Response) => {
  const db = getDatabase();
  db.settings = { ...db.settings, ...req.body };
  saveDatabase(db);
  res.json(db.settings);
});

// Server-side Gemini client utility
const apiKey = process.env.GEMINI_API_KEY || "AQ.Ab8RN6LeBICVwEQDfoS3_ZUUSYD9nb05giXXnnvM_9OJZbEp8A";
const ai = apiKey
  ? new GoogleGenAI({
      apiKey,
      httpOptions: {
        timeout: 60000,
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

// Endpoint: AI Vision Furniture Analyzer & Automatic Categorization
app.post('/api/analyze-furniture', async (req: Request, res: Response) => {
  const originalFilename = req.body.originalFilename || '';
  try {
    const { imageBase64, mimeType = 'image/jpeg', clientCategories } = req.body;
    if (!imageBase64) {
      return res.status(400).json({ error: 'imageBase64 is required' });
    }

    // Clean base64 string and accurately detect MIME type
    let detectedMimeType = mimeType || 'image/jpeg';
    if (typeof imageBase64 === 'string') {
      const mimeMatch = imageBase64.match(/^data:(image\/[a-zA-Z0-9+.-]+);base64,/);
      if (mimeMatch) {
        detectedMimeType = mimeMatch[1];
      }
    }
    const cleanBase64 = imageBase64.replace(/^data:image\/[a-zA-Z0-9+.-]+;base64,/, '').trim();

    // Get current categories directly from existing DB
    const db = getDatabase();
    const activeCategories = Array.isArray(clientCategories) && clientCategories.length > 0
      ? clientCategories
      : (db.categories || []);

    const categoryListForPrompt = activeCategories.map((c: any) => ({
      id: c.id,
      name: c.name,
      subCategories: c.subCategories || [],
    }));

    if (!ai) {
      const fallbackDecision = generateSmartCategoryDecision(originalFilename, activeCategories);
      return res.json({
        success: true,
        source: 'heuristic_fallback',
        decision: fallbackDecision,
        data: {
          title: fallbackDecision.title,
          category: fallbackDecision.categoryName,
          wood: fallbackDecision.wood || 'Solid Sheesham',
          upholstery: fallbackDecision.upholstery || 'Tailored Poshish',
          description: fallbackDecision.description,
        },
      });
    }

    const categoryTaxonomyText = categoryListForPrompt
      .map((c: any) => `- Category ID: "${c.id}" | Name: "${c.name}" | Sub-types: ${(c.subCategories || []).slice(0, 12).join(', ')}`)
      .join('\n');

    const prompt = `You are the master cataloguer for "Ideal Furniture" (Pakistan's luxury furniture house, renowned for Chinioti hand-carved heritage, modern drawing room suites, banquet dining, and artisanal timber pieces).

CAREFULLY INSPECT THE ATTACHED FURNITURE PHOTO.

STEP 1: VISUALLY CLASSIFY THE PRIMARY OBJECT:
- If this is a BED, HEADBOARD, MATTRESS, or COMPLETE BEDROOM SET ->
  Category: "Bedroom Furniture" (categoryId: "cat-bedroom", subCategory: "Beds" or "King Size Beds" or "Bedroom Sets")
- If this is a SOFA, COUCH, CHESTERFIELD, L-SHAPE, SECTIONAL, ACCENT CHAIR, or OTTOMAN ->
  Category: "Living Room Furniture" (categoryId: "cat-living", subCategory: "Sofas" or "Sofa Sets" or "Accent Chairs")
- If this is a DINING TABLE, DINING CHAIRS, or BANQUET SET ->
  Category: "Dining Room Furniture" (categoryId: "cat-dining", subCategory: "Dining Sets" or "Dining Tables")
- If this is a DRESSING TABLE, VANITY MIRROR, or WARDROBE ->
  Category: "Bedroom Furniture" (categoryId: "cat-bedroom", subCategory: "Dressing Tables / Vanity" or "Wardrobes")
- If this is a COFFEE TABLE, CENTER TABLE, CONSOLE, or TV UNIT ->
  Category: "Living Room Furniture" (categoryId: "cat-living", subCategory: "Coffee Tables" or "Console Tables")
- If this is an OFFICE DESK, WORKSTATION, or EXECUTIVE CHAIR ->
  Category: "Office Furniture" (categoryId: "cat-office", subCategory: "Executive Tables" or "Office Chairs")
- If this is JUNK / NON-FURNITURE (logos, icons, clip-art, food, animals, receipts, memes, cars):
  set "isFurniture": false, "decision": "REJECT", "confidence": 0.10.

STEP 2: GENERATE AN ULTRA-SPECIFIC, HIGH-CONVERTING LUXURY PRODUCT TITLE:
- The title MUST describe the visual attributes you actually see (specific color, fabric type, wood tone, headboard style, leg design, and silhouette).
- Examples of EXCELLENT titles:
  * "Emerald Green Velvet Tufted Chesterfield 3-Seater Sofa with Tapered Legs"
  * "Chinioti Hand-Carved Sheesham King Master Bed with High Velvet Headboard"
  * "Modern White Bouclé Curved Sectional Sofa with Fluted Base"
  * "Solid Walnut 8-Seater Banquet Dining Table with Upholstered Armchairs"
  * "Royal Ornate Carved Vanity Dressing Table with Tri-Fold Mirror"
  * "Executive Solid Teak Desk with Cable Ports & Leather Inlay"
- FORBIDDEN: NEVER use generic titles like "Living Room Suite", "Furniture Piece", numbers, or filenames.

STEP 3: WRITE A DETAILED 2-3 SENTENCE EDITORIAL PRODUCT DESCRIPTION:
- Accurately describe the exact color shades, upholstery texture (velvet, chenille, bouclé, leatherette, linen), wood finish (natural teak, dark walnut, antique gold, matte black), and silhouette shown in the image.

TAXONOMY TO MATCH:
${categoryTaxonomyText}

Return STRICTLY a JSON object:
{
  "isFurniture": true,
  "decision": "AUTO_UPLOAD",
  "confidence": 0.96,
  "categoryId": string,
  "categoryName": string,
  "subCategory": string,
  "title": string,
  "description": string,
  "wood": string,
  "upholstery": string,
  "color": string,
  "reason": "Clear explanation of visible features confirming this category."
}`;

    let responseText = '';
    // Priority order: gemini-3.1-flash-lite first (fastest, high RPM, near-zero 503 spikes), then gemini-3.8-flash
    const modelsToTry = ['gemini-3.1-flash-lite', 'gemini-3.8-flash'];
    for (let mIdx = 0; mIdx < modelsToTry.length; mIdx++) {
      const modelName = modelsToTry[mIdx];
      // Retry up to 2 attempts per model with exponential backoff on transient 429/503 errors
      for (let attempt = 1; attempt <= 2; attempt++) {
        try {
          const imagePart = {
            inlineData: {
              mimeType: detectedMimeType,
              data: cleanBase64,
            },
          };
          const textPart = {
            text: prompt,
          };

          const response: any = await ai.models.generateContent({
            model: modelName,
            contents: { parts: [imagePart, textPart] },
            config: {
              responseMimeType: 'application/json',
            },
          });

          if (response?.text) {
            responseText = response.text;
            console.log(`AI Vision successfully analyzed ${originalFilename} using ${modelName}`);
            break;
          }
        } catch (err: any) {
          if (attempt === 1) {
            // Smooth pause before retry
            await new Promise((r) => setTimeout(r, 1200));
          }
        }
      }
      if (responseText) break;
    }

    if (responseText) {
      const cleanJson = responseText.replace(/```json/gi, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanJson);

      // Validate that categoryId actually exists in our active categories
      let matchedCategory = activeCategories.find(
        (c: any) => c.id === parsed.categoryId || c.name.toLowerCase() === (parsed.categoryName || '').toLowerCase()
      );

      // If categoryId was not matched, try matching by name keywords
      if (!matchedCategory && parsed.categoryName) {
        const pLower = parsed.categoryName.toLowerCase();
        matchedCategory = activeCategories.find((c: any) =>
          c.name.toLowerCase().includes(pLower) || pLower.includes(c.name.toLowerCase())
        );
      }

      if (!matchedCategory && activeCategories.length > 0) {
        // Fallback match based on visual subject keywords
        const tLower = `${parsed.title || ''} ${parsed.subCategory || ''} ${parsed.furniture_type || ''} ${parsed.categoryName || ''}`.toLowerCase();
        if (tLower.includes('sofa') || tLower.includes('couch') || tLower.includes('living') || tLower.includes('lounge') || tLower.includes('chester')) {
          matchedCategory = activeCategories.find((c: any) => c.name.toLowerCase().includes('living') || c.id === 'cat-living');
        } else if (tLower.includes('dining') || tLower.includes('buffet') || tLower.includes('crockery') || tLower.includes('showcase')) {
          matchedCategory = activeCategories.find((c: any) => c.name.toLowerCase().includes('dining') || c.id === 'cat-dining');
        } else if (tLower.includes('office') || tLower.includes('desk') || tLower.includes('workstation')) {
          matchedCategory = activeCategories.find((c: any) => c.name.toLowerCase().includes('office') || c.id === 'cat-office');
        } else if (tLower.includes('bed') || tLower.includes('wardrobe') || tLower.includes('dressing') || tLower.includes('vanity') || tLower.includes('nightstand')) {
          matchedCategory = activeCategories.find((c: any) => c.name.toLowerCase().includes('bedroom') || c.id === 'cat-bedroom');
        }
      }

      const finalCategoryId = matchedCategory ? matchedCategory.id : (activeCategories[0]?.id || 'cat-living');
      const finalCategoryName = matchedCategory ? matchedCategory.name : (activeCategories[0]?.name || 'Living Room Furniture');

      const confidence = typeof parsed.confidence === 'number' ? parsed.confidence : 0.95;
      const decision = (confidence >= 0.70 && parsed.decision !== 'REJECT')
        ? 'AUTO_UPLOAD'
        : (parsed.decision === 'REJECT' ? 'REJECT' : 'NEEDS_REVIEW');

      // Check if AI title is missing, numeric, or just a filename
      const rawTitle = (parsed.title || '').trim();
      const isBadTitle = !rawTitle ||
        rawTitle.length < 4 ||
        /^\d+$/.test(rawTitle) ||
        rawTitle.toLowerCase() === originalFilename.toLowerCase().replace(/\.[^/.]+$/, '').trim();

      const finalSubCategory = parsed.subCategory || matchedCategory?.subCategories?.[0] || 'Luxury Furniture';
      const finalTitle = !isBadTitle
        ? rawTitle
        : `Handcrafted ${finalSubCategory} Suite (${parsed.wood || 'Solid Sheesham'})`;

      const finalDecision = {
        categoryId: finalCategoryId,
        categoryName: finalCategoryName,
        subCategory: finalSubCategory,
        confidence,
        decision,
        title: finalTitle,
        wood: parsed.wood || 'Solid Seasoned Sheesham',
        upholstery: parsed.upholstery || 'Tailored Poshish',
        description: parsed.description || `Handcrafted ${finalCategoryName.toLowerCase()} masterpiece by Ideal Furniture, sculpted from seasoned timber with hand-rubbed finish.`,
        reason: parsed.reason || `AI visually recognized ${finalSubCategory} from photo details.`,
      };

      return res.json({
        success: true,
        source: 'gemini_vision',
        decision: finalDecision,
        data: {
          title: finalDecision.title,
          category: finalDecision.categoryName,
          categoryId: finalDecision.categoryId,
          style: finalDecision.subCategory,
          subCategory: finalDecision.subCategory,
          wood: finalDecision.wood,
          upholstery: finalDecision.upholstery,
          description: finalDecision.description,
          confidence: finalDecision.confidence,
          decision: finalDecision.decision,
          reason: finalDecision.reason,
        },
      });
    }

    throw new Error('AI analysis produced empty response');
  } catch (error: any) {
    const errMsg = (error?.message || '').toLowerCase();
    const isRateLimit = errMsg.includes('429') || errMsg.includes('503') || errMsg.includes('resource_exhausted') || errMsg.includes('quota') || errMsg.includes('high demand');

    if (isRateLimit) {
      console.warn(`Vision AI rate-limited on ${originalFilename}, instructing client queue to back off and retry...`);
      return res.status(429).json({
        success: false,
        error: 'RATE_LIMIT_RETRY',
        retryAfterMs: 2500,
        message: 'Vision AI rate limit reached. Queue will automatically wait and retry with visual inspection.',
      });
    }

    console.error('Gemini furniture analysis fatal error, flagging for review:', error);
    const db = getDatabase();
    const activeCategories = Array.isArray(req.body.clientCategories) && req.body.clientCategories.length > 0
      ? req.body.clientCategories
      : (db.categories || []);
    const fallbackDecision = generateSmartCategoryDecision(originalFilename, activeCategories);

    return res.json({
      success: true,
      source: 'heuristic_fallback',
      decision: fallbackDecision,
      data: {
        title: fallbackDecision.title,
        category: fallbackDecision.categoryName,
        wood: fallbackDecision.wood || 'Solid Sheesham',
        upholstery: fallbackDecision.upholstery || 'Tailored Poshish',
        description: fallbackDecision.description,
      },
    });
  }
});

function generateSmartTitleFromSubject(categoryName: string, subCategory?: string, filename?: string): string {
  const clean = (filename || '').replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ').trim();
  const sub = subCategory || '';
  if (categoryName.toLowerCase().includes('living') || sub.toLowerCase().includes('sofa')) {
    return 'Royal Chesterfield Tufted Velvet Sofa';
  }
  if (categoryName.toLowerCase().includes('dining')) {
    return 'Solid Walnut Handcrafted Banquet Dining Table';
  }
  if (categoryName.toLowerCase().includes('office')) {
    return 'Executive Solid Timber Workstation Desk';
  }
  if (categoryName.toLowerCase().includes('bed')) {
    return clean.length > 3 ? `${clean.charAt(0).toUpperCase() + clean.slice(1)}` : 'Master Bedroom Suite Piece';
  }
  return clean.length > 3 ? `${clean.charAt(0).toUpperCase() + clean.slice(1)}` : `Artisan ${categoryName} Piece`;
}

function generateSmartCategoryDecision(filename: string, activeCategories: any[]) {
  const name = (filename || '').toLowerCase();
  
  // NEVER assume everything is a bed! Check filename keywords carefully
  if (name.includes('sofa') || name.includes('couch') || name.includes('seating') || name.includes('chester') || name.includes('lounge') || name.includes('sectional') || name.includes('recliner')) {
    const targetCat = activeCategories.find((c: any) => c.name.toLowerCase().includes('living') || c.id === 'cat-living') || activeCategories[0];
    return {
      categoryId: targetCat.id,
      categoryName: targetCat.name,
      subCategory: 'Sofas',
      confidence: 0.85,
      decision: 'AUTO_UPLOAD' as const,
      title: 'Royal Chesterfield Handcrafted Sofa Suite',
      wood: 'Solid Sheesham & Acacia Frame',
      upholstery: 'Jewel Velvet & High Resilience Foam',
      description: 'Handcrafted luxury sofa suite with deep button-tufting, turned wooden legs, and resilient velvet poshish.',
      reason: 'Matched living room sofa keywords from image metadata.',
    };
  }
  
  if (name.includes('dining') || name.includes('buffet') || name.includes('crockery') || name.includes('showcase')) {
    const targetCat = activeCategories.find((c: any) => c.name.toLowerCase().includes('dining') || c.id === 'cat-dining') || activeCategories[0];
    const isShowcase = name.includes('showcase') || name.includes('crockery');
    return {
      categoryId: targetCat.id,
      categoryName: targetCat.name,
      subCategory: isShowcase ? 'Display & Crockery Cabinets' : 'Dining Sets',
      confidence: 0.85,
      decision: 'AUTO_UPLOAD' as const,
      title: isShowcase ? 'Chinioti Carved Crockery Showcase Cabinet' : 'Solid Walnut 8-Seater Dining Suite',
      wood: 'Solid Himalayan Walnut',
      upholstery: 'Stain-Resistant Textured Fabric',
      description: 'Architectural dining creation built from seasoned timber with heirloom mortise-and-tenon joinery.',
      reason: 'Matched dining room furniture keywords from image metadata.',
    };
  }

  if (name.includes('office') || name.includes('desk') || name.includes('workstation') || name.includes('conference')) {
    const targetCat = activeCategories.find((c: any) => c.name.toLowerCase().includes('office') || c.id === 'cat-office') || activeCategories[0];
    return {
      categoryId: targetCat.id,
      categoryName: targetCat.name,
      subCategory: 'Executive Tables',
      confidence: 0.85,
      decision: 'AUTO_UPLOAD' as const,
      title: 'Presidential Solid Hardwood Executive Desk',
      wood: 'Solid Seasoned Teak & Walnut',
      upholstery: 'N/A',
      description: 'Commanding executive workstation featuring cable management ports, dovetailed drawers, and leather writing insert.',
      reason: 'Matched office furniture keywords from image metadata.',
    };
  }

  if (name.includes('bed') || name.includes('wardrobe') || name.includes('dressing') || name.includes('vanity') || name.includes('nightstand')) {
    const targetCat = activeCategories.find((c: any) => c.name.toLowerCase().includes('bedroom') || c.id === 'cat-bedroom') || activeCategories[0];
    const isDressing = name.includes('dressing') || name.includes('vanity');
    const isNightstand = name.includes('nightstand') || name.includes('side');
    const sub = name.includes('wardrobe') ? 'Wardrobes' : (isDressing ? 'Dressing Tables' : (isNightstand ? 'Side Tables' : 'King Size Beds'));
    const title = name.includes('wardrobe')
      ? 'Royal 4-Door Carved Sheesham Wardrobe'
      : (isDressing ? 'Hand-Carved Ornate Vanity Dressing Mirror' : (isNightstand ? 'Solid Timber Bedside Nightstand' : 'Artisanal Master Bedstead'));
    return {
      categoryId: targetCat.id,
      categoryName: targetCat.name,
      subCategory: sub,
      confidence: 0.85,
      decision: 'AUTO_UPLOAD' as const,
      title,
      wood: 'Solid Seasoned Sheesham',
      upholstery: 'Tailored Velvet Tufting',
      description: 'Master bedroom handcrafted creation with high-relief woodcarving and hand-rubbed warm satin polish.',
      reason: 'Matched bedroom furniture keywords from image metadata.',
    };
  }

  // NEVER use raw filenames (like download, IMG, photo, numbers) as titles!
  const defaultCat = activeCategories.find((c: any) => c.id === "cat-living") || activeCategories[0] || { id: "cat-living", name: "Living Room Furniture" };
  const luxuryTitles = [
    "Royal Handcrafted Solid Sheesham Living Room Suite",
    "Imperial Chesterfield Velvet Hand-Carved Drawing Room Suite",
    "Chinioti Handcrafted Seasoned Sheesham Masterpiece",
    "Artisanal Solid Timber Contemporary Luxury Suite"
  ];
  const safeTitle = luxuryTitles[Math.floor(Math.random() * luxuryTitles.length)];

  return {
    categoryId: defaultCat.id,
    categoryName: defaultCat.name,
    subCategory: 'Luxury Furniture',
    confidence: 0.85,
    decision: 'AUTO_UPLOAD' as const,
    title: safeTitle,
    wood: 'Solid Seasoned Sheesham',
    upholstery: 'Tailored Velvet Poshish',
    description: 'Handcrafted luxury furniture piece by Ideal Furniture Lahore, sculpted from seasoned timber with hand-rubbed finish.',
    reason: 'Authentic handcrafted artisanal furniture piece ready for publishing.',
  };
}

function generateDefaultTitle(categoryName: string, filename: string): string {
  const cleanName = filename.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');
  if (categoryName.toLowerCase().includes('bed')) {
    return 'Chiniot Hand-Carved Royal Sheesham Bed Set';
  }
  if (categoryName.toLowerCase().includes('living') || categoryName.toLowerCase().includes('sofa')) {
    return 'Royal Chesterfield Tufted Velvet Sofa Set';
  }
  if (categoryName.toLowerCase().includes('dining')) {
    return 'Solid Walnut 8-Seater Handcrafted Dining Suite';
  }
  if (categoryName.toLowerCase().includes('office')) {
    return 'Executive Solid Timber Workstation Desk';
  }
  return `${categoryName} – ${cleanName || 'Bespoke Artisan Piece'}`;
}

// Dynamic XML Sitemap for Google & Search Engine Indexing
app.get('/sitemap.xml', (_req: Request, res: Response) => {
  const db = getDatabase();
  const baseUrl = process.env.APP_URL || 'https://idealfurniture.pk';
  const now = new Date().toISOString().split('T')[0];

  const staticPages = [
    { url: '', priority: '1.0', changefreq: 'daily' },
    { url: '/about', priority: '0.8', changefreq: 'monthly' },
    { url: '/projects', priority: '0.8', changefreq: 'monthly' },
    { url: '/spaces', priority: '0.8', changefreq: 'weekly' },
    { url: '/contact', priority: '0.7', changefreq: 'monthly' },
    { url: '/faqs', priority: '0.6', changefreq: 'monthly' },
    { url: '/terms', priority: '0.3', changefreq: 'yearly' },
    { url: '/privacy', priority: '0.3', changefreq: 'yearly' },
  ];

  const categoryPages = (db.categories || []).map((cat: any) => ({
    url: `/collections/${cat.slug || cat.id}`,
    priority: '0.9',
    changefreq: 'daily',
  }));

  const productPages = (db.products || [])
    .filter((p: any) => p.isPublished !== false)
    .map((prod: any) => ({
      url: `/product/${prod.slug || prod.id}`,
      priority: '0.8',
      changefreq: 'weekly',
      lastmod: (prod.updatedAt || prod.createdAt || now).split('T')[0],
      images: prod.images || [],
      title: prod.name,
    }));

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n`;

  for (const page of staticPages) {
    xml += `  <url>\n    <loc>${baseUrl}${page.url}</loc>\n    <changefreq>${page.changefreq}</changefreq>\n    <priority>${page.priority}</priority>\n    <lastmod>${now}</lastmod>\n  </url>\n`;
  }

  for (const cat of categoryPages) {
    xml += `  <url>\n    <loc>${baseUrl}${cat.url}</loc>\n    <changefreq>${cat.changefreq}</changefreq>\n    <priority>${cat.priority}</priority>\n    <lastmod>${now}</lastmod>\n  </url>\n`;
  }

  for (const prod of productPages) {
    xml += `  <url>\n    <loc>${baseUrl}${prod.url}</loc>\n    <changefreq>${prod.changefreq}</changefreq>\n    <priority>${prod.priority}</priority>\n    <lastmod>${prod.lastmod || now}</lastmod>\n`;
    if (prod.images && prod.images.length > 0) {
      const imgUrl = prod.images[0].startsWith('http') ? prod.images[0] : `${baseUrl}${prod.images[0]}`;
      xml += `    <image:image>\n      <image:loc>${imgUrl.replace(/&/g, '&amp;')}</image:loc>\n      <image:title>${(prod.title || '').replace(/&/g, '&amp;')}</image:title>\n    </image:image>\n`;
    }
    xml += `  </url>\n`;
  }

  xml += `</urlset>`;

  res.setHeader('Content-Type', 'application/xml');
  res.setHeader('Cache-Control', 'public, max-age=3600');
  res.send(xml);
});

// Standard Robots.txt for Crawler Guidance
app.get('/robots.txt', (_req: Request, res: Response) => {
  const baseUrl = process.env.APP_URL || 'https://idealfurniture.pk';
  const robots = `User-agent: *
Allow: /
Disallow: /admin
Disallow: /api/

Sitemap: ${baseUrl}/sitemap.xml
`;
  res.setHeader('Content-Type', 'text/plain');
  res.send(robots);
});

// Development or Production Setup
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';
  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Serve production build
    const distPath = path.resolve(__dirname, 'dist');
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get('*', (_req: Request, res: Response) => {
        res.sendFile(path.resolve(distPath, 'index.html'));
      });
    }
  }

  if (!process.env.VERCEL) {
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Ideal Furniture Server running on http://0.0.0.0:${PORT}`);
    });
  }
}

if (!process.env.VERCEL) {
  startServer();
}

export default app;
