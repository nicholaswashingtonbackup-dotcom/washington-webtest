/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '../lib/store';
import { AGENTS, routeAgent } from '../lib/ai-agents';
import { COMPONENT_TEMPLATES } from '../data/templates';
import { 
  saveHistoryPrompt, 
  getHistoryPrompts, 
  clearHistoryPrompts, 
  SandboxHistoryItem 
} from '../lib/indexeddb-sandbox-history';
import { 
  Play, 
  Check, 
  X, 
  History, 
  Minimize2, 
  Maximize2, 
  Sparkles, 
  Code, 
  Bot, 
  Flame, 
  Eye, 
  Trash2,
  RefreshCw
} from 'lucide-react';

export default function AiSandbox({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { 
    pages, 
    activePageId, 
    designTokens, 
    llmProvider, 
    openRouterKey, 
    selectedModel,
    updateActivePageCanvas,
    createHistoryCheckpoint,
    addTokenUsage,
    applyTokens,
    addPage,
    runAudits
  } = useStore();

  const [isMinimized, setIsMinimized] = useState(false);
  const [selectedAgentId, setSelectedAgentId] = useState<string>('DESIGNER');
  
  // Sandbox specific temporary page HTML state
  const [sandboxHTML, setSandboxHTML] = useState<string>('');
  
  // AI execution states
  const [testPrompt, setTestPrompt] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [rawResponse, setRawResponse] = useState<string>('');
  const [commandMatchMessage, setCommandMatchMessage] = useState<string>('');
  const [commandMatchSuccess, setCommandMatchSuccess] = useState<boolean | null>(null);
  const [realError, setRealError] = useState<string>('');
  
  // History tracking state
  const [historyList, setHistoryList] = useState<SandboxHistoryItem[]>([]);
  
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const activePage = pages.find(p => p.id === activePageId) || pages[0];

  // Load sandbox HTML from primary page whenever page transitions or sandbox opens
  useEffect(() => {
    if (activePage && isOpen) {
      setSandboxHTML(activePage.html);
    }
  }, [activePageId, isOpen]);

  // Load history from IndexedDB on build
  useEffect(() => {
    loadHistory();
  }, [isOpen]);

  const loadHistory = async () => {
    const list = await getHistoryPrompts();
    setHistoryList(list);
  };

  const handleClearHistory = async () => {
    await clearHistoryPrompts();
    setHistoryList([]);
  };

  // Autoresolve the active model according to prompt rules
  const getResolvedModel = () => {
    if (llmProvider === 'openrouter') {
      switch (selectedAgentId) {
        case 'DESIGNER': return 'meta-llama/llama-3.1-70b-instruct';
        case 'COPYWRITER': return 'anthropic/claude-3.5-sonnet';
        case 'SEO': return 'mistralai/mistral-large';
        case 'ACCESSIBILITY': return 'anthropic/claude-3.5-sonnet';
        case 'DEVELOPER': return 'deepseek/deepseek-coder';
        default: return 'meta-llama/llama-3.1-70b-instruct';
      }
    } else {
      switch (selectedAgentId) {
        case 'DESIGNER': return 'llama3.1';
        case 'COPYWRITER': return 'llama3.1';
        case 'SEO': return 'mistral';
        case 'ACCESSIBILITY': return 'llama3.1';
        case 'DEVELOPER': return 'codellama';
        default: return 'llama3.1';
      }
    }
  };

  // Compile miniature IFrame document for unapplied sandbox states
  const compileSandboxIframeDoc = () => {
    const cssVariables = `
      :root {
        --primary-color: ${designTokens.primaryColor};
        --secondary-color: ${designTokens.secondaryColor};
        --accent-color: ${designTokens.accentColor};
        --font-family: ${designTokens.fontFamily || 'sans-serif'};
        --heading-font: ${designTokens.headingFont || 'sans-serif'};
        --border-radius: ${designTokens.borderRadius || '12px'};
        --bg-color: ${designTokens.backgroundColor || '#0f0f23'};
        --text-color: ${designTokens.textColor || '#e2e8f0'};
        --gradient-start: ${designTokens.gradientStart || designTokens.primaryColor};
        --gradient-end: ${designTokens.gradientEnd || designTokens.secondaryColor};
      }
    `;

    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@500;700&display=swap" rel="stylesheet">
        <style>
          ${cssVariables}
          body {
            font-family: var(--font-family);
            background-color: var(--bg-color);
            color: var(--text-color);
            margin: 0;
            padding: 8px;
            min-height: 100vh;
            zoom: 0.75; /* Miniature effect */
          }
          h1, h2, h3, h4, h5, h6 {
            font-family: var(--heading-font);
          }
          ${activePage?.css || ''}
        </style>
      </head>
      <body>
        <div id="df-sandbox-node">
          ${sandboxHTML || "<!-- Sandbox Empty State -->"}
        </div>
      </body>
      </html>
    `.trim();
  };

  /**
   * Run the AI Generation over the temporary sandbox state
   */
  const handleRunTest = async () => {
    if (!testPrompt.trim()) return;
    setIsGenerating(true);
    setRealError('');
    setRawResponse('');
    setCommandMatchMessage('');
    setCommandMatchSuccess(null);

    const agent = AGENTS[selectedAgentId];
    const resolvedModel = getResolvedModel();

    try {
      console.log(`[Sandbox System] Dispatched sandbox test request using provider ${llmProvider}, model ${resolvedModel}`);

      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: testPrompt,
          systemPrompt: agent.systemPrompt,
          useProvider: llmProvider,
          openRouterKey: openRouterKey,
          model: resolvedModel
        })
      });

      if (!res.ok) {
        const errObj = await res.json().catch(() => ({}));
        throw new Error(errObj.error || `HTTP ${res.status}`);
      }

      const data = await res.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      // Track openrouter usage costs if provided
      if (data.usage) {
        const totalTokens = data.usage.total_tokens || 0;
        let cost = 0;
        if (data.provider === 'openrouter') {
          const rates: Record<string, number> = {
            'anthropic/claude-3.5-sonnet': 0.000005,
            'meta-llama/llama-3.1-70b-instruct': 0.0000006,
            'mistralai/mistral-large': 0.000002,
            'deepseek/deepseek-coder': 0.00000015,
            'google/gemini-2.5-flash': 0.00000015
          };
          const perToken = rates[resolvedModel] || 0.000001;
          cost = totalTokens * perToken;
        }
        addTokenUsage(totalTokens, cost);
      }

      const action = data.response;
      setRawResponse(JSON.stringify(action, null, 2));

      if (action && action.command) {
        // Evaluate command against sandboxed HTML
        const { success, text, updatedHTML } = simulateSandboxCommand(action);
        
        setCommandMatchSuccess(success);
        setCommandMatchMessage(text);
        
        if (success && updatedHTML !== undefined) {
          setSandboxHTML(updatedHTML);
        }

        // Save history in IndexedDB
        await saveHistoryPrompt(testPrompt, selectedAgentId, resolvedModel, true, action.command);
      } else {
        setCommandMatchSuccess(false);
        setCommandMatchMessage(`❌ Fail: Output JSON does not match Command Registry action schema structure.`);
        await saveHistoryPrompt(testPrompt, selectedAgentId, resolvedModel, false);
      }

    } catch (err: any) {
      console.error("[Sandbox Execution Error]", err);
      const errMsg = err?.message || "Unreachable AI endpoint";
      setRealError(errMsg);
      setCommandMatchSuccess(false);
      setCommandMatchMessage(`❌ Error: ${errMsg}`);
      await saveHistoryPrompt(testPrompt, selectedAgentId, resolvedModel, false);
    } finally {
      setIsGenerating(false);
      loadHistory();
    }
  };

  /**
   * Simulates applying the unapplied command to sandboxHTML state only!
   */
  const simulateSandboxCommand = (action: any): { success: boolean; text: string; updatedHTML?: string } => {
    const { command, params } = action;
    let tempHTML = sandboxHTML;

    switch (command) {
      case 'add_hero':
        const hTemplate = params?.template === "HERO_PORTFOLIO" ? COMPONENT_TEMPLATES.HERO_PORTFOLIO : COMPONENT_TEMPLATES.HERO_SAAS;
        tempHTML = tempHTML + "\n" + hTemplate.html;
        return { success: true, text: `✅ add_hero(template: ${params?.template || "SAAS"})`, updatedHTML: tempHTML };

      case 'add_navbar':
        tempHTML = COMPONENT_TEMPLATES.NAVBAR_STANDARD.html + "\n" + tempHTML;
        return { success: true, text: `✅ add_navbar()`, updatedHTML: tempHTML };

      case 'add_footer':
        tempHTML = tempHTML + "\n" + COMPONENT_TEMPLATES.FOOTER_FULL.html;
        return { success: true, text: `✅ add_footer()`, updatedHTML: tempHTML };

      case 'add_pricing':
        tempHTML = tempHTML + "\n" + COMPONENT_TEMPLATES.PRICING_3_TIER.html;
        return { success: true, text: `✅ add_pricing()`, updatedHTML: tempHTML };

      case 'add_features':
        tempHTML = tempHTML + "\n" + COMPONENT_TEMPLATES.FEATURES_GRID.html;
        return { success: true, text: `✅ add_features()`, updatedHTML: tempHTML };

      case 'add_testimonials':
        tempHTML = tempHTML + "\n" + COMPONENT_TEMPLATES.TESTIMONIALS_CAROUSEL.html;
        return { success: true, text: `✅ add_testimonials()`, updatedHTML: tempHTML };

      case 'add_faq':
        tempHTML = tempHTML + "\n" + COMPONENT_TEMPLATES.FAQ_ACCORDION.html;
        return { success: true, text: `✅ add_faq()`, updatedHTML: tempHTML };

      case 'add_team':
        tempHTML = tempHTML + "\n" + COMPONENT_TEMPLATES.TEAM_GRID.html;
        return { success: true, text: `✅ add_team()`, updatedHTML: tempHTML };

      case 'add_gallery':
        tempHTML = tempHTML + "\n" + COMPONENT_TEMPLATES.GALLERY_MASONRY.html;
        return { success: true, text: `✅ add_gallery()`, updatedHTML: tempHTML };

      case 'add_blog_cards':
        tempHTML = tempHTML + "\n" + COMPONENT_TEMPLATES.BLOG_CARDS.html;
        return { success: true, text: `✅ add_blog_cards()`, updatedHTML: tempHTML };

      case 'add_contact':
        tempHTML = tempHTML + "\n" + COMPONENT_TEMPLATES.CONTACT_FORM.html;
        return { success: true, text: `✅ add_contact()`, updatedHTML: tempHTML };

      case 'add_cta':
        tempHTML = tempHTML + "\n" + COMPONENT_TEMPLATES.CTA_SECTION.html;
        return { success: true, text: `✅ add_cta()`, updatedHTML: tempHTML };

      case 'add_heading':
        const level = params?.level || "2";
        const textStr = params?.text || "Sandbox Heading";
        const alignStr = params?.align || "center";
        const hColor = params?.color || "var(--text-color)";
        const headingElement = `<h${level} className="text-3xl text-${alignStr} font-bold my-6" style="color: ${hColor}; font-family: var(--heading-font);">${textStr}</h${level}>`;
        tempHTML = tempHTML + "\n" + headingElement;
        return { success: true, text: `✅ add_heading(text: "${textStr}")`, updatedHTML: tempHTML };

      case 'add_paragraph':
        const pText = params?.text || "Placeholder sandbox copy text.";
        const pAlign = params?.align || "left";
        const pColor = params?.color || "var(--text-color)";
        const paragraphElement = `<p className="max-w-3xl my-4 text-${pAlign} opacity-80 text-base" style="color: ${pColor};">${pText}</p>`;
        tempHTML = tempHTML + "\n" + paragraphElement;
        return { success: true, text: `✅ add_paragraph(text: "${pText.substring(0, 15)}...")`, updatedHTML: tempHTML };

      case 'add_spacer':
        const height = params?.height || "48px";
        const spacerElement = `<div style="height: ${height};" className="block w-full"></div>`;
        tempHTML = tempHTML + "\n" + spacerElement;
        return { success: true, text: `✅ add_spacer(height: ${height})`, updatedHTML: tempHTML };

      case 'add_divider':
        const dividerElement = `<hr className="my-10 opacity-10 border-t" style="border-color: var(--text-color);" />`;
        tempHTML = tempHTML + "\n" + dividerElement;
        return { success: true, text: `✅ add_divider()`, updatedHTML: tempHTML };

      case 'change_background':
        if (params?.value) {
          applyTokens({ backgroundColor: params.value });
        }
        return { success: true, text: `✅ change_background(value: "${params?.value}")` };

      case 'change_color':
        if (params?.property === 'primaryColor' || params?.property === 'primary') {
          applyTokens({ primaryColor: params.value });
        } else if (params?.property === 'secondaryColor' || params?.property === 'secondary') {
          applyTokens({ secondaryColor: params.value });
        }
        return { success: true, text: `✅ change_color(property: "${params?.property}", value: "${params?.value}")` };

      case 'change_font':
        if (params?.fontFamily) {
          applyTokens({ fontFamily: params.fontFamily, headingFont: params.fontFamily });
        }
        return { success: true, text: `✅ change_font(fontFamily: "${params?.fontFamily}")` };

      case 'update_text':
        if (params?.text) {
          const hasH1 = /<h1\b[^>]*>([\s\S]*?)<\/h1>/i.test(tempHTML);
          if (hasH1) {
            tempHTML = tempHTML.replace(/(<h1\b[^>]*>)([\s\S]*?)(<\/h1>)/i, `$1${params.text}$3`);
          }
        }
        return { success: true, text: `✅ update_text(text: "${params?.text || ''}")`, updatedHTML: tempHTML };

      case 'create_page':
        if (params?.name) {
          addPage(params.name, params.template);
        }
        return { success: true, text: `✅ create_page(name: "${params?.name || ''}")` };

      case 'set_gallery_layout':
        return { success: true, text: `✅ set_gallery_layout(layout: "${params?.layout || ''}")` };

      default:
        return { success: false, text: `❌ Unrecognized command block error: ${command}` };
    }
  };

  /**
   * Applies temporary sandbox modifications back to the REAL live canvas state!
   */
  const handleApplyToCanvas = () => {
    if (!sandboxHTML) return;
    updateActivePageCanvas(sandboxHTML);
    createHistoryCheckpoint(`Sandbox Commit: applied sandbox changes`);
    runAudits();
    alert("Sandbox canvas state applied to main live workspace successfully!");
  };

  /**
   * Reverts all unapplied sandbox mutations back to current page HTML
   */
  const handleDiscard = () => {
    if (activePage) {
      setSandboxHTML(activePage.html);
      setRawResponse('');
      setCommandMatchMessage('');
      setCommandMatchSuccess(null);
      setRealError('');
      alert("Sandbox changes discarded. Reverted preview to main canvas state.");
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className={`fixed bottom-14 right-6 w-[420px] bg-slate-950 border border-indigo-500/30 rounded-xl shadow-2xl z-50 flex flex-col transition-all overflow-hidden ${
        isMinimized ? 'h-[46px]' : 'h-[620px]'
      }`}
      id="ai-sandbox-widget-container"
    >
      {/* Widget Header bar */}
      <div className="bg-[#0b0c1b] border-b border-indigo-950/80 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="animate-pulse w-2 h-2 rounded-full bg-emerald-500" />
          <h4 className="text-xs font-bold font-mono tracking-wider text-slate-200 uppercase flex items-center gap-1">
            🧪 AI Testing Sandbox
          </h4>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1 hover:text-white text-slate-500 transition-colors"
            title={isMinimized ? "Maximize Sandbox Window" : "Minimize Sandbox Window"}
          >
            {isMinimized ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
          </button>
          <button 
            onClick={onClose}
            className="p-1 hover:text-white text-slate-500 transition-colors"
            title="Close Sandbox"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Body view (not shown if minimized) */}
      {!isMinimized && (
        <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar">
          
          {/* Agent and Model Selectors row */}
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div>
              <label className="text-[9px] text-slate-500 font-bold block mb-1 uppercase tracking-wider">Specialist Agent</label>
              <select 
                value={selectedAgentId}
                onChange={(e) => setSelectedAgentId(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 text-slate-200 px-2.5 py-1.5 rounded-lg outline-none focus:border-indigo-500 transition"
              >
                {Object.entries(AGENTS).map(([key, value]) => (
                  <option key={key} value={key}>{value.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[9px] text-slate-500 font-bold block mb-1 uppercase tracking-wider">Auto-routed Model</label>
              <div className="w-full bg-slate-900 border border-slate-850 text-slate-400 px-2.5 py-1.5 rounded-lg font-mono truncate text-[10px]">
                {getResolvedModel()}
              </div>
            </div>
          </div>

          {/* Test Prompt Input Area */}
          <div className="space-y-1.5">
            <label className="text-[9px] text-slate-500 font-bold block uppercase tracking-wider">Test Prompt Query</label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-indigo-400 font-mono text-xs select-none">&gt;</span>
              <input 
                type="text"
                placeholder='e.g. "Add a neon hero section with dark mesh gradient"'
                value={testPrompt}
                onChange={(e) => setTestPrompt(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleRunTest(); }}
                className="w-full text-xs font-mono bg-slate-900 border border-slate-800 rounded-lg py-2.5 pl-7 pr-3 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Action Trigger Commands Toolbar */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleRunTest}
              disabled={isGenerating || !testPrompt.trim()}
              className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-xs font-bold text-white rounded-lg flex items-center justify-center gap-1.5 transition shadow-lg shadow-indigo-950/40"
            >
              {isGenerating ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
              Run Test
            </button>
            <button
              onClick={handleApplyToCanvas}
              disabled={!sandboxHTML}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-xs font-bold text-white rounded-lg flex items-center justify-center gap-1 transition"
              title="Apply sandbox temporary output code to primary live canvas"
            >
              <Check className="w-3.5 h-3.5" />
              Apply
            </button>
            <button
              onClick={handleDiscard}
              disabled={!sandboxHTML}
              className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-xs font-bold text-slate-400 rounded-lg flex items-center justify-center gap-1 transition-colors"
              title="Throw away current sandbox temporary states"
            >
              <X className="w-3.5 h-3.5" />
              Discard
            </button>
          </div>

          {/* Command execution status box */}
          {commandMatchMessage && (
            <div className={`p-2.5 rounded-lg border text-xs font-mono leading-relaxed ${
              commandMatchSuccess === true 
                ? 'bg-emerald-950/20 border-emerald-900/40 text-emerald-400' 
                : 'bg-red-950/20 border-red-900/40 text-red-400'
            }`}>
              <div className="font-bold uppercase text-[9px] tracking-wider mb-0.5">Command Analyzer Match</div>
              <div>{commandMatchMessage}</div>
            </div>
          )}

          {/* Raw JSON panel */}
          <div className="space-y-1">
            <label className="text-[9px] text-slate-500 font-bold block uppercase tracking-wider">Raw LLM Response</label>
            <div className="bg-slate-900/90 border border-slate-900 rounded-lg p-2.5 max-h-[140px] overflow-auto scrollbar">
              {rawResponse ? (
                <pre className="text-[10px] font-mono text-violet-400 leading-normal">{rawResponse}</pre>
              ) : (
                <div className="text-[10px] text-slate-600 italic font-mono uppercase text-center py-4">No payload loaded. Execute test prompt above.</div>
              )}
            </div>
          </div>

          {/* REAL RENDERING CANVAS PREVIEW */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[9px] text-slate-500 font-bold block uppercase tracking-wider">Canvas Preview (Real Render)</label>
              <span className="text-[8px] font-mono text-slate-500 font-semibold bg-slate-900 border border-slate-850 px-1 rounded">zoom: 75%</span>
            </div>
            <div className="w-full h-[150px] border border-slate-850 bg-slate-900 rounded-xl overflow-hidden relative group">
              <iframe
                ref={iframeRef}
                srcDoc={compileSandboxIframeDoc()}
                className="w-full h-full border-none pointer-events-none select-none"
                title="SiteForge Sandbox Miniature iframe View"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-slate-950/50 opacity-100 group-hover:opacity-0 pointer-events-none flex items-center justify-center transition-opacity">
                <span className="text-[9px] font-mono tracking-widest text-slate-400 uppercase bg-slate-950/90 py-1 px-3.5 border border-slate-800 rounded-md">
                  Sandbox Active Frame
                </span>
              </div>
            </div>
          </div>

          {/* History log block */}
          <div className="border-t border-slate-800/80 pt-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                <History className="w-3.5 h-3.5 text-slate-500" />
                History Prompt Log
              </span>
              {historyList.length > 0 && (
                <button 
                  onClick={handleClearHistory}
                  className="text-[9px] text-red-500 hover:text-red-400 flex items-center gap-1 font-semibold transition"
                >
                  <Trash2 className="w-2.5 h-2.5" />
                  Clear ({historyList.length})
                </button>
              )}
            </div>

            {historyList.length === 0 ? (
              <div className="text-[10px] text-slate-600 italic text-center py-3">No history records found in durable sandbox vault.</div>
            ) : (
              <div className="space-y-1.5 max-h-[140px] overflow-y-auto scrollbar pr-1">
                {historyList.map((item) => (
                  <div 
                    key={item.id}
                    onClick={() => {
                      setTestPrompt(item.prompt);
                      setSelectedAgentId(item.agent);
                    }}
                    className="p-2 rounded bg-slate-900/50 hover:bg-slate-900 border border-slate-850 hover:border-slate-800 transition cursor-pointer text-[10px] flex items-start gap-1 justify-between"
                  >
                    <div className="space-y-0.5 truncate flex-1 pr-2">
                      <div className="font-mono text-slate-300 truncate" title={item.prompt}>
                        <span className="text-indigo-400 mr-1">&gt;</span>
                        {item.prompt}
                      </div>
                      <div className="text-[8px] text-slate-500 flex items-center gap-2">
                        <span className="text-slate-400 font-semibold">{item.agent}</span>
                        <span className="font-mono text-slate-500">{new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>
                    {item.parsedCommand && (
                      <span className="text-[8px] font-mono bg-indigo-950/45 border border-indigo-900/30 text-indigo-400 px-1.5 py-0.5 rounded uppercase self-center max-w-[80px] truncate">
                        {item.parsedCommand}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  );
}
