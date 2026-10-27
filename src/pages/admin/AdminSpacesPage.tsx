import React, { useEffect, useState } from 'react';
import { AdminLayout } from './AdminLayout';
import { db } from '../../lib/db';
import { Space } from '../../types';

export const AdminSpacesPage: React.FC = () => {
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [activeSpace, setActiveSpace] = useState<Partial<Space> | null>(null);

  const loadSpaces = () => {
    db.getSpaces().then((data) => setSpaces(data));
  };

  useEffect(() => {
    loadSpaces();
  }, []);

  const handleOpenAdd = () => {
    setActiveSpace({
      name: '',
      slug: '',
      image: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=85',
      description: '',
    });
    setIsEditing(true);
  };

  const handleOpenEdit = (space: Space) => {
    setActiveSpace({ ...space });
    setIsEditing(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSpace || !activeSpace.name) return;

    const slug =
      activeSpace.slug ||
      activeSpace.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

    const payload = {
      name: activeSpace.name,
      slug,
      image: activeSpace.image || '',
      description: activeSpace.description || '',
      order: activeSpace.order ?? spaces.length + 1,
    };

    if (activeSpace.id) {
      await db.updateSpace(activeSpace.id, payload);
    } else {
      await db.createSpace(payload);
    }
    setIsEditing(false);
    setActiveSpace(null);
    loadSpaces();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this space curation?')) {
      await db.deleteSpace(id);
      loadSpaces();
    }
  };

  return (
    <AdminLayout
      title="Spaces Curation"
      subtitle="Organize residential living zones and visual mood photography."
      action={
        <button onClick={handleOpenAdd} className="btn-primary text-xs py-2.5 px-5">
          + Add Space
        </button>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {spaces.map((sp) => (
          <div key={sp.id} className="bg-paper border border-line flex flex-col">
            <div className="aspect-4/3 bg-bone overflow-hidden">
              <img src={sp.image} alt={sp.name} className="w-full h-full object-cover" />
            </div>
            <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
              <div>
                <h3 className="font-serif text-lg text-ink">{sp.name}</h3>
                <p className="text-xs text-muted font-sans font-light mt-1">
                  {sp.description}
                </p>
              </div>
              <div className="pt-3 border-t border-line flex items-center justify-between text-xs font-sans">
                <span className="font-mono text-muted text-[10px]">/{sp.slug}</span>
                <div className="space-x-3">
                  <button
                    onClick={() => handleOpenEdit(sp)}
                    className="text-ink hover:text-accent underline"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(sp.id)}
                    className="text-red-700 hover:text-red-900 underline"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {isEditing && activeSpace && (
        <div className="fixed inset-0 z-50 bg-ink/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-paper border border-line w-full max-w-lg p-6 sm:p-8 text-xs font-sans">
            <h2 className="font-serif text-2xl text-ink mb-6">
              {activeSpace.id ? 'Edit Space' : 'Add Space'}
            </h2>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block uppercase tracking-wider text-muted mb-1">
                  Space Name *
                </label>
                <input
                  type="text"
                  required
                  value={activeSpace.name || ''}
                  onChange={(e) => setActiveSpace({ ...activeSpace, name: e.target.value })}
                  className="w-full px-3 py-2 border border-line bg-paper text-sm"
                />
              </div>

              <div>
                <label className="block uppercase tracking-wider text-muted mb-1">
                  URL Slug
                </label>
                <input
                  type="text"
                  value={activeSpace.slug || ''}
                  onChange={(e) => setActiveSpace({ ...activeSpace, slug: e.target.value })}
                  placeholder="Leave empty to auto-generate"
                  className="w-full px-3 py-2 border border-line bg-paper text-xs font-mono"
                />
              </div>

              <div>
                <label className="block uppercase tracking-wider text-muted mb-1">
                  Image URL (4:3 editorial photography)
                </label>
                <input
                  type="url"
                  value={activeSpace.image || ''}
                  onChange={(e) => setActiveSpace({ ...activeSpace, image: e.target.value })}
                  className="w-full px-3 py-2 border border-line bg-paper text-xs"
                />
              </div>

              <div>
                <label className="block uppercase tracking-wider text-muted mb-1">
                  Short Editorial Description
                </label>
                <textarea
                  rows={2}
                  value={activeSpace.description || ''}
                  onChange={(e) =>
                    setActiveSpace({ ...activeSpace, description: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-line bg-paper text-xs"
                />
              </div>

              <div className="pt-4 border-t border-line flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="btn-secondary text-xs"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary text-xs">
                  Save Space
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};
