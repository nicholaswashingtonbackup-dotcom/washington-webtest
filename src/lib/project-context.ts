/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface ProjectContext {
  websiteType: string;        // "Portfolio", "SaaS Landing Page", "E-commerce", etc.
  targetAudience: string;     // "Developers", "Small Business Owners", etc.
  brandTone: string;          // "Professional", "Playful", "Minimal", "Bold"
  primaryColor: string;
  secondaryColor: string;
  pages: string[];            // ["Home", "About", "Services"]
  businessName: string;
  description: string;
  goals: string[];            // ["Generate leads", "Showcase work"]
}

export const DEFAULT_PROJECT_CONTEXT: ProjectContext = {
  websiteType: "SaaS Landing Page",
  targetAudience: "Business Developers and Designers",
  brandTone: "Professional",
  primaryColor: "#8b5cf6",
  secondaryColor: "#06b6d4",
  pages: ["Home", "Features", "Pricing", "FAQ"],
  businessName: "SiteForge",
  description: "Next generation digital design workspace with voice-controlled offline-first code generators.",
  goals: ["Drive software signups", "Showcase platform security features"]
};
