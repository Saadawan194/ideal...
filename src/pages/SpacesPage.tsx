import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { ProductCard } from '../components/product/ProductCard';
import { db } from '../lib/db';
import { Product, Space } from '../types';

export const SpacesPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [currentSpace, setCurrentSpace] = useState<Space | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([db.getSpaces(), db.getProducts()]).then(([spList, prodList]) => {
      setSpaces(spList);
      if (slug) {
        const found = spList.find((s) => s.slug === slug);
        setCurrentSpace(found || null);
      } else {
        setCurrentSpace(null);
      }
      setProducts(prodList.filter((p) => p.isPublished));
      setLoading(false);
    });
  }, [slug]);

  // If specific space slug is active:
  if (slug && currentSpace) {
    const spaceProducts = products.filter((p) => p.spaces.includes(currentSpace.name));
    return (
      <Layout>
        {/* Space Hero Banner */}
        <div className="relative w-full h-[45vh] min-h-[360px] bg-ink overflow-hidden flex items-end">
          <img
            src={currentSpace.image}
            alt={currentSpace.name}
            className="absolute inset-0 w-full h-full object-cover opacity-70"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/20 to-transparent" />
          <div className="relative z-10 max-w-[1440px] mx-auto px-5 sm:px-8 md:px-12 lg:px-16 xl:px-20 pb-12 w-full text-paper">
            <span className="eyebrow text-accent block mb-2">Space Collection</span>
            <h1 className="font-serif text-3xl sm:text-5xl md:text-6xl font-light text-paper leading-[1.06] tracking-[-0.025em]">
              {currentSpace.name}
            </h1>
            <p className="font-sans text-sm text-paper/85 max-w-lg mt-3 font-light leading-relaxed">
              {currentSpace.description}
            </p>
          </div>
        </div>

        {/* Space Products */}
        <div className="max-w-[1440px] mx-auto px-5 sm:px-8 md:px-12 lg:px-16 xl:px-20 py-16 sm:py-24">
          <div className="flex items-center justify-between pb-6 border-b border-line mb-10 text-xs font-sans">
            <span className="text-muted uppercase tracking-wider">
              {spaceProducts.length} Specimen{spaceProducts.length === 1 ? '' : 's'} Curated
            </span>
            <Link
              to="/spaces"
              className="text-ink hover:text-accent uppercase tracking-wider underline underline-offset-4 decoration-line"
            >
              All Spaces
            </Link>
          </div>

          {spaceProducts.length === 0 ? (
            <div className="py-20 text-center space-y-3">
              <p className="font-serif text-2xl text-ink">No items listed in this space</p>
              <Link to="/collections/all" className="btn-secondary text-xs">
                Browse Full Catalogue
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-8 lg:gap-10">
              {spaceProducts.map((prod) => (
                <ProductCard key={prod.id} product={prod} />
              ))}
            </div>
          )}
        </div>
      </Layout>
    );
  }

  // Listing all spaces
  return (
    <Layout>
      <div className="w-full bg-bone py-16 sm:py-24 border-b border-line">
        <div className="max-w-[1440px] mx-auto px-5 sm:px-8 md:px-12 lg:px-16 xl:px-20">
          <span className="eyebrow block mb-3">Architectural Curation</span>
          <h1 className="font-serif text-3xl sm:text-5xl md:text-6xl font-light text-ink leading-[1.06] tracking-[-0.025em]">
            Shop by <span className="italic text-accent font-normal">Space</span>
          </h1>
          <p className="font-sans text-sm text-ink/75 max-w-xl mt-3 font-light leading-relaxed">
            Curated furniture ensembles composed specifically for each room of the residence.
          </p>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-5 sm:px-8 md:px-12 lg:px-16 xl:px-20 py-16 lg:py-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
          {spaces.map((sp) => (
            <Link
              key={sp.id}
              to={`/spaces/${sp.slug}`}
              className="group flex flex-col space-y-4 cursor-pointer"
            >
              <div className="aspect-4/3 w-full bg-bone overflow-hidden border border-line">
                <img
                  src={sp.image}
                  alt={sp.name}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                />
              </div>
              <div className="space-y-1">
                <h2 className="font-serif text-2xl text-ink font-normal group-hover:text-accent transition-colors">
                  {sp.name}
                </h2>
                <p className="text-xs text-muted/90 font-sans font-light leading-relaxed">
                  {sp.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </Layout>
  );
};
