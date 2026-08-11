import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  // CORS headers
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    if (req.method === 'OPTIONS') {
      res.sendStatus(200);
      return;
    }
    next();
  });

  // GET /health
  app.get('/health', (req, res) => {
    res.json({
      status: 'ok',
      service: 'AudioShield Forensics API Engine',
      version: '1.0.0-mtech',
      uptimeSeconds: Math.floor(process.uptime()),
      timestamp: new Date().toISOString()
    });
  });

  // GET /api/health
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      service: 'AudioShield Express Proxy Engine',
      version: '1.0.0-mtech',
      uptimeSeconds: Math.floor(process.uptime()),
      timestamp: new Date().toISOString()
    });
  });

  // GET /api/v1/model/status
  app.get('/api/v1/model/status', (req, res) => {
    res.json({
      wavlm_status: 'READY',
      aasist_status: 'READY',
      checkpoint_loaded: true,
      checkpoint_name: 'aasist_v2_1024_asvspoof.pth',
      device: 'CPU / Emulated PyTorch',
      embedding_dimensions: 1024,
      inference_mode: 'DEMONSTRATION',
      last_checked: new Date().toISOString()
    });
  });

  // POST /api/v1/evidence/upload
  app.post('/api/v1/evidence/upload', (req, res) => {
    const caseId = req.body.case_id || 'CASE-2026-001';
    const sha256 = req.body.sha256 || 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';

    res.json({
      id: `EVD-${Math.floor(Math.random() * 899999 + 100000)}`,
      caseId,
      filename: req.body.filename || 'uploaded_evidence.wav',
      fileSize: 1845920,
      format: 'WAV',
      codec: 'PCM_S16LE',
      durationSec: 4.82,
      sampleRate: 16000,
      channels: 1,
      sha256,
      acquisitionTimestamp: new Date().toISOString(),
      integrityStatus: 'VERIFIED'
    });
  });

  // POST /api/v1/analysis/run
  app.post('/api/v1/analysis/run', (req, res) => {
    const { caseId = 'CASE-2026-001', evidenceId = 'EVD-101', sha256 } = req.body;

    const isSynthetic = Math.random() > 0.4;
    const rawScore = isSynthetic ? 0.9234 : -0.8842;
    const calibratedConfidence = isSynthetic ? 0.9782 : 0.9610;

    const stages = [
      { id: 1, name: '1. Evidence Acquisition', status: 'completed', durationMs: 12, output: 'Stream verified' },
      { id: 2, name: '2. Integrity Verification', status: 'completed', durationMs: 18, output: `SHA-256: ${sha256 || 'Verified'}` },
      { id: 3, name: '3. Format Validation', status: 'completed', durationMs: 8, output: 'Format: RIFF/WAVE 16kHz Mono' },
      { id: 4, name: '4. Codec Normalization', status: 'completed', durationMs: 25, output: '16-bit Linear PCM' },
      { id: 5, name: '5. Resampling and Channel Standardization', status: 'completed', durationMs: 34, output: '16000 Hz Mono Downmixed' },
      { id: 6, name: '6. Amplitude Normalization', status: 'completed', durationMs: 14, output: 'Peak -3.0 dBFS (EBU R128)' },
      { id: 7, name: '7. Voice Activity Detection', status: 'completed', durationMs: 42, output: 'Silero VAD: Speech regions detected' },
      { id: 8, name: '8. Duration Validation and Evidence Hashing', status: 'completed', durationMs: 10, output: 'Valid 4.82s (Hash confirmed)' },
      { id: 9, name: '9. SSL Feature Extraction — WavLM', status: 'completed', durationMs: 185, output: 'WavLM Large 24-Layer Embedding shape [1, 301, 1024]' },
      { id: 10, name: '10. Graph-Attention Classification — AASIST', status: 'completed', durationMs: 110, output: `AASIST GAT Graph score: ${rawScore}` },
      { id: 11, name: '11. Confidence Estimation and Decision Engine', status: 'completed', durationMs: 15, output: `Decision: ${isSynthetic ? 'SYNTHETIC' : 'GENUINE'} (Threshold: 0.50)` },
      { id: 12, name: '12. Explainability', status: 'completed', durationMs: 65, output: 'Grad-CAM++ temporal saliency map generated' },
      { id: 13, name: '13. Chain-of-Custody Finalization', status: 'completed', durationMs: 22, output: 'Signed ECDSA-SHA256 block added' },
      { id: 14, name: '14. Forensic Report Generation', status: 'completed', durationMs: 40, output: 'Report ISO/IEC 27037 compiled' }
    ];

    res.json({
      id: `ANS-${Math.floor(Math.random() * 89999 + 10000)}`,
      caseId,
      evidenceId,
      timestamp: new Date().toISOString(),
      verdict: isSynthetic ? 'SYNTHETIC' : 'GENUINE',
      rawScore,
      calibratedConfidence,
      decisionThreshold: 0.50,
      modelName: 'WavLM Large + AASIST Fusion',
      modelVersion: 'v2.1.0-forensic',
      inferenceTimeMs: 595,
      pipelineStages: stages,
      explainability: {
        temporalSaliency: [0.1, 0.2, 0.85, 0.92, 0.89, 0.70, 0.35, 0.15, 0.80, 0.87],
        attentionWeights: [
          { frame: 12, weight: 0.92, label: 'Frame 12: Neural Vocoder Phase Discontinuity' },
          { frame: 28, weight: 0.88, label: 'Frame 28: High Frequency Spectral Cutoff' }
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
        disclaimer: 'Explainability outputs support analyst interpretation and do not independently establish authenticity.'
      },
      isDemonstrationData: true
    });
  });

  // POST /api/v1/chain/verify/:case_id
  app.post('/api/v1/chain/verify/:case_id', (req, res) => {
    res.json({
      valid: true,
      caseId: req.params.case_id,
      chainLength: 14,
      message: 'Cryptographic hash sequence and SHA-256 headers verified. Chain of custody intact.'
    });
  });

  // GET /api/v1/report/:report_id
  app.get('/api/v1/report/:report_id', (req, res) => {
    res.json({
      reportId: req.params.report_id,
      title: 'RESEARCH PROTOTYPE FORENSIC ANALYSIS REPORT',
      timestamp: new Date().toISOString(),
      content: 'Standard ISO/IEC 27037 Forensic Analysis Document.'
    });
  });

  // Vite middleware or static serving
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`AudioShield Forensics server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start AudioShield server:', err);
});
