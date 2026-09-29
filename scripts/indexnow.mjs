import { readFileSync } from "node:fs";

const HOST = "mathe-testen.de";
const KEY = "c62ac105c9384e18bbde8444dd0c3d4a";
const KEY_LOCATION = `https://${HOST}/${KEY}.txt`;

function sitemapUrls() {
  const xml = readFileSync(new URL("../sitemap.xml", import.meta.url), "utf8");
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
}

async function waitForKey() {
  const deadline = Date.now() + 5 * 60 * 1000;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(KEY_LOCATION, { cache: "no-store" });
      const body = (await response.text()).trim();
      if (response.ok && body === KEY) {
        return;
      }
    } catch {
      // Deploy ist noch nicht fertig.
    }
    await new Promise((resolve) => setTimeout(resolve, 10000));
  }
  throw new Error("Schlüsseldatei ist noch nicht erreichbar.");
}

if (process.argv.includes("--wait")) {
  await waitForKey();
}

const urlList = sitemapUrls();
const response = await fetch("https://api.indexnow.org/indexnow", {
  method: "POST",
  headers: { "Content-Type": "application/json; charset=utf-8" },
  body: JSON.stringify({
    host: HOST,
    key: KEY,
    keyLocation: KEY_LOCATION,
    urlList,
  }),
});

if (response.status !== 200 && response.status !== 202) {
  const text = await response.text();
  throw new Error(`IndexNow ${response.status}: ${text}`);
}

console.log(`IndexNow hat ${urlList.length} Adressen angenommen (${response.status}).`);
