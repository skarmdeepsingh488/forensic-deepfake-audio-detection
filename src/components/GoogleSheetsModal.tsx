import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import {
  FileSpreadsheet,
  X,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Loader2,
  LogOut,
  Table,
  Lock,
  Download
} from 'lucide-react';
import {
  googleSignIn,
  logoutGoogle,
  initAuth,
  createForensicSpreadsheetInGoogleDrive,
  listSpreadsheetsFromDrive,
  GoogleSpreadsheetItem
} from '../services/googleSheets';
import { Case, EvidenceMetadata, AnalysisResult, ChainEvent, AuditEntry } from '../types';

interface GoogleSheetsModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeCase: Case | null;
  evidenceList: EvidenceMetadata[];
  analyses: AnalysisResult[];
  chainEvents: ChainEvent[];
  auditLogs: AuditEntry[];
}

export const GoogleSheetsModal: React.FC<GoogleSheetsModalProps> = ({
  isOpen,
  onClose,
  activeCase,
  evidenceList,
  analyses,
  chainEvents,
  auditLogs
}) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Export State
  const [isConfirmingExport, setIsConfirmingExport] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState<{ id: string; url: string } | null>(null);
  const [exportError, setExportError] = useState<string | null>(null);

  // Drive Files
  const [recentSheets, setRecentSheets] = useState<GoogleSpreadsheetItem[]>([]);
  const [isLoadingSheets, setIsLoadingSheets] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const unsubscribe = initAuth(
      (user, token) => {
        setCurrentUser(user);
        setAccessToken(token);
        if (token) {
          fetchRecentDriveSheets(token);
        }
      },
      () => {
        setCurrentUser(null);
        setAccessToken(null);
      }
    );

    return () => unsubscribe();
  }, [isOpen]);

  const fetchRecentDriveSheets = async (token: string) => {
    setIsLoadingSheets(true);
    try {
      const files = await listSpreadsheetsFromDrive(token);
      setRecentSheets(files);
    } catch (err: any) {
      console.warn('Unable to load recent sheets:', err);
    } finally {
      setIsLoadingSheets(false);
    }
  };

  const handleSignIn = async () => {
    setIsLoadingAuth(true);
    setAuthError(null);
    try {
      const result = await googleSignIn();
      if (result) {
        setCurrentUser(result.user);
        setAccessToken(result.accessToken);
        fetchRecentDriveSheets(result.accessToken);
      }
    } catch (err: any) {
      setAuthError(err.message || 'Failed to authenticate with Google Account.');
    } finally {
      setIsLoadingAuth(false);
    }
  };

  const handleSignOut = async () => {
    await logoutGoogle();
    setCurrentUser(null);
    setAccessToken(null);
    setExportSuccess(null);
    setRecentSheets([]);
  };

  const handleInitiateExport = () => {
    setExportError(null);
    setIsConfirmingExport(true);
  };

  const handleConfirmAndExport = async () => {
    if (!accessToken) return;
    setIsConfirmingExport(false);
    setIsExporting(true);
    setExportError(null);

    const caseId = activeCase?.id || 'ALL';
    const caseEvidence = evidenceList.filter((e) => !activeCase || e.caseId === caseId);
    const caseAnalyses = analyses.filter((a) => !activeCase || a.caseId === caseId);
    const caseChain = chainEvents.filter((c) => !activeCase || c.caseId === caseId);
    const caseLogs = auditLogs.filter((l) => !activeCase || l.caseId === caseId);

    try {
      const res = await createForensicSpreadsheetInGoogleDrive(
        accessToken,
        activeCase,
        caseEvidence,
        caseAnalyses,
        caseChain,
        caseLogs
      );

      setExportSuccess({ id: res.spreadsheetId, url: res.spreadsheetUrl });
      fetchRecentDriveSheets(accessToken);
    } catch (err: any) {
      setExportError(err.message || 'Failed to export forensic data to Google Sheets.');
    } finally {
      setIsExporting(false);
    }
  };

  if (!isOpen) return null;

  const caseId = activeCase?.id || 'GLOBAL';
  const targetEvidenceCount = evidenceList.filter((e) => !activeCase || e.caseId === caseId).length;
  const targetAnalysesCount = analyses.filter((a) => !activeCase || a.caseId === caseId).length;
  const targetChainCount = chainEvents.filter((c) => !activeCase || c.caseId === caseId).length;
  const targetAuditCount = auditLogs.filter((l) => !activeCase || l.caseId === caseId).length;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 font-mono">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-2xl shadow-2xl flex flex-col overflow-hidden max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-300">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                Google Sheets Integration
              </h2>
              <p className="text-[10px] text-cyan-400 font-sans mt-0.5">
                Export forensic case telemetry, evidence manifests & audit trails to Google Drive
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          {/* Auth State Box */}
          {!currentUser ? (
            <div className="p-6 bg-black/60 border border-cyan-900/30 rounded-xl text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center mx-auto text-cyan-400">
                <Lock className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                  Authentication Required
                </h3>
                <p className="text-slate-400 text-xs font-sans max-w-md mx-auto">
                  Connect your Google Account to create spreadsheets, export case evidence, and maintain ISO/IEC 27037 compliance records in Google Drive.
                </p>
              </div>

              {authError && (
                <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-800/60 text-rose-300 text-xs flex items-center gap-2 justify-center font-sans">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{authError}</span>
                </div>
              )}

              {/* Official Google Sign In Button */}
              <div className="pt-2 flex justify-center">
                <button
                  onClick={handleSignIn}
                  disabled={isLoadingAuth}
                  className="flex items-center gap-3 px-5 py-2.5 bg-white hover:bg-slate-100 text-slate-800 font-sans font-medium text-xs rounded-lg shadow-md border border-slate-300 transition-all cursor-pointer disabled:opacity-50"
                >
                  <svg className="w-4 h-4" viewBox="0 0 48 48">
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                  </svg>
                  <span>{isLoadingAuth ? 'Connecting Google Account...' : 'Sign in with Google'}</span>
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Account Connected Bar */}
              <div className="p-4 rounded-xl bg-black/60 border border-emerald-900/40 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {currentUser.photoURL ? (
                    <img
                      src={currentUser.photoURL}
                      alt="User avatar"
                      className="w-9 h-9 rounded-full border border-emerald-500/40"
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-emerald-500/20 text-emerald-300 flex items-center justify-center font-bold">
                      {currentUser.email?.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <div className="text-xs font-bold text-slate-200">{currentUser.displayName || 'Google Account'}</div>
                    <div className="text-[10px] text-emerald-400 font-sans">{currentUser.email}</div>
                  </div>
                </div>

                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700 text-[10px] transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" /> Disconnect
                </button>
              </div>

              {/* Export Active Case Card */}
              <div className="p-5 rounded-xl bg-[#080d17] border border-cyan-900/40 space-y-4">
                <div className="flex items-center justify-between border-b border-cyan-900/30 pb-3">
                  <div className="flex items-center gap-2">
                    <Table className="w-4 h-4 text-cyan-400" />
                    <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                      Export Target: Case {caseId}
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] bg-cyan-950 text-cyan-300 border border-cyan-800">
                    5 Worksheets
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="p-3 bg-black/40 rounded border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Evidence Files</span>
                    <span className="text-sm font-bold text-white">{targetEvidenceCount}</span>
                  </div>
                  <div className="p-3 bg-black/40 rounded border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Model Analyses</span>
                    <span className="text-sm font-bold text-cyan-400">{targetAnalysesCount}</span>
                  </div>
                  <div className="p-3 bg-black/40 rounded border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Chain Events</span>
                    <span className="text-sm font-bold text-emerald-400">{targetChainCount}</span>
                  </div>
                  <div className="p-3 bg-black/40 rounded border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Audit Log Rows</span>
                    <span className="text-sm font-bold text-purple-400">{targetAuditCount}</span>
                  </div>
                </div>

                {exportError && (
                  <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-800/60 text-rose-300 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                    <span>{exportError}</span>
                  </div>
                )}

                {/* Confirm Dialog Step */}
                {isConfirmingExport ? (
                  <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-800/60 space-y-3">
                    <div className="flex items-start gap-2 text-amber-300 text-xs">
                      <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                      <div className="font-sans space-y-1">
                        <span className="font-bold font-mono text-amber-200">Confirmation Required</span>
                        <p>
                          Create a new Google Spreadsheet named{' '}
                          <strong className="font-mono text-white">
                            AudioShield_Forensic_Report_{caseId}_...
                          </strong>{' '}
                          in your Google Drive containing {targetEvidenceCount} evidence manifests, {targetAnalysesCount} detection logs, and full audit records?
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-end gap-2 pt-1 font-mono">
                      <button
                        onClick={() => setIsConfirmingExport(false)}
                        className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs border border-slate-700"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleConfirmAndExport}
                        className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs shadow-md"
                      >
                        Yes, Create Spreadsheet
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={handleInitiateExport}
                    disabled={isExporting}
                    className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/50 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {isExporting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Generating & Writing Google Spreadsheet...</span>
                      </>
                    ) : (
                      <>
                        <FileSpreadsheet className="w-4 h-4" />
                        <span>Generate Google Spreadsheet Report</span>
                      </>
                    )}
                  </button>
                )}

                {/* Success Banner */}
                {exportSuccess && (
                  <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-800/60 space-y-2">
                    <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>Spreadsheet Successfully Exported to Google Drive!</span>
                    </div>
                    <p className="text-[11px] text-slate-300 font-sans">
                      Spreadsheet ID: <span className="font-mono text-cyan-300">{exportSuccess.id}</span>
                    </p>
                    <a
                      href={exportSuccess.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500 text-slate-950 font-bold text-xs hover:bg-emerald-400 transition-colors mt-1"
                    >
                      <ExternalLink className="w-3.5 h-3.5" /> Open in Google Sheets
                    </a>
                  </div>
                )}
              </div>

              {/* Recent Drive Spreadsheets */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="font-bold uppercase tracking-wider text-slate-300">
                    Recent Drive Spreadsheets
                  </span>
                  {isLoadingSheets && <Loader2 className="w-3.5 h-3.5 animate-spin text-cyan-400" />}
                </div>

                {recentSheets.length === 0 ? (
                  <div className="p-4 rounded-lg bg-black/40 border border-slate-800 text-center text-slate-500 text-xs font-sans">
                    No recent Google Spreadsheets found in Drive.
                  </div>
                ) : (
                  <div className="space-y-1.5 max-h-40 overflow-y-auto">
                    {recentSheets.slice(0, 5).map((sheet) => (
                      <a
                        key={sheet.id}
                        href={sheet.webViewLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2.5 rounded-lg bg-black/40 border border-slate-800/80 hover:border-cyan-800 flex items-center justify-between text-xs group transition-colors"
                      >
                        <div className="flex items-center gap-2 truncate">
                          <FileSpreadsheet className="w-4 h-4 text-emerald-400 shrink-0" />
                          <span className="text-slate-300 group-hover:text-cyan-300 truncate font-sans">
                            {sheet.name}
                          </span>
                        </div>
                        <ExternalLink className="w-3.5 h-3.5 text-slate-600 group-hover:text-cyan-400 shrink-0" />
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
