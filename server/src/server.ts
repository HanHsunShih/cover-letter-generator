import express from "express";
import type { Request, Response } from "express";
import OpenAI from "openai";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const PORT = process.env.PORT || 3000;

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY as string,
});
const app = express();

app.use(express.json());
app.use(cors());

app.listen(PORT, () => {
  console.log(`Server is running on ${PORT}`);
});

app.get("/", (req, res) => {
  res.send("Welcome to my API");
});

app.post("/openai", async (req: Request, res: Response) => {
  const { jobDescription } = req.body;

  if (!jobDescription) {
    res.status(400).json({ error: "Job description is required" });
  }

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a helpful HR assistant." },
        {
          role: "user",
          content: `Tell me the position title and company name of this job description: ${jobDescription}`,
        },
      ],
    });

    res.json(completion.choices[0].message);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});
