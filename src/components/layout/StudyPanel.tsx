import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  X,
  FileText,
  Bookmark,
  Sparkles,
  Send,
  Trash2,
  ExternalLink,
} from 'lucide-react';
import { db, type NoteItem, type BookmarkItem } from '../../db';
import { chatAI, COURSE_GUARDRAILS } from '../../ai/aiClient';
import { getPage } from '../../data/loader';

export interface StudyPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const StudyPanel: React.FC<StudyPanelProps> = ({ isOpen, onClose }) => {
  const location = useLocation();
  const [tab, setTab] = useState<'notes' | 'bookmarks' | 'tutor'>('notes');
  const [notes, setNotes] = useState<NoteItem[]>([]);
  const [newNoteText, setNewNoteText] = useState('');
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([]);
  const [tutorMessages, setTutorMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([
    {
      role: 'assistant',
      content: 'Hello Jawad! I am your course tutor. Ask me anything about this page or any U.S. freight dispatch rule.',
    },
  ]);
  const [tutorInput, setTutorInput] = useState('');
  const [isAsking, setIsAsking] = useState(false);

  // Extract currentPageId from URL if inside #/learn/mXX/pageId
  const match = location.pathname.match(/\/learn\/([^/]+)\/([^/]+)/);
  const currentModuleId = match ? match[1] : '';
  const currentPageId = match ? match[2] : '';
  const currentPage = currentPageId ? getPage(currentPageId) : undefined;

  useEffect(() => {
    if (isOpen) {
      loadNotes();
      loadBookmarks();
    }
  }, [isOpen, currentPageId]);

  const loadNotes = async () => {
    if (currentPageId) {
      const pageNotes = await db.notes.where('pageId').equals(currentPageId).toArray();
      setNotes(pageNotes);
    } else {
      const allNotes = await db.notes.orderBy('createdAt').reverse().limit(20).toArray();
      setNotes(allNotes);
    }
  };

  const loadBookmarks = async () => {
    const all = await db.bookmarks.orderBy('createdAt').reverse().toArray();
    setBookmarks(all);
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteText.trim()) return;

    const noteItem: NoteItem = {
      id: `note-${Date.now()}`,
      pageId: currentPageId || 'general',
      moduleId: currentModuleId || 'general',
      text: newNoteText.trim(),
      highlights: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await db.notes.put(noteItem);
    setNewNoteText('');
    loadNotes();
  };

  const handleDeleteNote = async (id: string) => {
    await db.notes.delete(id);
    loadNotes();
  };

  const handleSendTutor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tutorInput.trim() || isAsking) return;

    const userText = tutorInput.trim();
    setTutorInput('');
    const updatedMessages = [...tutorMessages, { role: 'user' as const, content: userText }];
    setTutorMessages(updatedMessages);
    setIsAsking(true);

    try {
      const pageContext = currentPage
        ? `CURRENT PAGE: [${currentPage.id}] ${currentPage.title}\n${currentPage.markdown.slice(0, 2000)}`
        : 'GENERAL DISPATCH ACADEMY TUTOR';

      const response = await chatAI({
        messages: updatedMessages,
        systemInstruction: `${COURSE_GUARDRAILS}\n\nCONTEXT:\n${pageContext}`,
      });

      setTutorMessages([...updatedMessages, { role: 'assistant', content: response }]);
    } catch (err: any) {
      setTutorMessages([
        ...updatedMessages,
        {
          role: 'assistant',
          content: 'Sorry, could not connect to AI. Please ensure an API key is configured in Settings.',
        },
      ]);
    } finally {
      setIsAsking(false);
    }
  };

  if (!isOpen) return null;

  return (
    <aside className="w-80 md:w-96 bg-white dark:bg-[#0E1A2B] border-l border-slate-200 dark:border-slate-800 flex flex-col z-30 shadow-lg shrink-0">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-bold text-sm text-[#13294B] dark:text-white">Study Companion</span>
          {currentPage && (
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-900/40 text-[#C98500] dark:text-amber-300">
              {currentPage.id}
            </span>
          )}
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 px-4 text-xs font-semibold">
        <button
          onClick={() => setTab('notes')}
          className={`py-2.5 px-3 border-b-2 flex items-center gap-1.5 ${
            tab === 'notes'
              ? 'border-[#F5A524] text-[#13294B] dark:text-[#F5A524]'
              : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          Notes ({notes.length})
        </button>
        <button
          onClick={() => setTab('bookmarks')}
          className={`py-2.5 px-3 border-b-2 flex items-center gap-1.5 ${
            tab === 'bookmarks'
              ? 'border-[#F5A524] text-[#13294B] dark:text-[#F5A524]'
              : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
          }`}
        >
          <Bookmark className="w-3.5 h-3.5" />
          Bookmarks ({bookmarks.length})
        </button>
        <button
          onClick={() => setTab('tutor')}
          className={`py-2.5 px-3 border-b-2 flex items-center gap-1.5 ${
            tab === 'tutor'
              ? 'border-[#F5A524] text-[#13294B] dark:text-[#F5A524]'
              : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          Page Tutor
        </button>
      </div>

      {/* Content Body */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* TAB 1: NOTES */}
        {tab === 'notes' && (
          <div className="space-y-4">
            <form onSubmit={handleAddNote} className="space-y-2">
              <textarea
                value={newNoteText}
                onChange={(e) => setNewNoteText(e.target.value)}
                placeholder={
                  currentPage
                    ? `Add a note for ${currentPage.title}...`
                    : 'Write a general note...'
                }
                rows={3}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-[#F5A524]"
              />
              <button
                type="submit"
                disabled={!newNoteText.trim()}
                className="w-full py-1.5 px-3 rounded-lg bg-[#13294B] text-white text-xs font-semibold hover:bg-[#0E1E38] disabled:opacity-50"
              >
                Save Note
              </button>
            </form>

            <div className="space-y-2 mt-4">
              {notes.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-400">
                  No notes recorded yet. Write your thoughts or reminders here.
                </div>
              ) : (
                notes.map((n) => (
                  <div
                    key={n.id}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-xs text-slate-700 dark:text-slate-200 relative group"
                  >
                    <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                      <span className="font-mono">{n.pageId}</span>
                      <span>{new Date(n.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="whitespace-pre-wrap">{n.text}</div>
                    <button
                      onClick={() => handleDeleteNote(n.id)}
                      className="absolute top-2 right-2 p-1 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Delete note"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* TAB 2: BOOKMARKS */}
        {tab === 'bookmarks' && (
          <div className="space-y-2">
            {bookmarks.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-400">
                No bookmarked pages yet. Click the bookmark icon on any handbook page to pin it here.
              </div>
            ) : (
              bookmarks.map((b) => (
                <a
                  key={b.pageId}
                  href={`#/learn/${b.moduleId}/${b.pageId}`}
                  className="block p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 hover:border-[#F5A524]/60 transition-colors"
                >
                  <div className="text-[10px] text-[#C98500] dark:text-[#F5A524] font-semibold uppercase tracking-wider">
                    {b.kicker}
                  </div>
                  <div className="text-xs font-bold text-[#13294B] dark:text-white mt-0.5 flex items-center justify-between">
                    <span>{b.title}</span>
                    <ExternalLink className="w-3 h-3 text-slate-400" />
                  </div>
                </a>
              ))
            )}
          </div>
        )}

        {/* TAB 3: PAGE TUTOR */}
        {tab === 'tutor' && (
          <div className="flex flex-col h-full space-y-3">
            <div className="flex-1 space-y-3 overflow-y-auto pr-1 max-h-[calc(100vh-280px)]">
              {tutorMessages.map((m, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-xl text-xs ${
                    m.role === 'user'
                      ? 'bg-[#13294B] text-white ml-6'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 mr-4 border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <div className="font-semibold text-[10px] opacity-70 mb-1">
                    {m.role === 'user' ? 'You' : 'AI Tutor'}
                  </div>
                  <div className="whitespace-pre-wrap leading-relaxed">{m.content}</div>
                </div>
              ))}
              {isAsking && (
                <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs text-slate-500 animate-pulse">
                  Thinking...
                </div>
              )}
            </div>

            <form onSubmit={handleSendTutor} className="flex gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
              <input
                type="text"
                value={tutorInput}
                onChange={(e) => setTutorInput(e.target.value)}
                placeholder="Ask about this page..."
                className="flex-1 text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-[#F5A524]"
              />
              <button
                type="submit"
                disabled={!tutorInput.trim() || isAsking}
                className="p-2 rounded-xl bg-[#13294B] text-white hover:bg-[#0E1E38] disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}
      </div>
    </aside>
  );
};
