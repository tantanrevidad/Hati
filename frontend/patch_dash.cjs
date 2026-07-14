const fs = require('fs');
let content = fs.readFileSync('src/components/DashboardScreen.tsx', 'utf8');

content = content.replace(
  '  onAddBillingMethod?: () => void;\n}',
  '  onAddBillingMethod?: () => void;\n  initialMenuOpen?: boolean;\n}'
);

content = content.replace(
  'export default function DashboardScreen({ groups, expenses, setExpenses, onCreateGroup, onLogout, onAddBillingMethod, userName, userColor }: DashboardScreenProps) {',
  'export default function DashboardScreen({ groups, expenses, setExpenses, onCreateGroup, onLogout, onAddBillingMethod, userName, userColor, initialMenuOpen = false }: DashboardScreenProps) {'
);

content = content.replace(
  'const [isMenuOpen, setIsMenuOpen] = useState(false);',
  'const [isMenuOpen, setIsMenuOpen] = useState(initialMenuOpen);'
);

// We should also make sure it closes the menu when returning to the dashboard from about, wait about is a modal inside dashboard so it's fine.
fs.writeFileSync('src/components/DashboardScreen.tsx', content);
