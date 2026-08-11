import React from 'react';
import { HealthStatus, ModelStatus } from '../types';
import { ShieldCheck, ShieldAlert, Cpu, Server, Radio, Database } from 'lucide-react';

interface HeaderProps {
  health: HealthStatus;
  modelStatus: ModelStatus;
  onNavigateToSettings: () => void;
}

export const Header: React.FC<HeaderProps> = ({ health, modelStatus, onNavigateToSettings }) => {
  const isBackendConnected = health.status === 'ok';

  let modelBadgeText = 'DEMONSTRATION';
  let modelBadgeColor = 'text-amber-400';
  let modelDotStyle = 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)]';

  if (isBackendConnected && health.isLiveBackend && modelStatus.inferenceMode === 'LIVE_RESEARCH') {
    modelBadgeText = 'LIVE RESEARCH MODEL';
    modelBadgeColor = 'text-cyan-400';
    modelDotStyle = 'bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.6)]';
  } else if (isBackendConnected && !modelStatus.checkpointLoaded) {
    modelBadgeText = 'CHECKPOINT MISSING';
    modelBadgeColor = 'text-cyan-400';
    modelDotStyle = 'bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.6)]';
  } else if (!isBackendConnected) {
    modelBadgeText = 'DEMO MODE';
    modelBadgeColor = 'text-rose-400';
    modelDotStyle = 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)]';
  }

  return (
    <header className="h-16 border-b border-cyan-900/40 bg-black/60 backdrop-blur-md flex items-center justify-between px-6 shrink-0 z-40 sticky top-0">
      {/* Brand Identity with Geometric Logo */}
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 bg-cyan-500/10 border border-cyan-500/40 flex items-center justify-center rounded-sm shrink-0">
          <div className="w-5 h-5 border-2 border-cyan-400 rotate-45" />
        </div>
        <div>
          <h1 className="text-lg font-bold tracking-tight text-white leading-none uppercase font-sans">
            AudioShield Forensics
          </h1>
          <p className="text-[10px] text-cyan-500 tracking-[0.2em] font-medium font-mono mt-1">
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
            className={`w-2 h-2 rounded-full ${
              isBackendConnected
                ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]'
                : 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)]'
            }`}
          />
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 group-hover:text-slate-200">
            Backend:{' '}
            <span className={isBackendConnected ? 'text-green-500' : 'text-rose-400'}>
              {isBackendConnected ? 'Connected' : 'Disconnected'}
            </span>
          </span>
        </div>

        {/* Model Status */}
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${modelDotStyle}`} />
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Model: <span className={modelBadgeColor}>{modelBadgeText}</span>
          </span>
        </div>

        {/* Divider */}
        <div className="h-8 w-px bg-cyan-900/30 hidden md:block" />

        {/* Investigator Tag */}
        <div className="text-right hidden md:block">
          <p className="text-[10px] text-slate-500 uppercase tracking-wider">Investigator</p>
          <p className="text-xs font-semibold text-slate-200">M.TECH_RES_2024_08</p>
        </div>
      </div>
    </header>
  );
};

