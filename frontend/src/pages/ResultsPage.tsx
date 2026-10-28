import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate, Link } from 'react-router-dom';
import {
  BookOpen,
  ShoppingBag,
  Clock,
  ArrowRight,
  CheckCircle2,
  BookmarkPlus,
  Loader2,
  AlertTriangle,
} from 'lucide-react';
import type { SkinAnalysisResult } from '../types';
import { apiClient } from '../services/apiClient';
import { MetricCard } from '../components/MetricCard';
import { DemoModeBadge } from '../components/DemoModeBadge';
import { DisclaimerBanner } from '../components/DisclaimerBanner';

export const ResultsPage: React.FC = () => {
  const { reportId } = useParams<{ reportId: string }>();
  const location = useLocation();
  const navigate = useNavigate();

  const [report, setReport] = useState<SkinAnalysisResult | null>(
    (location.state as any)?.report || null
  );
  const [loading, setLoading] = useState<boolean>(!report);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [journalSaved, setJournalSaved] = useState<boolean>(false);
  const [journalSaving, setJournalSaving] = useState<boolean>(false);

  useEffect(() => {
    // If not passed in router state, fetch from API or session storage
    if (!report && reportId) {
      setLoading(true);
      apiClient.getReport(reportId)
        .then((data) => {
          setReport(data);
          setLoading(false);
        })
        .catch((err) => {
          // Check session storage
          const stored = sessionStorage.getItem('latest_skinwise_report');
          if (stored) {
            try {
              const parsed = JSON.parse(stored);
              if (parsed.report_id === reportId) {
                setReport(parsed);
                setLoading(false);
                return;
              }
            } catch {}
          }
          setErrorMessage(err.message || 'Unable to load report.');
          setLoading(false);
        });
    }
  }, [reportId, report]);

  const handleSaveToJournal = async () => {
    if (!report) return;
    setJournalSaving(true);
    try {
      await apiClient.createJournalEntry({
        report_id: report.report_id,
        title: `Analysis from ${new Date(report.created_at).toLocaleDateString()}`,
        notes: report.summary,
        skin_feel: 'Good',
        products_used: [],
      });
      setJournalSaved(true);
    } catch (err) {
      console.error(err);
      alert('Could not save to journal. Please try again.');
    } finally {
      setJournalSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center">
        <Loader2 className="w-10 h-10 animate-spin text-lavender-600 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-stone-900">Loading Skin Analysis Report...</h2>
        <p className="text-xs text-stone-500 mt-1">Retrieving calibrated scores from database</p>
      </div>
    );
  }

  if (errorMessage || !report) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h2 className="text-2xl font-bold text-stone-900 mb-2">Report Not Found</h2>
        <p className="text-sm text-stone-600 mb-6">{errorMessage || 'The requested analysis report does not exist or has expired.'}</p>
        <Link
          to="/analyze"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-lavender-600 text-white text-sm font-semibold hover:bg-lavender-700"
        >
          <span>Run New Analysis</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  const formattedDate = new Date(report.created_at).toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Demo Mode Notice if synthetic data */}
      {report.is_demo && (
        <div className="flex justify-center">
          <DemoModeBadge className="w-full sm:w-auto" />
        </div>
      )}

      {/* Report Header Card */}
      <div className="bg-white rounded-3xl border border-cream-300 p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-cream-200">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-lavender-100 text-lavender-800">
                {report.skin_type || 'Unspecified Skin Type'}
              </span>
              <span className="flex items-center gap-1 text-xs text-stone-500 font-medium">
                <Clock className="w-3.5 h-3.5" />
                <span>{formattedDate}</span>
              </span>
              <span className="text-xs text-stone-400 font-mono">
                ID: {report.report_id.slice(0, 8)}...
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
              Skin Vitality Assessment
            </h1>
            <p className="text-xs sm:text-sm text-stone-600 mt-1 max-w-2xl leading-relaxed">
              {report.summary}
            </p>
          </div>

          {/* Overall Health Score Card */}
          <div className="flex items-center gap-6 bg-cream-50 rounded-2xl p-4 border border-cream-200 self-start lg:self-auto shrink-0">
            <div>
              <span className="text-[11px] font-semibold text-stone-500 block uppercase tracking-wider">
                Overall Health Index
              </span>
              <div className="text-3xl font-black text-stone-900">
                {report.overall_score !== null ? (
                  <>
                    {report.overall_score}
                    <span className="text-sm font-normal text-stone-400"> / 100</span>
                  </>
                ) : (
                  'N/A'
                )}
              </div>
            </div>

            {report.skin_age !== null && (
              <div className="border-l border-cream-300 pl-6">
                <span className="text-[11px] font-semibold text-stone-500 block uppercase tracking-wider">
                  Skin Age
                </span>
                <div className="text-3xl font-black text-lavender-700">
                  {report.skin_age}
                  <span className="text-sm font-normal text-stone-400"> yrs</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Quick Action Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-6">
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => {
                navigate('/routine', {
                  state: {
                    skinType: report.skin_type,
                    concerns: report.metrics
                      .filter((m) => m.score !== null && m.score < 70)
                      .map((m) => m.key),
                    reportId: report.report_id,
                  },
                });
              }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-lavender-600 hover:bg-lavender-700 shadow-sm transition-all"
            >
              <BookOpen className="w-4 h-4" />
              <span>Build My Routine</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => {
                navigate('/shop', {
                  state: {
                    skinType: report.skin_type,
                    concerns: report.metrics
                      .filter((m) => m.score !== null && m.score < 70)
                      .map((m) => m.key),
                  },
                });
              }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold text-stone-700 bg-white hover:bg-cream-100 border border-cream-300 transition-colors"
            >
              <ShoppingBag className="w-4 h-4 text-stone-500" />
              <span>Explore Matched Products (₹)</span>
            </button>
          </div>

          <button
            onClick={handleSaveToJournal}
            disabled={journalSaved || journalSaving}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              journalSaved
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-white hover:bg-cream-100 text-stone-700 border border-cream-300'
            }`}
          >
            {journalSaved ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Saved to Journal</span>
              </>
            ) : journalSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-stone-500" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <BookmarkPlus className="w-4 h-4 text-stone-500" />
                <span>Save to Journal</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-stone-900 tracking-tight">
              Detailed Diagnostic Dimensions
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              Empirical scores extracted from the facial diagnostic model
            </p>
          </div>
        </div>

        {report.metrics.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {report.metrics.map((metric) => (
              <MetricCard key={metric.key} metric={metric} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-cream-300 p-8 text-center text-stone-500 text-sm">
            No specific concern metrics returned for this scan.
          </div>
        )}
      </div>

      {/* Cosmetic Disclaimer */}
      <DisclaimerBanner showPatchTest={false} />
    </div>
  );
};
