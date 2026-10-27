import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { SITE_CONFIG } from '../../config/site';
import { handleWhatsAppInquiry } from '../../lib/whatsapp';
import { WhatsAppIcon } from '../ui/Icons';

export const Footer: React.FC = () => {
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleWhatsAppClick = (e: React.MouseEvent) => {
    e.preventDefault();
    handleWhatsAppInquiry({
      source: 'whatsapp_header',
      customMessage: 'Assalam o Alaikum, I would like to inquire about Ideal Furniture luxury pieces and showroom viewing.',
    });
  };

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterEmail.trim()) {
      setSubscribed(true);
      setNewsletterEmail('');
    }
  };

  return (
    <footer className="bg-[#0C0A09] text-white border-t border-neutral-800/80 pt-16 sm:pt-20 pb-12">
      <div className="max-w-[1440px] mx-auto px-5 sm:px-8 md:px-12 lg:px-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-14 pb-14 border-b border-neutral-800 text-[13px] font-sans">
          {/* Column 1: Brand & Showroom (3.5 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <Link to="/" className="block">
              <span className="font-sans text-2xl tracking-tight uppercase text-white block font-bold">
                IDEAL FURNITURE
              </span>
              <span className="text-[10px] uppercase tracking-[0.2em] text-[#D4A368] block mt-1 font-semibold">
                Luxury Handcrafted Furniture • Est. 1989
              </span>
            </Link>
            <p className="text-neutral-400 leading-relaxed font-sans text-xs max-w-sm font-normal">
              Crafting solid Sheesham and aged Himalayan walnut furniture since 1989. Every piece is sculpted by master craftsmen and finished with premium custom upholstery.
            </p>
            <div className="space-y-2 pt-2 text-neutral-300 text-xs">
              <p className="text-neutral-400">
                Lahore Showroom: 94-E/1, Ghalib Road, Gulberg III, Lahore
              </p>
              <p className="text-neutral-400">
                Islamabad Gallery: Beverly Centre, Blue Area
              </p>
              <p className="pt-1">
                <button
                  onClick={handleWhatsAppClick}
                  className="flex items-center gap-2 text-[#D4A368] hover:text-white transition-colors cursor-pointer font-semibold"
                >
                  <WhatsAppIcon size={15} className="text-[#25D366]" />
                  <span>WhatsApp: {SITE_CONFIG.phone.startsWith('+') ? SITE_CONFIG.phone : `+${SITE_CONFIG.phone}`}</span>
                </button>
              </p>
            </div>
          </div>

          {/* Column 2: 5 Furniture Categories (4 cols, 2 sub-columns) */}
          <div className="lg:col-span-4 space-y-4">
            <h3 className="font-sans text-[11px] uppercase tracking-[0.2em] text-[#D4A368] font-bold">
              Furniture Collections
            </h3>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 text-neutral-400 text-xs font-normal">
              <Link to="/collections/bedroom-furniture" className="hover:text-white transition-colors truncate">
                1. Bedroom Furniture
              </Link>
              <Link to="/collections/living-room-furniture" className="hover:text-white transition-colors truncate">
                2. Living Room
              </Link>
              <Link to="/collections/dining-room-furniture" className="hover:text-white transition-colors truncate">
                3. Dining Room
              </Link>
              <Link to="/collections/office-furniture" className="hover:text-white transition-colors truncate">
                4. Office Furniture
              </Link>
              <Link to="/collections/custom-furniture" className="hover:text-white transition-colors truncate col-span-2">
                5. Custom Made & Bespoke
              </Link>
              <div className="col-span-2 pt-2 border-t border-neutral-800">
                <Link to="/collections/all" className="text-[#D4A368] hover:text-white transition-colors font-semibold flex items-center gap-1">
                  <span>View Full Furniture Catalog</span>
                  <span>→</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Column 3: Company & Information (2 cols) */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="font-sans text-[11px] uppercase tracking-[0.2em] text-[#D4A368] font-bold">
              Company
            </h3>
            <ul className="space-y-2.5 text-neutral-400 text-xs font-normal">
              <li>
                <Link to="/about" className="hover:text-white transition-colors">
                  Heritage & Joinery
                </Link>
              </li>
              <li>
                <Link to="/projects" className="hover:text-white transition-colors">
                  Client Projects
                </Link>
              </li>
              <li>
                <Link to="/spaces" className="hover:text-white transition-colors">
                  Curated Spaces
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-white transition-colors">
                  Showrooms
                </Link>
              </li>
              <li>
                <Link to="/faqs" className="hover:text-white transition-colors">
                  Worldwide Freight
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Newsletter / Catalog (2 cols) */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="font-sans text-[11px] uppercase tracking-[0.2em] text-[#D4A368] font-bold">
              Private Inquiries
            </h3>
            <p className="text-neutral-400 text-xs font-normal leading-relaxed">
              Receive updates on seasonal wood releases and private showroom viewings.
            </p>
            {subscribed ? (
              <p className="text-xs text-[#25D366] font-medium">Thank you for subscribing.</p>
            ) : (
              <form onSubmit={handleSubscribe} className="space-y-2">
                <input
                  type="email"
                  required
                  placeholder="Enter email..."
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-neutral-900 border border-neutral-700 text-white rounded focus:border-[#D4A368] focus:outline-hidden"
                />
                <button
                  type="submit"
                  className="w-full py-2 bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-bold uppercase tracking-wider rounded transition-colors cursor-pointer"
                >
                  Subscribe
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-neutral-500 font-sans gap-3">
          <p>© {new Date().getFullYear()} Ideal Furniture Pakistan. All rights reserved.</p>
          <div className="flex items-center space-x-6">
            <Link to="/terms" className="hover:text-neutral-300 transition-colors">
              Terms & Commissions
            </Link>
            <Link to="/privacy" className="hover:text-neutral-300 transition-colors">
              Privacy Policy
            </Link>
            <Link to="/admin/login" className="hover:text-neutral-300 transition-colors font-mono">
              Staff Portal
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
