import { Category, HomepageContent, Lead, Product, SiteSettings, Space, User } from '../types';
import { SITE_CONFIG, WHATSAPP_NUMBER } from '../config/site';

export const SEED_CATEGORIES: Category[] = [
  {
    id: "cat-bedroom",
    name: "Bedroom Furniture",
    slug: "bedroom-furniture",
    order: 1,
    image: "https://images.unsplash.com/photo-1540518614846-7ede433c4ef0?auto=format&fit=crop&w=1000&q=85",
    description: "Master beds, bridal bedroom sets, bedside tables, wardrobes, dressing vanities and chests.",
    subCategories: [
      "Beds",
      "King Size Beds",
      "Queen Size Beds",
      "Double Beds",
      "Single Beds",
      "Upholstered Beds",
      "Wooden Beds",
      "Storage Beds",
      "Platform Beds",
      "Bedroom Sets",
      "Complete Bed Sets",
      "Bridal / Wedding Bed Sets",
      "Luxury Bedroom Sets",
      "Bedside Tables",
      "Dressing Tables / Vanity",
      "Wardrobes",
      "Chest of Drawers",
      "Bedroom Benches"
    ]
  },
  {
    id: "cat-living",
    name: "Living Room Furniture",
    slug: "living-room-furniture",
    order: 2,
    image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1000&q=85",
    description: "Luxury sofas, Chesterfields, curved sectionals, accent chairs, recliners, coffee tables & media consoles.",
    subCategories: [
      "Sofas",
      "Sofa Sets",
      "1 Seater Sofa",
      "2 Seater Sofa",
      "3 Seater Sofa",
      "L-Shaped Sofa",
      "Sectional Sofa",
      "Corner Sofa",
      "Chesterfield Sofa",
      "Modular Sofa",
      "Sofa Cum Beds",
      "Accent Chairs",
      "Armchairs",
      "Lounge Chairs",
      "Recliners",
      "Coffee Tables",
      "Center Tables",
      "Side Tables",
      "Nesting Tables",
      "Console Tables",
      "TV Consoles & Media Units"
    ]
  },
  {
    id: "cat-dining",
    name: "Dining Room Furniture",
    slug: "dining-room-furniture",
    order: 3,
    image: "https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&w=1000&q=85",
    description: "Palatial banquet dining tables, 4-10+ seater dining sets, sculpted dining chairs, bar stools and sideboards.",
    subCategories: [
      "Dining Sets",
      "4 Seater Dining Set",
      "6 Seater Dining Set",
      "8 Seater Dining Set",
      "10+ Seater Dining Set",
      "Dining Tables",
      "Round Dining Tables",
      "Rectangular Dining Tables",
      "Dining Chairs",
      "Dining Benches",
      "Sideboards & Buffets",
      "Display & Crockery Cabinets"
    ]
  },
  {
    id: "cat-office",
    name: "Office Furniture",
    slug: "office-furniture",
    order: 4,
    image: "https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=1000&q=85",
    description: "Executive & manager desks, ergonomic workstations, conference tables, executive chairs and filing storage.",
    subCategories: [
      "Office Tables",
      "Executive Tables",
      "Manager Tables",
      "Staff Tables",
      "Workstations",
      "Office Chairs",
      "Executive Chairs",
      "Manager Chairs",
      "Visitor Chairs",
      "Ergonomic Chairs",
      "Conference Tables",
      "Office Storage & Bookcases"
    ]
  },
  {
    id: "cat-custom",
    name: "Custom Furniture",
    slug: "custom-furniture",
    order: 5,
    image: "https://images.unsplash.com/photo-1616046229478-9901c5536a45?auto=format&fit=crop&w=1000&q=85",
    description: "Bespoke custom beds, tailored sofas, customized wardrobes, bespoke dining suites and made-to-order commissions.",
    subCategories: [
      "Custom Beds",
      "Custom Sofas",
      "Custom Wardrobes",
      "Custom Dining Sets",
      "Custom Office Furniture",
      "Made to Order Furniture"
    ]
  }
];

export const SEED_SPACES: Space[] = [
  {
    id: "space-living",
    name: "Living Room Suites",
    slug: "living-room",
    image: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=85",
    description: "Deep lounge sectionals, hand-carved sofas, marble center tables, and deewans.",
    order: 1
  },
  {
    id: "space-drawing",
    name: "Drawing Room",
    slug: "drawing-room",
    image: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1200&q=85",
    description: "Formal hand-carved deewans, antique walnut consoles, and jewel velvet armchairs.",
    order: 2
  },
  {
    id: "space-dining",
    name: "Banquet & Dining Halls",
    slug: "dining-room",
    image: "https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&w=1200&q=85",
    description: "Solid timber banqueting tables, cane-back chairs, and mirrored brass sideboards.",
    order: 3
  },
  {
    id: "space-bedroom",
    name: "Master Bedroom Chambers",
    slug: "bedroom",
    image: "https://images.unsplash.com/photo-1540518614846-7ede433c4ef0?auto=format&fit=crop&w=1200&q=85",
    description: "Four-poster beds, bridal tufted headboards, bedside nightstands, and carved wardrobes.",
    order: 4
  },
  {
    id: "space-study",
    name: "Executive Study & Library",
    slug: "study-and-library",
    image: "https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=1200&q=85",
    description: "Solid timber writing desks, leather wingback library chairs, and carved book cabinets.",
    order: 5
  }
];

export const SEED_PRODUCTS: Product[] = [
  {
    "id": "prod-gdrive-1792132301329-1",
    "name": "Royal Navy Blue Velvet Chesterfield Tufted Platform Bed",
    "slug": "royal-navy-blue-velvet-chesterfield-tufted-platform-bed-if-7590",
    "productCode": "IF-7590",
    "category": "Bedroom Furniture",
    "subCategory": "King Size Beds",
    "spaces": [
      "Master Bedroom"
    ],
    "shortDescription": "This luxurious platform bed features a high-profile headboard and matching footboard upholstered in deep navy blue velvet with classic button tufting. The set includes a low-profile frame design, perfect for a modern contemporary bedroom aesthetic.",
    "longDescription": "This luxurious platform bed features a high-profile headboard and matching footboard upholstered in deep navy blue velvet with classic button tufting. The set includes a low-profile frame design, perfect for a modern contemporary bedroom aesthetic. Mastercrafted from solid seasoned timber with artisanal mortise-and-tenon joinery.",
    "material": "Hardwood",
    "finish": "Natural Satin Hand-Rubbed Wax",
    "dimensions": "Standard Showroom Specifications",
    "seatingOrSize": "Standard",
    "wood": "Hardwood",
    "upholstery": "Velvet",
    "leadTime": "3 to 4 Weeks",
    "madeIn": "Lahore, Pakistan",
    "images": [
      "/uploads/gdrive_181N8ibf_1792132295783_1.jpg"
    ],
    "tags": [
      "Solid Wood",
      "Handcrafted",
      "Bedroom Furniture",
      "King Size Beds"
    ],
    "isFeatured": true,
    "isPublished": true,
    "seoTitle": "Royal Navy Blue Velvet Chesterfield Tufted Platform Bed | Ideal Furniture Lahore",
    "seoDescription": "This luxurious platform bed features a high-profile headboard and matching footboard upholstered in deep navy blue velvet with classic button tufting. The set includes a low-profile frame design, perfect for a modern contemporary bedroom aesthetic.",
    "createdAt": "2026-10-16T06:31:41.329Z",
    "updatedAt": "2026-10-16T06:31:41.329Z"
  },
  {
    "id": "prod-gdrive-1792132299769-2",
    "name": "Royal Teal Tufted Velvet Wingback Bed with Gold Accents",
    "slug": "royal-teal-tufted-velvet-wingback-bed-with-gold-accents-if-3853",
    "productCode": "IF-3853",
    "category": "Bedroom Furniture",
    "subCategory": "King Size Beds",
    "spaces": [
      "Master Bedroom"
    ],
    "shortDescription": "This opulent king-size bed features a high-profile, deep-buttoned wingback headboard upholstered in premium teal velvet. Paired with a matching tufted bench and cylindrical gold metallic nightstands, it exudes a sophisticated and contemporary luxury aesthetic.",
    "longDescription": "This opulent king-size bed features a high-profile, deep-buttoned wingback headboard upholstered in premium teal velvet. Paired with a matching tufted bench and cylindrical gold metallic nightstands, it exudes a sophisticated and contemporary luxury aesthetic. Mastercrafted from solid seasoned timber with artisanal mortise-and-tenon joinery.",
    "material": "Hardwood",
    "finish": "Natural Satin Hand-Rubbed Wax",
    "dimensions": "Standard Showroom Specifications",
    "seatingOrSize": "Standard",
    "wood": "Hardwood",
    "upholstery": "Velvet",
    "leadTime": "3 to 4 Weeks",
    "madeIn": "Lahore, Pakistan",
    "images": [
      "/uploads/gdrive_1V70rUwg_1792132295784_2.jpg"
    ],
    "tags": [
      "Solid Wood",
      "Handcrafted",
      "Bedroom Furniture",
      "King Size Beds"
    ],
    "isFeatured": true,
    "isPublished": true,
    "seoTitle": "Royal Teal Tufted Velvet Wingback Bed with Gold Accents | Ideal Furniture Lahore",
    "seoDescription": "This opulent king-size bed features a high-profile, deep-buttoned wingback headboard upholstered in premium teal velvet. Paired with a matching tufted bench and cylindrical gold metallic nightstands, it exudes a sophisticated and contemporary luxury aesthetic.",
    "createdAt": "2026-10-16T06:31:39.769Z",
    "updatedAt": "2026-10-16T06:31:39.769Z"
  },
  {
    "id": "prod-gdrive-1792132307633-3",
    "name": "Royal Navy Velvet Tufted Platform Bed with Integrated Nightstands",
    "slug": "royal-navy-velvet-tufted-platform-bed-with-integrated-nightstands-if-6835",
    "productCode": "IF-6835",
    "category": "Bedroom Furniture",
    "subCategory": "King Size Beds",
    "spaces": [
      "Master Bedroom"
    ],
    "shortDescription": "This sophisticated king-size bed features luxurious navy blue velvet upholstery with intricate button-tufted detailing on both the headboard and the frame. Its contemporary design is complemented by minimalist, integrated light-oak bedside tables, creating a perfect balance of comfort and modern elegance.",
    "longDescription": "This sophisticated king-size bed features luxurious navy blue velvet upholstery with intricate button-tufted detailing on both the headboard and the frame. Its contemporary design is complemented by minimalist, integrated light-oak bedside tables, creating a perfect balance of comfort and modern elegance. Mastercrafted from solid seasoned timber with artisanal mortise-and-tenon joinery.",
    "material": "Hardwood",
    "finish": "Natural Satin Hand-Rubbed Wax",
    "dimensions": "Standard Showroom Specifications",
    "seatingOrSize": "Standard",
    "wood": "Hardwood",
    "upholstery": "Velvet",
    "leadTime": "3 to 4 Weeks",
    "madeIn": "Lahore, Pakistan",
    "images": [
      "/uploads/gdrive_1s1W2lt1_1792132295785_3.jpg"
    ],
    "tags": [
      "Solid Wood",
      "Handcrafted",
      "Bedroom Furniture",
      "King Size Beds"
    ],
    "isFeatured": true,
    "isPublished": true,
    "seoTitle": "Royal Navy Velvet Tufted Platform Bed with Integrated Nightstands | Ideal Furniture Lahore",
    "seoDescription": "This sophisticated king-size bed features luxurious navy blue velvet upholstery with intricate button-tufted detailing on both the headboard and the frame. Its contemporary design is complemented by minimalist, integrated light-oak bedside tables, creating a perfect balance of comfort and modern elegance.",
    "createdAt": "2026-10-16T06:31:47.633Z",
    "updatedAt": "2026-10-16T06:31:47.633Z"
  },
  {
    "id": "prod-gdrive-1792132302442-4",
    "name": "Royal Velvet Chesterfield Upholstered Platform Bed",
    "slug": "royal-velvet-chesterfield-upholstered-platform-bed-if-4603",
    "productCode": "IF-4603",
    "category": "Bedroom Furniture",
    "subCategory": "King Size Beds",
    "spaces": [
      "Master Bedroom"
    ],
    "shortDescription": "This luxurious king-size platform bed features deep button tufting and elegant velvet upholstery in a rich cobalt blue. The sophisticated aesthetic is complemented by a high, padded headboard and a matching low-profile footboard, adding a regal touch to any master suite.",
    "longDescription": "This luxurious king-size platform bed features deep button tufting and elegant velvet upholstery in a rich cobalt blue. The sophisticated aesthetic is complemented by a high, padded headboard and a matching low-profile footboard, adding a regal touch to any master suite. Mastercrafted from solid seasoned timber with artisanal mortise-and-tenon joinery.",
    "material": "Hardwood",
    "finish": "Natural Satin Hand-Rubbed Wax",
    "dimensions": "Standard Showroom Specifications",
    "seatingOrSize": "Standard",
    "wood": "Hardwood",
    "upholstery": "Velvet",
    "leadTime": "3 to 4 Weeks",
    "madeIn": "Lahore, Pakistan",
    "images": [
      "/uploads/gdrive_1CoOcvsH_1792132295786_4.jpg"
    ],
    "tags": [
      "Solid Wood",
      "Handcrafted",
      "Bedroom Furniture",
      "King Size Beds"
    ],
    "isFeatured": true,
    "isPublished": true,
    "seoTitle": "Royal Velvet Chesterfield Upholstered Platform Bed | Ideal Furniture Lahore",
    "seoDescription": "This luxurious king-size platform bed features deep button tufting and elegant velvet upholstery in a rich cobalt blue. The sophisticated aesthetic is complemented by a high, padded headboard and a matching low-profile footboard, adding a regal touch to any master suite.",
    "createdAt": "2026-10-16T06:31:42.442Z",
    "updatedAt": "2026-10-16T06:31:42.442Z"
  },
  {
    "id": "prod-gdrive-1792132313610-5",
    "name": "Royal Blue Velvet Tufted Chesterfield King Size Bed",
    "slug": "royal-blue-velvet-tufted-chesterfield-king-size-bed-if-8792",
    "productCode": "IF-8792",
    "category": "Bedroom Furniture",
    "subCategory": "King Size Beds",
    "spaces": [
      "Master Bedroom"
    ],
    "shortDescription": "This luxurious bed features a classic deep-buttoned Chesterfield design on both the towering headboard and the frame. Its vibrant royal blue velvet upholstery creates a sophisticated focal point for high-end master bedrooms.",
    "longDescription": "This luxurious bed features a classic deep-buttoned Chesterfield design on both the towering headboard and the frame. Its vibrant royal blue velvet upholstery creates a sophisticated focal point for high-end master bedrooms. Mastercrafted from solid seasoned timber with artisanal mortise-and-tenon joinery.",
    "material": "Hardwood",
    "finish": "Natural Satin Hand-Rubbed Wax",
    "dimensions": "Standard Showroom Specifications",
    "seatingOrSize": "Standard",
    "wood": "Hardwood",
    "upholstery": "Velvet",
    "leadTime": "3 to 4 Weeks",
    "madeIn": "Lahore, Pakistan",
    "images": [
      "/uploads/gdrive_1UedDL_4_1792132307633_5.jpg"
    ],
    "tags": [
      "Solid Wood",
      "Handcrafted",
      "Bedroom Furniture",
      "King Size Beds"
    ],
    "isFeatured": true,
    "isPublished": true,
    "seoTitle": "Royal Blue Velvet Tufted Chesterfield King Size Bed | Ideal Furniture Lahore",
    "seoDescription": "This luxurious bed features a classic deep-buttoned Chesterfield design on both the towering headboard and the frame. Its vibrant royal blue velvet upholstery creates a sophisticated focal point for high-end master bedrooms.",
    "createdAt": "2026-10-16T06:31:53.610Z",
    "updatedAt": "2026-10-16T06:31:53.610Z"
  },
  {
    "id": "prod-gdrive-1792132310375-6",
    "name": "Minimalist Cream Bouclé Upholstered Bed with Curved Headboard",
    "slug": "minimalist-cream-boucl-upholstered-bed-with-curved-headboard-if-5226",
    "productCode": "IF-5226",
    "category": "Bedroom Furniture",
    "subCategory": "King Size Bed",
    "spaces": [
      "Master Bedroom"
    ],
    "shortDescription": "This luxurious platform bed features a plush, cloud-like aesthetic with a soft cream bouclé upholstery and a gently curved, wrap-around headboard design. Its low-profile frame offers a serene, modern silhouette that anchors the bedroom in sophisticated comfort.",
    "longDescription": "This luxurious platform bed features a plush, cloud-like aesthetic with a soft cream bouclé upholstery and a gently curved, wrap-around headboard design. Its low-profile frame offers a serene, modern silhouette that anchors the bedroom in sophisticated comfort. Mastercrafted from solid seasoned timber with artisanal mortise-and-tenon joinery.",
    "material": "Hardwood frame",
    "finish": "Natural Satin Hand-Rubbed Wax",
    "dimensions": "Standard Showroom Specifications",
    "seatingOrSize": "Standard",
    "wood": "Hardwood frame",
    "upholstery": "Bouclé",
    "leadTime": "3 to 4 Weeks",
    "madeIn": "Lahore, Pakistan",
    "images": [
      "/uploads/gdrive_1EkL7yWr_1792132307634_6.jpg"
    ],
    "tags": [
      "Solid Wood",
      "Handcrafted",
      "Bedroom Furniture",
      "King Size Bed"
    ],
    "isFeatured": true,
    "isPublished": true,
    "seoTitle": "Minimalist Cream Bouclé Upholstered Bed with Curved Headboard | Ideal Furniture Lahore",
    "seoDescription": "This luxurious platform bed features a plush, cloud-like aesthetic with a soft cream bouclé upholstery and a gently curved, wrap-around headboard design. Its low-profile frame offers a serene, modern silhouette that anchors the bedroom in sophisticated comfort.",
    "createdAt": "2026-10-16T06:31:50.375Z",
    "updatedAt": "2026-10-16T06:31:50.375Z"
  },
  {
    "id": "prod-gdrive-1792132314283-7",
    "name": "Opulent Neoclassical Butterfly Accent TV Console",
    "slug": "opulent-neoclassical-butterfly-accent-tv-console-if-7541",
    "productCode": "IF-7541",
    "category": "Living Room Furniture",
    "subCategory": "TV Units & Media Consoles",
    "spaces": [
      "Living Room Suites"
    ],
    "shortDescription": "This exquisite, wall-mounted media console features intricate floral relief carvings and a polished ivory finish that perfectly complements the ornate butterfly-themed marble backdrop. Its sophisticated design integrates seamless storage drawers with hidden under-lighting to create a regal, luminous aesthetic for a high-end living space.",
    "longDescription": "This exquisite, wall-mounted media console features intricate floral relief carvings and a polished ivory finish that perfectly complements the ornate butterfly-themed marble backdrop. Its sophisticated design integrates seamless storage drawers with hidden under-lighting to create a regal, luminous aesthetic for a high-end living space. Mastercrafted from solid seasoned timber with artisanal mortise-and-tenon joinery.",
    "material": "Hardwood",
    "finish": "Natural Satin Hand-Rubbed Wax",
    "dimensions": "Standard Showroom Specifications",
    "seatingOrSize": "Standard",
    "wood": "Hardwood",
    "upholstery": "N/A",
    "leadTime": "3 to 4 Weeks",
    "madeIn": "Lahore, Pakistan",
    "images": [
      "/uploads/gdrive_1kG5wIbq_1792132307634_7.jpg"
    ],
    "tags": [
      "Solid Wood",
      "Handcrafted",
      "Living Room Furniture",
      "TV Units & Media Consoles"
    ],
    "isFeatured": false,
    "isPublished": true,
    "seoTitle": "Opulent Neoclassical Butterfly Accent TV Console | Ideal Furniture Lahore",
    "seoDescription": "This exquisite, wall-mounted media console features intricate floral relief carvings and a polished ivory finish that perfectly complements the ornate butterfly-themed marble backdrop. Its sophisticated design integrates seamless storage drawers with hidden under-lighting to create a regal, luminous aesthetic for a high-end living space.",
    "createdAt": "2026-10-16T06:31:54.283Z",
    "updatedAt": "2026-10-16T06:31:54.283Z"
  },
  {
    "id": "prod-gdrive-1792132311650-8",
    "name": "Royal Geometric Velvet Upholstered King Bed with Nightstands",
    "slug": "royal-geometric-velvet-upholstered-king-bed-with-nightstands-if-7274",
    "productCode": "IF-7274",
    "category": "Bedroom Furniture",
    "subCategory": "King Size Bed and Nightstands",
    "spaces": [
      "Master Bedroom"
    ],
    "shortDescription": "This exquisite bedroom set features a grand king-size bed with a floor-to-ceiling diamond-tufted velvet headboard accented with metallic gold inlay. It is paired with minimalist modern nightstands and a complementary upholstered bed frame, exuding high-end opulence.",
    "longDescription": "This exquisite bedroom set features a grand king-size bed with a floor-to-ceiling diamond-tufted velvet headboard accented with metallic gold inlay. It is paired with minimalist modern nightstands and a complementary upholstered bed frame, exuding high-end opulence. Mastercrafted from solid seasoned timber with artisanal mortise-and-tenon joinery.",
    "material": "Hardwood",
    "finish": "Natural Satin Hand-Rubbed Wax",
    "dimensions": "Standard Showroom Specifications",
    "seatingOrSize": "Standard",
    "wood": "Hardwood",
    "upholstery": "Velvet",
    "leadTime": "3 to 4 Weeks",
    "madeIn": "Lahore, Pakistan",
    "images": [
      "/uploads/gdrive_1vXbTgyX_1792132307647_8.jpg"
    ],
    "tags": [
      "Solid Wood",
      "Handcrafted",
      "Bedroom Furniture",
      "King Size Bed and Nightstands"
    ],
    "isFeatured": false,
    "isPublished": true,
    "seoTitle": "Royal Geometric Velvet Upholstered King Bed with Nightstands | Ideal Furniture Lahore",
    "seoDescription": "This exquisite bedroom set features a grand king-size bed with a floor-to-ceiling diamond-tufted velvet headboard accented with metallic gold inlay. It is paired with minimalist modern nightstands and a complementary upholstered bed frame, exuding high-end opulence.",
    "createdAt": "2026-10-16T06:31:51.650Z",
    "updatedAt": "2026-10-16T06:31:51.650Z"
  },
  {
    "id": "prod-gdrive-1792132317570-9",
    "name": "Midnight Velvet Channel-Tufted King Bed and Wingback Chairs Set",
    "slug": "midnight-velvet-channel-tufted-king-bed-and-wingback-chairs-set-if-8894",
    "productCode": "IF-8894",
    "category": "Bedroom Furniture",
    "subCategory": "King Size Bed and Accent Chairs",
    "spaces": [
      "Master Bedroom"
    ],
    "shortDescription": "This luxurious bedroom ensemble features a floor-to-ceiling channel-tufted velvet headboard in deep charcoal, paired with matching curved wingback accent chairs. The sophisticated aesthetic is completed by mirrored bedside tables and textured layering, embodying a high-end contemporary design.",
    "longDescription": "This luxurious bedroom ensemble features a floor-to-ceiling channel-tufted velvet headboard in deep charcoal, paired with matching curved wingback accent chairs. The sophisticated aesthetic is completed by mirrored bedside tables and textured layering, embodying a high-end contemporary design. Mastercrafted from solid seasoned timber with artisanal mortise-and-tenon joinery.",
    "material": "Hardwood",
    "finish": "Natural Satin Hand-Rubbed Wax",
    "dimensions": "Standard Showroom Specifications",
    "seatingOrSize": "Standard",
    "wood": "Hardwood",
    "upholstery": "Velvet",
    "leadTime": "3 to 4 Weeks",
    "madeIn": "Lahore, Pakistan",
    "images": [
      "/uploads/gdrive_1moADqSz_1792132314283_9.jpg"
    ],
    "tags": [
      "Solid Wood",
      "Handcrafted",
      "Bedroom Furniture",
      "King Size Bed and Accent Chairs"
    ],
    "isFeatured": false,
    "isPublished": true,
    "seoTitle": "Midnight Velvet Channel-Tufted King Bed and Wingback Chairs Set | Ideal Furniture Lahore",
    "seoDescription": "This luxurious bedroom ensemble features a floor-to-ceiling channel-tufted velvet headboard in deep charcoal, paired with matching curved wingback accent chairs. The sophisticated aesthetic is completed by mirrored bedside tables and textured layering, embodying a high-end contemporary design.",
    "createdAt": "2026-10-16T06:31:57.570Z",
    "updatedAt": "2026-10-16T06:31:57.570Z"
  },
  {
    "id": "prod-gdrive-1792132320793-10",
    "name": "Midnight Velvet Channel-Tufted King Bed with Mirrored Nightstands",
    "slug": "midnight-velvet-channel-tufted-king-bed-with-mirrored-nightstands-if-8988",
    "productCode": "IF-8988",
    "category": "Bedroom Furniture",
    "subCategory": "King Size Beds",
    "spaces": [
      "Master Bedroom"
    ],
    "shortDescription": "This luxurious bedroom set features a commanding charcoal velvet headboard with deep vertical channel tufting for a sophisticated, modern aesthetic. The arrangement is complemented by geometric mirrored nightstands and accent chairs that enhance the opulent, monochromatic design palette.",
    "longDescription": "This luxurious bedroom set features a commanding charcoal velvet headboard with deep vertical channel tufting for a sophisticated, modern aesthetic. The arrangement is complemented by geometric mirrored nightstands and accent chairs that enhance the opulent, monochromatic design palette. Mastercrafted from solid seasoned timber with artisanal mortise-and-tenon joinery.",
    "material": "Hardwood",
    "finish": "Natural Satin Hand-Rubbed Wax",
    "dimensions": "Standard Showroom Specifications",
    "seatingOrSize": "Standard",
    "wood": "Hardwood",
    "upholstery": "Velvet",
    "leadTime": "3 to 4 Weeks",
    "madeIn": "Lahore, Pakistan",
    "images": [
      "/uploads/gdrive_19O2XmA7_1792132314284_10.jpg"
    ],
    "tags": [
      "Solid Wood",
      "Handcrafted",
      "Bedroom Furniture",
      "King Size Beds"
    ],
    "isFeatured": false,
    "isPublished": true,
    "seoTitle": "Midnight Velvet Channel-Tufted King Bed with Mirrored Nightstands | Ideal Furniture Lahore",
    "seoDescription": "This luxurious bedroom set features a commanding charcoal velvet headboard with deep vertical channel tufting for a sophisticated, modern aesthetic. The arrangement is complemented by geometric mirrored nightstands and accent chairs that enhance the opulent, monochromatic design palette.",
    "createdAt": "2026-10-16T06:32:00.793Z",
    "updatedAt": "2026-10-16T06:32:00.793Z"
  },
  {
    "id": "prod-gdrive-1792132317562-11",
    "name": "Art Deco Geometric Velvet Upholstered King Size Bed",
    "slug": "art-deco-geometric-velvet-upholstered-king-size-bed-if-6843",
    "productCode": "IF-6843",
    "category": "Bedroom Furniture",
    "subCategory": "King Size Bed",
    "spaces": [
      "Master Bedroom"
    ],
    "shortDescription": "This sophisticated king-size bed features a dramatic, floor-to-ceiling headboard with intricate geometric fan-pattern stitching. The velvet upholstery in a deep charcoal hue creates a striking visual centerpiece, complemented by minimalist side tables and atmospheric lighting.",
    "longDescription": "This sophisticated king-size bed features a dramatic, floor-to-ceiling headboard with intricate geometric fan-pattern stitching. The velvet upholstery in a deep charcoal hue creates a striking visual centerpiece, complemented by minimalist side tables and atmospheric lighting. Mastercrafted from solid seasoned timber with artisanal mortise-and-tenon joinery.",
    "material": "Hardwood",
    "finish": "Natural Satin Hand-Rubbed Wax",
    "dimensions": "Standard Showroom Specifications",
    "seatingOrSize": "Standard",
    "wood": "Hardwood",
    "upholstery": "Velvet",
    "leadTime": "3 to 4 Weeks",
    "madeIn": "Lahore, Pakistan",
    "images": [
      "/uploads/gdrive_1VpGztr0_1792132314285_11.jpg"
    ],
    "tags": [
      "Solid Wood",
      "Handcrafted",
      "Bedroom Furniture",
      "King Size Bed"
    ],
    "isFeatured": false,
    "isPublished": true,
    "seoTitle": "Art Deco Geometric Velvet Upholstered King Size Bed | Ideal Furniture Lahore",
    "seoDescription": "This sophisticated king-size bed features a dramatic, floor-to-ceiling headboard with intricate geometric fan-pattern stitching. The velvet upholstery in a deep charcoal hue creates a striking visual centerpiece, complemented by minimalist side tables and atmospheric lighting.",
    "createdAt": "2026-10-16T06:31:57.562Z",
    "updatedAt": "2026-10-16T06:31:57.562Z"
  },
  {
    "id": "prod-gdrive-1792132317880-12",
    "name": "Art Deco Geometric Velvet Upholstered King Size Bed",
    "slug": "art-deco-geometric-velvet-upholstered-king-size-bed-if-6768",
    "productCode": "IF-6768",
    "category": "Bedroom Furniture",
    "subCategory": "King Size Bed",
    "spaces": [
      "Master Bedroom"
    ],
    "shortDescription": "A sophisticated king-size bed featuring a high, geometric paneled velvet headboard with distinctive sunburst-inspired stitching. The ensemble is completed with matching minimalist nightstands and a luxurious platform base, creating a modern, opulent sanctuary.",
    "longDescription": "A sophisticated king-size bed featuring a high, geometric paneled velvet headboard with distinctive sunburst-inspired stitching. The ensemble is completed with matching minimalist nightstands and a luxurious platform base, creating a modern, opulent sanctuary. Mastercrafted from solid seasoned timber with artisanal mortise-and-tenon joinery.",
    "material": "Hardwood",
    "finish": "Natural Satin Hand-Rubbed Wax",
    "dimensions": "Standard Showroom Specifications",
    "seatingOrSize": "Standard",
    "wood": "Hardwood",
    "upholstery": "Velvet",
    "leadTime": "3 to 4 Weeks",
    "madeIn": "Lahore, Pakistan",
    "images": [
      "/uploads/gdrive_108rXooX_1792132314287_12.jpg"
    ],
    "tags": [
      "Solid Wood",
      "Handcrafted",
      "Bedroom Furniture",
      "King Size Bed"
    ],
    "isFeatured": false,
    "isPublished": true,
    "seoTitle": "Art Deco Geometric Velvet Upholstered King Size Bed | Ideal Furniture Lahore",
    "seoDescription": "A sophisticated king-size bed featuring a high, geometric paneled velvet headboard with distinctive sunburst-inspired stitching. The ensemble is completed with matching minimalist nightstands and a luxurious platform base, creating a modern, opulent sanctuary.",
    "createdAt": "2026-10-16T06:31:57.880Z",
    "updatedAt": "2026-10-16T06:31:57.880Z"
  },
  {
    "id": "prod-gdrive-1792132323182-13",
    "name": "Sky-Blue Velvet Upholstered Bed with Italian Marble Floating Nightstand",
    "slug": "sky-blue-velvet-upholstered-bed-with-italian-marble-floating-nightstand-if-7100",
    "productCode": "IF-7100",
    "category": "Bedroom Furniture",
    "subCategory": "King Size Bed with Integrated Nightstand",
    "spaces": [
      "Master Bedroom"
    ],
    "shortDescription": "This bespoke luxury bed features a plush sky-blue velvet headboard accented with sleek metallic framing and an integrated floating nightstand. The minimalist design incorporates a premium marble top surface, seamlessly combining modern aesthetic with high-end functionality.",
    "longDescription": "This bespoke luxury bed features a plush sky-blue velvet headboard accented with sleek metallic framing and an integrated floating nightstand. The minimalist design incorporates a premium marble top surface, seamlessly combining modern aesthetic with high-end functionality. Mastercrafted from solid seasoned timber with artisanal mortise-and-tenon joinery.",
    "material": "Hardwood",
    "finish": "Natural Satin Hand-Rubbed Wax",
    "dimensions": "Standard Showroom Specifications",
    "seatingOrSize": "Standard",
    "wood": "Hardwood",
    "upholstery": "Velvet",
    "leadTime": "3 to 4 Weeks",
    "madeIn": "Lahore, Pakistan",
    "images": [
      "/uploads/gdrive_1Kd_-drQ_1792132320793_13.jpg"
    ],
    "tags": [
      "Solid Wood",
      "Handcrafted",
      "Bedroom Furniture",
      "King Size Bed with Integrated Nightstand"
    ],
    "isFeatured": false,
    "isPublished": true,
    "seoTitle": "Sky-Blue Velvet Upholstered Bed with Italian Marble Floating Nightstand | Ideal Furniture Lahore",
    "seoDescription": "This bespoke luxury bed features a plush sky-blue velvet headboard accented with sleek metallic framing and an integrated floating nightstand. The minimalist design incorporates a premium marble top surface, seamlessly combining modern aesthetic with high-end functionality.",
    "createdAt": "2026-10-16T06:32:03.182Z",
    "updatedAt": "2026-10-16T06:32:03.182Z"
  },
  {
    "id": "prod-gdrive-1792132323181-14",
    "name": "Zen-Inspired Ebony Oak Platform Bed",
    "slug": "zen-inspired-ebony-oak-platform-bed-if-9945",
    "productCode": "IF-9945",
    "category": "Bedroom Furniture",
    "subCategory": "Platform Bed",
    "spaces": [
      "Master Bedroom"
    ],
    "shortDescription": "This minimalist platform bed features a low-profile dark wooden frame, perfectly complementing the rugged, artistic mountain-scape wall feature. The design prioritizes a grounded, serene aesthetic, paired with deep charcoal bedding to maintain a sophisticated monochromatic luxury environment.",
    "longDescription": "This minimalist platform bed features a low-profile dark wooden frame, perfectly complementing the rugged, artistic mountain-scape wall feature. The design prioritizes a grounded, serene aesthetic, paired with deep charcoal bedding to maintain a sophisticated monochromatic luxury environment. Mastercrafted from solid seasoned timber with artisanal mortise-and-tenon joinery.",
    "material": "Ebony Stained Hardwood",
    "finish": "Natural Satin Hand-Rubbed Wax",
    "dimensions": "Standard Showroom Specifications",
    "seatingOrSize": "Standard",
    "wood": "Ebony Stained Hardwood",
    "upholstery": "Cotton/Linen Blend",
    "leadTime": "3 to 4 Weeks",
    "madeIn": "Lahore, Pakistan",
    "images": [
      "/uploads/gdrive_1Eeh0HCI_1792132320793_14.jpg"
    ],
    "tags": [
      "Solid Wood",
      "Handcrafted",
      "Bedroom Furniture",
      "Platform Bed"
    ],
    "isFeatured": false,
    "isPublished": true,
    "seoTitle": "Zen-Inspired Ebony Oak Platform Bed | Ideal Furniture Lahore",
    "seoDescription": "This minimalist platform bed features a low-profile dark wooden frame, perfectly complementing the rugged, artistic mountain-scape wall feature. The design prioritizes a grounded, serene aesthetic, paired with deep charcoal bedding to maintain a sophisticated monochromatic luxury environment.",
    "createdAt": "2026-10-16T06:32:03.181Z",
    "updatedAt": "2026-10-16T06:32:03.181Z"
  },
  {
    "id": "prod-gdrive-1792132323806-15",
    "name": "Serenity Tufted Upholstered King Size Bed with Matching Bench",
    "slug": "serenity-tufted-upholstered-king-size-bed-with-matching-bench-if-8126",
    "productCode": "IF-8126",
    "category": "Bedroom Furniture",
    "subCategory": "King Size Bed",
    "spaces": [
      "Master Bedroom"
    ],
    "shortDescription": "This elegant bedroom set features a sophisticated tufted beige linen headboard paired with a plush, matching white tufted bench with acrylic legs. The ensemble is designed for comfort and luxury, perfectly complemented by a soft, textured blue-and-white color palette.",
    "longDescription": "This elegant bedroom set features a sophisticated tufted beige linen headboard paired with a plush, matching white tufted bench with acrylic legs. The ensemble is designed for comfort and luxury, perfectly complemented by a soft, textured blue-and-white color palette. Mastercrafted from solid seasoned timber with artisanal mortise-and-tenon joinery.",
    "material": "Hardwood",
    "finish": "Natural Satin Hand-Rubbed Wax",
    "dimensions": "Standard Showroom Specifications",
    "seatingOrSize": "Standard",
    "wood": "Hardwood",
    "upholstery": "Linen",
    "leadTime": "3 to 4 Weeks",
    "madeIn": "Lahore, Pakistan",
    "images": [
      "/uploads/gdrive_1pHDh-ao_1792132320794_15.jpg"
    ],
    "tags": [
      "Solid Wood",
      "Handcrafted",
      "Bedroom Furniture",
      "King Size Bed"
    ],
    "isFeatured": false,
    "isPublished": true,
    "seoTitle": "Serenity Tufted Upholstered King Size Bed with Matching Bench | Ideal Furniture Lahore",
    "seoDescription": "This elegant bedroom set features a sophisticated tufted beige linen headboard paired with a plush, matching white tufted bench with acrylic legs. The ensemble is designed for comfort and luxury, perfectly complemented by a soft, textured blue-and-white color palette.",
    "createdAt": "2026-10-16T06:32:03.806Z",
    "updatedAt": "2026-10-16T06:32:03.806Z"
  },
  {
    "id": "prod-gdrive-1792132324721-16",
    "name": "Royal Navy Velvet Wingback King Size Bed Set",
    "slug": "royal-navy-velvet-wingback-king-size-bed-set-if-7420",
    "productCode": "IF-7420",
    "category": "Bedroom Furniture",
    "subCategory": "King Size Beds",
    "spaces": [
      "Master Bedroom"
    ],
    "shortDescription": "This luxurious bedroom set features a grand navy blue velvet upholstered wingback headboard with sophisticated channel tufting. It is complemented by a matching button-tufted velvet bench and elegant two-tone modern nightstands, creating a perfect balance of comfort and refined aesthetics.",
    "longDescription": "This luxurious bedroom set features a grand navy blue velvet upholstered wingback headboard with sophisticated channel tufting. It is complemented by a matching button-tufted velvet bench and elegant two-tone modern nightstands, creating a perfect balance of comfort and refined aesthetics. Mastercrafted from solid seasoned timber with artisanal mortise-and-tenon joinery.",
    "material": "Hardwood",
    "finish": "Natural Satin Hand-Rubbed Wax",
    "dimensions": "Standard Showroom Specifications",
    "seatingOrSize": "Standard",
    "wood": "Hardwood",
    "upholstery": "Velvet",
    "leadTime": "3 to 4 Weeks",
    "madeIn": "Lahore, Pakistan",
    "images": [
      "/uploads/gdrive_1_409g-3_1792132320795_16.jpg"
    ],
    "tags": [
      "Solid Wood",
      "Handcrafted",
      "Bedroom Furniture",
      "King Size Beds"
    ],
    "isFeatured": false,
    "isPublished": true,
    "seoTitle": "Royal Navy Velvet Wingback King Size Bed Set | Ideal Furniture Lahore",
    "seoDescription": "This luxurious bedroom set features a grand navy blue velvet upholstered wingback headboard with sophisticated channel tufting. It is complemented by a matching button-tufted velvet bench and elegant two-tone modern nightstands, creating a perfect balance of comfort and refined aesthetics.",
    "createdAt": "2026-10-16T06:32:04.721Z",
    "updatedAt": "2026-10-16T06:32:04.721Z"
  },
  {
    "id": "prod-gdrive-1792132367466-23",
    "name": "Royal Carved Walnut Accent Armchair with Tufted Beige Upholstery",
    "slug": "royal-carved-walnut-accent-armchair-with-tufted-beige-upholstery-if-8223",
    "productCode": "IF-8223",
    "category": "Living Room Furniture",
    "subCategory": "Accent Chair",
    "spaces": [
      "Living Room Suites"
    ],
    "shortDescription": "This exquisite armchair features intricate traditional hand-carved solid walnut accents on the armrests and crown, providing a timeless aesthetic. The beige upholstered backrest showcases a premium diamond-tufted design, blending classical craftsmanship with superior comfort for an elegant living room setting.",
    "longDescription": "This exquisite armchair features intricate traditional hand-carved solid walnut accents on the armrests and crown, providing a timeless aesthetic. The beige upholstered backrest showcases a premium diamond-tufted design, blending classical craftsmanship with superior comfort for an elegant living room setting. Mastercrafted from solid seasoned timber with artisanal mortise-and-tenon joinery.",
    "material": "Walnut",
    "finish": "Natural Satin Hand-Rubbed Wax",
    "dimensions": "Standard Showroom Specifications",
    "seatingOrSize": "Standard",
    "wood": "Walnut",
    "upholstery": "Leatherette",
    "leadTime": "3 to 4 Weeks",
    "madeIn": "Lahore, Pakistan",
    "images": [
      "/uploads/gdrive_1td1d9x0_1792132337075_23.jpg"
    ],
    "tags": [
      "Solid Wood",
      "Handcrafted",
      "Living Room Furniture",
      "Accent Chair"
    ],
    "isFeatured": false,
    "isPublished": true,
    "seoTitle": "Royal Carved Walnut Accent Armchair with Tufted Beige Upholstery | Ideal Furniture Lahore",
    "seoDescription": "This exquisite armchair features intricate traditional hand-carved solid walnut accents on the armrests and crown, providing a timeless aesthetic. The beige upholstered backrest showcases a premium diamond-tufted design, blending classical craftsmanship with superior comfort for an elegant living room setting.",
    "createdAt": "2026-10-16T06:32:47.466Z",
    "updatedAt": "2026-10-16T06:32:47.466Z"
  },
  {
    "id": "prod-gdrive-1792132390948-25",
    "name": "Royal Navy Velvet Wingback Upholstered Platform Bed",
    "slug": "royal-navy-velvet-wingback-upholstered-platform-bed-if-6659",
    "productCode": "IF-6659",
    "category": "Bedroom Furniture",
    "subCategory": "King Size Beds",
    "spaces": [
      "Master Bedroom"
    ],
    "shortDescription": "This sophisticated platform bed features a high-profile wingback headboard wrapped in premium deep navy velvet fabric. Its clean, linear tufted design and low-profile frame offer a timeless modern aesthetic perfect for a luxury bedroom suite.",
    "longDescription": "This sophisticated platform bed features a high-profile wingback headboard wrapped in premium deep navy velvet fabric. Its clean, linear tufted design and low-profile frame offer a timeless modern aesthetic perfect for a luxury bedroom suite. Mastercrafted from solid seasoned timber with artisanal mortise-and-tenon joinery.",
    "material": "Hardwood",
    "finish": "Natural Satin Hand-Rubbed Wax",
    "dimensions": "Standard Showroom Specifications",
    "seatingOrSize": "Standard",
    "wood": "Hardwood",
    "upholstery": "Velvet",
    "leadTime": "3 to 4 Weeks",
    "madeIn": "Lahore, Pakistan",
    "images": [
      "/uploads/gdrive_1mgP6SIv_1792132367466_25.jpg"
    ],
    "tags": [
      "Solid Wood",
      "Handcrafted",
      "Bedroom Furniture",
      "King Size Beds"
    ],
    "isFeatured": false,
    "isPublished": true,
    "seoTitle": "Royal Navy Velvet Wingback Upholstered Platform Bed | Ideal Furniture Lahore",
    "seoDescription": "This sophisticated platform bed features a high-profile wingback headboard wrapped in premium deep navy velvet fabric. Its clean, linear tufted design and low-profile frame offer a timeless modern aesthetic perfect for a luxury bedroom suite.",
    "createdAt": "2026-10-16T06:33:10.948Z",
    "updatedAt": "2026-10-16T06:33:10.948Z"
  },
  {
    "id": "prod-gdrive-1792132391219-27",
    "name": "Aura Organic Wave LED Full-Length Floor Mirror",
    "slug": "aura-organic-wave-led-full-length-floor-mirror-if-3772",
    "productCode": "IF-3772",
    "category": "Bedroom Furniture",
    "subCategory": "Dressing Mirror",
    "spaces": [
      "Master Bedroom"
    ],
    "shortDescription": "This exquisite full-length floor mirror features a unique organic wave silhouette accentuated by a warm, integrated LED perimeter glow. Its sleek, contemporary design adds a sophisticated focal point to any modern bedroom or dressing area.",
    "longDescription": "This exquisite full-length floor mirror features a unique organic wave silhouette accentuated by a warm, integrated LED perimeter glow. Its sleek, contemporary design adds a sophisticated focal point to any modern bedroom or dressing area. Mastercrafted from solid seasoned timber with artisanal mortise-and-tenon joinery.",
    "material": "None",
    "finish": "Natural Satin Hand-Rubbed Wax",
    "dimensions": "Standard Showroom Specifications",
    "seatingOrSize": "Standard",
    "wood": "None",
    "upholstery": "None",
    "leadTime": "3 to 4 Weeks",
    "madeIn": "Lahore, Pakistan",
    "images": [
      "/uploads/gdrive_13PsBLSC_1792132367467_27.jpg"
    ],
    "tags": [
      "Solid Wood",
      "Handcrafted",
      "Bedroom Furniture",
      "Dressing Mirror"
    ],
    "isFeatured": false,
    "isPublished": true,
    "seoTitle": "Aura Organic Wave LED Full-Length Floor Mirror | Ideal Furniture Lahore",
    "seoDescription": "This exquisite full-length floor mirror features a unique organic wave silhouette accentuated by a warm, integrated LED perimeter glow. Its sleek, contemporary design adds a sophisticated focal point to any modern bedroom or dressing area.",
    "createdAt": "2026-10-16T06:33:11.219Z",
    "updatedAt": "2026-10-16T06:33:11.219Z"
  },
  {
    "id": "prod-gdrive-1792132392193-28",
    "name": "Modern Marble-Finish Wardrobe with Integrated Vanity",
    "slug": "modern-marble-finish-wardrobe-with-integrated-vanity-if-9102",
    "productCode": "IF-9102",
    "category": "Bedroom Furniture",
    "subCategory": "Wardrobe and Vanity Unit",
    "spaces": [
      "Master Bedroom"
    ],
    "shortDescription": "This sophisticated wardrobe features a premium white marble-effect finish with striking gold veining and luxury brass hardware. It includes an integrated backlit vanity mirror and custom display shelving with ambient LED accent lighting.",
    "longDescription": "This sophisticated wardrobe features a premium white marble-effect finish with striking gold veining and luxury brass hardware. It includes an integrated backlit vanity mirror and custom display shelving with ambient LED accent lighting. Mastercrafted from solid seasoned timber with artisanal mortise-and-tenon joinery.",
    "material": "Engineered Wood with High-Pressure Laminate",
    "finish": "Natural Satin Hand-Rubbed Wax",
    "dimensions": "Standard Showroom Specifications",
    "seatingOrSize": "Standard",
    "wood": "Engineered Wood with High-Pressure Laminate",
    "upholstery": "Velvet (Stool)",
    "leadTime": "3 to 4 Weeks",
    "madeIn": "Lahore, Pakistan",
    "images": [
      "/uploads/gdrive_1yEI6Cj4_1792132367471_28.jpg"
    ],
    "tags": [
      "Solid Wood",
      "Handcrafted",
      "Bedroom Furniture",
      "Wardrobe and Vanity Unit"
    ],
    "isFeatured": false,
    "isPublished": true,
    "seoTitle": "Modern Marble-Finish Wardrobe with Integrated Vanity | Ideal Furniture Lahore",
    "seoDescription": "This sophisticated wardrobe features a premium white marble-effect finish with striking gold veining and luxury brass hardware. It includes an integrated backlit vanity mirror and custom display shelving with ambient LED accent lighting.",
    "createdAt": "2026-10-16T06:33:12.193Z",
    "updatedAt": "2026-10-16T06:33:12.193Z"
  },
  {
    "id": "prod-gdrive-1792132402188-29",
    "name": "Modern Sage & Marble Luxury Custom Wardrobe",
    "slug": "modern-sage-marble-luxury-custom-wardrobe-if-2839",
    "productCode": "IF-2839",
    "category": "Bedroom Furniture",
    "subCategory": "Wardrobes",
    "spaces": [
      "Master Bedroom"
    ],
    "shortDescription": "This bespoke floor-to-ceiling wardrobe features a sophisticated blend of sage green vertical fluted panels and premium white marble-effect cladding. Illuminated by integrated curved LED strip lighting, the center section offers glass-front display cabinetry with gold hardware, creating a high-end boutique aesthetic.",
    "longDescription": "This bespoke floor-to-ceiling wardrobe features a sophisticated blend of sage green vertical fluted panels and premium white marble-effect cladding. Illuminated by integrated curved LED strip lighting, the center section offers glass-front display cabinetry with gold hardware, creating a high-end boutique aesthetic. Mastercrafted from solid seasoned timber with artisanal mortise-and-tenon joinery.",
    "material": "High-Density Engineered Wood",
    "finish": "Natural Satin Hand-Rubbed Wax",
    "dimensions": "Standard Showroom Specifications",
    "seatingOrSize": "Standard",
    "wood": "High-Density Engineered Wood",
    "upholstery": "N/A",
    "leadTime": "3 to 4 Weeks",
    "madeIn": "Lahore, Pakistan",
    "images": [
      "/uploads/gdrive_1nrwKZhR_1792132392193_29.jpg"
    ],
    "tags": [
      "Solid Wood",
      "Handcrafted",
      "Bedroom Furniture",
      "Wardrobes"
    ],
    "isFeatured": false,
    "isPublished": true,
    "seoTitle": "Modern Sage & Marble Luxury Custom Wardrobe | Ideal Furniture Lahore",
    "seoDescription": "This bespoke floor-to-ceiling wardrobe features a sophisticated blend of sage green vertical fluted panels and premium white marble-effect cladding. Illuminated by integrated curved LED strip lighting, the center section offers glass-front display cabinetry with gold hardware, creating a high-end boutique aesthetic.",
    "createdAt": "2026-10-16T06:33:22.188Z",
    "updatedAt": "2026-10-16T06:33:22.188Z"
  },
  {
    "id": "prod-gdrive-1792132397949-30",
    "name": "Minimalist Walnut Floating Platform Bed with Integrated Ambient Lighting",
    "slug": "minimalist-walnut-floating-platform-bed-with-integrated-ambient-lighting-if-4531",
    "productCode": "IF-4531",
    "category": "Bedroom Furniture",
    "subCategory": "King Size Bed",
    "spaces": [
      "Master Bedroom"
    ],
    "shortDescription": "This sophisticated bedroom centrepiece features a minimalist floating platform design crafted from premium walnut wood. The bed is paired with an expansive wall-mounted dark marble headboard and integrated warm LED lighting to create a luxurious, modern sanctuary.",
    "longDescription": "This sophisticated bedroom centrepiece features a minimalist floating platform design crafted from premium walnut wood. The bed is paired with an expansive wall-mounted dark marble headboard and integrated warm LED lighting to create a luxurious, modern sanctuary. Mastercrafted from solid seasoned timber with artisanal mortise-and-tenon joinery.",
    "material": "Walnut",
    "finish": "Natural Satin Hand-Rubbed Wax",
    "dimensions": "Standard Showroom Specifications",
    "seatingOrSize": "Standard",
    "wood": "Walnut",
    "upholstery": "None",
    "leadTime": "3 to 4 Weeks",
    "madeIn": "Lahore, Pakistan",
    "images": [
      "/uploads/gdrive_1Er0R_3y_1792132392197_30.jpg"
    ],
    "tags": [
      "Solid Wood",
      "Handcrafted",
      "Bedroom Furniture",
      "King Size Bed"
    ],
    "isFeatured": false,
    "isPublished": true,
    "seoTitle": "Minimalist Walnut Floating Platform Bed with Integrated Ambient Lighting | Ideal Furniture Lahore",
    "seoDescription": "This sophisticated bedroom centrepiece features a minimalist floating platform design crafted from premium walnut wood. The bed is paired with an expansive wall-mounted dark marble headboard and integrated warm LED lighting to create a luxurious, modern sanctuary.",
    "createdAt": "2026-10-16T06:33:17.949Z",
    "updatedAt": "2026-10-16T06:33:17.949Z"
  },
  {
    "id": "prod-gdrive-1792132405514-31",
    "name": "Modern Minimalist LED-Integrated Wall-Mounted Dressing Mirror with Shelving",
    "slug": "modern-minimalist-led-integrated-wall-mounted-dressing-mirror-with-shelving-if-1595",
    "productCode": "IF-1595",
    "category": "Bedroom Furniture",
    "subCategory": "Dressing Tables / Vanity",
    "spaces": [
      "Master Bedroom"
    ],
    "shortDescription": "This sophisticated dressing mirror features a sleek black frame with integrated LED ambient lighting and a series of minimalist display shelves. Crafted for luxury interiors, it provides a contemporary storage solution for perfumes, accessories, and décor pieces while enhancing the spatial aesthetics of a modern bedroom.",
    "longDescription": "This sophisticated dressing mirror features a sleek black frame with integrated LED ambient lighting and a series of minimalist display shelves. Crafted for luxury interiors, it provides a contemporary storage solution for perfumes, accessories, and décor pieces while enhancing the spatial aesthetics of a modern bedroom. Mastercrafted from solid seasoned timber with artisanal mortise-and-tenon joinery.",
    "material": "Hardwood",
    "finish": "Natural Satin Hand-Rubbed Wax",
    "dimensions": "Standard Showroom Specifications",
    "seatingOrSize": "Standard",
    "wood": "Hardwood",
    "upholstery": "None",
    "leadTime": "3 to 4 Weeks",
    "madeIn": "Lahore, Pakistan",
    "images": [
      "/uploads/gdrive_1KxwjfUT_1792132392198_31.jpg"
    ],
    "tags": [
      "Solid Wood",
      "Handcrafted",
      "Bedroom Furniture",
      "Dressing Tables / Vanity"
    ],
    "isFeatured": false,
    "isPublished": true,
    "seoTitle": "Modern Minimalist LED-Integrated Wall-Mounted Dressing Mirror with Shelving | Ideal Furniture Lahore",
    "seoDescription": "This sophisticated dressing mirror features a sleek black frame with integrated LED ambient lighting and a series of minimalist display shelves. Crafted for luxury interiors, it provides a contemporary storage solution for perfumes, accessories, and décor pieces while enhancing the spatial aesthetics of a modern bedroom.",
    "createdAt": "2026-10-16T06:33:25.514Z",
    "updatedAt": "2026-10-16T06:33:25.514Z"
  },
  {
    "id": "prod-gdrive-1792132398535-32",
    "name": "Royal Navy & White Tufted Bed Suite",
    "slug": "royal-navy-white-tufted-bed-suite-if-2382",
    "productCode": "IF-2382",
    "category": "Bedroom Furniture",
    "subCategory": "King Size Bed and Nightstand",
    "spaces": [
      "Master Bedroom"
    ],
    "shortDescription": "This exquisite bedroom set features a grand king-size bed with a tall, button-tufted white upholstered headboard and a sophisticated navy blue velvet foot runner. It is complemented by an elegant white three-drawer nightstand with refined metallic accents, perfectly capturing a modern luxury aesthetic.",
    "longDescription": "This exquisite bedroom set features a grand king-size bed with a tall, button-tufted white upholstered headboard and a sophisticated navy blue velvet foot runner. It is complemented by an elegant white three-drawer nightstand with refined metallic accents, perfectly capturing a modern luxury aesthetic. Mastercrafted from solid seasoned timber with artisanal mortise-and-tenon joinery.",
    "material": "Hardwood",
    "finish": "Natural Satin Hand-Rubbed Wax",
    "dimensions": "Standard Showroom Specifications",
    "seatingOrSize": "Standard",
    "wood": "Hardwood",
    "upholstery": "Velvet",
    "leadTime": "3 to 4 Weeks",
    "madeIn": "Lahore, Pakistan",
    "images": [
      "/uploads/gdrive_1_UPNgSX_1792132392201_32.jpg"
    ],
    "tags": [
      "Solid Wood",
      "Handcrafted",
      "Bedroom Furniture",
      "King Size Bed and Nightstand"
    ],
    "isFeatured": false,
    "isPublished": true,
    "seoTitle": "Royal Navy & White Tufted Bed Suite | Ideal Furniture Lahore",
    "seoDescription": "This exquisite bedroom set features a grand king-size bed with a tall, button-tufted white upholstered headboard and a sophisticated navy blue velvet foot runner. It is complemented by an elegant white three-drawer nightstand with refined metallic accents, perfectly capturing a modern luxury aesthetic.",
    "createdAt": "2026-10-16T06:33:18.535Z",
    "updatedAt": "2026-10-16T06:33:18.535Z"
  },
  {
    "id": "prod-gdrive-1792132408910-33",
    "name": "Regal Tufted Chesterfield King Bed with Ornate Carved Trim",
    "slug": "regal-tufted-chesterfield-king-bed-with-ornate-carved-trim-if-9729",
    "productCode": "IF-9729",
    "category": "Bedroom Furniture",
    "subCategory": "King Size Bed",
    "spaces": [
      "Master Bedroom"
    ],
    "shortDescription": "This opulent king-sized bed features a deep-buttoned tufted headboard and matching footboard, framed by intricate hand-carved solid wood detailing in a dark espresso finish. The luxurious velvet upholstery paired with classic chesterfield styling creates an imposing and sophisticated atmosphere for a master suite.",
    "longDescription": "This opulent king-sized bed features a deep-buttoned tufted headboard and matching footboard, framed by intricate hand-carved solid wood detailing in a dark espresso finish. The luxurious velvet upholstery paired with classic chesterfield styling creates an imposing and sophisticated atmosphere for a master suite. Mastercrafted from solid seasoned timber with artisanal mortise-and-tenon joinery.",
    "material": "Hardwood",
    "finish": "Natural Satin Hand-Rubbed Wax",
    "dimensions": "Standard Showroom Specifications",
    "seatingOrSize": "Standard",
    "wood": "Hardwood",
    "upholstery": "Velvet",
    "leadTime": "3 to 4 Weeks",
    "madeIn": "Lahore, Pakistan",
    "images": [
      "/uploads/gdrive_1Ztk63o4_1792132405514_33.jpg"
    ],
    "tags": [
      "Solid Wood",
      "Handcrafted",
      "Bedroom Furniture",
      "King Size Bed"
    ],
    "isFeatured": false,
    "isPublished": true,
    "seoTitle": "Regal Tufted Chesterfield King Bed with Ornate Carved Trim | Ideal Furniture Lahore",
    "seoDescription": "This opulent king-sized bed features a deep-buttoned tufted headboard and matching footboard, framed by intricate hand-carved solid wood detailing in a dark espresso finish. The luxurious velvet upholstery paired with classic chesterfield styling creates an imposing and sophisticated atmosphere for a master suite.",
    "createdAt": "2026-10-16T06:33:28.910Z",
    "updatedAt": "2026-10-16T06:33:28.910Z"
  },
  {
    "id": "prod-gdrive-1792132408910-34",
    "name": "Modern Minimalist Fluted Accent Vanity Set",
    "slug": "modern-minimalist-fluted-accent-vanity-set-if-7792",
    "productCode": "IF-7792",
    "category": "Bedroom Furniture",
    "subCategory": "Dressing Table / Vanity",
    "spaces": [
      "Master Bedroom"
    ],
    "shortDescription": "This sophisticated vanity set features a vertical fluted wooden slat backdrop paired with a sleek, floating off-white console. The design is elevated by an integrated oval LED-backlit mirror and a matching textured bouclé ottoman for effortless elegance.",
    "longDescription": "This sophisticated vanity set features a vertical fluted wooden slat backdrop paired with a sleek, floating off-white console. The design is elevated by an integrated oval LED-backlit mirror and a matching textured bouclé ottoman for effortless elegance. Mastercrafted from solid seasoned timber with artisanal mortise-and-tenon joinery.",
    "material": "Hardwood",
    "finish": "Natural Satin Hand-Rubbed Wax",
    "dimensions": "Standard Showroom Specifications",
    "seatingOrSize": "Standard",
    "wood": "Hardwood",
    "upholstery": "Bouclé",
    "leadTime": "3 to 4 Weeks",
    "madeIn": "Lahore, Pakistan",
    "images": [
      "/uploads/gdrive_1LyrMG1O_1792132405515_34.jpg"
    ],
    "tags": [
      "Solid Wood",
      "Handcrafted",
      "Bedroom Furniture",
      "Dressing Table / Vanity"
    ],
    "isFeatured": false,
    "isPublished": true,
    "seoTitle": "Modern Minimalist Fluted Accent Vanity Set | Ideal Furniture Lahore",
    "seoDescription": "This sophisticated vanity set features a vertical fluted wooden slat backdrop paired with a sleek, floating off-white console. The design is elevated by an integrated oval LED-backlit mirror and a matching textured bouclé ottoman for effortless elegance.",
    "createdAt": "2026-10-16T06:33:28.910Z",
    "updatedAt": "2026-10-16T06:33:28.910Z"
  },
  {
    "id": "prod-gdrive-1792132410370-35",
    "name": "Modern Linen Upholstered Storage Headboard Bed",
    "slug": "modern-linen-upholstered-storage-headboard-bed-if-2606",
    "productCode": "IF-2606",
    "category": "Bedroom Furniture",
    "subCategory": "King Size Beds",
    "spaces": [
      "Master Bedroom"
    ],
    "shortDescription": "A sophisticated bed design featuring an innovative hinged headboard with integrated hidden storage space. Its clean-lined, contemporary profile is complemented by soft-touch neutral linen upholstery and a sturdy internal wood frame.",
    "longDescription": "A sophisticated bed design featuring an innovative hinged headboard with integrated hidden storage space. Its clean-lined, contemporary profile is complemented by soft-touch neutral linen upholstery and a sturdy internal wood frame. Mastercrafted from solid seasoned timber with artisanal mortise-and-tenon joinery.",
    "material": "Hardwood",
    "finish": "Natural Satin Hand-Rubbed Wax",
    "dimensions": "Standard Showroom Specifications",
    "seatingOrSize": "Standard",
    "wood": "Hardwood",
    "upholstery": "Linen",
    "leadTime": "3 to 4 Weeks",
    "madeIn": "Lahore, Pakistan",
    "images": [
      "/uploads/gdrive_1Z39gMDW_1792132405519_35.jpg"
    ],
    "tags": [
      "Solid Wood",
      "Handcrafted",
      "Bedroom Furniture",
      "King Size Beds"
    ],
    "isFeatured": false,
    "isPublished": true,
    "seoTitle": "Modern Linen Upholstered Storage Headboard Bed | Ideal Furniture Lahore",
    "seoDescription": "A sophisticated bed design featuring an innovative hinged headboard with integrated hidden storage space. Its clean-lined, contemporary profile is complemented by soft-touch neutral linen upholstery and a sturdy internal wood frame.",
    "createdAt": "2026-10-16T06:33:30.370Z",
    "updatedAt": "2026-10-16T06:33:30.370Z"
  },
  {
    "id": "prod-gdrive-1792132409174-36",
    "name": "Modern Minimalist Grey Upholstered King Bed and Wardrobe Suite",
    "slug": "modern-minimalist-grey-upholstered-king-bed-and-wardrobe-suite-if-6995",
    "productCode": "IF-6995",
    "category": "Bedroom Furniture",
    "subCategory": "Bedroom Sets",
    "spaces": [
      "Master Bedroom"
    ],
    "shortDescription": "This sophisticated bedroom suite features a plush, neutral-toned upholstered headboard with a minimalist frame, complemented by a large, integrated wardrobe with glass-paneled doors. The aesthetic is anchored by a contemporary geometric chandelier and a matching houndstooth ottoman, creating a serene and luxurious sanctuary.",
    "longDescription": "This sophisticated bedroom suite features a plush, neutral-toned upholstered headboard with a minimalist frame, complemented by a large, integrated wardrobe with glass-paneled doors. The aesthetic is anchored by a contemporary geometric chandelier and a matching houndstooth ottoman, creating a serene and luxurious sanctuary. Mastercrafted from solid seasoned timber with artisanal mortise-and-tenon joinery.",
    "material": "Engineered Wood",
    "finish": "Natural Satin Hand-Rubbed Wax",
    "dimensions": "Standard Showroom Specifications",
    "seatingOrSize": "Standard",
    "wood": "Engineered Wood",
    "upholstery": "Linen",
    "leadTime": "3 to 4 Weeks",
    "madeIn": "Lahore, Pakistan",
    "images": [
      "/uploads/gdrive_1MVlPWay_1792132405519_36.jpg"
    ],
    "tags": [
      "Solid Wood",
      "Handcrafted",
      "Bedroom Furniture",
      "Bedroom Sets"
    ],
    "isFeatured": false,
    "isPublished": true,
    "seoTitle": "Modern Minimalist Grey Upholstered King Bed and Wardrobe Suite | Ideal Furniture Lahore",
    "seoDescription": "This sophisticated bedroom suite features a plush, neutral-toned upholstered headboard with a minimalist frame, complemented by a large, integrated wardrobe with glass-paneled doors. The aesthetic is anchored by a contemporary geometric chandelier and a matching houndstooth ottoman, creating a serene and luxurious sanctuary.",
    "createdAt": "2026-10-16T06:33:29.174Z",
    "updatedAt": "2026-10-16T06:33:29.174Z"
  },
  {
    "id": "prod-gdrive-1792132455142-42",
    "name": "Lumina Luxury Backlit Vanity Mirror Collection",
    "slug": "lumina-luxury-backlit-vanity-mirror-collection-if-7247",
    "productCode": "IF-7247",
    "category": "Bedroom Furniture",
    "subCategory": "Vanity Mirror",
    "spaces": [
      "Master Bedroom"
    ],
    "shortDescription": "A curated collection of modern, organic-shaped vanity mirrors featuring integrated LED backlighting and premium wall-mounted designs. These mirrors combine minimalist aesthetic appeal with warm ambient illumination to elevate any modern bedroom or bathroom vanity suite.",
    "longDescription": "A curated collection of modern, organic-shaped vanity mirrors featuring integrated LED backlighting and premium wall-mounted designs. These mirrors combine minimalist aesthetic appeal with warm ambient illumination to elevate any modern bedroom or bathroom vanity suite. Mastercrafted from solid seasoned timber with artisanal mortise-and-tenon joinery.",
    "material": "null",
    "finish": "Natural Satin Hand-Rubbed Wax",
    "dimensions": "Standard Showroom Specifications",
    "seatingOrSize": "Standard",
    "wood": "null",
    "upholstery": "null",
    "leadTime": "3 to 4 Weeks",
    "madeIn": "Lahore, Pakistan",
    "images": [
      "/uploads/gdrive_17dPUS42_1792132412179_42.jpg"
    ],
    "tags": [
      "Solid Wood",
      "Handcrafted",
      "Bedroom Furniture",
      "Vanity Mirror"
    ],
    "isFeatured": false,
    "isPublished": true,
    "seoTitle": "Lumina Luxury Backlit Vanity Mirror Collection | Ideal Furniture Lahore",
    "seoDescription": "A curated collection of modern, organic-shaped vanity mirrors featuring integrated LED backlighting and premium wall-mounted designs. These mirrors combine minimalist aesthetic appeal with warm ambient illumination to elevate any modern bedroom or bathroom vanity suite.",
    "createdAt": "2026-10-16T06:34:15.142Z",
    "updatedAt": "2026-10-16T06:34:15.142Z"
  },
  {
    "id": "prod-gdrive-1792132426389-43",
    "name": "Modern Minimalist Floating Vanity with Organic Illuminated Mirror",
    "slug": "modern-minimalist-floating-vanity-with-organic-illuminated-mirror-if-7849",
    "productCode": "IF-7849",
    "category": "Bedroom Furniture",
    "subCategory": "Dressing Tables / Vanity",
    "spaces": [
      "Master Bedroom"
    ],
    "shortDescription": "This sophisticated wall-mounted vanity features a sleek, ribbed-texture console paired with a striking organic-shaped mirror highlighted by integrated ambient LED lighting. Its monochromatic grey palette and clean lines create a contemporary atmosphere, perfectly complemented by a matching upholstered cylindrical stool.",
    "longDescription": "This sophisticated wall-mounted vanity features a sleek, ribbed-texture console paired with a striking organic-shaped mirror highlighted by integrated ambient LED lighting. Its monochromatic grey palette and clean lines create a contemporary atmosphere, perfectly complemented by a matching upholstered cylindrical stool. Mastercrafted from solid seasoned timber with artisanal mortise-and-tenon joinery.",
    "material": "Hardwood with grey finish",
    "finish": "Natural Satin Hand-Rubbed Wax",
    "dimensions": "Standard Showroom Specifications",
    "seatingOrSize": "Standard",
    "wood": "Hardwood with grey finish",
    "upholstery": "Velvet",
    "leadTime": "3 to 4 Weeks",
    "madeIn": "Lahore, Pakistan",
    "images": [
      "/uploads/gdrive_1OImz-1d_1792132412183_43.jpg"
    ],
    "tags": [
      "Solid Wood",
      "Handcrafted",
      "Bedroom Furniture",
      "Dressing Tables / Vanity"
    ],
    "isFeatured": false,
    "isPublished": true,
    "seoTitle": "Modern Minimalist Floating Vanity with Organic Illuminated Mirror | Ideal Furniture Lahore",
    "seoDescription": "This sophisticated wall-mounted vanity features a sleek, ribbed-texture console paired with a striking organic-shaped mirror highlighted by integrated ambient LED lighting. Its monochromatic grey palette and clean lines create a contemporary atmosphere, perfectly complemented by a matching upholstered cylindrical stool.",
    "createdAt": "2026-10-16T06:33:46.389Z",
    "updatedAt": "2026-10-16T06:33:46.389Z"
  },
  {
    "id": "prod-gdrive-1792132458824-45",
    "name": "Modern Grey U-Shaped Sectional with Integrated Bookshelf Storage",
    "slug": "modern-grey-u-shaped-sectional-with-integrated-bookshelf-storage-if-6750",
    "productCode": "IF-6750",
    "category": "Living Room Furniture",
    "subCategory": "Sectional Sofas",
    "spaces": [
      "Living Room Suites"
    ],
    "shortDescription": "This premium U-shaped modular sectional features a sophisticated two-tone grey palette with contrasting botanical print accent cushions. It includes a functional built-in side bookshelf, a matching low-profile coffee table, and three coordinated ottomans for a complete, integrated living space solution.",
    "longDescription": "This premium U-shaped modular sectional features a sophisticated two-tone grey palette with contrasting botanical print accent cushions. It includes a functional built-in side bookshelf, a matching low-profile coffee table, and three coordinated ottomans for a complete, integrated living space solution. Mastercrafted from solid seasoned timber with artisanal mortise-and-tenon joinery.",
    "material": "Hardwood",
    "finish": "Natural Satin Hand-Rubbed Wax",
    "dimensions": "Standard Showroom Specifications",
    "seatingOrSize": "Standard",
    "wood": "Hardwood",
    "upholstery": "Polyester Blend Fabric",
    "leadTime": "3 to 4 Weeks",
    "madeIn": "Lahore, Pakistan",
    "images": [
      "/uploads/gdrive_1wPu1hF2_1792132455142_45.jpg"
    ],
    "tags": [
      "Solid Wood",
      "Handcrafted",
      "Living Room Furniture",
      "Sectional Sofas"
    ],
    "isFeatured": false,
    "isPublished": true,
    "seoTitle": "Modern Grey U-Shaped Sectional with Integrated Bookshelf Storage | Ideal Furniture Lahore",
    "seoDescription": "This premium U-shaped modular sectional features a sophisticated two-tone grey palette with contrasting botanical print accent cushions. It includes a functional built-in side bookshelf, a matching low-profile coffee table, and three coordinated ottomans for a complete, integrated living space solution.",
    "createdAt": "2026-10-16T06:34:18.824Z",
    "updatedAt": "2026-10-16T06:34:18.824Z"
  },
  {
    "id": "prod-gdrive-1792132459576-46",
    "name": "Royal Baroque-Inspired Cream and Walnut Nightstand with Gold Leaf Accents",
    "slug": "royal-baroque-inspired-cream-and-walnut-nightstand-with-gold-leaf-accents-if-4518",
    "productCode": "IF-4518",
    "category": "Bedroom Furniture",
    "subCategory": "Nightstands",
    "spaces": [
      "Master Bedroom"
    ],
    "shortDescription": "This exquisite nightstand features an ornate pedestal base with intricate gold leaf carvings and a rich walnut-finished mahogany structure. Its cream-toned marble-effect top and detailed scrollwork evoke a timeless, regal aesthetic perfect for luxurious bedrooms.",
    "longDescription": "This exquisite nightstand features an ornate pedestal base with intricate gold leaf carvings and a rich walnut-finished mahogany structure. Its cream-toned marble-effect top and detailed scrollwork evoke a timeless, regal aesthetic perfect for luxurious bedrooms. Mastercrafted from solid seasoned timber with artisanal mortise-and-tenon joinery.",
    "material": "Hardwood",
    "finish": "Natural Satin Hand-Rubbed Wax",
    "dimensions": "Standard Showroom Specifications",
    "seatingOrSize": "Standard",
    "wood": "Hardwood",
    "upholstery": "N/A",
    "leadTime": "3 to 4 Weeks",
    "madeIn": "Lahore, Pakistan",
    "images": [
      "/uploads/gdrive_1DUXefcJ_1792132455143_46.jpg"
    ],
    "tags": [
      "Solid Wood",
      "Handcrafted",
      "Bedroom Furniture",
      "Nightstands"
    ],
    "isFeatured": false,
    "isPublished": true,
    "seoTitle": "Royal Baroque-Inspired Cream and Walnut Nightstand with Gold Leaf Accents | Ideal Furniture Lahore",
    "seoDescription": "This exquisite nightstand features an ornate pedestal base with intricate gold leaf carvings and a rich walnut-finished mahogany structure. Its cream-toned marble-effect top and detailed scrollwork evoke a timeless, regal aesthetic perfect for luxurious bedrooms.",
    "createdAt": "2026-10-16T06:34:19.576Z",
    "updatedAt": "2026-10-16T06:34:19.576Z"
  },
  {
    "id": "prod-gdrive-1792132458483-47",
    "name": "Minimalist Organic-Form Floor Mirror and Bouclé Ottoman Set",
    "slug": "minimalist-organic-form-floor-mirror-and-boucl-ottoman-set-if-2701",
    "productCode": "IF-2701",
    "category": "Bedroom Furniture",
    "subCategory": "Vanity & Accessories",
    "spaces": [
      "Master Bedroom"
    ],
    "shortDescription": "This exquisite set features an organic-shaped, soft-beige floor mirror that adds a fluid architectural element to any space. It is perfectly complemented by a plush, cream-colored bouclé ottoman, creating a serene and sophisticated corner ideal for a modern dressing area.",
    "longDescription": "This exquisite set features an organic-shaped, soft-beige floor mirror that adds a fluid architectural element to any space. It is perfectly complemented by a plush, cream-colored bouclé ottoman, creating a serene and sophisticated corner ideal for a modern dressing area. Mastercrafted from solid seasoned timber with artisanal mortise-and-tenon joinery.",
    "material": "Hardwood Frame",
    "finish": "Natural Satin Hand-Rubbed Wax",
    "dimensions": "Standard Showroom Specifications",
    "seatingOrSize": "Standard",
    "wood": "Hardwood Frame",
    "upholstery": "Bouclé",
    "leadTime": "3 to 4 Weeks",
    "madeIn": "Lahore, Pakistan",
    "images": [
      "/uploads/gdrive_1s_fXXj1_1792132455145_47.jpg"
    ],
    "tags": [
      "Solid Wood",
      "Handcrafted",
      "Bedroom Furniture",
      "Vanity & Accessories"
    ],
    "isFeatured": false,
    "isPublished": true,
    "seoTitle": "Minimalist Organic-Form Floor Mirror and Bouclé Ottoman Set | Ideal Furniture Lahore",
    "seoDescription": "This exquisite set features an organic-shaped, soft-beige floor mirror that adds a fluid architectural element to any space. It is perfectly complemented by a plush, cream-colored bouclé ottoman, creating a serene and sophisticated corner ideal for a modern dressing area.",
    "createdAt": "2026-10-16T06:34:18.483Z",
    "updatedAt": "2026-10-16T06:34:18.483Z"
  },
  {
    "id": "prod-gdrive-1792132458808-48",
    "name": "Midnight Velvet Channel-Tufted King Bed",
    "slug": "midnight-velvet-channel-tufted-king-bed-if-7430",
    "productCode": "IF-7430",
    "category": "Bedroom Furniture",
    "subCategory": "King Size Beds",
    "spaces": [
      "Master Bedroom"
    ],
    "shortDescription": "This sophisticated king-size bed features a plush, channel-tufted upholstered headboard in a deep, moody charcoal tone. Perfectly complemented by a matching frame and minimalist aesthetic, it brings a serene, boutique-hotel atmosphere to any luxury bedroom.",
    "longDescription": "This sophisticated king-size bed features a plush, channel-tufted upholstered headboard in a deep, moody charcoal tone. Perfectly complemented by a matching frame and minimalist aesthetic, it brings a serene, boutique-hotel atmosphere to any luxury bedroom. Mastercrafted from solid seasoned timber with artisanal mortise-and-tenon joinery.",
    "material": "Hardwood",
    "finish": "Natural Satin Hand-Rubbed Wax",
    "dimensions": "Standard Showroom Specifications",
    "seatingOrSize": "Standard",
    "wood": "Hardwood",
    "upholstery": "Velvet",
    "leadTime": "3 to 4 Weeks",
    "madeIn": "Lahore, Pakistan",
    "images": [
      "/uploads/gdrive_1yqg6KDL_1792132455150_48.jpg"
    ],
    "tags": [
      "Solid Wood",
      "Handcrafted",
      "Bedroom Furniture",
      "King Size Beds"
    ],
    "isFeatured": false,
    "isPublished": true,
    "seoTitle": "Midnight Velvet Channel-Tufted King Bed | Ideal Furniture Lahore",
    "seoDescription": "This sophisticated king-size bed features a plush, channel-tufted upholstered headboard in a deep, moody charcoal tone. Perfectly complemented by a matching frame and minimalist aesthetic, it brings a serene, boutique-hotel atmosphere to any luxury bedroom.",
    "createdAt": "2026-10-16T06:34:18.808Z",
    "updatedAt": "2026-10-16T06:34:18.808Z"
  },
  {
    "id": "prod-gdrive-1792132461858-49",
    "name": "Contemporary Cream and Charcoal Modular Kitchen Suite",
    "slug": "contemporary-cream-and-charcoal-modular-kitchen-suite-if-8448",
    "productCode": "IF-8448",
    "category": "Dining Room Furniture",
    "subCategory": "Modular Kitchen Cabinets",
    "spaces": [
      "Dining Room"
    ],
    "shortDescription": "This bespoke kitchen design features minimalist cream-toned cabinetry with sleek charcoal-finished handles and open curved shelving for optimized storage. The layout includes integrated warm LED under-cabinet lighting that accentuates the high-gloss granite countertops and modern architectural finish.",
    "longDescription": "This bespoke kitchen design features minimalist cream-toned cabinetry with sleek charcoal-finished handles and open curved shelving for optimized storage. The layout includes integrated warm LED under-cabinet lighting that accentuates the high-gloss granite countertops and modern architectural finish. Mastercrafted from solid seasoned timber with artisanal mortise-and-tenon joinery.",
    "material": "Hardwood",
    "finish": "Natural Satin Hand-Rubbed Wax",
    "dimensions": "Standard Showroom Specifications",
    "seatingOrSize": "Standard",
    "wood": "Hardwood",
    "upholstery": "None",
    "leadTime": "3 to 4 Weeks",
    "madeIn": "Lahore, Pakistan",
    "images": [
      "/uploads/gdrive_1PcmAYPv_1792132459576_49.jpg"
    ],
    "tags": [
      "Solid Wood",
      "Handcrafted",
      "Dining Room Furniture",
      "Modular Kitchen Cabinets"
    ],
    "isFeatured": false,
    "isPublished": true,
    "seoTitle": "Contemporary Cream and Charcoal Modular Kitchen Suite | Ideal Furniture Lahore",
    "seoDescription": "This bespoke kitchen design features minimalist cream-toned cabinetry with sleek charcoal-finished handles and open curved shelving for optimized storage. The layout includes integrated warm LED under-cabinet lighting that accentuates the high-gloss granite countertops and modern architectural finish.",
    "createdAt": "2026-10-16T06:34:21.858Z",
    "updatedAt": "2026-10-16T06:34:21.858Z"
  },
  {
    "id": "prod-gdrive-1792132462165-50",
    "name": "Modern Minimalist Modular Kitchen Cabinetry",
    "slug": "modern-minimalist-modular-kitchen-cabinetry-if-1765",
    "productCode": "IF-1765",
    "category": "Dining Room Furniture",
    "subCategory": "Modular Kitchen Cabinets",
    "spaces": [
      "Dining Room"
    ],
    "shortDescription": "A sophisticated modular kitchen set featuring cream-toned matte cabinetry with sleek integrated under-cabinet lighting. The design incorporates curved corner shelving and a durable speckled granite countertop, blending modern functionality with high-end aesthetic appeal.",
    "longDescription": "A sophisticated modular kitchen set featuring cream-toned matte cabinetry with sleek integrated under-cabinet lighting. The design incorporates curved corner shelving and a durable speckled granite countertop, blending modern functionality with high-end aesthetic appeal. Mastercrafted from solid seasoned timber with artisanal mortise-and-tenon joinery.",
    "material": "Hardwood",
    "finish": "Natural Satin Hand-Rubbed Wax",
    "dimensions": "Standard Showroom Specifications",
    "seatingOrSize": "Standard",
    "wood": "Hardwood",
    "upholstery": "None",
    "leadTime": "3 to 4 Weeks",
    "madeIn": "Lahore, Pakistan",
    "images": [
      "/uploads/gdrive_1BK2Wfby_1792132459577_50.jpg"
    ],
    "tags": [
      "Solid Wood",
      "Handcrafted",
      "Dining Room Furniture",
      "Modular Kitchen Cabinets"
    ],
    "isFeatured": false,
    "isPublished": true,
    "seoTitle": "Modern Minimalist Modular Kitchen Cabinetry | Ideal Furniture Lahore",
    "seoDescription": "A sophisticated modular kitchen set featuring cream-toned matte cabinetry with sleek integrated under-cabinet lighting. The design incorporates curved corner shelving and a durable speckled granite countertop, blending modern functionality with high-end aesthetic appeal.",
    "createdAt": "2026-10-16T06:34:22.165Z",
    "updatedAt": "2026-10-16T06:34:22.165Z"
  },
  {
    "name": "Geometric Velvet Tufted Panel King Bed Set with Contemporary Marble Accents",
    "slug": "geometric-velvet-tufted-panel-king-bed-set-with-contemporary-marble-accents-if-4311",
    "productCode": "IF-4311",
    "category": "Bedroom Furniture",
    "subCategory": "Beds",
    "spaces": [
      "Living Room Suites"
    ],
    "shortDescription": "Handcrafted bedroom furniture masterpiece by Ideal Furniture, sculpted from seasoned timber with hand-rubbed finish.",
    "longDescription": "Handcrafted bedroom furniture masterpiece by Ideal Furniture, sculpted from seasoned timber with hand-rubbed finish.",
    "material": "Solid Seasoned Sheesham",
    "finish": "Natural Satin Hand-Rubbed Wax",
    "dimensions": "Standard Showroom Specifications",
    "seatingOrSize": "Standard",
    "wood": "Solid Seasoned Sheesham",
    "upholstery": "Tailored Poshish",
    "leadTime": "3 to 4 Weeks",
    "madeIn": "Lahore, Pakistan",
    "images": [
      "data:image/webp;base64,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"
    ],
    "tags": [
      "Solid Wood",
      "Handcrafted",
      "Bedroom Furniture"
    ],
    "isFeatured": false,
    "isPublished": true,
    "seoTitle": "Geometric Velvet Tufted Panel King Bed Set with Contemporary Marble Accents | Ideal Furniture Lahore",
    "seoDescription": "Handcrafted bedroom furniture masterpiece by Ideal Furniture, sculpted from seasoned timber with hand-rubbed finish.",
    "id": "prod-1790983023909",
    "createdAt": "2026-10-02T23:17:06.678Z",
    "updatedAt": "2026-10-02T23:17:06.678Z"
  },
  {
    "name": "Royal Navy Blue Velvet Button-Tufted Upholstered Platform Bed",
    "slug": "royal-navy-blue-velvet-button-tufted-upholstered-platform-bed-if-3869",
    "productCode": "IF-3869",
    "category": "Bedroom Furniture",
    "subCategory": "Beds",
    "spaces": [
      "Living Room Suites"
    ],
    "shortDescription": "Handcrafted bedroom furniture masterpiece by Ideal Furniture, sculpted from seasoned timber with hand-rubbed finish.",
    "longDescription": "Handcrafted bedroom furniture masterpiece by Ideal Furniture, sculpted from seasoned timber with hand-rubbed finish.",
    "material": "Solid Seasoned Sheesham",
    "finish": "Natural Satin Hand-Rubbed Wax",
    "dimensions": "Standard Showroom Specifications",
    "seatingOrSize": "Standard",
    "wood": "Solid Seasoned Sheesham",
    "upholstery": "Tailored Poshish",
    "leadTime": "3 to 4 Weeks",
    "madeIn": "Lahore, Pakistan",
    "images": [
      "data:image/webp;base64,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"
    ],
    "tags": [
      "Solid Wood",
      "Handcrafted",
      "Bedroom Furniture"
    ],
    "isFeatured": false,
    "isPublished": true,
    "seoTitle": "Royal Navy Blue Velvet Button-Tufted Upholstered Platform Bed | Ideal Furniture Lahore",
    "seoDescription": "Handcrafted bedroom furniture masterpiece by Ideal Furniture, sculpted from seasoned timber with hand-rubbed finish.",
    "id": "prod-1790982343574",
    "createdAt": "2026-10-02T23:05:46.355Z",
    "updatedAt": "2026-10-02T23:05:46.355Z"
  },
  {
    "id": "prod-1",
    "name": "Noor Sofa",
    "slug": "noor-sofa",
    "productCode": "IF-SOF-001",
    "category": "Living & Haute Seating",
    "subCategory": "Sofas",
    "spaces": [
      "Living Room Suites",
      "Drawing Room"
    ],
    "shortDescription": "Hand-carved solid walnut three-seater sofa upholstered in textured Belgian linen with hand-tied coil springs.",
    "longDescription": "The Noor Sofa exemplifies our master woodcarvers' command over seasoned walnut. Every curve along the crest rail and apron is shaped with gouges and rasps before finishing with hand-rubbed wax. The deep seat incorporates hand-lashed eight-way coil springs beneath feather-and-down cushioning.",
    "material": "Seasoned Walnut, High-Resilience Core, Down Blend",
    "finish": "Hand-Rubbed Antique Walnut Wax",
    "dimensions": "92\" W x 38\" D x 34\" H (Seat Height: 18\")",
    "seatingOrSize": "Three Seater",
    "wood": "Solid Himalayan Walnut",
    "upholstery": "Heavyweight Linen Cotton Blend",
    "leadTime": "6 – 8 Weeks",
    "madeIn": "Lahore, Pakistan",
    "options": [
      {
        "label": "Upholstery",
        "values": [
          "Raw Ecru Linen",
          "Olive Velvet",
          "Charcoal Twill"
        ]
      },
      {
        "label": "Wood Finish",
        "values": [
          "Natural Walnut",
          "Dark Vintage Wax"
        ]
      }
    ],
    "images": [
      "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1000&q=85",
      "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&w=1000&q=85"
    ],
    "tags": [
      "Signature",
      "Living",
      "Walnut",
      "Handcrafted"
    ],
    "isFeatured": true,
    "isPublished": true,
    "seoTitle": "Noor Sofa | Handcrafted Solid Walnut Three-Seater",
    "seoDescription": "Explore the Noor Sofa by Ideal Furniture. Solid Himalayan walnut frame with Belgian linen upholstery.",
    "createdAt": "2026-01-15T10:00:00Z",
    "updatedAt": "2026-02-01T14:30:00Z"
  },
  {
    "id": "prod-2",
    "name": "Harappa Architectural Chest",
    "slug": "harappa-chest",
    "productCode": "IF-CAB-012",
    "category": "Storage & Credenzas",
    "subCategory": "Chest of Drawers",
    "spaces": [
      "Hall & Entrance Consoles",
      "Drawing Room",
      "Living Room Suites"
    ],
    "shortDescription": "Twelve-drawer architectural chest crafted from aged teak with relief-carved geometric lattice and unlacquered brass pulls.",
    "longDescription": "Drawn from ancient Indus Valley joinery and proportion, the Harappa Chest balances monolithic weight with delicate chisel facets across its twelve hand-fitted drawers. Brass hardware is sand-cast in small batches in Gujranwala and allowed to develop an organic patina.",
    "material": "Reclaimed Aged Teak, Sand-Cast Brass",
    "finish": "Wire-Brushed Weathered Umber",
    "dimensions": "68\" W x 20\" D x 36\" H",
    "seatingOrSize": "12 Drawers",
    "wood": "Solid Reclaimed Teak",
    "leadTime": "7 – 9 Weeks",
    "madeIn": "Chiniot & Lahore Workshops",
    "options": [
      {
        "label": "Hardware",
        "values": [
          "Antiqued Cast Brass",
          "Blackened Bronze"
        ]
      }
    ],
    "images": [
      "https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&w=1000&q=85",
      "https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&w=1000&q=85"
    ],
    "tags": [
      "Cabinet",
      "Teak",
      "Brass",
      "Storage"
    ],
    "isFeatured": true,
    "isPublished": true,
    "seoTitle": "Harappa Chest | Hand-Carved Teak Storage Cabinet",
    "seoDescription": "Twelve-drawer architectural chest with sand-cast brass hardware and relief lattice details.",
    "createdAt": "2026-01-18T11:00:00Z",
    "updatedAt": "2026-02-10T12:00:00Z"
  },
  {
    "id": "prod-3",
    "name": "Shalimar Round Dining Table",
    "slug": "shalimar-round-table",
    "productCode": "IF-TAB-033",
    "category": "Dining Suites",
    "subCategory": "Round Banquet Tables",
    "spaces": [
      "Dining Room"
    ],
    "shortDescription": "Substantial round dining table anchored by an octagonal hand-turned fluted pedestal in solid sheesham.",
    "longDescription": "The Shalimar dining table gathers guests around a bookmatched radial top with a subtle chamfered edge. The central fluted pedestal is hand-turned on traditional lathe beds before mortise-and-tenon attachment to the broad quad-leg base.",
    "material": "Solid Sheesham (Indian Rosewood)",
    "finish": "Hand-Applied Matte Shellac",
    "dimensions": "66\" Diameter x 30\" H",
    "seatingOrSize": "Seats 6 – 8",
    "wood": "Kiln-Dried Sheesham",
    "leadTime": "6 – 8 Weeks",
    "madeIn": "Lahore, Pakistan",
    "options": [
      {
        "label": "Diameter",
        "values": [
          "60 Inches (6 Seats)",
          "66 Inches (8 Seats)",
          "72 Inches (10 Seats)"
        ]
      }
    ],
    "images": [
      "https://images.unsplash.com/photo-1615066390971-03e4e1c36ddf?auto=format&fit=crop&w=1000&q=85",
      "https://images.unsplash.com/photo-1577140917170-285929fb55b7?auto=format&fit=crop&w=1000&q=85"
    ],
    "tags": [
      "Dining",
      "Round Table",
      "Sheesham",
      "Hand-Turned"
    ],
    "isFeatured": true,
    "isPublished": true,
    "seoTitle": "Shalimar Round Dining Table | Solid Sheesham",
    "seoDescription": "Hand-turned octagonal pedestal round dining table with bookmatched radial wood top.",
    "createdAt": "2026-01-20T09:00:00Z",
    "updatedAt": "2026-02-12T16:00:00Z"
  },
  {
    "id": "prod-4",
    "name": "Swan Royal Bed Set",
    "slug": "swan-bed-set",
    "productCode": "IF-BED-004",
    "category": "Beds & Suites",
    "subCategory": "Bed Sets",
    "spaces": [
      "Master Boudoir & Bedroom"
    ],
    "shortDescription": "Carved king bedstead featuring gentle serpentine contours, inset channel-tufted silk headboard, and two matching nightstands.",
    "longDescription": "Inspired by Mughal palatial sleeping pavilions, the Swan Bed Set combines low-profile walnut rails with an arched headboard crowned by delicate hand-carved floral cresting. Includes two low-profile solid walnut bedside drawers with concealed soft-closing wooden runners.",
    "material": "Himalayan Walnut, Raw Silk Upholstery, Brass Ferrules",
    "finish": "Satin Warm Walnut",
    "dimensions": "King: 84\" W x 88\" L x 58\" Headboard Height",
    "seatingOrSize": "King Size",
    "wood": "Solid Walnut",
    "upholstery": "Slubbed Raw Silk",
    "leadTime": "8 – 10 Weeks",
    "madeIn": "Lahore, Pakistan",
    "options": [
      {
        "label": "Bed Size",
        "values": [
          "King (76\" x 80\" mattress)",
          "Super King (84\" x 84\" mattress)"
        ]
      },
      {
        "label": "Silk Tone",
        "values": [
          "Champagne Silk",
          "Oatmeal Raw Silk",
          "Deep Slate"
        ]
      }
    ],
    "images": [
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1000&q=85",
      "https://images.unsplash.com/photo-1540518614846-7ede433c4ef0?auto=format&fit=crop&w=1000&q=85"
    ],
    "tags": [
      "Bed",
      "King",
      "Walnut",
      "Raw Silk"
    ],
    "isFeatured": true,
    "isPublished": true,
    "seoTitle": "Swan Bed Set | Handcrafted Walnut King Bedstead",
    "seoDescription": "Solid walnut king bedstead with raw silk channel-tufted headboard and matching night tables.",
    "createdAt": "2026-01-22T14:00:00Z",
    "updatedAt": "2026-02-05T10:00:00Z"
  },
  {
    "id": "prod-5",
    "name": "Khyber Architectural Credenza",
    "slug": "khyber-architectural-credenza",
    "productCode": "IF-CAB-025",
    "category": "Storage & Credenzas",
    "subCategory": "Architectural Credenzas",
    "spaces": [
      "Living Room Suites",
      "Dining Room",
      "Hall & Entrance Consoles"
    ],
    "shortDescription": "Four-door fluted solid walnut credenza with seamless push-touch magnetic doors and brushed champagne brass plinth.",
    "longDescription": "The Khyber Credenza unites clean mid-century architectural geometry with the organic warmth of solid Himalayan walnut. Each door panel features precision fluted relief channels carved from single planks, housing interior adjustable shelves and discreet cable pass-throughs.",
    "material": "Solid Himalayan Walnut, Brushed Champagne Brass",
    "finish": "Deep Natural Walnut Matte Wax",
    "dimensions": "78\" W x 20\" D x 34\" H",
    "seatingOrSize": "4-Door Storage Credenza",
    "wood": "Solid Himalayan Walnut",
    "leadTime": "6 – 8 Weeks",
    "madeIn": "Lahore Workshops",
    "options": [
      {
        "label": "Plinth Finish",
        "values": [
          "Brushed Champagne Brass",
          "Dark Bronzed Steel"
        ]
      }
    ],
    "images": [
      "https://images.unsplash.com/photo-1616046229478-9901c5536a45?auto=format&fit=crop&w=1000&q=85",
      "https://images.unsplash.com/photo-1597072689227-8882273e8f6a?auto=format&fit=crop&w=1000&q=85"
    ],
    "tags": [
      "Credenza",
      "Storage",
      "Walnut",
      "Architectural"
    ],
    "isFeatured": true,
    "isPublished": true,
    "seoTitle": "Khyber Architectural Credenza | Solid Walnut Sideboard",
    "seoDescription": "Solid walnut four-door sideboard with fluted wood relief doors and brushed brass base.",
    "createdAt": "2026-01-25T11:00:00Z",
    "updatedAt": "2026-02-14T09:00:00Z"
  },
  {
    "id": "prod-6",
    "name": "Ghalib Caned Salon Settee",
    "slug": "ghalib-settee",
    "productCode": "IF-SEAT-018",
    "category": "Living & Haute Seating",
    "subCategory": "Settees",
    "spaces": [
      "Drawing Room",
      "Living Room Suites",
      "Hall & Entrance Consoles"
    ],
    "shortDescription": "Open-arm salon settee with caned back, turned baluster stretchers, and tailored linen cushion.",
    "longDescription": "The Ghalib Settee brings transparency and grace to formal living rooms. The backrest is hand-woven with fine natural rattan cane in an octagonal pattern, while the solid walnut frame features subtle acanthus leaves carved directly into the knee blocks.",
    "material": "Solid Walnut, Natural Rattan Cane, Belgian Linen",
    "finish": "Aged Honey Walnut",
    "dimensions": "58\" W x 28\" D x 33\" H (Seat Height: 18\")",
    "seatingOrSize": "Two Seater",
    "wood": "Solid Walnut",
    "upholstery": "Heavy Linen",
    "leadTime": "5 – 7 Weeks",
    "madeIn": "Lahore, Pakistan",
    "images": [
      "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1000&q=85",
      "https://images.unsplash.com/photo-1567016432779-094069958ea5?auto=format&fit=crop&w=1000&q=85"
    ],
    "tags": [
      "Settee",
      "Caned",
      "Walnut",
      "Drawing Room"
    ],
    "isFeatured": true,
    "isPublished": true,
    "seoTitle": "Ghalib Settee | Caned Walnut Two-Seater",
    "seoDescription": "Hand-caned walnut settee with hand-turned stretchers and tailored linen cushion.",
    "createdAt": "2026-01-28T13:00:00Z",
    "updatedAt": "2026-02-16T15:00:00Z"
  },
  {
    "id": "prod-7",
    "name": "Badshahi Architectural Console Table",
    "slug": "badshahi-console-table",
    "productCode": "IF-CON-009",
    "category": "Center & Accent Tables",
    "subCategory": "Consoles",
    "spaces": [
      "Hall & Entrance Consoles",
      "Drawing Room",
      "Living Room Suites"
    ],
    "shortDescription": "Grand architectural console table sculpted from solid seasoned deodar and walnut with hand-turned baluster legs.",
    "longDescription": "Measuring over five feet wide, the Badshahi Console commands entrance galleries and living salons. Hand-turned triple balusters support a double-thick beveled walnut top with a hand-carved floral fretwork apron.",
    "material": "Solid Deodar Cedar & Himalayan Walnut, Sand-Cast Brass Mounts",
    "finish": "Antiqued Walnut & Warm Patina",
    "dimensions": "66\" W x 18\" D x 34\" H",
    "seatingOrSize": "Console Table",
    "wood": "Solid Walnut & Cedar",
    "leadTime": "5 – 7 Weeks",
    "madeIn": "Chiniot & Lahore Workshops",
    "images": [
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1000&q=85",
      "https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&w=1000&q=85"
    ],
    "tags": [
      "Console",
      "Entry Table",
      "Walnut",
      "Hand-Carved"
    ],
    "isFeatured": true,
    "isPublished": true,
    "seoTitle": "Badshahi Console Table | Hand-Carved Entry Table",
    "seoDescription": "Architectural console table with turned baluster columns and solid walnut top.",
    "createdAt": "2026-02-01T15:00:00Z",
    "updatedAt": "2026-02-18T11:00:00Z"
  },
  {
    "id": "prod-8",
    "name": "Jahangir Executive Writing Desk",
    "slug": "jahangir-executive-writing-desk",
    "productCode": "IF-DSK-014",
    "category": "Study & Accent Chairs",
    "subCategory": "Executive Writing Desks",
    "spaces": [
      "Executive Study & Library",
      "Drawing Room"
    ],
    "shortDescription": "Monumental seven-drawer executive partner's desk in solid sheesham with full-grain leather writing inlay.",
    "longDescription": "The Jahangir Desk is crafted for stately private libraries. Made of kiln-dried solid Sheesham, it features hand-dovetailed drawer boxes, solid brass bail pulls, and an antiqued cognac leather writing surface with blind-embossed gold tooling.",
    "material": "Solid Seasoned Sheesham, Full-Grain Leather, Cast Brass Pulls",
    "finish": "Hand-Rubbed Espresso Sheesham",
    "dimensions": "72\" W x 36\" D x 30\" H",
    "seatingOrSize": "Executive Partner's Desk",
    "wood": "Solid Sheesham",
    "leadTime": "7 – 9 Weeks",
    "madeIn": "Lahore, Pakistan",
    "images": [
      "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=1000&q=85",
      "https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=1000&q=85"
    ],
    "tags": [
      "Desk",
      "Executive",
      "Sheesham",
      "Study"
    ],
    "isFeatured": true,
    "isPublished": true,
    "seoTitle": "Jahangir Executive Desk | Solid Sheesham Writing Desk",
    "seoDescription": "Executive solid wood writing desk with leather inlay and brass hardware.",
    "createdAt": "2026-02-03T16:00:00Z",
    "updatedAt": "2026-02-19T10:00:00Z"
  },
  {
    "id": "prod-9",
    "name": "Ravi Low Center Table",
    "slug": "ravi-low-center-table",
    "productCode": "IF-TAB-027",
    "category": "Center & Accent Tables",
    "subCategory": "Coffee & Center Tables",
    "spaces": [
      "Living Room Suites"
    ],
    "shortDescription": "Low-slung square coffee table with hand-carved chamfered stretchers and bookmatched teak top.",
    "longDescription": "Designed to anchor relaxed living arrangements, the Ravi table sits at a deliberate 16-inch height. The frame utilizes mortise-and-tenon joints pinned with contrasting walnut dowels, celebrating structural honesty.",
    "material": "Solid Teak, Pinned Walnut Joinery",
    "finish": "Matte Natural Oil Finish",
    "dimensions": "54\" W x 54\" D x 16\" H",
    "seatingOrSize": "Square Center Table",
    "wood": "Solid Teak",
    "leadTime": "5 – 6 Weeks",
    "madeIn": "Lahore, Pakistan",
    "images": [
      "https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&w=1000&q=85",
      "https://images.unsplash.com/photo-1615066390971-03e4e1c36ddf?auto=format&fit=crop&w=1000&q=85"
    ],
    "tags": [
      "Coffee Table",
      "Center Table",
      "Teak",
      "Living"
    ],
    "isFeatured": false,
    "isPublished": true,
    "seoTitle": "Ravi Low Center Table | Square Teak Coffee Table",
    "seoDescription": "Low-slung square teak center table with exposed dowel joinery and hand-rubbed oil finish.",
    "createdAt": "2026-02-05T09:00:00Z",
    "updatedAt": "2026-02-20T12:00:00Z"
  },
  {
    "id": "prod-10",
    "name": "Zeenat Poshish Chaise Lounge",
    "slug": "zeenat-poshish-chaise-lounge",
    "productCode": "IF-SEAT-031",
    "category": "Living & Haute Seating",
    "subCategory": "Deewans",
    "spaces": [
      "Living Room Suites",
      "Drawing Room",
      "Master Boudoir & Bedroom"
    ],
    "shortDescription": "Hand-tufted boudoir chaise lounge upholstered in royal emerald velvet with solid rosewood carved cabriole legs.",
    "longDescription": "The Zeenat Chaise is an ode to classic subcontinental deewan lounges. Deep button-tufting is applied by hand across the sweeping single-arm backrest, framed by hand-waxed rosewood cabriole feet with carved acanthus scroll knees.",
    "material": "Solid Rosewood, Royal Emerald Cotton Velvet, Feather Core",
    "finish": "Antique Rosewood with Emerald Velvet",
    "dimensions": "68\" L x 30\" D x 33\" H (Seat Height: 17\")",
    "seatingOrSize": "Chaise Lounge / Deewan",
    "wood": "Solid Rosewood",
    "upholstery": "Royal Emerald Velvet",
    "leadTime": "6 – 8 Weeks",
    "madeIn": "Lahore Workshops",
    "images": [
      "https://images.unsplash.com/photo-1580481077195-c3a82105e3b5?auto=format&fit=crop&w=1000&q=85",
      "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1000&q=85"
    ],
    "tags": [
      "Chaise",
      "Deewan",
      "Velvet",
      "Rosewood"
    ],
    "isFeatured": true,
    "isPublished": true,
    "seoTitle": "Zeenat Chaise Lounge | Emerald Velvet Deewan",
    "seoDescription": "Solid rosewood carved chaise lounge in button-tufted royal emerald velvet.",
    "createdAt": "2026-02-07T12:00:00Z",
    "updatedAt": "2026-02-21T14:00:00Z"
  },
  {
    "id": "prod-11",
    "name": "Multani Rosewood Display Armoire",
    "slug": "multani-rosewood-display-armoire",
    "productCode": "IF-CAB-044",
    "category": "Storage & Credenzas",
    "subCategory": "Cabinets & Armoires",
    "spaces": [
      "Dining Room",
      "Living Room Suites",
      "Hall & Entrance Consoles"
    ],
    "shortDescription": "Arched two-door linen and display cabinet in aged rosewood with hand-chiseled floral crest and brass trellis grille.",
    "longDescription": "Handcrafted in the centuries-old tradition of Multani woodworking, this stately armoire features twin arched doors with pierced brass lattice panels that permit ventilation while shielding fine linens and dinnerware.",
    "material": "Kiln-Dried Rosewood, Solid Sand-Cast Brass Grilles",
    "finish": "Hand-Burnished Natural Rosewood",
    "dimensions": "48\" W x 22\" D x 82\" H",
    "seatingOrSize": "Tall 2-Door Armoire",
    "wood": "Solid Rosewood",
    "leadTime": "7 – 9 Weeks",
    "madeIn": "Multan & Lahore",
    "images": [
      "https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&w=1000&q=85",
      "https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&w=1000&q=85"
    ],
    "tags": [
      "Armoire",
      "Rosewood",
      "Cabinet",
      "Storage"
    ],
    "isFeatured": true,
    "isPublished": true,
    "seoTitle": "Multani Rosewood Armoire | Handcrafted Display Cabinet",
    "seoDescription": "Solid rosewood two-door arched cabinet with pierced brass trellis work.",
    "createdAt": "2026-02-09T14:00:00Z",
    "updatedAt": "2026-02-22T08:00:00Z"
  },
  {
    "id": "prod-12",
    "name": "Darbar Wing Chair",
    "slug": "darbar-wing-chair",
    "productCode": "IF-SEAT-009",
    "category": "Study & Accent Chairs",
    "subCategory": "Library Wing Chairs",
    "spaces": [
      "Drawing Room",
      "Living Room Suites",
      "Executive Study & Library"
    ],
    "shortDescription": "High-backed occasional armchair with hand-sculpted cabriole legs in rosewood and tailored wool bouclé.",
    "longDescription": "The Darbar Wing Chair offers quiet cocooning with its tall enveloping ears and deep lumbar support. The exposed frame features gently curved arms terminating in scrolled volutes carved by senior woodwrights.",
    "material": "Solid Rosewood, Wool Bouclé, Webbed Coil Base",
    "finish": "Hand-Burnished Natural Rosewood",
    "dimensions": "34\" W x 36\" D x 46\" H (Seat Height: 19\")",
    "seatingOrSize": "Single Armchair",
    "wood": "Solid Rosewood",
    "upholstery": "Heavy Wool Bouclé",
    "leadTime": "6 – 7 Weeks",
    "madeIn": "Lahore Workshops",
    "options": [
      {
        "label": "Fabric",
        "values": [
          "Cream Wool Bouclé",
          "Tawny Mohair",
          "Washed Linen"
        ]
      }
    ],
    "images": [
      "https://images.unsplash.com/photo-1580481077195-c3a82105e3b5?auto=format&fit=crop&w=1000&q=85",
      "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&w=1000&q=85"
    ],
    "tags": [
      "Armchair",
      "Wing Chair",
      "Rosewood",
      "Boucle"
    ],
    "isFeatured": true,
    "isPublished": true,
    "seoTitle": "Darbar Wing Chair | High-Backed Rosewood Armchair",
    "seoDescription": "Heirloom wing chair with hand-sculpted rosewood cabriole legs and wool bouclé upholstery.",
    "createdAt": "2026-02-12T11:00:00Z",
    "updatedAt": "2026-02-24T16:00:00Z"
  },
  {
    "id": "prod-13",
    "name": "Regent Grand Refectory Dining Table",
    "slug": "regent-refectory-dining-table",
    "productCode": "IF-TAB-048",
    "category": "Dining Suites",
    "subCategory": "Refectory Tables",
    "spaces": [
      "Dining Room"
    ],
    "shortDescription": "Monumental solid Himalayan walnut refectory table with hand-pegged trestle base and chamfered perimeter.",
    "longDescription": "Designed for grand feasts, the Regent Refectory table spans nine feet in continuous solid walnut planks joined with hand-cut butterfly keys. The robust double-trestle base is anchored by a wedged through-tenon stretcher.",
    "material": "Solid Himalayan Walnut, Hand-Pegged Through-Tenon Joinery",
    "finish": "Natural Hand-Rubbed Walnut Oil",
    "dimensions": "108\" L x 44\" W x 30\" H",
    "seatingOrSize": "Seats 10 – 12 Guests",
    "wood": "Solid Himalayan Walnut",
    "leadTime": "8 – 10 Weeks",
    "madeIn": "Lahore Atelier",
    "images": [
      "https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&w=1000&q=85",
      "https://images.unsplash.com/photo-1577140917170-285929fb55b7?auto=format&fit=crop&w=1000&q=85"
    ],
    "tags": [
      "Dining",
      "Refectory",
      "Walnut",
      "Grand Table"
    ],
    "isFeatured": true,
    "isPublished": true,
    "seoTitle": "Regent Refectory Table | 10-Seater Solid Walnut Dining Table",
    "seoDescription": "Monumental 10-seater refectory dining table handcrafted from solid Himalayan walnut.",
    "createdAt": "2026-02-15T10:00:00Z",
    "updatedAt": "2026-02-25T14:00:00Z"
  },
  {
    "id": "prod-14",
    "name": "Crescent Bouclé Curved Sectional",
    "slug": "crescent-boucle-curved-sectional",
    "productCode": "IF-SOF-022",
    "category": "Living & Haute Seating",
    "subCategory": "Curved Sectionals",
    "spaces": [
      "Living Room Suites",
      "Drawing Room"
    ],
    "shortDescription": "Architectural serpentine curved sectional upholstered in textured champagne wool bouclé with recessed brass base.",
    "longDescription": "The Crescent Sectional curves gracefully to define contemporary conversational layouts. The continuous serpentine frame is built from kiln-dried hardwood, wrapped in multi-density foam and feather down, and trimmed with a recessed brushed-brass toe kick.",
    "material": "Hardwood Internal Frame, Champagne Wool Bouclé, Brushed Brass",
    "finish": "Champagne Bouclé & Brass Plinth",
    "dimensions": "130\" W x 74\" D x 32\" H",
    "seatingOrSize": "5-6 Seater Curved Sectional",
    "wood": "Kiln-Dried Hardwood Frame",
    "upholstery": "Champagne Wool Bouclé",
    "leadTime": "7 – 9 Weeks",
    "madeIn": "Lahore Atelier",
    "images": [
      "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1000&q=85",
      "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1000&q=85"
    ],
    "tags": [
      "Sectional",
      "Curved",
      "Boucle",
      "Living"
    ],
    "isFeatured": true,
    "isPublished": true,
    "seoTitle": "Crescent Curved Sectional | Champagne Bouclé Sofa",
    "seoDescription": "Sculptural curved sectional sofa upholstered in luxury wool bouclé with brass base.",
    "createdAt": "2026-02-18T12:00:00Z",
    "updatedAt": "2026-02-26T09:00:00Z"
  },
  {
    "id": "prod-15",
    "name": "Chinioti Royal Canopy Bedstead",
    "slug": "chinioti-royal-canopy-bed",
    "productCode": "IF-BED-019",
    "category": "Beds & Suites",
    "subCategory": "King Bedsteads",
    "spaces": [
      "Master Boudoir & Bedroom"
    ],
    "shortDescription": "Four-poster solid sheesham canopy bed featuring hand-turned fluted posts and delicate floral cresting.",
    "longDescription": "An heirloom masterpiece of Chinioti heritage, this four-poster canopy bed is carved entirely from seasoned Sheesham. The soaring eight-foot posts are turned on manual lathes and joined with blind mortise-and-tenon joints for generational longevity.",
    "material": "Solid Kiln-Dried Sheesham Wood, Brass Hardware",
    "finish": "Rich Honey Sheesham Oil",
    "dimensions": "84\" W x 88\" L x 92\" Canopy Height",
    "seatingOrSize": "King Canopy Bed",
    "wood": "Solid Sheesham",
    "leadTime": "8 – 11 Weeks",
    "madeIn": "Chiniot Workshops",
    "images": [
      "https://images.unsplash.com/photo-1540518614846-7ede433c4ef0?auto=format&fit=crop&w=1000&q=85",
      "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=1000&q=85"
    ],
    "tags": [
      "Canopy Bed",
      "Four Poster",
      "Sheesham",
      "Bedroom"
    ],
    "isFeatured": true,
    "isPublished": true,
    "seoTitle": "Chinioti Royal Canopy Bed | Four-Poster Sheesham King Bed",
    "seoDescription": "Handcrafted four-poster king canopy bed in solid seasoned sheesham with fluted posts.",
    "createdAt": "2026-02-20T10:00:00Z",
    "updatedAt": "2026-02-27T16:00:00Z"
  },
  {
    "id": "prod-16",
    "name": "Bagh-e-Jinnah Boudoir Bench",
    "slug": "bagh-e-jinnah-boudoir-bench",
    "productCode": "IF-SEAT-042",
    "category": "Study & Accent Chairs",
    "subCategory": "Boudoir Benches",
    "spaces": [
      "Master Boudoir & Bedroom",
      "Hall & Entrance Consoles",
      "Living Room Suites"
    ],
    "shortDescription": "Channel-tufted pearl wool bouclé bench set on an architectural solid walnut base with tapered feet.",
    "longDescription": "Perfect for foot-of-bed positioning or entrance foyers, the Bagh-e-Jinnah bench features vertical channel tufting over supportive high-density foam, nestled into a solid walnut cradle with rounded pillowed edges.",
    "material": "Solid Himalayan Walnut, Pearl Wool Bouclé",
    "finish": "Warm Walnut Oil & Pearl Bouclé",
    "dimensions": "56\" W x 18\" D x 19\" H",
    "seatingOrSize": "2-Person Bench",
    "wood": "Solid Walnut",
    "upholstery": "Pearl Wool Bouclé",
    "leadTime": "4 – 5 Weeks",
    "madeIn": "Lahore Atelier",
    "images": [
      "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1000&q=85",
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1000&q=85"
    ],
    "tags": [
      "Bench",
      "Boudoir",
      "Walnut",
      "Boucle"
    ],
    "isFeatured": true,
    "isPublished": true,
    "seoTitle": "Bagh-e-Jinnah Bench | Channel-Tufted Boudoir Bench",
    "seoDescription": "Solid walnut bedroom bench with channel-tufted pearl wool bouclé cushioning.",
    "createdAt": "2026-02-22T14:00:00Z",
    "updatedAt": "2026-02-28T11:00:00Z"
  }
];

export const SEED_HOMEPAGE_CONTENT: HomepageContent = {
  heroVideoUrl: "",
  heroPosterUrl: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1800&q=85",
  heroEyebrow: "IDEAL FURNITURE",
  heroHeading: "Let Us Furnish Your Home",
  heroSubtext: "Luxury furniture hand-carved by multi-generational master craftsmen in Pakistan, designed for contemporary spaces worldwide.",
  heroPrimaryCta: "Book Free Consultation",
  heroSecondaryCta: "Explore the Collection",
  brandStatementHeading: "Furniture as",
  brandStatementAccentWord: "Art",
  brandStatementText: "We believe furniture transcends function to become heirloom sculpture within the home. In our Lahore workshops, seasoned timber meets multi-generational hand joinery, producing one-of-a-kind pieces that celebrate natural grain, balance, and quiet endurance.",
  signatureProductIds: [
    "prod-1",
    "prod-2",
    "prod-3",
    "prod-4",
    "prod-5",
    "prod-6"
  ],
  accessoriesProductIds: [
    "prod-5",
    "prod-2"
  ],
  textilesProductIds: [
    "prod-1",
    "prod-4",
    "prod-6"
  ],
  craftsmanshipItems: [
    {
      title: "Hardwood Joinery",
      subHeading: "Solid Hardwood Joinery",
      description: "Mortise, tenon, and dovetail joinery in seasoned Himalayan walnut and aged rosewood, hand-waxed for lifetime endurance.",
      image: "https://images.unsplash.com/photo-1540518614846-7ede433c4ef0?auto=format&fit=crop&w=800&q=85",
      link: "/collections/bedroom-furniture"
    },
    {
      title: "Hand Carving",
      subHeading: "High-Relief Woodcarving",
      description: "Hereditary Chinioti master chisel work, fluted octagonal pedestals, and relief-carved floral aprons across solid timber.",
      image: "https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&w=800&q=85",
      link: "/collections/living-room-furniture"
    },
    {
      title: "Haute Upholstery",
      subHeading: "Haute Poshish & Upholstery",
      description: "Eight-way hand-tied coil springs, channel tufting, and imported Belgian velvets tailored over sculpted solid wood frames.",
      image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=85",
      link: "/collections/living-room-furniture"
    }
  ],
  consultationHeading: "Free",
  consultationAccentWord: "Interior",
  consultationText: [
    "Our design directors collaborate with homeowners, architects, and interior designers to compose tailored spatial layouts.",
    "From customized dimensions and premium wood finishes to fabric selections, every detail is refined to match your residence.",
    "Connect directly with our senior furnishing team on WhatsApp to begin reviewing floor plans and timber samples."
  ],
  consultationImage: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=85",
  deliveryHeading: "Worldwide",
  deliveryAccentWord: "Delivery",
  deliveryText: "With over two decades of export experience, Ideal Furniture manages doorstep white-glove transport across Pakistan, the United Arab Emirates, the United Kingdom, North America, and Europe. Every piece is wrapped in moisture-resistant vapor barriers and custom-crated in treated timber to ensure perfect arrival.",
  deliveryImage: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1200&q=85",
  instagramImages: [
    "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=600&q=85",
    "https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&w=600&q=85",
    "https://images.unsplash.com/photo-1615066390971-03e4e1c36ddf?auto=format&fit=crop&w=600&q=85",
    "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=600&q=85",
    "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=600&q=85",
    "https://images.unsplash.com/photo-1616046229478-9901c5536a45?auto=format&fit=crop&w=600&q=85"
  ]
};

export const SEED_SETTINGS: SiteSettings = {
  whatsappNumber: WHATSAPP_NUMBER,
  primaryWhatsApp: WHATSAPP_NUMBER,
  messageTemplateProduct: "Assalam o Alaikum, I am interested in: {PRODUCT_NAME} ({PRODUCT_CODE}). Product link: {FULL_URL}. Please share price and availability.",
  messageTemplateGeneric: "Assalam o Alaikum, I would like to know more about Ideal Furniture.",
  address: "94-E/1, Ghalib Road, Gulberg III, Lahore, Pakistan",
  showroomHours: "Monday – Saturday: 11:00 AM – 08:00 PM (Sunday by appointment)",
  email: "inquiries@idealfurniture.pk",
  phone: SITE_CONFIG.phone,
  socialLinks: [
    { name: "Instagram", url: "https://instagram.com/idealfurniturepk" },
    { name: "Facebook", url: "https://facebook.com/idealfurniturelahore" },
    { name: "WhatsApp", url: `https://wa.me/${WHATSAPP_NUMBER}` }
  ],
  seoDefaults: {
    title: "Ideal Furniture – Handcrafted Luxury Furniture Lahore",
    description: "Solid Himalayan Walnut, aged Sheesham, and bespoke joinery handcrafted by master artisans in Lahore since 1989."
  }
};

export const SEED_USERS: User[] = [
  {
    id: "usr-admin-1",
    email: "admin@idealfurniture.pk",
    name: "Mian Tariq",
    role: "admin",
    createdAt: "2026-01-01T00:00:00Z"
  }
];

export const SEED_LEADS: Lead[] = [
  {
    id: "lead-101",
    name: "Mrs. Amina Qureshi",
    phone: "+92 321 4455667",
    city: "Islamabad (F-7)",
    productName: "Sheesh Mahal Poster Bed",
    message: "Requires matching 3-door wardrobe and dresser for bridal suite.",
    status: "In Discussion",
    source: "whatsapp_product",
    notes: "Requires matching 3-door wardrobe and dresser for bridal suite.",
    createdAt: "2026-02-20T16:20:00Z",
    updatedAt: "2026-02-20T16:20:00Z"
  },
  {
    id: "lead-102",
    name: "Dr. Farooq Malik",
    phone: "+92 300 8472911",
    city: "Lahore (DHA Phase 6)",
    productName: "Darbari Dining Table & Chairs",
    message: "Needs 12-seater setup with olive velvet upholstery.",
    status: "New",
    source: "whatsapp_product",
    notes: "Needs 12-seater setup with olive velvet upholstery.",
    createdAt: "2026-02-24T11:15:00Z",
    updatedAt: "2026-02-24T11:15:00Z"
  }
];
