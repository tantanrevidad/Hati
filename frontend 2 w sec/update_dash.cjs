const fs = require('fs');

let dash = fs.readFileSync('src/components/DashboardScreen.tsx', 'utf8');

// I'll rewrite the return statement. First, find the return (.
const returnIndex = dash.indexOf('return (');
const beforeReturn = dash.slice(0, returnIndex);

const newReturn = `return (
    <div className="min-h-screen bg-[#F7F5EC] dark:bg-[#121212] font-sans pb-28">
      {/* Header Profile */}
      <header className="bg-white dark:bg-slate-900 border-b border-leaf-peach/40 dark:border-slate-800 px-6 py-4 sticky top-0 z-20 flex justify-between items-center">
        <div>
          <h1 className="text-2xl tracking-tight text-slate-900 dark:text-white flex items-center" style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 900 }}>
            L<span className="relative inline-flex items-center justify-center">ı<span className="absolute top-[0.1em] left-1/2 -translate-x-1/2 w-[0.25em] h-[0.25em] bg-[#10C86E] rounded-full"></span></span>STA
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">Welcome back{userName ? ', ' + userName.split(' ')[0] : ''}</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsMenuOpen(true)}
            className={\`w-10 h-10 rounded-full \${userColor || 'bg-leaf-peach'} border-2 border-[#F7F5EC] dark:border-[#30373C] flex items-center justify-center text-white font-bold shadow-sm hover:opacity-90 transition-opacity\`}
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
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50"
              onClick={() => setIsMenuOpen(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-4/5 max-w-sm bg-white dark:bg-slate-900 shadow-2xl z-50 flex flex-col"
            >
              <div className="px-6 py-6 border-b border-leaf-peach/40 dark:border-slate-800 flex justify-between items-center bg-[#F7F5EC] dark:bg-[#121212]">
                <div className="flex items-center gap-3">
                  <div className={\`w-12 h-12 rounded-full \${userColor || 'bg-leaf-peach'} border-2 border-[#F7F5EC] dark:border-[#30373C] flex items-center justify-center text-white font-bold shadow-sm\`}>
                    {userName ? userName.charAt(0).toUpperCase() : <User size={22} />}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-lg leading-tight">{userName || 'My Profile'}</h3>
                  </div>
                </div>
                <button 
                  onClick={() => setIsMenuOpen(false)}
                  className="w-8 h-8 rounded-full bg-[#FCECEE] dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-300 hover:bg-leaf-pink/20 dark:hover:bg-slate-700 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
                
                {/* Embedded Activity in Menu */}
                <div className="mb-8">
                  <div className="flex justify-between items-center mb-4 px-2">
                    <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider text-leaf-green dark:text-leaf-green-dark">Activity</h2>
                  </div>
                  {activities.length === 0 ? (
                    <div className="px-2 text-sm text-slate-500">No activity yet.</div>
                  ) : (
                    <div className="space-y-3">
                      {activities.map((activity) => (
                        <div key={activity.id} className="bg-white dark:bg-slate-900 p-3 rounded-xl shadow-sm border border-leaf-peach/30 dark:border-slate-800 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={\`w-10 h-10 rounded-xl flex items-center justify-center \${
                              activity.type === 'pending' ? 'bg-leaf-yellow/20 text-leaf-yellow-dark' :
                              activity.type === 'paid' ? 'bg-leaf-green/20 text-leaf-green-dark' :
                              'bg-leaf-pink/20 text-leaf-pink-dark'
                            }\`}>
                              {activity.type === 'pending' && <ReceiptText size={18} />}
                              {activity.type === 'paid' && <ArrowDownRight size={18} />}
                              {activity.type === 'debt' && <ArrowUpRight size={18} />}
                            </div>
                            <div>
                              <h4 className="font-bold text-sm text-slate-900 dark:text-white leading-tight truncate max-w-[120px]">{activity.title}</h4>
                              <p className="text-[10px] font-medium mt-0.5 text-slate-600 dark:text-slate-400 truncate max-w-[120px]">
                                {activity.type === 'pending' ? \`\${activity.person} owes you\` : 
                                 activity.type === 'paid' ? \`You paid \${activity.person}\` : 
                                 \`You owe \${activity.person}\`} • {activity.date}
                              </p>
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <span className={\`block font-black text-sm \${
                              activity.type === 'pending' ? 'text-leaf-green dark:text-leaf-green-dark' :
                              activity.type === 'paid' ? 'text-slate-800 dark:text-slate-200' :
                              'text-leaf-pink dark:text-leaf-pink-dark'
                            }\`}>
                              {activity.type !== 'paid' && activity.type !== 'pending' ? '-' : ''}
                              ₱{activity.amount.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="h-px bg-leaf-peach/30 dark:bg-slate-800 my-4" />

                <button 
                  onClick={toggleDarkMode}
                  className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-leaf-peach/5 dark:hover:bg-slate-800/50 transition-colors group text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-leaf-peach/10 dark:bg-slate-800 flex items-center justify-center text-slate-800 dark:text-slate-300 group-hover:bg-white dark:group-hover:bg-slate-700 shadow-sm transition-colors">
                      {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
                    </div>
                    <span className="font-semibold text-sm text-slate-900 dark:text-white">Theme</span>
                  </div>
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-400">{isDarkMode ? 'Dark' : 'Light'}</span>
                </button>
                <button 
                  onClick={onAddBillingMethod}
                  className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-leaf-peach/5 dark:hover:bg-slate-800/50 transition-colors group text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-leaf-peach/10 dark:bg-slate-800 flex items-center justify-center text-slate-800 dark:text-slate-300 group-hover:bg-white dark:group-hover:bg-slate-700 shadow-sm transition-colors">
                      <CreditCard size={16} />
                    </div>
                    <span className="font-semibold text-sm text-slate-900 dark:text-white">Payment Methods</span>
                  </div>
                  <ChevronRight size={16} className="text-slate-400" />
                </button>
                <button 
                  onClick={() => { setShowAbout(true); setIsMenuOpen(false); }}
                  className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-leaf-peach/5 dark:hover:bg-slate-800/50 transition-colors group text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-leaf-peach/10 dark:bg-slate-800 flex items-center justify-center text-slate-800 dark:text-slate-300 group-hover:bg-white dark:group-hover:bg-slate-700 shadow-sm transition-colors">
                      <Info size={16} />
                    </div>
                    <span className="font-semibold text-sm text-slate-900 dark:text-white">About & FAQs</span>
                  </div>
                  <ChevronRight size={16} className="text-slate-400" />
                </button>
              </div>

              <div className="p-6 border-t border-leaf-peach/40 dark:border-slate-800 shrink-0">
                <button 
                  onClick={onLogout}
                  className="w-full flex items-center justify-center gap-2 p-4 rounded-2xl bg-leaf-pink/10 hover:bg-leaf-pink/20 text-leaf-pink-dark dark:text-leaf-pink transition-colors font-bold"
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
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Your Listahan</h2>
            <button 
              onClick={onCreateGroup}
              className="w-10 h-10 rounded-full bg-slate-900 dark:bg-white flex items-center justify-center text-white dark:text-slate-900 hover:opacity-90 transition-opacity shadow-md"
            >
              <Plus size={20} />
            </button>
          </div>
          
          <div className="space-y-4">
            {groups.length === 0 ? (
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-leaf-peach/40 dark:border-slate-800 text-center shadow-sm">
                <div className="w-16 h-16 bg-[#FCECEE] dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                  <Users size={32} />
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white text-lg mb-2">No groups yet</h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm mb-6">Create a Listahan to start splitting bills with friends.</p>
                <button 
                  onClick={onCreateGroup}
                  className="px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-xl shadow-md"
                >
                  Create Listahan
                </button>
              </div>
            ) : (
              groups.map(group => {
                let groupTotal = 0;
                let owed = 0;
                let owe = 0;
            
                expenses.filter(e => e.groupId === group.id).forEach(exp => {
                  groupTotal += exp.totalAmount;
                  const isYouPayer = exp.payer.toLowerCase() === 'you' || exp.payer.toLowerCase() === 'me' || (userName && exp.payer.toLowerCase() === userName.toLowerCase());
                  exp.splits.forEach(split => {
                    const isYouSplit = split.person.toLowerCase() === 'you' || split.person.toLowerCase() === 'me' || (userName && split.person.toLowerCase() === userName.toLowerCase());
                    
                    if (!split.paid) {
                      if (isYouPayer && !isYouSplit) {
                        owed += split.amountOwed;
                      } else if (!isYouPayer && isYouSplit) {
                        owe += split.amountOwed;
                      }
                    }
                  });
                });
            
                const netBalance = owed - owe;
                const hasPending = expenses.filter(e => e.groupId === group.id).some(e => e.splits.some(s => !s.paid));
                const initialChar = group.name.charAt(0).toUpperCase();

                return (
                  <button 
                    key={group.id}
                    onClick={() => setSelectedGroup(group)}
                    className="w-full bg-white dark:bg-slate-900 rounded-3xl p-5 text-left transition-transform hover:scale-[1.01] active:scale-[0.99] border border-leaf-peach/40 dark:border-slate-700 shadow-sm flex flex-col"
                  >
                    <div className="flex items-start justify-between w-full mb-6">
                      <div className="w-12 h-12 rounded-2xl bg-leaf-green/30 dark:bg-leaf-green-dark/30 flex items-center justify-center text-leaf-green-dark dark:text-leaf-green font-bold text-lg">
                        {initialChar}
                      </div>
                      <ChevronRight size={20} className="text-slate-400 mt-2" />
                    </div>

                    <div className="mb-4">
                      <h3 className="font-bold text-slate-900 dark:text-white text-xl leading-tight mb-1">{group.name}</h3>
                      <p className="text-slate-500 dark:text-slate-400 text-sm">{group.members} people sharing</p>
                    </div>

                    <div className="h-px w-full bg-slate-100 dark:bg-slate-800 mb-4" />

                    <div className="flex justify-between items-end">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-1 block">Net Balance</span>
                        <div className={\`text-2xl font-black tracking-tight \${netBalance >= 0 ? 'text-[#10C86E] dark:text-[#10C86E]' : 'text-leaf-pink dark:text-leaf-pink-dark'}\`}>
                          {netBalance >= 0 ? '+' : '-'}₱{Math.abs(netBalance).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                        </div>
                      </div>
                      
                      <div className={\`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 border \${hasPending ? 'bg-leaf-peach/10 text-slate-700 dark:text-slate-300 border-leaf-peach/40 dark:border-slate-700' : 'bg-leaf-green/10 text-leaf-green-dark dark:text-leaf-green border-leaf-green/30'}\`}>
                        {hasPending ? (
                          <>
                            <div className="w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-slate-500" />
                            Pending Bills
                          </>
                        ) : (
                          <>
                            <div className="w-1.5 h-1.5 rounded-full bg-leaf-green" />
                            Online
                          </>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </section>
      </main>

      <AnimatePresence>
        {selectedGroup && (
          <GroupDetailScreen 
            group={selectedGroup}
            expenses={expenses}
            setExpenses={setExpenses}
            onBack={() => setSelectedGroup(null)} 
            userName={userName}
          />
        )}
      </AnimatePresence>
      
      {/* About & FAQs Modal */}
      <AnimatePresence>
        {showAbout && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex flex-col justify-end sm:justify-center items-center sm:p-6"
            onClick={() => { setShowAbout(false); setIsMenuOpen(true); }}
          >
            <motion.div
              initial={{ y: '100%', scale: 1 }}
              animate={{ y: 0, scale: 1 }}
              exit={{ y: '100%', scale: 1 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="bg-white dark:bg-slate-900 w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden max-h-[85vh] flex flex-col"
              onClick={e => e.stopPropagation()}
            >
              <div className="px-6 py-4 border-b border-leaf-peach/30 dark:border-slate-800 flex justify-between items-center shrink-0">
                <h3 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                  <Info size={20} className="text-leaf-green dark:text-leaf-green-dark" />
                  About & FAQs
                </h3>
                <button 
                  onClick={() => { setShowAbout(false); setIsMenuOpen(true); }}
                  className="w-8 h-8 rounded-full bg-leaf-peach/10 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:bg-leaf-pink/20 dark:hover:bg-slate-700 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
              <div className="p-6 overflow-y-auto space-y-6">
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm uppercase tracking-wider mb-2 text-leaf-green dark:text-leaf-green-dark">About Lista</h4>
                  <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                    Lista is your go-to companion for tracking group expenses and settling debts seamlessly. 
                    Whether you are dining out with friends or splitting household bills, we make sharing expenses stress-free.
                  </p>
                </div>
                
                <div className="space-y-4">
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm uppercase tracking-wider mb-2 text-leaf-green dark:text-leaf-green-dark">Frequently Asked Questions</h4>
                  
                  <div className="bg-leaf-peach/5 dark:bg-slate-800/50 p-4 rounded-xl">
                    <h5 className="font-bold text-slate-900 dark:text-white text-sm mb-1">How do I add a new expense?</h5>
                    <p className="text-xs text-slate-600 dark:text-slate-400">Head over to your group and click on the "Pa-Lista" button or simply scan your receipt.</p>
                  </div>
                  
                  <div className="bg-leaf-peach/5 dark:bg-slate-800/50 p-4 rounded-xl">
                    <h5 className="font-bold text-slate-900 dark:text-white text-sm mb-1">How do I settle my debts?</h5>
                    <p className="text-xs text-slate-600 dark:text-slate-400">In your group's details, you'll see a quick summary of what you owe. Tap "Settle Up" to instantly clear your debts.</p>
                  </div>

                  <div className="bg-leaf-peach/5 dark:bg-slate-800/50 p-4 rounded-xl">
                    <h5 className="font-bold text-slate-900 dark:text-white text-sm mb-1">Can I change my payment method?</h5>
                    <p className="text-xs text-slate-600 dark:text-slate-400">Yes, you can manage your GCash, Maya, and cash preferences from the menu drawer under "Payment Methods".</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style dangerouslySetInnerHTML={{__html: \`
        @keyframes scan {
          0% { top: 0; }
          100% { top: 100%; }
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      \`}} />
    </div>
  );
}
`;

fs.writeFileSync('src/components/DashboardScreen.tsx', beforeReturn + newReturn);
