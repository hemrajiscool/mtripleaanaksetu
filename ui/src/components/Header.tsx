import React from 'react';
import { Shield, BookOpen } from 'lucide-react';

interface HeaderProps {
  onSelectDemo?: (demoId: string) => void;
  activeDemoId?: string;
  onReset?: () => void;
  onOpenCatalog?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onSelectDemo,
  activeDemoId,
  onReset,
  onOpenCatalog,
}) => {
  return (
    <header className="border-b border-slate-800 bg-gov-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand & Authority */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={onReset}>
            <div className="h-9 w-9 rounded border border-blue-500/40 bg-blue-950/60 flex items-center justify-center text-blue-400 font-bold">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-semibold text-slate-100 tracking-tight text-base font-display">
                  MAANAKSETU
                </span>
                <span className="text-xs font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                  SIH26108
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-sans tracking-wide">
                Bureau of Indian Standards · Sovereign Verification Workstation
              </p>
            </div>
          </div>

          {/* Quick Demo Preseeds */}
          <div className="hidden md:flex items-center space-x-2">
            <span className="text-xs text-slate-400 font-mono mr-1">DEMO BENCHMARKS:</span>
            <button
              data-testid="demo-bridge"
              onClick={() => onSelectDemo?.('DEMO-NHAI-BRIDGE-01')}
              className={`text-xs px-2.5 py-1 rounded border font-mono transition-colors cursor-pointer ${
                activeDemoId === 'DEMO-NHAI-BRIDGE-01'
                  ? 'bg-red-950/60 border-red-500/80 text-red-300 font-medium'
                  : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white'
              }`}
            >
              Bridge (IS 456)
            </button>
            <button
              data-testid="demo-rebar"
              onClick={() => onSelectDemo?.('DEMO-SEISMIC-REBAR-02')}
              className={`text-xs px-2.5 py-1 rounded border font-mono transition-colors cursor-pointer ${
                activeDemoId === 'DEMO-SEISMIC-REBAR-02'
                  ? 'bg-amber-950/60 border-amber-500/80 text-amber-300 font-medium'
                  : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white'
              }`}
            >
              Rebar (IS 1786)
            </button>
            <button
              data-testid="demo-transformer"
              onClick={() => onSelectDemo?.('DEMO-TRANSFORMER-QCO-03')}
              className={`text-xs px-2.5 py-1 rounded border font-mono transition-colors cursor-pointer ${
                activeDemoId === 'DEMO-TRANSFORMER-QCO-03'
                  ? 'bg-purple-950/60 border-purple-500/80 text-purple-300 font-medium'
                  : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white'
              }`}
            >
              Xfmr QCO (IS 1180)
            </button>
          </div>

          {/* Standards Catalog Nav */}
          <div className="flex items-center space-x-3">
            <button
              data-testid="btn-open-catalog"
              onClick={() => onOpenCatalog?.()}
              className="flex items-center space-x-1.5 text-xs text-slate-300 bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded border border-slate-700 transition-colors cursor-pointer"
            >
              <BookOpen className="h-3.5 w-3.5 text-blue-400" />
              <span>Standards Catalog</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
