import React from 'react';
import { Team, TournamentStage } from '../types';
import { Trophy, Plus, Minus, Crown, CheckCircle2, XCircle, Volume2 } from 'lucide-react';
import { playBuzzerSound } from '../utils/soundEffects';

interface ScoreboardProps {
  teams: Team[];
  currentStage: TournamentStage;
  onUpdateScore: (teamId: string, delta: number, reason: string) => void;
  activeBuzzerTeamId?: string | null;
  onManualBuzz?: (teamId: string) => void;
}

export const Scoreboard: React.FC<ScoreboardProps> = ({
  teams,
  currentStage,
  onUpdateScore,
  activeBuzzerTeamId,
  onManualBuzz
}) => {
  // Sort teams by score descending for ranking
  const rankedTeams = [...teams].sort((a, b) => b.score - a.score);

  return (
    <section aria-label="Turnir cədvəli" className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 shadow-xl backdrop-blur-sm">
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <Trophy className="w-4 h-4 text-amber-400" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300 font-display">
            Canlı Xal Cədvəli
          </h2>
        </div>
        <div className="text-[11px] text-slate-400">
          {currentStage === 1 && <span className="text-teal-400 font-medium">Tur 1: Heç bir komanda çıxmır</span>}
          {currentStage === 2 && <span className="text-rose-400 font-medium">Tur 2: Ən az xallı 1 komanda tərk edir</span>}
          {currentStage === 3 && <span className="text-amber-400 font-medium">Tur 3: 1 komanda tərk edir • 2 Finalist qalır</span>}
          {currentStage === 4 && <span className="text-amber-300 font-bold">Tur 4: 2 Finalist arasında Böyük Döyüş</span>}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {teams.map((team) => {
          const rank = rankedTeams.findIndex((t) => t.id === team.id) + 1;
          const isBuzzed = activeBuzzerTeamId === team.id;
          const isEliminated = team.status === 'eliminated_r2' || team.status === 'eliminated_r3';
          const isFinalist = team.status === 'finalist' || team.status === 'winner' || team.status === 'runner_up';
          const isWinner = team.status === 'winner';

          return (
            <div
              key={team.id}
              id={`team-card-${team.id}`}
              className={`relative rounded-xl p-3.5 transition-all border flex flex-col justify-between ${
                isBuzzed
                  ? 'ring-4 ring-amber-400 bg-amber-950/40 border-amber-400 scale-[1.02] shadow-xl shadow-amber-500/20 animate-pulse'
                  : isEliminated
                  ? 'bg-slate-900/30 border-slate-800/50 opacity-60 grayscale'
                  : isWinner
                  ? 'bg-gradient-to-b from-amber-500/20 to-slate-900/80 border-amber-400 ring-2 ring-amber-400/50'
                  : 'bg-slate-900/80 hover:bg-slate-850 border-slate-800 hover:border-slate-700'
              }`}
            >
              {/* Header with rank badge & Team name */}
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2 min-w-0">
                  <button
                    id={`team-number-badge-${team.id}`}
                    type="button"
                    onClick={() => {
                      playBuzzerSound();
                      if (onManualBuzz && !isEliminated) {
                        onManualBuzz(team.id);
                      }
                    }}
                    title={`${team.name} - Komanda №${team.buzzerKey || rank} (Siqnalı səsləndir)`}
                    className="w-7 h-7 rounded-lg flex items-center justify-center font-black text-xs shrink-0 text-slate-950 shadow-sm cursor-pointer hover:scale-110 active:scale-90 transition-transform select-none focus:outline-none focus:ring-2 focus:ring-amber-400"
                    style={{ backgroundColor: team.color }}
                  >
                    {isWinner ? <Crown className="w-4 h-4 text-slate-950" /> : (team.buzzerKey || rank)}
                  </button>
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold text-white truncate font-display">
                      {team.name}
                    </h3>
                    <p className="text-[10px] text-slate-400 truncate">
                      {team.members.find((m) => m.role === 'Kapitan')?.name || team.members[0]?.name || '4 iştirakçı'}
                    </p>
                  </div>
                </div>

                {/* Score badge */}
                <div className="text-right">
                  <div className="text-lg font-black tracking-tight text-amber-300 font-display">
                    {team.score}
                    <span className="text-[10px] text-slate-400 ml-0.5 font-normal">xal</span>
                  </div>
                </div>
              </div>

              {/* Status & Buzzer shortcut */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 mt-1">
                <div>
                  {isEliminated ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-rose-400 px-2 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/20">
                      <XCircle className="w-3 h-3" /> Oyunu tərk etdi
                    </span>
                  ) : isWinner ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-300 px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/30">
                      <Crown className="w-3 h-3" /> QALİB
                    </span>
                  ) : isFinalist ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-sky-300 px-2 py-0.5 rounded-full bg-sky-500/10 border border-sky-500/20">
                      <CheckCircle2 className="w-3 h-3" /> Finalist
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-400 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                      Aktiv
                    </span>
                  )}
                </div>

                {/* Buzzer button / keyboard key */}
                <div className="flex items-center gap-1">
                  {onManualBuzz && !isEliminated && (
                    <button
                      id={`manual-buzz-${team.id}`}
                      onClick={() => {
                        playBuzzerSound();
                        onManualBuzz(team.id);
                      }}
                      title={`Buzzer bas (Qısayol düyməsi: ${team.buzzerKey})`}
                      className="px-2 py-1 rounded bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-slate-300 text-[11px] font-bold border border-slate-700 transition-colors flex items-center gap-1"
                    >
                      <Volume2 className="w-3 h-3" />
                      <span>[{team.buzzerKey}] Siqnal</span>
                    </button>
                  )}

                  {/* Manual +/- Score adjust */}
                  <div className="flex items-center gap-0.5">
                    <button
                      id={`score-minus-${team.id}`}
                      onClick={() => onUpdateScore(team.id, -10, 'Münsif düzəlişi (-10)')}
                      title="-10 xal"
                      className="w-5 h-5 rounded bg-slate-800 hover:bg-rose-900/60 text-slate-400 hover:text-rose-200 flex items-center justify-center text-xs transition-colors"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <button
                      id={`score-plus-${team.id}`}
                      onClick={() => onUpdateScore(team.id, 10, 'Münsif düzəlişi (+10)')}
                      title="+10 xal"
                      className="w-5 h-5 rounded bg-slate-800 hover:bg-emerald-900/60 text-slate-400 hover:text-emerald-200 flex items-center justify-center text-xs transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
