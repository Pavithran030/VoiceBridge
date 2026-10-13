import puppeteer from 'puppeteer-core';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT_DIR = path.resolve(__dirname, '..');
const CHROME_PATH = fs.existsSync('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe')
  ? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
  : 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

const OUT_DIR = path.resolve(ROOT_DIR, 'docs', 'screenshots');
if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

async function capture() {
  console.log(`Launching browser from: ${CHROME_PATH}`);
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1280,1100'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 1100, deviceScaleFactor: 2 });

  console.log('Navigating to http://localhost:5173...');
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle0' });
  await new Promise((r) => setTimeout(r, 2000));

  // 1. Initial Home Page Screenshot
  console.log('1. Capturing 01_home_initial.png...');
  await page.screenshot({ path: path.join(OUT_DIR, '01_home_initial.png') });

  // 2. Query Answered
  console.log('2. Submitting question: How do I pay semester tuition fees online?');
  const textarea = await page.$('#query-input');
  if (textarea) {
    await textarea.type('How do I pay semester tuition fees online?');
    await page.click('button[type="submit"]');
    // Wait for outcome banner to appear
    await page.waitForSelector('.outcome-banner', { timeout: 10000 });
    await new Promise((r) => setTimeout(r, 1500));
    console.log('Capturing 02_query_answered.png...');
    await page.screenshot({ path: path.join(OUT_DIR, '02_query_answered.png') });
  }

  // 3. Low Confidence / Safe No-Answer Fallback
  console.log('3. Submitting out-of-scope question: What is the distance between the Earth and Mars?');
  await page.evaluate(() => {
    const ta = document.getElementById('query-input');
    if (ta) ta.value = '';
  });
  if (textarea) {
    await textarea.type('What is the distance between the Earth and Mars?');
    await page.click('button[type="submit"]');
    await new Promise((r) => setTimeout(r, 1800));
    console.log('Capturing 03_safe_no_answer_fallback.png...');
    await page.screenshot({ path: path.join(OUT_DIR, '03_safe_no_answer_fallback.png') });
  }

  // 4. Speech Lab Tab
  console.log('4. Navigating to Speech Lab tab...');
  const tabs = await page.$$('.nav-tab');
  if (tabs.length >= 2) {
    await tabs[1].click(); // Speech Lab
    await new Promise((r) => setTimeout(r, 1000));

    // Upload sample audio
    const sampleAudioPath = path.resolve(ROOT_DIR, 'backend', 'sample_audio.wav');
    if (fs.existsSync(sampleAudioPath)) {
      const fileInput = await page.$('input[type="file"]');
      if (fileInput) {
        console.log('Uploading sample_audio.wav to Speech Lab...');
        await fileInput.uploadFile(sampleAudioPath);
        // Wait for charts/canvas to render
        await page.waitForSelector('.canvas-wrapper', { timeout: 15000 });
        await new Promise((r) => setTimeout(r, 2000));
      }
    }
    console.log('Capturing 04_speech_lab_analysis.png...');
    await page.screenshot({ path: path.join(OUT_DIR, '04_speech_lab_analysis.png') });
  }

  // 5. Analytics Tab
  console.log('5. Navigating to Analytics tab...');
  if (tabs.length >= 3) {
    await tabs[2].click(); // Analytics
    await page.waitForSelector('.table-wrapper', { timeout: 10000 });
    await new Promise((r) => setTimeout(r, 1500));
    console.log('Capturing 05_analytics_dashboard.png...');
    await page.screenshot({ path: path.join(OUT_DIR, '05_analytics_dashboard.png') });
  }

  // 6. Model Evaluation Tab
  console.log('6. Navigating to Model Evaluation tab...');
  if (tabs.length >= 4) {
    await tabs[3].click(); // Model Evaluation
    await page.waitForSelector('.table-wrapper', { timeout: 10000 });
    await new Promise((r) => setTimeout(r, 1500));
    console.log('Capturing 06_model_evaluation.png...');
    await page.screenshot({ path: path.join(OUT_DIR, '06_model_evaluation.png') });
  }

  // 7. About & Help Tab
  console.log('7. Navigating to About & Help tab...');
  if (tabs.length >= 5) {
    await tabs[4].click(); // About & Help
    await new Promise((r) => setTimeout(r, 1000));
    console.log('Capturing 07_about_and_syllabus.png...');
    await page.screenshot({ path: path.join(OUT_DIR, '07_about_and_syllabus.png') });
  }

  await browser.close();
  console.log('All screenshots captured successfully in docs/screenshots/');
}

capture().catch((err) => {
  console.error('Error capturing screenshots:', err);
  process.exit(1);
});
