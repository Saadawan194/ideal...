import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { handleWhatsAppInquiry } from '../../lib/whatsapp';
import { ChevronIcon, WhatsAppIcon } from '../ui/Icons';
import { MOTION_EASE } from '../../lib/motion';

interface Slide {
  id: number;
  eyebrow: string;
  heading: string;
  subtext: string;
  image: string;
  categoryLink: string;
  categoryName: string;
}

const HERO_SLIDES: Slide[] = [
  {
    id: 1,
    eyebrow: '2026 FURNITURE COLLECTION • LAHORE SHOWROOM',
    heading: 'Modern Living & Luxury Sofas',
    subtext: 'Curated curved sectionals, jewel velvet drawing room suites, and titanium gold brushed plinths made for contemporary homes.',
    image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1280&q=75',
    categoryLink: '/collections/seating',
    categoryName: 'Explore Living Suites',
  },
  {
    id: 2,
    eyebrow: 'HERITAGE WOODCRAFT • SOLID HARDWOOD',
    heading: 'The Royal Chinioti Master Bedsteads',
    subtext: 'Hereditary hand-planed Sheesham timbers, architectural high-relief crown headboards, and luxurious silk velvet upholstery built to endure.',
    image: 'https://images.unsplash.com/photo-1540518614846-7ede433c4ef0?auto=format&fit=crop&w=1280&q=75',
    categoryLink: '/collections/beds',
    categoryName: 'Explore Bed Sets',
  },
  {
    id: 3,
    eyebrow: 'FINE DINING & GATHERINGS',
    heading: 'Palatial Refectory Dining Suites',
    subtext: 'Solid Himalayan Walnut with traditional mortise-and-tenon joinery, carved architectural pedestals, and sculpted dining seating.',
    image: 'https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&w=1280&q=75',
    categoryLink: '/collections/dining',
    categoryName: 'Explore Dining Suites',
  },
  {
    id: 4,
    eyebrow: 'CUSTOM HOME DESIGNS',
    heading: 'Architectural Consoles & Credenzas',
    subtext: 'Hand-finished statement consoles, solid walnut credenzas, and tailored timber heirloom suites sculpted for prestigious homes.',
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1280&q=75',
    categoryLink: '/collections/storage',
    categoryName: 'Explore Storage & Consoles',
  },
];

export const HeroSection: React.FC = () => {
  const navigate = useNavigate();
  const [currentSlideIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [isPaused]);

  const currentSlide = HERO_SLIDES[currentSlideIndex];

  const handleConsultation = () => {
    handleWhatsAppInquiry({
      source: 'consultation',
      customMessage: `Assalam o Alaikum, I would like to schedule a private viewing or custom consultation for "${currentSlide.heading}".`,
    });
  };

  return (
    <section
      className="relative w-full h-[86vh] min-h-[540px] sm:min-h-[620px] max-h-[920px] bg-neutral-950 overflow-hidden flex flex-col justify-between"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Background Images with smooth cinematic crossfade & slow subtle scale */}
      {HERO_SLIDES.map((slide, idx) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            idx === currentSlideIndex ? 'opacity-100 z-0' : 'opacity-0 -z-10'
          }`}
          style={{ willChange: 'opacity' }}
        >
          <img
            src={slide.image}
            alt={slide.heading}
            fetchPriority={idx === 0 ? 'high' : 'low'}
            loading={idx === 0 ? 'eager' : 'lazy'}
            decoding={idx === 0 ? 'sync' : 'async'}
            className="w-full h-full object-cover scale-102 transition-transform duration-[7000ms] ease-out"
          />
        </div>
      ))}

      {/* Cinematic Vignette */}
      <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/95 via-neutral-950/50 to-neutral-950/30 z-10 pointer-events-none" />

      {/* Empty top spacing for header */}
      <div className="relative z-20 h-16 sm:h-24" />

      {/* Main Content Center-Bottom */}
      <div className="relative z-20 max-w-[1440px] w-full mx-auto px-4 sm:px-8 md:px-12 lg:px-16 pb-6 sm:pb-16 flex-1 flex flex-col justify-end">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 sm:gap-12">
          {/* Left Text Block with Staggered Entrance */}
          <div className="max-w-2xl text-white space-y-3 sm:space-y-4">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide.id}
                initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -10 }}
                transition={{ duration: 0.5, ease: MOTION_EASE }}
                className="space-y-3 sm:space-y-4"
              >
                <div className="flex items-center gap-2.5 sm:gap-3">
                  <span className="h-px w-6 sm:w-8 bg-[#D4A368]" />
                  <span className="text-[10px] sm:text-[11px] font-sans uppercase tracking-[0.2em] sm:tracking-[0.22em] text-[#D4A368] font-bold">
                    {currentSlide.eyebrow}
                  </span>
                </div>

                <h1 className="font-sans text-2xl sm:text-4xl md:text-5xl lg:text-6xl text-white font-bold leading-[1.15] sm:leading-[1.1] tracking-tight">
                  {currentSlide.heading}
                </h1>

                <p className="text-xs sm:text-base text-neutral-200 font-sans font-normal leading-relaxed max-w-xl line-clamp-2 sm:line-clamp-none">
                  {currentSlide.subtext}
                </p>

                {/* Action Buttons - Fully Mobile Friendly */}
                <div className="pt-1 sm:pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3.5">
                  <button
                    onClick={() => navigate(currentSlide.categoryLink)}
                    className="btn-white w-full sm:w-auto justify-center"
                  >
                    <span>{currentSlide.categoryName}</span>
                    <span>→</span>
                  </button>
                  <button
                    onClick={handleConsultation}
                    className="btn-outline-white w-full sm:w-auto justify-center"
                  >
                    <WhatsAppIcon size={14} className="text-[#25D366]" />
                    <span>Book Private Viewing</span>
                  </button>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Right Slide Selector - Clean Modern Index */}
          <div className="flex items-center justify-between sm:justify-start gap-4 sm:gap-6 pb-1 sm:pb-2">
            <div className="flex items-center gap-2">
              {HERO_SLIDES.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={`h-1.5 transition-all duration-300 rounded-full cursor-pointer ${
                    idx === currentSlideIndex ? 'w-7 sm:w-8 bg-[#D4A368]' : 'w-2 bg-white/50 hover:bg-white/90'
                  }`}
                  aria-label={`Slide ${idx + 1}`}
                />
              ))}
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() =>
                  setCurrentIndex((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length)
                }
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg border border-white/30 hover:border-white text-white flex items-center justify-center transition-colors cursor-pointer bg-black/40 hover:bg-black/60 backdrop-blur-xs"
                aria-label="Previous"
              >
                <ChevronIcon size={13} direction="left" />
              </button>
              <button
                onClick={() => setCurrentIndex((prev) => (prev + 1) % HERO_SLIDES.length)}
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg border border-white/30 hover:border-white text-white flex items-center justify-center transition-colors cursor-pointer bg-black/40 hover:bg-black/60 backdrop-blur-xs"
                aria-label="Next"
              >
                <ChevronIcon size={13} direction="right" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Showroom Distinction Strip - Smooth Responsive */}
      <div className="relative z-20 border-t border-white/10 bg-neutral-950 py-3 px-4 sm:px-8 overflow-x-auto no-scrollbar">
        <div className="max-w-[1440px] mx-auto flex items-center justify-start sm:justify-between gap-4 sm:gap-6 text-[10.5px] sm:text-[11px] font-sans text-neutral-300 tracking-wider whitespace-nowrap min-w-max sm:min-w-0">
          <div>Lahore Flagship Showroom & Custom Workshop</div>
          <span className="text-neutral-700">•</span>
          <div>Solid Himalayan Walnut & Aged Rosewood</div>
          <span className="text-neutral-700">•</span>
          <div>Custom Dimensions & Tailored Poshish</div>
          <span className="text-neutral-700">•</span>
          <div>Nationwide & Worldwide Secure Delivery</div>
        </div>
      </div>
    </section>
  );
};
