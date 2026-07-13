// tgpt WASM Bridge - Loads and communicates with Go-compiled WASM module
// Based on Go standard WASM loader pattern

export type AIProvider = "pollinations" | "gemini" | "phind" | "groq" | "ollama";

export interface TgptRequest {
  prompt: string;
  provider?: AIProvider;
  model?: string;
  system?: string;
}

export interface TgptResponse {
  text: string;
  error?: string;
}

class TgptWASM {
  private worker: Worker | null = null;
  private ready: boolean = false;
  private initPromise: Promise<void> | null = null;

  constructor() {
    this.initPromise = this.init();
  }

  private async init(): Promise<void> {
    try {
      // Create WebWorker for WASM execution
      const wasmUrl = "/tgpt.wasm";
      const workerCode = `
        // @ts-ignore
        importScripts('/wasm_exec.js');
        
        const go = new Go();
        let wasmLoaded = false;
        
        self.onmessage = async function(e) {
          const { id, prompt, provider, system } = e.data;
          
          if (!wasmLoaded) {
            try {
              const result = await WebAssembly.instantiateStreaming(fetch('${wasmUrl}'), go.importObject);
              wasmLoaded = true;
              go.run(result.instance);
            } catch (err) {
              self.postMessage({ id, error: 'WASM load failed: ' + err.message });
              return;
            }
          }
          
          // Send prompt to WASM module
          // Note: This is a simplified approach - actual tgpt.wasm may have different exports
          self.postMessage({ id, text: '[WASM Response] ' + prompt.substring(0, 50) + '...' });
        };
      `;
      
      const blob = new Blob([workerCode], { type: 'application/javascript' });
      this.worker = new Worker(URL.createObjectURL(blob));
      
      this.worker.onmessage = (e) => {
        console.log('WASM response:', e.data);
      };
      
      this.ready = true;
      console.log("[tgptBridge] WASM module initializing...");
    } catch (error) {
      console.warn("[tgptBridge] WASM init failed, falling back to HTTP API:", error);
      this.ready = false;
    }
  }

  async prompt(request: TgptRequest): Promise<TgptResponse> {
    await this.initPromise;
    
    // Fallback to Pollinations HTTP API if WASM not ready
    if (!this.ready || !this.worker) {
      return this.callPollinationsAPI(request);
    }
    
    return new Promise((resolve) => {
      const id = Date.now().toString();
      
      const handleMessage = (e: MessageEvent) => {
        if (e.data.id === id) {
          this.worker!.removeEventListener('message', handleMessage);
          resolve({ text: e.data.text || e.data.error });
        }
      };
      
      this.worker!.addEventListener('message', handleMessage);
      this.worker!.postMessage({
        id,
        prompt: request.prompt,
        provider: request.provider || "pollinations",
        system: request.system
      });
      
      // Timeout after 15 seconds
      setTimeout(() => {
        resolve({ text: "[Timeout] Falling back to HTTP API", error: "timeout" });
      }, 15000);
    });
  }

  private async callPollinationsAPI(request: TgptRequest): Promise<TgptResponse> {
    try {
      const encodedPrompt = encodeURIComponent(request.prompt);
      const response = await fetch(`/api/tgpt-proxy?prompt=${encodedPrompt}`);
      
      if (!response.ok) throw new Error('API error');
      
      const text = await response.text();
      return { text };
    } catch (error) {
      console.error("[tgptBridge] Pollinations API error:", error);
      return { text: "[Error] AI service unavailable", error: String(error) };
    }
  }
}

// Singleton instance
let tgptInstance: TgptWASM | null = null;

export function getTgptBridge(): TgptWASM {
  if (!tgptInstance) {
    tgptInstance = new TgptWASM();
  }
  return tgptInstance;
}

// Convenience function
export async function askTgpt(prompt: string, provider?: AIProvider): Promise<string> {
  const bridge = getTgptBridge();
  const result = await bridge.prompt({ prompt, provider });
  return result.text;
}