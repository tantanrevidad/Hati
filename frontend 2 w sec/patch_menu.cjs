const fs = require('fs');
let content = fs.readFileSync('src/components/DashboardScreen.tsx', 'utf8');

// 1. Remove from header
content = content.replace(/<button \n            onClick=\{toggleDarkMode\}\n            className="w-10 h-10 rounded-full bg-white dark:bg-slate-800 border-2 border-leaf-peach\/40 dark:border-slate-700 flex items-center justify-center text-slate-800 dark:text-slate-300 shadow-sm hover:opacity-90 transition-opacity mr-1"\n          >\n            \{isDarkMode \? <Sun size=\{18\} \/> : <Moon size=\{18\} \/>\}\n          <\/button>/, '');

// If the previous regex fails due to spacing, I'll use a safer approach:
const headerBtnRegex = /<button [^>]*onClick=\{toggleDarkMode\}[^>]*>[\s\S]*?<\/button>\s*<button/;
content = content.replace(headerBtnRegex, '<button');

// 2. Add back to menu tab
// Let's find a good spot. Above "Payment Methods" in the menu drawer
const paymentMethodRegex = /<button \n                  onClick=\{onAddBillingMethod\}/;

const themeMenuBtn = `<button 
                  onClick={toggleDarkMode}
                  className="w-full flex items-center justify-between p-4 rounded-2xl hover:bg-leaf-peach/5 dark:hover:bg-slate-800/50 transition-colors group text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-leaf-peach/10 dark:bg-slate-800 flex items-center justify-center text-slate-800 dark:text-slate-300 group-hover:bg-white dark:group-hover:bg-slate-700 shadow-sm transition-colors">
                      {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
                    </div>
                    <span className="font-semibold text-slate-900 dark:text-white">Theme</span>
                  </div>
                  <span className="text-sm font-bold text-slate-600 dark:text-slate-400">{isDarkMode ? 'Dark' : 'Light'}</span>
                </button>
                <button 
                  onClick={onAddBillingMethod}`;

content = content.replace(paymentMethodRegex, themeMenuBtn);
fs.writeFileSync('src/components/DashboardScreen.tsx', content);
