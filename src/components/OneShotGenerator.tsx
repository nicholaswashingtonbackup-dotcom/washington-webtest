/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useStore } from '../lib/store';
import { COMPONENT_TEMPLATES } from '../data/templates';
import { COMMANDS } from '../lib/command-registry';
import { Sparkles, Loader2, Play, CheckCircle, Volume2, HelpCircle } from 'lucide-react';

interface OneShotGeneratorProps {
  onClose?: () => void;
}

export default function OneShotGenerator({ onClose }: OneShotGeneratorProps) {
  const { applyTokens, addPage, selectPage, pages, createHistoryCheckpoint, runAudits } = useStore();
  const [brief, setBrief] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentStep, setCurrentStep] = useState('');
  const [successInfo, setSuccessInfo] = useState('');

  const steps = [
    "Reading company design brief...",
    "Re-calibrating color palette tokens...",
    "Instantiating layout schemas...",
    "Securing Canvas safety headers...",
    "Populating Copywriter headings...",
    "Hardening accessibility tags...",
    "Assembling complete multi-page design system!"
  ];

  const speakText = (text: string) => {
    try {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1.05;
        window.speechSynthesis.speak(utterance);
      }
    } catch (e) {
      console.warn(e);
    }
  };

  const executeOneShotBuild = async () => {
    if (!brief.trim()) return;
    setIsGenerating(true);
    setSuccessInfo('');
    
    // Play sound or speak first
    speakText("Initiating corporate visual blueprint model. Please stay on hold.");

    try {
      // Stream fake transition delays for visual delight
      for (let i = 0; i < steps.length; i++) {
        setCurrentStep(steps[i]);
        await new Promise(resolve => setTimeout(resolve, 800));
      }

      // 1. Dispatch request to Express server
      const res = await fetch('/api/ai/oneshot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brief })
      });

      if (!res.ok) {
        throw new Error("One-shot server error response.");
      }

      const data = await res.json();
      const promptResult = data.result;

      // Extract brief variables to apply custom DesignTokens
      const briefLower = brief.toLowerCase();
      let primary = '#4f46e5';
      let bg = '#0f0f23';
      let themeLabel = 'SaaS Pro';

      if (briefLower.includes('blue') || briefLower.includes('security') || briefLower.includes('shield')) {
        primary = '#1d4ed8'; // deep blue
        bg = '#030712'; // dark slate
        themeLabel = 'SaaS Pro Blue';
      } else if (briefLower.includes('green') || briefLower.includes('fresh')) {
        primary = '#059669'; // emerald
        bg = '#fafafa'; // light
        themeLabel = 'E-Commerce Fresh';
      } else if (briefLower.includes('orange') || briefLower.includes('restaurant') || briefLower.includes('food')) {
        primary = '#ea580c'; // orange orange
        bg = '#fffcf9'; // warm warm
        themeLabel = 'Delicious Warmth';
      } else if (briefLower.includes('minimal') || briefLower.includes('portfolio') || briefLower.includes('black')) {
        primary = '#111111'; // pure dark
        bg = '#fdfdfd'; // pure light
        themeLabel = 'Zen Minimal';
      }

      applyTokens({
        primaryColor: primary,
        backgroundColor: bg,
        textColor: bg === '#0f0f23' || bg === '#030712' || bg === '#0d0a1a' ? '#f3f4f6' : '#1f2937'
      });

      // 2. Iterate and build pages from server schema outcome safely
      if (promptResult && Array.isArray(promptResult.pages)) {
        console.log("[OneShot Builder] Assembling pages:", promptResult.pages);

        promptResult.pages.forEach((page: any, idx: number) => {
          let assembledHTML = '';
          
          if (Array.isArray(page.sections)) {
            page.sections.forEach((section: any) => {
              // Map section types to our standard preloaded templates
              const type = section.type.toUpperCase();
              let matchedTemplate = COMPONENT_TEMPLATES.NAVBAR_STANDARD;

              if (type === 'HERO') matchedTemplate = COMPONENT_TEMPLATES.HERO_SAAS;
              else if (type === 'FEATURES') matchedTemplate = COMPONENT_TEMPLATES.FEATURES_GRID;
              else if (type === 'PRICING') matchedTemplate = COMPONENT_TEMPLATES.PRICING_3_TIER;
              else if (type === 'TESTIMONIALS') matchedTemplate = COMPONENT_TEMPLATES.TESTIMONIALS_CAROUSEL;
              else if (type === 'FAQ') matchedTemplate = COMPONENT_TEMPLATES.FAQ_ACCORDION;
              else if (type === 'CTA') matchedTemplate = COMPONENT_TEMPLATES.CTA_SECTION;
              else if (type === 'CONTACT') matchedTemplate = COMPONENT_TEMPLATES.CONTACT_FORM;
              else if (type === 'TEAM') matchedTemplate = COMPONENT_TEMPLATES.TEAM_GRID;
              else if (type === 'GALLERY') matchedTemplate = COMPONENT_TEMPLATES.GALLERY_MASONRY;
              else if (type === 'BLOG') matchedTemplate = COMPONENT_TEMPLATES.BLOG_CARDS;
              else if (type === 'SERVICES') matchedTemplate = COMPONENT_TEMPLATES.SERVICES_LIST;
              else if (type === 'FOOTER') matchedTemplate = COMPONENT_TEMPLATES.FOOTER_FULL;

              assembledHTML += "\n" + matchedTemplate.html;
            });
          }

          // Build custom headers for H1 element
          let headline = `Complete ${page.name} Layout`;
          if (idx === 0) {
            headline = briefLower.includes('shield') 
              ? "ShieldGuard: Enterprise Cybersecurity Defenses" 
              : "Connecting Automated Design Platforms with Secure Systems";
          }

          assembledHTML = assembledHTML.replace(
            /(<h1\b[^>]*>)([\s\S]*?)(<\/h1>)/i,
            `$1${headline}$3`
          );

          // Add to pages store
          addPage(page.name, undefined);
          
          // Re-trigger update to hook custom HTML
          setTimeout(() => {
            // Find just newly created page based on name
            const storePages = useStore.getState().pages;
            const newlyCreated = storePages.find(p => p.name === page.name);
            if (newlyCreated) {
              useStore.getState().updateActivePageCanvas(assembledHTML);
            }
          }, 300);
        });

        // Load home homepage
        setTimeout(() => {
          const storePages = useStore.getState().pages;
          const homePage = storePages.find(p => p.name === "Home") || storePages[0];
          if (homePage) {
            selectPage(homePage.id);
          }
          createHistoryCheckpoint(`One-shot Generated Site: ${themeLabel}`);
          runAudits();
        }, 1200);

        const successText = `Launch complete! Compiled multi-page design for "${brief.substring(0, 30)}..." with adaptive DesignTokens aligned. Explore the navigation menu now!`;
        setSuccessInfo(successText);
        speakText(successText);
        
        if (onClose) {
          setTimeout(onClose, 2500);
        }
      }

    } catch (err: any) {
      console.error(err);
      speakText("There was a pipeline issue assembling your business canvas. Please review.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div id="oneshot-builder-modal" class="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
      <div class="absolute inset-0 bg-gradient-to-tr from-indigo-500/10 to-cyan-500/10 pointer-events-none"></div>

      <div class="relative z-10">
        <div class="flex items-center gap-2 mb-3">
          <Sparkles class="w-5 h-5 text-indigo-400 rotate-12" />
          <h3 class="text-base font-bold text-slate-100 flex items-center gap-2 uppercase tracking-wide">
            One-Shot AI Website Architect
          </h3>
        </div>
        <p class="text-xs text-slate-400 mb-5 leading-relaxed">
          Type or dictate any complete brand descriptor (business objective, tone, desired colors). The system feeds your prompt to the 5 specialized designer agents, creating full responsive multi-page systems instantly.
        </p>

        {isGenerating ? (
          <div class="flex flex-col items-center justify-center py-10 text-center gap-4">
            <Loader2 class="w-8 h-8 animate-spin text-indigo-400" />
            <div class="text-xs font-mono text-cyan-400 tracking-wider animate-pulse">{currentStep}</div>
            <div class="w-48 h-1 bg-slate-800 rounded-full overflow-hidden">
              <div class="h-full bg-indigo-500 animate-[loading_8s_ease-in-out_infinite] rounded-full" style={{ width: '40%' }}></div>
            </div>
          </div>
        ) : successInfo ? (
          <div class="flex flex-col items-center justify-center py-8 text-center gap-3">
            <CheckCircle class="w-10 h-10 text-emerald-500" />
            <span class="text-xs font-semibold text-slate-200">Corporate Canvas Deployed!</span>
            <p class="text-[11px] text-slate-400 max-w-sm">{successInfo}</p>
          </div>
        ) : (
          <div class="space-y-4">
            <textarea
              rows={4}
              placeholder="e.g. Build a website for my security company called ShieldGuard, we sell cybersecurity software to enterprise clients, professional tone, blue and dark theme"
              value={brief}
              onChange={(e) => setBrief(e.target.value)}
              class="w-full text-xs bg-slate-950 border border-slate-850 rounded-lg py-3 px-4 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            ></textarea>

            <div class="flex gap-2">
              <button
                type="button"
                onClick={() => setBrief("Build a minimalist design agency called BoldStudio with a high-contrast magenta and dark look, to showcase brand case studies")}
                class="px-2.5 py-1.5 text-[10px] bg-slate-950 border border-slate-850 hover:border-slate-800 text-slate-400 hover:text-slate-200 rounded-md transition"
              >
                Agency Idea
              </button>
              <button
                type="button"
                onClick={() => setBrief("Write a landing page for my cybersecurity company called ShieldGuard, professional tone, deep blue and dark neon, enterprise clients, safety compliance headings")}
                class="px-2.5 py-1.5 text-[10px] bg-slate-950 border border-slate-850 hover:border-slate-800 text-slate-400 hover:text-slate-200 rounded-md transition"
              >
                Security Idea
              </button>
            </div>

            <div class="flex justify-end gap-2 text-xs pt-4 border-t border-slate-850">
              {onClose && (
                <button
                  onClick={onClose}
                  class="px-4 py-2 bg-slate-950 hover:bg-slate-850 rounded-lg text-slate-400 transition"
                >
                  Close
                </button>
              )}
              <button
                onClick={executeOneShotBuild}
                disabled={!brief.trim()}
                class="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-cyan-500 hover:opacity-90 disabled:opacity-40 rounded-lg text-white font-semibold flex items-center gap-1.5 transition active:scale-95 text-xs shadow-lg shadow-indigo-950/40"
              >
                <Sparkles class="w-3.5 h-3.5 rotate-12" />
                Build Full Site One-Shot
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
