const fs = require('fs');

let css = fs.readFileSync('src/index.css', 'utf8');

// Replace Outfit with Montserrat
css = css.replace('family=Outfit:wght@100..900', 'family=Montserrat:wght@100..900');
css = css.replace(/--font-sans: 'Outfit', sans-serif;/g, "--font-sans: 'Montserrat', sans-serif;");
css = css.replace(/font-family: 'Outfit', sans-serif;/g, "font-family: 'Montserrat', sans-serif;");

fs.writeFileSync('src/index.css', css);
