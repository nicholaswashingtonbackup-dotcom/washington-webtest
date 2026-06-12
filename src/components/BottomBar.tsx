/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useStore } from '../lib/store';
import { Code, GitFork, ShieldCheck, HelpCircle } from 'lucide-react';

export default function BottomBar() {
  const { pages, activePageId, activeBranch, codeViewOpen, toggleCodeView, safetyLogs } = useStore();
  const activePage = pages.find(p => p.id === activePageId) || pages[0];
  const charCount = activePage?.html?.length || 0;

  return (
    <div id="designer-lower-status-bar" class="h-9 bg-[#0b0c16] border-t border-slate-900 px-5 flex items-center justify-between text-[11px] text-slate-500 font-mono">
      <div class="flex items-center gap-4">
        {/* Active Branch Display */}
        <span class="flex items-center gap-1.5 text-slate-400">
          <GitFork class="w-3.5 h-3.5 text-indigo-400" />
          <span>Branch: {activeBranch}</span>
        </span>

        {/* Content Length */}
        <span class="hidden sm:block">
          Length: {charCount} glyphs
        </span>

        {/* Status indicator */}
        <span class="hidden md:flex items-center gap-1 text-emerald-400">
          <ShieldCheck class="w-3.5 h-3.5" />
          <span>Firewall secured ({safetyLogs.length} intercepted logs)</span>
        </span>
      </div>

      <div class="flex items-center gap-3">
        {/* Monaco toggle launcher */}
        <button 
          onClick={toggleCodeView}
          class={`flex items-center gap-1 py-1 px-3 border rounded transition ${codeViewOpen ? 'bg-violet-950/40 text-violet-300 border-violet-850' : 'bg-slate-950 border-slate-900 text-slate-400 hover:text-slate-200'}`}
          title="Toggle inline source code viewer"
        >
          <Code class="w-3 h-3" />
          <span>Toggle Core Source Code</span>
        </button>
      </div>
    </div>
  );
}
