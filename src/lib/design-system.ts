/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface DesignTokens {
  primaryColor: string;      // e.g. "#8b5cf6"
  secondaryColor: string;    // e.g. "#06b6d4"
  accentColor: string;       // e.g. "#f59e0b"
  fontFamily: string;        // e.g. "Inter, sans-serif"
  headingFont: string;       // e.g. "Space Grotesk, sans-serif"
  borderRadius: string;      // e.g. "12px"
  spacingScale: number;      // e.g. 4 (base unit)
  shadowScale: 'sm' | 'md' | 'lg' | 'xl';
  backgroundColor: string;
  textColor: string;
  gradientStart: string;
  gradientEnd: string;
}

export const DEFAULT_TOKENS: DesignTokens = {
  primaryColor: "#8b5cf6",
  secondaryColor: "#06b6d4",
  accentColor: "#f59e0b",
  fontFamily: "Inter, sans-serif",
  headingFont: "Space Grotesk, sans-serif",
  borderRadius: "12px",
  spacingScale: 4,
  shadowScale: "md",
  backgroundColor: "#0f0f23",
  textColor: "#e2e8f0",
  gradientStart: "#8b5cf6",
  gradientEnd: "#06b6d4",
};

export const THEME_PRESETS: Record<string, { name: string; tokens: DesignTokens }> = {
  dark: {
    name: "Dark Cosmic",
    tokens: {
      primaryColor: "#8b5cf6",
      secondaryColor: "#06b6d4",
      accentColor: "#f59e0b",
      fontFamily: "Inter, sans-serif",
      headingFont: "Space Grotesk, sans-serif",
      borderRadius: "12px",
      spacingScale: 4,
      shadowScale: "md",
      backgroundColor: "#0f0f23",
      textColor: "#e2e8f0",
      gradientStart: "#8b5cf6",
      gradientEnd: "#06b6d4",
    }
  },
  light: {
    name: "Light Clean",
    tokens: {
      primaryColor: "#3b82f6",
      secondaryColor: "#10b981",
      accentColor: "#f59e0b",
      fontFamily: "Inter, sans-serif",
      headingFont: "Outfit, sans-serif",
      borderRadius: "8px",
      spacingScale: 4,
      shadowScale: "sm",
      backgroundColor: "#f8fafc",
      textColor: "#0f172a",
      gradientStart: "#3b82f6",
      gradientEnd: "#10b981",
    }
  },
  saas: {
    name: "SaaS Pro",
    tokens: {
      primaryColor: "#4f46e5",
      secondaryColor: "#06b6d4",
      accentColor: "#ec4899",
      fontFamily: "Inter, sans-serif",
      headingFont: "Plus Jakarta Sans, sans-serif",
      borderRadius: "16px",
      spacingScale: 4,
      shadowScale: "lg",
      backgroundColor: "#030712",
      textColor: "#f3f4f6",
      gradientStart: "#4f46e5",
      gradientEnd: "#06b6d4",
    }
  },
  portfolio: {
    name: "Minimalist Art",
    tokens: {
      primaryColor: "#111111",
      secondaryColor: "#71717a",
      accentColor: "#dc2626",
      fontFamily: "Inter, sans-serif",
      headingFont: "Playfair Display, serif",
      borderRadius: "0px",
      spacingScale: 6,
      shadowScale: "sm",
      backgroundColor: "#fafafa",
      textColor: "#18181b",
      gradientStart: "#18181b",
      gradientEnd: "#71717a",
    }
  },
  ecommerce: {
    name: "E-Commerce Fresh",
    tokens: {
      primaryColor: "#059669",
      secondaryColor: "#0284c7",
      accentColor: "#fbbf24",
      fontFamily: "Inter, sans-serif",
      headingFont: "Cabinet Grotesk, sans-serif",
      borderRadius: "6px",
      spacingScale: 4,
      shadowScale: "md",
      backgroundColor: "#ffffff",
      textColor: "#1f2937",
      gradientStart: "#059669",
      gradientEnd: "#0284c7",
    }
  },
  blog: {
    name: "Editorial Blog",
    tokens: {
      primaryColor: "#9a3412",
      secondaryColor: "#b45309",
      accentColor: "#0ea5e9",
      fontFamily: "Georgia, serif",
      headingFont: "Lora, serif",
      borderRadius: "4px",
      spacingScale: 5,
      shadowScale: "sm",
      backgroundColor: "#fffdfa",
      textColor: "#292524",
      gradientStart: "#9a3412",
      gradientEnd: "#b45309",
    }
  },
  restaurant: {
    name: "Delicious Warmth",
    tokens: {
      primaryColor: "#ea580c",
      secondaryColor: "#ca8a04",
      accentColor: "#16a34a",
      fontFamily: "Outfit, sans-serif",
      headingFont: "Playfair Display, serif",
      borderRadius: "20px",
      spacingScale: 4,
      shadowScale: "lg",
      backgroundColor: "#fffcf9",
      textColor: "#2c1c11",
      gradientStart: "#ea580c",
      gradientEnd: "#ca8a04",
    }
  },
  agency: {
    name: "Bold Creative",
    tokens: {
      primaryColor: "#db2777",
      secondaryColor: "#6366f1",
      accentColor: "#14b8a6",
      fontFamily: "Inter, sans-serif",
      headingFont: "Syne, sans-serif",
      borderRadius: "24px",
      spacingScale: 4,
      shadowScale: "xl",
      backgroundColor: "#0d0a1a",
      textColor: "#faf9fb",
      gradientStart: "#db2777",
      gradientEnd: "#6366f1",
    }
  },
  saas2: {
    name: "Neon Tech",
    tokens: {
      primaryColor: "#10b981",
      secondaryColor: "#8b5cf6",
      accentColor: "#f43f5e",
      fontFamily: "Fira Code, monospace",
      headingFont: "JetBrains Mono, monospace",
      borderRadius: "4px",
      spacingScale: 4,
      shadowScale: "md",
      backgroundColor: "#0b0f19",
      textColor: "#f1f5f9",
      gradientStart: "#10b981",
      gradientEnd: "#8b5cf6",
    }
  },
  minimal: {
    name: "Zen Silence",
    tokens: {
      primaryColor: "#475569",
      secondaryColor: "#94a3b8",
      accentColor: "#cbd5e1",
      fontFamily: "system-ui, sans-serif",
      headingFont: "system-ui, sans-serif",
      borderRadius: "6px",
      spacingScale: 3,
      shadowScale: "sm",
      backgroundColor: "#fcfcfc",
      textColor: "#1e293b",
      gradientStart: "#475569",
      gradientEnd: "#94a3b8",
    }
  }
};

/**
 * Compiles active DesignTokens object into standard CSS rules or utility styling map
 */
export function compileThemeVariables(tokens: DesignTokens): string {
  return `
    :root {
      --primary-color: ${tokens.primaryColor};
      --secondary-color: ${tokens.secondaryColor};
      --accent-color: ${tokens.accentColor};
      --font-family: ${tokens.fontFamily};
      --heading-font: ${tokens.headingFont};
      --border-radius: ${tokens.borderRadius};
      --spacing-scale: ${tokens.spacingScale}px;
      --bg-color: ${tokens.backgroundColor};
      --text-color: ${tokens.textColor};
      --gradient-start: ${tokens.gradientStart};
      --gradient-end: ${tokens.gradientEnd};
    }
  `;
}

export const FONT_PRESETS = [
  "Inter, sans-serif",
  "Space Grotesk, sans-serif",
  "Outfit, sans-serif",
  "Playfair Display, serif",
  "Plus Jakarta Sans, sans-serif",
  "JetBrains Mono, monospace"
];

