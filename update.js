const fs = require('fs');
const fetch = require('node-fetch'); // npm install node-fetch@2

const INPUT_URL = 'https://cors-proxy.cooks.fyi/https://vishwas-oppu.vercel.app/play.m3u8?id=383034';
const OUTPUT_FILE = 'star_pravah_hd.m3u8';
const PROXY_PREFIX = 'https://cors-proxy.cooks.fyi/';
const AUTH_TOKEN = process.env.AUTH_TOKEN;

async function updatePlaylist() {
  try {
    const res = await fetch(INPUT_URL, {
      headers: {
        'Authorization': `Bearer ${AUTH_TOKEN}`
      }
    });

    console.log("HTTP Status:", res.status, res.statusText);

    if (!res.ok) {
      throw new Error(`Failed to fetch playlist: ${res.status} ${res.statusText}`);
    }

    const original = await res.text();
    console.log("Fetched playlist length:", original.length);

    if (!original || original.trim().length === 0) {
      console.error("❌ Playlist is empty. Aborting update.");
      return;
    }

    const lines = original.split(/\r?\n/);

    // Prefix .ts segments with proxy only if not already prefixed
    const updatedLines = lines.map(line => {
      line = line.trim();
      if (line.endsWith('.ts') && !line.startsWith(PROXY_PREFIX)) {
        return PROXY_PREFIX + line;
      }
      return line;
    });

    // Only write file if .ts segments actually changed
    let oldContent = "";
    if (fs.existsSync(OUTPUT_FILE)) {
      oldContent = fs.readFileSync(OUTPUT_FILE, 'utf8');
    }

    const oldSegments = oldContent
      .split(/\r?\n/)
      .filter(l => l.endsWith('.ts'))
      .map(l => l.trim());

    const newSegments = updatedLines
      .filter(l => l.endsWith('.ts'))
      .map(l => l.trim());

    if (JSON.stringify(oldSegments) !== JSON.stringify(newSegments)) {
      fs.writeFileSync(OUTPUT_FILE, updatedLines.join('\n'), 'utf8');
      console.log(`✅ Playlist updated and written to ${OUTPUT_FILE}`);
      console.log(`Segments: +${newSegments.length - oldSegments.length} -${oldSegments.length - newSegments.length}`);
    } else {
      console.log("ℹ️ No .ts segment changes detected. File not updated.");
    }

  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

updatePlaylist();
