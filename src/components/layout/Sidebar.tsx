import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Home,
  BookOpen,
  MessageSquare,
  HelpCircle,
  Layers,
  Mic,
  PhoneCall,
  MapPin,
  CalendarCheck,
  TrendingUp,
  LayoutGrid,
  ShieldCheck,
  FileText,
  Kanban,
  AlertTriangle,
  PlayCircle,
  Wrench,
  Award,
  Settings,
  Menu,
  ChevronLeft,
  ChevronRight,
  Database,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);

  const navGroups = [
    {
      title: 'LEARN',
      items: [
        { label: 'Dashboard', path: '/', icon: <Home className="w-4 h-4" /> },
        { label: 'Module Library', path: '/learn', icon: <BookOpen className="w-4 h-4" /> },
        { label: 'AI Tutor', path: '/tutor', icon: <MessageSquare className="w-4 h-4" /> },
      ],
    },
    {
      title: 'PRACTICE',
      items: [
        { label: 'Quizzes & Checks', path: '/practice/quizzes', icon: <HelpCircle className="w-4 h-4" /> },
        { label: 'Flashcards', path: '/practice/flashcards', icon: <Layers className="w-4 h-4" /> },
        { label: 'Speaking Drills', path: '/practice/drills', icon: <Mic className="w-4 h-4" /> },
        { label: 'Role-play Studio', path: '/practice/roleplay', icon: <PhoneCall className="w-4 h-4" /> },
      ],
    },
    {
      title: 'LABS',
      items: [
        { label: 'Map & Geography', path: '/labs/map', icon: <MapPin className="w-4 h-4" /> },
        { label: 'HOS & Trip Planner', path: '/labs/hos', icon: <CalendarCheck className="w-4 h-4" /> },
        { label: 'Economics Lab', path: '/labs/economics', icon: <TrendingUp className="w-4 h-4" /> },
        { label: 'Load Board Sim', path: '/labs/loadboard', icon: <LayoutGrid className="w-4 h-4" /> },
        { label: 'Broker Vetting', path: '/labs/vetting', icon: <ShieldCheck className="w-4 h-4" /> },
        { label: 'Document Lab', path: '/labs/documents', icon: <FileText className="w-4 h-4" /> },
        { label: 'Dispatch Board', path: '/labs/dispatch', icon: <Kanban className="w-4 h-4" /> },
        { label: 'Problems & Claims', path: '/labs/problems', icon: <AlertTriangle className="w-4 h-4" /> },
      ],
    },
    {
      title: 'CAPSTONE & TOOLS',
      items: [
        { label: 'Week Simulation', path: '/simulation', icon: <PlayCircle className="w-4 h-4 text-[#F5A524]" /> },
        { label: 'Toolbox', path: '/toolbox', icon: <Wrench className="w-4 h-4" /> },
        { label: 'Progress & Readiness', path: '/progress', icon: <Award className="w-4 h-4" /> },
        { label: 'Settings', path: '/settings', icon: <Settings className="w-4 h-4" /> },
        { label: 'Dev Checks', path: '/dev', icon: <Database className="w-4 h-4" /> },
      ],
    },
  ];

  return (
    <aside
      className={`bg-[#0E1A2B] text-slate-200 border-r border-[#1E2D42] flex flex-col transition-all duration-200 shrink-0 z-40 select-none ${
        collapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="h-16 px-4 flex items-center justify-between border-b border-[#1E2D42]">
        {!collapsed && (
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-lg bg-[#F5A524] flex items-center justify-center font-black text-[#0E1A2B] text-base shrink-0 shadow-sm">
              DA
            </div>
            <div className="leading-tight truncate">
              <div className="font-bold text-sm text-white tracking-wide">
                DISPATCH ACADEMY
              </div>
              <div className="text-[10px] text-[#F5A524] uppercase tracking-wider font-semibold">
                Carrier U.S. Dispatch
              </div>
            </div>
          </div>
        )}

        {collapsed && (
          <div className="mx-auto w-8 h-8 rounded-lg bg-[#F5A524] flex items-center justify-center font-black text-[#0E1A2B] text-base shadow-sm">
            DA
          </div>
        )}

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors ml-auto"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Nav List */}
      <div className="flex-1 overflow-y-auto py-3 px-2 space-y-4">
        {navGroups.map((group, gIdx) => (
          <div key={gIdx}>
            {!collapsed && (
              <div className="px-3 pb-1 text-[10px] font-bold text-slate-400 tracking-wider">
                {group.title}
              </div>
            )}
            <nav className="space-y-0.5">
              {group.items.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === '/'}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-[#13294B] text-white font-semibold shadow-xs border-l-2 border-[#F5A524]'
                        : 'text-slate-300 hover:text-white hover:bg-[#13294B]/40'
                    } ${collapsed ? 'justify-center px-2' : ''}`
                  }
                  title={collapsed ? item.label : undefined}
                >
                  <span className="shrink-0">{item.icon}</span>
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </NavLink>
              ))}
            </nav>
          </div>
        ))}
      </div>

      {/* Footer info */}
      {!collapsed && (
        <div className="p-3 border-t border-[#1E2D42] text-[11px] text-slate-400 flex items-center justify-between">
          <span className="font-mono">v1.0 (Oct 2026)</span>
          <span className="text-[10px] text-[#22A35A] flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#22A35A] inline-block" />
            Offline Ready
          </span>
        </div>
      )}
    </aside>
  );
};
