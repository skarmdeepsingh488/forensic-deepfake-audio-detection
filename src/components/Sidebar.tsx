import React from 'react';
import { NavigationTab, Case } from '../types';
import {
  Zap,
  LayoutDashboard,
  FolderKanban,
  Upload,
  Cpu,
  Activity,
  Lightbulb,
  Link,
  ClipboardList,
  FileText,
  FlaskConical,
  Boxes,
  BookOpen,
  Settings,
  ShieldAlert,
  SlidersHorizontal
} from 'lucide-react';

interface SidebarProps {
  activeTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  cases: Case[];
  activeCaseId: string;
  onSelectCase: (caseId: string) => void;
  isDemoMode: boolean;
  isSimpleMode: boolean;
  onToggleSimpleMode: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  cases,
  activeCaseId,
  onSelectCase,
  isDemoMode,
  isSimpleMode,
  onToggleSimpleMode
}) => {
  const allNavItems: { id: NavigationTab; label: string; icon: React.ReactNode; category: string; simple?: boolean }[] = [
    { id: 'quick', label: 'Quick Voice Detector', icon: <Zap className="w-4 h-4 text-cyan-400" />, category: 'Quick Action', simple: true },
    { id: 'dashboard', label: 'Overview Dashboard', icon: <LayoutDashboard className="w-4 h-4" />, category: 'Main', simple: true },
    { id: 'cases', label: 'Cases & Audio Files', icon: <FolderKanban className="w-4 h-4" />, category: 'Main', simple: true },
    { id: 'evidence', label: 'Upload Evidence', icon: <Upload className="w-4 h-4" />, category: 'Main' },
    { id: 'analysis', label: 'Deepfake AI Scan', icon: <Cpu className="w-4 h-4" />, category: 'Forensics' },
    { id: 'spectrogram', label: 'Spectrogram Visualizer', icon: <Activity className="w-4 h-4" />, category: 'Forensics' },
    { id: 'explainability', label: 'Explainability (XAI)', icon: <Lightbulb className="w-4 h-4" />, category: 'Forensics' },
    { id: 'chain', label: 'Chain of Custody', icon: <Link className="w-4 h-4" />, category: 'Forensics' },
    { id: 'audit', label: 'Audit Log', icon: <ClipboardList className="w-4 h-4" />, category: 'Forensics' },
    { id: 'reports', label: 'Reports & Exports', icon: <FileText className="w-4 h-4" />, category: 'Main', simple: true },
    { id: 'experiments', label: 'ASVspoof Experiments', icon: <FlaskConical className="w-4 h-4" />, category: 'Laboratory' },
    { id: 'models', label: 'AI Model Specs', icon: <Boxes className="w-4 h-4" />, category: 'Laboratory' },
    { id: 'research', label: 'Research Paper', icon: <BookOpen className="w-4 h-4" />, category: 'Laboratory' },
    { id: 'settings', label: 'Settings', icon: <Settings className="w-4 h-4" />, category: 'System', simple: true }
  ];

  const navItems = isSimpleMode ? allNavItems.filter((i) => i.simple) : allNavItems;

  return (
    <aside className="w-56 bg-slate-900 border-r border-slate-800 flex flex-col py-4 shrink-0 select-none overflow-y-auto">
      {/* Mode Status Banner */}
      <div className="px-3 mb-3">
        <button
          onClick={onToggleSimpleMode}
          className={`w-full py-2 px-3 rounded-lg border text-xs font-semibold flex items-center justify-between gap-2 transition-all ${
            isSimpleMode
              ? 'bg-cyan-500/10 border-cyan-500/40 text-cyan-300 hover:bg-cyan-500/20'
              : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-750'
          }`}
        >
          <span className="flex items-center gap-1.5 font-mono text-[11px]">
            <SlidersHorizontal className="w-3.5 h-3.5 text-cyan-400" />
            {isSimpleMode ? 'Simple Mode' : 'Advanced Mode'}
          </span>
          <span className="text-[10px] text-cyan-400 font-bold uppercase underline">Toggle</span>
        </button>
      </div>

      {/* Active Case Switcher */}
      <div className="px-3 mb-4">
        <div className="p-3 bg-slate-800/90 rounded-lg border border-slate-700/60 shadow-sm">
          <p className="text-[10px] text-cyan-400 uppercase tracking-widest font-bold mb-1.5 font-mono">
            Active Case Folder
          </p>
          <select
            value={activeCaseId}
            onChange={(e) => onSelectCase(e.target.value)}
            className="w-full bg-slate-900 text-slate-100 text-xs font-mono py-1.5 px-2 rounded-md border border-slate-700 focus:outline-none focus:border-cyan-500"
          >
            {cases.map((c) => (
              <option key={c.id} value={c.id}>
                {c.id}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 px-3 space-y-1">
        {navItems.map((item, idx) => {
          const isActive = activeTab === item.id;
          const showCategoryHeader =
            idx === 0 || navItems[idx - 1].category !== item.category;

          return (
            <React.Fragment key={item.id}>
              {showCategoryHeader && (
                <div className="text-[10px] px-3 mt-4 mb-1.5 font-bold text-slate-400 uppercase tracking-widest font-mono">
                  {item.category}
                </div>
              )}
              <button
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-medium transition-all rounded-md ${
                  isActive
                    ? 'bg-cyan-500/15 text-cyan-300 border-l-2 border-cyan-400 font-semibold shadow-sm'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/50 border-l-2 border-transparent'
                }`}
              >
                <span className={isActive ? 'text-cyan-400' : 'text-slate-400'}>
                  {item.icon}
                </span>
                <span className="truncate">{item.label}</span>
              </button>
            </React.Fragment>
          );
        })}
      </nav>

      {/* Footer Info Box */}
      <div className="px-4 py-3 border-t border-slate-800 space-y-2">
        <div className="p-3 bg-slate-800/80 rounded-lg border border-slate-700/60 space-y-1 font-mono">
          <p className="text-[10px] text-slate-400 uppercase tracking-wider">
            {isDemoMode ? 'System Status' : 'API Endpoint'}
          </p>
          {isDemoMode ? (
            <p className="text-xs text-amber-400 font-bold flex items-center gap-1">
              <ShieldAlert className="w-3.5 h-3.5" /> DEMO MODE
            </p>
          ) : (
            <p className="text-xs text-cyan-400 truncate">http://127.0.0.1:8000</p>
          )}
        </div>
      </div>
    </aside>
  );
};


