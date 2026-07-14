const fs = require('fs');
let content = fs.readFileSync('src/components/GroupDetailScreen.tsx', 'utf8');

content = content.replace(
  'interface GroupDetailScreenProps {\n  group: { id: string; name: string; members: number; color?: string };\n  expenses: ExpenseItem[];\n  setExpenses: React.Dispatch<React.SetStateAction<ExpenseItem[]>>;\n  onBack: () => void;\n}',
  'interface GroupDetailScreenProps {\n  group: { id: string; name: string; members: number; color?: string };\n  expenses: ExpenseItem[];\n  setExpenses: React.Dispatch<React.SetStateAction<ExpenseItem[]>>;\n  onBack: () => void;\n  userName?: string;\n}'
);

content = content.replace(
  'export default function GroupDetailScreen({ group, expenses, setExpenses, onBack }: GroupDetailScreenProps) {',
  'export default function GroupDetailScreen({ group, expenses, setExpenses, onBack, userName }: GroupDetailScreenProps) {'
);

const oldApiCall = `      const response = await fetch('/api/analyze-receipt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          description: listaDescription,
          groupMembersCount: group.members
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) throw new Error(data.error || 'Failed to analyze');
      
      const newExpense: ExpenseItem = {
        id: Date.now().toString() + Math.random(),
        groupId: group.id,
        title: data.title,
        totalAmount: data.totalAmount,
        expenseType: data.expenseType,
        payer: data.payer,
        splits: data.splits.map((s: any) => ({ ...s, paid: false })),
        date: 'Just now'
      };

      setExpenses(prev => [newExpense, ...prev]);`;

const newApiCall = `      const response = await fetch('/api/analyze-receipt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          description: listaDescription,
          groupMembersCount: group.members,
          userName: userName || 'User'
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) throw new Error(data.error || 'Failed to analyze');
      
      const newExpenses = data.expenses.map((expenseData: any, index: number) => ({
        id: Date.now().toString() + '-' + index + '-' + Math.random(),
        groupId: group.id,
        title: expenseData.title,
        totalAmount: expenseData.totalAmount,
        expenseType: expenseData.expenseType,
        payer: expenseData.payer,
        splits: expenseData.splits.map((s: any) => ({ ...s, paid: false })),
        date: 'Just now'
      }));

      setExpenses(prev => [...newExpenses, ...prev]);`;

if (content.includes(oldApiCall)) {
  content = content.replace(oldApiCall, newApiCall);
} else {
  console.log("Could not find the old API call in GroupDetailScreen.tsx");
}

fs.writeFileSync('src/components/GroupDetailScreen.tsx', content);
