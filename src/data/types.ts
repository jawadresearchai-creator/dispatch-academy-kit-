export interface CourseModule {
  id: string; // "m00-01", "m02" ... "m11"
  title: string;
  pdf: string;
  pageCount: number;
  coverImage: string | null;
  sections: Array<{
    name: string;
    pageIds: string[];
  }>;
}

export interface CoursePage {
  id: string;
  module: string;
  page: number;
  kicker: string;
  title: string;
  images: string[];
  markdown: string;
}

export interface CourseData {
  modules: CourseModule[];
  pages: CoursePage[];
}

export interface QuizQuestion {
  n: number;
  question: string;
  answer: string;
}

export interface QuizGroup {
  module: string;
  title: string;
  items: QuizQuestion[];
}

export interface GlossaryTerm {
  term: string;
  definition: string;
  module: string;
}

export interface DrillItem {
  id: string;
  module: string;
  title: string;
  situation: string;
  objective: string;
  script: string;
  keyPhrases: string[];
  estimatedMinutes?: number;
}

export interface RoleplayItem {
  id: string;
  module: string;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  estimatedMinutes: number;
  counterpart: string;
  learnerBriefing: string;
  hiddenFacts: string;
  successCriteria: string[];
  suggestedPhrases: string[];
}

export interface CityItem {
  name: string;
  state: string;
  lat: number;
  lon: number;
  tz: string;
  tier: number;
  zone: string;
}

export interface CitiesData {
  note: string;
  datZones: Record<string, string[]>;
  cities: CityItem[];
}

export interface DocumentHotspot {
  id: string;
  title: string;
  doc: 'ratecon' | 'bol' | 'pod';
  x: number; // percentage or px
  y: number;
  explanation: string;
  field: string;
  warning?: string;
}
