import React from 'react';
import { AlertCircle } from 'lucide-react';

interface DemoModeBadgeProps {
  className?: string;
}

export const DemoModeBadge: React.FC<DemoModeBadgeProps> = ({ className = '' }) => {
  return (
    <div
      className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-amber-100 border border-amber-300 text-amber-900 text-xs font-medium shadow-sm ${className}`}
    >
      <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
      <span>
        <strong>DEMO / SAMPLE MODE:</strong> This report displays synthetic demonstration data. For live YouCam analysis, configure a valid <code className="bg-amber-200/70 px-1 py-0.5 rounded text-[11px]">YOUCAM_API_KEY</code> in <code className="bg-amber-200/70 px-1 py-0.5 rounded text-[11px]">backend/.env</code>.
      </span>
    </div>
  );
};
