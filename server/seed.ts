import { db } from "./db";
import { channels, channelStreams } from "@shared/schema";
import { encryptUrl } from "./encryption";

// Channel data from the original request
const channelData = [
  {
    name: "Bn sport",
    streams: [
      { quality: "FHD", url: "http://tecflix.vip:80/live/2D9C0C398918689B8650CC3D84FEB4D7/516713.m3u8" },
    ],
  },
  {
    name: "Bn 1",
    streams: [
      { quality: "FHD", url: "http://tecflix.vip:80/live/2D9C0C398918689B8650CC3D84FEB4D7/516714.m3u8" },
      { quality: "HD", url: "http://tecflix.vip:80/live/2D9C0C398918689B8650CC3D84FEB4D7/516725.m3u8" },
      { quality: "LOW", url: "http://tecflix.vip:80/live/2D9C0C398918689B8650CC3D84FEB4D7/516737.m3u8" },
    ],
  },
  {
    name: "Bn 2",
    streams: [
      { quality: "FHD", url: "http://tecflix.vip:80/live/2D9C0C398918689B8650CC3D84FEB4D7/516715.m3u8" },
      { quality: "HD", url: "http://tecflix.vip:80/live/2D9C0C398918689B8650CC3D84FEB4D7/516726.m3u8" },
      { quality: "LOW", url: "http://tecflix.vip:80/live/2D9C0C398918689B8650CC3D84FEB4D7/516738.m3u8" },
    ],
  },
  {
    name: "Bn 3",
    streams: [
      { quality: "FHD", url: "http://tecflix.vip:80/live/2D9C0C398918689B8650CC3D84FEB4D7/516716.m3u8" },
      { quality: "HD", url: "http://tecflix.vip:80/live/2D9C0C398918689B8650CC3D84FEB4D7/516727.m3u8" },
      { quality: "LOW", url: "http://tecflix.vip:80/live/2D9C0C398918689B8650CC3D84FEB4D7/516739.m3u8" },
    ],
  },
  {
    name: "Bn 4",
    streams: [
      { quality: "FHD", url: "http://tecflix.vip:80/live/2D9C0C398918689B8650CC3D84FEB4D7/516717.m3u8" },
      { quality: "HD", url: "http://tecflix.vip:80/live/2D9C0C398918689B8650CC3D84FEB4D7/516728.m3u8" },
      { quality: "LOW", url: "http://tecflix.vip:80/live/2D9C0C398918689B8650CC3D84FEB4D7/516740.m3u8" },
    ],
  },
  {
    name: "Bn 5",
    streams: [
      { quality: "FHD", url: "http://tecflix.vip:80/live/2D9C0C398918689B8650CC3D84FEB4D7/516718.m3u8" },
      { quality: "HD", url: "http://tecflix.vip:80/live/2D9C0C398918689B8650CC3D84FEB4D7/516729.m3u8" },
      { quality: "LOW", url: "http://tecflix.vip:80/live/2D9C0C398918689B8650CC3D84FEB4D7/516741.m3u8" },
    ],
  },
  {
    name: "Bn 6",
    streams: [
      { quality: "FHD", url: "http://tecflix.vip:80/live/2D9C0C398918689B8650CC3D84FEB4D7/516719.m3u8" },
      { quality: "HD", url: "http://tecflix.vip:80/live/2D9C0C398918689B8650CC3D84FEB4D7/516730.m3u8" },
      { quality: "LOW", url: "http://tecflix.vip:80/live/2D9C0C398918689B8650CC3D84FEB4D7/516742.m3u8" },
    ],
  },
  {
    name: "Bn 7",
    streams: [
      { quality: "FHD", url: "http://tecflix.vip:80/live/2D9C0C398918689B8650CC3D84FEB4D7/516720.m3u8" },
      { quality: "HD", url: "http://tecflix.vip:80/live/2D9C0C398918689B8650CC3D84FEB4D7/516731.m3u8" },
      { quality: "LOW", url: "http://tecflix.vip:80/live/2D9C0C398918689B8650CC3D84FEB4D7/516743.m3u8" },
    ],
  },
  {
    name: "Bn 8",
    streams: [
      { quality: "FHD", url: "http://tecflix.vip:80/live/2D9C0C398918689B8650CC3D84FEB4D7/516721.m3u8" },
      { quality: "HD", url: "http://tecflix.vip:80/live/2D9C0C398918689B8650CC3D84FEB4D7/516732.m3u8" },
    ],
  },
  {
    name: "Bn 9",
    streams: [
      { quality: "FHD", url: "http://tecflix.vip:80/live/2D9C0C398918689B8650CC3D84FEB4D7/516722.m3u8" },
      { quality: "HD", url: "http://tecflix.vip:80/live/2D9C0C398918689B8650CC3D84FEB4D7/516733.m3u8" },
    ],
  },
  {
    name: "Bn XTRA 1",
    streams: [
      { quality: "FHD", url: "http://tecflix.vip:80/live/2D9C0C398918689B8650CC3D84FEB4D7/516723.m3u8" },
      { quality: "HD", url: "http://tecflix.vip:80/live/2D9C0C398918689B8650CC3D84FEB4D7/516734.m3u8" },
    ],
  },
  {
    name: "Bn XTRA 2",
    streams: [
      { quality: "FHD", url: "http://tecflix.vip:80/live/2D9C0C398918689B8650CC3D84FEB4D7/516724.m3u8" },
      { quality: "HD", url: "http://tecflix.vip:80/live/2D9C0C398918689B8650CC3D84FEB4D7/516735.m3u8" },
    ],
  },
  {
    name: "BN NPA",
    streams: [
      { quality: "HD", url: "http://tecflix.vip:80/live/2D9C0C398918689B8650CC3D84FEB4D7/516736.m3u8" },
    ],
  },
];

async function seed() {
  console.log("Seeding database...");

  // Check if channels already exist
  const existingChannels = await db.select().from(channels);
  if (existingChannels.length > 0) {
    console.log("Channels already seeded. Skipping.");
    return;
  }

  // Seed channels
  for (let i = 0; i < channelData.length; i++) {
    const channelInfo = channelData[i];
    
    // Create channel
    const [channel] = await db
      .insert(channels)
      .values({
        name: channelInfo.name,
        displayOrder: i + 1,
      })
      .returning();

    console.log(`Created channel: ${channel.name}`);

    // Create streams for this channel
    for (const stream of channelInfo.streams) {
      const encryptedUrl = encryptUrl(stream.url);
      await db.insert(channelStreams).values({
        channelId: channel.id,
        quality: stream.quality,
        encryptedUrl,
      });
      console.log(`  Added ${stream.quality} stream`);
    }
  }

  console.log("Database seeding completed!");
}

seed()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Error seeding database:", error);
    process.exit(1);
  });
