import React, { useState, useEffect } from 'react';
import { TournamentStage, Team, SongItem } from './types';
import { 
  INITIAL_TEAMS, 
  STAGE_1_SONGS, 
  STAGE_2_SONGS, 
  STAGE_3_SONGS, 
  STAGE_4_FINALIST_1_SONGS, 
  STAGE_4_FINALIST_2_SONGS 
} from './data/tournamentData';
import { Header } from './components/Header';
import { Scoreboard } from './components/Scoreboard';
import { Stage1MusicCipher } from './components/stages/Stage1MusicCipher';
import { Stage2TimeDuel } from './components/stages/Stage2TimeDuel';
import { Stage3RhythmConfrontation } from './components/stages/Stage3RhythmConfrontation';
import { Stage4FinalChords } from './components/stages/Stage4FinalChords';
import { GrandWinnerModal } from './components/GrandWinnerModal';
import { RulesModal } from './components/RulesModal';
import { TeamManagerModal } from './components/TeamManagerModal';
import { SongManagerModal } from './components/SongManagerModal';
import { InstallAppModal } from './components/InstallAppModal';
import { OfflineIndicator } from './components/OfflineIndicator';
import { TeamBuzzerClient } from './components/TeamBuzzerClient';
import { ImageLightboxModal } from './components/ImageLightboxModal';
import { useConfirm } from './components/ConfirmDialog';
import { Download } from 'lucide-react';

const STORAGE_KEYS = {
  STAGE: 'musiqi_labirinti_stage',
  TEAMS: 'musiqi_labirinti_teams',
  S1_SONGS: 'musiqi_labirinti_s1_songs',
  S2_SONGS: 'musiqi_labirinti_s2_songs',
  S3_SONGS: 'musiqi_labirinti_s3_songs',
  S4_F1_SONGS: 'musiqi_labirinti_s4_f1_songs',
  S4_F2_SONGS: 'musiqi_labirinti_s4_f2_songs',
  CHAMPION_ID: 'musiqi_labirinti_champion_id'
};

export default function App() {
  const confirm = useConfirm();

  // Load state from localStorage or use defaults
  const [currentStage, setCurrentStage] = useState<TournamentStage>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.STAGE);
    return saved ? (parseInt(saved, 10) as TournamentStage) : 1;
  });

  const [teams, setTeams] = useState<Team[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.TEAMS);
    return saved ? JSON.parse(saved) : INITIAL_TEAMS;
  });

  const [stage1Songs, setStage1Songs] = useState<SongItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.S1_SONGS);
    const parsed: SongItem[] = saved ? JSON.parse(saved) : STAGE_1_SONGS;
    return parsed.map(s => (s.category === '80-ci illər' ? { ...s, category: 'Retro mahnılar' } : s));
  });

  const [stage2Songs, setStage2Songs] = useState<SongItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.S2_SONGS);
    return saved ? JSON.parse(saved) : STAGE_2_SONGS;
  });

  const [stage3Songs, setStage3Songs] = useState<SongItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.S3_SONGS);
    return saved ? JSON.parse(saved) : STAGE_3_SONGS;
  });

  const [finalist1Songs, setFinalist1Songs] = useState<SongItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.S4_F1_SONGS);
    return saved ? JSON.parse(saved) : STAGE_4_FINALIST_1_SONGS;
  });

  const [finalist2Songs, setFinalist2Songs] = useState<SongItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.S4_F2_SONGS);
    return saved ? JSON.parse(saved) : STAGE_4_FINALIST_2_SONGS;
  });

  const [championTeamId, setChampionTeamId] = useState<string | null>(() => {
    return localStorage.getItem(STORAGE_KEYS.CHAMPION_ID);
  });

  // UI Modals
  const [showRulesModal, setShowRulesModal] = useState(false);
  const [showTeamsModal, setShowTeamsModal] = useState(false);
  const [showWinnerModal, setShowWinnerModal] = useState(false);
  const [showSongManagerModal, setShowSongManagerModal] = useState(false);
  const [showInstallModal, setShowInstallModal] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Fullscreen Image Lightbox
  const [lightboxData, setLightboxData] = useState<{
    isOpen: boolean;
    imageUrl: string | null;
    title: string;
    subtitle?: string;
  }>({
    isOpen: false,
    imageUrl: null,
    title: '',
    subtitle: ''
  });

  const handleOpenLightbox = (imageUrl: string, title: string, subtitle?: string) => {
    setLightboxData({
      isOpen: true,
      imageUrl,
      title,
      subtitle
    });
  };

  // Check if opened in client buzzer mode (e.g., from QR code ?mode=buzzer)
  const [isBuzzerClientMode, setIsBuzzerClientMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      return params.get('mode') === 'buzzer';
    }
    return false;
  });

  const [clientTeamParam] = useState(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      return params.get('team');
    }
    return null;
  });

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.STAGE, currentStage.toString());
  }, [currentStage]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TEAMS, JSON.stringify(teams));
  }, [teams]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.S1_SONGS, JSON.stringify(stage1Songs));
  }, [stage1Songs]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.S2_SONGS, JSON.stringify(stage2Songs));
  }, [stage2Songs]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.S3_SONGS, JSON.stringify(stage3Songs));
  }, [stage3Songs]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.S4_F1_SONGS, JSON.stringify(finalist1Songs));
  }, [finalist1Songs]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.S4_F2_SONGS, JSON.stringify(finalist2Songs));
  }, [finalist2Songs]);

  useEffect(() => {
    if (championTeamId) {
      localStorage.setItem(STORAGE_KEYS.CHAMPION_ID, championTeamId);
    } else {
      localStorage.removeItem(STORAGE_KEYS.CHAMPION_ID);
    }
  }, [championTeamId]);

  // Fullscreen listener
  useEffect(() => {
    const onFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', onFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => console.warn(err));
    } else {
      document.exitFullscreen().catch((err) => console.warn(err));
    }
  };

  // Award points to a team from a song
  const handleAwardPoints = (songId: string, teamId: string, points: number) => {
    // 1. Update team score
    setTeams(prev =>
      prev.map(t => (t.id === teamId ? { ...t, score: t.score + points } : t))
    );

    // 2. Mark song as awarded in appropriate list
    const updateSongList = (list: SongItem[]) =>
      list.map(s => (s.id === songId ? { ...s, awardedTeamId: teamId, pointsEarned: points, revealed: true } : s));

    if (currentStage === 1) setStage1Songs(updateSongList);
    else if (currentStage === 2) setStage2Songs(updateSongList);
    else if (currentStage === 3) setStage3Songs(updateSongList);
  };

  // Manual score adjustment by host/jury
  const handleUpdateManualScore = (teamId: string, delta: number) => {
    setTeams(prev =>
      prev.map(t => (t.id === teamId ? { ...t, score: Math.max(0, t.score + delta) } : t))
    );
  };

  // Team elimination
  const handleEliminateTeam = (teamId: string) => {
    setTeams(prev =>
      prev.map(t => {
        if (t.id === teamId) {
          return {
            ...t,
            status: currentStage === 2 ? 'eliminated_r2' : 'eliminated_r3'
          };
        }
        return t;
      })
    );
  };

  // Crown Champion
  const handleSetChampion = (winnerId: string) => {
    setChampionTeamId(winnerId);
    setTeams(prev =>
      prev.map(t => {
        if (t.id === winnerId) return { ...t, status: 'winner' };
        if (t.status === 'finalist' || t.status === 'active') return { ...t, status: 'runner_up' };
        return t;
      })
    );
  };

  // Full tournament reset — resets scores/teams/stage only.
  // Custom song list and uploaded audio are intentionally left untouched;
  // use "Standartlara Qayıt" inside the Song Manager if you want to reset songs too.
  const handleResetTournament = async () => {
    const ok = await confirm({
      title: 'Turniri sıfırla',
      message: 'Bütün komandaların xalları sıfırlanacaq və 1-ci turdan başlanacaq. (Mahnı siyahınız və yüklədiyiniz audio fayllar TOXUNULMAZ qalacaq.)',
      confirmLabel: 'Bəli, sıfırla',
      cancelLabel: 'İmtina'
    });
    if (ok) {
      localStorage.removeItem(STORAGE_KEYS.STAGE);
      localStorage.removeItem(STORAGE_KEYS.TEAMS);
      localStorage.removeItem(STORAGE_KEYS.CHAMPION_ID);
      setTeams(INITIAL_TEAMS);
      setChampionTeamId(null);
      setCurrentStage(1);
    }
  };

  const championTeam = teams.find(t => t.id === championTeamId) || teams[0];
  const runnerUpTeam = teams.find(t => t.status === 'runner_up');

  // If in client buzzer mode, render isolated mobile buzzer pad
  if (isBuzzerClientMode) {
    return (
      <TeamBuzzerClient
        teams={teams}
        initialTeamId={clientTeamParam}
        onExit={() => {
          setIsBuzzerClientMode(false);
          if (typeof window !== 'undefined') {
            const url = new URL(window.location.href);
            url.searchParams.delete('mode');
            url.searchParams.delete('team');
            window.history.replaceState({}, '', url.toString());
          }
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-amber-500 selection:text-slate-950">
      {/* Top Header */}
      <Header
        currentStage={currentStage}
        onSelectStage={(s) => setCurrentStage(s)}
        onOpenRules={() => setShowRulesModal(true)}
        onOpenTeams={() => setShowTeamsModal(true)}
        onOpenSongManager={() => setShowSongManagerModal(true)}
        onResetTournament={handleResetTournament}
        isFullscreen={isFullscreen}
        onToggleFullscreen={toggleFullscreen}
        onOpenLightbox={handleOpenLightbox}
      />

      {/* Main Stage Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 lg:p-8 space-y-6">
        {/* Live Scoreboard */}
        <Scoreboard
          teams={teams}
          currentStage={currentStage}
          onUpdateScore={handleUpdateManualScore}
        />

        {/* Dynamic Stage View */}
        {currentStage === 1 && (
          <Stage1MusicCipher
            songs={stage1Songs}
            teams={teams}
            onAwardPoints={handleAwardPoints}
            onProceedToNextStage={() => setCurrentStage(2)}
            onOpenLightbox={handleOpenLightbox}
          />
        )}

        {currentStage === 2 && (
          <Stage2TimeDuel
            songs={stage2Songs}
            teams={teams}
            onAwardPoints={handleAwardPoints}
            onEliminateTeam={handleEliminateTeam}
            onProceedToNextStage={() => setCurrentStage(3)}
            onOpenLightbox={handleOpenLightbox}
          />
        )}

        {currentStage === 3 && (
          <Stage3RhythmConfrontation
            songs={stage3Songs}
            teams={teams}
            onAwardPoints={handleAwardPoints}
            onEliminateTeam={handleEliminateTeam}
            onProceedToNextStage={() => {
              // Mark finalists
              const active = teams
                .filter(t => t.status !== 'eliminated_r2' && t.status !== 'eliminated_r3')
                .sort((a, b) => b.score - a.score);
              const top2Ids = active.slice(0, 2).map(t => t.id);
              setTeams(prev =>
                prev.map(t => (top2Ids.includes(t.id) ? { ...t, status: 'finalist' } : t))
              );
              setCurrentStage(4);
            }}
            onOpenLightbox={handleOpenLightbox}
          />
        )}

        {currentStage === 4 && (
          <Stage4FinalChords
            finalist1Songs={finalist1Songs}
            finalist2Songs={finalist2Songs}
            teams={teams}
            onSetChampion={handleSetChampion}
            onOpenChampionModal={() => setShowWinnerModal(true)}
            onOpenLightbox={handleOpenLightbox}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-4 px-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <span>
            &ldquo;ASAN Könüllüləri&rdquo; Təşkilatı &bull; 2 saylı Sumqayıt Regional &ldquo;ASAN Xidmət&rdquo; Mərkəzi &copy; 2026
          </span>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowInstallModal(true)}
              className="text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Tətbiqi Yüklə / Quraşdır</span>
            </button>
            <span className="text-slate-700">•</span>
            <span className="text-slate-400">
              18 Sentyabr &mdash; Milli Musiqi Günü &ldquo;Musiqi Labirinti&rdquo;
            </span>
          </div>
        </div>
      </footer>

      {/* Offline Connectivity Indicator */}
      <OfflineIndicator />

      {/* Fullscreen Image Lightbox Modal */}
      <ImageLightboxModal
        isOpen={lightboxData.isOpen}
        imageUrl={lightboxData.imageUrl}
        title={lightboxData.title}
        subtitle={lightboxData.subtitle}
        onClose={() => setLightboxData(prev => ({ ...prev, isOpen: false }))}
      />

      {/* Modals */}
      {showRulesModal && <RulesModal onClose={() => setShowRulesModal(false)} />}

      {showInstallModal && <InstallAppModal onClose={() => setShowInstallModal(false)} />}

      {showSongManagerModal && (
        <SongManagerModal
          stage1Songs={stage1Songs}
          stage2Songs={stage2Songs}
          stage3Songs={stage3Songs}
          finalist1Songs={finalist1Songs}
          finalist2Songs={finalist2Songs}
          onSave={(s1, s2, s3, f1, f2) => {
            setStage1Songs(s1);
            setStage2Songs(s2);
            setStage3Songs(s3);
            setFinalist1Songs(f1);
            setFinalist2Songs(f2);
          }}
          onClose={() => setShowSongManagerModal(false)}
        />
      )}

      {showTeamsModal && (
        <TeamManagerModal
          teams={teams}
          onSaveTeams={(updated) => setTeams(updated)}
          onClose={() => setShowTeamsModal(false)}
        />
      )}

      {showWinnerModal && championTeam && (
        <GrandWinnerModal
          winner={championTeam}
          runnerUp={runnerUpTeam}
          onClose={() => setShowWinnerModal(false)}
          onResetTournament={handleResetTournament}
        />
      )}
    </div>
  );
}
