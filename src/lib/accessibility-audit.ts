/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface AccessibilityIssue {
  id: string;
  category: string;
  element: string;
  snippet: string;
  description: string;
  suggestedFix: string;
  severity: 'error' | 'warning';
}

export function auditAccessibility(html: string): { score: number; issues: AccessibilityIssue[] } {
  const issues: AccessibilityIssue[] = [];
  if (!html) return { score: 100, issues: [] };

  // 1. Check for images without alt tags or with blank alt tags
  const imgTags = html.match(/<img\b[^>]*>/gi) || [];
  for (const img of imgTags) {
    if (!img.includes('alt=') || /alt=(['"])(\s*)\1/i.test(img)) {
      issues.push({
        id: "a11y-img-alt",
        category: "Images",
        element: "img",
        snippet: img,
        description: "Image element lacks a descriptive 'alt' attribute, blinding screen readers.",
        suggestedFix: `Add a descriptive alt tag, e.g. alt="Business workspace preview".`,
        severity: "error"
      });
    }
  }

  // 2. Check for headings hierarchy skips (e.g. going from h1 directly to h3 without an h2)
  const headings = [...html.matchAll(/<h([1-6])\b[^>]*>/gi)].map(match => parseInt(match[1]));
  let activeLevel = 0;
  for (const lvl of headings) {
    if (activeLevel > 0 && lvl > activeLevel + 1) {
      issues.push({
        id: "a11y-heading-skip",
        category: "Structure",
        element: `h${lvl}`,
        snippet: `<h${lvl}> Heading tag`,
        description: `Heading level h${lvl} skips hierarchy level (H${activeLevel} directly to H${lvl}).`,
        suggestedFix: `Reorganize the layout elements to go from H${activeLevel} to H${activeLevel + 1}.`,
        severity: "warning"
      });
    }
    activeLevel = lvl;
  }

  // 3. Keep check on ARIA labels for buttons
  const buttons = html.match(/<button\b[^>]*>/gi) || [];
  for (const btn of buttons) {
    // If it is a generic button with just icons or blank, it absolutely needs an aria-label
    const hasAria = btn.includes('aria-label=') || btn.includes('aria-labelledby=');
    const isIconOnly = btn.includes('svg') || !/>[^<]+<\/button>/gi.test(html);
    if (isIconOnly && !hasAria) {
      issues.push({
        id: "a11y-btn-aria",
        category: "Interactive",
        element: "button",
        snippet: btn,
        description: "Interactive button lacks an 'aria-label' or screen reader description.",
        suggestedFix: `Introduce clear label tags e.g. aria-label="Perform calculation".`,
        severity: "error"
      });
    }
  }

  // 4. Form inputs without labels
  const inputs = html.match(/<input\b[^>]*>/gi) || [];
  for (const input of inputs) {
    const isInteractive = !/type=(['"])(hidden|submit|button)\1/i.test(input);
    const hasAria = input.includes('aria-label=') || input.includes('placeholder=') || input.includes('id=');
    if (isInteractive && !hasAria) {
      issues.push({
        id: "a11y-input-label",
        category: "Forms",
        element: "input",
        snippet: input,
        description: "Interactive input field does not match a formal label wrapper or placeholder.",
        suggestedFix: "Link to a matching label element, or add an aria-label descriptor.",
        severity: "warning"
      });
    }
  }

  // 5. Contrast warnings (simple checks for low color/opacity styles that impair visibility)
  if (html.includes('opacity-20') || html.includes('opacity-30') || html.includes('text-slate-500') || html.includes('text-gray-400')) {
    issues.push({
      id: "a11y-low-contrast",
      category: "Contrast",
      element: "text",
      snippet: "Found low-opacity text tags",
      description: "Text element contrast level might be below WCAG AAA standards (7:1 threshold).",
      suggestedFix: "Increase color contrast ratio or change opacity labels to at least opacity-80.",
      severity: "warning"
    });
  }

  // Calculations
  const errorCount = issues.filter(i => i.severity === 'error').length;
  const warnCount = issues.length - errorCount;
  const score = Math.max(0, 100 - (errorCount * 15) - (warnCount * 5));

  return { score, issues };
}

export function fixAllAccessibilityIssues(html: string): string {
  if (!html) return html;

  let fixed = html;

  // 1. Inject placeholder alt attributes into images missing them
  fixed = fixed.replace(/<img\s+(?![^>]*\balt=)([^>]*?)>/gi, '<img alt="SiteForge generated design" $1>');
  
  // 2. Fix empty alt attribute variables
  fixed = fixed.replace(/alt=(['"])\s*\1/gi, 'alt="Visual graphics description"');

  // 3. Inject generic aria-labels to unlabelled buttons
  fixed = fixed.replace(/<button\s+(?![^>]*\baria-label=)([^>]*?)>/gi, '<button aria-label="Control element actions" $1>');

  // 4. Inject ARIA accessibility helpers into unlabelled text fields
  fixed = fixed.replace(/<input\s+(?![^>]*\b(aria-label|placeholder|id)=)([^>]*?)>/gi, '<input aria-label="Form details details" placeholder="Form details details" $1>');

  // 5. Relabel heading skip levels (if needed, clean representation checks)
  return fixed;
}
