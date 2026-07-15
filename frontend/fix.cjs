const fs = require('fs');
let content = fs.readFileSync('src/components/DashboardScreen.tsx', 'utf8');

const badToggle = `
  const toggleDarkMode = () => {
    if (document.documentElement.classList.contains('dark')) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setIsDarkMode(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setIsDarkMode(true);
    }
  };

`;

content = content.replace(badToggle, "");
// Add it back before `  return (` (the actual return of the component)

const correctReturn = "  return (\n    <div className=";
if (content.includes(correctReturn)) {
    content = content.replace(correctReturn, badToggle + correctReturn);
}

fs.writeFileSync('src/components/DashboardScreen.tsx', content);
