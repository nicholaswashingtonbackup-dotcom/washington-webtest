/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '../lib/store';
import { routeAgent, buildAgentPayload } from '../lib/ai-agents';
import { COMMANDS } from '../lib/command-registry';
import { COMPONENT_TEMPLATES } from '../data/templates';
import { Mic, MicOff, Sparkles, Loader2, Play, Volume2, CornerDownLeft } from 'lucide-react';

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
    createHistoryCheckpoint
  } = useStore();

  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  
  // Ref for speech recognition
  const recognitionRef = useRef<any>(null);

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
        setErrorMsg('');
      };

      rec.onresult = (e: any) => {
        const text = e.results[0][0].transcript;
        setTranscript(text);
        processVoiceCommand(text);
      };

      rec.onerror = (e: any) => {
        console.error("Speech Recognition Error:", e);
        setIsListening(false);
        if (e.error === 'not-allowed') {
          setErrorMsg("Microphone disabled in browser settings or within iframe sandbox.");
        } else {
          setErrorMsg(`Microphone error: ${e.error}`);
        }
      };

      rec.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = rec;
    }
  }, []);

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
  const applyCommandToCanvas = (action: any) => {
    const { command, params } = action;
    const activePage = pages.find(p => p.id === activePageId) || pages[0];
    let currentHTML = activePage?.html || "";

    console.log(`[Canvas Command Engine] Executing action: ${command}`, params);

    switch (command) {
      case 'add_hero':
        // Generate Hero with template HERO_SAAS or HERO_PORTFOLIO
        const hTemplate = params.template === "HERO_PORTFOLIO" ? COMPONENT_TEMPLATES.HERO_PORTFOLIO : COMPONENT_TEMPLATES.HERO_SAAS;
        currentHTML = currentHTML + "\n" + hTemplate.html;
        break;

      case 'add_navbar':
        currentHTML = COMPONENT_TEMPLATES.NAVBAR_STANDARD.html + "\n" + currentHTML;
        break;

      case 'add_footer':
        currentHTML = currentHTML + "\n" + COMPONENT_TEMPLATES.FOOTER_FULL.html;
        break;

      case 'add_pricing':
        currentHTML = currentHTML + "\n" + COMPONENT_TEMPLATES.PRICING_3_TIER.html;
        break;

      case 'add_features':
        currentHTML = currentHTML + "\n" + COMPONENT_TEMPLATES.FEATURES_GRID.html;
        break;

      case 'add_testimonials':
        currentHTML = currentHTML + "\n" + COMPONENT_TEMPLATES.TESTIMONIALS_CAROUSEL.html;
        break;

      case 'add_faq':
        currentHTML = currentHTML + "\n" + COMPONENT_TEMPLATES.FAQ_ACCORDION.html;
        break;

      case 'add_team':
        currentHTML = currentHTML + "\n" + COMPONENT_TEMPLATES.TEAM_GRID.html;
        break;

      case 'add_gallery':
        currentHTML = currentHTML + "\n" + COMPONENT_TEMPLATES.GALLERY_MASONRY.html;
        break;

      case 'add_blog_cards':
        currentHTML = currentHTML + "\n" + COMPONENT_TEMPLATES.BLOG_CARDS.html;
        break;

      case 'add_contact':
        currentHTML = currentHTML + "\n" + COMPONENT_TEMPLATES.CONTACT_FORM.html;
        break;

      case 'add_cta':
        currentHTML = currentHTML + "\n" + COMPONENT_TEMPLATES.CTA_SECTION.html;
        break;

      case 'add_heading':
        const level = params.level || "2";
        const text = params.text || "SiteForge Heading";
        const align = params.align || "center";
        const hColor = params.color || "var(--text-color)";
        const headingElement = `<h${level} class="text-3xl text-${align} font-bold my-6" style="color: ${hColor}; font-family: var(--heading-font);">${text}</h${level}>`;
        currentHTML = currentHTML + "\n" + headingElement;
        break;

      case 'add_paragraph':
        const pText = params.text || "This is a descriptive paragraph generated dynamically by the design copy assistant.";
        const pAlign = params.align || "left";
        const pColor = params.color || "var(--text-color)";
        const paragraphElement = `<p class="max-w-3xl my-4 text-${pAlign} opacity-80 text-base" style="color: ${pColor};">${pText}</p>`;
        currentHTML = currentHTML + "\n" + paragraphElement;
        break;

      case 'add_spacer':
        const height = params.height || "48px";
        const spacerElement = `<div style="height: ${height};" class="block w-full"></div>`;
        currentHTML = currentHTML + "\n" + spacerElement;
        break;

      case 'add_divider':
        const dividerElement = `<hr class="my-10 opacity-10 border-t" style="border-color: var(--text-color);" />`;
        currentHTML = currentHTML + "\n" + dividerElement;
        break;

      case 'change_background':
        if (params.value) {
          applyTokens({ backgroundColor: params.value });
        }
        break;

      case 'change_color':
        if (params.property === 'primaryColor' || params.property === 'primary') {
          applyTokens({ primaryColor: params.value });
        } else if (params.property === 'secondaryColor' || params.property === 'secondary') {
          applyTokens({ secondaryColor: params.value });
        }
        break;

      case 'change_font':
        if (params.fontFamily) {
          applyTokens({ fontFamily: params.fontFamily, headingFont: params.fontFamily });
        }
        break;

      case 'update_text':
        // Advanced element title swapping inside canvas
        if (params.text) {
          // Replace H1 title text
          const hasH1 = /<h1\b[^>]*>([\s\S]*?)<\/h1>/i.test(currentHTML);
          if (hasH1 && params.text) {
            currentHTML = currentHTML.replace(/(<h1\b[^>]*>)([\s\S]*?)(<\/h1>)/i, `$1${params.text}$3`);
          }
        }
        break;

      case 'create_page':
        if (params.name) {
          addPage(params.name, params.template);
          return; // Add page already prompts snapshot and audits triggers
        }
        break;

      default:
        console.warn(`[Canvas Engine] Command not mapped inside voice fallback: ${command}`);
        break;
    }

    // Apply & Track snapshots (Section 1 Safety Middleware runs inside updateActivePageCanvas!)
    updateActivePageCanvas(currentHTML);
    createHistoryCheckpoint(`AI Agent action: ${command}`);
    runAudits();
  };

  const processVoiceCommand = async (vCommand: string) => {
    if (!vCommand.trim()) return;
    setIsProcessing(true);
    setAiResponse('');
    setErrorMsg('');

    try {
      // 1. Triage context and choose agent
      const chosenAgent = routeAgent(vCommand);
      console.log(`[Agent Router] Selected specialist: ${chosenAgent.name} for request: "${vCommand}"`);

      // 2. Build complete prompt
      const payloadPrompt = buildAgentPayload(
        chosenAgent,
        vCommand,
        projectContext,
        Object.keys(COMMANDS)
      );

      // 3. Dispatch request to Express API server
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: vCommand,
          systemPrompt: chosenAgent.systemPrompt,
          useProvider: 'auto'
        })
      });

      if (!res.ok) {
        throw new Error(`Server returned error status code: ${res.status}`);
      }

      const data = await res.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      const action = data.response;
      if (action && action.command) {
        // Run safe check mapping
        applyCommandToCanvas(action);

        let spokenFeedback = `Applied command ${action.command.replace('_', ' ')}.`;
        if (action.command === 'add_hero') {
          spokenFeedback = "I have successfully compiled a new SaaS hero section with customized gradients to support your launch!";
        } else if (action.command.startsWith('change_')) {
          spokenFeedback = "Your design tokens have been re-calibrated. Take a look at the live preview!";
        } else if (action.command === 'update_text') {
          spokenFeedback = "I updated the main visual text copy with your catchy headline.";
        }

        setAiResponse(spokenFeedback);
        speakText(spokenFeedback);
      } else {
        throw new Error("AI output layout didn't match the command registry schema structure.");
      }

    } catch (err: any) {
      console.error("[Voice Command Error]", err);
      // Fallback rule alert
      const errText = err?.message || "Communication pipeline block.";
      setErrorMsg(errText);
      speakText("I was unable to synchronize that visual change. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div id="voice-agent-container" class="rounded-xl border p-4 bg-slate-900 border-slate-800 text-slate-200">
      <div class="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
        <div class="flex items-center gap-2">
          <Sparkles class="w-4 h-4 text-violet-400 rotate-12" />
          <h4 class="text-xs font-bold uppercase tracking-wider text-slate-400">Speech & Agent Router</h4>
        </div>
        <div class="flex items-center gap-2">
          <div class={`w-2 h-2 rounded-full ${isListening ? 'bg-red-500 animate-ping' : 'bg-slate-700'}`}></div>
          <span class="text-[10px] text-slate-500">{isListening ? 'Listening...' : 'Idle'}</span>
        </div>
      </div>

      <div class="flex items-center gap-3">
        <button 
          id="mic-trigger-btn"
          onClick={isListening ? stopListening : startListening}
          disabled={isProcessing}
          class={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg ${
            isListening 
              ? 'bg-red-600 hover:bg-red-700 text-white scale-105 animate-pulse' 
              : 'bg-violet-600 hover:bg-violet-700 hover:shadow-violet-900/40 text-white'
          } disabled:opacity-40`}
          title="Toggle System Voice Microphone"
        >
          {isListening ? <MicOff class="w-5 h-5" /> : <Mic class="w-5 h-5" />}
        </button>

        <div class="flex-1 relative">
          <input
            type="text"
            placeholder="Or instruct agent: 'Add a SaaS hero section'..."
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                processVoiceCommand(transcript);
              }
            }}
            disabled={isProcessing}
            class="w-full text-xs bg-slate-950 border border-slate-800 rounded-lg py-2.5 pl-3 pr-10 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
          />
          <button 
            onClick={() => processVoiceCommand(transcript)}
            disabled={isProcessing || !transcript}
            class="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-white rounded-md transition-colors"
          >
            {isProcessing ? <Loader2 class="w-3.5 h-3.5 animate-spin text-violet-400" /> : <CornerDownLeft class="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {errorMsg && (
        <div class="mt-2.5 p-2 rounded bg-opacity-10 border border-opacity-20 text-[11px] flex gap-1.5 items-start bg-red-500 border-red-500 text-red-400">
          <div class="w-1.5 h-1.5 rounded-full bg-red-500 mt-1 flex-shrink-0"></div>
          <span>{errorMsg}</span>
        </div>
      )}

      {aiResponse && (
        <div class="mt-2.5 p-2 rounded text-[11px] bg-slate-950/60 border border-slate-800/80 text-violet-300 flex items-center justify-between gap-2.5">
          <span class="flex-1 italic">🤖 "{aiResponse}"</span>
          <button 
            onClick={() => speakText(aiResponse)}
            class="p-1 text-slate-500 hover:text-slate-300 transition-colors"
            title="Read back spoke description"
          >
            <Volume2 class="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
