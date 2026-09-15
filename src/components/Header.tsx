import React from 'react';
import { TournamentStage } from '../types';
import { 
  Music, 
  Award, 
  Maximize2, 
  Minimize2, 
  Users, 
  BookOpen, 
  RotateCcw,
  Sparkles,
  Volume2
} from 'lucide-react';
import { playCorrectSound } from '../utils/soundEffects';
import { PWAInstallButton } from './PWAInstallButton';
import { InteractiveImageSlot } from './InteractiveImageSlot';

interface HeaderProps {
  currentStage: TournamentStage;
  onSelectStage: (stage: TournamentStage) => void;
  onOpenRules: () => void;
  onOpenTeams: () => void;
  onOpenSongManager: () => void;
  onResetTournament: () => void;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  onOpenLightbox: (url: string, title: string, subtitle?: string) => void;
}

const STAGES = [
  { id: 1 as TournamentStage, name: '1. Musiqi Şifrəsi', sub: '4 Kateqoriya • 30 xal' },
  { id: 2 as TournamentStage, name: '2. Vaxt Dueli', sub: 'Buzzer • 50 xal • 1 çıxır' },
  { id: 3 as TournamentStage, name: '3. Ritm Qarşıdurması', sub: 'Vaxt İddiası • 10-100 xal' },
  { id: 4 as TournamentStage, name: '4. Son Akkordlar', sub: 'Böyük Final • 60 saniyə' }
];

export const Header: React.FC<HeaderProps> = ({
  currentStage,
  onSelectStage,
  onOpenRules,
  onOpenTeams,
  onOpenSongManager,
  onResetTournament,
  isFullscreen,
  onToggleFullscreen,
  onOpenLightbox
}) => {
  return (
    <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur-md sticky top-0 z-40 px-3 lg:px-8 py-2.5 sm:py-3">
      <div className="max-w-7xl mx-auto flex flex-col gap-3">
        {/* Top Brand Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            {/* ASAN Volunteers Organization & Center Branding with interactive Logo Slot */}
            <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-2xl bg-gradient-to-r from-teal-950/50 via-slate-900 to-sky-950/40 border border-teal-500/30 shadow-sm">
              {/* Organization Logo Slot */}
              <InteractiveImageSlot
                imageKey="org_logo"
                title="ASAN Könüllüləri Təşkilatı"
                subtitle="2 saylı Sumqayıt Regional «ASAN Xidmət» Mərkəzi"
                size="md"
                shape="rounded"
                onOpenLightbox={onOpenLightbox}
                defaultIcon={
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center text-slate-950 font-black text-xs shadow-md shadow-teal-500/20">
                    <span className="tracking-tighter font-display">AK</span>
                  </div>
                }
              />

              <div className="flex flex-col text-left justify-center">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse shrink-0" />
                  <span className="text-xs font-black tracking-wide text-teal-300 font-display">
                    &ldquo;ASAN Könüllüləri&rdquo; Təşkilatı
                  </span>
                </div>
                <span className="text-[11px] font-bold text-slate-200 tracking-tight">
                  2 saylı Sumqayıt Regional &ldquo;ASAN Xidmət&rdquo; Mərkəzi
                </span>
                <span className="text-[9px] text-slate-400 font-medium">
                  18 Sentyabr &bull; Milli Musiqi Günü
                </span>
              </div>
            </div>

            <div className="hidden xl:block h-7 w-px bg-slate-800" />

            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-rose-600 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-amber-500/20 shrink-0">
                <Music className="w-5 h-5 text-slate-950" />
              </div>
              <div>
                <h1 className="text-base lg:text-xl font-black tracking-tight text-white flex items-center gap-1.5 font-display">
                  Musiqi Labirinti
                  <span className="text-[10px] sm:text-xs px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold">
                    2026
                  </span>
                </h1>
                <p className="text-[10px] text-slate-400 hidden lg:block">
                  Milli Musiqi Günü intellektual-musiqili yarışması
                </p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <PWAInstallButton />

            <button
              id="sound-test-btn"
              onClick={() => playCorrectSound()}
              title="Səs sistemini yoxla"
              className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors border border-slate-700 text-xs flex items-center gap-1.5"
            >
              <Volume2 className="w-4 h-4 text-teal-400" />
              <span className="hidden md:inline">Səs Yoxla</span>
            </button>

            <button
              id="songs-manager-btn"
              onClick={onOpenSongManager}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Music className="w-4 h-4 text-amber-400" />
              <span>Musiqilər</span>
            </button>

            <button
              id="rules-btn"
              onClick={onOpenRules}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <BookOpen className="w-4 h-4 text-amber-400" />
              <span>Qaydalar</span>
            </button>

            <button
              id="teams-btn"
              onClick={onOpenTeams}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Users className="w-4 h-4 text-sky-400" />
              <span>Komandalar</span>
            </button>

            <button
              id="fullscreen-toggle-btn"
              onClick={onToggleFullscreen}
              title={isFullscreen ? "Tam ekrandan çıx" : "Böyük Ekran / Proyektor Rejimi"}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-1 transition-colors"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4 text-indigo-400" />}
              <span className="hidden lg:inline">{isFullscreen ? 'Çıxış' : 'Proyektor'}</span>
            </button>

            <button
              id="reset-btn"
              onClick={onResetTournament}
              title="Bütün xalları və oyunu yenidən başlat"
              className="p-2 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-800/40 text-xs transition-colors flex items-center gap-1"
            >
              <RotateCcw className="w-4 h-4" />
              <span className="hidden xl:inline">Sıfırla</span>
            </button>
          </div>
        </div>

        {/* Stage Navigation Stepper */}
        <nav aria-label="Yarış mərhələləri" className="grid grid-cols-2 md:grid-cols-4 gap-2 pt-1">
          {STAGES.map((s) => {
            const isActive = currentStage === s.id;
            return (
              <button
                key={s.id}
                id={`stage-nav-tab-${s.id}`}
                onClick={() => onSelectStage(s.id)}
                className={`flex flex-col text-left px-3.5 py-2 rounded-xl transition-all border relative overflow-hidden ${
                  isActive
                    ? 'bg-gradient-to-r from-amber-500/20 via-amber-500/10 to-transparent border-amber-500/60 text-amber-200 shadow-md shadow-amber-950/40'
                    : 'bg-slate-800/40 hover:bg-slate-800/80 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {isActive && (
                  <span className="absolute left-0 top-0 bottom-0 w-1 bg-amber-400" />
                )}
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-bold font-display ${isActive ? 'text-amber-300' : 'text-slate-300'}`}>
                    {s.name}
                  </span>
                  {isActive && <Sparkles className="w-3.5 h-3.5 text-amber-400" />}
                </div>
                <span className="text-[10px] text-slate-400 font-medium truncate">
                  {s.sub}
                </span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
