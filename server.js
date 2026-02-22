import dotenv from "dotenv";
dotenv.config();
import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import path from "path";

const app = express();

app.use(cors({
  origin: [
    "https://drink.free.bg",
    "http://drink.free.bg"
  ]
}));
app.use(express.json());

// 👉 ТОВА казва на Express да използва public папката
app.use(express.static("public"));


// AI endpoint
app.post("/ask", async (req, res) => {
  try {
    const prompt = req.body.prompt;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + process.env.OPENAI_API_KEY
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `
Ти проверяваш дали въведеният текст е НАПИТКА.

Правила:
1) Ако НЕ е напитка (храна, предмет, животно, място, човек, марка без да е напитка) или не си сигурен → върни САМО:
{"type":"unknown","description":"Не е напитка или неизвестно."}

2) Ако Е напитка → върни САМО:
{"type":"drink","rating":1,"label":"Внимавай","description":"кратко обяснение на български"}
където rating е число 1-5, а label е точно "Добро" или "Внимавай".

Примери:
- "баница" → unknown
- "стол" → unknown
- "вода" → drink
- "кола" → drink

Върни САМО JSON. Без допълнителен текст. Без markdown.
`.trim()
          },
          { role: "user", content: prompt }
        ]
      })
    });

    const data = await response.json();

    // 👇 Виж какво реално връща OpenAI
    console.log("OPENAI RESPONSE:", data);

    if (!data.choices) {
      return res.status(500).json({
        error: "OpenAI error",
        details: data
      });
    }

    const aiText = data.choices[0].message.content;
    const parsed = JSON.parse(aiText);

    res.json(parsed);

  } catch (err) {
    console.log("SERVER ERROR:", err);
    res.status(500).json({ error: "AI error" });
  }
});

// 👉 използвай PORT от Render
const PORT = process.env.PORT || 10000;

app.listen(PORT, () =>
  console.log("Server started on port " + PORT)
);



