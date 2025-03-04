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
import { HeadingLevel } from "docx";

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

"My name is [applicant name], I am excited to apply for the [ position ] position for [ Company Name]. 
The role aligns perfectly with my skills and aspirations, 
espacially in [ company mission ], an area where I have significant passion.
"
make sure you remove quotation marks at the begining and the end.
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

    const positionMatch = coverLetterContent.match(
      /excited to apply for the ([^,]+) position/
    );
    const position = positionMatch ? positionMatch[1] : "position";

    const date = new Date().toLocaleDateString("en-us", {
      month: "short",
      day: "numeric",
    });

    const companyNameMatch = coverLetterContent.match(
      /position for ([^,]+). The/
    );
    const companyName = companyNameMatch ? companyNameMatch[1] : "Company Name";

    const doc = new Document({
      sections: [
        {
          properties: {},
          children: [
            new Paragraph({
              heading: HeadingLevel.HEADING_1, // 設定標題等級
              children: [
                new TextRun({
                  text: applicantName, // 文字內容
                  bold: true, // 設定加粗
                  font: "Calibri", // 設定字體
                  color: "000000",
                }),
              ],
            }),
            new Paragraph({
              heading: HeadingLevel.HEADING_3, // 設定標題等級
              children: [
                new TextRun({
                  text: position, // 文字內容
                  bold: true, // 設定加粗
                  font: "Calibri", // 設定字體
                  allCaps: true,
                  color: "787D7B", // 設定全大寫
                }),
              ],
            }),
            new Paragraph({}),
            new Paragraph({
              children: [new TextRun({ text: date })],
            }),
            new Paragraph({}),
            new Paragraph({
              children: [
                new TextRun({
                  text: `To the hiring team at ${companyName}`,
                }),
              ],
            }),
            new Paragraph({}),
            new Paragraph({
              children: [
                new TextRun(coverLetterContent || "No content generated"),
                new TextRun({ text: applicantName, bold: true }),
                new TextRun({
                  text: "Foo Bar",
                  bold: true,
                }),
                new TextRun({
                  text: "\tGithub is the best",
                  bold: true,
                }),
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

  res.download(filePath, "cover-letter.docx", (err) => {
    if (err) {
      console.error("File download failed:", err);
    } else {
      console.log("File downloaded successfully.");
    }
  });
});
