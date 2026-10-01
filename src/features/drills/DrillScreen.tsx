import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Mic,
  Square,
  Volume2,
  CheckCircle2,
  Sparkles,
  RotateCcw,
  ArrowRight,
  Radio,
} from 'lucide-react';
import { drillsData } from '../../data/loader';
import { transcribeAudio } from '../../ai/aiClient';
import { Button, Card, Pill } from '../../components/ui';

export const DrillScreen: React.FC = () => {
  const { drillId } = useParams<{ drillId?: string }>();
  const selectedDrill = (drillId ? drillsData.find((d) => d.id === drillId) : drillsData[0]) || drillsData[0];

  const [isRecording, setIsRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [transcript, setTranscript] = useState<string | null>(null);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [transcribing, setTranscribing] = useState(false);

  const handleListen = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(selectedDrill.script);
      utterance.rate = 0.95;
      window.speechSynthesis.speak(utterance);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: BlobPart[] = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      recorder.onstop = async () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        setRecordedBlob(blob);
        stream.getTracks().forEach((track) => track.stop());

        // Transcribe automatically
        setTranscribing(true);
        try {
          const text = await transcribeAudio(blob);
          setTranscript(text);
        } catch {
          setTranscript('Audio recorded. (AI transcription unavailable in offline mode).');
        } finally {
          setTranscribing(false);
        }
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
      setTranscript(null);
    } catch {
      alert('Could not access microphone. Please check browser microphone permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      setIsRecording(false);
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <div className="text-xs uppercase tracking-wider font-semibold text-[#0E9F9A]">
            Drill Studio · Speaking Practice (1–12)
          </div>
          <h1 className="text-2xl font-extrabold text-[#13294B] dark:text-white mt-1">
            {selectedDrill.title}
          </h1>
        </div>

        <select
          value={selectedDrill.id}
          onChange={(e) => {
            window.location.hash = `#/practice/drills/${e.target.value}`;
          }}
          className="px-3 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-[#13294B] border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200"
        >
          {drillsData.map((d) => (
            <option key={d.id} value={d.id}>
              {d.title} ({d.module.toUpperCase()})
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Teleprompter / Script Area */}
        <div className="lg:col-span-2 space-y-5">
          <Card className="p-6 md:p-8 space-y-5">
            <div className="space-y-1">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Situation
              </div>
              <p className="text-xs md:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                {selectedDrill.situation}
              </p>
            </div>

            {/* Speaking Script / Prompter */}
            <div className="p-6 rounded-2xl bg-[#E2F5F4] dark:bg-[#0B2527] border-l-4 border-l-[#0E9F9A] border border-teal-200/50 dark:border-teal-900/50 space-y-2">
              <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#0E9F9A]">
                Speak this clearly into your microphone:
              </div>
              <div className="text-base md:text-lg font-bold text-[#064341] dark:text-teal-100 leading-relaxed font-sans">
                "{selectedDrill.script}"
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Button
                variant="outline"
                onClick={handleListen}
                icon={<Volume2 className="w-4 h-4 text-[#0E9F9A]" />}
              >
                Listen (Model Audio)
              </Button>

              {!isRecording ? (
                <Button
                  variant="primary"
                  onClick={startRecording}
                  icon={<Mic className="w-4 h-4 text-[#F5A524]" />}
                >
                  Start Speaking
                </Button>
              ) : (
                <Button
                  variant="danger"
                  onClick={stopRecording}
                  icon={<Square className="w-4 h-4" />}
                  className="animate-pulse"
                >
                  Stop Recording
                </Button>
              )}
            </div>

            {/* Live Transcription / Feedback */}
            {transcribing && (
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs text-slate-500 animate-pulse">
                Transcribing your speech with Gemini...
              </div>
            )}

            {transcript && (
              <div className="p-5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="text-xs font-bold text-[#13294B] dark:text-white flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#22A35A]" />
                  <span>Speech Transcription</span>
                </div>
                <div className="text-sm text-slate-700 dark:text-slate-200 font-mono bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-700">
                  {transcript}
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* Right Info: Key Phrases & NATO trainer shortcut */}
        <div className="space-y-4">
          <Card className="p-5 space-y-3">
            <h3 className="text-xs font-bold text-[#13294B] dark:text-white uppercase tracking-wider">
              Key Phrases to Master
            </h3>
            <ul className="space-y-2">
              {selectedDrill.keyPhrases?.map((phrase, idx) => (
                <li
                  key={idx}
                  className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-xs font-medium text-slate-700 dark:text-slate-300 flex items-start gap-2"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#0E9F9A] mt-1.5 shrink-0" />
                  <span>{phrase}</span>
                </li>
              ))}
            </ul>
          </Card>

          <Card className="p-5 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-[#13294B] dark:text-white">
              <Radio className="w-4 h-4 text-[#F5A524]" />
              <span>Phonetic Trainer</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Practise reading VINs, seal numbers and MC digits using standard NATO letters in the Toolbox.
            </p>
            <Link to="/toolbox?tool=phonetic">
              <Button size="sm" variant="outline" className="w-full mt-2 text-xs">
                Open NATO Alphabet
              </Button>
            </Link>
          </Card>
        </div>
      </div>
    </div>
  );
};
