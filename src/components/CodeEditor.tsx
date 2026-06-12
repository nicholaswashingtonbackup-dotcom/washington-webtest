/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useStore } from '../lib/store';
import { Terminal, Save, CheckCircle, HelpCircle } from 'lucide-react';

export default function CodeEditor() {
  const { pages, activePageId, updateActivePageCanvas, createHistoryCheckpoint } = useStore();
  const activePage = pages.find(p => p.id === activePageId) || pages[0];

  const [codeValue, setCodeValue] = useState('');
  const [successMsg, setSuccessMsg] = useState(false);

  useEffect(() => {
    if (activePage) {
      setCodeValue(activePage.html);
    }
  }, [activePage, activePageId]);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCodeValue(e.target.value);
  };

  const applyChanges = () => {
    if (!activePage) return;
    updateActivePageCanvas(codeValue);
    createHistoryCheckpoint("Direct Code Edit");
    setSuccessMsg(true);
    setTimeout(() => setSuccessMsg(false), 2000);
  };

  return (
    <div id="monaco-code-view-panel" class="h-64 bg-slate-950 border-t border-slate-900 flex flex-col text-xs text-slate-300 font-mono">
      <div class="h-9 bg-slate-900 flex items-center justify-between px-4 border-b border-slate-950">
        <div class="flex items-center gap-1.5 font-bold text-slate-400 text-[10px] uppercase tracking-wider">
          <Terminal class="w-4 h-4 text-violet-400" />
          <span>Active HTML Canvas Source Node</span>
        </div>
        <div class="flex items-center gap-2">
          {successMsg && (
            <span class="text-[10px] text-emerald-400 flex items-center gap-1 animate-pulse">
              <CheckCircle class="w-3 h-3" />
              <span>HTML updated under firewall inspection!</span>
            </span>
          )}
          <button 
            onClick={applyChanges}
            class="px-3 py-1 bg-violet-600 hover:bg-violet-700 text-white rounded font-bold transition flex items-center gap-1 leading-none text-[10px] uppercase"
          >
            <Save class="w-3 h-3" />
            <span>Apply Changes</span>
          </button>
        </div>
      </div>

      <div class="flex-1 flex overflow-hidden">
        {/* Mock line numbers */}
        <div class="w-10 bg-[#0f0f23]/60 text-slate-600 p-2 text-right select-none border-r border-slate-900 leading-relaxed text-[11px] pr-3">
          {Array.from({ length: 30 }).map((_, i) => (
            <div key={i}>{i + 1}</div>
          ))}
        </div>
        
        {/* Core textarea block */}
        <textarea
          value={codeValue}
          onChange={handleTextChange}
          placeholder="<!-- Write standard Tailwind CSS HTML codes here -->"
          class="flex-1 h-full bg-slate-950 border-none outline-none text-slate-200 text-xs p-3 font-mono leading-relaxed resize-none focus:ring-0 focus:border-none focus:outline-none scrollbar"
        />
      </div>
    </div>
  );
}
