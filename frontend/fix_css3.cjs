const fs = require('fs');
let css = fs.readFileSync('src/index.css', 'utf8');

css = css.replace('@import "tailwindcss";\n@import url(\'https://fonts.googleapis.com/css2?family=Caveat:wght@400..700&family=Montserrat:wght@100..900&family=Pacifico&family=Grand+Hotel&family=Comfortaa:wght@400;700&family=Nunito:wght@900&display=swap\');', '@import url(\'https://fonts.googleapis.com/css2?family=Caveat:wght@400..700&family=Montserrat:wght@100..900&family=Pacifico&family=Grand+Hotel&family=Comfortaa:wght@400;700&family=Nunito:wght@900&display=swap\');\n@import "tailwindcss";');

fs.writeFileSync('src/index.css', css);
