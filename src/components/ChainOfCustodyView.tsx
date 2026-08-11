import React, { useState } from 'react';
import { ChainEvent, Case } from '../types';
import { verifyChain } from '../services/api';
import { Link, CheckCircle2, XCircle, ShieldCheck, RefreshCw, Hash, Lock, Clock, User } from 'lucide-react';

interface ChainOfCustodyProps {
  activeCase: Case;
  chainEvents: ChainEvent[];
}

export const ChainOfCustodyView: React.FC<ChainOfCustodyProps> = ({
  activeCase,
  chainEvents
}) => {
  const caseChain = chainEvents.filter((e) => e.caseId === activeCase?.id);

  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<{
    valid: boolean;
    message: string;
  } | null>(null);

  const handleVerifyChain = async () => {
    setIsVerifying(true);
    setVerificationResult(null);

    try {
      const res = await verifyChain(activeCase.id);
      setVerificationResult({
        valid: res.valid,
        message: res.message
      });
    } catch (err: any) {
      setVerificationResult({
        valid: false,
        message: 'Chain verification failed or backend unreachable.'
      });
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto font-mono">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Link className="w-5 h-5 text-cyan-400" /> Cryptographic Chain of Custody Timeline
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Immutable SHA-256 hashed ledger tracking evidence handling, preprocessing, and model inference.
          </p>
        </div>

        <button
          onClick={handleVerifyChain}
          disabled={isVerifying}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-950/50 transition-all shrink-0"
        >
          {isVerifying ? (
            <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
          ) : (
            <ShieldCheck className="w-4 h-4 text-slate-950" />
          )}
          <span>VERIFY CHAIN</span>
        </button>
      </div>

      {/* Verification Result Banner */}
      {verificationResult && (
        <div
          className={`p-4 rounded-xl border text-xs flex items-center gap-3 ${
            verificationResult.valid
              ? 'bg-emerald-950/60 border-emerald-600/80 text-emerald-300'
              : 'bg-rose-950/60 border-rose-600/80 text-rose-300'
          }`}
        >
          {verificationResult.valid ? (
            <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
          ) : (
            <XCircle className="w-6 h-6 text-rose-400 shrink-0" />
          )}
          <div>
            <div className="font-extrabold text-sm uppercase tracking-wider">
              {verificationResult.valid ? 'CHAIN VALID ✓' : 'CHAIN INVALID ✗'}
            </div>
            <p className="text-xs mt-0.5">{verificationResult.message}</p>
          </div>
        </div>
      )}

      {/* Timeline List */}
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800/80 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <Lock className="w-4 h-4 text-emerald-400" /> Chain Ledger for Case: {activeCase?.id}
          </h3>
          <span className="text-xs text-slate-400">Events Recorded: {caseChain.length}</span>
        </div>

        {caseChain.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-xs border border-dashed border-slate-800 rounded-xl">
            No chain events logged for this case yet.
          </div>
        ) : (
          <div className="relative border-l-2 border-cyan-800/60 ml-4 pl-6 space-y-6">
            {caseChain.map((evt, idx) => (
              <div key={evt.id} className="relative group">
                {/* Node Bullet */}
                <div className="absolute -left-[31px] top-1.5 w-3.5 h-3.5 rounded-full bg-cyan-400 border-2 border-slate-950 ring-4 ring-cyan-950/60" />

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-800/80">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-cyan-300">{evt.id}</span>
                      <span className="text-xs font-bold text-slate-100 font-sans">• {evt.operation}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[10px]">
                      <span className="text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-cyan-400" /> {new Date(evt.timestamp).toLocaleString()}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 font-bold">
                        {evt.status}
                      </span>
                    </div>
                  </div>

                  {/* Hashes Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div className="p-2.5 rounded bg-slate-900 border border-slate-800/80 space-y-1">
                      <span className="text-[10px] text-slate-500 flex items-center gap-1">
                        <Hash className="w-3 h-3 text-cyan-400" /> Input Hash
                      </span>
                      <code className="text-cyan-300 text-[10px] block truncate select-all">
                        {evt.inputHash}
                      </code>
                    </div>

                    <div className="p-2.5 rounded bg-slate-900 border border-slate-800/80 space-y-1">
                      <span className="text-[10px] text-slate-500 flex items-center gap-1">
                        <Hash className="w-3 h-3 text-purple-400" /> Output Hash / State Signature
                      </span>
                      <code className="text-purple-300 text-[10px] block truncate select-all">
                        {evt.outputHash}
                      </code>
                    </div>
                  </div>

                  {/* Metadata */}
                  <div className="flex flex-wrap items-center justify-between text-[10px] text-slate-400 pt-1">
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3 text-slate-500" /> Officer: <strong className="text-slate-200">{evt.analyst}</strong>
                    </span>
                    <span>Software: {evt.softwareVersion}</span>
                    <span>Model: {evt.modelVersion}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
