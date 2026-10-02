import type { AuditResult, FlowGraphData, StandardEdition } from '../types';

const getApiBase = (): string => {
  const envUrl = (import.meta.env.VITE_API_BASE_URL || '').trim().replace(/\/+$/, '');
  if (!envUrl) {
    return '/api';
  }
  // Ensure the base URL includes /api so calls like `${API_BASE}/audit` hit `/api/audit`
  return envUrl.endsWith('/api') ? envUrl : `${envUrl}/api`;
};

const API_BASE = getApiBase();

export async function auditTender(
  text: string,
  documentId?: string,
  documentTitle?: string
): Promise<AuditResult> {
  const res = await fetch(`${API_BASE}/audit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      text,
      document_id: documentId,
      document_title: documentTitle,
    }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || `Audit failed with status ${res.status}`);
  }

  return res.json();
}

export async function getAudit(documentId: string): Promise<AuditResult> {
  const res = await fetch(`${API_BASE}/audit/${encodeURIComponent(documentId)}`);
  if (!res.ok) {
    throw new Error(`Document '${documentId}' not found.`);
  }
  return res.json();
}

export async function getStandardsCatalog(status?: string): Promise<StandardEdition[]> {
  const url = status
    ? `${API_BASE}/standards?status=${encodeURIComponent(status)}`
    : `${API_BASE}/standards`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error('Failed to load standards catalog.');
  }
  return res.json();
}

export async function getStandardDetail(isNumber: string): Promise<StandardEdition> {
  const res = await fetch(`${API_BASE}/standards/${encodeURIComponent(isNumber)}`);
  if (!res.ok) {
    throw new Error(`Standard '${isNumber}' not found.`);
  }
  return res.json();
}

export async function getDocumentGraph(documentId: string, depth: number = 2): Promise<FlowGraphData> {
  const res = await fetch(`${API_BASE}/graph/${encodeURIComponent(documentId)}?depth=${depth}`);
  if (!res.ok) {
    throw new Error(`Graph for '${documentId}' not found.`);
  }
  return res.json();
}

export async function adjudicateFinding(
  documentId: string,
  findingId: string,
  reviewState: string,
  adjudicatorId: string,
  adjudicationNotes: string
): Promise<AuditResult> {
  const res = await fetch(`${API_BASE}/audit/${encodeURIComponent(documentId)}/adjudicate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      finding_id: findingId,
      review_state: reviewState,
      adjudicator_id: adjudicatorId,
      adjudication_notes: adjudicationNotes,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Adjudication failed');
  }

  return res.json();
}

export function getDossierPdfUrl(documentId: string): string {
  return `${API_BASE}/dossier/${encodeURIComponent(documentId)}/pdf`;
}

export interface VerificationDetails {
  valid: boolean;
  sha256_digest: string;
  document_id?: string;
  document_title?: string;
  gate_status?: string;
  generated_at?: string;
  findings_count?: number;
  verification_authority?: string;
}

export interface AssistantChatResponse {
  reply: string;
  model_used: string;
  citations: string[];
}

export async function verifyDigest(sha256Digest: string): Promise<VerificationDetails> {
  const res = await fetch(`${API_BASE}/verify/${encodeURIComponent(sha256Digest)}`);
  if (!res.ok) {
    return { valid: false, sha256_digest: sha256Digest };
  }
  return res.json();
}

export async function askAssistant(
  messages: { role: string; content: string }[],
  documentId?: string,
  context?: string
): Promise<AssistantChatResponse> {
  const res = await fetch(`${API_BASE}/assistant/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messages,
      document_id: documentId,
      context,
    }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Procurement Assistant request failed.');
  }

  return res.json();
}

