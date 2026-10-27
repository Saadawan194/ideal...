import React, { useEffect, useState, useRef } from 'react';
import { AdminLayout } from './AdminLayout';
import { db } from '../../lib/db';
import { Category, MediaItem } from '../../types';
import { SEED_CATEGORIES } from '../../data/seedData';
import { convertImageToWebP, formatBytes } from '../../lib/imageOptimization';
import { UploadCloud, Image as ImageIcon, Trash2, X, Check } from 'lucide-react';
import { CloseIcon } from '../../components/ui/Icons';

export const AdminCategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [activeCat, setActiveCat] = useState<Partial<Category> | null>(null);
  const [subCategoriesText, setSubCategoriesText] = useState('');
  const [isResetting, setIsResetting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Image Upload & Media Library states
  const [mediaLibrary, setMediaLibrary] = useState<MediaItem[]>([]);
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadCategories = () => {
    db.getCategories().then((data) => {
      setCategories([...data].sort((a, b) => a.order - b.order));
    });
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleOpenAdd = () => {
    db.getMediaItems().then(setMediaLibrary);
    setActiveCat({
      name: '',
      slug: '',
      image: '',
      description: '',
      subCategories: [],
      order: categories.length + 1,
    });
    setSubCategoriesText('');
    setIsEditing(true);
  };

  const handleOpenEdit = (cat: Category) => {
    db.getMediaItems().then(setMediaLibrary);
    setActiveCat({ ...cat });
    setSubCategoriesText(cat.subCategories.join(', '));
    setIsEditing(true);
  };

  const handleUploadImage = async (files: FileList | null) => {
    if (!files || files.length === 0 || !activeCat) return;
    setIsUploadingPhoto(true);
    try {
      const file = files[0];
      const webp = await convertImageToWebP(file, 1400, 0.88);
      const media = await db.uploadMedia(
        `cat-${Date.now()}-${file.name.replace(/\.[^/.]+$/, '')}.webp`,
        webp.dataUrl,
        formatBytes(webp.optimizedSize)
      );
      setActiveCat((prev) => ({
        ...prev,
        image: media.url,
      }));
    } catch (err) {
      console.error('Category photo upload failed:', err);
      setStatusMessage({ type: 'error', text: 'Photo upload failed. Please try again.' });
      setTimeout(() => setStatusMessage(null), 4000);
    } finally {
      setIsUploadingPhoto(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleResetTo10Departments = async () => {
    if (
      !confirm(
        'Reset to standard 5 Essential Categories (Bedroom, Living Room, Dining Room, Office, Custom) with curated showcase images?'
      )
    ) {
      return;
    }
    setIsResetting(true);
    try {
      await fetch('/api/db/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ categories: SEED_CATEGORIES }),
      });
      localStorage.setItem('ideal_furniture_categories_v3', JSON.stringify(SEED_CATEGORIES));
      loadCategories();
    } catch (err) {
      console.error(err);
    } finally {
      setIsResetting(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCat || !activeCat.name) return;

    const slug =
      activeCat.slug ||
      activeCat.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

    const subs = subCategoriesText
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const payload: Omit<Category, 'id'> = {
      name: activeCat.name,
      slug,
      image: activeCat.image || '',
      description: activeCat.description || '',
      subCategories: subs,
      order: activeCat.order ?? categories.length + 1,
    };

    if (activeCat.id) {
      await db.updateCategory(activeCat.id, payload);
    } else {
      await db.createCategory(payload);
    }
    setIsEditing(false);
    setActiveCat(null);
    loadCategories();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this category?')) {
      await db.deleteCategory(id);
      loadCategories();
    }
  };

  return (
    <AdminLayout
      title="Category Architecture & Visual Imagery"
      subtitle="Manage taxonomy, upload category banner photos, and organize sub-categories across the catalog."
      action={
        <div className="flex items-center gap-3">
          <button
            onClick={handleResetTo10Departments}
            disabled={isResetting}
            className="btn-secondary text-xs py-2 px-3.5"
            title="Restore standard 5 essential categories with imagery"
          >
            {isResetting ? 'Syncing...' : 'Sync Standard 5 Categories'}
          </button>
          <button onClick={handleOpenAdd} className="btn-primary text-xs py-2.5 px-5 cursor-pointer">
            + Add Category
          </button>
        </div>
      }
    >
      {statusMessage && (
        <div
          className={`mb-6 p-3 text-xs font-sans border ${
            statusMessage.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}
        >
          {statusMessage.text}
        </div>
      )}

      <div className="bg-paper border border-line overflow-hidden">
        <table className="w-full text-left text-xs font-sans divide-y divide-line">
          <thead className="bg-bone/70 uppercase tracking-wider text-[11px] text-muted">
            <tr>
              <th className="py-3 px-4 w-12 text-center">Order</th>
              <th className="py-3 px-4 w-24">Image</th>
              <th className="py-3 px-4">Category Name</th>
              <th className="py-3 px-4">Slug</th>
              <th className="py-3 px-4">Sub-Categories</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {categories.map((cat) => (
              <tr key={cat.id} className="hover:bg-bone/30 transition-colors">
                <td className="py-3 px-4 font-mono text-muted text-center font-bold">{cat.order}</td>
                <td className="py-3 px-4">
                  <div className="w-16 h-12 rounded-md overflow-hidden bg-neutral-100 border border-line shrink-0 relative group">
                    {cat.image ? (
                      <img
                        src={cat.image}
                        alt={cat.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted">
                        <ImageIcon size={16} />
                      </div>
                    )}
                  </div>
                </td>
                <td className="py-3 px-4">
                  <span className="font-serif text-sm text-ink font-semibold block">{cat.name}</span>
                  {cat.description && (
                    <span className="text-[11px] text-muted font-sans line-clamp-1 mt-0.5">
                      {cat.description}
                    </span>
                  )}
                </td>
                <td className="py-3 px-4 font-mono text-muted">{cat.slug}</td>
                <td className="py-3 px-4">
                  <div className="flex flex-wrap gap-1 max-w-md">
                    {cat.subCategories.slice(0, 6).map((sub) => (
                      <span
                        key={sub}
                        className="px-2 py-0.5 border border-line bg-bone text-[10px] rounded"
                      >
                        {sub}
                      </span>
                    ))}
                    {cat.subCategories.length > 6 && (
                      <span className="px-1.5 py-0.5 text-muted text-[10px] font-mono">
                        +{cat.subCategories.length - 6} more
                      </span>
                    )}
                  </div>
                </td>
                <td className="py-3 px-4 text-right space-x-3 shrink-0">
                  <button
                    onClick={() => handleOpenEdit(cat)}
                    className="text-ink hover:text-accent font-semibold underline cursor-pointer"
                  >
                    Edit & Change Photo
                  </button>
                  <button
                    onClick={() => handleDelete(cat.id)}
                    className="text-red-700 hover:text-red-900 underline cursor-pointer"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit / Add Modal */}
      {isEditing && activeCat && (
        <div className="fixed inset-0 z-50 bg-ink/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-paper border border-line p-6 sm:p-8 max-w-lg w-full space-y-4 shadow-2xl rounded-xl max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-line">
              <h3 className="font-serif text-2xl text-ink">
                {activeCat.id ? 'Edit Category' : 'Create Category'}
              </h3>
              <button
                onClick={() => setIsEditing(false)}
                className="text-muted hover:text-ink p-1 rounded hover:bg-neutral-100 cursor-pointer"
              >
                <CloseIcon size={16} />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs font-sans">
              {/* Category Image Upload Box */}
              <div>
                <label className="block uppercase tracking-wider text-muted mb-1.5 font-semibold">
                  Category Photo / Banner *
                </label>
                
                {activeCat.image ? (
                  <div className="relative rounded-lg overflow-hidden border border-line aspect-16/9 bg-bone group mb-2">
                    <img
                      src={activeCat.image}
                      alt={activeCat.name || 'Category'}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-3 py-1.5 bg-white text-ink text-xs font-bold rounded shadow-md hover:bg-neutral-100 cursor-pointer flex items-center gap-1.5"
                      >
                        <UploadCloud size={14} />
                        Replace Photo
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveCat({ ...activeCat, image: '' })}
                        className="p-1.5 bg-red-600 text-white rounded shadow-md hover:bg-red-700 cursor-pointer"
                        title="Remove photo"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-line rounded-lg p-6 text-center space-y-2 bg-bone/30 mb-2">
                    <div className="w-10 h-10 mx-auto rounded-full bg-paper border border-line flex items-center justify-center text-muted">
                      <UploadCloud size={20} />
                    </div>
                    <div className="text-ink font-semibold">Upload Category Photo</div>
                    <p className="text-[11px] text-muted">
                      Directly upload high-res image (automatically converted to WebP) or choose from library.
                    </p>
                    <div className="flex items-center justify-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploadingPhoto}
                        className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1.5 cursor-pointer"
                      >
                        <UploadCloud size={13} />
                        <span>{isUploadingPhoto ? 'Uploading...' : 'Upload Image'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          db.getMediaItems().then(setMediaLibrary);
                          setIsMediaModalOpen(true);
                        }}
                        className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1.5 cursor-pointer"
                      >
                        <ImageIcon size={13} />
                        <span>Media Library</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Hidden File Input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleUploadImage(e.target.files)}
                  className="hidden"
                />
                {/* Manual URL field */}
                <input
                  type="url"
                  placeholder="Or paste external image URL: https://..."
                  value={activeCat.image || ''}
                  onChange={(e) => setActiveCat({ ...activeCat, image: e.target.value })}
                  className="w-full px-3 py-1.5 border border-line rounded text-[11px] font-mono"
                />
              </div>

              <div>
                <label className="block text-muted mb-1 font-semibold">Category Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Bedroom Furniture"
                  value={activeCat.name || ''}
                  onChange={(e) => setActiveCat({ ...activeCat, name: e.target.value })}
                  className="w-full p-2 border border-line rounded"
                />
              </div>

              <div>
                <label className="block text-muted mb-1 font-semibold">URL Slug</label>
                <input
                  type="text"
                  value={activeCat.slug || ''}
                  onChange={(e) => setActiveCat({ ...activeCat, slug: e.target.value })}
                  placeholder="e.g. bedroom-furniture"
                  className="w-full p-2 border border-line rounded font-mono"
                />
              </div>

              <div>
                <label className="block text-muted mb-1 font-semibold">Description / Tagline</label>
                <input
                  type="text"
                  value={activeCat.description || ''}
                  onChange={(e) => setActiveCat({ ...activeCat, description: e.target.value })}
                  placeholder="e.g. Master beds, bridal bedroom sets, wardrobes and dressing vanities."
                  className="w-full p-2 border border-line rounded"
                />
              </div>

              <div>
                <label className="block text-muted mb-1 font-semibold">Display Order</label>
                <input
                  type="number"
                  value={activeCat.order || 1}
                  onChange={(e) => setActiveCat({ ...activeCat, order: parseInt(e.target.value) || 1 })}
                  className="w-full p-2 border border-line rounded"
                />
              </div>

              <div>
                <label className="block text-muted mb-1 font-semibold">
                  Sub-Categories (comma separated)
                </label>
                <textarea
                  rows={4}
                  value={subCategoriesText}
                  onChange={(e) => setSubCategoriesText(e.target.value)}
                  placeholder="King Size Beds, Queen Size Beds, Double Beds, Wardrobes..."
                  className="w-full p-2 border border-line rounded font-mono text-[11px]"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-line">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="btn-secondary text-xs py-2 px-4 cursor-pointer"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary text-xs py-2 px-5 cursor-pointer font-bold">
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Media Library Picker Modal */}
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
                <span className="eyebrow text-accent block">Media Library</span>
                <h3 className="font-serif text-lg text-ink">Choose Category Photo</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsMediaModalOpen(false)}
                className="p-1 text-muted hover:text-ink cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
              {mediaLibrary.length === 0 ? (
                <div className="text-center py-12 text-muted text-xs">
                  No images in library. Upload directly from your device.
                </div>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                  {mediaLibrary.map((item) => {
                    const isSelected = activeCat?.image === item.url;
                    return (
                      <div
                        key={item.id}
                        onClick={() => {
                          setActiveCat((prev) => (prev ? { ...prev, image: item.url } : prev));
                          setIsMediaModalOpen(false);
                        }}
                        className={`group relative aspect-square rounded-lg overflow-hidden border cursor-pointer transition-all ${
                          isSelected
                            ? 'border-accent ring-2 ring-accent'
                            : 'border-line hover:border-accent'
                        }`}
                      >
                        <img
                          src={item.url}
                          alt={item.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                        {isSelected && (
                          <div className="absolute top-1 right-1 bg-accent text-white p-1 rounded-full shadow-md">
                            <Check size={12} />
                          </div>
                        )}
                        <span className="absolute bottom-0 inset-x-0 bg-black/70 text-white text-[9px] p-1 truncate font-mono">
                          {item.name}
                        </span>
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
                className="btn-secondary text-xs py-1.5 px-4 cursor-pointer"
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
