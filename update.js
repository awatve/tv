const fs = require('fs');
const fetch = require('node-fetch'); // npm install node-fetch@2

const INPUT_URL = 'https://vishwas-oppu.vercel.app/play.m3u8?id=383034';
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

    if (!res.ok) {
      throw new Error(`Failed to fetch playlist: ${res.status} ${res.statusText}`);
    }

    const original = await res.text();
    const lines = original.split(/\r?\n/);

    const updatedLines = lines.map(line => {
      if (line.trim().endsWith('.ts')) {
        return PROXY_PREFIX + line.trim();
      }
      return line;
    });

    const output = updatedLines.join('\n');

    // Only write file if actual segment list changed
    let oldContent = "";
    if (fs.existsSync(OUTPUT_FILE)) {
      oldContent = fs.readFileSync(OUTPUT_FILE, 'utf8');
    }

    const oldSegments = oldContent.split(/\r?\n/).filter(l => l.endsWith('.ts'));
    const newSegments = updatedLines.filter(l => l.endsWith('.ts'));

    if (JSON.stringify(oldSegments) !== JSON.stringify(newSegments)) {
      fs.writeFileSync(OUTPUT_FILE, output, 'utf8');
      console.log(`✅ Playlist updated and written to ${OUTPUT_FILE}`);
    } else {
      console.log("ℹ️ No segment changes detected. Skipping update.");
    }
  } catch (err) {
    console.error('❌ Error:', err);
    process.exit(1);
  }
}

updatePlaylist();
