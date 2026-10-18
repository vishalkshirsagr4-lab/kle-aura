import fs from "fs";
import path from "path";
import https from "https";

const OUT_DIR = path.resolve("./frontend/public/images/events");
if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

const EVENT_IMAGES = [
  { id: 1, file: "event-1-quiz.jpg", url: "https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?auto=format&fit=crop&w=800&q=80" },
  { id: 2, file: "event-2-dance.jpg", url: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=800&q=80" },
  { id: 3, file: "event-3-pencil-sketch.jpg", url: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80" },
  { id: 4, file: "event-4-gaming.jpg", url: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80" },
  { id: 5, file: "event-5-know-your-number.jpg", url: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=800&q=80" },
  { id: 6, file: "event-6-prabanda.jpg", url: "https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=800&q=80" },
  { id: 7, file: "event-7-rangoli.jpg", url: "https://images.unsplash.com/photo-1561484930-998b6a7b22e8?auto=format&fit=crop&w=800&q=80" },
  { id: 8, file: "event-8-reel-making.jpg", url: "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=800&q=80" },
  { id: 9, file: "event-9-photography.jpg", url: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80" },
  { id: 10, file: "event-10-singing.jpg", url: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=800&q=80" },
  { id: 11, file: "event-11-speech.jpg", url: "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=800&q=80" },
  { id: 12, file: "event-12-mehandi.jpg", url: "https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=800&q=80" },
  { id: 13, file: "event-13-ai-quiz.jpg", url: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=800&q=80" },
  { id: 14, file: "event-14-ai-poster.jpg", url: "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&w=800&q=80" },
  { id: 15, file: "event-15-ai-greeting-card.jpg", url: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=800&q=80" },
  { id: 16, file: "event-16-poetry.jpg", url: "https://images.unsplash.com/photo-1473186578172-c141e6798cf4?auto=format&fit=crop&w=800&q=80" },
  { id: 17, file: "event-17-mono-acting.jpg", url: "https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?auto=format&fit=crop&w=800&q=80" },
  { id: 18, file: "event-18-solo-instrumental.jpg", url: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80" },
];

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return downloadFile(res.headers.location, dest).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`Failed with status ${res.statusCode}`));
      }
      const file = fs.createWriteStream(dest);
      res.pipe(file);
      file.on("finish", () => {
        file.close(() => resolve());
      });
    }).on("error", (err) => {
      fs.unlink(dest, () => {});
      reject(err);
    });
  });
}

async function run() {
  console.log("Fetching professional event images...");
  for (const item of EVENT_IMAGES) {
    const dest = path.join(OUT_DIR, item.file);
    try {
      await downloadFile(item.url, dest);
      const stat = fs.statSync(dest);
      console.log(`[OK] Event ${item.id} -> ${item.file} (${stat.size} bytes)`);
    } catch (e) {
      console.warn(`[WARN] Failed ${item.file}: ${e.message}`);
    }
  }
  console.log("Done fetching images.");
}

run();
