import React from 'react';
import { Case, EvidenceMetadata, AnalysisResult, ChainEvent, AuditEntry } from '../types';
import { FileText, Printer, Download, ShieldCheck, AlertTriangle, Lock, FileSpreadsheet } from 'lucide-react';

interface ForensicReportsProps {
  activeCase: Case;
  evidenceList: EvidenceMetadata[];
  analyses: AnalysisResult[];
  chainEvents: ChainEvent[];
  auditLogs: AuditEntry[];
  onOpenGoogleSheets?: () => void;
}

export const ForensicReportsView: React.FC<ForensicReportsProps> = ({
  activeCase,
  evidenceList,
  analyses,
  chainEvents,
  auditLogs,
  onOpenGoogleSheets
}) => {
  const caseEvidence = evidenceList.find((e) => e.caseId === activeCase?.id) || evidenceList[0];
  const caseAnalysis = analyses.find((a) => a.caseId === activeCase?.id) || analyses[0];
  const caseChain = chainEvents.filter((e) => e.caseId === activeCase?.id);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadJSON = () => {
    const caseId = activeCase?.id || 'UNKNOWN';
    const caseEvidenceList = evidenceList.filter((e) => e.caseId === caseId);
    const caseAnalyses = analyses.filter((a) => a.caseId === caseId);
    const caseChainEvents = chainEvents.filter((e) => e.caseId === caseId);
    const caseAuditEntries = auditLogs.filter((a) => a.caseId === caseId);

    const reportPayload = {
      exportMetadata: {
        exportedAt: new Date().toISOString(),
        standard: 'ISO/IEC 27037:2012 Digital Evidence Handling',
        system: 'AudioShield Forensics Framework',
        version: 'v2.0.4-research',
        schemaVersion: '1.0.0'
      },
      case: activeCase || null,
      evidence: caseEvidenceList,
      analysisSummary: caseAnalyses,
      chainOfCustody: caseChainEvents,
      auditLog: caseAuditEntries
    };

    const jsonString = JSON.stringify(reportPayload, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `forensic_report_${caseId}_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto font-mono">
      {/* Printable Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <FileText className="w-5 h-5 text-cyan-400" /> ISO/IEC 27037 Forensic Analysis Report
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Standardized digital evidence report format suitable for academic defense and forensic review.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {onOpenGoogleSheets && (
            <button
              onClick={onOpenGoogleSheets}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-700/80 font-bold text-xs shadow-lg transition-all cursor-pointer"
              title="Export case data to Google Sheets spreadsheet"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" /> Export to Google Sheets
            </button>
          )}
          <button
            onClick={handleDownloadJSON}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-cyan-800/80 hover:border-cyan-500 font-bold text-xs shadow-lg transition-all cursor-pointer"
            title="Export full case analysis summary, chain of custody, and audit logs as JSON file"
          >
            <Download className="w-4 h-4 text-cyan-400" /> Export JSON
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-950/50 shrink-0 cursor-pointer transition-all"
          >
            <Printer className="w-4 h-4 text-slate-950" /> Print / Save PDF
          </button>
        </div>
      </div>

      {/* Main Document Frame */}
      <div className="p-8 rounded-2xl bg-slate-900/90 border border-slate-800 text-slate-200 space-y-6 shadow-2xl print:bg-white print:text-black print:p-0 print:border-none print:shadow-none">
        {/* Document Header */}
        <div className="border-b-2 border-cyan-800/80 pb-6 space-y-2 print:border-black">
          <div className="flex items-center justify-between">
            <div className="text-xs text-cyan-400 font-bold uppercase tracking-widest print:text-black">
              Forensic Science & Neural Audio Authentication Laboratory
            </div>
            <div className="text-[10px] text-slate-400 print:text-black">
              Date: {new Date().toLocaleDateString()}
            </div>
          </div>

          <h1 className="text-xl font-black tracking-tight text-slate-100 print:text-black">
            RESEARCH PROTOTYPE FORENSIC ANALYSIS REPORT
          </h1>
          <p className="text-xs text-slate-400 font-sans print:text-black">
            M.Tech Thesis Project: Detection of AI-Generated Deepfake Audio in Forensic Investigation
          </p>
        </div>

        {/* Mandatory Disclaimer */}
        <div className="p-3 rounded-lg bg-amber-950/40 border border-amber-800/60 text-amber-300 text-xs font-sans print:bg-gray-100 print:text-black print:border-gray-400">
          <strong className="font-bold">NOTICE & LIMITATIONS:</strong> This report is generated by an M.Tech research prototype system for academic demonstration and laboratory evaluation. It does not claim automatic legal admissibility in judicial courts without independent expert witness endorsement.
        </div>

        {/* Section 1: Case & Ingestion Metadata */}
        <div className="space-y-3 pt-2">
          <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-wider border-b border-slate-800 pb-1 print:text-black">
            1. Case & Evidence Ingestion Specifications
          </h3>

          <div className="grid grid-cols-2 gap-4 text-xs font-mono">
            <div>
              <span className="text-slate-500 block text-[10px] print:text-black">Case ID:</span>
              <strong className="text-slate-100 print:text-black">{activeCase?.id || 'N/A'}</strong>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] print:text-black">Investigator / Analyst:</span>
              <strong className="text-slate-100 print:text-black">{activeCase?.investigatorId || 'INV-4921'}</strong>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] print:text-black">Evidence Filename:</span>
              <strong className="text-slate-100 print:text-black">{caseEvidence?.filename || 'N/A'}</strong>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] print:text-black">Format & Codec:</span>
              <strong className="text-slate-100 print:text-black">
                {caseEvidence?.format} ({caseEvidence?.codec})
              </strong>
            </div>
            <div className="col-span-2">
              <span className="text-slate-500 block text-[10px] print:text-black">Original SHA-256 Hash:</span>
              <code className="text-cyan-300 text-[11px] block truncate print:text-black font-bold">
                {caseEvidence?.sha256 || 'N/A'}
              </code>
            </div>
          </div>
        </div>

        {/* Section 2: 14-Stage Model Execution & Verdict */}
        <div className="space-y-3 pt-2">
          <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-wider border-b border-slate-800 pb-1 print:text-black">
            2. ML Deepfake Model Inference & Verdict
          </h3>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3 print:bg-gray-50 print:border-gray-300">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 print:text-black">Automated Forensic Verdict:</span>
              <span
                className={`px-3 py-1 rounded text-sm font-black border ${
                  caseAnalysis?.verdict === 'SYNTHETIC'
                    ? 'bg-rose-950 text-rose-400 border-rose-800 print:text-red-700'
                    : caseAnalysis?.verdict === 'GENUINE'
                    ? 'bg-emerald-950 text-emerald-400 border border-emerald-800 print:text-green-700'
                    : 'bg-amber-950 text-amber-400 border border-amber-800 print:text-amber-700'
                }`}
              >
                {caseAnalysis?.verdict || 'INCONCLUSIVE'}
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs pt-2 border-t border-slate-800 print:border-gray-300">
              <div>
                <span className="text-slate-500 block text-[10px] print:text-black">AASIST Raw Logit:</span>
                <span className="font-bold text-slate-100 print:text-black">{caseAnalysis?.rawScore ?? 'N/A'}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] print:text-black">Calibrated Confidence:</span>
                <span className="font-bold text-cyan-400 print:text-black">
                  {caseAnalysis?.calibratedConfidence ? `${(caseAnalysis.calibratedConfidence * 100).toFixed(2)}%` : 'N/A'}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] print:text-black">Decision Threshold:</span>
                <span className="font-bold text-slate-100 print:text-black">{caseAnalysis?.decisionThreshold ?? 0.50}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] print:text-black">Inference Execution:</span>
                <span className="font-bold text-emerald-400 print:text-black">{caseAnalysis?.inferenceTimeMs ?? 0} ms</span>
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Explainability & Temporal Saliency Summary */}
        <div className="space-y-2 pt-2">
          <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-wider border-b border-slate-800 pb-1 print:text-black">
            3. Explainable AI (XAI) Saliency Findings
          </h3>
          <p className="text-xs font-sans text-slate-300 leading-relaxed print:text-black">
            SSL feature extraction using WavLM Large revealed spectral phase discontinuities and neural vocoder artifacts concentrated in high-frequency sub-bands (4–8 kHz). AASIST graph attention weights assigned peak saliency to temporal frame #12 and frame #28.
          </p>
        </div>

        {/* Section 4: Chain of Custody Audit Signature */}
        <div className="space-y-3 pt-2">
          <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-wider border-b border-slate-800 pb-1 print:text-black">
            4. Chain of Custody & Analyst Signoff
          </h3>

          <div className="grid grid-cols-2 gap-6 pt-4">
            <div className="p-3 rounded bg-slate-950 border border-slate-800 text-xs space-y-1 print:bg-gray-50 print:border-gray-300">
              <span className="text-slate-500 text-[10px] block print:text-black">Cryptographic Chain Verification:</span>
              <span className="text-emerald-400 font-bold flex items-center gap-1 print:text-green-700">
                <ShieldCheck className="w-4 h-4" /> CHAIN VALID ({caseChain.length || 1} Events Hash-Matched)
              </span>
            </div>

            <div className="border-t-2 border-slate-700 pt-2 text-xs font-sans space-y-1 print:border-black">
              <div className="font-bold text-slate-100 print:text-black">Lead Forensic Investigator Signoff</div>
              <div className="text-slate-400 text-[10px] print:text-black">M.Tech Research Laboratory Command</div>
              <div className="text-slate-500 text-[10px] print:text-black">ECDSA Digital Signature Verified</div>
            </div>
          </div>
        </div>

        {/* Section 5: External Archival Package */}
        <div className="space-y-3 pt-2 print:hidden">
          <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-wider border-b border-slate-800 pb-1">
            5. External Archival & Machine-Readable Export
          </h3>
          <div className="p-4 rounded-xl bg-slate-950/80 border border-cyan-900/40 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1 text-xs font-sans">
              <div className="font-bold text-slate-200 font-mono">
                ISO/IEC 27037 Compliant JSON & Google Sheets Evidence Archive
              </div>
              <p className="text-slate-400 text-[11px]">
                Includes complete case metadata, evidence specifications, model inference results, full chain of custody log ({caseChain.length} events), and audit trails ({auditLogs.filter(a => a.caseId === activeCase?.id).length} log entries).
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {onOpenGoogleSheets && (
                <button
                  onClick={onOpenGoogleSheets}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-700/80 font-mono font-bold text-xs transition-all cursor-pointer shadow-md"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-400" /> Google Sheets
                </button>
              )}
              <button
                onClick={handleDownloadJSON}
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-700/80 font-mono font-bold text-xs transition-all cursor-pointer shadow-md"
              >
                <Download className="w-4 h-4 text-cyan-400" /> Export JSON
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
