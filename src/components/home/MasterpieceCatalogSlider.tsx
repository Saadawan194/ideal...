import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { Product } from '../../types';
import { WhatsAppIcon } from '../ui/Icons';
import { handleWhatsAppInquiry } from '../../lib/whatsapp';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { MOTION_EASE } from '../../lib/motion';

interface MasterpieceCatalogSliderProps {
  products: Product[];
}

export const MasterpieceCatalogSlider: React.FC<MasterpieceCatalogSliderProps> = ({ products }) => {
  const navigate = useNavigate();
  const shouldReduceMotion = useReducedMotion();

  // Smart silent rotation so it starts on a fresh image on every refresh & day
  const [refreshOffset] = useState<number>(() => {
    const today = new Date();
    const daySeed = today.getDate() * 7 + (today.getMonth() + 1) * 11;
    const sessionRandom = Math.floor(Math.random() * 30);
    return daySeed + sessionRandom;
  });

  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [direction, setDirection] = useState<number>(1);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [touchStartX, setTouchStartX] = useState<number>(0);
  const [touchEndX, setTouchEndX] = useState<number>(0);

  // Filter valid published products with images
  const catalogList = useMemo(() => {
    const valid = products.filter((p) => p.isPublished && p.images && p.images.length > 0);
    if (valid.length === 0) return [];
    const offset = refreshOffset % valid.length;
    return [...valid.slice(offset), ...valid.slice(0, offset)];
  }, [products, refreshOffset]);

  const totalItems = catalogList.length;

  const handleNext = useCallback(() => {
    if (totalItems <= 1) return;
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % totalItems);
  }, [totalItems]);

  const handlePrev = useCallback(() => {
    if (totalItems <= 1) return;
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + totalItems) % totalItems);
  }, [totalItems]);

  // Smooth auto-slide every 5 seconds
  useEffect(() => {
    if (isPaused || totalItems <= 1) return;
    const timer = setInterval(() => {
      handleNext();
    }, 5000);
    return () => clearInterval(timer);
  }, [isPaused, totalItems, handleNext]);

  // Keyboard navigation
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handleNext, handlePrev]);

  // Touch swipe support
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEndX(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStartX || !touchEndX) return;
    const diff = touchStartX - touchEndX;
    if (diff > 40) {
      handleNext();
    } else if (diff < -40) {
      handlePrev();
    }
    setTouchStartX(0);
    setTouchEndX(0);
  };

  if (totalItems === 0) return null;

  const currentItem = catalogList[currentIndex];

  const handleWhatsApp = (e: React.MouseEvent) => {
    e.stopPropagation();
    handleWhatsAppInquiry({
      source: 'whatsapp_slider',
      productId: currentItem.id,
      productName: currentItem.name,
      productCode: currentItem.productCode,
      customMessage: `Assalam o Alaikum, I would like to inquire about "${currentItem.name}" (Code #${currentItem.productCode || 'IF-2026'}).`,
    });
  };

  return (
    <section className="w-full bg-[#0C0A09] text-white py-12 sm:py-16 border-b border-neutral-800 select-none">
      <div className="max-w-[1100px] mx-auto px-4 sm:px-6 md:px-8">
        {/* Simple Minimal Header */}
        <div className="flex items-end justify-between mb-6 pb-4 border-b border-neutral-800">
          <div>
            <span className="text-[11px] uppercase tracking-[0.2em] text-[#D4A368] font-bold block mb-1">
              Catalog Gallery
            </span>
            <h2 className="font-sans text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Featured Creations
            </h2>
          </div>

          {/* Simple Slide Counter & Arrow Controls */}
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs text-neutral-400">
              <span className="text-white font-bold">{currentIndex + 1}</span> / {totalItems}
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={handlePrev}
                className="w-8 h-8 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer active:scale-95"
                aria-label="Previous image"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={handleNext}
                className="w-8 h-8 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer active:scale-95"
                aria-label="Next image"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* SINGLE CATALOG CARD */}
        <div
          className="relative w-full"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div
            onClick={() => navigate(`/product/${currentItem.slug}`)}
            className="group cursor-pointer bg-neutral-950 rounded-xl overflow-hidden border border-neutral-800 shadow-xl transition-colors duration-300 hover:border-neutral-700"
          >
            {/* Image Container with Smooth Directional Crossfade */}
            <div className="relative aspect-16/10 sm:aspect-16/9 w-full bg-neutral-900 overflow-hidden">
              <AnimatePresence initial={false} mode="wait">
                <motion.img
                  key={currentItem.id}
                  src={currentItem.images[0]}
                  alt={currentItem.name}
                  loading="eager"
                  initial={
                    shouldReduceMotion
                      ? { opacity: 0 }
                      : { opacity: 0, x: direction > 0 ? 30 : -30 }
                  }
                  animate={{ opacity: 1, x: 0 }}
                  exit={
                    shouldReduceMotion
                      ? { opacity: 0 }
                      : { opacity: 0, x: direction > 0 ? -30 : 30 }
                  }
                  transition={{ duration: 0.4, ease: MOTION_EASE }}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.03]"
                />
              </AnimatePresence>

              {/* Prev & Next Floating Buttons directly on image */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handlePrev();
                }}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/70 hover:bg-black text-white border border-neutral-700 flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer shadow-lg z-10"
                aria-label="Previous"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleNext();
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/70 hover:bg-black text-white border border-neutral-700 flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer shadow-lg z-10"
                aria-label="Next"
              >
                <ChevronRight size={20} />
              </button>
            </div>

            {/* Simple Card Footer Details */}
            <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-neutral-950">
              <div>
                <span className="text-[11px] font-sans text-[#D4A368] font-semibold uppercase tracking-wider block">
                  {currentItem.category} {currentItem.wood ? `• ${currentItem.wood}` : ''}
                </span>
                <h3 className="font-sans text-xl sm:text-2xl font-bold text-white group-hover:text-[#D4A368] transition-colors mt-0.5">
                  {currentItem.name}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleWhatsApp}
                  className="px-4 py-2 rounded-lg bg-[#18181B] hover:bg-[#20BA56] border border-neutral-700 hover:border-[#20BA56] text-white flex items-center gap-2 text-xs font-semibold transition-all duration-200 cursor-pointer active:scale-95"
                >
                  <WhatsAppIcon size={14} className="text-[#25D366] group-hover:text-white" />
                  <span>Inquire Price</span>
                </button>
                <div className="w-8 h-8 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center justify-center text-neutral-400 group-hover:text-white transition-colors">
                  <span className="text-xs group-hover:translate-x-0.5 transition-transform duration-200">→</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
