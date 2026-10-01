import Dexie, { type EntityTable } from 'dexie';

export interface AppSettings {
  id: string; // 'current'
  userName: string;
  defaultUsZone: string; // 'America/New_York', 'America/Chicago', etc.
  dailyGoalPages: number;
  theme: 'light' | 'dark' | 'system';
  reducedMotion: boolean;
  aiModel: string;
  aiProModel: string;
  aiTransport: 'server' | 'direct';
  userApiKey?: string;
  voiceAudioEnabled: boolean;
  ttsVoice: string;
  ttsSpeed: number;
  explanationLanguage: 'english' | 'urdu' | 'roman_urdu';
  // Market Snapshots
  dieselPrice: number;
  dieselDate: string;
  datVanRate: number;
  datReeferRate: number;
  datFlatbedRate: number;
  datDate: string;
  weeklyFixedCost: number;
  weeklyMiles: number;
  avgMpg: number;
  variableCostNoFuel: number;
  dispatchFeePct: number;
  factoringFeePct: number;
  profitCushion: number;
  fscBaseRate: number;
}

export interface PageProgress {
  pageId: string;
  moduleId: string;
  readAt?: string;
  understood: boolean;
  confidence: number; // 1, 2, or 3
  timeSpentSec: number;
}

export interface NoteItem {
  id: string;
  pageId: string;
  moduleId: string;
  text: string;
  highlights: Array<{
    start: number;
    end: number;
    color: string;
    text: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface BookmarkItem {
  pageId: string;
  moduleId: string;
  title: string;
  kicker: string;
  createdAt: string;
}

export interface QuizAttempt {
  id: string;
  quizId: string; // e.g. 'm07'
  moduleId: string;
  score: number;
  maxScore: number;
  answers: Array<{
    questionId: string;
    userAnswer: string;
    modelAnswer: string;
    grade: 'correct' | 'partly' | 'wrong';
    aiFeedback?: string;
  }>;
  createdAt: string;
}

export interface Flashcard {
  id: string;
  deck: string; // moduleId or 'all' or 'custom'
  front: string;
  back: string;
  source?: string;
  sm2: {
    ef: number; // Ease Factor, default 2.5
    interval: number; // in days
    reps: number;
    due: string; // ISO date
  };
}

export interface DrillAttempt {
  id: string;
  drillNumber: number;
  drillTitle: string;
  transcript: string;
  audioBlob?: Blob;
  score?: number;
  feedback?: string;
  createdAt: string;
}

export interface RoleplaySession {
  id: string;
  roleplayId: string;
  difficulty: 'easy' | 'medium' | 'hard';
  transcript: Array<{
    role: 'user' | 'assistant';
    text: string;
    timestamp: string;
  }>;
  scores?: {
    opening: number;
    facts: number;
    numbers: number;
    judgement: number;
    close: number;
    total: number;
  };
  feedback?: {
    doneWell: string[];
    toImprove: string[];
    bestMoment: string;
  };
  automaticFail?: {
    triggered: boolean;
    reason: string;
  };
  createdAt: string;
}

export interface LoadCard {
  id: string;
  truckId: string;
  postedRate: number;
  loadedMiles: number;
  deadheadMiles: number;
  days: number;
  ratePerTotalMile: number;
  ratePerDay: number;
  decision: 'BOOK' | 'COUNTER' | 'PASS';
  reasons: string[];
  createdAt: string;
}

export interface DispatchLoadItem {
  id: string;
  loadNumber: string;
  truckId: string;
  carrierName: string;
  status: 'booked' | 'rate_con_signed' | 'dispatched' | 'at_pickup' | 'loaded' | 'in_transit' | 'delivered' | 'paperwork_sent' | 'paid';
  origin: string;
  destination: string;
  rate: number;
  loadedMiles: number;
  deadheadMiles: number;
  equipment: string;
  brokerName: string;
  brokerPhone: string;
  pickupAppt: string;
  deliveryAppt: string;
  checkCalls: Array<{ time: string; note: string; status: string }>;
  documents: {
    rateConSigned: boolean;
    bolReceived: boolean;
    podReceived: boolean;
    invoiceSent: boolean;
  };
  detentionHours?: number;
  detentionBilled?: number;
  invoiceNumber?: string;
  createdAt: string;
}

export interface LearningEvent {
  id: string;
  type: string;
  targetId: string;
  timestamp: string;
  meta?: any;
}

export const defaultSettings: AppSettings = {
  id: 'current',
  userName: 'Jawad',
  defaultUsZone: 'America/New_York',
  dailyGoalPages: 10,
  theme: 'system',
  reducedMotion: false,
  aiModel: 'gemini-2.5-flash',
  aiProModel: 'gemini-2.5-pro',
  aiTransport: 'server',
  voiceAudioEnabled: true,
  ttsVoice: 'default',
  ttsSpeed: 1.0,
  explanationLanguage: 'english',
  // Snapshot defaults from practice-data.json / SPEC 3
  dieselPrice: 6.382,
  dieselDate: '2026-09-28',
  datVanRate: 2.19,
  datReeferRate: 2.61,
  datFlatbedRate: 2.70,
  datDate: 'August 2026',
  weeklyFixedCost: 1300,
  weeklyMiles: 2500,
  avgMpg: 6.5,
  variableCostNoFuel: 0.86,
  dispatchFeePct: 0.06,
  factoringFeePct: 0.03,
  profitCushion: 0.10,
  fscBaseRate: 1.25,
};

class DispatchAcademyDB extends Dexie {
  settings!: EntityTable<AppSettings, 'id'>;
  progress!: EntityTable<PageProgress, 'pageId'>;
  notes!: EntityTable<NoteItem, 'id'>;
  bookmarks!: EntityTable<BookmarkItem, 'pageId'>;
  quizAttempts!: EntityTable<QuizAttempt, 'id'>;
  flashcards!: EntityTable<Flashcard, 'id'>;
  drillAttempts!: EntityTable<DrillAttempt, 'id'>;
  roleplaySessions!: EntityTable<RoleplaySession, 'id'>;
  loadCards!: EntityTable<LoadCard, 'id'>;
  boards!: EntityTable<{ id: string; data: any }, 'id'>;
  dispatchLoads!: EntityTable<DispatchLoadItem, 'id'>;
  simulations!: EntityTable<{ id: string; slot: number; state: any; updatedAt: string }, 'id'>;
  events!: EntityTable<LearningEvent, 'id'>;

  constructor() {
    super('dispatchAcademy');
    this.version(1).stores({
      settings: 'id',
      progress: 'pageId, moduleId, understood',
      notes: 'id, pageId, moduleId, createdAt',
      bookmarks: 'pageId, moduleId, createdAt',
      quizAttempts: 'id, quizId, moduleId, createdAt',
      flashcards: 'id, deck, sm2.due',
      drillAttempts: 'id, drillNumber, createdAt',
      roleplaySessions: 'id, roleplayId, createdAt',
      loadCards: 'id, truckId, createdAt',
      boards: 'id',
      dispatchLoads: 'id, loadNumber, truckId, status, createdAt',
      simulations: 'id, slot, updatedAt',
      events: 'id, type, timestamp',
    });
  }
}

export const db = new DispatchAcademyDB();

export async function getSettings(): Promise<AppSettings> {
  const current = await db.settings.get('current');
  if (!current) {
    await db.settings.put(defaultSettings);
    return defaultSettings;
  }
  return current;
}

export async function updateSettings(partial: Partial<AppSettings>): Promise<AppSettings> {
  const current = await getSettings();
  const updated = { ...current, ...partial };
  await db.settings.put(updated);
  return updated;
}
