/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import { useStore } from '../lib/store';
import { Maximize2, Monitor, Tablet, Smartphone, Code, HeartCrack, Loader2 } from 'lucide-react';

export default function WorkspaceCanvas() {
  const { 
    pages, 
    activePageId, 
    designTokens, 
    viewMode, 
    setViewMode,
    updateActivePageCanvas 
  } = useStore();

  const [rawHTML, setRawHTML] = useState('');
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const activePage = pages.find(p => p.id === activePageId) || pages[0];

  useEffect(() => {
    if (activePage) {
      setRawHTML(activePage.html);
    }
  }, [activePage, activePageId]);

  // Synchronize canvas changes from direct text changes
  const handleHTMLChange = (val: string) => {
    setRawHTML(val);
    updateActivePageCanvas(val);
  };

  // Compile full iframe HTML with CDNs and CSS variables
  const compileIframeDoc = () => {
    if (!activePage) return "<!-- No active page content -->";

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
        <!-- Tailwind CSS CDN -->
        <script src="https://cdn.tailwindcss.com"></script>
        <!-- Font Links -->
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@500;700&family=Outfit:wght@400;500;600;700&family=Playfair+Display:ital,wght@0,600;0,700;1,400&family=Plus+Jakarta+Sans:wght@500;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
        
        <style>
          ${cssVariables}
          body {
            font-family: var(--font-family);
            background-color: var(--bg-color);
            color: var(--text-color);
            margin: 0;
            padding: 0;
            min-height: 100vh;
            transition: background-color 0.3s ease, color 0.3s ease;
          }
          h1, h2, h3, h4, h5, h6 {
            font-family: var(--heading-font);
          }
          /* Custom interactive elements outline on hover for editing feel */
          .df-hoverable:hover {
            outline: 2px dashed var(--primary-color);
            outline-offset: -2px;
            cursor: pointer;
          }
          ${activePage.css || ''}
        </style>
      </head>
      <body>
        <div id="df-sandbox-node">
          ${rawHTML}
        </div>

        <script>
          // Basic interactive text editing setup
          document.addEventListener('click', (e) => {
            const target = e.target;
            if (target && target.tagName !== 'BODY' && target.tagName !== 'HTML') {
              // Trigger a basic contenteditable click to let users change text details directly inside the iframe!
              target.contentEditable = "true";
              target.focus();
              target.addEventListener('blur', () => {
                target.removeAttribute('contentEditable');
                // Communicate next state changes
                window.parent.postMessage({
                  type: 'DF_CANVAS_HTML_UPDATE',
                  html: document.getElementById('df-sandbox-node').innerHTML
                }, '*');
              });
            }
          });

          // Accordion collapses helper
          const headers = document.querySelectorAll("#df-sandbox-node h4.cursor-pointer");
          headers.forEach(header => {
            header.addEventListener("click", () => {
              const panel = header.nextElementSibling;
              if (panel) {
                panel.classList.toggle("hidden");
                const symbol = header.querySelector("span");
                if (symbol) {
                  symbol.textContent = panel.classList.contains("hidden") ? "+" : "-";
                }
              }
            });
          });
        </script>
      </body>
      </html>
    `.trim();
  };

  useEffect(() => {
    // Listen for inline html updates from within the iframe's design interaction node
    const handleMessage = (e: MessageEvent) => {
      if (e.data && e.data.type === 'DF_CANVAS_HTML_UPDATE') {
        handleHTMLChange(e.data.html);
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // Compute width based on simulated screen mode
  const widthClasses: Record<string, string> = {
    desktop: 'w-full max-w-full h-full',
    tablet: 'w-[768px] h-[92%] border-x border-slate-700/60 shadow-2xl rounded-2xl my-auto',
    mobile: 'w-[375px] h-[85%] border-x border-slate-700/65 shadow-2xl rounded-[32px] my-auto border-[10px] border-slate-950'
  };

  const modePixel: Record<string, string> = {
    desktop: 'Full Fluid Frame',
    tablet: '768px × 1024px',
    mobile: '375px × 812px'
  };

  return (
    <div id="canvas-main-viewport" class="flex-1 bg-[#12132b] flex flex-col items-center justify-center p-4 relative overflow-hidden h-full">
      {/* Upper viewport sizing bar */}
      <div class="w-full flex items-center justify-between mb-2 text-xs text-slate-400 absolute top-4 px-6 z-10">
        <div class="flex items-center gap-2">
          <span class="font-bold text-[10px] uppercase tracking-wider text-slate-500">Live Workspace :</span>
          <span class="text-slate-300 font-mono font-bold text-[11px] bg-slate-950/60 py-1 px-2.5 rounded-md">{activePage.name} page</span>
        </div>
        
        {/* Device Mode Selectors */}
        <div class="flex items-center bg-slate-950/65 border border-slate-800 p-0.5 rounded-lg shadow-inner">
          <button 
            onClick={() => setViewMode('desktop')}
            class={`p-1.5 rounded-md transition ${viewMode === 'desktop' ? 'bg-violet-600 text-white shadow' : 'hover:text-slate-200'}`}
            title="Desktop Mode Simulator"
          >
            <Monitor class="w-4 h-4" />
          </button>
          <button 
            onClick={() => setViewMode('tablet')}
            class={`p-1.5 rounded-md transition ${viewMode === 'tablet' ? 'bg-violet-600 text-white shadow' : 'hover:text-slate-200'}`}
            title="Tablet Mode Simulator"
          >
            <Tablet class="w-4 h-4" />
          </button>
          <button 
            onClick={() => setViewMode('mobile')}
            class={`p-1.5 rounded-md transition ${viewMode === 'mobile' ? 'bg-violet-600 text-white shadow' : 'hover:text-slate-200'}`}
            title="Mobile Mode Simulator"
          >
            <Smartphone class="w-4 h-4" />
          </button>
        </div>

        <div class="text-[10px] font-mono text-slate-500">{modePixel[viewMode]}</div>
      </div>

      {/* Frame Canvas Wrapper */}
      <div 
        id="simulated-browser-frame"
        class={`transition-all duration-300 bg-slate-950 overflow-hidden flex items-center justify-center ${widthClasses[viewMode]} shadow-2xl relative mt-8`}
      >
        <iframe
          ref={iframeRef}
          srcDoc={compileIframeDoc()}
          class="w-full h-full border-none bg-slate-950"
          title="SiteForge Active Iframe Sandbox"
          referrerPolicy="no-referrer"
        />

        {/* Small watermarks describing interaction rules */}
        <div class="absolute bottom-3 right-4 bg-slate-950/80 border border-slate-800 backdrop-blur-md py-1 px-2 rounded text-[9px] font-semibold text-slate-400 pointer-events-none tracking-wider uppercase">
          💡 Click headers / text inside to inline edit
        </div>
      </div>
    </div>
  );
}
