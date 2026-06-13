/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useStore } from '../lib/store';
import { Code, GitFork, ShieldCheck, Sparkles } from 'lucide-react';

export default function BottomBar() {
  const { pages, activePageId, activeBranch, codeViewOpen, toggleCodeView, sandboxOpen, toggleSandbox, safetyLogs } = useStore();
  const activePage = pages.find(p => p.id === activePageId) || pages[0];
  const charCount = activePage?.html?.length || 0;

  return (
    <div id="designer-lower-status-bar" className="h-9 bg-[#0b0c16] border-t border-slate-900 px-5 flex items-center justify-between text-[11px] text-slate-500 font-mono">
      <div className="flex items-center gap-4">
        {/* Active Branch Display */}
        <span className="flex items-center gap-1.5 text-slate-400">
          <GitFork className="w-3.5 h-3.5 text-indigo-400" />
          <span>Branch: {activeBranch}</span>
        </span>

        {/* Content Length */}
        <span className="hidden sm:block">
          Length: {charCount} glyphs
        </span>

        {/* Status indicator */}
        <span className="hidden md:flex items-center gap-1 text-emerald-400">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Firewall secured ({safetyLogs.length} intercepted logs)</span>
        </span>
      </div>

      <div className="flex items-center gap-3">
        {/* Sandbox widget launcher */}
        <button 
          onClick={toggleSandbox}
          className={`flex items-center gap-1 py-1 px-3 border rounded transition ${sandboxOpen ? 'bg-[#181a3c] text-indigo-300 border-indigo-700' : 'bg-slate-950 border-slate-900 text-slate-400 hover:text-slate-200'}`}
          title="Open AI Agent Sandbox testing ground"
        >
          <Sparkles className="w-3 h-3 text-indigo-400 animate-pulse" />
          <span className="font-bold">🧪 AI Testing Sandbox</span>
        </button>

        {/* Monaco toggle launcher */}
        <button 
          onClick={toggleCodeView}
          className={`flex items-center gap-1 py-1 px-3 border rounded transition ${codeViewOpen ? 'bg-violet-950/40 text-violet-300 border-violet-850' : 'bg-slate-950 border-slate-900 text-slate-400 hover:text-slate-200'}`}
          title="Toggle inline source code viewer"
        >
          <Code className="w-3 h-3" />
          <span>Source Code</span>
        </button>
      </div>
    </div>
  );
}
