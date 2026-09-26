import React, { useState } from 'react';
import {
  X,
  UserCheck,
  AlertCircle,
  CheckCircle,
  ShieldCheck,
  Loader2,
} from 'lucide-react';
import type { Finding, AuditResult, ReviewState } from '../types';
import { adjudicateFinding } from '../services/api';

interface AdjudicationModalProps {
  documentId: string;
  finding: Finding | null;
  onClose: () => void;
  onAdjudicated: (updatedResult: AuditResult) => void;
}

export const AdjudicationModal: React.FC<AdjudicationModalProps> = ({
  documentId,
  finding,
  onClose,
  onAdjudicated,
}) => {
  const [reviewState, setReviewState] = useState<ReviewState>('CONFIRMED_DEFECT');
  const [adjudicatorId, setAdjudicatorId] = useState('Chief Regulatory Officer');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!finding) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjudicatorId.trim()) {
      setError('Adjudicator identifier is required.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const updated = await adjudicateFinding(
        documentId,
        finding.finding_id,
        reviewState,
        adjudicatorId.trim(),
        notes.trim()
      );
      onAdjudicated(updated);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Adjudication failed to submit.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-gov-900 border border-slate-700 rounded-lg shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-slate-800 bg-gov-950 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1 bg-amber-950/70 border border-amber-800/80 rounded">
              <UserCheck className="h-4 w-4 text-amber-400" />
            </div>
            <div>
              <h3 className="text-xs font-semibold text-slate-100 uppercase tracking-wider font-mono">
                Official Standards Adjudication
              </h3>
              <p className="text-[11px] text-slate-400">
                Authoritative resolution of uncertain or disputed findings
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          {/* Finding Reference Box */}
          <div className="bg-gov-950 border border-slate-800 rounded p-3 space-y-1.5 font-mono">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-400">Finding ID:</span>
              <span className="text-blue-300 font-semibold">{finding.finding_id}</span>
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-400">Rule Triggered:</span>
              <span className="text-slate-200">{finding.rule_id}</span>
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-400">Entity:</span>
              <span className="text-amber-300">{finding.detected_entity}</span>
            </div>
            {finding.uncertainty_reason && (
              <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-800/80">
                <span className="text-slate-400">Uncertainty Reason:</span>
                <span className="text-purple-300 font-semibold">{finding.uncertainty_reason}</span>
              </div>
            )}
          </div>

          {/* Adjudication Decision Selection */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-medium text-slate-300 uppercase tracking-wider font-mono">
              Adjudication Ruling
            </label>
            <div className="grid grid-cols-1 gap-2">
              <label
                className={`flex items-start gap-2.5 p-2.5 rounded border cursor-pointer transition-colors ${
                  reviewState === 'CONFIRMED_DEFECT'
                    ? 'bg-red-950/40 border-red-700/80 text-red-200'
                    : 'bg-slate-900/40 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <input
                  type="radio"
                  name="reviewState"
                  value="CONFIRMED_DEFECT"
                  checked={reviewState === 'CONFIRMED_DEFECT'}
                  onChange={() => setReviewState('CONFIRMED_DEFECT')}
                  className="mt-0.5"
                />
                <div>
                  <div className="font-semibold text-slate-200 text-xs flex items-center gap-1.5">
                    <AlertCircle className="h-3.5 w-3.5 text-red-400" />
                    CONFIRM DEFECT (VIOLATION)
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5 font-sans">
                    Confirm this finding as an authoritative non-compliance requiring mandatory tender amendment.
                  </div>
                </div>
              </label>

              <label
                className={`flex items-start gap-2.5 p-2.5 rounded border cursor-pointer transition-colors ${
                  reviewState === 'DISMISSED_CONFORMANT'
                    ? 'bg-emerald-950/40 border-emerald-700/80 text-emerald-200'
                    : 'bg-slate-900/40 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <input
                  type="radio"
                  name="reviewState"
                  value="DISMISSED_CONFORMANT"
                  checked={reviewState === 'DISMISSED_CONFORMANT'}
                  onChange={() => setReviewState('DISMISSED_CONFORMANT')}
                  className="mt-0.5"
                />
                <div>
                  <div className="font-semibold text-slate-200 text-xs flex items-center gap-1.5">
                    <CheckCircle className="h-3.5 w-3.5 text-emerald-400" />
                    DISMISS AS CONFORMANT
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5 font-sans">
                    Dismiss finding based on project context, site-specific geotechnical study, or formal dispensation.
                  </div>
                </div>
              </label>

              <label
                className={`flex items-start gap-2.5 p-2.5 rounded border cursor-pointer transition-colors ${
                  reviewState === 'EXCEPTION_RECORDED'
                    ? 'bg-purple-950/40 border-purple-700/80 text-purple-200'
                    : 'bg-slate-900/40 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <input
                  type="radio"
                  name="reviewState"
                  value="EXCEPTION_RECORDED"
                  checked={reviewState === 'EXCEPTION_RECORDED'}
                  onChange={() => setReviewState('EXCEPTION_RECORDED')}
                  className="mt-0.5"
                />
                <div>
                  <div className="font-semibold text-slate-200 text-xs flex items-center gap-1.5">
                    <ShieldCheck className="h-3.5 w-3.5 text-purple-400" />
                    RECORD FORMAL EXCEPTION
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5 font-sans">
                    Acknowledge technical divergence but permit execution under formal statutory executive waiver.
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* Adjudicator ID */}
          <div className="space-y-1">
            <label className="block text-[11px] font-medium text-slate-300 font-mono">
              Adjudicator Credential / Role ID
            </label>
            <input
              type="text"
              value={adjudicatorId}
              onChange={(e) => setAdjudicatorId(e.target.value)}
              className="w-full bg-gov-950 border border-slate-800 focus:border-blue-600 rounded px-3 py-1.5 text-xs text-slate-100 font-mono outline-hidden"
              placeholder="e.g. Chief Regulatory Officer (PWD-048)"
              required
            />
          </div>

          {/* Notes / Rationale */}
          <div className="space-y-1">
            <label className="block text-[11px] font-medium text-slate-300 font-mono">
              Statutory Justification & Engineering Notes
            </label>
            <textarea
              data-testid="adjudication-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full bg-gov-950 border border-slate-800 focus:border-blue-600 rounded p-2.5 text-xs text-slate-100 font-sans outline-hidden resize-none"
              placeholder="Cite relevant gazette notification, chief engineer approval, or technical justification for the record..."
            />
          </div>

          {error && (
            <div className="p-2.5 bg-red-950/60 border border-red-800/80 rounded text-red-300 text-[11px] flex items-center gap-2">
              <AlertCircle className="h-3.5 w-3.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Action buttons */}
          <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-3.5 py-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors"
            >
              Cancel
            </button>
            <button
              data-testid="btn-commit-ruling"
              type="submit"
              onClick={handleSubmit}
              disabled={submitting}
              className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 text-white rounded font-medium text-xs flex items-center gap-1.5 transition-colors font-mono cursor-pointer"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Recording Ruling...
                </>
              ) : (
                'Commit Sovereign Ruling'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
