/**
 * Ideal Furniture – Central Site Configuration
 * Single source of truth for contact info, brand metadata, and WhatsApp integration.
 */

export const WHATSAPP_NUMBER = "923001234567"; // Placeholder, single source of truth

export const SITE_CONFIG = {
  name: "Ideal Furniture",
  tagline: "Furniture as Art",
  description: "Handcrafted luxury furniture, master bed sets, luxury sofas, dining suites, and solid wood cabinetry. Made in Pakistan with worldwide delivery.",
  address: "94-E/1, Ghalib Road, Gulberg III, Lahore, Pakistan",
  email: "inquiries@idealfurniture.pk",
  phone: "+92 42 3575 8899",
  showroomHours: "Monday – Saturday: 11:00 AM – 08:00 PM (Sunday by appointment)",
  socials: [
    { name: "Facebook", url: "https://facebook.com" },
    { name: "Instagram", url: "https://instagram.com" },
    { name: "YouTube", url: "https://youtube.com" },
    { name: "Pinterest", url: "https://pinterest.com" }
  ],
  announcementText: "Handcrafted in Pakistan • Worldwide Delivery • Chat with us on WhatsApp",
  defaultProductWhatsAppTemplate: "Assalam o Alaikum, I am interested in: {PRODUCT_NAME} ({PRODUCT_CODE}). Product link: {FULL_URL}. Please share price and availability.",
  defaultGenericWhatsAppTemplate: "Assalam o Alaikum, I would like to know more about Ideal Furniture."
};

/**
 * Builds standard WhatsApp deep link
 */
export function buildWhatsAppLink(message: string, customNumber?: string): string {
  const number = customNumber || WHATSAPP_NUMBER;
  const cleanNumber = number.replace(/[^0-9]/g, "");
  return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`;
}

/**
 * Pre-fills standard inquiry message for a specific product
 */
export function createProductInquiryMessage(
  productName: string,
  productCode: string,
  productUrl?: string
): string {
  const url = productUrl || (typeof window !== "undefined" ? window.location.href : "");
  return `Assalam o Alaikum, I am interested in: ${productName} (${productCode}). Product link: ${url}. Please share price and availability.`;
}

/**
 * Pre-fills generic inquiry message
 */
export function createGenericInquiryMessage(): string {
  return SITE_CONFIG.defaultGenericWhatsAppTemplate;
}
