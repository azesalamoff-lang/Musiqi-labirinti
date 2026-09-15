import React, { useState } from 'react';
import { Team } from '../types';
import { Users, Save, X, Edit3 } from 'lucide-react';

interface TeamManagerModalProps {
  teams: Team[];
  onSaveTeams: (updatedTeams: Team[]) => void;
  onClose: () => void;
}

export const TeamManagerModal: React.FC<TeamManagerModalProps> = ({
  teams,
  onSaveTeams,
  onClose
}) => {
  const [editedTeams, setEditedTeams] = useState<Team[]>(JSON.parse(JSON.stringify(teams)));

  const handleNameChange = (teamId: string, newName: string) => {
    setEditedTeams(prev =>
      prev.map(t => (t.id === teamId ? { ...t, name: newName } : t))
    );
  };

  const handleMemberChange = (teamId: string, memberIndex: number, newMemberName: string) => {
    setEditedTeams(prev =>
      prev.map(t => {
        if (t.id !== teamId) return t;
        const newMembers = [...t.members];
        if (newMembers[memberIndex]) {
          newMembers[memberIndex] = { ...newMembers[memberIndex], name: newMemberName };
        }
        return { ...t, members: newMembers };
      })
    );
  };

  const handleSave = () => {
    onSaveTeams(editedTeams);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-3xl rounded-3xl p-6 sm:p-8 shadow-2xl relative my-8">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center text-sm transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-800">
          <div className="w-10 h-10 rounded-2xl bg-sky-500/20 border border-sky-500/40 text-sky-400 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-white font-display">
              Komandalar və Könüllülər Tərkibi
            </h2>
            <p className="text-xs text-slate-400">
              4 komanda, hər birində 4 nəfər könüllü (cəmi 16 iştirakçı)
            </p>
          </div>
        </div>

        {/* 4 Teams Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          {editedTeams.map((team) => (
            <div
              key={team.id}
              className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3"
            >
              {/* Team Name Input */}
              <div className="flex items-center gap-2">
                <div
                  className="w-4 h-4 rounded-full shrink-0"
                  style={{ backgroundColor: team.color }}
                />
                <input
                  type="text"
                  value={team.name}
                  onChange={(e) => handleNameChange(team.id, e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-sm font-bold text-white focus:ring-1 focus:ring-amber-400 focus:outline-none"
                  placeholder="Komanda adı..."
                />
              </div>

              {/* 4 Members */}
              <div className="space-y-1.5 pt-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  Könüllü Heyəti (4 nəfər):
                </span>
                {team.members.map((member, mIdx) => (
                  <div key={member.id} className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-400 w-4">{mIdx + 1}.</span>
                    <input
                      type="text"
                      value={member.name}
                      onChange={(e) => handleMemberChange(team.id, mIdx, e.target.value)}
                      className="w-full bg-slate-850 border border-slate-750 rounded-lg px-2.5 py-1 text-xs text-slate-200 focus:ring-1 focus:ring-sky-400 focus:outline-none"
                      placeholder={`İştirakçı ${mIdx + 1} adı...`}
                    />
                    {mIdx === 0 && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30 shrink-0">
                        Kapitan
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
          >
            Ləğv et
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-amber-500/20 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Dəyişiklikləri Yadda Saxla</span>
          </button>
        </div>
      </div>
    </div>
  );
};
