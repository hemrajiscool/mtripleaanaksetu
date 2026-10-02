import React, { useState } from 'react';
import { X, Send, FileText, AlertCircle } from 'lucide-react';

interface CustomTenderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (text: string, docId?: string, docTitle?: string) => Promise<void>;
  isLoading: boolean;
}

export const CustomTenderModal: React.FC<CustomTenderModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
}) => {
  const [text, setText] = useState('');
  const [docId, setDocId] = useState('');
  const [docTitle, setDocTitle] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) {
      setValidationError('Please enter or paste specification clauses to audit.');
      return;
    }
    setValidationError(null);
    await onSubmit(text, docId || undefined, docTitle || undefined);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-slate-300 rounded-lg max-w-2xl w-full p-6 shadow-xl relative animate-in fade-in zoom-in-95 duration-100">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1 rounded-md hover:bg-slate-100 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center space-x-3 mb-4">
          <div className="h-9 w-9 rounded border border-slate-300 bg-slate-100 flex items-center justify-center text-slate-800">
            <FileText className="h-5 w-5 text-slate-700" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 font-display">
              Audit Custom Tender Specification
            </h3>
            <p className="text-xs text-slate-500 font-sans">
              Submit raw tender clauses for deterministic verification against authoritative BIS standards.
            </p>
          </div>
        </div>

        {validationError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-xs text-red-700 flex items-center space-x-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{validationError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-mono font-medium text-slate-700 uppercase mb-1">
                Document / Tender ID (Optional)
              </label>
              <input
                type="text"
                value={docId}
                onChange={(e) => setDocId(e.target.value)}
                placeholder="e.g. TENDER-NHAI-2026-004"
                className="w-full text-xs font-mono px-3 py-2 border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-slate-800 focus:border-slate-800"
              />
            </div>
            <div>
              <label className="block text-[11px] font-mono font-medium text-slate-700 uppercase mb-1">
                Tender Title (Optional)
              </label>
              <input
                type="text"
                value={docTitle}
                onChange={(e) => setDocTitle(e.target.value)}
                placeholder="e.g. Expressway Rigid Pavement Works"
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-slate-800 focus:border-slate-800"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-mono font-medium text-slate-700 uppercase mb-1">
              Specification Clauses (Raw Tender Text)
            </label>
            <textarea
              rows={8}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={`Clause 4.1: Structural concrete works shall adhere to IS 456:2000...\nClause 4.2: Cement shall be procured exclusively from UltraTech...`}
              className="w-full text-xs font-mono p-3 border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-slate-800 focus:border-slate-800 leading-relaxed resize-y"
            ></textarea>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 border border-slate-200 hover:bg-slate-50 rounded transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isLoading || !text.trim()}
              className="flex items-center space-x-1.5 px-5 py-2 text-xs font-mono font-bold bg-slate-900 hover:bg-black text-white rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-2xs"
            >
              <Send className="h-3.5 w-3.5" />
              <span>{isLoading ? 'EXECUTING AUDIT...' : 'RUN VERIFICATION AUDIT'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
