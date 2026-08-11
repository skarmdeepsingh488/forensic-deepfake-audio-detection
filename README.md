# AudioShield Forensics — Deepfake Audio Detection & Verification Platform

> **M.Tech Thesis Research Prototype**  
> *AI-Powered Forensic Deepfake Audio Detection & Verification Engine*

[![System Architecture](https://img.shields.io/badge/Architecture-WavLM%20%2B%20AASIST-cyan)](https://github.com)
[![Standard](https://img.shields.io/badge/Standard-ISO%2FIEC%2027037%3A2012-emerald)](https://github.com)
[![License](https://img.shields.io/badge/License-MIT-blue)](https://github.com)

---

## 📌 Executive Summary

**AudioShield Forensics** is an enterprise-grade digital forensics platform designed to detect, analyze, and verify synthetic speech and AI-generated deepfake audio. Built on a hybrid deep learning model architecture combining **WavLM (Self-Supervised Learning Transformer)** for contextual representation extraction and **AASIST (Integrated Rawnet2 & Graph Attention Networks)** for artifact classification, the platform delivers high-confidence spoof detection with explainable visual diagnostics.

---

## 🚀 Key Features

- 🎧 **Evidence Ingestion & Verification**: Cryptographic SHA-256 hashing on drag-and-drop or batch audio ingestion ensuring tamper-proof digital evidence integrity under ISO/IEC 27037 standards.
- 🔬 **Dual-Engine Deepfake Analysis**: Real-time spectral feature extraction and graph attention classification outputting binary verdicts (`GENUINE`, `SYNTHETIC`, `INCONCLUSIVE`) with confidence metrics.
- 📊 **Multi-Band Spectrogram Analysis**: Interactive STFT spectrogram visualizer with temporal pitch tracking, harmonic energy distribution, and high-frequency phase anomaly detection.
- 💡 **Model Explainability & XAI**: Layer-by-layer WavLM attention heatmaps, AASIST graph node importance scores, and acoustic artifact localization markers.
- 🔗 **Chain of Custody**: Cryptographically linked audit logs tracking evidence custody, analysis timestamps, and system investigator signatures.
- 📄 **Forensic Reports & Data Export**: ISO/IEC 27037 compliant formal report generation with direct PDF printing and machine-readable **JSON Evidence Archive** exports.
- 🧪 **Experimental Laboratory**: Comparative evaluation suite for testing cross-model performance against synthetic voice cloning algorithms (TTS, Voice Conversion, WaveNet, ElevenLabs).

---

## 🏗️ System Architecture

```text
[ Audio Evidence Ingestion (.wav / .mp3) ]
                   │
                   ▼
       [ SHA-256 Hash Verification ]
                   │
         ┌─────────┴─────────┐
         ▼                   ▼
 [ WavLM Feature Extractor ]  [ STFT Spectrogram Visualizer ]
 (24-Layer SSL Transformer)    (Frequency Artifact Analysis)
         │
         ▼
 [ AASIST Classifier ]
 (Raw Graph Attention Net)
         │
         ▼
 [ Forensic Analysis & Explainability Engine ]
         │
         ├─────────────────────────┬─────────────────────────┐
         ▼                         ▼                         ▼
[ Forensic PDF Report ]  [ JSON Evidence Archive ]  [ Immutable Chain of Custody ]
```

---

## 🛠️ Technology Stack

* **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Lucide Icons, Recharts, Motion (Framer)
* **Application Server**: Node.js, Express, TSX, Esbuild (Full-Stack SSR/API Integration)
* **Machine Learning Pipeline**: WavLM (Microsoft SSL Transformer), AASIST (Graph Attention Network)
* **Standards Compliance**: ISO/IEC 27037:2012 (Digital Evidence Handling)

---

## 💻 Getting Started

### Prerequisites

* Node.js >= 18.0.0
* npm >= 9.0.0

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/forensic-deepfake-audio-detection.git
   cd forensic-deepfake-audio-detection
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create a `.env` file or refer to `.env.example`:
   ```env
   VITE_BACKEND_URL=http://localhost:8000
   PORT=3000
   ```

4. **Launch Development Server**:
   ```bash
   npm run dev
   ```
   Navigate to `http://localhost:3000` in your web browser.

5. **Build for Production**:
   ```bash
   npm run build
   npm run start
   ```

---

## 📊 Forensic JSON Export Format

AudioShield supports exporting machine-readable evidence packages following ISO/IEC 27037 guidelines:

```json
{
  "exportMetadata": {
    "exportedAt": "2026-08-11T11:15:00.000Z",
    "standard": "ISO/IEC 27037:2012 Digital Evidence Handling",
    "system": "AudioShield Forensics Framework",
    "version": "v2.0.4-research"
  },
  "case": {
    "id": "CASE-2024-001",
    "title": "Executive Voice Authentication Inquiry"
  },
  "evidence": [...],
  "analysisSummary": [...],
  "chainOfCustody": [...],
  "auditLog": [...]
}
```

---

## 📄 License

This research prototype is developed as part of M.Tech thesis work in Digital Forensics & Cyber Security. Distributed under the MIT License.
