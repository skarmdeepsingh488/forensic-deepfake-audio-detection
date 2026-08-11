import React, { useState } from 'react';
import { HealthStatus, ModelStatus } from '../types';
import { getApiBaseUrl, setApiBaseUrl, checkHealth, getModelStatus } from '../services/api';
import { Settings, RefreshCw, Server, Cpu, Database, CheckCircle2, AlertTriangle, Code, Copy } from 'lucide-react';

interface SettingsViewProps {
  health: HealthStatus;
  modelStatus: ModelStatus;
  onRefreshStatus: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  health,
  modelStatus,
  onRefreshStatus
}) => {
  const [apiUrl, setApiUrl] = useState<string>(getApiBaseUrl());
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; msg: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const handleSaveAndTest = async () => {
    setIsTesting(true);
    setTestResult(null);

    setApiBaseUrl(apiUrl);

    try {
      const h = await checkHealth();
      const m = await getModelStatus();

      if (h.status === 'ok') {
        setTestResult({
          success: true,
          msg: `Successfully connected to backend at ${apiUrl}. Service: ${h.service}`
        });
      } else {
        setTestResult({
          success: false,
          msg: `Backend unreachable at ${apiUrl}. System running in Demonstration Mode.`
        });
      }

      onRefreshStatus();
    } catch (e: any) {
      setTestResult({
        success: false,
        msg: `Connection error: ${e.message || 'Failed to ping backend'}`
      });
    } finally {
      setIsTesting(false);
    }
  };

  const pythonSnippet = `
# To run the real Python FastAPI ML Service locally:
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --host 127.0.0.1 --port 8000
`.trim();

  const handleCopyCode = () => {
    navigator.clipboard.writeText(pythonSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto font-mono">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Settings className="w-5 h-5 text-cyan-400" /> System Settings & Backend Integration
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Configure FastAPI Python REST API endpoints and inspect PyTorch model environment.
          </p>
        </div>
      </div>

      {/* Backend URL Configuration Form */}
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800/80 space-y-4">
        <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
          <Server className="w-4 h-4 text-cyan-400" /> FastAPI REST Backend URL
        </h3>

        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <input
              type="text"
              value={apiUrl}
              onChange={(e) => setApiUrl(e.target.value)}
              placeholder="http://127.0.0.1:8000"
              className="w-full bg-slate-950 text-slate-200 text-xs py-2.5 px-4 rounded-xl border border-slate-800 focus:outline-none focus:border-cyan-500 font-mono"
            />
            <button
              onClick={handleSaveAndTest}
              disabled={isTesting}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-950/50 transition-all shrink-0 flex items-center justify-center gap-2"
            >
              {isTesting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
              <span>Test Connection</span>
            </button>
          </div>

          <p className="text-[11px] text-slate-400 font-sans">
            Default endpoint: <code className="text-cyan-400 font-mono">http://127.0.0.1:8000</code>. This setting is stored in local browser state.
          </p>
        </div>

        {testResult && (
          <div
            className={`p-4 rounded-xl border text-xs flex items-center gap-2 ${
              testResult.success
                ? 'bg-emerald-950/60 border-emerald-800 text-emerald-300'
                : 'bg-rose-950/60 border-rose-800 text-rose-300'
            }`}
          >
            {testResult.success ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
            )}
            <span>{testResult.msg}</span>
          </div>
        )}
      </div>

      {/* Live Subsystem Health Specs */}
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800/80 space-y-4">
        <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
          <Cpu className="w-4 h-4 text-purple-400" /> Subsystem Diagnostic Specs
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-slate-500 text-[10px]">FastAPI Backend</span>
            <div className="font-bold text-slate-200">{health.service}</div>
            <span className="text-[10px] text-emerald-400">{health.status.toUpperCase()}</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-slate-500 text-[10px]">WavLM Model</span>
            <div className="font-bold text-slate-200">{modelStatus.wavlmStatus}</div>
            <span className="text-[10px] text-slate-400">Embedding Dim: {modelStatus.embeddingDimensions}d</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-slate-500 text-[10px]">AASIST Classifier</span>
            <div className="font-bold text-slate-200">{modelStatus.aasistStatus}</div>
            <span className="text-[10px] text-slate-400">
              Checkpoint: {modelStatus.checkpointLoaded ? 'Loaded' : 'Missing'}
            </span>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-slate-500 text-[10px]">PyTorch Device</span>
            <div className="font-bold text-cyan-400">{modelStatus.device}</div>
            <span className="text-[10px] text-slate-400">Inference Mode: {modelStatus.inferenceMode}</span>
          </div>
        </div>
      </div>

      {/* Instructions for Running local Python Backend */}
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800/80 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <Code className="w-4 h-4 text-cyan-400" /> Run Local Python FastAPI Server
          </h3>
          <button
            onClick={handleCopyCode}
            className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs flex items-center gap-1.5 border border-slate-700"
          >
            <Copy className="w-3.5 h-3.5" /> {copied ? 'Copied!' : 'Copy Shell Script'}
          </button>
        </div>

        <p className="text-xs text-slate-400 font-sans leading-relaxed">
          The application codebase includes a complete Python FastAPI backend service in <code className="text-cyan-400 font-mono">/backend/main.py</code>. Run the command below to spin up the local PyTorch WavLM+AASIST inference service:
        </p>

        <pre className="p-4 rounded-xl bg-slate-950 text-cyan-300 text-xs border border-slate-800 font-mono overflow-x-auto select-all">
          {pythonSnippet}
        </pre>
      </div>
    </div>
  );
};
