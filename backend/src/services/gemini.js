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

module.exports = {
  parseReceipt
};
