import type {
  CourseData,
  CourseModule,
  CoursePage,
  QuizGroup,
  GlossaryTerm,
  DrillItem,
  RoleplayItem,
  CitiesData,
  CityItem,
} from './types';

export type {
  CourseData,
  CourseModule,
  CoursePage,
  QuizGroup,
  GlossaryTerm,
  DrillItem,
  RoleplayItem,
  CitiesData,
  CityItem,
};

// Static JSON imports from /content
import courseDataRaw from '../../content/course.json';
import quizzesDataRaw from '../../content/quizzes.json';
import glossaryDataRaw from '../../content/glossary.json';
import drillsDataRaw from '../../content/drills.json';
import roleplaysDataRaw from '../../content/roleplays.json';
import practiceDataRaw from '../../content/practice-data.json';
import citiesDataRaw from '../../content/cities.json';
import hotspotsDataRaw from '../../content/document-hotspots.json';

export const courseData = courseDataRaw as unknown as CourseData;
export const quizzesData = quizzesDataRaw as unknown as QuizGroup[];
export const glossaryData = glossaryDataRaw as unknown as GlossaryTerm[];
export const drillsData = drillsDataRaw as unknown as DrillItem[];
export const roleplaysData = (
  Array.isArray(roleplaysDataRaw)
    ? roleplaysDataRaw
    : (roleplaysDataRaw as any).roleplays || []
) as RoleplayItem[];
export const practiceData = practiceDataRaw as any;
export const citiesData = citiesDataRaw as unknown as CitiesData;
export const hotspotsData = hotspotsDataRaw as any;

export function getModules(): CourseModule[] {
  return courseData.modules || [];
}

export function getModule(id: string): CourseModule | undefined {
  return courseData.modules?.find((m) => m.id === id);
}

export function getPage(id: string): CoursePage | undefined {
  return courseData.pages?.find((p) => p.id === id);
}

export function getPagesForModule(moduleId: string): CoursePage[] {
  return (courseData.pages || []).filter((p) => p.module === moduleId);
}

export function getGlossaryForModule(moduleId: string): GlossaryTerm[] {
  return (glossaryData || []).filter((g) => g.module === moduleId);
}

export function getDrillsForModule(moduleId: string): DrillItem[] {
  return (drillsData || []).filter((d) => d.module === moduleId);
}

export function getRoleplaysForModule(moduleId: string): RoleplayItem[] {
  return (roleplaysData || []).filter((r) => r.module === moduleId);
}

export function getQuizForModule(moduleId: string): QuizGroup | undefined {
  return (quizzesData || []).find((q) => q.module === moduleId);
}

export interface SearchResult {
  type: 'page' | 'glossary' | 'drill' | 'roleplay';
  id: string;
  title: string;
  subtitle: string;
  snippet?: string;
  url: string;
}

export function searchContent(query: string): SearchResult[] {
  if (!query || query.trim().length < 2) return [];
  const q = query.toLowerCase().trim();
  const results: SearchResult[] = [];

  // 1. Search Glossary
  for (const item of glossaryData) {
    if (item.term.toLowerCase().includes(q) || item.definition.toLowerCase().includes(q)) {
      results.push({
        type: 'glossary',
        id: `glossary-${item.term}`,
        title: item.term,
        subtitle: `Glossary · ${item.module}`,
        snippet: item.definition,
        url: `#/toolbox?tab=glossary&q=${encodeURIComponent(item.term)}`,
      });
      if (results.length > 25) break;
    }
  }

  // 2. Search Pages
  for (const page of courseData.pages || []) {
    const titleMatch = page.title.toLowerCase().includes(q);
    const kickerMatch = page.kicker.toLowerCase().includes(q);
    const mdIndex = page.markdown.toLowerCase().indexOf(q);

    if (titleMatch || kickerMatch || mdIndex !== -1) {
      let snippet = '';
      if (mdIndex !== -1) {
        const start = Math.max(0, mdIndex - 40);
        const end = Math.min(page.markdown.length, mdIndex + 80);
        snippet = (start > 0 ? '...' : '') + page.markdown.slice(start, end).replace(/[#*`_]/g, '') + '...';
      } else {
        snippet = page.kicker;
      }

      results.push({
        type: 'page',
        id: page.id,
        title: page.title,
        subtitle: `${page.module.toUpperCase()} · Page ${page.page} (${page.kicker})`,
        snippet,
        url: `#/learn/${page.module}/${page.id}`,
      });
      if (results.length > 30) break;
    }
  }

  // 3. Search Roleplays
  for (const rp of roleplaysData) {
    if (rp.title.toLowerCase().includes(q) || rp.learnerBriefing?.toLowerCase().includes(q)) {
      results.push({
        type: 'roleplay',
        id: rp.id,
        title: rp.title,
        subtitle: `Role-play · ${rp.counterpart} (${rp.difficulty})`,
        snippet: rp.learnerBriefing?.slice(0, 100) + '...',
        url: `#/practice/roleplay/${rp.id}`,
      });
    }
  }

  // 4. Search Drills
  for (const drill of drillsData) {
    if (drill.title.toLowerCase().includes(q) || drill.situation?.toLowerCase().includes(q)) {
      results.push({
        type: 'drill',
        id: drill.id,
        title: drill.title,
        subtitle: `Speaking Drill · ${drill.module}`,
        snippet: drill.situation?.slice(0, 100) + '...',
        url: `#/practice/drills/${drill.id}`,
      });
    }
  }

  return results.slice(0, 20);
}
