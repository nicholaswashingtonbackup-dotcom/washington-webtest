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
    updateActivePageCanvas,
    setActiveSelection
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
          // Element Inspector overlay + hover renderer
          const overlay = document.createElement("div");
          overlay.id = "df-inspector-element-overlay";
          overlay.style.position = "absolute";
          overlay.style.pointerEvents = "none";
          overlay.style.zIndex = "99999";
          overlay.style.borderWidth = "2px";
          overlay.style.borderStyle = "solid";
          overlay.style.transition = "all 0.1s ease";
          overlay.style.display = "none";
          
          const label = document.createElement("div");
          label.style.position = "absolute";
          label.style.top = "-24px";
          label.style.left = "-2px";
          label.style.padding = "2px 8px";
          label.style.fontSize = "10px";
          label.style.fontWeight = "bold";
          label.style.color = "white";
          label.style.borderRadius = "4px";
          label.style.fontFamily = "sans-serif";
          label.style.boxShadow = "0 2px 4px rgba(0,0,0,0.2)";
          overlay.appendChild(label);
          document.body.appendChild(overlay);

          document.addEventListener('mouseover', (e) => {
            const target = e.target;
            if (!target || target === document.body || target === document.documentElement) return;
            
            // Find section or block element
            const block = target.closest("#df-sandbox-node > section, #df-sandbox-node > header, #df-sandbox-node > footer, #df-sandbox-node > div") || target.closest("button, img, iframe, article");
            if (!block) return;

            let type = "Section";
            let color = "#3b82f6"; // Section: Blue
            let icon = "🟦";

            const tag = block.tagName.toLowerCase();
            const idStr = (block.id || "").toLowerCase();
            const classStr = (block.className || "").toLowerCase();

            if (tag === 'header' || idStr.includes("nav") || classStr.includes("nav") || idStr.includes("menu")) {
              type = "Navbar";
              color = "#6366f1"; // Navbar: indigo
              icon = "➕";
            } else if (tag === 'footer' || idStr.includes("footer") || classStr.includes("footer")) {
              type = "Footer";
              color = "#78350f"; // Footer: brown
              icon = "🟫";
            } else if (idStr.includes("hero") || classStr.includes("hero")) {
              type = "Hero";
              color = "#a855f7"; // Hero: purple
              icon = "🟪";
            } else if (idStr.includes("gallery") || classStr.includes("gallery") || idStr.includes("portfolio")) {
              type = "Gallery";
              color = "#10b981"; // Gallery: green
              icon = "🟩";
            } else if (tag === 'button' || classStr.includes("btn")) {
              type = "Button";
              color = "#eab308"; // Button: yellow
              icon = "🟨";
            } else if (tag === 'video' || tag === 'iframe' || classStr.includes("video")) {
              type = "Video";
              color = "#ef4444"; // Video: red
              icon = "🟥";
            }

            if (!block.id) {
              block.id = "block_" + type.toLowerCase() + "_" + Math.random().toString(36).substring(2, 8);
            }

            const rect = block.getBoundingClientRect();
            const scrollY = window.pageYOffset || document.documentElement.scrollTop;
            const scrollX = window.pageXOffset || document.documentElement.scrollLeft;

            overlay.style.width = rect.width + "px";
            overlay.style.height = rect.height + "px";
            overlay.style.top = (rect.top + scrollY) + "px";
            overlay.style.left = (rect.left + scrollX) + "px";
            overlay.style.borderColor = color;
            overlay.style.display = "block";
            
            label.style.backgroundColor = color;
            label.textContent = icon + " " + type + " (#" + block.id + ")";
            block.setAttribute("data-df-inspected-type", type);
          });

          document.addEventListener('mouseout', () => {
            overlay.style.display = "none";
          });

          // Basic interactive text editing setup + selection communication
          document.addEventListener('click', (e) => {
            const target = e.target;
            if (target && target.tagName !== 'BODY' && target.tagName !== 'HTML') {
              const block = target.closest("#df-sandbox-node > section, #df-sandbox-node > header, #df-sandbox-node > footer, #df-sandbox-node > div") || target.closest("button, img, iframe, article") || target;
              const type = block.getAttribute("data-df-inspected-type") || "Section";
              if (!block.id) {
                block.id = "block_click_" + Math.random().toString(36).substring(2, 8);
              }

              // Send selection report
              window.parent.postMessage({
                type: 'DF_BLOCK_SELECTED',
                blockId: block.id,
                blockType: type
              }, '*');
              
              // Trigger inline editable text
              if (target.tagName !== 'IMG' && target.tagName !== 'IFRAME' && target.tagName !== 'VIDEO') {
                target.contentEditable = "true";
                target.focus();
                target.addEventListener('blur', () => {
                  target.removeAttribute('contentEditable');
                  window.parent.postMessage({
                    type: 'DF_CANVAS_HTML_UPDATE',
                    html: document.getElementById('df-sandbox-node').innerHTML
                  }, '*');
                });
              }
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
    // Listen for inline html updates and selections from within the iframe
    const handleMessage = (e: MessageEvent) => {
      if (e.data) {
        if (e.data.type === 'DF_CANVAS_HTML_UPDATE') {
          handleHTMLChange(e.data.html);
        } else if (e.data.type === 'DF_BLOCK_SELECTED') {
          setActiveSelection(e.data.blockId, e.data.blockType);
        }
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [setActiveSelection]);

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
    <div id="canvas-main-viewport" className="flex-1 bg-[#12132b] flex flex-col items-center justify-center p-4 relative overflow-hidden h-full">
      {/* Upper viewport sizing bar */}
      <div className="w-full flex items-center justify-between mb-2 text-xs text-slate-400 absolute top-4 px-6 z-10">
        <div className="flex items-center gap-2">
          <span className="font-bold text-[10px] uppercase tracking-wider text-slate-500">Live Workspace :</span>
          <span className="text-slate-300 font-mono font-bold text-[11px] bg-slate-950/60 py-1 px-2.5 rounded-md">{activePage.name} page</span>
        </div>
        
        {/* Device Mode Selectors */}
        <div className="flex items-center bg-slate-950/65 border border-slate-800 p-0.5 rounded-lg shadow-inner">
          <button 
            onClick={() => setViewMode('desktop')}
            className={`p-1.5 rounded-md transition ${viewMode === 'desktop' ? 'bg-violet-600 text-white shadow' : 'hover:text-slate-200'}`}
            title="Desktop Mode Simulator"
          >
            <Monitor className="w-4 h-4" />
          </button>
          <button 
            onClick={() => setViewMode('tablet')}
            className={`p-1.5 rounded-md transition ${viewMode === 'tablet' ? 'bg-violet-600 text-white shadow' : 'hover:text-slate-200'}`}
            title="Tablet Mode Simulator"
          >
            <Tablet className="w-4 h-4" />
          </button>
          <button 
            onClick={() => setViewMode('mobile')}
            className={`p-1.5 rounded-md transition ${viewMode === 'mobile' ? 'bg-violet-600 text-white shadow' : 'hover:text-slate-200'}`}
            title="Mobile Mode Simulator"
          >
            <Smartphone className="w-4 h-4" />
          </button>
        </div>

        <div className="text-[10px] font-mono text-slate-500">{modePixel[viewMode]}</div>
      </div>

      {/* Frame Canvas Wrapper */}
      <div 
        id="simulated-browser-frame"
        className={`transition-all duration-300 bg-slate-950 overflow-hidden flex items-center justify-center ${widthClasses[viewMode]} shadow-2xl relative mt-8`}
      >
        <iframe
          ref={iframeRef}
          srcDoc={compileIframeDoc()}
          className="w-full h-full border-none bg-slate-950"
          title="SiteForge Active Iframe Sandbox"
          referrerPolicy="no-referrer"
        />

        {/* Small watermarks describing interaction rules */}
        <div className="absolute bottom-3 right-4 bg-slate-950/80 border border-slate-800 backdrop-blur-md py-1 px-2 rounded text-[9px] font-semibold text-slate-400 pointer-events-none tracking-wider uppercase">
          💡 Click headers / text inside to inline edit
        </div>
      </div>
    </div>
  );
}
