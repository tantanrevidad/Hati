const fs = require('fs');

let app = fs.readFileSync('src/App.tsx', 'utf8');

app = app.replace(
  "<DashboardScreen expenses={expenses} setExpenses={setExpenses} groups={groups} initialMenuOpen={returnToMenu} onCreateGroup={() => { setReturnToMenu(false); setCurrentScreen('add_group'); }} onAddBillingMethod={() => { setReturnToMenu(true); setCurrentScreen('payment_setup'); }} onLogout={() => { localStorage.removeItem('userEmail'); setCurrentScreen('login'); }} />",
  "<DashboardScreen expenses={expenses} setExpenses={setExpenses} groups={groups} initialMenuOpen={returnToMenu} userName={userName} userColor={userColor} onCreateGroup={() => { setReturnToMenu(false); setCurrentScreen('add_group'); }} onAddBillingMethod={() => { setReturnToMenu(true); setCurrentScreen('payment_setup'); }} onLogout={() => { localStorage.removeItem('userEmail'); setCurrentScreen('login'); }} />"
);

fs.writeFileSync('src/App.tsx', app);
