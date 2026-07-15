const fs = require('fs');
let server = fs.readFileSync('server.ts', 'utf8');

server = server.replace(
  'const { description, groupMembersCount } = req.body;',
  'const { description, groupMembersCount, userName } = req.body;'
);

server = server.replace(
  'const memberContext = groupMembersCount ? `\\n\\nContext: The group has ${groupMembersCount} total members (including the user). If the user mentions splitting equally among the group and doesn\'t name everyone, divide the total amount by ${groupMembersCount} and assign the remaining shares to generic names like "Member 2", "Member 3", etc.` : "";',
  'const memberContext = groupMembersCount ? `\\n\\nContext: The group has ${groupMembersCount} total members (including the user ${userName || "User"}).` : "";'
);

server = server.replace(
  'contents: `Analyze this expense description and extract the relevant details. Description: "${description}"${memberContext}`,',
  'contents: `Analyze this expense description and extract the relevant details. \\nUser Name (the person submitting this): "${userName || "User"}"\\nDescription: "${description}"${memberContext}`, '
);

server = server.replace(
  'systemInstruction: "You are an expense parsing assistant for a bill splitting app. The user will provide a description of an expense, sometimes mentioning other people with an \'@\' symbol (e.g. \'@alex\'). You need to extract the total amount, the type of expense (e.g. Food, Grocery, Ride, etc.), and the exact splits. Usually if someone says \'Dinner with @alex for 850, we split equally\', it means the user paid 850 total, and @alex owes them 425. If there are multiple people, distribute accordingly. The \'payer\' is the one who paid the bill (default to \'You\' if not specified otherwise).",',
  'systemInstruction: `You are an advanced expense parsing assistant for a bill splitting app.\\n- You MUST analyze the number of foods/items, costs, and people mentioned.\\n- Differentiate multiple orders/bills and list them separately as individual expenses. For example, if 3 foods are described alongside their costs and the person that paid, output 3 separate expense items in the \'expenses\' array.\\n- Understand context on a deeper level. For example, if the user says "friend not in the group", understand that they are referring to a friend (e.g. naming them "Friend") who owes money, not just repeating the exact phrase.\\n- You must know whether the person being declared is the user or a different person. Use the provided User Name to distinguish \'You\' from others. If the name matches the User Name closely, use \'You\'.\\n- The \'payer\' is the one who paid the bill (default to \'You\' if the user paid).\\n- Any name or person mentioned MUST be listed following the standard format for proper nouns (capitalize the first letter, e.g. "Alex", "John", "Friend").\\n- For each expense, provide the total amount, expense type, payer, and the exact splits (who owes the payer and how much).`, '
);

server = server.replace(
  '          responseSchema: {\n            type: Type.OBJECT,\n            properties: {\n              title: { type: Type.STRING, description: "A short title for this expense (e.g., \'Dinner\', \'Grab Ride\', \'Groceries\')" },\n              totalAmount: { type: Type.NUMBER, description: "The total amount of the bill" },\n              expenseType: { type: Type.STRING, description: "The category/type of the expense (e.g. Food, Ride, Entertainment)" },\n              payer: { type: Type.STRING, description: "The person who paid the bill. Use \'You\' if it\'s the user." },\n              splits: {\n                type: Type.ARRAY,\n                description: "The list of people who owe the payer. If \'You\' paid, these are the people who owe \'You\'. Do not include the payer\'s share in this list, only what others owe the payer.",\n                items: {\n                  type: Type.OBJECT,\n                  properties: {\n                    person: { type: Type.STRING, description: "The name of the person (without the @ symbol)" },\n                    amountOwed: { type: Type.NUMBER, description: "The amount this person owes the payer" }\n                  },\n                  required: ["person", "amountOwed"]\n                }\n              }\n            },\n            required: ["title", "totalAmount", "expenseType", "payer", "splits"]\n          }',
  `          responseSchema: {
            type: Type.OBJECT,
            properties: {
              expenses: {
                type: Type.ARRAY,
                description: "List of individual expenses/bills extracted from the description.",
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING, description: "A short title for this specific expense (e.g., 'Burger', 'Grab Ride', 'Dinner')" },
                    totalAmount: { type: Type.NUMBER, description: "The total amount of this specific bill" },
                    expenseType: { type: Type.STRING, description: "The category/type of the expense (e.g. Food, Ride, Entertainment)" },
                    payer: { type: Type.STRING, description: "The person who paid the bill. Use 'You' if it's the user." },
                    splits: {
                      type: Type.ARRAY,
                      description: "The list of people who owe the payer. Do not include the payer's share in this list.",
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          person: { type: Type.STRING, description: "The name of the person (proper noun format)" },
                          amountOwed: { type: Type.NUMBER, description: "The amount this person owes the payer" }
                        },
                        required: ["person", "amountOwed"]
                      }
                    }
                  },
                  required: ["title", "totalAmount", "expenseType", "payer", "splits"]
                }
              }
            },
            required: ["expenses"]
          }`
);

fs.writeFileSync('server.ts', server);
