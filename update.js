const fs = require('fs');
const fetch = require('node-fetch'); // npm install node-fetch@2

const INPUT_URL = 'https://vishwas-oppu.vercel.app/play.m3u8?id=383034';
const OUTPUT_FILE = 'star_pravah_hd.m3u8';
const PROXY_PREFIX = 'https://cors-proxy.cooks.fyi/';
const AUTH_TOKEN = process.env.AUTH_TOKEN;
const MAX_SEGMENTS = 10; // keep only the last N segments for live update

async function updatePlaylist() {
  try {
    const res = await fetch(INPUT_URL, {
      headers: {
        'Authorization': `Bearer ${AUTH_TOKEN}`,
        'User-Agent': 'Mozilla/5.0'
      },
      redirect: 'follow'
    });

    console.log("HTTP Status:", res.status, res.statusText);

    const original = await res.text();
    console.log("Fetched playlist length:", original.length);

    if (!original || original.trim().length === 0) {
      console.error("❌ Playlist is empty. Aborting update.");
      console.log("===== RAW PLAYLIST START =====");
      console.log(original);
      console.log("===== RAW PLAYLIST END =====");
      return;
    }

    const lines = original.split(/\r?\n/);

    // Extract .ts lines
    const tsLines = lines.filter(l => l.trim().endsWith('.ts'));

    // Keep only last MAX_SEGMENTS
    const lastSegments = tsLines.slice(-MAX_SEGMENTS);

    // Prepare final lines with proxy prefix
    let segmentIndex = 0;
    const finalLines = lines.map(line => {
      const trimmed = line.trim();
      if (trimmed.endsWith('.ts')) {
        const seg = lastSegments[segmentIndex++];
        return seg.startsWith(PROXY_PREFIX) ? seg : PROXY_PREFIX + seg;
      }
      return trimmed;
    });

    // Read old segments to detect changes
    let oldSegments = [];
    if (fs.existsSync(OUTPUT_FILE)) {
      oldSegments = fs.readFileSync(OUTPUT_FILE, 'utf8')
        .split(/\r?\n/)
        .filter(l => l.trim().endsWith('.ts'))
        .map(l => l.trim());
    }

    const newSegments = finalLines
      .filter(l => l.trim().endsWith('.ts'))
      .map(l => l.trim());

    // Compare old vs new
    if (JSON.stringify(oldSegments) !== JSON.stringify(newSegments)) {
      fs.writeFileSync(OUTPUT_FILE, finalLines.join('\n'), 'utf8');
      console.log(`✅ Playlist updated and written to ${OUTPUT_FILE}`);
      console.log(`Segments: +${newSegments.length - oldSegments.length} -${oldSegments.length - newSegments.length}`);
    } else {
      console.log("ℹ️ No new .ts segments. File not updated.");
    }

  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

updatePlaylist();
