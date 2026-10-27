import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { Layout } from '../components/layout/Layout';
import { ProductCard } from '../components/product/ProductCard';
import { db } from '../lib/db';
import { Category, Product, Space } from '../types';
import { ChevronIcon, CloseIcon } from '../components/ui/Icons';
import { isCategoryMatch, CANONICAL_CATEGORIES } from '../config/categories';
import { MOTION_EASE } from '../lib/motion';

export const CategoryListingPage: React.FC = () => {
  const shouldReduceMotion = useReducedMotion();
  const { slug } = useParams<{ slug: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const subCategoryParam = searchParams.get('sub');

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters state
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>(subCategoryParam || '');
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([]);
  const [selectedSpaces, setSelectedSpaces] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'newest' | 'az'>('newest');
  const [visibleCount, setVisibleCount] = useState(12);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  useEffect(() => {
    if (subCategoryParam) {
      setSelectedSubCategory(subCategoryParam);
    }
  }, [subCategoryParam]);

  const loadCatalogData = () => {
    Promise.all([db.getProducts(), db.getCategories(), db.getSpaces()]).then(
      ([prods, cats, sps]) => {
        setProducts(prods.filter((p) => p.isPublished));
        setCategories(cats);
        setSpaces(sps);
        setLoading(false);
      }
    );
  };

  useEffect(() => {
    setLoading(true);
    loadCatalogData();
    const handleUpdate = () => {
      loadCatalogData();
    };
    window.addEventListener('ideal_products_updated', handleUpdate);
    return () => {
      window.removeEventListener('ideal_products_updated', handleUpdate);
    };
  }, []);

  // Determine current active category or "All"
  const currentCategory = useMemo(() => {
    if (!slug || slug === 'all') return null;
    const fromDb = categories.find((c) => c.slug === slug || c.name.toLowerCase() === slug.toLowerCase());
    if (fromDb) return fromDb;

    // Fallback to canonical taxonomy so all 10 categories work seamlessly even before DB sync
    const canonical = CANONICAL_CATEGORIES.find((c) => c.slug === slug || c.canonicalName.toLowerCase() === slug.toLowerCase());
    if (canonical) {
      return {
        id: `cat-${canonical.slug}`,
        name: canonical.canonicalName,
        slug: canonical.slug,
        image: canonical.image,
        description: canonical.description,
        order: 1,
        subCategories: canonical.subCategories,
      };
    }
    return null;
  }, [slug, categories]);

  // Derive unique materials
  const availableMaterials = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => {
      if (p.wood) set.add(p.wood);
      if (p.material.includes('Walnut')) set.add('Solid Himalayan Walnut');
      if (p.material.includes('Teak')) set.add('Aged Teak');
      if (p.material.includes('Sheesham')) set.add('Solid Chinioti Sheesham');
      if (p.material.includes('Velvet')) set.add('Jewel Velvet Upholstery');
      if (p.material.includes('Linen') || p.material.includes('Bouclé')) set.add('Premium Fabric & Poshish');
    });
    return Array.from(set);
  }, [products]);

  // Filter products
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        if (currentCategory && !isCategoryMatch(p.category, currentCategory.name) && !isCategoryMatch(p.category, currentCategory.slug)) {
          return false;
        }
        if (selectedSubCategory && p.subCategory !== selectedSubCategory) {
          return false;
        }
        if (selectedMaterials.length > 0) {
          const match = selectedMaterials.some(
            (m) => (p.wood && p.wood.includes(m)) || p.material.includes(m)
          );
          if (!match) return false;
        }
        if (selectedSpaces.length > 0) {
          const match = selectedSpaces.some((s) => p.spaces.includes(s));
          if (!match) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'az') return a.name.localeCompare(b.name);
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [products, currentCategory, selectedSubCategory, selectedMaterials, selectedSpaces, sortBy]);

  const displayedProducts = filteredProducts.slice(0, visibleCount);

  const toggleMaterial = (mat: string) => {
    setSelectedMaterials((prev) =>
      prev.includes(mat) ? prev.filter((m) => m !== mat) : [...prev, mat]
    );
  };

  const toggleSpace = (sp: string) => {
    setSelectedSpaces((prev) =>
      prev.includes(sp) ? prev.filter((s) => s !== sp) : [...prev, sp]
    );
  };

  const clearAllFilters = () => {
    setSelectedSubCategory('');
    setSelectedMaterials([]);
    setSelectedSpaces([]);
    setSearchParams({});
  };

  const bannerTitle = currentCategory ? currentCategory.name : 'The 2026 Archive';
  const bannerDescription = currentCategory
    ? `Explore our collection of handcrafted ${currentCategory.name.toLowerCase()} built from solid timbers and ancestral joinery.`
    : 'Complete catalogue of handcrafted furniture, solid wood suites, and luxury fabrics.';

  return (
    <Layout>
      {/* Banner with Category Photo Backdrop if available */}
      <div className="relative w-full bg-neutral-900 text-white py-12 sm:py-20 border-b border-neutral-800 overflow-hidden">
        {currentCategory?.image && (
          <div className="absolute inset-0 z-0">
            <img
              src={currentCategory.image}
              alt={bannerTitle}
              className="w-full h-full object-cover opacity-25 filter blur-xs scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-neutral-950/95 via-neutral-950/80 to-neutral-950/40" />
          </div>
        )}
        <div className="relative z-10 max-w-[1440px] mx-auto px-4 sm:px-8 md:px-12 lg:px-16">
          <span className="eyebrow text-[#D4A368] block mb-2">Ideal Furniture</span>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 sm:gap-6">
            <div>
              <h1 className="font-sans text-2xl sm:text-4xl md:text-5xl font-bold text-white leading-tight tracking-tight">
                {bannerTitle}
              </h1>
              <p className="font-sans text-xs sm:text-base text-neutral-300 max-w-xl mt-2 sm:mt-3 font-normal leading-relaxed">
                {bannerDescription}
              </p>
            </div>
            <span className="font-sans text-xs uppercase tracking-[0.16em] text-[#D4A368] font-semibold shrink-0">
              {filteredProducts.length} {filteredProducts.length === 1 ? 'Design' : 'Designs'} Available
            </span>
          </div>
        </div>
      </div>

      {/* Main Listing Layout */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 md:px-12 lg:px-16 py-8 sm:py-16">
        {/* Top Control Bar: Sort + Mobile Filter Button */}
        <div className="flex items-center justify-between pb-4 sm:pb-6 border-b border-neutral-200/80 mb-6 sm:mb-10 text-xs font-sans">
          <button
            onClick={() => setMobileFilterOpen(true)}
            className="lg:hidden flex items-center space-x-1.5 text-neutral-900 uppercase tracking-wider py-1.5 px-3 bg-neutral-100 rounded-lg font-medium"
          >
            <span>Filters</span>
            <ChevronIcon size={12} />
          </button>

          <div className="hidden lg:flex items-center space-x-4">
            {(selectedSubCategory || selectedMaterials.length > 0 || selectedSpaces.length > 0) && (
              <button
                onClick={clearAllFilters}
                className="text-[#8C5921] hover:text-black font-semibold underline decoration-[#8C5921] cursor-pointer"
              >
                Reset All Filters
              </button>
            )}
          </div>

          <div className="flex items-center space-x-2 sm:space-x-3 ml-auto">
            <label htmlFor="sort-select" className="text-neutral-500 uppercase tracking-wider text-[11px]">
              Sort:
            </label>
            <select
              id="sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'newest' | 'az')}
              className="bg-white border border-neutral-300 rounded-lg text-xs uppercase tracking-wider py-1.5 px-3 focus:outline-hidden focus:border-[#8C5921] text-neutral-800 cursor-pointer"
            >
              <option value="newest">Newest First</option>
              <option value="az">Alphabetical A–Z</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left Sidebar Filters (Desktop) */}
          <aside className="hidden lg:block lg:col-span-3 space-y-8 text-xs font-sans pr-6 border-r border-neutral-100">
            {/* Sub-categories */}
            {currentCategory && currentCategory.subCategories.length > 0 && (
              <div className="space-y-3">
                <h2 className="font-sans text-[11px] uppercase tracking-[0.18em] text-[#8C5921] font-bold">
                  Sub-Category
                </h2>
                <div className="space-y-1.5">
                  <button
                    onClick={() => {
                      setSelectedSubCategory('');
                      setSearchParams({});
                    }}
                    className={`block w-full text-left py-1 transition-colors cursor-pointer ${
                      !selectedSubCategory ? 'text-neutral-950 font-bold underline' : 'text-neutral-600 hover:text-neutral-950'
                    }`}
                  >
                    All {currentCategory.name}
                  </button>
                  {currentCategory.subCategories.map((sub) => (
                    <button
                      key={sub}
                      onClick={() => {
                        setSelectedSubCategory(sub);
                        setSearchParams({ sub });
                      }}
                      className={`block w-full text-left py-1 transition-colors cursor-pointer ${
                        selectedSubCategory === sub
                          ? 'text-[#8C5921] font-bold underline'
                          : 'text-neutral-600 hover:text-neutral-950'
                      }`}
                    >
                      {sub}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Material Filter */}
            <div className="space-y-3">
              <h2 className="font-sans text-[11px] uppercase tracking-[0.18em] text-[#8C5921] font-bold">
                Timber & Material
              </h2>
              <div className="space-y-2">
                {availableMaterials.map((mat) => {
                  const isChecked = selectedMaterials.includes(mat);
                  return (
                    <label
                      key={mat}
                      onClick={() => toggleMaterial(mat)}
                      className="flex items-center space-x-2.5 text-neutral-600 hover:text-neutral-950 cursor-pointer"
                    >
                      <span
                        className={`w-4 h-4 rounded-xs border flex items-center justify-center transition-colors ${
                          isChecked ? 'border-neutral-900 bg-neutral-900' : 'border-neutral-300 bg-white'
                        }`}
                      >
                        {isChecked && <span className="w-1.5 h-1.5 bg-white rounded-xs" />}
                      </span>
                      <span>{mat}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Space Filter */}
            <div className="space-y-3">
              <h2 className="font-sans text-[11px] uppercase tracking-[0.18em] text-[#8C5921] font-bold">
                Spatial Ensemble
              </h2>
              <div className="space-y-2">
                {spaces.map((sp) => {
                  const isChecked = selectedSpaces.includes(sp.name);
                  return (
                    <label
                      key={sp.id}
                      onClick={() => toggleSpace(sp.name)}
                      className="flex items-center space-x-2.5 text-neutral-600 hover:text-neutral-950 cursor-pointer"
                    >
                      <span
                        className={`w-4 h-4 rounded-xs border flex items-center justify-center transition-colors ${
                          isChecked ? 'border-neutral-900 bg-neutral-900' : 'border-neutral-300 bg-white'
                        }`}
                      >
                        {isChecked && <span className="w-1.5 h-1.5 bg-white rounded-xs" />}
                      </span>
                      <span>{sp.name}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          </aside>

          {/* Right Product Grid */}
          <main className="lg:col-span-9">
            {loading ? (
              <div className="py-24 text-center text-neutral-400 font-sans text-xs uppercase tracking-widest">
                Loading Furniture Pieces...
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="py-24 text-center space-y-4">
                <p className="font-sans font-bold text-2xl text-neutral-800">
                  No furniture pieces match the selected filters.
                </p>
                <button onClick={clearAllFilters} className="btn-secondary text-xs">
                  Clear All Filters
                </button>
              </div>
            ) : (
              <div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-6">
                  {displayedProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>

                {displayedProducts.length < filteredProducts.length && (
                  <div className="mt-14 text-center">
                    <button
                      onClick={() => setVisibleCount((prev) => prev + 6)}
                      className="btn-secondary"
                    >
                      Load More Furniture
                    </button>
                  </div>
                )}
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Mobile Filters Modal */}
      <AnimatePresence>
        {mobileFilterOpen && (
          <div className="fixed inset-0 z-50 flex justify-end">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25, ease: MOTION_EASE }}
              onClick={() => setMobileFilterOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            />
            <motion.div
              initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, x: '100%' }}
              animate={{ opacity: 1, x: 0 }}
              exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, x: '100%' }}
              transition={{ duration: 0.28, ease: MOTION_EASE }}
              className="relative z-10 w-full max-w-sm bg-white h-full p-6 overflow-y-auto flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-neutral-200">
                  <span className="font-serif text-xl text-neutral-900">Filters</span>
                  <button onClick={() => setMobileFilterOpen(false)} className="p-1 cursor-pointer">
                    <CloseIcon size={18} />
                  </button>
                </div>

                {/* Mobile filter bodies */}
                <div className="py-6 space-y-6 text-xs">
                  {currentCategory && (
                    <div>
                      <h3 className="font-sans uppercase text-[#B89360] font-semibold mb-2">
                        Sub-Category
                      </h3>
                      <div className="space-y-2">
                        <button
                          onClick={() => setSelectedSubCategory('')}
                          className={`block text-left ${!selectedSubCategory ? 'font-bold' : ''}`}
                        >
                          All
                        </button>
                        {currentCategory.subCategories.map((sub) => (
                          <button
                            key={sub}
                            onClick={() => setSelectedSubCategory(sub)}
                            className={`block text-left ${selectedSubCategory === sub ? 'font-bold text-[#B89360]' : ''}`}
                          >
                            {sub}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <h3 className="font-sans uppercase text-[#B89360] font-semibold mb-2">
                      Materials
                    </h3>
                    <div className="space-y-2">
                      {availableMaterials.map((mat) => (
                        <label
                          key={mat}
                          onClick={() => toggleMaterial(mat)}
                          className="flex items-center space-x-2 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={selectedMaterials.includes(mat)}
                            readOnly
                          />
                          <span>{mat}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-neutral-200 flex gap-3">
                <button
                  onClick={clearAllFilters}
                  className="flex-1 py-2.5 border border-neutral-300 text-xs uppercase tracking-wider rounded-full cursor-pointer hover:border-black transition-colors"
                >
                  Reset
                </button>
                <button
                  onClick={() => setMobileFilterOpen(false)}
                  className="flex-1 py-2.5 bg-neutral-900 text-white text-xs uppercase tracking-wider rounded-full cursor-pointer hover:bg-black transition-colors"
                >
                  Apply
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </Layout>
  );
};
