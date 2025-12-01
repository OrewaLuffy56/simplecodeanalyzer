import React, { useState, useEffect } from "react";
import {
  Network,
  Activity,
  Zap,
  Calculator,
  AlertTriangle,
  CheckCircle,
  Terminal,
  Cpu,
  Share2,
} from "lucide-react";

// IMPORT YOUR LOGIC MODULES
import { tokenize } from "./logic/tokenizer";
import { parse } from "./logic/parser";
import { calculateMetrics } from "./logic/metrics";
// 1. IMPORT YOUR LOGO
import myLogo from "./assets/logo.png"; // Make sure file exists!
const App = () => {
  const [code, setCode] = useState(`function example() {
  // Write code here
  for(i) {
     if(true) { console.log("hi"); }
  }
}`);
  const [metrics, setMetrics] = useState(null);

  useEffect(() => {
    try {
      const tokens = tokenize(code);
      const ast = parse(tokens);
      const results = calculateMetrics(ast, tokens);
      setMetrics(results);
    } catch (e) {
      console.log("Parsing...");
    }
  }, [code]);

  return (
    <div className="min-h-screen bg-slate-950 text-white p-10 font-sans">
      {/* HEADER */}
      <h1 className="text-4xl font-bold mb-8 flex items-center gap-6">
        {/* LOGO: w-24 (96px), Clear, No Effects */}
        <img src={myLogo} alt="Logo" className="w-24 h-24 object-contain" />
        Code Analyzer
      </h1>

      <div className="grid grid-cols-2 gap-8">
        <textarea
          className="bg-slate-900 border border-slate-700 p-4 rounded-xl h-[500px] font-mono"
          value={code}
          onChange={(e) => setCode(e.target.value)}
        />

        <div className="space-y-4">
          {/* DISPLAY METRICS HERE */}
          <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
            <h2 className="text-xl font-bold mb-4">Analysis Results</h2>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-slate-900 p-4 rounded">
                <div className="text-slate-400 text-xs">Time Complexity</div>
                <div className="text-2xl font-bold text-green-400">
                  {metrics?.bigO}
                </div>
              </div>
              <div className="bg-slate-900 p-4 rounded">
                <div className="text-slate-400 text-xs">
                  Cyclomatic Complexity
                </div>
                <div className="text-2xl font-bold text-blue-400">
                  {metrics?.cyclomatic}
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-bold mb-2">Issues detected:</h3>
              {metrics?.issues.map((issue, i) => (
                <div
                  key={i}
                  className="text-red-300 bg-red-900/20 p-2 rounded mb-2 border border-red-900/50"
                >
                  {issue.message}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
