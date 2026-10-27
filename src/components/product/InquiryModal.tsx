import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { CloseIcon, WhatsAppIcon } from '../ui/Icons';
import { db } from '../../lib/db';
import { buildWhatsAppLink } from '../../config/site';
import { Product } from '../../types';
import { MOTION_EASE } from '../../lib/motion';

interface InquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
  product?: Product;
}

export const InquiryModal: React.FC<InquiryModalProps> = ({ isOpen, onClose, product }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setSubmitted(false);
      setMessage(
        product
          ? `I am interested in ${product.name} (${product.productCode}). Please arrange a design callback.`
          : 'I would like to request a callback regarding your furniture collection.'
      );
    } else {
      document.body.style.overflow = '';
      setName('');
      setPhone('');
      setCity('');
      setMessage('');
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen, product]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;

    setIsSubmitting(true);
    try {
      await db.createLead({
        name,
        phone,
        city: city || 'Unspecified',
        source: 'callback_request',
        productId: product?.id,
        productName: product?.name,
        productCode: product?.productCode,
        message,
        status: 'New',
        assignedTo: 'Unassigned',
      });
      setSubmitted(true);
    } catch {
      setSubmitted(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const whatsappMessage = product
    ? `Assalam o Alaikum, my name is ${name || 'a customer'}. I requested a callback for ${product.name} (${product.productCode}).`
    : `Assalam o Alaikum, my name is ${name || 'a customer'}. I would like to arrange a design callback.`;

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="inquiry-title"
        >
          {/* Backdrop with smooth blur transition */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: MOTION_EASE }}
            onClick={onClose}
            className="fixed inset-0 bg-ink/60 backdrop-blur-xs"
          />

          {/* Modal Container */}
          <motion.div
            initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, scale: 0.98, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.98, y: 6 }}
            transition={{ duration: 0.25, ease: MOTION_EASE }}
            className="relative z-10 bg-white border border-neutral-200 rounded-2xl shadow-2xl w-full max-w-lg p-6 sm:p-10"
          >
            <button
              onClick={onClose}
              className="absolute right-6 top-6 text-neutral-400 hover:text-neutral-900 transition-colors p-1.5 rounded-full hover:bg-neutral-100 cursor-pointer"
              aria-label="Close modal"
            >
              <CloseIcon size={20} />
            </button>

            {submitted ? (
              <div className="py-4 space-y-5">
                <span className="eyebrow">Request Received</span>
                <h2 id="inquiry-title" className="font-sans text-2xl font-bold text-neutral-900">
                  Thank You for Your Inquiry
                </h2>
                <p className="text-sm font-sans text-neutral-600 leading-relaxed font-normal">
                  Your request has been received. Our team will contact you on WhatsApp or phone shortly.
                </p>
                <div className="pt-4 border-t border-neutral-100 flex flex-col sm:flex-row gap-3">
                  <a
                    href={buildWhatsAppLink(whatsappMessage)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary flex items-center justify-center space-x-2 w-full text-center"
                  >
                    <WhatsAppIcon size={16} />
                    <span>Continue on WhatsApp</span>
                  </a>
                  <button
                    type="button"
                    onClick={onClose}
                    className="btn-secondary w-full text-center"
                  >
                    Close
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div className="space-y-1 mb-6">
                  <span className="eyebrow">Customer Support</span>
                  <h2 id="inquiry-title" className="font-sans text-2xl sm:text-3xl font-bold text-neutral-900">
                    Request a Callback
                  </h2>
                  {product && (
                    <p className="text-xs font-sans text-neutral-500">
                      Regarding: {product.name} (#{product.productCode})
                    </p>
                  )}
                </div>

                <form onSubmit={handleSubmit} className="space-y-4 text-xs font-sans">
                  <div>
                    <label className="block text-neutral-600 font-semibold mb-1">Your Full Name *</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Tariq Khan"
                      className="w-full px-3.5 py-2.5 rounded-lg border border-neutral-200 focus:border-neutral-900 focus:outline-hidden text-neutral-900 text-xs transition-colors"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-neutral-600 font-semibold mb-1">Phone / WhatsApp *</label>
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="0300 1234567"
                        className="w-full px-3.5 py-2.5 rounded-lg border border-neutral-200 focus:border-neutral-900 focus:outline-hidden text-neutral-900 text-xs transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-neutral-600 font-semibold mb-1">City / Region</label>
                      <input
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="e.g. Lahore / Dubai"
                        className="w-full px-3.5 py-2.5 rounded-lg border border-neutral-200 focus:border-neutral-900 focus:outline-hidden text-neutral-900 text-xs transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-neutral-600 font-semibold mb-1">Inquiry / Customization Notes</label>
                    <textarea
                      rows={3}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-neutral-200 focus:border-neutral-900 focus:outline-hidden text-neutral-900 text-xs transition-colors"
                    />
                  </div>

                  <div className="pt-2 flex flex-col sm:flex-row gap-3">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="btn-primary w-full justify-center disabled:opacity-50"
                    >
                      {isSubmitting ? 'Submitting...' : 'Submit Request'}
                    </button>
                    <button
                      type="button"
                      onClick={onClose}
                      className="btn-secondary w-full justify-center"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
