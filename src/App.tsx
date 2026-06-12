/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import TopBar from './components/TopBar';
import LeftPanel from './components/LeftPanel';
import WorkspaceCanvas from './components/WorkspaceCanvas';
import RightPanel from './components/RightPanel';
import BottomBar from './components/BottomBar';
import CodeEditor from './components/CodeEditor';
import VoiceAgent from './components/VoiceAgent';
import { useStore } from './lib/store';
import { Sparkles, MessageSquare, Mic, AlertCircle } from 'lucide-react';

export default function App() {
  const { codeViewOpen, loadAssets, runAudits, safetyLogs } = useStore();

  useEffect(() => {
    // Standard initialization triggers
    loadAssets();
    runAudits();
  }, []);

  return (
    <div id="designforge-app-shell" class="h-screen w-screen bg-[#070814] text-slate-100 flex flex-col overflow-hidden select-none">
      
      {/* 1. Header Navigation Controller Bar */}
      <TopBar />

      {/* 2. Main Studio Workroom split floor */}
      <div class="flex-1 flex overflow-hidden">
        
        {/* Left Side: Blocks pallet and history timeline */}
        <div class="flex flex-col h-full bg-slate-900 border-r border-slate-950">
          <LeftPanel />
          
          {/* Constant Voice interaction terminal directly in Left panel footer! */}
          <div class="p-4 border-t border-slate-950 bg-slate-950/45 shrink-0">
            <VoiceAgent />
          </div>
        </div>

        {/* Center: Live Responsive Sandbox Canvas */}
        <div class="flex-1 flex flex-col h-full bg-[#0a0a16] relative">
          <WorkspaceCanvas />

          {/* Toggleable core system code editor slot */}
          {codeViewOpen && (
            <div class="shrink-0 animate-fade-in">
              <CodeEditor />
            </div>
          )}
        </div>

        {/* Right Side: Design System Tokens / Audits Panel */}
        <RightPanel />

      </div>

      {/* 3. Global status bar metrics footers */}
      <BottomBar />

      {/* Embedded interactive sound effects / micro overlays */}
      {safetyLogs.length > 0 && (
        <div class="fixed bottom-12 right-6 z-[888] bg-amber-950/90 border border-amber-800 backdrop-blur-md rounded-xl p-3 max-w-sm shadow-xl flex items-start gap-2 animate-bounce">
          <AlertCircle class="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
          <div>
            <div class="text-[10px] font-bold text-slate-100">XSS SANITIZER BLOCKED THREATS</div>
            <p class="text-[9px] text-amber-300 leading-normal mt-0.5">We intercepted and stripped malicious script triggers loaded dynamically into your visual elements.</p>
          </div>
        </div>
      )}

    </div>
  );
}
