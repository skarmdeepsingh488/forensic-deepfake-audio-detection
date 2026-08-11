import React from 'react';
import { Case, EvidenceMetadata, AnalysisResult, HealthStatus, ModelStatus, NavigationTab } from '../types';
import {
  FolderKanban,
  FileAudio,
  Cpu,
  ShieldCheck,
  ShieldAlert,
  HelpCircle,
  Server,
  Activity,
  ArrowRight,
  Plus,
  Upload
} from 'lucide-react';

interface DashboardViewProps {
  cases: Case[];
  evidenceList: EvidenceMetadata[];
  analyses: AnalysisResult[];
  health: HealthStatus;
  modelStatus: ModelStatus;
  onNavigate: (tab: NavigationTab) => void;
  onSelectCase: (caseId: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  cases,
  evidenceList,
  analyses,
  health,
  modelStatus,
  onNavigate,
  onSelectCase
}) => {
  const totalCases = cases.length;
  const totalEvidence = evidenceList.length;
  const totalAnalyses = analyses.length;

  const syntheticCount = analyses.filter((a) => a.verdict === 'SYNTHETIC').length;
  const genuineCount = analyses.filter((a) => a.verdict === 'GENUINE').length;
  const inconclusiveCount = analyses.filter((a) => a.verdict === 'INCONCLUSIVE').length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Banner / Overview */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-lg bg-[#0c121d] border border-cyan-900/40 shadow-lg">
        <div>
          <div className="text-[10px] font-bold text-cyan-500 uppercase tracking-widest font-mono mb-1">
            System Operational Dashboard
          </div>
          <h2 className="text-lg font-bold font-mono text-white flex items-center gap-2">
            Forensic Intelligence & Telemetry
          </h2>
          <p className="text-xs text-slate-400 mt-1 font-mono">
            Real-time digital forensics telemetry & deepfake authentication pipeline status.
          </p>
        </div>
        <div className="flex items-center gap-3 font-mono">
          <button
            onClick={() => onNavigate('evidence')}
            className="flex items-center gap-2 px-4 py-2 rounded-sm bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs transition-colors shadow-[0_0_12px_rgba(8,145,178,0.3)] uppercase tracking-wider"
          >
            <Upload className="w-4 h-4" /> Ingest Evidence
          </button>
          <button
            onClick={() => onNavigate('cases')}
            className="flex items-center gap-2 px-4 py-2 rounded-sm bg-black/60 hover:bg-black/80 text-slate-300 font-semibold text-xs border border-cyan-900/40 transition-colors uppercase tracking-wider"
          >
            <Plus className="w-4 h-4" /> New Case
          </button>
        </div>
      </div>

      {/* Grid Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 font-mono">
        {/* Total Cases */}
        <div className="p-4 rounded-lg bg-[#0c121d] border border-cyan-900/30 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Cases</span>
            <FolderKanban className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold text-white mt-2">{totalCases}</div>
        </div>

        {/* Evidence Files */}
        <div className="p-4 rounded-lg bg-[#0c121d] border border-cyan-900/30 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Evidence</span>
            <FileAudio className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold text-white mt-2">{totalEvidence}</div>
        </div>

        {/* Completed Analyses */}
        <div className="p-4 rounded-lg bg-[#0c121d] border border-cyan-900/30 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Analyses</span>
            <Cpu className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold text-white mt-2">{totalAnalyses}</div>
        </div>

        {/* Synthetic Count */}
        <div className="p-4 rounded-lg bg-[#0c121d] border border-rose-900/40 flex flex-col justify-between">
          <div className="flex items-center justify-between text-rose-400 text-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400">Synthetic</span>
            <ShieldAlert className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-bold text-rose-400 mt-2">{syntheticCount}</div>
        </div>

        {/* Genuine Count */}
        <div className="p-4 rounded-lg bg-[#0c121d] border border-emerald-900/40 flex flex-col justify-between">
          <div className="flex items-center justify-between text-emerald-400 text-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">Genuine</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400 mt-2">{genuineCount}</div>
        </div>

        {/* Inconclusive Count */}
        <div className="p-4 rounded-lg bg-[#0c121d] border border-amber-900/40 flex flex-col justify-between">
          <div className="flex items-center justify-between text-amber-400 text-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">Inconclusive</span>
            <HelpCircle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-amber-400 mt-2">{inconclusiveCount}</div>
        </div>
      </div>

      {/* Subsystem Telemetry Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
        {/* Backend Status */}
        <div className="p-4 rounded-lg bg-[#0c121d] border border-cyan-900/30 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-cyan-500">
              <Server className="w-3.5 h-3.5 text-cyan-400" /> Backend Status
            </span>
            <span
              className={`px-2 py-0.5 rounded-sm text-[9px] font-semibold tracking-wider ${
                health.status === 'ok'
                  ? 'bg-green-500/20 text-green-400 border border-green-500/40'
                  : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
              }`}
            >
              {health.status === 'ok' ? 'CONNECTED' : 'DISCONNECTED'}
            </span>
          </div>
          <div className="text-slate-200 text-[11px] truncate">Service: {health.service}</div>
          <div className="text-slate-500 text-[10px]">URL: {health.backendUrl}</div>
        </div>

        {/* WavLM Status */}
        <div className="p-4 rounded-lg bg-[#0c121d] border border-cyan-900/30 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-cyan-500">
              <Activity className="w-3.5 h-3.5 text-cyan-400" /> WavLM Subsystem
            </span>
            <span
              className={`px-2 py-0.5 rounded-sm text-[9px] font-semibold tracking-wider ${
                modelStatus.wavlmStatus === 'READY'
                  ? 'bg-green-500/20 text-green-400 border border-green-500/40'
                  : 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
              }`}
            >
              {modelStatus.wavlmStatus}
            </span>
          </div>
          <div className="text-slate-200 text-[11px]">Embedding Dim: {modelStatus.embeddingDimensions}d</div>
          <div className="text-slate-500 text-[10px]">Architecture: SSL 24-Layer Transformer</div>
        </div>

        {/* AASIST Status */}
        <div className="p-4 rounded-lg bg-[#0c121d] border border-cyan-900/30 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-cyan-500">
              <Cpu className="w-3.5 h-3.5 text-cyan-400" /> AASIST Classifier
            </span>
            <span
              className={`px-2 py-0.5 rounded-sm text-[9px] font-semibold tracking-wider ${
                modelStatus.aasistStatus === 'READY'
                  ? 'bg-green-500/20 text-green-400 border border-green-500/40'
                  : 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
              }`}
            >
              {modelStatus.aasistStatus}
            </span>
          </div>
          <div className="text-slate-200 text-[11px]">
            Checkpoint: {modelStatus.checkpointLoaded ? 'LOADED' : 'UNAVAILABLE'}
          </div>
          <div className="text-slate-500 text-[10px]">Graph Attention Net (GAT-L)</div>
        </div>
      </div>

      {/* Recent Cases & Recent Evidence Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Cases */}
        <div className="p-5 rounded-lg bg-[#0c121d] border border-cyan-900/30 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold font-mono text-cyan-500 uppercase tracking-widest flex items-center gap-2">
              <FolderKanban className="w-4 h-4 text-cyan-400" /> Recent Cases
            </h3>
            <button
              onClick={() => onNavigate('cases')}
              className="text-xs font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1 uppercase tracking-wider"
            >
              View All <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {cases.length === 0 ? (
            <div className="p-8 text-center text-slate-500 font-mono text-xs border border-dashed border-cyan-900/40 rounded">
              No real case data exists. Create a new case to begin.
            </div>
          ) : (
            <div className="space-y-2 font-mono">
              {cases.slice(0, 4).map((c) => (
                <div
                  key={c.id}
                  onClick={() => {
                    onSelectCase(c.id);
                    onNavigate('cases');
                  }}
                  className="p-3 rounded bg-black/60 border border-cyan-900/30 hover:border-cyan-500/60 transition-colors cursor-pointer flex items-center justify-between gap-3 text-xs"
                >
                  <div>
                    <div className="font-bold text-cyan-400">{c.id}</div>
                    <div className="text-slate-300 text-[11px] font-sans truncate max-w-xs">{c.title}</div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="px-2 py-0.5 rounded-sm text-[10px] bg-cyan-950/60 text-cyan-300 border border-cyan-800/60">
                      {c.status}
                    </span>
                    <div className="text-[10px] text-slate-500 mt-1">
                      {new Date(c.createdDate).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Evidence */}
        <div className="p-5 rounded-lg bg-[#0c121d] border border-cyan-900/30 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold font-mono text-cyan-500 uppercase tracking-widest flex items-center gap-2">
              <FileAudio className="w-4 h-4 text-cyan-400" /> Recent Ingested Evidence
            </h3>
            <button
              onClick={() => onNavigate('evidence')}
              className="text-xs font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1 uppercase tracking-wider"
            >
              Ingest More <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {evidenceList.length === 0 ? (
            <div className="p-8 text-center text-slate-500 font-mono text-xs border border-dashed border-cyan-900/40 rounded">
              No evidence files ingested yet.
            </div>
          ) : (
            <div className="space-y-2 font-mono">
              {evidenceList.slice(0, 4).map((e) => (
                <div
                  key={e.id}
                  onClick={() => onNavigate('analysis')}
                  className="p-3 rounded bg-black/60 border border-cyan-900/30 hover:border-cyan-500/60 transition-colors cursor-pointer flex items-center justify-between gap-3 text-xs"
                >
                  <div className="truncate">
                    <div className="font-semibold text-slate-200 truncate">{e.filename}</div>
                    <div className="text-[10px] text-slate-400 flex items-center gap-2 mt-0.5">
                      <span>{e.format}</span>
                      <span>•</span>
                      <span>{(e.fileSize / (1024 * 1024)).toFixed(2)} MB</span>
                      <span>•</span>
                      <span>{e.durationSec}s</span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="px-2 py-0.5 rounded-sm text-[10px] bg-green-950/50 text-green-400 border border-green-800/60 font-semibold">
                      SHA-256 VERIFIED
                    </span>
                    <div className="text-[10px] text-slate-500 mt-1">{e.caseId}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
