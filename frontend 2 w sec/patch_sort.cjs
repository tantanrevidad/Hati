const fs = require('fs');

let dash = fs.readFileSync('src/components/DashboardScreen.tsx', 'utf8');

dash = dash.replace(
  "return list.sort((a, b) => { const timeA = a.date === 'Just now' ? Date.now() : new Date(a.date).getTime(); const timeB = b.date === 'Just now' ? Date.now() : new Date(b.date).getTime(); return timeB - timeA; });",
  "return list.sort((a, b) => { const timeA = a.date === 'Just now' ? Number.MAX_SAFE_INTEGER : new Date(a.date).getTime(); const timeB = b.date === 'Just now' ? Number.MAX_SAFE_INTEGER : new Date(b.date).getTime(); return timeB - timeA; });"
);

fs.writeFileSync('src/components/DashboardScreen.tsx', dash);
