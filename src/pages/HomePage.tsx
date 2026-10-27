import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { HeroSection } from '../components/home/HeroSection';
import { MasterpieceCatalogSlider } from '../components/home/MasterpieceCatalogSlider';
import { BrandStatement } from '../components/home/BrandStatement';
import { KalamkaarCategoryShowcase } from '../components/home/KalamkaarCategoryShowcase';
import { ShopBySpaceSection } from '../components/home/ShopBySpaceSection';
import { CraftsmanshipSection } from '../components/home/CraftsmanshipSection';
import { ConsultationSection } from '../components/home/ConsultationSection';
import { WorldwideDeliverySection } from '../components/home/WorldwideDeliverySection';
import { InstagramSection } from '../components/home/InstagramSection';
import { ProductCard } from '../components/product/ProductCard';
import { Reveal } from '../components/ui/Reveal';
import { db } from '../lib/db';
import { HomepageContent, Product } from '../types';
import { isCategoryMatch } from '../config/categories';
import { SEED_HOMEPAGE_CONTENT, SEED_PRODUCTS } from '../data/seedData';

export const HomePage: React.FC = () => {
  const [content, setContent] = useState<HomepageContent>(() => {
    if (typeof window !== 'undefined') {
      try {
        const item = localStorage.getItem('ideal_furniture_homepage_v3');
        if (item) return JSON.parse(item);
      } catch {}
    }
    return SEED_HOMEPAGE_CONTENT;
  });

  const [products, setProducts] = useState<Product[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const item = localStorage.getItem('ideal_furniture_products_v3');
        if (item) {
          const parsed = JSON.parse(item);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch {}
    }
    return SEED_PRODUCTS;
  });

  const [activeCategoryTab, setActiveCategoryTab] = useState<string>('All');

  const loadHomeData = () => {
    Promise.all([db.getHomepageContent(), db.getProducts()]).then(([homeData, prodData]) => {
      setContent(homeData);
      setProducts(prodData.filter((p) => p.isPublished));
    });
  };

  useEffect(() => {
    loadHomeData();
    const handleUpdate = () => {
      loadHomeData();
    };
    window.addEventListener('ideal_products_updated', handleUpdate);
    return () => {
      window.removeEventListener('ideal_products_updated', handleUpdate);
    };
  }, []);

  const signaturePieces = useMemo(() => {
    // Prioritize newest and featured products so uploaded pieces appear immediately
    const featured = products.filter((p) => p.isFeatured);
    const nonFeatured = products.filter((p) => !p.isFeatured);
    return [...featured, ...nonFeatured].slice(0, 12);
  }, [products]);

  const displayedPieces = useMemo(() => {
    if (activeCategoryTab === 'All') return signaturePieces;
    return products.filter((p) => isCategoryMatch(p.category, activeCategoryTab)).slice(0, 12);
  }, [activeCategoryTab, signaturePieces, products]);

  return (
    <Layout isTransparentOnTop={true}>
      {/* 1) HERO SECTION */}
      <HeroSection />

      {/* 2) ANIMATED LIVING CATALOG SLIDER (Dynamic Daily/Refresh Rotation) */}
      <MasterpieceCatalogSlider products={products} />

      {/* 3) THE FLAGSHIP 2026 ARCHIVE (Products at the Starting Section) */}
      <section id="signature-pieces" className="w-full py-12 sm:py-20 lg:py-24 bg-white border-b border-neutral-200/80">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8 md:px-12 lg:px-16">
          <Reveal>
            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 sm:mb-8 pb-4 sm:pb-6 border-b border-neutral-100 gap-3 sm:gap-4">
              <div>
                <span className="eyebrow block mb-1.5 sm:mb-2 text-[10px] sm:text-[11px]">Featured Catalog</span>
                <h2 className="font-sans text-2xl sm:text-4xl md:text-5xl font-bold text-neutral-950 leading-tight tracking-tight">
                  Curated <span className="text-[#8C5921]">Collections</span>
                </h2>
              </div>
              <Link
                to="/collections/all"
                className="text-xs font-sans uppercase tracking-wider font-bold text-neutral-900 hover:text-[#8C5921] transition-colors inline-flex items-center gap-1.5 self-start sm:self-auto"
              >
                <span>View Full Catalog</span>
                <span>→</span>
              </Link>
            </div>
          </Reveal>

          {/* Quick Filter Tabs - Mobile Scrollable */}
          <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6 sm:mb-8 no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
            {[
              { label: 'All Furniture', value: 'All' },
              { label: 'Bedroom Furniture', value: 'bedroom-furniture' },
              { label: 'Living Room Furniture', value: 'living-room-furniture' },
              { label: 'Dining Room Furniture', value: 'dining-room-furniture' },
              { label: 'Office Furniture', value: 'office-furniture' },
              { label: 'Custom Furniture', value: 'custom-furniture' },
            ].map((tab) => (
              <button
                key={tab.value}
                onClick={() => setActiveCategoryTab(tab.value)}
                className={`px-3.5 py-2 rounded-lg text-xs font-sans whitespace-nowrap transition-all duration-200 cursor-pointer ${
                  activeCategoryTab === tab.value
                    ? 'bg-[#18181B] text-white font-bold shadow-xs'
                    : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-800 hover:text-black font-semibold'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Product Grid - Smooth Subtle Reveal */}
          <Reveal delay={0.1}>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6 lg:gap-8">
              {displayedPieces.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* 3) CURATED CATEGORIES BENTO GRID */}
      <Reveal yOffset={28}>
        <KalamkaarCategoryShowcase />
      </Reveal>

      {/* 4) BRAND ARCHITECTURAL MANIFESTO */}
      <Reveal yOffset={28}>
        <BrandStatement
          heading={content?.brandStatementHeading}
          accentWord={content?.brandStatementAccentWord}
          text={content?.brandStatementText}
        />
      </Reveal>

      {/* 5) CURATED BY SPACE */}
      <Reveal yOffset={28}>
        <ShopBySpaceSection />
      </Reveal>

      {/* 7) ARTISANAL PEDIGREE & CRAFTSMANSHIP */}
      <Reveal yOffset={28}>
        <CraftsmanshipSection />
      </Reveal>

      {/* 8) BESPOKE 3D & INTERIOR CONSULTATION */}
      <Reveal yOffset={28}>
        <ConsultationSection
          heading={content?.consultationHeading}
          accentWord={content?.consultationAccentWord}
          lines={content?.consultationText}
          image={content?.consultationImage}
        />
      </Reveal>

      {/* 9) WORLDWIDE CRATED FREIGHT & WHITE-GLOVE LOGISTICS */}
      <Reveal yOffset={28}>
        <WorldwideDeliverySection
          heading={content?.deliveryHeading}
          accentWord={content?.deliveryAccentWord}
          text={content?.deliveryText}
          image={content?.deliveryImage}
        />
      </Reveal>

      {/* 10) INSTAGRAM ATELIER JOURNAL */}
      <Reveal yOffset={28}>
        <InstagramSection images={content?.instagramImages} />
      </Reveal>
    </Layout>
  );
};
