import express from "express";
import path from "path";
import { GoogleGenAI, Type } from "@google/genai";
import backendApp from "./backend/src/server.js";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Mount backend routes
  app.use("/api", backendApp);

  // API routes FIRST
  app.post("/api/analyze-receipt", async (req, res) => {
    try {
      const { description, groupMembersCount, userName } = req.body;
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: "GEMINI_API_KEY is not set" });
      }

      const ai = new GoogleGenAI({ 
        apiKey,
        httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
      });

      const memberContext = groupMembersCount ? `\n\nContext: The group has ${groupMembersCount} total members (including the user ${userName || "User"}).` : "";

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
