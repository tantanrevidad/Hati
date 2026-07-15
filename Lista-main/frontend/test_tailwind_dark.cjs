const fs = require('fs');
let css = fs.readFileSync('src/index.css', 'utf8');

// Replace custom variant with the official Tailwind v4 one for class-based dark mode
css = css.replace(/@custom-variant dark \(&:is\(\.dark, \.dark \*\)\);/, '@custom-variant dark (&:is(.dark *));');
fs.writeFileSync('src/index.css', css);
