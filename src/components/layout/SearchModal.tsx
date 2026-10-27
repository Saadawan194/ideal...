import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { db } from '../../lib/db';
import { Product } from '../../types';
import { CloseIcon, SearchIcon, WhatsAppIcon } from '../ui/Icons';
import { handleWhatsAppInquiry } from '../../lib/whatsapp';
import { MOTION_EASE } from '../../lib/motion';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [results, setResults] = useState<Product[]>([]);
  const navigate = useNavigate();
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    if (isOpen) {
      db.getProducts().then((data) => {
        const published = data.filter((p) => p.isPublished);
        setAllProducts(published);
        setResults(published.slice(0, 6));
      });
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      setQuery('');
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    if (!query.trim()) {
      setResults(allProducts.slice(0, 6));
      return;
    }

    const q = query.toLowerCase().trim();
    const filtered = allProducts.filter((p) =>
      p.name.toLowerCase().includes(q) ||
      p.productCode.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      p.subCategory.toLowerCase().includes(q) ||
      p.material?.toLowerCase().includes(q) ||
      p.wood?.toLowerCase().includes(q)
    );
    setResults(filtered);
  }, [query, allProducts]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="search-heading"
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

          {/* Modal Content Frame with subtle scale & spring-less precision */}
          <motion.div
            initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, scale: 0.98, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.98, y: -6 }}
            transition={{ duration: 0.25, ease: MOTION_EASE }}
            className="relative z-10 bg-white w-full max-w-3xl border border-neutral-200 rounded-2xl shadow-2xl p-6 sm:p-8 max-h-[85vh] flex flex-col"
          >
            {/* Search header */}
            <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
              <div className="flex items-center space-x-3 w-full pr-4">
                <SearchIcon size={20} className="text-neutral-400 shrink-0" />
                <input
                  id="search-heading"
                  type="text"
                  autoFocus
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search by collection, timber, or product code..."
                  className="w-full text-base font-sans text-neutral-900 bg-transparent focus:outline-hidden placeholder:text-neutral-400"
                />
              </div>
              <button
                onClick={onClose}
                className="text-neutral-400 hover:text-neutral-900 transition-colors p-1.5 rounded-full hover:bg-neutral-100 cursor-pointer"
                aria-label="Close search"
              >
                <CloseIcon size={20} />
              </button>
            </div>

            {/* Results count */}
            <div className="py-3 text-xs font-sans uppercase tracking-wider text-neutral-400 font-semibold">
              {query.trim() ? `${results.length} Pieces Found` : 'Featured Catalogue Pieces'}
            </div>

            {/* Scrollable list */}
            <div className="overflow-y-auto divide-y divide-neutral-100 pr-1">
              {results.length === 0 ? (
                <div className="py-12 text-center text-neutral-500 text-sm font-sans">
                  No matching pieces found. Contact our team directly on WhatsApp for custom furniture inquiries.
                </div>
              ) : (
                results.map((product) => (
                  <div
                    key={product.id}
                    className="py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                  >
                    <div
                      onClick={() => {
                        navigate(`/product/${product.slug}`);
                        onClose();
                      }}
                      className="flex items-center space-x-4 cursor-pointer group"
                    >
                      <div className="w-16 h-20 bg-neutral-100 rounded-lg overflow-hidden shrink-0 border border-neutral-200">
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                      <div>
                        <span className="text-xs font-sans uppercase tracking-wider text-neutral-500 font-semibold block">
                          {product.category} • #{product.productCode}
                        </span>
                        <h3 className="font-sans text-base font-bold text-neutral-900 group-hover:text-[#8C5921] transition-colors">
                          {product.name}
                        </h3>
                        <p className="text-xs text-neutral-600 line-clamp-1 font-sans mt-0.5">
                          {product.wood || product.material}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 shrink-0 w-full sm:w-auto">
                      <button
                        onClick={() => {
                          handleWhatsAppInquiry({
                            source: 'whatsapp_header',
                            productId: product.id,
                            productName: product.name,
                            productCode: product.productCode,
                          });
                        }}
                        className="px-3 py-1.5 rounded-lg border border-neutral-200 text-xs font-sans font-semibold text-neutral-800 hover:text-black hover:border-black flex items-center gap-1.5 transition-colors cursor-pointer active:scale-95"
                      >
                        <WhatsAppIcon size={12} className="text-[#25D366]" />
                        <span>Inquire</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
