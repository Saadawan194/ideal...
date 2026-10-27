import React, { useEffect, useMemo, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { AdminLayout } from './AdminLayout';
import { db } from '../../lib/db';
import { Category, Product, Space, MediaItem } from '../../types';
import { CloseIcon } from '../../components/ui/Icons';
import { convertImageToWebP, formatBytes } from '../../lib/imageOptimization';
import { analyzeFurnitureImage } from '../../lib/furnitureAnalysis';
import { isCategoryMatch, normalizeCategory, CANONICAL_CATEGORIES } from '../../config/categories';
import { UploadCloud, Image as ImageIcon, Plus, Trash2, X, Check, Wand2 } from 'lucide-react';

export const AdminProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'drafts'>('all');
  const [selectedProductIds, setSelectedProductIds] = useState<Set<string>>(new Set());

  // Form Modal State
  const [isEditing, setIsEditing] = useState(false);
  const [activeProduct, setActiveProduct] = useState<Partial<Product> | null>(null);

  // WordPress Media Library Modal & Upload State
  const [mediaLibrary, setMediaLibrary] = useState<MediaItem[]>([]);
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [analyzingStatus, setAnalyzingStatus] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadData = () => {
    Promise.all([db.getProducts(), db.getCategories(), db.getSpaces()]).then(
      ([prods, cats, sps]) => {
        setProducts(prods);
        setCategories(cats);
        setSpaces(sps);
      }
    );
  };

  useEffect(() => {
    loadData();
    const onRealtimeUpdate = () => {
      loadData();
    };
    window.addEventListener('ideal_products_updated', onRealtimeUpdate);
    return () => {
      window.removeEventListener('ideal_products_updated', onRealtimeUpdate);
    };
  }, []);

  const draftCount = useMemo(() => products.filter((p) => !p.isPublished).length, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchSearch =
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.productCode.toLowerCase().includes(search.toLowerCase()) ||
        p.category.toLowerCase().includes(search.toLowerCase());
      const matchCategory = selectedCategory === 'all' || isCategoryMatch(p.category, selectedCategory);
      const matchStatus =
        statusFilter === 'all' ||
        (statusFilter === 'published' && p.isPublished) ||
        (statusFilter === 'drafts' && !p.isPublished);
      return matchSearch && matchCategory && matchStatus;
    });
  }, [products, search, selectedCategory, statusFilter]);

  const handleTogglePublish = async (prod: Product) => {
    await db.updateProduct(prod.id, { isPublished: !prod.isPublished });
    loadData();
  };

  const handlePublishAllDrafts = async () => {
    const draftIds = products.filter((p) => !p.isPublished).map((p) => p.id);
    if (draftIds.length === 0) return;
    for (const id of draftIds) {
      await db.updateProduct(id, { isPublished: true });
    }
    loadData();
  };

  const handlePublishSelected = async () => {
    if (selectedProductIds.size === 0) return;
    for (const id of selectedProductIds) {
      await db.updateProduct(id, { isPublished: true });
    }
    setSelectedProductIds(new Set());
    loadData();
  };

  const handleOpenAdd = () => {
    db.getMediaItems().then(setMediaLibrary);
    setActiveProduct({
      name: '',
      slug: '',
      category: categories[0]?.name || 'Beds',
      subCategory: 'Furniture',
      productCode: `IF-${Math.floor(1000 + Math.random() * 9000)}`,
      shortDescription: '',
      longDescription: '',
      images: [],
      isPublished: true,
      options: [],
    });
    setIsEditing(true);
  };

  const handleOpenEdit = (prod: Product) => {
    db.getMediaItems().then(setMediaLibrary);
    setActiveProduct({ ...prod });
    setIsEditing(true);
  };

  const handleUploadProductImage = async (files: FileList | null) => {
    if (!files || files.length === 0 || !activeProduct) return;
    setIsUploadingPhoto(true);
    setAnalyzingStatus('Saving & analyzing photo with AI...');
    try {
      const file = files[0];
      const webp = await convertImageToWebP(file, 1920, 0.88);
      const media = await db.uploadMedia(
        file.name.replace(/\.[^/.]+$/, '') + '.webp',
        webp.dataUrl,
        formatBytes(webp.optimizedSize)
      );

      // Auto-detect title, category, description, wood, upholstery
      let analyzedData: any = null;
      try {
        analyzedData = await analyzeFurnitureImage(webp.dataUrl, file.name);
      } catch (analysisErr) {
        console.warn('AI analysis skipped/failed:', analysisErr);
      }

      setActiveProduct((prev) => {
        if (!prev) return prev;
        const shouldAutoFill = !prev.name || prev.name.trim() === '';
        const desc = analyzedData?.description || '';
        return {
          ...prev,
          images: media?.url ? [...(prev.images || []), media.url] : prev.images,
          featuredImage: prev.featuredImage || media?.url || (prev.images && prev.images[0]) || "",
          name: shouldAutoFill && analyzedData?.title ? analyzedData.title : prev.name,
          category: shouldAutoFill && analyzedData?.category ? analyzedData.category : prev.category,
          shortDescription: shouldAutoFill && desc ? desc : prev.shortDescription,
          longDescription: shouldAutoFill && desc ? desc : prev.longDescription,
        };
      });
      const updatedMedia = await db.getMediaItems();
      setMediaLibrary(updatedMedia);
    } catch (err) {
      console.error('Photo upload failed:', err);
    } finally {
      setIsUploadingPhoto(false);
      setAnalyzingStatus(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSelectFromMedia = (url: string) => {
    if (!activeProduct) return;
    setActiveProduct({
      ...activeProduct,
      images: [...(activeProduct.images || []), url],
    });
    setIsMediaModalOpen(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you certain you wish to archive this product?')) {
      await db.deleteProduct(id);
      loadData();
    }
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeProduct || !activeProduct.name || !activeProduct.category) return;

    const slug =
      activeProduct.slug ||
      activeProduct.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

    const desc = activeProduct.shortDescription || activeProduct.longDescription || '';
    const payload = {
      ...activeProduct,
      slug,
      shortDescription: desc,
      longDescription: desc,
      material: activeProduct.material || 'Solid Wood',
      finish: activeProduct.finish || 'Natural Finish',
      dimensions: activeProduct.dimensions || '',
      images: activeProduct.images || [],
      spaces: activeProduct.spaces || ['Living Room'],
      options: activeProduct.options || [],
    } as Omit<Product, 'id' | 'createdAt' | 'updatedAt'>;

    if (activeProduct.id) {
      await db.updateProduct(activeProduct.id, payload);
    } else {
      await db.createProduct(payload);
    }
    setIsEditing(false);
    setActiveProduct(null);
    loadData();
  };

  return (
    <AdminLayout
      title="Product Catalogue"
      subtitle="Manage product details, photos, dimensions, and categories."
      action={
        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            to="/admin/bulk-upload"
            className="px-4 py-2 bg-[#1B3629] hover:bg-[#152B21] text-white rounded-lg text-xs font-sans font-bold flex items-center gap-2 transition-colors shadow-xs"
          >
            <UploadCloud size={15} className="text-[#C4A962]" />
            <span>+ Add Products (Auto-Upload / Folder / Google Drive)</span>
          </Link>
          <button
            onClick={handleOpenAdd}
            className="px-3.5 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-lg text-xs font-sans font-semibold cursor-pointer flex items-center gap-1.5 transition-colors"
          >
            <Plus size={14} />
            <span>Manual Entry</span>
          </button>
        </div>
      }
    >
      {/* Status Tabs & Search & Filter */}
      <div className="bg-paper border border-line p-4 sm:p-5 mb-6 text-xs font-sans space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-3">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded text-xs font-medium cursor-pointer transition-colors ${
                statusFilter === 'all' ? 'bg-ink text-paper' : 'bg-bone text-muted hover:text-ink'
              }`}
            >
              All ({products.length})
            </button>
            <button
              onClick={() => setStatusFilter('published')}
              className={`px-3 py-1.5 rounded text-xs font-medium cursor-pointer transition-colors ${
                statusFilter === 'published' ? 'bg-emerald-800 text-white' : 'bg-bone text-muted hover:text-ink'
              }`}
            >
              Live on Site ({products.length - draftCount})
            </button>
            <button
              onClick={() => setStatusFilter('drafts')}
              className={`px-3 py-1.5 rounded text-xs font-medium cursor-pointer transition-colors flex items-center gap-1.5 ${
                statusFilter === 'drafts' ? 'bg-amber-700 text-white' : 'bg-amber-50 text-amber-800 border border-amber-200'
              }`}
            >
              <span>Auto-Saved Drafts ({draftCount})</span>
            </button>
          </div>

          {draftCount > 0 && (
            <button
              onClick={handlePublishAllDrafts}
              className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
            >
              <Check size={14} />
              <span>Publish All Drafts ({draftCount})</span>
            </button>
          )}
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search product by title, product code, or wood type..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-3.5 py-2 border border-line bg-paper text-ink focus:outline-hidden focus:border-accent text-xs"
            />
          </div>
          <div className="flex items-center space-x-3">
            <span className="text-muted uppercase tracking-wider">Category:</span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="border border-line bg-paper px-3 py-2 uppercase tracking-wider text-xs"
            >
              <option value="all">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Product Table */}
      <div className="bg-paper border border-line overflow-x-auto">
        <table className="w-full text-left text-xs font-sans divide-y divide-line">
          <thead className="bg-bone/70 uppercase tracking-wider text-[11px] text-muted">
            <tr>
              <th className="py-3 px-4">Image</th>
              <th className="py-3 px-4">Product / Title</th>
              <th className="py-3 px-4">Code</th>
              <th className="py-3 px-4">Category</th>
              <th className="py-3 px-4">Spaces</th>
              <th className="py-3 px-4">Published</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {filteredProducts.map((p) => (
              <tr key={p.id} className="hover:bg-bone/30 transition-colors">
                <td className="py-3 px-4 w-16">
                  <div className="w-12 h-14 bg-bone overflow-hidden border border-line">
                    <img
                      src={p.images[0]}
                      alt={p.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </td>
                <td className="py-3 px-4">
                  <div className="font-serif text-sm text-ink">{p.name}</div>
                  <div className="text-[11px] text-muted line-clamp-1">{p.material}</div>
                </td>
                <td className="py-3 px-4 font-mono text-[11px] text-muted">
                  {p.productCode}
                </td>
                <td className="py-3 px-4 text-[11px]">
                  <div>{p.category}</div>
                  {p.subCategory && (
                    <div className="text-muted text-[10px]">{p.subCategory}</div>
                  )}
                </td>
                <td className="py-3 px-4">
                  <div className="flex flex-wrap gap-1">
                    {p.spaces.map((sp) => (
                      <span
                        key={sp}
                        className="px-1.5 py-0.5 border border-line bg-bone text-[9px] uppercase tracking-wider text-muted"
                      >
                        {sp}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="py-3 px-4">
                  <button
                    onClick={() => handleTogglePublish(p)}
                    className={`px-2.5 py-1 text-[10px] uppercase tracking-wider border font-medium ${
                      p.isPublished
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                        : 'bg-bone border-line text-muted'
                    }`}
                  >
                    {p.isPublished ? 'Live' : 'Hidden'}
                  </button>
                </td>
                <td className="py-3 px-4 text-right space-x-3">
                  <button
                    onClick={() => handleOpenEdit(p)}
                    className="text-ink hover:text-accent underline decoration-line"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(p.id)}
                    className="text-red-700 hover:text-red-900 underline decoration-red-200"
                  >
                    Archive
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit / Add Modal (CRITICAL: ABSOLUTELY NO PRICE FIELD) */}
      {isEditing && activeProduct && (
        <div
          className="fixed inset-0 z-50 bg-ink/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-paper border border-line w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6 sm:p-10 text-xs font-sans">
            <div className="flex items-center justify-between pb-4 border-b border-line mb-6">
              <div>
                <span className="eyebrow block">Catalogue Master</span>
                <h2 className="font-serif text-2xl text-ink">
                  {activeProduct.id ? 'Edit Product' : 'Add New Product'}
                </h2>
              </div>
              <button
                onClick={() => setIsEditing(false)}
                className="text-muted hover:text-ink text-sm p-1 rounded hover:bg-neutral-100"
                aria-label="Close"
              >
                <CloseIcon size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block uppercase tracking-wider text-muted mb-1">
                    Product Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Royal Sheesham Crown Bed"
                    value={activeProduct.name || ''}
                    onChange={(e) =>
                      setActiveProduct({ ...activeProduct, name: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-line bg-paper text-sm text-ink rounded-md"
                  />
                </div>
                <div>
                  <label className="block uppercase tracking-wider text-muted mb-1">
                    Category *
                  </label>
                  <select
                    value={activeProduct.category || ''}
                    onChange={(e) => {
                      const catName = e.target.value;
                      const matchedCat = categories.find((c) => c.name === catName);
                      setActiveProduct({
                        ...activeProduct,
                        category: catName,
                        subCategory: matchedCat?.subCategories?.[0] || 'General',
                      });
                    }}
                    className="w-full px-3 py-2 border border-line bg-paper text-xs uppercase tracking-wider rounded-md"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Sub-Category selector derived from active category */}
              <div>
                <label className="block uppercase tracking-wider text-muted mb-1">
                  Sub-Category
                </label>
                {(() => {
                  const currentCat = categories.find((c) => c.name === activeProduct.category);
                  const subList = currentCat?.subCategories || [];
                  return subList.length > 0 ? (
                    <select
                      value={activeProduct.subCategory || ''}
                      onChange={(e) =>
                        setActiveProduct({ ...activeProduct, subCategory: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-line bg-paper text-xs uppercase tracking-wider rounded-md"
                    >
                      {subList.map((sub) => (
                        <option key={sub} value={sub}>
                          {sub}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      placeholder="e.g. King Size Beds, Chesterfield Sofa..."
                      value={activeProduct.subCategory || ''}
                      onChange={(e) =>
                        setActiveProduct({ ...activeProduct, subCategory: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-line bg-paper text-xs rounded-md"
                    />
                  );
                })()}
              </div>

              <div>
                <label className="block uppercase tracking-wider text-muted mb-1">
                  Product Description *
                </label>
                <textarea
                  rows={4}
                  required
                  value={activeProduct.shortDescription || activeProduct.longDescription || ''}
                  onChange={(e) => {
                    const val = e.target.value;
                    setActiveProduct({
                      ...activeProduct,
                      shortDescription: val,
                      longDescription: val,
                    });
                  }}
                  placeholder="Enter product details, description, finish, or story..."
                  className="w-full px-3 py-2 border border-line bg-paper text-sm text-ink font-light rounded-md leading-relaxed"
                />
              </div>

              <div className="max-w-xs">
                <label className="block uppercase tracking-wider text-muted mb-1">
                  Product Code (SKU)
                </label>
                <input
                  type="text"
                  value={activeProduct.productCode || ''}
                  onChange={(e) =>
                    setActiveProduct({ ...activeProduct, productCode: e.target.value })
                  }
                  placeholder="e.g. IF-4021"
                  className="w-full px-3 py-2 border border-line bg-paper text-xs font-mono text-ink rounded-md"
                />
              </div>

              {/* Product Photos with Direct Upload & Media Library */}
              <div className="border-t border-line pt-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="eyebrow text-accent block">Product Photography</span>
                    <p className="text-[11px] text-muted font-sans">
                      Upload from your device or select from your saved Media Library.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {analyzingStatus && (
                      <span className="text-[11px] text-[#8C5921] font-medium animate-pulse hidden sm:inline">
                        {analyzingStatus}
                      </span>
                    )}
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={(e) => handleUploadProductImage(e.target.files)}
                      accept="image/*"
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploadingPhoto}
                      className="btn-primary text-[11px] py-1.5 px-3 flex items-center gap-1.5 cursor-pointer"
                    >
                      <UploadCloud size={13} />
                      <span>{isUploadingPhoto ? 'Uploading & Analyzing...' : 'Upload Photo'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsMediaModalOpen(true)}
                      className="btn-secondary text-[11px] py-1.5 px-3 flex items-center gap-1.5 cursor-pointer"
                    >
                      <ImageIcon size={13} />
                      <span>Media Library</span>
                    </button>
                  </div>
                </div>

                {/* Thumbnails grid */}
                {(activeProduct.images || []).length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                    {(activeProduct.images || []).map((imgUrl, i) => {
                      const isFeatured = (activeProduct.featuredImage === imgUrl) || (!activeProduct.featuredImage && i === 0);
                      return (
                        <div
                          key={i}
                          className={`group relative aspect-4/3 rounded-lg overflow-hidden border bg-bone ${isFeatured ? "border-[#8C5921] ring-2 ring-[#8C5921]/30" : "border-line"}`}
                        >
                          <img
                            src={imgUrl}
                            alt={`Product preview ${i + 1}`}
                            className="w-full h-full object-contain p-1"
                          />
                          <div className="absolute top-1.5 right-1.5 flex items-center gap-1 opacity-90 hover:opacity-100">
                            <button
                              type="button"
                              onClick={() => {
                                const current = [...(activeProduct.images || [])];
                                const selected = current.splice(i, 1)[0];
                                current.unshift(selected);
                                setActiveProduct({ ...activeProduct, images: current, featuredImage: selected });
                              }}
                              className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] shadow-md cursor-pointer ${isFeatured ? "bg-[#8C5921] text-white" : "bg-white/90 text-neutral-700 hover:bg-[#8C5921] hover:text-white"}`}
                              title={isFeatured ? "Current Featured Image" : "Make Featured (Set as Primary Photo)"}
                            >
                              ★
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                const next = (activeProduct.images || []).filter((_, idx) => idx !== i);
                                const newFeatured = activeProduct.featuredImage === imgUrl ? (next[0] || "") : activeProduct.featuredImage;
                                setActiveProduct({ ...activeProduct, images: next, featuredImage: newFeatured });
                              }}
                              className="w-6 h-6 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center cursor-pointer shadow-md"
                              title="Remove image"
                            >
                              <X size={13} />
                            </button>
                          </div>
                          <span className={`absolute bottom-1 left-1.5 text-[9px] px-1.5 py-0.5 rounded font-mono ${isFeatured ? "bg-[#8C5921] text-white font-bold" : "bg-black/70 text-white"}`}>
                            {isFeatured ? "Featured ★" : `Angle #${i + 1}`}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-6 text-center border border-dashed border-line rounded-lg text-xs text-muted">
                    No photos added yet. Click &quot;Upload Photo&quot; or choose from &quot;Media Library&quot;.
                  </div>
                )}

                {/* Optional manual URL input */}
                <div className="pt-2">
                  <details className="text-xs text-muted cursor-pointer">
                    <summary className="hover:text-ink">Or add raw external URL manually</summary>
                    <div className="mt-2 flex items-center gap-2">
                      <input
                        type="url"
                        placeholder="https://example.com/photo.jpg"
                        id="manual-url-input"
                        className="flex-1 px-3 py-1.5 border border-line bg-paper text-xs text-ink"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const input = document.getElementById('manual-url-input') as HTMLInputElement;
                          if (input && input.value) {
                            setActiveProduct({
                              ...activeProduct,
                              images: [...(activeProduct.images || []), input.value],
                            });
                            input.value = '';
                          }
                        }}
                        className="btn-secondary text-[11px] py-1.5 px-3"
                      >
                        Add URL
                      </button>
                    </div>
                  </details>
                </div>
              </div>

              {/* Published Toggle */}
              <div className="border-t border-line pt-5 flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="prod-pub"
                  checked={activeProduct.isPublished ?? true}
                  onChange={(e) =>
                    setActiveProduct({ ...activeProduct, isPublished: e.target.checked })
                  }
                  className="w-4 h-4 accent-ink"
                />
                <label htmlFor="prod-pub" className="uppercase tracking-wider text-ink font-medium cursor-pointer">
                  Published & Visible in Public Catalogue
                </label>
              </div>

              {/* Modal Actions */}
              <div className="border-t border-line pt-6 flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="btn-secondary text-xs"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary text-xs">
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* WordPress-Style Media Library Picker Modal */}
      {isMediaModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6"
          onClick={() => setIsMediaModalOpen(false)}
        >
          <div
            className="bg-paper border border-line rounded-2xl max-w-3xl w-full max-h-[85vh] overflow-hidden flex flex-col shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 sm:p-5 border-b border-line flex items-center justify-between">
              <div>
                <h3 className="font-sans font-bold text-sm text-ink">
                  Select Image from Media Library
                </h3>
                <p className="text-xs text-muted">
                  Click any previously uploaded photo to attach it to this product.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsMediaModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-bone text-muted hover:text-ink cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-4 sm:p-6 overflow-y-auto max-h-[60vh]">
              {mediaLibrary.length === 0 ? (
                <div className="p-12 text-center text-xs text-muted">
                  No images in media library yet. Upload photos from your device above.
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3">
                  {mediaLibrary.map((item) => {
                    const isAlreadyAdded = (activeProduct?.images || []).includes(item.url);
                    return (
                      <div
                        key={item.id}
                        onClick={() => handleSelectFromMedia(item.url)}
                        className={`group relative aspect-square rounded-lg overflow-hidden border cursor-pointer transition-all ${
                          isAlreadyAdded
                            ? 'border-green-600 ring-2 ring-green-600/50'
                            : 'border-line hover:border-ink hover:scale-102'
                        }`}
                      >
                        <img
                          src={item.url}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                        {isAlreadyAdded && (
                          <div className="absolute top-1.5 right-1.5 bg-green-600 text-white rounded-full p-0.5 shadow-sm">
                            <Check size={12} />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-2 text-center">
                          <span className="text-[11px] text-white font-medium">
                            {isAlreadyAdded ? 'Already Added' : 'Click to Select'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="p-4 border-t border-line flex justify-end">
              <button
                type="button"
                onClick={() => setIsMediaModalOpen(false)}
                className="btn-secondary text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};
