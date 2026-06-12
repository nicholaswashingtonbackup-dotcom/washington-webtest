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
  HelpCircle
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
    applyHTMLSanitizerHeal
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

  return (
    <div id="designer-right-sidebar" class="w-80 bg-slate-900 border-l border-slate-800 flex flex-col text-slate-300">
      {/* Right panel tabs bar */}
      <div class="grid grid-cols-4 border-b border-slate-800 text-center text-xs">
        <button 
          onClick={() => setActiveRightTab('properties')}
          class={`py-3 flex flex-col items-center gap-1.5 font-bold tracking-wider uppercase text-[10px] ${activeRightTab === 'properties' ? 'bg-slate-950 text-violet-400 border-b-2 border-violet-500' : 'hover:bg-slate-950 hover:text-slate-200'}`}
        >
          <Palette class="w-4 h-4" />
          Style
        </button>
        <button 
          onClick={() => setActiveRightTab('pages')}
          class={`py-3 flex flex-col items-center gap-1.5 font-bold tracking-wider uppercase text-[10px] ${activeRightTab === 'pages' ? 'bg-slate-950 text-violet-400 border-b-2 border-violet-500' : 'hover:bg-slate-950 hover:text-slate-200'}`}
        >
          <Layers class="w-4 h-4" />
          Pages
        </button>
        <button 
          onClick={() => setActiveRightTab('scanners')}
          class={`py-3 flex flex-col items-center gap-1.5 font-bold tracking-wider uppercase text-[10px] ${activeRightTab === 'scanners' ? 'bg-slate-950 text-violet-400 border-b-2 border-violet-500' : 'hover:bg-slate-950 hover:text-slate-200'}`}
        >
          <Activity class="w-4 h-4" />
          Scan
        </button>
        <button 
          onClick={() => setActiveRightTab('plugins')}
          class={`py-3 flex flex-col items-center gap-1.5 font-bold tracking-wider uppercase text-[10px] ${activeRightTab === 'plugins' ? 'bg-slate-950 text-violet-400 border-b-2 border-violet-500' : 'hover:bg-slate-950 hover:text-slate-200'}`}
        >
          <Puzzle class="w-4 h-4" />
          Plugins
        </button>
      </div>

      {/* Main Tab Panel Frame */}
      <div class="flex-1 overflow-y-auto p-4 space-y-5 scrollbar">
        
        {/* Style Tab */}
        {activeRightTab === 'properties' && (
          <div class="space-y-5" id="style-panel-group">
            {/* Theme Presets list */}
            <div>
              <h4 class="text-xs font-bold uppercase text-slate-400 mb-2.5 tracking-wider">Themes Catalog</h4>
              <div class="grid grid-cols-2 gap-2">
                {Object.entries(THEME_PRESETS).map(([id, theme]) => (
                  <button
                    key={id}
                    onClick={() => applyPresetTheme(id)}
                    class="p-2.5 rounded-lg bg-slate-950 border border-slate-850 hover:border-slate-700 text-left transition text-xs relative group"
                  >
                    <span class="font-bold text-slate-200 block mb-1.5">{theme.name}</span>
                    <div class="flex gap-1.5">
                      <div class="w-3.5 h-3.5 rounded-full border border-white/10" style={{ backgroundColor: theme.tokens.primaryColor }} />
                      <div class="w-3.5 h-3.5 rounded-full border border-white/10" style={{ backgroundColor: theme.tokens.backgroundColor }} />
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Token Values Fields */}
            <div class="border-t border-slate-800 pt-4 space-y-3">
              <h4 class="text-xs font-bold uppercase text-slate-400 tracking-wider">Visual Variables</h4>
              
              <div>
                <label class="text-[10px] text-slate-500 font-bold block mb-1">PRIMARY BRAND COLOR</label>
                <div class="flex gap-2">
                  <input 
                    type="color" 
                    value={designTokens.primaryColor} 
                    onChange={(e) => applyTokens({ primaryColor: e.target.value })}
                    class="w-8 h-8 rounded border border-slate-800 bg-transparent cursor-pointer"
                  />
                  <input 
                    type="text" 
                    value={designTokens.primaryColor} 
                    onChange={(e) => applyTokens({ primaryColor: e.target.value })}
                    class="flex-1 bg-slate-950 border border-slate-850 rounded px-2.5 py-1 text-xs text-slate-200 font-mono"
                  />
                </div>
              </div>

              <div>
                <label class="text-[10px] text-slate-500 font-bold block mb-1">BACKGROUND PALETTE</label>
                <div class="flex gap-2">
                  <input 
                    type="color" 
                    value={designTokens.backgroundColor} 
                    onChange={(e) => applyTokens({ backgroundColor: e.target.value })}
                    class="w-8 h-8 rounded border border-slate-800 bg-transparent cursor-pointer"
                  />
                  <input 
                    type="text" 
                    value={designTokens.backgroundColor} 
                    onChange={(e) => applyTokens({ backgroundColor: e.target.value })}
                    class="flex-1 bg-slate-950 border border-slate-850 rounded px-2.5 py-1 text-xs text-slate-200 font-mono"
                  />
                </div>
              </div>

              <div>
                <label class="text-[10px] text-slate-500 font-bold block mb-1">GLOBAL BORDER RADIUS</label>
                <select 
                  value={designTokens.borderRadius}
                  onChange={(e) => applyTokens({ borderRadius: e.target.value })}
                  class="w-full bg-slate-950 border border-slate-850 rounded px-2.5 py-1.5 text-xs text-slate-200"
                >
                  <option value="0px">Sharp (0px)</option>
                  <option value="4px">Soft (4px)</option>
                  <option value="12px">Rounded (12px)</option>
                  <option value="24px">Pill (24px)</option>
                </select>
              </div>

              <div>
                <label class="text-[10px] text-slate-500 font-bold block mb-1">TYPOGRAPHY FONTS</label>
                <select 
                  value={designTokens.fontFamily}
                  onChange={(e) => applyTokens({ fontFamily: e.target.value, headingFont: e.target.value })}
                  class="w-full bg-slate-950 border border-slate-850 rounded px-2.5 py-1.5 text-xs text-slate-200"
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
          <div class="space-y-4" id="pages-panel-group">
            <h4 class="text-xs font-bold uppercase text-slate-400 tracking-wider">Pages Structure</h4>
            
            {/* Active pages list */}
            <div class="space-y-1.5">
              {pages.map((p) => (
                <div 
                  key={p.id}
                  onClick={() => selectPage(p.id)}
                  class={`flex items-center justify-between p-2.5 rounded-lg border cursor-pointer transition ${p.id === activePageId ? 'bg-violet-950/20 border-violet-500 text-white' : 'bg-slate-950/45 border-slate-850 hover:border-slate-700'}`}
                >
                  <div class="flex items-center gap-1.5 text-xs">
                    <Layers class="w-3.5 h-3.5 text-slate-500" />
                    <span class={p.isHomepage ? 'font-bold' : ''}>{p.name} {p.isHomepage && '🏠'}</span>
                  </div>
                  {pages.length > 1 && (
                    <button 
                      onClick={(e) => { e.stopPropagation(); deletePage(p.id); }}
                      class="text-slate-500 hover:text-red-400 text-xs transition px-1"
                      title="Remove this page"
                    >
                      Delete
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Create Page Form */}
            <form onSubmit={handleCreatePageSubmit} class="p-3 border border-slate-850 bg-slate-950/20 rounded-lg space-y-3 pt-3">
              <span class="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Compose Page Metadata</span>
              
              <input 
                type="text"
                placeholder="Page Name, e.g. Pricing"
                value={newPageName}
                onChange={(e) => setNewPageName(e.target.value)}
                class="w-full text-xs bg-slate-950 border border-slate-850 rounded px-2.5 py-1.5 text-slate-200"
              />

              <select 
                value={selectedTemplate}
                onChange={(e) => setSelectedTemplate(e.target.value)}
                class="w-full bg-slate-950 border border-slate-850 rounded px-2.5 py-1.5 text-xs text-slate-200"
              >
                <option value="HERO_SAAS">SaaS Landing Page</option>
                <option value="HERO_PORTFOLIO">Artist Portfolio</option>
                <option value="CONTACT_FORM">Contact Hub Only</option>
                <option value="FAQ_ACCORDION">FAQ Accordion</option>
              </select>

              <button 
                type="submit" 
                class="w-full py-1.5 text-xs bg-violet-600 hover:bg-violet-700 text-white font-semibold rounded-md transition"
              >
                Deploy New Page
              </button>
            </form>

            {/* Active Page Meta Details */}
            {activePage && (
              <div class="border-t border-slate-800 pt-4 space-y-2">
                <h4 class="text-xs font-bold uppercase text-slate-400 tracking-wider flex items-center gap-1">
                  <Globe class="w-3.5 h-3.5 text-teal-400" />
                  SEO Tags ({activePage.name})
                </h4>
                <div>
                  <label class="text-[9px] text-slate-500 font-bold block mb-0.5">META HEADER TITLE</label>
                  <input 
                    type="text" 
                    value={activePage.metaTitle || ''} 
                    onChange={(e) => updateActivePageMeta(e.target.value, undefined, undefined)}
                    class="w-full text-xs bg-slate-950 border border-slate-850 rounded px-2 py-1 text-slate-200 font-mono"
                  />
                </div>
                <div>
                  <label class="text-[9px] text-slate-500 font-bold block mb-0.5">META DESCRIPTION</label>
                  <textarea 
                    rows={2}
                    value={activePage.metaDescription || ''} 
                    onChange={(e) => updateActivePageMeta(undefined, e.target.value, undefined)}
                    class="w-full text-xs bg-slate-950 border border-slate-850 rounded px-2 py-1 text-slate-200 font-mono"
                  ></textarea>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Scanners Tab */}
        {activeRightTab === 'scanners' && (
          <div class="space-y-4" id="scanners-panel-group">
            {/* Mobile Optimizer Score Box */}
            <div class="p-3.5 border border-slate-850 rounded-lg bg-slate-950/20">
              <div class="flex items-center justify-between mb-2">
                <h4 class="text-xs font-bold uppercase text-slate-400 flex items-center gap-1.5">
                  <Smartphone class="w-4 h-4 text-rose-500" />
                  Mobile Optimizer
                </h4>
                <div class="text-xs font-bold text-slate-200 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded-full font-mono">{mobileScore}%</div>
              </div>

              {/* Score bar */}
              <div class="w-full h-1.5 bg-slate-850 rounded-full overflow-hidden mb-3">
                <div 
                  class={`h-full ${mobileScore > 80 ? 'bg-emerald-500' : 'bg-amber-500'}`}
                  style={{ width: `${mobileScore}%` }}
                />
              </div>

              {mobileIssues.length === 0 ? (
                <div class="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-950/20 border border-emerald-850 p-2 rounded">
                  <CheckCircle class="w-4 h-4" />
                  Passes all responsive safety checks!
                </div>
              ) : (
                <div class="space-y-2">
                  <button 
                    onClick={handleHealMobile}
                    class="w-full py-1.5 text-xs bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-md flex items-center justify-center gap-1.5 transition uppercase tracking-wider"
                  >
                    ⚡ Auto-Heal Mobile layout issues
                  </button>
                  <div class="max-h-24 overflow-y-auto space-y-1.5 scrollbar pr-1">
                    {mobileIssues.map((issue) => (
                      <div key={issue.id} class="text-[10px] bg-slate-950 p-2 rounded space-y-0.5 border border-red-950/20 text-red-300">
                        <div class="font-semibold flex items-center gap-1">
                          <AlertTriangle class="w-3 h-3 text-red-400" />
                          [{issue.category}] {issue.description}
                        </div>
                        <div class="opacity-60 italic truncate">Found near: {issue.elementSnippet}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Accessibility Score Box */}
            <div class="p-3.5 border border-slate-850 rounded-lg bg-slate-950/20 pt-3">
              <div class="flex items-center justify-between mb-2">
                <h4 class="text-xs font-bold uppercase text-slate-400 flex items-center gap-1.5">
                  <ShieldAlert class="w-4 h-4 text-indigo-400" />
                  A11y (WCAG AA) Score
                </h4>
                <div class="text-xs font-bold text-slate-200 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded-full font-mono">{a11yScore}%</div>
              </div>

              {/* Score bar */}
              <div class="w-full h-1.5 bg-slate-850 rounded-full overflow-hidden mb-3">
                <div 
                  class={`h-full ${a11yScore > 80 ? 'bg-violet-500' : 'bg-pink-500'}`}
                  style={{ width: `${a11yScore}%` }}
                />
              </div>

              {a11yIssues.length === 0 ? (
                <div class="flex items-center gap-1.5 text-xs text-indigo-400 bg-indigo-950/20 border border-indigo-850 p-2 rounded font-semibold">
                  <CheckCircle class="w-4 h-4" />
                  Fully compliant with Screen Readers!
                </div>
              ) : (
                <div class="space-y-2">
                  <button 
                    onClick={handleHealA11y}
                    class="w-full py-1.5 text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-md flex items-center justify-center gap-1.5 transition uppercase tracking-wider"
                  >
                    💎 Auto-Heal Screen Reader issues
                  </button>
                  <div class="max-h-24 overflow-y-auto space-y-1.5 scrollbar pr-1">
                    {a11yIssues.map((issue) => (
                      <div key={issue.id} class="text-[10px] bg-slate-950 p-2 rounded space-y-0.5 border border-indigo-950/20 text-indigo-300">
                        <div class="font-semibold flex items-center gap-1">
                          <AlertTriangle class="w-3 h-3 text-indigo-400" />
                          [{issue.category}] {issue.description}
                        </div>
                        <div class="opacity-60 italic truncate">Found near: {issue.element}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <button 
              onClick={applyHTMLSanitizerHeal}
              class="w-full py-2 bg-slate-950 border border-slate-850 hover:border-slate-800 rounded-lg text-xs font-bold text-slate-400 hover:text-white transition"
            >
              🧹 Execute HTML sandbox strict cleaning
            </button>
          </div>
        )}

        {/* Plugins Tab */}
        {activeRightTab === 'plugins' && (
          <div class="space-y-3" id="plugins-panel-group">
            <h4 class="text-xs font-bold uppercase text-slate-400 tracking-wider">Project Modules</h4>
            
            <div class="space-y-2.5">
              {activePlugins.map((plugin) => (
                <div key={plugin.id} class="border border-slate-850 bg-slate-950/30 p-3 rounded-lg flex gap-3">
                  <div class="flex-1 space-y-1">
                    <div class="flex items-center gap-1.5">
                      <span class="text-xs font-bold text-slate-200">{plugin.name}</span>
                      <span class="text-[8px] font-bold bg-slate-950 border border-slate-800 text-slate-500 py-0.5 px-1.5 rounded-full font-mono">{plugin.version}</span>
                    </div>
                    <p class="text-[10px] text-slate-400 leading-normal">{plugin.description}</p>
                  </div>
                  <div class="self-start">
                    <button 
                      onClick={() => togglePlugin(plugin.id)}
                      class={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${plugin.enabled ? 'bg-violet-600' : 'bg-slate-800'}`}
                    >
                      <span 
                        class={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${plugin.enabled ? 'translate-x-4' : 'translate-x-0'}`} 
                      />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
