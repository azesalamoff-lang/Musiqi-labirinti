export type TournamentStage = 1 | 2 | 3 | 4;

export type TeamStatus = 'active' | 'eliminated_r2' | 'eliminated_r3' | 'finalist' | 'winner' | 'runner_up';

export interface TeamMember {
  id: string;
  name: string;
  role?: string;
}

export interface Team {
  id: string;
  name: string;
  color: string;
  bgGlow: string;
  borderColor: string;
  badgeBg: string;
  members: TeamMember[];
  score: number;
  status: TeamStatus;
  buzzerKey: string; // Keyboard shortcut e.g. '1', '2', '3', '4'
  finalistMemberId?: string;
  finalistCorrectCount?: number;
}

export interface MusicalNote {
  freq: number;
  duration: number; // in seconds
  type?: OscillatorType;
}

export interface SongItem {
  id: string;
  title: string;
  artistOrComposer: string;
  category?: string; // For Round 1: 'Retro mahnılar' | '90-cı illər' | 'Kino musiqiləri' | 'Xalq mahnıları'
  stage: 1 | 2 | 3 | 4;
  numberInRound?: number;
  audioUrl?: string; // Optional custom uploaded audio file
  hasCustomAudio?: boolean; // True if audio file stored in IndexedDB
  customAudioFileName?: string;
  clipStartSeconds?: number; // Where playback starts within the uploaded MP3 (seconds)
  clipDurationSeconds?: number; // How many seconds to play before auto-stopping (undefined/0 = play to the end)
  melodyNotes?: MusicalNote[]; // Built-in synthesized authentic melody
  year?: string;
  hint?: string;
  revealed?: boolean;
  played?: boolean;
  awardedTeamId?: string;
  pointsEarned?: number;
}

export interface BuzzerState {
  isLocked: boolean;
  activeTeamId: string | null;
  buzzerTimestamp: number | null;
  failedTeamIds: string[]; // Teams that gave wrong answer and can't buzz again for this song
}

export interface BlitzSession {
  teamId: string;
  finalistName: string;
  timeLeft: number;
  isRunning: boolean;
  currentSongIndex: number;
  answers: {
    songId: string;
    isCorrect: boolean;
    skipped: boolean;
  }[];
  completed: boolean;
}

export interface ScoreLogEntry {
  id: string;
  timestamp: number;
  stage: number;
  teamId: string;
  teamName: string;
  points: number;
  reason: string;
}
