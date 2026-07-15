const fs = require('fs');
let css = fs.readFileSync('src/index.css', 'utf8');
if (!css.includes('@custom-variant dark')) {
  css = css.replace('@import "tailwindcss";', '@import "tailwindcss";\n@custom-variant dark (&:is(.dark *));');
  fs.writeFileSync('src/index.css', css);
}
