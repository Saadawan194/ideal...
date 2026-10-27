import { buildWhatsAppLink, createGenericInquiryMessage, createProductInquiryMessage } from '../config/site';
import { db } from './db';
import { LeadSource } from '../types';

export interface WhatsAppActionParams {
  source: LeadSource;
  productId?: string;
  productName?: string;
  productCode?: string;
  customMessage?: string;
  clientInfo?: {
    name?: string;
    phone?: string;
    city?: string;
    email?: string;
  };
}

/**
 * Centrally handles all WhatsApp interactions:
 * 1. Prepares custom or standard inquiry text
 * 2. Asynchronously logs lead into database abstraction
 * 3. Opens WhatsApp in new window
 */
export async function handleWhatsAppInquiry(params: WhatsAppActionParams): Promise<void> {
  let message = params.customMessage;
  if (!message) {
    if (params.productName && params.productCode) {
      message = createProductInquiryMessage(params.productName, params.productCode);
    } else {
      message = createGenericInquiryMessage();
    }
  }

  // Record inquiry to the CRM database
  try {
    await db.logInquiry({
      name: params.clientInfo?.name,
      phone: params.clientInfo?.phone,
      email: params.clientInfo?.email,
      city: params.clientInfo?.city,
      source: params.source,
      productId: params.productId,
      productName: params.productName,
      productCode: params.productCode,
      message,
    });
  } catch {
    // Non-blocking fallback if logging fails
  }

  // Open WhatsApp securely without triggering iframe popup blockers
  const url = buildWhatsAppLink(message);
  if (typeof window !== 'undefined') {
    try {
      const a = document.createElement('a');
      a.href = url;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  }
}
