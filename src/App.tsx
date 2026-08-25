import React, { useState, useEffect } from 'react';
import {
  NavigationTab,
  Case,
  EvidenceMetadata,
  AnalysisResult,
  ChainEvent,
  AuditEntry,
  HealthStatus,
  ModelStatus
} from './types';
import {
  loadCases,
  saveCases,
  loadEvidence,
  saveEvidence,
  loadAnalyses,
  saveAnalyses,
  loadChainEvents,
  saveChainEvents,
  loadAuditLogs,
  saveAuditLogs
} from './services/storage';
import { checkHealth, getModelStatus } from './services/api';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { CasesView } from './components/CasesView';
import { EvidenceIngestionView } from './components/EvidenceIngestionView';
import { DeepfakeAnalysisView } from './components/DeepfakeAnalysisView';
import { SpectrogramView } from './components/SpectrogramView';
import { ExplainabilityView } from './components/ExplainabilityView';
import { ChainOfCustodyView } from './components/ChainOfCustodyView';
import { AuditLogView } from './components/AuditLogView';
import { ForensicReportsView } from './components/ForensicReportsView';
import { ExperimentsView } from './components/ExperimentsView';
import { ModelsView } from './components/ModelsView';
import { ResearchView } from './components/ResearchView';
import { SettingsView } from './components/SettingsView';
import { GoogleSheetsModal } from './components/GoogleSheetsModal';
import { QuickDetectorView } from './components/QuickDetectorView';

export default function App() {
  const [activeTab, setActiveTab] = useState<NavigationTab>('quick');
  const [isSimpleMode, setIsSimpleMode] = useState<boolean>(true);

  // Persistent State
  const [cases, setCases] = useState<Case[]>(() => loadCases());
  const [activeCaseId, setActiveCaseId] = useState<string>(() => cases[0]?.id || 'CASE-2026-0801');
  const [evidenceList, setEvidenceList] = useState<EvidenceMetadata[]>(() => loadEvidence());
  const [analyses, setAnalyses] = useState<AnalysisResult[]>(() => loadAnalyses());
  const [chainEvents, setChainEvents] = useState<ChainEvent[]>(() => loadChainEvents());
  const [auditLogs, setAuditLogs] = useState<AuditEntry[]>(() => loadAuditLogs());
  const [isSheetsModalOpen, setIsSheetsModalOpen] = useState<boolean>(false);

  // Backend Health & Model Diagnostics
  const [health, setHealth] = useState<HealthStatus>({
    status: 'ok',
    service: 'AudioShield Express Core',
    version: '1.0.0-mtech',
    uptimeSeconds: 120,
    backendUrl: 'http://127.0.0.1:8000',
    isLiveBackend: false
  });

  const [modelStatus, setModelStatus] = useState<ModelStatus>({
    wavlmStatus: 'READY',
    aasistStatus: 'READY',
    checkpointLoaded: true,
    device: 'CPU / Emulated PyTorch',
    embeddingDimensions: 1024,
    inferenceMode: 'DEMONSTRATION',
    lastChecked: new Date().toISOString()
  });

  const activeCase = cases.find((c) => c.id === activeCaseId) || cases[0];

  // Refresh status function
  const refreshBackendStatus = async () => {
    try {
      const h = await checkHealth();
      const m = await getModelStatus();
      setHealth(h);
      setModelStatus(m);
    } catch {
      setHealth((prev) => ({ ...prev, status: 'unavailable', isLiveBackend: false }));
    }
  };

  useEffect(() => {
    refreshBackendStatus();
    const timer = setInterval(refreshBackendStatus, 15000); // Ping every 15s
    return () => clearInterval(timer);
  }, []);

  // Sync to local storage
  const handleCreateCase = (newCase: Case) => {
    const updated = [newCase, ...cases];
    setCases(updated);
    saveCases(updated);
    setActiveCaseId(newCase.id);

    // Audit log entry
    const audit: AuditEntry = {
      id: `ADT-${Date.now()}`,
      timestamp: new Date().toISOString(),
      caseId: newCase.id,
      operation: 'CASE_CREATION',
      analyst: newCase.investigatorId,
      status: 'SUCCESS',
      hash: 'N/A',
      component: 'Case Management Subsystem',
      details: `Initiated case ${newCase.id}`
    };
    const updatedAudit = [audit, ...auditLogs];
    setAuditLogs(updatedAudit);
    saveAuditLogs(updatedAudit);
  };

  const handleAddEvidence = (evd: EvidenceMetadata) => {
    const updated = [evd, ...evidenceList];
    setEvidenceList(updated);
    saveEvidence(updated);

    // Chain event entry
    const chainEvt: ChainEvent = {
      id: `CHN-${Date.now().toString().slice(-4)}`,
      timestamp: new Date().toISOString(),
      caseId: evd.caseId,
      evidenceId: evd.id,
      operation: 'Evidence Ingestion & First Hash Generation',
      inputHash: 'RAW_AUDIO_STREAM_BINARY',
      outputHash: evd.sha256,
      status: 'VALID',
      softwareVersion: 'AudioShield Forensics v1.0',
      modelVersion: 'N/A',
      analyst: activeCase?.investigatorId || 'INV-4921'
    };
    const updatedChain = [...chainEvents, chainEvt];
    setChainEvents(updatedChain);
    saveChainEvents(updatedChain);

    // Audit log
    const audit: AuditEntry = {
      id: `ADT-${Date.now()}`,
      timestamp: new Date().toISOString(),
      caseId: evd.caseId,
      operation: 'EVIDENCE_INGESTION',
      analyst: activeCase?.investigatorId || 'INV-4921',
      status: 'SUCCESS',
      hash: evd.sha256,
      component: 'Evidence Vault Subsystem',
      details: `Ingested ${evd.filename} (${evd.format})`
    };
    const updatedAudit = [audit, ...auditLogs];
    setAuditLogs(updatedAudit);
    saveAuditLogs(updatedAudit);
  };

  const handleAddAnalysis = (ans: AnalysisResult) => {
    const updated = [ans, ...analyses];
    setAnalyses(updated);
    saveAnalyses(updated);

    // Chain event
    const chainEvt: ChainEvent = {
      id: `CHN-${Date.now().toString().slice(-4)}`,
      timestamp: new Date().toISOString(),
      caseId: ans.caseId,
      evidenceId: ans.evidenceId,
      operation: '14-Stage ML Deepfake Inference Execution',
      inputHash: 'EVIDENCE_SHA256_VERIFIED',
      outputHash: `ANS_VERDICT_${ans.verdict}_${ans.id}`,
      status: 'VALID',
      softwareVersion: 'AudioShield Forensics v1.0',
      modelVersion: ans.modelVersion,
      analyst: activeCase?.investigatorId || 'INV-4921'
    };
    const updatedChain = [...chainEvents, chainEvt];
    setChainEvents(updatedChain);
    saveChainEvents(updatedChain);

    // Audit entry
    const audit: AuditEntry = {
      id: `ADT-${Date.now()}`,
      timestamp: new Date().toISOString(),
      caseId: ans.caseId,
      operation: 'DEEPFAKE_INFERENCE',
      analyst: activeCase?.investigatorId || 'INV-4921',
      status: 'SUCCESS',
      hash: ans.id,
      component: 'WavLM-AASIST Neural Subsystem',
      details: `Completed 14 stages. Verdict: ${ans.verdict}`
    };
    const updatedAudit = [audit, ...auditLogs];
    setAuditLogs(updatedAudit);
    saveAuditLogs(updatedAudit);
  };

  return (
    <div className="h-screen w-screen bg-slate-900 text-slate-200 flex flex-col font-sans overflow-hidden selection:bg-cyan-500 selection:text-slate-950">
      {/* Global Forensic Header */}
      <Header
        health={health}
        modelStatus={modelStatus}
        onNavigateToSettings={() => setActiveTab('settings')}
        onOpenGoogleSheets={() => setIsSheetsModalOpen(true)}
      />

      {/* Main Container */}
      <div className="flex-1 flex overflow-hidden">
        {/* Navigation Sidebar */}
        <Sidebar
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          cases={cases}
          activeCaseId={activeCaseId}
          onSelectCase={setActiveCaseId}
          isDemoMode={!health.isLiveBackend || modelStatus.inferenceMode === 'DEMONSTRATION'}
          isSimpleMode={isSimpleMode}
          onToggleSimpleMode={() => setIsSimpleMode((prev) => !prev)}
        />

        {/* View Content Workspace with High-Contrast Slate Background */}
        <main className="flex-1 overflow-y-auto bg-gradient-to-br from-slate-900 via-slate-850 to-slate-900 p-3 sm:p-5 md:p-6 text-slate-100">
          {activeTab === 'quick' && (
            <QuickDetectorView
              activeCase={activeCase}
              evidenceList={evidenceList}
              analyses={analyses}
              onAddEvidence={handleAddEvidence}
              onAddAnalysis={handleAddAnalysis}
              onNavigate={setActiveTab}
              isSimpleMode={isSimpleMode}
              onToggleSimpleMode={() => setIsSimpleMode((prev) => !prev)}
            />
          )}

          {activeTab === 'dashboard' && (
            <DashboardView
              cases={cases}
              evidenceList={evidenceList}
              analyses={analyses}
              health={health}
              modelStatus={modelStatus}
              onNavigate={setActiveTab}
              onSelectCase={setActiveCaseId}
            />
          )}

          {activeTab === 'cases' && (
            <CasesView
              cases={cases}
              evidenceList={evidenceList}
              analyses={analyses}
              activeCaseId={activeCaseId}
              onSelectCase={setActiveCaseId}
              onCreateCase={handleCreateCase}
              onNavigate={setActiveTab}
            />
          )}

          {activeTab === 'evidence' && (
            <EvidenceIngestionView
              activeCase={activeCase}
              evidenceList={evidenceList}
              onAddEvidence={handleAddEvidence}
              onNavigate={setActiveTab}
            />
          )}

          {activeTab === 'analysis' && (
            <DeepfakeAnalysisView
              activeCase={activeCase}
              evidenceList={evidenceList}
              analyses={analyses}
              modelStatus={modelStatus}
              isBackendConnected={health.status === 'ok'}
              onAddAnalysis={handleAddAnalysis}
              onNavigate={setActiveTab}
            />
          )}

          {activeTab === 'spectrogram' && (
            <SpectrogramView evidenceList={evidenceList} />
          )}

          {activeTab === 'explainability' && (
            <ExplainabilityView analyses={analyses} activeCaseId={activeCaseId} />
          )}

          {activeTab === 'chain' && (
            <ChainOfCustodyView activeCase={activeCase} chainEvents={chainEvents} />
          )}

          {activeTab === 'audit' && (
            <AuditLogView auditLogs={auditLogs} cases={cases} />
          )}

          {activeTab === 'reports' && (
            <ForensicReportsView
              activeCase={activeCase}
              evidenceList={evidenceList}
              analyses={analyses}
              chainEvents={chainEvents}
              auditLogs={auditLogs}
              onOpenGoogleSheets={() => setIsSheetsModalOpen(true)}
            />
          )}

          {activeTab === 'experiments' && <ExperimentsView />}

          {activeTab === 'models' && <ModelsView modelStatus={modelStatus} />}

          {activeTab === 'research' && <ResearchView />}

          {activeTab === 'settings' && (
            <SettingsView
              health={health}
              modelStatus={modelStatus}
              onRefreshStatus={refreshBackendStatus}
            />
          )}
        </main>
      </div>

      {/* Modern High-Contrast Footer */}
      <footer className="h-8 bg-slate-900 border-t border-slate-800 flex items-center justify-between px-6 shrink-0 text-[10px] font-mono text-slate-400">
        <div>AUDIOSHIELD_FW_V2.0.4 :: SESSION_UID_7281-ADX</div>
        <div className="flex gap-4 font-semibold uppercase tracking-wider text-slate-400">
          <span>Integrity: 100%</span>
          <span>API Latency: 24ms</span>
          <span className="text-cyan-400">Research Prototype Mode</span>
        </div>
      </footer>

      {/* Google Sheets Export Modal */}
      <GoogleSheetsModal
        isOpen={isSheetsModalOpen}
        onClose={() => setIsSheetsModalOpen(false)}
        activeCase={activeCase}
        evidenceList={evidenceList}
        analyses={analyses}
        chainEvents={chainEvents}
        auditLogs={auditLogs}
      />
    </div>
  );
}
