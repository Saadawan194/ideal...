import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { SearchIcon, CloseIcon, ChevronIcon, HamburgerIcon, WhatsAppIcon } from '../ui/Icons';
import { handleWhatsAppInquiry } from '../../lib/whatsapp';
import { SearchModal } from './SearchModal';
import { MOTION_EASE } from '../../lib/motion';
import { db } from '../../lib/db';
import { Category } from '../../types';

interface HeaderProps {
  isTransparentOnTop?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ isTransparentOnTop = false }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<'collections' | 'spaces' | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [dbCategories, setDbCategories] = useState<Category[]>([]);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const shouldReduceMotion = useReducedMotion();
  const location = useLocation();
  const navigate = useNavigate();

  const isHome = location.pathname === '/';
  const isTransparentMode = (isTransparentOnTop || isHome) && !isScrolled;

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 24);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    db.getCategories().then((data) => {
      if (Array.isArray(data) && data.length > 0) {
        setDbCategories([...data].sort((a, b) => a.order - b.order));
      }
    });
  }, []);

  useEffect(() => {
    setActiveDropdown(null);
    setMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  const handleMouseEnter = (menu: 'collections' | 'spaces') => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setActiveDropdown(menu);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setActiveDropdown(null);
    }, 180);
  };

  // Essential 5 Master Categories
  const fallbackCollections = [
    { title: 'Bedroom Furniture', path: '/collections/bedroom-furniture', desc: 'Beds, Sets, Wardrobes & Vanities', image: 'https://images.unsplash.com/photo-1540518614846-7ede433c4ef0?auto=format&fit=crop&w=300&q=80' },
    { title: 'Living Room Furniture', path: '/collections/living-room-furniture', desc: 'Sofas, Sectionals, Tables & Consoles', image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=300&q=80' },
    { title: 'Dining Room Furniture', path: '/collections/dining-room-furniture', desc: 'Dining Sets, Banquet Tables & Chairs', image: 'https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&w=300&q=80' },
    { title: 'Office Furniture', path: '/collections/office-furniture', desc: 'Executive Desks, Chairs & Workstations', image: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=300&q=80' },
    { title: 'Custom Furniture', path: '/collections/custom-furniture', desc: 'Bespoke Beds, Sofas & Custom Orders', image: 'https://images.unsplash.com/photo-1616046229478-9901c5536a45?auto=format&fit=crop&w=300&q=80' },
  ];

  const collectionsMenu = dbCategories.length > 0
    ? dbCategories.map((c, idx) => {
        const fb = fallbackCollections[idx % fallbackCollections.length];
        return {
          title: c.name,
          path: `/collections/${c.slug}`,
          desc: c.description || fb?.desc || 'Handcrafted Solid Wood',
          image: c.image || fb?.image || '',
        };
      })
    : fallbackCollections;

  const spacesMenu = [
    { name: 'Drawing & Living', slug: 'living-room', image: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=600&q=80' },
    { name: 'Master Bedroom', slug: 'bedroom', image: 'https://images.unsplash.com/photo-1540518614846-7ede433c4ef0?auto=format&fit=crop&w=600&q=80' },
    { name: 'Grand Dining', slug: 'dining-room', image: 'https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&w=600&q=80' },
  ];

  return (
    <>
      <header
        className={`sticky top-0 z-40 w-full transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          isTransparentMode
            ? 'bg-gradient-to-b from-black/85 via-black/45 to-transparent text-white'
            : 'bg-white/95 backdrop-blur-md text-neutral-900 border-b border-neutral-200/80 shadow-xs'
        }`}
      >
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-10 lg:px-14 h-16 sm:h-20 flex items-center justify-between">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-3 group focus:outline-hidden">
            <div className="flex flex-col">
              <span
                className={`font-sans text-xl sm:text-2xl tracking-tight font-extrabold uppercase leading-none transition-colors duration-200 ${
                  isTransparentMode ? 'text-white' : 'text-neutral-950 group-hover:text-[#B89360]'
                }`}
              >
                IDEAL FURNITURE
              </span>
              <span className="text-[9.5px] uppercase tracking-[0.16em] font-sans font-semibold text-[#B89360] mt-1">
                Handcrafted Luxury • Est. 1989
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-2 xl:space-x-3 text-[13px] font-sans font-medium">
            {/* Collections Dropdown */}
            <div
              className="relative py-3"
              onMouseEnter={() => handleMouseEnter('collections')}
              onMouseLeave={handleMouseLeave}
            >
              <button
                onClick={() => navigate('/collections/all')}
                className={`flex items-center gap-1.5 transition-colors duration-200 cursor-pointer px-3 py-1.5 rounded-lg ${
                  isTransparentMode
                    ? 'text-white/95 hover:text-white hover:bg-white/15'
                    : 'text-neutral-800 hover:text-black hover:bg-neutral-100'
                } ${activeDropdown === 'collections' ? (isTransparentMode ? 'bg-white/20 text-white' : 'bg-neutral-100 text-black font-semibold') : ''}`}
              >
                <span>Furniture</span>
                <ChevronIcon size={12} direction={activeDropdown === 'collections' ? 'up' : 'down'} />
              </button>

              {/* Collections Mega Menu - Clean 2-column Grid with Visual Category Thumbnails */}
              <AnimatePresence>
                {activeDropdown === 'collections' && (
                  <motion.div
                    initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 4 }}
                    transition={{ duration: 0.2, ease: MOTION_EASE }}
                    className="absolute top-full -left-12 w-[680px] bg-white text-neutral-900 rounded-xl shadow-2xl border border-neutral-200 p-4 grid grid-cols-2 gap-2 z-50 max-h-[78vh] overflow-y-auto"
                  >
                    {collectionsMenu.map((item, idx) => (
                      <Link
                        key={idx}
                        to={item.path}
                        className="p-2 rounded-lg hover:bg-neutral-100/80 transition-colors group/item flex items-center gap-3"
                      >
                        {item.image && (
                          <div className="w-12 h-12 rounded-lg overflow-hidden bg-neutral-100 border border-neutral-200 shrink-0">
                            <img
                              src={item.image}
                              alt={item.title}
                              className="w-full h-full object-cover group-hover/item:scale-105 transition-transform duration-300"
                            />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <span className="font-sans text-[13px] font-semibold text-neutral-950 group-hover/item:text-[#8C5921] transition-colors block truncate">
                            {item.title}
                          </span>
                          <span className="text-[11px] font-sans text-neutral-500 line-clamp-1 mt-0.5 block">
                            {item.desc}
                          </span>
                        </div>
                      </Link>
                    ))}

                    <div className="col-span-2 pt-3 mt-1 border-t border-neutral-100 flex items-center justify-between text-xs px-1">
                      <span className="text-neutral-500 font-sans">
                        Solid Himalayan Walnut & Sheesham • Custom Sizes Available
                      </span>
                      <Link to="/collections/all" className="text-[#8C5921] font-bold hover:underline">
                        Explore Full Catalog →
                      </Link>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Spaces Dropdown */}
            <div
              className="relative py-3"
              onMouseEnter={() => handleMouseEnter('spaces')}
              onMouseLeave={handleMouseLeave}
            >
              <button
                onClick={() => navigate('/spaces')}
                className={`flex items-center gap-1.5 transition-colors duration-200 cursor-pointer px-3 py-1.5 rounded-lg ${
                  isTransparentMode
                    ? 'text-white/95 hover:text-white hover:bg-white/15'
                    : 'text-neutral-800 hover:text-black hover:bg-neutral-100'
                } ${activeDropdown === 'spaces' ? (isTransparentMode ? 'bg-white/20 text-white' : 'bg-neutral-100 text-black font-semibold') : ''}`}
              >
                <span>Spaces</span>
                <ChevronIcon size={12} direction={activeDropdown === 'spaces' ? 'up' : 'down'} />
              </button>

              <AnimatePresence>
                {activeDropdown === 'spaces' && (
                  <motion.div
                    initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 4 }}
                    transition={{ duration: 0.2, ease: MOTION_EASE }}
                    className="absolute top-full -left-12 w-[540px] bg-white text-neutral-900 rounded-xl shadow-2xl border border-neutral-200 p-5 grid grid-cols-3 gap-3 z-50"
                  >
                    {spacesMenu.map((space) => (
                      <Link
                        key={space.slug}
                        to={`/spaces/${space.slug}`}
                        className="group/space block rounded-lg overflow-hidden border border-neutral-200 hover:border-[#8C5921] transition-all shadow-xs"
                      >
                        <div className="aspect-4/3 overflow-hidden bg-neutral-100">
                          <img
                            src={space.image}
                            alt={space.name}
                            className="w-full h-full object-cover group-hover/space:scale-105 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
                          />
                        </div>
                        <div className="p-2.5 text-center bg-white">
                          <span className="font-sans text-xs font-semibold text-neutral-900 group-hover/space:text-[#8C5921] transition-colors block">
                            {space.name}
                          </span>
                        </div>
                      </Link>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <Link
              to="/projects"
              className={`transition-colors duration-200 px-3 py-1.5 rounded-lg ${
                isTransparentMode
                  ? 'text-white/95 hover:text-white hover:bg-white/15'
                  : 'text-neutral-800 hover:text-black hover:bg-neutral-100'
              }`}
            >
              Projects
            </Link>

            <Link
              to="/about"
              className={`transition-colors duration-200 px-3 py-1.5 rounded-lg ${
                isTransparentMode
                  ? 'text-white/95 hover:text-white hover:bg-white/15'
                  : 'text-neutral-800 hover:text-black hover:bg-neutral-100'
              }`}
            >
              About Us
            </Link>
          </nav>

          {/* Right Action Utilities */}
          <div className="flex items-center space-x-2.5 sm:space-x-3.5">
            {/* Search Trigger */}
            <button
              onClick={() => setSearchOpen(true)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-sans transition-all duration-200 cursor-pointer active:scale-95 ${
                isTransparentMode
                  ? 'bg-black/35 hover:bg-black/60 text-white border border-white/25'
                  : 'bg-neutral-100 hover:bg-neutral-200/90 text-neutral-900 border border-neutral-200/90'
              }`}
              aria-label="Search Furniture Catalog"
            >
              <SearchIcon size={14} className={isTransparentMode ? 'text-white' : 'text-[#8C5921]'} />
              <span className="hidden md:inline text-xs font-semibold">Search Catalog</span>
            </button>

            {/* Showroom Viewing */}
            <Link
              to="/contact"
              className={`hidden sm:inline-flex items-center text-xs uppercase tracking-wider font-semibold transition-colors px-2 py-1 ${
                isTransparentMode
                  ? 'text-white hover:text-neutral-200'
                  : 'text-neutral-800 hover:text-black hover:underline'
              }`}
            >
              Showrooms
            </Link>

            {/* Direct WhatsApp Button */}
            <button
              onClick={() =>
                handleWhatsAppInquiry({
                  source: 'whatsapp_header',
                  customMessage: 'Assalam o Alaikum, I would like to inquire about Ideal Furniture custom designs and showroom viewing.',
                })
              }
              className="flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-lg text-xs font-sans font-semibold bg-[#18181B] text-white hover:bg-[#20BA56] hover:text-white transition-all duration-200 shadow-sm cursor-pointer active:scale-95"
            >
              <WhatsAppIcon size={14} className="text-[#25D366] group-hover:text-white" />
              <span className="hidden sm:inline">WhatsApp Us</span>
              <span className="sm:hidden">WhatsApp</span>
            </button>

            {/* Mobile Menu Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className={`lg:hidden p-2 rounded-full transition-colors cursor-pointer ${
                isTransparentMode ? 'text-white hover:bg-white/10' : 'text-neutral-900 hover:bg-neutral-100'
              }`}
              aria-label="Open Navigation Menu"
            >
              <HamburgerIcon size={20} />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer with smooth slide transition */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ duration: 0.3, ease: MOTION_EASE }}
            className="fixed inset-0 z-50 flex flex-col bg-white text-neutral-950"
          >
            {/* Mobile Drawer Top Bar */}
            <div className="px-6 py-5 border-b border-neutral-100 flex items-center justify-between">
              <Link to="/" onClick={() => setMobileMenuOpen(false)}>
                <span className="font-serif text-2xl tracking-[0.2em] font-medium uppercase text-neutral-950">
                  IDEAL
                </span>
              </Link>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 rounded-full hover:bg-neutral-100 text-neutral-600 cursor-pointer"
                aria-label="Close Menu"
              >
                <CloseIcon size={20} />
              </button>
            </div>

            {/* Navigation Links Scrollable */}
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
              {/* Quick Search */}
              <div>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setSearchOpen(true);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-neutral-50 border border-neutral-200 text-neutral-500 text-xs text-left cursor-pointer"
                >
                  <SearchIcon size={16} className="text-[#B89360]" />
                  <span>Search by collection, timber, or room...</span>
                </button>
              </div>

              {/* Furniture Categories List with Visual Thumbnails */}
              <div className="space-y-3">
                <span className="text-[10px] uppercase tracking-[0.2em] text-[#B89360] font-semibold block">
                  Furniture Collections
                </span>
                <div className="divide-y divide-neutral-100">
                  {collectionsMenu.map((item, idx) => (
                    <Link
                      key={idx}
                      to={item.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className="py-2.5 flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-3">
                        {item.image && (
                          <div className="w-10 h-10 rounded-lg overflow-hidden bg-neutral-100 border border-neutral-200 shrink-0">
                            <img
                              src={item.image}
                              alt={item.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        <div>
                          <span className="font-sans text-[13.5px] font-semibold text-neutral-900 group-hover:text-[#B89360] transition-colors block">
                            {item.title}
                          </span>
                          <span className="text-[11px] text-neutral-400 font-sans block mt-0.5">
                            {item.desc}
                          </span>
                        </div>
                      </div>
                      <span className="text-neutral-400 text-sm">→</span>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Curated Spaces */}
              <div className="pt-4 border-t border-neutral-100 space-y-3">
                <span className="text-[10px] uppercase tracking-[0.2em] text-[#B89360] font-semibold block">
                  Curated Spaces
                </span>
                <div className="grid grid-cols-3 gap-2">
                  {spacesMenu.map((sp) => (
                    <Link
                      key={sp.slug}
                      to={`/spaces/${sp.slug}`}
                      onClick={() => setMobileMenuOpen(false)}
                      className="block text-center rounded-xl border border-neutral-200 p-2.5 hover:border-[#B89360] transition-colors"
                    >
                      <span className="text-xs font-serif text-neutral-800 font-medium">{sp.name}</span>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Atelier & Services */}
              <div className="pt-4 border-t border-neutral-100 space-y-3 text-sm font-serif">
                <Link
                  to="/projects"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-1.5 text-neutral-800 hover:text-[#B89360]"
                >
                  Luxury Residences & Projects
                </Link>
                <Link
                  to="/about"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-1.5 text-neutral-800 hover:text-[#B89360]"
                >
                  Our Heritage & Craftsmanship
                </Link>
                <Link
                  to="/contact"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-1.5 text-neutral-800 hover:text-[#B89360]"
                >
                  Showrooms & Location
                </Link>
              </div>
            </div>

            {/* Mobile Drawer Bottom Action */}
            <div className="p-6 border-t border-neutral-100 bg-neutral-50 space-y-3">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleWhatsAppInquiry({
                    source: 'whatsapp_header',
                    customMessage: 'Assalam o Alaikum, I would like to consult with the Ideal Furniture design team.',
                  });
                }}
                className="w-full py-3.5 px-4 rounded-full bg-[#0C0A09] text-white flex items-center justify-center gap-2 text-xs font-sans uppercase tracking-[0.14em] font-semibold cursor-pointer hover:bg-[#B89360] transition-colors"
              >
                <WhatsAppIcon size={16} className="text-[#25D366]" />
                <span>Chat on WhatsApp</span>
              </button>
              <div className="text-[11px] text-center text-neutral-500 font-sans space-y-0.5">
                <p>Lahore Showroom: 94-E/1, Ghalib Road, Gulberg III, Lahore</p>
                <p>Daily: 11:00 AM – 8:00 PM</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Global Search Modal */}
      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
};
