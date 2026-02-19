import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();
const app = express();
app.use(express.json());

// serve frontend
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, "public")));

app.post("/api/checkDrink", async (req, res) => {
  const { drink } = req.body;
  if(!drink) return res.status(400).json({error: "Липсва напитка"});

  try {
    const prompt = `Оцени колко полезна е напитката "${drink}" по скала 1-5, и дай кратко обяснение. Върни JSON: { "rating": число, "label": "Добро/Внимавай/Не е напитка", "description": текст }`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4",
        messages: [{role:"user", content: prompt}],
        max_tokens: 150
      })
    });

    const result = await response.json();
    let text = result.choices[0].message.content;
    let parsed;

    try { parsed = JSON.parse(text); } 
    catch { 
      parsed = { rating: 3, label: "Неизвестно", labelClass: "warning", description: "Не можа да се оцени." }; 
    }

    const labelClass = parsed.label === "Добро" ? "good" : parsed.label === "Внимавай" ? "bad" : "warning";
    res.json({ rating: parsed.rating, label: parsed.label, description: parsed.description, labelClass });

  } catch(err){
    console.error(err);
    res.status(500).json({ error: "Грешка при AI оценката" });
  }
});

app.listen(process.env.PORT || 3000, () => console.log("Server running"));
