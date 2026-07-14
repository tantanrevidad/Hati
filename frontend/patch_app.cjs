const fs = require('fs');
let app = fs.readFileSync('src/App.tsx', 'utf8');

app = app.replace(
  'const [currentScreen, setCurrentScreen] = useState<ScreenState>(\'login\');',
  'const [currentScreen, setCurrentScreen] = useState<ScreenState>(\'login\');\n  const [returnToMenu, setReturnToMenu] = useState(false);'
);

app = app.replace(
  '{currentScreen === \'profile\' && <ProfileScreen onNext={(name, color) => {\n          setUserName(name); localStorage.setItem(\'userName\', name);\n          setUserColor(color); localStorage.setItem(\'userColor\', color);\n          setCurrentScreen(\'payment_setup\');\n      }} />}',
  '{currentScreen === \'profile\' && <ProfileScreen onNext={(name, color) => {\n          setUserName(name); localStorage.setItem(\'userName\', name);\n          setUserColor(color); localStorage.setItem(\'userColor\', color);\n          setReturnToMenu(false);\n          setCurrentScreen(\'payment_setup\');\n      }} />}'
);

app = app.replace(
  '{currentScreen === \'payment_setup\' && <PaymentMethodScreen onNext={() => setCurrentScreen(\'dashboard\')} />}',
  '{currentScreen === \'payment_setup\' && <PaymentMethodScreen onNext={() => { setCurrentScreen(\'dashboard\'); }} />}'
);

// We need a safe regex for dashboard
app = app.replace(
  'onCreateGroup={() => setCurrentScreen(\'add_group\')}',
  'initialMenuOpen={returnToMenu} onCreateGroup={() => setCurrentScreen(\'add_group\')}'
);

app = app.replace(
  'onAddBillingMethod={() => setCurrentScreen(\'payment_setup\')}',
  'onAddBillingMethod={() => { setReturnToMenu(true); setCurrentScreen(\'payment_setup\'); }}'
);

fs.writeFileSync('src/App.tsx', app);
