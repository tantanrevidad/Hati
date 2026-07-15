const fs = require('fs');

let dash = fs.readFileSync('src/components/DashboardScreen.tsx', 'utf8');

// 1. Add Activity icon import
if (!dash.includes('Activity, ')) {
  dash = dash.replace("Info, X, WifiOff } from 'lucide-react';", "Info, X, WifiOff, Activity } from 'lucide-react';");
}

// 2. Import ActivityScreen
if (!dash.includes('import ActivityScreen')) {
  dash = dash.replace("import GroupDetailScreen from './GroupDetailScreen';", "import GroupDetailScreen from './GroupDetailScreen';\nimport ActivityScreen from './ActivityScreen';");
}

// 3. Add showActivity state
dash = dash.replace(
  "const [showAbout, setShowAbout] = useState(false);",
  "const [showAbout, setShowAbout] = useState(false);\n  const [showActivity, setShowActivity] = useState(false);"
);

// 4. Remove useMemo for activities (it's in ActivityScreen now)
dash = dash.replace(/const activities = useMemo\(\(\) => \{[\s\S]*?\}, \[expenses, userName\]\);/, "");
dash = dash.replace(/interface ActivityItem \{[\s\S]*?\}/, "");

// 5. Replace embedded activity in menu with a button
const embeddedStart = dash.indexOf("{/* Embedded Activity in Menu */}");
const embeddedEnd = dash.indexOf('<div className="h-px bg-leaf-peach/30 dark:bg-slate-800 my-4" />');
if (embeddedStart !== -1 && embeddedEnd !== -1) {
  const newButton = `
                <button 
                  onClick={() => { setShowActivity(true); setIsMenuOpen(false); }}
                  className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-leaf-peach/5 dark:hover:bg-slate-800/50 transition-colors group text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-leaf-peach/10 dark:bg-slate-800 flex items-center justify-center text-slate-800 dark:text-slate-300 group-hover:bg-white dark:group-hover:bg-slate-700 shadow-sm transition-colors">
                      <Activity size={16} />
                    </div>
                    <span className="font-semibold text-sm text-slate-900 dark:text-white">Activity</span>
                  </div>
                  <ChevronRight size={16} className="text-slate-400" />
                </button>
                
  `;
  dash = dash.slice(0, embeddedStart) + newButton + dash.slice(embeddedEnd);
}

// 6. Add ActivityScreen to AnimatePresence
const aboutModalStart = dash.indexOf('{/* About & FAQs Modal */}');
if (aboutModalStart !== -1) {
  const newScreen = `
      {/* Activity Screen */}
      <AnimatePresence>
        {showActivity && (
          <ActivityScreen 
            expenses={expenses}
            groups={groups}
            userName={userName}
            onBack={() => { setShowActivity(false); setIsMenuOpen(true); }}
          />
        )}
      </AnimatePresence>
      
      `;
  dash = dash.slice(0, aboutModalStart) + newScreen + dash.slice(aboutModalStart);
}

fs.writeFileSync('src/components/DashboardScreen.tsx', dash);
