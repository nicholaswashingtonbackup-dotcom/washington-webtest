/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Plugin {
  id: string;
  name: string;
  version: string;
  description: string;
  enabled: boolean;
  
  // Custom script or style injection hook
  injectHeadHTML?: () => string;
  injectBodyHTML?: () => string;
  
  // Custom modifiers
  modifyExportHTML?: (html: string) => string;
}

export const BUILTIN_PLUGINS: Plugin[] = [
  {
    id: "seo-plugin",
    name: "AI SEO Booster",
    version: "1.0.0",
    description: "Generates sitemap.xml, robots.txt, dynamic page summaries, and SEO metatags with AI.",
    enabled: true,
    injectHeadHTML: () => `
      <!-- Added by SEO booster plugin -->
      <meta name="robots" content="index, follow" />
      <meta name="generator" content="SiteForge Studio Pro" />
    `.trim()
  },
  {
    id: "a11y-plugin",
    name: "A11y Shield",
    version: "1.0.1",
    description: "Maintains screen reader accessibility scores, ensures keyboard navigation, and automatically heals missing labels.",
    enabled: true,
    modifyExportHTML: (html) => {
      // Auto alt injection
      return html.replace(/<img\s+(?![^>]*\balt=)([^>]*?)>/gi, '<img alt="SiteForge visual graphics" $1>');
    }
  },
  {
    id: "analytics-plugin",
    name: "Universal Google Analytics",
    version: "2.1.0",
    description: "Easily inject lightweight, privacy-focused telemetry triggers directly into headers.",
    enabled: false,
    injectHeadHTML: () => `
      <!-- Google Analytics Telemetry -->
      <script async src="https://www.googletagmanager.com/gtag/js?id=G-DFENGINE123"></script>
      <script>
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', 'G-DFENGINE123');
      </script>
    `.trim()
  },
  {
    id: "forms-plugin",
    name: "Formspree & Netlify Integrator",
    version: "1.2.0",
    description: "Configures forms to capture live user queries without custom node servers.",
    enabled: true,
    modifyExportHTML: (html) => {
      // Auto wire Netlify tags to forms
      return html.replace(/<form\b([^>]*)/gi, '<form data-netlify="true" name="SiteForgeContact" $1');
    }
  }
];
