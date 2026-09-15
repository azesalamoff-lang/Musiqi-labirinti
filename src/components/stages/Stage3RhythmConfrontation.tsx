import React, { useState, useEffect, useRef, useCallback } from 'react';
import { SongItem, Team } from '../../types';
import { 
  Timer, 
  Play, 
  Square, 
  CheckCircle, 
  Award, 
  Flame, 
  ArrowRight, 
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Bell,
  X
} from 'lucide-react';
import { 
  playSongAudioOrMelody, 
  stopAllPlayback, 
  playCorrectSound, 
  playTickSound, 
  playWrongSound,
  playBuzzerSound
} from '../../utils/soundEffects';
import { InteractiveImageSlot } from '../InteractiveImageSlot';

interface Stage3Props {
  songs: SongItem[];
  teams: Team[];
  onAwardPoints: (songId: string, teamId: string, points: number) => void;
  onEliminateTeam: (teamId: string) => void;
  onProceedToNextStage: () => void;
  onOpenLightbox: (url: string, title: string, subtitle?: string) => void;
}

const POINT_BRACKETS = [
  { label: '0–10 saniyə', min: 0, max: 10, points: 100, color: 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10' },
  { label: '10–20 saniyə', min: 10, max: 20, points: 70, color: 'text-teal-400 border-teal-500/40 bg-teal-500/10' },
  { label: '20–30 saniyə', min: 20, max: 30, points: 40, color: 'text-amber-400 border-amber-500/40 bg-amber-500/10' },
  { label: '30–40 saniyə', min: 30, max: 40, points: 20, color: 'text-orange-400 border-orange-500/40 bg-orange-500/10' },
  { label: '40–50 saniyə', min: 40, max: 50, points: 10, color: 'text-rose-400 border-rose-500/40 bg-rose-500/10' },
  { label: '50+ saniyə', min: 50, max: 999, points: 0, color: 'text-slate-400 border-slate-700 bg-slate-800/40' },
];

export const Stage3RhythmConfrontation: React.FC<Stage3Props> = ({
  songs,
  teams,
  onAwardPoints,
  onEliminateTeam,
  onProceedToNextStage,
  onOpenLightbox
}) => {
  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const [isPlayingMusic, setIsPlayingMusic] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [selectedBracketPoints, setSelectedBracketPoints] = useState<number | null>(null);
  const [isRevealed, setIsRevealed] = useState(false);
  const [showFinalistModal, setShowFinalistModal] = useState(false);

  // Active teams (those not eliminated in R2)
  const activeTeams = teams.filter(t => t.status !== 'eliminated_r2');
  const [answeringTeamId, setAnsweringTeamId] = useState<string>(activeTeams[0]?.id || '');

  // 5-second Fullscreen Buzzer Screen state
  const [buzzedTeamId, setBuzzedTeamId] = useState<string | null>(null);
  const [showFullscreenBuzzer, setShowFullscreenBuzzer] = useState(false);
  const [buzzerCountdown, setBuzzerCountdown] = useState(5);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const currentSong = songs[currentSongIndex];

  // Helper to get points from elapsed time
  const getPointsFromSeconds = (secs: number) => {
    if (secs <= 10) return 100;
    if (secs <= 20) return 70;
    if (secs <= 30) return 40;
    if (secs <= 40) return 20;
    if (secs <= 50) return 10;
    return 0;
  };

  // Buzzer handler (1, 2, 3, 4)
  const handleBuzz = useCallback((teamId: string) => {
    const team = teams.find(t => t.id === teamId);
    if (!team || team.status === 'eliminated_r2') return;

    // Immediately stop timer and audio
    setIsTimerRunning(false);
    stopAllPlayback();
    setIsPlayingMusic(false);

    // Calculate points earned at this instant
    const calculatedPoints = getPointsFromSeconds(elapsedSeconds);
    setSelectedBracketPoints(calculatedPoints);

    // Play loud, bright, punchy buzzer sound
    playBuzzerSound();

    // Select team automatically and open 5s fullscreen overlay
    setAnsweringTeamId(teamId);
    setBuzzedTeamId(teamId);
    setBuzzerCountdown(5);
    setShowFullscreenBuzzer(true);
  }, [teams, elapsedSeconds]);

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
      const team = teams.find(t => t.buzzerKey === e.key && t.status !== 'eliminated_r2');
      if (team) {
        handleBuzz(team.id);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [teams, handleBuzz]);

  // Stopwatch effect
  useEffect(() => {
    if (isTimerRunning) {
      timerRef.current = setInterval(() => {
        setElapsedSeconds(prev => {
          const next = prev + 0.1;
          if (Math.floor(next) !== Math.floor(prev)) {
            playTickSound();
          }
          if (next >= 60) {
            setIsTimerRunning(false);
            stopAllPlayback();
            setIsPlayingMusic(false);
          }
          return next;
        });
      }, 100);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isTimerRunning]);

  const handleStartPlayAndTimer = async () => {
    setIsTimerRunning(true);
    setIsPlayingMusic(true);
    if (currentSong) {
      await playSongAudioOrMelody(
        currentSong.id,
        currentSong.melodyNotes,
        undefined,
        () => setIsPlayingMusic(false),
        currentSong.clipStartSeconds,
        currentSong.clipDurationSeconds
      );
    }
  };

  const handleStopTimer = () => {
    setIsTimerRunning(false);
    stopAllPlayback();
    setIsPlayingMusic(false);
    const calculatedPoints = getPointsFromSeconds(elapsedSeconds);
    setSelectedBracketPoints(calculatedPoints);
  };

  const handleResetTimer = () => {
    setIsTimerRunning(false);
    stopAllPlayback();
    setIsPlayingMusic(false);
    setElapsedSeconds(0);
    setSelectedBracketPoints(null);
  };

  const handleAward = (targetTeamId?: string) => {
    const teamToAward = targetTeamId || answeringTeamId;
    if (!currentSong || !teamToAward) return;
    const pointsToGive = selectedBracketPoints !== null ? selectedBracketPoints : getPointsFromSeconds(elapsedSeconds);
    playCorrectSound();
    onAwardPoints(currentSong.id, teamToAward, pointsToGive);
    setIsRevealed(true);
    setShowFullscreenBuzzer(false);
  };

  const handleWrong = () => {
    playWrongSound();
    setShowFullscreenBuzzer(false);
  };

  const handleNextSong = () => {
    handleResetTimer();
    setIsRevealed(false);
    if (currentSongIndex < songs.length - 1) {
      setCurrentSongIndex(prev => prev + 1);
    } else {
      setShowFinalistModal(true);
    }
  };

  // Active teams ranked for final selection
  const sortedActive = [...activeTeams].sort((a, b) => b.score - a.score);
  const lowestScoringTeam = sortedActive[sortedActive.length - 1];
  const finalists = sortedActive.slice(0, 2);

  const handleConfirmFinalists = () => {
    if (lowestScoringTeam) {
      onEliminateTeam(lowestScoringTeam.id);
    }
    setShowFinalistModal(false);
    onProceedToNextStage();
  };

  const currentPoints = selectedBracketPoints !== null ? selectedBracketPoints : getPointsFromSeconds(elapsedSeconds);
  const buzzedTeam = teams.find(t => t.id === buzzedTeamId);

  return (
    <div className="space-y-6">
      {/* Intro Banner */}
      <div className="bg-gradient-to-r from-emerald-950/40 via-slate-900 to-teal-950/40 border border-emerald-500/30 rounded-2xl p-5 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          {/* Stage 3 Logo / Image Slot */}
          <InteractiveImageSlot
            imageKey="stage_logo_3"
            title="3-cü Mərhələ: Ritm Qarşıdurması"
            subtitle="Vaxt İddiası • 8 Mahnı • Dinamik Xallar"
            size="lg"
            shape="rounded"
            onOpenLightbox={onOpenLightbox}
            defaultIcon={<Flame className="w-7 h-7 text-emerald-400" />}
          />

          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold mb-2 border border-emerald-500/30">
              <Flame className="w-3.5 h-3.5" />
              <span>3-cü Mərhələ</span>
            </div>
            <h2 className="text-xl lg:text-2xl font-black text-white tracking-tight font-display">
              Ritm Qarşıdurması (Vaxt İddiası)
            </h2>
            <p className="text-slate-300 text-xs lg:text-sm mt-1 max-w-2xl leading-relaxed">
              Cəmi 8 mahnı səsləndirilir. Mahnının tapılma müddətinə uyğun olaraq xal hesablanır (10 saniyəyə qədər = 100 xal, 10–20 san. = 70 xal və s.). Ən az xallı 1 komanda tərk edir, <strong>Finala 2 komanda yüksəlir!</strong>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            id="determine-finalists-btn"
            onClick={() => setShowFinalistModal(true)}
            className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>Finalistləri Təyin Et (Tur 4-ə Keç)</span>
          </button>
        </div>
      </div>

      {/* Point Bracket Reference Pill Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        {POINT_BRACKETS.map((b) => {
          const isCurrentBracket = elapsedSeconds >= b.min && elapsedSeconds < b.max;
          const isSelected = selectedBracketPoints === b.points;

          return (
            <button
              key={b.label}
              onClick={() => setSelectedBracketPoints(b.points)}
              className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                isSelected || (isTimerRunning && isCurrentBracket)
                  ? 'ring-2 ring-amber-400 scale-105 shadow-md shadow-amber-500/20 ' + b.color
                  : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700'
              }`}
            >
              <div className="text-[11px] font-bold opacity-80">{b.label}</div>
              <div className="text-base font-black font-display mt-0.5">
                {b.points} <span className="text-[10px] font-normal">xal</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Main Arena Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Timer & Song Controls */}
        <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800 rounded-3xl p-6 flex flex-col justify-between shadow-xl">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <span className="px-3 py-1 rounded-lg bg-teal-500/20 text-teal-300 text-xs font-bold border border-teal-500/30">
              Mahnı {currentSongIndex + 1} / 8
            </span>

            {/* Song tabs selector */}
            <div className="flex items-center gap-1">
              {songs.map((s, idx) => (
                <button
                  key={s.id}
                  onClick={() => {
                    handleResetTimer();
                    setIsRevealed(false);
                    setCurrentSongIndex(idx);
                  }}
                  className={`w-7 h-7 rounded-lg text-xs font-bold transition-all ${
                    idx === currentSongIndex
                      ? 'bg-amber-500 text-slate-950'
                      : s.awardedTeamId
                      ? 'bg-emerald-900/60 text-emerald-300'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {idx + 1}
                </button>
              ))}
            </div>
          </div>

          {/* Central Live Stopwatch & Points Gauge */}
          <div className="py-8 flex flex-col items-center text-center">
            {/* Big Stopwatch Display */}
            <div className="relative mb-4">
              <div className={`w-48 h-48 rounded-full border-4 flex flex-col items-center justify-center transition-all ${
                isTimerRunning 
                  ? 'border-amber-400 bg-amber-500/10 shadow-2xl shadow-amber-500/30 scale-105'
                  : 'border-slate-800 bg-slate-950/80'
              }`}>
                <Timer className={`w-8 h-8 mb-1 ${isTimerRunning ? 'text-amber-400 animate-spin-slow' : 'text-slate-500'}`} />
                <span className="text-4xl font-black text-white font-display tracking-tight">
                  {elapsedSeconds.toFixed(1)} <span className="text-sm font-normal text-slate-400">san</span>
                </span>
                <span className="text-xs font-black text-amber-300 mt-1 px-2.5 py-0.5 rounded-full bg-amber-500/20">
                  {currentPoints} Xal
                </span>
              </div>
            </div>

            {/* Stopwatch Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-3">
              {!isTimerRunning ? (
                <button
                  id="stage3-start-timer-btn"
                  onClick={handleStartPlayAndTimer}
                  className="px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm flex items-center gap-2 shadow-lg shadow-amber-500/30 transition-all cursor-pointer"
                >
                  <Play className="w-5 h-5 fill-current" />
                  <span>Mahnını və Saniyəölçəni Başlat</span>
                </button>
              ) : (
                <button
                  id="stage3-stop-timer-btn"
                  onClick={handleStopTimer}
                  className="px-6 py-3 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm flex items-center gap-2 shadow-lg shadow-rose-900/50 animate-pulse transition-all cursor-pointer"
                >
                  <Square className="w-5 h-5 fill-current" />
                  <span>Mahnını və Vaxtı Dayandır (Tapıldı!)</span>
                </button>
              )}

              <button
                id="stage3-reset-timer-btn"
                onClick={handleResetTimer}
                title="Saniyəölçəni sıfırla"
                className="p-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
              >
                <RotateCcw className="w-5 h-5" />
              </button>
            </div>

            {/* 1, 2, 3, 4 Clickable Buzzer Buttons */}
            <div className="w-full max-w-xl mt-6 pt-4 border-t border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                  <Bell className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                  <span>Zəng Düymələri (Klaviatura: 1, 2, 3, 4)</span>
                </span>
                <span className="text-[11px] text-slate-400">
                  Basıldıqda vaxt dayanır və 5 san tam ekran açılır
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {teams.map((team, idx) => {
                  const isEliminated = team.status === 'eliminated_r2';
                  const isSelected = answeringTeamId === team.id;
                  const isBuzzed = buzzedTeamId === team.id;

                  return (
                    <button
                      key={team.id}
                      id={`stage3-buzzer-btn-${idx + 1}`}
                      disabled={isEliminated}
                      onClick={() => handleBuzz(team.id)}
                      className={`relative p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all select-none ${
                        isEliminated
                          ? 'opacity-35 bg-slate-900 border-slate-800 cursor-not-allowed text-slate-500'
                          : isBuzzed
                          ? 'bg-amber-500 text-slate-950 border-amber-300 ring-4 ring-amber-400/40 shadow-lg shadow-amber-500/50 scale-105 cursor-pointer'
                          : isSelected
                          ? 'bg-slate-800 border-amber-400 text-white shadow-md cursor-pointer'
                          : 'bg-slate-900/90 hover:bg-slate-800 border-slate-700 text-slate-200 cursor-pointer active:scale-95'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 w-full justify-center">
                        <span className={`w-5 h-5 rounded-md font-black text-xs flex items-center justify-center shrink-0 ${
                          isEliminated
                            ? 'bg-slate-800 text-slate-600'
                            : isBuzzed
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
                        {isEliminated ? 'Kənarlaşdırılıb' : `${team.score} Xal`}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Reveal & Award Section */}
          <div className="pt-4 border-t border-slate-800 space-y-4">
            {!isRevealed ? (
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Mahnı adı gizlidir</span>
                <button
                  id="stage3-reveal-song-btn"
                  onClick={() => setIsRevealed(true)}
                  className="text-xs font-semibold text-amber-400 hover:text-amber-300 underline cursor-pointer"
                >
                  Cavabı göstər
                </button>
              </div>
            ) : (
              <div className="bg-gradient-to-r from-emerald-950/40 to-slate-900 border border-emerald-500/30 rounded-xl p-3 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-emerald-400 uppercase">Düzgün Cavab:</span>
                  <div className="text-base font-black text-white font-display">
                    {currentSong?.title} &mdash; <span className="text-xs text-slate-400 font-normal">{currentSong?.artistOrComposer}</span>
                  </div>
                </div>
                <span className="text-sm font-black text-emerald-300 px-3 py-1 bg-emerald-500/20 rounded-lg border border-emerald-500/30">
                  +{currentPoints} xal
                </span>
              </div>
            )}

            {/* Award Controls */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <label htmlFor="stage3-team-select" className="text-xs text-slate-400 font-medium shrink-0">
                  Xalı qazanan komanda:
                </label>
                <select
                  id="stage3-team-select"
                  value={answeringTeamId}
                  onChange={(e) => setAnsweringTeamId(e.target.value)}
                  className="bg-slate-800 border border-slate-700 text-white rounded-lg text-xs px-3 py-1.5 font-bold focus:outline-none focus:ring-1 focus:ring-amber-400"
                >
                  {activeTeams.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <button
                  id="stage3-award-btn"
                  onClick={handleAward}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-950 cursor-pointer"
                >
                  <Award className="w-4 h-4" />
                  <span>+{currentPoints} Xal Yaz</span>
                </button>

                <button
                  id="stage3-next-song-btn"
                  onClick={handleNextSong}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <span>{currentSongIndex < songs.length - 1 ? 'Növbəti' : 'Yekunlaşdır'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: Active Teams in Round 3 */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 flex flex-col gap-4 shadow-xl">
          <div className="border-b border-slate-800 pb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 font-display">
              Tur 3-də Yarışan 3 Komanda
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Ən çox xallı 2 komanda Finala (Tur 4) keçəcək!
            </p>
          </div>

          <div className="flex flex-col gap-3">
            {sortedActive.map((team, rankIdx) => {
              const isFinalistTrack = rankIdx < 2;

              return (
                <div
                  key={team.id}
                  className={`p-3.5 rounded-2xl border transition-all ${
                    isFinalistTrack
                      ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-200'
                      : 'bg-rose-950/20 border-rose-500/30 text-rose-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs text-slate-950"
                        style={{ backgroundColor: team.color }}
                      >
                        {rankIdx + 1}
                      </div>
                      <div>
                        <div className="text-sm font-bold font-display text-white">{team.name}</div>
                        <div className="text-[10px] text-slate-400">
                          {isFinalistTrack ? 'Final zonası (Keçir)' : 'Təhlükə zonası (Çıxır)'}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-base font-black text-amber-300 font-display">
                        {team.score} xal
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-auto p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-[11px] text-slate-400">
            <span className="text-amber-400 font-bold">Xatırlatma: </span>
            Xal qazanmaq üçün komandanın mahnını nə qədər cəld tapdığı əsas götürülür.
          </div>
        </div>
      </div>

      {/* Finalist Determination Modal */}
      {showFinalistModal && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-lg rounded-3xl p-6 shadow-2xl relative text-center animate-in fade-in zoom-in-95">
            <div className="w-14 h-14 mx-auto rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center mb-3">
              <Sparkles className="w-8 h-8" />
            </div>

            <h3 className="text-xl font-black text-white font-display mb-1">
              Böyük Finalçıların Təyini (Tur 3 Yekunu)
            </h3>
            <p className="text-xs text-slate-300 mb-5 leading-relaxed">
              Qaydalara əsasən, ən az xallı 1 komanda oyunu tərk edir və finala <strong>2 ən güclü komanda</strong> yüksəlir!
            </p>

            {/* Finalists & Eliminated preview */}
            <div className="space-y-2.5 mb-6 text-left">
              <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider block">
                Finala Çıxan 2 Komanda:
              </span>
              {finalists.map((f, i) => (
                <div key={f.id} className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/40 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-emerald-400">#{i + 1}</span>
                    <span className="text-sm font-bold text-white font-display">{f.name}</span>
                  </div>
                  <span className="text-xs font-black text-amber-300">{f.score} xal</span>
                </div>
              ))}

              {lowestScoringTeam && (
                <>
                  <span className="text-[10px] uppercase font-bold text-rose-400 tracking-wider block pt-2">
                    Oyunu Tərk Edən Komanda:
                  </span>
                  <div className="p-3 rounded-xl bg-rose-950/20 border border-rose-500/30 flex items-center justify-between opacity-80">
                    <span className="text-sm font-bold text-rose-200">{lowestScoringTeam.name}</span>
                    <span className="text-xs font-bold text-rose-300">{lowestScoringTeam.score} xal</span>
                  </div>
                </>
              )}
            </div>

            <div className="flex items-center justify-center gap-3">
              <button
                id="cancel-finalists-modal-btn"
                onClick={() => setShowFinalistModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                Geri qayıt
              </button>
              <button
                id="confirm-finalists-btn"
                onClick={handleConfirmFinalists}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/30 cursor-pointer"
              >
                Təsdiq Et və Böyük Finala Keç!
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5-Second Fullscreen Buzzer Announcement Overlay */}
      {showFullscreenBuzzer && buzzedTeam && (
        <div
          id="stage3-fullscreen-buzzer-overlay"
          className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-md flex flex-col items-center justify-between p-6 sm:p-12 animate-in fade-in duration-200"
        >
          {/* Top Bar */}
          <div className="w-full max-w-4xl flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-black tracking-wider uppercase">
                3-cü Tur • Ritm Qarşıdurması
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

              <div className="inline-flex items-center gap-3 px-4 py-2 rounded-xl bg-slate-900/90 border border-slate-700">
                <span className="text-xs text-slate-300">
                  Dayandırılan Vaxt: <strong className="text-white font-mono">{elapsedSeconds.toFixed(1)} san</strong>
                </span>
                <span className="text-xs text-amber-400 font-black px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/30">
                  +{currentPoints} Xal
                </span>
              </div>
            </div>
          </div>

          {/* Host Quick Verdict Actions */}
          <div className="w-full max-w-2xl bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-2xl">
            <div className="text-center sm:text-left">
              <span className="text-xs text-slate-400 block">Aparıcı üçün tez qərar:</span>
              <span className="text-sm font-bold text-slate-200">
                {currentSong ? `"${currentSong.title}" üçün xal verilsin?` : 'Cavab statusu'}
              </span>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
              <button
                id="stage3-buzzer-overlay-wrong-btn"
                onClick={handleWrong}
                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-rose-950/70 text-rose-300 border border-slate-700 hover:border-rose-500/50 text-xs font-bold transition-all cursor-pointer"
              >
                Səhvdir
              </button>

              <button
                id="stage3-buzzer-overlay-correct-btn"
                onClick={() => handleAward(buzzedTeam.id)}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white text-xs font-black flex items-center gap-2 shadow-lg shadow-emerald-950/60 transition-all cursor-pointer"
              >
                <Award className="w-4 h-4" />
                <span>Düzgündür (+{currentPoints} Xal)</span>
              </button>

              <button
                id="stage3-buzzer-overlay-close-btn"
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
