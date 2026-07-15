const { GoogleGenAI, Type } = require('@google/genai');

/**
 * Gemini AI Receipt Scanner Service
 */

async function parseReceipt(imageBase64, mimeType) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    console.warn('WARNING: GEMINI_API_KEY is not set in environment. Returning fallback mock receipt data.');
    return {
      merchantName: 'Puregold Supermarket',
      totalAmountCentavos: 185000, // ₱1,850.00
      category: 'groceries',
      description: 'Puregold weekly grocery run'
    };
  }

  const ai = new GoogleGenAI({ apiKey });

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          inlineData: {
            mimeType: mimeType || 'image/jpeg',
            data: imageBase64
          }
        },
        'Parse this receipt or invoice image and extract the merchant or store name, total amount, category, and a short description.'
      ],
      config: {
        systemInstruction: `Parse this receipt or invoice image and extract:
1. The merchant or store name.
2. The original currency and original total amount.
3. The converted total amount of the receipt in PHP centavos (represented in PHP centavos, i.e., convert any non-PHP currency to PHP using a recent exchange rate, e.g., 1 USD ≈ 58 PHP, 1 SGD ≈ 43 PHP, then multiply by 100 and round to an integer).
4. The category of the receipt (must be one of: 'rent', 'utilities', 'groceries', 'other').
5. A short descriptive summary (e.g. "Dinner at Boracay Grill"). If the receipt was in a foreign currency, append the original amount and currency to the description, like: "Dinner at Boracay Grill (Converted from $10.00 USD)".`,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            merchantName: { type: Type.STRING },
            totalAmountCentavos: { type: Type.INTEGER },
            category: { type: Type.STRING, enum: ['rent', 'utilities', 'groceries', 'other'] },
            description: { type: Type.STRING }
          },
          required: ['merchantName', 'totalAmountCentavos', 'category', 'description']
        }
      }
    });

    const parsed = JSON.parse(response.text);
    return parsed;
  } catch (err) {
    console.error('Error invoking Gemini API:', err.message);
    throw new Error(`Failed to parse receipt with AI: ${err.message}`);
  }
}

async function analyzeReceiptText(description, groupMembersCount, userName) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey === "PASTE_YOUR_GEMINI_API_KEY_HERE" || !apiKey.trim()) {
    throw new Error("GEMINI_API_KEY is not set or is invalid");
  }

  const ai = new GoogleGenAI({ 
    apiKey,
    httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
  });

  const memberContext = groupMembersCount ? `\n\nContext: The group has ${groupMembersCount} total members (including the user ${userName || "User"}).` : "";

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Analyze this expense description and extract the relevant details. \nUser Name (the person submitting this): "${userName || "User"}"\nDescription: "${description}"${memberContext}`, 
      config: {
        systemInstruction: `You are an advanced expense parsing assistant for a bill splitting app.\n- You MUST analyze the number of foods/items, costs, and people mentioned.\n- Differentiate multiple orders/bills and list them separately as individual expenses. For example, if 3 foods are described alongside their costs and the person that paid, output 3 separate expense items in the 'expenses' array.\n- Understand context on a deeper level. For example, if the user says "friend not in the group", understand that they are referring to a friend (e.g. naming them "Friend") who owes money, not just repeating the exact phrase.\n- You must know whether the person being declared is the user or a different person. Use the provided User Name to distinguish 'You' from others. If the name matches the User Name closely, use 'You'.\n- The 'payer' is the one who paid the bill (default to 'You' if the user paid).\n- Any name or person mentioned MUST be listed following the standard format for proper nouns (capitalize the first letter, e.g. "Alex", "John", "Friend").\n- For each expense, provide the total amount, expense type, payer, and the exact splits (who owes the payer and how much).`, 
        responseMimeType: "application/json",
        responseSchema: {
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
        }
      }
    });

    const text = response.text;
    if (text) {
      return JSON.parse(text.trim());
    } else {
      throw new Error("Failed to generate content");
    }
  } catch (error) {
    console.error("Gemini API call failed:", error.message || error);
    throw error;
  }
}

module.exports = {
  parseReceipt,
  analyzeReceiptText
};
