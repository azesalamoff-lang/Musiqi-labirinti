import React, { useState, useEffect, useRef } from 'react';
import { Team } from '../types';
import { buzzerService, BuzzerEventMessage } from '../utils/buzzerChannel';
import { playBuzzerSound } from '../utils/soundEffects';
import { Bell, CheckCircle2, Lock, Smartphone, RefreshCw, Volume2 } from 'lucide-react';

interface TeamBuzzerClientProps {
  teams: Team[];
  initialTeamId?: string | null;
  onExit?: () => void;
}

export const TeamBuzzerClient: React.FC<TeamBuzzerClientProps> = ({
  teams,
  initialTeamId,
  onExit
}) => {
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(initialTeamId || null);
  const [buzzedTeamId, setBuzzedTeamId] = useState<string | null>(null);
  const [buzzedTeamName, setBuzzedTeamName] = useState<string | null>(null);
  const [lockedTeams, setLockedTeams] = useState<string[]>([]);
  const [isPressing, setIsPressing] = useState(false);
  const [vibrated, setVibrated] = useState(false);

  // Keep ref for immediate atomic state checking (avoid race conditions in event callbacks)
  const isLockedRef = useRef(false);
  const selectedTeamRef = useRef(selectedTeamId);
  selectedTeamRef.current = selectedTeamId;

  // Listen for sync messages from host or other clients
  useEffect(() => {
    const unsubscribe = buzzerService.subscribe((msg: BuzzerEventMessage) => {
      if (msg.type === 'BUZZ') {
        isLockedRef.current = true;
        setBuzzedTeamId(msg.teamId || null);
        setBuzzedTeamName(msg.teamName || null);
      } else if (msg.type === 'RESET') {
        isLockedRef.current = false;
        setBuzzedTeamId(null);
        setBuzzedTeamName(null);
        setLockedTeams([]);
      } else if (msg.type === 'LOCK_TEAM') {
        isLockedRef.current = false;
        setBuzzedTeamId(null);
        setBuzzedTeamName(null);
        if (msg.lockedTeamIds) {
          setLockedTeams(msg.lockedTeamIds);
        } else if (msg.teamId) {
          setLockedTeams(prev => [...prev, msg.teamId!]);
        }
      } else if (msg.type === 'SYNC_RESPONSE') {
        setBuzzedTeamId(msg.buzzedTeamId || null);
        setLockedTeams(msg.lockedTeamIds || []);
        isLockedRef.current = !!msg.buzzedTeamId;
      }
    });

    // Request initial state from host
    buzzerService.send({ type: 'SYNC_REQUEST' });

    return () => {
      unsubscribe();
    };
  }, []);

  const activeTeams = teams.filter(t => t.status === 'active' || t.status === 'finalist');
  const selectedTeam = teams.find(t => t.id === selectedTeamId);
  const isMyTeamLocked = selectedTeamId ? lockedTeams.includes(selectedTeamId) : false;
  const isMyTeamFirst = !!(selectedTeamId && buzzedTeamId === selectedTeamId);
  const isOtherTeamFirst = !!(buzzedTeamId && buzzedTeamId !== selectedTeamId);

  // Trigger Buzz (Strict Atomic check to guarantee 0 conflicts)
  const handleBuzzClick = () => {
    if (!selectedTeamId || !selectedTeam) return;
    // Atomic lock check: If someone already buzzed or my team is locked out, silently drop
    if (isLockedRef.current || buzzedTeamId || isMyTeamLocked) return;

    // Immediately mark local atomic lock
    isLockedRef.current = true;
    setIsPressing(true);
    setTimeout(() => setIsPressing(false), 200);

    // Haptic feedback for mobile devices
    if ('vibrate' in navigator) {
      try {
        navigator.vibrate([100, 50, 100]);
        setVibrated(true);
      } catch (e) {
        console.warn(e);
      }
    }

    playBuzzerSound();

    // Broadcast atomic buzz event
    buzzerService.send({
      type: 'BUZZ',
      teamId: selectedTeam.id,
      teamName: selectedTeam.name,
      timestamp: Date.now()
    });
  };

  // If team is not yet chosen, show selection screen
  if (!selectedTeam) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl text-center">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center mx-auto mb-4">
            <Smartphone className="w-8 h-8 text-amber-400" />
          </div>

          <h1 className="text-2xl font-black font-display text-white">
            Musiqi Dueli &bull; Zəng Pultu
          </h1>
          <p className="text-sm text-slate-400 mt-2 mb-6">
            Zəhmət olmasa komandanızı seçin. Seçimdən sonra ekranda yalnız böyük "Zəngi Bas" düyməsi açılacaq.
          </p>

          <div className="space-y-3">
            {activeTeams.map((team) => (
              <button
                key={team.id}
                onClick={() => setSelectedTeamId(team.id)}
                className="w-full p-4 rounded-2xl border flex items-center justify-between transition-all hover:scale-[1.02] active:scale-95 cursor-pointer shadow-lg"
                style={{
                  backgroundColor: `${team.color}15`,
                  borderColor: team.color
                }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-950 font-black text-sm"
                    style={{ backgroundColor: team.color }}
                  >
                    {team.buzzerKey}
                  </div>
                  <span className="text-base font-black text-white">
                    {team.name}
                  </span>
                </div>
                <span className="text-xs font-bold text-slate-300">
                  Seç &rarr;
                </span>
              </button>
            ))}
          </div>

          {onExit && (
            <button
              onClick={onExit}
              className="mt-6 text-xs text-slate-500 hover:text-slate-300 underline"
            >
              Əsas ekrana qayıt
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col select-none overflow-hidden touch-manipulation">
      {/* Top Bar with team badge & status */}
      <header className="p-4 border-b border-slate-850 bg-slate-900/60 backdrop-blur-md flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-950 font-black text-sm shadow-md"
            style={{ backgroundColor: selectedTeam.color }}
          >
            {selectedTeam.buzzerKey}
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Sizin Komanda:
            </span>
            <span className="text-base font-black text-white font-display">
              {selectedTeam.name}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setSelectedTeamId(null)}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1 border border-slate-700 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Dəyiş</span>
          </button>
          {onExit && (
            <button
              onClick={onExit}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white text-xs font-semibold"
            >
              Çıxış
            </button>
          )}
        </div>
      </header>

      {/* Main Massive Touch Arena */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        {/* Status Message Banner */}
        <div className="mb-6 h-12 flex items-center justify-center">
          {isMyTeamFirst ? (
            <div className="px-5 py-2 rounded-2xl bg-emerald-500/20 border-2 border-emerald-400 text-emerald-300 font-black text-sm flex items-center gap-2 animate-bounce shadow-lg shadow-emerald-500/20">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <span>ƏLA! İLK SİZ BASDINIZ &bull; CAVAB VERİN!</span>
            </div>
          ) : isOtherTeamFirst ? (
            <div className="px-5 py-2 rounded-2xl bg-rose-500/20 border-2 border-rose-500 text-rose-300 font-black text-sm flex items-center gap-2">
              <Lock className="w-5 h-5 text-rose-400" />
              <span>{buzzedTeamName || 'Digər komanda'} tez basdı!</span>
            </div>
          ) : isMyTeamLocked ? (
            <div className="px-5 py-2 rounded-2xl bg-slate-800/80 border border-slate-700 text-slate-400 font-bold text-xs flex items-center gap-2">
              <Lock className="w-4 h-4 text-rose-400" />
              <span>Bu mahnı üçün cavab haqqınız bitib</span>
            </div>
          ) : (
            <div className="text-xs text-slate-400 font-medium flex items-center gap-2 animate-pulse">
              <Volume2 className="w-4 h-4 text-amber-400" />
              <span>Musiqini dinləyin &bull; Bilən kimi dərhal zəngə basın!</span>
            </div>
          )}
        </div>

        {/* The Massive Touch Buzzer Button */}
        <div className="relative">
          {/* Pulsing Aura if ready */}
          {!buzzedTeamId && !isMyTeamLocked && (
            <div 
              className="absolute -inset-4 rounded-full opacity-40 blur-xl animate-pulse pointer-events-none"
              style={{ backgroundColor: selectedTeam.color }}
            />
          )}

          <button
            id="team-buzzer-massive-btn"
            disabled={!!buzzedTeamId || isMyTeamLocked}
            onClick={handleBuzzClick}
            className={`w-64 h-64 sm:w-80 sm:h-80 rounded-full flex flex-col items-center justify-center transition-all transform active:scale-90 cursor-pointer shadow-2xl relative select-none border-8 ${
              isMyTeamFirst
                ? 'bg-emerald-500 text-slate-950 border-emerald-300 ring-8 ring-emerald-400/40 scale-105 shadow-emerald-500/50'
                : isOtherTeamFirst || isMyTeamLocked
                ? 'bg-slate-850 text-slate-600 border-slate-800 cursor-not-allowed opacity-60 scale-95 shadow-none'
                : 'text-slate-950 border-amber-300/80 hover:brightness-110 active:brightness-90 ring-8 ring-amber-400/30'
            }`}
            style={{
              backgroundColor: !buzzedTeamId && !isMyTeamLocked ? selectedTeam.color : undefined
            }}
          >
            <Bell className={`w-20 h-20 sm:w-24 sm:h-24 mb-3 ${
              isMyTeamFirst ? 'animate-bounce' : !buzzedTeamId && !isMyTeamLocked ? 'animate-wiggle' : ''
            }`} />
            
            <span className="text-2xl sm:text-3xl font-black font-display uppercase tracking-wider">
              {isMyTeamFirst ? 'BİZ BASDIQ!' : isOtherTeamFirst ? 'GÖZLƏYİN' : isMyTeamLocked ? 'BLOKLANDI' : 'ZƏNGİ BAS!'}
            </span>

            <span className="text-[11px] font-bold opacity-80 mt-1 uppercase tracking-widest">
              {!buzzedTeamId && !isMyTeamLocked ? 'Toxunun' : ''}
            </span>
          </button>
        </div>

        {/* Footnote */}
        <div className="mt-8 text-xs text-slate-500 max-w-xs">
          Aparıcı səhv və ya düzgün cavab təyin edəndə düymə avtomatik yenidən aktivləşəcək.
        </div>
      </main>
    </div>
  );
};
