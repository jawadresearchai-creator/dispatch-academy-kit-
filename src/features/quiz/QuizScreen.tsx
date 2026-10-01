import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  HelpCircle,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Zap,
  Award,
} from 'lucide-react';
import { quizzesData, getModules } from '../../data/loader';
import { db, type QuizAttempt } from '../../db';
import { generateContentAI } from '../../ai/aiClient';
import { buildAnswerGradingPrompt } from '../../ai/prompts';
import { Button, Card, Pill } from '../../components/ui';

export const QuizScreen: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialModule = searchParams.get('module') || 'm00-01';

  const [selectedModule, setSelectedModule] = useState(initialModule);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [revealed, setRevealed] = useState(false);
  const [aiGrading, setAiGrading] = useState(false);
  const [aiFeedback, setAiFeedback] = useState<string | null>(null);
  const [scores, setScores] = useState<Record<number, 'correct' | 'partly' | 'wrong'>>({});

  const quizGroup = quizzesData.find((q) => q.module === selectedModule) || quizzesData[0];
  const questions = quizGroup?.items || [];
  const currentQ = questions[currentQIndex];

  useEffect(() => {
    setCurrentQIndex(0);
    setUserAnswer('');
    setRevealed(false);
    setAiFeedback(null);
    setScores({});
  }, [selectedModule]);

  const handleReveal = () => {
    setRevealed(true);
  };

  const handleGrade = async (grade: 'correct' | 'partly' | 'wrong') => {
    const updated = { ...scores, [currentQIndex]: grade };
    setScores(updated);

    if (currentQIndex < questions.length - 1) {
      setCurrentQIndex(currentQIndex + 1);
      setUserAnswer('');
      setRevealed(false);
      setAiFeedback(null);
    } else {
      // Completed quiz! Save attempt
      let correctCount = 0;
      Object.values(updated).forEach((g) => {
        if (g === 'correct') correctCount += 2;
        else if (g === 'partly') correctCount += 1;
      });

      const attempt: QuizAttempt = {
        id: `quiz-${selectedModule}-${Date.now()}`,
        quizId: selectedModule,
        moduleId: selectedModule,
        score: correctCount,
        maxScore: questions.length * 2,
        answers: [],
        createdAt: new Date().toISOString(),
      };
      await db.quizAttempts.put(attempt);
    }
  };

  const handleAIGrade = async () => {
    if (!userAnswer.trim() || aiGrading || !currentQ) return;
    setAiGrading(true);
    setRevealed(true);

    try {
      const { prompt, systemInstruction } = buildAnswerGradingPrompt(
        currentQ.question,
        currentQ.answer,
        userAnswer
      );

      const res = await generateContentAI({
        prompt,
        systemInstruction,
        jsonMode: true,
      });

      const parsed = JSON.parse(res);
      setAiFeedback(
        `Grade: ${parsed.verdict.toUpperCase()} (${parsed.score}/2). ${parsed.feedback}`
      );
      if (parsed.verdict === 'correct') handleGrade('correct');
      else if (parsed.verdict === 'partly') handleGrade('partly');
      else handleGrade('wrong');
    } catch {
      setAiFeedback('AI grading unavailable. Please self-grade using the model answer below.');
    } finally {
      setAiGrading(false);
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <div className="text-xs uppercase tracking-wider font-semibold text-[#C98500] dark:text-[#F5A524]">
            Module Knowledge Checks · 128 Questions
          </div>
          <h1 className="text-2xl font-extrabold text-[#13294B] dark:text-white mt-1">
            {quizGroup?.title || 'Module Check'}
          </h1>
        </div>

        {/* Module Picker */}
        <select
          value={selectedModule}
          onChange={(e) => setSelectedModule(e.target.value)}
          className="px-3 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-[#13294B] border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#F5A524]"
        >
          {quizzesData.map((q) => (
            <option key={q.module} value={q.module}>
              {q.module.toUpperCase()} — {q.title} ({q.items.length} Qs)
            </option>
          ))}
        </select>
      </div>

      {/* Progress Track */}
      <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
        <span>Question {currentQIndex + 1} of {questions.length}</span>
        <span>
          Answered: {Object.keys(scores).length} / {questions.length}
        </span>
      </div>

      <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
        <div
          className="bg-[#F5A524] h-full transition-all duration-300"
          style={{ width: `${((currentQIndex + 1) / questions.length) * 100}%` }}
        />
      </div>

      {/* Question Card */}
      {currentQ && (
        <Card className="p-6 md:p-8 space-y-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-xs font-mono font-bold text-slate-600 dark:text-slate-300">
              <HelpCircle className="w-3.5 h-3.5 text-[#F5A524]" />
              <span>Question #{currentQ.n}</span>
            </div>
            <h2 className="text-base md:text-lg font-bold text-[#13294B] dark:text-white leading-relaxed">
              {currentQ.question}
            </h2>
          </div>

          {/* User Answer Input */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-500">Your Answer:</label>
            <textarea
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              placeholder="Type your explanation, formula or calculation..."
              rows={4}
              disabled={revealed}
              className="w-full text-sm p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#F5A524] disabled:opacity-80"
            />
          </div>

          {/* Action Buttons */}
          {!revealed ? (
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Button
                variant="primary"
                onClick={handleReveal}
                disabled={!userAnswer.trim()}
              >
                Reveal Model Answer
              </Button>
              <Button
                variant="amber"
                onClick={handleAIGrade}
                disabled={!userAnswer.trim() || aiGrading}
                icon={<Sparkles className="w-4 h-4" />}
              >
                {aiGrading ? 'AI Grading...' : 'Grade with AI'}
              </Button>
            </div>
          ) : (
            <div className="space-y-6 pt-4 border-t border-slate-200 dark:border-slate-800 animate-fadeIn">
              {/* AI Feedback if any */}
              {aiFeedback && (
                <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-xs text-amber-900 dark:text-amber-200">
                  <div className="font-bold flex items-center gap-1.5 mb-1">
                    <Sparkles className="w-4 h-4 text-[#F5A524]" />
                    <span>AI Feedback</span>
                  </div>
                  <div>{aiFeedback}</div>
                </div>
              )}

              {/* Course Model Answer */}
              <div className="p-5 rounded-xl bg-[#FFF4DE] dark:bg-[#2A2312] border-l-4 border-l-[#F5A524] border border-amber-200/60 dark:border-amber-900/40">
                <div className="text-xs uppercase font-extrabold tracking-wider text-[#C98500] dark:text-[#F5A524] mb-1">
                  Official Course Model Answer
                </div>
                <div className="text-sm text-[#5C3B00] dark:text-amber-100 font-medium leading-relaxed">
                  {currentQ.answer}
                </div>
              </div>

              {/* Self-Grading Options */}
              <div className="space-y-2">
                <div className="text-xs font-semibold text-slate-500">
                  Self-Grade Your Answer vs Model:
                </div>
                <div className="flex flex-wrap gap-3">
                  <Button
                    variant="outline"
                    className="border-green-500 text-green-600 hover:bg-green-50 dark:hover:bg-green-950/30"
                    onClick={() => handleGrade('correct')}
                    icon={<CheckCircle2 className="w-4 h-4 text-green-500" />}
                  >
                    Correct (2 pts)
                  </Button>
                  <Button
                    variant="outline"
                    className="border-amber-500 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/30"
                    onClick={() => handleGrade('partly')}
                    icon={<AlertTriangle className="w-4 h-4 text-amber-500" />}
                  >
                    Partly Correct (1 pt)
                  </Button>
                  <Button
                    variant="outline"
                    className="border-red-500 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                    onClick={() => handleGrade('wrong')}
                    icon={<XCircle className="w-4 h-4 text-red-500" />}
                  >
                    Incorrect (0 pts)
                  </Button>
                </div>
              </div>
            </div>
          )}
        </Card>
      )}
    </div>
  );
};
