import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  Sparkles,
  Plus,
  Trash2,
  Activity,
  Smile,
  Frown,
  AlertCircle,
  ShieldCheck,
  ExternalLink,
  Loader2,
  X,
} from 'lucide-react';
import { apiClient } from '../services/apiClient';
import type { JournalEntry, AnalysisReportSummary } from '../types';

export const JournalPage: React.FC = () => {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [reports, setReports] = useState<AnalysisReportSummary[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  // New Entry Form State
  const [title, setTitle] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [skinFeel, setSkinFeel] = useState<string>('Good');
  const [selectedReportId, setSelectedReportId] = useState<string>('');
  const [productsUsed, setProductsUsed] = useState<string>('');
  const [saving, setSaving] = useState<boolean>(false);

  useEffect(() => {
    loadJournalData();
  }, []);

  const loadJournalData = async () => {
    setLoading(true);
    try {
      const [journalData, reportsData] = await Promise.all([
        apiClient.getJournalEntries(),
        apiClient.listReports(),
      ]);
      setEntries(journalData);
      setReports(reportsData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setSaving(true);
    try {
      const productList = productsUsed
        .split(',')
        .map((p) => p.trim())
        .filter((p) => p.length > 0);

      const newEntry = await apiClient.createJournalEntry({
        title,
        notes,
        skin_feel: skinFeel,
        report_id: selectedReportId || undefined,
        products_used: productList,
      });

      setEntries((prev) => [newEntry, ...prev]);
      setIsModalOpen(false);
      // Reset form
      setTitle('');
      setNotes('');
      setProductsUsed('');
      setSelectedReportId('');
      setSkinFeel('Good');
    } catch (err) {
      console.error(err);
      alert('Failed to save journal observation.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteEntry = async (id: string) => {
    if (!window.confirm('Delete this journal observation? This cannot be undone.')) return;
    try {
      await apiClient.deleteJournalEntry(id);
      setEntries((prev) => prev.filter((e) => e.id !== id));
    } catch (err) {
      console.error(err);
      alert('Failed to delete entry.');
    }
  };

  const handleDeleteReport = async (reportId: string) => {
    if (!window.confirm('Delete this saved analysis report?')) return;
    try {
      await apiClient.deleteReport(reportId);
      setReports((prev) => prev.filter((r) => r.report_id !== reportId));
    } catch (err) {
      console.error(err);
      alert('Failed to delete report.');
    }
  };

  const getFeelBadge = (feel: string | undefined) => {
    switch (feel) {
      case 'Glowing':
      case 'Good':
        return { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: Smile };
      case 'Breakout':
        return { bg: 'bg-rose-50 text-rose-700 border-rose-200', icon: AlertCircle };
      case 'Dry':
      case 'Irritated':
        return { bg: 'bg-amber-50 text-amber-700 border-amber-200', icon: Frown };
      default:
        return { bg: 'bg-stone-50 text-stone-600 border-stone-200', icon: Smile };
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-cream-300">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-lavender-50 text-lavender-700 text-xs font-semibold mb-2 border border-lavender-200">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Progress Tracking</span>
          </div>
          <h1 className="text-3xl font-extrabold text-stone-900 tracking-tight">
            Skin Progress Journal
          </h1>
          <p className="text-sm text-stone-600 mt-1">
            Track your skin observations, routine compliance, and past YouCam diagnostic reports.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-lavender-600 hover:bg-lavender-700 shadow-sm transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Log Observation</span>
        </button>
      </div>

      {/* Privacy Notice */}
      <div className="p-4 bg-white rounded-2xl border border-cream-300 flex items-center gap-3 text-xs text-stone-600">
        <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
        <span>
          <strong>Local Persistence & Privacy:</strong> All structured reports and user notes are saved in your local SQLite database. Facial selfies are never saved on disk. You maintain full deletion rights at any time.
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Journal Entries Timeline */}
        <div className="lg:col-span-8 space-y-6">
          <h2 className="text-xl font-bold text-stone-900 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-lavender-600" />
            <span>Observation Timeline</span>
          </h2>

          {loading ? (
            <div className="text-center py-16 text-stone-500 text-sm">
              <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-lavender-600" />
              <span>Loading your journal...</span>
            </div>
          ) : entries.length > 0 ? (
            <div className="space-y-4">
              {entries.map((entry) => {
                const badge = getFeelBadge(entry.skin_feel);
                const FeelIcon = badge.icon;
                const formattedDate = new Date(entry.created_at).toLocaleDateString('en-IN', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                });

                return (
                  <div
                    key={entry.id}
                    className="bg-white rounded-2xl border border-cream-300 p-5 shadow-sm hover:shadow-md transition-shadow relative group"
                  >
                    <button
                      onClick={() => handleDeleteEntry(entry.id)}
                      className="absolute top-4 right-4 text-stone-300 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition-colors"
                      title="Delete entry"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="text-xs text-stone-400 font-medium">{formattedDate}</span>
                      {entry.skin_feel && (
                        <span
                          className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full border ${badge.bg}`}
                        >
                          <FeelIcon className="w-3 h-3" />
                          <span>Skin Feel: {entry.skin_feel}</span>
                        </span>
                      )}
                    </div>

                    <h3 className="font-bold text-stone-900 text-base mb-1">{entry.title}</h3>

                    {entry.notes && (
                      <p className="text-xs text-stone-600 leading-relaxed mt-2 whitespace-pre-line">
                        {entry.notes}
                      </p>
                    )}

                    {/* Linked Report Summary */}
                    {entry.report_summary && (
                      <div className="mt-3 p-3 bg-cream-50 rounded-xl border border-cream-200 flex items-center justify-between text-xs">
                        <div>
                          <span className="font-semibold text-stone-800">Linked Diagnostic Scan: </span>
                          <span className="text-stone-600">
                            {entry.report_summary.skin_type} Skin &bull; Health Index:{' '}
                            {entry.report_summary.overall_score || 'N/A'}/100
                          </span>
                        </div>
                        {entry.report_id && (
                          <Link
                            to={`/results/${entry.report_id}`}
                            className="text-lavender-700 hover:text-lavender-800 font-semibold flex items-center gap-1"
                          >
                            <span>View Scan</span>
                            <ExternalLink className="w-3 h-3" />
                          </Link>
                        )}
                      </div>
                    )}

                    {/* Products Used */}
                    {entry.products_used.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-cream-200 flex flex-wrap gap-1.5">
                        <span className="text-[10px] text-stone-400 font-semibold uppercase tracking-wider self-center mr-1">
                          Products:
                        </span>
                        {entry.products_used.map((prod, i) => (
                          <span
                            key={i}
                            className="text-xs px-2 py-0.5 rounded bg-cream-100 text-stone-700 border border-cream-200"
                          >
                            {prod}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-cream-300 p-12 text-center text-stone-500 space-y-3">
              <Calendar className="w-10 h-10 text-stone-300 mx-auto" />
              <h3 className="font-bold text-stone-800 text-base">Your journal is currently empty.</h3>
              <p className="text-xs text-stone-500 max-w-sm mx-auto">
                Log daily skin feel, reaction to new products, or save your skin analysis to monitor long-term progress.
              </p>
              <button
                onClick={() => setIsModalOpen(true)}
                className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-lavender-600 hover:bg-lavender-700"
              >
                <Plus className="w-4 h-4" />
                <span>Log First Entry</span>
              </button>
            </div>
          )}
        </div>

        {/* Right Column: Saved Analysis Reports History */}
        <div className="lg:col-span-4 space-y-4">
          <h2 className="text-xl font-bold text-stone-900 flex items-center gap-2">
            <Activity className="w-5 h-5 text-lavender-600" />
            <span>Saved Reports ({reports.length})</span>
          </h2>

          {reports.length > 0 ? (
            <div className="space-y-3">
              {reports.map((r) => (
                <div
                  key={r.report_id}
                  className="bg-white rounded-2xl border border-cream-300 p-4 shadow-2xs hover:shadow-sm transition-all"
                >
                  <div className="flex items-center justify-between text-xs text-stone-400 mb-1">
                    <span>{new Date(r.created_at).toLocaleDateString()}</span>
                    <button
                      onClick={() => handleDeleteReport(r.report_id)}
                      className="text-stone-300 hover:text-rose-600 p-1"
                      title="Delete report"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-stone-900 text-sm">
                        {r.skin_type || 'Custom Scan'}
                      </span>
                      {r.is_demo && (
                        <span className="text-[10px] ml-2 px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
                          Demo
                        </span>
                      )}
                    </div>
                    <span className="text-xs font-bold text-lavender-700">
                      Score: {r.overall_score || 'N/A'}
                    </span>
                  </div>
                  <Link
                    to={`/results/${r.report_id}`}
                    className="mt-3 block text-center py-1.5 rounded-lg bg-cream-100 hover:bg-cream-200 text-stone-700 text-xs font-semibold transition-colors"
                  >
                    View Report
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-cream-300 p-6 text-center text-xs text-stone-500">
              No saved skin scans yet. Run a skin analysis to save your diagnostic report.
            </div>
          )}
        </div>
      </div>

      {/* Modal for Creating New Journal Entry */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-cream-300 shadow-2xl max-w-lg w-full p-6 sm:p-8 relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 text-stone-400 hover:text-stone-700 p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-bold text-stone-900 mb-1">Log Skin Observation</h3>
            <p className="text-xs text-stone-500 mb-6">
              Record how your skin feels today and note any reaction to your skincare regimen.
            </p>

            <form onSubmit={handleCreateEntry} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-900 uppercase tracking-wider mb-1.5">
                  Entry Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Day 4: Post-BHA Wash Observation"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-cream-300 text-xs focus:ring-lavender-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-900 uppercase tracking-wider mb-1.5">
                  Skin Feel Today
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {['Good', 'Dry', 'Irritated', 'Breakout'].map((feel) => (
                    <button
                      key={feel}
                      type="button"
                      onClick={() => setSkinFeel(feel)}
                      className={`py-2 rounded-xl text-xs font-semibold border transition-all ${
                        skinFeel === feel
                          ? 'bg-lavender-600 text-white border-lavender-600 shadow-sm'
                          : 'bg-white text-stone-700 border-cream-300 hover:border-cream-400'
                      }`}
                    >
                      {feel}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-900 uppercase tracking-wider mb-1.5">
                  Link Saved Skin Scan (Optional)
                </label>
                <select
                  value={selectedReportId}
                  onChange={(e) => setSelectedReportId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-cream-300 text-xs bg-white"
                >
                  <option value="">No scan linked</option>
                  {reports.map((r) => (
                    <option key={r.report_id} value={r.report_id}>
                      {r.skin_type} Scan ({new Date(r.created_at).toLocaleDateString()}) - ID: {r.report_id.slice(0, 6)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-900 uppercase tracking-wider mb-1.5">
                  Products Used Today
                </label>
                <input
                  type="text"
                  value={productsUsed}
                  onChange={(e) => setProductsUsed(e.target.value)}
                  placeholder="e.g. Gentle Hydrating Cleanser, Niacinamide Serum, Fluid Sunscreen"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-cream-300 text-xs focus:ring-lavender-500 focus:outline-none"
                />
                <span className="text-[10px] text-stone-400 mt-1 block">Separate products with commas</span>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-900 uppercase tracking-wider mb-1.5">
                  Personal Observations / Notes
                </label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Note changes in texture, redness reduction, or any new irritation..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-cream-300 text-xs focus:ring-lavender-500 focus:outline-none"
                />
              </div>

              <div className="pt-3 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-600 hover:bg-stone-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-lavender-600 hover:bg-lavender-700 shadow-sm"
                >
                  {saving ? 'Saving...' : 'Save Observation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
