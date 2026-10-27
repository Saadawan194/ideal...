export interface CanonicalCategoryInfo {
  canonicalName: string;
  slug: string;
  urduName: string;
  description: string;
  image: string;
  subCategories: string[];
}

export const CANONICAL_CATEGORIES: CanonicalCategoryInfo[] = [
  {
    canonicalName: 'Bedroom Furniture',
    slug: 'bedroom-furniture',
    urduName: 'بیڈ روم فرنیچر',
    description: 'Master beds, bridal bedroom sets, bedside tables, wardrobes, dressing vanities and chests.',
    image: 'https://images.unsplash.com/photo-1540518614846-7ede433c4ef0?auto=format&fit=crop&w=1000&q=85',
    subCategories: [
      'Beds',
      'King Size Beds',
      'Queen Size Beds',
      'Double Beds',
      'Single Beds',
      'Upholstered Beds',
      'Wooden Beds',
      'Storage Beds',
      'Platform Beds',
      'Bedroom Sets',
      'Complete Bed Sets',
      'Bridal / Wedding Bed Sets',
      'Luxury Bedroom Sets',
      'Bedside Tables',
      'Dressing Tables / Vanity',
      'Wardrobes',
      'Chest of Drawers',
      'Bedroom Benches',
    ],
  },
  {
    canonicalName: 'Living Room Furniture',
    slug: 'living-room-furniture',
    urduName: 'ڈرائنگ و لونگ روم فرنیچر',
    description: 'Luxury sofas, Chesterfields, curved sectionals, accent chairs, recliners, coffee tables & media consoles.',
    image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1000&q=85',
    subCategories: [
      'Sofas',
      'Sofa Sets',
      '1 Seater Sofa',
      '2 Seater Sofa',
      '3 Seater Sofa',
      'L-Shaped Sofa',
      'Sectional Sofa',
      'Corner Sofa',
      'Chesterfield Sofa',
      'Modular Sofa',
      'Sofa Cum Beds',
      'Accent Chairs',
      'Armchairs',
      'Lounge Chairs',
      'Recliners',
      'Coffee Tables',
      'Center Tables',
      'Side Tables',
      'Nesting Tables',
      'Console Tables',
      'TV Consoles & Media Units',
    ],
  },
  {
    canonicalName: 'Dining Room Furniture',
    slug: 'dining-room-furniture',
    urduName: 'ڈائننگ روم فرنیچر',
    description: 'Palatial banquet dining tables, 4-10+ seater dining sets, sculpted dining chairs, bar stools and sideboards.',
    image: 'https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&w=1000&q=85',
    subCategories: [
      'Dining Sets',
      '4 Seater Dining Set',
      '6 Seater Dining Set',
      '8 Seater Dining Set',
      '10+ Seater Dining Set',
      'Dining Tables',
      'Round Dining Tables',
      'Rectangular Dining Tables',
      'Dining Chairs',
      'Dining Benches',
      'Sideboards & Buffets',
      'Display & Crockery Cabinets',
    ],
  },
  {
    canonicalName: 'Office Furniture',
    slug: 'office-furniture',
    urduName: 'آفس فرنیچر',
    description: 'Executive & manager desks, ergonomic workstations, conference tables, executive chairs and filing storage.',
    image: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=1000&q=85',
    subCategories: [
      'Office Tables',
      'Executive Tables',
      'Manager Tables',
      'Staff Tables',
      'Workstations',
      'Office Chairs',
      'Executive Chairs',
      'Manager Chairs',
      'Visitor Chairs',
      'Ergonomic Chairs',
      'Conference Tables',
      'Office Storage & Bookcases',
    ],
  },
  {
    canonicalName: 'Custom Furniture',
    slug: 'custom-furniture',
    urduName: 'کسٹم میڈ فرنیچر',
    description: 'Bespoke custom beds, tailored sofas, customized wardrobes, bespoke dining suites and made-to-order commissions.',
    image: 'https://images.unsplash.com/photo-1616046229478-9901c5536a45?auto=format&fit=crop&w=1000&q=85',
    subCategories: [
      'Custom Beds',
      'Custom Sofas',
      'Custom Wardrobes',
      'Custom Dining Sets',
      'Custom Office Furniture',
      'Made to Order Furniture',
    ],
  },
];

const CATEGORY_ALIAS_MAP: Record<string, string> = {
  // Bedroom
  bed: 'Bedroom Furniture',
  beds: 'Bedroom Furniture',
  'bed set': 'Bedroom Furniture',
  'bed sets': 'Bedroom Furniture',
  bedroom: 'Bedroom Furniture',
  'master bedroom': 'Bedroom Furniture',
  'bridal bed': 'Bedroom Furniture',
  wardrobe: 'Bedroom Furniture',
  wardrobes: 'Bedroom Furniture',
  dresser: 'Bedroom Furniture',
  'dressing table': 'Bedroom Furniture',
  'bedside table': 'Bedroom Furniture',
  nightstand: 'Bedroom Furniture',
  vanity: 'Bedroom Furniture',

  // Living Room
  sofa: 'Living Room Furniture',
  sofas: 'Living Room Furniture',
  'sofa set': 'Living Room Furniture',
  couch: 'Living Room Furniture',
  sectional: 'Living Room Furniture',
  chesterfield: 'Living Room Furniture',
  living: 'Living Room Furniture',
  'living room': 'Living Room Furniture',
  'drawing room': 'Living Room Furniture',
  'coffee table': 'Living Room Furniture',
  'center table': 'Living Room Furniture',
  'side table': 'Living Room Furniture',
  'tv unit': 'Living Room Furniture',
  'tv console': 'Living Room Furniture',
  armchair: 'Living Room Furniture',
  recliner: 'Living Room Furniture',
  ottoman: 'Living Room Furniture',

  // Dining Room
  dining: 'Dining Room Furniture',
  'dining table': 'Dining Room Furniture',
  'dining set': 'Dining Room Furniture',
  'dining chair': 'Dining Room Furniture',
  sideboard: 'Dining Room Furniture',
  buffet: 'Dining Room Furniture',
  'crockery cabinet': 'Dining Room Furniture',

  // Office
  office: 'Office Furniture',
  desk: 'Office Furniture',
  'executive desk': 'Office Furniture',
  'executive table': 'Office Furniture',
  'office chair': 'Office Furniture',
  workstation: 'Office Furniture',
  conference: 'Office Furniture',
  'conference table': 'Office Furniture',

  // Custom
  custom: 'Custom Furniture',
  bespoke: 'Custom Furniture',
  'made to order': 'Custom Furniture',
  'custom furniture': 'Custom Furniture',
  'custom sofa': 'Custom Furniture',
  'custom bed': 'Custom Furniture',
};

export function normalizeCategory(categoryName?: string | null): string {
  if (!categoryName) return 'Living Room Furniture';
  const clean = categoryName.trim().toLowerCase();

  for (const cat of CANONICAL_CATEGORIES) {
    if (cat.canonicalName.toLowerCase() === clean) return cat.canonicalName;
    if (cat.slug.toLowerCase() === clean) return cat.canonicalName;
  }

  if (CATEGORY_ALIAS_MAP[clean]) {
    return CATEGORY_ALIAS_MAP[clean];
  }

  for (const [alias, canonical] of Object.entries(CATEGORY_ALIAS_MAP)) {
    if (clean.includes(alias)) {
      return canonical;
    }
  }

  return 'Living Room Furniture';
}

export function isCategoryMatch(productCategory: string, targetCategory: string): boolean {
  if (!productCategory || !targetCategory) return false;
  if (targetCategory === 'all') return true;

  const prodNorm = normalizeCategory(productCategory).toLowerCase();
  const targetNorm = normalizeCategory(targetCategory).toLowerCase();

  if (prodNorm === targetNorm) return true;

  const target = targetCategory.toLowerCase().trim();
  const prod = productCategory.toLowerCase().trim();

  if (prod === target) return true;
  if (prod.includes(target) || target.includes(prod)) return true;

  return false;
}
