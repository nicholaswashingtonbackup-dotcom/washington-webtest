/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { DesignTokens } from './design-system';

export interface Page {
  id: string;
  name: string;
  html: string;
  css: string;
  isHomepage: boolean;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
}

export interface Snapshot {
  id: string;
  timestamp: number;
  canvasHTML: string;       // HTML for active page
  designTokens: DesignTokens;
  pages: Page[];            // List of all pages inside project
  label: string;            // Name e.g. "Auto Save" or "Created SaaS Hero"
  branchName?: string;      // Optional branch name
}

export interface Branch {
  name: string;
  createdAt: number;
  snapshotId: string;       // Points to the source snapshot
}

// Stack holders
export class VersionControlManager {
  private undoStack: Snapshot[] = [];
  private redoStack: Snapshot[] = [];
  private activeBranch: string = "main";
  private branches: Record<string, Branch> = {
    "main": { name: "main", createdAt: Date.now(), snapshotId: "" }
  };

  constructor(maxSize = 100) {
    this.maxSize = maxSize;
  }
  private maxSize: number;

  public saveSnapshot(canvasHTML: string, tokens: DesignTokens, pages: Page[], label: string): Snapshot {
    const snapshot: Snapshot = {
      id: "snap_" + Math.random().toString(36).substring(2, 11),
      timestamp: Date.now(),
      canvasHTML,
      designTokens: JSON.parse(JSON.stringify(tokens)),
      pages: JSON.parse(JSON.stringify(pages)),
      label: label || "Auto checkpoint",
      branchName: this.activeBranch
    };

    this.undoStack.push(snapshot);
    if (this.undoStack.length > this.maxSize) {
      this.undoStack.shift();
    }
    // Clear redo stack on new action
    this.redoStack = [];
    return snapshot;
  }

  public undo(): Snapshot | null {
    if (this.undoStack.length <= 1) return null; // Keep at least the starting snapshot
    const current = this.undoStack.pop();
    if (current) {
      this.redoStack.push(current);
    }
    return this.undoStack[this.undoStack.length - 1] || null;
  }

  public redo(): Snapshot | null {
    const next = this.redoStack.pop();
    if (next) {
      this.undoStack.push(next);
      return next;
    }
    return null;
  }

  public getUndoStack(): Snapshot[] {
    return [...this.undoStack];
  }

  public getTimeline(): Snapshot[] {
    return [...this.undoStack].reverse();
  }

  public clear() {
    this.undoStack = [];
    this.redoStack = [];
  }

  // Branch support
  public createBranch(name: string, sourceSnapshot: Snapshot) {
    this.branches[name] = {
      name,
      createdAt: Date.now(),
      snapshotId: sourceSnapshot.id
    };
    this.activeBranch = name;
  }

  public getBranches(): string[] {
    return Object.keys(this.branches);
  }

  public setBranch(name: string) {
    if (this.branches[name]) {
      this.activeBranch = name;
    }
  }

  public getActiveBranchName(): string {
    return this.activeBranch;
  }
}
