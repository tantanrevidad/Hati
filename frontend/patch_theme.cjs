const fs = require('fs');
let dash = fs.readFileSync('src/components/DashboardScreen.tsx', 'utf8');

// 1. Add Sun, Moon back to imports
dash = dash.replace("CreditCard, Info, X, WifiOff, Activity, Scan }", "CreditCard, Info, X, WifiOff, Activity, Scan, Sun, Moon }");

// 2. Add toggleDarkMode function
const toggleFunc = `
  const toggleDarkMode = () => {
    if (document.documentElement.classList.contains('dark')) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setIsDarkMode(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setIsDarkMode(true);
    }
  };

`;

dash = dash.replace('  return (', toggleFunc + '  return (');

// 3. Add Theme button back in the side menu drawer, after Payment Methods
const paymentEnd = dash.indexOf('<ChevronRight size={16} className="text-slate-400" />\n                </button>');
if (paymentEnd !== -1) {
    const paymentButtonEndIndex = paymentEnd + '<ChevronRight size={16} className="text-slate-400" />\n                </button>'.length;
    
    const themeButton = `
                <button 
                  onClick={toggleDarkMode}
                  className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-[#E5F0E9] dark:hover:bg-slate-800/50 transition-colors group text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#E5F0E9] dark:bg-slate-800 flex items-center justify-center text-[#1B5648] dark:text-slate-300 group-hover:bg-white dark:group-hover:bg-slate-700 shadow-sm transition-colors">
                      {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
                    </div>
                    <span className="font-semibold text-sm text-[#13463B] dark:text-white">Theme</span>
                  </div>
                  <span className="text-xs font-bold text-[#316D5F] dark:text-slate-400">{isDarkMode ? 'Dark' : 'Light'}</span>
                </button>
`;
    dash = dash.slice(0, paymentButtonEndIndex) + themeButton + dash.slice(paymentButtonEndIndex);
}

fs.writeFileSync('src/components/DashboardScreen.tsx', dash);
