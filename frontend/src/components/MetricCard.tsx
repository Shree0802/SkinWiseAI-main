import React, { useState } from 'react';
import { Eye, CheckCircle2, AlertTriangle, AlertCircle, Sparkles } from 'lucide-react';
import type { SkinMetric } from '../types';

interface MetricCardProps {
  metric: SkinMetric;
}

export const MetricCard: React.FC<MetricCardProps> = ({ metric }) => {
  const [showMask, setShowMask] = useState(false);

  // Badge coloring depending on severity
  const getSeverityBadge = () => {
    switch (metric.severity) {
      case 'Optimal':
        return {
          bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          icon: CheckCircle2,
          bar: 'bg-emerald-500',
        };
      case 'Mild Concern':
        return {
          bg: 'bg-amber-50 text-amber-700 border-amber-200',
          icon: AlertTriangle,
          bar: 'bg-amber-500',
        };
      case 'Moderate Concern':
        return {
          bg: 'bg-orange-50 text-orange-700 border-orange-200',
          icon: AlertTriangle,
          bar: 'bg-orange-500',
        };
      case 'Needs Targeted Care':
        return {
          bg: 'bg-rose-50 text-rose-700 border-rose-200',
          icon: AlertCircle,
          bar: 'bg-rose-500',
        };
      default:
        return {
          bg: 'bg-stone-50 text-stone-600 border-stone-200',
          icon: Sparkles,
          bar: 'bg-lavender-500',
        };
    }
  };

  const badge = getSeverityBadge();
  const IconComponent = badge.icon;
  const scorePercent = metric.score !== null ? Math.min(Math.max(metric.score, 0), 100) : null;

  return (
    <div className="bg-white rounded-2xl border border-cream-300 p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
      <div>
        <div className="flex items-start justify-between gap-3 mb-3">
          <div>
            <h4 className="font-semibold text-stone-900 text-base">{metric.label}</h4>
            <p className="text-xs text-stone-500 mt-0.5 leading-relaxed">{metric.explanation}</p>
          </div>
          {metric.severity && (
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border shrink-0 ${badge.bg}`}
            >
              <IconComponent className="w-3.5 h-3.5" />
              <span>{metric.severity}</span>
            </span>
          )}
        </div>

        {/* Score visualization */}
        {scorePercent !== null ? (
          <div className="mt-4">
            <div className="flex items-center justify-between text-xs mb-1.5 font-medium">
              <span className="text-stone-500">YouCam Skin Vitality Score</span>
              <span className="text-stone-900 font-bold text-sm">
                {metric.score} <span className="text-stone-400 font-normal text-xs">/ 100</span>
              </span>
            </div>
            <div className="w-full h-2.5 bg-cream-200 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ${badge.bar}`}
                style={{ width: `${scorePercent}%` }}
              />
            </div>
            {metric.raw_score !== null && (
              <div className="text-[10px] text-stone-400 mt-1">
                Raw Model Index: {metric.raw_score}
              </div>
            )}
          </div>
        ) : (
          <div className="mt-4 py-2 px-3 bg-stone-50 rounded-lg text-xs text-stone-500 border border-stone-200 italic">
            Not evaluated in this analysis pass.
          </div>
        )}
      </div>

      {/* Detection Mask preview if available from API */}
      {metric.mask_url && (
        <div className="mt-4 pt-3 border-t border-cream-200">
          <button
            onClick={() => setShowMask(!showMask)}
            className="flex items-center gap-1.5 text-xs font-semibold text-lavender-700 hover:text-lavender-800 transition-colors"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>{showMask ? 'Hide Detection Overlay' : 'View Detection Overlay'}</span>
          </button>

          {showMask && (
            <div className="mt-2 p-2 bg-stone-900 rounded-xl overflow-hidden border border-stone-800">
              <img
                src={metric.mask_url}
                alt={`${metric.label} detection overlay`}
                className="w-full h-auto max-h-48 object-contain rounded"
              />
              <p className="text-[10px] text-stone-400 text-center mt-1">
                Raw detection mask returned by YouCam API
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
