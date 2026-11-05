const codeToExecute = "if(window.showMedalDetail) window.showMedalDetail('Kanto', 10, 5, 150)";
const argCallMatch = /^(?:if\s*\([^)]*\)\s*)?window\.([a-zA-Z0-9_]+)\s*\(\s*(['"]?[a-zA-Z0-9_\/$!*#@&\s.{}\[\]:()\\'\-]+['"]?(?:\s*,\s*['"]?[a-zA-Z0-9_\/$!*#@&\s.{}\[\]:()\\'\-]+['"]?)*)\s*\)\s*;?$/.exec(codeToExecute);
console.log(argCallMatch);
