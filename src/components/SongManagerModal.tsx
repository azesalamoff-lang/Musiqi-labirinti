import React, { useState, useRef } from 'react';
import { SongItem, TournamentStage } from '../types';
import { 
  X, 
  Music, 
  Upload, 
  Trash2, 
  Play, 
  Square, 
  RotateCcw, 
  Save, 
  Check, 
  Plus, 
  Search, 
  Sparkles,
  FileAudio,
  HardDrive,
  Layers,
  Tag,
  ArrowRight,
  HelpCircle,
  Download,
  FolderUp,
  Loader2,
  FileArchive,
  Scissors
} from 'lucide-react';
import { 
  saveAudioTrack, 
  deleteAudioTrack, 
  clearAllAudioTracks,
  exportTournamentBackupZip,
  importTournamentBackupZip
} from '../utils/audioStorage';
import { 
  playSongAudioOrMelody, 
  stopAllPlayback 
} from '../utils/soundEffects';
import { useConfirm } from './ConfirmDialog';
import { 
  STAGE_1_SONGS, 
  STAGE_2_SONGS, 
  STAGE_3_SONGS, 
  STAGE_4_FINALIST_1_SONGS, 
  STAGE_4_FINALIST_2_SONGS 
} from '../data/tournamentData';

interface SongManagerModalProps {
  stage1Songs: SongItem[];
  stage2Songs: SongItem[];
  stage3Songs: SongItem[];
  finalist1Songs: SongItem[];
  finalist2Songs: SongItem[];
  onSave: (
    s1: SongItem[],
    s2: SongItem[],
    s3: SongItem[],
    f1: SongItem[],
    f2: SongItem[]
  ) => void;
  onClose: () => void;
}

const STAGE_1_DEFAULT_CATEGORIES = [
  'Retro mahnılar',
  '90-cı illər',
  'Kino musiqiləri',
  'Xalq mahnıları'
];

export const SongManagerModal: React.FC<SongManagerModalProps> = ({
  stage1Songs,
  stage2Songs,
  stage3Songs,
  finalist1Songs,
  finalist2Songs,
  onSave,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<1 | 2 | 3 | 4>(1);
  const [stage4SubTab, setStage4SubTab] = useState<'f1' | 'f2'>('f1');
  const [searchQuery, setSearchQuery] = useState('');
  const [savedToast, setSavedToast] = useState(false);
  const [lastAddedId, setLastAddedId] = useState<string | null>(null);

  // Local editable copies of lists
  const [s1, setS1] = useState<SongItem[]>([...stage1Songs]);
  const [s2, setS2] = useState<SongItem[]>([...stage2Songs]);
  const [s3, setS3] = useState<SongItem[]>([...stage3Songs]);
  const [f1, setF1] = useState<SongItem[]>([...finalist1Songs]);
  const [f2, setF2] = useState<SongItem[]>([...finalist2Songs]);

  // Dedicated Add New Song dialog state
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newStageTarget, setNewStageTarget] = useState<'1' | '2' | '3' | '4_f1' | '4_f2'>('1');
  const [newCategorySelect, setNewCategorySelect] = useState<string>('Retro mahnılar');
  const [newCustomCategory, setNewCustomCategory] = useState<string>('');
  const [newSongNumber, setNewSongNumber] = useState<number>(1);
  const [newSongTitle, setNewSongTitle] = useState<string>('');
  const [newSongArtist, setNewSongArtist] = useState<string>('');
  const [newSongAudioFile, setNewSongAudioFile] = useState<File | null>(null);
  const [isUploadingNew, setIsUploadingNew] = useState(false);

  // Audio testing state
  const [playingSongId, setPlayingSongId] = useState<string | null>(null);
  const confirm = useConfirm();

  // Backup Export & Import State
  const [isExportingBackup, setIsExportingBackup] = useState(false);
  const [isImportingBackup, setIsImportingBackup] = useState(false);
  const [backupProgressPercent, setBackupProgressPercent] = useState(0);
  const [backupProgressStatus, setBackupProgressStatus] = useState('');
  const [backupSuccessToast, setBackupSuccessToast] = useState<string | null>(null);
  const backupImportInputRef = useRef<HTMLInputElement | null>(null);

  // File input ref for each song
  const fileInputRefs = useRef<{ [songId: string]: HTMLInputElement | null }>({});
  const newFileInputRef = useRef<HTMLInputElement | null>(null);

  // Derive unique categories from current stage 1 songs
  const stage1Categories = Array.from(
    new Set([...STAGE_1_DEFAULT_CATEGORIES, ...s1.map(s => s.category).filter(Boolean) as string[]])
  );

  const getCurrentSongsList = (): { 
    list: SongItem[]; 
    setter: React.Dispatch<React.SetStateAction<SongItem[]>>;
    currentKey: '1' | '2' | '3' | '4_f1' | '4_f2';
  } => {
    switch (activeTab) {
      case 1:
        return { list: s1, setter: setS1, currentKey: '1' };
      case 2:
        return { list: s2, setter: setS2, currentKey: '2' };
      case 3:
        return { list: s3, setter: setS3, currentKey: '3' };
      case 4:
        return stage4SubTab === 'f1' 
          ? { list: f1, setter: setF1, currentKey: '4_f1' } 
          : { list: f2, setter: setF2, currentKey: '4_f2' };
    }
  };

  const { list: currentList, setter: currentSetter, currentKey } = getCurrentSongsList();

  const filteredSongs = currentList.filter(s => 
    s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.artistOrComposer.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (s.category && s.category.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleFieldChange = (id: string, field: keyof SongItem, value: any) => {
    currentSetter(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, [field]: value };
      }
      return item;
    }));
  };

  // Move song to another stage or sub-tab
  const handleMoveSongStage = (
    songId: string, 
    fromKey: '1' | '2' | '3' | '4_f1' | '4_f2', 
    toKey: '1' | '2' | '3' | '4_f1' | '4_f2'
  ) => {
    if (fromKey === toKey) return;

    let targetSong: SongItem | undefined;
    if (fromKey === '1') {
      targetSong = s1.find(s => s.id === songId);
      setS1(prev => prev.filter(s => s.id !== songId));
    } else if (fromKey === '2') {
      targetSong = s2.find(s => s.id === songId);
      setS2(prev => prev.filter(s => s.id !== songId));
    } else if (fromKey === '3') {
      targetSong = s3.find(s => s.id === songId);
      setS3(prev => prev.filter(s => s.id !== songId));
    } else if (fromKey === '4_f1') {
      targetSong = f1.find(s => s.id === songId);
      setF1(prev => prev.filter(s => s.id !== songId));
    } else if (fromKey === '4_f2') {
      targetSong = f2.find(s => s.id === songId);
      setF2(prev => prev.filter(s => s.id !== songId));
    }

    if (!targetSong) return;

    const newStageNum: TournamentStage = toKey === '1' ? 1 : toKey === '2' ? 2 : toKey === '3' ? 3 : 4;
    const movedSong: SongItem = {
      ...targetSong,
      stage: newStageNum,
      category: toKey === '1' ? (targetSong.category || 'Retro mahnılar') : undefined,
      numberInRound: toKey === '1' ? 1 : undefined
    };

    if (toKey === '1') {
      setS1(prev => [movedSong, ...prev]);
      setActiveTab(1);
    } else if (toKey === '2') {
      setS2(prev => [movedSong, ...prev]);
      setActiveTab(2);
    } else if (toKey === '3') {
      setS3(prev => [movedSong, ...prev]);
      setActiveTab(3);
    } else if (toKey === '4_f1') {
      setF1(prev => [movedSong, ...prev]);
      setActiveTab(4);
      setStage4SubTab('f1');
    } else if (toKey === '4_f2') {
      setF2(prev => [movedSong, ...prev]);
      setActiveTab(4);
      setStage4SubTab('f2');
    }

    setLastAddedId(movedSong.id);
  };

  const handleFileUpload = async (songId: string, file: File) => {
    if (!file) return;

    if (file.size > 30 * 1024 * 1024) {
      alert('Audio faylın həcmi çox böyükdür (maksimum 30 MB). Zəhmət olmasa daha kiçik fayl seçin.');
      return;
    }

    try {
      await saveAudioTrack(songId, file, file.name);

      currentSetter(prev => prev.map(item => {
        if (item.id === songId) {
          return { 
            ...item, 
            hasCustomAudio: true, 
            customAudioFileName: file.name 
          };
        }
        return item;
      }));
    } catch (err) {
      console.error('Audio faylı saxlamaq mümkün olmadı:', err);
      alert('Audio faylı yaddaşda saxlamaq mümkün olmadı.');
    }
  };

  const handleRemoveAudio = async (songId: string) => {
    if (playingSongId === songId) {
      stopAllPlayback();
      setPlayingSongId(null);
    }
    await deleteAudioTrack(songId);
    currentSetter(prev => prev.map(item => {
      if (item.id === songId) {
        return {
          ...item,
          hasCustomAudio: false,
          customAudioFileName: undefined
        };
      }
      return item;
    }));
  };

  const handlePlayToggle = async (song: SongItem) => {
    if (playingSongId === song.id) {
      stopAllPlayback();
      setPlayingSongId(null);
      return;
    }

    stopAllPlayback();
    setPlayingSongId(song.id);

    await playSongAudioOrMelody(
      song.id,
      song.melodyNotes,
      undefined,
      () => {
        setPlayingSongId(null);
      },
      song.clipStartSeconds,
      song.clipDurationSeconds
    );
  };

  // Open the Add Dialog with smart defaults based on current active tab
  const handleOpenAddDialog = () => {
    let defaultTarget: '1' | '2' | '3' | '4_f1' | '4_f2' = '1';
    if (activeTab === 2) defaultTarget = '2';
    else if (activeTab === 3) defaultTarget = '3';
    else if (activeTab === 4) defaultTarget = stage4SubTab === 'f1' ? '4_f1' : '4_f2';

    setNewStageTarget(defaultTarget);
    setNewCategorySelect('Retro mahnılar');
    setNewCustomCategory('');
    setNewSongNumber(1);
    setNewSongTitle('');
    setNewSongArtist('');
    setNewSongAudioFile(null);
    setShowAddDialog(true);
  };

  // Submit and create new song
  const handleCreateSongSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploadingNew(true);

    try {
      const stageNum: TournamentStage = 
        newStageTarget === '1' ? 1 : 
        newStageTarget === '2' ? 2 : 
        newStageTarget === '3' ? 3 : 4;

      const finalCategory = newStageTarget === '1' 
        ? (newCategorySelect === '__custom__' ? (newCustomCategory.trim() || 'Xüsusi') : newCategorySelect)
        : undefined;

      const newId = `custom_${newStageTarget}_${Date.now()}`;

      // Save custom audio file if provided
      if (newSongAudioFile) {
        await saveAudioTrack(newId, newSongAudioFile, newSongAudioFile.name);
      }

      const createdSong: SongItem = {
        id: newId,
        title: newSongTitle.trim() || 'Yeni Mahnı',
        artistOrComposer: newSongArtist.trim() || 'Məlum deyil',
        category: finalCategory,
        stage: stageNum,
        numberInRound: newStageTarget === '1' ? Number(newSongNumber) || 1 : undefined,
        hasCustomAudio: !!newSongAudioFile,
        customAudioFileName: newSongAudioFile?.name
      };

      // Add to beginning of respective list so it is instantly seen
      if (newStageTarget === '1') {
        setS1(prev => [createdSong, ...prev]);
        setActiveTab(1);
      } else if (newStageTarget === '2') {
        setS2(prev => [createdSong, ...prev]);
        setActiveTab(2);
      } else if (newStageTarget === '3') {
        setS3(prev => [createdSong, ...prev]);
        setActiveTab(3);
      } else if (newStageTarget === '4_f1') {
        setF1(prev => [createdSong, ...prev]);
        setActiveTab(4);
        setStage4SubTab('f1');
      } else if (newStageTarget === '4_f2') {
        setF2(prev => [createdSong, ...prev]);
        setActiveTab(4);
        setStage4SubTab('f2');
      }

      setSearchQuery('');
      setLastAddedId(newId);
      setShowAddDialog(false);
    } catch (err) {
      console.error('Mahnını əlavə etmək mümkün olmadı:', err);
      alert('Mahnı əlavə edilərkən xəta baş verdi.');
    } finally {
      setIsUploadingNew(false);
    }
  };

  const handleDeleteSong = (id: string) => {
    if (playingSongId === id) {
      stopAllPlayback();
      setPlayingSongId(null);
    }
    deleteAudioTrack(id);
    currentSetter(prev => prev.filter(item => item.id !== id));
  };

  const handleResetToDefaults = async () => {
    const ok = await confirm({
      title: 'Standartlara qayıt',
      message: 'Bütün musiqiləri və yüklənmiş MP3 faylları ilkin standart vəziyyətinə qaytarmaq istəyirsiniz? Bu geri qaytarıla bilməz.',
      confirmLabel: 'Bəli, standartlara qaytar',
      cancelLabel: 'İmtina'
    });
    if (ok) {
      stopAllPlayback();
      setPlayingSongId(null);
      await clearAllAudioTracks();
      setS1([...STAGE_1_SONGS]);
      setS2([...STAGE_2_SONGS]);
      setS3([...STAGE_3_SONGS]);
      setF1([...STAGE_4_FINALIST_1_SONGS]);
      setF2([...STAGE_4_FINALIST_2_SONGS]);
      onSave(
        STAGE_1_SONGS,
        STAGE_2_SONGS,
        STAGE_3_SONGS,
        STAGE_4_FINALIST_1_SONGS,
        STAGE_4_FINALIST_2_SONGS
      );
      setSavedToast(true);
      setTimeout(() => setSavedToast(false), 2000);
    }
  };

  const handleSaveAll = () => {
    stopAllPlayback();
    setPlayingSongId(null);
    onSave(s1, s2, s3, f1, f2);
    setSavedToast(true);
    setTimeout(() => {
      setSavedToast(false);
      onClose();
    }, 800);
  };

  const handleExportBackup = async () => {
    try {
      stopAllPlayback();
      setPlayingSongId(null);
      setIsExportingBackup(true);
      setBackupProgressPercent(5);
      setBackupProgressStatus('Yedəkləmə paketi hazırlanır...');

      const songsData = {
        stage1: s1,
        stage2: s2,
        stage3: s3,
        finalist1: f1,
        finalist2: f2
      };

      const zipBlob = await exportTournamentBackupZip(songsData, (percent, status) => {
        setBackupProgressPercent(percent);
        setBackupProgressStatus(status);
      });

      // Trigger browser download of the ZIP file
      const downloadUrl = URL.createObjectURL(zipBlob);
      const downloadAnchor = document.createElement('a');
      const dateStr = new Date().toISOString().slice(0, 10);
      downloadAnchor.href = downloadUrl;
      downloadAnchor.download = `MusiqiLabirinti_Yedek_${dateStr}.zip`;
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      document.body.removeChild(downloadAnchor);
      URL.revokeObjectURL(downloadUrl);

      setBackupSuccessToast('Bütün mahnılar və audio fayllar uğurla ZIP faylına ixrac edildi!');
      setTimeout(() => setBackupSuccessToast(null), 4000);
    } catch (err) {
      console.error('Export backup error:', err);
      alert('Yedək faylı yaradılarkən xəta baş verdi.');
    } finally {
      setIsExportingBackup(false);
    }
  };

  const handleImportBackupFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset input value so same file can be re-selected if needed
    e.target.value = '';

    if (!(await confirm({
      title: 'Yedəyi bərpa et',
      message: `"${file.name}" faylındakı mahnılar və audio fayllar bərpa edilsin? Mövcud mahnı siyahısı bu fayldakı ilə əvəzlənəcək.`,
      confirmLabel: 'Bəli, bərpa et',
      cancelLabel: 'İmtina'
    }))) {
      return;
    }

    try {
      stopAllPlayback();
      setPlayingSongId(null);
      setIsImportingBackup(true);
      setBackupProgressPercent(5);
      setBackupProgressStatus('Fayl oxunur...');

      const restoredSongs = await importTournamentBackupZip(file, (percent, status) => {
        setBackupProgressPercent(percent);
        setBackupProgressStatus(status);
      });

      if (restoredSongs) {
        if (restoredSongs.stage1) setS1(restoredSongs.stage1);
        if (restoredSongs.stage2) setS2(restoredSongs.stage2);
        if (restoredSongs.stage3) setS3(restoredSongs.stage3);
        if (restoredSongs.finalist1) setF1(restoredSongs.finalist1);
        if (restoredSongs.finalist2) setF2(restoredSongs.finalist2);

        // Also persist to current active parent state
        onSave(
          restoredSongs.stage1 || s1,
          restoredSongs.stage2 || s2,
          restoredSongs.stage3 || s3,
          restoredSongs.finalist1 || f1,
          restoredSongs.finalist2 || f2
        );

        setBackupSuccessToast('Yedək paketi və bütün MP3 fayllar uğurla tətbiqə yükləndi!');
        setTimeout(() => setBackupSuccessToast(null), 4000);
      }
    } catch (err: any) {
      console.error('Import backup error:', err);
      alert(`Yedək faylı idxal edilərkən xəta baş verdi: ${err?.message || 'Bilinməyən xəta'}`);
    } finally {
      setIsImportingBackup(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-5xl rounded-3xl p-5 sm:p-7 shadow-2xl relative my-auto max-h-[92vh] flex flex-col animate-in fade-in zoom-in-95">
        {/* Close button — now always saves before closing, so edits are never lost */}
        <button
          onClick={handleSaveAll}
          title="Bağla (dəyişikliklər avtomatik yadda saxlanılır)"
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center text-sm transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center shadow-lg shadow-amber-500/10 shrink-0">
              <Music className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black text-white font-display">
                  Musiqi və Mahnı Redaktoru
                </h2>
                <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                  <HardDrive className="w-3 h-3" /> IndexedDB Yaddaş
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Mahnıların turunu və kateqoriyasını təyin edin, yeni mahnı əlavə edin və öz MP3 faylınızı yükləyin.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Hidden file input for Backup ZIP import */}
            <input
              type="file"
              ref={backupImportInputRef}
              onChange={handleImportBackupFileSelected}
              accept=".zip,application/zip,application/x-zip-compressed,application/octet-stream"
              className="hidden"
            />

            <button
              onClick={() => backupImportInputRef.current?.click()}
              disabled={isExportingBackup || isImportingBackup}
              className="px-3 py-1.5 rounded-xl bg-sky-950/60 hover:bg-sky-900/80 text-sky-300 text-xs font-semibold flex items-center gap-1.5 border border-sky-600/40 hover:border-sky-500/60 transition-all cursor-pointer disabled:opacity-50"
              title="Fayldan (ZIP) bütün mahnıları və audionu başqa kompüterə köçür / bərpa et"
            >
              <FolderUp className="w-3.5 h-3.5 text-sky-400" />
              <span>Yedəyi İdxal Et</span>
            </button>

            <button
              onClick={handleExportBackup}
              disabled={isExportingBackup || isImportingBackup}
              className="px-3 py-1.5 rounded-xl bg-teal-950/60 hover:bg-teal-900/80 text-teal-300 text-xs font-semibold flex items-center gap-1.5 border border-teal-600/40 hover:border-teal-500/60 transition-all cursor-pointer disabled:opacity-50"
              title="Bütün mahnı siyahısını və yüklənmiş MP3 faylları tək bir ZIP faylı kimi yüklə"
            >
              <Download className="w-3.5 h-3.5 text-teal-400" />
              <span>Yedəyi İxrac Et (ZIP)</span>
            </button>

            <button
              onClick={handleResetToDefaults}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-rose-300 text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition-colors cursor-pointer"
              title="Standart mahnı siyahısına qaytar"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Standartlara Qayıt</span>
            </button>

            <button
              onClick={handleSaveAll}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-lg shadow-amber-500/20 transition-all active:scale-95 cursor-pointer"
            >
              {savedToast ? <Check className="w-4 h-4 text-slate-950" /> : <Save className="w-4 h-4 text-slate-950" />}
              <span>{savedToast ? 'Yadda Saxlanıldı!' : 'Yadda Saxla'}</span>
            </button>
          </div>
        </div>

        {/* Stage Selector Stepper */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-4 pb-3">
          {[
            { id: 1 as TournamentStage, name: '1. Musiqi Şifrəsi', count: s1.length },
            { id: 2 as TournamentStage, name: '2. Vaxt Dueli', count: s2.length },
            { id: 3 as TournamentStage, name: '3. Ritm Qarşıdurması', count: s3.length },
            { id: 4 as TournamentStage, name: '4. Son Akkordlar', count: f1.length + f2.length }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => {
                stopAllPlayback();
                setPlayingSongId(null);
                setActiveTab(tab.id);
              }}
              className={`p-2.5 rounded-xl text-left border transition-all cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-amber-500/15 border-amber-500/50 text-amber-200 shadow-md shadow-amber-950/30'
                  : 'bg-slate-800/40 hover:bg-slate-800/80 border-slate-800 text-slate-400'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold font-display">{tab.name}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                  {tab.count}
                </span>
              </div>
            </button>
          ))}
        </div>

        {/* Stage 4 Sub-Tabs for Finalists */}
        {activeTab === 4 && (
          <div className="flex items-center gap-2 pb-3 px-1">
            <button
              onClick={() => setStage4SubTab('f1')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                stage4SubTab === 'f1'
                  ? 'bg-sky-500/20 text-sky-300 border-sky-500/40'
                  : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
              }`}
            >
              Finalçı 1 üçün mahnılar ({f1.length})
            </button>
            <button
              onClick={() => setStage4SubTab('f2')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                stage4SubTab === 'f2'
                  ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                  : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
              }`}
            >
              Finalçı 2 üçün mahnılar ({f2.length})
            </button>
          </div>
        )}

        {/* Search & Add New Song Button Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Mahnı, ifaçı və ya kateqoriya axtar..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950/70 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              id="btn-open-add-song"
              onClick={handleOpenAddDialog}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-transform active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ Yeni Mahnı Əlavə Et</span>
            </button>
          </div>
        </div>

        {/* Songs List Container */}
        <div className="flex-1 overflow-y-auto space-y-3 pt-3 pr-1">
          {filteredSongs.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-xs">
              Mahnı tapılmadı. Yeni mahnı əlavə edə və ya axtarışı təmizləyə bilərsiniz.
            </div>
          ) : (
            filteredSongs.map((song, idx) => {
              const isPlaying = playingSongId === song.id;
              const isJustAdded = lastAddedId === song.id;

              return (
                <div
                  key={song.id}
                  className={`p-3.5 sm:p-4 rounded-2xl border transition-all ${
                    isJustAdded
                      ? 'bg-amber-500/20 border-amber-400 shadow-lg shadow-amber-500/20 ring-1 ring-amber-400'
                      : isPlaying
                      ? 'bg-amber-500/10 border-amber-500/50 shadow-md shadow-amber-950/40'
                      : 'bg-slate-950/60 hover:bg-slate-950 border-slate-800'
                  }`}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                      handleFileUpload(song.id, e.dataTransfer.files[0]);
                    }
                  }}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                    {/* Song Number & Info fields */}
                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-center">
                      <div className="sm:col-span-1 flex items-center gap-1.5">
                        <span className="w-7 h-7 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 font-mono text-xs font-bold flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                      </div>

                      {/* Song Title */}
                      <div className="sm:col-span-4">
                        <label className="text-[10px] text-slate-400 block font-medium">Mahnının Adı</label>
                        <input
                          type="text"
                          value={song.title}
                          onChange={(e) => handleFieldChange(song.id, 'title', e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white font-bold focus:outline-none focus:border-amber-400"
                        />
                      </div>

                      {/* Artist / Composer */}
                      <div className="sm:col-span-3">
                        <label className="text-[10px] text-slate-400 block font-medium">İfaçı / Bəstəkar</label>
                        <input
                          type="text"
                          value={song.artistOrComposer}
                          onChange={(e) => handleFieldChange(song.id, 'artistOrComposer', e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:border-amber-400"
                        />
                      </div>

                      {/* Stage Selection & Stage 1 Category Selection */}
                      <div className="sm:col-span-4 flex items-center gap-2">
                        {/* Tur Selector */}
                        <div className="flex-1">
                          <label className="text-[10px] text-slate-400 block font-medium">Tur</label>
                          <select
                            value={currentKey}
                            onChange={(e) => {
                              const newKey = e.target.value as '1' | '2' | '3' | '4_f1' | '4_f2';
                              handleMoveSongStage(song.id, currentKey, newKey);
                            }}
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs text-amber-300 font-medium focus:outline-none focus:border-amber-400 cursor-pointer"
                          >
                            <option value="1">1-ci Tur</option>
                            <option value="2">2-ci Tur</option>
                            <option value="3">3-cü Tur</option>
                            <option value="4_f1">4-cü Tur (F1)</option>
                            <option value="4_f2">4-cü Tur (F2)</option>
                          </select>
                        </div>

                        {/* Category selection if in 1st stage */}
                        {activeTab === 1 && (
                          <div className="flex-1">
                            <label className="text-[10px] text-slate-400 block font-medium">Kateqoriya</label>
                            <select
                              value={song.category === '80-ci illər' ? 'Retro mahnılar' : (song.category || 'Retro mahnılar')}
                              onChange={(e) => handleFieldChange(song.id, 'category', e.target.value)}
                              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs text-teal-300 font-medium focus:outline-none focus:border-teal-400 cursor-pointer"
                            >
                              {stage1Categories.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                              ))}
                            </select>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Audio Track Controls */}
                    <div className="flex flex-wrap items-center gap-2 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-800">
                      {/* Play / Test Button */}
                      <button
                        onClick={() => handlePlayToggle(song)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                          isPlaying
                            ? 'bg-rose-500 hover:bg-rose-600 text-white shadow-lg shadow-rose-500/30'
                            : 'bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700'
                        }`}
                        title={isPlaying ? 'Dayandır' : 'Test üçün səsləndir'}
                      >
                        {isPlaying ? <Square className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                        <span>{isPlaying ? 'Dayandır' : 'Səsləndir'}</span>
                      </button>

                      {/* Custom Audio File Status or Upload Button */}
                      <input
                        type="file"
                        accept="audio/*,.mp3,.wav,.ogg,.m4a,.aac"
                        ref={el => fileInputRefs.current[song.id] = el}
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            handleFileUpload(song.id, e.target.files[0]);
                          }
                        }}
                        className="hidden"
                      />

                      {song.hasCustomAudio ? (
                        <div className="flex items-center gap-1.5 bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-1 rounded-xl">
                          <FileAudio className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span className="text-[11px] text-emerald-300 font-medium max-w-[120px] truncate" title={song.customAudioFileName}>
                            {song.customAudioFileName || 'Özəl MP3'}
                          </span>
                          <button
                            onClick={() => handleRemoveAudio(song.id)}
                            className="text-slate-400 hover:text-rose-400 p-0.5 rounded transition-colors cursor-pointer"
                            title="Özəl audionu sil və sintizator rejiminə qaytar"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => fileInputRefs.current[song.id]?.click()}
                          className="px-2.5 py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                          title="MP3 və ya Audio faylı seçin / sürüşdürüb atın"
                        >
                          <Upload className="w-3.5 h-3.5 text-sky-400" />
                          <span>MP3 Yüklə</span>
                        </button>
                      )}

                      {/* Delete song row button */}
                      <button
                        onClick={() => handleDeleteSong(song.id)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors cursor-pointer"
                        title="Bu mahnını sil"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Clip / trim controls — only relevant once a custom MP3 is uploaded */}
                  {song.hasCustomAudio && (
                    <div className="w-full flex flex-wrap items-end gap-3 mt-3 pt-3 border-t border-slate-800/70">
                      <div className="flex items-center gap-1.5 text-sky-400 pb-1.5">
                        <Scissors className="w-3.5 h-3.5 shrink-0" />
                        <span className="text-[10px] font-bold uppercase tracking-wide">Kəsmə</span>
                      </div>

                      <div>
                        <label className="text-[10px] text-slate-400 block font-medium mb-0.5">
                          Başlanğıc nöqtəsi (san.)
                        </label>
                        <input
                          type="number"
                          min={0}
                          step={1}
                          value={song.clipStartSeconds ?? 0}
                          onChange={(e) =>
                            handleFieldChange(song.id, 'clipStartSeconds', Math.max(0, parseInt(e.target.value) || 0))
                          }
                          className="w-24 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white font-mono focus:outline-none focus:border-sky-400"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] text-slate-400 block font-medium mb-0.5">
                          Uzunluq (san.)
                        </label>
                        <input
                          type="number"
                          min={0}
                          step={1}
                          placeholder="Sona kimi"
                          value={song.clipDurationSeconds ?? ''}
                          onChange={(e) => {
                            const raw = e.target.value;
                            handleFieldChange(
                              song.id,
                              'clipDurationSeconds',
                              raw === '' ? undefined : Math.max(0, parseInt(raw) || 0)
                            );
                          }}
                          className="w-24 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white font-mono placeholder-slate-600 focus:outline-none focus:border-sky-400"
                        />
                      </div>

                      <span className="text-[10px] text-slate-500 pb-1.5">
                        Məs: 45 və 20 → mahnı 45-ci saniyədən başlayıb 20 saniyə çalınacaq. "Səsləndir" düyməsi bu nöqtədən test edir.
                      </span>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer info & stats */}
        <div className="pt-4 mt-3 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              Yüklədiyiniz MP3 fayllar brauzerinizin <strong>IndexedDB</strong> bazasında saxlanılır, heç bir serverə göndərilmir və tətbiqi əsla dondurmur.
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleSaveAll}
              className="w-full sm:w-auto px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all active:scale-95 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>Dəyişiklikləri Təsdiqlə və Çıx</span>
            </button>
          </div>
        </div>
      </div>

      {/* DEDICATED ADD NEW SONG MODAL */}
      {showAddDialog && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-[60] flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-amber-500/40 w-full max-w-lg rounded-3xl p-6 shadow-2xl relative animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
                  <Plus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white font-display">
                    Yeni Mahnı Əlavə Et
                  </h3>
                  <p className="text-xs text-slate-400">
                    Mahnının çalınacağı turu, kateqoriyasını seçin və MP3 faylını əlavə edin
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAddDialog(false)}
                className="w-7 h-7 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSongSubmit} className="space-y-4 pt-4">
              {/* Tur (Stage) Selection */}
              <div>
                <label className="text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-amber-400" />
                  <span>Hansı Turda Çalınacaq?</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    { key: '1' as const, label: '1. Musiqi Şifrəsi' },
                    { key: '2' as const, label: '2. Vaxt Dueli' },
                    { key: '3' as const, label: '3. Ritm Qarşıdurması' },
                    { key: '4_f1' as const, label: '4. Finalçı 1' },
                    { key: '4_f2' as const, label: '4. Finalçı 2' }
                  ].map(stageOption => (
                    <button
                      type="button"
                      key={stageOption.key}
                      onClick={() => setNewStageTarget(stageOption.key)}
                      className={`p-2 rounded-xl text-xs font-bold border text-left transition-all cursor-pointer ${
                        newStageTarget === stageOption.key
                          ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                          : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:bg-slate-800'
                      }`}
                    >
                      {stageOption.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* If Stage 1: Category Selection */}
              {newStageTarget === '1' && (
                <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-teal-500/30 space-y-3">
                  <div>
                    <label className="text-xs font-bold text-teal-300 mb-1.5 flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5" />
                      <span>1-ci Tur üçün Kateqoriya:</span>
                    </label>
                    <select
                      value={newCategorySelect}
                      onChange={(e) => setNewCategorySelect(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-400 cursor-pointer font-medium"
                    >
                      {stage1Categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                      <option value="__custom__">+ Yeni / Özəl Kateqoriya yaz...</option>
                    </select>
                  </div>

                  {newCategorySelect === '__custom__' && (
                    <div>
                      <input
                        type="text"
                        placeholder="Məsələn: Estrada Şedevrləri"
                        value={newCustomCategory}
                        onChange={(e) => setNewCustomCategory(e.target.value)}
                        className="w-full bg-slate-900 border border-teal-500/50 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-400"
                        autoFocus
                      />
                    </div>
                  )}

                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">
                      Kateqoriyadakı Sıra Nömrəsi:
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={20}
                      value={newSongNumber}
                      onChange={(e) => setNewSongNumber(parseInt(e.target.value) || 1)}
                      className="w-24 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white font-mono"
                    />
                  </div>
                </div>
              )}

              {/* Title & Artist */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-300 mb-1 block">
                    Mahnının Adı <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Məsələn: Ayrılıq"
                    value={newSongTitle}
                    onChange={(e) => setNewSongTitle(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 mb-1 block">
                    İfaçı və ya Bəstəkar
                  </label>
                  <input
                    type="text"
                    placeholder="Məs: Əli Səlimi / Yaqub Zurufçu"
                    value={newSongArtist}
                    onChange={(e) => setNewSongArtist(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              {/* MP3 File Attachment */}
              <div>
                <label className="text-xs font-bold text-slate-300 mb-1 block">
                  Audio / MP3 Faylı (Kompüterinizdən)
                </label>
                <input
                  type="file"
                  accept="audio/*,.mp3,.wav,.ogg,.m4a,.aac"
                  ref={newFileInputRef}
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setNewSongAudioFile(e.target.files[0]);
                    }
                  }}
                  className="hidden"
                />

                <div 
                  onClick={() => newFileInputRef.current?.click()}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                      setNewSongAudioFile(e.dataTransfer.files[0]);
                    }
                  }}
                  className={`border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer transition-colors ${
                    newSongAudioFile
                      ? 'border-emerald-500/60 bg-emerald-500/10'
                      : 'border-slate-700 hover:border-amber-400 bg-slate-950/40 hover:bg-slate-950/80'
                  }`}
                >
                  {newSongAudioFile ? (
                    <div className="flex items-center justify-center gap-2 text-emerald-300 text-xs font-bold">
                      <FileAudio className="w-5 h-5 text-emerald-400" />
                      <span className="truncate max-w-[260px]">{newSongAudioFile.name}</span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        ({(newSongAudioFile.size / (1024 * 1024)).toFixed(1)} MB)
                      </span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-1.5 text-slate-400">
                      <Upload className="w-5 h-5 text-sky-400" />
                      <span className="text-xs font-semibold text-slate-300">
                        MP3 faylı seçmək üçün bura klikləyin və ya sürüşdürüb atın
                      </span>
                      <span className="text-[10px] text-slate-500">
                        (İstəsəniz audio faylı indi yükləməyib, sonradan da əlavə edə bilərsiniz)
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddDialog(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors cursor-pointer"
                >
                  Ləğv Et
                </button>
                <button
                  type="submit"
                  disabled={isUploadingNew}
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-transform active:scale-95 cursor-pointer disabled:opacity-50"
                >
                  {isUploadingNew ? (
                    <span>Saxlanılır...</span>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Mahnını Əlavə Et</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Backup Export / Import Progress Modal */}
      {(isExportingBackup || isImportingBackup) && (
        <div className="fixed inset-0 bg-slate-950/90 z-[60] flex items-center justify-center p-4 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-2xl p-6 shadow-2xl text-center flex flex-col items-center">
            <div className="w-14 h-14 rounded-2xl bg-sky-500/20 border border-sky-500/40 text-sky-400 flex items-center justify-center mb-4 animate-pulse">
              <FileArchive className="w-7 h-7" />
            </div>

            <h3 className="text-lg font-bold text-white mb-1">
              {isExportingBackup ? 'Mahnılar Yedəklənir (ZIP)...' : 'Yedək Paketi Quraşdırılır...'}
            </h3>

            <p className="text-xs text-slate-400 mb-4 min-h-[32px] flex items-center justify-center">
              {backupProgressStatus || 'Zəhmət olmasa gözləyin...'}
            </p>

            {/* Progress Bar */}
            <div className="w-full bg-slate-800 rounded-full h-3 mb-2 overflow-hidden border border-slate-700">
              <div
                className="bg-gradient-to-r from-sky-500 via-teal-400 to-emerald-400 h-full transition-all duration-300 rounded-full"
                style={{ width: `${backupProgressPercent}%` }}
              />
            </div>

            <div className="flex items-center justify-between w-full text-[11px] text-slate-400">
              <span className="flex items-center gap-1.5">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-sky-400" />
                <span>Pəncərəni bağlamayın</span>
              </span>
              <span className="font-mono font-bold text-white">{backupProgressPercent}%</span>
            </div>
          </div>
        </div>
      )}

      {/* Success Notification Toast */}
      {backupSuccessToast && (
        <div className="fixed bottom-6 right-6 z-[70] bg-emerald-500 text-slate-950 px-4 py-3 rounded-2xl font-bold text-xs shadow-2xl flex items-center gap-2.5 animate-in slide-in-from-bottom-5">
          <Check className="w-5 h-5 bg-slate-950/20 rounded-full p-0.5" />
          <span>{backupSuccessToast}</span>
        </div>
      )}
    </div>
  );
};
