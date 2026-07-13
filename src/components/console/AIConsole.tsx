import React, { useState, useRef, useEffect } from "react";
import { Terminal, Send, Zap, Cpu, Wifi, WifiOff } from "lucide-react";
import { askTgpt, getTgptBridge } from "../services/ai/tgptBridge";

export default function AIConsole() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [provider, setProvider] = useState<"pollinations" | "phind" | "gemini">("pollinations");
  const outputRef = useRef<HTMLDivElement>(null);
  const bridge = getTgptBridge();

  // Auto-scroll to bottom
  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [output]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isProcessing) return;

    setIsProcessing(true);
    setOutput((prev) => [...prev, `> ${input}`]);
    setInput("");

    try {
      // Add thinking indicator
      setOutput((prev) => [...prev, "[AI Processing...]"]);
      
      const response = await askTgpt(input, provider);
      setOutput((prev) => {
        const newOutput = [...prev];
        // Replace thinking with actual response
        if (newOutput[newOutput.length - 1] === "[AI Processing...]") {
          newOutput[newOutput.length - 1] = response;
        } else {
          newOutput.push(response);
        }
        return newOutput;
      });
    } catch (error) {
      setOutput((prev) => [...prev, `[Error] ${error}`]);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-cyber-card border border-cyber-gray rounded-lg p-4 flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-3 border-b border-cyber-gray pb-2">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-cyber-orange" />
          <span className="font-display font-black text-xs text-white uppercase tracking-widest">
            MOTORBOY AI CONSOLE
          </span>
        </div>
        
        {/* Provider Selector */}
        <select
          value={provider}
          onChange={(e) => setProvider(e.target.value as any)}
          className="bg-cyber-darker border border-cyber-gray text-xs font-mono text-cyber-green rounded px-2 py-1"
        >
          <option value="pollinations">Pollinations (Free)</option>
          <option value="phind">Phind</option>
          <option value="gemini">Gemini</option>
        </select>
      </div>

      {/* Output Display */}
      <div
        ref={outputRef}
        className="flex-1 bg-cyber-bg/50 border border-cyber-gray rounded p-3 font-mono text-xs text-slate-300 overflow-y-auto mb-3"
        id="ai-console-output"
      >
        {output.length === 0 ? (
          <div className="text-slate-500 italic">
            [AI Console Ready] Type your tuning question here...<br />
            Example: "How to tune fuel map for high altitude?"
          </div>
        ) : (
          output.map((line, i) => (
            <div key={i} className="mb-1 whitespace-pre-wrap">
              {line.startsWith(">") ? (
                <span className="text-cyber-orange font-bold">{line}</span>
              ) : line.startsWith("[") ? (
                <span className="text-cyber-blue">{line}</span>
              ) : (
                <span className="text-slate-200">{line}</span>
              )}
            </div>
          ))
        )}
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter tuning prompt..."
          disabled={isProcessing}
          className="flex-1 bg-cyber-darker border border-cyber-gray text-xs font-mono text-white rounded px-3 py-2 focus:outline-none focus:border-cyber-orange"
        />
        <button
          type="submit"
          disabled={isProcessing || !input.trim()}
          className={`px-3 py-2 rounded font-mono text-xs font-bold uppercase transition-all ${
            isProcessing || !input.trim()
              ? "bg-cyber-gray/30 text-slate-500"
              : "bg-cyber-orange text-black hover:bg-orange-400"
          }`}
        >
          {isProcessing ? <Zap className="w-3 h-3 animate-pulse" /> : <Send className="w-3 h-3" />}
        </button>
      </form>
    </div>
  );
}