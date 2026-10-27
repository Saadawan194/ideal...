import React from 'react';
import { SITE_CONFIG } from '../../config/site';

interface InstagramSectionProps {
  images?: string[];
}

export const InstagramSection: React.FC<InstagramSectionProps> = ({
  images = [
    'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=600&q=85',
    'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&w=600&q=85',
    'https://images.unsplash.com/photo-1616046229478-9901c5536a45?auto=format&fit=crop&w=600&q=85',
    'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=600&q=85',
    'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=600&q=85',
    'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&w=600&q=85',
  ],
}) => {
  const instaLink = SITE_CONFIG.socials.find((s) => s.name === 'Instagram')?.url || 'https://instagram.com';

  return (
    <section className="w-full py-20 lg:py-28 bg-paper">
      <div className="max-w-[1440px] mx-auto px-5 sm:px-8 md:px-12 lg:px-16 xl:px-20 mb-12 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
        <div>
          <span className="eyebrow block mb-2">Social Archive</span>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-light text-ink leading-[1.12] tracking-[-0.02em]">
            Explore More on <span className="italic text-accent font-normal">Instagram</span>
          </h2>
        </div>
        <a
          href={instaLink}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-sans uppercase tracking-[0.14em] font-medium text-ink underline underline-offset-4 decoration-accent hover:text-accent transition-colors"
        >
          Follow Us
        </a>
      </div>

      {/* 6-image row: square, no gap on desktop, 3x2 on mobile */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 w-full">
        {images.slice(0, 6).map((img, i) => (
          <a
            key={i}
            href={instaLink}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative aspect-square block overflow-hidden bg-bone"
          >
            <img
              src={img}
              alt={`Ideal Furniture studio archive ${i + 1}`}
              loading="lazy"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
            />
            <div className="absolute inset-0 bg-ink/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </a>
        ))}
      </div>
    </section>
  );
};
