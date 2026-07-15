const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else {
      if (file.endsWith('.tsx') || file.endsWith('.ts') || file.endsWith('.css')) {
        results.push(file);
      }
    }
  });
  return results;
}

const files = walk('src');

const replacements = {
  '#F7F5EC': '#F3EFE7',
  'bg-slate-900': 'bg-[#13463B]',
  'text-slate-900': 'text-[#13463B]',
  'text-slate-800': 'text-[#1B5648]',
  'text-slate-700': 'text-[#236450]',
  'text-slate-600': 'text-[#316D5F]',
  'text-slate-500': 'text-[#577870]',
  'bg-[#FCECEE]': 'bg-[#E5F0E9]',
  'bg-leaf-peach/10': 'bg-[#E5F0E9]',
  'bg-leaf-peach/5': 'bg-[#E5F0E9]',
  'border-leaf-peach/30': 'border-[#C8DACF]',
  'border-leaf-peach/40': 'border-[#C8DACF]',
  'border-slate-100': 'border-[#C8DACF]',
  'bg-[#F7F9F5]': 'bg-white',
  'border-[#E0E6D8]': 'border-[#C8DACF]',
  'bg-[#85D7AD]': 'bg-[#8FD1AD]',
};

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;

  // We want to replace e.g. text-slate-900 but ONLY if it is not dark:text-slate-900
  // To keep it simple, we can first temporarily hide dark: classes
  let tempContent = content.replace(/dark:([a-zA-Z0-9\[\]#-]+)/g, 'DARK_PREFIX_$1');
  
  for (const [oldVal, newVal] of Object.entries(replacements)) {
    // If it's a hex code, just replace all
    if (oldVal.startsWith('#')) {
      if (tempContent.includes(oldVal)) {
        tempContent = tempContent.split(oldVal).join(newVal);
        changed = true;
      }
    } else {
      // replace whole words
      const regex = new RegExp('\\b' + oldVal.replace(/[\/\-\[\]]/g, '\\$&') + '\\b', 'g');
      if (regex.test(tempContent)) {
        tempContent = tempContent.replace(regex, newVal);
        changed = true;
      }
    }
  }

  // Restore dark prefixes
  tempContent = tempContent.replace(/DARK_PREFIX_([a-zA-Z0-9\[\]#-]+)/g, 'dark:$1');

  // One specific fix: The "Create Listahan" / "Plus" button in the dashboard
  // Currently uses bg-slate-900. Our script changed it to bg-[#13463B].
  // Let's also make sure any dark:bg-white stays.
  
  if (changed) {
    fs.writeFileSync(file, tempContent);
    console.log('Updated ' + file);
  }
});
