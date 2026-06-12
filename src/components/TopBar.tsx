/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useStore } from '../lib/store';
import { checkOllamaHealth } from '../lib/ollama-health';
import { buildProductionHTML, simulateNetlifyDeploy, buildReactComponentCode, generateSitemap, generateRobots, generateManifest } from '../utils/export';
import { 
  Sparkles, 
  Settings, 
  ExternalLink, 
  Download, 
  Network, 
  CloudLightning, 
  Globe, 
  Layers, 
  Loader2, 
  CheckCircle,
  HelpCircle
} from 'lucide-react';

export default function TopBar() {
  const { 
    pages, 
    activePageId, 
    designTokens, 
    projectContext, 
    ollamaStatus, 
    setOllamaStatus,
    availableModels
  } = useStore();

  const [isDeploying, setIsDeploying] = useState(false);
  const [deployedUrl, setDeployedUrl] = useState('');
  
  // Export modal settings
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportFormat, setExportFormat] = useState<'html' | 'react' | 'zip' | 'folder'>('html');
  const [minify, setMinify] = useState(true);
  const [includeSEO, setIncludeSEO] = useState(true);
  
  // Folder export specific state
  const [folderExportState, setFolderExportState] = useState<'idle' | 'writing' | 'success' | 'error'>('idle');
  const [targetFolderName, setTargetFolderName] = useState('');

  // Monitor Ollama connections
  const checkHealth = async () => {
    setOllamaStatus('checking');
    try {
      const state = await checkOllamaHealth();
      setOllamaStatus(state.status, state.availableModels);
    } catch (e) {
      setOllamaStatus('offline');
    }
  };

  useEffect(() => {
    checkHealth();
  }, []);

  const handleNetlifyPublish = async () => {
    setIsDeploying(true);
    setDeployedUrl('');
    
    try {
      // Build full production optimized HTML code
      const prodHTML = buildProductionHTML(pages, designTokens, activePageId, {
        format: 'html',
        minifyHTML: true,
        minifyCSS: true,
        minifyJS: true,
        inlineResources: true,
        includeSEO: true,
        includePWA: true
      });

      // Query netlify simulator helper
      const deployResult = await simulateNetlifyDeploy(prodHTML);
      setDeployedUrl(deployResult.liveUrl);

    } catch (err) {
      console.error(err);
    } finally {
      setIsDeploying(false);
    }
  };

  const handleExportToFolder = async () => {
    setFolderExportState('writing');
    try {
      if (!('showDirectoryPicker' in window)) {
        throw new Error("File System Access API is not supported in this iframe or browser. Note that inside sandboxed preview iframes, directory pickers may be restricted, please Export as a ZIP / HTML file as a highly optimized fallback or open in a new tab.");
      }
      
      // @ts-ignore
      const dirHandle = await window.showDirectoryPicker({
        mode: 'readwrite',
        startIn: 'documents'
      });
      
      setTargetFolderName(dirHandle.name);
      
      const htmlDoc = buildProductionHTML(pages, designTokens, activePageId, {
        format: 'html',
        minifyHTML: minify,
        minifyCSS: minify,
        minifyJS: minify,
        inlineResources: true,
        includeSEO: includeSEO,
        includePWA: true
      });
      
      // Write index.html
      const htmlFileHandle = await dirHandle.getFileHandle("index.html", { create: true });
      const htmlWritable = await htmlFileHandle.createWritable();
      await htmlWritable.write(htmlDoc);
      await htmlWritable.close();
      
      if (includeSEO) {
        // Write sitemap.xml
        const sitemap = generateSitemap(pages, "https://siteforge.netlify.app");
        const sitemapFileHandle = await dirHandle.getFileHandle("sitemap.xml", { create: true });
        const sitemapWritable = await sitemapFileHandle.createWritable();
        await sitemapWritable.write(sitemap);
        await sitemapWritable.close();
        
        // Write robots.txt
        const robots = generateRobots("https://siteforge.netlify.app");
        const robotsFileHandle = await dirHandle.getFileHandle("robots.txt", { create: true });
        const robotsWritable = await robotsFileHandle.createWritable();
        await robotsWritable.write(robots);
        await robotsWritable.close();
        
        // Write manifest.json
        const manifest = generateManifest(projectContext.businessName, designTokens.primaryColor);
        const manifestFileHandle = await dirHandle.getFileHandle("manifest.json", { create: true });
        const manifestWritable = await manifestFileHandle.createWritable();
        await manifestWritable.write(manifest);
        await manifestWritable.close();
      }
      
      setFolderExportState('success');
      localStorage.setItem('siteforge_last_export_dir', dirHandle.name);
      
      setTimeout(() => {
        setFolderExportState('idle');
        setShowExportModal(false);
      }, 2500);
    } catch (err: any) {
      console.error(err);
      if (err.name === 'AbortError') {
        setFolderExportState('idle');
      } else {
        setFolderExportState('error');
        alert(`Folder export failed: ${err.message}`);
      }
    }
  };

  const handleExportDownload = () => {
    if (exportFormat === 'folder') {
      handleExportToFolder();
      return;
    }

    const activePage = pages.find(p => p.id === activePageId) || pages[0];
    let fileFilename = `${activePage.name.toLowerCase()}.${exportFormat === 'react' ? 'jsx' : 'html'}`;
    let fileBlobContent = '';

    if (exportFormat === 'html') {
      fileBlobContent = buildProductionHTML(pages, designTokens, activePageId, {
        format: 'html',
        minifyHTML: minify,
        minifyCSS: minify,
        minifyJS: minify,
        inlineResources: true,
        includeSEO: includeSEO,
        includePWA: true
      });
    } else if (exportFormat === 'react') {
      fileBlobContent = buildReactComponentCode(activePage.name, activePage.html, designTokens);
    } else {
      // In web, fallback ZIP represents sitemaps, manifests and HTML in sequential package blocks!
      const htmlDoc = buildProductionHTML(pages, designTokens, activePageId, {
        format: 'html',
        minifyHTML: minify,
        minifyCSS: minify,
        minifyJS: minify,
        inlineResources: true,
        includeSEO: includeSEO,
        includePWA: true
      });
      const sitemap = generateSitemap(pages, "https://siteforge.netlify.app");
      const robots = generateRobots("https://siteforge.netlify.app");
      const manifest = generateManifest(projectContext.businessName, designTokens.primaryColor);

      fileFilename = `${projectContext.businessName.toLowerCase().replace(/\s+/g, '-')}-production-bundle.html`;
      fileBlobContent = `
<!-- ==========================================
     SITEFORGE PRODUCTION EXPORT CONTAINER
     ==========================================
     File: index.html
     ========================================== -->
${htmlDoc}


<!-- ==========================================
     File: sitemap.xml
     ========================================== -->
${sitemap}


<!-- ==========================================
     File: robots.txt
     ========================================== -->
${robots}


<!-- ==========================================
     File: manifest.json
     ========================================== -->
${manifest}
      `.trim();
    }

    // Trigger standard physical attachment file browser download
    const blob = new Blob([fileBlobContent], { type: 'text/plain' });
    const domUrl = URL.createObjectURL(blob);
    const mockA = document.createElement('a');
    mockA.href = domUrl;
    mockA.download = fileFilename;
    document.body.appendChild(mockA);
    mockA.click();
    document.body.removeChild(mockA);
    URL.revokeObjectURL(domUrl);

    setShowExportModal(false);
  };

  // Compute status colors
  const ollamaColors = {
    connected: 'text-emerald-400 bg-emerald-950/40 border-emerald-900',
    offline: 'text-rose-400 bg-rose-950/45 border-rose-900',
    queued: 'text-amber-400 bg-amber-950/40 border-amber-900',
    checking: 'text-slate-400 bg-slate-950 border-slate-800'
  };

  return (
    <div id="designer-upper-header" class="h-16 border-b border-slate-800 bg-[#090a18] px-5 flex items-center justify-between text-slate-300">
      
      {/* Brand logo details */}
      <div class="flex items-center gap-2">
        <div class="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-cyan-400 flex items-center justify-center text-white shadow-lg overflow-hidden">
          <Sparkles class="w-4 h-4 text-white" />
        </div>
        <div>
          <span class="text-sm font-black text-slate-100 tracking-tight block">SiteForge</span>
          <span class="text-[9px] text-slate-500 font-mono tracking-wider uppercase">Build websites with your voice. Export to your machine.</span>
        </div>
      </div>

      {/* Center status: Ollama status indicator */}
      <div class="flex items-center gap-2">
        <button 
          onClick={checkHealth}
          class={`flex items-center gap-1.5 px-3 py-1 text-xs border rounded-full transition ${ollamaColors[ollamaStatus]}`}
          title="Click to re-probe system model links"
        >
          <Network class="w-3.5 h-3.5" />
          <span class="font-bold capitalize">{ollamaStatus === 'connected' ? 'Ollama: Llama3' : `Ollama: ${ollamaStatus}`}</span>
        </button>

        {ollamaStatus === 'offline' && (
          <div class="hidden sm:flex items-center gap-1 text-[10px] text-indigo-400 bg-indigo-950/40 border border-indigo-900 py-1 px-2.5 rounded-full font-semibold">
            <CloudLightning class="w-3 h-3 text-indigo-400 animate-pulse" />
            <span>Hybrid Failover Active: Server Gemini 3.5 Flash</span>
          </div>
        )}
      </div>

      {/* Fast actions controls */}
      <div class="flex items-center gap-2.5 text-xs">
        {deployedUrl && (
          <a 
            href={deployedUrl} 
            exact="true"
            target="_blank" 
            rel="noopener noreferrer"
            class="hidden md:flex items-center gap-1 text-xs text-indigo-300 hover:text-indigo-200 bg-indigo-950/45 py-2 px-3 border border-indigo-900/60 rounded-lg transition"
          >
            <Globe class="w-3.5 h-3.5" />
            Launch Live Website
            <ExternalLink class="w-3 h-3" />
          </a>
        )}

        <button 
          onClick={handleNetlifyPublish}
          disabled={isDeploying}
          class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 rounded-lg text-white font-bold flex items-center gap-2 transition tracking-wide active:scale-95 shadow"
        >
          {isDeploying ? (
            <>
              <Loader2 class="w-3.5 h-3.5 animate-spin" />
              <span>Deploying to Netlify...</span>
            </>
          ) : (
            <>
              <Globe class="w-3.5 h-3.5" />
              <span>Netlify Publish</span>
            </>
          )}
        </button>

        <button 
          onClick={() => setShowExportModal(true)}
          class="px-3.5 py-2 bg-slate-950 border border-slate-850 hover:border-slate-800 text-slate-300 font-bold rounded-lg flex items-center gap-1.5 transition"
        >
          <Download class="w-3.5 h-3.5" />
          <span>Export Bundle</span>
        </button>
      </div>

      {/* Bundle Export Configuration Modal */}
      {showExportModal && (
        <div class="fixed inset-0 bg-black/75 z-[999] flex items-center justify-center p-4 backdrop-blur-sm">
          <div class="bg-slate-900 border border-slate-800 rounded-xl p-5 max-w-md w-full shadow-2xl space-y-4">
            <h4 class="text-sm font-bold text-slate-100 flex items-center gap-2">
              <Download class="w-4 h-4 text-indigo-400" />
              Configure Production Bundle Export
            </h4>
            
            <div class="space-y-3.5 text-xs text-slate-300">
              {/* Output format choices */}
              <div>
                <span class="text-[10px] text-slate-500 font-bold uppercase block mb-1">Select Output Standard</span>
                <div class="grid grid-cols-2 gap-2 mb-2">
                  <button 
                    onClick={() => setExportFormat('html')}
                    class={`py-2 border rounded-lg transition text-center font-semibold text-xs ${exportFormat === 'html' ? 'border-indigo-500 bg-indigo-950/20 text-white' : 'border-slate-850 bg-slate-950/40 text-slate-300'}`}
                  >
                    HTML File
                  </button>
                  <button 
                    onClick={() => setExportFormat('react')}
                    class={`py-2 border rounded-lg transition text-center font-semibold text-xs ${exportFormat === 'react' ? 'border-indigo-500 bg-indigo-950/20 text-white' : 'border-slate-850 bg-slate-950/40 text-slate-300'}`}
                  >
                    React (JSX)
                  </button>
                  <button 
                    onClick={() => setExportFormat('zip')}
                    class={`py-2 border rounded-lg transition text-center font-semibold text-xs ${exportFormat === 'zip' ? 'border-indigo-500 bg-indigo-950/20 text-white' : 'border-slate-850 bg-slate-950/40 text-slate-300'}`}
                  >
                    SEO Bundle
                  </button>
                  <button 
                    onClick={() => setExportFormat('folder')}
                    class={`py-2 border rounded-lg transition text-center font-semibold text-xs relative overflow-hidden ${exportFormat === 'folder' ? 'border-emerald-500 bg-emerald-950/20 text-white' : 'border-slate-850 bg-slate-950/40 text-slate-300'}`}
                    title="Export using modern showDirectoryPicker API directly to a real folder on your local file-system!"
                  >
                    Local Folder (API)
                    <span class="absolute top-0 right-0 bg-emerald-500 text-[8px] text-black px-1 font-bold rounded-bl uppercase">FSA</span>
                  </button>
                </div>

                {exportFormat === 'folder' && (
                  <div class="p-3 bg-slate-950 rounded-lg border border-slate-850 space-y-1.5 mt-2">
                    <p class="text-[10px] text-slate-400 leading-normal">
                      🚀 Writes <span class="text-indigo-400 font-mono">index.html</span> and configuration manifests directly to your selected machine folder with zero upload hops! Fully sandbox secure.
                    </p>
                    {folderExportState === 'writing' && (
                      <div class="text-[10px] text-amber-400 flex items-center gap-1.5 animate-pulse">
                        <Loader2 class="w-3.5 h-3.5 animate-spin" />
                        <span>Prompting directory permissions and compiling blocks...</span>
                      </div>
                    )}
                    {folderExportState === 'success' && (
                      <div class="text-[10px] text-emerald-400 font-bold flex items-center gap-1.5">
                        <CheckCircle class="w-3.5 h-3.5" />
                        <span>Exported successfully to local "{targetFolderName || 'selected'}" directory!</span>
                      </div>
                    )}
                    {folderExportState === 'error' && (
                      <div class="text-[10px] text-rose-400 font-semibold">
                        ⚠️ File permission or browser folder sync declined.
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Optimization controls */}
              <div class="space-y-2 pt-1">
                <span class="text-[10px] text-slate-500 font-bold uppercase block">Packaging Options</span>
                
                <div class="flex items-center justify-between">
                  <span>Compress and minify script files</span>
                  <input 
                    type="checkbox" 
                    checked={minify} 
                    onChange={(e) => setMinify(e.target.checked)}
                    class="w-4 h-4 bg-slate-950 accent-indigo-500 border-slate-800 rounded"
                  />
                </div>

                <div class="flex items-center justify-between">
                  <span>Bundle robots.txt and sitemap.xml</span>
                  <input 
                    type="checkbox" 
                    checked={includeSEO} 
                    onChange={(e) => setIncludeSEO(e.target.checked)}
                    class="w-4 h-4 bg-slate-950 accent-indigo-500 border-slate-800 rounded"
                  />
                </div>
              </div>
            </div>

            <div class="flex justify-end gap-2 text-xs pt-4 border-t border-slate-850">
              <button 
                onClick={() => setShowExportModal(false)}
                class="px-4 py-2 bg-slate-900 hover:bg-slate-850 text-slate-400 rounded-lg"
              >
                Cancel
              </button>
              <button 
                onClick={handleExportDownload}
                class="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg"
              >
                Compile and Download
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
