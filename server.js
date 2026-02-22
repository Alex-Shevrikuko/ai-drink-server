import dotenv from "dotenv";
dotenv.config();

import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();

app.use(cors({
  origin: [
    "https://kakvopiq.free.bg",
    "http://kakvopiq.free.bg"
  ],
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type"]
}));

app.use(express.json());
app.use(express.static("public"));

function safeParseJSON(text) {
  try { return JSON.parse(text); } catch { return null; }
}

app.post("/ask", async (req, res) => {
  try {
    const prompt = (req.body?.prompt || "").toString().trim();
    if (!prompt) {
      return res.json({ type: "unknown", description: "Не е напитка или неизвестно." });
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + process.env.OPENAI_API_KEY
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        temperature: 0.2,
        messages: [
          {
            role: "system",
            content: `
Ти проверяваш дали въведеният текст е НАПИТКА.

Правила:
1) Ако НЕ е напитка или не си сигурен → върни САМО:
{"type":"unknown","description":"Не е напитка или неизвестно."}

2) Ако Е напитка → върни САМО:
{"type":"drink","rating":1,"label":"Внимавай","description":"кратко обяснение на български"}
rating е 1-5, label е точно "Добро" или "Внимавай".

Върни САМО JSON. Без допълнителен текст.
            `.trim()
          },
          { role: "user", content: prompt }
        ]
      })
    });

    const data = await response.json();

    const aiText = data?.choices?.[0]?.message?.content?.trim();
    if (!aiText) {
      console.log("OPENAI RESPONSE (bad):", data);
      return res.json({ type: "unknown", description: "Не е напитка или неизвестно." });
    }

    let parsed = safeParseJSON(aiText);
    if (!parsed || !parsed.type) {
      console.log("BAD AI TEXT:", aiText);
      parsed = { type: "unknown", description: "Не е напитка или неизвестно." };
    }

    // нормализация
    if (parsed.type === "drink") {
      parsed.rating = Math.min(5, Math.max(1, Number(parsed.rating) || 3));
      parsed.label = parsed.label === "Добро" ? "Добро" : "Внимавай";
      parsed.description = (parsed.description || "").toString();
    } else {
      parsed = { type: "unknown", description: "Не е напитка или неизвестно." };
    }

    return res.json(parsed);

  } catch (err) {
    console.log("SERVER ERROR:", err);
    return res.status(500).json({ type: "unknown", description: "Не е напитка или неизвестно." });
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log("Server started on port " + PORT));
