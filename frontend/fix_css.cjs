const fs = require('fs');
let css = fs.readFileSync('src/index.css', 'utf8');

css = css.replace('@custom-variant dark (&:where(.dark, .dark *));', '');
css = css.replace('@import "tailwindcss";', '@import "tailwindcss";\n@import url(\'https://fonts.googleapis.com/css2?family=Caveat:wght@400..700&family=Montserrat:wght@100..900&family=Pacifico&family=Grand+Hotel&family=Comfortaa:wght@400;700&family=Nunito:wght@900&display=swap\');\n\n@custom-variant dark (&:where(.dark, .dark *));\n');
css = css.replace(/@import url\('https:\/\/fonts.googleapis.com[^;]+;\n/, ''); // remove the old one

fs.writeFileSync('src/index.css', css);
