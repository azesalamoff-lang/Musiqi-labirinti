import { SongItem, Team } from '../types';

// Musical notes frequencies helper
const N = {
  C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, G4: 392.00, A4: 440.00, B4: 493.88,
  C5: 523.25, D5: 587.33, E5: 659.25, F5: 698.46, G5: 783.99, A5: 880.00, B5: 987.77,
  Bb4: 466.16, Eb4: 311.13, Fs4: 369.99, Ab4: 415.30, Cs5: 554.37, Fs5: 739.99
};

export const INITIAL_TEAMS: Team[] = [
  {
    id: 'team_1',
    name: 'Xarıbülbül',
    color: '#38bdf8', // Sky / Cyan
    bgGlow: 'rgba(56, 189, 248, 0.2)',
    borderColor: 'border-sky-500',
    badgeBg: 'bg-sky-500/20 text-sky-300 border-sky-500/40',
    score: 0,
    status: 'active',
    buzzerKey: '1',
    members: [
      { id: 'm1_1', name: 'Nurlan Əliyev', role: 'Kapitan' },
      { id: 'm1_2', name: 'Aydan Məmmədova' },
      { id: 'm1_3', name: 'Rəşad Quliyev' },
      { id: 'm1_4', name: 'Zəhra İsmayılova' }
    ]
  },
  {
    id: 'team_2',
    name: 'Muğam Dalğası',
    color: '#fbbf24', // Amber
    bgGlow: 'rgba(251, 191, 36, 0.2)',
    borderColor: 'border-amber-500',
    badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    score: 0,
    status: 'active',
    buzzerKey: '2',
    members: [
      { id: 'm2_1', name: 'Leyla Həsənova', role: 'Kapitan' },
      { id: 'm2_2', name: 'Murad Kərimov' },
      { id: 'm2_3', name: 'Günel Əhmədova' },
      { id: 'm2_4', name: 'Elmir Babayev' }
    ]
  },
  {
    id: 'team_3',
    name: 'Qobustan',
    color: '#34d399', // Emerald
    bgGlow: 'rgba(52, 211, 153, 0.2)',
    borderColor: 'border-emerald-500',
    badgeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    score: 0,
    status: 'active',
    buzzerKey: '3',
    members: [
      { id: 'm3_1', name: 'Kənan Rzayev', role: 'Kapitan' },
      { id: 'm3_2', name: 'Fidan Tağıyeva' },
      { id: 'm3_3', name: 'Tural Süleymanov' },
      { id: 'm3_4', name: 'Nigar Vəliyeva' }
    ]
  },
  {
    id: 'team_4',
    name: 'Şur Sədaları',
    color: '#f472b6', // Pink / Rose
    bgGlow: 'rgba(244, 114, 182, 0.2)',
    borderColor: 'border-pink-500',
    badgeBg: 'bg-pink-500/20 text-pink-300 border-pink-500/40',
    score: 0,
    status: 'active',
    buzzerKey: '4',
    members: [
      { id: 'm4_1', name: 'Cavid Qasımov', role: 'Kapitan' },
      { id: 'm4_2', name: 'Aysel İbrahimova' },
      { id: 'm4_3', name: 'Orxan Nəcəfov' },
      { id: 'm4_4', name: 'Səbinə Yusifova' }
    ]
  }
];

// TUR 1: Musiqi Şifrəsi (4 kateqoriya x 4 mahnı = 16 mahnı)
export const STAGE_1_SONGS: SongItem[] = [
  // Kateqoriya: Retro mahnılar
  {
    id: 's1_80_1',
    category: 'Retro mahnılar',
    numberInRound: 1,
    stage: 1,
    title: 'Gəl ey səhər',
    artistOrComposer: 'Polad Bülbüloğlu (Söz: Fikrət Qoca)',
    year: '1980-ci illər',
    hint: 'Səhərin açılışını təsvir edən parlaq retro estrada şedevri',
    melodyNotes: [
      { freq: N.G4, duration: 0.35, type: 'triangle' },
      { freq: N.C5, duration: 0.45, type: 'sine' },
      { freq: N.D5, duration: 0.35, type: 'sine' },
      { freq: N.Eb4, duration: 0.4, type: 'sine' },
      { freq: N.G4, duration: 0.6, type: 'triangle' },
      { freq: N.F4, duration: 0.4, type: 'sine' },
      { freq: N.Eb4, duration: 0.7, type: 'sine' }
    ]
  },
  {
    id: 's1_80_2',
    category: 'Retro mahnılar',
    numberInRound: 2,
    stage: 1,
    title: 'Kəpənək',
    artistOrComposer: 'Mirzə Babayev (Bəstəkar: Emin Sabitoğlu)',
    year: '1982',
    hint: 'Xalq artisti Mirzə Babayevin bənzərsiz ifa tərzi və zarafatyana mətn',
    melodyNotes: [
      { freq: N.E4, duration: 0.3, type: 'sine' },
      { freq: N.G4, duration: 0.3, type: 'sine' },
      { freq: N.C5, duration: 0.4, type: 'triangle' },
      { freq: N.B4, duration: 0.3, type: 'sine' },
      { freq: N.A4, duration: 0.5, type: 'sine' },
      { freq: N.G4, duration: 0.6, type: 'triangle' }
    ]
  },
  {
    id: 's1_80_3',
    category: 'Retro mahnılar',
    numberInRound: 3,
    stage: 1,
    title: 'Bağışla məni',
    artistOrComposer: 'Flora Kərimova (Bəstəkar: Elza İbrahimova)',
    year: '1984',
    hint: 'Dərin lirik duyğular və unudulmaz büllur səs',
    melodyNotes: [
      { freq: N.D4, duration: 0.4, type: 'sine' },
      { freq: N.G4, duration: 0.4, type: 'sine' },
      { freq: N.Bb4, duration: 0.4, type: 'triangle' },
      { freq: N.A4, duration: 0.4, type: 'sine' },
      { freq: N.G4, duration: 0.6, type: 'sine' },
      { freq: N.Fs4, duration: 0.8, type: 'triangle' }
    ]
  },
  {
    id: 's1_80_4',
    category: 'Retro mahnılar',
    numberInRound: 4,
    stage: 1,
    title: 'Qaytar eşqimi',
    artistOrComposer: 'Oqtay Ağayev (Bəstəkar: Tofiq Quliyev)',
    year: '1987',
    hint: 'Bəstəkar Tofiq Quliyevin məşhur vokal kompozisiyası',
    melodyNotes: [
      { freq: N.C4, duration: 0.35, type: 'triangle' },
      { freq: N.E4, duration: 0.35, type: 'sine' },
      { freq: N.G4, duration: 0.5, type: 'sine' },
      { freq: N.A4, duration: 0.4, type: 'sine' },
      { freq: N.G4, duration: 0.7, type: 'triangle' }
    ]
  },

  // Kateqoriya: 90-cı illər
  {
    id: 's1_90_1',
    category: '90-cı illər',
    numberInRound: 1,
    stage: 1,
    title: 'İtkin gəlin',
    artistOrComposer: 'Aygün Kazımova (Bəstəkar: Cavanşir Quliyev)',
    year: '1994',
    hint: 'Məşhur teleserialın unudulmaz həzin saundtreki',
    melodyNotes: [
      { freq: N.A4, duration: 0.4, type: 'sine' },
      { freq: N.C5, duration: 0.4, type: 'triangle' },
      { freq: N.E5, duration: 0.5, type: 'sine' },
      { freq: N.D5, duration: 0.4, type: 'sine' },
      { freq: N.C5, duration: 0.4, type: 'sine' },
      { freq: N.B4, duration: 0.6, type: 'triangle' }
    ]
  },
  {
    id: 's1_90_2',
    category: '90-cı illər',
    numberInRound: 2,
    stage: 1,
    title: 'Dönmə geri',
    artistOrComposer: 'Faiq Ağayev (Bəstəkar: Nailə Mirməmmədli)',
    year: '1996',
    hint: '90-cı illərin ən parlaq pop hitlərindən biri',
    melodyNotes: [
      { freq: N.E4, duration: 0.3, type: 'sawtooth' },
      { freq: N.A4, duration: 0.3, type: 'sine' },
      { freq: N.C5, duration: 0.4, type: 'triangle' },
      { freq: N.B4, duration: 0.3, type: 'sine' },
      { freq: N.A4, duration: 0.5, type: 'sine' }
    ]
  },
  {
    id: 's1_90_3',
    category: '90-cı illər',
    numberInRound: 3,
    stage: 1,
    title: 'Gecikməyin sevməyə',
    artistOrComposer: 'Zülfiyyə Xanbabayeva (Bəstəkar: Vaqif Gərayzadə)',
    year: '1998',
    hint: 'Sevgi haqqında fəlsəfi və zərif melodiyaya malik ballad',
    melodyNotes: [
      { freq: N.G4, duration: 0.35, type: 'sine' },
      { freq: N.C5, duration: 0.4, type: 'sine' },
      { freq: N.D5, duration: 0.4, type: 'triangle' },
      { freq: N.E5, duration: 0.5, type: 'sine' },
      { freq: N.D5, duration: 0.7, type: 'sine' }
    ]
  },
  {
    id: 's1_90_4',
    category: '90-cı illər',
    numberInRound: 4,
    stage: 1,
    title: 'Bakım mənim',
    artistOrComposer: 'Eyyub Yaqubov (Bəstəkar: Elçin İmanov)',
    year: '1995',
    hint: 'Paytaxt Bakının küçələrini və ab-havasını vəsf edən şanson',
    melodyNotes: [
      { freq: N.C4, duration: 0.3, type: 'triangle' },
      { freq: N.Eb4, duration: 0.3, type: 'sine' },
      { freq: N.G4, duration: 0.4, type: 'sine' },
      { freq: N.Bb4, duration: 0.4, type: 'sine' },
      { freq: N.G4, duration: 0.6, type: 'triangle' }
    ]
  },

  // Kateqoriya: Kino musiqiləri
  {
    id: 's1_kino_1',
    category: 'Kino musiqiləri',
    numberInRound: 1,
    stage: 1,
    title: 'Bu dünyanı nağıl bilib ("Bəxt üzüyü")',
    artistOrComposer: 'Flora Kərimova (Bəstəkar: Eldar Mansurov)',
    year: '1991',
    hint: 'Moşu və Seda obrazlarının yer aldığı kult Azərbaycan komediya filmi',
    melodyNotes: [
      { freq: N.D4, duration: 0.35, type: 'sine' },
      { freq: N.G4, duration: 0.35, type: 'sine' },
      { freq: N.A4, duration: 0.35, type: 'sine' },
      { freq: N.Bb4, duration: 0.5, type: 'triangle' },
      { freq: N.A4, duration: 0.4, type: 'sine' },
      { freq: N.G4, duration: 0.7, type: 'sine' }
    ]
  },
  {
    id: 's1_kino_2',
    category: 'Kino musiqiləri',
    numberInRound: 2,
    stage: 1,
    title: 'Məşədi İbadın mahnısı ("O olmasın, bu olsun")',
    artistOrComposer: 'Bəstəkar: Üzeyir Hacıbəyli',
    year: '1956',
    hint: '"Mən nə qədər qoca olsam da, dəyərəm min cavana" misrası ilə tanınan operetta',
    melodyNotes: [
      { freq: N.G4, duration: 0.25, type: 'triangle' },
      { freq: N.G4, duration: 0.25, type: 'triangle' },
      { freq: N.C5, duration: 0.35, type: 'sine' },
      { freq: N.B4, duration: 0.25, type: 'sine' },
      { freq: N.A4, duration: 0.35, type: 'sine' },
      { freq: N.G4, duration: 0.5, type: 'triangle' }
    ]
  },
  {
    id: 's1_kino_3',
    category: 'Kino musiqiləri',
    numberInRound: 3,
    stage: 1,
    title: 'Cənnət xalanın nəğməsi ("Qayınana")',
    artistOrComposer: 'Nəsibə Zeynalova (Bəstəkar: Tofiq Quliyev)',
    year: '1978',
    hint: 'Gəlin və qayınana çəkişməsini əks etdirən əfsanəvi musiqili komediya',
    melodyNotes: [
      { freq: N.C5, duration: 0.25, type: 'sine' },
      { freq: N.E5, duration: 0.25, type: 'triangle' },
      { freq: N.G5, duration: 0.4, type: 'sine' },
      { freq: N.F5, duration: 0.25, type: 'sine' },
      { freq: N.E5, duration: 0.4, type: 'sine' },
      { freq: N.D5, duration: 0.5, type: 'triangle' }
    ]
  },
  {
    id: 's1_kino_4',
    category: 'Kino musiqiləri',
    numberInRound: 4,
    stage: 1,
    title: 'Dərviş Parisi partladır ("Dərviş Məstəli Şah")',
    artistOrComposer: 'Bəstəkar: Tofiq Quliyev',
    year: '1976',
    hint: 'M.F.Axundzadənin əsəri əsasında çəkilmiş sehrli və qədim Qarabağ ab-havası',
    melodyNotes: [
      { freq: N.D4, duration: 0.3, type: 'triangle' },
      { freq: N.F4, duration: 0.3, type: 'sine' },
      { freq: N.A4, duration: 0.4, type: 'triangle' },
      { freq: N.Bb4, duration: 0.3, type: 'sine' },
      { freq: N.A4, duration: 0.6, type: 'triangle' }
    ]
  },

  // Kateqoriya: Xalq mahnıları
  {
    id: 's1_xalq_1',
    category: 'Xalq mahnıları',
    numberInRound: 1,
    stage: 1,
    title: 'Sarı gəlin',
    artistOrComposer: 'Azərbaycan Xalq Mahnısı',
    year: 'Əsrlərin yadigarı',
    hint: '"Neylim, aman-aman, sarı gəlin" - Azərbaycan musiqisinin vizit kartı',
    melodyNotes: [
      { freq: N.D4, duration: 0.4, type: 'sine' },
      { freq: N.G4, duration: 0.5, type: 'sine' },
      { freq: N.Fs4, duration: 0.3, type: 'sine' },
      { freq: N.G4, duration: 0.5, type: 'triangle' },
      { freq: N.A4, duration: 0.6, type: 'sine' },
      { freq: N.Bb4, duration: 0.4, type: 'sine' },
      { freq: N.A4, duration: 0.8, type: 'sine' }
    ]
  },
  {
    id: 's1_xalq_2',
    category: 'Xalq mahnıları',
    numberInRound: 2,
    stage: 1,
    title: 'Küçələrə su səpmişəm',
    artistOrComposer: 'Azərbaycan Xalq Mahnısı',
    year: 'Qədim ənənəvi',
    hint: '"Yar gələndə toz olmasın, elə gəlsin, elə getsin..."',
    melodyNotes: [
      { freq: N.G4, duration: 0.3, type: 'sine' },
      { freq: N.C5, duration: 0.35, type: 'sine' },
      { freq: N.C5, duration: 0.35, type: 'triangle' },
      { freq: N.B4, duration: 0.3, type: 'sine' },
      { freq: N.A4, duration: 0.3, type: 'sine' },
      { freq: N.G4, duration: 0.6, type: 'triangle' }
    ]
  },
  {
    id: 's1_xalq_3',
    category: 'Xalq mahnıları',
    numberInRound: 3,
    stage: 1,
    title: 'Aman Tello',
    artistOrComposer: 'Azərbaycan Xalq Mahnısı',
    year: 'Şən rəqs havası',
    hint: 'Toy və el şənliklərində ən çox oxunan coşğulu el nəğməsi',
    melodyNotes: [
      { freq: N.E4, duration: 0.25, type: 'triangle' },
      { freq: N.G4, duration: 0.25, type: 'sine' },
      { freq: N.A4, duration: 0.3, type: 'sine' },
      { freq: N.C5, duration: 0.3, type: 'sine' },
      { freq: N.B4, duration: 0.25, type: 'sine' },
      { freq: N.A4, duration: 0.4, type: 'triangle' }
    ]
  },
  {
    id: 's1_xalq_4',
    category: 'Xalq mahnıları',
    numberInRound: 4,
    stage: 1,
    title: 'Evləri köndələn yar',
    artistOrComposer: 'Azərbaycan Xalq Mahnısı',
    year: 'Klassik folklor',
    hint: 'Həm televiziya tamaşasına, həm də saysız ifalara ad vermiş məşhur təranə',
    melodyNotes: [
      { freq: N.D4, duration: 0.3, type: 'sine' },
      { freq: N.F4, duration: 0.3, type: 'triangle' },
      { freq: N.G4, duration: 0.4, type: 'sine' },
      { freq: N.A4, duration: 0.35, type: 'sine' },
      { freq: N.F4, duration: 0.5, type: 'triangle' }
    ]
  }
];

// TUR 2: Vaxt Dueli (10 mahnı)
export const STAGE_2_SONGS: SongItem[] = [
  {
    id: 's2_1',
    numberInRound: 1,
    stage: 2,
    title: 'Reyhan',
    artistOrComposer: 'Rəşid Behbudov (Bəstəkar: Fikrət Əmirov)',
    year: '1959',
    hint: '"Dağlar qızı Reyhan, Reyhan..." - dünya miqyasında tanınan əsər',
    melodyNotes: [
      { freq: N.C5, duration: 0.35, type: 'sine' },
      { freq: N.D5, duration: 0.35, type: 'sine' },
      { freq: N.Eb4, duration: 0.4, type: 'triangle' },
      { freq: N.D5, duration: 0.35, type: 'sine' },
      { freq: N.C5, duration: 0.6, type: 'sine' }
    ]
  },
  {
    id: 's2_2',
    numberInRound: 2,
    stage: 2,
    title: 'Lalələr',
    artistOrComposer: 'Telman Hacıyev / Şövkət Ələkbərova',
    year: '1965',
    hint: 'Bahar fəslində təbiətin al-qırmızı çiçəklənməsinə həsr edilmiş nəğmə',
    melodyNotes: [
      { freq: N.G4, duration: 0.35, type: 'triangle' },
      { freq: N.B4, duration: 0.35, type: 'sine' },
      { freq: N.D5, duration: 0.4, type: 'sine' },
      { freq: N.C5, duration: 0.5, type: 'sine' }
    ]
  },
  {
    id: 's2_3',
    numberInRound: 3,
    stage: 2,
    title: 'Ayrılıq',
    artistOrComposer: 'Bəstəkar: Əli Səlimi (Söz: Fərhad İbrahimi)',
    year: '1958',
    hint: '"Fikrindən gecələr yata bilmirəm" - həsrət simvoluna çevrilmiş mahnı',
    melodyNotes: [
      { freq: N.E4, duration: 0.4, type: 'sine' },
      { freq: N.A4, duration: 0.45, type: 'sine' },
      { freq: N.C5, duration: 0.4, type: 'triangle' },
      { freq: N.B4, duration: 0.35, type: 'sine' },
      { freq: N.A4, duration: 0.7, type: 'sine' }
    ]
  },
  {
    id: 's2_4',
    numberInRound: 4,
    stage: 2,
    title: 'Qarabağ',
    artistOrComposer: 'Bəhram Nəsibov',
    year: '1970-ci illər',
    hint: '"Anadır arzulara hər zaman Qarabağ..."',
    melodyNotes: [
      { freq: N.D4, duration: 0.35, type: 'sine' },
      { freq: N.G4, duration: 0.4, type: 'sine' },
      { freq: N.A4, duration: 0.35, type: 'triangle' },
      { freq: N.Bb4, duration: 0.5, type: 'sine' },
      { freq: N.G4, duration: 0.6, type: 'sine' }
    ]
  },
  {
    id: 's2_5',
    numberInRound: 5,
    stage: 2,
    title: 'Qaytağı',
    artistOrComposer: 'Bəstəkar: Tofiq Quliyev',
    year: '1958',
    hint: 'Sürətli piano və orkestr virtuozluğu tələb edən alovlu instrumentals',
    melodyNotes: [
      { freq: N.G4, duration: 0.2, type: 'sawtooth' },
      { freq: N.C5, duration: 0.2, type: 'sawtooth' },
      { freq: N.D5, duration: 0.2, type: 'triangle' },
      { freq: N.Eb4, duration: 0.2, type: 'sawtooth' },
      { freq: N.D5, duration: 0.2, type: 'triangle' },
      { freq: N.C5, duration: 0.4, type: 'sine' }
    ]
  },
  {
    id: 's2_6',
    numberInRound: 6,
    stage: 2,
    title: 'Durnalar',
    artistOrComposer: 'Cahangir Cahangirov (Söz: Molla Pənah Vaqif)',
    year: '1961',
    hint: 'Klassik xor və qatar-qatar uçan quşların poetik obrazı',
    melodyNotes: [
      { freq: N.A4, duration: 0.35, type: 'sine' },
      { freq: N.E5, duration: 0.45, type: 'triangle' },
      { freq: N.D5, duration: 0.35, type: 'sine' },
      { freq: N.C5, duration: 0.6, type: 'sine' }
    ]
  },
  {
    id: 's2_7',
    numberInRound: 7,
    stage: 2,
    title: 'Sən gəlməz oldun',
    artistOrComposer: 'Bəstəkar: Ələkbər Tağıyev (Söz: Mədinə Gülgün)',
    year: '1972',
    hint: 'Balaban alətində dərin ürək yanğısı ilə ifa olunan nostalji musiqi',
    melodyNotes: [
      { freq: N.D4, duration: 0.4, type: 'sine' },
      { freq: N.F4, duration: 0.35, type: 'sine' },
      { freq: N.G4, duration: 0.45, type: 'triangle' },
      { freq: N.A4, duration: 0.6, type: 'sine' }
    ]
  },
  {
    id: 's2_8',
    numberInRound: 8,
    stage: 2,
    title: 'Ana',
    artistOrComposer: 'Sevil Əliyeva (Söz: Bəxtiyar Vahabzadə)',
    year: '1980-ci illər',
    hint: 'Anaların müqəddəs sevgisinə həsr olunmuş dəyərli bəstə',
    melodyNotes: [
      { freq: N.C4, duration: 0.4, type: 'sine' },
      { freq: N.F4, duration: 0.4, type: 'triangle' },
      { freq: N.A4, duration: 0.4, type: 'sine' },
      { freq: N.G4, duration: 0.7, type: 'sine' }
    ]
  },
  {
    id: 's2_9',
    numberInRound: 9,
    stage: 2,
    title: 'Qonşu qız',
    artistOrComposer: 'Zeynəb Xanlarova (Bəstəkar: Ələkbər Tağıyev)',
    year: '1970-ci illər',
    hint: 'Məhəllə sevgisi və şən ritmlə ifa edilən mahnı',
    melodyNotes: [
      { freq: N.G4, duration: 0.25, type: 'triangle' },
      { freq: N.C5, duration: 0.25, type: 'sine' },
      { freq: N.E5, duration: 0.35, type: 'triangle' },
      { freq: N.D5, duration: 0.5, type: 'sine' }
    ]
  },
  {
    id: 's2_10',
    numberInRound: 10,
    stage: 2,
    title: 'Köçəri (Yallı)',
    artistOrComposer: 'Naxçıvan el rəqsi / UNESCO İrs siyahısı',
    year: 'Qədim folklor',
    hint: 'Zurna və nağaranın ahəngi ilə bütün zala enerji gətirən milli yallı',
    melodyNotes: [
      { freq: N.D5, duration: 0.2, type: 'sawtooth' },
      { freq: N.D5, duration: 0.2, type: 'sawtooth' },
      { freq: N.E5, duration: 0.2, type: 'triangle' },
      { freq: N.C5, duration: 0.2, type: 'sawtooth' },
      { freq: N.D5, duration: 0.4, type: 'sawtooth' }
    ]
  }
];

// TUR 3: Ritm Qarşıdurması (8 mahnı - vaxt intervalına görə xal)
export const STAGE_3_SONGS: SongItem[] = [
  {
    id: 's3_1',
    numberInRound: 1,
    stage: 3,
    title: 'Bax-bax',
    artistOrComposer: 'Niyaməddin Musayev',
    year: '1985',
    hint: 'Azərbaycan estradasının ən populyar ritmik hitlərindən biri',
    melodyNotes: [
      { freq: N.G4, duration: 0.3, type: 'sine' },
      { freq: N.Bb4, duration: 0.3, type: 'triangle' },
      { freq: N.D5, duration: 0.4, type: 'sine' },
      { freq: N.C5, duration: 0.5, type: 'sine' }
    ]
  },
  {
    id: 's3_2',
    numberInRound: 2,
    stage: 3,
    title: 'Gözəlim sənsən',
    artistOrComposer: 'Bəstəkar: Fikrət Əmirov',
    year: '1960-cı illər',
    hint: 'Klassik vokal incisi və romantik vals elementləri',
    melodyNotes: [
      { freq: N.E4, duration: 0.35, type: 'sine' },
      { freq: N.G4, duration: 0.35, type: 'sine' },
      { freq: N.C5, duration: 0.5, type: 'triangle' },
      { freq: N.B4, duration: 0.4, type: 'sine' }
    ]
  },
  {
    id: 's3_3',
    numberInRound: 3,
    stage: 3,
    title: 'Nazəndə sevgilim',
    artistOrComposer: 'Bəhram Nəsibov (İfa: İslam Rzayev / Yaqub Zurufçu)',
    year: '1967',
    hint: '"Dəydi saçlarıma bahar mehləri, nazəndə sevgilim yadıma düşdü"',
    melodyNotes: [
      { freq: N.D4, duration: 0.35, type: 'sine' },
      { freq: N.G4, duration: 0.35, type: 'sine' },
      { freq: N.Bb4, duration: 0.4, type: 'triangle' },
      { freq: N.A4, duration: 0.5, type: 'sine' },
      { freq: N.G4, duration: 0.6, type: 'sine' }
    ]
  },
  {
    id: 's3_4',
    numberInRound: 4,
    stage: 3,
    title: 'Sənə də qalmaz',
    artistOrComposer: 'Tofiq Quliyev (Rəşid Behbudov)',
    year: '1957',
    hint: '"Könlüm sənin əsirin, qəlbin bilsin, bu dünya nə sənə, nə mənə qalmaz"',
    melodyNotes: [
      { freq: N.C5, duration: 0.35, type: 'sine' },
      { freq: N.B4, duration: 0.3, type: 'sine' },
      { freq: N.A4, duration: 0.35, type: 'triangle' },
      { freq: N.G4, duration: 0.5, type: 'sine' }
    ]
  },
  {
    id: 's3_5',
    numberInRound: 5,
    stage: 3,
    title: 'Şuşanın dağları başı dumanlı',
    artistOrComposer: 'Xan Şuşinski',
    year: '1930-cu illər',
    hint: 'Qarabağın incisi Şuşaya həsr olunmuş məşhur təsnif',
    melodyNotes: [
      { freq: N.G4, duration: 0.4, type: 'sine' },
      { freq: N.C5, duration: 0.4, type: 'triangle' },
      { freq: N.D5, duration: 0.35, type: 'sine' },
      { freq: N.Eb4, duration: 0.5, type: 'sine' },
      { freq: N.D5, duration: 0.6, type: 'triangle' }
    ]
  },
  {
    id: 's3_6',
    numberInRound: 6,
    stage: 3,
    title: 'Ulduzlar sönmür',
    artistOrComposer: 'Bəstəkar: Emin Sabitoğlu',
    year: '1971',
    hint: 'Nəriman Nərimanov haqqında tarixi dram filminin əsas musiqisi',
    melodyNotes: [
      { freq: N.D4, duration: 0.3, type: 'triangle' },
      { freq: N.F4, duration: 0.3, type: 'sine' },
      { freq: N.A4, duration: 0.4, type: 'sine' },
      { freq: N.G4, duration: 0.6, type: 'triangle' }
    ]
  },
  {
    id: 's3_7',
    numberInRound: 7,
    stage: 3,
    title: 'Gəl, a gözəl',
    artistOrComposer: 'Bəstəkar: Rauf Hacıyev',
    year: '1960-cı illər',
    hint: 'Azərbaycan simfonik caz və estrada elementlərinin zəngin harmoniyası',
    melodyNotes: [
      { freq: N.E4, duration: 0.3, type: 'sine' },
      { freq: N.G4, duration: 0.35, type: 'triangle' },
      { freq: N.B4, duration: 0.4, type: 'sine' },
      { freq: N.C5, duration: 0.6, type: 'sine' }
    ]
  },
  {
    id: 's3_8',
    numberInRound: 8,
    stage: 3,
    title: 'Segah təsnifi (Qarabağ şikəstəsi)',
    artistOrComposer: 'Klassik Muğam / Alim Qasımov',
    year: 'Milli milli irs',
    hint: 'Qaval və tər sinəsindən qopan qədim muğam sədası',
    melodyNotes: [
      { freq: N.D4, duration: 0.45, type: 'sine' },
      { freq: N.G4, duration: 0.45, type: 'sine' },
      { freq: N.Fs4, duration: 0.35, type: 'triangle' },
      { freq: N.E4, duration: 0.65, type: 'sine' }
    ]
  }
];

// TUR 4: Son Akkordlar (Finalist 1 üçün 7 mahnı, Finalist 2 üçün 7 mahnı)
export const STAGE_4_FINALIST_1_SONGS: SongItem[] = [
  {
    id: 's4_t1_1',
    numberInRound: 1,
    stage: 4,
    title: 'Azərbaycan',
    artistOrComposer: 'Müslüm Maqomayev (Söz: Nəbi Xəzri)',
    year: '1970',
    hint: '"Azərbaycan, doğma diyarım, sənə qurban canım mənim"',
    melodyNotes: [{ freq: N.C4, duration: 0.3 }, { freq: N.G4, duration: 0.4 }, { freq: N.C5, duration: 0.6 }]
  },
  {
    id: 's4_t1_2',
    numberInRound: 2,
    stage: 4,
    title: 'İlk bahar',
    artistOrComposer: 'Bəstəkar: Elza İbrahimova',
    year: '1981',
    hint: 'Lirik duyğuların incisi',
    melodyNotes: [{ freq: N.E4, duration: 0.3 }, { freq: N.G4, duration: 0.4 }, { freq: N.B4, duration: 0.5 }]
  },
  {
    id: 's4_t1_3',
    numberInRound: 3,
    stage: 4,
    title: 'Bizim Cəbiş müəllim',
    artistOrComposer: 'Bəstəkar: Emin Sabitoğlu',
    year: '1969',
    hint: 'Müharibə illərinin ən kədərli və səmimi kino musiqilərindən',
    melodyNotes: [{ freq: N.D4, duration: 0.35 }, { freq: N.F4, duration: 0.35 }, { freq: N.A4, duration: 0.5 }]
  },
  {
    id: 's4_t1_4',
    numberInRound: 4,
    stage: 4,
    title: 'Arşın mal alan ("Əsgərin mahnısı")',
    artistOrComposer: 'Üzeyir Hacıbəyli',
    year: '1913 / 1945',
    hint: '"Arşın mal alan, boyuna qurban!"',
    melodyNotes: [{ freq: N.G4, duration: 0.25 }, { freq: N.C5, duration: 0.3 }, { freq: N.E5, duration: 0.45 }]
  },
  {
    id: 's4_t1_5',
    numberInRound: 5,
    stage: 4,
    title: 'Gecələr bulaq başı',
    artistOrComposer: 'Flora Kərimova (Bəstəkar: Ramiz Mirişli)',
    year: '1975',
    hint: 'Kənd təbiətini və zərif sevgini təcəssüm etdirən nəğmə',
    melodyNotes: [{ freq: N.D4, duration: 0.3 }, { freq: N.G4, duration: 0.4 }, { freq: N.Bb4, duration: 0.5 }]
  },
  {
    id: 's4_t1_6',
    numberInRound: 6,
    stage: 4,
    title: 'Çal-oyna',
    artistOrComposer: 'Milli rəqs havası',
    year: 'Folklor',
    hint: 'Toy süfrələrinin əvəzolunmaz ritmik zurna sədaları',
    melodyNotes: [{ freq: N.G4, duration: 0.2 }, { freq: N.A4, duration: 0.2 }, { freq: N.C5, duration: 0.35 }]
  },
  {
    id: 's4_t1_7',
    numberInRound: 7,
    stage: 4,
    title: 'Vətən yaxşıdır',
    artistOrComposer: 'Azərbaycan Xalq Mahnısı',
    year: 'Qədim nəğmə',
    hint: '"Gəzməyə qərib ölkə, ölməyə vətən yaxşı"',
    melodyNotes: [{ freq: N.E4, duration: 0.35 }, { freq: N.A4, duration: 0.4 }, { freq: N.C5, duration: 0.5 }]
  }
];

export const STAGE_4_FINALIST_2_SONGS: SongItem[] = [
  {
    id: 's4_t2_1',
    numberInRound: 1,
    stage: 4,
    title: 'Sənsiz',
    artistOrComposer: 'Üzeyir Hacıbəyli (Söz: Nizami Gəncəvi / İfa: Bülbül)',
    year: '1941',
    hint: 'Azərbaycan musiqisində ilk Romans-Qəzəl janrı',
    melodyNotes: [{ freq: N.C4, duration: 0.4 }, { freq: N.E4, duration: 0.4 }, { freq: N.G4, duration: 0.6 }]
  },
  {
    id: 's4_t2_2',
    numberInRound: 2,
    stage: 4,
    title: 'Dəli Kür ("Uşaqlıq")',
    artistOrComposer: 'Bəstəkar: Cahangir Cahangirov',
    year: '1969',
    hint: 'Kür çayı sahilində cərəyan edən əfsanəvi kinofilmin musiqisi',
    melodyNotes: [{ freq: N.D4, duration: 0.3 }, { freq: N.F4, duration: 0.35 }, { freq: N.A4, duration: 0.5 }]
  },
  {
    id: 's4_t2_3',
    numberInRound: 3,
    stage: 4,
    title: 'Bakı gecələri',
    artistOrComposer: 'Bəstəkar: Tofiq Quliyev',
    year: '1960-cı illər',
    hint: 'Xəzərin mehi və Bakının axşam işıqları',
    melodyNotes: [{ freq: N.G4, duration: 0.3 }, { freq: N.C5, duration: 0.35 }, { freq: N.D5, duration: 0.45 }]
  },
  {
    id: 's4_t2_4',
    numberInRound: 4,
    stage: 4,
    title: 'Ay ləpələr',
    artistOrComposer: 'Rəşid Behbudov (Bəstəkar: Rauf Hacıyev)',
    year: '1959',
    hint: 'Xəzər dənizinin mavi sularına xitab edən şən melodiya',
    melodyNotes: [{ freq: N.E4, duration: 0.25 }, { freq: N.G4, duration: 0.3 }, { freq: N.C5, duration: 0.45 }]
  },
  {
    id: 's4_t2_5',
    numberInRound: 5,
    stage: 4,
    title: 'Gül açdı',
    artistOrComposer: 'Şövkət Ələkbərova (Bəstəkar: Süleyman Ələsgərov)',
    year: '1970-ci illər',
    hint: 'Yaz gəlişini müjdələyən büllur xalq estrada ifası',
    melodyNotes: [{ freq: N.D4, duration: 0.35 }, { freq: N.G4, duration: 0.4 }, { freq: N.Bb4, duration: 0.5 }]
  },
  {
    id: 's4_t2_6',
    numberInRound: 6,
    stage: 4,
    title: 'Tənha yalquzaq ("Yalquzaq")',
    artistOrComposer: 'Kino musiqisi / Estrada',
    year: '1990-cı illər',
    hint: 'Kino ekranlarında həyəcanlı süjet fonunda səslənən ritm',
    melodyNotes: [{ freq: N.G4, duration: 0.25 }, { freq: N.Bb4, duration: 0.3 }, { freq: N.D5, duration: 0.45 }]
  },
  {
    id: 's4_t2_7',
    numberInRound: 7,
    stage: 4,
    title: 'Yaşa, Azərbaycan!',
    artistOrComposer: 'Milli vətənpərvərlik marşı',
    year: 'Zəfər dövrü',
    hint: 'Hər kəsin qürurla oxuduğu zəfər və müqəddəs vətən himni',
    melodyNotes: [{ freq: N.C4, duration: 0.3 }, { freq: N.G4, duration: 0.35 }, { freq: N.C5, duration: 0.6 }]
  }
];
