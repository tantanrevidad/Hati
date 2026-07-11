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

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

  const prompt = `Parse this receipt or invoice image and extract:
1. The merchant or store name.
2. The total amount of the receipt (represented in PHP centavos, i.e., multiply the decimal price by 100 and round to an integer).
3. The category of the receipt (must be one of: 'rent', 'utilities', 'groceries', 'other').
4. A short descriptive summary (e.g. "Dinner at Boracay Grill").

Return ONLY a JSON object with this schema:
{
  "merchantName": "string",
  "totalAmountCentavos": number,
  "category": "rent | utilities | groceries | other",
  "description": "string"
}
Do NOT wrap the response in markdown blocks. Output raw parseable JSON only.`;

  const payload = {
    contents: [
      {
        parts: [
          { text: prompt },
          {
            inlineData: {
              mimeType: mimeType || 'image/jpeg',
              data: imageBase64
            }
          }
        ]
      }
    ],
    generationConfig: {
      responseMimeType: 'application/json'
    }
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Gemini API returned status ${response.status}: ${errText}`);
    }

    const resData = await response.json();
    if (!resData.candidates || resData.candidates.length === 0) {
      throw new Error('Gemini API returned empty response candidates');
    }

    const rawText = resData.candidates[0].content.parts[0].text;
    
    // Strip markdown formatting if Gemini mistakenly included it
    let cleanText = rawText.trim();
    if (cleanText.startsWith('```')) {
      cleanText = cleanText.replace(/^```json\s*/, '').replace(/\s*```$/, '').trim();
    }

    const parsed = JSON.parse(cleanText);
    
    // Validate schema
    if (!parsed.merchantName || !parsed.totalAmountCentavos || !parsed.category || !parsed.description) {
      throw new Error('Gemini parsed JSON is missing required fields');
    }

    return parsed;
  } catch (err) {
    console.error('Error invoking Gemini API:', err.message);
    throw new Error(`Failed to parse receipt with AI: ${err.message}`);
  }
}

module.exports = {
  parseReceipt
};
