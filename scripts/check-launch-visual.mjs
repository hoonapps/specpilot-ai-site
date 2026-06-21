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
    "--disable-dev-shm-usage",
    "--disable-extensions",
    "--disable-background-networking",
    "--disable-crash-reporter",
    "--disable-setuid-sandbox",
    "--hide-scrollbars",
    "--no-first-run",
    "--no-sandbox",
    "--remote-debugging-port=0",
    `--user-data-dir=${userDataDir}`,
    "about:blank",
  ];

  for (const candidate of chromeCandidates) {
    try {
      const child = spawn(candidate, args, { stdio: ["ignore", "pipe", "pipe"] });
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
    let output = "";
    const timeout = setTimeout(() => {
      reject(new Error(`Timed out waiting for Chrome DevTools. output:\n${output}`));
    }, 45_000);

    function capture(chunk) {
      output += chunk.toString();
      const match = output.match(/DevTools listening on (ws:\/\/[^\s]+)/);
      if (match) {
        clearTimeout(timeout);
        resolve(match[1]);
      }
    }

    child.stdout.on("data", capture);
    child.stderr.on("data", capture);

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

async function exerciseFullPage(send) {
  await send("Runtime.evaluate", {
    awaitPromise: true,
    expression: `new Promise((resolve) => {
      let y = 0;
      const step = Math.max(480, Math.floor(window.innerHeight * 0.72));
      const tick = () => {
        window.scrollTo(0, y);
        y += step;
        if (y <= document.documentElement.scrollHeight + step) {
          setTimeout(tick, 90);
          return;
        }
        window.scrollTo(0, 0);
        setTimeout(resolve, 450);
      };
      tick();
    })`,
  });
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
  await exerciseFullPage(page.send);

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
      const requiredSections = [
        "start-concierge",
        "persona-quiz",
        "setup-compatibility",
        "review-risk",
        "purchase-execution",
        "final-decision",
        "reviewer-quick-card",
        "spec-risk-scanner",
        "candidate-compare",
        "launch-share-pack",
        "launch-action-router",
      ];
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
      const cssPath = (el) => {
        const parts = [];
        let node = el;
        while (node && node.nodeType === 1 && parts.length < 4) {
          const id = node.id ? "#" + node.id : "";
          const className = typeof node.className === "string"
            ? "." + node.className.trim().split(/\\s+/).filter(Boolean).slice(0, 3).join(".")
            : "";
          parts.unshift(node.tagName.toLowerCase() + id + className);
          node = node.parentElement;
        }
        return parts.join(" > ");
      };
      const isVisible = (el) => {
        const rect = el.getBoundingClientRect();
        const style = window.getComputedStyle(el);
        return rect.width > 0 &&
          rect.height > 0 &&
          style.visibility !== "hidden" &&
          style.display !== "none" &&
          Number(style.opacity || "1") > 0.01;
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
      const publicSections = [...document.querySelectorAll(".launchPublicSection")].filter(isVisible);
      const missingSections = requiredSections.filter((id) => !document.getElementById(id));
      const sectionOverflows = publicSections
        .map((el) => ({ path: cssPath(el), ...inspect(el) }))
        .filter((item) => item.left < -1 || item.right > viewportWidth + 1)
        .slice(0, 12);
      const textNodes = [...document.querySelectorAll([
        ".launchPublicSection h1",
        ".launchPublicSection h2",
        ".launchPublicSection h3",
        ".launchPublicSection p",
        ".launchPublicSection li",
        ".launchPublicSection a",
        ".launchPublicSection button",
        ".launchPublicSection label",
        ".launchPublicSection .pill",
        ".launchStickyConversionBar a",
      ].join(","))].filter(isVisible);
      const formControls = [...document.querySelectorAll([
        ".launchPublicSection input",
        ".launchPublicSection select",
        ".launchPublicSection textarea",
      ].join(","))].filter(isVisible);
      const textOverflows = textNodes
        .map((el) => ({ path: cssPath(el), tag: el.tagName.toLowerCase(), ...inspect(el) }))
        .filter((item) => item.scrollWidth > item.clientWidth + 2 || item.left < -1 || item.right > viewportWidth + 1)
        .slice(0, 16);
      const formControlOverflows = formControls
        .map((el) => ({ path: cssPath(el), tag: el.tagName.toLowerCase(), ...inspect(el) }))
        .filter((item) => item.left < -1 || item.right > viewportWidth + 1)
        .slice(0, 16);
      const fullPageOverflowNodes = [...document.body.querySelectorAll("*")]
        .filter(isVisible)
        .map((el) => ({ path: cssPath(el), tag: el.tagName.toLowerCase(), ...inspect(el) }))
        .filter((item) => item.left < -3 || item.right > viewportWidth + 3)
        .slice(0, 16);
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
      if (publicSections.length < 35) failures.push("missing-public-sections");
      if (missingSections.length > 0) failures.push("missing-required-sections");
      if (sectionOverflows.length > 0) failures.push("public-section-overflow");
      if (textOverflows.length > 0) failures.push("public-text-overflow");
      if (formControlOverflows.length > 0) failures.push("public-form-control-overflow");
      if (fullPageOverflowNodes.length > 0) failures.push("full-page-node-overflow");
      return {
        viewportWidth,
        documentScrollWidth: document.documentElement.scrollWidth,
        documentScrollHeight: document.documentElement.scrollHeight,
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
        publicSectionCount: publicSections.length,
        missingSections,
        sectionOverflows,
        textOverflows,
        formControlOverflows,
        fullPageOverflowNodes,
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
