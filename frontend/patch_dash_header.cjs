const fs = require('fs');

let dash = fs.readFileSync('src/components/DashboardScreen.tsx', 'utf8');

// Ensure Scan is imported
if (!dash.includes('Scan, ')) {
  dash = dash.replace("Info, X, WifiOff, Activity } from 'lucide-react';", "Info, X, WifiOff, Activity, Scan } from 'lucide-react';");
}

const oldHeaderStart = dash.indexOf('{/* Header Profile */}');
const oldHeaderEnd = dash.indexOf('{/* Side Menu Drawer */}');

if (oldHeaderStart !== -1 && oldHeaderEnd !== -1) {
  const newHeader = `
      {/* New Header */}
      <header className="px-6 py-6 flex justify-between items-center bg-[#F3EFE7] dark:bg-[#121212] sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#236450] dark:bg-[#10C86E] flex items-center justify-center text-white dark:text-[#121212] font-bold text-lg shadow-sm">
            L
          </div>
          <h1 className="text-[22px] tracking-tight font-bold text-[#13463B] dark:text-white mt-1">
            lista
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={toggleDarkMode}
            className="w-10 h-10 rounded-full border border-[#C8DACF] dark:border-slate-700 bg-white/50 dark:bg-slate-800 flex items-center justify-center text-[#13463B] dark:text-slate-300 hover:bg-white transition-colors"
          >
            {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button 
            onClick={() => setIsMenuOpen(true)}
            className={\`w-10 h-10 rounded-full \${userColor || 'bg-[#236450]'} flex items-center justify-center text-white font-bold shadow-sm hover:opacity-90 transition-opacity\`}
          >
            {userName ? userName.charAt(0).toUpperCase() : <User size={18} />}
          </button>
        </div>
      </header>

      `;
  dash = dash.slice(0, oldHeaderStart) + newHeader + dash.slice(oldHeaderEnd);
}

// Now replace the main content header area
const mainStart = dash.indexOf('<main className="px-6 py-6 max-w-2xl mx-auto">');
const listahanStart = dash.indexOf('<div className="space-y-4">');

if (mainStart !== -1 && listahanStart !== -1) {
  const oldSection = dash.slice(mainStart, listahanStart);
  const newSection = `
      <main className="px-6 pt-4 pb-6 max-w-2xl mx-auto">
        <section className="mb-10">
          <p className="text-[#236450] dark:text-[#10C86E] font-bold text-sm mb-2 tracking-wide">Good morning{userName ? ', ' + userName.split(' ')[0] : ''}</p>
          <h2 className="text-[34px] sm:text-4xl leading-[1.05] font-black text-[#13463B] dark:text-white tracking-tight mb-8">
            Your shared life,<br />listed clearly.
          </h2>
          
          <div className="flex gap-4">
            <button 
              onClick={onCreateGroup}
              className="flex-1 bg-[#236450] dark:bg-white text-white dark:text-[#13463B] font-bold py-3.5 rounded-2xl shadow-sm flex items-center justify-center gap-2 hover:bg-[#1B5648] transition-colors"
            >
              <Plus size={20} />
              Create
            </button>
            <button 
              onClick={onCreateGroup} // Using the same action for now, can be updated later
              className="flex-1 bg-transparent border-2 border-[#236450] dark:border-slate-700 text-[#236450] dark:text-white font-bold py-3.5 rounded-2xl flex items-center justify-center gap-2 hover:bg-[#236450]/5 transition-colors"
            >
              <Scan size={20} />
              Join
            </button>
          </div>
        </section>

        <section>
          <div className="flex justify-between items-end mb-4">
            <h3 className="text-xl font-bold text-[#13463B] dark:text-white tracking-tight">Your Listahan</h3>
            <span className="text-sm font-medium text-[#577870] dark:text-slate-400">{groups.length} groups</span>
          </div>
          
          `;
  
  dash = dash.replace(oldSection, newSection);
}

fs.writeFileSync('src/components/DashboardScreen.tsx', dash);
