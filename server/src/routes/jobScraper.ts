import express, { Router, Request, Response } from "express";
import { chromium } from "playwright";

const router: Router = express.Router();

// 修正類型問題，讓回傳值是 `Promise<void>`
const scrapeJobPost = async (req: Request, res: Response): Promise<void> => {
  const { url } = req.query;

  if (!url || typeof url !== "string") {
    res.status(400).json({ error: "Missing or invalid URL" });
    return;
  }

  try {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: "domcontentloaded" });

    const jobTitle = await page.textContent("h1").catch(() => "No title found");
    const jobDescription = await page
      .textContent(".job-description")
      .catch(() => "No description found");

    await browser.close();

    // **這裡不要 return，避免回傳 `Promise<Response>`**
    res.json({
      jobTitle: jobTitle?.trim(),
      jobDescription: jobDescription?.trim(),
    });
  } catch (error) {
    console.error("Error scraping job post:", error);
    res.status(500).json({ error: "Failed to scrape job post" });
  }
};

// **這裡直接傳遞函式，不要加 `()`**
router.get("/scrape", scrapeJobPost);

export default router;
