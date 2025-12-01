export const tokenize = (input) => {
  const tokens = [];
  const tokenRegex =
    /\s*(\/\/.*|\/\*[\s\S]*?\*\/|"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|\b\d+\b|[a-zA-Z_$][a-zA-Z0-9_$]*|[{}()\[\];,.]|[<>=!+\-*/&|]+)\s*/g;

  let match;
  while ((match = tokenRegex.exec(input)) !== null) {
    if (match[1] && !match[1].startsWith("//") && !match[1].startsWith("/*")) {
      tokens.push(match[1]);
    }
  }
  return tokens;
};
