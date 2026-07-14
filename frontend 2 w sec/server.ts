import express from "express";
import path from "path";
import { GoogleGenAI, Type } from "@google/genai";
import rateLimit from "express-rate-limit";
import helmet from "helmet";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // ── Security headers (CSP, X-Frame-Options, X-Content-Type-Options, etc.) ──
  app.use(
    helmet({
      // Relax CSP enough for Vite HMR in dev; tighten in production
      contentSecurityPolicy: process.env.NODE_ENV === "production",
    })
  );

  // ── Body size limit — prevents oversized payload abuse ──
  app.use(express.json({ limit: "10kb" }));

  // ── Rate limiter for the AI endpoint — 20 requests / minute per IP ──
  const analyzeLimiter = rateLimit({
    windowMs: 60_000,       // 1 minute window
    max: 20,                // max 20 calls per window
    standardHeaders: true,  // include RateLimit-* headers in response
    legacyHeaders: false,
    message: { error: "Too many requests. Please wait a moment and try again." },
  });

  // ── API routes FIRST ──
  app.post("/api/analyze-receipt", analyzeLimiter, async (req, res) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: "Service is not configured correctly." });
      }

      // ── Input validation & sanitization ──
      const rawDescription    = req.body?.description;
      const rawGroupMembers   = req.body?.groupMembersCount;
      const rawUserName       = req.body?.userName;

      if (typeof rawDescription !== "string" || rawDescription.trim().length === 0) {
        return res.status(400).json({ error: "Description is required." });
      }

      // Strip characters that could be used for prompt injection, enforce length cap
      const sanitize = (value: unknown, maxLen: number): string => {
        if (typeof value !== "string") return "";
        return value
          .slice(0, maxLen)
          .replace(/[`"\\]/g, "'")   // neutralise quote/escape characters
          .replace(/\r?\n/g, " ")    // collapse newlines to spaces
          .trim();
      };

      const description       = sanitize(rawDescription, 500);
      const userName          = sanitize(rawUserName, 60);
      const groupMembersCount = typeof rawGroupMembers === "number"
        ? Math.max(1, Math.min(rawGroupMembers, 500))   // clamp 1–500
        : undefined;

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: { headers: { "User-Agent": "aistudio-build" } },
      });

      const memberContext = groupMembersCount
        ? `\n\nContext: The group has ${groupMembersCount} total members (including the user ${userName || "User"}).`
        : "";

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
                          amountOwed: { type: Type.NUMBER, description: "The amount this person owes the payer" },
                        },
                        required: ["person", "amountOwed"],
                      },
                    },
                  },
                  required: ["title", "totalAmount", "expenseType", "payer", "splits"],
                },
              },
            },
            required: ["expenses"],
          },
        },
      });

      const text = response.text;
      if (text) {
        res.json(JSON.parse(text.trim()));
      } else {
        res.status(500).json({ error: "Failed to generate content. Please try again." });
      }
    } catch (error: any) {
      // Log full details server-side for debugging — never expose to client
      console.error("Error analyzing receipt:", error);

      // Return a safe, generic message to the client
      if (error?.status === 429 || error?.code === 429) {
        return res.status(429).json({ error: "AI service is busy. Please try again in a moment." });
      }
      res.status(500).json({ error: "An error occurred processing your request. Please try again." });
    }
  });

  // ── Vite middleware for development ──
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*all", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  // ── Bind to localhost in dev, all interfaces in production ──
  const host = process.env.NODE_ENV === "production" ? "0.0.0.0" : "127.0.0.1";
  app.listen(PORT, host, () => {
    console.log(`Server running on http://${host}:${PORT}`);
  });
}

startServer();
