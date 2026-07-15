const fs = require('fs');
let content = fs.readFileSync('src/components/DashboardScreen.tsx', 'utf8');

content = content.replace(
  '<GroupDetailScreen \n            group={selectedGroup}\n            expenses={expenses}\n            setExpenses={setExpenses}\n            onBack={() => setSelectedGroup(null)} \n          />',
  '<GroupDetailScreen \n            group={selectedGroup}\n            expenses={expenses}\n            setExpenses={setExpenses}\n            onBack={() => setSelectedGroup(null)} \n            userName={userName}\n          />'
);

fs.writeFileSync('src/components/DashboardScreen.tsx', content);
