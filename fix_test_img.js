const fs = require('fs');

let content = fs.readFileSync('tests/windowManager.test.js', 'utf-8');

// The new requirement says img should not be filtered.
// Wait! The user plan says: "Update `forbiddenTags` to strictly remove elements like `script`, `iframe`, etc., but do not add `img` to the `forbiddenTags` block, allowing images if used in headers/content."
// But in the test it expects `img` to be null: `expect(img).toBeNull();`
// And `expect(img.getAttribute('onerror')).toBeNull();` should be checked to prevent XSS since onerror is filtered by the event sanitization.

content = content.replace(
    'expect(img).toBeNull();',
    'expect(img.getAttribute("onerror")).toBeNull();'
);

fs.writeFileSync('tests/windowManager.test.js', content);
