const fs = require('fs');

let app = fs.readFileSync('src/App.tsx', 'utf8');
app = app.replace(/const \[currentScreen, setCurrentScreen\] = useState<ScreenState>\('login'\);/, `const [currentScreen, setCurrentScreen] = useState<ScreenState>('login');
  React.useEffect(() => {
    const savedName = localStorage.getItem('userName');
    const savedColor = localStorage.getItem('userColor');
    if (savedName) setUserName(savedName);
    if (savedColor) setUserColor(savedColor);
    if (localStorage.getItem('userEmail')) {
      setCurrentScreen('dashboard');
    }
  }, []);`);

app = app.replace(/setUserName\(name\);/, `setUserName(name); localStorage.setItem('userName', name);`);
app = app.replace(/setUserColor\(color\);/, `setUserColor(color); localStorage.setItem('userColor', color);`);
app = app.replace(/setUserName\(''\); setUserColor\(''\);/, `setUserName(''); setUserColor(''); localStorage.removeItem('userName'); localStorage.removeItem('userColor');`);

fs.writeFileSync('src/App.tsx', app);
