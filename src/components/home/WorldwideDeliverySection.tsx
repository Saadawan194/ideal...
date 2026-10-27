import React from 'react';
import { Link } from 'react-router-dom';

interface WorldwideDeliverySectionProps {
  heading?: string;
  accentWord?: string;
  text?: string;
  image?: string;
}

export const WorldwideDeliverySection: React.FC<WorldwideDeliverySectionProps> = ({
  heading = 'Worldwide',
  accentWord = 'Delivery',
  text = 'With over two decades of export experience, Ideal Furniture manages doorstep white-glove transport across Pakistan, the United Arab Emirates, the United Kingdom, North America, and Europe. Every piece is wrapped in moisture-resistant vapor barriers and custom-crated in treated timber to ensure perfect arrival.',
  image = 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1200&q=85',
}) => {
  const renderHeading = () => {
    let h = (heading || 'Worldwide').trim();
    let a = (accentWord || 'Delivery').trim();
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
    <section className="w-full py-20 lg:py-28 bg-bone border-b border-line">
      <div className="max-w-[1440px] mx-auto px-5 sm:px-8 md:px-12 lg:px-16 xl:px-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
          {/* Image Left (7 cols on lg) */}
          <div className="lg:col-span-7 aspect-16/10 bg-paper overflow-hidden border border-neutral-200 rounded-xl shadow-xs">
            <img
              src={image}
              alt="Worldwide furniture export crating and delivery"
              loading="lazy"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Text Right (5 cols on lg) */}
          <div className="lg:col-span-5 space-y-6">
            <span className="eyebrow block">Global Logistics</span>
            {renderHeading()}
            <p className="font-sans text-sm sm:text-base text-neutral-600 leading-relaxed font-normal">
              {text}
            </p>
            <div className="pt-2">
              <Link
                to="/faqs"
                className="inline-flex items-center text-xs uppercase tracking-wider font-sans font-bold text-neutral-900 hover:text-[#8C5921] transition-colors"
              >
                <span>Read Shipping & Export Policy</span>
                <span className="ml-1 group-hover:translate-x-1 transition-transform">→</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
