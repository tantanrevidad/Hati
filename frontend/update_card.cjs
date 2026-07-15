const fs = require('fs');
let dash = fs.readFileSync('src/components/DashboardScreen.tsx', 'utf8');

const oldCard = `                  <button 
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
                  </button>`;

const newCard = `                  <button 
                    key={group.id}
                    onClick={() => setSelectedGroup(group)}
                    className="w-full bg-[#F7F9F5] dark:bg-slate-900 rounded-[32px] p-6 text-left transition-transform hover:scale-[1.01] active:scale-[0.99] border border-[#E0E6D8] dark:border-slate-700 shadow-sm flex flex-col"
                  >
                    <div className="w-14 h-14 rounded-2xl bg-[#85D7AD] flex items-center justify-center text-slate-900 font-bold text-xl mb-4">
                      {initialChar}
                    </div>

                    <div className="w-full flex items-center justify-between mb-1">
                      <h3 className="font-bold text-slate-900 dark:text-white text-[22px] tracking-tight">{group.name}</h3>
                      <ChevronRight size={20} className="text-slate-600 dark:text-slate-400" />
                    </div>
                    
                    <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">{group.members} people sharing</p>

                    <div className="h-px w-full bg-[#D6DEC9] dark:bg-slate-700 mb-5" />

                    <div className="flex justify-between items-end w-full">
                      <div>
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1 block">Net Balance</span>
                        <div className={\`text-[26px] font-black tracking-tighter \${netBalance >= 0 ? 'text-[#066549] dark:text-[#10C86E]' : 'text-leaf-pink dark:text-leaf-pink-dark'}\`}>
                          {netBalance >= 0 ? '+' : '-'}₱{Math.abs(netBalance).toLocaleString('en-US', {minimumFractionDigits: 0, maximumFractionDigits: 2})}
                        </div>
                      </div>
                      
                      <div className={\`px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2 border \${hasPending ? 'bg-[#FDF6E3] text-[#A67C00] border-[#E8DAB2] dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700' : 'bg-[#EDF3E8] text-[#066549] border-[#C3D2B5] dark:bg-slate-800 dark:text-[#10C86E] dark:border-slate-700'}\`}>
                        {hasPending ? (
                          <>
                            <div className="w-2 h-2 rounded-full bg-[#A67C00] dark:bg-slate-500" />
                            Pending Bills
                          </>
                        ) : (
                          <>
                            <div className="w-2 h-2 rounded-full border border-current flex items-center justify-center"><div className="w-[100%] h-px bg-current rotate-45" /></div>
                            Offline — will sync
                          </>
                        )}
                      </div>
                    </div>
                  </button>`;

if (dash.includes('border border-leaf-peach/40 dark:border-slate-700 shadow-sm flex flex-col"')) {
  dash = dash.replace(oldCard, newCard);
  fs.writeFileSync('src/components/DashboardScreen.tsx', dash);
} else {
  console.log("Could not find old card template");
}
