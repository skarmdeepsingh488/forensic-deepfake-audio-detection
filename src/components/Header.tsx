import React from 'react';
import { HealthStatus, ModelStatus } from '../types';
import { ShieldCheck, ShieldAlert, Cpu, Server, Radio, Database, FileSpreadsheet } from 'lucide-react';

interface HeaderProps {
  health: HealthStatus;
  modelStatus: ModelStatus;
  onNavigateToSettings: () => void;
  onOpenGoogleSheets?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ health, modelStatus, onNavigateToSettings, onOpenGoogleSheets }) => {
  const isBackendConnected = health.status === 'ok';

  let modelBadgeText = 'ACTIVE & LOADED';
  let modelBadgeColor = 'text-emerald-400';
  let modelDotStyle = 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]';

  if (modelStatus.checkpointLoaded || modelStatus.wavlmStatus === 'READY') {
    modelBadgeText = 'READY / ONLINE';
    modelBadgeColor = 'text-emerald-400';
    modelDotStyle = 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]';
  } else if (!isBackendConnected) {
    modelBadgeText = 'OFFLINE';
    modelBadgeColor = 'text-amber-400';
    modelDotStyle = 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]';
  }

  return (
    <header className="h-16 border-b border-slate-800 bg-slate-900/95 backdrop-blur-md flex items-center justify-between px-6 shrink-0 z-40 sticky top-0 shadow-sm">
      {/* Brand Identity with Geometric Logo */}
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 bg-cyan-500/15 border border-cyan-500/40 flex items-center justify-center rounded-lg shrink-0 shadow-sm">
          <div className="w-5 h-5 border-2 border-cyan-400 rotate-45" />
        </div>
        <div>
          <h1 className="text-lg font-bold tracking-tight text-white leading-none uppercase font-sans">
            AudioShield Forensics
          </h1>
          <p className="text-[10px] text-cyan-400 tracking-[0.2em] font-medium font-mono mt-1">
            DETECT. VERIFY. AUTHENTICATE.
          </p>
        </div>
      </div>

      {/* System & Model Status Bar */}
      <div className="flex items-center gap-6 font-mono">
        {/* Backend Status */}
        <div
          onClick={onNavigateToSettings}
          className="flex items-center gap-2 cursor-pointer group"
          title="Click to configure backend in Settings"
        >
          <span
            className={`w-2.5 h-2.5 rounded-full ${
              isBackendConnected
                ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]'
                : 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)]'
            }`}
          />
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300 group-hover:text-white">
            Backend:{' '}
            <span className={isBackendConnected ? 'text-emerald-400' : 'text-rose-400'}>
              {isBackendConnected ? 'Connected' : 'Disconnected'}
            </span>
          </span>
        </div>

        {/* Model Status */}
        <div className="flex items-center gap-2">
          <span className={`w-2.5 h-2.5 rounded-full ${modelDotStyle}`} />
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300">
            Model: <span className={modelBadgeColor}>{modelBadgeText}</span>
          </span>
        </div>

        {/* Divider */}
        <div className="h-8 w-px bg-slate-800 hidden md:block" />

        {/* Google Sheets Trigger */}
        {onOpenGoogleSheets && (
          <button
            onClick={onOpenGoogleSheets}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-emerald-900/40 hover:bg-emerald-800/60 text-emerald-300 border border-emerald-700/60 transition-colors cursor-pointer text-[11px] font-bold uppercase tracking-wider shadow-sm"
            title="Open Google Sheets Case Export Manager"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>Google Sheets</span>
          </button>
        )}

        {/* Investigator Tag */}
        <div className="text-right hidden md:block">
          <p className="text-[10px] text-slate-400 uppercase tracking-wider">Investigator</p>
          <p className="text-xs font-semibold text-slate-100">M.TECH_RES_2024_08</p>
        </div>
      </div>
    </header>
  );
};

