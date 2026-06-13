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
    model: "llama3.1",
    systemPrompt: `
Senior UI/UX designer. Visual systems.
You focus on layout, colors, typography, and spacing.
You must return your choices using the pre-defined Command Registry COMMANDS structure.
Always adapt your generated styling parameters to the active DesignTokens and custom colors.
Respond with a single JSON object (with no markdown wrappers like \`\`\`json) of format:
{
  "command": "add_hero" | "change_background" | "change_color" | "change_font" | etc,
  "params": { ... }
}
`.trim()
  },
  COPYWRITER: {
    id: "COPYWRITER",
    name: "Copywriter Agent",
    role: "Professional Conversion Copywriter",
    model: "llama3.1",
    systemPrompt: `
Conversion-focused copywriter. Punchy, clear.
Write headlines, body text, and CTAs.
You must return your choices using the Command Registry structure.
Respond with a single JSON object (with no markdown wrappers) of format:
{
  "command": "update_text",
  "params": { "text": "compelling header copy..." }
}
`.trim()
  },
  SEO: {
    id: "SEO",
    name: "SEO Agent",
    role: "SEO Specialist & Structured Metadata Analyst",
    model: "mistral",
    systemPrompt: `
SEO specialist. JSON-LD schema. Alt text always.
Optimize titles, meta tags, and schema. Add alt text of images.
You must return your choices using the Command Registry structure.
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
    model: "llama3.1",
    systemPrompt: `
Accessibility auditor. WCAG 2.1 AA.
Analyze and repair contrast ratios, ARIA labels, and keyboard nav.
You must return your choices using the Command Registry structure.
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
Senior frontend dev. Clean semantic code.
Focus on code generation, clean structures, and export logic.
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

  // Explicit routing matches
  if (normalized.includes("make it prettier")) {
    return AGENTS.DESIGNER;
  }
  if (normalized.includes("write text") || normalized.includes("headline") || normalized.includes("copywriter") || normalized.includes("slogan")) {
    return AGENTS.COPYWRITER;
  }
  if (normalized.includes("optimize") || normalized.includes("seo") || normalized.includes("metadata")) {
    return AGENTS.SEO;
  }
  if (normalized.includes("accessible?") || normalized.includes("accessibility") || normalized.includes("contrast") || normalized.includes("wcag")) {
    return AGENTS.ACCESSIBILITY;
  }
  if (normalized.includes("export") || normalized.includes("code") || normalized.includes("developer")) {
    return AGENTS.DEVELOPER;
  }

  // 1. Accessibility queries
  if (
    normalized.includes("a11y") || 
    normalized.includes("alt tag") || 
    normalized.includes("aria") || 
    normalized.includes("screen reader") || 
    normalized.includes("keyboard")
  ) {
    return AGENTS.ACCESSIBILITY;
  }

  // 2. SEO queries
  if (
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
    normalized.includes("copy") ||
    normalized.includes("text") ||
    normalized.includes("paragraph") || 
    normalized.includes("catchy")
  ) {
    return AGENTS.COPYWRITER;
  }

  // 4. Developer queries
  if (
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
