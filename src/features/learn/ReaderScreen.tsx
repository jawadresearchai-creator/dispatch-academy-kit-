import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  ArrowLeft,
  ArrowRight,
  Bookmark,
  CheckCircle2,
  FileText,
  Sparkles,
  HelpCircle,
  ExternalLink,
  ZoomIn,
} from 'lucide-react';
import {
  getPage,
  getModule,
  getPagesForModule,
} from '../../data/loader';
import { db, type PageProgress, type BookmarkItem } from '../../db';
import { Button, Card, Callout, Lightbox, type CalloutType } from '../../components/ui';

export const ReaderScreen: React.FC = () => {
  const { moduleId = 'm00-01', pageId } = useParams<{ moduleId: string; pageId: string }>();
  const navigate = useNavigate();

  const currentModule = getModule(moduleId);
  const modulePages = currentModule ? getPagesForModule(currentModule.id) : [];
  const currentPage = pageId
    ? getPage(pageId)
    : modulePages[0];

  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isUnderstood, setIsUnderstood] = useState(false);
  const [confidence, setConfidence] = useState(2);
  const [lightboxImg, setLightboxImg] = useState<{ src: string; title: string } | null>(null);

  // Determine prev/next page
  const currentIndex = modulePages.findIndex((p) => p.id === currentPage?.id);
  const prevPage = currentIndex > 0 ? modulePages[currentIndex - 1] : null;
  const nextPage = currentIndex < modulePages.length - 1 ? modulePages[currentIndex + 1] : null;

  useEffect(() => {
    if (!currentPage) return;

    // Check bookmark
    db.bookmarks.get(currentPage.id).then((b) => setIsBookmarked(!!b));

    // Check progress
    db.progress.get(currentPage.id).then((p) => {
      if (p) {
        setIsUnderstood(p.understood);
        setConfidence(p.confidence || 2);
      } else {
        setIsUnderstood(false);
        setConfidence(2);
      }
    });

    // Keyboard navigation
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === 'ArrowLeft' && prevPage) {
        navigate(`/learn/${moduleId}/${prevPage.id}`);
      } else if (e.key === 'ArrowRight' && nextPage) {
        navigate(`/learn/${moduleId}/${nextPage.id}`);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentPage?.id, moduleId, prevPage, nextPage, navigate]);

  const toggleBookmark = async () => {
    if (!currentPage) return;
    if (isBookmarked) {
      await db.bookmarks.delete(currentPage.id);
      setIsBookmarked(false);
    } else {
      const item: BookmarkItem = {
        pageId: currentPage.id,
        moduleId,
        title: currentPage.title,
        kicker: currentPage.kicker,
        createdAt: new Date().toISOString(),
      };
      await db.bookmarks.put(item);
      setIsBookmarked(true);
    }
  };

  const toggleUnderstood = async () => {
    if (!currentPage) return;
    const nextVal = !isUnderstood;
    setIsUnderstood(nextVal);

    const progress: PageProgress = {
      pageId: currentPage.id,
      moduleId,
      readAt: nextVal ? new Date().toISOString() : undefined,
      understood: nextVal,
      confidence,
      timeSpentSec: 30,
    };
    await db.progress.put(progress);
  };

  if (!currentPage || !currentModule) {
    return (
      <div className="p-8 text-center text-sm text-slate-500">
        Page not found. Return to <Link to="/learn" className="text-[#C98500] underline">Module Library</Link>.
      </div>
    );
  }

  // Pre-process markdown to clean duplicate titles and render callouts
  const cleanMarkdown = currentPage.markdown
    .replace(/^#\s+.*\n/, '') // remove redundant h1 if present
    .replace(new RegExp(`^${currentPage.title}.*\n`, 'i'), '');

  return (
    <div className="min-h-full py-8 px-4 md:px-8 bg-slate-50/50 dark:bg-[#0A1320]">
      {/* Top Floating Control Bar */}
      <div className="max-w-[840px] mx-auto mb-6 flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-[#0E1A2B] p-3 md:p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs sticky top-20 z-20">
        <div className="flex items-center gap-3">
          <Link
            to={`/learn/${moduleId}`}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Back to Module Overview"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="text-[10px] font-bold text-[#C98500] dark:text-[#F5A524] uppercase tracking-wider">
              {currentPage.kicker}
            </div>
            <div className="text-xs font-bold text-[#13294B] dark:text-white flex items-center gap-2">
              <span>Page {currentPage.page} of {currentModule.pageCount}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Open in PDF button */}
          {currentModule.pdf && (
            <a
              href={`${currentModule.pdf}#page=${currentPage.page}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:border-[#F5A524] transition-colors"
              title={`Open page ${currentPage.page} in original handbook PDF`}
            >
              <FileText className="w-3.5 h-3.5 text-red-500" />
              <span className="hidden sm:inline">Open in PDF (p. {currentPage.page})</span>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </a>
          )}

          {/* Bookmark Button */}
          <button
            onClick={toggleBookmark}
            className={`p-2 rounded-xl transition-colors ${
              isBookmarked
                ? 'bg-amber-100 dark:bg-amber-900/40 text-[#C98500] dark:text-[#F5A524]'
                : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
            title={isBookmarked ? 'Remove bookmark' : 'Bookmark this page'}
          >
            <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
          </button>

          {/* Understood Toggle */}
          <Button
            size="sm"
            variant={isUnderstood ? 'primary' : 'outline'}
            onClick={toggleUnderstood}
            icon={<CheckCircle2 className="w-4 h-4 text-[#22A35A]" />}
            className="text-xs"
          >
            {isUnderstood ? 'Understood' : 'Mark Understood'}
          </Button>
        </div>
      </div>

      {/* Main Document Reader Card */}
      <article className="max-w-[840px] mx-auto bg-white dark:bg-[#0E1A2B] rounded-2xl border border-slate-200 dark:border-slate-800 p-6 md:p-12 shadow-sm space-y-6">
        {/* Page Title & Kicker */}
        <header className="border-b border-slate-100 dark:border-slate-800 pb-5">
          <div className="text-xs uppercase font-extrabold tracking-widest text-[#C98500] dark:text-[#F5A524] mb-1">
            {currentPage.kicker}
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#13294B] dark:text-white leading-tight">
            {currentPage.title}
          </h1>
        </header>

        {/* Inline Images / Diagrams if present */}
        {currentPage.images && currentPage.images.length > 0 && (
          <div className="my-6 space-y-4">
            {currentPage.images.map((imgSrc, imgIdx) => (
              <div
                key={imgIdx}
                className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 group cursor-pointer"
                onClick={() => setLightboxImg({ src: imgSrc, title: currentPage.title })}
              >
                <img
                  src={imgSrc}
                  alt={currentPage.title}
                  loading="lazy"
                  className="w-full max-h-[500px] object-contain mx-auto"
                />
                <div className="absolute top-3 right-3 p-1.5 rounded-lg bg-black/60 backdrop-blur-xs text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 text-xs">
                  <ZoomIn className="w-3.5 h-3.5" />
                  <span>Zoom diagram</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Markdown Content */}
        <div className="prose dark:prose-invert max-w-none text-[#0E1A2B] dark:text-slate-200 text-sm md:text-base leading-relaxed space-y-4">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              blockquote: ({ children }) => {
                // Check if the blockquote is a styled callout: **[TYPE] Title**
                const text = React.Children.toArray(children).map((c: any) => c?.props?.children || '').join('');
                const match = text.match(/^\*\*\[(.*?)\]\s*(.*?)\*\*/);
                if (match) {
                  const type = match[1].trim() as CalloutType;
                  const title = match[2].trim();
                  return (
                    <Callout type={type} title={title}>
                      {children}
                    </Callout>
                  );
                }
                return (
                  <blockquote className="border-l-4 border-[#13294B] dark:border-[#F5A524] pl-4 italic text-slate-600 dark:text-slate-300 my-4">
                    {children}
                  </blockquote>
                );
              },
              table: ({ children }) => (
                <div className="overflow-x-auto my-6 rounded-xl border border-slate-200 dark:border-slate-800">
                  <table className="w-full text-left text-sm border-collapse">{children}</table>
                </div>
              ),
              thead: ({ children }) => (
                <thead className="bg-[#13294B] text-white uppercase text-xs tracking-wider">{children}</thead>
              ),
              th: ({ children }) => (
                <th className="px-4 py-3 font-semibold whitespace-nowrap">{children}</th>
              ),
              td: ({ children }) => (
                <td className="px-4 py-3 border-t border-slate-100 dark:border-slate-800">{children}</td>
              ),
              a: ({ href, children }) => (
                <a href={href} className="text-[#C98500] dark:text-[#F5A524] underline hover:opacity-80">
                  {children}
                </a>
              ),
            }}
          >
            {cleanMarkdown}
          </ReactMarkdown>
        </div>

        {/* Bottom AI & Practice Actions */}
        <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Link to={`/tutor?q=${encodeURIComponent(`Explain page [${currentPage.id}] ${currentPage.title} simply`)}`}>
              <Button size="sm" variant="outline" icon={<Sparkles className="w-3.5 h-3.5 text-[#F5A524]" />}>
                Explain Simpler
              </Button>
            </Link>
            <Link to={`/tutor?q=${encodeURIComponent(`Explain page [${currentPage.id}] ${currentPage.title} in Roman Urdu`)}`}>
              <Button size="sm" variant="outline" icon={<Sparkles className="w-3.5 h-3.5 text-[#0E9F9A]" />}>
                Explain in Urdu
              </Button>
            </Link>
            <Link to={`/practice/quizzes?module=${moduleId}`}>
              <Button size="sm" variant="outline" icon={<HelpCircle className="w-3.5 h-3.5 text-[#7C5CC4]" />}>
                Module Check
              </Button>
            </Link>
          </div>
        </div>
      </article>

      {/* Prev / Next Pagination Bar */}
      <div className="max-w-[840px] mx-auto mt-6 flex items-center justify-between">
        {prevPage ? (
          <Link to={`/learn/${moduleId}/${prevPage.id}`}>
            <Button variant="secondary" icon={<ArrowLeft className="w-4 h-4" />}>
              Previous: {prevPage.title}
            </Button>
          </Link>
        ) : (
          <div />
        )}

        {nextPage ? (
          <Link to={`/learn/${moduleId}/${nextPage.id}`}>
            <Button variant="primary" icon={<ArrowRight className="w-4 h-4" />}>
              Next: {nextPage.title}
            </Button>
          </Link>
        ) : (
          <Link to={`/learn/${moduleId}`}>
            <Button variant="amber">
              Finish Module →
            </Button>
          </Link>
        )}
      </div>

      {/* Diagram Lightbox */}
      {lightboxImg && (
        <Lightbox
          isOpen={!!lightboxImg}
          onClose={() => setLightboxImg(null)}
          imageSrc={lightboxImg.src}
          title={lightboxImg.title}
        />
      )}
    </div>
  );
};
