const fs = require('fs');

let dash = fs.readFileSync('src/components/DashboardScreen.tsx', 'utf8');

dash = dash.replace(/document\.documentElement\.classList\.remove\('dark'\);/, `document.documentElement.classList.remove('dark'); localStorage.setItem('theme', 'light');`);
dash = dash.replace(/document\.documentElement\.classList\.add\('dark'\);/, `document.documentElement.classList.add('dark'); localStorage.setItem('theme', 'dark');`);

fs.writeFileSync('src/components/DashboardScreen.tsx', dash);
