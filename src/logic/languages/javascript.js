// 1. Advanced Tokenizer (Handles strings & comments properly)
const tokenize = (code) => {
  const tokens = [];
  let current = 0;

  while (current < code.length) {
    let char = code[current];

    // Skip Whitespace
    if (/\s/.test(char)) {
      current++;
      continue;
    }

    // Handle Comments (// and /* */)
    if (char === '/' && code[current + 1] === '/') {
      current += 2;
      while (current < code.length && code[current] !== '\n') current++;
      continue;
    }
    if (char === '/' && code[current + 1] === '*') {
      current += 2;
      while (current < code.length && !(code[current] === '*' && code[current + 1] === '/')) current++;
      current += 2;
      continue;
    }

    // Handle Strings (Single and Double Quotes)
    if (char === '"' || char === "'") {
      let quote = char;
      let value = "";
      current++; // skip opening quote
      while (current < code.length && code[current] !== quote) {
        value += code[current];
        current++;
      }
      current++; // skip closing quote
      tokens.push(value); // We treat strings as generic tokens
      continue;
    }

    // Handle Separators & Operators
    if (/[{}();,\[\]\.\+\-\*\/=<>!&|]/.test(char)) {
      tokens.push(char);
      current++;
      continue;
    }

    // Handle Words / Numbers / Keywords
    if (/[a-zA-Z0-9_$]/.test(char)) {
      let value = "";
      while (current < code.length && /[a-zA-Z0-9_$]/.test(code[current])) {
        value += code[current];
        current++;
      }
      tokens.push(value);
      continue;
    }

    current++;
  }
  return tokens;
};

// 2. Robust Recursive Parser
const parse = (tokens) => {
  let current = 0;

  function walk() {
    const token = tokens[current];
    if (!token) return null;

    // --- FUNCTION DECLARATION ---
    if (token === 'function') {
      current++;
      if (current < tokens.length && tokens[current] !== '(') current++; // skip name
      skipParens(); // skip (params)
      const body = walk(); // expect block
      return { type: 'FunctionDeclaration', children: [body] };
    }

    // --- FOR / WHILE LOOPS ---
    if (token === 'for' || token === 'while') {
      current++;
      skipParens(); // skip (init; cond; inc)
      
      // The next item is the loop body. 
      // It might be a Block { ... } or a single statement "console.log()"
      const body = walk(); 
      return { type: 'LoopStatement', children: [body] };
    }

    // --- IF STATEMENTS ---
    if (token === 'if') {
      current++;
      skipParens();
      const body = walk();
      // We don't strictly need 'else' for complexity, but good to have
      return { type: 'IfStatement', children: [body] };
    }

    // --- BLOCK STATEMENT { ... } ---
    if (token === '{') {
      current++; // eat '{'
      const nodes = [];
      while (current < tokens.length && tokens[current] !== '}') {
        const node = walk();
        if (node) nodes.push(node);
      }
      current++; // eat '}'
      return { type: 'BlockStatement', children: nodes };
    }

    // --- GENERIC EXPRESSION ---
    // Eat tokens until we hit a delimiter like ; or } or )
    current++;
    return { type: 'Expression', value: token };
  }

  // Helper to safely skip (...)
  function skipParens() {
    if (tokens[current] === '(') {
      let balance = 1;
      current++;
      while (balance > 0 && current < tokens.length) {
        if (tokens[current] === '(') balance++;
        if (tokens[current] === ')') balance--;
        current++;
      }
    }
  }

  const ast = { type: 'Program', children: [] };
  while (current < tokens.length) {
    const node = walk();
    if (node) ast.children.push(node);
  }
  return ast;
};

// 3. Unified Metrics Calculator
const calculateMetrics = (ast, tokens) => {
    let decisionPoints = 0;
    let maxLoopDepth = 0;
    let issues = [];

    // Recursive traverser that carries depth
    const traverse = (node, depth) => {
        if (!node) return;

        let nextDepth = depth;

        // 1. Complexity Logic
        if (node.type === 'LoopStatement') {
            nextDepth = depth + 1; // Increase depth
            if (nextDepth > maxLoopDepth) maxLoopDepth = nextDepth;
            decisionPoints++; // Loops are decision points

            // Check for nesting immediately
            // If we are currently inside a loop (depth > 0) and we just found another loop
            if (depth > 0) {
                 // We don't push duplicates, checking depth helps
            }
        }
        
        if (node.type === 'IfStatement') decisionPoints++;

        // 2. Issue Detection
        // Since we are traversing, if we are at depth 2 (meaning inside Loop -> Loop), flag it.
        if (node.type === 'LoopStatement' && depth >= 1) {
             issues.push({
                type: 'Performance',
                severity: 'High',
                message: `Nested Loop Detected (Depth ${depth + 1}). O(N²).`
            });
        }
        
        if (node.value === 'eval') {
             issues.push({ type: 'Security', severity: 'Critical', message: "Usage of 'eval()' detected." });
        }

        // 3. Recurse into children
        if (node.children) {
            node.children.forEach(child => traverse(child, nextDepth));
        }
    };

    // Start traversal
    if (ast.children) {
        ast.children.forEach(node => traverse(node, 0));
    }

    // Halstead (Volume/Difficulty) Logic
    const operators = ['+', '-', '*', '/', '=', '==', '===', '!=', '<', '>', '<=', '>=', '&&', '||', '!', '++', '--', '+=', '-=', 'if', 'else', 'for', 'while', 'return', 'function'];
    // Filter tokens to find operators
    const uniqueOps = new Set(tokens.filter(t => operators.includes(t)));
    // Operands are anything that isn't an operator and isn't syntax sugar like { } ( ) ;
    const uniqueOperands = new Set(tokens.filter(t => !operators.includes(t) && !/^[{}();,\[\]]$/.test(t)));
    
    const n1 = uniqueOps.size || 1; 
    const n2 = uniqueOperands.size || 1;
    const N = tokens.length;
    
    // Equations
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