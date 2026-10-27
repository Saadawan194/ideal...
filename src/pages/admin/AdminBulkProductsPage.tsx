import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { AdminLayout } from './AdminLayout';
import { db } from '../../lib/db';
import { Product } from '../../types';
import {
  Sparkles,
  CheckCircle2,
  Trash2,
  Plus,
  RefreshCw,
  ExternalLink,
  ListPlus,
  Layers,
  ArrowRight,
  SlidersHorizontal,
} from 'lucide-react';

interface DraftProduct {
  id: string;
  name: string;
  category: string;
  description: string;
  images: string[];
  productCode: string;
}

export const AdminBulkProductsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'ai' | 'paste'>('ai');
  const [count, setCount] = useState<number>(15);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [theme, setTheme] = useState<string>('Pakistani Handcrafted & Modern Luxury Mix');
  const [pasteText, setPasteText] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [draftProducts, setDraftProducts] = useState<DraftProduct[]>([]);
  const [publishedCount, setPublishedCount] = useState<number | null>(null);

  const categories = [
    { value: 'all', label: 'All Furniture Categories (Mix)' },
    { value: 'Beds', label: 'Beds & Bedrooms (بیڈ روم)' },
    { value: 'Seating', label: 'Sofas & Haute Seating (ڈرائنگ روم)' },
    { value: 'Dining', label: 'Dining Tables & Sets (ڈائننگ روم)' },
    { value: 'Tables', label: 'Center & Coffee Tables (سینٹر ٹیبل)' },
    { value: 'Storage', label: 'Storage & Credenzas (الماریاں و کیبنٹ)' },
    { value: 'Office', label: 'Executive Desks & Office (آفس فرنیچر)' },
  ];

  // 1-Click AI Batch Generator
  const handleGenerateBatch = async () => {
    setIsGenerating(true);
    setPublishedCount(null);
    try {
      const generated = await db.generateBulkProducts(count, categoryFilter, theme);
      if (generated && generated.length > 0) {
        const drafts: DraftProduct[] = generated.map((p, idx) => ({
          id: `draft-${Date.now()}-${idx}`,
          name: p.name,
          category: p.category,
          description: p.shortDescription || p.longDescription || '',
          images: p.images.length > 0 ? p.images : ['https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1000&q=85'],
          productCode: p.productCode || `IF-${Math.floor(1000 + Math.random() * 9000)}`,
        }));
        setDraftProducts(drafts);
      }
    } catch (err) {
      console.error('Failed to generate batch:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  // Convert Pasted Titles to Products
  const handleConvertPasted = () => {
    const lines = pasteText
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.length > 0);
    if (lines.length === 0) return;

    const sampleImages: Record<string, string> = {
      Beds: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1000&q=85',
      Seating: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1000&q=85',
      Dining: 'https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&w=1000&q=85',
      Tables: 'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&w=1000&q=85',
      Storage: 'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&w=1000&q=85',
      Office: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=1000&q=85',
    };

    const newDrafts: DraftProduct[] = lines.map((title, idx) => {
      let cat = 'Seating';
      const t = title.toLowerCase();
      if (t.includes('bed') || t.includes('bedroom')) cat = 'Beds';
      else if (t.includes('sofa') || t.includes('couch') || t.includes('chair') || t.includes('seater')) cat = 'Seating';
      else if (t.includes('dining') || t.includes('table set')) cat = 'Dining';
      else if (t.includes('coffee') || t.includes('center') || t.includes('console')) cat = 'Tables';
      else if (t.includes('credenza') || t.includes('wardrobe') || t.includes('almirah') || t.includes('cabinet')) cat = 'Storage';
      else if (t.includes('desk') || t.includes('office')) cat = 'Office';

      const code = `IF-${Math.floor(1000 + Math.random() * 9000)}`;

      return {
        id: `pasted-${Date.now()}-${idx}`,
        name: title,
        category: cat,
        description: `Masterfully handcrafted ${title} made with seasoned solid timbers and durable protective hand-rubbed finish.`,
        images: [sampleImages[cat] || sampleImages.Seating],
        productCode: code,
      };
    });

    setDraftProducts((prev) => [...prev, ...newDrafts]);
    setPasteText('');
  };

  // Publish All Drafts to Live Catalog
  const handlePublishAll = async () => {
    if (draftProducts.length === 0) return;
    setIsSaving(true);
    try {
      const payload: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>[] = draftProducts.map((p) => {
        const slug = `${p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${p.productCode.toLowerCase()}`;
        return {
          name: p.name,
          slug,
          category: p.category,
          subCategory: 'Luxury Furniture',
          productCode: p.productCode,
          shortDescription: p.description,
          longDescription: p.description,
          material: 'Solid Seasoned Wood',
          finish: 'Natural Satin Lacquer',
          dimensions: '',
          leadTime: '3-4 weeks',
          madeIn: 'Lahore, Pakistan',
          spaces: ['Living Room'],
          images: p.images,
          isPublished: true,
          tags: ['Solid Wood', 'Handcrafted', p.category],
          options: [],
        };
      });

      const saved = await db.createProductsBulk(payload);
      setPublishedCount(saved.length);
      setDraftProducts([]);
    } catch (err) {
      console.error('Error saving bulk products:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateItem = (id: string, field: keyof DraftProduct, value: any) => {
    setDraftProducts((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const handleDeleteItem = (id: string) => {
    setDraftProducts((prev) => prev.filter((item) => item.id !== id));
  };

  const handleAddManualRow = () => {
    const code = `IF-${Math.floor(1000 + Math.random() * 9000)}`;
    setDraftProducts((prev) => [
      ...prev,
      {
        id: `manual-${Date.now()}`,
        name: 'New Handcrafted Luxury Piece',
        category: 'Beds',
        description: 'Solid seasoned timber luxury furniture handcrafted by master artisans in Lahore.',
        images: ['https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1000&q=85'],
        productCode: code,
      },
    ]);
  };

  return (
    <AdminLayout
      title="Daily Bulk Product Creator"
      subtitle="Generate and publish 10 to 15 authentic luxury furniture products daily with exact names, categories, and descriptions."
      action={
        draftProducts.length > 0 && (
          <button
            onClick={handlePublishAll}
            disabled={isSaving}
            className="btn-primary text-xs py-2.5 px-5 flex items-center gap-2 cursor-pointer shadow-md"
          >
            {isSaving ? (
              <span>Publishing to Catalog...</span>
            ) : (
              <>
                <CheckCircle2 size={16} />
                <span>Publish All ({draftProducts.length}) to Catalog</span>
              </>
            )}
          </button>
        )
      }
    >
      {/* Success Notification */}
      {publishedCount !== null && (
        <div className="p-5 mb-8 bg-emerald-50 border border-emerald-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 shrink-0">
              <CheckCircle2 size={24} />
            </div>
            <div>
              <h4 className="font-sans font-bold text-sm text-emerald-950">
                {publishedCount} Products Successfully Published Live!
              </h4>
              <p className="text-xs text-emerald-700 mt-0.5 font-sans">
                All furniture pieces are now live in your store catalog, ready for WhatsApp customer inquiries.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/collections/all"
              target="_blank"
              className="btn-secondary text-xs py-2 px-3 flex items-center gap-1.5"
            >
              <span>View on Website</span>
              <ExternalLink size={13} />
            </Link>
            <Link to="/admin/products" className="btn-primary text-xs py-2 px-3">
              <span>View Products Table</span>
            </Link>
          </div>
        </div>
      )}

      {/* Control Box: 2 Generation Modes */}
      <div className="bg-paper border border-line rounded-2xl p-6 mb-8 shadow-xs">
        <div className="flex items-center gap-3 pb-4 border-b border-line mb-6">
          <button
            onClick={() => setActiveTab('ai')}
            className={`text-xs font-sans font-bold uppercase tracking-wider py-2 px-4 rounded-lg flex items-center gap-2 cursor-pointer transition-colors ${
              activeTab === 'ai'
                ? 'bg-ink text-white'
                : 'bg-bone text-muted hover:text-ink'
            }`}
          >
            <Sparkles size={14} className={activeTab === 'ai' ? 'text-amber-400' : ''} />
            <span>1-Click AI Daily Batch (10–15 Products)</span>
          </button>
          <button
            onClick={() => setActiveTab('paste')}
            className={`text-xs font-sans font-bold uppercase tracking-wider py-2 px-4 rounded-lg flex items-center gap-2 cursor-pointer transition-colors ${
              activeTab === 'paste'
                ? 'bg-ink text-white'
                : 'bg-bone text-muted hover:text-ink'
            }`}
          >
            <ListPlus size={14} />
            <span>Quick Paste Titles (From Notes/WhatsApp)</span>
          </button>
        </div>

        {activeTab === 'ai' ? (
          <div className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Count selector */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-muted mb-1.5">
                  How Many Products to Generate?
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[5, 10, 15, 20].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setCount(num)}
                      className={`py-2 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                        count === num
                          ? 'border-ink bg-ink text-white shadow-xs'
                          : 'border-line bg-paper text-ink hover:border-ink/50'
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>

              {/* Category Filter */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-muted mb-1.5">
                  Category Mix
                </label>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-line bg-bone rounded-lg text-xs font-medium text-ink"
                >
                  {categories.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Theme/Style */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-muted mb-1.5">
                  Furniture Style / Wood Focus
                </label>
                <select
                  value={theme}
                  onChange={(e) => setTheme(e.target.value)}
                  className="w-full px-3 py-2 border border-line bg-bone rounded-lg text-xs font-medium text-ink"
                >
                  <option value="Pakistani Handcrafted & Modern Luxury Mix">
                    All-Round Mix (Chinioti, Rosewood & Modern)
                  </option>
                  <option value="Chinioti Handcrafted Solid Sheesham Heritage">
                    Chinioti Traditional Sheesham (چنیوٹی شیشم)
                  </option>
                  <option value="Modern Italian & Scandinavian Velvet">
                    Modern Minimalist & Velvet (ماڈرن مخمل فرنیچر)
                  </option>
                  <option value="Solid Himalayan Swat Walnut Heirloom">
                    Swat Walnut Wood (سواتی اخروٹ کی لکڑی)
                  </option>
                  <option value="Executive Office & Presidential Timbers">
                    Executive Office & Desks (صدارتی آفس ڈیسک)
                  </option>
                </select>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between">
              <p className="text-xs text-muted font-sans">
                Generates complete products with exact names, authentic descriptions, and matching high-definition photography.
              </p>
              <button
                type="button"
                onClick={handleGenerateBatch}
                disabled={isGenerating}
                className="btn-primary flex items-center gap-2 text-xs py-2.5 px-6 cursor-pointer shadow-sm"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw size={14} className="animate-spin" />
                    <span>Generating {count} Products...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={14} className="text-amber-400" />
                    <span>Generate {count} Fresh Products Now</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-muted mb-1.5">
                Paste 10 to 15 Product Names (One per line)
              </label>
              <textarea
                rows={5}
                value={pasteText}
                onChange={(e) => setPasteText(e.target.value)}
                placeholder={`Mughal Carved Chinioti Sheesham King Bed\nChesterfield 7-Seater Tufted Velvet Sofa\nKashmir Walnut 8-Seater Fluted Dining Table\nItalian Calacatta Marble Center Table Set\nHeritage Fluted Teak 4-Door Sideboard Credenza\nPresidential Solid Rosewood Executive Desk`}
                className="w-full p-3.5 border border-line bg-paper text-xs font-mono text-ink rounded-lg focus:outline-none focus:border-ink leading-relaxed"
              />
            </div>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleConvertPasted}
                disabled={!pasteText.trim()}
                className="btn-primary text-xs py-2 px-5 flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Layers size={14} />
                <span>Convert to Products ({pasteText.split('\n').filter((l) => l.trim()).length} Items)</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Draft Products Review Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-line">
          <div>
            <h3 className="font-serif text-lg font-bold text-ink">
              Ready to Publish ({draftProducts.length} Items)
            </h3>
            <p className="text-xs text-muted font-sans">
              Review titles, categories, and descriptions below. You can tweak any text before publishing.
            </p>
          </div>
          <div className="flex items-center gap-3">
            {draftProducts.length > 0 && (
              <>
                <button
                  onClick={handleAddManualRow}
                  className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus size={13} />
                  <span>Add Another Item</span>
                </button>
                <button
                  onClick={() => setDraftProducts([])}
                  className="text-xs text-muted hover:text-red-700 px-3 py-1.5 cursor-pointer"
                >
                  Clear All
                </button>
              </>
            )}
          </div>
        </div>

        {draftProducts.length === 0 ? (
          <div className="p-16 text-center border-2 border-dashed border-line rounded-2xl bg-paper/40">
            <SlidersHorizontal size={32} className="mx-auto text-muted/50 mb-3" />
            <h4 className="font-sans font-bold text-sm text-ink">No items in the generation queue</h4>
            <p className="text-xs text-muted mt-1 max-w-md mx-auto">
              Click &quot;Generate 15 Fresh Products Now&quot; above or paste product titles to populate your daily batch.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {draftProducts.map((item, index) => (
              <div
                key={item.id}
                className="bg-paper border border-line rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center gap-4 hover:border-ink/50 transition-colors shadow-xs"
              >
                {/* Number & Thumbnail */}
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-xs font-mono font-bold text-muted w-6 text-center">
                    #{index + 1}
                  </span>
                  <div className="w-16 h-16 rounded-lg overflow-hidden bg-bone border border-line shrink-0">
                    <img
                      src={item.images[0]}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                {/* Editable Title, Category, Code */}
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-12 gap-3 w-full">
                  <div className="sm:col-span-6">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-muted mb-1">
                      Product Name
                    </label>
                    <input
                      type="text"
                      value={item.name}
                      onChange={(e) => handleUpdateItem(item.id, 'name', e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs font-bold font-sans text-ink bg-paper border border-line rounded-md focus:border-ink"
                    />
                  </div>
                  <div className="sm:col-span-3">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-muted mb-1">
                      Category
                    </label>
                    <select
                      value={item.category}
                      onChange={(e) => handleUpdateItem(item.id, 'category', e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs font-sans text-ink bg-bone border border-line rounded-md"
                    >
                      <option value="Beds">Beds & Suites</option>
                      <option value="Seating">Living & Haute Seating</option>
                      <option value="Dining">Dining Suites</option>
                      <option value="Tables">Center & Accent Tables</option>
                      <option value="Storage">Storage & Credenzas</option>
                      <option value="Office">Executive Desks & Office</option>
                    </select>
                  </div>
                  <div className="sm:col-span-3">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-muted mb-1">
                      Code (SKU)
                    </label>
                    <input
                      type="text"
                      value={item.productCode}
                      onChange={(e) => handleUpdateItem(item.id, 'productCode', e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs font-mono text-muted bg-bone border border-line rounded-md"
                    />
                  </div>
                  <div className="sm:col-span-12">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-muted mb-1">
                      Description
                    </label>
                    <input
                      type="text"
                      value={item.description}
                      onChange={(e) => handleUpdateItem(item.id, 'description', e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs font-sans text-ink bg-paper border border-line rounded-md focus:border-ink"
                    />
                  </div>
                </div>

                {/* Remove button */}
                <button
                  type="button"
                  onClick={() => handleDeleteItem(item.id)}
                  className="p-2 text-muted hover:text-red-700 rounded-lg hover:bg-bone cursor-pointer shrink-0 self-center"
                  title="Remove from batch"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}

            {/* Bottom Big Publish Bar */}
            <div className="p-6 bg-paper border border-line rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
              <div>
                <p className="font-sans font-bold text-sm text-ink">
                  Total {draftProducts.length} Products Configured
                </p>
                <p className="text-xs text-muted">
                  Clicking publish will save all items directly to your permanent server database.
                </p>
              </div>
              <button
                onClick={handlePublishAll}
                disabled={isSaving}
                className="btn-primary text-xs py-3 px-8 flex items-center gap-2 cursor-pointer shadow-lg w-full sm:w-auto justify-center"
              >
                {isSaving ? (
                  <span>Publishing {draftProducts.length} Items...</span>
                ) : (
                  <>
                    <CheckCircle2 size={16} />
                    <span>Publish All ({draftProducts.length}) to Website</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};
