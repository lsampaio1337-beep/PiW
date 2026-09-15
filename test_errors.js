const { execSync } = require('child_process');

try {
  execSync('npx eslint src/ui.js', { stdio: 'inherit' });
} catch (e) {
  console.log('Lint failed');
}
