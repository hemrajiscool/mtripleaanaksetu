import React from 'react';
import { PlusCircle, Loader2 } from 'lucide-react';
import { DEMO_TENDERS } from '../data/demos';

interface CorpusSwitcherProps {
  activeDemoId: string;
  onSelectDemo: (demoId: string) => void;
  onOpenCustomModal: () => void;
  isLoading: boolean;
}

export const CorpusSwitcher: React.FC<CorpusSwitcherProps> = ({
  activeDemoId,
  onSelectDemo,
  onOpenCustomModal,
  isLoading,
}) => {
  return (
    <div className="bg-slate-50 border-b border-slate-200 py-1.5 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div className="flex items-center space-x-2 overflow-x-auto min-w-max">
          <span className="text-[11px] font-mono font-medium text-slate-500 uppercase tracking-wider">
            ACTIVE CORPUS:
          </span>

          <div className="flex items-center space-x-1.5">
            {DEMO_TENDERS.map((demo) => {
              const isSelected = activeDemoId === demo.id;
              return (
                <button
                  key={demo.id}
                  data-testid={`btn-corpus-${demo.name.toLowerCase()}`}
                  onClick={() => onSelectDemo(demo.id)}
                  disabled={isLoading}
                  className={`text-xs px-2.5 py-1 rounded border font-mono transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-slate-900 border-slate-900 text-white font-semibold shadow-2xs'
                      : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                  } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {demo.name}
                </button>
              );
            })}
            {!DEMO_TENDERS.some((d) => d.id === activeDemoId) && activeDemoId && (
              <span className="text-xs px-2.5 py-1 rounded border border-blue-600 bg-blue-50 text-blue-900 font-mono font-semibold shadow-2xs">
                CUSTOM [ACTIVE]
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {isLoading && (
            <div className="flex items-center space-x-1.5 text-xs font-mono text-slate-600 mr-2">
              <Loader2 className="h-3.5 w-3.5 animate-spin text-slate-700" />
              <span>DETERMINISTIC AUDIT RUNNING...</span>
            </div>
          )}

          <button
            data-testid="btn-open-custom-tender"
            onClick={onOpenCustomModal}
            disabled={isLoading}
            className="flex items-center space-x-1.5 text-xs px-3 py-1 rounded bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 font-medium transition-colors shadow-2xs cursor-pointer"
          >
            <PlusCircle className="h-3.5 w-3.5 text-slate-600" />
            <span>AUDIT CUSTOM SPECIFICATION</span>
          </button>
        </div>
      </div>
    </div>
  );
};
