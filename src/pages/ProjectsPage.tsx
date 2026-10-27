import React from 'react';
import { Layout } from '../components/layout/Layout';

export const ProjectsPage: React.FC = () => {
  const projects = [
    {
      title: 'Residence on Canal Bank',
      location: 'Lahore, Pakistan',
      image: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=85',
      scope: 'Drawing room suites, carved deewans, and solid walnut dining hall.',
    },
    {
      title: 'Diplomatic Enclave Residence',
      location: 'Islamabad, Pakistan',
      image: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1200&q=85',
      scope: 'Architectural wall paneling, library shelving, and custom brass tables.',
    },
    {
      title: 'Al Barari Private Villa',
      location: 'Dubai, United Arab Emirates',
      image: 'https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&w=1200&q=85',
      scope: 'Complete export suite including custom curved velvet sectionals and marble banquet tables.',
    },
    {
      title: 'Clifton Beachside Pavilion',
      location: 'Karachi, Pakistan',
      image: 'https://images.unsplash.com/photo-1540518614846-7ede433c4ef0?auto=format&fit=crop&w=1200&q=85',
      scope: 'Weathered teak veranda seating suites, outdoor sun lounges, and low refectory tables.',
    },
    {
      title: 'Hillside Manor',
      location: 'Murree Foothills, Pakistan',
      image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=85',
      scope: 'Solid sheesham canopy beds, relief-carved chests, and hearth armchairs.',
    },
    {
      title: 'Kensington Townhouse Commission',
      location: 'London, United Kingdom',
      image: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=1200&q=85',
      scope: 'Custom walnut consoles, carved storage credenzas, and library writing desks.',
    },
    {
      title: 'Gilded Master Bed Commission',
      location: 'Ideal Furniture Workshop, Pakistan',
      image: '/uploads/1791288218773-10265.webp',
      scope: 'Hand-carved royal bed headboard and footboard in midnight lacquer with gold-leaf floral relief.',
    },
  ];

  return (
    <Layout>
      {/* Banner */}
      <div className="w-full bg-bone py-16 sm:py-24 border-b border-line">
        <div className="max-w-[1440px] mx-auto px-5 sm:px-8 md:px-12 lg:px-16 xl:px-20">
          <span className="eyebrow block mb-3">Portfolio Archive</span>
          <h1 className="font-serif text-3xl sm:text-5xl md:text-6xl font-light text-ink leading-[1.06] tracking-[-0.025em]">
            Our <span className="italic text-accent font-normal">Projects</span>
          </h1>
          <p className="font-sans text-sm text-ink/75 max-w-xl mt-3 font-light leading-relaxed">
            A selective survey of commissioned private estates, diplomatic quarters, and architectural residences furnished across Pakistan and internationally.
          </p>
        </div>
      </div>

      {/* Masonry / Editorial Gallery */}
      <div className="max-w-[1440px] mx-auto px-5 sm:px-8 md:px-12 lg:px-16 xl:px-20 py-16 lg:py-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 sm:gap-12">
          {projects.map((proj, idx) => (
            <article key={idx} className="group flex flex-col space-y-4">
              <div className="aspect-4/3 w-full bg-bone overflow-hidden border border-line">
                <img
                  src={proj.image}
                  alt={`${proj.title}, ${proj.location}`}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                />
              </div>
              <div className="space-y-1">
                <span className="eyebrow block">{proj.location}</span>
                <h3 className="font-serif text-xl text-ink font-normal group-hover:text-accent transition-colors">
                  {proj.title}
                </h3>
                <p className="text-xs text-muted/90 font-sans font-light leading-relaxed pt-1">
                  {proj.scope}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </Layout>
  );
};
