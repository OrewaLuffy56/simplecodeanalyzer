// 1. Indentation-Aware Tokenizer
const tokenize = (code) => {
  // Split into lines first
  const rawLines = code.split(/\r?\n/);
  
  const lines = rawLines.map(line => {
    // 1. Calculate Indentation Level (count leading spaces)
    const match = line.match(/^(\s*)/);
    const indent = match ? match[1].length : 0;

    // 2. Remove comments
    let cleanLine = line.split('#')[0].trim();

    // 3. Skip empty lines
    if (!cleanLine) return null;

    // 4. Tokenize the clean line (simple split for Python)
    // We keep strings intact for basic analysis
    const tokens = cleanLine
        .split(/([():,\.\[\]=]|\s+)/g)
        .map(t => t.trim())
        .filter(t => t.length > 0);

    return { indent, tokens, raw: cleanLine };
  }).filter(l => l !== null);

  return lines;
};

// 2. Tree Builder (Parser)
const parse = (lines) => {
  // Root node
  const root = { type: 'Program', indent: -1, children: [] };
  // Stack to track current parent based on indentation
  const stack = [root];

  lines.forEach(line => {
    // Determine type based on first token
    const first = line.tokens[0];
    let type = 'Statement';
    
    if (first === 'def') type = 'FunctionDeclaration';
    else if (first === 'class') type = 'ClassDeclaration';
    else if (first === 'if' || first === 'elif' || first === 'else') type = 'IfStatement';
    else if (first === 'for' || first === 'while') type = 'LoopStatement';
    
    // Check for inline "List Comprehension" loops (e.g., [x for x in y])
    if (type === 'Statement' && line.tokens.includes('for')) {
        // Simple heuristic: if 'for' is in the middle, treat as O(N) loop but likely not nested block
        // We mark it special to count complexity but not depth structure
        type = 'InlineLoop'; 
    }

    const node = { 
      type, 
      indent: line.indent, 
      value: first,
      tokens: line.tokens,
      children: [] 
    };

    // --- Indentation Logic ---
    // 1. Find the correct parent. 
    // The parent must have LOWER indent than the current line.
    // If current indent <= stack.top.indent, we popped out of a block.
    while (stack.length > 1 && line.indent <= stack[stack.length - 1].indent) {
      stack.pop();
    }

    // 2. Add as child to current parent
    stack[stack.length - 1].children.push(node);

    // 3. If this line starts a block (ends with :), push to stack
    // (Python blocks almost always follow a line ending in :)
    // However, for complexity, we assume any control flow statement *could* have children
    // if the next lines are indented. So we push EVERYTHING to stack.
    stack.push(node);
  });

  return root;
};

// 3. Metrics Calculator
const calculateMetrics = (ast, lines) => {
    let decisionPoints = 0;
    let maxLoopDepth = 0;
    let issues = [];

    const traverse = (node, depth) => {
        if (!node) return;

        let nextDepth = depth;

        // 1. Complexity Logic
        if (node.type === 'LoopStatement') {
            nextDepth = depth + 1;
            if (nextDepth > maxLoopDepth) maxLoopDepth = nextDepth;
            decisionPoints++;

            // Nested Loop Check
            if (depth > 0) {
                 // If we are already inside a loop (depth > 0)
                 // And we found another LoopStatement, that's nesting.
            }
        }
        else if (node.type === 'InlineLoop') {
            // Inline loops (list comps) increase local complexity but rarely nesting depth structure
            decisionPoints++; 
            // If inside a loop, it counts as nesting
            if (depth > 0 && (depth + 1 > maxLoopDepth)) maxLoopDepth = depth + 1;
        }
        else if (node.type === 'IfStatement') {
            decisionPoints++;
        }

        // 2. Issues
        if ((node.type === 'LoopStatement' || node.type === 'InlineLoop') && depth >= 1) {
             issues.push({
                type: 'Performance',
                severity: 'High',
                message: `Nested Loop Detected (Depth ${depth + 1}). O(N²).`
            });
        }
        
        // Security: Python 'exec' or 'eval'
        if (node.tokens && (node.tokens.includes('eval') || node.tokens.includes('exec'))) {
             issues.push({ type: 'Security', severity: 'Critical', message: "Avoid 'eval()' or 'exec()' in Python." });
        }

        // Recurse
        if (node.children) {
            node.children.forEach(child => traverse(child, nextDepth));
        }
    };

    if (ast.children) {
        ast.children.forEach(child => traverse(child, 0));
    }

    // Halstead (Simplified for Python)
    // Gather all tokens from lines
    const allTokens = lines.flatMap(l => l.tokens);
    const operators = ['+', '-', '*', '/', '=', '==', 'if', 'else', 'for', 'while', 'def', 'return', 'in', ':', '(', ')', '[', ']', '.'];
    const uniqueOps = new Set(allTokens.filter(t => operators.includes(t)));
    const uniqueOperands = new Set(allTokens.filter(t => !operators.includes(t)));
    
    const n1 = uniqueOps.size || 1; 
    const n2 = uniqueOperands.size || 1;
    const N = allTokens.length;
    
    const difficulty = (n1 / 2) * (N / n2); 
    const effort = difficulty * (N * Math.log2(n1 + n2));
    
    // Dedup issues
    const uniqueIssues = [...new Map(issues.map(item => [item['message'], item])).values()];

    return {
        bigO: maxLoopDepth === 0 ? 'O(1)' : maxLoopDepth === 1 ? 'O(N)' : `O(N^${maxLoopDepth})`,
        cyclomatic: decisionPoints + 1,
        halstead: { difficulty: difficulty.toFixed(1), effort: effort.toFixed(0) },
        issues: uniqueIssues
    };
};

export default { tokenize, parse, calculateMetrics };