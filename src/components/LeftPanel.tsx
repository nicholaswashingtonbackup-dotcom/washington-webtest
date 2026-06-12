/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useStore } from '../lib/store';
import { COMPONENT_TEMPLATES } from '../data/templates';
import { Sparkles, Calendar, Plus, Trash2, ArrowLeftRight, HardDriveDownload, AlertOctagon, Undo, Redo, RefreshCw, Layers } from 'lucide-react';
import OneShotGenerator from './OneShotGenerator';

export default function LeftPanel() {
  const { 
    pages, 
    activePageId, 
    projectContext, 
    designTokens, 
    activeLeftTab, 
    setActiveLeftTab, 
    updateProjectContext, 
    updateActivePageCanvas, 
    createHistoryCheckpoint, 
    undo, 
    redo, 
    undoStackSize, 
    redoStackSize,
    timeline,
    activeBranch,
    branches,
    createNewBranch,
    checkoutBranch,
    safetyLogs
  } = useStore();

  const [branchNameInput, setBranchNameInput] = useState('');
  const [showOneShotModal, setShowOneShotModal] = useState(false);

  const activePage = pages.find(p => p.id === activePageId) || pages[0];

  const handleInsertComponent = (templateId: string) => {
    if (!activePage) return;
    const template = COMPONENT_TEMPLATES[templateId];
    if (!template) return;

    // Append component markup to custom html
    const updatedHTML = activePage.html + "\n" + template.html;
    updateActivePageCanvas(updatedHTML);
    createHistoryCheckpoint(`Appended Section: ${template.name}`);
  };

  const handleCreateBranchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!branchNameInput.trim()) return;
    createNewBranch(branchNameInput);
    setBranchNameInput('');
  };

  return (
    <div id="designer-left-sidebar" class="w-80 bg-slate-900 border-r border-slate-800 flex flex-col text-slate-300">
      {/* Tab Selectors */}
      <div class="grid grid-cols-4 border-b border-slate-800 text-center text-xs">
        <button 
          onClick={() => setActiveLeftTab('components')}
          class={`py-3 flex flex-col items-center gap-1.5 font-bold tracking-wider uppercase text-[10px] ${activeLeftTab === 'components' ? 'bg-slate-950 text-indigo-400 border-b-2 border-indigo-500' : 'hover:bg-slate-950 hover:text-slate-200'}`}
        >
          <Plus class="w-4 h-4" />
          Blocks
        </button>
        <button 
          onClick={() => setActiveLeftTab('brief')}
          class={`py-3 flex flex-col items-center gap-1.5 font-bold tracking-wider uppercase text-[10px] ${activeLeftTab === 'brief' ? 'bg-slate-950 text-indigo-400 border-b-2 border-indigo-500' : 'hover:bg-slate-950 hover:text-slate-200'}`}
        >
          <Sparkles class="w-4 h-4" />
          One-Shot
        </button>
        <button 
          onClick={() => setActiveLeftTab('settings')}
          class={`py-3 flex flex-col items-center gap-1.5 font-bold tracking-wider uppercase text-[10px] ${activeLeftTab === 'settings' ? 'bg-slate-950 text-indigo-400 border-b-2 border-indigo-500' : 'hover:bg-slate-950 hover:text-slate-200'}`}
        >
          <Layers class="w-4 h-4" />
          Brief
        </button>
        <button 
          onClick={() => setActiveLeftTab('history')}
          class={`py-3 flex flex-col items-center gap-1.5 font-bold tracking-wider uppercase text-[10px] ${activeLeftTab === 'history' ? 'bg-slate-950 text-indigo-400 border-b-2 border-indigo-500' : 'hover:bg-slate-950 hover:text-slate-200'}`}
        >
          <Calendar class="w-4 h-4" />
          History
        </button>
      </div>

      {/* Panel Inner Scroll frame */}
      <div class="flex-1 overflow-y-auto p-4 space-y-4 scrollbar">

        {/* Components Panel */}
        {activeLeftTab === 'components' && (
          <div class="space-y-4" id="blocks-palette-list">
            <h4 class="text-xs font-bold uppercase text-slate-400 tracking-wider">Visual Grid Sections</h4>
            <div class="grid grid-cols-2 gap-2.5">
              {Object.entries(COMPONENT_TEMPLATES).map(([id, template]) => (
                <button
                  key={id}
                  onClick={() => handleInsertComponent(id)}
                  draggable
                  onDragEnd={() => handleInsertComponent(id)}
                  class="p-2.5 rounded-lg bg-slate-950 border border-slate-850 hover:border-slate-700 hover:bg-slate-900 transition flex flex-col items-start gap-1 cursor-grab active:cursor-grabbing text-left group"
                >
                  <span class="text-xs font-bold text-slate-200 block group-hover:text-indigo-400">{template.name}</span>
                  <span class="text-[9px] text-slate-500 font-mono tracking-wide">{template.category}</span>
                </button>
              ))}
            </div>
            
            <div class="p-3 border border-slate-850 bg-slate-950/20 text-[11px] text-slate-400 rounded-lg leading-relaxed">
              💡 Drag elements, or simply **click** components to append layout nodes directly to the bottom of your live workspace view.
            </div>
          </div>
        )}

        {/* One-Shot Architect Launcher */}
        {activeLeftTab === 'brief' && (
          <div class="space-y-3.5" id="oneshot-dashboard">
            <h4 class="text-xs font-bold uppercase text-slate-400 tracking-wider">Multi-Page Generator</h4>
            <div class="p-4 rounded-xl border border-dashed border-slate-800 bg-slate-950/25 space-y-3 text-center">
              <Sparkles class="w-6 h-6 text-indigo-400 rotate-12 mx-auto animate-pulse" />
              <div class="text-xs font-bold text-slate-200">Reconstruct Whole Website</div>
              <p class="text-[10px] text-slate-400 leading-relaxed">Deletes current sandbox pages and triggers 5-agent routers to design, write, and bundle a coherent brand design structure.</p>
              
              <button 
                onClick={() => setShowOneShotModal(true)}
                class="w-full py-2 bg-gradient-to-r from-indigo-600 to-cyan-500 hover:opacity-90 font-bold rounded-lg text-xs leading-none text-white transition tracking-wide uppercase mt-1"
              >
                Launch Architect Grid
              </button>
            </div>
          </div>
        )}

        {/* Project Context Brief */}
        {activeLeftTab === 'settings' && (
          <div class="space-y-4" id="brief-panel-group">
            <h4 class="text-xs font-bold uppercase text-slate-400 tracking-wider">Agent Memory Brief</h4>
            
            <div class="space-y-3 text-xs">
              <div>
                <label class="text-[9px] text-slate-500 font-bold block mb-1">BUSINESS NAME</label>
                <input 
                  type="text" 
                  value={projectContext.businessName}
                  onChange={(e) => updateProjectContext({ businessName: e.target.value })}
                  class="w-full bg-slate-950 border border-slate-850 rounded px-2.5 py-1.5 text-slate-200 font-semibold"
                />
              </div>

              <div>
                <label class="text-[9px] text-slate-500 font-bold block mb-1">WEBSITE GENRE</label>
                <select 
                  value={projectContext.websiteType}
                  onChange={(e) => updateProjectContext({ websiteType: e.target.value })}
                  class="w-full bg-slate-950 border border-slate-850 rounded px-2.5 py-1.5 text-slate-200"
                >
                  <option value="SaaS Landing Page">SaaS Landing Page</option>
                  <option value="Portfolio Site">Portfolio Site</option>
                  <option value="E-Commerce Hub">E-Commerce Hub</option>
                  <option value="Agency Portfolio">Agency Portfolio</option>
                </select>
              </div>

              <div>
                <label class="text-[9px] text-slate-500 font-bold block mb-1">BRAND TONALITY</label>
                <select 
                  value={projectContext.brandTone}
                  onChange={(e) => updateProjectContext({ brandTone: e.target.value })}
                  class="w-full bg-slate-950 border border-slate-850 rounded px-2.5 py-1.5 text-slate-200"
                >
                  <option value="Professional">Professional & Clean</option>
                  <option value="Bold">Bold & Brutalist</option>
                  <option value="Minimal">Zen Minimalist</option>
                  <option value="Playful">Playful & Dynamic</option>
                </select>
              </div>

              <div>
                <label class="text-[9px] text-slate-500 font-bold block mb-1">TARGET AUDIENCE</label>
                <input 
                  type="text" 
                  value={projectContext.targetAudience}
                  onChange={(e) => updateProjectContext({ targetAudience: e.target.value })}
                  class="w-full bg-slate-950 border border-slate-850 rounded px-2.5 py-1.5 text-slate-200"
                />
              </div>

              <div>
                <label class="text-[9px] text-slate-500 font-bold block mb-1">DESCRIPTION BRIEF</label>
                <textarea 
                  rows={3}
                  value={projectContext.description}
                  onChange={(e) => updateProjectContext({ description: e.target.value })}
                  class="w-full bg-slate-950 border border-slate-850 rounded px-2.5 py-1.5 text-slate-200 leading-normal"
                ></textarea>
              </div>
            </div>
          </div>
        )}

        {/* History / Version Control Panel */}
        {activeLeftTab === 'history' && (
          <div class="space-y-4" id="history-panel-group">
            <div class="flex items-center justify-between">
              <h4 class="text-xs font-bold uppercase text-slate-400 tracking-wider">Revision History</h4>
              
              {/* Basic Undo/Redo Controls */}
              <div class="flex gap-1 bg-slate-950 p-0.5 rounded-md border border-slate-850">
                <button 
                  onClick={undo}
                  disabled={undoStackSize <= 1}
                  class="p-1 hover:bg-slate-900 disabled:opacity-30 rounded text-slate-300 transition"
                  title="Undo Changes"
                >
                  <Undo class="w-3.5 h-3.5" />
                </button>
                <button 
                  onClick={redo}
                  disabled={redoStackSize === 0}
                  class="p-1 hover:bg-slate-900 disabled:opacity-30 rounded text-slate-300 transition"
                  title="Redo Changes"
                >
                  <Redo class="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Branching UI (Section 6) */}
            <div class="p-3 border border-slate-850 bg-slate-950/20 rounded-lg space-y-3 pt-3">
              <div class="flex justify-between items-center text-[10px] text-slate-500 uppercase tracking-wider font-bold">
                <span>Active Branch:</span>
                <span class="text-indigo-400 bg-indigo-950/40 border border-indigo-900 px-2 py-0.5 rounded">{activeBranch}</span>
              </div>

              <form onSubmit={handleCreateBranchSubmit} class="flex gap-2">
                <input 
                  type="text"
                  placeholder="Experiment name"
                  value={branchNameInput}
                  onChange={(e) => setBranchNameInput(e.target.value)}
                  class="flex-1 text-[10px] bg-slate-950 border border-slate-850 rounded px-2 py-1 text-slate-200"
                />
                <button 
                  type="submit"
                  class="bg-indigo-600 hover:bg-indigo-700 text-white px-2.5 py-1 rounded text-[10px] font-semibold transition"
                >
                  Fork
                </button>
              </form>

              {/* Branches toggle items */}
              {branches.length > 1 && (
                <div class="space-y-1">
                  <span class="text-[8px] font-bold text-slate-500 block uppercase">Check out forks:</span>
                  <div class="flex flex-wrap gap-1">
                    {branches.map(b => (
                      <button
                        key={b}
                        onClick={() => checkoutBranch(b)}
                        class={`px-2 py-0.5 rounded text-[9px] font-mono transition ${b === activeBranch ? 'bg-indigo-600 text-white' : 'bg-slate-950 text-slate-400 hover:bg-slate-900'}`}
                      >
                        {b}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Snapshot timeline list */}
            <div>
              <span class="text-[9px] font-bold text-slate-500 block mb-2 uppercase tracking-wider">Historical Timeline</span>
              <div class="border-l-2 border-slate-800 ml-1.5 pl-3.5 space-y-4">
                {timeline.map((snap) => (
                  <div key={snap.id} class="relative text-[11px] group">
                    {/* timeline node bubble */}
                    <div class="absolute w-2.5 h-2.5 rounded-full bg-slate-800 group-hover:bg-indigo-500 -left-[20px] top-1 border border-slate-900 transition-colors" />
                    <div class="font-semibold text-slate-200">{snap.label}</div>
                    <div class="text-[9px] text-slate-500 font-mono mt-0.5">
                      {new Date(snap.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Safety Blocked Inspector Panel (Always available at footer bottom of any left tab) */}
        {safetyLogs.length > 0 && (
          <div class="border-t border-slate-800 pt-3 mt-4 space-y-2">
            <div class="flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider text-amber-500">
              <AlertOctagon class="w-3.5 h-3.5" />
              <span>Canvas Firewall Alerts ({safetyLogs.length})</span>
            </div>
            <div class="max-h-24 overflow-y-auto space-y-1.5 scrollbar">
              {safetyLogs.map((log, idx) => (
                <div key={idx} class="p-2 rounded bg-amber-950/10 border border-amber-950/20 text-[10px] text-amber-300">
                  <div class="font-bold">Blocked: {log.type.toUpperCase()}</div>
                  <div class="opacity-75 italic text-[9px] mt-0.5 truncate">Snippet: {log.original}</div>
                  <div class="opacity-60 text-[8px] font-mono mt-0.5">Reason: {log.reason}</div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* One-Shot Full modal overlay popup */}
      {showOneShotModal && (
        <div class="fixed inset-0 bg-black/75 z-[999] flex items-center justify-center p-4 backdrop-blur-sm">
          <div class="max-w-xl w-full">
            <OneShotGenerator onClose={() => setShowOneShotModal(false)} />
          </div>
        </div>
      )}
    </div>
  );
}
