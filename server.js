import express from "express";
import cors from "cors";
import OpenAI from "openai";

const app = express();
app.use(cors());
app.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

app.post("/ask", async (req, res) => {
  try {
    const drink = req.body.drink;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "Ти си експерт по напитки и здраве." },
        { role: "user", content: `Колко е здравословна напитката ${drink}? Отговори кратко.` }
      ]
    });

    res.json({ reply: completion.choices[0].message.content });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "AI грешка" });
  }
});

app.listen(3000, () => console.log("Server running"));
