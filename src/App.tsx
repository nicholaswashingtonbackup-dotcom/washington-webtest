/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import TopBar from './components/TopBar';
import LeftPanel from './components/LeftPanel';
import WorkspaceCanvas from './components/WorkspaceCanvas';
import RightPanel from './components/RightPanel';
import BottomBar from './components/BottomBar';
import CodeEditor from './components/CodeEditor';
import VoiceAgent from './components/VoiceAgent';
import AiSandbox from './components/AiSandbox';
import { useStore } from './lib/store';
import { Sparkles, MessageSquare, Mic, AlertCircle, ShieldCheck, Terminal, HardDrive, CheckCircle2 } from 'lucide-react';

export default function App() {
  const { 
    codeViewOpen, 
    sandboxOpen, 
    setSandboxOpen, 
    loadAssets, 
    runAudits, 
    safetyLogs,
    isElectronMode,
    setElectronMode,
    isFullscreen,
    setIsFullscreen,
    ollamaStatus,
    createHistoryCheckpoint
  } = useStore();

  // Simulated notification system
  const [trayNotification, setTrayNotification] = useState<string | null>(null);
  
  // First Launch check
  const [showStartChecklist, setShowStartChecklist] = useState(() => {
    // Return true if first time in this browser session
    return !sessionStorage.getItem('siteforge_startup_completed');
  });

  // Checklist diagnostics states
  const [diagnosticProgress, setDiagnosticProgress] = useState(0);
  const [diagnosticsLogs, setDiagnosticsLogs] = useState<string[]>([]);

  // Synthesize custom sound waves using HTML5 Web Audio API
  const playSynthesizedChime = (type: 'save' | 'tray' | 'voice' | 'launch') => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      if (type === 'save') {
        osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
        osc.frequency.exponentialRampToValueAtTime(783.99, ctx.currentTime + 0.15); // G5
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
        osc.start();
        osc.stop(ctx.currentTime + 0.3);
      } else if (type === 'tray') {
        osc.frequency.setValueAtTime(659.25, ctx.currentTime); // E5
        osc.frequency.exponentialRampToValueAtTime(523.25, ctx.currentTime + 0.2); // C5
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
        osc.start();
        osc.stop(ctx.currentTime + 0.4);
      } else if (type === 'voice') {
        osc.frequency.setValueAtTime(440.00, ctx.currentTime); // A4
        osc.frequency.exponentialRampToValueAtTime(880.00, ctx.currentTime + 0.1); // A5
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
        osc.start();
        osc.stop(ctx.currentTime + 0.2);
      } else if (type === 'launch') {
        osc.frequency.setValueAtTime(261.63, ctx.currentTime); // C4
        osc.frequency.setValueAtTime(329.63, ctx.currentTime + 0.1); // E4
        osc.frequency.setValueAtTime(392.00, ctx.currentTime + 0.2); // G4
        osc.frequency.exponentialRampToValueAtTime(523.25, ctx.currentTime + 0.3); // C5
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
        osc.start();
        osc.stop(ctx.currentTime + 0.5);
      }
    } catch (_) {
      // AudioContext not allowed or not supported in this iframe context
    }
  };

  const triggerTrayNotification = (message: string) => {
    setTrayNotification(message);
    playSynthesizedChime('tray');
    setTimeout(() => setTrayNotification(null), 4000);
  };

  // Run Startup diagnostic simulation
  useEffect(() => {
    if (!showStartChecklist) return;

    const stages = [
      "Verifying client sandbox database connections...",
      "Binding IndexedDB persistent local block registers...",
      "Pinging local loopback Ollama agent (port 11434)...",
      "Loading Design Archetypes and CSS layout generators...",
      "SiteForge Shell successfully configured & initialized."
    ];

    let currentIdx = 0;
    const interval = setInterval(() => {
      if (currentIdx < stages.length) {
        setDiagnosticsLogs(prev => [...prev, `[INIT] ${stages[currentIdx]}`]);
        setDiagnosticProgress(Math.floor(((currentIdx + 1) / stages.length) * 100));
        currentIdx++;
      } else {
        clearInterval(interval);
      }
    }, 450);

    return () => clearInterval(interval);
  }, [showStartChecklist]);

  const handleLaunchWorkspace = () => {
    playSynthesizedChime('launch');
    sessionStorage.setItem('siteforge_startup_completed', 'true');
    setShowStartChecklist(false);
  };

  useEffect(() => {
    // Initial data loading triggers
    loadAssets();
    runAudits();

    // Browser native fullscreen observer so button and keyboard stay synchronized!
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);

    // Global hotkey event listener
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // 1. Save Snapshot (Ctrl + Shift + S)
      if (e.ctrlKey && e.shiftKey && e.key.toUpperCase() === 'S') {
        e.preventDefault();
        createHistoryCheckpoint("Auto-Backed Workspace State (Ctrl+Shift+S Shortcut)");
        playSynthesizedChime('save');
        triggerTrayNotification("Ctrl+Shift+S Action: Real-time project snapshot persisted in IndexedDB!");
      }

      // 2. Clear Console / Voice Dictation (Ctrl + Shift + V)
      if (e.ctrlKey && e.shiftKey && e.key.toUpperCase() === 'V') {
        e.preventDefault();
        playSynthesizedChime('voice');
        triggerTrayNotification("Ctrl+Shift+V Action: Voice agent capture initiated! Dictate elements verbally.");
      }

      // 3. Toggle Fullscreen (Ctrl + Shift + F)
      if (e.ctrlKey && e.shiftKey && e.key.toUpperCase() === 'F') {
        e.preventDefault();
        const target = document.documentElement;
        if (!document.fullscreenElement) {
          target.requestFullscreen()
            .then(() => setIsFullscreen(true))
            .catch(err => console.warn("Fullscreen bounds prevented or blocked in this window", err));
        } else {
          document.exitFullscreen()
            .then(() => setIsFullscreen(false))
            .catch(err => console.warn(err));
        }
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      window.removeEventListener('keydown', handleGlobalKeyDown);
    };
  }, [loadAssets, runAudits, setIsFullscreen, createHistoryCheckpoint]);

  return (
    <div id="designforge-app-shell" className="h-screen w-screen bg-[#070814] text-slate-100 flex flex-col overflow-hidden select-none relative">
      
      {/* 0. Standalone Electron Frame simulation bar */}
      {isElectronMode && (
        <div className="h-8 bg-slate-950 border-b border-slate-900 flex items-center justify-between px-3 select-none flex-shrink-0 text-xs font-medium text-slate-400">
          <div className="flex items-center gap-1.5 font-bold text-slate-300">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse"></span>
            <span>SiteForge.exe</span>
            <span className="text-[9px] bg-indigo-950 text-indigo-400 px-1 py-0.5 rounded border border-indigo-900 font-mono">STANDALONE SHELL</span>
          </div>
          <div className="text-[10px] font-mono text-slate-500 hidden sm:block">
            Window: 1400 × 900 (Resizable) | IPC: OK | Key Tracker: Alt+F4
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 bg-slate-900/60 px-2 py-0.5 rounded border border-slate-850">
              <span className={`w-1.5 h-1.5 rounded-full ${ollamaStatus === 'offline' ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500 animate-pulse'}`}></span>
              <span className="text-[9px] font-mono uppercase text-slate-400">Ollama: {ollamaStatus === 'offline' ? 'openrouter-fallback' : 'connected'}</span>
            </div>
            <div className="flex items-center -mr-2">
              <button 
                onClick={() => triggerTrayNotification("SiteForge standalone shell minimized to tray icons.")}
                className="w-8 h-8 flex items-center justify-center hover:bg-slate-900 transition text-slate-500 hover:text-slate-200"
                title="Minimize Window"
              >
                —
              </button>
              <button 
                onClick={() => {
                  const target = document.documentElement;
                  if (!document.fullscreenElement) {
                    target.requestFullscreen().then(() => setIsFullscreen(true)).catch(err => console.warn(err));
                  } else {
                    document.exitFullscreen().then(() => setIsFullscreen(false)).catch(err => console.warn(err));
                  }
                }}
                className="w-8 h-8 flex items-center justify-center hover:bg-slate-900 transition text-slate-500 hover:text-slate-200 font-mono"
                title="Toggle Maximize/Fullscreen"
              >
                ▢
              </button>
              <button 
                onClick={() => {
                  setElectronMode(false);
                  triggerTrayNotification("Exited Electron standalone simulator view.");
                }}
                className="w-8 h-8 flex items-center justify-center hover:bg-rose-600 transition text-slate-500 hover:text-white"
                title="Exit Shell mode"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 1. Header Navigation Controller Bar */}
      <TopBar />

      {/* 2. Main Studio Workroom split floor */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left Side: Blocks pallet and history timeline */}
        <div className="flex flex-col h-full bg-slate-900 border-r border-slate-950 w-80">
          <LeftPanel />
          
          {/* Constant Voice interaction terminal directly in Left panel footer! */}
          <div className="p-4 border-t border-slate-950 bg-slate-950/45 shrink-0">
            <VoiceAgent />
          </div>
        </div>

        {/* Center: Live Responsive Sandbox Canvas */}
        <div className="flex-1 flex flex-col h-full bg-[#0a0a16] relative">
          <WorkspaceCanvas />

          {/* Toggleable core system code editor slot */}
          {codeViewOpen && (
            <div className="shrink-0 animate-fade-in">
              <CodeEditor />
            </div>
          )}
        </div>

        {/* Right Side: Design System Tokens / Audits Panel */}
        <RightPanel />

      </div>

      {/* 3. Global status bar metrics footers */}
      <BottomBar />

      {/* 4. Interactive Live Sandbox Floating component overlay */}
      <AiSandbox isOpen={sandboxOpen} onClose={() => setSandboxOpen(false)} />

      {/* Safety Interceptor Threats warning logs rendering */}
      {safetyLogs.length > 0 && (
        <div className="fixed bottom-12 right-6 z-[888] bg-amber-950/90 border border-amber-800 backdrop-blur-md rounded-xl p-3 max-w-sm shadow-xl flex items-start gap-2 animate-bounce">
          <AlertCircle className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
          <div>
            <div className="text-[10px] font-bold text-slate-100">XSS SANITIZER BLOCKED THREATS</div>
            <p className="text-[9px] text-amber-300 leading-normal mt-0.5">We intercepted and stripped malicious script triggers loaded dynamically into your visual elements.</p>
          </div>
        </div>
      )}

      {/* Simulated System Tray Notification Toaster */}
      {trayNotification && (
        <div className="fixed top-12 right-6 z-[9999] bg-slate-900/95 border-b border-r border-indigo-500 rounded-xl p-4 shadow-2xl max-w-sm border-l-4 border-l-indigo-500 flex items-start gap-3 backdrop-blur-md animate-fade-in">
          <div className="bg-indigo-950/80 p-2 rounded-lg border border-indigo-900 flex-shrink-0">
            <Terminal className="w-4 h-4 text-indigo-400" />
          </div>
          <div>
            <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider font-mono">Shell OS Notification</div>
            <p className="text-xs text-slate-200 mt-0.5 leading-normal font-semibold font-sans">{trayNotification}</p>
          </div>
        </div>
      )}

      {/* 5. FIRST VISIT STARTUP DIAGNOSTICS CHECKLIST MODAL */}
      {showStartChecklist && (
        <div className="fixed inset-0 bg-[#040409]/95 z-[99999] flex items-center justify-center p-4 backdrop-blur-md">
          <div className="bg-[#0b0c16] border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500" />
            
            <div className="flex items-center gap-3">
              <div className="bg-indigo-950/70 p-2.5 rounded-xl border border-indigo-900 text-indigo-400">
                <ShieldCheck className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h2 className="text-md font-extrabold text-slate-100 tracking-tight">SiteForge Studio Sandbox Initialization</h2>
                <p className="text-xs text-slate-400 leading-normal">System pre-flight diagnostics checklist status</p>
              </div>
            </div>

            {/* Diagnostics progress status bars */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-[10px] font-mono text-slate-400">
                <span>Pre-flight Diagnostic Stream</span>
                <span className="font-bold text-indigo-400">{diagnosticProgress}%</span>
              </div>
              <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-900">
                <div 
                  className="h-full bg-indigo-500 transition-all duration-300 ease-out"
                  style={{ width: `${diagnosticProgress}%` }}
                />
              </div>
            </div>

            {/* Terminal logs list */}
            <div className="h-32 bg-slate-950/75 border border-slate-900 rounded-lg p-3 overflow-y-auto space-y-1.5 font-mono text-[10px] text-slate-400 leading-normal">
              {diagnosticsLogs.map((log, index) => (
                <div key={index} className="flex gap-2 items-start shrink-0">
                  <span className="text-indigo-500">{">"}</span>
                  <span>{log}</span>
                </div>
              ))}
              {diagnosticProgress < 100 && (
                <div className="text-[10px] text-amber-400 animate-pulse flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-ping"></span>
                  <span>Executing diagnostics...</span>
                </div>
              )}
            </div>

            {/* Status summaries block check list */}
            <div className="grid grid-[#0a0a14] grid-cols-2 gap-2 text-[10px] bg-[#07080f] border border-slate-850 p-2.5 rounded-lg font-mono">
              <div className="flex items-center gap-1.5 text-slate-300">
                <HardDrive className="w-3.5 h-3.5 text-indigo-400" />
                <span>IndexedDB: Active</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-300">
                <Terminal className="w-3.5 h-3.5 text-indigo-400" />
                <span>Sandbox DOM: Secured</span>
              </div>
            </div>

            <button
              onClick={handleLaunchWorkspace}
              disabled={diagnosticProgress < 100}
              className={`w-full py-2.5 rounded-xl font-extrabold text-xs tracking-wide transition flex items-center justify-center gap-2 ${
                diagnosticProgress === 100 
                  ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white hover:from-indigo-500 hover:to-indigo-600 shadow-lg shadow-indigo-950 border border-indigo-500'
                  : 'bg-slate-900 text-slate-600 border border-slate-950 cursor-not-allowed'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>INITIALIZE DESIGN SUITE</span>
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
