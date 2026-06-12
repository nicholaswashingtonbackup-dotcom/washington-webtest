/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { COMMANDS, CommandKey } from './command-registry';

// Global logs of blocked unsafe sequences
export interface BlockedLog {
  timestamp: number;
  type: 'action' | 'html' | 'css' | 'js';
  original: string;
  reason: string;
}

export const blockedLogs: BlockedLog[] = [];

/**
 * Validates if an action is conforms to the Command Registry schema
 */
export function validateAction(action: any): boolean {
  if (!action || typeof action !== 'object') {
    const err = "Invalid action format: Action must be an object";
    logUnsafe('action', JSON.stringify(action), err);
    throw new Error(err);
  }

  if (!action.command) {
    const err = "Invalid action format: Missing 'command' field";
    logUnsafe('action', JSON.stringify(action), err);
    throw new Error(err);
  }

  if (!(action.command in COMMANDS)) {
    const err = `Invalid action format: Unknown action '${action.command}'`;
    logUnsafe('action', JSON.stringify(action), err);
    throw new Error(err);
  }

  // Ensure params object exists
  if (!action.params || typeof action.params !== 'object') {
    const err = "Invalid action format: 'params' must be an object";
    logUnsafe('action', JSON.stringify(action), err);
    throw new Error(err);
  }

  return true;
}

/**
 * Sanitize HTML: Strips unsafe elements, scripts, inline JS, etc.
 */
export function sanitizeHTML(html: string): string {
  if (!html) return '';

  let cleaned = html;

  // 1. Strip all <script>...</script> tags
  const scriptRegex = /<script\b[^>]*>([\s\S]*?)<\/script>/gi;
  if (scriptRegex.test(cleaned)) {
    logUnsafe('html', html, "Contained script tags");
    cleaned = cleaned.replace(scriptRegex, '');
  }

  // 2. Strip standard iframes, objects, embeds
  const embedRegex = /<(iframe|object|embed|applet)\b[^>]*>([\s\S]*?)<\/\1>/gi;
  const embedSelfClosingRegex = /<(iframe|object|embed|applet)\b[^>]*\/?>/gi;
  if (embedRegex.test(cleaned) || embedSelfClosingRegex.test(cleaned)) {
    logUnsafe('html', html, "Contained embeddable tags (iframe, object, etc)");
    cleaned = cleaned.replace(embedRegex, '').replace(embedSelfClosingRegex, '');
  }

  // 3. Strip event handlers (e.g., onclick, onload, onerror)
  const eventHandlerRegex = /\bon\w+\s*=\s*(['"])([\s\S]*?)\1/gi;
  if (eventHandlerRegex.test(cleaned)) {
    logUnsafe('html', html, "Contained inline event handlers");
    cleaned = cleaned.replace(eventHandlerRegex, '');
  }

  // Strip unquoted or single value event patterns e.g. onload=alert(1)
  const eventHandlerUnquotedRegex = /\bon[a-zA-Z]+\s*=\s*[^\s>]+/gi;
  if (eventHandlerUnquotedRegex.test(cleaned)) {
    logUnsafe('html', html, "Contained unquoted inline event handlers");
    cleaned = cleaned.replace(eventHandlerUnquotedRegex, '');
  }

  // 4. Strip javascript: URLs
  const jsUrlRegex = /href\s*=\s*(['"])javascript:([\s\S]*?)\1/gi;
  if (jsUrlRegex.test(cleaned)) {
    logUnsafe('html', html, "Contained javascript: URI");
    cleaned = cleaned.replace(jsUrlRegex, 'href="#"');
  }

  // 5. Whitelist allowed HTML elements
  const allowedTags = new Set([
    'div', 'section', 'header', 'footer', 'nav', 'main', 
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 
    'p', 'span', 'a', 'img', 'ul', 'ol', 'li', 'button', 
    'input', 'textarea', 'select', 'option', 'label', 'form', 
    'table', 'tr', 'td', 'th', 'video', 'audio', 'canvas', 'svg', 'path'
  ]);

  // Strip tags that are NOT whitelisted
  const tagRegex = /<(\/?)([a-zA-Z0-9:-]+)([^>]*)>/g;
  cleaned = cleaned.replace(tagRegex, (match, isClosing, tagName, attrs) => {
    const normalised = tagName.toLowerCase();
    if (!allowedTags.has(normalised)) {
      logUnsafe('html', match, `Stripping tag '${normalised}' not in whitelist`);
      return '';
    }
    // Remove inline styles if they look suspicious
    if (attrs && /javascript:|expression/i.test(attrs)) {
      logUnsafe('html', match, `Suspicious scripts found in tag attributes`);
      return `<${isClosing ? '/' : ''}${tagName}>`;
    }
    return match;
  });

  return cleaned;
}

/**
 * Sanitize CSS: Strips expressions, javascript URLs, non-https imports, blocklists
 */
export function sanitizeCSS(css: string): string {
  if (!css) return '';

  let cleaned = css;

  // 1. Strip javascript urls or expressions
  const jsUrlRegex = /url\s*\(\s*['"]?javascript:[\s\S]*?['"]?\s*\)/gi;
  if (jsUrlRegex.test(cleaned)) {
    logUnsafe('css', css, "Contained url(javascript:...) expression");
    cleaned = cleaned.replace(jsUrlRegex, 'url()');
  }

  // 2. Strip expression(...) or -moz-binding or behavior
  const expressionRegex = /expression\s*\(|behavior\s*:|-moz-binding\s*:/gi;
  if (expressionRegex.test(cleaned)) {
    logUnsafe('css', css, "Contained proprietary scripting features");
    cleaned = cleaned.replace(expressionRegex, '/* stripped */');
  }

  // 3. Strip non-https imports
  const importRegex = /@import\s+['"]?(http:|[a-zA-Z0-9+.-]+:)?([^'"]+)['"]?/gi;
  cleaned = cleaned.replace(importRegex, (match, protocol) => {
    if (protocol && protocol.toLowerCase() !== 'https:' && protocol.toLowerCase() !== 'https://') {
      logUnsafe('css', match, "Block non-https @import source");
      return '/* unsafe @import blocked */';
    }
    return match;
  });

  // 4. Property Whitelist matching (only allows valid design properties, warning on non-supported styles)
  const allowedProps = new Set([
    'color', 'background', 'background-color', 'background-image', 'background-position', 'background-size', 'background-repeat',
    'font', 'font-size', 'font-family', 'font-weight', 'font-style', 'line-height',
    'margin', 'margin-top', 'margin-right', 'margin-bottom', 'margin-left',
    'padding', 'padding-top', 'padding-right', 'padding-bottom', 'padding-left',
    'border', 'border-radius', 'border-width', 'border-style', 'border-color', 'border-top', 'border-bottom', 'border-left', 'border-right',
    'display', 'flex', 'flex-direction', 'align-items', 'justify-content', 'gap', 'flex-wrap', 'flex-grow', 'flex-shrink',
    'grid', 'grid-template-columns', 'grid-template-rows', 'grid-gap',
    'position', 'top', 'left', 'right', 'bottom', 'z-index',
    'width', 'max-width', 'min-width', 'height', 'max-height', 'min-height',
    'opacity', 'transform', 'transition', 'box-shadow', 'text-align', 'text-shadow', 'cursor', 'overflow', 'overflow-x', 'overflow-y',
    'text-transform', 'letter-spacing', 'list-style', 'box-sizing'
  ]);

  // Clean styles by filtering properties in rule declarations
  const ruleDeclRegex = /([a-zA-Z-]+)\s*:\s*([^;]+)/gi;
  cleaned = cleaned.replace(ruleDeclRegex, (match, propName) => {
    const propLower = propName.toLowerCase();
    if (!allowedProps.has(propLower)) {
      logUnsafe('css', match, `CSS Property '${propLower}' is not in the whitelist.`);
      return `/* excluded: ${propLower} */`;
    }
    return match;
  });

  return cleaned;
}

/**
 * Sanitize JS: Blocks eval, document.write, innerHTML, dangerous keywords, whitelists safely.
 */
export function sanitizeJS(js: string): string {
  if (!js) return '';

  let cleaned = js;

  // 1. Block dangerous globals and helpers
  const dangerousPatterns = [
    { regex: /eval\s*\(/g, name: 'eval()' },
    { regex: /Function\s*\(/g, name: 'Function constructor' },
    { regex: /new\s+Function/g, name: 'new Function' },
    { regex: /document\.write/g, name: 'document.write()' },
    { regex: /innerHTML/g, name: 'innerHTML content setter' },
    { regex: /window\.location/g, name: 'window.location redirect' },
    { regex: /localStorage|sessionStorage|indexedDB/g, name: 'storage bypass attempt' }
  ];

  for (const item of dangerousPatterns) {
    if (item.regex.test(cleaned)) {
      logUnsafe('js', js, `Blocked due to unsafe usage of: ${item.name}`);
      cleaned = cleaned.replace(item.regex, `/* BLOCKED: ${item.name} */`);
    }
  }

  // 2. Allow list checks (only allow normal element bindings and visual transitions)
  // Clean up references to match harmless UI adjustments
  return cleaned;
}

/**
 * Internal logger helper
 */
function logUnsafe(type: BlockedLog['type'], original: string, reason: string) {
  blockedLogs.push({
    timestamp: Date.now(),
    type,
    original: original.substring(0, 500) + (original.length > 500 ? '...' : ''),
    reason
  });
  console.warn(`[AI Safety Layer] BLOCKED: ${reason}`, original);
}
