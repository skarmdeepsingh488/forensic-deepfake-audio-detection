import React, { useState } from 'react';
import {
  Case,
  EvidenceMetadata,
  AnalysisResult,
  PipelineStage,
  ModelStatus,
  NavigationTab
} from '../types';
import { runAnalysis } from '../services/api';
import {
  Cpu,
  Play,
  CheckCircle2,
  Clock,
  AlertOctagon,
  ShieldAlert,
  ShieldCheck,
  HelpCircle,
  Activity,
  ChevronDown,
  ChevronUp,
  FileText,
  Radio,
  Sparkles
} from 'lucide-react';

interface DeepfakeAnalysisProps {
  activeCase: Case;
  evidenceList: EvidenceMetadata[];
  analyses: AnalysisResult[];
  modelStatus: ModelStatus;
  isBackendConnected: boolean;
  onAddAnalysis: (analysis: AnalysisResult) => void;
  onNavigate: (tab: NavigationTab) => void;
}

export const DeepfakeAnalysisView: React.FC<DeepfakeAnalysisProps> = ({
  activeCase,
  evidenceList,
  analyses,
  modelStatus,
  isBackendConnected,
  onAddAnalysis,
  onNavigate
}) => {
  const caseEvidences = evidenceList.filter((e) => e.caseId === activeCase?.id);
  const [selectedEvidenceId, setSelectedEvidenceId] = useState<string>(
    caseEvidences[0]?.id || ''
  );

  const [isExecuting, setIsExecuting] = useState(false);
  const [currentStageIndex, setCurrentStageIndex] = useState(-1);
  const [liveStages, setLiveStages] = useState<PipelineStage[]>([]);
  const [latestResult, setLatestResult] = useState<AnalysisResult | null>(
    analyses.find((a) => a.caseId === activeCase?.id) || null
  );
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [expandedStage, setExpandedStage] = useState<number | null>(9); // Default WavLM expanded

  const selectedEvidence = evidenceList.find((e) => e.id === selectedEvidenceId) || caseEvidences[0];

  const handleRunPipeline = async () => {
    if (!selectedEvidence) {
      setErrorMsg('No evidence selected for analysis.');
      return;
    }

    setErrorMsg(null);
    setIsExecuting(true);
    setCurrentStageIndex(0);

    try {
      // Call backend REST endpoint
      const result = await runAnalysis(
        activeCase.id,
        selectedEvidence.id,
        selectedEvidence.sha256,
        !isBackendConnected || modelStatus.inferenceMode === 'DEMONSTRATION'
      );

      // Simulate sequential stage progress visualization
      if (result.pipelineStages && result.pipelineStages.length > 0) {
        setLiveStages(result.pipelineStages.map((s) => ({ ...s, status: 'pending' })));

        for (let i = 0; i < result.pipelineStages.length; i++) {
          setCurrentStageIndex(i);
          setLiveStages((prev) =>
            prev.map((st, idx) => (idx === i ? { ...st, status: 'running' } : st))
          );
          await new Promise((r) => setTimeout(r, 120));

          setLiveStages((prev) =>
            prev.map((st, idx) =>
              idx === i
                ? {
                    ...st,
                    ...result.pipelineStages[i],
                    status: 'completed'
                  }
                : st
            )
          );
        }
      }

      setLatestResult(result);
      onAddAnalysis(result);
    } catch (err: any) {
      setErrorMsg(err.message || 'ML inference failed. No forensic verdict was generated.');
      setLatestResult({
        id: `ANS-FAILED-${Date.now()}`,
        caseId: activeCase.id,
        evidenceId: selectedEvidence.id,
        timestamp: new Date().toISOString(),
        verdict: 'INCONCLUSIVE',
        rawScore: 0,
        calibratedConfidence: 0,
        decisionThreshold: 0.50,
        modelName: 'WavLM + AASIST Engine',
        modelVersion: 'v2.1.0-forensic',
        inferenceTimeMs: 0,
        pipelineStages: [],
        isDemonstrationData: true,
        notes: 'Inference failed due to backend error or unavailable model.'
      });
    } finally {
      setIsExecuting(false);
      setCurrentStageIndex(-1);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto font-mono">
      {/* Page Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Cpu className="w-5 h-5 text-cyan-400" /> 14-Stage Forensic Deepfake Detection Pipeline
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            End-to-End SSL Feature Extraction (WavLM) & Graph-Attention Classifier (AASIST).
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedEvidenceId}
            onChange={(e) => setSelectedEvidenceId(e.target.value)}
            className="bg-slate-900 text-slate-200 text-xs py-2 px-3 rounded-xl border border-slate-800 focus:outline-none focus:border-cyan-500"
          >
            {caseEvidences.length === 0 ? (
              <option value="">No evidence available</option>
            ) : (
              caseEvidences.map((ev) => (
                <option key={ev.id} value={ev.id}>
                  {ev.filename} ({ev.id})
                </option>
              ))
            )}
          </select>

          <button
            onClick={handleRunPipeline}
            disabled={isExecuting || !selectedEvidence}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-extrabold text-xs shadow-lg shadow-cyan-950/60 disabled:opacity-50 transition-all shrink-0"
          >
            {isExecuting ? (
              <>
                <Activity className="w-4 h-4 animate-spin text-slate-950" /> Executing Stage {currentStageIndex + 1}/14...
              </>
            ) : (
              <>
                <Play className="w-4 h-4 text-slate-950 fill-slate-950" /> RUN PIPELINE
              </>
            )}
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-950/50 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
          <AlertOctagon className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Forensic Verdict Card */}
      {latestResult && (
        <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800/90 shadow-2xl space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div>
              <span className="text-[10px] text-slate-400 uppercase tracking-widest block">
                Official Forensic Verdict
              </span>
              <div className="flex items-center gap-3 mt-1">
                <span
                  className={`px-4 py-1.5 rounded-xl text-lg font-black tracking-wider border shadow-lg ${
                    latestResult.verdict === 'SYNTHETIC'
                      ? 'bg-rose-950/80 text-rose-400 border-rose-600/80 shadow-rose-950/50'
                      : latestResult.verdict === 'GENUINE'
                      ? 'bg-emerald-950/80 text-emerald-400 border-emerald-600/80 shadow-emerald-950/50'
                      : 'bg-amber-950/80 text-amber-400 border-amber-600/80 shadow-amber-950/50'
                  }`}
                >
                  {latestResult.verdict === 'SYNTHETIC' && (
                    <span className="flex items-center gap-2">
                      <ShieldAlert className="w-5 h-5 text-rose-400" /> SYNTHETIC AUDIO
                    </span>
                  )}
                  {latestResult.verdict === 'GENUINE' && (
                    <span className="flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5 text-emerald-400" /> GENUINE AUDIO
                    </span>
                  )}
                  {latestResult.verdict === 'INCONCLUSIVE' && (
                    <span className="flex items-center gap-2">
                      <HelpCircle className="w-5 h-5 text-amber-400" /> INCONCLUSIVE — MODEL UNAVAILABLE
                    </span>
                  )}
                </span>

                {latestResult.isDemonstrationData && (
                  <span className="px-2.5 py-1 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30 text-[10px] font-bold">
                    DEMONSTRATION DATA — NOT AN EXPERIMENTAL RESULT
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onNavigate('explainability')}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" /> Explainability
              </button>
              <button
                onClick={() => onNavigate('reports')}
                className="px-3 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-cyan-950/50"
              >
                <FileText className="w-3.5 h-3.5 text-slate-950" /> Generate Forensic Report
              </button>
            </div>
          </div>

          {/* Verdict Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 text-xs bg-slate-950/80 p-4 rounded-xl border border-slate-800/80">
            <div>
              <span className="text-slate-500 text-[10px] block">Raw AASIST Score</span>
              <span className="text-slate-100 font-bold">{latestResult.rawScore.toFixed(4)}</span>
            </div>
            <div>
              <span className="text-slate-500 text-[10px] block">Calibrated Confidence</span>
              <span className="text-cyan-400 font-bold">
                {(latestResult.calibratedConfidence * 100).toFixed(2)}%
              </span>
            </div>
            <div>
              <span className="text-slate-500 text-[10px] block">Decision Threshold</span>
              <span className="text-slate-200 font-bold">{latestResult.decisionThreshold.toFixed(2)}</span>
            </div>
            <div>
              <span className="text-slate-500 text-[10px] block">Model Architecture</span>
              <span className="text-slate-200 font-bold truncate block">{latestResult.modelName}</span>
            </div>
            <div>
              <span className="text-slate-500 text-[10px] block">Model Version</span>
              <span className="text-slate-200 font-bold">{latestResult.modelVersion}</span>
            </div>
            <div>
              <span className="text-slate-500 text-[10px] block">Inference Execution Time</span>
              <span className="text-emerald-400 font-bold">{latestResult.inferenceTimeMs} ms</span>
            </div>
          </div>
        </div>
      )}

      {/* 14-Stage Forensic Pipeline Table / Stepper */}
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800/80 space-y-4">
        <h3 className="text-sm font-bold text-slate-100 flex items-center justify-between">
          <span>14-Stage Pipeline Telemetry Execution Log</span>
          <span className="text-xs text-slate-400 font-normal">
            Status: {isExecuting ? 'Processing...' : 'Ready'}
          </span>
        </h3>

        <div className="space-y-2">
          {(latestResult?.pipelineStages.length
            ? latestResult.pipelineStages
            : liveStages.length
            ? liveStages
            : []
          ).map((stage) => {
            const isExpanded = expandedStage === stage.id;
            const isDone = stage.status === 'completed';
            const isRun = stage.status === 'running';

            return (
              <div
                key={stage.id}
                className={`rounded-xl border transition-all ${
                  isRun
                    ? 'bg-cyan-950/50 border-cyan-500/80 shadow-md shadow-cyan-950/50'
                    : isDone
                    ? 'bg-slate-950/80 border-slate-800/80'
                    : 'bg-slate-950/40 border-slate-900 opacity-60'
                }`}
              >
                {/* Stage Bar Header */}
                <div
                  onClick={() => setExpandedStage(isExpanded ? null : stage.id)}
                  className="p-3 flex items-center justify-between gap-3 cursor-pointer text-xs"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-[10px] shrink-0 ${
                        isDone
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          : isRun
                          ? 'bg-cyan-950 text-cyan-300 border border-cyan-500 animate-pulse'
                          : 'bg-slate-900 text-slate-500 border border-slate-800'
                      }`}
                    >
                      {stage.id}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-200">{stage.name}</h4>
                      {stage.output && (
                        <p className="text-[10px] text-slate-400 truncate max-w-xl mt-0.5">
                          Output: {stage.output}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    {stage.durationMs !== undefined && (
                      <span className="text-[10px] text-slate-500 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-500" /> {stage.durationMs}ms
                      </span>
                    )}

                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        isDone
                          ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800'
                          : isRun
                          ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-800'
                          : 'bg-slate-900 text-slate-500 border border-slate-800'
                      }`}
                    >
                      {stage.status.toUpperCase()}
                    </span>

                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-slate-500" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-500" />
                    )}
                  </div>
                </div>

                {/* Stage Expanded Details */}
                {isExpanded && (
                  <div className="p-4 border-t border-slate-800/80 bg-slate-900/60 text-xs space-y-3 font-mono">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <span className="text-slate-500 text-[10px] block">Stage Input Data</span>
                        <div className="p-2 rounded bg-slate-950 text-slate-300 border border-slate-800 text-[11px] mt-1">
                          {stage.input || 'Audio Stream Buffer (16kHz PCM Linear)'}
                        </div>
                      </div>

                      <div>
                        <span className="text-slate-500 text-[10px] block">Stage Output / Output Matrix</span>
                        <div className="p-2 rounded bg-slate-950 text-cyan-300 border border-slate-800 text-[11px] mt-1">
                          {stage.output || 'Pending execution output'}
                        </div>
                      </div>
                    </div>

                    {stage.parameters && (
                      <div>
                        <span className="text-slate-500 text-[10px] block">Execution Parameters</span>
                        <div className="p-2.5 rounded bg-slate-950 text-slate-400 border border-slate-800 text-[11px] mt-1 font-mono">
                          {Object.entries(stage.parameters).map(([k, v]) => (
                            <div key={k} className="flex items-center justify-between py-0.5">
                              <span className="text-slate-500">{k}:</span>
                              <span className="text-slate-200">{String(v)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
