import { COURSE_GUARDRAILS } from './aiClient';

export function buildTutorPrompt(
  question: string,
  contextPages: Array<{ id: string; title: string; markdown: string }>,
  glossaryMatches: Array<{ term: string; definition: string }>,
  mode: 'explain' | 'simplify' | 'example' | 'quiz_me' | 'urdu'
): { prompt: string; systemInstruction: string } {
  let modeInstruction = '';
  switch (mode) {
    case 'simplify':
      modeInstruction = 'Explain in very simple terms as if to a beginner dispatcher. Use plain language and short sentences.';
      break;
    case 'example':
      modeInstruction = 'Always illustrate the concept using Blue Line Transport’s Truck 12 (53ft Dry Van, driver Dave, $1,300/wk fixed costs, $2.59 break-even).';
      break;
    case 'urdu':
      modeInstruction = 'Explain in conversational Roman Urdu (or Urdu script with Roman terminology), but keep all technical freight terms (like deadhead, rate con, BOL, detention, ELD, break-even) in standard English.';
      break;
    case 'quiz_me':
      modeInstruction = 'Instead of answering directly, ask the learner 1 or 2 quick diagnostic questions to test if they understand this concept from the course.';
      break;
    case 'explain':
    default:
      modeInstruction = 'Provide a crisp direct answer first, followed by clear practical explanation and references.';
      break;
  }

  const systemInstruction = `${COURSE_GUARDRAILS}

MODE INSTRUCTION:
${modeInstruction}

IMPORTANT FORMAT RULE:
At the very end of your response, always cite the course page IDs used in this format:
Sources: [mXX-pYY], [mXX-pZZ]`;

  const contextText = contextPages
    .map((p) => `--- PAGE: [${p.id}] ${p.title} ---\n${p.markdown.slice(0, 2500)}`)
    .join('\n\n');

  const glossaryText = glossaryMatches.length > 0
    ? '\n\nRELEVANT GLOSSARY DEFINITIONS:\n' +
      glossaryMatches.map((g) => `- ${g.term}: ${g.definition}`).join('\n')
    : '';

  const prompt = `QUESTION:
${question}

COURSE CONTEXT:
${contextText}${glossaryText}`;

  return { prompt, systemInstruction };
}

export function buildAnswerGradingPrompt(
  question: string,
  modelAnswer: string,
  userAnswer: string
): { prompt: string; systemInstruction: string } {
  const systemInstruction = `${COURSE_GUARDRAILS}
You are evaluating a student's answer against the official course model answer.
Output JSON only with keys:
score: number (0, 1, or 2),
maxScore: 2,
verdict: "correct" | "partly" | "wrong",
feedback: "short explanation of the grade",
missingPoints: ["key points omitted if any"]`;

  const prompt = `QUESTION:
${question}

MODEL ANSWER:
${modelAnswer}

STUDENT ANSWER:
${userAnswer}`;

  return { prompt, systemInstruction };
}

export function buildRoleplaySystemPrompt(params: {
  aiRole: string;
  briefing: string;
  hiddenFacts: string;
  difficulty: 'easy' | 'medium' | 'hard';
}): string {
  return `${COURSE_GUARDRAILS}
ROLE: You are ${params.aiRole} on a live phone call with Jawad, a dispatcher for Blue Line Transport (MC 1298456).
SCENARIO (what Jawad knows):
${params.briefing}

HIDDEN FACTS (only reveal when asked directly or when naturally needed):
${params.hiddenFacts}

DIFFICULTY LEVEL: ${params.difficulty.toUpperCase()}
- easy: friendly, cooperative, offers reasonable rates, patient.
- medium: realistic freight broker pushback, demands quick answers, negotiates firmly.
- hard: fast-talking, lowballs rates, pushes past legal hours or tight appointment windows, skeptical.

STYLE:
Speak like a real U.S. freight broker or driver on the phone. Keep responses short and conversational (1 to 3 sentences maximum per turn). Never break character, never use bullet points or lists, and never say you are an AI. Stay in character until the caller types "/end" or hangs up.`;
}

export function buildRoleplayGradingPrompt(params: {
  transcript: Array<{ role: string; text: string }>;
  briefing: string;
  hiddenFacts: string;
  successCriteria: string[];
}): { prompt: string; systemInstruction: string } {
  const systemInstruction = `${COURSE_GUARDRAILS}
You are grading a simulated freight dispatch phone call based on the course rubric.
Output JSON only with keys:
scores: { opening: 0-2, facts: 0-2, numbers: 0-2, judgement: 0-2, close: 0-2 },
total: 0-10,
automaticFail: { triggered: boolean, reason: string },
doneWell: [string, string, string],
toImprove: [string, string, string],
bestMoment: string,
modelDialogue: string`;

  const transcriptText = params.transcript
    .map((t) => `${t.role === 'user' ? 'Dispatcher (Jawad)' : 'Counterpart'}: ${t.text}`)
    .join('\n');

  const prompt = `SCENARIO BRIEFING:
${params.briefing}

HIDDEN FACTS:
${params.hiddenFacts}

SUCCESS CRITERIA:
${params.successCriteria.join('\n')}

TRANSCRIPT:
${transcriptText}`;

  return { prompt, systemInstruction };
}
