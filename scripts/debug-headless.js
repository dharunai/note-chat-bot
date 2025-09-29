import { spawn } from 'child_process';
import { chromium } from 'playwright';

const DEV_COMMAND = 'npm run dev';
const DEV_READY_SIGNAL = '➜  Local:';
const DEV_PORT = 5000;
const DEV_HOST = '127.0.0.1';
const BASE_URL = `http://${DEV_HOST}:${DEV_PORT}`;

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function startDevServer() {
  return new Promise((resolve, reject) => {
    const child = spawn(DEV_COMMAND, {
      shell: true,
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    const logs = [];

    const handleOutput = (data) => {
      const text = data.toString();
      logs.push(text);
      process.stdout.write(text);
      if (text.includes(DEV_READY_SIGNAL)) {
        resolve({ child, logs });
      }
    };

    child.stdout.on('data', handleOutput);
    child.stderr.on('data', handleOutput);

    child.on('error', (error) => {
      reject(error);
    });
  });
}

async function captureConsole(url = BASE_URL) {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  const consoleLogs = [];
  const errors = [];

  page.on('console', (msg) => {
    const type = msg.type();
    const text = msg.text();
    consoleLogs.push({ type, text });
    const printable = `[console.${type}] ${text}`;
    console.log(printable);
  });

  page.on('pageerror', (err) => {
    errors.push(err);
    console.error('[pageerror]', err);
  });

  await page.goto(url, { waitUntil: 'networkidle' });

  const screenshotPath = new URL('../attached_assets/debug-homepage.png', import.meta.url).pathname;
  await page.screenshot({ path: screenshotPath, fullPage: true }).catch((err) => {
    console.warn('Failed to capture screenshot:', err.message);
  });

  await browser.close();

  return { consoleLogs, errors, screenshotPath };
}

async function main() {
  const { child } = await startDevServer();
  // Give the dev server a moment to finish eager compilation.
  await wait(1000);

  try {
    const result = await captureConsole();
    console.log('\nCaptured console logs:', JSON.stringify(result.consoleLogs, null, 2));
    if (result.errors.length > 0) {
      console.log('\nPage errors:');
      for (const err of result.errors) {
        console.log(err.stack || err.message);
      }
    }
    console.log(`\nScreenshot saved to: ${result.screenshotPath}`);
  } catch (error) {
    console.error('Failed to capture console output:', error);
  } finally {
    child.kill('SIGTERM');
    await wait(500);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
