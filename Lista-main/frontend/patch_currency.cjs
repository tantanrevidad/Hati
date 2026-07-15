const fs = require('fs');
let content = fs.readFileSync('src/components/GroupDetailScreen.tsx', 'utf8');

// Replace .toFixed(2) in UI elements with toLocaleString
content = content.replace(
  'text-3xl sm:text-4xl font-black text-leaf-green dark:text-leaf-green-dark my-2 tracking-tight leading-none">₱{owedToYou.toFixed(2)}</span>',
  'text-3xl sm:text-4xl font-black text-leaf-green dark:text-leaf-green-dark my-2 tracking-tight leading-none truncate" title={`₱${owedToYou.toFixed(2)}`}>₱{owedToYou.toLocaleString(\'en-US\', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>'
);

content = content.replace(
  'text-3xl sm:text-4xl font-black text-leaf-pink dark:text-leaf-pink-dark my-2 tracking-tight leading-none">₱{youOwe.toFixed(2)}</span>',
  'text-3xl sm:text-4xl font-black text-leaf-pink dark:text-leaf-pink-dark my-2 tracking-tight leading-none truncate" title={`₱${youOwe.toFixed(2)}`}>₱{youOwe.toLocaleString(\'en-US\', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>'
);

content = content.replace(
  'div className={`text-4xl sm:text-5xl font-black mt-1 sm:mt-2 tracking-tight ${totalBalance >= 0 ? \'text-leaf-green dark:text-leaf-green-dark\' : \'text-leaf-pink dark:text-leaf-pink-dark\'}`}>\n            {totalBalance >= 0 ? \'+\' : \'-\'}₱{Math.abs(totalBalance).toFixed(2)}\n          </div>',
  'div \n            className={`text-4xl sm:text-5xl font-black mt-1 sm:mt-2 tracking-tight truncate ${totalBalance >= 0 ? \'text-leaf-green dark:text-leaf-green-dark\' : \'text-leaf-pink dark:text-leaf-pink-dark\'}`}\n            title={`${totalBalance >= 0 ? \'+\' : \'-\'}₱${Math.abs(totalBalance).toFixed(2)}`}\n          >\n            {totalBalance >= 0 ? \'+\' : \'-\'}₱{Math.abs(totalBalance).toLocaleString(\'en-US\', {minimumFractionDigits: 2, maximumFractionDigits: 2})}\n          </div>'
);

content = content.replace(
  '₱{expense.totalAmount.toFixed(2)}',
  '₱{expense.totalAmount.toLocaleString(\'en-US\', {minimumFractionDigits: 2, maximumFractionDigits: 2})}'
);

content = content.replace(
  '₱{youOwe.toFixed(2)}</span> in total.',
  '₱{youOwe.toLocaleString(\'en-US\', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span> in total.'
);

content = content.replace(
  '<span className="font-bold text-slate-900 dark:text-white">₱{owe.amount.toFixed(2)}</span>',
  '<span className="font-bold text-slate-900 dark:text-white truncate max-w-[100px] text-right" title={`₱${owe.amount.toFixed(2)}`}>₱{owe.amount.toLocaleString(\'en-US\', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>'
);

content = content.replace(
  'Settle All (₱{youOwe.toFixed(2)})',
  'Settle All (₱{youOwe.toLocaleString(\'en-US\', {minimumFractionDigits: 2, maximumFractionDigits: 2})})'
);

fs.writeFileSync('src/components/GroupDetailScreen.tsx', content);
