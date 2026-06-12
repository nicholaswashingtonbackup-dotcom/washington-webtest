/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ProjectContext } from './project-context';
import { COMMANDS, CommandKey } from './command-registry';

export interface AgentDescriptor {
  id: string;
  name: string;
  role: string;
  systemPrompt: string;
  model: string; // Recommended Ollama/Gemini model alias
}

export const AGENTS: Record<string, AgentDescriptor> = {
  DESIGNER: {
    id: "DESIGNER",
    name: "Designer Agent",
    role: "Senior UI/UX Designer & Theme Architect",
    model: "llama3",
    systemPrompt: `
You are a senior UI/UX designer. Your focus is on visual hierarchy, negative spacing, layout composition, and theme consistency.
You must return your choices using the pre-defined Command Registry COMMANDS structure.
Always adapt your generated styling parameters to the active DesignTokens and custom colors.
Never use generic or dull styling presets.
You can ONLY use commands from the Command Registry. 
Respond with a single JSON object (with no markdown wrappers like \`\`\`json) of format:
{
  "command": "add_hero" | "change_background" | etc,
  "params": { ... }
}
`.trim()
  },
  COPYWRITER: {
    id: "COPYWRITER",
    name: "Copywriter Agent",
    role: "Professional Conversion Copywriter",
    model: "mistral",
    systemPrompt: `
You are a professional conversion copywriter. Write brilliant, compelling, on-brand website lines, headings, paragraphs, and CTAs.
Structure content to evoke emotional response and trust based on the active target audience.
You must return your choices using the Command Registry structure.
You can ONLY use commands from the Command Registry. 
Respond with a single JSON object (with no markdown wrappers) of format:
{
  "command": "update_text" | "generate_content",
  "params": { ... }
}
`.trim()
  },
  SEO: {
    id: "SEO",
    name: "SEO Agent",
    role: "SEO Consultant & Structured Metadata Analyst",
    model: "llama3",
    systemPrompt: `
You are an SEO optimization expert. Optimize page titles, descriptions, open-graph cards, sitemap priorities, and keywords.
You must return your choices using the Command Registry structure.
You can ONLY use commands from the Command Registry. 
Respond with a single JSON object (with no markdown wrappers) of format:
{
  "command": "generate_seo",
  "params": { "page_id": "active", "metaTitle": "...", "metaDescription": "...", "metaKeywords": "..." }
}
`.trim()
  },
  ACCESSIBILITY: {
    id: "ACCESSIBILITY",
    name: "A11y Agent",
    role: "Accessibility Compliance Auditor",
    model: "codellama",
    systemPrompt: `
You are an accessibility auditor. Ensure compliance with WCAG 2.1 AA and AAA standards.
Optimize keyboard tab ordering, form labels, SVG screen reader support, descriptive links, and contrast ratios.
You must return your choices using the Command Registry structure.
You can ONLY use commands from the Command Registry. 
Respond with a single JSON object (with no markdown wrappers) of format:
{
  "command": "fix_accessibility" | "check_accessibility",
  "params": { ... }
}
`.trim()
  },
  DEVELOPER: {
    id: "DEVELOPER",
    name: "Developer Agent",
    role: "Principal Frontend Developer",
    model: "codellama",
    systemPrompt: `
You are a senior frontend developer. Focus on high performance, secure structures, and clean HTML/JS.
Validate components against XSS hazards, remove redundant styles, and optimize assets.
You can ONLY use commands from the Command Registry. 
Respond with a single JSON object (with no markdown wrappers) of format:
{
  "command": "add_spacer" | "add_container" | etc,
  "params": { ... }
}
`.trim()
  }
};

/**
 * Route raw transcripts or typed instructions to the matching expert agent
 */
export function routeAgent(query: string): AgentDescriptor {
  const normalized = query.toLowerCase();

  // 1. Accessibility queries
  if (
    normalized.includes("accessibility") || 
    normalized.includes("a11y") || 
    normalized.includes("contrast") || 
    normalized.includes("alt tag") || 
    normalized.includes("aria") || 
    normalized.includes("screen reader") || 
    normalized.includes("keyboard")
  ) {
    return AGENTS.ACCESSIBILITY;
  }

  // 2. SEO queries
  if (
    normalized.includes("seo") || 
    normalized.includes("metadata") || 
    normalized.includes("site title") || 
    normalized.includes("keywords") || 
    normalized.includes("google search") ||
    normalized.includes("desc")
  ) {
    return AGENTS.SEO;
  }

  // 3. Copywriter queries
  if (
    normalized.includes("write") || 
    normalized.includes("headline") || 
    normalized.includes("copy") ||
    normalized.includes("text") ||
    normalized.includes("paragraph") || 
    normalized.includes("catchy") || 
    normalized.includes("slogan")
  ) {
    return AGENTS.COPYWRITER;
  }

  // 4. Developer queries
  if (
    normalized.includes("code") || 
    normalized.includes("optimize") || 
    normalized.includes("performance") || 
    normalized.includes("speed") || 
    normalized.includes("fix") ||
    normalized.includes("spacer") ||
    normalized.includes("divider")
  ) {
    return AGENTS.DEVELOPER;
  }

  // 5. Default to the visual interface Designer Agent
  return AGENTS.DESIGNER;
}

/**
 * Injects project memory brief and design guidelines before passing query to LLM
 */
export function buildAgentPayload(
  agent: AgentDescriptor,
  query: string,
  context: ProjectContext,
  availableCommands: string[]
): string {
  return `
Role Context: ${agent.systemPrompt}

Current Designing Project Brief:
- Business Name: ${context.businessName}
- Description: ${context.description}
- Brand Tone: ${context.brandTone}
- Target Audience: ${context.targetAudience}
- Website Goals: ${context.goals.join(', ')}
- Pages: ${context.pages.join(', ')}

Active Design Tokens (Reference these in styles!):
- Primary Theme Color: ${context.primaryColor}
- Secondary Accent Color: ${context.secondaryColor}

Available Command Keys in Registry: [${availableCommands.join(', ')}]

User Directive: "${query}"

Return ONLY a single valid JSON object representing a registered command. Do NOT enclose in markdown tags like \`\`\`json. 
Format:
{
  "command": "add_hero",
  "params": { ... }
}
`.trim();
}
