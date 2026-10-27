import React, { useEffect, useState } from 'react';
import { AdminLayout } from './AdminLayout';
import { db } from '../../lib/db';
import { SiteSettings } from '../../types';

export const AdminSettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [saved, setSaved] = useState(false);
  const [jsonImportText, setJsonImportText] = useState('');
  const [cloudSyncing, setCloudSyncing] = useState(false);
  const [cloudMsg, setCloudMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const handleSyncToFirestore = async () => {
    try {
      setCloudSyncing(true);
      setCloudMsg(null);
      const res = await db.syncAllToCloudFirestore();
      setCloudMsg({
        text: `Successfully synced ${res.productsCount} products & site settings to Google Cloud Firestore!`,
        type: 'success',
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Sync failed';
      setCloudMsg({
        text: `Cloud sync error: ${msg}`,
        type: 'error',
      });
    } finally {
      setCloudSyncing(false);
    }
  };

  const handlePullFromFirestore = async () => {
    try {
      setCloudSyncing(true);
      setCloudMsg(null);
      const res = await db.pullFromCloudFirestore();
      setCloudMsg({
        text: `Fetched ${res.productsCount} products from Cloud Firestore into local database!`,
        type: 'success',
      });
      setTimeout(() => window.location.reload(), 1500);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Pull failed';
      setCloudMsg({
        text: `Cloud pull error: ${msg}`,
        type: 'error',
      });
    } finally {
      setCloudSyncing(false);
    }
  };

  useEffect(() => {
    db.getSettings().then((data) => setSettings(data));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    // Clean phone/whatsapp of extra spaces
    const cleanWa = settings.whatsappNumber.replace(/[^0-9]/g, '');
    await db.updateSettings({
      ...settings,
      whatsappNumber: cleanWa,
      phone: settings.phone,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleExportDatabase = async () => {
    const dump = await db.exportDatabase();
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(dump);
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute(
      'download',
      `ideal_furniture_backup_${new Date().toISOString().slice(0, 10)}.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportDatabase = async () => {
    if (!jsonImportText.trim()) return;
    try {
      const ok = await db.importDatabase(jsonImportText);
      if (ok) {
        setCloudMsg({
          text: 'Database restored successfully! Reloading view...',
          type: 'success',
        });
        setTimeout(() => window.location.reload(), 1200);
      } else {
        setCloudMsg({
          text: 'Invalid JSON structure. Import aborted.',
          type: 'error',
        });
      }
    } catch {
      setCloudMsg({
        text: 'Failed to import snapshot. Please check JSON format.',
        type: 'error',
      });
    }
  };

  if (!settings) {
    return (
      <AdminLayout title="Studio & System Settings">
        <div className="py-20 text-center text-muted">Loading settings...</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      title="Studio & System Settings"
      subtitle="Configure central WhatsApp numbers, atelier coordinates, visiting hours, and database snapshots."
    >
      {saved && (
        <div className="mb-6 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-sans">
          Studio settings updated successfully.
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-xs font-sans">
        {/* Left 7 cols: Contact & Showroom Config */}
        <div className="lg:col-span-7 bg-paper border border-line p-6 sm:p-8 space-y-6">
          <span className="eyebrow text-accent block">Studio Communication Settings</span>

          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block uppercase tracking-wider text-muted mb-1">
                Primary WhatsApp Number (e.g. 923001234567, no '+' or spaces) *
              </label>
              <input
                type="text"
                required
                value={settings.whatsappNumber}
                onChange={(e) =>
                  setSettings({ ...settings, whatsappNumber: e.target.value })
                }
                className="w-full px-3 py-2 border border-line bg-paper text-sm font-mono"
              />
              <p className="text-[10px] text-muted mt-1">
                All public WhatsApp buttons throughout the site route inquiries to this number.
              </p>
            </div>

            <div>
              <label className="block uppercase tracking-wider text-muted mb-1">
                Secondary Phone Number (for display)
              </label>
              <input
                type="text"
                value={settings.phone}
                onChange={(e) =>
                  setSettings({ ...settings, phone: e.target.value })
                }
                className="w-full px-3 py-2 border border-line bg-paper text-sm"
              />
            </div>

            <div>
              <label className="block uppercase tracking-wider text-muted mb-1">
                Official Studio Email
              </label>
              <input
                type="email"
                required
                value={settings.email}
                onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                className="w-full px-3 py-2 border border-line bg-paper text-sm"
              />
            </div>

            <div>
              <label className="block uppercase tracking-wider text-muted mb-1">
                Showroom Flagship Address
              </label>
              <textarea
                rows={2}
                value={settings.address}
                onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                className="w-full px-3 py-2 border border-line bg-paper text-sm leading-relaxed"
              />
            </div>

            <div>
              <label className="block uppercase tracking-wider text-muted mb-1">
                Visiting & Showroom Hours
              </label>
              <input
                type="text"
                value={settings.showroomHours}
                onChange={(e) =>
                  setSettings({ ...settings, showroomHours: e.target.value })
                }
                className="w-full px-3 py-2 border border-line bg-paper text-sm"
              />
            </div>

            <div className="pt-4 border-t border-line">
              <button type="submit" className="btn-primary text-xs py-3 px-6">
                Save Studio Settings
              </button>
            </div>
          </form>
        </div>

        {/* Right 5 cols: Cloud Database & Backup */}
        <div className="lg:col-span-5 space-y-6">
          {/* Cloud Firestore Integration */}
          <div className="bg-paper border border-line p-6 sm:p-8 space-y-5">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="eyebrow text-accent">Active Cloud Database</span>
              </div>
              <h3 className="font-serif text-xl text-ink font-light">
                Google Cloud Firestore
              </h3>
              <p className="text-xs text-muted font-sans font-light mt-1.5 leading-relaxed">
                Persistent database connected. Allows your website to retain full catalog, inquiries, and settings when deployed on <strong>Vercel</strong> or <strong>GitHub Pages</strong>.
              </p>
            </div>

            <div className="bg-bone/40 p-3.5 border border-line/60 rounded text-[11px] font-mono space-y-1 text-ink/80">
              <div><strong className="text-muted">Project:</strong> responsive-bit-2smzh</div>
              <div><strong className="text-muted">Storage:</strong> Google Cloud Multi-Region</div>
              <div><strong className="text-muted">Security Rules:</strong> Deployed & Protected</div>
            </div>

            {cloudMsg && (
              <div
                className={`p-3 text-xs leading-relaxed rounded border ${
                  cloudMsg.type === 'success'
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : 'bg-red-50 text-red-800 border-red-200'
                }`}
              >
                {cloudMsg.text}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <button
                type="button"
                onClick={handleSyncToFirestore}
                disabled={cloudSyncing}
                className="btn-primary py-2.5 text-xs text-center justify-center disabled:opacity-50"
              >
                {cloudSyncing ? 'Syncing...' : 'Push All to Cloud'}
              </button>
              <button
                type="button"
                onClick={handlePullFromFirestore}
                disabled={cloudSyncing}
                className="btn-secondary py-2.5 text-xs text-center justify-center disabled:opacity-50"
              >
                {cloudSyncing ? 'Pulling...' : 'Pull From Cloud'}
              </button>
            </div>

            <div className="pt-3 border-t border-line text-[11px] text-muted space-y-1.5">
              <div className="font-medium text-ink">Ready for Vercel & GitHub Deployment</div>
              <p className="text-[10px] leading-relaxed">
                Connect your GitHub repository to Vercel. Vite will automatically build the site with all Cloud Firestore hooks included!
              </p>
            </div>
          </div>

          {/* Database JSON Snapshot Backup / Restore */}
          <div className="bg-paper border border-line p-6 sm:p-8 space-y-6">
            <div>
              <span className="eyebrow text-accent block mb-2">Local Disaster Recovery</span>
              <h3 className="font-serif text-xl text-ink font-light">
                Database JSON Snapshot
              </h3>
              <p className="text-xs text-muted font-sans font-light mt-2 leading-relaxed">
                Export the entire catalog, leads, spaces, and homepage configuration as an offline JSON snapshot file.
              </p>

              <div className="pt-4">
                <button
                  type="button"
                  onClick={handleExportDatabase}
                  className="btn-secondary w-full py-2.5 text-xs text-center justify-center"
                >
                  Download Database JSON Export
                </button>
              </div>

              <div className="pt-6 border-t border-line mt-6 space-y-3">
                <span className="eyebrow block">Restore From Snapshot</span>
                <textarea
                  rows={3}
                  value={jsonImportText}
                  onChange={(e) => setJsonImportText(e.target.value)}
                  placeholder="Paste backup JSON string here to restore..."
                  className="w-full px-3 py-2 border border-line bg-bone/30 text-[10px] font-mono"
                />
                <button
                  type="button"
                  onClick={handleImportDatabase}
                  className="btn-secondary w-full py-2 text-[11px] text-center justify-center"
                >
                  Import & Restore Database
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};
