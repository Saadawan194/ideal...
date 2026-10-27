import React, { useEffect, useMemo, useState } from 'react';
import { AdminLayout } from './AdminLayout';
import { db } from '../../lib/db';
import { Lead, LeadNote, LeadStatus } from '../../types';
import { buildWhatsAppLink } from '../../config/site';
import { WhatsAppIcon } from '../../components/ui/Icons';

export const AdminLeadsPage: React.FC = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [editingNotesId, setEditingNotesId] = useState<string | null>(null);
  const [notesDraft, setNotesDraft] = useState('');

  const loadLeads = () => {
    db.getLeads().then((data) => {
      // Sort newest first
      setLeads([...data].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    });
  };

  useEffect(() => {
    loadLeads();
  }, []);

  const handleStatusChange = async (leadId: string, newStatus: LeadStatus) => {
    await db.updateLead(leadId, { status: newStatus });
    loadLeads();
  };

  const getNotesString = (notes?: string | LeadNote[]): string => {
    if (!notes) return '';
    if (typeof notes === 'string') return notes;
    return notes.map((n) => (typeof n === 'string' ? n : n.content)).join('; ');
  };

  const handleAssignedChange = async (leadId: string, assignedTo: string) => {
    await db.updateLead(leadId, { assignedTo });
    loadLeads();
  };

  const handleSaveNotes = async (leadId: string) => {
    await db.updateLead(leadId, { notes: notesDraft });
    setEditingNotesId(null);
    loadLeads();
  };

  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      const leadName = lead.name || '';
      const leadPhone = lead.phone || '';
      const prodName = lead.productName || '';
      const prodCode = lead.productCode || '';
      const s = search.toLowerCase();

      const matchesSearch =
        leadName.toLowerCase().includes(s) ||
        leadPhone.toLowerCase().includes(s) ||
        prodName.toLowerCase().includes(s) ||
        prodCode.toLowerCase().includes(s);

      const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;
      const matchesSource = sourceFilter === 'all' || lead.source === sourceFilter;

      return matchesSearch && matchesStatus && matchesSource;
    });
  }, [leads, search, statusFilter, sourceFilter]);

  const exportCSV = () => {
    const headers = [
      'Date',
      'Name',
      'Phone',
      'City',
      'Source',
      'Product Code',
      'Product Name',
      'Status',
      'Assigned To',
      'Message',
      'Notes',
    ];

    const rows = filteredLeads.map((l) => [
      new Date(l.createdAt).toLocaleString(),
      `"${(l.name || 'Anonymous Visitor').replace(/"/g, '""')}"`,
      `"${l.phone || ''}"`,
      `"${l.city || ''}"`,
      l.source,
      `"${l.productCode || ''}"`,
      `"${(l.productName || '').replace(/"/g, '""')}"`,
      l.status,
      `"${l.assignedTo || ''}"`,
      `"${(l.message || '').replace(/"/g, '""')}"`,
      `"${getNotesString(l.notes).replace(/"/g, '""')}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `ideal_furniture_leads_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const leadStatuses: LeadStatus[] = [
    'New',
    'Contacted',
    'In Discussion',
    'Quoted',
    'Won',
    'Lost',
  ];

  return (
    <AdminLayout
      title="Inquiry & Leads CRM"
      subtitle="Complete register of client WhatsApp inquiries, callback requests, and interior consultations."
      action={
        <button onClick={exportCSV} className="btn-secondary text-xs py-2 px-4">
          Export Leads (CSV)
        </button>
      }
    >
      {/* Filters bar */}
      <div className="bg-paper border border-line p-4 sm:p-5 mb-6 flex flex-col md:flex-row gap-4 text-xs font-sans">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search by name, phone, or product code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-3.5 py-2 border border-line bg-paper text-ink focus:outline-hidden focus:border-accent text-xs"
          />
        </div>
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center space-x-2">
            <span className="text-muted uppercase tracking-wider">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-line bg-paper px-3 py-2 uppercase tracking-wider text-xs"
            >
              <option value="all">All Statuses</option>
              {leadStatuses.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-muted uppercase tracking-wider">Source:</span>
            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
              className="border border-line bg-paper px-3 py-2 uppercase tracking-wider text-xs"
            >
              <option value="all">All Sources</option>
              <option value="whatsapp_product">Product Page WhatsApp</option>
              <option value="whatsapp_header">Header WhatsApp</option>
              <option value="whatsapp_floating">Floating WhatsApp</option>
              <option value="callback_request">Callback Request</option>
              <option value="contact_form">Contact Form</option>
              <option value="consultation">Interior Consultation</option>
            </select>
          </div>
        </div>
      </div>

      {/* Leads Table */}
      <div className="bg-paper border border-line overflow-x-auto">
        <table className="w-full text-left text-xs font-sans divide-y divide-line">
          <thead className="bg-bone/70 uppercase tracking-wider text-[11px] text-muted">
            <tr>
              <th className="py-3 px-4">Date / Time</th>
              <th className="py-3 px-4">Client</th>
              <th className="py-3 px-4">Phone / WhatsApp</th>
              <th className="py-3 px-4">Source</th>
              <th className="py-3 px-4">Product / Item</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Assigned To</th>
              <th className="py-3 px-4">Notes & Message</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {filteredLeads.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-muted">
                  No inquiries match the current filter criteria.
                </td>
              </tr>
            ) : (
              filteredLeads.map((lead) => {
                const cleanPhone = lead.phone.replace(/[^0-9]/g, '');
                const directWaLink = `https://wa.me/${cleanPhone}`;
                return (
                  <tr key={lead.id} className="hover:bg-bone/30 transition-colors">
                    <td className="py-3 px-4 whitespace-nowrap text-muted text-[11px]">
                      {new Date(lead.createdAt).toLocaleDateString()}{' '}
                      <span className="opacity-70">
                        {new Date(lead.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-medium text-ink">
                      <div>{lead.name}</div>
                      {lead.city && (
                        <div className="text-[10px] text-muted">{lead.city}</div>
                      )}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <span>{lead.phone}</span>
                        <a
                          href={directWaLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1 text-accent hover:text-ink transition-colors border border-line"
                          title="Open WhatsApp chat with client"
                        >
                          <WhatsAppIcon size={13} />
                        </a>
                      </div>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="px-2 py-0.5 border border-line bg-bone text-[10px] uppercase tracking-wider text-muted">
                        {lead.source.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {lead.productName ? (
                        <div>
                          <div className="font-medium">{lead.productName}</div>
                          <div className="text-[10px] text-muted">{lead.productCode}</div>
                        </div>
                      ) : (
                        <span className="text-muted">–</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <select
                        value={lead.status}
                        onChange={(e) =>
                          handleStatusChange(lead.id, e.target.value as LeadStatus)
                        }
                        className={`text-xs py-1 px-2 border font-medium uppercase tracking-wider ${
                          lead.status === 'New'
                            ? 'bg-amber-50 border-amber-200 text-amber-900'
                            : lead.status === 'Won'
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                            : lead.status === 'Lost'
                            ? 'bg-red-50 border-red-200 text-red-700'
                            : 'bg-paper border-line text-ink'
                        }`}
                      >
                        {leadStatuses.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <input
                        type="text"
                        defaultValue={lead.assignedTo || ''}
                        onBlur={(e) => handleAssignedChange(lead.id, e.target.value)}
                        placeholder="Assign specialist..."
                        className="py-1 px-2 border border-line bg-paper text-xs text-ink w-32 focus:border-accent"
                      />
                    </td>
                    <td className="py-3 px-4 min-w-[220px]">
                      {editingNotesId === lead.id ? (
                        <div className="space-y-1.5">
                          <textarea
                            value={notesDraft}
                            onChange={(e) => setNotesDraft(e.target.value)}
                            rows={2}
                            className="w-full p-1.5 border border-line bg-paper text-xs"
                          />
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleSaveNotes(lead.id)}
                              className="px-2 py-0.5 bg-ink text-paper text-[10px] uppercase tracking-wider"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setEditingNotesId(null)}
                              className="px-2 py-0.5 border border-line text-[10px] uppercase tracking-wider"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div
                          onClick={() => {
                            setEditingNotesId(lead.id);
                            setNotesDraft(getNotesString(lead.notes));
                          }}
                          className="cursor-pointer hover:bg-bone/60 p-1.5 border border-dashed border-transparent hover:border-line"
                        >
                          {lead.message && (
                            <p className="text-muted text-[11px] italic mb-1">
                              "{lead.message}"
                            </p>
                          )}
                          <p className="text-ink text-[11px]">
                            {getNotesString(lead.notes) || (
                              <span className="text-muted/60">+ Add studio note...</span>
                            )}
                          </p>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
};
