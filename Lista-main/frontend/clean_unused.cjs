const fs = require('fs');

let dash = fs.readFileSync('src/components/DashboardScreen.tsx', 'utf8');

const toggleStart = dash.indexOf('const toggleDarkMode = () => {');
if (toggleStart !== -1) {
  const toggleEnd = dash.indexOf('};', toggleStart) + 2;
  dash = dash.slice(0, toggleStart) + dash.slice(toggleEnd);
}

dash = dash.replace(/Moon, Sun, /g, '');
dash = dash.replace(/Moon, /g, '');
dash = dash.replace(/Sun, /g, '');

fs.writeFileSync('src/components/DashboardScreen.tsx', dash);
