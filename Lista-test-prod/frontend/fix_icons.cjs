const fs = require('fs');
let dash = fs.readFileSync('src/components/DashboardScreen.tsx', 'utf8');
dash = dash.replace("Info, X } from 'lucide-react';", "Info, X, WifiOff } from 'lucide-react';");

dash = dash.replace(
  '<div className="w-2 h-2 rounded-full border border-current flex items-center justify-center"><div className="w-[100%] h-px bg-current rotate-45" /></div>',
  '<WifiOff size={12} strokeWidth={3} />'
);

fs.writeFileSync('src/components/DashboardScreen.tsx', dash);
