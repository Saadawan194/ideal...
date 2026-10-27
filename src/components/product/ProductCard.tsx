import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Product } from "../../types";
import { handleWhatsAppInquiry } from "../../lib/whatsapp";
import { WhatsAppIcon } from "../ui/Icons";

interface ProductCardProps {
  product: Product;
  className?: string;
}

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=640&q=75";

const optimizeImageUrl = (url: string, width = 600): string => {
  if (!url) return FALLBACK_IMAGE;
  if (url.startsWith("/uploads/") || url.startsWith("data:")) {
    return url;
  }
  if (url.includes("images.unsplash.com")) {
    const cleanUrl = url.split("?")[0];
    return `${cleanUrl}?auto=format&fit=crop&w=${width}&q=75`;
  }
  return url;
};

export const ProductCard: React.FC<ProductCardProps> = ({ product, className = "" }) => {
  const navigate = useNavigate();

  // Prioritize featuredImage, then first element of images array
  const getPrimaryImage = (): string => {
    if (product.featuredImage && typeof product.featuredImage === "string" && product.featuredImage.trim()) {
      return product.featuredImage.trim();
    }
    if (Array.isArray(product.images) && product.images.length > 0 && typeof product.images[0] === "string" && product.images[0].trim()) {
      return product.images[0].trim();
    }
    return FALLBACK_IMAGE;
  };

  const [imgSrc, setImgSrc] = useState<string>(() => optimizeImageUrl(getPrimaryImage(), 600));

  useEffect(() => {
    setImgSrc(optimizeImageUrl(getPrimaryImage(), 600));
  }, [product.featuredImage, product.images]);

  let variantHint = "";
  if (product.options && product.options.length > 0) {
    const opt = product.options[0];
    variantHint = `${opt.values.length} ${opt.label} Options`;
  } else if (product.seatingOrSize) {
    variantHint = product.seatingOrSize;
  }

  const productPath = `/product/${product.slug || product.id}`;

  const handleCardClick = () => {
    navigate(productPath);
  };

  const handleWhatsAppClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    handleWhatsAppInquiry({
      source: "whatsapp_product",
      productId: product.id,
      productName: product.name,
      productCode: product.productCode,
    });
  };

  return (
    <article
      className={`group flex flex-col bg-white rounded-xl overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1 active:scale-[0.99] cursor-pointer ${className}`}
      onClick={handleCardClick}
    >
      {/* 4:3 Aspect Ratio Image Frame - Full Furniture Display Without Cropping (Still Image, No Swap) */}
      <div className="relative aspect-4/3 w-full bg-[#f9f8f6] overflow-hidden rounded-xl border border-neutral-200/70 group-hover:border-neutral-300 transition-colors flex items-center justify-center p-1.5">
        <img
          src={imgSrc}
          alt={product.name}
          loading="lazy"
          decoding="async"
          onError={() => {
            if (imgSrc !== FALLBACK_IMAGE) setImgSrc(FALLBACK_IMAGE);
          }}
          className="w-full h-full object-contain"
        />

        {/* Quiet Category Tag */}
        <div className="absolute top-2.5 left-2.5 pointer-events-none">
          <span className="text-[10px] font-sans font-medium uppercase tracking-wider text-neutral-800 bg-white/90 backdrop-blur-xs px-2 py-0.5 rounded shadow-xs">
            {product.category}
          </span>
        </div>

        {/* Quick WhatsApp Inquiry Icon Button with tactile micro-interaction */}
        <button
          type="button"
          onClick={handleWhatsAppClick}
          aria-label={`Inquire about ${product.name} on WhatsApp`}
          className="group/wa absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-white/95 text-neutral-800 hover:text-white hover:bg-[#20BA56] border border-neutral-200/80 hover:border-[#20BA56] flex items-center justify-center shadow-xs hover:shadow-md transition-all duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] cursor-pointer hover:scale-105 active:scale-95"
          title="Inquire on WhatsApp"
        >
          <WhatsAppIcon size={14} className="text-[#25D366] group-hover/wa:text-white transition-colors" />
        </button>
      </div>

      {/* Minimal Product Details */}
      <div className="pt-3 pb-1 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between gap-1 text-[10.5px] uppercase tracking-wider text-[#8C5921] font-bold">
            <span className="truncate">Handcrafted Solid Wood</span>
            {product.productCode && (
              <span className="font-mono text-[9.5px] text-neutral-500 font-normal">
                #{product.productCode}
              </span>
            )}
          </div>
          <h3 className="font-sans text-sm sm:text-base text-neutral-950 font-bold leading-snug group-hover:text-black group-hover:underline underline-offset-4 decoration-[#8C5921] transition-all mt-0.5 line-clamp-1">
            {product.name}
          </h3>
          <p className="text-xs text-neutral-600 font-sans line-clamp-1 font-normal mt-0.5">
            {product.material || product.shortDescription}
          </p>
          {variantHint && (
            <p className="text-[11px] text-neutral-500 font-sans font-normal mt-1 truncate">
              {variantHint}
            </p>
          )}
        </div>

        {/* Clean Minimal Action Bar with subtle micro-arrow animation */}
        <div className="mt-2.5 pt-2 border-t border-neutral-100 flex items-center justify-between text-xs">
          <span className="font-sans text-[11px] text-neutral-600 font-medium">
            Custom Dimensions
          </span>
          <span className="text-[11.5px] font-sans font-bold text-neutral-900 group-hover:text-[#8C5921] transition-colors flex items-center gap-1">
            <span>Inquire</span>
            <span className="group-hover:translate-x-1 transition-transform duration-200 ease-[cubic-bezier(0.22,1,0.36,1)]">
              →
            </span>
          </span>
        </div>
      </div>
    </article>
  );
};
