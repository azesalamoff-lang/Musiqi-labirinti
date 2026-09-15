import React, { useEffect } from 'react';
import { X, ZoomOut, Maximize2, Minimize2, Sparkles, Download } from 'lucide-react';

interface ImageLightboxModalProps {
  isOpen: boolean;
  imageUrl: string | null;
  title: string;
  subtitle?: string;
  onClose: () => void;
}

export const ImageLightboxModal: React.FC<ImageLightboxModalProps> = ({
  isOpen,
  imageUrl,
  title,
  subtitle,
  onClose
}) => {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !imageUrl) return null;

  return (
    <div 
      className="fixed inset-0 z-[100] bg-slate-950/95 backdrop-blur-2xl flex flex-col items-center justify-between p-4 sm:p-8 animate-in fade-in duration-200 select-none"
      onClick={onClose}
    >
      {/* Top Controls Bar */}
      <div 
        className="w-full max-w-6xl flex items-center justify-between gap-4 pb-4 border-b border-slate-800/80 z-10"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-300 flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h3 className="text-lg sm:text-2xl font-black text-white font-display truncate">
              {title}
            </h3>
            {subtitle && (
              <p className="text-xs sm:text-sm text-slate-400 truncate mt-0.5">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <a
            href={imageUrl}
            download={`${title.replace(/\s+/g, '_')}_logo.png`}
            onClick={(e) => e.stopPropagation()}
            className="px-3.5 py-2 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Şəkli endir"
          >
            <Download className="w-4 h-4 text-teal-400" />
            <span className="hidden sm:inline">Endir</span>
          </a>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs sm:text-sm font-black flex items-center gap-2 shadow-xl shadow-amber-500/20 transition-all hover:scale-105 active:scale-95 cursor-pointer"
            title="Geri qayıt (və ya Esc)"
          >
            <ZoomOut className="w-4 h-4 text-slate-950" />
            <span>Geri Qayıt</span>
            <X className="w-4 h-4 ml-1 opacity-70" />
          </button>
        </div>
      </div>

      {/* Main Fullscreen Image Showcase */}
      <div 
        className="flex-1 w-full max-w-6xl flex items-center justify-center py-4 relative group"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative max-h-[78vh] max-w-full flex items-center justify-center p-2 rounded-3xl bg-slate-900/60 border border-slate-700/60 shadow-2xl shadow-black/80 overflow-hidden">
          <img
            src={imageUrl}
            alt={title}
            className="max-h-[72vh] max-w-full object-contain rounded-2xl transition-transform duration-300 group-hover:scale-[1.01]"
            onClick={onClose}
            title="Klikləyərək geri qayıdın"
          />
        </div>
      </div>

      {/* Bottom Hint */}
      <div 
        className="text-center text-xs text-slate-500 flex items-center gap-2 pt-2"
        onClick={(e) => e.stopPropagation()}
      >
        <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 font-mono text-[11px] text-slate-400">ESC</span>
        <span>və ya istənilən yerə klikləyərək ekrandan çıxa bilərsiniz</span>
      </div>
    </div>
  );
};
