/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface ComponentTemplate {
  id: string;
  name: string;
  category: 'layout' | 'sections' | 'forms' | 'media';
  html: string;
  css?: string;
  thumbnail?: string;
}

export const COMPONENT_TEMPLATES: Record<string, ComponentTemplate> = {
  NAVBAR_STANDARD: {
    id: "NAVBAR_STANDARD",
    name: "Navbar Standard",
    category: "layout",
    html: `
<nav id="navbar-standard" class="sticky top-0 z-50 backdrop-blur-md border-b bg-opacity-80 transition-all duration-300" style="background-color: var(--bg-color, #0f0f23); border-color: rgba(255,255,255,0.08);">
  <div class="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
    <div class="flex items-center gap-2">
      <span class="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-white transition-transform hover:scale-105" style="background: linear-gradient(135deg, var(--gradient-start, #8b5cf6), var(--gradient-end, #06b6d4));">SF</span>
      <span class="font-bold text-lg tracking-tight" style="color: var(--text-color, #e2e8f0);">SiteForge</span>
    </div>
    <div class="hidden md:flex items-center gap-8">
      <a href="#hero" class="text-sm font-medium hover:opacity-80 transition-opacity" style="color: var(--text-color, #e2e8f0);">Home</a>
      <a href="#features" class="text-sm font-medium hover:opacity-80 transition-opacity" style="color: var(--text-color, #e2e8f0);">Features</a>
      <a href="#services" class="text-sm font-medium hover:opacity-80 transition-opacity" style="color: var(--text-color, #e2e8f0);">Services</a>
      <a href="#pricing" class="text-sm font-medium hover:opacity-80 transition-opacity" style="color: var(--text-color, #e2e8f0);">Pricing</a>
      <a href="#faq" class="text-sm font-medium hover:opacity-80 transition-opacity" style="color: var(--text-color, #e2e8f0);">FAQ</a>
    </div>
    <div class="flex items-center gap-4">
      <a href="#contact" class="hidden sm:inline-flex text-sm font-medium hover:opacity-80 transition-opacity" style="color: var(--text-color, #e2e8f0);">Login</a>
      <button class="px-4 py-2 font-medium text-sm transition-all duration-300 hover:shadow-lg active:scale-95" 
              style="background-color: var(--primary-color, #8b5cf6); color: #fff; border-radius: var(--border-radius, 12px);">Get Started</button>
    </div>
  </div>
</nav>
    `.trim()
  },

  HERO_SAAS: {
    id: "HERO_SAAS",
    name: "SaaS Hero Section",
    category: "sections",
    html: `
<section id="hero-saas" class="py-24 px-6 relative overflow-hidden" style="background-color: var(--bg-color, #0f0f23);">
  <div class="absolute inset-0 bg-radial-at-t opacity-30 pointer-events-none" style="background-image: radial-gradient(circle at top, var(--primary-color, #8b5cf6) 0%, transparent 60%);"></div>
  <div class="max-w-5xl mx-auto text-center relative z-10">
    <span class="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full bg-opacity-10 border mb-6" style="background-color: var(--primary-color, #8b5cf6); border-color: rgba(255,255,255,0.1); color: var(--secondary-color, #06b6d4);">
      ✨ Powered by local SiteForge Engine V2
    </span>
    <h1 class="text-5xl md:text-6xl font-bold tracking-tight mb-6 leading-[1.1] max-w-4xl mx-auto" style="font-family: var(--heading-font, sans-serif); color: var(--text-color, #e2e8f0);">
      Scale your digital presence with 
      <span class="text-transparent bg-clip-text" style="background-image: linear-gradient(135deg, var(--gradient-start, #8b5cf6), var(--gradient-end, #06b6d4));">Automated Intelligence</span>
    </h1>
    <p class="text-lg md:text-xl opacity-80 mb-10 max-w-2xl mx-auto" style="color: var(--text-color, #e2e8f0);">
      Design, optimize, and launch stunning professional web products loaded with smart safety filters, voice agents, and custom themes in seconds.
    </p>
    <div class="flex flex-col sm:flex-row gap-4 items-center justify-center mb-16">
      <button class="px-6 py-3 font-semibold transition-all duration-300 shadow-xl hover:translate-y-[-1px] w-full sm:w-auto" style="background-color: var(--primary-color, #8b5cf6); color: #fff; border-radius: var(--border-radius, 12px);">
        Start Designing Free
      </button>
      <button class="px-6 py-3 font-semibold border transition-all duration-300 hover:bg-white hover:bg-opacity-5 w-full sm:w-auto" style="border-color: rgba(255,255,255,0.15); color: var(--text-color, #e2e8f0); border-radius: var(--border-radius, 12px);">
        Book Demo Tour
      </button>
    </div>
    
    <!-- Render Mockup Container -->
    <div class="border rounded-2xl p-2 md:p-3 p-bg relative shadow-2xl transition-all duration-500 hover:scale-[1.01]" style="border-color: rgba(255,255,255,0.08); background-color: rgba(255,255,255,0.02);">
      <div class="flex items-center gap-1.5 px-3 py-2 border-b border-opacity-30 mb-2 md:mb-3" style="border-color: rgba(255,255,255,0.1);">
        <div class="w-3 h-3 rounded-full bg-red-500"></div>
        <div class="w-3 h-3 rounded-full bg-yellow-500"></div>
        <div class="w-3 h-3 rounded-full bg-green-500"></div>
      </div>
      <div class="bg-slate-900 rounded-lg aspect-[16/9] flex items-center justify-center overflow-hidden">
        <span class="text-sm font-mono opacity-40">System Sandbox Canvas Preview</span>
      </div>
    </div>
  </div>
</section>
    `.trim()
  },

  HERO_PORTFOLIO: {
    id: "HERO_PORTFOLIO",
    name: "Minimal Split Portfolio",
    category: "sections",
    html: `
<section id="hero-portfolio" class="py-24 px-6 md:py-32" style="background-color: var(--bg-color, #0f0f23);">
  <div class="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
    <div class="lg:col-span-7">
      <span class="text-xs font-bold uppercase tracking-widest" style="color: var(--primary-color, #8b5cf6);">Brand & Interface Designer</span>
      <h1 class="text-4xl md:text-6xl font-bold mt-4 mb-6 leading-tight" style="font-family: var(--heading-font, sans-serif); color: var(--text-color, #e2e8f0);">
        Designing digital systems that build trust.
      </h1>
      <p class="text-lg opacity-85 mb-8 max-w-xl leading-relaxed" style="color: var(--text-color, #e2e8f0);">
        Greetings! I construct expressive minimalist user experiences, custom web systems, and brand design guidelines for growth startups globally.
      </p>
      <div class="flex items-center gap-6">
        <button class="px-6 py-3 font-semibold transition-all hover:opacity-90 hover:scale-105 active:scale-95" style="background-color: var(--primary-color, #8b5cf6); color: #fff; border-radius: var(--border-radius, 12px);">
          My Case Studies
        </button>
        <a href="#contact" class="font-semibold underline hover:opacity-85 transition-opacity" style="color: var(--text-color, #e2e8f0);">Let's collaborate</a>
      </div>
    </div>
    <div class="lg:col-span-5 relative">
      <div class="aspect-[4/5] rounded-2xl overflow-hidden relative shadow-2xl transition-transform hover:rotate-1" style="background-color: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.08);">
        <div class="absolute inset-0 bg-gradient-to-tr opacity-40" style="background-image: linear-gradient(to top right, var(--gradient-start, #8b5cf6), var(--gradient-end, #06b6d4));"></div>
        <div class="absolute inset-0 flex items-center justify-center">
          <svg class="w-16 h-16 opacity-30 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
        </div>
      </div>
    </div>
  </div>
</section>
    `.trim()
  },

  PRICING_3_TIER: {
    id: "PRICING_3_TIER",
    name: "Pricing Cards (3-Tier)",
    category: "sections",
    html: `
<section id="pricing" class="py-24 px-6 relative" style="background-color: var(--bg-color, #0f0f23);">
  <div class="max-w-7xl mx-auto">
    <div class="text-center mb-16">
      <h2 class="text-3xl md:text-4xl font-bold mb-4" style="font-family: var(--heading-font, sans-serif); color: var(--text-color, #e2e8f0);">Flexible Pricing for Everyone</h2>
      <p class="opacity-75 max-w-md mx-auto" style="color: var(--text-color, #e2e8f0);">Unlock premium attributes, unlimited pages, and safe sandbox operations designed around your team size.</p>
    </div>
    
    <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
      <!-- Card 1 -->
      <div class="border p-8 transition-transform hover:translate-y-[-4px]" style="border-radius: var(--border-radius, 12px); border-color: rgba(255,255,255,0.08); background-color: rgba(255,255,255,0.01);">
        <h3 class="text-xl font-bold mb-2">Startup Starter</h3>
        <p class="text-sm opacity-70 mb-6">Perfect for small portfolios and single-session apps.</p>
        <div class="flex items-baseline gap-1 mb-6">
          <span class="text-4xl font-bold">$0</span>
          <span class="text-sm opacity-60">/ month</span>
        </div>
        <button class="w-full py-2.5 font-medium border mb-8 hover:bg-white hover:bg-opacity-5 transition-all" style="border-radius: var(--border-radius, 12px); border-color: rgba(255,255,255,0.15); color: var(--text-color, #e2e8f0);">Get Started</button>
        <ul class="space-y-4 text-sm opacity-80">
          <li class="flex items-center gap-2">✓ Single Page License</li>
          <li class="flex items-center gap-2">✓ 100MB Asset Limit</li>
          <li class="flex items-center gap-2">✓ Direct Netlify Export</li>
        </ul>
      </div>

      <!-- Card 2 -->
      <div class="border p-8 relative transition-transform hover:translate-y-[-4px]" style="border-radius: var(--border-radius, 12px); border-color: var(--primary-color, #8b5cf6); background-color: rgba(255,255,255,0.03);">
        <div class="absolute top-0 right-6 translate-y-[-50%] px-3 py-1 text-xs font-bold uppercase rounded-full text-white" style="background-color: var(--primary-color, #8b5cf6);">Popular</div>
        <h3 class="text-xl font-bold mb-2">Professional Designer</h3>
        <p class="text-sm opacity-70 mb-6 font-medium" style="color: var(--secondary-color, #06b6d4);">Best for active agency designers.</p>
        <div class="flex items-baseline gap-1 mb-6">
          <span class="text-4xl font-bold">$19</span>
          <span class="text-sm opacity-60">/ month</span>
        </div>
        <button class="w-full py-2.5 font-semibold transition-all duration-300 hover:opacity-90 hover:scale-[1.01]" style="background-color: var(--primary-color, #8b5cf6); color: #fff; border-radius: var(--border-radius, 12px);">Upgrade Pro</button>
        <ul class="space-y-4 text-sm mt-8 opacity-90">
          <li class="flex items-center gap-2">✓ Unlimited Pages Support</li>
          <li class="flex items-center gap-2">✓ AI Mobile & A11y Scanner</li>
          <li class="flex items-center gap-2">✓ 5GB Shared Asset Manager</li>
          <li class="flex items-center gap-2" style="color: var(--secondary-color, #06b6d4);">✓ Premium Voice Assistant Agent</li>
        </ul>
      </div>

      <!-- Card 3 -->
      <div class="border p-8 transition-transform hover:translate-y-[-4px]" style="border-radius: var(--border-radius, 12px); border-color: rgba(255,255,255,0.08); background-color: rgba(255,255,255,0.01);">
        <h3 class="text-xl font-bold mb-2">Enterprise Lab</h3>
        <p class="text-sm opacity-70 mb-6">Powering professional teams with custom codes.</p>
        <div class="flex items-baseline gap-1 mb-6">
          <span class="text-4xl font-bold">$49</span>
          <span class="text-sm opacity-60">/ month</span>
        </div>
        <button class="w-full py-2.5 font-medium border mb-8 hover:bg-white hover:bg-opacity-5 transition-all" style="border-radius: var(--border-radius, 12px); border-color: rgba(255,255,255,0.15); color: var(--text-color, #e2e8f0);">Contact Sales</button>
        <ul class="space-y-4 text-sm opacity-80">
          <li class="flex items-center gap-2">✓ Custom Domain Wiring</li>
          <li class="flex items-center gap-2">✓ Dedicated Team Workplaces</li>
          <li class="flex items-center gap-2">✓ Infinite Git & ZIP Backups</li>
          <li class="flex items-center gap-2">✓ Unlimited API Queries</li>
        </ul>
      </div>
    </div>
  </div>
</section>
    `.trim()
  },

  FEATURES_GRID: {
    id: "FEATURES_GRID",
    name: "Features Grid (3x3)",
    category: "sections",
    html: `
<section id="features" class="py-24 px-6 relative" style="background-color: var(--bg-color, #0f0f23);">
  <div class="max-w-7xl mx-auto">
    <div class="text-center mb-16">
      <span class="text-xs font-bold uppercase tracking-wider" style="color: var(--primary-color, #8b5cf6);">Built for power designers</span>
      <h2 class="text-3xl md:text-5xl font-bold mt-2" style="font-family: var(--heading-font, sans-serif); color: var(--text-color, #e2e8f0);">Engineered to perform.</h2>
    </div>
    
    <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
      <!-- Block 1 -->
      <div class="p-8 border h-full transition-all group hover:border-indigo-500 duration-300" style="border-radius: var(--border-radius, 12px); border-color: rgba(255,255,255,0.08); background-color: rgba(255,255,255,0.01);">
        <div class="w-12 h-12 rounded-xl flex items-center justify-center mb-6 text-white group-hover:scale-110 transition-transform" style="background-color: var(--primary-color, #8b5cf6);">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
        </div>
        <h3 class="text-lg font-bold mb-2">Ultra-Fast Renderer</h3>
        <p class="text-sm opacity-75" style="color: var(--text-color, #e2e8f0);">Harness state-of-the-art layout engines supporting zero HMR lag and instant compilation.</p>
      </div>

      <!-- Block 2 -->
      <div class="p-8 border h-full transition-all group hover:border-emerald-500 duration-300" style="border-radius: var(--border-radius, 12px); border-color: rgba(255,255,255,0.08); background-color: rgba(255,255,255,0.01);">
        <div class="w-12 h-12 rounded-xl flex items-center justify-center mb-6 text-white group-hover:scale-110 transition-transform" style="background-color: var(--secondary-color, #06b6d4);">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
        </div>
        <h3 class="text-lg font-bold mb-2">AI Safety Sandboxing</h3>
        <p class="text-sm opacity-75" style="color: var(--text-color, #e2e8f0);">Absolute defense using 4 strict validator layers mapping code safely onto the canvas.</p>
      </div>

      <!-- Block 3 -->
      <div class="p-8 border h-full transition-all group hover:border-amber-500 duration-300" style="border-radius: var(--border-radius, 12px); border-color: rgba(255,255,255,0.08); background-color: rgba(255,255,255,0.01);">
        <div class="w-12 h-12 rounded-xl flex items-center justify-center mb-6 text-white group-hover:scale-110 transition-transform" style="background-color: var(--accent-color, #f59e0b);">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 100-6 3 3 0 000 6z"></path></svg>
        </div>
        <h3 class="text-lg font-bold mb-2">Voice Assistant Control</h3>
        <p class="text-sm opacity-75" style="color: var(--text-color, #e2e8f0);">Create beautiful visual sections, modify backgrounds, and optimize with standard vocal briefs.</p>
      </div>
    </div>
  </div>
</section>
    `.trim()
  },

  TESTIMONIALS_CAROUSEL: {
    id: "TESTIMONIALS_CAROUSEL",
    name: "Testimonials Carousel",
    category: "sections",
    html: `
<section id="testimonials" class="py-24 px-6 relative" style="background-color: var(--bg-color, #0f0f23);">
  <div class="max-w-7xl mx-auto">
    <div class="text-center mb-16">
      <h2 class="text-3xl md:text-4xl font-bold" style="font-family: var(--heading-font, sans-serif); color: var(--text-color, #e2e8f0);">Revered by Developers</h2>
    </div>
    
    <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
      <div class="border p-8 relative flex flex-col justify-between" style="border-radius: var(--border-radius, 12px); border-color: rgba(255,255,255,0.08); background-color: rgba(255,255,255,0.01);">
        <p class="text-base italic leading-relaxed mb-6" style="color: var(--text-color, #e2e8f0);">
          "The one-shot AI website rendering generated our complete multi-page design scheme with custom style tags, completely blowing us away inside 8 seconds."
        </p>
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center font-bold text-xs" style="color: var(--secondary-color, #06b6d4);">EH</div>
          <div>
            <h4 class="text-sm font-bold">Erik H.</h4>
            <span class="text-xs opacity-60">Director of Branding, Vercel</span>
          </div>
        </div>
      </div>

      <div class="border p-8 relative flex flex-col justify-between" style="border-radius: var(--border-radius, 12px); border-color: rgba(255,255,255,0.08); background-color: rgba(255,255,255,0.01);">
        <p class="text-base italic leading-relaxed mb-6" style="color: var(--text-color, #e2e8f0);">
          "Having an Integrated CSS/HTML/JS safety validator guarantees our customer data remains totally safe from standard visual cross-site script exploits."
        </p>
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center font-bold text-xs" style="color: var(--primary-color, #8b5cf6);">SA</div>
          <div>
            <h4 class="text-sm font-bold">Sarah A.</h4>
            <span class="text-xs opacity-60">VP Security Operations, Shield</span>
          </div>
        </div>
      </div>

      <div class="border p-8 relative flex flex-col justify-between" style="border-radius: var(--border-radius, 12px); border-color: rgba(255,255,255,0.08); background-color: rgba(255,255,255,0.01);">
        <p class="text-base italic leading-relaxed mb-6" style="color: var(--text-color, #e2e8f0);">
          "We speak layout directives to the design suite directly, watching borders transform, assets load, and accessibility fix itself using the developer agent."
        </p>
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center font-bold text-xs" style="color: var(--accent-color, #f59e0b);">MK</div>
          <div>
            <h4 class="text-sm font-bold">Marcus K.</h4>
            <span class="text-xs opacity-60">Lead Architect, Stripe</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>
    `.trim()
  },

  FAQ_ACCORDION: {
    id: "FAQ_ACCORDION",
    name: "Interactive FAQ Accordion",
    category: "sections",
    html: `
<section id="faq" class="py-24 px-6" style="background-color: var(--bg-color, #0f0f23);">
  <div class="max-w-3xl mx-auto">
    <div class="text-center mb-16">
      <h2 class="text-3xl font-bold" style="font-family: var(--heading-font, sans-serif); color: var(--text-color, #e2e8f0);">Frequently Asked Questions</h2>
    </div>
    
    <div class="space-y-4">
      <div class="border rounded-xl px-6 py-4" style="border-color: rgba(255,255,255,0.08); background-color: rgba(255,255,255,0.01);">
        <h4 class="font-bold text-lg cursor-pointer flex justify-between items-center">
          How operates the Safety validation layer?
          <span class="font-mono text-xs">+</span>
        </h4>
        <p class="mt-2 text-sm opacity-70 leading-relaxed hidden">
          Every custom markup generated by the artificial intelligence agents is validated dynamically against our 4 filters inside <code>/src/lib/ai-safety.ts</code>.
        </p>
      </div>

      <div class="border rounded-xl px-6 py-4" style="border-color: rgba(255,255,255,0.08); background-color: rgba(255,255,255,0.01);">
        <h4 class="font-bold text-lg cursor-pointer flex justify-between items-center">
          Can I run this without active local Ollama?
          <span class="font-mono text-xs">+</span>
        </h4>
        <p class="mt-2 text-sm opacity-70 leading-relaxed">
          Yes! If Ollama is offline, SiteForge seamlessly routes requests to the server-side cloud Gemini AI model, with a secondary hybrid rule-based template fallback.
        </p>
      </div>

      <div class="border rounded-xl px-6 py-4" style="border-color: rgba(255,255,255,0.08); background-color: rgba(255,255,255,0.01);">
        <h4 class="font-bold text-lg cursor-pointer flex justify-between items-center">
          How does Voice AI speech detection execute?
          <span class="font-mono text-xs">+</span>
        </h4>
        <p class="mt-2 text-sm opacity-70 leading-relaxed hidden">
          Using standard Web Speech API, we capture voice transcripts directly, route via our custom structural Agent Router, and perform updates dynamically.
        </p>
      </div>
    </div>
  </div>
</section>
    `.trim()
  },

  CTA_SECTION: {
    id: "CTA_SECTION",
    name: "Gradient Call-To-Action",
    category: "sections",
    html: `
<section id="cta" class="py-24 px-6 relative overflow-hidden" style="background-color: var(--bg-color, #0f0f23);">
  <div class="max-w-5xl mx-auto rounded-3xl p-12 overflow-hidden relative shadow-2xl scale-[0.99] border border-opacity-20" style="border-color: rgba(255,255,255,0.1); background: linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(6, 182, 212, 0.15));">
    <div class="absolute inset-x-0 bottom-0 top-1/2 bg-radial pointer-events-none opacity-45" style="background-image: radial-gradient(circle, var(--accent-color, #f59e0b) 0%, transparent 80%);"></div>
    <div class="relative z-10 text-center max-w-2xl mx-auto">
      <h2 class="text-3xl md:text-4xl font-bold mb-4" style="font-family: var(--heading-font, sans-serif); color: var(--text-color, #e2e8f0);">Ready to transform your web design?</h2>
      <p class="opacity-80 mb-8">Export fully-optimized React, Vue, HTML, next-generation bundles, manifest data, and access automatic accessibility adjustments with a single command.</p>
      <div class="flex flex-col sm:flex-row gap-3 max-w-md mx-auto items-center justify-center">
        <input type="email" placeholder="Your work email..." class="px-4 py-3 text-sm rounded-xl w-full border border-opacity-25" style="border-color: rgba(255,255,255,0.25); background-color: rgba(0,0,0,0.2); color: var(--text-color, #e2e8f0); max-width: 280px;" />
        <button class="px-5 py-3 font-semibold transition-all hover:scale-105" style="background-color: var(--primary-color, #8b5cf6); color: #fff; border-radius: var(--border-radius, 12px); font-size: 0.875rem;">Join Beta Now</button>
      </div>
    </div>
  </div>
</section>
    `.trim()
  },

  CONTACT_FORM: {
    id: "CONTACT_FORM",
    name: "Standard Contact Form",
    category: "forms",
    html: `
<section id="contact" class="py-24 px-6" style="background-color: var(--bg-color, #0f0f23);">
  <div class="max-w-2xl mx-auto border p-10 shadow-xl" style="border-radius: var(--border-radius, 12px); border-color: rgba(255,255,255,0.08); background-color: rgba(255,255,255,0.01);">
    <h3 class="text-2xl font-bold mb-2">Connect with SiteForge</h3>
    <p class="text-sm opacity-65 mb-8">Let's chat about establishing premium multi-device sandboxes for your branding operations.</p>
    
    <form class="space-y-6">
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <label class="block text-xs font-semibold mb-2 uppercase opacity-85">First Name</label>
          <input type="text" placeholder="John" class="w-full px-4 py-3 rounded-lg border text-sm" style="border-color: rgba(255,255,255,0.12); background-color: rgba(0,0,0,0.15); color: var(--text-color, #e2e8f0);" />
        </div>
        <div>
          <label class="block text-xs font-semibold mb-2 uppercase opacity-85">Work Email</label>
          <input type="email" placeholder="john@company.com" class="w-full px-4 py-3 rounded-lg border text-sm" style="border-color: rgba(255,255,255,0.12); background-color: rgba(0,0,0,0.15); color: var(--text-color, #e2e8f0);" />
        </div>
      </div>
      
      <div>
        <label class="block text-xs font-semibold mb-2 uppercase opacity-85">Company Website Choice</label>
        <select class="w-full px-4 py-3 rounded-lg border text-sm" style="border-color: rgba(255,255,255,0.12); background-color: rgba(0,0,0,0.15); color: var(--text-color, #e2e8f0);">
          <option>SaaS Platform Launch</option>
          <option>Portfolio Showcase</option>
          <option>Enterprise Tech Grid</option>
        </select>
      </div>

      <div>
        <label class="block text-xs font-semibold mb-2 uppercase opacity-85">Message Brief</label>
        <textarea rows="4" placeholder="How can our AI assistance assist you..." class="w-full px-4 py-3 rounded-lg border text-sm" style="border-color: rgba(255,255,255,0.12); background-color: rgba(0,0,0,0.15); color: var(--text-color, #e2e8f0);"></textarea>
      </div>

      <button type="submit" class="w-full py-3.5 font-bold transition-all hover:opacity-95" style="background-color: var(--primary-color, #8b5cf6); color: #fff; border-radius: var(--border-radius, 12px);">Transmit Message</button>
    </form>
  </div>
</section>
    `.trim()
  },

  TEAM_GRID: {
    id: "TEAM_GRID",
    name: "Architect Team Grid",
    category: "sections",
    html: `
<section id="team" class="py-24 px-6" style="background-color: var(--bg-color, #0f0f23);">
  <div class="max-w-7xl mx-auto">
    <div class="text-center mb-16">
      <span class="text-xs font-bold uppercase tracking-widest text-[#8b5cf6]" style="color: var(--primary-color, #8b5cf6);">Master Minds</span>
      <h2 class="text-3xl font-bold mt-2">Executive Leadership</h2>
    </div>
    
    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
      <!-- Member 1 -->
      <div class="border text-center overflow-hidden transition-all duration-300 hover:scale-[1.02]" style="border-radius: var(--border-radius, 12px); border-color: rgba(255,255,255,0.08); background-color: rgba(255,255,255,0.01);">
        <div class="aspect-square bg-slate-800 flex items-center justify-center text-3xl font-bold font-mono opacity-50">E01</div>
        <div class="p-6">
          <h4 class="font-bold text-lg">Alan Mercer</h4>
          <p class="text-xs font-medium uppercase opacity-60 mb-2">Chief Design Architect</p>
          <span class="text-sm opacity-75">Visual mastermind leading SiteForge core UI/UX models.</span>
        </div>
      </div>
      <!-- Member 2 -->
      <div class="border text-center overflow-hidden transition-all duration-300 hover:scale-[1.02]" style="border-radius: var(--border-radius, 12px); border-color: rgba(255,255,255,0.08); background-color: rgba(255,255,255,0.01);">
        <div class="aspect-square bg-slate-800 flex items-center justify-center text-3xl font-bold font-mono opacity-50">E02</div>
        <div class="p-6">
          <h4 class="font-bold text-lg">Dr. Julia Vance</h4>
          <p class="text-xs font-medium uppercase opacity-60 mb-2">VP Safety AI</p>
          <span class="text-sm opacity-75">Securing artificial algorithms with proactive middleware layers.</span>
        </div>
      </div>
      <!-- Member 3 -->
      <div class="border text-center overflow-hidden transition-all duration-300 hover:scale-[1.02]" style="border-radius: var(--border-radius, 12px); border-color: rgba(255,255,255,0.08); background-color: rgba(255,255,255,0.01);">
        <div class="aspect-square bg-slate-800 flex items-center justify-center text-3xl font-bold font-mono opacity-50">E03</div>
        <div class="p-6">
          <h4 class="font-bold text-lg">Kenji Sato</h4>
          <p class="text-xs font-medium uppercase opacity-60 mb-2">Principal Systems Eng</p>
          <span class="text-sm opacity-75">Refactoring high-throughput compilers for zero-lag builds.</span>
        </div>
      </div>
      <!-- Member 4 -->
      <div class="border text-center overflow-hidden transition-all duration-300 hover:scale-[1.02]" style="border-radius: var(--border-radius, 12px); border-color: rgba(255,255,255,0.08); background-color: rgba(255,255,255,0.01);">
        <div class="aspect-square bg-slate-800 flex items-center justify-center text-3xl font-bold font-mono opacity-50">E04</div>
        <div class="p-6">
          <h4 class="font-bold text-lg">Zaria El-Amin</h4>
          <p class="text-xs font-medium uppercase opacity-60 mb-2">Voice Lead Developer</p>
          <span class="text-sm opacity-75">Wiring browser Web Speech integrations with fast local fallbacks.</span>
        </div>
      </div>
    </div>
  </div>
</section>
    `.trim()
  },

  GALLERY_MASONRY: {
    id: "GALLERY_MASONRY",
    name: "Portfolio Masonry Gallery",
    category: "media",
    html: `
<section id="gallery" class="py-24 px-6" style="background-color: var(--bg-color, #0f0f23);">
  <div class="max-w-7xl mx-auto">
    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
      <div class="group relative overflow-hidden rounded-xl border aspect-video flex items-center justify-center bg-slate-800" style="border-color: rgba(255,255,255,0.08);">
        <span class="font-mono text-xs opacity-50">Visual Brand Design</span>
      </div>
      <div class="group relative overflow-hidden rounded-xl border aspect-[3/4] flex items-center justify-center bg-slate-800 row-span-2" style="border-color: rgba(255,255,255,0.08);">
        <span class="font-mono text-xs opacity-50">SaaS Interface Mockups</span>
      </div>
      <div class="group relative overflow-hidden rounded-xl border aspect-[4/5] flex items-center justify-center bg-slate-800" style="border-color: rgba(255,255,255,0.08);">
        <span class="font-mono text-xs opacity-50">Interactive Web Apps</span>
      </div>
      <div class="group relative overflow-hidden rounded-xl border aspect-video flex items-center justify-center bg-slate-800" style="border-color: rgba(255,255,255,0.08);">
        <span class="font-mono text-xs opacity-50">Editorial Layout Guides</span>
      </div>
      <div class="group relative overflow-hidden rounded-xl border aspect-square flex items-center justify-center bg-slate-800" style="border-color: rgba(255,255,255,0.08);">
        <span class="font-mono text-xs opacity-50">Product Packaging Systems</span>
      </div>
    </div>
  </div>
</section>
    `.trim()
  },

  BLOG_CARDS: {
    id: "BLOG_CARDS",
    name: "Agency Blog Grid (3-Card)",
    category: "sections",
    html: `
<section id="blog" class="py-24 px-6" style="background-color: var(--bg-color, #0f0f23);">
  <div class="max-w-7xl mx-auto">
    <div class="flex justify-between items-end mb-16">
      <div>
        <h2 class="text-3xl font-bold" style="font-family: var(--heading-font, sans-serif); color: var(--text-color, #e2e8f0);">Latest Design Briefs</h2>
      </div>
      <a href="#blog" class="font-bold underline" style="color: var(--primary-color, #8b5cf6);">Examine all briefings</a>
    </div>
    
    <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
      <!-- Article 1 -->
      <article class="border overflow-hidden transition-transform duration-300 hover:translate-y-[-4px]" style="border-radius: var(--border-radius, 12px); border-color: rgba(255,255,255,0.08); background-color: rgba(255,255,255,0.01);">
        <div class="aspect-video bg-indigo-950 flex items-center justify-center font-mono text-xs opacity-40">Post Artwork 1</div>
        <div class="p-6">
          <div class="flex items-center gap-2 mb-4 text-xs font-semibold" style="color: var(--secondary-color, #06b6d4);">
            <span>AI Safety</span> • <span>Jun 12, 2026</span>
          </div>
          <h4 class="text-lg font-bold mb-3">Securing the Generative UI Canvas Pipeline</h4>
          <p class="text-sm opacity-70 mb-4" style="color: var(--text-color, #e2e8f0);">Exploring sandbox environments, automated SVG sanitize strategies, and XSS containment filters.</p>
        </div>
      </article>

      <!-- Article 2 -->
      <article class="border overflow-hidden transition-transform duration-300 hover:translate-y-[-4px]" style="border-radius: var(--border-radius, 12px); border-color: rgba(255,255,255,0.08); background-color: rgba(255,255,255,0.01);">
        <div class="aspect-video bg-fuchsia-950 flex items-center justify-center font-mono text-xs opacity-40">Post Artwork 2</div>
        <div class="p-6">
          <div class="flex items-center gap-2 mb-4 text-xs font-semibold" style="color: var(--secondary-color, #06b6d4);">
            <span>Voice UX</span> • <span>Jun 10, 2026</span>
          </div>
          <h4 class="text-lg font-bold mb-3">Talking with Textures: Speech-driven Layouts</h4>
          <p class="text-sm opacity-70 mb-4" style="color: var(--text-color, #e2e8f0);">Refactoring Web Speech API commands to enable instant layout scaling, coloring, and section placement.</p>
        </div>
      </article>

      <!-- Article 3 -->
      <article class="border overflow-hidden transition-transform duration-300 hover:translate-y-[-4px]" style="border-radius: var(--border-radius, 12px); border-color: rgba(255,255,255,0.08); background-color: rgba(255,255,255,0.01);">
        <div class="aspect-video bg-emerald-950 flex items-center justify-center font-mono text-xs opacity-40">Post Artwork 3</div>
        <div class="p-6">
          <div class="flex items-center gap-2 mb-4 text-xs font-semibold" style="color: var(--secondary-color, #06b6d4);">
            <span>A11y Metrics</span> • <span>Jun 05, 2026</span>
          </div>
          <h4 class="text-lg font-bold mb-3">Achieving High-Contrast Compliance Dynamically</h4>
          <p class="text-sm opacity-70 mb-4" style="color: var(--text-color, #e2e8f0);">How our developer agent parses contrast metrics, scans WCAG levels, and fixes button scopes.</p>
        </div>
      </article>
    </div>
  </div>
</section>
    `.trim()
  },

  SERVICES_LIST: {
    id: "SERVICES_LIST",
    name: "Core Services List",
    category: "sections",
    html: `
<section id="services" class="py-24 px-6" style="background-color: var(--bg-color, #0f0f23);">
  <div class="max-w-7xl mx-auto">
    <div class="text-center mb-16">
      <h2 class="text-3xl font-bold" style="font-family: var(--heading-font, sans-serif); color: var(--text-color, #e2e8f0);">Architectural Offerings</h2>
    </div>
    
    <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
      <div class="border p-6" style="border-radius: var(--border-radius, 12px); border-color: rgba(255,255,255,0.08); background-color: rgba(255,255,255,0.01);">
        <h4 class="font-bold text-lg mb-2">Systems Strategy</h4>
        <p class="text-sm opacity-75">Designing durable state paradigms designed around robust multi-page operations.</p>
      </div>

      <div class="border p-6" style="border-radius: var(--border-radius, 12px); border-color: rgba(255,255,255,0.08); background-color: rgba(255,255,255,0.01);">
        <h4 class="font-bold text-lg mb-2">Visual Compiling</h4>
        <p class="text-sm opacity-75">Harnessing standard responsive styling libraries to export compiled static outputs.</p>
      </div>

      <div class="border p-6" style="border-radius: var(--border-radius, 12px); border-color: rgba(255,255,255,0.08); background-color: rgba(255,255,255,0.01);">
        <h4 class="font-bold text-lg mb-2">Safety Audits</h4>
        <p class="text-sm opacity-75">Dynamic protection loops shielding interfaces from arbitrary text injections.</p>
      </div>

      <div class="border p-6" style="border-radius: var(--border-radius, 12px); border-color: rgba(255,255,255,0.08); background-color: rgba(255,255,255,0.01);">
        <h4 class="font-bold text-lg mb-2">A11y Scanning</h4>
        <p class="text-sm opacity-75">Wording structures dynamically, adding ARIA elements and keyboard path navigation.</p>
      </div>
    </div>
  </div>
</section>
    `.trim()
  },

  FOOTER_FULL: {
    id: "FOOTER_FULL",
    name: "Full Brand Footer",
    category: "layout",
    html: `
<footer id="footer-full" class="border-t py-16 px-6" style="border-color: rgba(255,255,255,0.08); background-color: var(--bg-color, #0f0f23);">
  <div class="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
    <div class="col-span-2">
      <div class="flex items-center gap-2 mb-4">
        <span class="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-white text-xs" style="background: linear-gradient(135deg, var(--gradient-start, #8b5cf6), var(--gradient-end, #06b6d4));">SF</span>
        <span class="font-bold text-sm tracking-tight" style="color: var(--text-color, #e2e8f0);">SiteForge</span>
      </div>
      <p class="text-xs opacity-70 leading-relaxed max-w-xs mb-4">
        Deploying generative design grids safely since 2026. Empowering startups, developers, and designers with smart code sandboxes.
      </p>
      <div class="flex items-center gap-4 text-xs font-semibold">
        🟢 Systems Online
      </div>
    </div>
    <div>
      <h5 class="text-xs font-bold uppercase tracking-widest opacity-60 mb-4 text-white">Platform</h5>
      <ul class="space-y-2 text-xs opacity-75" style="color: var(--text-color, #e2e8f0);">
         <li><a href="#hero" class="hover:underline">Interface Creator</a></li>
         <li><a href="#features" class="hover:underline">Safety Sandboxes</a></li>
         <li><a href="#pricing" class="hover:underline">Pricing scale</a></li>
      </ul>
    </div>
    <div>
      <h5 class="text-xs font-bold uppercase tracking-widest opacity-60 mb-4 text-white">Compliance</h5>
      <ul class="space-y-2 text-xs opacity-75" style="color: var(--text-color, #e2e8f0);">
         <li><a href="#faq" class="hover:underline">A11y Compliance</a></li>
         <li><a href="#blog" class="hover:underline">XSS Safeguards</a></li>
         <li><a href="#contact" class="hover:underline">Terms of Service</a></li>
      </ul>
    </div>
    <div>
      <h5 class="text-xs font-bold uppercase tracking-widest opacity-60 mb-4 text-white">Interactive</h5>
      <ul class="space-y-2 text-xs opacity-75" style="color: var(--text-color, #e2e8f0);">
         <li><a href="#contact" class="hover:underline">Request Access</a></li>
         <li><a href="#blog" class="hover:underline">Engineering Blog</a></li>
      </ul>
    </div>
  </div>
  <div class="max-w-7xl mx-auto border-t border-opacity-10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs opacity-60" style="border-color: rgba(255,255,255,0.1)">
     <span>© 2026 SiteForge Solutions, Inc. All rights reserved.</span>
     <div class="flex items-center gap-6">
        <a href="#hero" class="hover:underline">Privacy Charter</a>
        <a href="#hero" class="hover:underline">Cookie Policy</a>
     </div>
  </div>
</footer>
    `.trim()
  }
};
