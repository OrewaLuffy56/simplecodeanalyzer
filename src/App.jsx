import React, { useState, useEffect } from "react";
import {
  Activity,
  AlertTriangle,
  Zap,
  Brain,
  Network,
  Cpu,
  CheckCircle,
  Code2 // Icon for selector
} from "lucide-react";

// 1. IMPORT THE CENTRAL ANALYZER
import { analyzeCode } from "./logic/analyzer";

// IMPORT YOUR LOGO
import myLogo from "./assets/logo.png"; 

// IMPORT THE MATRIX COMPONENT
import MatrixBackground from "./MatrixBackground"; 

const App = () => {
  // Default code example
  const [code, setCode] = useState(`function example() {
  // Matrix Hack Mode
  for(i) {
     if(true) { console.log("Wake up, Neo..."); }
  }
}`);

  // 2. STATE FOR LANGUAGE
  const [language, setLanguage] = useState('javascript');
  const [metrics, setMetrics] = useState(null);

  // 3. USEEFFECT TRIGGERS ANALYZER
  useEffect(() => {
    try {
      const results = analyzeCode(code, language);
      setMetrics(results);
    } catch (e) {
      console.log("Parsing...", e);
    }
  }, [code, language]);

  return (
    <div className="min-h-screen bg-black text-white p-10 font-sans relative overflow-hidden">
      
      {/* BACKGROUND */}
      <MatrixBackground />

      <div className="relative z-10 max-w-7xl mx-auto">
      
        {/* --- HEADER --- */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <h1 className="text-4xl font-bold flex items-center gap-6">
            <img src={myLogo} alt="Logo" className="w-24 h-24 object-contain" />
            Code Analyzer
            </h1>

            {/* --- LANGUAGE SELECTOR --- */}
            <div className="bg-gray-900/80 backdrop-blur-sm p-1 rounded-lg border border-gray-700 flex items-center gap-2 shadow-lg z-50">
                <div className="pl-3 text-gray-400">
                    <Code2 className="w-5 h-5" />
                </div>
                <select 
                    value={language} 
                    onChange={(e) => {
                        const lang = e.target.value;
                        setLanguage(lang);
                        // Optional: Auto-change code snippet when switching
                        if (lang === 'python') {
                            setCode("# Python Mode Active\ndef check_matrix():\n    print('Follow the white rabbit')");
                        } else {
                            setCode("function example() {\n   // JS Mode Active\n   console.log('Wake up Neo');\n}");
                        }
                    }}
                    className="bg-transparent text-white p-2 outline-none font-mono text-sm cursor-pointer hover:text-blue-400 transition-colors"
                >
                    <option value="javascript" className="bg-gray-900">JavaScript</option>
                    <option value="python" className="bg-gray-900">Python (Beta)</option>
                </select>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* --- EDITOR --- */}
          <textarea
            className="bg-gray-900/80 backdrop-blur-sm border border-gray-800 p-6 rounded-xl h-[600px] font-mono text-sm leading-relaxed focus:outline-none focus:border-blue-500 transition-colors text-blue-100 shadow-2xl resize-none w-full"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            spellCheck="false"
            placeholder="// Paste your code here..."
          />

          {/* --- DASHBOARD --- */}
          <div className="space-y-6">
            <div className="bg-gray-900/80 backdrop-blur-sm p-8 rounded-xl border border-gray-800 h-[600px] overflow-y-auto shadow-2xl custom-scrollbar">
              
              <h2 className="text-xl font-bold mb-6 text-gray-200 flex items-center gap-3">
                <Activity className="w-6 h-6 text-blue-500" /> 
                Analysis Results
              </h2>

              {/* METRICS GRID */}
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
                    Algorithm efficiency rating.
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
                    Logic paths count.
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
                    Readability score.
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
                    Maintenance effort.
                  </div>
                </div>
              </div>

              {/* ISSUES LIST */}
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

        </div>
      </div> 
    </div>
  );
};

export default App;