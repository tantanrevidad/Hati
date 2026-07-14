const fs = require('fs');

function applyTheme(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Make the text higher contrast in light mode
  content = content.replace(/text-slate-800 dark:text-white/g, 'text-slate-900 dark:text-white');
  content = content.replace(/text-slate-700 dark:text-slate-300/g, 'text-slate-800 dark:text-slate-300');
  content = content.replace(/text-slate-600 dark:text-slate-300/g, 'text-slate-700 dark:text-slate-300');
  content = content.replace(/text-slate-500 dark:text-slate-400/g, 'text-slate-600 dark:text-slate-400');
  
  // Use more of the palette for borders and accents in light mode
  content = content.replace(/border-leaf-peach\/20/g, 'border-leaf-peach/40');
  content = content.replace(/border-leaf-peach\/10/g, 'border-leaf-peach/30');
  
  // Give cards a subtle tint from the palette
  // content = content.replace(/bg-white dark:bg-slate-900/g, 'bg-[#FFFBF5] dark:bg-slate-900');
  
  fs.writeFileSync(filePath, content);
}

const files = fs.readdirSync('src/components');
for (let file of files) {
  if (file.endsWith('.tsx')) {
    applyTheme('src/components/' + file);
  }
}
