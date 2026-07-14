const fs = require('fs');

let dash = fs.readFileSync('src/components/DashboardScreen.tsx', 'utf8');

// 1. Remove theme button in the menu
const themeStart = dash.indexOf('<button \n                  onClick={toggleDarkMode}');
if (themeStart !== -1) {
  const themeEnd = dash.indexOf('</button>', themeStart) + 9;
  dash = dash.slice(0, themeStart) + dash.slice(themeEnd);
}

// 2. Revert Header and Main Section
const headerStart = dash.indexOf('{/* New Header */}');
const headerEndStr = '<div className="space-y-4">';
const headerEnd = dash.indexOf(headerEndStr);

if (headerStart !== -1 && headerEnd !== -1) {
  const replacement = `
      {/* Header Profile */}
      <header className="bg-white dark:bg-slate-900 border-b border-[#C8DACF] dark:border-slate-800 px-6 py-4 sticky top-0 z-20 flex justify-between items-center">
        <div>
          <h1 className="text-2xl tracking-tight text-[#13463B] dark:text-white flex items-center" style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 900 }}>
            L<span className="relative inline-flex items-center justify-center">ı<span className="absolute top-[0.1em] left-1/2 -translate-x-1/2 w-[0.25em] h-[0.25em] bg-[#10C86E] rounded-full"></span></span>STA
          </h1>
          <p className="text-sm text-[#316D5F] dark:text-slate-400 font-medium">Welcome back{userName ? ', ' + userName.split(' ')[0] : ''}</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsMenuOpen(true)}
            className={\`w-10 h-10 rounded-full \${userColor || 'bg-[#236450]'} border-2 border-[#F3EFE7] dark:border-[#30373C] flex items-center justify-center text-white font-bold shadow-sm hover:opacity-90 transition-opacity\`}
          >
            {userName ? userName.charAt(0).toUpperCase() : <User size={18} />}
          </button>
        </div>
      </header>

      {/* Side Menu Drawer */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-[#13463B]/60 backdrop-blur-sm z-50"
              onClick={() => setIsMenuOpen(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-4/5 max-w-sm bg-white dark:bg-slate-900 shadow-2xl z-50 flex flex-col"
            >
              <div className="px-6 py-6 border-b border-[#C8DACF] dark:border-slate-800 flex justify-between items-center bg-[#F3EFE7] dark:bg-[#121212]">
                <div className="flex items-center gap-3">
                  <div className={\`w-12 h-12 rounded-full \${userColor || 'bg-[#236450]'} border-2 border-[#F3EFE7] dark:border-[#30373C] flex items-center justify-center text-white font-bold shadow-sm\`}>
                    {userName ? userName.charAt(0).toUpperCase() : <User size={22} />}
                  </div>
                  <div>
                    <h3 className="font-bold text-[#13463B] dark:text-white text-lg leading-tight">{userName || 'My Profile'}</h3>
                  </div>
                </div>
                <button 
                  onClick={() => setIsMenuOpen(false)}
                  className="w-8 h-8 rounded-full bg-[#E5F0E9] dark:bg-slate-800 flex items-center justify-center text-[#236450] dark:text-slate-300 hover:bg-[#C8DACF] dark:hover:bg-slate-700 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
                
                <button 
                  onClick={() => { setShowActivity(true); setIsMenuOpen(false); }}
                  className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-[#E5F0E9] dark:hover:bg-slate-800/50 transition-colors group text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#E5F0E9] dark:bg-slate-800 flex items-center justify-center text-[#1B5648] dark:text-slate-300 group-hover:bg-white dark:group-hover:bg-slate-700 shadow-sm transition-colors">
                      <Activity size={16} />
                    </div>
                    <span className="font-semibold text-sm text-[#13463B] dark:text-white">Activity</span>
                  </div>
                  <ChevronRight size={16} className="text-slate-400" />
                </button>
                
                <div className="h-px bg-[#C8DACF] dark:bg-slate-800 my-4" />

                <button 
                  onClick={onAddBillingMethod}
                  className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-[#E5F0E9] dark:hover:bg-slate-800/50 transition-colors group text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#E5F0E9] dark:bg-slate-800 flex items-center justify-center text-[#1B5648] dark:text-slate-300 group-hover:bg-white dark:group-hover:bg-slate-700 shadow-sm transition-colors">
                      <CreditCard size={16} />
                    </div>
                    <span className="font-semibold text-sm text-[#13463B] dark:text-white">Payment Methods</span>
                  </div>
                  <ChevronRight size={16} className="text-slate-400" />
                </button>
                <button 
                  onClick={() => { setShowAbout(true); setIsMenuOpen(false); }}
                  className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-[#E5F0E9] dark:hover:bg-slate-800/50 transition-colors group text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#E5F0E9] dark:bg-slate-800 flex items-center justify-center text-[#1B5648] dark:text-slate-300 group-hover:bg-white dark:group-hover:bg-slate-700 shadow-sm transition-colors">
                      <Info size={16} />
                    </div>
                    <span className="font-semibold text-sm text-[#13463B] dark:text-white">About & FAQs</span>
                  </div>
                  <ChevronRight size={16} className="text-slate-400" />
                </button>
              </div>

              <div className="p-6 border-t border-[#C8DACF] dark:border-slate-800 shrink-0">
                <button 
                  onClick={onLogout}
                  className="w-full flex items-center justify-center gap-2 p-4 rounded-2xl bg-[#EFA8B5]/10 hover:bg-[#EFA8B5]/20 text-[#CD5878] dark:text-[#EFA8B5] transition-colors font-bold"
                >
                  <LogOut size={18} />
                  <span>Log Out</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <main className="px-6 py-6 max-w-2xl mx-auto">
        <section>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-[#13463B] dark:text-white">Your Listahan</h2>
            <button
              onClick={onCreateGroup}
              className="w-10 h-10 rounded-full bg-[#13463B] dark:bg-white flex items-center justify-center text-white dark:text-[#13463B] hover:opacity-90 transition-opacity shadow-md"
            >
              <Plus size={20} />
            </button>
          </div>
          
          <div className="space-y-4">`;

  // Note: I also need to find the old Side Menu Drawer and remove it since it's now in the replacement.
  const oldSideMenuStart = dash.indexOf('{/* Side Menu Drawer */}');
  const oldSideMenuEnd = dash.indexOf('<main className="px-6 pt-4 pb-6 max-w-2xl mx-auto">');
  
  if (oldSideMenuStart !== -1 && oldSideMenuEnd !== -1) {
      dash = dash.slice(0, headerStart) + replacement + dash.slice(headerEnd + headerEndStr.length);
      
      // Wait, in the replacement I put the Side Menu Drawer *after* the Header Profile and before main.
      // But the original `dash` has it between `headerStart` and `headerEnd`. 
      // Actually `headerStart` is `{/* New Header */}`.
      // `headerEnd` is `<div className="space-y-4">`.
      // So replacing from `headerStart` to `headerEnd + length` covers everything in between, including the old side menu drawer and the old main top section.
  }
}

fs.writeFileSync('src/components/DashboardScreen.tsx', dash);
