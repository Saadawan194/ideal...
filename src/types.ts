export interface ProductOption {
  label: string;
  values: string[];
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  productCode: string;
  category: string;
  subCategory: string;
  spaces: string[];
  shortDescription: string;
  longDescription: string;
  material: string;
  finish: string;
  dimensions: string;
  seatingOrSize?: string;
  wood?: string;
  upholstery?: string;
  leadTime: string;
  madeIn?: string;
  options?: ProductOption[];
  featuredImage?: string;
  images: string[];
  tags?: string[];
  isFeatured?: boolean;
  isPublished: boolean;
  seoTitle?: string;
  seoDescription?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  order: number;
  subCategories: string[];
  image?: string;
  description?: string;
}

export interface Space {
  id: string;
  name: string;
  slug: string;
  image: string;
  description?: string;
  order: number;
}

export interface MediaItem {
  id: string;
  url: string;
  name: string;
  size?: string;
  createdAt: string;
}

export interface LeadNote {
  id: string;
  content: string;
  author: string;
  createdAt: string;
}

export type LeadSource =
  | 'whatsapp_product'
  | 'whatsapp_floating'
  | 'whatsapp_header'
  | 'whatsapp_slider'
  | 'contact_form'
  | 'callback_request'
  | 'consultation';

export type LeadStatus =
  | 'New'
  | 'Contacted'
  | 'In Discussion'
  | 'Quoted'
  | 'Negotiating'
  | 'Won'
  | 'Lost';

export interface Lead {
  id: string;
  name: string;
  phone: string;
  email?: string;
  city?: string;
  source: LeadSource;
  productId?: string;
  productName?: string;
  productCode?: string;
  message?: string;
  status: LeadStatus;
  preferredContactMethod?: 'phone' | 'email' | 'whatsapp';
  itemsOfInterest?: string[];
  assignedTo?: string;
  followUpAt?: string;
  notes?: string | LeadNote[];
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: 'admin' | 'sales';
  createdAt: string;
}

export interface SiteSettings {
  whatsappNumber: string;
  primaryWhatsApp?: string;
  secondaryPhone?: string;
  messageTemplateProduct: string;
  messageTemplateGeneric: string;
  address: string;
  showroomHours: string;
  email: string;
  phone: string;
  socialLinks: { name: string; url: string }[];
  seoDefaults: {
    title: string;
    description: string;
  };
}

export interface HomepageContent {
  heroVideoUrl: string;
  heroPosterUrl: string;
  heroEyebrow: string;
  heroHeading: string;
  heroSubtext: string;
  heroPrimaryCta: string;
  heroSecondaryCta: string;
  brandStatementHeading: string;
  brandStatementAccentWord: string;
  brandStatementText: string;
  signatureProductIds: string[];
  accessoriesProductIds: string[];
  textilesProductIds: string[];
  craftsmanshipItems: {
    title: string;
    subHeading: string;
    description: string;
    image: string;
    link: string;
  }[];
  consultationHeading: string;
  consultationAccentWord: string;
  consultationText: string[];
  consultationImage: string;
  deliveryHeading: string;
  deliveryAccentWord: string;
  deliveryText: string;
  deliveryImage: string;
  instagramImages: string[];
}
