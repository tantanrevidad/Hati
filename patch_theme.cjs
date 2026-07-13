const fs = require('fs');

function applyTheme(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Dashboard background
  content = content.replace(/bg-slate-50 dark:bg-\[\#121212\]/g, 'bg-[#F7F5EC] dark:bg-[#121212]');
  
  // Modal overlay
  content = content.replace(/bg-slate-900\/60/g, 'bg-slate-900/60'); // leave alone
  
  // Borders
  content = content.replace(/border-slate-200 dark:border-slate-800/g, 'border-leaf-peach/20 dark:border-slate-800');
  content = content.replace(/border-slate-300 dark:border-slate-700/g, 'border-leaf-peach/20 dark:border-slate-700');
  content = content.replace(/border-slate-100 dark:border-slate-800/g, 'border-leaf-peach/10 dark:border-slate-800');
  
  // Backgrounds of sub cards and buttons
  content = content.replace(/bg-slate-100 dark:bg-slate-800/g, 'bg-leaf-peach/10 dark:bg-slate-800');
  content = content.replace(/bg-slate-200 dark:bg-slate-800/g, 'bg-[#FCECEE] dark:bg-slate-800');
  
  // Hover states
  content = content.replace(/hover:bg-slate-100 dark:hover:bg-slate-800/g, 'hover:bg-leaf-peach/20 dark:hover:bg-slate-800');
  content = content.replace(/hover:bg-slate-200 dark:hover:bg-slate-700/g, 'hover:bg-leaf-pink/20 dark:hover:bg-slate-700');
  content = content.replace(/hover:bg-slate-50 dark:hover:bg-slate-800\/50/g, 'hover:bg-leaf-peach/5 dark:hover:bg-slate-800/50');
  content = content.replace(/hover:bg-slate-50 dark:hover:bg-slate-800/g, 'hover:bg-leaf-peach/5 dark:hover:bg-slate-800');

  // Specific to activities section
  content = content.replace(/bg-slate-50 dark:bg-slate-800\/50/g, 'bg-leaf-peach/5 dark:bg-slate-800/50');
  
  fs.writeFileSync(filePath, content);
}

applyTheme('src/components/DashboardScreen.tsx');
applyTheme('src/components/GroupDetailScreen.tsx');
