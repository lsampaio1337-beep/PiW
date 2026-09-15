const fs = require('fs');
const acorn = require("acorn");

const code = fs.readFileSync('src/ui.js', 'utf8');
try {
  acorn.parse(code, {ecmaVersion: 2020, sourceType: "module"});
  console.log("No syntax error");
} catch (e) {
  console.log("Syntax error at line", e.loc.line, "col", e.loc.column);
  console.log(e.message);

  const lines = code.split('\n');
  const startLine = Math.max(0, e.loc.line - 5);
  const endLine = Math.min(lines.length, e.loc.line + 5);

  for (let i = startLine; i < endLine; i++) {
    const mark = i === e.loc.line - 1 ? '>> ' : '   ';
    console.log(`${i+1}: ${mark}${lines[i]}`);
  }
}
