import React, { useState } from 'react';
import { Play } from 'lucide-react';
import { DEMO_TENDERS } from '../data/demos';

interface AuditInputProps {
  onRunAudit: (text: string, docId?: string, docTitle?: string) => Promise<void>;
  isLoading: boolean;
  selectedDemoId?: string;
  onClear: () => void;
}

export const AuditInput: React.FC<AuditInputProps> = ({
  onRunAudit,
  isLoading,
  selectedDemoId,
  onClear,
}) => {
  const currentDemo = DEMO_TENDERS.find((d) => d.id === selectedDemoId);

  const [text, setText] = useState<string>(currentDemo ? currentDemo.text : '');
  const [docId, setDocId] = useState<string>(currentDemo ? currentDemo.id : '');
  const [docTitle, setDocTitle] = useState<string>(currentDemo ? currentDemo.title : '');

  // Keep synced when demo selection changes
  React.useEffect(() => {
    if (currentDemo) {
      setText(currentDemo.text);
      setDocId(currentDemo.id);
      setDocTitle(currentDemo.title);
    }
  }, [selectedDemoId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || isLoading) return;
    onRunAudit(text, docId.trim() || undefined, docTitle.trim() || undefined);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      handleSubmit(e);
    }
  };

  return (
    <div className="bg-gov-900 border border-slate-800 rounded-lg p-5 shadow-sm">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Document Metadata Strip */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <label className="block text-xs font-mono text-slate-400 mb-1">
              DOCUMENT ID / REFERENCE
            </label>
            <input
              type="text"
              value={docId}
              onChange={(e) => setDocId(e.target.value)}
              placeholder="e.g. TND-2026-NHAI-094"
              className="w-full bg-slate-950 border border-slate-700/80 rounded px-3 py-1.5 text-xs font-mono text-slate-200 placeholder-slate-600 focus:outline-none focus:border-blue-500"
            />
          </div>
          <div className="flex-1">
            <label className="block text-xs font-mono text-slate-400 mb-1">
              SPECIFICATION TITLE
            </label>
            <input
              type="text"
              value={docTitle}
              onChange={(e) => setDocTitle(e.target.value)}
              placeholder="e.g. 4-Lane River Crossing Bridge Deck RCC Works"
              className="w-full bg-slate-950 border border-slate-700/80 rounded px-3 py-1.5 text-xs font-sans text-slate-200 placeholder-slate-600 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* Textarea */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="block text-xs font-mono text-slate-400">
              UNSTRUCTURED TENDER CLAUSES / SPECIFICATION TEXT
            </label>
            <span className="text-[11px] text-slate-500 font-mono">
              Press Ctrl+Enter to execute
            </span>
          </div>
          <textarea
            data-testid="audit-input-text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={5}
            placeholder="Paste tender specifications, BOQ clauses, engineering parameters, or standard citations here..."
            className="w-full bg-slate-950 border border-slate-700/80 rounded p-3 text-xs font-mono text-slate-200 placeholder-slate-600 focus:outline-none focus:border-blue-500 leading-relaxed resize-y"
          />
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div className="flex items-center space-x-2 text-xs text-slate-400">
            <span className="font-mono text-slate-500">POLICY:</span>
            <span className="bg-slate-800/90 text-slate-300 px-2 py-0.5 rounded border border-slate-700 text-[11px] font-mono">
              LATEST_ACTIVE_DEFAULT
            </span>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <button
              type="button"
              onClick={() => {
                setText('');
                setDocId('');
                setDocTitle('');
                onClear();
              }}
              className="px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200 border border-slate-700 hover:border-slate-600 rounded bg-slate-800/50 transition-colors cursor-pointer"
            >
              Clear
            </button>
            <button
              type="submit"
              disabled={isLoading || !text.trim()}
              className={`flex items-center space-x-1.5 px-4 py-1.5 text-xs font-medium rounded transition-colors whitespace-nowrap cursor-pointer shrink-0 ${
                isLoading || !text.trim()
                  ? 'bg-blue-900/40 text-blue-400/50 border border-blue-800/30 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-500 text-white border border-blue-500 shadow-sm'
              }`}
            >
              <Play className="h-3.5 w-3.5 fill-current" />
              <span>{isLoading ? 'Verifying Specifications...' : 'Run Sovereign Audit'}</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
