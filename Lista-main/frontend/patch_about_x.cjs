const fs = require('fs');
let content = fs.readFileSync('src/components/DashboardScreen.tsx', 'utf8');

content = content.replace(
  '<button \n                  onClick={() => setShowAbout(false)}\n                  className="w-8 h-8 rounded-full bg-leaf-peach/10 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:bg-leaf-pink/20 dark:hover:bg-slate-700 transition-colors"\n                >\n                  <X size={18} />\n                </button>',
  '<button \n                  onClick={() => { setShowAbout(false); setIsMenuOpen(true); }}\n                  className="w-8 h-8 rounded-full bg-leaf-peach/10 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:bg-leaf-pink/20 dark:hover:bg-slate-700 transition-colors"\n                >\n                  <X size={18} />\n                </button>'
);

fs.writeFileSync('src/components/DashboardScreen.tsx', content);
