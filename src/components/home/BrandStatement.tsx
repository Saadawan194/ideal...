import React from 'react';

interface BrandStatementProps {
  heading?: string;
  accentWord?: string;
  text?: string;
}

const BRAND_PILLARS = [
  {
    num: '01',
    title: 'Solid Hardwood Forestry',
    desc: 'Kiln-dried Himalayan Sheesham and aged walnut seasoned to resist warping in all climates.',
    badge: 'Kiln-Cured Timber',
  },
  {
    num: '02',
    title: 'Hereditary Chinioti Carvers',
    desc: 'Intricate architectural relief and mortise-and-tenon structural joinery chiseled purely by hand.',
    badge: 'Master Carvers',
  },
  {
    num: '03',
    title: 'Luxury Poshish & Velvet',
    desc: 'High-density jewel velvets, custom channel tufting, and titanium gold electroplated plinths.',
    badge: 'Premium Upholstery',
  },
  {
    num: '04',
    title: 'Nationwide Delivery',
    desc: 'Safe protective packing with room-of-choice setup across all cities in Pakistan and overseas.',
    badge: 'Safe Delivery',
  },
];

export const BrandStatement: React.FC<BrandStatementProps> = ({
  heading = 'Furniture as Architectural',
  accentWord = 'Sculpture',
  text = 'At Ideal Furniture, seasoned solid timbers meet master woodcarving and premium custom upholstery. Every piece is crafted not merely as everyday furniture, but as an enduring centerpiece for your home.',
}) => {
  const renderHeading = () => {
    let h = (heading || 'Furniture as Architectural').trim();
    let a = (accentWord || 'Sculpture').trim();
    if (a && h.toLowerCase().endsWith(a.toLowerCase())) {
      h = h.substring(0, h.length - a.length).trim();
    }
    return (
      <h2 className="font-sans text-3xl sm:text-4xl md:text-5xl font-bold text-neutral-950 leading-tight tracking-tight">
        {h} {a && <span className="text-[#8C5921]">{a}</span>}
      </h2>
    );
  };

  return (
    <section className="w-full bg-neutral-50 py-20 lg:py-28 border-b border-neutral-200/80">
      <div className="max-w-[1440px] mx-auto px-5 sm:px-8 md:px-12 lg:px-16">
        {/* Core Statement */}
        <div className="max-w-3xl mx-auto text-center space-y-4 mb-16">
          <span className="eyebrow justify-center">The Ideal Furniture Standard</span>
          {renderHeading()}
          <p className="font-sans text-base sm:text-lg text-neutral-600 leading-relaxed font-normal">
            {text}
          </p>
        </div>

        {/* 4 Pillars - Clean Modern Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10 border-t border-neutral-200 pt-12">
          {BRAND_PILLARS.map((pillar, idx) => (
            <div key={idx} className="space-y-2.5">
              <span className="text-xs font-sans text-[#8C5921] uppercase tracking-wider font-bold block">
                {pillar.badge}
              </span>
              <h3 className="font-sans text-lg sm:text-xl text-neutral-950 font-bold leading-snug">
                {pillar.title}
              </h3>
              <p className="font-sans text-sm text-neutral-500 leading-relaxed font-normal">
                {pillar.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
