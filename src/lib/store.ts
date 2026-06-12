/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { create } from 'zustand';
import { Page, Snapshot, VersionControlManager } from './version-control';
import { DesignTokens, DEFAULT_TOKENS } from './design-system';
import { ProjectContext, DEFAULT_PROJECT_CONTEXT } from './project-context';
import { SavedAsset, getAssets as fetchLocalAssets, saveAsset as storeLocalAsset, deleteAsset as removeLocalAsset } from './indexeddb-assets';
import { validateAction, sanitizeHTML, sanitizeCSS, sanitizeJS, BlockedLog, blockedLogs } from './ai-safety';
import { COMPONENT_TEMPLATES } from '../data/templates';
import { analyzeMobileOptimization, MobileIssue } from './mobile-analyzer';
import { auditAccessibility, AccessibilityIssue } from './accessibility-audit';
import { BUILTIN_PLUGINS, Plugin } from './plugin-api';

interface SiteForgeState {
  // Page states
  pages: Page[];
  activePageId: string;
  
  // Theme and context
  designTokens: DesignTokens;
  projectContext: ProjectContext;
  
  // Workspace properties
  viewMode: 'desktop' | 'tablet' | 'mobile';
  activeRightTab: 'properties' | 'pages' | 'scanners' | 'plugins';
  activeLeftTab: 'components' | 'settings' | 'history' | 'brief';
  codeViewOpen: boolean;
  
  // Health connections
  ollamaStatus: 'connected' | 'offline' | 'queued' | 'checking';
  availableModels: string[];
  
  // LLM Provider Bridge
  llmProvider: 'ollama' | 'openrouter';
  openRouterKey: string;
  selectedModel: string;
  tokenUsage: number;
  estimatedCost: number;
  
  // Database / assets
  assets: SavedAsset[];
  
  // Safety sandboxing logs
  safetyLogs: BlockedLog[];
  
  // Plugin configurations
  activePlugins: Plugin[];
  
  // Version control
  undoStackSize: number;
  redoStackSize: number;
  timeline: Snapshot[];
  activeBranch: string;
  branches: string[];
  
  // Scanners outcomes
  mobileScore: number;
  mobileIssues: MobileIssue[];
  a11yScore: number;
  a11yIssues: AccessibilityIssue[];

  // Action methods
  setHomepage: (pageId: string) => void;
  addPage: (name: string, templateId?: string) => void;
  deletePage: (pageId: string) => void;
  duplicatePage: (pageId: string) => void;
  selectPage: (pageId: string) => void;
  updateActivePageCanvas: (html: string, css?: string) => void;
  updateActivePageMeta: (title?: string, desc?: string, keywords?: string) => void;
  
  // Theme selectors
  applyTokens: (tokens: Partial<DesignTokens>) => void;
  applyPresetTheme: (themeId: string) => void;
  updateProjectContext: (ctx: Partial<ProjectContext>) => void;
  
  // UI helpers
  setViewMode: (mode: 'desktop' | 'tablet' | 'mobile') => void;
  setActiveRightTab: (tab: 'properties' | 'pages' | 'scanners' | 'plugins') => void;
  setActiveLeftTab: (tab: 'components' | 'settings' | 'history' | 'brief') => void;
  toggleCodeView: () => void;
  setOllamaStatus: (status: 'connected' | 'offline' | 'queued' | 'checking', models?: string[]) => void;
  
  // LLM Bridge methods
  setLlmProvider: (provider: 'ollama' | 'openrouter') => void;
  setOpenRouterKey: (key: string) => void;
  setSelectedModel: (model: string) => void;
  addTokenUsage: (tokens: number, estimatedCost: number) => void;
  resetTokenUsage: () => void;
  
  // Snapshot/Undo stacks
  createHistoryCheckpoint: (label: string) => void;
  undo: () => void;
  redo: () => void;
  createNewBranch: (name: string) => void;
  checkoutBranch: (name: string) => void;
  
  // Assets loaders
  loadAssets: () => Promise<void>;
  uploadNewAsset: (name: string, type: string, dataUrl: string, size: number) => Promise<void>;
  deleteOldAsset: (id: string) => Promise<void>;
  
  // Running plugins
  togglePlugin: (id: string) => void;
  
  // Scans triggers
  runAudits: () => void;
  applyHTMLSanitizerHeal: () => void;
}

const vc = new VersionControlManager();

const buildDefaultHome = (): Page => {
  return {
    id: "page_home",
    name: "Home",
    html: `
<section id="hero-saas" class="py-24 px-6 relative overflow-hidden" style="background-color: var(--bg-color, #0f0f23);">
  <div class="absolute inset-0 bg-radial-at-t opacity-30 pointer-events-none" style="background-image: radial-gradient(circle at top, var(--primary-color, #8b5cf6) 0%, transparent 60%);"></div>
  <div class="max-w-5xl mx-auto text-center relative z-10">
    <span class="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full bg-opacity-10 border mb-6" style="background-color: var(--primary-color, #8b5cf6); border-color: rgba(255,255,255,0.1); color: var(--secondary-color, #06b6d4);">
      ✨ Safe Design Sandbox Online
    </span>
    <h1 class="text-5xl md:text-6xl font-bold tracking-tight mb-6 leading-[1.1] max-w-4xl mx-auto" style="font-family: var(--heading-font, sans-serif); color: var(--text-color, #e2e8f0);">
      Shape your ideas into production-ready code with 
      <span class="text-transparent bg-clip-text" style="background-image: linear-gradient(135deg, var(--gradient-start, #8b5cf6), var(--gradient-end, #06b6d4));">Expressive Design AI</span>
    </h1>
    <p class="text-lg md:text-xl opacity-80 mb-10 max-w-2xl mx-auto" style="color: var(--text-color, #e2e8f0);">
      Voice commands, accessibility scanners, sandboxed safety environments, and immediate Netlify publishing triggers at your control.
    </p>
    <div class="flex flex-col sm:flex-row gap-4 items-center justify-center">
      <button class="px-6 py-3 font-semibold transition-all duration-300 shadow-xl hover:translate-y-[-1px] w-full sm:w-auto" style="background-color: var(--primary-color, #8b5cf6); color: #fff; border-radius: var(--border-radius, 12px);">
        Start Free Designing
      </button>
      <button class="px-6 py-3 font-semibold border transition-all duration-300 hover:bg-white hover:bg-opacity-5 w-full sm:w-auto" style="border-color: rgba(255,255,255,0.15); color: var(--text-color, #e2e8f0); border-radius: var(--border-radius, 12px);">
        Examine Blueprint
      </button>
    </div>
  </div>
</section>
    `.trim(),
    css: "",
    isHomepage: true,
    metaTitle: "Welcome - Built with SiteForge",
    metaDescription: "Professional landing page optimized with AI security and Accessibility guidelines."
  };
};

export const useStore = create<SiteForgeState>((set, get) => {
  // Init default snapshot
  const initialPage = buildDefaultHome();
  const initSnap = vc.saveSnapshot(initialPage.html, DEFAULT_TOKENS, [initialPage], "Created Project");

  return {
    pages: [initialPage],
    activePageId: "page_home",
    designTokens: DEFAULT_TOKENS,
    projectContext: DEFAULT_PROJECT_CONTEXT,
    
    viewMode: 'desktop',
    activeRightTab: 'properties',
    activeLeftTab: 'components',
    codeViewOpen: false,
    ollamaStatus: 'checking',
    availableModels: [],
    
    // LLM state initialization
    llmProvider: (localStorage.getItem('siteforge_llm_provider') as 'ollama' | 'openrouter') || 'ollama',
    openRouterKey: localStorage.getItem('siteforge_openrouter_key') || '',
    selectedModel: localStorage.getItem('siteforge_openrouter_model') || 'meta-llama/llama-3.1-70b-instruct',
    tokenUsage: parseInt(localStorage.getItem('siteforge_token_usage') || '0', 10),
    estimatedCost: parseFloat(localStorage.getItem('siteforge_estimated_cost') || '0.00'),
    assets: [],
    safetyLogs: [],
    activePlugins: BUILTIN_PLUGINS,
    
    undoStackSize: 1,
    redoStackSize: 0,
    timeline: [initSnap],
    activeBranch: "main",
    branches: ["main"],
    
    mobileScore: 100,
    mobileIssues: [],
    a11yScore: 100,
    a11yIssues: [],

    setHomepage: (pageId) => {
      set((state) => {
        const nextPages = state.pages.map(p => ({
          ...p,
          isHomepage: p.id === pageId
        }));
        return { pages: nextPages };
      });
      get().createHistoryCheckpoint(`Set Homepage: ${pageId}`);
    },

    addPage: (name, templateId) => {
      const id = "page_" + Math.random().toString(36).substring(2, 11);
      let pageHTML = `
<section class="py-20 px-6 text-center" style="background-color: var(--bg-color); color: var(--text-color);">
  <h1 class="text-4xl font-bold mb-4" style="font-family: var(--heading-font);">${name} Page</h1>
  <p class="max-w-md mx-auto opacity-75">Modify or add custom templates using our left Component palette drag-and-drop toolboxes.</p>
</section>
      `.trim();

      if (templateId && COMPONENT_TEMPLATES[templateId]) {
        // Sanitize first
        pageHTML = sanitizeHTML(COMPONENT_TEMPLATES[templateId].html);
      }

      const newPage: Page = {
        id,
        name,
        html: pageHTML,
        css: "",
        isHomepage: false,
        metaTitle: `${name} - SiteForge`,
        metaDescription: `Discover our ${name} layouts styled instantly.`
      };

      set((state) => ({
        pages: [...state.pages, newPage],
        activePageId: id
      }));

      get().createHistoryCheckpoint(`Created Page: ${name}`);
      get().runAudits();
    },

    deletePage: (pageId) => {
      const { pages, activePageId } = get();
      if (pages.length <= 1) return; // Prevent deleting only page

      set((state) => {
        const filtered = state.pages.filter(p => p.id !== pageId);
        const fallbackId = activePageId === pageId ? filtered[0].id : activePageId;
        return {
          pages: filtered,
          activePageId: fallbackId
        };
      });

      get().createHistoryCheckpoint(`Deleted Page: ${pageId}`);
      get().runAudits();
    },

    duplicatePage: (pageId) => {
      const target = get().pages.find(p => p.id === pageId);
      if (!target) return;

      const dupId = "page_" + Math.random().toString(36).substring(2, 11);
      const dup: Page = {
        ...JSON.parse(JSON.stringify(target)),
        id: dupId,
        name: target.name + " Copy",
        isHomepage: false
      };

      set((state) => ({
        pages: [...state.pages, dup],
        activePageId: dupId
      }));

      get().createHistoryCheckpoint(`Duplicated Page: ${target.name}`);
      get().runAudits();
    },

    selectPage: (pageId) => {
      set({ activePageId: pageId });
      get().runAudits();
    },

    updateActivePageCanvas: (html, css) => {
      const { activePageId, pages } = get();
      
      // Run Canvas Safety Pipeline (Section 1)
      const cleanHTML = sanitizeHTML(html);
      const cleanCSS = css !== undefined ? sanitizeCSS(css) : undefined;

      set((state) => {
        const updated = state.pages.map(p => {
          if (p.id === activePageId) {
            return {
              ...p,
              html: cleanHTML,
              css: cleanCSS !== undefined ? cleanCSS : p.css
            };
          }
          return p;
        });
        return {
          pages: updated,
          safetyLogs: [...blockedLogs]
        };
      });
      get().runAudits();
    },

    updateActivePageMeta: (title, desc, keywords) => {
      const { activePageId } = get();
      set((state) => {
        const updated = state.pages.map(p => {
          if (p.id === activePageId) {
            return {
              ...p,
              metaTitle: title !== undefined ? title : p.metaTitle,
              metaDescription: desc !== undefined ? desc : p.metaDescription,
              metaKeywords: keywords !== undefined ? keywords : p.metaKeywords
            };
          }
          return p;
        });
        return { pages: updated };
      });
    },

    applyTokens: (tokens) => {
      set((state) => ({
        designTokens: { ...state.designTokens, ...tokens }
      }));
    },

    applyPresetTheme: (themeId) => {
      // Find theme inside list
      import('./design-system').then(({ THEME_PRESETS }) => {
        const match = THEME_PRESETS[themeId];
        if (match) {
          set({ designTokens: { ...match.tokens } });
          get().createHistoryCheckpoint(`Applied Theme: ${match.name}`);
        }
      });
    },

    updateProjectContext: (ctx) => {
      set((state) => ({
        projectContext: { ...state.projectContext, ...ctx }
      }));
    },

    setViewMode: (mode) => set({ viewMode: mode }),
    setActiveRightTab: (tab) => set({ activeRightTab: tab }),
    setActiveLeftTab: (tab) => set({ activeLeftTab: tab }),
    toggleCodeView: () => set((state) => ({ codeViewOpen: !state.codeViewOpen })),

    setOllamaStatus: (status, models) => set((state) => ({
      ollamaStatus: status,
      availableModels: models || state.availableModels
    })),

    setLlmProvider: (provider) => {
      localStorage.setItem('siteforge_llm_provider', provider);
      set({ llmProvider: provider });
    },

    setOpenRouterKey: (key) => {
      localStorage.setItem('siteforge_openrouter_key', key);
      set({ openRouterKey: key });
    },

    setSelectedModel: (model) => {
      localStorage.setItem('siteforge_openrouter_model', model);
      set({ selectedModel: model });
    },

    addTokenUsage: (tokens, cost) => {
      set((state) => {
        const nextTokens = state.tokenUsage + tokens;
        const nextCost = state.estimatedCost + cost;
        localStorage.setItem('siteforge_token_usage', nextTokens.toString());
        localStorage.setItem('siteforge_estimated_cost', nextCost.toFixed(4));
        return {
          tokenUsage: nextTokens,
          estimatedCost: nextCost
        };
      });
    },

    resetTokenUsage: () => {
      localStorage.setItem('siteforge_token_usage', '0');
      localStorage.setItem('siteforge_estimated_cost', '0.00');
      set({ tokenUsage: 0, estimatedCost: 0 });
    },

    createHistoryCheckpoint: (label) => {
      const { pages, activePageId, designTokens } = get();
      const activePage = pages.find(p => p.id === activePageId) || pages[0];
      const html = activePage?.html || "";
      
      const snap = vc.saveSnapshot(html, designTokens, pages, label);
      set({
        undoStackSize: vc.getUndoStack().length,
        timeline: vc.getTimeline(),
        activeBranch: vc.getActiveBranchName(),
        branches: vc.getBranches()
      });
    },

    undo: () => {
      const rolled = vc.undo();
      if (rolled) {
        set({
          pages: JSON.parse(JSON.stringify(rolled.pages)),
          designTokens: JSON.parse(JSON.stringify(rolled.designTokens)),
          undoStackSize: vc.getUndoStack().length,
          timeline: vc.getTimeline()
        });
        get().runAudits();
      }
    },

    redo: () => {
      const nativeRedo = vc.redo();
      if (nativeRedo) {
        set({
          pages: JSON.parse(JSON.stringify(nativeRedo.pages)),
          designTokens: JSON.parse(JSON.stringify(nativeRedo.designTokens)),
          undoStackSize: vc.getUndoStack().length,
          timeline: vc.getTimeline()
        });
        get().runAudits();
      }
    },

    createNewBranch: (name) => {
      const { pages, activePageId, designTokens } = get();
      const activePage = pages.find(p => p.id === activePageId) || pages[0];
      const html = activePage?.html || "";
      
      const currentSnap = vc.getTimeline()[0] || vc.saveSnapshot(html, designTokens, pages, "Source Branch");
      vc.createBranch(name, currentSnap);
      set({
        activeBranch: name,
        branches: vc.getBranches()
      });
    },

    checkoutBranch: (name) => {
      vc.setBranch(name);
      set({ activeBranch: name });
    },

    loadAssets: async () => {
      try {
        const loaded = await fetchLocalAssets();
        set({ assets: loaded });
      } catch (err) {
        console.error("IndexedDB Asset Load issue:", err);
      }
    },

    uploadNewAsset: async (name, type, dataUrl, size) => {
      try {
        await storeLocalAsset(name, type, dataUrl, size);
        await get().loadAssets();
      } catch (err) {
        console.error("IndexedDB asset put failure:", err);
      }
    },

    deleteOldAsset: async (id) => {
      try {
        await removeLocalAsset(id);
        await get().loadAssets();
      } catch (err) {
        console.error("IndexedDB asset delete failure:", err);
      }
    },

    togglePlugin: (id) => {
      set((state) => {
        const updated = state.activePlugins.map(p => {
          if (p.id === id) return { ...p, enabled: !p.enabled };
          return p;
        });
        return { activePlugins: updated };
      });
    },

    runAudits: () => {
      const { pages, activePageId } = get();
      const active = pages.find(p => p.id === activePageId);
      if (!active) return;

      const mAudit = analyzeMobileOptimization(active.html);
      const aAudit = auditAccessibility(active.html);

      set({
        mobileScore: mAudit.score,
        mobileIssues: mAudit.issues,
        a11yScore: aAudit.score,
        a11yIssues: aAudit.issues
      });
    },

    applyHTMLSanitizerHeal: () => {
      const { pages, activePageId } = get();
      const active = pages.find(p => p.id === activePageId);
      if (!active) return;

      const healedHTML = sanitizeHTML(active.html);
      
      set((state) => {
        const updated = state.pages.map(p => {
          if (p.id === activePageId) return { ...p, html: healedHTML };
          return p;
        });
        return { pages: updated };
      });
      get().createHistoryCheckpoint("Auto-Healed HTML Sandbox");
      get().runAudits();
    }
  };
});
