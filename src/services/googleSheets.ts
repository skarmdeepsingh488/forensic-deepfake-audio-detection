import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  signOut,
  User
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';
import { Case, EvidenceMetadata, AnalysisResult, ChainEvent, AuditEntry } from '../types';

// Initialize Firebase App lazily or safely
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);

const provider = new GoogleAuthProvider();
// Request Google Sheets & Drive scopes
provider.addScope('https://www.googleapis.com/auth/spreadsheets');
provider.addScope('https://www.googleapis.com/auth/drive.file');
provider.addScope('https://www.googleapis.com/auth/drive.readonly');

let isSigningIn = false;
let cachedAccessToken: string | null = null;

export const initAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else if (!isSigningIn) {
        cachedAccessToken = null;
        if (onAuthFailure) onAuthFailure();
      }
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

export const googleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Failed to obtain Google access token from authentication.');
    }

    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error('Google Sign-In Error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const getAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

export const logoutGoogle = async () => {
  await signOut(auth);
  cachedAccessToken = null;
};

export interface GoogleSpreadsheetItem {
  id: string;
  name: string;
  mimeType: string;
  modifiedTime?: string;
  webViewLink?: string;
}

/**
 * List recent spreadsheets from user's Google Drive
 */
export const listSpreadsheetsFromDrive = async (
  accessToken: string
): Promise<GoogleSpreadsheetItem[]> => {
  const query = encodeURIComponent("mimeType='application/vnd.google-apps.spreadsheet' and trashed=false");
  const response = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name,mimeType,modifiedTime,webViewLink)&pageSize=20&orderBy=modifiedTime%20desc`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    }
  );

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Failed to list Google Drive files: ${response.status} ${errText}`);
  }

  const data = await response.json();
  return data.files || [];
};

/**
 * Create a comprehensive multi-tab forensic report in Google Sheets
 */
export const createForensicSpreadsheetInGoogleDrive = async (
  accessToken: string,
  caseObj: Case | null,
  evidenceList: EvidenceMetadata[],
  analyses: AnalysisResult[],
  chainEvents: ChainEvent[],
  auditLogs: AuditEntry[]
): Promise<{ spreadsheetId: string; spreadsheetUrl: string }> => {
  const caseId = caseObj?.id || 'GLOBAL';
  const timestampStr = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const title = `AudioShield_Forensic_Report_${caseId}_${timestampStr}`;

  // 1. Create Spreadsheet with worksheets
  const createRequestBody = {
    properties: {
      title
    },
    sheets: [
      { properties: { title: 'Case Summary' } },
      { properties: { title: 'Evidence Files' } },
      { properties: { title: 'Analysis & Detection' } },
      { properties: { title: 'Chain of Custody' } },
      { properties: { title: 'Audit Trail' } }
    ]
  };

  const createRes = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(createRequestBody)
  });

  if (!createRes.ok) {
    const errJson = await createRes.json().catch(() => ({}));
    throw new Error(errJson?.error?.message || `Failed to create Google Spreadsheet (${createRes.status})`);
  }

  const spreadsheetData = await createRes.json();
  const spreadsheetId = spreadsheetData.spreadsheetId;
  const spreadsheetUrl = spreadsheetData.spreadsheetUrl || `https://docs.google.com/spreadsheets/d/${spreadsheetId}`;

  // 2. Prepare Data Batches
  const caseSummaryRows = [
    ['AUDIOSHIELD FORENSICS — DIGITAL EVIDENCE REPORT'],
    ['Exported At', new Date().toISOString()],
    ['Standard Compliance', 'ISO/IEC 27037:2012 Digital Evidence Handling'],
    ['Framework Version', 'v2.0.4-research (WavLM + AASIST)'],
    [''],
    ['CASE METADATA'],
    ['Case ID', caseObj?.id || 'N/A'],
    ['Case Title', caseObj?.title || 'N/A'],
    ['Investigator ID', caseObj?.investigatorId || 'N/A'],
    ['Status', caseObj?.status || 'N/A'],
    ['Created Date', caseObj?.createdDate || 'N/A'],
    ['Updated Date', caseObj?.updatedDate || 'N/A'],
    ['Description', caseObj?.description || 'N/A']
  ];

  const evidenceRows = [
    ['Evidence ID', 'Filename', 'File Size (Bytes)', 'Duration (Sec)', 'Sample Rate', 'Channels', 'Format', 'Codec', 'Acquisition Time', 'SHA-256 Hash', 'Integrity Status']
  ];
  evidenceList.forEach((e) => {
    evidenceRows.push([
      e.id,
      e.filename,
      String(e.fileSize),
      String(e.durationSec),
      String(e.sampleRate),
      String(e.channels),
      e.format,
      e.codec,
      e.acquisitionTimestamp,
      e.sha256,
      e.integrityStatus
    ]);
  });

  const analysisRows = [
    ['Analysis ID', 'Evidence ID', 'Verdict', 'Calibrated Confidence (%)', 'Raw Score', 'Model Name', 'Model Version', 'Inference Time (ms)', 'Timestamp']
  ];
  analyses.forEach((a) => {
    analysisRows.push([
      a.id,
      a.evidenceId,
      a.verdict,
      `${(a.calibratedConfidence * 100).toFixed(1)}%`,
      a.rawScore.toFixed(4),
      a.modelName,
      a.modelVersion,
      String(a.inferenceTimeMs),
      a.timestamp
    ]);
  });

  const chainRows = [
    ['Event ID', 'Evidence ID', 'Operation', 'Analyst', 'Timestamp', 'Input Hash', 'Output Hash', 'Software Version', 'Model Version', 'Status']
  ];
  chainEvents.forEach((c) => {
    chainRows.push([
      c.id,
      c.evidenceId || 'N/A',
      c.operation,
      c.analyst,
      c.timestamp,
      c.inputHash,
      c.outputHash,
      c.softwareVersion,
      c.modelVersion,
      c.status
    ]);
  });

  const auditRows = [
    ['Log ID', 'Timestamp', 'Analyst', 'Operation', 'Component', 'Status', 'Hash Signature', 'Details']
  ];
  auditLogs.forEach((l) => {
    auditRows.push([
      l.id,
      l.timestamp,
      l.analyst,
      l.operation,
      l.component,
      l.status,
      l.hash,
      l.details || ''
    ]);
  });

  // 3. Batch Update Values
  const valueUpdateBody = {
    valueInputOption: 'USER_ENTERED',
    data: [
      { range: "'Case Summary'!A1", values: caseSummaryRows },
      { range: "'Evidence Files'!A1", values: evidenceRows },
      { range: "'Analysis & Detection'!A1", values: analysisRows },
      { range: "'Chain of Custody'!A1", values: chainRows },
      { range: "'Audit Trail'!A1", values: auditRows }
    ]
  };

  const updateRes = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchUpdate`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(valueUpdateBody)
    }
  );

  if (!updateRes.ok) {
    const updateErr = await updateRes.json().catch(() => ({}));
    throw new Error(updateErr?.error?.message || `Failed to populate spreadsheet cells (${updateRes.status})`);
  }

  return { spreadsheetId, spreadsheetUrl };
};
