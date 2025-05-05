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
import knex from "knex";
// knexfile.js
// @ts-ignore
import knexConfig from "../knexfile.js";

dotenv.config();

const PORT = process.env.PORT || 3000;
const db = knex(knexConfig.development);

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

app.post("/generate_count", async (req, res) => {
  try {
    const created_at = new Date();

    // await knex("generate_count").insert({ created_at });
    await db("generate_count").insert({ created_at });
    console.log("🥛knex client:", knexConfig.development.client);

    console.log("🧀 client from knex instance:", db.client.config.client);

    res.status(201).json({ message: "Record inserted" });
  } catch (error) {
    console.log("🐰 client from knex instance:", db.client.config.client);
    console.error("Insert error:", error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

app.post("/openai", async (req: Request, res: Response) => {
  const { jobDescription } = req.body;
  const { cvContent } = req.body;
  const identifyCvContent = cvContent.slice(0, 1000);

  if (!jobDescription) {
    res.status(400).json({ error: "Job description is required" });
    return;
  }

  try {
    const isResume = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "Resume Identifier" },
        {
          role: "user",
          content: `Identify ${identifyCvContent} to see if it is resume, `,
        },
      ],
    });

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
        "applicant_phone_number": "Phone number",
        "position": "Job Title",
        "company": "Company Name",
        "company_mission": "Only in one sentence, keep it concise and related to the position user apply, less then 10 words",
        "position_task": "Position's task",
        "related_experience_1": {
        "title": "title",
        "brief_introduction": "brief introduction of the experience, only in one sentence",
        "skill": "skills, experiences align with company’s needs",
        "key_achievement": "Key achievement in this experience, keep it concise and only in one sentence",
        "relevant_skill": "Relevant skill or experience, keep it concise and only in one sentence",
        "key_lesson_learned": "Key lessons learned, keep it concise and only in one sentence"
        }
        "related_experience_2": {
        "title": "title",
        "background-ability": "skills, experiences from related_experience_2",
        } 
      }`,
        },
      ],
    });

    const extractedInfoJSON = completion1.choices?.[0]?.message?.content ?? "";
    const extractedInfo = JSON.parse(extractedInfoJSON);

    const applicantName = extractedInfo.applicant_name || "Unknown Name";
    const position = extractedInfo.position || "Unknown Position";
    const keyAchievement =
      extractedInfo.related_experience_1.key_achievement ||
      "Unknown Achievement";
    const RelevantSkills =
      extractedInfo.related_experience_1.relevant_skill || "Unknown Skills";
    const LessonsLearned =
      extractedInfo.related_experience_1.key_lesson_learned ||
      "Unknown Learned Lesson";
    const company = extractedInfo.company || "Unknown Company";
    const email = extractedInfo.applicant_email || "Unknown Email";
    const phoneNumber =
      extractedInfo.applicant_phone_number || "Unknown Phone Number";

    const dateObj = new Date();
    const formattedDate = `${dateObj.getDate()}, ${dateObj.toLocaleDateString(
      "en-us",
      { month: "short" }
    )}`;

    const completion2 = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a cover letter generator.",
        },
        {
          role: "user",
          content: `Here's the extracted information: ${extractedInfoJSON}, 
          fill in the field of the paragraph of my cover letter, strictly follow the structure:

          I am excited to apply for [ position ] for the [Company Name]. 
          The role aligns perfectly with my skills and aspirations, 
          espacially in [ company  mission ], a field that strongly interests me. 
          [Company Name]'s focus on [ position task ] resonates with my passion - 
          [ related experience and enthusiasm ], and I am eager to contribute while growing with your team.
           `,
        },
      ],
    });

    const firstParagraoh = completion2.choices?.[0].message?.content ?? "";
    // console.log("firstParagraoh: ");
    // console.log(firstParagraoh);

    const completion3 = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a cover letter generator.",
        },
        {
          role: "user",
          content: `Here's the extracted information: ${extractedInfoJSON},
          fill in the field of the paragraph of my cover letter, strictly follow the structure, end with "includes:", I will manually add bullet point after this:

          I am a [ related_experience_1.title ] who recently [related_experience_1.brief-introduction].
          This experience strengthened my [ related_experience_1.skill] and deepened my passion for solving practical challenges.
          A specific achievement from my previous experience that I believe can add value to the [ position ] at [Company Name] includes:
           `,
        },
      ],
    });

    const secondParagraph = completion3.choices?.[0].message?.content ?? "";

    // console.log("secondParagraph: ");
    // console.log(secondParagraph);

    const completion4 = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a cover letter generator.",
        },
        {
          role: "user",
          content: `Here's the extracted information: ${extractedInfoJSON},
          fill in the field of the paragraph of my cover letter, strictly follow the structure, end with "the company's goal", I will manually add final paragraph:

          My unique background as [related_experience_2.title] has provided me with [related_experience_2.background-ability], 
          which I believe can also contribute to driving the company’s success in achieving the company's goal.
          `,
        },
      ],
    });

    const thirdParagraph = completion4.choices?.[0].message?.content ?? "";

    // console.log("thirdParagraph: ");
    // console.log(thirdParagraph);

    res.json({
      extractedInfo: extractedInfoJSON,
      firstParagraoh: firstParagraoh,
      secondParagraph: secondParagraph,
    });

    const doc = new Document({
      styles: {
        default: {
          document: {
            run: {
              font: "Lato",
              size: 24,
            },
            paragraph: {
              spacing: { after: 200, line: 240 },
            },
          },
        },
      },
      sections: [
        {
          properties: {},
          children: [
            new Paragraph({
              heading: HeadingLevel.HEADING_1,
              spacing: { after: 100 },
              children: [
                new TextRun({
                  text: applicantName,
                  bold: true,
                  color: "000000",
                  size: 44,
                }),
              ],
            }),
            new Paragraph({
              heading: HeadingLevel.HEADING_3,
              children: [
                new TextRun({
                  text: position,
                  bold: true,
                  allCaps: true,
                  color: "787D7B",
                  size: 30,
                }),
              ],
            }),
            new Paragraph({
              children: [new TextRun({ text: formattedDate, font: "Arial" })],
            }),
            new Paragraph({
              children: [
                new TextRun({ break: 1 }),
                new TextRun({
                  text: `To the hiring team at ${company}`,
                }),
              ],
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: firstParagraoh || "No content generated",
                }),
              ],
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: secondParagraph || "No content generated",
                }),
              ],
            }),
            new Paragraph({
              text: keyAchievement,
              bullet: {
                level: 0,
              },
            }),
            new Paragraph({
              text: RelevantSkills,
              bullet: {
                level: 0,
              },
            }),
            new Paragraph({
              text: LessonsLearned,
              bullet: {
                level: 0,
              },
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: thirdParagraph,
                }),
              ],
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: `Please let me know a convenient time to connect—I’m excited to explore how I can contribute to your team’s success.`,
                }),
              ],
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: `Thank you,`,
                }),
              ],
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: applicantName,
                }),
              ],
            }),
            new Paragraph({
              children: [
                new docx.ExternalHyperlink({
                  children: [
                    new TextRun({
                      text: email,
                      style: "Hyperlink",
                    }),
                  ],
                  link: email,
                }),
                new TextRun({
                  text: " ",
                }),
                new TextRun({
                  text: phoneNumber,
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
