import express from "express";
import OpenAI from "openai";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY as string,
});

const app = express();

app.use(express.json());
app.use(cors());

app.listen(3000, () => {
  console.log("Server is running on http://localhost:3000");
});

app.get("/openai", async (req, res) => {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a helpful hr assistant." },
        {
          role: "user",
          content: `tell me the position title and company name of this job description...`,
        },
      ],
    });

    res.json(completion.choices[0].message);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});
