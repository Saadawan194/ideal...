import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { WhatsAppIcon } from '../ui/Icons';
import { handleWhatsAppInquiry } from '../../lib/whatsapp';
import { MOTION_EASE } from '../../lib/motion';

export const FLOATING_WHATSAPP_CLICKS_KEY = 'ideal_floating_whatsapp_clicks';
export const FLOATING_WHATSAPP_HISTORY_KEY = 'ideal_floating_whatsapp_click_history';

export const getFloatingWhatsAppClickCount = (): number => {
  try {
    const count = parseInt(localStorage.getItem(FLOATING_WHATSAPP_CLICKS_KEY) || '0', 10);
    return isNaN(count) ? 0 : count;
  } catch {
    return 0;
  }
};

export const FloatingWhatsApp: React.FC = () => {
  const [visible, setVisible] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    const checkScroll = () => {
      setVisible(window.scrollY > 350);
    };
    window.addEventListener('scroll', checkScroll, { passive: true });
    checkScroll();
    return () => window.removeEventListener('scroll', checkScroll);
  }, []);

  const handleClick = () => {
    try {
      const currentCount = parseInt(localStorage.getItem(FLOATING_WHATSAPP_CLICKS_KEY) || '0', 10);
      const nextCount = (isNaN(currentCount) ? 0 : currentCount) + 1;
      localStorage.setItem(FLOATING_WHATSAPP_CLICKS_KEY, nextCount.toString());

      const clickEntry = {
        clickIndex: nextCount,
        timestamp: new Date().toISOString(),
        page: window.location.pathname,
      };
      const existingHistoryRaw = localStorage.getItem(FLOATING_WHATSAPP_HISTORY_KEY);
      const history = existingHistoryRaw ? JSON.parse(existingHistoryRaw) : [];
      history.push(clickEntry);
      if (history.length > 50) history.shift();
      localStorage.setItem(FLOATING_WHATSAPP_HISTORY_KEY, JSON.stringify(history));
    } catch (err) {
      console.warn('Could not update WhatsApp click counter in localStorage:', err);
    }

    handleWhatsAppInquiry({
      source: 'whatsapp_floating',
      customMessage: 'Assalam o Alaikum, I would like to inquire about Ideal Furniture catalogue and showroom viewing.',
    });
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 12, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 8, scale: 0.95 }}
          transition={{ duration: 0.25, ease: MOTION_EASE }}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleClick}
          aria-label="Chat on WhatsApp with Ideal Furniture"
          className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-40 group flex items-center gap-2 sm:gap-2.5 bg-neutral-950/95 hover:bg-neutral-900 text-white p-3 sm:pl-4 sm:pr-5 sm:py-3 rounded-full border border-neutral-800 hover:border-[#25D366] transition-colors duration-200 shadow-xl cursor-pointer backdrop-blur-md"
        >
          <div className="relative flex items-center justify-center">
            <WhatsAppIcon size={18} className="text-[#25D366]" />
            <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-[#25D366]" />
          </div>
          <div className="hidden sm:flex flex-col items-start text-left">
            <span className="text-xs font-sans font-bold tracking-wide text-white">
              Ideal Furniture
            </span>
            <span className="text-[10px] font-sans text-neutral-400 font-medium">
              Chat on WhatsApp
            </span>
          </div>
        </motion.button>
      )}
    </AnimatePresence>
  );
};
