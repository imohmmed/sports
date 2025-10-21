import { db } from "./db";
import { channels, channelStreams } from "@shared/schema";
import { encryptUrl } from "./encryption";
import { eq, sql } from "drizzle-orm";

interface ChannelData {
  name: string;
  logoUrl?: string;
  category: "sports" | "news";
  streams: {
    quality: string;
    serverName: string;
    url: string;
  }[];
}

const newsChannels: ChannelData[] = [
  {
    name: "الجزيرة",
    logoUrl: "text",
    category: "news",
    streams: [
      { quality: "FHD", serverName: "main", url: "http://tecflix.vip:80/live/2D9C0C398918689B8650CC3D84FEB4D7/516744.m3u8" },
      { quality: "HD", serverName: "main", url: "http://tecflix.vip:80/live/2D9C0C398918689B8650CC3D84FEB4D7/516745.m3u8" },
      { quality: "LOW", serverName: "main", url: "http://tecflix.vip:80/live/2D9C0C398918689B8650CC3D84FEB4D7/516746.m3u8" },
      { quality: "FHD", serverName: "BK", url: "http://tecflix.vip:80/live/2D9C0C398918689B8650CC3D84FEB4D7/516799.m3u8" },
    ],
  },
  {
    name: "الجزيرة مباشر",
    logoUrl: "text",
    category: "news",
    streams: [
      { quality: "HD", serverName: "main", url: "http://tecflix.vip:80/live/2D9C0C398918689B8650CC3D84FEB4D7/516747.m3u8" },
      { quality: "HD", serverName: "BK", url: "http://tecflix.vip:80/live/2D9C0C398918689B8650CC3D84FEB4D7/516801.m3u8" },
    ],
  },
  {
    name: "الجزيرة DOC",
    logoUrl: "text",
    category: "news",
    streams: [
      { quality: "HD", serverName: "main", url: "http://tecflix.vip:80/live/2D9C0C398918689B8650CC3D84FEB4D7/516748.m3u8" },
      { quality: "HD", serverName: "BK", url: "http://tecflix.vip:80/live/2D9C0C398918689B8650CC3D84FEB4D7/516802.m3u8" },
    ],
  },
  {
    name: "العربية",
    logoUrl: "text",
    category: "news",
    streams: [
      { quality: "HD", serverName: "main", url: "http://tecflix.vip:80/live/2D9C0C398918689B8650CC3D84FEB4D7/516749.m3u8" },
      { quality: "LOW", serverName: "main", url: "http://tecflix.vip:80/live/2D9C0C398918689B8650CC3D84FEB4D7/516750.m3u8" },
      { quality: "HD", serverName: "BK", url: "http://tecflix.vip:80/live/2D9C0C398918689B8650CC3D84FEB4D7/516803.m3u8" },
    ],
  },
  {
    name: "العربية الحدث",
    logoUrl: "text",
    category: "news",
    streams: [
      { quality: "HD", serverName: "main", url: "http://tecflix.vip:80/live/2D9C0C398918689B8650CC3D84FEB4D7/516751.m3u8" },
      { quality: "HD", serverName: "BK", url: "http://tecflix.vip:80/live/2D9C0C398918689B8650CC3D84FEB4D7/516804.m3u8" },
    ],
  },
  {
    name: "الحرة",
    logoUrl: "text",
    category: "news",
    streams: [
      { quality: "HD", serverName: "main", url: "http://tecflix.vip:80/live/2D9C0C398918689B8650CC3D84FEB4D7/516756.m3u8" },
      { quality: "HD", serverName: "BK", url: "http://tecflix.vip:80/live/2D9C0C398918689B8650CC3D84FEB4D7/516809.m3u8" },
    ],
  },
  {
    name: "Sky News عربية",
    logoUrl: "text",
    category: "news",
    streams: [
      { quality: "HD", serverName: "main", url: "http://tecflix.vip:80/live/2D9C0C398918689B8650CC3D84FEB4D7/516752.m3u8" },
      { quality: "HD", serverName: "BK", url: "http://tecflix.vip:80/live/2D9C0C398918689B8650CC3D84FEB4D7/516805.m3u8" },
    ],
  },
  {
    name: "BBC عربية",
    logoUrl: "text",
    category: "news",
    streams: [
      { quality: "HD", serverName: "main", url: "http://tecflix.vip:80/live/2D9C0C398918689B8650CC3D84FEB4D7/516753.m3u8" },
      { quality: "HD", serverName: "BK", url: "http://tecflix.vip:80/live/2D9C0C398918689B8650CC3D84FEB4D7/516806.m3u8" },
    ],
  },
  {
    name: "DW عربية",
    logoUrl: "text",
    category: "news",
    streams: [
      { quality: "HD", serverName: "main", url: "http://tecflix.vip:80/live/2D9C0C398918689B8650CC3D84FEB4D7/516754.m3u8" },
      { quality: "HD", serverName: "BK", url: "http://tecflix.vip:80/live/2D9C0C398918689B8650CC3D84FEB4D7/516807.m3u8" },
    ],
  },
  {
    name: "France 24 عربية",
    logoUrl: "text",
    category: "news",
    streams: [
      { quality: "HD", serverName: "main", url: "http://tecflix.vip:80/live/2D9C0C398918689B8650CC3D84FEB4D7/516755.m3u8" },
      { quality: "HD", serverName: "BK", url: "http://tecflix.vip:80/live/2D9C0C398918689B8650CC3D84FEB4D7/516808.m3u8" },
    ],
  },
  {
    name: "الشرق",
    logoUrl: "text",
    category: "news",
    streams: [
      { quality: "FHD", serverName: "main", url: "http://tecflix.vip:80/live/2D9C0C398918689B8650CC3D84FEB4D7/516758.m3u8" },
      { quality: "HD", serverName: "main", url: "http://tecflix.vip:80/live/2D9C0C398918689B8650CC3D84FEB4D7/516759.m3u8" },
      { quality: "HD", serverName: "BK", url: "http://tecflix.vip:80/live/2D9C0C398918689B8650CC3D84FEB4D7/516811.m3u8" },
    ],
  },
  {
    name: "TRT عربية",
    logoUrl: "text",
    category: "news",
    streams: [
      { quality: "HD", serverName: "main", url: "http://tecflix.vip:80/live/2D9C0C398918689B8650CC3D84FEB4D7/516760.m3u8" },
      { quality: "HD", serverName: "BK", url: "http://tecflix.vip:80/live/2D9C0C398918689B8650CC3D84FEB4D7/516812.m3u8" },
    ],
  },
  {
    name: "CGTN عربية",
    logoUrl: "text",
    category: "news",
    streams: [
      { quality: "HD", serverName: "main", url: "http://tecflix.vip:80/live/2D9C0C398918689B8650CC3D84FEB4D7/516761.m3u8" },
      { quality: "HD", serverName: "BK", url: "http://tecflix.vip:80/live/2D9C0C398918689B8650CC3D84FEB4D7/516813.m3u8" },
    ],
  },
  {
    name: "الميدان",
    logoUrl: "text",
    category: "news",
    streams: [
      { quality: "HD", serverName: "main", url: "http://tecflix.vip:80/live/2D9C0C398918689B8650CC3D84FEB4D7/516762.m3u8" },
    ],
  },
  {
    name: "CNBC عربية",
    logoUrl: "text",
    category: "news",
    streams: [
      { quality: "HD", serverName: "main", url: "http://tecflix.vip:80/live/2D9C0C398918689B8650CC3D84FEB4D7/516764.m3u8" },
      { quality: "HD", serverName: "BK", url: "http://tecflix.vip:80/live/2D9C0C398918689B8650CC3D84FEB4D7/516814.m3u8" },
    ],
  },
  {
    name: "العلم",
    logoUrl: "text",
    category: "news",
    streams: [
      { quality: "HD", serverName: "main", url: "http://tecflix.vip:80/live/2D9C0C398918689B8650CC3D84FEB4D7/516765.m3u8" },
      { quality: "HD", serverName: "BK", url: "http://tecflix.vip:80/live/2D9C0C398918689B8650CC3D84FEB4D7/516815.m3u8" },
    ],
  },
  {
    name: "العربي",
    logoUrl: "text",
    category: "news",
    streams: [
      { quality: "HD", serverName: "main", url: "http://tecflix.vip:80/live/2D9C0C398918689B8650CC3D84FEB4D7/516766.m3u8" },
      { quality: "HD", serverName: "BK", url: "http://tecflix.vip:80/live/2D9C0C398918689B8650CC3D84FEB4D7/516816.m3u8" },
    ],
  },
  {
    name: "العربي 2",
    logoUrl: "text",
    category: "news",
    streams: [
      { quality: "FHD", serverName: "main", url: "http://tecflix.vip:80/live/2D9C0C398918689B8650CC3D84FEB4D7/516767.m3u8" },
      { quality: "HD", serverName: "main", url: "http://tecflix.vip:80/live/2D9C0C398918689B8650CC3D84FEB4D7/516768.m3u8" },
    ],
  },
  {
    name: "المستقلة",
    logoUrl: "text",
    category: "news",
    streams: [
      { quality: "HD", serverName: "main", url: "http://tecflix.vip:80/live/2D9C0C398918689B8650CC3D84FEB4D7/516769.m3u8" },
      { quality: "HD", serverName: "BK", url: "http://tecflix.vip:80/live/2D9C0C398918689B8650CC3D84FEB4D7/516817.m3u8" },
    ],
  },
  {
    name: "IRAN INTERNATIONAL",
    logoUrl: "text",
    category: "news",
    streams: [
      { quality: "HD", serverName: "main", url: "http://tecflix.vip:80/live/2D9C0C398918689B8650CC3D84FEB4D7/516770.m3u8" },
      { quality: "HD", serverName: "BK", url: "http://tecflix.vip:80/live/2D9C0C398918689B8650CC3D84FEB4D7/516818.m3u8" },
    ],
  },
  {
    name: "العربية Business",
    logoUrl: "text",
    category: "news",
    streams: [
      { quality: "FHD", serverName: "main", url: "http://tecflix.vip:80/live/2D9C0C398918689B8650CC3D84FEB4D7/516772.m3u8" },
      { quality: "HD", serverName: "main", url: "http://tecflix.vip:80/live/2D9C0C398918689B8650CC3D84FEB4D7/516771.m3u8" },
      { quality: "HD", serverName: "BK", url: "http://tecflix.vip:80/live/2D9C0C398918689B8650CC3D84FEB4D7/516819.m3u8" },
    ],
  },
  {
    name: "الغد",
    logoUrl: "text",
    category: "news",
    streams: [
      { quality: "HD", serverName: "main", url: "http://tecflix.vip:80/live/2D9C0C398918689B8650CC3D84FEB4D7/516773.m3u8" },
      { quality: "HD", serverName: "BK", url: "http://tecflix.vip:80/live/2D9C0C398918689B8650CC3D84FEB4D7/516820.m3u8" },
    ],
  },
  {
    name: "NRT عربية",
    logoUrl: "text",
    category: "news",
    streams: [
      { quality: "HD", serverName: "main", url: "http://tecflix.vip:80/live/2D9C0C398918689B8650CC3D84FEB4D7/516774.m3u8" },
      { quality: "HD", serverName: "BK", url: "http://tecflix.vip:80/live/2D9C0C398918689B8650CC3D84FEB4D7/516821.m3u8" },
    ],
  },
  {
    name: "الشرقية News",
    logoUrl: "text",
    category: "news",
    streams: [
      { quality: "HD", serverName: "main", url: "http://tecflix.vip:80/live/2D9C0C398918689B8650CC3D84FEB4D7/516775.m3u8" },
      { quality: "HD", serverName: "BK", url: "http://tecflix.vip:80/live/2D9C0C398918689B8650CC3D84FEB4D7/516822.m3u8" },
    ],
  },
  {
    name: "السومرية",
    logoUrl: "text",
    category: "news",
    streams: [
      { quality: "HD", serverName: "main", url: "http://tecflix.vip:80/live/2D9C0C398918689B8650CC3D84FEB4D7/516776.m3u8" },
      { quality: "HD", serverName: "BK", url: "http://tecflix.vip:80/live/2D9C0C398918689B8650CC3D84FEB4D7/516823.m3u8" },
    ],
  },
  {
    name: "الفلوجة",
    logoUrl: "text",
    category: "news",
    streams: [
      { quality: "HD", serverName: "main", url: "http://tecflix.vip:80/live/2D9C0C398918689B8650CC3D84FEB4D7/516778.m3u8" },
      { quality: "HD", serverName: "BK", url: "http://tecflix.vip:80/live/2D9C0C398918689B8650CC3D84FEB4D7/516825.m3u8" },
    ],
  },
  {
    name: "TRT WORLD",
    logoUrl: "text",
    category: "news",
    streams: [
      { quality: "HD", serverName: "main", url: "http://tecflix.vip:80/live/2D9C0C398918689B8650CC3D84FEB4D7/516779.m3u8" },
      { quality: "HD", serverName: "BK", url: "http://tecflix.vip:80/live/2D9C0C398918689B8650CC3D84FEB4D7/516826.m3u8" },
    ],
  },
  {
    name: "المسيرة",
    logoUrl: "text",
    category: "news",
    streams: [
      { quality: "HD", serverName: "main", url: "http://tecflix.vip:80/live/2D9C0C398918689B8650CC3D84FEB4D7/516780.m3u8" },
      { quality: "HD", serverName: "BK", url: "http://tecflix.vip:80/live/2D9C0C398918689B8650CC3D84FEB4D7/516781.m3u8" },
    ],
  },
  {
    name: "المسيرة 2",
    logoUrl: "text",
    category: "news",
    streams: [
      { quality: "HD", serverName: "main", url: "http://tecflix.vip:80/live/2D9C0C398918689B8650CC3D84FEB4D7/516782.m3u8" },
      { quality: "HD", serverName: "BK", url: "http://tecflix.vip:80/live/2D9C0C398918689B8650CC3D84FEB4D7/516783.m3u8" },
    ],
  },
  {
    name: "فلسطين اليوم",
    logoUrl: "text",
    category: "news",
    streams: [
      { quality: "HD", serverName: "main", url: "http://tecflix.vip:80/live/2D9C0C398918689B8650CC3D84FEB4D7/516784.m3u8" },
      { quality: "HD", serverName: "BK", url: "http://tecflix.vip:80/live/2D9C0C398918689B8650CC3D84FEB4D7/516827.m3u8" },
    ],
  },
  {
    name: "الأقصى",
    logoUrl: "text",
    category: "news",
    streams: [
      { quality: "HD", serverName: "main", url: "http://tecflix.vip:80/live/2D9C0C398918689B8650CC3D84FEB4D7/516785.m3u8" },
      { quality: "HD", serverName: "BK", url: "http://tecflix.vip:80/live/2D9C0C398918689B8650CC3D84FEB4D7/516828.m3u8" },
    ],
  },
  {
    name: "RT ENGLISH",
    logoUrl: "text",
    category: "news",
    streams: [
      { quality: "HD", serverName: "main", url: "http://tecflix.vip:80/live/2D9C0C398918689B8650CC3D84FEB4D7/516786.m3u8" },
      { quality: "HD", serverName: "BK", url: "http://tecflix.vip:80/live/2D9C0C398918689B8650CC3D84FEB4D7/516829.m3u8" },
    ],
  },
  {
    name: "Press TV",
    logoUrl: "text",
    category: "news",
    streams: [
      { quality: "HD", serverName: "main", url: "http://tecflix.vip:80/live/2D9C0C398918689B8650CC3D84FEB4D7/516787.m3u8" },
      { quality: "HD", serverName: "BK", url: "http://tecflix.vip:80/live/2D9C0C398918689B8650CC3D84FEB4D7/516830.m3u8" },
    ],
  },
  {
    name: "المنار",
    logoUrl: "text",
    category: "news",
    streams: [
      { quality: "HD", serverName: "main", url: "http://tecflix.vip:80/live/2D9C0C398918689B8650CC3D84FEB4D7/516788.m3u8" },
      { quality: "HD", serverName: "BK", url: "http://tecflix.vip:80/live/2D9C0C398918689B8650CC3D84FEB4D7/516789.m3u8" },
    ],
  },
  {
    name: "Al Mayadeen English",
    logoUrl: "text",
    category: "news",
    streams: [
      { quality: "HD", serverName: "main", url: "http://tecflix.vip:80/live/2D9C0C398918689B8650CC3D84FEB4D7/516790.m3u8" },
      { quality: "HD", serverName: "BK", url: "http://tecflix.vip:80/live/2D9C0C398918689B8650CC3D84FEB4D7/516831.m3u8" },
    ],
  },
  {
    name: "LBCI",
    logoUrl: "text",
    category: "news",
    streams: [
      { quality: "HD", serverName: "main", url: "http://tecflix.vip:80/live/2D9C0C398918689B8650CC3D84FEB4D7/516791.m3u8" },
      { quality: "HD", serverName: "BK", url: "http://tecflix.vip:80/live/2D9C0C398918689B8650CC3D84FEB4D7/516832.m3u8" },
    ],
  },
  {
    name: "OTV",
    logoUrl: "text",
    category: "news",
    streams: [
      { quality: "HD", serverName: "main", url: "http://tecflix.vip:80/live/2D9C0C398918689B8650CC3D84FEB4D7/516792.m3u8" },
      { quality: "HD", serverName: "BK", url: "http://tecflix.vip:80/live/2D9C0C398918689B8650CC3D84FEB4D7/516833.m3u8" },
    ],
  },
  {
    name: "MTV",
    logoUrl: "text",
    category: "news",
    streams: [
      { quality: "HD", serverName: "main", url: "http://tecflix.vip:80/live/2D9C0C398918689B8650CC3D84FEB4D7/516793.m3u8" },
      { quality: "HD", serverName: "BK", url: "http://tecflix.vip:80/live/2D9C0C398918689B8650CC3D84FEB4D7/516834.m3u8" },
    ],
  },
  {
    name: "Future TV",
    logoUrl: "text",
    category: "news",
    streams: [
      { quality: "HD", serverName: "main", url: "http://tecflix.vip:80/live/2D9C0C398918689B8650CC3D84FEB4D7/516794.m3u8" },
      { quality: "HD", serverName: "BK", url: "http://tecflix.vip:80/live/2D9C0C398918689B8650CC3D84FEB4D7/516835.m3u8" },
    ],
  },
  {
    name: "الجديد",
    logoUrl: "text",
    category: "news",
    streams: [
      { quality: "HD", serverName: "main", url: "http://tecflix.vip:80/live/2D9C0C398918689B8650CC3D84FEB4D7/516795.m3u8" },
      { quality: "HD", serverName: "BK", url: "http://tecflix.vip:80/live/2D9C0C398918689B8650CC3D84FEB4D7/516836.m3u8" },
    ],
  },
  {
    name: "Tele Liban",
    logoUrl: "text",
    category: "news",
    streams: [
      { quality: "HD", serverName: "main", url: "http://tecflix.vip:80/live/2D9C0C398918689B8650CC3D84FEB4D7/516796.m3u8" },
      { quality: "HD", serverName: "BK", url: "http://tecflix.vip:80/live/2D9C0C398918689B8650CC3D84FEB4D7/516837.m3u8" },
    ],
  },
  {
    name: "NBN",
    logoUrl: "text",
    category: "news",
    streams: [
      { quality: "HD", serverName: "main", url: "http://tecflix.vip:80/live/2D9C0C398918689B8650CC3D84FEB4D7/516797.m3u8" },
      { quality: "HD", serverName: "BK", url: "http://tecflix.vip:80/live/2D9C0C398918689B8650CC3D84FEB4D7/516838.m3u8" },
    ],
  },
  {
    name: "Lebanon 24",
    logoUrl: "text",
    category: "news",
    streams: [
      { quality: "HD", serverName: "main", url: "http://tecflix.vip:80/live/2D9C0C398918689B8650CC3D84FEB4D7/516798.m3u8" },
      { quality: "HD", serverName: "BK", url: "http://tecflix.vip:80/live/2D9C0C398918689B8650CC3D84FEB4D7/516839.m3u8" },
    ],
  },
  {
    name: "Russia Today",
    logoUrl: "text",
    category: "news",
    streams: [
      { quality: "HD", serverName: "BK", url: "http://tecflix.vip:80/live/2D9C0C398918689B8650CC3D84FEB4D7/516810.m3u8" },
    ],
  },
];

async function seedNewsChannels() {
  console.log("Starting to seed news channels...");

  // Update existing channels to sports category
  console.log("Updating existing beIN Sports channels to sports category...");
  await db.execute(sql`UPDATE channels SET category = 'sports' WHERE category IS NULL OR category = ''`);

  let addedCount = 0;
  let updatedCount = 0;

  for (const channelData of newsChannels) {
    try {
      // Check if channel already exists
      const existing = await db
        .select()
        .from(channels)
        .where(eq(channels.name, channelData.name))
        .limit(1);

      let channelId: string;

      if (existing.length > 0) {
        channelId = existing[0].id;
        console.log(`Channel "${channelData.name}" already exists, updating streams...`);
        
        // Delete old streams
        await db.delete(channelStreams).where(eq(channelStreams.channelId, channelId));
        updatedCount++;
      } else {
        // Create new channel
        const [newChannel] = await db
          .insert(channels)
          .values({
            name: channelData.name,
            logoUrl: channelData.logoUrl,
            category: channelData.category,
            displayOrder: 100 + addedCount,
          })
          .returning();

        channelId = newChannel.id;
        console.log(`Added new channel: ${channelData.name}`);
        addedCount++;
      }

      // Add streams with encryption
      for (const stream of channelData.streams) {
        const encryptedUrl = encryptUrl(stream.url);
        
        await db.insert(channelStreams).values({
          channelId,
          quality: stream.quality,
          serverName: stream.serverName,
          encryptedUrl,
        });
      }

      console.log(`  ✓ Added ${channelData.streams.length} streams for ${channelData.name}`);
    } catch (error) {
      console.error(`Error processing channel ${channelData.name}:`, error);
    }
  }

  console.log(`\n✅ Seeding complete!`);
  console.log(`   - Added ${addedCount} new channels`);
  console.log(`   - Updated ${updatedCount} existing channels`);
  console.log(`   - Total news channels: ${newsChannels.length}`);
}

seedNewsChannels()
  .then(() => {
    console.log("Done!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Failed to seed channels:", error);
    process.exit(1);
  });
