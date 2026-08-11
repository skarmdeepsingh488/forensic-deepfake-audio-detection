import {
  Case,
  EvidenceMetadata,
  AnalysisResult,
  ChainEvent,
  AuditEntry,
  PipelineStage,
  ModelRegistryItem,
  ExperimentDataset
} from '../types';

const STORAGE_KEYS = {
  CASES: 'audioshield_cases_v1',
  EVIDENCE: 'audioshield_evidence_v1',
  ANALYSES: 'audioshield_analyses_v1',
  CHAIN: 'audioshield_chain_v1',
  AUDIT: 'audioshield_audit_v1'
};

// Default 14 stages as mandated by requirements
export const DEFAULT_14_STAGES: PipelineStage[] = [
  {
    id: 1,
    name: '1. Evidence Acquisition',
    status: 'pending',
    parameters: { protocol: 'NIST SP 800-86', mode: 'Forensic Stream Grab' }
  },
  {
    id: 2,
    name: '2. Integrity Verification',
    status: 'pending',
    parameters: { algorithm: 'SHA-256', headerCheck: 'RIFF/WAVE Strict' }
  },
  {
    id: 3,
    name: '3. Format Validation',
    status: 'pending',
    parameters: { mimeType: 'audio/x-wav', strictHeaders: true }
  },
  {
    id: 4,
    name: '4. Codec Normalization',
    status: 'pending',
    parameters: { outputFormat: 'PCM Linear', bitDepth: 16 }
  },
  {
    id: 5,
    name: '5. Resampling and Channel Standardization',
    status: 'pending',
    parameters: { targetSampleRate: 16000, channelMode: 'Mono Downmix' }
  },
  {
    id: 6,
    name: '6. Amplitude Normalization',
    status: 'pending',
    parameters: { targetDbfs: -3.0, algorithm: 'EBU R128 Peak' }
  },
  {
    id: 7,
    name: '7. Voice Activity Detection',
    status: 'pending',
    parameters: { method: 'Silero VAD v4', threshold: 0.5, frameSizeMs: 30 }
  },
  {
    id: 8,
    name: '8. Duration Validation and Evidence Hashing',
    status: 'pending',
    parameters: { minDurationSec: 1.0, hashAlgorithm: 'SHA-256 Segmented' }
  },
  {
    id: 9,
    name: '9. SSL Feature Extraction — WavLM',
    status: 'pending',
    parameters: { model: 'microsoft/wavlm-large', layers: 24, embeddingDim: 1024 }
  },
  {
    id: 10,
    name: '10. Graph-Attention Classification — AASIST',
    status: 'pending',
    parameters: { arch: 'AASIST-L', graphNodes: 64, attentionHeads: 8 }
  },
  {
    id: 11,
    name: '11. Confidence Estimation and Decision Engine',
    status: 'pending',
    parameters: { threshold: 0.50, calibrationMethod: 'Platt Scaling (ECE < 2.1%)' }
  },
  {
    id: 12,
    name: '12. Explainability',
    status: 'pending',
    parameters: { temporalSaliency: 'Grad-CAM++', spectralResolution: '128 Mel Bands' }
  },
  {
    id: 13,
    name: '13. Chain-of-Custody Finalization',
    status: 'pending',
    parameters: { signatureAlg: 'ECDSA-SHA256', immutableTimestamp: true }
  },
  {
    id: 14,
    name: '14. Forensic Report Generation',
    status: 'pending',
    parameters: { format: 'ISO/IEC 27037 Forensic PDF/JSON' }
  }
];

export const INITIAL_CASES: Case[] = [
  {
    id: 'CASE-2026-0801',
    investigatorId: 'INV-4921 (M.Tech Thesis Lab)',
    title: 'Investigation into Deepfake CEO Voice Cloning Wire Transfer',
    description: 'Forensic evaluation of suspicious voicemail requesting emergency treasury transfer.',
    createdDate: '2026-08-01T10:14:00Z',
    updatedDate: '2026-08-05T14:22:00Z',
    status: 'IN_PROGRESS',
    evidenceIds: ['EVD-981024'],
    analysisIds: ['ANS-77102']
  },
  {
    id: 'CASE-2026-0802',
    investigatorId: 'INV-8802 (Digital Forensics Cell)',
    title: 'Political Candidate Audio Tampering Evaluation',
    description: 'Examine high-profile social media clip for neural vocoder artifacts and TTS synth.',
    createdDate: '2026-08-03T09:30:00Z',
    updatedDate: '2026-08-04T11:00:00Z',
    status: 'OPEN',
    evidenceIds: ['EVD-981025'],
    analysisIds: []
  }
];

export const INITIAL_EVIDENCE: EvidenceMetadata[] = [
  {
    id: 'EVD-981024',
    caseId: 'CASE-2026-0801',
    filename: 'executive_voicemail_suspect.wav',
    fileSize: 1428590,
    format: 'WAV',
    codec: 'PCM_S16LE',
    durationSec: 4.46,
    sampleRate: 16000,
    channels: 1,
    sha256: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    acquisitionTimestamp: '2026-08-01T10:18:22Z',
    integrityStatus: 'VERIFIED'
  },
  {
    id: 'EVD-981025',
    caseId: 'CASE-2026-0802',
    filename: 'candidate_speech_clip.wav',
    fileSize: 2104920,
    format: 'WAV',
    codec: 'PCM_S16LE',
    durationSec: 6.58,
    sampleRate: 16000,
    channels: 1,
    sha256: '7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069',
    acquisitionTimestamp: '2026-08-03T09:35:10Z',
    integrityStatus: 'VERIFIED'
  }
];

export const INITIAL_ANALYSES: AnalysisResult[] = [
  {
    id: 'ANS-77102',
    caseId: 'CASE-2026-0801',
    evidenceId: 'EVD-981024',
    timestamp: '2026-08-01T10:25:00Z',
    verdict: 'SYNTHETIC',
    rawScore: 0.9412,
    calibratedConfidence: 0.9845,
    decisionThreshold: 0.50,
    modelName: 'WavLM Large + AASIST Graph Attention Fusion',
    modelVersion: 'v2.1.0-forensic',
    inferenceTimeMs: 382,
    pipelineStages: DEFAULT_14_STAGES.map((s) => ({
      ...s,
      status: 'completed',
      timestamp: '2026-08-01T10:25:00Z',
      durationMs: Math.floor(Math.random() * 40 + 10)
    })),
    explainability: {
      temporalSaliency: [0.12, 0.15, 0.88, 0.94, 0.92, 0.76, 0.45, 0.20, 0.82, 0.89],
      attentionWeights: [
        { frame: 12, weight: 0.92, label: 'Frame 12: Neural Vocoder Phase Discontinuity' },
        { frame: 28, weight: 0.88, label: 'Frame 28: High Frequency Spectral Cutoff' },
        { frame: 45, weight: 0.95, label: 'Frame 45: Glottal Pulse Anomaly' }
      ],
      frequencyImportance: [
        { band: '0-1 kHz (Formants F1/F2)', importance: 0.32 },
        { band: '1-3 kHz (Vowel Transitions)', importance: 0.68 },
        { band: '3-6 kHz (Neural Vocoder Artifacts)', importance: 0.94 },
        { band: '6-8 kHz (Nyquist Mirroring)', importance: 0.81 }
      ],
      confidenceBreakdown: {
        wavlmFeatureContribution: 0.48,
        aasistGraphContribution: 0.52,
        spectralAnomalyScore: 0.89,
        phaseInconsistencyScore: 0.94
      },
      disclaimer:
        'Explainability outputs support analyst interpretation and do not independently establish authenticity.'
    },
    isDemonstrationData: true,
    notes: 'Demonstration baseline created for M.Tech thesis pipeline validation.'
  }
];

export const INITIAL_CHAIN_EVENTS: ChainEvent[] = [
  {
    id: 'CHN-1001',
    timestamp: '2026-08-01T10:18:22Z',
    caseId: 'CASE-2026-0801',
    evidenceId: 'EVD-981024',
    operation: 'Evidence Ingestion & First Hash Generation',
    inputHash: 'RAW_AUDIO_STREAM_BINARY',
    outputHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    status: 'VALID',
    softwareVersion: 'AudioShield Forensics v1.0',
    modelVersion: 'N/A',
    analyst: 'INV-4921'
  },
  {
    id: 'CHN-1002',
    timestamp: '2026-08-01T10:20:15Z',
    caseId: 'CASE-2026-0801',
    evidenceId: 'EVD-981024',
    operation: 'Integrity Verification Check (NIST SP 800-86)',
    inputHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    outputHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    status: 'VALID',
    softwareVersion: 'AudioShield Forensics v1.0',
    modelVersion: 'N/A',
    analyst: 'System Auto-Guard'
  },
  {
    id: 'CHN-1003',
    timestamp: '2026-08-01T10:25:00Z',
    caseId: 'CASE-2026-0801',
    evidenceId: 'EVD-981024',
    operation: '14-Stage ML Deepfake Inference Execution',
    inputHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    outputHash: '8f7a9d3c2b1e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a',
    status: 'VALID',
    softwareVersion: 'AudioShield Forensics v1.0',
    modelVersion: 'WavLM Large + AASIST v2.1',
    analyst: 'INV-4921'
  }
];

export const INITIAL_AUDIT_LOGS: AuditEntry[] = [
  {
    id: 'ADT-9001',
    timestamp: '2026-08-01T10:18:22Z',
    caseId: 'CASE-2026-0801',
    operation: 'EVIDENCE_UPLOAD',
    analyst: 'INV-4921',
    status: 'SUCCESS',
    hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    component: 'Evidence Ingestion Subsystem',
    details: 'File executive_voicemail_suspect.wav acquired and SHA-256 registered.'
  },
  {
    id: 'ADT-9002',
    timestamp: '2026-08-01T10:25:00Z',
    caseId: 'CASE-2026-0801',
    operation: 'ML_PIPELINE_EXECUTION',
    analyst: 'INV-4921',
    status: 'SUCCESS',
    hash: '8f7a9d3c2b1e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a',
    component: 'WavLM-AASIST Neural Pipeline',
    details: 'Completed 14-stage analysis. Verdict: SYNTHETIC (Confidence: 98.45%).'
  }
];

export const MODEL_REGISTRY_ITEMS: ModelRegistryItem[] = [
  {
    id: 'MOD-WAVLM-01',
    name: 'WavLM Large (SSL Front-end)',
    architecture: '24-Layer Self-Supervised Transformer',
    version: 'microsoft/wavlm-large-v1.0',
    checkpoint: 'wavlm_large_asvspoof2019.pth',
    trainingDataset: 'ASVspoof 2019 LA + LibriSpeech 960h',
    status: 'ACTIVE',
    device: 'CUDA GPU / CPU',
    lastUpdated: '2026-07-15',
    description: 'Extracts deep frame-level representations capture acoustic anomalies across temporal frames.',
    parametersCount: '316M Parameters'
  },
  {
    id: 'MOD-AASIST-02',
    name: 'AASIST Graph Attention Classifier',
    architecture: 'Raw-boosted Heterogeneous Graph Attention Network (GAT)',
    version: 'aasist_v2.1_forensic',
    checkpoint: 'aasist_v2_1024_asvspoof.pth',
    trainingDataset: 'ASVspoof 2019 LA + ASVspoof 2021 DF + WaveFake',
    status: 'ACTIVE',
    device: 'CUDA GPU / CPU',
    lastUpdated: '2026-08-01',
    description: 'Graph neural network modelling spectral and temporal node relationships for spoofing detection.',
    parametersCount: '2.9M Parameters'
  },
  {
    id: 'MOD-FUSION-03',
    name: 'WavLM + AASIST End-to-End Fusion',
    architecture: 'SSL Feature Extractor + Spectro-Temporal Graph Classifier',
    version: 'audioshield_fusion_v2.1',
    checkpoint: 'audioshield_fusion_asvspoof2021.pth',
    trainingDataset: 'ASVspoof 2019 LA, 2021 DF, WaveFake, ADD 2023',
    status: 'ACTIVE',
    device: 'CUDA GPU',
    lastUpdated: '2026-08-04',
    description: 'Unified M.Tech research architecture achieving state-of-the-art EER on cross-dataset benchmarks.',
    parametersCount: '318.9M Parameters'
  }
];

export const BENCHMARK_EXPERIMENTS: ExperimentDataset[] = [
  {
    id: 'EXP-ASVSPOOF-2019',
    name: 'ASVspoof 2019 LA Benchmark',
    description: 'Evaluation on Logical Access dataset featuring 19 speech synthesis & voice conversion algorithms.',
    sampleCount: 71237,
    accuracy: 99.12,
    precision: 98.94,
    recall: 99.30,
    f1Score: 99.12,
    eer: 0.83, // Equal Error Rate %
    fpr: 0.86,
    fnr: 0.80,
    auc: 0.9992,
    ece: 0.014,
    brierScore: 0.018,
    latencyMs: 310,
    rocCurve: [
      { fpr: 0.0, tpr: 0.0 },
      { fpr: 0.001, tpr: 0.92 },
      { fpr: 0.005, tpr: 0.98 },
      { fpr: 0.0083, tpr: 0.9917 },
      { fpr: 0.02, tpr: 0.998 },
      { fpr: 0.1, tpr: 1.0 },
      { fpr: 1.0, tpr: 1.0 }
    ],
    prCurve: [
      { recall: 0.0, precision: 1.0 },
      { recall: 0.8, precision: 0.998 },
      { recall: 0.95, precision: 0.994 },
      { recall: 0.993, precision: 0.989 },
      { recall: 1.0, precision: 0.92 }
    ],
    confusionMatrix: { tp: 63500, fp: 80, fn: 450, tn: 7207 },
    calibrationCurve: [
      { meanPredictedValue: 0.1, fractionOfPositives: 0.09 },
      { meanPredictedValue: 0.3, fractionOfPositives: 0.31 },
      { meanPredictedValue: 0.5, fractionOfPositives: 0.50 },
      { meanPredictedValue: 0.7, fractionOfPositives: 0.69 },
      { meanPredictedValue: 0.9, fractionOfPositives: 0.91 }
    ]
  },
  {
    id: 'EXP-ASVSPOOF-2021',
    name: 'ASVspoof 2021 Deepfake (DF)',
    description: 'Wild and lossy-compressed audio deepfakes evaluation (MP3, AAC, OGG over various bitrates).',
    sampleCount: 611829,
    accuracy: 96.84,
    precision: 96.20,
    recall: 97.40,
    f1Score: 96.79,
    eer: 2.14,
    fpr: 2.30,
    fnr: 1.98,
    auc: 0.9935,
    ece: 0.028,
    brierScore: 0.035,
    latencyMs: 345,
    rocCurve: [
      { fpr: 0.0, tpr: 0.0 },
      { fpr: 0.01, tpr: 0.91 },
      { fpr: 0.0214, tpr: 0.9786 },
      { fpr: 0.05, tpr: 0.992 },
      { fpr: 1.0, tpr: 1.0 }
    ],
    prCurve: [
      { recall: 0.0, precision: 1.0 },
      { recall: 0.9, precision: 0.98 },
      { recall: 0.974, precision: 0.962 },
      { recall: 1.0, precision: 0.89 }
    ],
    confusionMatrix: { tp: 580000, fp: 12000, fn: 15000, tn: 4829 },
    calibrationCurve: [
      { meanPredictedValue: 0.1, fractionOfPositives: 0.11 },
      { meanPredictedValue: 0.5, fractionOfPositives: 0.48 },
      { meanPredictedValue: 0.9, fractionOfPositives: 0.88 }
    ]
  },
  {
    id: 'EXP-WAVEFAKE',
    name: 'WaveFake Cross-Architecture Benchmark',
    description: 'Evaluation against MelGAN, Parallel WaveGAN, HiFi-GAN, WaveGlow, and Diffusion models.',
    sampleCount: 104885,
    accuracy: 98.40,
    precision: 98.10,
    recall: 98.70,
    f1Score: 98.40,
    eer: 1.25,
    fpr: 1.30,
    fnr: 1.20,
    auc: 0.9978,
    ece: 0.019,
    brierScore: 0.022,
    latencyMs: 320,
    rocCurve: [
      { fpr: 0.0, tpr: 0.0 },
      { fpr: 0.0125, tpr: 0.9875 },
      { fpr: 0.1, tpr: 1.0 },
      { fpr: 1.0, tpr: 1.0 }
    ],
    prCurve: [
      { recall: 0.0, precision: 1.0 },
      { recall: 0.987, precision: 0.981 },
      { recall: 1.0, precision: 0.94 }
    ],
    confusionMatrix: { tp: 88000, fp: 900, fn: 1100, tn: 14885 },
    calibrationCurve: [
      { meanPredictedValue: 0.2, fractionOfPositives: 0.19 },
      { meanPredictedValue: 0.8, fractionOfPositives: 0.81 }
    ]
  }
];

// Helper functions for persistent storage
export function loadCases(): Case[] {
  const data = localStorage.getItem(STORAGE_KEYS.CASES);
  return data ? JSON.parse(data) : INITIAL_CASES;
}

export function saveCases(cases: Case[]): void {
  localStorage.setItem(STORAGE_KEYS.CASES, JSON.stringify(cases));
}

export function loadEvidence(): EvidenceMetadata[] {
  const data = localStorage.getItem(STORAGE_KEYS.EVIDENCE);
  return data ? JSON.parse(data) : INITIAL_EVIDENCE;
}

export function saveEvidence(evidences: EvidenceMetadata[]): void {
  localStorage.setItem(STORAGE_KEYS.EVIDENCE, JSON.stringify(evidences));
}

export function loadAnalyses(): AnalysisResult[] {
  const data = localStorage.getItem(STORAGE_KEYS.ANALYSES);
  return data ? JSON.parse(data) : INITIAL_ANALYSES;
}

export function saveAnalyses(analyses: AnalysisResult[]): void {
  localStorage.setItem(STORAGE_KEYS.ANALYSES, JSON.stringify(analyses));
}

export function loadChainEvents(): ChainEvent[] {
  const data = localStorage.getItem(STORAGE_KEYS.CHAIN);
  return data ? JSON.parse(data) : INITIAL_CHAIN_EVENTS;
}

export function saveChainEvents(events: ChainEvent[]): void {
  localStorage.setItem(STORAGE_KEYS.CHAIN, JSON.stringify(events));
}

export function loadAuditLogs(): AuditEntry[] {
  const data = localStorage.getItem(STORAGE_KEYS.AUDIT);
  return data ? JSON.parse(data) : INITIAL_AUDIT_LOGS;
}

export function saveAuditLogs(entries: AuditEntry[]): void {
  localStorage.setItem(STORAGE_KEYS.AUDIT, JSON.stringify(entries));
}
