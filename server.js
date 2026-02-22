import dotenv from "dotenv";
dotenv.config();

import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

// Helper: safe JSON parse
function safeParseJSON(text) {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

app.post("/ask", async (req, res) => {
  try {
    const userInput = (req.body?.prompt || "").toString().trim();

    if (!userInput) {
      return res.status(400).json({
        type: "unknown",
        description: "Моля, въведете име на напитка."
      });
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + process.env.OPENAI_API_KEY
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        // по-ниска температура = по-стабилен JSON
        temperature: 0.2,
        messages: [
          {
            role: "system",
            content: `
Ти определяш дали въведеният текст е НАПИТКА.

Правила:
- Ако НЕ е напитка или не си сигурен → върни САМО JSON:
{"type":"unknown","description":"Не е напитка или неизвестно."}

- Ако Е напитка → върни САМО JSON:
{"type":"drink","rating":1,"label":"Внимавай","description":"кратко обяснение на български"}
Където rating е 1-5.
label е едно от: "Добро", "Внимавай".

Върни САМО JSON. Без допълнителен текст. Без markdown.
            `.trim()
          },
          {
            role: "user",
            content: userInput
          }
        ]
      })
    });

    const data = await response.json();

    // ако OpenAI върне error
    if (!data?.choices?.[0]?.message?.content) {
      console.log("OPENAI RAW RESPONSE:", data);
      return res.status(500).json({
        type: "unknown",
        description: "Грешка при оценяване на напитката."
      });
    }

    const aiText = data.choices[0].message.content.trim();

    // безопасно парсване
    let parsed = safeParseJSON(aiText);

    // fallback ако AI върне невалиден JSON
    if (!parsed || !parsed.type) {
      console.log("BAD AI TEXT:", aiText);
      parsed = { type: "unknown", description: "Не е напитка или неизвестно." };
    }

    // нормализация
    if (parsed.type === "drink") {
      // гаранции за полетата
      const rating = Number(parsed.rating);
      parsed.rating = Number.isFinite(rating) ? Math.min(5, Math.max(1, rating)) : 3;
      parsed.label = parsed.label === "Добро" ? "Добро" : "Внимавай";
      parsed.description = (parsed.description || "").toString();
    } else {
      parsed.type = "unknown";
      parsed.description = "Не е напитка или неизвестно.";
    }

    return res.json(parsed);

  } catch (err) {
    console.log("SERVER ERROR:", err);
    return res.status(500).json({
      type: "unknown",
      description: "Грешка при оценяване на напитката."
    });
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log("Server started on port " + PORT));
