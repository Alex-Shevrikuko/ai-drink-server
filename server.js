import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import path from "path";

const app = express();

app.use(cors());
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
            content: "You are a nutrition assistant that evaluates drinks."
          },
          {
            role: "user",
            content: prompt
          }
        ]
      })
    });

    const data = await response.json();

    res.json({
      answer: data.choices[0].message.content
    });

  } catch (err) {

    console.log(err);

    res.status(500).json({
      error: "AI error"
    });
  }
});


// 👉 използвай PORT от Render
const PORT = process.env.PORT || 10000;

app.listen(PORT, () =>
  console.log("Server started on port " + PORT)
);
