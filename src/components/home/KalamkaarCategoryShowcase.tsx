import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { db } from '../../lib/db';
import { Category } from '../../types';
import { SEED_CATEGORIES } from '../../data/seedData';

interface CategoryTile {
  name: string;
  tagline: string;
  href: string;
  image: string;
  countLabel: string;
}

const FALLBACK_CATEGORIES: CategoryTile[] = [
  {
    name: 'Bedroom Furniture',
    tagline: 'King & queen beds, bridal bedroom sets, wardrobes, vanities & benches',
    href: '/collections/bedroom-furniture',
    image: 'https://images.unsplash.com/photo-1540518614846-7ede433c4ef0?auto=format&fit=crop&w=1000&q=85',
    countLabel: '01 • Bedroom',
  },
  {
    name: 'Living Room Furniture',
    tagline: 'Chesterfield & curved sectionals, accent armchairs, coffee tables & media consoles',
    href: '/collections/living-room-furniture',
    image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1000&q=85',
    countLabel: '02 • Living Room',
  },
  {
    name: 'Dining Room Furniture',
    tagline: 'Solid walnut banquet tables, 4-10+ seaters, carved chairs & buffets',
    href: '/collections/dining-room-furniture',
    image: 'https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&w=1000&q=85',
    countLabel: '03 • Dining Room',
  },
  {
    name: 'Office Furniture',
    tagline: 'Executive desks, managerial chairs, workstations, conference suites & file storage',
    href: '/collections/office-furniture',
    image: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=1000&q=85',
    countLabel: '04 • Office',
  },
  {
    name: 'Custom Furniture',
    tagline: 'Made-to-order commissions, tailored floor plans, bespoke beds, sofas & wardrobes',
    href: '/collections/custom-furniture',
    image: 'https://images.unsplash.com/photo-1616046229478-9901c5536a45?auto=format&fit=crop&w=1000&q=85',
    countLabel: '05 • Custom Made',
  },
];

export const KalamkaarCategoryShowcase: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    db.getCategories().then((data) => {
      if (Array.isArray(data) && data.length > 0) {
        setCategories([...data].sort((a, b) => a.order - b.order));
      }
    });
  }, []);

  // Map dynamic database categories (which support custom uploads) or use seeded fallback
  const displayTiles: CategoryTile[] = categories.length > 0
    ? categories.map((cat, idx) => {
        const fallback = FALLBACK_CATEGORIES.find((f) => f.name.toLowerCase() === cat.name.toLowerCase()) || FALLBACK_CATEGORIES[idx % FALLBACK_CATEGORIES.length];
        return {
          name: cat.name,
          tagline: cat.description || fallback?.tagline || `Explore handcrafted ${cat.name.toLowerCase()} suites and custom pieces.`,
          href: `/collections/${cat.slug}`,
          image: cat.image || fallback?.image || 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1000&q=85',
          countLabel: `${String(cat.order || idx + 1).padStart(2, '0')} • ${cat.name.replace(/ Furniture$/i, '')}`,
        };
      })
    : FALLBACK_CATEGORIES;

  return (
    <section className="w-full py-20 lg:py-28 bg-white border-b border-neutral-200/80">
      <div className="max-w-[1440px] mx-auto px-5 sm:px-8 md:px-12 lg:px-16">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 pb-6 border-b border-neutral-100">
          <div>
            <span className="eyebrow block mb-2">Furniture Collections</span>
            <h2 className="font-sans text-3xl sm:text-4xl md:text-5xl font-bold text-neutral-950 leading-tight tracking-tight">
              Explore by <span className="text-[#8C5921]">Category</span>
            </h2>
          </div>
          <Link
            to="/collections/all"
            className="text-xs font-sans uppercase tracking-wider font-bold text-neutral-900 hover:text-[#8C5921] transition-colors flex items-center gap-1.5"
          >
            <span>View All Furniture</span>
            <span>→</span>
          </Link>
        </div>

        {/* 10 Categories Clean Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
          {displayTiles.map((cat) => (
            <Link
              key={cat.name}
              to={cat.href}
              className="group flex flex-col cursor-pointer bg-white"
            >
              {/* Image Frame */}
              <div className="relative aspect-4/3 w-full bg-neutral-100 overflow-hidden border border-neutral-200/90 rounded-xl shadow-xs group-hover:shadow-md transition-shadow">
                <img
                  src={cat.image}
                  alt={cat.name}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                />
              </div>

              {/* Editorial Details Below Image */}
              <div className="pt-3.5 space-y-1">
                <span className="text-[10px] uppercase tracking-wider text-[#8C5921] font-sans font-bold block">
                  {cat.countLabel}
                </span>
                <h3 className="font-sans text-lg sm:text-xl text-neutral-950 font-bold group-hover:text-[#8C5921] transition-colors">
                  {cat.name}
                </h3>
                <p className="text-xs font-sans text-neutral-600 font-normal leading-relaxed line-clamp-2">
                  {cat.tagline}
                </p>
                <div className="pt-1.5 text-xs font-sans uppercase tracking-wider font-bold text-neutral-900 group-hover:text-[#8C5921] transition-colors flex items-center gap-1">
                  <span>Explore Collection</span>
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
