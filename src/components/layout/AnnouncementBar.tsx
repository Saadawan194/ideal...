import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { MOTION_EASE } from '../../lib/motion';

export const AnnouncementBar: React.FC = () => {
  const [isVisible, setIsVisible] = useState(true);
  const shouldReduceMotion = useReducedMotion();

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.aside
          initial={{ height: 'auto', opacity: 1 }}
          exit={shouldReduceMotion ? { opacity: 0 } : { height: 0, opacity: 0 }}
          transition={{ duration: 0.25, ease: MOTION_EASE }}
          aria-label="Announcement"
          className="relative z-50 bg-[#0C0A09] text-neutral-300 border-b border-neutral-800 text-[11px] font-sans selection:bg-[#B89360] selection:text-black overflow-hidden"
        >
          <div className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-10 lg:px-14 py-2 sm:py-2.5 flex items-center justify-between gap-4">
            {/* Left: Clean Showrooms & Global Delivery Text */}
            <div className="hidden lg:flex items-center space-x-3 text-neutral-300 text-[11px] font-medium tracking-wide">
              <Link
                to="/contact"
                className="hover:text-white transition-colors"
              >
                <span className="text-neutral-400">Showrooms:</span>{' '}
                <span className="text-neutral-200">Lahore • Islamabad</span>
              </Link>
              <span className="text-neutral-700">|</span>
              <span className="text-neutral-400">Nationwide & Worldwide Delivery</span>
            </div>

            {/* Center: Clean Architectural Brand Statement */}
            <div className="flex-1 text-left sm:text-center text-[10.5px] uppercase tracking-[0.16em]">
              <span className="text-neutral-100 font-medium">Flagship 2026</span>
              <span className="mx-2 text-neutral-600">•</span>
              <span className="text-[#C5A070] font-normal">Handcrafted Solid Wood Furniture</span>
            </div>

            {/* Right: Quick Showroom/Contact & Dismiss (No duplicate WhatsApp button) */}
            <div className="flex items-center space-x-3 sm:space-x-4 shrink-0">
              <Link
                to="/contact"
                className="hidden sm:inline-block text-[11px] text-neutral-400 hover:text-white font-medium transition-colors"
              >
                Showroom Visit
              </Link>
              {/* Dismiss button */}
              <button
                onClick={() => setIsVisible(false)}
                className="text-neutral-500 hover:text-neutral-200 transition-colors p-1 cursor-pointer"
                aria-label="Dismiss banner"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
};
