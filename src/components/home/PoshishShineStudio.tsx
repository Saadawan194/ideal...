import React, { useState } from 'react';
import { handleWhatsAppInquiry } from '../../lib/whatsapp';
import { WhatsAppIcon } from '../ui/Icons';

interface PoshishFinish {
  id: string;
  name: string;
  category: string;
  colorName: string;
  colorHex: string;
  metalTrim: string;
  metalColor: string;
  description: string;
  image: string;
  specs: string[];
}

const POSHISH_FINISHES: PoshishFinish[] = [
  {
    id: 'champagne-boucle',
    name: 'Champagne Pearl Bouclé & Brushed Brass',
    category: 'Curved Lounge & Seating',
    colorName: 'Champagne Pearl',
    colorHex: '#EAE5DB',
    metalTrim: 'Brushed Champagne Brass',
    metalColor: '#C5A880',
    description: 'French-loomed textured bouclé yarn woven with subtle luster, tailored over organic curved silhouettes for contemporary palatial living.',
    image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1200&q=85',
    specs: ['50,000+ Martindale Rub Count', 'Multi-Density High-Resilience Core', 'Concealed Brushed Brass Plinth', 'Custom Sizing & Sectional Layouts'],
  },
  {
    id: 'emerald-gold',
    name: 'Royal Emerald Velvet & Titanium Gold',
    category: 'Luxury Drawing Room Suite',
    colorName: 'Royal Emerald',
    colorHex: '#0B3B24',
    metalTrim: 'Titanium Gold Electroplate',
    metalColor: '#B89360',
    description: 'High-density jewel micro-velvet with an optical luminous depth, accented by vertical channel tufting and solid Sheesham inner joinery.',
    image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1200&q=85',
    specs: ['Deep Jewel Light Refraction', 'Stain-Resistant Nano Pile', 'Hand-Crafted Sheesham Internal Frame', 'Anti-Tarnish PVD Finish'],
  },
  {
    id: 'sapphire-silver',
    name: 'Midnight Sapphire Velvet & Brushed Steel',
    category: 'Palatial Master Bedstead',
    colorName: 'Midnight Sapphire',
    colorHex: '#12233C',
    metalTrim: 'Brushed Architectural Steel',
    metalColor: '#D1D5DB',
    description: 'Deep oceanic velvet headboards with geometric architectural fluting, engineered to anchor sovereign master bedroom suites.',
    image: 'https://images.unsplash.com/photo-1540518614846-7ede433c4ef0?auto=format&fit=crop&w=1200&q=85',
    specs: ['High-Relief Channel Padded Headboard', 'Integrated Warm Backlighting Channel', 'Kiln-Dried Hardwood Support Rails', 'Custom Mattress Dimension Fitting'],
  },
  {
    id: 'amber-cognac',
    name: 'Tuscan Cognac Leather & Burnished Walnut',
    category: 'Executive & Library Lounge',
    colorName: 'Tuscan Cognac',
    colorHex: '#7C3F1D',
    metalTrim: 'Burnished Antique Bronze',
    metalColor: '#8F6D3C',
    description: 'Supple full-grain Italian leather with hand-waxed antique finish, paired with hand-turned solid Himalayan walnut legs.',
    image: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1200&q=85',
    specs: ['100% Full-Grain Vegetable Tanned Leather', 'Aged Himalayan Walnut Carved Legs', 'Eight-Way Hand-Tied Coil Spring Base', 'Heirloom Patina Maturation'],
  },
];

export const PoshishShineStudio: React.FC = () => {
  const [selectedFinish, setSelectedFinish] = useState<PoshishFinish>(POSHISH_FINISHES[0]);

  const handleRequestSwatch = () => {
    handleWhatsAppInquiry({
      source: 'consultation',
      customMessage: `Assalam o Alaikum, I would like to request fabric swatches and custom pricing for "${selectedFinish.name}" (${selectedFinish.category}).`,
    });
  };

  return (
    <section id="poshish-showcase" className="w-full py-20 lg:py-28 bg-[#0C0A09] text-white border-b border-neutral-800">
      <div className="max-w-[1440px] mx-auto px-5 sm:px-8 md:px-12 lg:px-16">
        {/* Header */}
        <div className="max-w-2xl mb-14">
          <span className="eyebrow text-[#B89360] block mb-2">Fabrics & Finishes</span>
          <h2 className="font-sans text-3xl sm:text-4xl md:text-5xl font-bold text-white leading-tight tracking-tight">
            Premium Poshish & <span className="text-[#B89360]">Custom Upholstery</span>
          </h2>
          <p className="text-sm sm:text-base text-neutral-300 font-sans font-normal mt-3 leading-relaxed">
            Select from over 300 imported velvets, bouclés, full-grain leathers, and titanium brass metal trims. Every piece is tailored to your exact floor plan.
          </p>
        </div>

        {/* Swatch Selector Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-10">
          {POSHISH_FINISHES.map((finish) => {
            const isSelected = finish.id === selectedFinish.id;
            return (
              <button
                key={finish.id}
                onClick={() => setSelectedFinish(finish)}
                className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'bg-neutral-900 border-[#B89360] shadow-md'
                    : 'bg-neutral-950 border-neutral-800 hover:border-neutral-700'
                }`}
              >
                <div className="flex items-center gap-2.5 mb-3">
                  <div
                    className="w-4 h-4 rounded-full border border-white/20"
                    style={{ backgroundColor: finish.colorHex }}
                  />
                  <span className="text-xs font-sans font-bold uppercase tracking-wider text-neutral-100">
                    {finish.colorName}
                  </span>
                </div>
                <span className="text-[11px] font-sans text-neutral-400">
                  {finish.metalTrim}
                </span>
              </button>
            );
          })}
        </div>

        {/* Selected Finish Showcase Split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center bg-neutral-950 border border-neutral-800 rounded-2xl p-6 sm:p-10">
          {/* Left Column: Image */}
          <div className="lg:col-span-7 aspect-16/10 rounded-xl overflow-hidden bg-neutral-950 border border-neutral-800 relative shadow-sm">
            <img
              src={selectedFinish.image}
              alt={selectedFinish.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-4 left-4 bg-black/85 backdrop-blur-sm px-3 py-1 rounded-md text-[11px] font-sans font-semibold uppercase tracking-wider text-neutral-200 border border-neutral-700">
              {selectedFinish.category}
            </div>
          </div>

          {/* Right Column: Narrative & Technical Specs */}
          <div className="lg:col-span-5 space-y-6">
            <div>
              <span className="text-xs uppercase tracking-wider font-sans text-[#B89360] font-bold block mb-1">
                Custom Tailored Furniture
              </span>
              <h3 className="font-sans text-2xl sm:text-3xl text-white font-bold">
                {selectedFinish.name}
              </h3>
              <p className="mt-3 text-sm text-neutral-300 font-sans font-normal leading-relaxed">
                {selectedFinish.description}
              </p>
            </div>

            <div className="space-y-2 pt-2 border-t border-neutral-800">
              <span className="text-xs uppercase font-sans tracking-wider text-neutral-400 block mb-2 font-bold">
                Specifications & Features
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {selectedFinish.specs.map((spec, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-xs text-neutral-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#B89360] mt-1.5 shrink-0" />
                    <span className="font-normal leading-relaxed">{spec}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <button
                onClick={handleRequestSwatch}
                className="btn-gold"
              >
                <WhatsAppIcon size={15} className="text-white" />
                <span>Request Fabric Swatches</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
