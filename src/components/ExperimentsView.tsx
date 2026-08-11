import React, { useState } from 'react';
import { ExperimentDataset } from '../types';
import { BENCHMARK_EXPERIMENTS } from '../services/storage';
import {
  FlaskConical,
  Upload,
  BarChart2,
  LineChart as LineChartIcon,
  HelpCircle,
  CheckCircle2,
  Table,
  Layers,
  Database
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  Cell,
  Legend
} from 'recharts';

export const ExperimentsView: React.FC = () => {
  const [datasets, setDatasets] = useState<ExperimentDataset[]>(BENCHMARK_EXPERIMENTS);
  const [selectedDatasetId, setSelectedDatasetId] = useState<string>(
    BENCHMARK_EXPERIMENTS[0]?.id || ''
  );
  const [showNoDataState, setShowNoDataState] = useState(false);

  const selectedExp = datasets.find((d) => d.id === selectedDatasetId) || datasets[0];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          if (Array.isArray(parsed)) {
            setDatasets(parsed);
            setShowNoDataState(false);
          } else if (parsed.id && parsed.name) {
            setDatasets((prev) => [parsed, ...prev]);
            setSelectedDatasetId(parsed.id);
            setShowNoDataState(false);
          }
        } catch (err) {
          alert('Invalid experiment JSON file.');
        }
      };
      reader.readAsText(e.target.files[0]);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto font-mono">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <FlaskConical className="w-5 h-5 text-cyan-400" /> M.Tech Research Experiments & Benchmark Results
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Standard ASVspoof 2019/2021, WaveFake, and ADD 2023 performance metrics and ROC/EER curves.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowNoDataState(!showNoDataState)}
            className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 text-xs"
          >
            Toggle {showNoDataState ? 'Experimental Data' : 'Empty State'}
          </button>

          <label className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs cursor-pointer shadow-lg shadow-cyan-950/50">
            <Upload className="w-4 h-4 text-slate-950" /> Import JSON
            <input type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
          </label>
        </div>
      </div>

      {showNoDataState ? (
        <div className="p-16 text-center rounded-2xl bg-slate-900/80 border border-dashed border-slate-800 space-y-3">
          <HelpCircle className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-sm font-bold text-slate-300">NO EXPERIMENTAL RESULTS AVAILABLE</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto font-sans">
            No real experimental benchmark JSON uploaded. Load thesis benchmark datasets or import custom experiment measurements above.
          </p>
          <button
            onClick={() => setShowNoDataState(false)}
            className="mt-2 px-4 py-2 rounded-xl bg-cyan-600 text-slate-950 font-bold text-xs"
          >
            Load M.Tech Thesis Benchmark Measurements
          </button>
        </div>
      ) : (
        <>
          {/* Dataset Selector Tabs */}
          <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-3">
            <span className="text-xs text-slate-500 mr-2 flex items-center gap-1">
              <Database className="w-3.5 h-3.5 text-cyan-400" /> Evaluation Dataset:
            </span>
            {datasets.map((d) => (
              <button
                key={d.id}
                onClick={() => setSelectedDatasetId(d.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  d.id === selectedExp?.id
                    ? 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                    : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                {d.name}
              </button>
            ))}
          </div>

          {/* Metrics Overview Grid */}
          {selectedExp && (
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-slate-500 text-[10px] block">Accuracy</span>
                <span className="text-emerald-400 text-base font-bold">{selectedExp.accuracy}%</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-slate-500 text-[10px] block">Equal Error Rate (EER)</span>
                <span className="text-cyan-400 text-base font-bold">{selectedExp.eer}%</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-slate-500 text-[10px] block">AUC (ROC Area)</span>
                <span className="text-purple-400 text-base font-bold">{selectedExp.auc}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-slate-500 text-[10px] block">Precision</span>
                <span className="text-slate-200 text-base font-bold">{selectedExp.precision}%</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-slate-500 text-[10px] block">Recall</span>
                <span className="text-slate-200 text-base font-bold">{selectedExp.recall}%</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-slate-500 text-[10px] block">F1-Score</span>
                <span className="text-slate-200 text-base font-bold">{selectedExp.f1Score}%</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-slate-500 text-[10px] block">ECE Calibration</span>
                <span className="text-amber-400 text-base font-bold">{selectedExp.ece}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-slate-500 text-[10px] block">Inference Latency</span>
                <span className="text-emerald-400 text-base font-bold">{selectedExp.latencyMs}ms</span>
              </div>
            </div>
          )}

          {/* Charts Row: ROC Curve & Precision-Recall Curve */}
          {selectedExp && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* ROC Curve */}
              <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800/80 space-y-4">
                <h3 className="text-sm font-bold text-slate-100 flex items-center justify-between">
                  <span>Receiver Operating Characteristic (ROC Curve)</span>
                  <span className="text-cyan-400 text-xs">AUC = {selectedExp.auc}</span>
                </h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={selectedExp.rocCurve} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
                      <XAxis dataKey="fpr" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} label={{ value: 'False Positive Rate (FPR)', position: 'insideBottom', offset: -10, fill: '#64748b' }} />
                      <YAxis stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} domain={[0, 1]} label={{ value: 'True Positive Rate (TPR)', angle: -90, position: 'insideLeft', fill: '#64748b' }} />
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }} />
                      <Line type="monotone" dataKey="tpr" stroke="#22d3ee" strokeWidth={3} dot={{ fill: '#22d3ee' }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Precision-Recall Curve */}
              <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800/80 space-y-4">
                <h3 className="text-sm font-bold text-slate-100 flex items-center justify-between">
                  <span>Precision-Recall Curve</span>
                  <span className="text-purple-400 text-xs">F1 = {selectedExp.f1Score}%</span>
                </h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={selectedExp.prCurve} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
                      <XAxis dataKey="recall" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} label={{ value: 'Recall', position: 'insideBottom', offset: -10, fill: '#64748b' }} />
                      <YAxis stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} domain={[0, 1]} label={{ value: 'Precision', angle: -90, position: 'insideLeft', fill: '#64748b' }} />
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }} />
                      <Line type="monotone" dataKey="precision" stroke="#c084fc" strokeWidth={3} dot={{ fill: '#c084fc' }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {/* EER Cross-Dataset Comparison Bar Chart */}
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800/80 space-y-4">
            <h3 className="text-sm font-bold text-slate-100">
              Equal Error Rate (EER %) Comparison Across Benchmarks (Lower is Better)
            </h3>
            <div className="h-60">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={datasets} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
                  <XAxis dataKey="name" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                  <YAxis stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} label={{ value: 'EER (%)', angle: -90, position: 'insideLeft', fill: '#64748b' }} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }} />
                  <Bar dataKey="eer" fill="#06b6d4" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
