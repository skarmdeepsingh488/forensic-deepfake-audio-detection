import React from 'react';
import { AnalysisResult } from '../types';
import { Lightbulb, AlertTriangle, ShieldCheck, Cpu, Layers, Activity } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';

interface ExplainabilityProps {
  analyses: AnalysisResult[];
  activeCaseId: string;
}

export const ExplainabilityView: React.FC<ExplainabilityProps> = ({ analyses, activeCaseId }) => {
  const currentAnalysis =
    analyses.find((a) => a.caseId === activeCaseId) || analyses[0];

  const explainability = currentAnalysis?.explainability;

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto font-mono">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-amber-400" /> Explainable AI (XAI) Forensic Dashboard
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Grad-CAM++ temporal saliency, attention weight maps, and frequency band importance breakdown.
          </p>
        </div>
        <div className="text-xs px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-cyan-300">
          Analysis ID: <strong className="text-slate-100">{currentAnalysis?.id || 'N/A'}</strong>
        </div>
      </div>

      {/* Mandatory Disclaimer Note as explicitly mandated */}
      <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-800/80 text-amber-300 text-xs flex items-center gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
        <p className="font-semibold leading-relaxed">
          Explainability outputs support analyst interpretation and do not independently establish authenticity.
        </p>
      </div>

      {/* Model Contribution Breakdown Cards */}
      {explainability ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
            {/* WavLM Contribution */}
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
              <span className="text-slate-500 text-[10px] uppercase">WavLM SSL Feature Weight</span>
              <div className="text-lg font-bold text-cyan-400">
                {(explainability.confidenceBreakdown.wavlmFeatureContribution * 100).toFixed(1)}%
              </div>
              <p className="text-[10px] text-slate-400">24-Layer Transformer Representations</p>
            </div>

            {/* AASIST Contribution */}
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
              <span className="text-slate-500 text-[10px] uppercase">AASIST Graph Attention Weight</span>
              <div className="text-lg font-bold text-purple-400">
                {(explainability.confidenceBreakdown.aasistGraphContribution * 100).toFixed(1)}%
              </div>
              <p className="text-[10px] text-slate-400">Heterogeneous Graph Node Attention</p>
            </div>

            {/* Spectral Anomaly Score */}
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
              <span className="text-slate-500 text-[10px] uppercase">Spectral Anomaly Score</span>
              <div className="text-lg font-bold text-rose-400">
                {(explainability.confidenceBreakdown.spectralAnomalyScore * 100).toFixed(1)}%
              </div>
              <p className="text-[10px] text-slate-400">Phase & Nyquist Mirroring Disparity</p>
            </div>

            {/* Phase Inconsistency Score */}
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
              <span className="text-slate-500 text-[10px] uppercase">Phase Inconsistency Score</span>
              <div className="text-lg font-bold text-amber-400">
                {(explainability.confidenceBreakdown.phaseInconsistencyScore * 100).toFixed(1)}%
              </div>
              <p className="text-[10px] text-slate-400">Vocoder Glottal Pulse Irregularity</p>
            </div>
          </div>

          {/* Temporal Saliency Heatmap Visualizer */}
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800/80 space-y-4">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-400" /> Frame-Level Grad-CAM++ Temporal Saliency Map
            </h3>

            <div className="space-y-2">
              <div className="grid grid-cols-10 gap-1.5 h-12">
                {explainability.temporalSaliency.map((score, i) => {
                  const bg =
                    score > 0.8
                      ? 'bg-rose-500 text-slate-950 font-bold'
                      : score > 0.5
                      ? 'bg-amber-500 text-slate-950 font-bold'
                      : 'bg-emerald-950 text-emerald-400 border border-emerald-800';

                  return (
                    <div
                      key={i}
                      className={`rounded-lg flex flex-col items-center justify-center text-[10px] transition-all hover:scale-105 cursor-pointer ${bg}`}
                      title={`Frame ${i + 1}: Saliency ${(score * 100).toFixed(1)}%`}
                    >
                      <span>F{i + 1}</span>
                      <span>{(score * 100).toFixed(0)}%</span>
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1">
                <span>0.0 sec (Audio Start)</span>
                <span className="text-rose-400 font-bold">Red = Synthetic Vocoder Artifact Spike</span>
                <span>{currentAnalysis?.pipelineStages[0]?.parameters?.durationSec || 4.5} sec (Audio End)</span>
              </div>
            </div>
          </div>

          {/* Frequency Band Importance Bar Chart */}
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800/80 space-y-4">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <Layers className="w-4 h-4 text-purple-400" /> Spectral Sub-band Feature Importance
            </h3>

            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={explainability.frequencyImportance} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
                  <XAxis dataKey="band" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                  <YAxis stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} domain={[0, 1]} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#f8fafc' }}
                  />
                  <Bar dataKey="importance" radius={[6, 6, 0, 0]}>
                    {explainability.frequencyImportance.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.importance > 0.8 ? '#f43f5e' : entry.importance > 0.5 ? '#a855f7' : '#06b6d4'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Attention Weights Detail Table */}
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800/80 space-y-4">
            <h3 className="text-sm font-bold text-slate-100">
              High-Attention Neural Vocoder Anomaly Frames
            </h3>

            <div className="space-y-2">
              {explainability.attentionWeights.map((att, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-3">
                    <span className="px-2 py-0.5 rounded bg-rose-950 text-rose-400 border border-rose-800 font-bold">
                      Frame #{att.frame}
                    </span>
                    <span className="text-slate-200 font-sans">{att.label}</span>
                  </div>
                  <span className="text-cyan-400 font-bold">Weight: {att.weight.toFixed(3)}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        <div className="p-12 text-center text-slate-500 text-xs border border-dashed border-slate-800 rounded-2xl">
          Run 14-stage deepfake analysis pipeline on selected case to view explainability saliency outputs.
        </div>
      )}
    </div>
  );
};
