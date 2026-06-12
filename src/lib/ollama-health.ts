/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type OllamaStatus = 'connected' | 'offline' | 'queued' | 'checking';

export interface HealthState {
  status: OllamaStatus;
  retryCount: number;
  availableModels: string[];
}

export async function checkOllamaHealth(
  endpoint = 'http://localhost:11434/api/tags',
  retries = 3,
  delay = 2000
): Promise<HealthState> {
  let attempt = 0;
  
  while (attempt < retries) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000); // Fast timeout

      const res = await fetch(endpoint, { 
        method: 'GET',
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        const models = (data.models || []).map((m: any) => m.name || m.model);
        return {
          status: 'connected',
          retryCount: attempt,
          availableModels: models.length ? models : ['llama3', 'mistral', 'codellama']
        };
      }
    } catch (err) {
      attempt++;
      if (attempt < retries) {
        // Wait delay
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  return {
    status: 'offline',
    retryCount: attempt,
    availableModels: []
  };
}
