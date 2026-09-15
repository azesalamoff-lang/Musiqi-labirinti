import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Team } from '../types';
import { Trophy, Crown, Sparkles, Award, RotateCcw, X } from 'lucide-react';
import { playVictoryFanfare } from '../utils/soundEffects';
import { useConfirm } from './ConfirmDialog';

interface GrandWinnerModalProps {
  winner: Team;
  runnerUp?: Team;
  onClose: () => void;
  onResetTournament: () => void;
}

export const GrandWinnerModal: React.FC<GrandWinnerModalProps> = ({
  winner,
  runnerUp,
  onClose,
  onResetTournament
}) => {
  const confirm = useConfirm();

  useEffect(() => {
    playVictoryFanfare();

    // Trigger confetti cannon
    const duration = 3.5 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

    const interval: NodeJS.Timeout = setInterval(() => {
      const timeLeft = animationEnd - Date.now();
      if (timeLeft <= 0) {
        return clearInterval(interval);
      }
      const particleCount = 50 * (timeLeft / duration);
      confetti({ ...defaults, particleCount, origin: { x: 0.2, y: 0.6 } });
      confetti({ ...defaults, particleCount, origin: { x: 0.8, y: 0.6 } });
    }, 250);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-gradient-to-b from-slate-900 to-slate-950 border-2 border-amber-400/80 w-full max-w-2xl rounded-3xl p-6 sm:p-8 shadow-2xl relative text-center overflow-hidden animate-in fade-in zoom-in-95">
        {/* Glow Effects */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center text-sm transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Big Golden Trophy */}
        <div className="relative inline-block mb-4">
          <div className="w-24 h-24 sm:w-28 sm:h-28 mx-auto rounded-3xl bg-gradient-to-tr from-amber-600 via-amber-400 to-yellow-200 p-0.5 shadow-2xl shadow-amber-500/40 flex items-center justify-center">
            <div className="w-full h-full bg-slate-950 rounded-[22px] flex items-center justify-center">
              <Trophy className="w-12 h-12 sm:w-16 sm:h-16 text-amber-400 animate-bounce" />
            </div>
          </div>
          <Crown className="w-8 h-8 text-amber-300 absolute -top-3 -right-2 transform rotate-12 drop-shadow-md" />
        </div>

        {/* Title */}
        <div className="space-y-1 mb-6">
          <span className="text-xs font-black uppercase tracking-widest text-amber-400 flex items-center justify-center gap-1.5">
            <Sparkles className="w-4 h-4" />
            Musiqi Labirinti • Qalib Komanda
            <Sparkles className="w-4 h-4" />
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight font-display">
            {winner.name}
          </h2>
          <p className="text-xs text-slate-400">
            2 saylı Sumqayıt regional &ldquo;ASAN Xidmət&rdquo; mərkəzinin Milli Musiqi Günü kubokunun qalibi!
          </p>
        </div>

        {/* Winner Statistics Card */}
        <div className="bg-slate-900/80 border border-amber-500/30 rounded-2xl p-5 mb-6 text-left space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-400" />
              <span className="text-xs font-bold text-slate-300">Komanda Heyəti:</span>
            </div>
            <div className="text-lg font-black text-amber-300 font-display">
              {winner.score} Ümumi Xal
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {winner.members.map((m, i) => (
              <div key={m.id} className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60 text-center">
                <span className="text-[10px] text-amber-400/80 block font-semibold">
                  {m.role || `Üzv ${i + 1}`}
                </span>
                <span className="text-xs font-bold text-white truncate block">
                  {m.name}
                </span>
              </div>
            ))}
          </div>

          {runnerUp && (
            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
              <span>Finalist / 2-ci yer:</span>
              <strong className="text-slate-200 font-display">{runnerUp.name} ({runnerUp.score} xal)</strong>
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors"
          >
            Nəticələrə Baxış
          </button>

          <button
            onClick={async () => {
              const ok = await confirm({
                title: 'Yeni turnir başlat',
                message: 'Yeni yarışma başlamaq istəyirsiniz? Bütün xallar sıfırlanacaq.',
                confirmLabel: 'Bəli, başlat',
                cancelLabel: 'İmtina'
              });
              if (ok) {
                onResetTournament();
                onClose();
              }
            }}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-black flex items-center gap-1.5 shadow-lg shadow-amber-500/25 transition-all cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Yeni Turnir Başlat</span>
          </button>
        </div>
      </div>
    </div>
  );
};
