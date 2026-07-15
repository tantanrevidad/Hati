const fs = require('fs');
let dash = fs.readFileSync('src/components/DashboardScreen.tsx', 'utf8');

const importMatch = dash.match(/import React, { useState, useMemo, useEffect } from 'react';/);
if (importMatch) {
  // Add state for online status
  dash = dash.replace(
    '  const [showAbout, setShowAbout] = useState(false);',
    '  const [showAbout, setShowAbout] = useState(false);\n  const [isOnline, setIsOnline] = useState(navigator.onLine);\n\n  useEffect(() => {\n    const handleOnline = () => setIsOnline(true);\n    const handleOffline = () => setIsOnline(false);\n    window.addEventListener(\'online\', handleOnline);\n    window.addEventListener(\'offline\', handleOffline);\n    return () => {\n      window.removeEventListener(\'online\', handleOnline);\n      window.removeEventListener(\'offline\', handleOffline);\n    };\n  }, []);'
  );

  dash = dash.replace(
    '{hasPending ? (\n                          <>\n                            <div className="w-2 h-2 rounded-full bg-[#A67C00] dark:bg-slate-500" />\n                            Pending Bills\n                          </>\n                        ) : (\n                          <>\n                            <WifiOff size={12} strokeWidth={3} />\n                            Offline — will sync\n                          </>\n                        )}',
    `{!isOnline ? (
                          <>
                            <WifiOff size={12} strokeWidth={3} />
                            Offline — will sync
                          </>
                        ) : hasPending ? (
                          <>
                            <div className="w-2 h-2 rounded-full bg-[#A67C00] dark:bg-slate-500" />
                            Pending Bills
                          </>
                        ) : (
                          <>
                            <div className="w-2 h-2 rounded-full bg-[#066549] dark:bg-leaf-green" />
                            Online
                          </>
                        )}`
  );

  dash = dash.replace(
    "border ${hasPending ? 'bg-[#FDF6E3] text-[#A67C00] border-[#E8DAB2] dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700' : 'bg-[#EDF3E8] text-[#066549] border-[#C3D2B5] dark:bg-slate-800 dark:text-[#10C86E] dark:border-slate-700'}",
    "border ${!isOnline ? 'bg-slate-100 text-slate-500 border-slate-300 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700' : hasPending ? 'bg-[#FDF6E3] text-[#A67C00] border-[#E8DAB2] dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700' : 'bg-[#EDF3E8] text-[#066549] border-[#C3D2B5] dark:bg-slate-800 dark:text-[#10C86E] dark:border-slate-700'}"
  );

  fs.writeFileSync('src/components/DashboardScreen.tsx', dash);
}
