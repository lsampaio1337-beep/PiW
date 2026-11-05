const codeToExecute1 = "if(window.showMedalDetail) window.showMedalDetail('Kanto', 10, 5, 150)";
const codeToExecute2 = "if(window.showUpgradeDetail) window.showUpgradeDetail('storage', 2)";

const argCallMatch1 = /^(?:if\s*\([^)]*\)\s*)?window\.([a-zA-Z0-9_]+)\s*\(\s*(['"]?[a-zA-Z0-9_\/$!*#@&\s.{}\[\]:()\\'\-]+['"]?(?:\s*,\s*['"]?[a-zA-Z0-9_\/$!*#@&\s.{}\[\]:()\\'\-]+['"]?)*)\s*\)\s*;?$/.exec(codeToExecute1);
console.log("Match 1:", argCallMatch1);

const argCallMatch2 = /^(?:if\s*\([^)]*\)\s*)?window\.([a-zA-Z0-9_]+)\s*\(\s*(['"]?[a-zA-Z0-9_\/$!*#@&\s.{}\[\]:()\\'\-]+['"]?(?:\s*,\s*['"]?[a-zA-Z0-9_\/$!*#@&\s.{}\[\]:()\\'\-]+['"]?)*)\s*\)\s*;?$/.exec(codeToExecute2);
console.log("Match 2:", argCallMatch2);
