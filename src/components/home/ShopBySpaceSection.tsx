import React from 'react';
import { Link } from 'react-router-dom';

export const ShopBySpaceSection: React.FC = () => {
  const spaces = [
    {
      name: 'Living Room Suites',
      desc: 'Curved sectionals, drawing room suites, carved consoles & marble coffee tables',
      slug: 'living-room',
      image: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=85',
    },
    {
      name: 'Master Boudoir',
      desc: 'Royal Chinioti bed sets, upholstered headboards, nightstands & vanity consoles',
      slug: 'bedroom',
      image: 'https://images.unsplash.com/photo-1540518614846-7ede433c4ef0?auto=format&fit=crop&w=1200&q=85',
    },
    {
      name: 'Grand Dining Hall',
      desc: '10-seater refectory banquet tables, carved dining chairs & architectural sideboards',
      slug: 'dining-room',
      image: 'https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&w=1200&q=85',
    },
  ];

  return (
    <section className="w-full py-20 lg:py-28 bg-neutral-50 border-b border-neutral-200/80">
      <div className="max-w-[1440px] mx-auto px-5 sm:px-8 md:px-12 lg:px-16 mb-14 text-center">
        <span className="eyebrow justify-center mb-2">Spatial Architecture</span>
        <h2 className="font-sans text-3xl sm:text-4xl md:text-5xl font-bold text-neutral-950 leading-tight tracking-tight">
          Curated by <span className="text-[#8C5921]">Space</span>
        </h2>
        <p className="font-sans text-sm sm:text-base text-neutral-600 mt-3 max-w-xl mx-auto font-normal leading-relaxed">
          Explore architectural ensembles composed purposefully for every room of the discerning residence.
        </p>
      </div>

      <div className="max-w-[1440px] mx-auto px-5 sm:px-8 md:px-12 lg:px-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-10 w-full">
          {spaces.map((space) => (
            <Link
              key={space.slug}
              to={`/spaces/${space.slug}`}
              className="group flex flex-col cursor-pointer"
            >
              <div className="relative w-full aspect-3/4 overflow-hidden rounded-xl bg-neutral-100 border border-neutral-200/90 shadow-xs group-hover:shadow-md transition-shadow">
                <img
                  src={space.image}
                  alt={`${space.name} Collection`}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />
              </div>

              <div className="pt-4 space-y-1.5">
                <h3 className="font-sans text-xl sm:text-2xl text-neutral-950 font-bold group-hover:text-[#8C5921] transition-colors">
                  {space.name}
                </h3>
                <p className="text-sm text-neutral-600 font-sans font-normal leading-relaxed">
                  {space.desc}
                </p>
                <div className="pt-2 text-xs font-sans uppercase tracking-wider font-bold text-neutral-900 group-hover:text-[#8C5921] transition-colors flex items-center gap-1">
                  <span>Explore Space</span>
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};
