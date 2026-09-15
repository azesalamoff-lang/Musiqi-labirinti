import React, { useState, useEffect, useRef } from 'react';
import { SongItem, Team } from '../../types';
import { 
  Trophy, 
  Play, 
  Square, 
  CheckCircle, 
  XCircle, 
  SkipForward, 
  Timer, 
  Crown, 
  Users, 
  Sparkles,
  Award
} from 'lucide-react';
import { 
  playCorrectSound, 
  playWrongSound, 
  playTickSound, 
  playTimesUpSound, 
  playSongAudioOrMelody, 
  stopAllPlayback, 
  playVictoryFanfare 
} from '../../utils/soundEffects';
import { InteractiveImageSlot } from '../InteractiveImageSlot';

interface Stage4Props {
  finalist1Songs: SongItem[];
  finalist2Songs: SongItem[];
  teams: Team[];
  onSetChampion: (winnerTeamId: string) => void;
  onOpenChampionModal: () => void;
  onOpenLightbox: (url: string, title: string, subtitle?: string) => void;
}

export const Stage4FinalChords: React.FC<Stage4Props> = ({
  finalist1Songs,
  finalist2Songs,
  teams,
  onSetChampion,
  onOpenChampionModal,
  onOpenLightbox
}) => {
  // Find finalists (status === 'finalist' or top 2 scoring active teams)
  const finalists = teams.filter(t => t.status === 'finalist' || t.status === 'active' || t.status === 'winner');
  const teamA = finalists[0] || teams[0];
  const teamB = finalists[1] || teams[1];

  const [activeDuelTeamIndex, setActiveDuelTeamIndex] = useState<0 | 1>(0); // 0 = Team A, 1 = Team B
  const [teamARepresentative, setTeamARepresentative] = useState<string>(teamA?.members[0]?.name || 'İştirakçı 1');
  const [teamBRepresentative, setTeamBRepresentative] = useState<string>(teamB?.members[0]?.name || 'İştirakçı 2');

  // Blitz State for each team
  const [blitzA, setBlitzA] = useState({
    timeLeft: 60,
    isRunning: false,
    songIndex: 0,
    correctCount: 0,
    answers: Array(7).fill(null) as ('correct' | 'wrong' | 'pass' | null)[],
    completed: false
  });

  const [blitzB, setBlitzB] = useState({
    timeLeft: 60,
    isRunning: false,
    songIndex: 0,
    correctCount: 0,
    answers: Array(7).fill(null) as ('correct' | 'wrong' | 'pass' | null)[],
    completed: false
  });

  const [isPlayingMelodyNow, setIsPlayingMelodyNow] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const currentTeam = activeDuelTeamIndex === 0 ? teamA : teamB;
  const currentRep = activeDuelTeamIndex === 0 ? teamARepresentative : teamBRepresentative;
  const currentBlitz = activeDuelTeamIndex === 0 ? blitzA : blitzB;
  const setBlitzCurrent = activeDuelTeamIndex === 0 ? setBlitzA : setBlitzB;
  const currentSongList = activeDuelTeamIndex === 0 ? finalist1Songs : finalist2Songs;
  const currentSong = currentSongList[currentBlitz.songIndex] || currentSongList[0];

  // Play current song melody helper
  const playCurrentSongMelody = async (song: SongItem) => {
    if (song) {
      setIsPlayingMelodyNow(true);
      await playSongAudioOrMelody(
        song.id,
        song.melodyNotes,
        undefined,
        () => setIsPlayingMelodyNow(false)
      );
    }
  };

  // Timer loop for active blitz
  useEffect(() => {
    if (currentBlitz.isRunning) {
      timerRef.current = setInterval(() => {
        setBlitzCurrent(prev => {
          if (prev.timeLeft <= 1) {
            clearInterval(timerRef.current!);
            stopAllPlayback();
            setIsPlayingMelodyNow(false);
            playTimesUpSound();
            return { ...prev, timeLeft: 0, isRunning: false, completed: true };
          }
          if (prev.timeLeft <= 10) {
            playTickSound();
          }
          return { ...prev, timeLeft: prev.timeLeft - 1 };
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [currentBlitz.isRunning, setBlitzCurrent]);

  const handleStartBlitz = () => {
    setBlitzCurrent(prev => ({ ...prev, isRunning: true }));
    playCurrentSongMelody(currentSong);
  };

  const handlePauseBlitz = () => {
    stopAllPlayback();
    setIsPlayingMelodyNow(false);
    setBlitzCurrent(prev => ({ ...prev, isRunning: false }));
  };

  const handleResetBlitz = () => {
    stopAllPlayback();
    setIsPlayingMelodyNow(false);
    setBlitzCurrent({
      timeLeft: 60,
      isRunning: false,
      songIndex: 0,
      correctCount: 0,
      answers: Array(7).fill(null),
      completed: false
    });
  };

  const advanceToNextSong = (action: 'correct' | 'wrong' | 'pass') => {
    stopAllPlayback();
    setIsPlayingMelodyNow(false);

    setBlitzCurrent(prev => {
      const newAnswers = [...prev.answers];
      newAnswers[prev.songIndex] = action;
      const newCorrectCount = action === 'correct' ? prev.correctCount + 1 : prev.correctCount;
      const nextIndex = prev.songIndex + 1;
      const isFinished = nextIndex >= 7;

      if (isFinished) {
        if (timerRef.current) clearInterval(timerRef.current);
        playTimesUpSound();
      } else if (prev.isRunning) {
        // Play next melody
        const nextSong = currentSongList[nextIndex];
        if (nextSong) {
          setTimeout(() => playCurrentSongMelody(nextSong), 200);
        }
      }

      return {
        ...prev,
        answers: newAnswers,
        correctCount: newCorrectCount,
        songIndex: nextIndex < 7 ? nextIndex : prev.songIndex,
        completed: isFinished,
        isRunning: isFinished ? false : prev.isRunning
      };
    });
  };

  const handleCorrect = () => {
    playCorrectSound();
    advanceToNextSong('correct');
  };

  const handlePass = () => {
    advanceToNextSong('pass');
  };

  const handleWrong = () => {
    playWrongSound();
    advanceToNextSong('wrong');
  };

  // Determine Grand Winner
  const bothCompleted = blitzA.completed && blitzB.completed;
  const isTeamAWinner = blitzA.correctCount > blitzB.correctCount;
  const isTeamBWinner = blitzB.correctCount > blitzA.correctCount;
  const isTie = blitzA.correctCount === blitzB.correctCount && bothCompleted;

  const handleDeclareWinner = () => {
    let winnerId = teamA.id;
    if (isTeamBWinner) winnerId = teamB.id;
    else if (isTie) {
      // In tie, break by overall tournament score
      winnerId = teamA.score >= teamB.score ? teamA.id : teamB.id;
    }
    playVictoryFanfare();
    onSetChampion(winnerId);
    onOpenChampionModal();
  };

  return (
    <div className="space-y-6">
      {/* Intro Banner */}
      <div className="bg-gradient-to-r from-amber-950/60 via-slate-900 to-indigo-950/60 border-2 border-amber-500/50 rounded-2xl p-5 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          {/* Stage 4 Logo / Image Slot */}
          <InteractiveImageSlot
            imageKey="stage_logo_4"
            title="4-cü Mərhələ: Son Akkordlar"
            subtitle="Böyük Final Bils-Raundu • 1 Dəqiqə • 7 Mahnı"
            size="lg"
            shape="rounded"
            onOpenLightbox={onOpenLightbox}
            defaultIcon={<Crown className="w-7 h-7 text-amber-400" />}
          />

          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-semibold mb-2 border border-amber-500/40">
              <Crown className="w-4 h-4 text-amber-400" />
              <span>4-cü Mərhələ • Böyük Final</span>
            </div>
            <h2 className="text-xl lg:text-3xl font-black text-white tracking-tight font-display">
              Son Akkordlar (Final Bils-Raundu)
            </h2>
            <p className="text-slate-300 text-xs lg:text-sm mt-1 max-w-2xl leading-relaxed">
              Finala çıxmış 2 komandadan 1 iştirakçı seçilir. Hər finalçıya <strong>1 dəqiqə ərzində 7 mahnı</strong> səsləndirilir. Ən çox mahnı tapan komanda <strong>Musiqi Labirintinin Çempionu</strong> olur!
            </p>
          </div>
        </div>

        {bothCompleted && (
          <div className="shrink-0">
            <button
              id="celebrate-champion-btn"
              onClick={handleDeclareWinner}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-slate-950 font-black text-sm flex items-center gap-2 shadow-2xl shadow-amber-500/40 animate-bounce cursor-pointer"
            >
              <Trophy className="w-5 h-5 fill-current" />
              <span>QALİBİ ELAN ET VƏ MÜKAFATLANDIR!</span>
            </button>
          </div>
        )}
      </div>

      {/* Dual Finalist Stage Tabs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Team A Card */}
        <div
          onClick={() => {
            stopAllPlayback();
            setIsPlayingMelodyNow(false);
            setActiveDuelTeamIndex(0);
          }}
          className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
            activeDuelTeamIndex === 0
              ? 'bg-sky-950/40 border-sky-400 ring-2 ring-sky-400/50 shadow-xl shadow-sky-950'
              : 'bg-slate-900/60 border-slate-800 opacity-75 hover:opacity-100'
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm text-slate-950"
              style={{ backgroundColor: teamA.color }}
            >
              A
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-white font-display">{teamA.name}</h3>
                {activeDuelTeamIndex === 0 && (
                  <span className="text-[10px] bg-sky-500/20 text-sky-300 px-2 py-0.5 rounded font-bold border border-sky-500/30">
                    Cari Finalçı
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1.5 mt-1">
                <Users className="w-3.5 h-3.5 text-slate-400" />
                <select
                  value={teamARepresentative}
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) => setTeamARepresentative(e.target.value)}
                  className="bg-slate-800 text-[11px] text-slate-200 rounded px-2 py-0.5 border border-slate-700 font-medium focus:outline-none"
                >
                  {teamA.members.map((m) => (
                    <option key={m.id} value={m.name}>
                      {m.name} ({m.role || 'Üzv'})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="text-right">
            <div className="text-2xl font-black text-amber-300 font-display">
              {blitzA.correctCount} <span className="text-xs text-slate-400 font-normal">/ 7 tapıldı</span>
            </div>
            <div className="text-[11px] text-slate-400">
              Qalan vaxt: <strong className="text-white">{blitzA.timeLeft}s</strong>
            </div>
          </div>
        </div>

        {/* Team B Card */}
        <div
          onClick={() => {
            stopAllPlayback();
            setIsPlayingMelodyNow(false);
            setActiveDuelTeamIndex(1);
          }}
          className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
            activeDuelTeamIndex === 1
              ? 'bg-amber-950/40 border-amber-400 ring-2 ring-amber-400/50 shadow-xl shadow-amber-950'
              : 'bg-slate-900/60 border-slate-800 opacity-75 hover:opacity-100'
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm text-slate-950"
              style={{ backgroundColor: teamB.color }}
            >
              B
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-white font-display">{teamB.name}</h3>
                {activeDuelTeamIndex === 1 && (
                  <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded font-bold border border-amber-500/30">
                    Cari Finalçı
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1.5 mt-1">
                <Users className="w-3.5 h-3.5 text-slate-400" />
                <select
                  value={teamBRepresentative}
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) => setTeamBRepresentative(e.target.value)}
                  className="bg-slate-800 text-[11px] text-slate-200 rounded px-2 py-0.5 border border-slate-700 font-medium focus:outline-none"
                >
                  {teamB.members.map((m) => (
                    <option key={m.id} value={m.name}>
                      {m.name} ({m.role || 'Üzv'})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="text-right">
            <div className="text-2xl font-black text-amber-300 font-display">
              {blitzB.correctCount} <span className="text-xs text-slate-400 font-normal">/ 7 tapıldı</span>
            </div>
            <div className="text-[11px] text-slate-400">
              Qalan vaxt: <strong className="text-white">{blitzB.timeLeft}s</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Main Blitz Arena Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-col gap-6">
        {/* Blitz Arena Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                {currentTeam.name} komandasının Final Çıxışı:
              </span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-200 font-bold">
                {currentRep}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              1 dəqiqə ərzində səslənən 7 mahnıdan mümkün qədər çoxunu tapmalıdır.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="reset-blitz-btn"
              onClick={handleResetBlitz}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition-colors"
            >
              Raundu Sıfırla (60s)
            </button>
          </div>
        </div>

        {/* 7 Songs Stepper Tracker */}
        <div className="grid grid-cols-7 gap-2">
          {Array.from({ length: 7 }).map((_, i) => {
            const status = currentBlitz.answers[i];
            const isCurrent = i === currentBlitz.songIndex && !currentBlitz.completed;

            return (
              <div
                key={i}
                className={`py-3 px-2 rounded-xl text-center border transition-all flex flex-col items-center justify-center gap-1 ${
                  status === 'correct'
                    ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300'
                    : status === 'wrong'
                    ? 'bg-rose-950/40 border-rose-500/50 text-rose-300'
                    : status === 'pass'
                    ? 'bg-amber-950/40 border-amber-500/50 text-amber-300'
                    : isCurrent
                    ? 'bg-amber-500/20 border-amber-400 ring-2 ring-amber-400/40 text-amber-200 scale-105'
                    : 'bg-slate-800/40 border-slate-700/50 text-slate-500'
                }`}
              >
                <div className="text-[11px] font-bold">Mahnı {i + 1}</div>
                <div>
                  {status === 'correct' ? (
                    <CheckCircle className="w-5 h-5 text-emerald-400" />
                  ) : status === 'wrong' ? (
                    <XCircle className="w-5 h-5 text-rose-400" />
                  ) : status === 'pass' ? (
                    <span className="text-[10px] font-black uppercase text-amber-400">PAS</span>
                  ) : (
                    <span className="text-xs font-bold text-slate-400">№ {i + 1}</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Center: Countdown Clock & Controls */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 py-4 bg-slate-950/60 p-6 rounded-3xl border border-slate-800">
          {/* Circular Countdown Clock */}
          <div className="flex items-center gap-6">
            <div className="relative">
              <div className={`w-32 h-32 rounded-full border-4 flex flex-col items-center justify-center transition-all ${
                currentBlitz.timeLeft <= 10
                  ? 'border-rose-500 bg-rose-500/10 shadow-2xl shadow-rose-500/40 animate-pulse'
                  : currentBlitz.isRunning
                  ? 'border-amber-400 bg-amber-500/10 shadow-xl shadow-amber-500/20'
                  : 'border-slate-700 bg-slate-900'
              }`}>
                <Timer className={`w-6 h-6 mb-1 ${currentBlitz.timeLeft <= 10 ? 'text-rose-400 animate-spin-slow' : 'text-amber-400'}`} />
                <span className="text-3xl font-black text-white font-display">
                  {currentBlitz.timeLeft}
                </span>
                <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">saniyə</span>
              </div>
            </div>

            <div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Mövcud Nəticə:
              </div>
              <div className="text-4xl font-black text-amber-300 font-display">
                {currentBlitz.correctCount} / 7
              </div>
              <p className="text-xs text-slate-400">
                {currentBlitz.completed ? 'Raund tamamlandı!' : currentBlitz.isRunning ? 'Vaxt gedir...' : 'Başlamaq üçün düyməyə basın'}
              </p>
            </div>
          </div>

          {/* Current Song Title / Melody player */}
          <div className="text-center md:text-right max-w-sm">
            <span className="text-[10px] uppercase font-bold text-teal-400 tracking-wider block">
              Səslənən Mahnı ({currentBlitz.songIndex + 1} / 7):
            </span>
            <div className="text-base font-black text-white font-display mt-0.5">
              {currentSong?.title}
            </div>
            <div className="text-xs text-slate-400">
              {currentSong?.artistOrComposer}
            </div>
          </div>
        </div>

        {/* Action Controls for Blitz */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
          {/* Timer Start / Stop */}
          <div className="flex items-center gap-3">
            {!currentBlitz.isRunning && !currentBlitz.completed ? (
              <button
                id="start-blitz-btn"
                onClick={handleStartBlitz}
                className="px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm flex items-center gap-2 shadow-xl shadow-amber-500/25 cursor-pointer"
              >
                <Play className="w-5 h-5 fill-current" />
                <span>60 Saniyəlik Taymeri Başlat</span>
              </button>
            ) : currentBlitz.isRunning ? (
              <button
                id="pause-blitz-btn"
                onClick={handlePauseBlitz}
                className="px-5 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm flex items-center gap-2 border border-slate-700 cursor-pointer"
              >
                <Square className="w-4 h-4 fill-current" />
                <span>Fasilə (Dayandır)</span>
              </button>
            ) : (
              <div className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4" />
                <span>Bu finalçının raundu yekunlaşdı!</span>
              </div>
            )}
          </div>

          {/* Verdict Fast Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              id="blitz-wrong-btn"
              disabled={!currentBlitz.isRunning}
              onClick={handleWrong}
              className="px-4 py-3 rounded-2xl bg-rose-950/60 hover:bg-rose-900/80 disabled:opacity-50 text-rose-300 border border-rose-800/60 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <XCircle className="w-4 h-4" />
              <span>Səhv (Növbəti)</span>
            </button>

            <button
              id="blitz-pass-btn"
              disabled={!currentBlitz.isRunning}
              onClick={handlePass}
              className="px-4 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 border border-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <SkipForward className="w-4 h-4 text-amber-400" />
              <span>Pas (Keç)</span>
            </button>

            <button
              id="blitz-correct-btn"
              disabled={!currentBlitz.isRunning}
              onClick={handleCorrect}
              className="px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-black flex items-center gap-2 shadow-xl shadow-emerald-950 transition-colors cursor-pointer"
            >
              <CheckCircle className="w-4 h-4" />
              <span>DÜZGÜN (+1 Mahnı)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
