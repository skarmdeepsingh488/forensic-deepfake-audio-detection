import React from 'react';
import { NavigationTab, Case } from '../types';
import {
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
  ShieldAlert
} from 'lucide-react';

interface SidebarProps {
  activeTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  cases: Case[];
  activeCaseId: string;
  onSelectCase: (caseId: string) => void;
  isDemoMode: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  cases,
  activeCaseId,
  onSelectCase,
  isDemoMode
}) => {
  const navItems: { id: NavigationTab; label: string; icon: React.ReactNode; category: string }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" />, category: 'Main' },
    { id: 'cases', label: 'Cases', icon: <FolderKanban className="w-4 h-4" />, category: 'Main' },
    { id: 'evidence', label: 'Evidence Ingestion', icon: <Upload className="w-4 h-4" />, category: 'Main' },
    { id: 'analysis', label: 'Deepfake Analysis', icon: <Cpu className="w-4 h-4" />, category: 'Forensics' },
    { id: 'spectrogram', label: 'Spectrogram', icon: <Activity className="w-4 h-4" />, category: 'Forensics' },
    { id: 'explainability', label: 'Explainability', icon: <Lightbulb className="w-4 h-4" />, category: 'Forensics' },
    { id: 'chain', label: 'Chain of Custody', icon: <Link className="w-4 h-4" />, category: 'Forensics' },
    { id: 'audit', label: 'Audit Log', icon: <ClipboardList className="w-4 h-4" />, category: 'Forensics' },
    { id: 'reports', label: 'Forensic Reports', icon: <FileText className="w-4 h-4" />, category: 'Forensics' },
    { id: 'experiments', label: 'Experiments', icon: <FlaskConical className="w-4 h-4" />, category: 'Laboratory' },
    { id: 'models', label: 'Models', icon: <Boxes className="w-4 h-4" />, category: 'Laboratory' },
    { id: 'research', label: 'Research Page', icon: <BookOpen className="w-4 h-4" />, category: 'Laboratory' },
    { id: 'settings', label: 'Settings', icon: <Settings className="w-4 h-4" />, category: 'System' }
  ];

  return (
    <aside className="w-56 bg-[#080b12] border-r border-cyan-900/20 flex flex-col py-4 shrink-0 select-none overflow-y-auto">
      {/* Active Case Switcher */}
      <div className="px-3 mb-4">
        <div className="p-3 bg-[#0c121d] rounded border border-cyan-900/30">
          <p className="text-[9px] text-cyan-500 uppercase tracking-widest font-bold mb-1.5 font-mono">
            Active Forensic Case
          </p>
          <select
            value={activeCaseId}
            onChange={(e) => onSelectCase(e.target.value)}
            className="w-full bg-black/60 text-slate-200 text-xs font-mono py-1.5 px-2 rounded border border-cyan-900/40 focus:outline-none focus:border-cyan-500"
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
                <div className="text-[10px] px-3 mt-4 mb-1.5 font-bold text-slate-600 uppercase tracking-widest font-mono">
                  {item.category}
                </div>
              )}
              <button
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-cyan-500/10 text-cyan-400 rounded-sm border-l-2 border-cyan-500 font-semibold'
                    : 'text-slate-500 hover:text-slate-300 border-l-2 border-transparent'
                }`}
              >
                <span className={isActive ? 'text-cyan-400' : 'text-slate-500'}>
                  {item.icon}
                </span>
                <span className="truncate">{item.label}</span>
              </button>
            </React.Fragment>
          );
        })}
      </nav>

      {/* Footer Info Box */}
      <div className="px-4 py-3 border-t border-cyan-900/20">
        <div className="p-3 bg-black/40 rounded border border-cyan-900/30 space-y-1 font-mono">
          <p className="text-[9px] text-slate-500 uppercase tracking-wider">
            {isDemoMode ? 'System Status' : 'API Endpoint'}
          </p>
          {isDemoMode ? (
            <p className="text-[10px] text-amber-400 font-bold flex items-center gap-1">
              <ShieldAlert className="w-3 h-3" /> DEMO MODE
            </p>
          ) : (
            <p className="text-[10px] text-cyan-600 truncate">http://127.0.0.1:8000</p>
          )}
        </div>
      </div>
    </aside>
  );
};

