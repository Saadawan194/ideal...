import React, { useEffect, useState } from 'react';
import { AdminLayout } from './AdminLayout';
import { db } from '../../lib/db';
import { HomepageContent, Product } from '../../types';

export const AdminHomepageEditor: React.FC = () => {
  const [content, setContent] = useState<HomepageContent | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [savedNotice, setSavedNotice] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    Promise.all([db.getHomepageContent(), db.getProducts()]).then(([homeData, prodData]) => {
      setContent(homeData);
      setProducts(prodData);
    });
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content) return;

    setIsSaving(true);
    await db.updateHomepageContent(content);
    setIsSaving(false);
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 3000);
  };

  const toggleProductId = (listKey: 'signatureProductIds' | 'accessoriesProductIds' | 'textilesProductIds', id: string) => {
    if (!content) return;
    const currentList = content[listKey] || [];
    const exists = currentList.includes(id);

    let updated: string[];
    if (exists) {
      updated = currentList.filter((x) => x !== id);
    } else {
      if (currentList.length >= 8) {
        setErrorMessage('Maximum 8 products can be pinned for this section.');
        setTimeout(() => setErrorMessage(null), 4000);
        return;
      }
      updated = [...currentList, id];
    }
    setContent({ ...content, [listKey]: updated });
  };

  if (!content) {
    return (
      <AdminLayout title="Homepage Content Editor">
        <div className="py-20 text-center text-muted">Loading Homepage Content...</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      title="Homepage Content Editor"
      subtitle="Refine hero video backgrounds, brand statements, pinned product curation, and editorial imagery."
      action={
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="btn-secondary text-xs py-2 px-4 inline-block"
        >
          Live Preview ↗
        </a>
      }
    >
      {savedNotice && (
        <div className="mb-6 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-sans">
          Homepage updates saved successfully and live on public site.
        </div>
      )}

      {errorMessage && (
        <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-800 text-xs font-sans">
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-12 text-xs font-sans pb-16">
        
        {/* 1. HERO SECTION */}
        <div className="bg-paper border border-line p-6 sm:p-8 space-y-5">
          <span className="eyebrow text-accent block">Section 1 • Hero Video & Heading</span>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block uppercase tracking-wider text-muted mb-1">Eyebrow</label>
              <input
                type="text"
                value={content.heroEyebrow}
                onChange={(e) => setContent({ ...content, heroEyebrow: e.target.value })}
                className="w-full px-3 py-2 border border-line bg-paper"
              />
            </div>
            <div>
              <label className="block uppercase tracking-wider text-muted mb-1">H1 Heading</label>
              <input
                type="text"
                value={content.heroHeading}
                onChange={(e) => setContent({ ...content, heroHeading: e.target.value })}
                className="w-full px-3 py-2 border border-line bg-paper text-sm font-serif"
              />
            </div>
          </div>

          <div>
            <label className="block uppercase tracking-wider text-muted mb-1">Subtext (Max 18 words)</label>
            <input
              type="text"
              value={content.heroSubtext}
              onChange={(e) => setContent({ ...content, heroSubtext: e.target.value })}
              className="w-full px-3 py-2 border border-line bg-paper"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block uppercase tracking-wider text-muted mb-1">Primary CTA Label</label>
              <input
                type="text"
                value={content.heroPrimaryCta}
                onChange={(e) => setContent({ ...content, heroPrimaryCta: e.target.value })}
                className="w-full px-3 py-2 border border-line bg-paper"
              />
            </div>
            <div>
              <label className="block uppercase tracking-wider text-muted mb-1">Secondary CTA Label</label>
              <input
                type="text"
                value={content.heroSecondaryCta}
                onChange={(e) => setContent({ ...content, heroSecondaryCta: e.target.value })}
                className="w-full px-3 py-2 border border-line bg-paper"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block uppercase tracking-wider text-muted mb-1">Video URL (.mp4 / .webm)</label>
              <input
                type="text"
                value={content.heroVideoUrl}
                onChange={(e) => setContent({ ...content, heroVideoUrl: e.target.value })}
                className="w-full px-3 py-2 border border-line bg-paper font-mono"
              />
            </div>
            <div>
              <label className="block uppercase tracking-wider text-muted mb-1">Poster Image URL (Instant LCP Paint)</label>
              <input
                type="url"
                value={content.heroPosterUrl}
                onChange={(e) => setContent({ ...content, heroPosterUrl: e.target.value })}
                className="w-full px-3 py-2 border border-line bg-paper font-mono"
              />
            </div>
          </div>
        </div>

        {/* 2. BRAND STATEMENT */}
        <div className="bg-paper border border-line p-6 sm:p-8 space-y-5">
          <span className="eyebrow text-accent block">Section 2 • Brand Statement</span>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block uppercase tracking-wider text-muted mb-1">Heading Prefix</label>
              <input
                type="text"
                value={content.brandStatementHeading}
                onChange={(e) => setContent({ ...content, brandStatementHeading: e.target.value })}
                className="w-full px-3 py-2 border border-line bg-paper"
              />
            </div>
            <div>
              <label className="block uppercase tracking-wider text-muted mb-1">Accent Word (Italic)</label>
              <input
                type="text"
                value={content.brandStatementAccentWord}
                onChange={(e) => setContent({ ...content, brandStatementAccentWord: e.target.value })}
                className="w-full px-3 py-2 border border-line bg-paper"
              />
            </div>
          </div>

          <div>
            <label className="block uppercase tracking-wider text-muted mb-1">Statement Body Copy (2 Sentences)</label>
            <textarea
              rows={3}
              value={content.brandStatementText}
              onChange={(e) => setContent({ ...content, brandStatementText: e.target.value })}
              className="w-full px-3 py-2 border border-line bg-paper leading-relaxed font-light"
            />
          </div>
        </div>

        {/* 3. SIGNATURE PIECES (Select up to 8) */}
        <div className="bg-paper border border-line p-6 sm:p-8 space-y-4">
          <div className="flex items-center justify-between">
            <span className="eyebrow text-accent block">Section 3 • Signature Pieces Picker (Max 8)</span>
            <span className="text-muted">Selected: {content.signatureProductIds.length} / 8</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-h-60 overflow-y-auto p-2 border border-line bg-bone/30">
            {products.map((p) => {
              const selected = content.signatureProductIds.includes(p.id);
              return (
                <div
                  key={p.id}
                  onClick={() => toggleProductId('signatureProductIds', p.id)}
                  className={`p-2 border cursor-pointer flex items-center space-x-2 transition-colors ${
                    selected ? 'border-ink bg-ink text-paper' : 'border-line bg-paper text-ink'
                  }`}
                >
                  <img src={p.images[0]} alt="" className="w-8 h-8 object-cover" />
                  <div className="truncate flex-1">
                    <p className="truncate font-medium">{p.name}</p>
                    <p className="text-[10px] opacity-70">{p.productCode}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 4. HOME ACCESSORIES (Select up to 8) */}
        <div className="bg-paper border border-line p-6 sm:p-8 space-y-4">
          <div className="flex items-center justify-between">
            <span className="eyebrow text-accent block">Section 4 • Home Accessories Picker (Max 8)</span>
            <span className="text-muted">Selected: {content.accessoriesProductIds.length} / 8</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-h-60 overflow-y-auto p-2 border border-line bg-bone/30">
            {products.map((p) => {
              const selected = content.accessoriesProductIds.includes(p.id);
              return (
                <div
                  key={p.id}
                  onClick={() => toggleProductId('accessoriesProductIds', p.id)}
                  className={`p-2 border cursor-pointer flex items-center space-x-2 transition-colors ${
                    selected ? 'border-ink bg-ink text-paper' : 'border-line bg-paper text-ink'
                  }`}
                >
                  <img src={p.images[0]} alt="" className="w-8 h-8 object-cover" />
                  <div className="truncate flex-1">
                    <p className="truncate font-medium">{p.name}</p>
                    <p className="text-[10px] opacity-70">{p.productCode}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 5. TEXTILES PICKER (Select up to 8) */}
        <div className="bg-paper border border-line p-6 sm:p-8 space-y-4">
          <div className="flex items-center justify-between">
            <span className="eyebrow text-accent block">Section 6 • Textiles & Mirrors Picker (Max 8)</span>
            <span className="text-muted">Selected: {content.textilesProductIds.length} / 8</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-h-60 overflow-y-auto p-2 border border-line bg-bone/30">
            {products.map((p) => {
              const selected = content.textilesProductIds.includes(p.id);
              return (
                <div
                  key={p.id}
                  onClick={() => toggleProductId('textilesProductIds', p.id)}
                  className={`p-2 border cursor-pointer flex items-center space-x-2 transition-colors ${
                    selected ? 'border-ink bg-ink text-paper' : 'border-line bg-paper text-ink'
                  }`}
                >
                  <img src={p.images[0]} alt="" className="w-8 h-8 object-cover" />
                  <div className="truncate flex-1">
                    <p className="truncate font-medium">{p.name}</p>
                    <p className="text-[10px] opacity-70">{p.productCode}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 6. CONSULTATION SECTION */}
        <div className="bg-paper border border-line p-6 sm:p-8 space-y-5">
          <span className="eyebrow text-accent block">Section 8 • Free Interior Consultation Panel</span>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block uppercase tracking-wider text-muted mb-1">Heading Prefix</label>
              <input
                type="text"
                placeholder="e.g. Free"
                value={content.consultationHeading}
                onChange={(e) => setContent({ ...content, consultationHeading: e.target.value })}
                className="w-full px-3 py-2 border border-line bg-paper"
              />
            </div>
            <div>
              <label className="block uppercase tracking-wider text-muted mb-1">Accent Word (Italic)</label>
              <input
                type="text"
                placeholder="e.g. Interior"
                value={content.consultationAccentWord}
                onChange={(e) => setContent({ ...content, consultationAccentWord: e.target.value })}
                className="w-full px-3 py-2 border border-line bg-paper"
              />
            </div>
          </div>

          <div>
            <label className="block uppercase tracking-wider text-muted mb-1">Image URL (50% Split)</label>
            <input
              type="url"
              value={content.consultationImage}
              onChange={(e) => setContent({ ...content, consultationImage: e.target.value })}
              className="w-full px-3 py-2 border border-line bg-paper"
            />
          </div>
        </div>

        {/* 7. WORLDWIDE DELIVERY */}
        <div className="bg-paper border border-line p-6 sm:p-8 space-y-5">
          <span className="eyebrow text-accent block">Section 9 • Worldwide Delivery</span>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block uppercase tracking-wider text-muted mb-1">Heading</label>
              <input
                type="text"
                value={content.deliveryHeading}
                onChange={(e) => setContent({ ...content, deliveryHeading: e.target.value })}
                className="w-full px-3 py-2 border border-line bg-paper"
              />
            </div>
            <div>
              <label className="block uppercase tracking-wider text-muted mb-1">Accent Word</label>
              <input
                type="text"
                value={content.deliveryAccentWord}
                onChange={(e) => setContent({ ...content, deliveryAccentWord: e.target.value })}
                className="w-full px-3 py-2 border border-line bg-paper"
              />
            </div>
          </div>

          <div>
            <label className="block uppercase tracking-wider text-muted mb-1">Delivery Paragraph</label>
            <textarea
              rows={3}
              value={content.deliveryText}
              onChange={(e) => setContent({ ...content, deliveryText: e.target.value })}
              className="w-full px-3 py-2 border border-line bg-paper leading-relaxed font-light"
            />
          </div>

          <div>
            <label className="block uppercase tracking-wider text-muted mb-1">Crating & Logistics Image URL</label>
            <input
              type="url"
              value={content.deliveryImage}
              onChange={(e) => setContent({ ...content, deliveryImage: e.target.value })}
              className="w-full px-3 py-2 border border-line bg-paper"
            />
          </div>
        </div>

        {/* 8. INSTAGRAM 6-IMAGE ROW */}
        <div className="bg-paper border border-line p-6 sm:p-8 space-y-4">
          <span className="eyebrow text-accent block">Section 10 • Instagram 6-Image Row</span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {content.instagramImages.map((img, idx) => (
              <div key={idx}>
                <label className="block uppercase tracking-wider text-muted mb-1">Image {idx + 1}</label>
                <input
                  type="url"
                  value={img}
                  onChange={(e) => {
                    const next = [...content.instagramImages];
                    next[idx] = e.target.value;
                    setContent({ ...content, instagramImages: next });
                  }}
                  className="w-full px-3 py-2 border border-line bg-paper text-xs"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Save Bar */}
        <div className="sticky bottom-4 z-20 bg-paper border border-line p-4 shadow-sm flex items-center justify-between">
          <span className="text-xs text-muted">Review changes and publish to live homepage.</span>
          <button
            type="submit"
            disabled={isSaving}
            className="btn-primary text-xs py-3 px-8"
          >
            {isSaving ? 'Publishing...' : 'Save & Publish Homepage'}
          </button>
        </div>
      </form>
    </AdminLayout>
  );
};
