const fs = require('fs');

// ProfileScreen.tsx
let profile = fs.readFileSync('src/components/ProfileScreen.tsx', 'utf8');
profile = profile.replace(/interface ProfileScreenProps \{[^\}]+\}/, `interface ProfileScreenProps {
  onNext: (name: string, color: string) => void;
}`);
profile = profile.replace(/onNext\(\);/g, `onNext(name, selectedColor);`);
fs.writeFileSync('src/components/ProfileScreen.tsx', profile);

// App.tsx
let app = fs.readFileSync('src/App.tsx', 'utf8');
app = app.replace(/const \[currentScreen, setCurrentScreen\] = useState<ScreenState>\('login'\);/g, `const [currentScreen, setCurrentScreen] = useState<ScreenState>('login');
  const [userName, setUserName] = useState('');
  const [userColor, setUserColor] = useState('');`);

app = app.replace(/<ProfileScreen onNext=\{\(\) => setCurrentScreen\('payment_setup'\)\} \/>/, `<ProfileScreen onNext={(name, color) => {
          setUserName(name);
          setUserColor(color);
          setCurrentScreen('payment_setup');
      }} />`);

app = app.replace(/<DashboardScreen [^>]* \/>/, `<DashboardScreen 
        expenses={expenses} 
        setExpenses={setExpenses} 
        groups={groups} 
        userName={userName}
        userColor={userColor}
        onCreateGroup={() => setCurrentScreen('add_group')} 
        onAddBillingMethod={() => setCurrentScreen('payment_setup')} 
        onLogout={() => { localStorage.removeItem('userEmail'); setUserName(''); setUserColor(''); setCurrentScreen('login'); }} 
      />`);
fs.writeFileSync('src/App.tsx', app);

// DashboardScreen.tsx
let dash = fs.readFileSync('src/components/DashboardScreen.tsx', 'utf8');
dash = dash.replace(/interface DashboardScreenProps \{/, `interface DashboardScreenProps {
  userName?: string;
  userColor?: string;`);

dash = dash.replace(/export default function DashboardScreen\(\{ groups, expenses, setExpenses, onCreateGroup, onLogout, onAddBillingMethod \}: DashboardScreenProps\) \{/, `export default function DashboardScreen({ groups, expenses, setExpenses, onCreateGroup, onLogout, onAddBillingMethod, userName, userColor }: DashboardScreenProps) {`);

// In DashboardScreen.tsx replace the menu header
let menuHeader = `
                  <div className="w-12 h-12 rounded-full bg-leaf-peach border-2 border-[#F7F5EC] dark:border-[#30373C] flex items-center justify-center text-white font-medium shadow-sm">
                    <User size={22} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 dark:text-white text-lg leading-tight">My Profile</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Manage your account</p>
                  </div>`;
let newMenuHeader = `
                  <div className={\`w-12 h-12 rounded-full \${userColor || 'bg-leaf-peach'} border-2 border-[#F7F5EC] dark:border-[#30373C] flex items-center justify-center text-white font-bold shadow-sm\`}>
                    {userName ? userName.charAt(0).toUpperCase() : <User size={22} />}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 dark:text-white text-lg leading-tight">{userName || 'My Profile'}</h3>
                  </div>`;
dash = dash.replace(menuHeader, newMenuHeader);

let mainHeader = `
          <button 
            onClick={() => setIsMenuOpen(true)}
            className="w-10 h-10 rounded-full bg-leaf-peach border-2 border-[#F7F5EC] dark:border-[#30373C] flex items-center justify-center text-white font-medium shadow-sm hover:opacity-90 transition-opacity"
          >
            <User size={18} />
          </button>`;
let newMainHeader = `
          <button 
            onClick={() => setIsMenuOpen(true)}
            className={\`w-10 h-10 rounded-full \${userColor || 'bg-leaf-peach'} border-2 border-[#F7F5EC] dark:border-[#30373C] flex items-center justify-center text-white font-bold shadow-sm hover:opacity-90 transition-opacity\`}
          >
            {userName ? userName.charAt(0).toUpperCase() : <User size={18} />}
          </button>`;
dash = dash.replace(mainHeader, newMainHeader);

fs.writeFileSync('src/components/DashboardScreen.tsx', dash);

