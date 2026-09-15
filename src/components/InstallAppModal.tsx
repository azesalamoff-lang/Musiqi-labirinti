import React, { useState } from 'react';
import { 
  Download, 
  Smartphone, 
  Laptop, 
  Share2, 
  Check, 
  X, 
  ExternalLink, 
  Sparkles, 
  Copy,
  ArrowUpRight,
  AlertCircle
} from 'lucide-react';
import { usePWAInstall } from '../utils/usePWAInstall';

interface InstallAppModalProps {
  onClose: () => void;
}

export const InstallAppModal: React.FC<InstallAppModalProps> = ({ onClose }) => {
  const { isInstallable, install } = usePWAInstall();
  const [activeTab, setActiveTab] = useState<'phone' | 'pc' | 'code'>('phone');
  const [copiedLink, setCopiedLink] = useState(false);

  // Check if current app is framed inside AI Studio or another iframe
  const isInIframe = typeof window !== 'undefined' && window.self !== window.top;
  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';

  const handleCopyLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(currentUrl).then(() => {
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2500);
      });
    }
  };

  const handleOpenStandalone = () => {
    window.open(currentUrl, '_blank', 'noopener,noreferrer');
  };

  const handleDirectInstall = async () => {
    if (isInstallable) {
      const success = await install();
      if (success) {
        onClose();
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-2xl rounded-3xl p-6 sm:p-8 shadow-2xl relative my-8 animate-in fade-in zoom-in-95">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center text-sm transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3.5 mb-6 pb-4 border-b border-slate-800">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center shadow-lg shadow-amber-500/10 shrink-0">
            <Download className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-white font-display">
              Tətbiqi Cihaza Quraşdırmaq (PWA)
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              &ldquo;Musiqi Labirinti&rdquo; layihəsini telefon, planşet və ya kompüterinizə ayrıca tətbiq kimi əlavə edin.
            </p>
          </div>
        </div>

        {/* Notice for iFrame Preview / Open in New Window */}
        {isInIframe && (
          <div className="mb-6 p-4 rounded-2xl bg-sky-500/10 border border-sky-500/30 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-xs font-bold text-white block">
                  Brauzer təhlükəsizlik qaydası:
                </span>
                <span className="text-[11px] text-slate-300 leading-relaxed">
                  Tətbiqi cihaza rəsmi quraşdırmaq üçün onu brauzerin ayrıca vərəqində (tab-da) açmaq lazımdır.
                </span>
              </div>
            </div>
            <button
              onClick={handleOpenStandalone}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-sky-500/20 transition-transform active:scale-95 cursor-pointer whitespace-nowrap"
            >
              <span>Ayrıca Vərəqdə Aç</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* 1-Click Install Button if supported directly */}
        {isInstallable && (
          <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-amber-500/20 via-amber-500/10 to-teal-500/20 border border-amber-500/40 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Sparkles className="w-6 h-6 text-amber-400 shrink-0 animate-pulse" />
              <div>
                <span className="text-xs font-bold text-white block">
                  Brauzeriniz birbaşa quraşdırmanı dəstəkləyir!
                </span>
                <span className="text-[11px] text-slate-300">
                  Bir kliklə telefon və ya kompüterinizin ana ekranına əlavə olunacaq.
                </span>
              </div>
            </div>
            <button
              onClick={handleDirectInstall}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/30 transition-transform active:scale-95 cursor-pointer whitespace-nowrap"
            >
              <Download className="w-4 h-4" />
              <span>Birbaşa Quraşdır</span>
            </button>
          </div>
        )}

        {/* Tab Selection */}
        <div className="flex border-b border-slate-800 gap-2 mb-6">
          <button
            onClick={() => setActiveTab('phone')}
            className={`pb-2.5 px-3 text-xs font-bold flex items-center gap-1.5 border-b-2 transition-all cursor-pointer ${
              activeTab === 'phone'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>Mobil Telefon (Android / iOS)</span>
          </button>

          <button
            onClick={() => setActiveTab('pc')}
            className={`pb-2.5 px-3 text-xs font-bold flex items-center gap-1.5 border-b-2 transition-all cursor-pointer ${
              activeTab === 'pc'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Laptop className="w-4 h-4" />
            <span>Kompüter (Chrome / Edge / Mac)</span>
          </button>

          <button
            onClick={() => setActiveTab('code')}
            className={`pb-2.5 px-3 text-xs font-bold flex items-center gap-1.5 border-b-2 transition-all cursor-pointer ${
              activeTab === 'code'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ExternalLink className="w-4 h-4" />
            <span>ZIP / GitHub Yükləmək</span>
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'phone' && (
          <div className="space-y-4 text-xs">
            {/* Android Guide */}
            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-sky-400 font-bold">
                <Smartphone className="w-4 h-4" />
                <span>Android Telefonlarda (Google Chrome / Samsung)</span>
              </div>
              <ol className="list-decimal list-inside space-y-1.5 text-slate-300 pl-1 leading-relaxed">
                <li>Linki mobil telefonda Chrome və ya Samsung Internet ilə açın.</li>
                <li>Yuxarı sağ küncdəki <strong>üç nöqtə (&vellip;)</strong> menyusuna toxunun.</li>
                <li>Menyudan <strong>&ldquo;Tətbiqi quraşdırın&rdquo;</strong> (Install app) və ya <strong>&ldquo;Ana ekrana əlavə et&rdquo;</strong> (Add to Home screen) seçin.</li>
                <li>Təsdiq etdikdən sonra telefonunuzun ana ekranında tətbiqin rəsmi loqosu yaranacaq və tam ekran şəklində işləyəcək.</li>
              </ol>
            </div>

            {/* iOS Guide */}
            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-amber-400 font-bold">
                <Share2 className="w-4 h-4" />
                <span>iPhone və iPad (Safari brauzeri)</span>
              </div>
              <ol className="list-decimal list-inside space-y-1.5 text-slate-300 pl-1 leading-relaxed">
                <li>Bu səhifəni <strong>Safari</strong> brauzerində açın.</li>
                <li>Aşağı panelin mərkəzindəki <strong>Paylaş (&ldquo;Share&rdquo; - kvadratdan yuxarı ox 📤)</strong> düyməsinə toxunun.</li>
                <li>Açılan menyunu aşağı çəkərək <strong>&ldquo;Ana ekrana əlavə et&rdquo; (&ldquo;Add to Home Screen&rdquo; ➕)</strong> bəndini seçin.</li>
                <li>Yuxarı sağda <strong>&ldquo;Əlavə et&rdquo;</strong> düyməsinə basın. Tətbiq birbaşa iOS tətbiqi kimi ekrana düşəcək!</li>
              </ol>
            </div>
          </div>
        )}

        {activeTab === 'pc' && (
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-teal-400 font-bold">
                <Laptop className="w-4 h-4" />
                <span>Google Chrome / Microsoft Edge (Windows və macOS)</span>
              </div>
              <ol className="list-decimal list-inside space-y-2 text-slate-300 pl-1 leading-relaxed">
                <li>
                  Saytı brauzerdə açın. Ünvan sətrinin sağ tərəfindəki <strong>kompüter və ya ox işarəsinə (&ldquo;Tətbiqi quraşdırın&rdquo;)</strong> klikləyin.
                </li>
                <li>
                  Və ya brauzerin menyusundan (üç nöqtə) ➔ <strong>&ldquo;Yadda saxla və paylaş&rdquo;</strong> ➔ <strong>&ldquo;Səhifəni tətbiq kimi quraşdırın&rdquo;</strong> seçin.
                </li>
                <li>
                  Tətbiq masaüstünüzdə ayrıca proqram pəncərəsi şəklində işə düşəcək və brauzer çərçivələri olmadan təmiz tam ekran işləyəcək.
                </li>
              </ol>
            </div>
          </div>
        )}

        {activeTab === 'code' && (
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-indigo-400 font-bold">
                <ExternalLink className="w-4 h-4" />
                <span>Layihə Kodunu Yükləmək (ZIP / GitHub)</span>
              </div>
              <p className="text-slate-300 leading-relaxed">
                Əgər tətbiqin bütün kodlarını (React + Vite + Tailwind + TypeScript) öz kompüterinizə yükləmək istəyirsinizsə:
              </p>
              <ul className="list-disc list-inside space-y-1.5 text-slate-300 pl-1 leading-relaxed">
                <li>Google AI Studio ekranının yuxarı sağındakı <strong>Settings menyusuna</strong> daxil olun.</li>
                <li><strong>&ldquo;Download ZIP&rdquo;</strong> və ya <strong>&ldquo;Export to GitHub&rdquo;</strong> seçimini klikləyin.</li>
                <li>Kompüterinizdə qovluqda <code>npm install</code> və <code>npm run dev</code> yazaraq dərhal işə sala bilərsiniz.</li>
              </ul>
            </div>
          </div>
        )}

        {/* Share Link Banner */}
        <div className="mt-6 pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-400">
            Tətbiqi digər cihazlarda açmaq üçün birbaşa keçid linki:
          </div>
          <button
            onClick={handleCopyLink}
            className="w-full sm:w-auto px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center justify-center gap-2 border border-slate-700 transition-colors cursor-pointer"
          >
            {copiedLink ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-300">Link kopyalandı!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-amber-400" />
                <span>Linki Kopyala</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

