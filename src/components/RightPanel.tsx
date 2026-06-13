/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useStore } from '../lib/store';
import { THEME_PRESETS, FONT_PRESETS } from '../lib/design-system';
import { fixAllMobileIssues } from '../lib/mobile-analyzer';
import { fixAllAccessibilityIssues } from '../lib/accessibility-audit';
import { COMPONENT_TEMPLATES } from '../data/templates';
import { 
  Palette, 
  Layers, 
  Smartphone, 
  Activity, 
  CheckCircle, 
  AlertTriangle, 
  ShieldAlert, 
  Puzzle, 
  Globe, 
  Sparkles,
  HelpCircle,
  Cpu,
  Key,
  RefreshCw,
  Eye,
  EyeOff,
  Coins,
  Trash2,
  Plug,
  ExternalLink
} from 'lucide-react';

export default function RightPanel() {
  const { 
    pages, 
    activePageId, 
    designTokens, 
    projectContext, 
    activeRightTab, 
    setActiveRightTab, 
    applyTokens,
    applyPresetTheme,
    addPage,
    deletePage,
    selectPage,
    updateActivePageMeta,
    updateActivePageCanvas,
    createHistoryCheckpoint,
    mobileScore,
    mobileIssues,
    a11yScore,
    a11yIssues,
    activePlugins,
    togglePlugin,
    runAudits,
    applyHTMLSanitizerHeal,
    
    // LLM States & Methods
    llmProvider,
    openRouterKey,
    selectedModel,
    tokenUsage,
    estimatedCost,
    ollamaStatus,
    availableModels,
    setLlmProvider,
    setOpenRouterKey,
    setSelectedModel,
    resetTokenUsage
  } = useStore();

  const [newPageName, setNewPageName] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('HERO_SAAS');
  
  const activePage = pages.find(p => p.id === activePageId) || pages[0];

  const handleCreatePageSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPageName.trim()) return;
    addPage(newPageName, selectedTemplate);
    setNewPageName('');
  };

  const handleHealMobile = () => {
    if (!activePage) return;
    const fixed = fixAllMobileIssues(activePage.html);
    updateActivePageCanvas(fixed);
    createHistoryCheckpoint("Auto-Healed Mobile Layouts");
    runAudits();
  };

  const handleHealA11y = () => {
    if (!activePage) return;
    const fixed = fixAllAccessibilityIssues(activePage.html);
    updateActivePageCanvas(fixed);
    createHistoryCheckpoint("Auto-Healed Screen Reader Compliance");
    runAudits();
  };

  const [isTestingConn, setIsTestingConn] = useState(false);
  const [connTestResult, setConnTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [showKey, setShowKey] = useState(false);

  const handleTestConnection = async () => {
    setIsTestingConn(true);
    setConnTestResult(null);
    try {
      const resp = await fetch('/api/ai/test-connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: llmProvider,
          openRouterKey: openRouterKey,
          model: selectedModel
        })
      });
      const data = await resp.json();
      setConnTestResult({
        success: data.success,
        message: data.message
      });
    } catch (err: any) {
      setConnTestResult({
        success: false,
        message: `Connection error: ${err?.message || String(err)}`
      });
    } finally {
      setIsTestingConn(false);
    }
  };

  return (
    <div id="designer-right-sidebar" className="w-80 bg-slate-900 border-l border-slate-800 flex flex-col text-slate-300">
      {/* Right panel tabs bar */}
      <div className="grid grid-cols-4 border-b border-slate-800 text-center text-xs">
        <button 
          onClick={() => setActiveRightTab('properties')}
          className={`py-3 flex flex-col items-center gap-1.5 font-bold tracking-wider uppercase text-[10px] ${activeRightTab === 'properties' ? 'bg-slate-950 text-violet-400 border-b-2 border-violet-500' : 'hover:bg-slate-950 hover:text-slate-200'}`}
        >
          <Palette className="w-4 h-4" />
          Style
        </button>
        <button 
          onClick={() => setActiveRightTab('pages')}
          className={`py-3 flex flex-col items-center gap-1.5 font-bold tracking-wider uppercase text-[10px] ${activeRightTab === 'pages' ? 'bg-slate-950 text-violet-400 border-b-2 border-violet-500' : 'hover:bg-slate-950 hover:text-slate-200'}`}
        >
          <Layers className="w-4 h-4" />
          Pages
        </button>
        <button 
          onClick={() => setActiveRightTab('scanners')}
          className={`py-3 flex flex-col items-center gap-1.5 font-bold tracking-wider uppercase text-[10px] ${activeRightTab === 'scanners' ? 'bg-slate-950 text-violet-400 border-b-2 border-violet-500' : 'hover:bg-slate-950 hover:text-slate-200'}`}
        >
          <Activity className="w-4 h-4" />
          Scan
        </button>
        <button 
          onClick={() => setActiveRightTab('plugins')}
          className={`py-3 flex flex-col items-center gap-1.5 font-bold tracking-wider uppercase text-[10px] ${activeRightTab === 'plugins' ? 'bg-slate-950 text-violet-400 border-b-2 border-violet-500' : 'hover:bg-slate-950 hover:text-slate-200'}`}
        >
          <Puzzle className="w-4 h-4" />
          Plugins
        </button>
      </div>

      {/* Main Tab Panel Frame */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5 scrollbar">
        
        {/* Style Tab */}
        {activeRightTab === 'properties' && (
          <div className="space-y-5" id="style-panel-group">
            {/* Theme Presets list */}
            <div>
              <h4 className="text-xs font-bold uppercase text-slate-400 mb-2.5 tracking-wider">Themes Catalog</h4>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(THEME_PRESETS).map(([id, theme]) => (
                  <button
                    key={id}
                    onClick={() => applyPresetTheme(id)}
                    className="p-2.5 rounded-lg bg-slate-950 border border-slate-850 hover:border-slate-700 text-left transition text-xs relative group"
                  >
                    <span className="font-bold text-slate-200 block mb-1.5">{theme.name}</span>
                    <div className="flex gap-1.5">
                      <div className="w-3.5 h-3.5 rounded-full border border-white/10" style={{ backgroundColor: theme.tokens.primaryColor }} />
                      <div className="w-3.5 h-3.5 rounded-full border border-white/10" style={{ backgroundColor: theme.tokens.backgroundColor }} />
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Token Values Fields */}
            <div className="border-t border-slate-800 pt-4 space-y-3">
              <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider">Visual Variables</h4>
              
              <div>
                <label className="text-[10px] text-slate-500 font-bold block mb-1">PRIMARY BRAND COLOR</label>
                <div className="flex gap-2">
                  <input 
                    type="color" 
                    value={designTokens.primaryColor} 
                    onChange={(e) => applyTokens({ primaryColor: e.target.value })}
                    className="w-8 h-8 rounded border border-slate-800 bg-transparent cursor-pointer"
                  />
                  <input 
                    type="text" 
                    value={designTokens.primaryColor} 
                    onChange={(e) => applyTokens({ primaryColor: e.target.value })}
                    className="flex-1 bg-slate-950 border border-slate-850 rounded px-2.5 py-1 text-xs text-slate-200 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] text-slate-500 font-bold block mb-1">BACKGROUND PALETTE</label>
                <div className="flex gap-2">
                  <input 
                    type="color" 
                    value={designTokens.backgroundColor} 
                    onChange={(e) => applyTokens({ backgroundColor: e.target.value })}
                    className="w-8 h-8 rounded border border-slate-800 bg-transparent cursor-pointer"
                  />
                  <input 
                    type="text" 
                    value={designTokens.backgroundColor} 
                    onChange={(e) => applyTokens({ backgroundColor: e.target.value })}
                    className="flex-1 bg-slate-950 border border-slate-850 rounded px-2.5 py-1 text-xs text-slate-200 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] text-slate-500 font-bold block mb-1">GLOBAL BORDER RADIUS</label>
                <select 
                  value={designTokens.borderRadius}
                  onChange={(e) => applyTokens({ borderRadius: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-850 rounded px-2.5 py-1.5 text-xs text-slate-200"
                >
                  <option value="0px">Sharp (0px)</option>
                  <option value="4px">Soft (4px)</option>
                  <option value="12px">Rounded (12px)</option>
                  <option value="24px">Pill (24px)</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] text-slate-500 font-bold block mb-1">TYPOGRAPHY FONTS</label>
                <select 
                  value={designTokens.fontFamily}
                  onChange={(e) => applyTokens({ fontFamily: e.target.value, headingFont: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-850 rounded px-2.5 py-1.5 text-xs text-slate-200"
                >
                  {FONT_PRESETS.map((font) => (
                    <option key={font} value={font}>{font}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Pages Tab */}
        {activeRightTab === 'pages' && (
          <div className="space-y-4" id="pages-panel-group">
            <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider">Pages Structure</h4>
            
            {/* Active pages list */}
            <div className="space-y-1.5">
              {pages.map((p) => (
                <div 
                  key={p.id}
                  onClick={() => selectPage(p.id)}
                  className={`flex items-center justify-between p-2.5 rounded-lg border cursor-pointer transition ${p.id === activePageId ? 'bg-violet-950/20 border-violet-500 text-white' : 'bg-slate-950/45 border-slate-850 hover:border-slate-700'}`}
                >
                  <div className="flex items-center gap-1.5 text-xs">
                    <Layers className="w-3.5 h-3.5 text-slate-500" />
                    <span className={p.isHomepage ? 'font-bold' : ''}>{p.name} {p.isHomepage && '🏠'}</span>
                  </div>
                  {pages.length > 1 && (
                    <button 
                      onClick={(e) => { e.stopPropagation(); deletePage(p.id); }}
                      className="text-slate-500 hover:text-red-400 text-xs transition px-1"
                      title="Remove this page"
                    >
                      Delete
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Create Page Form */}
            <form onSubmit={handleCreatePageSubmit} className="p-3 border border-slate-850 bg-slate-950/20 rounded-lg space-y-3 pt-3">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Compose Page Metadata</span>
              
              <input 
                type="text"
                placeholder="Page Name, e.g. Pricing"
                value={newPageName}
                onChange={(e) => setNewPageName(e.target.value)}
                className="w-full text-xs bg-slate-950 border border-slate-850 rounded px-2.5 py-1.5 text-slate-200"
              />

              <select 
                value={selectedTemplate}
                onChange={(e) => setSelectedTemplate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-850 rounded px-2.5 py-1.5 text-xs text-slate-200"
              >
                <option value="HERO_SAAS">SaaS Landing Page</option>
                <option value="HERO_PORTFOLIO">Artist Portfolio</option>
                <option value="CONTACT_FORM">Contact Hub Only</option>
                <option value="FAQ_ACCORDION">FAQ Accordion</option>
              </select>

              <button 
                type="submit" 
                className="w-full py-1.5 text-xs bg-violet-600 hover:bg-violet-700 text-white font-semibold rounded-md transition"
              >
                Deploy New Page
              </button>
            </form>

            {/* Active Page Meta Details */}
            {activePage && (
              <div className="border-t border-slate-800 pt-4 space-y-2">
                <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider flex items-center gap-1">
                  <Globe className="w-3.5 h-3.5 text-teal-400" />
                  SEO Tags ({activePage.name})
                </h4>
                <div>
                  <label className="text-[9px] text-slate-500 font-bold block mb-0.5">META HEADER TITLE</label>
                  <input 
                    type="text" 
                    value={activePage.metaTitle || ''} 
                    onChange={(e) => updateActivePageMeta(e.target.value, undefined, undefined)}
                    className="w-full text-xs bg-slate-950 border border-slate-850 rounded px-2 py-1 text-slate-200 font-mono"
                  />
                </div>
                <div>
                  <label className="text-[9px] text-slate-500 font-bold block mb-0.5">META DESCRIPTION</label>
                  <textarea 
                    rows={2}
                    value={activePage.metaDescription || ''} 
                    onChange={(e) => updateActivePageMeta(undefined, e.target.value, undefined)}
                    className="w-full text-xs bg-slate-950 border border-slate-850 rounded px-2 py-1 text-slate-200 font-mono"
                  ></textarea>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Scanners Tab */}
        {activeRightTab === 'scanners' && (
          <div className="space-y-4" id="scanners-panel-group">
            {/* Mobile Optimizer Score Box */}
            <div className="p-3.5 border border-slate-850 rounded-lg bg-slate-950/20">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-bold uppercase text-slate-400 flex items-center gap-1.5">
                  <Smartphone className="w-4 h-4 text-rose-500" />
                  Mobile Optimizer
                </h4>
                <div className="text-xs font-bold text-slate-200 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded-full font-mono">{mobileScore}%</div>
              </div>

              {/* Score bar */}
              <div className="w-full h-1.5 bg-slate-850 rounded-full overflow-hidden mb-3">
                <div 
                  className={`h-full ${mobileScore > 80 ? 'bg-emerald-500' : 'bg-amber-500'}`}
                  style={{ width: `${mobileScore}%` }}
                />
              </div>

              {mobileIssues.length === 0 ? (
                <div className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-950/20 border border-emerald-850 p-2 rounded">
                  <CheckCircle className="w-4 h-4" />
                  Passes all responsive safety checks!
                </div>
              ) : (
                <div className="space-y-2">
                  <button 
                    onClick={handleHealMobile}
                    className="w-full py-1.5 text-xs bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-md flex items-center justify-center gap-1.5 transition uppercase tracking-wider"
                  >
                    ⚡ Auto-Heal Mobile layout issues
                  </button>
                  <div className="max-h-24 overflow-y-auto space-y-1.5 scrollbar pr-1">
                    {mobileIssues.map((issue) => (
                      <div key={issue.id} className="text-[10px] bg-slate-950 p-2 rounded space-y-0.5 border border-red-950/20 text-red-300">
                        <div className="font-semibold flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3 text-red-400" />
                          [{issue.category}] {issue.description}
                        </div>
                        <div className="opacity-60 italic truncate">Found near: {issue.elementSnippet}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Accessibility Score Box */}
            <div className="p-3.5 border border-slate-850 rounded-lg bg-slate-950/20 pt-3">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-bold uppercase text-slate-400 flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-indigo-400" />
                  A11y (WCAG AA) Score
                </h4>
                <div className="text-xs font-bold text-slate-200 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded-full font-mono">{a11yScore}%</div>
              </div>

              {/* Score bar */}
              <div className="w-full h-1.5 bg-slate-850 rounded-full overflow-hidden mb-3">
                <div 
                  className={`h-full ${a11yScore > 80 ? 'bg-violet-500' : 'bg-pink-500'}`}
                  style={{ width: `${a11yScore}%` }}
                />
              </div>

              {a11yIssues.length === 0 ? (
                <div className="flex items-center gap-1.5 text-xs text-indigo-400 bg-indigo-950/20 border border-indigo-850 p-2 rounded font-semibold">
                  <CheckCircle className="w-4 h-4" />
                  Fully compliant with Screen Readers!
                </div>
              ) : (
                <div className="space-y-2">
                  <button 
                    onClick={handleHealA11y}
                    className="w-full py-1.5 text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-md flex items-center justify-center gap-1.5 transition uppercase tracking-wider"
                  >
                    💎 Auto-Heal Screen Reader issues
                  </button>
                  <div className="max-h-24 overflow-y-auto space-y-1.5 scrollbar pr-1">
                    {a11yIssues.map((issue) => (
                      <div key={issue.id} className="text-[10px] bg-slate-950 p-2 rounded space-y-0.5 border border-indigo-950/20 text-indigo-300">
                        <div className="font-semibold flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3 text-indigo-400" />
                          [{issue.category}] {issue.description}
                        </div>
                        <div className="opacity-60 italic truncate">Found near: {issue.element}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <button 
              onClick={applyHTMLSanitizerHeal}
              className="w-full py-2 bg-slate-950 border border-slate-850 hover:border-slate-800 rounded-lg text-xs font-bold text-slate-400 hover:text-white transition"
            >
              🧹 Execute HTML sandbox strict cleaning
            </button>
          </div>
        )}

        {/* Plugins Tab */}
        {activeRightTab === 'plugins' && (
          <div className="space-y-3" id="plugins-panel-group">
            <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider">Project Modules</h4>
            
            <div className="space-y-2.5">
              {activePlugins.map((plugin) => (
                <div key={plugin.id} className="border border-slate-850 bg-slate-950/30 p-3 rounded-lg flex gap-3">
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-slate-200">{plugin.name}</span>
                      <span className="text-[8px] font-bold bg-slate-950 border border-slate-800 text-slate-500 py-0.5 px-1.5 rounded-full font-mono">{plugin.version}</span>
                    </div>
                    <p className="text-[10px] text-slate-400 leading-normal">{plugin.description}</p>
                  </div>
                  <div className="self-start">
                    <button 
                      onClick={() => togglePlugin(plugin.id)}
                      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${plugin.enabled ? 'bg-violet-600' : 'bg-slate-800'}`}
                    >
                      <span 
                        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${plugin.enabled ? 'translate-x-4' : 'translate-x-0'}`} 
                      />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* Sticky AI Provider Bridge Footer Panel */}
      <div className="border-t border-slate-850 bg-[#090b15] p-3.5 space-y-3 shrink-0 text-slate-300">
        <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-400">
          <div className="flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-violet-400" />
            <span>AI Provider Bridge</span>
          </div>
          <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 font-mono font-normal">
            {llmProvider === 'ollama' ? 'Local' : 'Cloud'}
          </span>
        </div>

        {/* Toggle between Ollama and OpenRouter */}
        <div className="grid grid-cols-2 gap-1.5 p-0.5 bg-slate-950 rounded-lg border border-slate-850">
          <button 
            onClick={() => { setLlmProvider('ollama'); setConnTestResult(null); }}
            className={`py-1 text-[10px] font-bold rounded-md transition-all ${llmProvider === 'ollama' ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/20 shadow-inner' : 'text-slate-500 hover:text-slate-300'}`}
          >
            Ollama (Offline)
          </button>
          <button 
            onClick={() => { setLlmProvider('openrouter'); setConnTestResult(null); }}
            className={`py-1 text-[10px] font-bold rounded-md transition-all ${llmProvider === 'openrouter' ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/20 shadow-inner' : 'text-slate-500 hover:text-slate-300'}`}
          >
            OpenRouter (Cloud)
          </button>
        </div>

        {/* Input variables based on chosen provider */}
        {llmProvider === 'openrouter' ? (
          <div className="space-y-2">
            <div>
              <label className="text-[9px] font-bold text-slate-400 block uppercase mb-1">OpenRouter Key</label>
              <div className="relative">
                <input 
                  type={showKey ? 'text' : 'password'}
                  placeholder="sk-or-v1-..."
                  value={openRouterKey}
                  onChange={(e) => setOpenRouterKey(e.target.value)}
                  className="w-full text-[11px] bg-slate-950 border border-slate-850 rounded px-2.5 py-1.5 pr-8 text-violet-400 font-mono placeholder-slate-700 focus:outline-none focus:border-indigo-500"
                />
                <button 
                  onClick={() => setShowKey(!showKey)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-400"
                >
                  {showKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div>
              <label className="text-[9px] font-bold text-slate-400 block uppercase mb-1">Cloud Model</label>
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="w-full text-[11px] bg-slate-950 border border-slate-850 text-slate-300 rounded px-2.5 py-1.5 font-sans focus:outline-none focus:border-indigo-500"
              >
                <option value="meta-llama/llama-3.1-70b-instruct">Llama 3.1 70B (Instruct)</option>
                <option value="anthropic/claude-3.5-sonnet">Claude 3.5 Sonnet</option>
                <option value="mistralai/mistral-large">Mistral Large</option>
                <option value="deepseek/deepseek-coder">DeepSeek Coder V2</option>
                <option value="google/gemini-2.5-flash">Gemini 2.5 Flash</option>
              </select>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <div>
              <div className="flex items-center justify-between">
                <label className="text-[9px] font-bold text-slate-400 block uppercase mb-1">Ollama Status</label>
                <span className={`text-[8px] font-bold px-1.5 rounded uppercase ${
                  ollamaStatus === 'connected' ? 'bg-emerald-950 text-emerald-400' :
                  ollamaStatus === 'checking' ? 'bg-slate-800 text-slate-400' : 'bg-red-950 text-red-400'
                }`}>
                  {ollamaStatus}
                </span>
              </div>
              <p className="text-[9px] text-slate-500 italic mt-0.5 leading-normal">
                {ollamaStatus === 'connected' 
                  ? 'Local active. Unlimited free requests.' 
                  : 'Requires local server daemon running on your computer.'}
              </p>
            </div>

            <div>
              <label className="text-[9px] font-bold text-slate-400 block uppercase mb-1">Ollama Model</label>
              <select
                value={selectedModel.startsWith('meta-') ? 'llama3' : selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="w-full text-[11px] bg-slate-950 border border-slate-850 text-slate-300 rounded px-2.5 py-1.5 font-sans focus:outline-none focus:border-indigo-500"
              >
                {(availableModels && availableModels.length > 0) ? (
                  availableModels.map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))
                ) : (
                  <>
                    <option value="llama3.1">llama3.1</option>
                    <option value="llama3">llama3</option>
                    <option value="mistral">mistral</option>
                    <option value="codellama">codellama</option>
                  </>
                )}
              </select>
            </div>
          </div>
        )}

        {/* Test Connection Button */}
        <div className="flex items-center gap-2 pt-1">
          <button
            onClick={handleTestConnection}
            disabled={isTestingConn}
            className="w-full py-1.5 bg-slate-950 hover:bg-slate-850 border border-slate-800 rounded text-[10px] font-bold text-slate-300 hover:text-white flex items-center justify-center gap-1.5 transition"
          >
            {isTestingConn ? <RefreshCw className="w-3 h-3 animate-spin text-purple-400" /> : <Plug className="w-3 text-purple-400" />}
            <span>Test Connection</span>
          </button>
        </div>

        {/* Diagnostics banner */}
        {connTestResult && (
          <div className={`p-2 rounded text-[10px] font-semibold border ${connTestResult.success ? 'bg-emerald-950/20 border-emerald-900/40 text-emerald-400' : 'bg-rose-950/20 border-rose-900/40 text-rose-400'}`}>
            <span>{connTestResult.message}</span>
          </div>
        )}

        {/* Cost stats */}
        <div className="bg-slate-950 rounded-lg p-2.5 flex items-center justify-between border border-slate-850 text-[10px]">
          <div className="space-y-0.5">
            <span className="text-slate-500 font-bold block text-[8px] uppercase tracking-wider">Estimated Costs</span>
            <div className="flex items-center gap-1 text-slate-300 font-mono">
              <Coins className="w-3.5 h-3.5 text-amber-500" />
              <span>Tokens: {tokenUsage.toLocaleString()} | Cost: ${estimatedCost.toFixed(4)}</span>
            </div>
          </div>
          <button 
            onClick={resetTokenUsage}
            className="text-slate-500 hover:text-slate-300 p-1"
            title="Clear counters"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
}
