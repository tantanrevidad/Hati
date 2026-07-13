const fs = require('fs');
let dash = fs.readFileSync('src/components/DashboardScreen.tsx', 'utf8');

// Remove from menu
dash = dash.replace(/<button\s*onClick=\{toggleDarkMode\}[\s\S]*?<span className="text-sm font-bold text-slate-600 dark:text-slate-400">\{isDarkMode \? 'Dark' : 'Light'\}<\/span>\s*<\/button>/, '');

// Add to header next to the user profile
dash = dash.replace(/<div className="flex items-center gap-3">/, `<div className="flex items-center gap-3">
          <button 
            onClick={toggleDarkMode}
            className="w-10 h-10 rounded-full bg-white dark:bg-slate-800 border-2 border-leaf-peach/40 dark:border-slate-700 flex items-center justify-center text-slate-800 dark:text-slate-300 shadow-sm hover:opacity-90 transition-opacity mr-1"
          >
            {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>`);

fs.writeFileSync('src/components/DashboardScreen.tsx', dash);
