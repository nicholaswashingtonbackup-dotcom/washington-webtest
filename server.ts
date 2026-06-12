/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

// Set up server-side Gemini Client
let geminiClient: GoogleGenAI | null = null;
try {
  const apiKey = process.env.GEMINI_API_KEY;
  if (apiKey && apiKey !== "MY_GEMINI_API_KEY") {
    geminiClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
    console.log("[Gemini Engine] Server-side client initialized successfully.");
  } else {
    console.warn("[Gemini Engine] Warning: GEMINI_API_KEY variable is absent or default.");
  }
} catch (e) {
  console.error("[Gemini Engine] Failed to initialize GoogleGenAI client:", e);
}

// Middleware
app.use(express.json({ limit: '10mb' }));

// 1. Health Probe
app.get('/api/health', (req, res) => {
  res.json({
    status: "ok",
    timestamp: Date.now(),
    geminiActive: !!geminiClient,
    environment: process.env.NODE_ENV || "development"
  });
});

/**
 * Helper to strip JSON objects out of potential LLM conversational markdown wrappers
 */
function cleanJSONString(str: string): string {
  let cleaned = str.trim();
  
  // Remove markdown blocks if present e.g. ```json ... ```
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```(json)?/i, "").replace(/```$/, "").trim();
  }
  
  // Cut any trailing/leading characters before { and after }
  const startIdx = cleaned.indexOf("{");
  const endIdx = cleaned.lastIndexOf("}");
  
  if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
    cleaned = cleaned.substring(startIdx, endIdx + 1);
  }
  
  return cleaned;
}

// 2. Chat / Code AI Generator Endpoint
app.post('/api/ai/chat', async (req, res) => {
  const { prompt, systemPrompt, useProvider = 'auto' } = req.body;

  if (!prompt) {
    res.status(400).json({ error: "Missing prompt query" });
    return;
  }

  const compiledPrompt = `${systemPrompt || ''}\n\nUser Prompt: "${prompt}"\n\nReturn clean JSON format.`;

  // 1. Try local Ollama if explicit or auto
  if (useProvider === 'ollama' || useProvider === 'auto') {
    try {
      console.log("[AI Router] Attempting local Ollama query...");
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), 3500); // Fast timeout for responsiveness

      const ollamaRes = await fetch('http://localhost:11434/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'llama3', // default model
          prompt: compiledPrompt,
          stream: false,
          format: 'json'
        }),
        signal: controller.signal
      });

      clearTimeout(id);

      if (ollamaRes.ok) {
        const data = await ollamaRes.json();
        const cleaned = cleanJSONString(data.response || "");
        try {
          const parsed = JSON.parse(cleaned);
          res.json({ provider: "ollama", response: parsed });
          return;
        } catch (jsonErr) {
          console.warn("[Ollama Engine] Failed to parse Ollama JSON, returning string instead", jsonErr);
        }
      }
    } catch (err) {
      console.log("[AI Router] Local Ollama is offline or timed out. Swapping execution to server-side Gemini.");
    }
  }

  // 2. Fallback to server-side cloud Gemini if Ollama offline, or explicitly requested
  if (geminiClient) {
    try {
      console.log("[AI Router] Querying cloud-based Gemini (gemini-3.5-flash)...");
      const geminiRes = await geminiClient.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: compiledPrompt,
        config: {
          responseMimeType: "application/json",
          temperature: 0.7
        }
      });

      const rawText = geminiRes.text || "";
      const cleaned = cleanJSONString(rawText);
      
      try {
        const parsed = JSON.parse(cleaned);
        res.json({ provider: "gemini", response: parsed });
        return;
      } catch (jsonErr) {
        console.warn("[Gemini Engine] JSON clean parse failed on string:", rawText);
        res.status(500).json({ 
          error: "JSON Parsing Error on AI Output", 
          raw: rawText,
          suggestion: "AI returned invalid format. Try rephrasing your request." 
        });
        return;
      }
    } catch (gErr: any) {
      console.error("[AI Router] Cloud Gemini call failed:", gErr);
      res.status(500).json({ 
        error: "AI Generation is temporarily offline.", 
        details: gErr?.message || String(gErr),
        suggestion: "Please check your live GEMINI_API_KEY in Settings."
      });
      return;
    }
  }

  // 3. Absolute Fallback: Static Intelligent Assistant Suggestions
  console.log("[AI Router] No providers reachable! Launching Local Rule Fallback engine...");
  
  // Simple heuristic checks on user query
  let mockCmd: any = { command: "add_hero", params: { headline: "Intelligent Design Sandbox", subtext: "Offline template fallback mode", cta_text: "Get Started", cta_link: "#contact" } };
  const lower = prompt.toLowerCase();
  
  if (lower.includes("price") || lower.includes("pricing")) {
    mockCmd = { command: "add_pricing", params: { plans: ["Startup", "Professional", "Enterprise"], style: "gradient" } };
  } else if (lower.includes("feature") || lower.includes("grid")) {
    mockCmd = { command: "add_features", params: { items: ["Visual Editor", "Microphone Control", "Safety Filters"], style: "cards" } };
  } else if (lower.includes("color") || lower.includes("blue") || lower.includes("dark")) {
    mockCmd = { command: "change_background", params: { target: "body", value: "#0b0f19" } };
  } else if (lower.includes("title") || lower.includes("headline") || lower.includes("text")) {
    mockCmd = { command: "update_text", params: { target: "h1", text: "Empowering Next-Gen Design" } };
  }

  res.json({ 
    provider: "local-rules", 
    response: mockCmd,
    warning: "Ollama offline & Cloud Gemini key not configured. Applied smart layout fallback."
  });
});

// 3. One-Shot Full Website Generator Endpoint
app.post('/api/ai/oneshot', async (req, res) => {
  const { brief } = req.body;

  if (!brief) {
    res.status(400).json({ error: "Missing brief description text" });
    return;
  }

  const systemInstruction = `
You are an expert design systems engineer.
Analyze the user brief for a full website and return a structured JSON layout of all pages.
Format:
{
  "pages": [
    {
      "name": "Home",
      "sections": [
        {"type": "navbar", "template": "NAVBAR_STANDARD"},
        {"type": "hero", "template": "HERO_SAAS"},
        {"type": "features", "template": "FEATURES_GRID"},
        {"type": "testimonials", "template": "TESTIMONIALS_CAROUSEL"},
        {"type": "cta", "template": "CTA_SECTION"},
        {"type": "footer", "template": "FOOTER_FULL"}
      ]
    },
    {
      "name": "About",
      "sections": [
        {"type": "navbar", "template": "NAVBAR_STANDARD"},
        {"type": "team", "template": "TEAM_GRID"},
        {"type": "footer", "template": "FOOTER_FULL"}
      ]
    }
  ]
}
`.trim();

  // Try cloud Gemini for premium fast multi-page schema layout
  if (geminiClient) {
    try {
      const gRes = await geminiClient.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: `${systemInstruction}\n\nUser Brief: "${brief}"`,
        config: {
          responseMimeType: "application/json",
          temperature: 0.6
        }
      });
      
      const parsed = JSON.parse(cleanJSONString(gRes.text || ""));
      res.json({ success: true, result: parsed });
      return;
    } catch (gErr) {
      console.error("[OneShot] Gemini error, fallback to mock generation", gErr);
    }
  }

  // Safe mock builder when models are offline
  const fallbackSchema = {
    pages: [
      {
        name: "Home",
        sections: [
          { type: "navbar", template: "NAVBAR_STANDARD" },
          { type: "hero", template: "HERO_SAAS" },
          { type: "features", template: "FEATURES_GRID" },
          { type: "cta", template: "CTA_SECTION" },
          { type: "footer", template: "FOOTER_FULL" }
        ]
      },
      {
        name: "Services",
        sections: [
          { type: "navbar", template: "NAVBAR_STANDARD" },
          { type: "services", template: "SERVICES_LIST" },
          { type: "cta", template: "CTA_SECTION" },
          { type: "footer", template: "FOOTER_FULL" }
        ]
      },
      {
        name: "Contact",
        sections: [
          { type: "navbar", template: "NAVBAR_STANDARD" },
          { type: "contact", template: "CONTACT_FORM" },
          { type: "footer", template: "FOOTER_FULL" }
        ]
      }
    ]
  };

  res.json({ success: true, result: fallbackSchema, fallbackWarning: "Ollama / Gemini offline. Built site using standard responsive schemas." });
});

async function startServer() {
  // Vite dev server mounting in development
  if (process.env.NODE_ENV !== "production") {
    console.log("[Server Initialization] Development mode. Preparing Vite dev middleware on port 3000...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Production serving static files
    console.log("[Server Initialization] Production mode. Serving bundled static assets...");
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[SiteForge Server Node] Online & listening on http://localhost:${PORT}`);
  });
}

startServer();
