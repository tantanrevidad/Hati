const fs = require('fs');
let app = fs.readFileSync('src/App.tsx', 'utf8');

// GroupSetupScreen onBack -> dashboard
app = app.replace(
  'onBack={() => setCurrentScreen(\'dashboard\')}',
  'onBack={() => { setReturnToMenu(false); setCurrentScreen(\'dashboard\'); }}'
);

app = app.replace(
  'if (name === \'Joined Group\') {\n          setGroupName(name);\n          setCurrentScreen(\'dashboard\');\n        }',
  'if (name === \'Joined Group\') {\n          setGroupName(name);\n          setReturnToMenu(false);\n          setCurrentScreen(\'dashboard\');\n        }'
);

app = app.replace(
  'if (name === \'Joined Group\') {\n          setGroupName(name);\n          setCurrentScreen(\'dashboard\');\n        }',
  'if (name === \'Joined Group\') {\n          setGroupName(name);\n          setReturnToMenu(false);\n          setCurrentScreen(\'dashboard\');\n        }'
);

// GroupQRScreen onNext -> dashboard
app = app.replace(
  'onNext={() => setCurrentScreen(\'dashboard\')}',
  'onNext={() => { setReturnToMenu(false); setCurrentScreen(\'dashboard\'); }}'
);

fs.writeFileSync('src/App.tsx', app);
