import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { WorkstationView } from '../types';

interface FooterProps {
  currentView: WorkstationView;
  onNavigatePrev: () => void;
  onNavigateNext: () => void;
  canPrev: boolean;
  canNext: boolean;
  prevLabel: string;
  nextLabel: string;
}

export const Footer: React.FC<FooterProps> = ({
  onNavigatePrev,
  onNavigateNext,
  canPrev,
  canNext,
  prevLabel,
  nextLabel,
}) => {
  return (
    <footer className="mt-auto border-t border-slate-200 bg-white py-2.5 px-4 sm:px-6 lg:px-8 shadow-xs">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono">
        {/* Left: Previous Navigation */}
        <div>
          {canPrev ? (
            <button
              onClick={onNavigatePrev}
              data-testid="footer-btn-prev"
              className="flex items-center space-x-1 text-slate-700 hover:text-slate-950 font-medium px-2.5 py-1 rounded border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>BACK TO {prevLabel}</span>
            </button>
          ) : (
            <span className="text-slate-400 text-[11px]">EXECUTIVE SURFACE</span>
          )}
        </div>

        {/* Center: Keyboard Shortcut Cues & Statutory Authority */}
        <div className="flex flex-col sm:flex-row items-center space-y-1 sm:space-y-0 sm:space-x-4 text-[11px] text-slate-500">
          <div className="flex items-center space-x-2">
            <span className="px-1.5 py-0.5 bg-slate-100 border border-slate-200 rounded font-bold text-slate-700">
              [1-7]
            </span>
            <span>JUMP TO VIEW</span>
            <span className="text-slate-300">·</span>
            <span className="px-1.5 py-0.5 bg-slate-100 border border-slate-200 rounded font-bold text-slate-700">
              [← / →]
            </span>
            <span>TRAVERSE</span>
          </div>
          <span className="hidden md:inline text-slate-300">|</span>
          <span className="hidden md:inline font-sans text-slate-500">
            Bureau of Indian Standards & General Financial Rules 2017 · Official Audit System
          </span>
        </div>

        {/* Right: Next Navigation */}
        <div>
          {canNext ? (
            <button
              onClick={onNavigateNext}
              data-testid="footer-btn-next"
              className="flex items-center space-x-1 text-slate-900 hover:text-black font-bold px-3 py-1 rounded bg-slate-100 hover:bg-slate-200 border border-slate-300 transition-colors cursor-pointer"
            >
              <span>NEXT: {nextLabel}</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          ) : (
            <span className="text-slate-400 text-[11px]">AUDIT DOSSIER</span>
          )}
        </div>
      </div>
    </footer>
  );
};
