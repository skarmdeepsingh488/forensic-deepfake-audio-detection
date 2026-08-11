import React, { useState } from 'react';
import { Case, EvidenceMetadata, AnalysisResult, NavigationTab } from '../types';
import {
  FolderKanban,
  Plus,
  FileAudio,
  Cpu,
  Calendar,
  User,
  FileText,
  Search,
  CheckCircle2,
  Clock,
  ArrowRight
} from 'lucide-react';

interface CasesViewProps {
  cases: Case[];
  evidenceList: EvidenceMetadata[];
  analyses: AnalysisResult[];
  activeCaseId: string;
  onSelectCase: (caseId: string) => void;
  onCreateCase: (newCase: Case) => void;
  onNavigate: (tab: NavigationTab) => void;
}

export const CasesView: React.FC<CasesViewProps> = ({
  cases,
  evidenceList,
  analyses,
  activeCaseId,
  onSelectCase,
  onCreateCase,
  onNavigate
}) => {
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Form state
  const [caseIdInput, setCaseIdInput] = useState(`CASE-${new Date().getFullYear()}-${Math.floor(Math.random() * 899 + 100)}`);
  const [investigatorIdInput, setInvestigatorIdInput] = useState('INV-4921 (M.Tech Thesis Lab)');
  const [titleInput, setTitleInput] = useState('');
  const [descInput, setDescInput] = useState('');

  const selectedCase = cases.find((c) => c.id === activeCaseId) || cases[0];

  const caseEvidences = evidenceList.filter((e) => e.caseId === selectedCase?.id);
  const caseAnalyses = analyses.filter((a) => a.caseId === selectedCase?.id);

  const filteredCases = cases.filter(
    (c) =>
      c.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.investigatorId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSubmitNewCase = (e: React.FormEvent) => {
    e.preventDefault();
    if (!titleInput.trim()) return;

    const newCase: Case = {
      id: caseIdInput.trim() || `CASE-${Date.now()}`,
      investigatorId: investigatorIdInput.trim() || 'INV-001',
      title: titleInput.trim(),
      description: descInput.trim() || 'No description provided.',
      createdDate: new Date().toISOString(),
      updatedDate: new Date().toISOString(),
      status: 'OPEN',
      evidenceIds: [],
      analysisIds: []
    };

    onCreateCase(newCase);
    setShowModal(false);
    setTitleInput('');
    setDescInput('');
    setCaseIdInput(`CASE-${new Date().getFullYear()}-${Math.floor(Math.random() * 899 + 100)}`);
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold font-mono text-slate-100 flex items-center gap-2">
            <FolderKanban className="w-5 h-5 text-cyan-400" /> Case Management & Registry
          </h2>
          <p className="text-xs text-slate-400 mt-1 font-mono">
            Maintain strict forensic case isolation, investigator signoffs, and history log.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-mono font-semibold text-xs transition-colors shadow-lg shadow-cyan-950/50 shrink-0"
        >
          <Plus className="w-4 h-4" /> Create New Case
        </button>
      </div>

      {/* Main Grid: Cases List vs Detailed Case View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left List Column */}
        <div className="lg:col-span-5 space-y-3 font-mono">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
            <input
              type="text"
              placeholder="Search case ID, title, investigator..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 text-slate-200 text-xs py-2 pl-9 pr-3 rounded-xl border border-slate-800 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
            {filteredCases.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-xs border border-dashed border-slate-800 rounded-xl">
                No cases found.
              </div>
            ) : (
              filteredCases.map((c) => {
                const isSelected = c.id === selectedCase?.id;
                return (
                  <div
                    key={c.id}
                    onClick={() => onSelectCase(c.id)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-cyan-950/40 border-cyan-500/80 shadow-md shadow-cyan-950/40'
                        : 'bg-slate-900/80 border-slate-800/80 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-cyan-300">{c.id}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300 border border-slate-700">
                        {c.status}
                      </span>
                    </div>
                    <h4 className="text-sm font-semibold text-slate-100 font-sans mt-1 line-clamp-1">
                      {c.title}
                    </h4>
                    <p className="text-xs text-slate-400 font-sans line-clamp-2 mt-1">
                      {c.description}
                    </p>
                    <div className="flex items-center justify-between text-[10px] text-slate-500 mt-3 pt-2 border-t border-slate-800/60">
                      <span className="truncate max-w-[150px]">{c.investigatorId}</span>
                      <span>{new Date(c.createdDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Detail Column */}
        {selectedCase ? (
          <div className="lg:col-span-7 p-6 rounded-2xl bg-slate-900/80 border border-slate-800/80 space-y-6 font-mono">
            {/* Header */}
            <div className="space-y-2 pb-4 border-b border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-xs px-2.5 py-1 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-800 font-bold">
                  {selectedCase.id}
                </span>
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                  Created: {new Date(selectedCase.createdDate).toLocaleString()}
                </span>
              </div>
              <h3 className="text-lg font-bold font-sans text-slate-100">{selectedCase.title}</h3>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <User className="w-3.5 h-3.5 text-slate-500" />
                <span>Investigator: <strong className="text-slate-200">{selectedCase.investigatorId}</strong></span>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1">
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Case Description & Objective
              </div>
              <p className="text-xs font-sans text-slate-300 bg-slate-950/60 p-3 rounded-xl border border-slate-800 leading-relaxed">
                {selectedCase.description}
              </p>
            </div>

            {/* Ingested Evidence Files */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                  <FileAudio className="w-4 h-4 text-blue-400" /> Ingested Evidence ({caseEvidences.length})
                </div>
                <button
                  onClick={() => onNavigate('evidence')}
                  className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Upload File
                </button>
              </div>

              {caseEvidences.length === 0 ? (
                <div className="p-6 text-center text-slate-500 text-xs border border-dashed border-slate-800 rounded-xl">
                  No evidence uploaded for this case yet.
                </div>
              ) : (
                <div className="space-y-2">
                  {caseEvidences.map((e) => (
                    <div
                      key={e.id}
                      className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between gap-3 text-xs"
                    >
                      <div>
                        <div className="font-semibold text-slate-200">{e.filename}</div>
                        <div className="text-[10px] text-slate-400 flex items-center gap-2 mt-0.5">
                          <span>SHA-256: {e.sha256.slice(0, 16)}...</span>
                          <span>•</span>
                          <span>{e.durationSec}s</span>
                        </div>
                      </div>
                      <button
                        onClick={() => onNavigate('analysis')}
                        className="px-3 py-1 rounded bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-800 text-[11px] font-bold"
                      >
                        Analyze
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Analysis History */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-purple-400" /> Forensic Analysis History ({caseAnalyses.length})
                </div>
                <button
                  onClick={() => onNavigate('analysis')}
                  className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                >
                  Run Pipeline <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {caseAnalyses.length === 0 ? (
                <div className="p-6 text-center text-slate-500 text-xs border border-dashed border-slate-800 rounded-xl">
                  No analysis run on this case yet.
                </div>
              ) : (
                <div className="space-y-2">
                  {caseAnalyses.map((a) => (
                    <div
                      key={a.id}
                      className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between gap-3 text-xs"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-200">{a.id}</span>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              a.verdict === 'SYNTHETIC'
                                ? 'bg-rose-950/80 text-rose-300 border border-rose-800'
                                : a.verdict === 'GENUINE'
                                ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800'
                                : 'bg-amber-950/80 text-amber-300 border border-amber-800'
                            }`}
                          >
                            {a.verdict}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-400 mt-1">
                          Model: {a.modelName} (Confidence: {(a.calibratedConfidence * 100).toFixed(1)}%)
                        </div>
                      </div>
                      <button
                        onClick={() => onNavigate('reports')}
                        className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-[11px]"
                      >
                        Report
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="lg:col-span-7 p-12 text-center text-slate-500 font-mono text-xs border border-dashed border-slate-800 rounded-2xl">
            Select or create a case to view details.
          </div>
        )}
      </div>

      {/* Create Case Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4 font-mono">
            <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <FolderKanban className="w-5 h-5 text-cyan-400" /> Initiate Forensic Case
            </h3>

            <form onSubmit={handleSubmitNewCase} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Case ID (Unique Identifier)</label>
                <input
                  type="text"
                  value={caseIdInput}
                  onChange={(e) => setCaseIdInput(e.target.value)}
                  className="w-full bg-slate-950 text-slate-200 py-2 px-3 rounded-xl border border-slate-800 focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Investigator ID / Lab Officer</label>
                <input
                  type="text"
                  value={investigatorIdInput}
                  onChange={(e) => setInvestigatorIdInput(e.target.value)}
                  className="w-full bg-slate-950 text-slate-200 py-2 px-3 rounded-xl border border-slate-800 focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Case Title</label>
                <input
                  type="text"
                  placeholder="e.g. Investigation of CEO Voice Clone Audio Clip"
                  value={titleInput}
                  onChange={(e) => setTitleInput(e.target.value)}
                  className="w-full bg-slate-950 text-slate-200 py-2 px-3 rounded-xl border border-slate-800 focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Case Description & Details</label>
                <textarea
                  rows={3}
                  placeholder="Specify origin of audio evidence, chain of custody officer, and scope..."
                  value={descInput}
                  onChange={(e) => setDescInput(e.target.value)}
                  className="w-full bg-slate-950 text-slate-200 py-2 px-3 rounded-xl border border-slate-800 focus:outline-none focus:border-cyan-500 font-sans"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold"
                >
                  Create Case
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
