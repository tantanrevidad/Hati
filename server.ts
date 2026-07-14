import express from "express";
import path from "path";
import { GoogleGenAI, Type } from "@google/genai";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API routes FIRST
  app.post("/api/analyze-receipt", async (req, res) => {
    try {
      const { description, groupMembersCount } = req.body;
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: "GEMINI_API_KEY is not set" });
      }

      const ai = new GoogleGenAI({ 
        apiKey,
        httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
      });

      const memberContext = groupMembersCount ? `\n\nContext: The group has ${groupMembersCount} total members (including the user). If the user mentions splitting equally among the group and doesn't name everyone, divide the total amount by ${groupMembersCount} and assign the remaining shares to generic names like "Member 2", "Member 3", etc.` : "";

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `Analyze this expense description and extract the relevant details. Description: "${description}"${memberContext}`,
        config: {
          systemInstruction: "You are an expense parsing assistant for a bill splitting app. The user will provide a description of an expense, sometimes mentioning other people with an '@' symbol (e.g. '@alex'). You need to extract the total amount, the type of expense (e.g. Food, Grocery, Ride, etc.), and the exact splits. Usually if someone says 'Dinner with @alex for 850, we split equally', it means the user paid 850 total, and @alex owes them 425. If there are multiple people, distribute accordingly. The 'payer' is the one who paid the bill (default to 'You' if not specified otherwise).",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING, description: "A short title for this expense (e.g., 'Dinner', 'Grab Ride', 'Groceries')" },
              totalAmount: { type: Type.NUMBER, description: "The total amount of the bill" },
              expenseType: { type: Type.STRING, description: "The category/type of the expense (e.g. Food, Ride, Entertainment)" },
              payer: { type: Type.STRING, description: "The person who paid the bill. Use 'You' if it's the user." },
              splits: {
                type: Type.ARRAY,
                description: "The list of people who owe the payer. If 'You' paid, these are the people who owe 'You'. Do not include the payer's share in this list, only what others owe the payer.",
                items: {
                  type: Type.OBJECT,
                  properties: {
                    person: { type: Type.STRING, description: "The name of the person (without the @ symbol)" },
                    amountOwed: { type: Type.NUMBER, description: "The amount this person owes the payer" }
                  },
                  required: ["person", "amountOwed"]
                }
              }
            },
            required: ["title", "totalAmount", "expenseType", "payer", "splits"]
          }
        }
      });

      const text = response.text;
      if (text) {
        res.json(JSON.parse(text.trim()));
      } else {
        res.status(500).json({ error: "Failed to generate content" });
      }
    } catch (error: any) {
      console.error("Error analyzing receipt:", error);
      res.status(500).json({ error: error.message || "Internal server error" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
