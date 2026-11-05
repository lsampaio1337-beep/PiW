const fs = require('fs');
const path = require('path');
const xlsx = require('xlsx');

// Mock ES6 imports for mathEngine if necessary, or just extract formulas directly.
// The formulas are:
// EVM = max(1, floor(0.75 * (Level)^1.15 * (BST / 300)^0.5 * (Q / 1.20)^0.5 * (0.70 + 0.30 * (IV_Total / 600))))
// PP = max(1, floor(50 * (Q / 1.40)^4.0 * (IV_Total / 450)^3.0 * (BST / 300)^1.1 * (Level / 50)))

// For balance, we can read config/balance.js. Since it's ES6 module (`export default balance;`), we can regex it or parse it.
const balanceStr = fs.readFileSync(path.join(__dirname, '../config/balance.js'), 'utf8');
const balanceCode = balanceStr.replace('export default balance;', 'module.exports = balance;');
fs.writeFileSync(path.join(__dirname, 'temp_balance.js'), balanceCode);
const balance = require('./temp_balance.js');
fs.unlinkSync(path.join(__dirname, 'temp_balance.js'));

const wb = xlsx.utils.book_new();

// Sheet 1: Formulas
const formulasData = [
  {
    "Calculation": "Pokemon Price (Selling / PP)",
    "Formula": "max(1, floor(50 * (Q / 1.40)^6.0 * (IV_Total / 450)^4.0 * (BST / 300)^5.0 * (Level / 50)^3.0))",
    "Variables": "Q = Quality, IV_Total = Sum of all IVs, BST = Base Stat Total, Level = Pokemon Level"
  },
  {
    "Calculation": "Defeated Pokemon Worth (EVM)",
    "Formula": "max(1, floor(0.75 * (Level)^1.15 * (BST / 300)^0.5 * (Q / 1.20)^0.5 * (0.70 + 0.30 * (IV_Total / 600))))",
    "Variables": "Q = Quality, IV_Total = Sum of all IVs, BST = Base Stat Total, Level = Pokemon Level"
  }
];
const wsFormulas = xlsx.utils.json_to_sheet(formulasData);
xlsx.utils.book_append_sheet(wb, wsFormulas, "Formulas");

// Sheet 2: Upgrades
const upgradesData = [];
for (const [category, upgrades] of Object.entries(balance.expansions)) {
  for (const upgrade of upgrades) {
    upgradesData.push({
      "Category": category,
      "Tier": upgrade.tier,
      "Name": upgrade.name,
      "Display Name": upgrade.displayName,
      "Cost": upgrade.cost,
      "Increment/Bonus": upgrade.increment,
      "Description": (upgrade.description || "").replace(/<br>/g, " ")
    });
  }
}
const wsUpgrades = xlsx.utils.json_to_sheet(upgradesData);
xlsx.utils.book_append_sheet(wb, wsUpgrades, "Upgrades");

xlsx.writeFile(wb, path.join(__dirname, '../pokemon_economy_info.xlsx'));
console.log("Excel file generated: pokemon_economy_info.xlsx");
