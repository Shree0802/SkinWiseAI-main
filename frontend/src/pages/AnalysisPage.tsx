import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Upload,
  Camera,
  CheckCircle2,
  AlertCircle,
  X,
  Sparkles,
  Sun,
  Shield,
  Loader2,
} from 'lucide-react';
import { apiClient } from '../services/apiClient';
import type { SkinAnalysisResult } from '../types';

export const AnalysisPage: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [consentGiven, setConsentGiven] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progressStep, setProgressStep] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const MAX_SIZE_MB = 10;
  const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

  // Handle file selection
  const handleFileChange = (file: File | null) => {
    setErrorMessage(null);
    if (!file) return;

    if (!ALLOWED_TYPES.includes(file.type)) {
      setErrorMessage(`Unsupported format (${file.type}). Please select a JPEG, PNG, or WebP photo.`);
      return;
    }

    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setErrorMessage(`File is too large (${(file.size / (1024 * 1024)).toFixed(1)}MB). Max allowed is ${MAX_SIZE_MB}MB.`);
      return;
    }

    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleRemoveImage = () => {
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Submit analysis
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setErrorMessage('Please select or capture a facial selfie first.');
      return;
    }
    if (!consentGiven) {
      setErrorMessage('Please review and check the image processing consent.');
      return;
    }

    setIsAnalyzing(true);
    setErrorMessage(null);

    try {
      setProgressStep('Validating image and specifications...');
      await new Promise((r) => setTimeout(r, 600));

      setProgressStep(
        isDemoMode
          ? 'Generating sample evaluation report...'
          : 'Connecting to YouCam Skin AI cloud service...'
      );

      const result: SkinAnalysisResult = await apiClient.analyzeSkin(selectedFile, isDemoMode);

      setProgressStep('Calibrating cosmetic vitality scores...');
      await new Promise((r) => setTimeout(r, 500));

      // Save report in session storage for immediate viewing and navigate
      sessionStorage.setItem('latest_skinwise_report', JSON.stringify(result));
      navigate(`/results/${result.report_id}`, { state: { report: result } });
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Analysis failed. Please check network connection or try again.');
    } finally {
      setIsAnalyzing(false);
      setProgressStep('');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <div className="text-center max-w-2xl mx-auto mb-8">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-lavender-50 text-lavender-700 text-xs font-semibold mb-3 border border-lavender-200">
          <Sparkles className="w-3.5 h-3.5" />
          <span>YouCam Skin AI Engine</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-stone-900 tracking-tight">
          Analyze Your Skin
        </h1>
        <p className="text-sm text-stone-600 mt-2">
          Upload a clear selfie to receive objective measurements for pores, wrinkles, texture, spots, and hydration.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Upload Box */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-cream-300 p-6 sm:p-8 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* File Dropzone */}
            {!previewUrl ? (
              <div
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-cream-300 hover:border-lavender-400 rounded-2xl p-8 text-center cursor-pointer transition-colors bg-cream-50/50 hover:bg-lavender-50/20 group"
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                />
                <div className="w-14 h-14 rounded-2xl bg-lavender-100 text-lavender-600 flex items-center justify-center mx-auto mb-4 group-hover:scale-105 transition-transform">
                  <Upload className="w-7 h-7" />
                </div>
                <h3 className="font-bold text-stone-800 text-base mb-1">
                  Click to upload or drag & drop
                </h3>
                <p className="text-xs text-stone-500 mb-3">
                  JPEG, PNG, or WebP &bull; Maximum file size {MAX_SIZE_MB}MB
                </p>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-cream-300 text-stone-700 shadow-2xs group-hover:bg-cream-100">
                  <Camera className="w-3.5 h-3.5" />
                  <span>Choose Photo</span>
                </span>
              </div>
            ) : (
              /* Image Preview Box */
              <div className="relative rounded-2xl overflow-hidden border border-cream-300 bg-stone-900 group">
                <img
                  src={previewUrl}
                  alt="Selfie Preview"
                  className="w-full h-80 object-cover"
                />
                <div className="absolute inset-0 bg-stone-900/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3.5 py-1.5 rounded-xl bg-white/90 text-stone-900 text-xs font-semibold hover:bg-white shadow"
                  >
                    Replace Image
                  </button>
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="p-1.5 rounded-xl bg-rose-600/90 text-white hover:bg-rose-700 shadow"
                    title="Remove"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                />
              </div>
            )}

            {/* Demo Mode Toggle Switch */}
            <div className="p-4 rounded-2xl bg-cream-100 border border-cream-300 flex items-center justify-between">
              <div>
                <label htmlFor="demo-toggle" className="text-xs font-bold text-stone-900 block cursor-pointer">
                  Demo / Sample Mode
                </label>
                <span className="text-[11px] text-stone-500 block leading-snug">
                  Run a sample diagnostic report without using live YouCam API quota.
                </span>
              </div>
              <input
                id="demo-toggle"
                type="checkbox"
                checked={isDemoMode}
                onChange={(e) => setIsDemoMode(e.target.checked)}
                className="w-4 h-4 text-lavender-600 rounded border-cream-400 focus:ring-lavender-500 cursor-pointer"
              />
            </div>

            {/* Consent Notice */}
            <div className="flex items-start gap-2.5 pt-1">
              <input
                type="checkbox"
                id="consent"
                checked={consentGiven}
                onChange={(e) => setConsentGiven(e.target.checked)}
                className="mt-0.5 w-4 h-4 text-lavender-600 rounded border-cream-400 focus:ring-lavender-500 cursor-pointer"
              />
              <label htmlFor="consent" className="text-xs text-stone-600 leading-relaxed cursor-pointer">
                I understand this analysis is solely for educational cosmetic evaluation. My facial image is transmitted securely to the server-to-server endpoint and is never stored permanently or used for model training without consent.
              </label>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{errorMessage}</span>
              </div>
            )}

            {/* Analyze Action Button */}
            <button
              type="submit"
              disabled={isAnalyzing || !selectedFile}
              className={`w-full py-3.5 px-6 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2 shadow-md transition-all ${
                isAnalyzing || !selectedFile
                  ? 'bg-stone-300 cursor-not-allowed text-stone-500'
                  : 'bg-lavender-600 hover:bg-lavender-700 shadow-lavender-600/30'
              }`}
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{progressStep || 'Analyzing skin features...'}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>{isDemoMode ? 'Generate Demo Analysis' : 'Analyze Skin with YouCam AI'}</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Column: Best Practice Guidelines */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-3xl border border-cream-300 p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-stone-900 text-base flex items-center gap-2">
              <Sun className="w-5 h-5 text-amber-500" />
              <span>For Best Analysis Accuracy</span>
            </h3>

            <ul className="space-y-3 text-xs text-stone-600 leading-relaxed">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Natural Daylight:</strong> Face a window with diffused morning or midday light. Avoid harsh yellow overhead spotlights.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Front-Facing Angle:</strong> Look straight into the lens at eye level with a neutral facial expression.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Clear Forehead & Cheeks:</strong> Pull hair back behind ears. Remove thick makeup or heavy glasses if evaluating pores and fine lines.
                </span>
              </li>
            </ul>

            <div className="pt-3 border-t border-cream-200 text-[11px] text-stone-500 flex items-center gap-2">
              <Shield className="w-4 h-4 text-lavender-600 shrink-0" />
              <span>Strict Server-to-Server security: Credentials are never exposed to browser client.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
