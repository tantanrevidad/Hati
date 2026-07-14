const fs = require('fs');

let group = fs.readFileSync('src/components/GroupDetailScreen.tsx', 'utf8');

// Dashboard padding
group = group.replace(/className="bg-\[#FCECEE\] dark:bg-slate-800 rounded-\[2rem\] p-3 sm:p-4 space-y-3 sm:space-y-4 shadow-sm border border-leaf-peach\/40 dark:border-slate-700 w-full max-w-2xl"/, 'className="bg-[#FCECEE] dark:bg-slate-800 rounded-[2rem] p-5 sm:p-6 space-y-4 sm:space-y-5 shadow-sm border border-leaf-peach/40 dark:border-slate-700 w-full max-w-2xl"');

// Payment method section replace
const oldSettle = `              {activeOwes.length > 0 && (
                <div className="mb-6">
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-2 uppercase tracking-wide">Payment Method</label>
                  <select 
                    value={selectedPaymentMethod}
                    onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white px-4 py-3 rounded-xl font-medium outline-none appearance-none"
                  >
                    <option value="GCash">GCash</option>
                    <option value="Maya">Maya</option>
                    <option value="Cash">Cash</option>
                  </select>
                </div>
              )}`;

const newSettle = `              {activeOwes.length > 0 && (
                <div className="mb-6 flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-200 dark:border-slate-700/50">
                  <div className="bg-white p-3 rounded-xl shadow-sm mb-3">
                    <svg width="120" height="120" viewBox="0 0 100 100" className="text-slate-900">
                      <path d="M10 10h20v20H10zm5 5h10v10H15zM70 10h20v20H70zm5 5h10v10H75zM10 70h20v20H10zm5 5h10v10H15z" fill="currentColor"/>
                      <path d="M40 10h20v5H40zm5 10h5v15h-5zm10-5h5v15h-5zM10 40h20v5H10zm5 10h5v10h-5zm10-5h5v15h-5zM70 40h20v5H70zm5 10h10v5H75zm10 10h5v15h-5zM40 70h20v5H40zm5 10h10v5H45zM50 40h20v20H50zm5 5h10v10H55z" fill="currentColor"/>
                    </svg>
                  </div>
                  <span className="font-bold text-slate-900 dark:text-white text-sm tracking-wide">Scan to Pay via QRPH</span>
                </div>
              )}`;
              
if(group.includes('Payment Method')) {
  group = group.replace(oldSettle, newSettle);
}

fs.writeFileSync('src/components/GroupDetailScreen.tsx', group);
