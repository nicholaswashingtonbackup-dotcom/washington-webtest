/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useStore } from '../lib/store';
import { COMPONENT_TEMPLATES } from '../data/templates';
import { Sparkles, Calendar, Plus, Trash2, ArrowLeftRight, HardDriveDownload, AlertOctagon, Undo, Redo, RefreshCw, Layers, Folder, Settings, Key, Cpu, Monitor, Volume2, Database, Eye, EyeOff, Save } from 'lucide-react';
import OneShotGenerator from './OneShotGenerator';
import AssetManager from './AssetManager';

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
    safetyLogs,
    // Module 5 States
    llmProvider,
    setLlmProvider,
    openRouterKey,
    setOpenRouterKey,
    selectedModel,
    setSelectedModel,
    tokenUsage,
    estimatedCost,
    resetTokenUsage,
    isFullscreen,
    setIsFullscreen,
    isElectronMode,
    setElectronMode,
    autoSave,
    setAutoSave,
    voiceActive,
    setVoiceActive,
    availableModels
  } = useStore();

  const [branchNameInput, setBranchNameInput] = useState('');
  const [showOneShotModal, setShowOneShotModal] = useState(false);
  const [settingsSubTab, setSettingsSubTab] = useState<'brief' | 'engine' | 'shell'>('brief');
  const [showAPIKey, setShowAPIKey] = useState(false);

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
    <div id="designer-left-sidebar" className="w-80 bg-slate-900 border-r border-slate-800 flex flex-col text-slate-300">
      {/* Tab Selectors */}
      <div className="grid grid-cols-5 border-b border-slate-800 text-center text-xs">
        <button 
          onClick={() => setActiveLeftTab('components')}
          className={`py-3 flex flex-col items-center gap-1.5 font-bold tracking-wider uppercase text-[9px] ${activeLeftTab === 'components' ? 'bg-slate-950 text-indigo-400 border-b-2 border-indigo-500' : 'hover:bg-slate-950 hover:text-slate-200'}`}
        >
          <Plus className="w-3.5 h-3.5" />
          Blocks
        </button>
        <button 
          onClick={() => setActiveLeftTab('media')}
          className={`py-3 flex flex-col items-center gap-1.5 font-bold tracking-wider uppercase text-[9px] ${activeLeftTab === 'media' ? 'bg-slate-950 text-indigo-400 border-b-2 border-indigo-500' : 'hover:bg-slate-950 hover:text-slate-200'}`}
        >
          <Folder className="w-3.5 h-3.5" />
          Media
        </button>
        <button 
          onClick={() => setActiveLeftTab('brief')}
          className={`py-3 flex flex-col items-center gap-1.5 font-bold tracking-wider uppercase text-[9px] ${activeLeftTab === 'brief' ? 'bg-slate-950 text-indigo-400 border-b-2 border-indigo-500' : 'hover:bg-slate-950 hover:text-slate-200'}`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          One-Shot
        </button>
        <button 
          onClick={() => setActiveLeftTab('settings')}
          className={`py-3 flex flex-col items-center gap-1.5 font-bold tracking-wider uppercase text-[9px] ${activeLeftTab === 'settings' ? 'bg-slate-950 text-indigo-400 border-b-2 border-indigo-500' : 'hover:bg-slate-950 hover:text-slate-200'}`}
        >
          <Settings className="w-3.5 h-3.5" />
          Settings
        </button>
        <button 
          onClick={() => setActiveLeftTab('history')}
          className={`py-3 flex flex-col items-center gap-1.5 font-bold tracking-wider uppercase text-[9px] ${activeLeftTab === 'history' ? 'bg-slate-950 text-indigo-400 border-b-2 border-indigo-500' : 'hover:bg-slate-950 hover:text-slate-200'}`}
        >
          <Calendar className="w-3.5 h-3.5" />
          History
        </button>
      </div>

      {/* Panel Inner Scroll frame */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar">

        {/* Media Manager Panel */}
        {activeLeftTab === 'media' && (
          <AssetManager />
        )}

        {/* Components Panel */}
        {activeLeftTab === 'components' && (
          <div className="space-y-4" id="blocks-palette-list">
            <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider">Visual Grid Sections</h4>
            <div className="grid grid-cols-2 gap-2.5">
              {Object.entries(COMPONENT_TEMPLATES).map(([id, template]) => (
                <button
                  key={id}
                  onClick={() => handleInsertComponent(id)}
                  draggable
                  onDragEnd={() => handleInsertComponent(id)}
                  className="p-2.5 rounded-lg bg-slate-950 border border-slate-850 hover:border-slate-700 hover:bg-slate-900 transition flex flex-col items-start gap-1 cursor-grab active:cursor-grabbing text-left group"
                >
                  <span className="text-xs font-bold text-slate-200 block group-hover:text-indigo-400">{template.name}</span>
                  <span className="text-[9px] text-slate-500 font-mono tracking-wide">{template.category}</span>
                </button>
              ))}
            </div>
            
            <div className="p-3 border border-slate-850 bg-slate-950/20 text-[11px] text-slate-400 rounded-lg leading-relaxed">
              💡 Drag elements, or simply **click** components to append layout nodes directly to the bottom of your live workspace view.
            </div>
          </div>
        )}

        {/* One-Shot Architect Launcher */}
        {activeLeftTab === 'brief' && (
          <div className="space-y-3.5" id="oneshot-dashboard">
            <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider">Multi-Page Generator</h4>
            <div className="p-4 rounded-xl border border-dashed border-slate-800 bg-slate-950/25 space-y-3 text-center">
              <Sparkles className="w-6 h-6 text-indigo-400 rotate-12 mx-auto animate-pulse" />
              <div className="text-xs font-bold text-slate-200">Reconstruct Whole Website</div>
              <p className="text-[10px] text-slate-400 leading-relaxed">Deletes current sandbox pages and triggers 5-agent routers to design, write, and bundle a coherent brand design structure.</p>
              
              <button 
                onClick={() => setShowOneShotModal(true)}
                className="w-full py-2 bg-gradient-to-r from-indigo-600 to-cyan-500 hover:opacity-90 font-bold rounded-lg text-xs leading-none text-white transition tracking-wide uppercase mt-1"
              >
                Launch Architect Grid
              </button>
            </div>
          </div>
        )}

        {/* Project Context Brief */}
        {activeLeftTab === 'settings' && (
          <div className="space-y-4" id="brief-panel-group">
            {/* Sub-Tab Navigation Bar */}
            <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-850 text-[10px] font-bold">
              <button 
                onClick={() => setSettingsSubTab('brief')}
                className={`flex-1 py-1.5 text-center rounded transition uppercase ${settingsSubTab === 'brief' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
              >
                Brief
              </button>
              <button 
                onClick={() => setSettingsSubTab('engine')}
                className={`flex-1 py-1.5 text-center rounded transition uppercase ${settingsSubTab === 'engine' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
              >
                AI Engine
              </button>
              <button 
                onClick={() => setSettingsSubTab('shell')}
                className={`flex-1 py-1.5 text-center rounded transition uppercase ${settingsSubTab === 'shell' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
              >
                Core Shell
              </button>
            </div>

            {/* Sub-Tab CONTENT: BRIEF */}
            {settingsSubTab === 'brief' && (
              <div className="space-y-3 text-xs animate-fade-in">
                <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase text-slate-400 tracking-wider">
                  <Layers className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Agent Memory Brief</span>
                </div>

                <div>
                  <label className="text-[9px] text-slate-500 font-bold block mb-1">BUSINESS NAME</label>
                  <input 
                    type="text" 
                    value={projectContext.businessName}
                    onChange={(e) => updateProjectContext({ businessName: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-850 rounded px-2.5 py-1.5 text-slate-200 font-semibold focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-[9px] text-slate-500 font-bold block mb-1">WEBSITE GENRE</label>
                  <select 
                    value={projectContext.websiteType}
                    onChange={(e) => updateProjectContext({ websiteType: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-850 rounded px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="SaaS Landing Page">SaaS Landing Page</option>
                    <option value="Portfolio Site">Portfolio Site</option>
                    <option value="E-Commerce Hub">E-Commerce Hub</option>
                    <option value="Agency Portfolio">Agency Portfolio</option>
                  </select>
                </div>

                <div>
                  <label className="text-[9px] text-slate-500 font-bold block mb-1">BRAND TONALITY</label>
                  <select 
                    value={projectContext.brandTone}
                    onChange={(e) => updateProjectContext({ brandTone: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-850 rounded px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Professional">Professional & Clean</option>
                    <option value="Bold">Bold & Brutalist</option>
                    <option value="Minimal">Zen Minimalist</option>
                    <option value="Playful">Playful & Dynamic</option>
                  </select>
                </div>

                <div>
                  <label className="text-[9px] text-slate-500 font-bold block mb-1">TARGET AUDIENCE</label>
                  <input 
                    type="text" 
                    value={projectContext.targetAudience}
                    onChange={(e) => updateProjectContext({ targetAudience: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-850 rounded px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-[9px] text-slate-500 font-bold block mb-1">DESCRIPTION BRIEF</label>
                  <textarea 
                    rows={3}
                    value={projectContext.description}
                    onChange={(e) => updateProjectContext({ description: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-850 rounded px-2.5 py-1.5 text-slate-200 leading-normal focus:outline-none focus:border-indigo-500"
                  ></textarea>
                </div>
              </div>
            )}

            {/* Sub-Tab CONTENT: ENGINE */}
            {settingsSubTab === 'engine' && (
              <div className="space-y-3.5 text-xs animate-fade-in">
                <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase text-slate-400 tracking-wider">
                  <Cpu className="w-3.5 h-3.5 text-indigo-400" />
                  <span>AI Model Infrastructure</span>
                </div>

                <div>
                  <label className="text-[9px] text-slate-500 font-bold block mb-1">AI PROVIDER</label>
                  <select 
                    value={llmProvider}
                    onChange={(e) => setLlmProvider(e.target.value as 'ollama' | 'openrouter')}
                    className="w-full bg-slate-950 border border-slate-850 rounded px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-indigo-500 font-semibold"
                  >
                    <option value="ollama">Ollama (Offline/Localhost)</option>
                    <option value="openrouter">OpenRouter (Cloud Fallback)</option>
                  </select>
                </div>

                {llmProvider === 'ollama' ? (
                  <div>
                    <label className="text-[9px] text-slate-500 font-bold block mb-1">LOCAL MODEL</label>
                    <select 
                      value={selectedModel}
                      onChange={(e) => setSelectedModel(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-850 rounded px-2.5 py-1.5 text-[11px] text-emerald-400 font-mono focus:outline-none focus:border-indigo-500"
                    >
                      {availableModels.length > 0 ? (
                        availableModels.map(m => (
                          <option key={m} value={m}>{m}</option>
                        ))
                      ) : (
                        <>
                          <option value="llama3.1:latest">llama3.1:latest</option>
                          <option value="mistral:latest">mistral:latest</option>
                          <option value="codegemma:latest">codegemma:latest</option>
                        </>
                      )}
                    </select>
                    <p className="text-[9px] text-slate-500 mt-1 leading-normal italic">
                      Verify that your Ollama server is active on <span className="text-indigo-400 font-mono">11434</span>. SiteForge binds automatically.
                    </p>
                  </div>
                ) : (
                  <>
                    <div>
                      <label className="text-[9px] text-slate-500 font-bold block mb-1">OPENROUTER ARCHITECTURE MODEL</label>
                      <select 
                        value={selectedModel}
                        onChange={(e) => setSelectedModel(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-850 rounded px-2.5 py-1.5 text-[11px] text-indigo-300 font-mono focus:outline-none focus:border-indigo-500"
                      >
                        <option value="meta-llama/llama-3.1-70b-instruct">meta-llama/llama-3.1-70b</option>
                        <option value="google/gemini-2.5-pro">google/gemini-2.5-pro</option>
                        <option value="google/gemini-2.0-flash-exp">google/gemini-2.0-flash</option>
                        <option value="anthropic/claude-3.5-sonnet">claude-3.5-sonnet</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[9px] text-slate-500 font-bold block mb-1">OPENROUTER API KEY</label>
                      <div className="relative">
                        <input 
                          type={showAPIKey ? "text" : "password"}
                          value={openRouterKey}
                          placeholder="sk-or-v1-..."
                          onChange={(e) => setOpenRouterKey(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-850 rounded pl-2.5 pr-8 py-1.5 text-xs text-amber-500 font-mono focus:outline-none focus:border-indigo-500 placeholder-slate-700"
                        />
                        <button 
                          type="button"
                          onClick={() => setShowAPIKey(!showAPIKey)}
                          className="absolute right-2 top-2 text-slate-500 hover:text-slate-300 transition"
                        >
                          {showAPIKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                      <p className="text-[9px] text-slate-500 mt-1 leading-normal">
                        Your private endpoint keys are stored securely inside client IndexedDB/Zustand scopes. No telemetry is shared.
                      </p>
                    </div>
                  </>
                )}

                {/* Audit and Costs */}
                <div className="p-3 bg-slate-950 border border-slate-850 rounded-lg space-y-2.5">
                  <div className="text-[9px] font-bold text-slate-500 uppercase flex items-center justify-between">
                    <span>Token Wallet Metrics</span>
                    <button 
                      onClick={resetTokenUsage}
                      className="text-[8px] px-1.5 py-0.5 bg-slate-900 border border-slate-800 rounded hover:text-rose-400 transition font-mono uppercase"
                    >
                      Reset Usage
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-center">
                    <div className="bg-slate-900/60 p-2 rounded border border-slate-850/50">
                      <span className="text-[9px] text-slate-500 block uppercase font-mono">TOKENS SPENT</span>
                      <span className="text-xs font-black text-indigo-400 font-mono">{tokenUsage.toLocaleString()}</span>
                    </div>
                    <div className="bg-slate-900/60 p-2 rounded border border-slate-850/50">
                      <span className="text-[9px] text-slate-500 block uppercase font-mono">ESTIMATED COST</span>
                      <span className="text-xs font-black text-amber-400 font-mono">${estimatedCost.toFixed(5)}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Sub-Tab CONTENT: CORE / SHELL */}
            {settingsSubTab === 'shell' && (
              <div className="space-y-4 text-xs animate-fade-in">
                <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase text-slate-400 tracking-wider">
                  <Monitor className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Core & Electron Environment</span>
                </div>

                {/* Simulated Electron toggle, Native Fullscreen, Voice, Autosave */}
                <div className="space-y-3">
                  
                  {/* Fullscreen API Toggle */}
                  <div className="flex items-center justify-between bg-slate-950 border border-slate-850 p-2.5 rounded-lg">
                    <div>
                      <span className="font-bold text-slate-200 block text-[11px]">Real Fullscreen Viewport</span>
                      <span className="text-[9px] text-slate-500 block">Uses HTML5 Sandbox Fullscreen</span>
                    </div>
                    <button
                      onClick={() => {
                        const target = document.documentElement;
                        if (!document.fullscreenElement) {
                          target.requestFullscreen().then(() => setIsFullscreen(true)).catch(err => console.warn(err));
                        } else {
                          document.exitFullscreen().then(() => setIsFullscreen(false)).catch(err => console.warn(err));
                        }
                      }}
                      className={`px-3 py-1.5 text-[10px] font-bold rounded-lg transition ${
                        isFullscreen
                          ? 'bg-rose-950/40 text-rose-300 border border-rose-900' 
                          : 'bg-indigo-600 text-white hover:bg-indigo-700'
                      }`}
                    >
                      {isFullscreen ? "Exit [Esc]" : "Enter F11"}
                    </button>
                  </div>

                  {/* Electron Shell Environment Frame simulation */}
                  <div className="flex items-center justify-between bg-slate-950 border border-slate-850 p-2.5 rounded-lg">
                    <div>
                      <span className="font-bold text-slate-200 block text-[11px]">Electron Shell Simulation</span>
                      <span className="text-[9px] text-slate-500 block">Windows C++ Titlebar shell</span>
                    </div>
                    <button
                      onClick={() => setElectronMode(!isElectronMode)}
                      className={`px-2.5 py-1 rounded text-[10px] font-bold transition ${
                        isElectronMode 
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' 
                          : 'bg-slate-900 text-slate-400 border border-slate-800'
                      }`}
                    >
                      {isElectronMode ? "ACTIVE (EXE)" : "INACTIVE"}
                    </button>
                  </div>

                  {/* Auto-save */}
                  <div className="flex items-center justify-between bg-slate-950 border border-slate-850 p-2.5 rounded-lg">
                    <div>
                      <span className="font-bold text-slate-200 block text-[11px]">Auto-Save Engine</span>
                      <span className="text-[9px] text-slate-500 block">Saves nodes to IndexedDB</span>
                    </div>
                    <button
                      onClick={() => setAutoSave(!autoSave)}
                      className={`w-10 h-5 rounded-full p-0.5 transition-colors focus:outline-none ${autoSave ? 'bg-indigo-600' : 'bg-slate-800'}`}
                    >
                      <div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform ${autoSave ? 'translate-x-5' : 'translate-x-0'}`} />
                    </button>
                  </div>

                  {/* Voice Activation State toggle */}
                  <div className="flex items-center justify-between bg-slate-950 border border-slate-850 p-2.5 rounded-lg">
                    <div>
                      <span className="font-bold text-slate-200 block text-[11px]">Continuous Voice Wake</span>
                      <span className="text-[9px] text-slate-500 block">Continuous dictation capture</span>
                    </div>
                    <button
                      onClick={() => setVoiceActive(!voiceActive)}
                      className={`w-10 h-5 rounded-full p-0.5 transition-colors focus:outline-none ${voiceActive ? 'bg-indigo-600' : 'bg-slate-800'}`}
                    >
                      <div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform ${voiceActive ? 'translate-x-5' : 'translate-x-0'}`} />
                    </button>
                  </div>

                </div>

                {/* Shortcut Hotkeys panel */}
                <div className="p-3 border border-slate-800 bg-slate-950/20 rounded-lg space-y-1.5 lines leading-relaxed">
                  <span className="text-[9px] text-slate-500 block uppercase font-bold tracking-wider mb-1">Global Desktop Hotkeys</span>
                  <div className="flex justify-between text-[10px]"><span className="text-slate-400 font-mono">Ctrl + Shift + S</span> <span className="text-indigo-400">Save Project</span></div>
                  <div className="flex justify-between text-[10px]"><span className="text-slate-400 font-mono">Ctrl + Shift + V</span> <span className="text-indigo-400">Voice Dictation</span></div>
                  <div className="flex justify-between text-[10px]"><span className="text-slate-400 font-mono">Ctrl + Shift + F</span> <span className="text-indigo-400">Fullscreen shell</span></div>
                  <div className="flex justify-between text-[10px]"><span className="text-slate-400 font-mono">Double-Click Canvas</span> <span className="text-indigo-400">Toggle Frame</span></div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* History / Version Control Panel */}
        {activeLeftTab === 'history' && (
          <div className="space-y-4" id="history-panel-group">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider">Revision History</h4>
              
              {/* Basic Undo/Redo Controls */}
              <div className="flex gap-1 bg-slate-950 p-0.5 rounded-md border border-slate-850">
                <button 
                  onClick={undo}
                  disabled={undoStackSize <= 1}
                  className="p-1 hover:bg-slate-900 disabled:opacity-30 rounded text-slate-300 transition"
                  title="Undo Changes"
                >
                  <Undo className="w-3.5 h-3.5" />
                </button>
                <button 
                  onClick={redo}
                  disabled={redoStackSize === 0}
                  className="p-1 hover:bg-slate-900 disabled:opacity-30 rounded text-slate-300 transition"
                  title="Redo Changes"
                >
                  <Redo className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Branching UI (Section 6) */}
            <div className="p-3 border border-slate-850 bg-slate-950/20 rounded-lg space-y-3 pt-3">
              <div className="flex justify-between items-center text-[10px] text-slate-500 uppercase tracking-wider font-bold">
                <span>Active Branch:</span>
                <span className="text-indigo-400 bg-indigo-950/40 border border-indigo-900 px-2 py-0.5 rounded">{activeBranch}</span>
              </div>

              <form onSubmit={handleCreateBranchSubmit} className="flex gap-2">
                <input 
                  type="text"
                  placeholder="Experiment name"
                  value={branchNameInput}
                  onChange={(e) => setBranchNameInput(e.target.value)}
                  className="flex-1 text-[10px] bg-slate-950 border border-slate-850 rounded px-2 py-1 text-slate-200"
                />
                <button 
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-2.5 py-1 rounded text-[10px] font-semibold transition"
                >
                  Fork
                </button>
              </form>

              {/* Branches toggle items */}
              {branches.length > 1 && (
                <div className="space-y-1">
                  <span className="text-[8px] font-bold text-slate-500 block uppercase">Check out forks:</span>
                  <div className="flex flex-wrap gap-1">
                    {branches.map(b => (
                      <button
                        key={b}
                        onClick={() => checkoutBranch(b)}
                        className={`px-2 py-0.5 rounded text-[9px] font-mono transition ${b === activeBranch ? 'bg-indigo-600 text-white' : 'bg-slate-950 text-slate-400 hover:bg-slate-900'}`}
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
              <span className="text-[9px] font-bold text-slate-500 block mb-2 uppercase tracking-wider">Historical Timeline</span>
              <div className="border-l-2 border-slate-800 ml-1.5 pl-3.5 space-y-4">
                {timeline.map((snap) => (
                  <div key={snap.id} className="relative text-[11px] group">
                    {/* timeline node bubble */}
                    <div className="absolute w-2.5 h-2.5 rounded-full bg-slate-800 group-hover:bg-indigo-500 -left-[20px] top-1 border border-slate-900 transition-colors" />
                    <div className="font-semibold text-slate-200">{snap.label}</div>
                    <div className="text-[9px] text-slate-500 font-mono mt-0.5">
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
          <div className="border-t border-slate-800 pt-3 mt-4 space-y-2">
            <div className="flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider text-amber-500">
              <AlertOctagon className="w-3.5 h-3.5" />
              <span>Canvas Firewall Alerts ({safetyLogs.length})</span>
            </div>
            <div className="max-h-24 overflow-y-auto space-y-1.5 scrollbar">
              {safetyLogs.map((log, idx) => (
                <div key={idx} className="p-2 rounded bg-amber-950/10 border border-amber-950/20 text-[10px] text-amber-300">
                  <div className="font-bold">Blocked: {log.type.toUpperCase()}</div>
                  <div className="opacity-75 italic text-[9px] mt-0.5 truncate">Snippet: {log.original}</div>
                  <div className="opacity-60 text-[8px] font-mono mt-0.5">Reason: {log.reason}</div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* One-Shot Full modal overlay popup */}
      {showOneShotModal && (
        <div className="fixed inset-0 bg-black/75 z-[999] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="max-w-xl w-full">
            <OneShotGenerator onClose={() => setShowOneShotModal(false)} />
          </div>
        </div>
      )}
    </div>
  );
}
