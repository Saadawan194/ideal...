import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { Layout } from '../components/layout/Layout';
import { ProductCard } from '../components/product/ProductCard';
import { InquiryModal } from '../components/product/InquiryModal';
import { db } from '../lib/db';
import { Product } from '../types';
import { CloseIcon, WhatsAppIcon } from '../components/ui/Icons';
import { handleWhatsAppInquiry } from '../lib/whatsapp';
import { isCategoryMatch } from '../config/categories';
import { MOTION_EASE } from '../lib/motion';

export const ProductDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const shouldReduceMotion = useReducedMotion();

  // Lightbox state
  const [lightboxImg, setLightboxImg] = useState<string | null>(null);
  // Mobile carousel index
  const [activeMobileIdx, setActiveMobileIdx] = useState(0);
  // Callback modal state
  const [inquiryModalOpen, setInquiryModalOpen] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    setLoading(true);
    if (slug) {
      db.getProductBySlug(slug).then((prod) => {
        setProduct(prod);
        if (prod) {
          // Dynamic Document Title and SEO Metadata
          document.title = `${prod.name} | Ideal Furniture Lahore`;

          const descText = prod.shortDescription || prod.longDescription || `Handcrafted ${prod.name} by Ideal Furniture Lahore. Solid timber, tailored poshish, and master craftsmanship.`;
          let metaDesc = document.querySelector('meta[name="description"]');
          if (!metaDesc) {
            metaDesc = document.createElement('meta');
            metaDesc.setAttribute('name', 'description');
            document.head.appendChild(metaDesc);
          }
          metaDesc.setAttribute('content', descText);

          // Canonical URL
          const currentUrl = window.location.origin + `/product/${prod.slug || prod.id}`;
          let linkCanonical = document.querySelector('link[rel="canonical"]');
          if (!linkCanonical) {
            linkCanonical = document.createElement('link');
            linkCanonical.setAttribute('rel', 'canonical');
            document.head.appendChild(linkCanonical);
          }
          linkCanonical.setAttribute('href', currentUrl);

          // OpenGraph Tags
          const setMeta = (property: string, content: string) => {
            let el = document.querySelector(`meta[property="${property}"]`);
            if (!el) {
              el = document.createElement('meta');
              el.setAttribute('property', property);
              document.head.appendChild(el);
            }
            el.setAttribute('content', content);
          };
          setMeta('og:title', `${prod.name} | Ideal Furniture Lahore`);
          setMeta('og:description', descText);
          setMeta('og:url', currentUrl);
          if (prod.images && prod.images.length > 0) {
            const fullImg = prod.images[0].startsWith('http') ? prod.images[0] : `${window.location.origin}${prod.images[0]}`;
            setMeta('og:image', fullImg);
          }

          // JSON-LD Structured Data
          const schemaId = 'product-jsonld-schema';
          let scriptTag = document.getElementById(schemaId);
          if (!scriptTag) {
            scriptTag = document.createElement('script');
            scriptTag.id = schemaId;
            scriptTag.setAttribute('type', 'application/ld+json');
            document.head.appendChild(scriptTag);
          }
          const productSchema = {
            '@context': 'https://schema.org',
            '@type': 'Product',
            name: prod.name,
            image: prod.images || [],
            description: descText,
            sku: prod.productCode || prod.id,
            brand: {
              '@type': 'Brand',
              name: 'Ideal Furniture',
            },
            offers: {
              '@type': 'Offer',
              url: currentUrl,
              priceCurrency: 'PKR',
              availability: 'https://schema.org/InStock',
              itemCondition: 'https://schema.org/NewCondition',
            },
          };
          scriptTag.textContent = JSON.stringify(productSchema);

          db.getProducts().then((all) => {
            const related = all
              .filter((p) => isCategoryMatch(p.category, prod.category) && p.id !== prod.id && p.isPublished)
              .slice(0, 4);
            setRelatedProducts(related);
          });
        }
        setLoading(false);
      });
    }

    return () => {
      const scriptTag = document.getElementById('product-jsonld-schema');
      if (scriptTag) scriptTag.remove();
    };
  }, [slug]);

  const handleWhatsAppClick = () => {
    if (!product) return;
    handleWhatsAppInquiry({
      source: 'whatsapp_product',
      productId: product.id,
      productName: product.name,
      productCode: product.productCode,
    });
  };

  if (loading) {
    return (
      <Layout>
        <div className="py-36 text-center text-neutral-400 font-sans text-xs uppercase tracking-widest">
          Loading Product Details...
        </div>
      </Layout>
    );
  }

  if (!product) {
    return (
      <Layout>
        <div className="py-36 text-center space-y-4">
          <h1 className="font-sans font-bold text-3xl text-neutral-900">Product Not Found</h1>
          <p className="text-sm font-sans text-neutral-500">
            The requested furniture piece could not be found.
          </p>
          <Link to="/collections/all" className="btn-secondary text-xs inline-block mt-4">
            Return to All Furniture
          </Link>
        </div>
      </Layout>
    );
  }

  const FALLBACK_DETAIL = 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1280&q=75';

  const rawList: string[] = [];
  if (product.featuredImage && typeof product.featuredImage === "string" && product.featuredImage.trim()) {
    rawList.push(product.featuredImage.trim());
  }
  if (Array.isArray(product.images)) {
    for (const img of product.images) {
      if (typeof img === "string" && img.trim() && !rawList.includes(img.trim())) {
        rawList.push(img.trim());
      }
    }
  }
  const images = rawList.length > 0 ? rawList : [FALLBACK_DETAIL];

  const jsonLd = {
    '@context': 'https://schema.org/',
    '@type': 'Product',
    name: product.name,
    image: images,
    description: product.shortDescription,
    sku: product.productCode,
    brand: {
      '@type': 'Brand',
      name: 'Ideal Furniture',
    },
    category: product.category,
    material: product.material,
  };

  return (
    <Layout>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Breadcrumbs */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 md:px-12 lg:px-16 pt-6 sm:pt-8 pb-3 sm:pb-4 text-xs font-sans text-neutral-400 flex items-center space-x-2 overflow-x-auto no-scrollbar whitespace-nowrap">
        <Link to="/" className="hover:text-neutral-900 transition-colors">Home</Link>
        <span>/</span>
        <Link to={`/collections/${product.category.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`} className="hover:text-neutral-900 transition-colors">
          {product.category}
        </Link>
        <span>/</span>
        <span className="text-neutral-900 font-medium truncate max-w-[200px]">{product.name}</span>
      </div>

      {/* Main Product Layout: 60% Left / 40% Right */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 md:px-12 lg:px-16 py-4 sm:py-6 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
          
          {/* Left: Gallery (7 cols) */}
          <div className="lg:col-span-7">
            {/* Desktop Vertical Stack */}
            <div className="hidden lg:flex flex-col space-y-6">
              {images.map((img, idx) => (
                <div
                  key={idx}
                  onClick={() => setLightboxImg(img)}
                  className="w-full aspect-4/3 min-h-[380px] max-h-[640px] bg-[#f9f8f6] rounded-2xl overflow-hidden border border-neutral-200/90 cursor-zoom-in group shadow-xs hover:shadow-md transition-shadow flex items-center justify-center p-3"
                >
                  <img
                    src={img}
                    alt={`${product.name} view ${idx + 1}`}
                    loading={idx === 0 ? 'eager' : 'lazy'}
                    onError={(e) => { (e.currentTarget as HTMLImageElement).src = FALLBACK_DETAIL; }}
                    className="w-full h-full max-h-[600px] object-contain transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.02]"
                  />
                </div>
              ))}
            </div>

            {/* Mobile Carousel */}
            <div className="lg:hidden relative">
              <div
                onClick={() => setLightboxImg(images[activeMobileIdx])}
                className="w-full aspect-4/3 bg-[#f9f8f6] rounded-2xl overflow-hidden border border-neutral-200/90 cursor-zoom-in shadow-xs flex items-center justify-center p-2"
              >
                <img
                  src={images[activeMobileIdx]}
                  alt={`${product.name} view`}
                  onError={(e) => { (e.currentTarget as HTMLImageElement).src = FALLBACK_DETAIL; }}
                  className="w-full h-full object-contain"
                />
              </div>
              {images.length > 1 && (
                <div className="flex items-center justify-center space-x-2 mt-4">
                  {images.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveMobileIdx(i)}
                      className={`h-1.5 transition-all rounded-full cursor-pointer ${
                        activeMobileIdx === i ? 'w-8 bg-neutral-900' : 'w-2 bg-neutral-300'
                      }`}
                      aria-label={`Slide ${i + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right: Sticky Details (5 cols) */}
          <div className="lg:col-span-5 lg:sticky lg:top-28 space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="eyebrow">{product.category}</span>
                {product.productCode && (
                  <span className="font-mono text-xs text-neutral-400">
                    CODE: #{product.productCode}
                  </span>
                )}
              </div>
              <h1 className="font-serif text-3xl sm:text-4xl lg:text-4xl text-neutral-950 font-normal leading-tight tracking-[-0.02em]">
                {product.name}
              </h1>
            </div>

            {/* Simple Clean Description */}
            <div className="text-neutral-600 font-sans text-sm sm:text-base leading-relaxed">
              <p className="whitespace-pre-line">
                {product.shortDescription || product.longDescription}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="pt-4 border-t border-neutral-200/80 space-y-3">
              <button
                type="button"
                onClick={handleWhatsAppClick}
                className="w-full btn-primary flex items-center justify-center gap-2 cursor-pointer py-3.5 text-sm"
              >
                <WhatsAppIcon size={18} className="text-[#25D366]" />
                <span>Discuss Pricing on WhatsApp</span>
              </button>
              <button
                type="button"
                onClick={() => setInquiryModalOpen(true)}
                className="w-full btn-secondary flex items-center justify-center gap-2 cursor-pointer py-3 text-xs"
              >
                <span>Request Private Callback</span>
              </button>
            </div>
          </div>
        </div>

        {/* Related Creations */}
        {relatedProducts.length > 0 && (
          <section className="mt-24 pt-16 border-t border-neutral-200/80">
            <div className="mb-10">
              <span className="eyebrow block mb-2">Curated Complements</span>
              <h2 className="font-serif text-3xl sm:text-4xl font-normal text-neutral-950 leading-[1.12] tracking-[-0.02em]">
                You May Also <span className="text-[#8C5921] font-bold">Adore</span>
              </h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
              {relatedProducts.map((rel) => (
                <ProductCard key={rel.id} product={rel} />
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Inquiry Modal */}
      <InquiryModal
        isOpen={inquiryModalOpen}
        onClose={() => setInquiryModalOpen(false)}
        product={product}
      />

      {/* Lightbox with smooth presence */}
      <AnimatePresence>
        {lightboxImg && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: MOTION_EASE }}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-8"
            onClick={() => setLightboxImg(null)}
          >
            <button
              onClick={() => setLightboxImg(null)}
              className="absolute top-6 right-6 text-white hover:text-[#D4A368] p-2 cursor-pointer transition-colors"
              aria-label="Close Lightbox"
            >
              <CloseIcon size={24} />
            </button>
            <motion.img
              initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.25, ease: MOTION_EASE }}
              src={lightboxImg}
              alt="Expanded view"
              className="max-h-[90vh] max-w-[90vw] object-contain rounded-xl shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </Layout>
  );
};
