const fs = require('fs');
let content = fs.readFileSync('src/components/DashboardScreen.tsx', 'utf8');

content = content.replace(
  'className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex flex-col justify-end sm:justify-center items-center sm:p-6"\n            onClick={() => setShowAbout(false)}',
  'className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex flex-col justify-end sm:justify-center items-center sm:p-6"\n            onClick={() => { setShowAbout(false); setIsMenuOpen(true); }}'
);

content = content.replace(
  '<button \n                  onClick={() => setShowAbout(false)}\n                  className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"\n                >\n                  <X size={20} />\n                </button>',
  '<button \n                  onClick={() => { setShowAbout(false); setIsMenuOpen(true); }}\n                  className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"\n                >\n                  <X size={20} />\n                </button>'
);

fs.writeFileSync('src/components/DashboardScreen.tsx', content);
