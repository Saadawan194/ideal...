import React from 'react';
import { Link } from 'react-router-dom';

export const CraftsmanshipSection: React.FC = () => {
  const pillars = [
    {
      title: 'Hardwood Joinery',
      description: 'Solid Himalayan walnut, seasoned rosewood, and kiln-dried sheesham joined through hand mortise-and-tenon craftsmanship.',
      image: 'https://images.unsplash.com/photo-1540518614846-7ede433c4ef0?auto=format&fit=crop&w=800&q=85',
      link: '/collections/beds',
    },
    {
      title: 'High-Relief Woodcarving',
      description: 'Hereditary Chinioti master chisel detailing, turned balusters, and fluted pedestals sculpted across architectural solid timber.',
      image: 'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&w=800&q=85',
      link: '/collections/storage',
    },
    {
      title: 'Custom Poshish & Upholstery',
      description: 'Eight-way hand-tied coil spring foundations, deep channel tufting, and Belgian linens tailored over sculpted furniture frames.',
      image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=85',
      link: '/collections/seating',
    },
  ];

  return (
    <section className="w-full py-20 lg:py-28 bg-paper border-b border-line">
      <div className="max-w-[1440px] mx-auto px-5 sm:px-8 md:px-12 lg:px-16 xl:px-20">
        <div className="mb-14 text-center max-w-2xl mx-auto space-y-3">
          <span className="eyebrow block">Our Heritage & Standards</span>
          <h2 className="font-sans text-3xl sm:text-4xl md:text-5xl font-bold text-neutral-950 leading-tight tracking-tight">
            Finest <span className="text-[#8C5921]">Craftsmanship</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
          {pillars.map((pillar) => (
            <div key={pillar.title} className="flex flex-col group">
              <div className="aspect-4/5 w-full bg-neutral-100 overflow-hidden mb-6 rounded-xl border border-neutral-200 shadow-xs group-hover:shadow-md transition-shadow">
                <img
                  src={pillar.image}
                  alt={pillar.title}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                />
              </div>
              <h3 className="font-sans text-xl sm:text-2xl text-neutral-950 font-bold mb-2">
                {pillar.title}
              </h3>
              <p className="font-sans text-sm text-neutral-600 leading-relaxed mb-4 line-clamp-2">
                {pillar.description}
              </p>
              <Link
                to={pillar.link}
                className="inline-flex items-center text-xs uppercase tracking-wider font-sans font-bold text-neutral-900 hover:text-[#8C5921] transition-colors"
              >
                <span>Discover Collection</span>
                <span className="ml-1 group-hover:translate-x-1 transition-transform">→</span>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
