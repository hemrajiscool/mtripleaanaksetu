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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-white border border-slate-300 rounded-lg shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-1 bg-amber-100 border border-amber-300 rounded text-amber-800">
              <UserCheck className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wider font-mono">
                Official Standards Adjudication
              </h3>
              <p className="text-[11px] text-slate-500 font-sans">
                Statutory resolution of uncertain or disputed findings
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          {/* Finding Reference Box */}
          <div className="bg-slate-50 border border-slate-200 rounded p-3 space-y-1.5 font-mono">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-500">Finding ID:</span>
              <span className="text-blue-700 font-semibold">{finding.finding_id}</span>
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-500">Rule Triggered:</span>
              <span className="text-slate-800 font-medium">{finding.rule_id}</span>
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-500">Target Entity:</span>
              <span className="text-amber-800 font-medium">{finding.detected_entity}</span>
            </div>
            {finding.uncertainty_reason && (
              <div className="flex items-center justify-between text-[11px] pt-1.5 border-t border-slate-200">
                <span className="text-slate-500">Uncertainty Reason:</span>
                <span className="text-purple-700 font-semibold">{finding.uncertainty_reason}</span>
              </div>
            )}
          </div>

          {/* Adjudication Decision Selection */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider font-mono">
              Adjudication Ruling
            </label>
            <div className="grid grid-cols-1 gap-2">
              <label
                className={`flex items-start gap-2.5 p-2.5 rounded border cursor-pointer transition-colors ${
                  reviewState === 'CONFIRMED_DEFECT'
                    ? 'bg-red-50 border-red-300 text-red-900 shadow-2xs'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300'
                }`}
              >
                <input
                  type="radio"
                  name="reviewState"
                  value="CONFIRMED_DEFECT"
                  checked={reviewState === 'CONFIRMED_DEFECT'}
                  onChange={() => setReviewState('CONFIRMED_DEFECT')}
                  className="mt-0.5 text-red-600 focus:ring-red-500"
                />
                <div>
                  <div className="font-semibold text-slate-900 text-xs flex items-center gap-1.5 font-mono">
                    <AlertCircle className="h-3.5 w-3.5 text-red-600" />
                    CONFIRM DEFECT (STATUTORY VIOLATION)
                  </div>
                  <div className="text-[11px] text-slate-600 mt-0.5 font-sans">
                    Confirm this finding as an authoritative non-compliance requiring mandatory tender amendment.
                  </div>
                </div>
              </label>

              <label
                className={`flex items-start gap-2.5 p-2.5 rounded border cursor-pointer transition-colors ${
                  reviewState === 'DISMISSED_CONFORMANT'
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-900 shadow-2xs'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300'
                }`}
              >
                <input
                  type="radio"
                  name="reviewState"
                  value="DISMISSED_CONFORMANT"
                  checked={reviewState === 'DISMISSED_CONFORMANT'}
                  onChange={() => setReviewState('DISMISSED_CONFORMANT')}
                  className="mt-0.5 text-emerald-600 focus:ring-emerald-500"
                />
                <div>
                  <div className="font-semibold text-slate-900 text-xs flex items-center gap-1.5 font-mono">
                    <CheckCircle className="h-3.5 w-3.5 text-emerald-600" />
                    DISMISS AS CONFORMANT
                  </div>
                  <div className="text-[11px] text-slate-600 mt-0.5 font-sans">
                    Dismiss finding based on project context, site-specific geotechnical study, or formal dispensation.
                  </div>
                </div>
              </label>

              <label
                className={`flex items-start gap-2.5 p-2.5 rounded border cursor-pointer transition-colors ${
                  reviewState === 'EXCEPTION_RECORDED'
                    ? 'bg-purple-50 border-purple-300 text-purple-900 shadow-2xs'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300'
                }`}
              >
                <input
                  type="radio"
                  name="reviewState"
                  value="EXCEPTION_RECORDED"
                  checked={reviewState === 'EXCEPTION_RECORDED'}
                  onChange={() => setReviewState('EXCEPTION_RECORDED')}
                  className="mt-0.5 text-purple-600 focus:ring-purple-500"
                />
                <div>
                  <div className="font-semibold text-slate-900 text-xs flex items-center gap-1.5 font-mono">
                    <ShieldCheck className="h-3.5 w-3.5 text-purple-600" />
                    RECORD FORMAL EXCEPTION
                  </div>
                  <div className="text-[11px] text-slate-600 mt-0.5 font-sans">
                    Acknowledge technical divergence but permit execution under formal statutory executive waiver.
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* Adjudicator ID */}
          <div className="space-y-1">
            <label className="block text-[11px] font-semibold text-slate-700 font-mono">
              Adjudicator Credential / Role ID
            </label>
            <input
              type="text"
              value={adjudicatorId}
              onChange={(e) => setAdjudicatorId(e.target.value)}
              className="w-full bg-white border border-slate-300 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 rounded px-3 py-1.5 text-xs text-slate-900 font-mono outline-hidden"
              placeholder="e.g. Chief Regulatory Officer (PWD-048)"
              required
            />
          </div>

          {/* Notes / Rationale */}
          <div className="space-y-1">
            <label className="block text-[11px] font-semibold text-slate-700 font-mono">
              Statutory Justification & Engineering Notes
            </label>
            <textarea
              data-testid="adjudication-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full bg-white border border-slate-300 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 rounded p-2.5 text-xs text-slate-900 font-sans outline-hidden resize-none"
              placeholder="Cite relevant gazette notification, chief engineer approval, or technical justification for the record..."
            />
          </div>

          {error && (
            <div className="p-2.5 bg-red-50 border border-red-200 rounded text-red-800 text-[11px] flex items-center gap-2">
              <AlertCircle className="h-3.5 w-3.5 shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          {/* Action buttons */}
          <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-3.5 py-1.5 text-xs text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              data-testid="btn-commit-ruling"
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 text-white rounded font-medium text-xs flex items-center gap-1.5 transition-colors font-mono cursor-pointer shadow-xs"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Recording Ruling...
                </>
              ) : (
                'Commit Statutory Ruling'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
