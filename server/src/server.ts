import express from "express";
import type { Request, Response } from "express";
import OpenAI from "openai";
import cors from "cors";
import dotenv from "dotenv";
import * as docx from "docx";
import fs from "fs";
import { Document, Packer, Paragraph, TextRun } from "docx";
import path from "path";
import { fileURLToPath } from "url";

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
  const { cvContent } = req.body;

  if (!jobDescription) {
    res.status(400).json({ error: "Job description is required" });
    return;
  }

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a cover letter generator." },
        {
          role: "user",
          content: `Use this job description: ${jobDescription}, and this CV content: ${cvContent}.
find out Applicant name, Position, Company’s name, company mission to fill in the field of the following paragraph:

"My name is [applicant name], I am excited to apply for [ position ] for the [ Company Name]. 
The role aligns perfectly with my skills and aspirations, 
espacially in [ company mission ], an area where I have significant passion.
"

`,
        },
      ],
    });

    res.json(completion.choices[0].message);
    const coverLetterContent = completion.choices[0].message.content || "";

    const applicantNameMatch = coverLetterContent.match(/My name is ([^,]+)/);
    const applicantName = applicantNameMatch
      ? applicantNameMatch[1]
      : "Applicant Name";

    const doc = new Document({
      sections: [
        {
          properties: {},
          children: [
            new Paragraph({
              children: [
                new TextRun({ text: applicantName, bold: true }),
                new TextRun({
                  text: "Foo Bar",
                  bold: true,
                }),
                new TextRun({
                  text: "\tGithub is the best",
                  bold: true,
                }),
                new TextRun(coverLetterContent || "No content generated"),
              ],
            }),
          ],
        },
      ],
    });

    // Used to export the file into a .docx file
    Packer.toBuffer(doc).then((buffer) => {
      fs.writeFileSync("My-Cover-Letter.docx", buffer);
    });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

app.get("/download", (req, res) => {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));

  const filePath = path.join(__dirname, "../My-Cover-Letter.docx");

  // if (!fs.existsSync(filePath)) {
  //   console.error("File is not found:", filePath);
  //   return res.status(404).json({ error: "File not found" });
  // }

  res.download(filePath, "cover-letter.docx", (err) => {
    if (err) {
      console.error("File download failed:", err);
    } else {
      console.log("File downloaded successfully.");
    }
  });
});
