import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { StudyPanel } from './StudyPanel';
import { SearchPalette } from './SearchPalette';

export const Layout: React.FC = () => {
  const [searchOpen, setSearchOpen] = useState(false);
  const [studyPanelOpen, setStudyPanelOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#F3F5F8] dark:bg-[#0A1320] text-[#0E1A2B] dark:text-[#F1F5F9]">
      {/* Left Sidebar */}
      <Sidebar />

      {/* Main Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Bar with Dual Clock & Search */}
        <TopBar
          onOpenSearch={() => setSearchOpen(true)}
          onToggleStudyPanel={() => setStudyPanelOpen((prev) => !prev)}
          studyPanelOpen={studyPanelOpen}
        />

        {/* Content Outlet & Collapsible Study Panel */}
        <div className="flex-1 flex min-h-0 overflow-hidden relative">
          <main className="flex-1 overflow-y-auto min-w-0">
            <Outlet />
          </main>

          {/* Right Study Panel */}
          <StudyPanel
            isOpen={studyPanelOpen}
            onClose={() => setStudyPanelOpen(false)}
          />
        </div>
      </div>

      {/* Global Search Dialog Palette */}
      <SearchPalette
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
      />
    </div>
  );
};
