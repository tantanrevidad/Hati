const fs = require('fs');
let css = fs.readFileSync('src/index.css', 'utf8');

if (css.includes('@custom-variant dark (&:is(.dark *));')) {
  css = css.replace('@custom-variant dark (&:is(.dark *));', '@custom-variant dark (&:where(.dark, .dark *));');
} else if (!css.includes('@custom-variant dark')) {
  css = css.replace('@import "tailwindcss";', '@import "tailwindcss";\n@custom-variant dark (&:where(.dark, .dark *));');
}
fs.writeFileSync('src/index.css', css);
