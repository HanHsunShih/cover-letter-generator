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
    const completion1 = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a information extractor." },
        {
          role: "user",
          content: `Use this job description: ${jobDescription}, and this CV content: ${cvContent}.
      Find and return the following details in JSON format, 
      
      your response should start with curly braces:
      {
        "applicant_name": "Name",
        "applicant_email": "Email",
        "applicant_phone-number": "Phone number",
        "position": "Job Title",
        "company": "Company Name",
        "company_mission": "Only in one sentence, keep it concise and related to the position user apply, less then 10 words",
        "position_task": "Position's task",
        "related_experience_1": {
        "title": "title",
        "skill": "skills, experiences align with company’s needs",
        "key-achievement": "Key achievement in this experience",
        "relevant-skill-or-experience": "Relevant skill or experience",
        "key-lesson-learned": "Key lessons learned"
        }
        "related_experience_2": {
        "title": "title",
        "background-ability": "skills, experiences from related_experience_2",
        } 
      }`,
        },
      ],
    });

    // 解析 JSON 內容
    const content1 = completion1.choices?.[0]?.message?.content ?? "";
    // console.log("content1: ");
    // console.log(content1);

    const extractedInfo = JSON.parse(content1);
    console.log("extractedInfo: ");
    console.log(extractedInfo);

    // 讓 extractedInfo 確保有值（如果 API 沒返回值則給預設值）
    const applicantName = extractedInfo.applicant_name || "Unknown Name";
    const position = extractedInfo.position || "Unknown Position";
    const company = extractedInfo.company || "Unknown Company";
    const companyMission = extractedInfo.company_mission || "Unknown Mission";

    const firstParagraph = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are going to help me generate the first paragraph of my cover letter.",
        },
        {
          role: "user",
          content: `Here's the extracted information: ${content1}, 
          fill in the field of the paragraph of my cover letter, strictly follow the structure:

          I am excited to apply for [ position ] for the [Company Name]. 
          The role aligns perfectly with my skills and aspirations, 
          espacially in [ company  mission ], a field that strongly interests me. 
          [Company Name]'s focus on [ position task ] resonates with my passion - 
          [ related experience and enthusiasm ], 
          and I am eager to contribute while growing with your team.
           `,
        },
      ],
    });

    const content2 = firstParagraph.choices?.[0].message?.content ?? "";
    console.log("content2: ");
    console.log(content2);

    res.json({ extractedInfo: content1, coverLetter: content2 });

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
            // new Paragraph({
            //   heading: HeadingLevel.HEADING_3, // 設定標題等級
            //   children: [
            //     new TextRun({
            //       text: position, // 文字內容
            //       bold: true, // 設定加粗
            //       font: "Calibri", // 設定字體
            //       allCaps: true,
            //       color: "787D7B", // 設定全大寫
            //     }),
            //   ],
            // }),
            // new Paragraph({}),
            // new Paragraph({
            //   children: [new TextRun({ text: date })],
            // }),
            // new Paragraph({}),
            // new Paragraph({
            //   children: [
            //     new TextRun({
            //       text: `To the hiring team at ${companyName}`,
            //     }),
            //   ],
            // }),
            // new Paragraph({}),
            // new Paragraph({
            //   children: [
            //     new TextRun(coverLetterContent || "No content generated"),
            //     new TextRun({ text: applicantName, bold: true }),
            //     new TextRun({
            //       text: "Foo Bar",
            //       bold: true,
            //     }),
            //     new TextRun({
            //       text: "\tGithub is the best",
            //       bold: true,
            //     }),
            //   ],
            // }),
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
