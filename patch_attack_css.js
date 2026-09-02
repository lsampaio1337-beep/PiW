const fs = require('fs');

let css = fs.readFileSync('styles.css', 'utf8');
css = css.replace(
    /0%, 100% \{ transform: scaleX\(-1\) rotate\(0deg\) translateY\(0\); \}/g,
    `0%, 100% { transform: rotate(0deg) translateY(0); }`
);
css = css.replace(
    /25% \{ transform: scaleX\(-1\) rotate\(-5deg\) translateY\(-3px\); \}/g,
    `25% { transform: rotate(-5deg) translateY(-3px); }`
);
css = css.replace(
    /75% \{ transform: scaleX\(-1\) rotate\(5deg\) translateY\(-3px\); \}/g,
    `75% { transform: rotate(5deg) translateY(-3px); }`
);
css = css.replace(
    /0%, 100% \{ transform: scaleX\(-1\) translateY\(0\); \}/g,
    `0%, 100% { transform: translateY(0); }`
);
css = css.replace(
    /50% \{ transform: scaleX\(-1\) translateY\(-15px\); \}/g,
    `50% { transform: translateY(-15px); }`
);
css = css.replace(
    /0%, 100% \{ transform: scaleX\(-1\) translateY\(0\) rotate\(0deg\); \}/g,
    `0%, 100% { transform: translateY(0) rotate(0deg); }`
);
css = css.replace(
    /50% \{ transform: scaleX\(-1\) translateY\(-10px\) rotate\(3deg\); \}/g,
    `50% { transform: translateY(-10px) rotate(3deg); }`
);

fs.writeFileSync('styles.css', css);
console.log('Patched attack vs idle isolation in CSS (removed hardcoded scaleX)!');
