import React from 'react';
import { ModelRegistryItem, ModelStatus } from '../types';
import { MODEL_REGISTRY_ITEMS } from '../services/storage';
import { Boxes, Cpu, Database, Layers, CheckCircle2, ShieldCheck, HardDrive } from 'lucide-react';

interface ModelsViewProps {
  modelStatus: ModelStatus;
}

export const ModelsView: React.FC<ModelsViewProps> = ({ modelStatus }) => {
  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto font-mono">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Boxes className="w-5 h-5 text-cyan-400" /> Deep Learning Model Registry & Weights
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Registered PyTorch checkpoints, SSL front-ends, and Graph Attention Classifier weights.
          </p>
        </div>

        <div className="text-xs px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-cyan-300">
          Device Target: <strong className="text-slate-100">{modelStatus.device}</strong>
        </div>
      </div>

      {/* Models Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {MODEL_REGISTRY_ITEMS.map((item) => (
          <div
            key={item.id}
            className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800/80 space-y-4 flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 font-bold">
                  {item.id}
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800 font-bold">
                  {item.status}
                </span>
              </div>

              <h3 className="text-base font-bold text-slate-100">{item.name}</h3>
              <p className="text-xs text-slate-400 font-sans leading-relaxed">{item.description}</p>

              <div className="space-y-2 pt-2 border-t border-slate-800/80 text-xs">
                <div>
                  <span className="text-slate-500 text-[10px] block">Architecture</span>
                  <span className="text-slate-200 font-bold">{item.architecture}</span>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] block">Version & HuggingFace Tag</span>
                  <span className="text-cyan-300 font-bold">{item.version}</span>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] block">Checkpoint File</span>
                  <span className="text-purple-300 font-bold">{item.checkpoint}</span>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] block">Training Benchmarks</span>
                  <span className="text-slate-300">{item.trainingDataset}</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
              <span>{item.parametersCount}</span>
              <span>Updated: {item.lastUpdated}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
