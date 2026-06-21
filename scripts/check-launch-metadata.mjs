const baseUrl = (process.env.LAUNCH_METADATA_URL || "http://127.0.0.1:3000").replace(
  /\/$/,
  "",
);

function absolute(path) {
  return new URL(path, baseUrl).toString();
}

async function fetchText(path) {
  const response = await fetch(absolute(path));
  const text = await response.text();
  if (!response.ok) {
    throw new Error(`${path} returned ${response.status}: ${text.slice(0, 160)}`);
  }
  return { response, text };
}

async function fetchBinary(path) {
  const response = await fetch(absolute(path));
  const buffer = Buffer.from(await response.arrayBuffer());
  if (!response.ok) {
    throw new Error(`${path} returned ${response.status}`);
  }
  return { response, buffer };
}

function assertIncludes(name, value, expected) {
  if (!value.includes(expected)) {
    throw new Error(`${name} missing ${expected}`);
  }
}

function metaContent(html, property) {
  const escaped = property.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const patterns = [
    new RegExp(`<meta[^>]+property=["']${escaped}["'][^>]+content=["']([^"']+)["']`, "i"),
    new RegExp(`<meta[^>]+name=["']${escaped}["'][^>]+content=["']([^"']+)["']`, "i"),
    new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']${escaped}["']`, "i"),
  ];
  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match?.[1]) {
      return match[1];
    }
  }
  return "";
}

function linkHref(html, rel) {
  const escaped = rel.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const patterns = [
    new RegExp(`<link[^>]+rel=["']${escaped}["'][^>]+href=["']([^"']+)["']`, "i"),
    new RegExp(`<link[^>]+href=["']([^"']+)["'][^>]+rel=["']${escaped}["']`, "i"),
  ];
  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match?.[1]) {
      return match[1];
    }
  }
  return "";
}

function assertPng(path, response, buffer) {
  const type = response.headers.get("content-type") || "";
  if (!type.includes("image/png")) {
    throw new Error(`${path} expected image/png, got ${type}`);
  }
  const signature = buffer.subarray(0, 8).toString("hex");
  if (signature !== "89504e470d0a1a0a") {
    throw new Error(`${path} is not a PNG`);
  }
  if (buffer.byteLength < 8_000) {
    throw new Error(`${path} PNG is unexpectedly small: ${buffer.byteLength} bytes`);
  }
}

async function checkLaunchHtml() {
  const { text } = await fetchText("/launch");
  assertIncludes("launch html", text, '<html lang="ko"');
  assertIncludes("launch html", text, "컴퓨터 구매 질문에 답부터 주는 AI");
  assertIncludes("launch html", text, "/launch/guide");
  assertIncludes("launch html", text, "application/ld+json");
  assertIncludes("launch json-ld", text, "SoftwareApplication");

  const canonical = linkHref(text, "canonical");
  const ogTitle = metaContent(text, "og:title");
  const ogDescription = metaContent(text, "og:description");
  const ogImage = metaContent(text, "og:image");
  const twitterCard = metaContent(text, "twitter:card");
  const twitterImage = metaContent(text, "twitter:image");

  assertIncludes("canonical", canonical, "/launch");
  assertIncludes("og:title", ogTitle, "SpecPilot AI");
  assertIncludes("og:description", ogDescription, "컴퓨터");
  assertIncludes("og:image", ogImage, "/launch/opengraph-image");
  assertIncludes("twitter:card", twitterCard, "summary_large_image");
  assertIncludes("twitter:image", twitterImage, "/launch/twitter-image");

  return {
    canonical,
    ogTitle,
    ogImage,
    twitterImage,
  };
}

async function checkRobots() {
  const { text } = await fetchText("/robots.txt");
  assertIncludes("robots.txt", text, "User-Agent: *");
  assertIncludes("robots.txt", text, "Allow: /");
  assertIncludes("robots.txt", text, "Disallow: /api/");
  assertIncludes("robots.txt", text, "/sitemap.xml");
}

async function checkSitemap() {
  const { text } = await fetchText("/sitemap.xml");
  for (const path of [
    "/launch",
    "/launch/tools",
    "/launch/guide",
    "/join",
    "/market/desktop-pc",
    "/market/laptop",
  ]) {
    assertIncludes("sitemap.xml", text, path);
  }
}

async function checkManifest() {
  const { response, text } = await fetchText("/manifest.webmanifest");
  const type = response.headers.get("content-type") || "";
  if (!type.includes("manifest") && !type.includes("json")) {
    throw new Error(`manifest expected json content-type, got ${type}`);
  }
  const manifest = JSON.parse(text);
  if (manifest.name !== "SpecPilot AI") {
    throw new Error(`manifest name mismatch: ${manifest.name}`);
  }
  if (manifest.start_url !== "/launch") {
    throw new Error(`manifest start_url mismatch: ${manifest.start_url}`);
  }
  if (!Array.isArray(manifest.icons) || manifest.icons.length < 2) {
    throw new Error("manifest icons are missing");
  }
}

async function checkImages() {
  for (const path of ["/launch/opengraph-image", "/launch/twitter-image"]) {
    const { response, buffer } = await fetchBinary(path);
    assertPng(path, response, buffer);
  }
}

async function main() {
  const launch = await checkLaunchHtml();
  await checkRobots();
  await checkSitemap();
  await checkManifest();
  await checkImages();
  console.log(
    JSON.stringify(
      {
        launchMetadataUrl: baseUrl,
        launch,
        checked: [
          "/launch",
          "/robots.txt",
          "/sitemap.xml",
          "/manifest.webmanifest",
          "/launch/opengraph-image",
          "/launch/twitter-image",
        ],
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error(`launch metadata check failed: ${error.message}`);
  process.exit(1);
});
