export const parse = (tokens) => {
  let current = 0;

  function walk() {
    let token = tokens[current];
    if (!token) return null;

    // Functions
    if (token === "function") {
      current++;
      const name = tokens[current] !== "(" ? tokens[current] : "anonymous";
      if (tokens[current] !== "(") current++;
      current++; // (
      while (tokens[current] !== ")" && current < tokens.length) current++;
      current++; // )
      const body = walk();
      return { type: "FunctionDeclaration", name, body };
    }

    // Loops (For/While)
    if (token === "for" || token === "while") {
      const type = token === "for" ? "ForStatement" : "WhileStatement";
      current++;
      let balance = 0;
      if (tokens[current] === "(") {
        do {
          if (tokens[current] === "(") balance++;
          if (tokens[current] === ")") balance--;
          current++;
        } while (balance > 0 && current < tokens.length);
      }
      const body = walk();
      return { type, body };
    }

    // Control Flow (If)
    if (token === "if") {
      current++;
      let balance = 0;
      if (tokens[current] === "(") {
        do {
          if (tokens[current] === "(") balance++;
          if (tokens[current] === ")") balance--;
          current++;
        } while (balance > 0 && current < tokens.length);
      }
      const body = walk();
      return { type: "IfStatement", body };
    }

    // Blocks
    if (token === "{") {
      current++;
      const nodes = [];
      while (tokens[current] !== "}" && current < tokens.length) {
        const node = walk();
        if (node) nodes.push(node);
      }
      current++;
      return { type: "BlockStatement", body: nodes };
    }

    // Function Calls
    if (/^[a-zA-Z_$]/.test(token) && tokens[current + 1] === "(") {
      const name = token;
      current += 2;
      const args = [];
      while (tokens[current] !== ")" && current < tokens.length) {
        if (tokens[current] !== ",") args.push(tokens[current]);
        current++;
      }
      current++;
      if (tokens[current] === ";") current++;
      return { type: "CallExpression", name, arguments: args };
    }

    current++;
    return { type: "Expression", value: token };
  }

  const ast = { type: "Program", body: [] };
  while (current < tokens.length) {
    const node = walk();
    if (node) ast.body.push(node);
  }
  return ast;
};
