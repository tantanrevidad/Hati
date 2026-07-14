const fs = require('fs');
let content = fs.readFileSync('src/components/DashboardScreen.tsx', 'utf8');

content = content.replace(
  '₱{activity.amount.toFixed(2)}',
  '₱{activity.amount.toLocaleString(\'en-US\', {minimumFractionDigits: 2, maximumFractionDigits: 2})}'
);

fs.writeFileSync('src/components/DashboardScreen.tsx', content);
