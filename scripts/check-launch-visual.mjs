import { existsSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { spawn } from "node:child_process";

const launchUrl = process.env.LAUNCH_VISUAL_URL || "http://127.0.0.1:3000/launch";
const outputDir =
  process.env.LAUNCH_VISUAL_OUT_DIR || path.join(tmpdir(), "specpilot-launch-visual");
const viewports = [
  { name: "desktop", width: 1440, height: 1000, mobile: false },
  { name: "mobile", width: 390, height: 844, mobile: true },
];

const chromeCandidates = [
  process.env.CHROME_PATH,
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/Applications/Chromium.app/Contents/MacOS/Chromium",
  "google-chrome",
  "google-chrome-stable",
  "chromium",
  "chromium-browser",
].filter((candidate) => {
  if (!candidate) {
    return false;
  }
  return path.isAbsolute(candidate) ? existsSync(candidate) : true;
});

function createChromeProcess() {
  const userDataDir = path.join(tmpdir(), `specpilot-launch-visual-${process.pid}`);
  const args = [
    "--headless=new",
    "--disable-gpu",
    "--hide-scrollbars",
    "--remote-debugging-port=0",
    `--user-data-dir=${userDataDir}`,
    "about:blank",
  ];

  for (const candidate of chromeCandidates) {
    try {
      const child = spawn(candidate, args, { stdio: ["ignore", "ignore", "pipe"] });
      return { child, userDataDir };
    } catch {
      // Try the next candidate.
    }
  }

  throw new Error(
    "Chrome executable not found. Set CHROME_PATH to run the launch visual check.",
  );
}

function waitForBrowserWebSocket(child) {
  return new Promise((resolve, reject) => {
    let stderr = "";
    const timeout = setTimeout(() => {
      reject(new Error(`Timed out waiting for Chrome DevTools. stderr:\n${stderr}`));
    }, 15_000);

    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
      const match = stderr.match(/DevTools listening on (ws:\/\/[^\s]+)/);
      if (match) {
        clearTimeout(timeout);
        resolve(match[1]);
      }
    });

    child.on("error", (error) => {
      clearTimeout(timeout);
      reject(error);
    });

    child.on("exit", (code) => {
      if (code !== null && code !== 0) {
        clearTimeout(timeout);
        reject(new Error(`Chrome exited before DevTools started. code=${code}`));
      }
    });
  });
}

function connectCdp(wsUrl) {
  const ws = new WebSocket(wsUrl);
  let nextId = 1;
  const pending = new Map();

  ws.addEventListener("message", (message) => {
    const payload = JSON.parse(message.data);
    if (!payload.id || !pending.has(payload.id)) {
      return;
    }
    const { resolve, reject } = pending.get(payload.id);
    pending.delete(payload.id);
    if (payload.error) {
      reject(new Error(JSON.stringify(payload.error)));
      return;
    }
    resolve(payload.result);
  });

  const ready = new Promise((resolve, reject) => {
    ws.addEventListener("open", resolve, { once: true });
    ws.addEventListener("error", reject, { once: true });
  });

  function send(method, params = {}) {
    const id = nextId;
    nextId += 1;
    ws.send(JSON.stringify({ id, method, params }));
    return new Promise((resolve, reject) => {
      pending.set(id, { resolve, reject });
    });
  }

  return { ws, ready, send };
}

async function waitFor(send, expression, timeoutMs = 20_000) {
  const startedAt = Date.now();
  while (Date.now() - startedAt < timeoutMs) {
    const result = await send("Runtime.evaluate", {
      expression,
      returnByValue: true,
    });
    if (result.result.value) {
      return;
    }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  throw new Error(`Timed out waiting for expression: ${expression}`);
}

async function openPageTarget(browserWsUrl) {
  const browser = connectCdp(browserWsUrl);
  await browser.ready;
  const target = await browser.send("Target.createTarget", { url: "about:blank" });
  browser.ws.close();

  const browserUrl = new URL(browserWsUrl);
  const list = await fetch(`http://${browserUrl.host}/json/list`).then((response) =>
    response.json(),
  );
  const page = list.find((item) => item.id === target.targetId);
  if (!page?.webSocketDebuggerUrl) {
    throw new Error("Unable to create Chrome page target.");
  }
  return page.webSocketDebuggerUrl;
}

async function checkViewport(pageWsUrl, viewport) {
  const page = connectCdp(pageWsUrl);
  await page.ready;
  await page.send("Page.enable");
  await page.send("Runtime.enable");
  await page.send("Emulation.setDeviceMetricsOverride", {
    width: viewport.width,
    height: viewport.height,
    deviceScaleFactor: 1,
    mobile: viewport.mobile,
  });

  await page.send("Page.navigate", { url: launchUrl });
  await waitFor(page.send, "document.readyState === 'complete'");
  await waitFor(page.send, "!!document.querySelector('.launchPublicHero')");
  await new Promise((resolve) => setTimeout(resolve, 500));

  const audit = await page.send("Runtime.evaluate", {
    returnByValue: true,
    expression: `(() => {
      const viewportWidth = document.documentElement.clientWidth;
      const hero = document.querySelector(".launchPublicHero");
      const title = document.querySelector(".launchPublicHeroContent h1");
      const primary = document.querySelector(".launchPublicActions .primaryButton");
      const secondary = document.querySelector(".launchPublicActions .secondaryLaunchButton");
      const pills = [...document.querySelectorAll(".launchPublicPills .pill")];
      const sharePack = document.querySelector(".launchSharePack");
      const shareButtons = [...document.querySelectorAll(".launchSharePackActions button")];
      const shareLinks = [...document.querySelectorAll(".launchSharePackActions a")];
      const stickyBar = document.querySelector(".launchStickyConversionBar");
      const stickyLinks = [...document.querySelectorAll(".launchStickyConversionBar a")];
      const inspect = (el) => {
        if (!el) return null;
        const rect = el.getBoundingClientRect();
        return {
          text: (el.textContent || "").trim().replace(/\\s+/g, " ").slice(0, 80),
          left: Math.round(rect.left),
          right: Math.round(rect.right),
          width: Math.round(rect.width),
          height: Math.round(rect.height),
          clientWidth: el.clientWidth,
          scrollWidth: el.scrollWidth,
          visible: rect.width > 0 && rect.height > 0,
        };
      };
      const heroNodes = [hero, title, primary, secondary, ...pills].filter(Boolean);
      const overflows = heroNodes
        .map((el) => ({ tag: el.tagName.toLowerCase(), className: el.className, ...inspect(el) }))
        .filter((item) =>
          item.left < -1 ||
          item.right > viewportWidth + 1 ||
          item.scrollWidth > item.clientWidth + 1
        );
      const shareActionNodes = [sharePack, ...shareButtons, ...shareLinks].filter(Boolean);
      const shareOverflows = shareActionNodes
        .map((el) => ({ tag: el.tagName.toLowerCase(), className: el.className, ...inspect(el) }))
        .filter((item) =>
          item.left < -1 ||
          item.right > viewportWidth + 1 ||
          item.scrollWidth > item.clientWidth + 1
        );
      const stickyOverflows = [stickyBar, ...stickyLinks]
        .filter(Boolean)
        .map((el) => ({ tag: el.tagName.toLowerCase(), className: el.className, ...inspect(el) }))
        .filter((item) =>
          item.left < -1 ||
          item.right > viewportWidth + 1 ||
          item.scrollWidth > item.clientWidth + 1
        );
      const failures = [];
      if (document.documentElement.scrollWidth > viewportWidth + 1) {
        failures.push("document-horizontal-overflow");
      }
      if (!title || !inspect(title).visible) failures.push("missing-hero-title");
      if (!primary || !inspect(primary).visible) failures.push("missing-primary-cta");
      if (!secondary || !inspect(secondary).visible) failures.push("missing-secondary-cta");
      if (pills.length < 3) failures.push("missing-proof-pills");
      if (overflows.length > 0) failures.push("hero-node-overflow");
      if (!sharePack || !inspect(sharePack).visible) failures.push("missing-share-pack");
      if (shareButtons.length < 4) failures.push("missing-share-pack-buttons");
      if (shareLinks.length < 2) failures.push("missing-share-pack-links");
      if (shareOverflows.length > 0) failures.push("share-pack-overflow");
      if (!stickyBar || !inspect(stickyBar).visible) failures.push("missing-sticky-conversion");
      if (stickyLinks.length < 3) failures.push("missing-sticky-conversion-links");
      if (stickyOverflows.length > 0) failures.push("sticky-conversion-overflow");
      return {
        viewportWidth,
        documentScrollWidth: document.documentElement.scrollWidth,
        title: inspect(title),
        primary: inspect(primary),
        secondary: inspect(secondary),
        pillCount: pills.length,
        overflows,
        shareButtonCount: shareButtons.length,
        shareLinkCount: shareLinks.length,
        shareOverflows,
        stickyLinkCount: stickyLinks.length,
        stickyOverflows,
        failures,
      };
    })()`,
  });

  const screenshot = await page.send("Page.captureScreenshot", {
    format: "png",
    clip: { x: 0, y: 0, width: viewport.width, height: viewport.height, scale: 1 },
  });
  const screenshotPath = path.join(outputDir, `launch-${viewport.name}.png`);
  writeFileSync(screenshotPath, Buffer.from(screenshot.data, "base64"));
  page.ws.close();

  return {
    viewport: viewport.name,
    screenshotPath,
    ...audit.result.value,
  };
}

async function main() {
  mkdirSync(outputDir, { recursive: true });
  const { child, userDataDir } = createChromeProcess();
  try {
    const browserWsUrl = await waitForBrowserWebSocket(child);
    const pageWsUrl = await openPageTarget(browserWsUrl);
    const results = [];
    for (const viewport of viewports) {
      results.push(await checkViewport(pageWsUrl, viewport));
    }

    const failed = results.filter((result) => result.failures.length > 0);
    console.log(JSON.stringify({ launchUrl, outputDir, results }, null, 2));
    if (failed.length > 0) {
      process.exitCode = 1;
    }
  } finally {
    if (!child.killed) {
      child.kill("SIGTERM");
    }
    await new Promise((resolve) => {
      child.once("exit", resolve);
      setTimeout(resolve, 2_000);
    });
    for (let attempt = 0; attempt < 3; attempt += 1) {
      try {
        rmSync(userDataDir, { recursive: true, force: true });
        break;
      } catch {
        await new Promise((resolve) => setTimeout(resolve, 250));
      }
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
