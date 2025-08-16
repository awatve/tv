const fetch = require("node-fetch");
const { writeFileSync } = require("fs");

const SOURCE = "https://freelivtv.xyz/watchindia/gudu.php?id=63544";
const PROXY  = "https://cors-proxy.cooks.fyi/";

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

    writeFileSync("star_pravah_hd.m3u8", lines.join("\n"));
    console.log("✅ star_pravah_hd.m3u8 updated successfully!");
  } catch (err) {
    console.error("❌ Error updating playlist:", err);
    process.exit(1);
  }
}

updateM3U8();
