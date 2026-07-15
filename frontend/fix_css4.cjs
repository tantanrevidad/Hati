const fs = require('fs');
let css = fs.readFileSync('src/index.css', 'utf8');

css = css.replace('@custom-variant dark (&:where(.dark, .dark *));', '@variant dark (&:where(.dark, .dark *));');

fs.writeFileSync('src/index.css', css);
