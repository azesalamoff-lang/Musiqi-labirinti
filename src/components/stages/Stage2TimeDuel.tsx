import React, { useState, useEffect, useCallback } from 'react';
import { SongItem, Team } from '../../types';
import { 
  Bell, 
  Play, 
  Square, 
  CheckCircle, 
  XCircle, 
  ArrowRight, 
  Volume2, 
  Flame, 
  Lock, 
  Unlock,
  AlertTriangle,
  X,
  Sparkles
} from 'lucide-react';
import { 
  playBuzzerSound, 
  playCorrectSound, 
  playWrongSound, 
  playSongAudioOrMelody, 
  stopAllPlayback 
} from '../../utils/soundEffects';
import { InteractiveImageSlot } from '../InteractiveImageSlot';

interface Stage2TimeDuelProps {
  songs: SongItem[];
  teams: Team[];
  onAwardPoints: (songId: string, teamId: string, points: number) => void;
  onEliminateTeam: (teamId: string) => void;
  onProceedToNextStage: () => void;
  onOpenLightbox: (url: string, title: string, subtitle?: string) => void;
}

export const Stage2TimeDuel: React.FC<Stage2TimeDuelProps> = ({
  songs,
  teams,
  onAwardPoints,
  onEliminateTeam,
  onProceedToNextStage,
  onOpenLightbox
}) => {
  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [buzzedTeamId, setBuzzedTeamId] = useState<string | null>(null);
  const [lockedTeams, setLockedTeams] = useState<string[]>([]); // Teams that got it wrong on this song
  const [isRevealed, setIsRevealed] = useState(false);
  const [showEliminationModal, setShowEliminationModal] = useState(false);
  
  // 5-second Fullscreen Buzzer Screen
  const [showFullscreenBuzzer, setShowFullscreenBuzzer] = useState(false);
  const [buzzerCountdown, setBuzzerCountdown] = useState(5);

  const activeTeams = teams.filter(t => t.status === 'active');
  const currentSong = songs[currentSongIndex];

  // Handle Team Buzzer press (1, 2, 3, 4)
  const handleBuzz = useCallback((teamId: string) => {
    // Check if buzzer is already active for another team, or if this team is locked/inactive
    if (buzzedTeamId) return; 
    if (lockedTeams.includes(teamId)) return;
    const team = teams.find(t => t.id === teamId);
    if (!team || team.status !== 'active') return;

    // Immediately stop any playing music
    stopAllPlayback();
    setIsPlaying(false);

    // Play loud crisp buzzer sound
    playBuzzerSound();

    // Set active buzzed team and launch 5s fullscreen showcase
    setBuzzedTeamId(teamId);
    setBuzzerCountdown(5);
    setShowFullscreenBuzzer(true);
  }, [buzzedTeamId, lockedTeams, teams]);

  // 5-second countdown timer for fullscreen overlay
  useEffect(() => {
    if (!showFullscreenBuzzer) return;
    const timer = setInterval(() => {
      setBuzzerCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setShowFullscreenBuzzer(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [showFullscreenBuzzer]);

  // Keyboard shortcut listener for buzzers (1, 2, 3, 4)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Avoid if inside input or select
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) return;

      const team = activeTeams.find(t => t.buzzerKey === e.key);
      if (team) {
        handleBuzz(team.id);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeTeams, handleBuzz]);

  const handlePlayMusic = async () => {
    if (!currentSong) return;
    if (isPlaying) {
      stopAllPlayback();
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
      await playSongAudioOrMelody(
        currentSong.id,
        currentSong.melodyNotes,
        undefined,
        () => setIsPlaying(false)
      );
    }
  };

  const handleCorrectAnswer = () => {
    if (!buzzedTeamId || !currentSong) return;
    playCorrectSound();
    onAwardPoints(currentSong.id, buzzedTeamId, 50);
    setIsRevealed(true);
    stopAllPlayback();
    setIsPlaying(false);
    setShowFullscreenBuzzer(false);
  };

  const handleWrongAnswer = () => {
    if (!buzzedTeamId) return;
    playWrongSound();
    const newLocked = [...lockedTeams, buzzedTeamId];
    setLockedTeams(newLocked);
    setBuzzedTeamId(null); // release buzzer to other teams!
    setShowFullscreenBuzzer(false);
  };

  const handleResetBuzzers = () => {
    setBuzzedTeamId(null);
    setLockedTeams([]);
    setShowFullscreenBuzzer(false);
  };

  const handleNextSong = () => {
    stopAllPlayback();
    setIsPlaying(false);
    setBuzzedTeamId(null);
    setLockedTeams([]);
    setIsRevealed(false);
    setShowFullscreenBuzzer(false);

    if (currentSongIndex < songs.length - 1) {
      setCurrentSongIndex(prev => prev + 1);
    } else {
      // All 10 songs done, trigger elimination phase
      setShowEliminationModal(true);
    }
  };

  const buzzedTeam = teams.find(t => t.id === buzzedTeamId);

  // Determine lowest score team among active teams for elimination
  const lowestScoringTeam = [...activeTeams].sort((a, b) => a.score - b.score)[0];

  const handleConfirmElimination = (teamId: string) => {
    onEliminateTeam(teamId);
    setShowEliminationModal(false);
    onProceedToNextStage();
  };

  return (
    <div className="space-y-6">
      {/* Intro Banner */}
      <div className="bg-gradient-to-r from-amber-950/40 via-slate-900 to-rose-950/40 border border-amber-500/30 rounded-2xl p-5 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          {/* Stage 2 Logo / Image Slot */}
          <InteractiveImageSlot
            imageKey="stage_logo_2"
            title="2-ci Mərhələ: Vaxt Dueli"
            subtitle="Buzzer Döyüşü • 10 Mahnı • 50 Xal"
            size="lg"
            shape="rounded"
            onOpenLightbox={onOpenLightbox}
            defaultIcon={<Flame className="w-7 h-7 text-amber-400" />}
          />

          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-semibold mb-2 border border-amber-500/30">
              <Flame className="w-3.5 h-3.5" />
              <span>2-ci Mərhələ</span>
            </div>
            <h2 className="text-xl lg:text-2xl font-black text-white tracking-tight font-display">
              Vaxt Dueli (Buzzer Döyüşü)
            </h2>
            <p className="text-slate-300 text-xs lg:text-sm mt-1 max-w-2xl leading-relaxed">
              10 mahnı səsləndirilir. İlk zəngi/düyməni basan komanda cavab hüququ qazanır. Səhv cavab verilərsə, hüquq digər komandalara keçir. Hər düzgün cavab <strong>50 xal</strong>. Mərhələnin sonunda ən az xallı <strong>1 komanda oyunu tərk edir</strong>.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            id="open-elimination-btn"
            onClick={() => setShowEliminationModal(true)}
            className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-rose-900/40 transition-all cursor-pointer"
          >
            <AlertTriangle className="w-4 h-4" />
            <span>Mərhələni Yekunlaşdır (1 Komandanı Çıxar)</span>
          </button>
        </div>
      </div>

      {/* Song Progression Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            Mahnı Ardıcıllığı: {currentSongIndex + 1} / 10
          </span>
          <span className="text-xs text-amber-400 font-semibold">
            Düzgün cavab: +50 xal
          </span>
        </div>

        <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5">
          {songs.map((s, idx) => {
            const isCurrent = idx === currentSongIndex;
            const isDone = !!s.awardedTeamId;
            const awardedTeam = teams.find(t => t.id === s.awardedTeamId);

            return (
              <button
                key={s.id}
                id={`song-step-${idx}`}
                onClick={() => {
                  stopAllPlayback();
                  setIsPlaying(false);
                  setBuzzedTeamId(null);
                  setLockedTeams([]);
                  setIsRevealed(false);
                  setShowFullscreenBuzzer(false);
                  setCurrentSongIndex(idx);
                }}
                className={`py-2 px-1 rounded-xl text-xs font-black transition-all flex flex-col items-center border ${
                  isCurrent
                    ? 'bg-amber-500 text-slate-950 border-amber-400 ring-2 ring-amber-400/40 shadow-lg shadow-amber-500/20'
                    : isDone
                    ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                    : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <span>№ {idx + 1}</span>
                {awardedTeam && (
                  <span className="text-[9px] font-normal truncate max-w-full">
                    {awardedTeam.name.slice(0, 5)}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Duel Stage Arena */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Active Song Player, Central 1-4 Clickable Buttons & Controls */}
        <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800 rounded-3xl p-6 flex flex-col justify-between shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-lg bg-amber-500/20 text-amber-300 text-xs font-black border border-amber-500/30">
                Mahnı {currentSongIndex + 1} / 10
              </span>
              <span className="text-xs text-slate-400">
                Vaxt Dueli
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                id="reset-buzzers-btn"
                onClick={handleResetBuzzers}
                title="Bütün komandaların siqnallarını yenidən aç"
                className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-700 cursor-pointer"
              >
                <Unlock className="w-3.5 h-3.5 text-teal-400" />
                <span>Siqnalları Sıfırla</span>
              </button>
            </div>
          </div>

          {/* Central Play Controls */}
          <div className="py-6 flex flex-col items-center text-center">
            {/* Audio Wave / Visualizer */}
            <div className="relative mb-5">
              <div className={`w-32 h-32 rounded-full border-4 flex items-center justify-center transition-all ${
                isPlaying 
                  ? 'border-amber-400 bg-amber-500/20 shadow-2xl shadow-amber-500/40 scale-105'
                  : 'border-slate-800 bg-slate-850'
              }`}>
                <Volume2 className={`w-14 h-14 ${isPlaying ? 'text-amber-400 animate-bounce' : 'text-slate-600'}`} />
              </div>
            </div>

            <button
              id="stage2-play-music-btn"
              onClick={handlePlayMusic}
              className={`px-8 py-3.5 rounded-2xl font-bold text-sm flex items-center gap-3 transition-all cursor-pointer shadow-lg ${
                isPlaying
                  ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/30 ring-2 ring-rose-400'
                  : 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/30'
              }`}
            >
              {isPlaying ? (
                <>
                  <Square className="w-5 h-5 fill-current" />
                  <span>Musiqini Dayandır</span>
                </>
              ) : (
                <>
                  <Play className="w-5 h-5 fill-current" />
                  <span>Mahnını Səsləndir</span>
                </>
              )}
            </button>
          </div>

          {/* Central 1, 2, 3, 4 Clickable Action Buttons for Admin */}
          <div className="w-full my-4 p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-3">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-amber-400 animate-pulse" />
                <span className="text-xs font-bold text-slate-200 uppercase tracking-wider font-display">
                  Zəngi Basan Komandanı Seçin:
                </span>
              </div>
              <span className="text-[11px] text-amber-400 font-medium">
                Kliklədikdə 5 saniyəlik tam ekran lövhəsi açılır
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {teams.map((team, idx) => {
                const isEliminated = team.status !== 'active';
                const isLocked = lockedTeams.includes(team.id);
                const isThisBuzzed = buzzedTeamId === team.id;
                const keyNumber = team.buzzerKey || String(idx + 1);

                return (
                  <button
                    key={team.id}
                    id={`arena-team-btn-${team.id}`}
                    disabled={isEliminated || isLocked}
                    onClick={() => handleBuzz(team.id)}
                    className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all cursor-pointer relative overflow-hidden group ${
                      isThisBuzzed
                        ? 'bg-amber-500 text-slate-950 border-amber-300 ring-4 ring-amber-400 scale-[1.02] shadow-xl shadow-amber-500/40'
                        : isLocked
                        ? 'bg-rose-950/20 border-rose-800/40 text-rose-400 opacity-50 cursor-not-allowed'
                        : isEliminated
                        ? 'bg-slate-900/30 border-slate-800 opacity-40 cursor-not-allowed'
                        : 'bg-slate-800/90 hover:bg-slate-750 border-slate-700 hover:border-amber-400/80 active:scale-95 shadow-md'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-2">
                      <div
                        className="w-8 h-8 rounded-xl flex items-center justify-center font-black text-sm text-slate-950 shadow-sm"
                        style={{ backgroundColor: team.color }}
                      >
                        {keyNumber}
                      </div>
                      <span className={`text-xs font-black font-display ${isThisBuzzed ? 'text-slate-950' : 'text-amber-300'}`}>
                        {team.score} xal
                      </span>
                    </div>

                    <div className="w-full">
                      <div className={`text-xs sm:text-sm font-bold truncate font-display ${isThisBuzzed ? 'text-slate-950' : 'text-white group-hover:text-amber-300'}`}>
                        {team.name}
                      </div>
                      <div className="text-[10px] mt-0.5">
                        {isLocked ? (
                          <span className="text-rose-400 font-semibold flex items-center gap-1">
                            <Lock className="w-2.5 h-2.5" /> Kilidli (Səhv)
                          </span>
                        ) : isThisBuzzed ? (
                          <span className="text-slate-950 font-black">Cavab verir!</span>
                        ) : isEliminated ? (
                          <span className="text-slate-500">Çıxıb</span>
                        ) : (
                          <span className="text-slate-400">Bas: [ {keyNumber} ]</span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Buzzer Notice Banner on main board */}
          {buzzedTeam ? (
            <div className="bg-gradient-to-r from-amber-500/20 via-amber-500/30 to-amber-500/20 border-2 border-amber-400 rounded-2xl p-4 animate-pulse shadow-xl shadow-amber-500/20">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-slate-950 shadow-md"
                    style={{ backgroundColor: buzzedTeam.color }}
                  >
                    <Bell className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-amber-300 uppercase tracking-wider block">
                      Zəngi Birinci Basdı:
                    </span>
                    <h3 className="text-lg font-black text-white font-display">
                      {buzzedTeam.name}
                    </h3>
                  </div>
                </div>

                {/* Verdict buttons */}
                <div className="flex items-center gap-2">
                  <button
                    id="buzzer-wrong-btn"
                    onClick={handleWrongAnswer}
                    className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>Səhvdir (Digərlərinə Keçsin)</span>
                  </button>
                  <button
                    id="buzzer-correct-btn"
                    onClick={handleCorrectAnswer}
                    className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-emerald-950 transition-colors cursor-pointer"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>Düzgündür (+50 xal)</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-3.5 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
              <Bell className="w-4 h-4 text-amber-400 animate-pulse" />
              <span>Komandalar zəngi basmağa hazır olsunlar. Qısayol klaviatura: <strong>1, 2, 3, 4</strong></span>
            </div>
          )}

          {/* Reveal & Next buttons */}
          <div className="mt-4 pt-4 border-t border-slate-800 flex items-center justify-between">
            <div>
              {isRevealed ? (
                <div className="text-left">
                  <span className="text-[10px] uppercase font-bold text-emerald-400">Düzgün Cavab:</span>
                  <div className="text-sm font-black text-white font-display">
                    {currentSong?.title} &mdash; <span className="text-xs text-slate-400 font-normal">{currentSong?.artistOrComposer}</span>
                  </div>
                </div>
              ) : (
                <button
                  id="reveal-stage2-song-btn"
                  onClick={() => setIsRevealed(true)}
                  className="text-xs font-semibold text-amber-400 hover:text-amber-300 underline cursor-pointer"
                >
                  Cavabı göstər
                </button>
              )}
            </div>

            <button
              id="next-stage2-song-btn"
              onClick={handleNextSong}
              className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer"
            >
              <span>{currentSongIndex < songs.length - 1 ? 'Növbəti Mahnı' : 'Turu Bitir'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Right: Live Teams Status & Score Summary */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 flex flex-col gap-3 shadow-xl">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 font-display flex items-center gap-2">
              <Bell className="w-4 h-4 text-amber-400" />
              Komandaların Statusu
            </h3>
            <span className="text-[10px] text-slate-500">
              Klaviatura: [1, 2, 3, 4]
            </span>
          </div>

          <div className="flex flex-col gap-3">
            {teams.map((team, idx) => {
              const isEliminated = team.status !== 'active';
              const isLocked = lockedTeams.includes(team.id);
              const isThisBuzzed = buzzedTeamId === team.id;
              const keyNumber = team.buzzerKey || String(idx + 1);

              return (
                <button
                  key={team.id}
                  id={`buzzer-pad-${team.id}`}
                  disabled={isEliminated || isLocked}
                  onClick={() => handleBuzz(team.id)}
                  className={`w-full p-4 rounded-2xl text-left border transition-all flex items-center justify-between relative overflow-hidden group ${
                    isThisBuzzed
                      ? 'bg-amber-500 text-slate-950 border-amber-300 ring-4 ring-amber-400 scale-[1.02] shadow-xl shadow-amber-500/30'
                      : isLocked
                      ? 'bg-rose-950/20 border-rose-800/40 text-rose-400 opacity-60 cursor-not-allowed'
                      : isEliminated
                      ? 'bg-slate-900/30 border-slate-800 opacity-40 cursor-not-allowed'
                      : 'bg-slate-800/80 hover:bg-slate-800 border-slate-700 hover:border-amber-500/60 active:scale-95 cursor-pointer shadow-md'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center font-black text-base shrink-0 text-slate-950 shadow-md"
                      style={{ backgroundColor: team.color }}
                    >
                      {keyNumber}
                    </div>
                    <div>
                      <div className="text-sm font-bold truncate font-display">
                        {team.name}
                      </div>
                      <div className="text-[11px] opacity-75">
                        {isLocked ? (
                          <span className="flex items-center gap-1 text-rose-300 font-semibold">
                            <Lock className="w-3 h-3" /> Səhv dedi (Kilidli)
                          </span>
                        ) : isThisBuzzed ? (
                          <span className="font-black">SİQNAL VERDİ!</span>
                        ) : isEliminated ? (
                          'Oyundan çıxıb'
                        ) : (
                          'Cavab verməyə hazır'
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-sm font-black font-display">
                      {team.score} xal
                    </div>
                    {!isLocked && !isEliminated && !buzzedTeamId && (
                      <span className="text-[10px] text-amber-400 font-semibold group-hover:underline">
                        BASIN [ {keyNumber} ]
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 5-SECOND FULLSCREEN BUZZER ANNOUNCEMENT OVERLAY */}
      {showFullscreenBuzzer && buzzedTeam && (
        <div 
          id="fullscreen-buzzer-overlay"
          className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-2xl flex flex-col items-center justify-center p-6 text-center animate-in fade-in zoom-in-95 duration-200 select-none"
        >
          {/* Quick close button */}
          <button
            onClick={() => setShowFullscreenBuzzer(false)}
            className="absolute top-6 right-6 p-3 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Pəncərəni bağla (əsas lövhədə qalacaq)"
          >
            <X className="w-6 h-6" />
          </button>

          <div className="max-w-3xl w-full flex flex-col items-center">
            {/* Top Sub-title */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-teal-500/20 text-teal-300 text-xs sm:text-sm font-bold border border-teal-500/40 mb-6 shadow-sm font-display">
              <Sparkles className="w-4 h-4 text-teal-400" />
              <span>&ldquo;ASAN Könüllüləri&rdquo; &bull; 2-ci Mərhələ: Vaxt Dueli</span>
            </div>

            {/* Pulsing Team Badge */}
            <div 
              className="w-24 h-24 sm:w-32 sm:h-32 rounded-3xl flex items-center justify-center text-slate-950 font-black text-4xl sm:text-5xl shadow-2xl shadow-amber-500/30 mb-6 animate-bounce border-4 border-white/20"
              style={{ backgroundColor: buzzedTeam.color }}
            >
              <Bell className="w-14 h-14 sm:w-18 sm:h-18" />
            </div>

            {/* Huge Team Name */}
            <h1 className="text-4xl sm:text-7xl font-black text-white font-display tracking-tight mb-3 drop-shadow-lg">
              {buzzedTeam.name}
            </h1>

            {/* Answer Right Banner */}
            <div className="inline-flex items-center gap-2.5 px-6 py-2.5 rounded-full text-base sm:text-2xl font-black text-amber-300 bg-amber-500/20 border-2 border-amber-400 mb-8 shadow-xl shadow-amber-500/20">
              <span className="w-3 h-3 rounded-full bg-amber-400 animate-ping" />
              <span>ZƏNGİ BİRİNCİ BASDI &bull; CAVAB HÜQUQU!</span>
            </div>

            {/* 5-Second Circular Progress Indicator */}
            <div className="flex flex-col items-center gap-2 mb-10">
              <div className="w-20 h-20 rounded-full border-4 border-amber-400 flex items-center justify-center text-3xl font-black text-white bg-slate-900/90 shadow-2xl shadow-amber-500/30">
                {buzzerCountdown}
              </div>
              <span className="text-xs sm:text-sm text-slate-400 font-medium">
                Ekran <strong>{buzzerCountdown} saniyə</strong> sonra avtomatik əsas lövhəyə qayıdacaq
              </span>
            </div>

            {/* Quick Verdict Buttons on the Fullscreen Overlay */}
            <div className="flex flex-wrap items-center justify-center gap-4">
              <button
                id="fs-buzzer-wrong-btn"
                onClick={handleWrongAnswer}
                className="px-6 py-3.5 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm sm:text-base flex items-center gap-2 shadow-xl shadow-rose-900/50 transition-transform active:scale-95 cursor-pointer"
              >
                <XCircle className="w-5 h-5" />
                <span>Səhvdir (Digər Komandalar)</span>
              </button>

              <button
                id="fs-buzzer-correct-btn"
                onClick={handleCorrectAnswer}
                className="px-8 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm sm:text-base flex items-center gap-2.5 shadow-xl shadow-emerald-950 transition-transform active:scale-95 cursor-pointer ring-2 ring-emerald-400"
              >
                <CheckCircle className="w-5 h-5" />
                <span>Düzgündür (+50 Xal)</span>
              </button>

              <button
                id="fs-buzzer-close-btn"
                onClick={() => setShowFullscreenBuzzer(false)}
                className="px-5 py-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs sm:text-sm transition-colors cursor-pointer"
              >
                Tam Ekranı Bağla
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Elimination Modal at the end of Round 2 */}
      {showEliminationModal && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-lg rounded-3xl p-6 shadow-2xl relative text-center">
            <div className="w-14 h-14 mx-auto rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-400 flex items-center justify-center mb-4">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <h3 className="text-xl font-black text-white font-display mb-2">
              Tur 2 Yekunlaşdırılması: 1 Komanda Çıxarılır
            </h3>
            <p className="text-xs text-slate-300 mb-6 leading-relaxed">
              Qaydalara əsasən, 2-ci mərhələnin sonunda ən az xal toplamış 1 komanda oyunu tərk edir. Yarışda 3 komanda qalır.
            </p>

            {/* Teams status table */}
            <div className="bg-slate-950/60 rounded-2xl p-3 border border-slate-800 space-y-2 mb-6 text-left">
              {activeTeams
                .sort((a, b) => b.score - a.score)
                .map((team, idx) => {
                  const isLowest = team.id === lowestScoringTeam?.id;

                  return (
                    <div
                      key={team.id}
                      className={`p-3 rounded-xl border flex items-center justify-between ${
                        isLowest
                          ? 'bg-rose-950/30 border-rose-500/40 text-rose-200'
                          : 'bg-slate-800/40 border-slate-700 text-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="text-xs font-bold text-slate-400">#{idx + 1}</span>
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: team.color }}
                        />
                        <span className="text-sm font-bold font-display">{team.name}</span>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-sm font-black text-amber-300 font-display">
                          {team.score} xal
                        </span>
                        {isLowest && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                            Ən az xallı
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>

            <div className="flex items-center justify-center gap-3">
              <button
                id="cancel-elimination-btn"
                onClick={() => setShowEliminationModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                Geri qayıt
              </button>
              {lowestScoringTeam && (
                <button
                  id="confirm-elimination-btn"
                  onClick={() => handleConfirmElimination(lowestScoringTeam.id)}
                  className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg shadow-rose-900/50 cursor-pointer"
                >
                  &ldquo;{lowestScoringTeam.name}&rdquo; komandasını çıxar və 3-cü Tura Keç
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

