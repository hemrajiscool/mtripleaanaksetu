import React, { useState } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  Search,
  Copy,
  Check,
  X,
  Lock,
  Loader2,
} from 'lucide-react';
import { verifyDigest, type VerificationDetails } from '../services/api';
import { t, type Language } from '../i18n';

interface VerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  prefillDigest?: string;
}

export const VerificationModal: React.FC<VerificationModalProps> = ({
  isOpen,
  onClose,
  language,
  prefillDigest,
}) => {
  const [digestInput, setDigestInput] = useState(prefillDigest || '');
  const [loading, setLoading] = useState(false);
  const [verificationResult, setVerificationResult] = useState<VerificationDetails | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleVerify = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const query = digestInput.trim();
    if (!query) return;

    setLoading(true);
    setHasSearched(true);
    try {
      const res = await verifyDigest(query);
      setVerificationResult(res);
    } catch {
      setVerificationResult({
        valid: false,
        sha256_digest: query,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white border-2 border-black max-w-xl w-full shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-black text-white px-6 py-4 flex items-center justify-between border-b border-black">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white text-black font-bold flex items-center justify-center font-mono text-sm">
              <Lock className="w-4 h-4 text-black" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base tracking-tight font-serif">
                  MAANAKSETU · {t('verificationTitle', language)}
                </span>
              </div>
              <p className="text-xs text-slate-300 font-sans">
                {t('verificationSubtitle', language)}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-300 hover:text-white p-1 rounded hover:bg-white/10 transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          <form onSubmit={handleVerify} className="space-y-3">
            <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider font-mono">
              {t('enterDigest', language)}
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={digestInput}
                onChange={(e) => setDigestInput(e.target.value)}
                placeholder="Paste 64-character SHA-256 hexadecimal digest..."
                className="flex-1 bg-slate-50 border-2 border-slate-300 focus:border-black text-xs font-mono px-3 py-2 text-slate-900 focus:outline-none"
              />
              <button
                type="submit"
                disabled={loading || !digestInput.trim()}
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-black hover:bg-slate-800 disabled:opacity-50 transition-colors shadow-2xs"
              >
                {loading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Search className="w-3.5 h-3.5" />
                )}
                <span>{t('verifyDigest', language)}</span>
              </button>
            </div>
            <p className="text-[11px] text-slate-500">
              Auditors, bidders, and vigilance officers can verify any dossier SHA-256 hash or document identifier without logging in.
            </p>
          </form>

          {/* Verification Result Display */}
          {hasSearched && (
            <div className="pt-2">
              {verificationResult?.valid ? (
                <div className="border-2 border-emerald-600 bg-emerald-50/40 p-5 space-y-4">
                  <div className="flex items-center justify-between border-b border-emerald-200 pb-3">
                    <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
                      <ShieldCheck className="w-5 h-5 text-emerald-700" />
                      <span>{t('validSeal', language)}</span>
                    </div>
                    <span className="text-[10px] font-mono bg-emerald-700 text-white px-2 py-0.5 rounded font-semibold">
                      AUTHENTIC RECORD
                    </span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="grid grid-cols-3 gap-1">
                      <span className="text-slate-500 font-mono">Document ID:</span>
                      <span className="col-span-2 font-bold text-slate-900 font-mono">
                        {verificationResult.document_id || 'N/A'}
                      </span>
                    </div>
                    {verificationResult.document_title && (
                      <div className="grid grid-cols-3 gap-1">
                        <span className="text-slate-500 font-mono">Tender Title:</span>
                        <span className="col-span-2 text-slate-800 font-medium">
                          {verificationResult.document_title}
                        </span>
                      </div>
                    )}
                    <div className="grid grid-cols-3 gap-1">
                      <span className="text-slate-500 font-mono">Gate Status:</span>
                      <span className="col-span-2">
                        <span className="inline-block px-2 py-0.5 text-[10px] font-mono font-bold bg-white border border-slate-300 text-slate-900">
                          {verificationResult.gate_status}
                        </span>
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-1">
                      <span className="text-slate-500 font-mono">Evaluated At:</span>
                      <span className="col-span-2 text-slate-700 font-mono">
                        {verificationResult.generated_at || 'Gazetted Pipeline'}
                      </span>
                    </div>
                  </div>

                  {/* SHA-256 Digest Box */}
                  <div className="bg-white border border-emerald-300 p-2.5 space-y-1">
                    <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
                      <span>CRYPTOGRAPHIC DIGEST:</span>
                      <button
                        type="button"
                        onClick={() => handleCopy(verificationResult.sha256_digest)}
                        className="inline-flex items-center gap-1 text-slate-700 hover:text-black"
                      >
                        {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                        <span>{copied ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                    <div className="font-mono text-[11px] break-all text-slate-800">
                      {verificationResult.sha256_digest}
                    </div>
                  </div>

                  <div className="text-[10px] text-slate-600 font-sans pt-1">
                    Attestation: Bureau of Indian Standards & Ministry of Finance Sovereign Audit Ledger. This record is immutable and non-repudiable under IT Act 2000 Section 3.
                  </div>
                </div>
              ) : (
                <div className="border-2 border-rose-500 bg-rose-50/50 p-5 space-y-3">
                  <div className="flex items-center gap-2 text-rose-800 font-bold text-sm">
                    <ShieldAlert className="w-5 h-5 text-rose-600" />
                    <span>{t('invalidSeal', language)}</span>
                  </div>
                  <p className="text-xs text-rose-900 leading-relaxed">
                    No verified audit record was found matching this SHA-256 digest in the sovereign ledger. This tender specification may be counterfeit, altered, or has not yet undergone official statutory review.
                  </p>
                  <div className="font-mono text-[11px] bg-white border border-rose-200 p-2 text-slate-700 break-all">
                    Queried: {digestInput}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-100 border-t border-black px-6 py-3 flex items-center justify-between">
          <div className="text-[11px] text-slate-500 font-mono">
            MaanakSetu Cryptographic Ledger
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white border border-slate-300 hover:bg-slate-50"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
