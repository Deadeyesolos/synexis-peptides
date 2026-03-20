const fs = require('fs');

let css = fs.readFileSync('styles.css', 'utf8');

// Find the start of the corruption. It looks like it started right after the .view-btn:hover rule.
// Actually, let's just find the first zero byte or the corrupted comment sequence.
const corruptedIndex1 = css.indexOf('/\x00*\x00'); // UTF-16 comment start 
const corruptedIndex2 = css.indexOf('}\r\n/\x00');
const corruptedIndex3 = css.indexOf('}\n/\x00');
const corruptedIndex4 = css.indexOf('.view-btn:hover {\r\n  border-color: var(--primary);\r\n  color: var(--primary-light);\r\n}');

// Alternatively, just truncate at the exact end of .view-btn:hover
const validPart = css.substring(0, css.indexOf('.view-btn:hover {') + 100);
// Wait, 100 characters might cut it off wrongly.
let cleanCss = css.split('.view-btn:hover')[0] + `.view-btn:hover {\n  border-color: var(--primary);\n  color: var(--primary-light);\n}\n\n`;

const bundleCss = fs.readFileSync('bundle-css.css', 'utf8');

fs.writeFileSync('styles.css', cleanCss + bundleCss, 'utf8');
console.log('Fixed styles.css encoding!');
