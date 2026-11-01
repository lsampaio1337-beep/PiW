const fs = require('fs');
let code = fs.readFileSync('config/hoennRoutes.js', 'utf8');

// The review noted that defeatMultipleSpecific in Challenge 5 uses "species" instead of "name".
// Let's fix that.
code = code.replace(
  /"defeatMultipleSpecific": \[\n\s+\{\n\s+"species": "Silcoon"/,
  '"defeatMultipleSpecific": [\n        {\n          "name": "Silcoon"'
);

code = code.replace(
  /"species": "Cascoon"/,
  '"name": "Cascoon"'
);

fs.writeFileSync('config/hoennRoutes.js', code);
