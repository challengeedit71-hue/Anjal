import React, { useState, useRef } from 'react';
import {
  ArrowLeft,
  Camera,
  Upload,
  Sparkles,
  Zap,
  Copy,
  Check,
  RefreshCw,
  Image as ImageIcon,
  Volume2,
} from 'lucide-react';
import { MarkdownRenderer } from './MarkdownRenderer';

interface VisualLensScreenProps {
  onBack: () => void;
  onSpeak: (text: string) => void;
}

export const VisualLensScreen: React.FC<VisualLensScreenProps> = ({
  onBack,
  onSpeak,
}) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string>('image/jpeg');
  const [prompt, setPrompt] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const samplePresets = [
    'Analyze this image in detail and list key components.',
    'Extract all readable text, formulas, or numbers from this image.',
    'Explain the concept, diagram, or problem shown here step-by-step.',
    'What objects, colors, and contextual relationships are present?',
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file.');
      return;
    }

    setMimeType(file.type);
    setError(null);
    setAnalysisResult(null);

    const reader = new FileReader();
    reader.onload = () => {
      setSelectedImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleAnalyze = async (customPrompt?: string) => {
    if (!selectedImage) {
      setError('Please select or capture an image first.');
      return;
    }

    const questionText = (customPrompt || prompt).trim() || 'Analyze this image and describe everything you observe with key takeaways.';
    setIsAnalyzing(true);
    setError(null);

    try {
      const response = await fetch('/api/vision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageData: selectedImage,
          mimeType,
          prompt: questionText,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || `Server responded with status ${response.status}`);
      }

      const data = await response.json();
      setAnalysisResult(data.text);
    } catch (err: any) {
      console.error('Vision analysis error:', err);
      setError(err?.message || 'Multimodal vision analysis failed. Ensure GEMINI_API_KEY is configured.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleCopy = () => {
    if (!analysisResult) return;
    navigator.clipboard.writeText(analysisResult);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col min-h-full pb-24 pt-3 px-4 max-w-lg mx-auto select-none">
      {/* Top Navigation */}
      <div className="flex items-center space-x-3 pb-3 border-b border-white/10">
        <button
          onClick={onBack}
          className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white transition-colors"
          aria-label="Back"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-lg font-bold text-white tracking-wide uppercase flex items-center space-x-2">
            <span>Visual Lens</span>
            <span className="px-1.5 py-0.5 rounded text-[10px] bg-red-500/20 text-red-400 border border-red-500/30">
              Multimodal
            </span>
          </h1>
          <p className="text-xs text-slate-400">Computer vision powered by Gemini 3.8</p>
        </div>
      </div>

      {/* Hidden file inputs for camera and gallery */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Image Preview or Capture Target Zone */}
      <div className="my-4">
        {selectedImage ? (
          <div className="relative rounded-2xl overflow-hidden border border-red-500/30 bg-black/60 shadow-lg">
            <img
              src={selectedImage}
              alt="Uploaded Preview"
              className="w-full max-h-72 object-contain bg-black/40"
            />
            {/* Holographic targeting reticle overlay */}
            <div className="absolute inset-0 pointer-events-none border border-red-500/20 m-2 rounded-xl">
              <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-red-500" />
              <div className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-red-500" />
              <div className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-red-500" />
              <div className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-red-500" />
            </div>

            {/* Quick re-select buttons */}
            <div className="absolute top-3 right-3 flex items-center space-x-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur border border-white/20 text-xs text-white hover:bg-black transition-colors"
              >
                Change
              </button>
            </div>
          </div>
        ) : (
          <div className="p-8 rounded-2xl border-2 border-dashed border-white/15 bg-[#12121c] flex flex-col items-center justify-center text-center">
            <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-500 mb-3 shadow-[0_0_15px_rgba(255,30,56,0.25)]">
              <Camera className="w-7 h-7" />
            </div>
            <h3 className="text-sm font-semibold text-white mb-1">
              Select or Capture Image
            </h3>
            <p className="text-xs text-slate-400 mb-4 max-w-xs">
              Take a snapshot with your device camera or upload a photo to analyze text, objects, and visual concepts.
            </p>

            <div className="flex items-center space-x-3">
              <button
                onClick={() => cameraInputRef.current?.click()}
                className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-semibold shadow-md active:scale-95 transition-all"
              >
                <Camera className="w-4 h-4" />
                <span>Open Camera</span>
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold border border-white/10 active:scale-95 transition-all"
              >
                <Upload className="w-4 h-4" />
                <span>Gallery</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Preset Question Chips */}
      {selectedImage && (
        <div className="mb-4">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
            Suggested Analysis
          </label>
          <div className="space-y-1.5">
            {samplePresets.map((preset, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setPrompt(preset);
                  handleAnalyze(preset);
                }}
                disabled={isAnalyzing}
                className="w-full text-left text-xs p-2.5 rounded-xl bg-[#14141e] border border-white/5 hover:border-red-500/40 text-slate-300 hover:text-white transition-all flex items-center justify-between group"
              >
                <span className="truncate pr-2">{preset}</span>
                <Sparkles className="w-3.5 h-3.5 text-red-400 shrink-0 opacity-70 group-hover:opacity-100" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Prompt Input Form */}
      {selectedImage && (
        <div className="mb-4">
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Ask custom question about this image..."
              className="flex-1 bg-[#14141e] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
            />
            <button
              onClick={() => handleAnalyze()}
              disabled={isAnalyzing}
              className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 disabled:opacity-40 text-white text-xs font-semibold flex items-center space-x-1.5 shadow-md active:scale-95 transition-all"
            >
              {isAnalyzing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Scanning...</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  <span>Analyze</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 rounded-xl bg-red-950/40 border border-red-500/40 text-red-300 text-xs">
          {error}
        </div>
      )}

      {/* Analysis Result Display */}
      {analysisResult && (
        <div className="p-4 rounded-2xl bg-[#14141e] border border-red-500/25 shadow-lg">
          <div className="flex items-center justify-between pb-3 border-b border-white/5 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-red-400 flex items-center space-x-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Multimodal Vision Insights</span>
            </span>
            <div className="flex items-center space-x-1.5">
              <button
                onClick={() => onSpeak(analysisResult)}
                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
                title="Read aloud"
              >
                <Volume2 className="w-4 h-4" />
              </button>
              <button
                onClick={handleCopy}
                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
                title="Copy text"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <div className="text-xs text-slate-200">
            <MarkdownRenderer content={analysisResult} />
          </div>
        </div>
      )}
    </div>
  );
};
