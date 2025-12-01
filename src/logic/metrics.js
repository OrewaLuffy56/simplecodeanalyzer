export const calculateMetrics = (ast, tokens) => {
  let issues = [];
  let decisionPoints = 0;
  let maxLoopDepth = 0;

  // Helper: AST Traversal
  const traverse = (node, depth = 0) => {
    if (!node) return;

    // 1. Cyclomatic Complexity Logic (M = D + 1)
    if (["IfStatement", "ForStatement", "WhileStatement"].includes(node.type)) {
      decisionPoints++;
    }

    // 2. Big O Logic
    let currentDepth = depth;
    if (node.type === "ForStatement" || node.type === "WhileStatement") {
      currentDepth++;
      if (currentDepth > maxLoopDepth) maxLoopDepth = currentDepth;

      // Check Nested Loop
      const children = Array.isArray(node.body?.body)
        ? node.body.body
        : [node.body];
      const hasNested = children.some(
        (c) => c && (c.type === "ForStatement" || c.type === "WhileStatement"),
      );
      if (hasNested) {
        issues.push({
          type: "Performance",
          severity: "High",
          message: `Nested Loop Detected (Depth ${currentDepth + 1}). Complexity approaches O(N²).`,
        });
      }
    }

    // 3. Security Logic
    if (node.type === "CallExpression" && node.name === "eval") {
      issues.push({
        type: "Security",
        severity: "Critical",
        message: "Usage of 'eval()' detected (RCE Risk).",
      });
    }

    // Recursion
    if (node.body) {
      if (Array.isArray(node.body))
        node.body.forEach((n) => traverse(n, currentDepth));
      else traverse(node.body, currentDepth);
    }
  };

  if (ast.body) ast.body.forEach((n) => traverse(n, 0));

  // 4. Halstead Math
  const operators = [
    "+",
    "-",
    "*",
    "/",
    "=",
    "==",
    "if",
    "else",
    "for",
    "while",
    "function",
    "return",
    "(",
    ")",
    "{",
    "}",
    ";",
  ];
  let n1 = 0,
    n2 = 0,
    N1 = 0,
    N2 = 0;
  const uniqueOps = new Set();
  const uniqueOperands = new Set();

  tokens.forEach((t) => {
    if (operators.includes(t)) {
      N1++;
      uniqueOps.add(t);
    } else if (!/^[{}();,\[\]]$/.test(t)) {
      N2++;
      uniqueOperands.add(t);
    }
  });
  n1 = uniqueOps.size;
  n2 = uniqueOperands.size;

  // Equations
  const vocabulary = n1 + n2;
  const volume = (N1 + N2) * Math.log2(vocabulary || 1);
  const difficulty = (n1 / 2) * (N2 / (n2 || 1));
  const effort = difficulty * volume;

  return {
    cyclomatic: decisionPoints + 1,
    bigO:
      maxLoopDepth === 0
        ? "O(1)"
        : maxLoopDepth === 1
          ? "O(N)"
          : `O(N^${maxLoopDepth})`,
    halstead: { difficulty: difficulty.toFixed(1), effort: effort.toFixed(0) },
    issues,
  };
};
