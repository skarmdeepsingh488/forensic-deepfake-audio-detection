import React, { useState, useRef } from 'react';
import { EvidenceMetadata, Case, NavigationTab } from '../types';
import { calculateSHA256, validateAudioFile } from '../services/crypto';
import { uploadEvidence } from '../services/api';
import {
  Upload,
  FileAudio,
  CheckCircle2,
  Lock,
  RefreshCw,
  Hash,
  Play,
  Pause,
  AlertTriangle,
  ArrowRight
} from 'lucide-react';

interface EvidenceIngestionProps {
  activeCase: Case;
  evidenceList: EvidenceMetadata[];
  onAddEvidence: (newEvidence: EvidenceMetadata) => void;
  onNavigate: (tab: NavigationTab) => void;
}

export const EvidenceIngestionView: React.FC<EvidenceIngestionProps> = ({
  activeCase,
  evidenceList,
  onAddEvidence,
  onNavigate
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [playingId, setPlayingId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const caseEvidences = evidenceList.filter((e) => e.caseId === activeCase?.id);

  const handleProcessFile = async (file: File) => {
    setUploadError(null);

    const val = validateAudioFile(file);
    if (!val.valid) {
      setUploadError(val.error || 'Invalid audio file.');
      return;
    }

    setIsUploading(true);

    try {
      // 1. Client-Side Cryptographic SHA-256 Calculation
      const clientHash = await calculateSHA256(file);

      // 2. Transmit to backend upload endpoint
      const result = await uploadEvidence(file, activeCase.id, clientHash);

      onAddEvidence(result);
    } catch (err: any) {
      setUploadError(err.message || 'Failed to ingest evidence file.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleProcessFile(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleProcessFile(e.dataTransfer.files[0]);
    }
  };

  const togglePlay = (evd: EvidenceMetadata) => {
    if (!evd.audioUrl) return;
    if (playingId === evd.id) {
      audioRef.current?.pause();
      setPlayingId(null);
    } else {
      if (audioRef.current) {
        audioRef.current.src = evd.audioUrl;
        audioRef.current.play();
        setPlayingId(evd.id);
      }
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto font-mono">
      {/* Hidden Audio Player Element */}
      <audio ref={audioRef} onEnded={() => setPlayingId(null)} className="hidden" />

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Upload className="w-5 h-5 text-cyan-400" /> Evidence Ingestion & Cryptographic Hashing
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            NIST SP 800-86 compliant acquisition. Original evidence files are strictly immutable.
          </p>
        </div>
        <div className="text-xs px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-cyan-300">
          Case Target: <strong className="text-slate-100">{activeCase?.id}</strong>
        </div>
      </div>

      {/* Drag and Drop Zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`p-10 rounded-2xl border-2 border-dashed text-center cursor-pointer transition-all ${
          isDragOver
            ? 'border-cyan-400 bg-cyan-950/30'
            : 'border-slate-800 hover:border-slate-700 bg-slate-900/60'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".wav,.flac,.mp3,.ogg,.m4a,.aac"
          onChange={handleFileChange}
          className="hidden"
        />

        <div className="max-w-md mx-auto space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-cyan-950/80 border border-cyan-800 text-cyan-400 flex items-center justify-center mx-auto shadow-lg shadow-cyan-950/50">
            {isUploading ? (
              <RefreshCw className="w-6 h-6 animate-spin text-cyan-400" />
            ) : (
              <FileAudio className="w-6 h-6" />
            )}
          </div>

          <div className="space-y-1">
            <h3 className="text-sm font-bold text-slate-100">
              {isUploading ? 'Computing SHA-256 & Registering...' : 'Drop Audio Evidence Here or Click to Browse'}
            </h3>
            <p className="text-xs text-slate-400">
              Supported Formats: <strong className="text-cyan-400">WAV, FLAC, MP3, OGG, M4A</strong> (Up to 100MB)
            </p>
          </div>

          <div className="flex items-center justify-center gap-2 text-[10px] text-slate-500 pt-2">
            <Lock className="w-3 h-3 text-emerald-400" />
            <span>Read-only ingestion • SHA-256 Hash calculated on client & backend</span>
          </div>
        </div>
      </div>

      {uploadError && (
        <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-800/80 text-rose-300 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{uploadError}</span>
        </div>
      )}

      {/* Evidence Table */}
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800/80 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <Lock className="w-4 h-4 text-emerald-400" /> Evidence Vault ({caseEvidences.length} files)
          </h3>
          <button
            onClick={() => onNavigate('analysis')}
            className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-semibold"
          >
            Proceed to Deepfake Analysis <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {caseEvidences.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-xs border border-dashed border-slate-800 rounded-xl">
            No audio evidence files uploaded to case {activeCase?.id} yet.
          </div>
        ) : (
          <div className="space-y-3">
            {caseEvidences.map((evd) => (
              <div
                key={evd.id}
                className="p-4 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-3"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
                  <div className="flex items-center gap-3">
                    {evd.audioUrl && (
                      <button
                        onClick={() => togglePlay(evd)}
                        className="w-9 h-9 rounded-xl bg-cyan-950 hover:bg-cyan-900 border border-cyan-800 text-cyan-300 flex items-center justify-center shrink-0 transition-colors"
                      >
                        {playingId === evd.id ? (
                          <Pause className="w-4 h-4 text-cyan-300" />
                        ) : (
                          <Play className="w-4 h-4 text-cyan-300 pl-0.5" />
                        )}
                      </button>
                    )}
                    <div>
                      <h4 className="text-sm font-bold text-slate-100">{evd.filename}</h4>
                      <div className="text-[10px] text-slate-400 flex flex-wrap items-center gap-3 mt-0.5">
                        <span>ID: <strong className="text-cyan-300">{evd.id}</strong></span>
                        <span>•</span>
                        <span>Case: {evd.caseId}</span>
                        <span>•</span>
                        <span>Acquired: {new Date(evd.acquisitionTimestamp).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-800/80 text-[10px] font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Integrity: {evd.integrityStatus}
                    </span>
                    <button
                      onClick={() => onNavigate('analysis')}
                      className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs shadow-md shadow-cyan-950/50"
                    >
                      Run Pipeline
                    </button>
                  </div>
                </div>

                {/* Metadata Specs Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 text-xs bg-slate-900/60 p-3 rounded-lg border border-slate-800/60">
                  <div>
                    <span className="text-slate-500 text-[10px] block">File Size</span>
                    <span className="text-slate-200 font-bold">
                      {(evd.fileSize / (1024 * 1024)).toFixed(2)} MB
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] block">Container Format</span>
                    <span className="text-slate-200 font-bold">{evd.format}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] block">Audio Codec</span>
                    <span className="text-slate-200 font-bold">{evd.codec}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] block">Duration</span>
                    <span className="text-slate-200 font-bold">{evd.durationSec} sec</span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] block">Sample Rate</span>
                    <span className="text-slate-200 font-bold">{evd.sampleRate} Hz</span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] block">Audio Channels</span>
                    <span className="text-slate-200 font-bold">
                      {evd.channels === 1 ? 'Mono (1)' : 'Stereo (2)'}
                    </span>
                  </div>
                </div>

                {/* SHA-256 Hash Display */}
                <div className="flex items-center gap-2 p-2.5 rounded bg-slate-900 border border-slate-800 text-xs">
                  <Hash className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span className="text-slate-500 shrink-0 text-[11px]">SHA-256:</span>
                  <code className="text-cyan-300 font-mono text-[11px] truncate select-all">
                    {evd.sha256}
                  </code>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
