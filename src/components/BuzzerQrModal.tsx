import React, { useState } from 'react';
import { QrCode, X, Smartphone, Copy, Check, ExternalLink } from 'lucide-react';
import { Team } from '../types';

interface BuzzerQrModalProps {
  teams: Team[];
  onClose: () => void;
  onOpenDirectBuzzer: (teamId?: string) => void;
}

export const BuzzerQrModal: React.FC<BuzzerQrModalProps> = ({
  teams,
  onClose,
  onOpenDirectBuzzer
}) => {
  const [copied, setCopied] = useState(false);

  // Construct public URL for client buzzer mode (replace private dev origin with public shared pre origin)
  const getPublicUrl = () => {
    if (typeof window === 'undefined') return '';
    let origin = window.location.origin;
    if (origin.includes('ais-dev-')) {
      origin = origin.replace('ais-dev-', 'ais-pre-');
    }
    return `${origin}${window.location.pathname}?mode=buzzer`;
  };

  const currentUrl = getPublicUrl();

  // Generate an SVG QR code using quickchart / standard QR image or clean SVG
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(currentUrl)}&bgcolor=0f172a&color=f59e0b&margin=1`;

  const handleCopyLink = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(currentUrl).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  };

  const activeTeams = teams.filter(t => t.status === 'active' || t.status === 'finalist');

  return (
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-3xl p-6 shadow-2xl relative overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-300 flex items-center justify-center">
              <Smartphone className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-black text-white font-display">
                Komandalar üçün Canlı Zəng (Buzzer)
              </h2>
              <p className="text-xs text-slate-400">
                Komandalar öz telefonlarında bu linki açıb zəngi basırlar
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* QR Code Presentation */}
        <div className="py-6 flex flex-col items-center text-center">
          <div className="p-3 bg-slate-950 rounded-2xl border-2 border-amber-400/40 shadow-xl mb-4">
            <img
              src={qrCodeUrl}
              alt="Buzzer QR Kodu"
              className="w-48 h-48 rounded-xl object-contain"
              referrerPolicy="no-referrer"
            />
          </div>

          <p className="text-xs text-slate-300 max-w-xs font-medium">
            Komanda nümayəndələri telefonlarının kamerası ilə bu QR kodu oxudaraq zəng pultunu aça bilərlər.
          </p>

          {/* Copy link button */}
          <div className="mt-4 flex items-center gap-2 w-full max-w-sm">
            <input
              type="text"
              readOnly
              value={currentUrl}
              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 font-mono truncate"
            />
            <button
              onClick={handleCopyLink}
              className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 transition-colors shrink-0 cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Kopyalandı' : 'Kopyala'}</span>
            </button>
          </div>
        </div>

        {/* Direct Test Option on Host Device */}
        <div className="pt-4 border-t border-slate-800 space-y-2">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Bu cihazda və ya yeni pəncərədə sına:
          </span>
          <div className="grid grid-cols-2 gap-2">
            {activeTeams.map((team) => (
              <button
                key={team.id}
                onClick={() => {
                  onClose();
                  onOpenDirectBuzzer(team.id);
                }}
                className="p-2.5 rounded-xl border text-xs font-bold flex items-center justify-between transition-all hover:brightness-110 cursor-pointer"
                style={{
                  backgroundColor: `${team.color}15`,
                  borderColor: team.color,
                  color: '#fff'
                }}
              >
                <span>{team.name}</span>
                <ExternalLink className="w-3 h-3 text-slate-400" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
