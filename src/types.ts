export type VerdictType = 'GENUINE' | 'SYNTHETIC' | 'INCONCLUSIVE';

export type StageStatus = 'pending' | 'running' | 'completed' | 'failed' | 'skipped';

export interface PipelineStage {
  id: number;
  name: string;
  status: StageStatus;
  timestamp?: string;
  durationMs?: number;
  input?: string;
  output?: string;
  parameters?: Record<string, string | number | boolean>;
  error?: string;
}

export interface EvidenceMetadata {
  id: string;
  caseId: string;
  filename: string;
  fileSize: number;
  format: string;
  codec: string;
  durationSec: number;
  sampleRate: number;
  channels: number;
  sha256: string;
  acquisitionTimestamp: string;
  integrityStatus: 'VERIFIED' | 'COMPROMISED' | 'UNVERIFIED';
  audioUrl?: string;
}

export interface Case {
  id: string;
  investigatorId: string;
  title: string;
  description: string;
  createdDate: string;
  updatedDate: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'CLOSED' | 'ARCHIVED';
  evidenceIds: string[];
  analysisIds: string[];
}

export interface ExplainabilityData {
  temporalSaliency: number[]; // 0 to 1 values per frame
  attentionWeights: { frame: number; weight: number; label: string }[];
  frequencyImportance: { band: string; importance: number }[];
  confidenceBreakdown: {
    wavlmFeatureContribution: number;
    aasistGraphContribution: number;
    spectralAnomalyScore: number;
    phaseInconsistencyScore: number;
  };
  disclaimer: string;
}

export interface AnalysisResult {
  id: string;
  caseId: string;
  evidenceId: string;
  timestamp: string;
  verdict: VerdictType;
  rawScore: number; // -1.0 to +1.0 or raw logit
  calibratedConfidence: number; // 0.0 to 1.0 (percentage)
  decisionThreshold: number; // e.g. 0.50
  modelName: string; // "WavLM Large + AASIST Fusion"
  modelVersion: string; // "v2.1.0-forensic"
  inferenceTimeMs: number;
  pipelineStages: PipelineStage[];
  explainability?: ExplainabilityData;
  isDemonstrationData: boolean;
  notes?: string;
}

export interface ChainEvent {
  id: string;
  timestamp: string;
  caseId: string;
  evidenceId?: string;
  operation: string;
  inputHash: string;
  outputHash: string;
  status: 'VALID' | 'INVALID' | 'PENDING';
  softwareVersion: string;
  modelVersion: string;
  analyst: string;
}

export interface AuditEntry {
  id: string;
  timestamp: string;
  caseId: string;
  operation: string;
  analyst: string;
  status: 'SUCCESS' | 'WARNING' | 'FAILURE';
  hash: string;
  component: string;
  details?: string;
}

export interface ModelStatus {
  wavlmStatus: 'READY' | 'LOADING' | 'UNAVAILABLE' | 'ERROR';
  aasistStatus: 'READY' | 'LOADING' | 'UNAVAILABLE' | 'ERROR';
  checkpointLoaded: boolean;
  checkpointName?: string;
  device: 'CUDA (GPU)' | 'CPU' | 'MPS (Apple Silicon)' | 'UNAVAILABLE';
  embeddingDimensions: number;
  inferenceMode: 'LIVE_RESEARCH' | 'DEMONSTRATION' | 'UNAVAILABLE';
  lastChecked: string;
}

export interface HealthStatus {
  status: 'ok' | 'degraded' | 'unavailable';
  service: string;
  version: string;
  uptimeSeconds: number;
  backendUrl: string;
  isLiveBackend: boolean;
}

export interface ExperimentDataset {
  id: string;
  name: string;
  description: string;
  sampleCount: number;
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  eer: number; // Equal Error Rate (%)
  fpr: number;
  fnr: number;
  auc: number;
  ece: number; // Expected Calibration Error
  brierScore: number;
  latencyMs: number;
  rocCurve: { fpr: number; tpr: number }[];
  prCurve: { recall: number; precision: number }[];
  confusionMatrix: { tp: number; fp: number; fn: number; tn: number };
  calibrationCurve: { meanPredictedValue: number; fractionOfPositives: number }[];
}

export interface ModelRegistryItem {
  id: string;
  name: string;
  architecture: string;
  version: string;
  checkpoint: string;
  trainingDataset: string;
  status: 'ACTIVE' | 'DEPRECATED' | 'EXPERIMENTAL';
  device: string;
  lastUpdated: string;
  description: string;
  parametersCount: string;
}

export type NavigationTab =
  | 'quick'
  | 'dashboard'
  | 'cases'
  | 'evidence'
  | 'analysis'
  | 'spectrogram'
  | 'explainability'
  | 'chain'
  | 'audit'
  | 'reports'
  | 'experiments'
  | 'models'
  | 'research'
  | 'settings';
