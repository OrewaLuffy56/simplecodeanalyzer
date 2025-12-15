import React, { useState, useEffect } from "react";
// 1. CLEAN IMPORTS (No duplicates)
import {
  Activity,
  AlertTriangle,
  Zap,
  Brain,
  Network,
  Cpu,
  CheckCircle,
  Terminal,
  Share2
} from "lucide-react";

// IMPORT YOUR LOGIC MODULES
import { tokenize } from "./logic/tokenizer";
import { parse } from "./logic/parser";
import { calculateMetrics } from "./logic/metrics";

// IMPORT YOUR LOGO
import myLogo from "./assets/logo.png"; 

// IMPORT THE MATRIX COMPONENT
import MatrixBackground from "./MatrixBackground"; 

const App = () => {
  const [code, setCode] = useState(`function example() {
  // Matrix Hack Mode
  for(i) {
     if(true) { console.log("Wake up, Neo..."); }
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
    // Outer Container is just black now
    <div className="min-h-screen bg-black text-white p-10 font-sans relative overflow-hidden">
      
      {/* 2. MATRIX RAIN BACKGROUND */}
      <MatrixBackground />

      {/* 3. CONTENT WRAPPER */}
      <div className="relative z-10 max-w-7xl mx-auto">
      
        {/* --- HEADER --- */}
        <h1 className="text-4xl font-bold mb-8 flex items-center gap-6">
          <img src={myLogo} alt="Logo" className="w-24 h-24 object-contain" />
          Code Analyzer
        </h1>

        <div className="grid grid-cols-2 gap-8">
          
          {/* --- EDITOR SECTION --- */}
          <textarea
            className="bg-gray-900/80 backdrop-blur-sm border border-gray-800 p-6 rounded-xl h-[600px] font-mono text-sm leading-relaxed focus:outline-none focus:border-blue-500 transition-colors text-blue-100 shadow-2xl resize-none"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            spellCheck="false"
          />

          {/* --- DASHBOARD SECTION --- */}
          <div className="space-y-6">
            <div className="bg-gray-900/80 backdrop-blur-sm p-8 rounded-xl border border-gray-800 h-[600px] overflow-y-auto shadow-2xl custom-scrollbar">
              
              <h2 className="text-xl font-bold mb-6 text-gray-200 flex items-center gap-3">
                <Activity className="w-6 h-6 text-blue-500" /> 
                Analysis Results
              </h2>

              {/* 4-GRID METRICS LAYOUT */}
              <div className="grid grid-cols-2 gap-4 mb-8">
                
                {/* 1. Time Complexity */}
                <div className="bg-black/40 p-4 rounded-lg border border-gray-700/50 hover:border-green-500/30 transition-colors group">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="w-4 h-4 text-green-400" />
                    <div className="text-gray-400 text-[10px] uppercase tracking-wider font-bold">Time Complexity</div>
                  </div>
                  <div className="text-2xl font-bold text-green-400 font-mono">
                    {metrics?.bigO || '-'}
                  </div>
                  <div className="text-[10px] text-gray-500 mt-2 leading-tight group-hover:text-gray-300 transition-colors">
                    How execution time increases as input grows. Lower is better.
                  </div>
                </div>

                {/* 2. Cyclomatic Complexity */}
                <div className="bg-black/40 p-4 rounded-lg border border-gray-700/50 hover:border-blue-500/30 transition-colors group">
                  <div className="flex items-center gap-2 mb-2">
                    <Network className="w-4 h-4 text-blue-400" />
                    <div className="text-gray-400 text-[10px] uppercase tracking-wider font-bold">Cyclomatic #</div>
                  </div>
                  <div className="text-2xl font-bold text-blue-400 font-mono">
                    {metrics?.cyclomatic || '-'}
                  </div>
                  <div className="text-[10px] text-gray-500 mt-2 leading-tight group-hover:text-gray-300 transition-colors">
                    Number of independent paths through code. Keep below 10.
                  </div>
                </div>

                {/* 3. Halstead Difficulty */}
                <div className="bg-black/40 p-4 rounded-lg border border-gray-700/50 hover:border-purple-500/30 transition-colors group">
                  <div className="flex items-center gap-2 mb-2">
                    <Brain className="w-4 h-4 text-purple-400" />
                    <div className="text-gray-400 text-[10px] uppercase tracking-wider font-bold">Difficulty</div>
                  </div>
                  <div className="text-2xl font-bold text-purple-400 font-mono">
                    {metrics?.halstead?.difficulty || 0}
                  </div>
                  <div className="text-[10px] text-gray-500 mt-2 leading-tight group-hover:text-gray-300 transition-colors">
                    How hard the code is to write/read. Based on unique operators.
                  </div>
                </div>

                {/* 4. Halstead Effort */}
                <div className="bg-black/40 p-4 rounded-lg border border-gray-700/50 hover:border-orange-500/30 transition-colors group">
                  <div className="flex items-center gap-2 mb-2">
                    <Cpu className="w-4 h-4 text-orange-400" />
                    <div className="text-gray-400 text-[10px] uppercase tracking-wider font-bold">Est. Effort</div>
                  </div>
                  <div className="text-2xl font-bold text-orange-400 font-mono">
                    {metrics?.halstead?.effort || 0}
                  </div>
                  <div className="text-[10px] text-gray-500 mt-2 leading-tight group-hover:text-gray-300 transition-colors">
                    Mental effort required to develop or maintain this code.
                  </div>
                </div>
              </div>

              {/* Issues List */}
              <div>
                <h3 className="font-bold mb-4 text-gray-300 flex items-center gap-2 text-sm uppercase tracking-wide">
                  <AlertTriangle className="w-4 h-4 text-yellow-500" /> Detected Issues
                </h3>
                
                {metrics?.issues.length === 0 ? (
                    <div className="text-gray-500 italic text-sm bg-gray-800/30 p-4 rounded border border-gray-800 text-center">
                      <CheckCircle className="w-5 h-5 mx-auto mb-2 opacity-50"/>
                      No algorithmic flaws found.
                    </div>
                ) : (
                    <div className="space-y-3">
                      {metrics?.issues.map((issue, i) => (
                      <div
                          key={i}
                          className="text-red-200 bg-red-900/10 p-4 rounded-lg border border-red-500/20 text-sm flex gap-3 items-start hover:bg-red-900/20 transition-colors"
                      >
                          <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                          <div className="flex-1">
                             <div className="font-bold text-red-300 text-xs uppercase mb-1">{issue.type} Warning</div>
                             <span className="leading-relaxed opacity-90">{issue.message}</span>
                          </div>
                      </div>
                      ))}
                    </div>
                )}
              </div>
            </div>
          </div>
          {/* --- END DASHBOARD SECTION --- */}

        </div>
      </div> 
    </div>
  );
};

export default App;