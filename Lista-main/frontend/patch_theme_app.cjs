const fs = require('fs');

let app = fs.readFileSync('src/App.tsx', 'utf8');

app = app.replace(/if \(savedName\) setUserName\(savedName\);/, `const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else if (savedTheme === 'light') {
      document.documentElement.classList.remove('dark');
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      document.documentElement.classList.add('dark');
    }
    if (savedName) setUserName(savedName);`);

fs.writeFileSync('src/App.tsx', app);
