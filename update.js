// update.js
const fetch = require("node-fetch");
const { writeFileSync } = require("fs");

const SOURCE = "https://tataplay.slivcdn.com/hls/live/2011749/SABHD/master_3500.m3u8";
const PROXY  = "https://cors-proxy.cooks.fyi/https://tataplay.slivcdn.com/hls/live/2011749/SABHD/";

async function updateM3U8() {
  try {
    const res = await fetch(SOURCE);
    if (!res.ok) throw new Error(`Failed to fetch source: ${res.status}`);
    let text = await res.text();

    const lines = text.split("\n").map(line => {
      if (line.startsWith("#") || line.trim() === "") return line;
      if (line.startsWith("http")) return PROXY + line;
      return PROXY + new URL(line, SOURCE).toString();
    });

    writeFileSync("sony_sab_hd.m3u8", lines.join("\n"));
    console.log("Sony SAB HD");
  } catch (err) {
    console.error("❌ Error updating playlist:", err);
    process.exit(1);
  }
}

updateM3U8();
