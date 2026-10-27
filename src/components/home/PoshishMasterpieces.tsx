import React from 'react';
import { useNavigate } from 'react-router-dom';
import { handleWhatsAppInquiry } from '../../lib/whatsapp';
import { WhatsAppIcon } from '../ui/Icons';

interface Masterpiece {
  id: string;
  name: string;
  category: string;
  tag: string;
  materialHighlight: string;
  image: string;
  features: string;
  link: string;
}

const MASTERPIECES: Masterpiece[] = [
  {
    id: 'poshish-bed-wingback',
    name: 'The Royal Wingback Poshish Bed',
    category: 'Poshish Bed Sets',
    tag: 'Signature Shine Collection',
    materialHighlight: 'Vertical Channel Velvet • Brushed Gold Plinth',
    image: 'https://images.unsplash.com/photo-1540518614846-7ede433c4ef0?auto=format&fit=crop&w=900&q=85',
    features: 'Generous 6ft padded winged headboard, integrated ambient warm lighting channel, and titanium gold border trim.',
    link: '/collections/beds',
  },
  {
    id: 'poshish-curved-sectional',
    name: 'The Crescent Bouclé Curved Sectional',
    category: 'Luxury Sofas & Poshish',
    tag: 'Luxury Comfort',
    materialHighlight: 'Pearl Bouclé Velvet • Concealed Brass Base',
    image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=900&q=85',
    features: 'Organic serpentine curved silhouette wrapped in luminous pearl bouclé, engineered for palatial living spaces.',
    link: '/collections/seating',
  },
  {
    id: 'poshish-dining-regent',
    name: 'The Regent Calacatta & Gold Dining Suite',
    category: 'Dining Sets',
    tag: 'High-Gloss Luster',
    materialHighlight: 'Polished Marble • Electroplated Titanium Gold',
    image: 'https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&w=900&q=85',
    features: 'Bookmatched natural marble with fluted gold pedestals, paired with 8 channel-tufted velvet dining chairs.',
    link: '/collections/dining',
  },
  {
    id: 'poshish-sunburst-console',
    name: 'The Sunburst Brass Architectural Console',
    category: 'Architectural Consoles',
    tag: 'Radiant Metallic',
    materialHighlight: 'Solid Walnut Top • Fluted Brass Balusters',
    image: 'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&w=900&q=85',
    features: 'Show-stopping entryway statement table with hand-turned brass balusters and double-beveled solid walnut top.',
    link: '/collections/tables',
  },
  {
    id: 'poshish-nesting-tables',
    name: 'The Duet Smoked Glass & Gold Center Tables',
    category: 'Center Tables',
    tag: 'Mirror Polish',
    materialHighlight: 'Smoked Toughened Glass • Mirror-Finish Gold',
    image: 'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&w=900&q=85',
    features: 'Two tiered concentric nesting coffee tables featuring scratch-resistant smoked glass and anti-fingerprint PVD brass.',
    link: '/collections/tables',
  },
  {
    id: 'poshish-chaise-deewan',
    name: 'The Imperial Velvet Chaise Deewan',
    category: 'Drawing Room Deewans',
    tag: 'Haute Upholstery',
    materialHighlight: 'Emerald Silk Velvet • Turned Brass Ferrules',
    image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=900&q=85',
    features: 'Classic royal deewan re-imagined with sleek modern curves, feather-down roll bolsters, and deep button tufting.',
    link: '/collections/seating',
  },
];

export const PoshishMasterpieces: React.FC = () => {
  const navigate = useNavigate();

  const handleInquire = (e: React.MouseEvent, item: Masterpiece) => {
    e.stopPropagation();
    handleWhatsAppInquiry({
      source: 'whatsapp_product',
      productName: item.name,
      customMessage: `Assalam o Alaikum, I would like to inquire about "${item.name}" (${item.materialHighlight}) from your Poshish Shine Collection.`,
    });
  };

  return (
    <section id="poshish-showcase" className="w-full py-24 lg:py-32 bg-[#FAF8F5] relative">
      <div className="max-w-[1440px] mx-auto px-6 sm:px-12 lg:px-16">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-16 pb-6 border-b border-[#E3DDD4]">
          <div className="max-w-2xl">
            <span className="text-[10.5px] uppercase font-sans tracking-[0.24em] text-[#8A6A3B] font-semibold block mb-2">
              Custom Luxury Furnishings
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-[44px] text-[#14110F] font-light leading-tight">
              Poshish <span className="italic font-normal text-[#8A6A3B]">Signature Masterpieces</span>
            </h2>
            <p className="font-sans text-xs sm:text-sm text-[#6B645C] mt-2 font-light">
              Showcasing the opulent blend of channel-tufted velvet upholstery, lustrous metallic accents, and artisanal woodwork.
            </p>
          </div>
          <div className="mt-6 md:mt-0">
            <button
              onClick={() => navigate('/collections/beds')}
              className="text-xs uppercase font-sans tracking-[0.16em] text-[#14110F] font-semibold hover:text-[#8A6A3B] underline underline-offset-8 decoration-[#8A6A3B] transition-colors"
            >
              Explore All Poshish Beds & Sofas →
            </button>
          </div>
        </div>

        {/* 6-Card Masterpiece Grid with Sheen Hover */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10">
          {MASTERPIECES.map((item) => (
            <div
              key={item.id}
              onClick={() => navigate(item.link)}
              className="shine-card group flex flex-col bg-white border border-[#E3DDD4] hover:border-[#D4AF37] transition-all duration-500 shadow-xs hover:shadow-xl cursor-pointer"
            >
              {/* Aspect Ratio 4:3 Image Container */}
              <div className="relative aspect-4/3 w-full bg-[#E5DFD7] overflow-hidden">
                <img
                  src={item.image}
                  alt={item.name}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                />
                {/* Top Badge: Metallic Gold */}
                <div className="absolute top-3 left-3 bg-[#14110F]/90 backdrop-blur-xs px-3 py-1 border border-[#D4AF37]/70 text-[9.5px] uppercase font-sans tracking-[0.18em] text-[#F3E5AB] font-medium">
                  {item.tag}
                </div>
                {/* Bottom Material Pill */}
                <div className="absolute bottom-3 left-3 right-3 bg-white/95 backdrop-blur-xs px-3 py-2 border border-[#E3DDD4] flex items-center justify-between">
                  <span className="text-[10px] uppercase font-sans tracking-[0.14em] text-[#8A6A3B] font-semibold truncate">
                    {item.materialHighlight}
                  </span>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-6 flex flex-col flex-1 justify-between bg-white">
                <div>
                  <span className="text-[10px] uppercase font-sans tracking-[0.2em] text-[#8A6A3B] block mb-1 font-medium">
                    {item.category}
                  </span>
                  <h3 className="font-serif text-xl sm:text-2xl text-[#14110F] group-hover:text-[#8A6A3B] transition-colors leading-snug">
                    {item.name}
                  </h3>
                  <p className="font-sans text-xs text-[#6B645C] mt-2 font-light leading-relaxed">
                    {item.features}
                  </p>
                </div>

                {/* Card Action Buttons (Always Visible) */}
                <div className="mt-5 pt-3.5 border-t border-[#E3DDD4] grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(item.link);
                    }}
                    className="w-full py-2.5 px-2 bg-[#14110F] hover:bg-[#8A6A3B] text-white font-sans text-[10.5px] sm:text-[11px] uppercase tracking-[0.12em] font-medium transition-colors flex items-center justify-center gap-1 cursor-pointer shadow-xs"
                  >
                    <span>View Specs</span>
                    <span className="text-[10px]">→</span>
                  </button>
                  <button
                    type="button"
                    onClick={(e) => handleInquire(e, item)}
                    className="w-full py-2.5 px-2 bg-white hover:bg-[#25D366]/10 border border-[#14110F]/30 hover:border-[#25D366] text-[#14110F] hover:text-[#128C7E] font-sans text-[10.5px] sm:text-[11px] uppercase tracking-[0.08em] font-medium transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                    title="Inquire via WhatsApp"
                  >
                    <WhatsAppIcon size={13} className="text-[#25D366]" />
                    <span>Inquire</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
