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
            content: content: `
Ти оценяваш САМО напитки.

Правила:

1. Ако текстът НЕ е напитка или не си сигурен →
{"type":"unknown","description":"Не е напитка или неизвестно."}

2. Ако текстът Е напитка → върни ТОЧНО:

{
"type":"drink",
"rating": число от 1 до 5,
"label":"Добро" или "Лошо",
"labelClass":"good" или "bad",
"description":"кратко обяснение на български (1 изречение)"
}

labelClass:
- "good" ако напитката е здравословна
- "bad" ако е нездравословна

3. НИКОГА не описвай обекти, които НЕ са напитки.
4. Върни САМО JSON. Без допълнителен текст.

Примери:
"вода" → good
"кола" → bad
"баница" → unknown
`
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







