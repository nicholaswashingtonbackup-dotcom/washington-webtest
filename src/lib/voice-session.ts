/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface ContextTurn {
  turn: number;
  user: string;
  ai: string;
  clarification?: boolean;
  action?: string;
  confidence?: number;
}

export interface ActiveReferences {
  last_object: string;
  last_block: string;
}

export interface VoiceSession {
  session_id: string;
  context_stack: ContextTurn[];
  active_references: ActiveReferences;
}

// In-memory or client-side persistence for Voice Session
const SESSION_STORAGE_KEY = "siteforge_voice_session";

export function loadVoiceSession(): VoiceSession {
  try {
    const raw = sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error("Failed to load voice session:", err);
  }

  // Create a default session
  const defaultSession: VoiceSession = {
    session_id: "voice_" + Math.random().toString(36).substring(2, 9),
    context_stack: [],
    active_references: {
      last_object: "",
      last_block: ""
    }
  };
  saveVoiceSession(defaultSession);
  return defaultSession;
}

export function saveVoiceSession(session: VoiceSession) {
  try {
    sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
  } catch (err) {
    console.error("Failed to save voice session:", err);
  }
}

export function appendContextTurn(
  userPrompt: string,
  aiSpeech: string,
  isClarification = false,
  actionText = "",
  confidenceVal = 1.0
): VoiceSession {
  const session = loadVoiceSession();
  const nextTurnNum = session.context_stack.length + 1;
  const turnObj: ContextTurn = {
    turn: nextTurnNum,
    user: userPrompt,
    ai: aiSpeech,
    clarification: isClarification,
    action: actionText,
    confidence: confidenceVal
  };
  
  session.context_stack.push(turnObj);
  
  // Track context matching reference if found
  if (actionText) {
    if (actionText.includes("block_")) {
      const match = actionText.match(/block_[a-zA-Z0-9_]+/);
      if (match) {
        session.active_references.last_block = match[0];
      }
    }
    if (actionText.includes("asset_") || actionText.includes("img_")) {
      const match = actionText.match(/(asset|img)_[a-zA-Z0-9_]+/);
      if (match) {
        session.active_references.last_object = match[0];
      }
    }
  }
  
  saveVoiceSession(session);
  return session;
}

export function popContextTurn(): VoiceSession {
  const session = loadVoiceSession();
  if (session.context_stack.length > 0) {
    session.context_stack.pop();
    saveVoiceSession(session);
  }
  return session;
}

export function resetVoiceSession(): VoiceSession {
  const freshSession: VoiceSession = {
    session_id: "voice_" + Math.random().toString(36).substring(2, 9),
    context_stack: [],
    active_references: {
      last_object: "",
      last_block: ""
    }
  };
  saveVoiceSession(freshSession);
  return freshSession;
}
