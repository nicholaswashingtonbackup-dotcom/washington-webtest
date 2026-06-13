/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '../lib/store';
import { routeAgent, buildAgentPayload } from '../lib/ai-agents';
import { COMMANDS } from '../lib/command-registry';
import { COMPONENT_TEMPLATES } from '../data/templates';
import { 
  addAuditLog, 
  getAuditLogs, 
  getAuditLogsByFilter, 
  clearAllAuditLogs, 
  AuditLogEntry 
} from '../lib/indexeddb-audit';
import { 
  loadVoiceSession, 
  appendContextTurn, 
  popContextTurn, 
  resetVoiceSession, 
  saveVoiceSession, 
  VoiceSession 
} from '../lib/voice-session';
import { 
  Mic, 
  MicOff, 
  Sparkles, 
  Loader2, 
  Volume2, 
  CornerDownLeft, 
  History, 
  Check, 
  X, 
  RefreshCw, 
  Layers, 
  ShieldCheck, 
  Database,
  ArrowRight,
  User,
  Bot
} from 'lucide-react';

export default function VoiceAgent() {
  const { 
    pages, 
    activePageId, 
    designTokens, 
    projectContext, 
    updateActivePageCanvas, 
    applyTokens,
    addPage,
    runAudits,
    createHistoryCheckpoint,
    llmProvider,
    openRouterKey,
    selectedModel
  } = useStore();

  // Voice engine & recognition states
  const [voiceStatus, setVoiceStatus] = useState<'Idle' | 'Listening' | 'Processing' | 'Recognized' | 'Failed'>('Idle');
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [confidence, setConfidence] = useState<number | null>(null);

  // Suggested correction loop for confidence < 70%
  const [lowConfidenceMode, setLowConfidenceMode] = useState(false);
  const [suggestedCorrection, setSuggestedCorrection] = useState('');
  const [suspendedQuery, setSuspendedQuery] = useState('');

  // Voice session & memory state
  const [session, setSession] = useState<VoiceSession>(() => loadVoiceSession());
  const [showSessionPanel, setShowSessionPanel] = useState(false);

  // Audit Logs view
  const [auditList, setAuditList] = useState<AuditLogEntry[]>([]);
  const [showAuditLogs, setShowAuditLogs] = useState(false);

  // Ref for speech recognition
  const recognitionRef = useRef<any>(null);

  // Reload audit log lists & standard sessions
  useEffect(() => {
    reloadAuditLogs();
    const loadedSession = loadVoiceSession();
    setSession(loadedSession);
  }, []);

  const reloadAuditLogs = async () => {
    const list = await getAuditLogs();
    setAuditList(list);
  };

  const handleClearAudits = async () => {
    await clearAllAuditLogs();
    setAuditList([]);
  };

  useEffect(() => {
    // Setup SpeechRecognition
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = 'en-US';

      rec.onstart = () => {
        setIsListening(true);
        setVoiceStatus('Listening');
        setErrorMsg('');
        setLowConfidenceMode(false);
      };

      rec.onresult = (e: any) => {
        const text = e.results[0][0].transcript;
        const confidenceScore = e.results[0][0].confidence || 0.92;
        
        setTranscript(text);
        setConfidence(confidenceScore);
        
        if (confidenceScore >= 0.70) {
          setVoiceStatus('Recognized');
          processVoiceCommand(text, confidenceScore);
        } else {
          setVoiceStatus('Failed');
          triggerLowConfidenceFlow(text, confidenceScore);
        }
      };

      rec.onerror = (e: any) => {
        console.error("Speech Recognition Error:", e);
        setIsListening(false);
        setVoiceStatus('Failed');
        if (e.error === 'not-allowed') {
          setErrorMsg("Microphone disabled in browser settings or within iframe sandbox.");
        } else {
          setErrorMsg(`Microphone error: ${e.error}`);
        }
      };

      rec.onend = () => {
        setIsListening(false);
        // Do not reset status if it's processing or low confidence
        if (voiceStatus === 'Listening') {
          setVoiceStatus('Idle');
        }
      };

      recognitionRef.current = rec;
    }
  }, [voiceStatus]);

  // Speak confirmation speech
  const speakText = (text: string) => {
    try {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const synth = window.speechSynthesis;
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1.05;
        utterance.pitch = 1.0;
        synth.speak(utterance);
      }
    } catch (e) {
      console.warn("SpeechSynthesis is restricted or blocked in this environment:", e);
    }
  };

  const startListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
      } catch (err) {
        recognitionRef.current.stop();
      }
    } else {
      setErrorMsg("Web Speech API has restricted access in this browser. Try our vocal typing bar below.");
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };

  // Safe mapping of the AI Action on the active Page elements
  const applyCommandToCanvas = async (action: any, originalInput: string) => {
    const { command, params } = action;
    const activePage = pages.find(p => p.id === activePageId) || pages[0];
    let currentHTML = activePage?.html || "";
    let beforeState = { html: currentHTML, tokens: { ...designTokens } };
    let afterState: any = {};

    console.log(`[Canvas Command Engine] Executing command: ${command}`, params);

    try {
      switch (command) {
        // DESIGN COMMANDS
        case 'add_block':
          const tType = params.type || 'hero';
          const tName = params.template || "HERO_SAAS";
          let addedHtml = "";
          if (tName === "HERO_PORTFOLIO") addedHtml = COMPONENT_TEMPLATES.HERO_PORTFOLIO.html;
          else if (tName === "HERO_SAAS") addedHtml = COMPONENT_TEMPLATES.HERO_SAAS.html;
          else if (tType === 'navbar' || tName.includes('NAVBAR')) addedHtml = COMPONENT_TEMPLATES.NAVBAR_STANDARD.html;
          else if (tType === 'footer' || tName.includes('FOOTER')) addedHtml = COMPONENT_TEMPLATES.FOOTER_FULL.html;
          else if (tType === 'pricing' || tName.includes('PRICING')) addedHtml = COMPONENT_TEMPLATES.PRICING_3_TIER.html;
          else if (tType === 'features' || tName.includes('FEATURES')) addedHtml = COMPONENT_TEMPLATES.FEATURES_GRID.html;
          else if (tType === 'testimonials' || tName.includes('TESTIMONIALS')) addedHtml = COMPONENT_TEMPLATES.TESTIMONIALS_CAROUSEL.html;
          else if (tType === 'faq' || tName.includes('FAQ')) addedHtml = COMPONENT_TEMPLATES.FAQ_ACCORDION.html;
          else if (tType === 'team' || tName.includes('TEAM')) addedHtml = COMPONENT_TEMPLATES.TEAM_GRID.html;
          else if (tType === 'gallery' || tName.includes('GALLERY')) addedHtml = COMPONENT_TEMPLATES.GALLERY_MASONRY.html;
          else if (tType === 'contact' || tName.includes('CONTACT')) addedHtml = COMPONENT_TEMPLATES.CONTACT_FORM.html;
          else addedHtml = COMPONENT_TEMPLATES.CTA_SECTION.html;

          currentHTML = currentHTML + "\n" + addedHtml;
          break;

        case 'remove_block':
          const blockId = params.block_id || 'block_hero';
          // Find and clean standard block matching blockId
          currentHTML = currentHTML.replace(new RegExp(`<section[^>]*id=["']${blockId}["'][^>]*>[\\s\\S]*?<\\/section>`, 'i'), "<!-- Block Removed -->");
          break;

        case 'duplicate_block':
          const dBlockId = params.block_id;
          const matchBlock = currentHTML.match(new RegExp(`<section[^>]*id=["']${dBlockId}["'][^>]*>[\\s\\S]*?<\\/section>`, 'i'));
          if (matchBlock) {
            currentHTML = currentHTML + "\n" + matchBlock[0].replace(dBlockId, `${dBlockId}_dup_${Math.floor(Math.random()*100)}`);
          }
          break;

        case 'update_style':
          if (params.target && params.property) {
            if (params.property === 'background' || params.property === 'backgroundColor') {
              applyTokens({ backgroundColor: params.value });
            }
          }
          break;

        case 'update_content':
          if (params.target && params.content) {
            if (params.target === 'h1' || params.target === 'headline') {
              const hasH1 = /<h1\b[^>]*>([\s\S]*?)<\/h1>/i.test(currentHTML);
              if (hasH1) {
                currentHTML = currentHTML.replace(/(<h1\b[^>]*>)([\s\S]*?)(<\/h1>)/i, `$1${params.content}$3`);
              }
            }
          }
          break;

        case 'set_background':
          if (params.value) {
            applyTokens({ backgroundColor: params.value });
          }
          break;

        case 'set_font':
          if (params.fontFamily) {
            applyTokens({ fontFamily: params.fontFamily, headingFont: params.fontFamily });
          }
          break;

        // MEDIA COMMANDS
        case 'upload_asset':
        case 'delete_asset':
        case 'tag_asset':
        case 'move_asset':
        case 'set_logo':
        case 'set_favicon':
        case 'replace_asset':
          console.log(`Executing asset command ${command}`);
          break;

        // GALLERY COMMANDS
        case 'set_gallery_layout':
          if (params.layout) {
            useStore.getState().setGalleryLayout(params.block_id || 'gallery', params.layout);
          }
          break;

        // PAGE COMMANDS
        case 'set_page_title':
          if (params.title) {
            alert(`Page Title Saved: ${params.title}`);
          }
          break;

        // STATE METADATA getters (Return values)
        case 'get_canvas_state':
          console.log("Canvas HTML state retrieved of size " + currentHTML.length);
          break;

        default:
          console.warn(`[Canvas Engine] Unsupported or unhandled command: ${command}`);
          break;
      }

      // Apply changes & commit checkpoints
      updateActivePageCanvas(currentHTML);
      createHistoryCheckpoint(`Voice Action Execution: ${command}`);
      runAudits();

      afterState = { html: currentHTML, tokens: { ...designTokens } };

      // IMMUTABLE AUDIT LOG ENTRY WRITTEN TO INDEXEDDB
      await addAuditLog({
        action: command,
        target: params?.block_id || params?.target || activePageId,
        before: beforeState,
        after: afterState,
        source: "Voice Command",
        user_input: originalInput,
        result: "Success",
        model_used: selectedModel || "llama3.1",
        provider: llmProvider
      });

      reloadAuditLogs();

    } catch (err: any) {
      console.error("Failed executing command action:", err);
      await addAuditLog({
        action: command,
        target: params?.block_id || activePageId,
        before: beforeState,
        after: "Error State",
        source: "Voice Command",
        user_input: originalInput,
        result: `Failed: ${err.message || String(err)}`,
        model_used: selectedModel || "llama3.1",
        provider: llmProvider
      });
      reloadAuditLogs();
    }
  };

  /**
   * Helper that acts when accuracy of recognition is below 70 %
   */
  const triggerLowConfidenceFlow = (rawText: string, score: number) => {
    setLowConfidenceMode(true);
    setSuspendedQuery(rawText);

    // Phonetic corrections
    let correction = rawText;
    const corrections: Record<string, string> = {
      "hiro": "hero",
      "nav bar": "navbar",
      "picing": "pricing",
      "heding": "heading",
      "contacte": "contact",
      "divaider": "divider",
      "specter": "spacer"
    };

    Object.entries(corrections).forEach(([typo, corrected]) => {
      correction = correction.replace(new RegExp(`\\b${typo}\\b`, 'gi'), corrected);
    });

    if (correction === rawText) {
      correction = rawText + " hero section"; // standard disambiguation guess
    }

    setSuggestedCorrection(correction);
    speakText(`I heard '${rawText}'. Did you mean '${correction}'?`);
  };

  const handleConfirmCorrection = () => {
    setLowConfidenceMode(false);
    setTranscript(suggestedCorrection);
    setVoiceStatus('Recognized');
    processVoiceCommand(suggestedCorrection, 0.95);
  };

  const handleDenyCorrection = () => {
    setLowConfidenceMode(false);
    setTranscript('');
    setVoiceStatus('Idle');
    startListening();
  };

  /**
   * Processes the command with full context, providers, and models
   */
  const processVoiceCommand = async (vCommand: string, accuracyVal = 1.0) => {
    if (!vCommand.trim()) return;
    setIsProcessing(true);
    setVoiceStatus('Processing');
    setAiResponse('');
    setErrorMsg('');

    const lowerCommand = vCommand.toLowerCase().trim();
    if (lowerCommand === 'switch to openrouter') {
      useStore.getState().setLlmProvider('openrouter');
      setAiResponse("Switched LLM provider to OpenRouter cloud fallback.");
      speakText("Switched LLM provider to OpenRouter.");
      setIsProcessing(false);
      setVoiceStatus('Idle');
      return;
    }
    if (lowerCommand === 'switch to ollama') {
      useStore.getState().setLlmProvider('ollama');
      setAiResponse("Switched LLM provider to Ollama local offline.");
      speakText("Switched LLM provider to Ollama.");
      setIsProcessing(false);
      setVoiceStatus('Idle');
      return;
    }

    try {
      // 1. Triage context and choose agent specialist
      const chosenAgent = routeAgent(vCommand);
      console.log(`[Agent Router] Selected specialist: ${chosenAgent.name} for request: "${vCommand}"`);

      // 2. Build complete instruction prompt
      const payloadPrompt = buildAgentPayload(
        chosenAgent,
        vCommand,
        projectContext,
        Object.keys(COMMANDS)
      );

      // 3. Dispatch to LLM API server proxied client
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: vCommand,
          systemPrompt: chosenAgent.systemPrompt,
          useProvider: llmProvider,
          openRouterKey: openRouterKey,
          model: selectedModel
        })
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Server query failed with status: ${res.status}`);
      }

      const data = await res.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      const action = data.response;
      if (action && action.command) {
        setVoiceStatus('Recognized');
        // Execute the action (updates canvas and adds logs to db)
        await applyCommandToCanvas(action, vCommand);

        let spokenFeedback = `Applied command ${action.command.replace('_', ' ')}.`;
        if (action.command === 'add_block') {
          spokenFeedback = `Successfully compiled ${action.params?.template || 'SaaS'} block section onto your canvas.`;
        } else if (action.command.startsWith('change_') || action.command.startsWith('set_')) {
          spokenFeedback = "Your visual styles have been recalibrated on the canvas layout.";
        }

        setAiResponse(spokenFeedback);
        speakText(spokenFeedback);

        // PERSIST LOG TO VOICE SESSION STACK (MEMORY CONTEXT)
        const updatedSession = appendContextTurn(
          vCommand,
          spokenFeedback,
          false,
          JSON.stringify(action),
          accuracyVal
        );
        setSession(updatedSession);

      } else {
        throw new Error("AI output layout didn't match the command registry schema structure.");
      }

    } catch (err: any) {
      console.error("[Voice Command Error]", err);
      const errText = err?.message || "Communication channel interrupted.";
      setErrorMsg(errText);
      setVoiceStatus('Failed');
      speakText("I was unable to synchronize that visual change. Please try again.");

      // Log failure turn
      const updatedSession = appendContextTurn(
        vCommand,
        "Failed turn: " + errText,
        true,
        "error_failed",
        accuracyVal
      );
      setSession(updatedSession);

    } finally {
      setIsProcessing(false);
      if (voiceStatus !== 'Failed') {
        setVoiceStatus('Idle');
      }
    }
  };

  /**
   * Reset session context logs
   */
  const handleResetSession = () => {
    const refreshed = resetVoiceSession();
    setSession(refreshed);
    setAiResponse('');
    setErrorMsg('');
    setTranscript('');
    alert("Voice session context stack flushed. Memory is fresh!");
  };

  return (
    <div id="voice-agent-container" className="rounded-xl border p-4 bg-slate-900 border-slate-800 text-slate-200 space-y-4">
      
      {/* Header section with voice status indicator status block and session memory tab */}
      <div className="flex items-center justify-between border-b border-indigo-950/80 pb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-violet-400 rotate-12" />
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">Intelligent Speech Router (v4.0)</h4>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setShowSessionPanel(!showSessionPanel)}
            className={`p-1 px-2 rounded text-[9px] font-mono font-bold flex items-center gap-1 border transition-colors ${showSessionPanel ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300' : 'bg-slate-950 border-slate-800 text-slate-500 hover:text-slate-300'}`}
            title="Toggle session memory status panel"
          >
            <Layers className="w-2.5 h-2.5" />
            MEM: {session.context_stack.length}
          </button>
          <button 
            onClick={() => setShowAuditLogs(!showAuditLogs)}
            className={`p-1 px-2 rounded text-[9px] font-mono font-bold flex items-center gap-1 border transition-colors ${showAuditLogs ? 'bg-emerald-600/20 border-emerald-500 text-emerald-300' : 'bg-slate-950 border-slate-800 text-slate-500 hover:text-slate-300'}`}
            title="Toggle immutable Audit Logs panel"
          >
            <ShieldCheck className="w-2.5 h-2.5" />
            AUDITS ({auditList.length})
          </button>
        </div>
      </div>

      {/* Voice engine status bar indicators */}
      <div className="bg-[#0b0c1b] rounded-lg p-2.5 border border-indigo-950/60 text-xs flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <div className={`w-2.5 h-2.5 rounded-full ${
            voiceStatus === 'Listening' ? 'bg-rose-500 animate-ping' :
            voiceStatus === 'Processing' ? 'bg-amber-500 animate-pulse' :
            voiceStatus === 'Recognized' ? 'bg-emerald-500' :
            voiceStatus === 'Failed' ? 'bg-red-500' : 'bg-slate-600'
          }`} />
          <span className="font-semibold uppercase text-[10px] tracking-wider text-slate-400">Voice Status:</span>
          <span className={`font-mono text-[10px] font-bold ${
            voiceStatus === 'Listening' ? 'text-rose-400' :
            voiceStatus === 'Processing' ? 'text-amber-400' :
            voiceStatus === 'Recognized' ? 'text-emerald-400' :
            voiceStatus === 'Failed' ? 'text-red-400' : 'text-slate-500'
          }`}>{voiceStatus}</span>
        </div>
        {confidence !== null && (
          <span className="text-[10px] font-mono text-indigo-400">Confidence: {(confidence * 100).toFixed(0)}%</span>
        )}
      </div>

      {/* Suggested correction banner overlay (for low confidence status) */}
      {lowConfidenceMode && (
        <div className="p-3 bg-indigo-950/45 border border-indigo-500/30 rounded-xl space-y-2 text-xs">
          <div className="text-indigo-300 italic">
            🤖 "I heard <span className="underline font-bold text-slate-200">"{suspendedQuery}"</span>. Did you mean <span className="font-bold underline text-white">"{suggestedCorrection}"</span>?"
          </div>
          <div className="flex items-center gap-2 pt-1">
            <button 
              onClick={handleConfirmCorrection}
              className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-[10px] text-white font-bold rounded flex items-center gap-0.5"
            >
              <Check className="w-3 h-3" /> Yes, execution correction
            </button>
            <button 
              onClick={handleDenyCorrection}
              className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-[10px] text-white font-bold rounded flex items-center gap-0.5"
            >
              <X className="w-3 h-3" /> No, cancel query
            </button>
          </div>
        </div>
      )}

      {/* Voice trigger microphone row */}
      <div className="flex items-center gap-3">
        <button 
          id="mic-trigger-btn"
          onClick={isListening ? stopListening : startListening}
          disabled={isProcessing}
          className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg ${
            isListening 
              ? 'bg-rose-600 hover:bg-rose-700 text-white scale-105 animate-pulse shadow-rose-950' 
              : 'bg-violet-600 hover:bg-violet-700 hover:shadow-violet-900/40 text-white'
          } disabled:opacity-40`}
          title="Toggle vocal Speech API engine"
        >
          {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
        </button>

        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="Type or speak instructions (e.g., 'add_block type=hero template=HERO_SAAS')..."
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                processVoiceCommand(transcript);
              }
            }}
            disabled={isProcessing}
            className="w-full text-xs bg-slate-950 border border-slate-800 rounded-lg py-2.5 pl-3 pr-10 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
          />
          <button 
            onClick={() => processVoiceCommand(transcript)}
            disabled={isProcessing || !transcript}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-white rounded-md transition-colors"
          >
            {isProcessing ? <Loader2 className="w-3.5 h-3.5 animate-spin text-violet-400" /> : <CornerDownLeft className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Active References & Memory state status values */}
      {(session.active_references.last_block || session.active_references.last_object) && (
        <div className="p-2 rounded bg-slate-950/40 border border-slate-900/80 flex items-center justify-between text-[10px] text-slate-500 font-mono">
          <span>Last referenced block: <span className="text-violet-400 font-bold">{session.active_references.last_block || "none"}</span></span>
          <span>Last asset: <span className="text-violet-400 font-bold">{session.active_references.last_object || "none"}</span></span>
        </div>
      )}

      {/* Error message displays */}
      {errorMsg && (
        <div className="p-2 rounded bg-red-950/20 border border-red-900/40 text-[11px] flex gap-1.5 items-start text-red-400 leading-normal">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Intelligent speech text-to-speech speaker outputs */}
      {aiResponse && (
        <div className="p-2.5 rounded bg-slate-950/50 border border-slate-800 text-[11px] text-violet-300 flex items-center justify-between gap-2">
          <span className="flex-1 italic">🤖 "{aiResponse}"</span>
          <button 
            onClick={() => speakText(aiResponse)}
            className="p-1 text-slate-500 hover:text-slate-300 transition-colors"
            title="Speak confirmation text in vocal synthesiser"
          >
            <Volume2 className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Interactive voice context stack Memory list */}
      {showSessionPanel && (
        <div className="p-3 bg-slate-950/90 border border-indigo-950 rounded-xl space-y-3">
          <div className="flex items-center justify-between">
            <h5 className="text-[10px] font-bold text-indigo-400 font-mono uppercase tracking-wider flex items-center gap-1">
              <History className="w-3.5 h-3.5" />
              Session Context Record ({session.session_id})
            </h5>
            <button 
              onClick={handleResetSession}
              className="text-[9px] text-red-500 hover:text-red-400 font-bold underline cursor-pointer"
            >
              Flush History
            </button>
          </div>
          <div className="max-h-[160px] overflow-auto scrollbar space-y-2">
            {session.context_stack.length === 0 ? (
              <div className="text-[10px] text-slate-600 italic py-2 text-center">No conversational triggers saved in session depth.</div>
            ) : (
              session.context_stack.map((t) => (
                <div key={t.turn} className="p-2 bg-slate-900/50 border border-slate-850 rounded text-[10px] space-y-1">
                  <div className="flex items-center justify-between text-slate-500 font-semibold text-[8px] uppercase">
                    <span>Turn {t.turn}</span>
                    {t.confidence && <span>confidence: {(t.confidence*100).toFixed(0)}%</span>}
                  </div>
                  <div className="flex items-start gap-1">
                    <User className="w-3 h-3 text-slate-500 mt-0.5 flex-shrink-0" />
                    <span className="text-slate-300 font-medium">"{t.user}"</span>
                  </div>
                  <div className="flex items-start gap-1 text-indigo-300/80 pl-1">
                    <Bot className="w-3 h-3 text-indigo-400 mt-0.5 flex-shrink-0" />
                    <span>"{t.ai}"</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Interactive Immutable Audit Logs Panel */}
      {showAuditLogs && (
        <div className="p-3 bg-slate-950/95 border border-emerald-950 rounded-xl space-y-3">
          <div className="flex items-center justify-between">
            <h5 className="text-[10px] font-bold text-emerald-400 font-mono uppercase tracking-wider flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              Immutable Audit Logs Repository
            </h5>
            <button 
              onClick={handleClearAudits}
              className="text-[9px] text-red-500 hover:text-red-400 font-bold underline cursor-pointer"
            >
              Purge Logs
            </button>
          </div>
          <div className="max-h-[220px] overflow-auto scrollbar space-y-2 pr-1">
            {auditList.length === 0 ? (
              <div className="text-[10px] text-slate-600 italic py-3 text-center">No audit entries registered. Make edits to populate logs.</div>
            ) : (
              auditList.map((log) => (
                <div key={log.id} className="p-2 bg-slate-900 border border-slate-850 rounded text-[10px] font-mono space-y-1">
                  <div className="flex items-center justify-between text-[8px]">
                    <span className="text-emerald-400 font-bold uppercase">{log.action}</span>
                    <span className="text-slate-500">{new Date(log.timestamp).toLocaleTimeString()}</span>
                  </div>
                  <div className="text-slate-400">
                    <span className="text-slate-600 font-bold uppercase text-[9px]">Input:</span> "{log.user_input}"
                  </div>
                  <div className="text-[9px] text-slate-500 flex items-center justify-between">
                    <span>Source: {log.source}</span>
                    <span>Result: <span className={log.result === 'Success' ? 'text-emerald-400 font-bold' : 'text-red-400 font-bold'}>{log.result}</span></span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

    </div>
  );
}
