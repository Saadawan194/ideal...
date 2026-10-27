import React from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { AnnouncementBar } from './AnnouncementBar';
import { Header } from './Header';
import { Footer } from './Footer';
import { FloatingWhatsApp } from './FloatingWhatsApp';
import { MOTION_EASE } from '../../lib/motion';

interface LayoutProps {
  children: React.ReactNode;
  isTransparentOnTop?: boolean;
}

export const Layout: React.FC<LayoutProps> = ({ children, isTransparentOnTop = false }) => {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className="min-h-screen flex flex-col bg-white text-neutral-900 selection:bg-blue-600 selection:text-white">
      <AnnouncementBar />
      <Header isTransparentOnTop={isTransparentOnTop} />
      <motion.main
        initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, ease: MOTION_EASE }}
        className={`flex-1 w-full ${isTransparentOnTop ? '-mt-16 sm:-mt-20' : ''}`}
      >
        {children}
      </motion.main>
      <Footer />
      <FloatingWhatsApp />
    </div>
  );
};
