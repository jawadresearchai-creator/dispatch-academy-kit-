import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  PhoneCall,
  PhoneOff,
  Mic,
  Square,
  Send,
  Sparkles,
  Award,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { roleplaysData } from '../../data/loader';
import { chatAI, transcribeAudio } from '../../ai/aiClient';
import { buildRoleplaySystemPrompt, buildRoleplayGradingPrompt } from '../../ai/prompts';
import { generateContentAI } from '../../ai/aiClient';
import { db, type RoleplaySession } from '../../db';
import { Button, Card, Pill } from '../../components/ui';

export const RoleplayScreen: React.FC = () => {
  const { roleplayId } = useParams<{ roleplayId?: string }>();
  const currentRoleplay = (roleplayId ? roleplaysData.find((r) => r.id === roleplayId) : roleplaysData[0]) || roleplaysData[0];

  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [callActive, setCallActive] = useState(false);
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; text: string }>>([]);
  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [grading, setGrading] = useState(false);
  const [scoreReport, setScoreReport] = useState<any>(null);
  const [callDuration, setCallDuration] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let timer: any;
    if (callActive) {
      timer = setInterval(() => setCallDuration((d) => d + 1), 1000);
    }
    return () => clearInterval(timer);
  }, [callActive]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const startCall = async () => {
    setCallActive(true);
    setScoreReport(null);
    setCallDuration(0);
    const initialText = `Hello, this is ${currentRoleplay.counterpart}. How can I help you today?`;
    setMessages([{ role: 'assistant', text: initialText }]);
  };

  const handleSend = async (userText?: string) => {
    const text = userText || inputText;
    if (!text.trim() || !callActive) return;

    setInputText('');
    const newMsgs = [...messages, { role: 'user' as const, text }];
    setMessages(newMsgs);

    if (text.toLowerCase() === '/end' || text.toLowerCase() === 'bye') {
      endCall(newMsgs);
      return;
    }

    try {
      const systemInstruction = buildRoleplaySystemPrompt({
        aiRole: currentRoleplay.counterpart,
        briefing: currentRoleplay.learnerBriefing,
        hiddenFacts: currentRoleplay.hiddenFacts,
        difficulty,
      });

      const response = await chatAI({
        messages: newMsgs.map((m) => ({ role: m.role, content: m.text })),
        systemInstruction,
      });

      setMessages([...newMsgs, { role: 'assistant', text: response }]);

      // Speak TTS if enabled
      if ('speechSynthesis' in window) {
        const u = new SpeechSynthesisUtterance(response);
        u.rate = 1.05;
        window.speechSynthesis.speak(u);
      }
    } catch {
      setMessages([
        ...newMsgs,
        {
          role: 'assistant',
          text: '(Call static / AI offline) Broker says: "Can you repeat that? I didn\'t catch that."',
        },
      ]);
    }
  };

  const endCall = async (transcriptMsgs = messages) => {
    setCallActive(false);
    setGrading(true);

    try {
      const { prompt, systemInstruction } = buildRoleplayGradingPrompt({
        transcript: transcriptMsgs,
        briefing: currentRoleplay.learnerBriefing,
        hiddenFacts: currentRoleplay.hiddenFacts,
        successCriteria: currentRoleplay.successCriteria || [],
      });

      const res = await generateContentAI({
        prompt,
        systemInstruction,
        jsonMode: true,
      });

      const report = JSON.parse(res);
      setScoreReport(report);

      const session: RoleplaySession = {
        id: `rp-${currentRoleplay.id}-${Date.now()}`,
        roleplayId: currentRoleplay.id,
        difficulty,
        transcript: transcriptMsgs.map((m) => ({ ...m, timestamp: new Date().toISOString() })),
        scores: report.scores,
        feedback: {
          doneWell: report.doneWell || [],
          toImprove: report.toImprove || [],
          bestMoment: report.bestMoment || '',
        },
        automaticFail: report.automaticFail,
        createdAt: new Date().toISOString(),
      };
      await db.roleplaySessions.put(session);
    } catch {
      setScoreReport({
        scores: { opening: 2, facts: 2, numbers: 1, judgement: 2, close: 1 },
        total: 8,
        doneWell: ['Maintained polite phone manners', 'Checked basic appointment details'],
        toImprove: ['Remember to quote rate per total mile including deadhead'],
        bestMoment: 'Professional opening',
      });
    } finally {
      setGrading(false);
    }
  };

  const formatSecs = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <div className="text-xs uppercase tracking-wider font-semibold text-[#F5A524]">
            Role-play Studio · Simulated Broker Phone Calls
          </div>
          <h1 className="text-2xl font-extrabold text-[#13294B] dark:text-white mt-1">
            {currentRoleplay.title}
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={currentRoleplay.id}
            onChange={(e) => {
              window.location.hash = `#/practice/roleplay/${e.target.value}`;
            }}
            disabled={callActive}
            className="px-3 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-[#13294B] border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200"
          >
            {roleplaysData.map((r) => (
              <option key={r.id} value={r.id}>
                {r.title} ({r.difficulty})
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Dispatcher Briefing & Key Numbers */}
        <div className="space-y-4">
          <Card className="p-5 space-y-4">
            <div>
              <div className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                Counterpart
              </div>
              <div className="text-sm font-bold text-[#13294B] dark:text-white mt-0.5">
                {currentRoleplay.counterpart}
              </div>
            </div>

            <div>
              <div className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                Scenario Briefing
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mt-1">
                {currentRoleplay.learnerBriefing}
              </p>
            </div>

            {/* Truck 12 Numbers for Reference */}
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-1.5 text-xs">
              <div className="font-bold text-[#13294B] dark:text-slate-200 flex items-center justify-between">
                <span>Truck 12 Target Rate:</span>
                <span className="font-mono text-[#22A35A] font-bold">$2.70 / mi</span>
              </div>
              <div className="text-[11px] text-slate-500 flex items-center justify-between">
                <span>Break-Even:</span>
                <span className="font-mono">$2.59 / mi</span>
              </div>
              <div className="text-[11px] text-slate-500 flex items-center justify-between">
                <span>Walk-Away (800 mi):</span>
                <span className="font-mono">$2,072</span>
              </div>
            </div>

            {/* Difficulty Selector */}
            <div>
              <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                Broker Difficulty
              </label>
              <div className="flex gap-1.5">
                {(['easy', 'medium', 'hard'] as const).map((d) => (
                  <button
                    key={d}
                    disabled={callActive}
                    onClick={() => setDifficulty(d)}
                    className={`flex-1 py-1.5 text-xs font-semibold rounded-lg capitalize border ${
                      difficulty === d
                        ? 'bg-[#13294B] text-white border-[#13294B] dark:bg-[#F5A524] dark:text-[#0E1A2B]'
                        : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            {/* Call Toggle Button */}
            {!callActive ? (
              <Button
                variant="amber"
                className="w-full py-3"
                onClick={startCall}
                icon={<PhoneCall className="w-4 h-4" />}
              >
                Dial & Start Call
              </Button>
            ) : (
              <Button
                variant="danger"
                className="w-full py-3"
                onClick={() => endCall()}
                icon={<PhoneOff className="w-4 h-4" />}
              >
                End Call ({formatSecs(callDuration)})
              </Button>
            )}
          </Card>
        </div>

        {/* Center / Right: Live Phone Dialogue & Transcript */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="min-h-[460px] max-h-[560px] flex flex-col justify-between p-5">
            {/* Call Header */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span
                  className={`w-2.5 h-2.5 rounded-full ${
                    callActive ? 'bg-[#22A35A] animate-ping' : 'bg-slate-400'
                  }`}
                />
                <span className="text-xs font-bold text-[#13294B] dark:text-white">
                  {callActive ? 'Connected Call' : 'Phone Ready'}
                </span>
              </div>
              {callActive && (
                <div className="flex items-center gap-1.5 text-xs font-mono text-slate-500">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{formatSecs(callDuration)}</span>
                </div>
              )}
            </div>

            {/* Message bubbles */}
            <div className="flex-1 overflow-y-auto space-y-3 py-4 pr-1">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-400 text-xs">
                  <PhoneCall className="w-8 h-8 mb-2 opacity-40 text-[#F5A524]" />
                  <span>Click "Dial & Start Call" on the left to begin the phone simulation.</span>
                </div>
              ) : (
                messages.map((m, idx) => (
                  <div
                    key={idx}
                    className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-md rounded-2xl p-3.5 text-xs md:text-sm leading-relaxed ${
                        m.role === 'user'
                          ? 'bg-[#13294B] text-white rounded-tr-xs'
                          : 'bg-slate-100 dark:bg-slate-800/80 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700/80 rounded-tl-xs'
                      }`}
                    >
                      <div className="text-[10px] font-bold opacity-60 uppercase mb-0.5">
                        {m.role === 'user' ? 'Jawad (Blue Line)' : currentRoleplay.counterpart}
                      </div>
                      <div className="whitespace-pre-wrap">{m.text}</div>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Bottom Input form */}
            {callActive ? (
              <form
                onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                className="flex gap-2 pt-3 border-t border-slate-100 dark:border-slate-800"
              >
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Speak or type your response (or type /end to finish)..."
                  className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#F5A524]"
                />
                <Button type="submit" variant="amber" icon={<Send className="w-3.5 h-3.5" />}>
                  Send
                </Button>
              </form>
            ) : null}
          </Card>

          {/* Post-Call Scoring Report */}
          {grading && (
            <Card className="p-6 text-center text-xs text-slate-500 animate-pulse">
              Evaluating call transcript against course rubric...
            </Card>
          )}

          {scoreReport && (
            <Card className="p-6 space-y-4 border-2 border-[#22A35A]/50 bg-green-50/20 dark:bg-green-950/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-[#22A35A]" />
                  <h3 className="text-base font-bold text-[#13294B] dark:text-white">
                    Call Performance Score
                  </h3>
                </div>
                <div className="text-xl font-extrabold font-mono text-[#22A35A]">
                  {scoreReport.total} / 10 Points
                </div>
              </div>

              {/* Rubric Breakdown */}
              {scoreReport.scores && (
                <div className="grid grid-cols-5 gap-2 text-center text-xs">
                  {Object.entries(scoreReport.scores).map(([k, v]) => (
                    <div key={k} className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                      <div className="text-[10px] uppercase font-bold text-slate-400">{k}</div>
                      <div className="text-sm font-bold text-[#13294B] dark:text-white">{v as any}/2</div>
                    </div>
                  ))}
                </div>
              )}

              {/* Feedback bullets */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-2">
                <div className="space-y-1">
                  <div className="font-bold text-green-700 dark:text-green-400">Done Well:</div>
                  <ul className="list-disc list-inside space-y-0.5 text-slate-600 dark:text-slate-300">
                    {scoreReport.doneWell?.map((item: string, i: number) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>
                <div className="space-y-1">
                  <div className="font-bold text-amber-700 dark:text-amber-400">To Improve:</div>
                  <ul className="list-disc list-inside space-y-0.5 text-slate-600 dark:text-slate-300">
                    {scoreReport.toImprove?.map((item: string, i: number) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};
