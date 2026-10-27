import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { AdminLayout } from './AdminLayout';
import { db } from '../../lib/db';
import { MediaItem } from '../../types';
import { convertImageToWebP, formatBytes } from '../../lib/imageOptimization';
import {
  UploadCloud,
  Search,
  Copy,
  Trash2,
  ExternalLink,
  Check,
  Image as ImageIcon,
  X,
  FileCheck,
  Sparkles,
} from 'lucide-react';

export const AdminMediaPage: React.FC = () => {
  const [mediaList, setMediaList] = useState<MediaItem[]>([]);
  const [search, setSearch] = useState('');
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadMedia = async () => {
    const items = await db.getMediaItems();
    setMediaList(items);
  };

  useEffect(() => {
    loadMedia();
    const onRealtimeUpdate = () => {
      loadMedia();
    };
    window.addEventListener('ideal_media_updated', onRealtimeUpdate);
    return () => {
      window.removeEventListener('ideal_media_updated', onRealtimeUpdate);
    };
  }, []);

  const filteredMedia = mediaList.filter((m) =>
    m.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setIsUploading(true);
    const fileArray = Array.from(files);

    for (let i = 0; i < fileArray.length; i++) {
      const file = fileArray[i];
      setUploadProgress(`Uploading ${i + 1} of ${fileArray.length}: ${file.name}...`);
      try {
        // Optimize to WebP before uploading to keep server storage ultra fast & light
        const webpResult = await convertImageToWebP(file, 2048, 0.88);
        await db.uploadMedia(
          file.name.replace(/\.[^/.]+$/, '') + '.webp',
          webpResult.dataUrl,
          formatBytes(webpResult.optimizedSize)
        );
      } catch (err) {
        console.warn('Direct upload fallback:', err);
        // Fallback to FileReader if WebP fails
        const reader = new FileReader();
        await new Promise<void>((resolve) => {
          reader.onload = async () => {
            if (reader.result) {
              await db.uploadMedia(
                file.name,
                reader.result as string,
                formatBytes(file.size)
              );
            }
            resolve();
          };
          reader.readAsDataURL(file);
        });
      }
    }

    setIsUploading(false);
    setUploadProgress(null);
    await loadMedia();
  };

  const handleDelete = async (id: string) => {
    const mediaItem = mediaList.find((m) => m.id === id);
    if (!mediaItem) return;

    // Check if any active product references this image
    const products = await db.getProducts();
    const usingProducts = products.filter((p) =>
      (Array.isArray(p.images) && p.images.includes(mediaItem.url)) || p.featuredImage === mediaItem.url
    );

    if (usingProducts.length > 0) {
      const names = usingProducts.map((p) => `"${p.name}"`).slice(0, 3).join(", ");
      const extra = usingProducts.length > 3 ? ` and ${usingProducts.length - 3} more` : "";
      const proceed = confirm(
        `WARNING: This image is actively used by ${usingProducts.length} product(s): ${names}${extra}.\n\nDeleting it will leave those products without a photograph. Are you sure you want to proceed?`
      );
      if (!proceed) return;
    } else {
      if (!confirm("Are you sure you want to permanently delete this media file?")) {
        return;
      }
    }

    await db.deleteMedia(id);
    if (selectedMedia?.id === id) {
      setSelectedMedia(null);
    }
    await loadMedia();
  };

  const handleCopyUrl = (url: string, id: string) => {
    const fullUrl = url.startsWith('http') ? url : `${window.location.origin}${url}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  return (
    <AdminLayout
      title="Media Library (WordPress Style)"
      subtitle="All uploaded images are permanently stored on the server disk. You can use these image URLs across any product or page."
      action={
        <div className="flex items-center gap-3">
          <Link
            to="/admin/bulk-upload"
            className="px-3.5 py-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded text-xs font-sans font-bold flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <Sparkles size={14} className="text-[#B89360]" />
            <span>AI Bulk Auto-Categorize (5k+ Photos)</span>
          </Link>
          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => handleFiles(e.target.files)}
            multiple
            accept="image/*"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="btn-secondary flex items-center gap-2 text-xs py-2 px-3.5 cursor-pointer"
          >
            <UploadCloud size={15} />
            <span>Upload Media Files</span>
          </button>
        </div>
      }
    >
      {/* Upload Drag & Drop Area */}
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          handleFiles(e.dataTransfer.files);
        }}
        onClick={() => fileInputRef.current?.click()}
        className="mb-8 border-2 border-dashed border-line bg-paper/60 hover:bg-paper hover:border-ink transition-colors p-8 rounded-xl flex flex-col items-center justify-center text-center cursor-pointer group"
      >
        <div className="w-12 h-12 rounded-full bg-bone flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
          <UploadCloud size={24} className="text-ink" />
        </div>
        <p className="font-sans text-sm font-semibold text-ink">
          Drop furniture photos here or click to browse
        </p>
        <p className="text-xs text-muted mt-1">
          Supports JPG, PNG, WEBP. Automatically optimized and permanently stored in your server library.
        </p>
        {isUploading && (
          <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 rounded bg-[#8C5921]/15 text-[#8C5921] text-xs font-medium animate-pulse">
            <FileCheck size={14} />
            <span>{uploadProgress || 'Saving images to server...'}</span>
          </div>
        )}
      </div>

      {/* Filter / Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-line">
        <div className="relative flex-1 max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="text"
            placeholder="Search media by filename..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-paper border border-line rounded-lg text-ink focus:outline-none focus:border-ink"
          />
        </div>
        <div className="text-xs text-muted font-mono">
          Showing <span className="font-bold text-ink">{filteredMedia.length}</span> items
        </div>
      </div>

      {/* Media Grid */}
      {filteredMedia.length === 0 ? (
        <div className="p-16 text-center border border-line bg-paper/40 rounded-xl">
          <ImageIcon size={36} className="mx-auto text-muted/60 mb-3" />
          <h3 className="font-serif text-lg text-ink font-semibold">No media files found</h3>
          <p className="text-xs text-muted mt-1 max-w-sm mx-auto">
            Upload your first furniture photographs above. They will stay stored permanently in this library.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {filteredMedia.map((item) => {
            const isSelected = selectedMedia?.id === item.id;
            return (
              <div
                key={item.id}
                onClick={() => setSelectedMedia(item)}
                className={`group relative aspect-square rounded-lg overflow-hidden bg-bone border cursor-pointer transition-all ${
                  isSelected
                    ? 'border-ink ring-2 ring-ink shadow-md'
                    : 'border-line hover:border-ink/60'
                }`}
              >
                <img
                  src={item.url}
                  alt={item.name}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {/* Subtle gradient overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-2">
                  <span className="text-[10px] text-white font-medium truncate block">
                    {item.name}
                  </span>
                  <span className="text-[9px] text-neutral-300 font-mono block">
                    {item.size || 'Saved'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* WordPress-style Media Details Modal / Sidebar */}
      {selectedMedia && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6"
          onClick={() => setSelectedMedia(null)}
        >
          <div
            className="bg-paper border border-line rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-line flex items-center justify-between">
              <div>
                <h3 className="font-sans font-bold text-sm text-ink truncate max-w-md">
                  {selectedMedia.name}
                </h3>
                <span className="text-[11px] text-muted font-mono block">
                  Uploaded on {new Date(selectedMedia.createdAt).toLocaleDateString()} • {selectedMedia.size}
                </span>
              </div>
              <button
                onClick={() => setSelectedMedia(null)}
                className="p-1.5 rounded-lg hover:bg-bone text-muted hover:text-ink transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body Preview */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-4">
              <div className="w-full max-h-[50vh] bg-bone/60 border border-line rounded-xl overflow-hidden flex items-center justify-center p-2">
                <img
                  src={selectedMedia.url}
                  alt={selectedMedia.name}
                  className="max-h-[46vh] max-w-full object-contain"
                />
              </div>

              {/* URL Field with Copy Button */}
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-muted mb-1">
                  Permanent File URL
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={
                      selectedMedia.url.startsWith('http')
                        ? selectedMedia.url
                        : `${window.location.origin}${selectedMedia.url}`
                    }
                    className="flex-1 px-3 py-2 bg-bone border border-line rounded-lg text-xs font-mono text-ink select-all"
                  />
                  <button
                    onClick={() => handleCopyUrl(selectedMedia.url, selectedMedia.id)}
                    className="btn-secondary text-xs py-2 px-3 flex items-center gap-1.5 shrink-0 cursor-pointer"
                  >
                    {copiedId === selectedMedia.id ? (
                      <>
                        <Check size={14} className="text-green-600" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy size={14} />
                        <span>Copy URL</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 sm:p-5 border-t border-line flex items-center justify-between bg-bone/30 text-xs">
              <a
                href={selectedMedia.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-ink hover:underline font-medium"
              >
                <span>View Full File in New Tab</span>
                <ExternalLink size={12} />
              </a>
              <button
                onClick={() => handleDelete(selectedMedia.id)}
                className="text-red-700 hover:text-red-800 font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 size={13} />
                <span>Delete Permanently</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};
