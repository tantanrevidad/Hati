const fs = require('fs');
let app = fs.readFileSync('src/App.tsx', 'utf8');

app = app.replace(
  'onCreateGroup={() => setCurrentScreen(\'add_group\')}',
  'onCreateGroup={() => { setReturnToMenu(false); setCurrentScreen(\'add_group\'); }}'
);

fs.writeFileSync('src/App.tsx', app);
