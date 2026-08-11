import React, { useState, useEffect, useRef } from 'react';
import { EvidenceMetadata } from '../types';
import { Activity, Play, Pause, ZoomIn, ZoomOut, RotateCcw, Volume2, ShieldAlert } from 'lucide-react';

interface SpectrogramViewProps {
  evidenceList: EvidenceMetadata[];
  activeEvidenceId?: string;
}

export const SpectrogramView: React.FC<SpectrogramViewProps> = ({
  evidenceList,
  activeEvidenceId
}) => {
  const [selectedId, setSelectedId] = useState<string>(
    activeEvidenceId || evidenceList[0]?.id || ''
  );
  const [isPlaying, setIsPlaying] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [selectedRegion, setSelectedRegion] = useState<{ start: number; end: number } | null>({
    start: 1.2,
    end: 2.8
  });

  const selectedEvidence = evidenceList.find((e) => e.id === selectedId) || evidenceList[0];

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const waveformRef = useRef<HTMLCanvasElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Render simulated high-resolution Mel Spectrogram and Waveform canvas
  useEffect(() => {
    // Render Waveform Canvas
    const waveCanvas = waveformRef.current;
    if (waveCanvas) {
      const ctx = waveCanvas.getContext('2d');
      if (ctx) {
        const width = waveCanvas.width;
        const height = waveCanvas.height;
        ctx.clearRect(0, 0, width, height);

        // Draw background grid
        ctx.strokeStyle = 'rgba(30, 41, 59, 0.6)';
        ctx.lineWidth = 1;
        for (let x = 0; x < width; x += 40 * zoomLevel) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, height);
          ctx.stroke();
        }

        // Draw center axis
        ctx.strokeStyle = 'rgba(51, 65, 85, 0.8)';
        ctx.beginPath();
        ctx.moveTo(0, height / 2);
        ctx.lineTo(width, height / 2);
        ctx.stroke();

        // Draw waveform lines
        ctx.strokeStyle = '#06b6d4';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        const numSamples = Math.floor(width * zoomLevel);
        for (let x = 0; x < width; x++) {
          const t = (x / width) * 10;
          const amp =
            (Math.sin(t * 8) * 0.4 +
              Math.sin(t * 22) * 0.3 +
              Math.cos(t * 45) * 0.2) *
            (height / 2 - 10);
          const y = height / 2 + amp;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();

        // Draw selected region overlay
        if (selectedRegion) {
          const startX = (selectedRegion.start / (selectedEvidence?.durationSec || 5)) * width;
          const endX = (selectedRegion.end / (selectedEvidence?.durationSec || 5)) * width;
          ctx.fillStyle = 'rgba(6, 182, 212, 0.15)';
          ctx.fillRect(startX, 0, endX - startX, height);
          ctx.strokeStyle = '#22d3ee';
          ctx.strokeRect(startX, 0, endX - startX, height);
        }
      }
    }

    // Render Mel Spectrogram Canvas
    const specCanvas = canvasRef.current;
    if (specCanvas) {
      const ctx = specCanvas.getContext('2d');
      if (ctx) {
        const w = specCanvas.width;
        const h = specCanvas.height;
        ctx.clearRect(0, 0, w, h);

        const imgData = ctx.createImageData(w, h);
        const data = imgData.data;

        for (let x = 0; x < w; x++) {
          for (let y = 0; y < h; y++) {
            const index = (y * w + x) * 4;
            const freqNorm = 1 - y / h; // 0 at bottom, 1 at top
            const timeNorm = x / w;

            // Generate synthetic spectrogram intensity with neural vocoder artifacts peak
            let intensity = Math.sin(timeNorm * 15 + freqNorm * 30) * 0.5 + 0.5;
            if (freqNorm > 0.65 && freqNorm < 0.85) {
              intensity += 0.35; // High frequency anomaly band
            }

            intensity = Math.min(1.0, Math.max(0.0, intensity));

            // Thermal / Cyan-purple heatmap colormap
            data[index] = Math.floor(intensity * 180 + 10); // Red
            data[index + 1] = Math.floor(intensity * 220 + 20); // Green
            data[index + 2] = Math.floor(intensity * 255); // Blue
            data[index + 3] = 255; // Alpha
          }
        }
        ctx.putImageData(imgData, 0, 0);

        // Overlay frequency lines
        ctx.fillStyle = '#94a3b8';
        ctx.font = '10px monospace';
        ctx.fillText('8.0 kHz', 10, 15);
        ctx.fillText('4.0 kHz', 10, h / 2);
        ctx.fillText('0.0 kHz', 10, h - 10);
      }
    }
  }, [selectedId, zoomLevel, selectedRegion, selectedEvidence]);

  const handleTogglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play();
        setIsPlaying(true);
      }
    } else {
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto font-mono">
      {/* Hidden audio element if URL exists */}
      {selectedEvidence?.audioUrl && (
        <audio
          ref={audioRef}
          src={selectedEvidence.audioUrl}
          onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
          onEnded={() => setIsPlaying(false)}
        />
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Activity className="w-5 h-5 text-cyan-400" /> High-Resolution Mel Spectrogram & Waveform
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Time-Frequency domain analysis for neural vocoder phase disjunction and spectral mirroring.
          </p>
        </div>

        <select
          value={selectedId}
          onChange={(e) => setSelectedId(e.target.value)}
          className="bg-slate-900 text-slate-200 text-xs py-2 px-3 rounded-xl border border-slate-800 focus:outline-none focus:border-cyan-500"
        >
          {evidenceList.map((e) => (
            <option key={e.id} value={e.id}>
              {e.filename} ({e.id})
            </option>
          ))}
        </select>
      </div>

      {/* Controls Bar */}
      <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-3">
          <button
            onClick={handleTogglePlay}
            className="w-10 h-10 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 flex items-center justify-center font-bold shadow-lg shadow-cyan-950/50"
          >
            {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 pl-0.5" />}
          </button>
          <div>
            <div className="font-bold text-slate-100">{selectedEvidence?.filename || 'No Evidence Selected'}</div>
            <div className="text-[10px] text-slate-400">
              Duration: {selectedEvidence?.durationSec || 0}s • Sample Rate: {selectedEvidence?.sampleRate || 16000}Hz
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setZoomLevel((z) => Math.min(4, z + 0.5))}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => setZoomLevel((z) => Math.max(1, z - 0.5))}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={() => setZoomLevel(1)}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
            title="Reset Zoom"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <span className="text-[11px] text-cyan-400 font-bold px-2">Zoom: {zoomLevel}x</span>
        </div>
      </div>

      {/* Waveform Canvas Panel */}
      <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800/80 space-y-3">
        <div className="flex items-center justify-between text-xs text-slate-400 font-bold">
          <span>Time-Domain Waveform (PCM Amplitude)</span>
          <span className="text-cyan-400">Speech Active Region: 1.2s - 2.8s</span>
        </div>
        <canvas
          ref={waveformRef}
          width={900}
          height={120}
          className="w-full h-32 bg-slate-950 rounded-xl border border-slate-800/80"
        />
      </div>

      {/* Spectrogram Heatmap Panel */}
      <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800/80 space-y-3">
        <div className="flex items-center justify-between text-xs text-slate-400 font-bold">
          <span>Log-Mel Spectrogram (128 Mel Bins, 0–8000 Hz)</span>
          <span className="text-rose-400 flex items-center gap-1">
            <ShieldAlert className="w-3.5 h-3.5" /> High-Frequency Phase Discontinuity Anomaly Band (4–8 kHz)
          </span>
        </div>
        <canvas
          ref={canvasRef}
          width={900}
          height={260}
          className="w-full h-64 bg-slate-950 rounded-xl border border-slate-800/80"
        />
      </div>
    </div>
  );
};
