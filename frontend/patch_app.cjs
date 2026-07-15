const fs = require('fs');

let app = fs.readFileSync('src/App.tsx', 'utf8');

// Insert useEffect
const insertPoint = app.indexOf('return (');
const codeToInsert = `
  useEffect(() => {
    // Auto-delete groups that have been completely settled for over 7 days
    const now = Date.now();
    const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;
    
    let hasDeletions = false;
    const groupsToKeep = groups.filter(group => {
      const groupExpenses = expenses.filter(e => e.groupId === group.id);
      if (groupExpenses.length === 0) return true; // Don't delete groups with no expenses yet
      
      const allSettled = groupExpenses.every(exp => exp.splits.every(s => s.paid));
      if (!allSettled) return true; // Keep groups with unfinished settlement
      
      const latestExpenseTime = Math.max(...groupExpenses.map(exp => {
         return exp.date === 'Just now' ? now : new Date(exp.date).getTime();
      }));
      
      if (now - latestExpenseTime > SEVEN_DAYS) {
        hasDeletions = true;
        return false; // Delete group
      }
      return true;
    });

    if (hasDeletions) {
      setGroups(groupsToKeep);
      // Optionally clean up expenses for deleted groups
      const keepGroupIds = new Set(groupsToKeep.map(g => g.id));
      const expensesToKeep = expenses.filter(e => keepGroupIds.has(e.groupId));
      if (expensesToKeep.length !== expenses.length) {
        setExpenses(expensesToKeep);
      }
    }
  }, [groups, expenses]);

  `;

app = app.slice(0, insertPoint) + codeToInsert + app.slice(insertPoint);

fs.writeFileSync('src/App.tsx', app);
