import React, { useState, useEffect, useCallback } from 'react';
import { SongItem, Team } from '../../types';
import { 
  Play, 
  Square, 
  CheckCircle, 
  HelpCircle, 
  Sparkles, 
  ArrowRight,
  Disc3,
  Award,
  Bell,
  X,
  XCircle
} from 'lucide-react';
import { 
  playSongAudioOrMelody, 
  stopAllPlayback, 
  playCorrectSound, 
  playWrongSound,
  playBuzzerSound 
} from '../../utils/soundEffects';
import { InteractiveImageSlot } from '../InteractiveImageSlot';

interface Stage1MusicCipherProps {
  songs: SongItem[];
  teams: Team[];
  onAwardPoints: (songId: string, teamId: string, points: number) => void;
  onProceedToNextStage: () => void;
  onOpenLightbox: (url: string, title: string, subtitle?: string) => void;
}

export const Stage1MusicCipher: React.FC<Stage1MusicCipherProps> = ({
  songs,
  teams,
  onAwardPoints,
  onProceedToNextStage,
  onOpenLightbox
}) => {
  const [activeSong, setActiveSong] = useState<SongItem | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeNoteIdx, setActiveNoteIdx] = useState<number | null>(null);
  const [isRevealed, setIsRevealed] = useState(false);
  const [selectedTeamId, setSelectedTeamId] = useState<string>(teams[0]?.id || '');

  // 5-second Fullscreen Buzzer Screen
  const [buzzedTeamId, setBuzzedTeamId] = useState<string | null>(null);
  const [showFullscreenBuzzer, setShowFullscreenBuzzer] = useState(false);
  const [buzzerCountdown, setBuzzerCountdown] = useState(5);

  // Handle Team Buzzer press (1, 2, 3, 4)
  const handleBuzz = useCallback((teamId: string) => {
    const team = teams.find(t => t.id === teamId);
    if (!team || team.status !== 'active') return;

    // Immediately stop any playing music
    stopAllPlayback();
    setIsPlaying(false);
    setActiveNoteIdx(null);

    // Play loud bright buzzer sound
    playBuzzerSound();

    // Select team automatically and open 5s fullscreen overlay
    setSelectedTeamId(teamId);
    setBuzzedTeamId(teamId);
    setBuzzerCountdown(5);
    setShowFullscreenBuzzer(true);
  }, [teams]);

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
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) return;
      const team = teams.find(t => t.buzzerKey === e.key && t.status === 'active');
      if (team) {
        handleBuzz(team.id);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [teams, handleBuzz]);

  // 4 canonical default categories, plus any custom categories from songs
  const defaultCategories = ['Retro mahnılar', '90-cı illər', 'Kino musiqiləri', 'Xalq mahnıları'];
  const categories = Array.from(
    new Set([...defaultCategories, ...songs.map(s => (s.category === '80-ci illər' ? 'Retro mahnılar' : s.category)).filter(Boolean)])
  ) as string[];

  const handleOpenSong = (song: SongItem) => {
    stopAllPlayback();
    setIsPlaying(false);
    setActiveNoteIdx(null);
    setIsRevealed(!!song.revealed);
    setActiveSong(song);
  };

  const handlePlayMusic = async () => {
    if (!activeSong) return;
    if (isPlaying) {
      stopAllPlayback();
      setIsPlaying(false);
      setActiveNoteIdx(null);
    } else {
      setIsPlaying(true);
      await playSongAudioOrMelody(
        activeSong.id,
        activeSong.melodyNotes,
        (idx) => setActiveNoteIdx(idx),
        () => {
          setIsPlaying(false);
          setActiveNoteIdx(null);
        }
      );
    }
  };

  const handleAward = (targetTeamId?: string) => {
    const teamToAward = targetTeamId || selectedTeamId;
    if (!activeSong || !teamToAward) return;
    playCorrectSound();
    onAwardPoints(activeSong.id, teamToAward, 30);
    setIsRevealed(true);
    setShowFullscreenBuzzer(false);
  };

  const handleWrong = () => {
    playWrongSound();
    setShowFullscreenBuzzer(false);
  };

  const totalAnswered = songs.filter(s => s.awardedTeamId).length;
  const buzzedTeam = teams.find(t => t.id === buzzedTeamId);

  return (
    <div className="space-y-6">
      {/* Intro Banner */}
      <div className="bg-gradient-to-r from-teal-900/40 via-slate-900 to-indigo-950/40 border border-teal-500/30 rounded-2xl p-5 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          {/* Stage 1 Logo / Image Slot */}
          <InteractiveImageSlot
            imageKey="stage_logo_1"
            title="1-ci Mərhələ: Musiqi Şifrəsi"
            subtitle="4 Kateqoriya • 16 Mahnı • 30 Xal"
            size="lg"
            shape="rounded"
            onOpenLightbox={onOpenLightbox}
            defaultIcon={<Sparkles className="w-7 h-7 text-teal-400" />}
          />

          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-semibold mb-2 border border-teal-500/30">
              <Sparkles className="w-3.5 h-3.5" />
              <span>1-ci Mərhələ</span>
            </div>
            <h2 className="text-xl lg:text-2xl font-black text-white tracking-tight font-display">
              Musiqi Şifrəsi
            </h2>
            <p className="text-slate-300 text-xs lg:text-sm mt-1 max-w-2xl leading-relaxed">
              4 kateqoriya üzrə hər birində 4 mahnı (cəmi 16 mahnı). Komandalar nömrə seçir, musiqini dinləyir və tapır. Hər düzgün cavab <strong>30 xal</strong> gətirir. Bu mərhələnin sonunda bütün 4 komanda növbəti tura keçir!
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 bg-slate-900/80 px-4 py-3 rounded-xl border border-slate-800 shrink-0">
          <div className="text-center">
            <span className="text-xs text-slate-400 block">Tapılan Mahnılar</span>
            <span className="text-2xl font-black text-amber-300 font-display">
              {totalAnswered} <span className="text-xs text-slate-500 font-normal">/ 16</span>
            </span>
          </div>
          <button
            id="proceed-to-stage2-btn"
            onClick={onProceedToNextStage}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
          >
            <span>2-ci Tura Keç</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 4x4 Grid Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {categories.map((category) => {
          const categorySongs = songs.filter(s => s.category === category || (category === 'Retro mahnılar' && s.category === '80-ci illər'));

          return (
            <div
              key={category}
              className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-col gap-3 shadow-md"
            >
              {/* Category Header with Interactive Logo Slot */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-2.5 gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <InteractiveImageSlot
                    imageKey={`cat_logo_${category}`}
                    title={`Kateqoriya: ${category}`}
                    subtitle="1-ci Tur • Musiqi Şifrəsi"
                    size="sm"
                    shape="rounded"
                    onOpenLightbox={onOpenLightbox}
                    defaultIcon={<Disc3 className="w-4 h-4 text-amber-400 animate-spin-slow" />}
                  />
                  <h3 className="font-bold text-sm text-slate-200 font-display truncate">
                    {category}
                  </h3>
                </div>
                <span className="text-[10px] font-bold text-slate-400 bg-slate-800 px-2 py-0.5 rounded-md shrink-0">
                  30 xal
                </span>
              </div>

              {/* Songs Cards in Category */}
              <div className="grid grid-cols-1 gap-2.5">
                {categorySongs.length === 0 ? (
                  <div className="text-center py-6 text-slate-500 text-xs italic">
                    Bu kateqoriyada mahnı yoxdur
                  </div>
                ) : (
                  categorySongs
                    .slice()
                    .sort((a, b) => (a.numberInRound || 0) - (b.numberInRound || 0))
                    .map((song, idx) => {
                      const num = song.numberInRound || (idx + 1);
                      const isAnswered = !!song.awardedTeamId;
                      const awardedTeam = teams.find(t => t.id === song.awardedTeamId);

                      return (
                        <button
                          key={song.id}
                          id={`song-card-${song.id}`}
                          onClick={() => handleOpenSong(song)}
                          className={`w-full text-left p-3 rounded-xl transition-all border flex items-center justify-between gap-3 group relative overflow-hidden ${
                            isAnswered
                              ? 'bg-slate-900/40 border-slate-800/80 hover:border-slate-700'
                              : 'bg-slate-800/60 hover:bg-slate-800 border-slate-700/80 hover:border-amber-500/60 hover:shadow-lg hover:shadow-amber-500/10'
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm shrink-0 transition-colors ${
                              isAnswered
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                : 'bg-amber-500/15 text-amber-300 border border-amber-500/30 group-hover:bg-amber-500 group-hover:text-slate-950'
                            }`}>
                              {isAnswered ? <CheckCircle className="w-4 h-4" /> : num}
                            </div>

                            <div className="min-w-0">
                              <div className="text-xs font-bold text-slate-200 truncate">
                                {isAnswered ? song.title : `Mahnı № ${num}`}
                              </div>
                              <div className="text-[10px] text-slate-400 truncate">
                                {isAnswered ? song.artistOrComposer : 'Mahnını dinlə və tap'}
                              </div>
                            </div>
                          </div>

                          {/* Right Tag */}
                          <div className="shrink-0 text-right">
                            {isAnswered && awardedTeam ? (
                              <span 
                                className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-md text-slate-950"
                                style={{ backgroundColor: awardedTeam.color }}
                              >
                                {awardedTeam.name}
                              </span>
                            ) : (
                              <span className="text-[11px] font-bold text-amber-400/80 group-hover:text-amber-300">
                                +30 xal
                              </span>
                            )}
                          </div>
                        </button>
                      );
                    })
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Active Song Modal Dialog */}
      {activeSong && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-xl rounded-3xl p-6 shadow-2xl relative overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Background Glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <span className="px-2.5 py-1 rounded-lg bg-teal-500/20 text-teal-300 border border-teal-500/30 text-xs font-bold">
                  {activeSong.category === '80-ci illər' ? 'Retro mahnılar' : activeSong.category}
                </span>
                <span className="text-xs font-semibold text-slate-400">
                  Mahnı № {activeSong.numberInRound}
                </span>
              </div>
              <button
                id="close-modal-btn"
                onClick={() => {
                  stopAllPlayback();
                  setIsPlaying(false);
                  setActiveSong(null);
                }}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center text-sm transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Center Music Player Stage */}
            <div className="py-6 flex flex-col items-center text-center">
              {/* Animated Vinyl / Sound Visualizer */}
              <div className="relative mb-6">
                <div className={`w-32 h-32 rounded-full border-4 flex items-center justify-center transition-all ${
                  isPlaying 
                    ? 'border-amber-400 bg-amber-500/20 shadow-xl shadow-amber-500/30 scale-105 animate-pulse'
                    : 'border-slate-700 bg-slate-800'
                }`}>
                  <Disc3 className={`w-16 h-16 ${isPlaying ? 'text-amber-400 animate-spin-slow' : 'text-slate-500'}`} />
                </div>
                
                {/* Note wave indicators */}
                {isPlaying && (
                  <div className="absolute -bottom-2 flex items-center gap-1">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                      <span
                        key={i}
                        className="w-1.5 bg-amber-400 rounded-full animate-bounce"
                        style={{
                          height: `${12 + (i % 3) * 10}px`,
                          animationDelay: `${i * 120}ms`
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Music Player Button */}
              <button
                id="toggle-music-play-btn"
                onClick={handlePlayMusic}
                className={`px-6 py-3 rounded-2xl font-bold text-sm flex items-center gap-3 transition-all cursor-pointer shadow-lg ${
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
                    <span>Musiqini Səsləndir (Dinlə)</span>
                  </>
                )}
              </button>

              <p className="text-xs text-slate-400 mt-2">
                {isPlaying ? 'Mahnının melodiyası səslənir...' : 'Musiqini ifa etmək üçün düyməyə basın'}
              </p>

              {/* 4 Clickable Buzzer Buttons (1, 2, 3, 4) in Modal */}
              <div className="w-full mt-5 pt-4 border-t border-slate-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                    <Bell className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                    <span>Zəng Düymələri (Klaviatura: 1, 2, 3, 4)</span>
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Aparıcı klikləyə və ya 1-4 basa bilər
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {teams.map((team, idx) => {
                    const isSelected = selectedTeamId === team.id;
                    const isBuzzed = buzzedTeamId === team.id;

                    return (
                      <button
                        key={team.id}
                        id={`stage1-buzzer-btn-${idx + 1}`}
                        onClick={() => handleBuzz(team.id)}
                        className={`relative p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all cursor-pointer select-none active:scale-95 ${
                          isBuzzed
                            ? 'bg-amber-500 text-slate-950 border-amber-300 ring-4 ring-amber-400/40 shadow-lg shadow-amber-500/50 scale-105'
                            : isSelected
                            ? 'bg-slate-800 border-amber-400 text-white shadow-md'
                            : 'bg-slate-900/90 hover:bg-slate-800 border-slate-700 text-slate-200'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 w-full justify-center">
                          <span className={`w-5 h-5 rounded-md font-black text-xs flex items-center justify-center shrink-0 ${
                            isBuzzed
                              ? 'bg-slate-950 text-amber-400'
                              : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          }`}>
                            {idx + 1}
                          </span>
                          <span className="text-xs font-bold truncate max-w-[90px]">
                            {team.name}
                          </span>
                        </div>
                        <span className={`text-[10px] font-semibold ${isBuzzed ? 'text-slate-900 font-black' : 'text-slate-400'}`}>
                          {team.score} Xal
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Answer Section */}
            <div className="bg-slate-950/60 rounded-2xl p-4 border border-slate-800 space-y-4">
              {!isRevealed ? (
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs text-slate-400 block font-medium">Cavab gizlidir</span>
                    <span className="text-sm font-bold text-slate-300">Tapmaq üçün komandalara vaxt verin</span>
                  </div>
                  <button
                    id="reveal-answer-btn"
                    onClick={() => setIsRevealed(true)}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 text-xs font-bold transition-colors cursor-pointer"
                  >
                    Cavabı Göstər
                  </button>
                </div>
              ) : (
                <div className="bg-gradient-to-r from-emerald-950/40 to-slate-900 border border-emerald-500/30 rounded-xl p-3.5 flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">
                      Düzgün Cavab:
                    </span>
                    <h4 className="text-base font-black text-white font-display">
                      {activeSong.title}
                    </h4>
                    <p className="text-xs text-emerald-200/80">
                      {activeSong.artistOrComposer} {activeSong.year ? `(${activeSong.year})` : ''}
                    </p>
                  </div>
                  <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30 shrink-0">
                    +30 Xal
                  </span>
                </div>
              )}

              {/* Awarding Team Controls */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-slate-800">
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <label htmlFor="team-select-award" className="text-xs font-medium text-slate-400 shrink-0">
                    Xalı qazanan komanda:
                  </label>
                  <select
                    id="team-select-award"
                    value={selectedTeamId}
                    onChange={(e) => setSelectedTeamId(e.target.value)}
                    className="bg-slate-800 border border-slate-700 rounded-lg text-xs text-white px-3 py-1.5 font-bold focus:outline-none focus:ring-1 focus:ring-amber-400 w-full sm:w-auto"
                  >
                    {teams.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  <button
                    id="wrong-answer-btn"
                    onClick={handleWrong}
                    title="Səhv cavab siqnalı ver"
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-rose-950/60 text-rose-300 border border-slate-700 text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Səhv
                  </button>

                  <button
                    id="award-30-points-btn"
                    onClick={() => handleAward()}
                    className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-900/40 transition-colors cursor-pointer"
                  >
                    <Award className="w-4 h-4" />
                    <span>+30 Xal Ver</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5-Second Fullscreen Buzzer Announcement Overlay */}
      {showFullscreenBuzzer && buzzedTeam && (
        <div
          id="stage1-fullscreen-buzzer-overlay"
          className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-md flex flex-col items-center justify-between p-6 sm:p-12 animate-in fade-in duration-200"
        >
          {/* Top Bar */}
          <div className="w-full max-w-4xl flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-black tracking-wider uppercase">
                1-ci Tur • Musiqi Şifrəsi
              </span>
              <span className="text-xs text-slate-400">
                Klaviatura Düyməsi: <strong>{buzzedTeam.buzzerKey}</strong>
              </span>
            </div>

            {/* Countdown Badge */}
            <div className="flex items-center gap-2 bg-slate-900 px-4 py-2 rounded-2xl border border-amber-500/40 shadow-inner">
              <span className="text-xs text-slate-400 font-semibold">Bağlanmağa qaldı:</span>
              <span className="w-7 h-7 rounded-full bg-amber-500 text-slate-950 font-black text-sm flex items-center justify-center animate-pulse">
                {buzzerCountdown}
              </span>
            </div>
          </div>

          {/* Centerpiece: Huge Team Announcement */}
          <div className="flex flex-col items-center justify-center text-center my-auto max-w-3xl space-y-6">
            <div
              className="w-28 h-28 sm:w-36 sm:h-36 rounded-3xl flex items-center justify-center shadow-2xl border-4 animate-bounce"
              style={{
                backgroundColor: `${buzzedTeam.color}25`,
                borderColor: buzzedTeam.color,
                boxShadow: `0 0 60px ${buzzedTeam.color}60`
              }}
            >
              <Bell
                className="w-14 h-14 sm:w-20 sm:h-20"
                style={{ color: buzzedTeam.color }}
              />
            </div>

            <div className="space-y-3">
              <span
                className="inline-block px-5 py-2 rounded-full text-xs sm:text-sm font-black tracking-widest uppercase border shadow-md"
                style={{
                  backgroundColor: `${buzzedTeam.color}20`,
                  borderColor: `${buzzedTeam.color}60`,
                  color: buzzedTeam.color
                }}
              >
                ZƏNGİ BİRİNCİ BASDI • CAVAB HÜQUQU!
              </span>

              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white font-display tracking-tight drop-shadow-lg">
                {buzzedTeam.name}
              </h1>

              <p className="text-slate-300 text-sm sm:text-base font-semibold max-w-lg mx-auto">
                Cari Xal: <strong className="text-amber-400">{buzzedTeam.score}</strong> • Komanda nömrəsi: <strong className="text-amber-300">№{buzzedTeam.buzzerKey}</strong>
              </p>
            </div>
          </div>

          {/* Host Quick Verdict Actions */}
          <div className="w-full max-w-2xl bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-2xl">
            <div className="text-center sm:text-left">
              <span className="text-xs text-slate-400 block">Aparıcı üçün tez qərar:</span>
              <span className="text-sm font-bold text-slate-200">
                {activeSong ? `"${activeSong.title}" üçün xal verilsin?` : 'Cavab statusu'}
              </span>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
              <button
                id="stage1-buzzer-overlay-wrong-btn"
                onClick={handleWrong}
                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-rose-950/70 text-rose-300 border border-slate-700 hover:border-rose-500/50 text-xs font-bold transition-all cursor-pointer"
              >
                Səhvdir
              </button>

              {activeSong && (
                <button
                  id="stage1-buzzer-overlay-correct-btn"
                  onClick={() => handleAward(buzzedTeam.id)}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white text-xs font-black flex items-center gap-2 shadow-lg shadow-emerald-950/60 transition-all cursor-pointer"
                >
                  <Award className="w-4 h-4" />
                  <span>Düzgündür (+30 Xal)</span>
                </button>
              )}

              <button
                id="stage1-buzzer-overlay-close-btn"
                onClick={() => setShowFullscreenBuzzer(false)}
                className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
                title="Pəncərəni bağla"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
