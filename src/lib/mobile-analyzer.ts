/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface MobileIssue {
  id: string;
  category: string;
  description: string;
  severity: 'warning' | 'error';
  elementSnippet: string;
  suggestion: string;
}

export function analyzeMobileOptimization(html: string): { score: number; issues: MobileIssue[] } {
  const issues: MobileIssue[] = [];
  
  if (!html) {
    return { score: 100, issues: [] };
  }

  // Set up indicators/scandals
  // 1. Check for small font choices (e.g., text-xs, text-[11px], text-[12px] or smaller inline font-sizes)
  const smallFonts = html.match(/class="[^"]*\b(text-[a-z0-9]+|text-xs|text-\[11px\]|text-\[10px\])\b[^"]*"/gi);
  if (smallFonts) {
    issues.push({
      id: "mob-font-size",
      category: "Typography",
      description: "Font size is below reader safety baseline (14px). Text could be hard to read on smaller screens.",
      severity: "warning",
      elementSnippet: smallFonts[0].substring(0, 100),
      suggestion: "Increase small fonts to at least text-sm (14px) or higher."
    });
  }

  // 2. Check touch target limits (e.g. buttons with insufficient height/padding like px-1 py-1, p-1, h-8, small links)
  const buttonsWithSmallPadding = html.match(/<button\b[^>]*class="[^"]*\b(py-0\.5|py-1|p-0\.5|p-1|h-6|h-8)\b[^"]*"/gi);
  if (buttonsWithSmallPadding) {
    issues.push({
      id: "mob-touch-targets",
      category: "Interaction",
      description: "Button touch target area is less than 44px. Users might struggle on standard capacitive touch panels.",
      severity: "error",
      elementSnippet: buttonsWithSmallPadding[0].substring(0, 100),
      suggestion: "Increase vertical padding on buttons to py-2.5 or py-3 for comfortable tapping."
    });
  }

  // 3. Spacing between multiple buttons/tappable elements
  const tightTappables = html.match(/<button\b[^>]*>[\s\S]*?<\/button>\s*<button\b[^>]*>/gi);
  if (tightTappables) {
    issues.push({
      id: "mob-tappable-spacing",
      category: "Interaction",
      description: "Tappable button elements are positioned flush helper-cluttered without spacing gap.",
      severity: "warning",
      elementSnippet: tightTappables[0],
      suggestion: "Add gap-3 or margin elements to introduce at least 8px spacing."
    });
  }

  // 4. Mobile hamburger menu check
  const nonResponsiveNav = html.includes("<nav") && !html.includes("hamburger") && !html.includes("mobile-menu") && !html.includes("hidden md:flex");
  if (nonResponsiveNav) {
    issues.push({
      id: "mob-nav-menu",
      category: "Structure",
      description: "Header navigation lists appear fully visible without adaptive hidden grids or mobile hamburger triggers.",
      severity: "error",
      elementSnippet: "<nav> navigation structure",
      suggestion: "Integrate standard navigation with hidden links and a mobile hamburger menu overlay."
    });
  }

  // 5. Overflow checks (like absolute fixed widths e.g. w-[600px] or w-[800px] without responsive overrides)
  const fixedWidths = html.match(/class="[^"]*\b(w-\[500px\]|w-\[600px\]|w-\[800px\]|w-\[1000px\]|w-\[1200px\])\b[^"]*"/gi);
  if (fixedWidths) {
    issues.push({
      id: "mob-inline-overflow",
      category: "Layout",
      description: "Hardcoded large widths break horizontal boundaries creating horizontal scrolling scroll hazards on mobile devices.",
      severity: "error",
      elementSnippet: fixedWidths[0].substring(0, 100),
      suggestion: "Replace fixed large widths with responsive helpers (e.g. w-full max-w-xl)."
    });
  }

  // Compute mobile index logic
  const penalty = issues.reduce((acc, current) => acc + (current.severity === 'error' ? 25 : 10), 0);
  const score = Math.max(0, 100 - penalty);

  return { score, issues };
}

export function fixAllMobileIssues(html: string): string {
  if (!html) return html;

  let fixed = html;

  // 1. Fix small font sizes to safe text-sm
  fixed = fixed.replace(/\btext-xs\b/g, 'text-sm');
  fixed = fixed.replace(/\btext-\[10px\]\b/g, 'text-sm');
  fixed = fixed.replace(/\btext-\[11px\]\b/g, 'text-sm');
  fixed = fixed.replace(/\btext-\[12px\]\b/g, 'text-sm');

  // 2. Fix small buttons layout
  fixed = fixed.replace(/\bpy-1\b/g, 'py-2.5');
  fixed = fixed.replace(/\bpy-0\.5\b/g, 'py-2.5');
  fixed = fixed.replace(/\bp-1\b/g, 'p-2.5');
  fixed = fixed.replace(/\bp-0\.5\b/g, 'p-2.5');

  // 3. Fix fixed widths to be responsive safety widths
  fixed = fixed.replace(/\bw-\[500px\]\b/g, 'w-full max-w-md');
  fixed = fixed.replace(/\bw-\[600px\]\b/g, 'w-full max-w-lg');
  fixed = fixed.replace(/\bw-\[800px\]\b/g, 'w-full max-w-2xl');
  fixed = fixed.replace(/\bw-\[1000px\]\b/g, 'w-full max-w-4xl');
  fixed = fixed.replace(/\bw-\[1200px\]\b/g, 'w-full max-w-6xl');

  // 4. Inject visual spacing gap on buttons grid
  fixed = fixed.replace(/<\/button>\s*<button/g, '<\/button><div class="w-3 h-3 block sm:hidden"></div><button');

  return fixed;
}
