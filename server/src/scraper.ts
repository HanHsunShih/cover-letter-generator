import { chromium } from "playwright";

async function scrapeJobPost(url: string) {
  const browser = await chromium.launch({ headless: true }); // 無頭模式，適合自動化
  const page = await browser.newPage();

  try {
    await page.goto(url, { waitUntil: "domcontentloaded" });

    // 嘗試抓取 Job Title
    const jobTitle = await page.textContent("h1").catch(() => "No title found");

    // 嘗試抓取 Job Description
    const jobDescription = await page
      .textContent(".job-description")
      .catch(() => "No description found");

    return {
      jobTitle: jobTitle?.trim() || "",
      jobDescription: jobDescription?.trim() || "",
    };
  } catch (error) {
    console.error("Error scraping job post:", error);
    return { jobTitle: "", jobDescription: "" };
  } finally {
    await browser.close(); // 確保不管成功或失敗都關閉瀏覽器
  }
}

// 測試爬取
async function main() {
  const jobData = await scrapeJobPost(
    "https://www.linkedin.com/jobs/search/?currentJobId=4130475248&distance=25.0&geoId=101165590&keywords=Graduate%20Software%20Developer&origin=HISTORY"
  );
  console.log(jobData);
}

main();
