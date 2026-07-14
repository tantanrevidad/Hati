const fs = require('fs');

let dash = fs.readFileSync('src/components/DashboardScreen.tsx', 'utf8');

dash = dash.replace(
  /const isYouPayer = exp\.payer\.toLowerCase\(\) === 'you' \|\| exp\.payer\.toLowerCase\(\) === 'me';/g,
  "const isYouPayer = exp.payer.toLowerCase() === 'you' || exp.payer.toLowerCase() === 'me' || (userName && exp.payer.toLowerCase() === userName.toLowerCase());"
);

dash = dash.replace(
  /const isYouSplit = split\.person\.toLowerCase\(\) === 'you' \|\| split\.person\.toLowerCase\(\) === 'me';/g,
  "const isYouSplit = split.person.toLowerCase() === 'you' || split.person.toLowerCase() === 'me' || (userName && split.person.toLowerCase() === userName.toLowerCase());"
);

dash = dash.replace(
  /return list\.sort\(\(a, b\) => new Date\(b\.date\)\.getTime\(\) - new Date\(a\.date\)\.getTime\(\)\);/g,
  "return list.sort((a, b) => { const timeA = a.date === 'Just now' ? Date.now() : new Date(a.date).getTime(); const timeB = b.date === 'Just now' ? Date.now() : new Date(b.date).getTime(); return timeB - timeA; });"
);

fs.writeFileSync('src/components/DashboardScreen.tsx', dash);

let group = fs.readFileSync('src/components/GroupDetailScreen.tsx', 'utf8');

group = group.replace(
  /const isYouPayer = exp\.payer\.toLowerCase\(\) === 'you' \|\| exp\.payer\.toLowerCase\(\) === 'me';/g,
  "const isYouPayer = exp.payer.toLowerCase() === 'you' || exp.payer.toLowerCase() === 'me' || (userName && exp.payer.toLowerCase() === userName.toLowerCase());"
);

group = group.replace(
  /const isYouSplit = split\.person\.toLowerCase\(\) === 'you' \|\| split\.person\.toLowerCase\(\) === 'me';/g,
  "const isYouSplit = split.person.toLowerCase() === 'you' || split.person.toLowerCase() === 'me' || (userName && split.person.toLowerCase() === userName.toLowerCase());"
);

group = group.replace(
  /const isYouPayer = expense\.payer\.toLowerCase\(\) === 'you' \|\| expense\.payer\.toLowerCase\(\) === 'me';/g,
  "const isYouPayer = expense.payer.toLowerCase() === 'you' || expense.payer.toLowerCase() === 'me' || (userName && expense.payer.toLowerCase() === userName.toLowerCase());"
);

fs.writeFileSync('src/components/GroupDetailScreen.tsx', group);
