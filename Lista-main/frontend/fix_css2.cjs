const fs = require('fs');
let css = fs.readFileSync('src/index.css', 'utf8');

const lines = css.split('\n');
const newLines = [];
let foundImport = false;
for (let line of lines) {
  if (line.startsWith('@import url')) {
    if (foundImport) continue;
    foundImport = true;
  }
  newLines.push(line);
}
fs.writeFileSync('src/index.css', newLines.join('\n'));
