import React from 'react';
import { BookOpen, ShieldCheck, Cpu, Database, CheckCircle2, AlertTriangle, Layers } from 'lucide-react';

export const ResearchView: React.FC = () => {
  return (
    <div className="p-6 space-y-8 max-w-5xl mx-auto font-mono">
      {/* Header */}
      <div className="space-y-2 border-b border-slate-800 pb-4">
        <span className="text-xs text-cyan-400 uppercase tracking-widest font-bold">
          M.Tech Thesis Defense Documentation
        </span>
        <h2 className="text-2xl font-extrabold text-slate-100 font-sans">
          Detection of AI-Generated Deepfake Audio in Forensic Investigation
        </h2>
        <p className="text-xs text-slate-400">
          A Dual-Stage SSL Transformer (WavLM) and Heterogeneous Graph Attention (AASIST) Pipeline.
        </p>
      </div>

      {/* Research Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
        {/* Research Problem */}
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
          <h3 className="text-sm font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-cyan-400" /> Research Problem
          </h3>
          <p className="text-slate-300 font-sans leading-relaxed">
            Rapid advancements in neural speech synthesis (e.g., Vall-E, ElevenLabs, XTTS v2) and neural vocoders allow malicious actors to fabricate highly convincing human voice clones. Existing forensic audio authentication tools suffer from severe performance degradation under lossy compression (MP3, AAC) and cross-dataset evaluation.
          </p>
        </div>

        {/* Research Gap */}
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
          <h3 className="text-sm font-bold text-purple-400 uppercase tracking-wider flex items-center gap-2">
            <Layers className="w-4 h-4 text-purple-400" /> Research Gap
          </h3>
          <p className="text-slate-300 font-sans leading-relaxed">
            Conventional spectral feature baselines (MFCC, CQCC) fail to capture subtle phase discontinuities and high-frequency glottal anomalies introduced by neural vocoders. Furthermore, black-box AI detectors lack chain-of-custody tracking and explainability required for courtroom admissibility.
          </p>
        </div>
      </div>

      {/* Objectives & Proposed Framework */}
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4 text-xs font-sans">
        <h3 className="text-sm font-bold font-mono text-slate-100 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Key Thesis Objectives
        </h3>
        <ul className="space-y-2 text-slate-300 list-disc pl-5 leading-relaxed">
          <li>
            Develop an end-to-end forensic deepfake audio pipeline coupling self-supervised WavLM Large representations with an AASIST graph-attention classifier.
          </li>
          <li>
            Establish a NIST SP 800-86 compliant 14-stage workflow preserving evidence SHA-256 integrity from ingestion to court report generation.
          </li>
          <li>
            Incorporate Grad-CAM++ temporal saliency and sub-band feature attribution to provide interpretable explanations for forensic analysts.
          </li>
          <li>
            Achieve Equal Error Rate (EER) &lt; 1.0% on ASVspoof 2019 LA and &lt; 2.2% under lossy ASVspoof 2021 DF compression benchmarks.
          </li>
        </ul>
      </div>

      {/* 14-Stage Methodology Breakdown */}
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4 text-xs font-mono">
        <h3 className="text-sm font-bold text-slate-100">Proposed 14-Stage Forensic Methodology</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            '1. Evidence Acquisition',
            '2. Integrity Verification (SHA-256)',
            '3. Format Validation',
            '4. Codec Normalization (PCM Linear)',
            '5. Resampling (16kHz Mono)',
            '6. Amplitude Normalization (EBU R128)',
            '7. Voice Activity Detection (Silero VAD)',
            '8. Duration & Segment Hashing',
            '9. WavLM SSL Feature Extraction',
            '10. AASIST Graph-Attention Classification',
            '11. Confidence Calibration (ECE < 2%)',
            '12. XAI Saliency Explanation',
            '13. Chain-of-Custody Finalization',
            '14. Forensic Report Generation'
          ].map((stg, i) => (
            <div key={i} className="p-2.5 rounded bg-slate-950 border border-slate-800/80 text-cyan-300">
              {stg}
            </div>
          ))}
        </div>
      </div>

      {/* Limitations & Future Work */}
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3 text-xs font-sans">
        <h3 className="text-sm font-bold font-mono text-amber-400 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-400" /> Limitations & Future Work
        </h3>
        <p className="text-slate-300 leading-relaxed">
          While the WavLM+AASIST fusion architecture demonstrates superior robustness across synthetic voices, extreme adversarial audio perturbations (e.g. anti-forensic noise injection) and real-time streaming audio feeds remain areas for ongoing research.
        </p>
      </div>
    </div>
  );
};
