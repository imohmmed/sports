import { db } from "./db";
import { categories, channelGroups, channels, channelStreams } from "@shared/schema";
import { encryptUrl } from "./encryption";
import { eq } from "drizzle-orm";

async function seedSportsChannels() {
  console.log("Adding beIN Sports channels...");

  // Get Sports category
  const sportsCategory = await db
    .select()
    .from(categories)
    .where(eq(categories.name, "رياضة"))
    .limit(1);

  if (sportsCategory.length === 0) {
    console.error("Sports category not found!");
    return;
  }

  const sportsCategoryId = sportsCategory[0].id;

  // Create beIN Sports group
  const beinGroup = await db
    .insert(channelGroups)
    .values({
      name: "beIN Sports",
      categoryId: sportsCategoryId,
      displayOrder: 1,
      logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/94/BeIN_Sports_logo_%282017%29.png/200px-BeIN_Sports_logo_%282017%29.png",
    })
    .returning();

  const groupId = beinGroup[0].id;

  // beIN Sports channels with their URLs
  const beinChannels = [
    {
      name: "beIN Sports 1 HD",
      order: 1,
      urls: {
        FHD: "https://webudi.openhd.lol/lb/premium406/index.m3u8",
        HD: "https://webudi.openhd.lol/lb/premium406/index.m3u8",
        BK_FHD: "https://nour.watch/bein/bein1.m3u8",
      },
    },
    {
      name: "beIN Sports 2 HD",
      order: 2,
      urls: {
        FHD: "https://webudi.openhd.lol/lb/premium407/index.m3u8",
        HD: "https://webudi.openhd.lol/lb/premium407/index.m3u8",
        BK_FHD: "https://nour.watch/bein/bein2.m3u8",
      },
    },
    {
      name: "beIN Sports 3 HD",
      order: 3,
      urls: {
        FHD: "https://webudi.openhd.lol/lb/premium408/index.m3u8",
        HD: "https://webudi.openhd.lol/lb/premium408/index.m3u8",
        BK_FHD: "https://nour.watch/bein/bein3.m3u8",
      },
    },
    {
      name: "beIN Sports 4 HD",
      order: 4,
      urls: {
        FHD: "https://webudi.openhd.lol/lb/premium409/index.m3u8",
        HD: "https://webudi.openhd.lol/lb/premium409/index.m3u8",
        BK_FHD: "https://nour.watch/bein/bein4.m3u8",
      },
    },
    {
      name: "beIN Sports 5 HD",
      order: 5,
      urls: {
        FHD: "https://webudi.openhd.lol/lb/premium410/index.m3u8",
        HD: "https://webudi.openhd.lol/lb/premium410/index.m3u8",
        BK_FHD: "https://nour.watch/bein/bein5.m3u8",
      },
    },
    {
      name: "beIN Sports 6 HD",
      order: 6,
      urls: {
        FHD: "https://webudi.openhd.lol/lb/premium411/index.m3u8",
        HD: "https://webudi.openhd.lol/lb/premium411/index.m3u8",
        BK_FHD: "https://nour.watch/bein/bein6.m3u8",
      },
    },
    {
      name: "beIN Sports 7 HD",
      order: 7,
      urls: {
        FHD: "https://webudi.openhd.lol/lb/premium412/index.m3u8",
        HD: "https://webudi.openhd.lol/lb/premium412/index.m3u8",
        BK_FHD: "https://nour.watch/bein/bein7.m3u8",
      },
    },
    {
      name: "beIN Sports Premium 1",
      order: 8,
      urls: {
        FHD: "https://webudi.openhd.lol/lb/premium419/index.m3u8",
        HD: "https://webudi.openhd.lol/lb/premium419/index.m3u8",
        BK_FHD: "https://nour.watch/bein/premium1.m3u8",
      },
    },
    {
      name: "beIN Sports Premium 2",
      order: 9,
      urls: {
        FHD: "https://webudi.openhd.lol/lb/premium420/index.m3u8",
        HD: "https://webudi.openhd.lol/lb/premium420/index.m3u8",
        BK_FHD: "https://nour.watch/bein/premium2.m3u8",
      },
    },
    {
      name: "beIN Sports Premium 3",
      order: 10,
      urls: {
        FHD: "https://webudi.openhd.lol/lb/premium421/index.m3u8",
        HD: "https://webudi.openhd.lol/lb/premium421/index.m3u8",
        BK_FHD: "https://nour.watch/bein/premium3.m3u8",
      },
    },
  ];

  for (const ch of beinChannels) {
    console.log(`Adding ${ch.name}...`);

    const newChannel = await db
      .insert(channels)
      .values({
        name: ch.name,
        groupId: groupId,
        displayOrder: ch.order,
        logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/94/BeIN_Sports_logo_%282017%29.png/200px-BeIN_Sports_logo_%282017%29.png",
      })
      .returning();

    const channelId = newChannel[0].id;

    // Add streams
    const streams = [];
    if (ch.urls.FHD) {
      streams.push({
        channelId,
        quality: "FHD",
        encryptedUrl: encryptUrl(ch.urls.FHD),
        backupEncryptedUrl: ch.urls.BK_FHD ? encryptUrl(ch.urls.BK_FHD) : null,
      });
    }
    if (ch.urls.HD && ch.urls.HD !== ch.urls.FHD) {
      streams.push({
        channelId,
        quality: "HD",
        encryptedUrl: encryptUrl(ch.urls.HD),
        backupEncryptedUrl: ch.urls.BK_HD ? encryptUrl(ch.urls.BK_HD) : null,
      });
    }

    if (streams.length > 0) {
      await db.insert(channelStreams).values(streams);
    }
  }

  console.log("✅ beIN Sports channels added successfully!");
}

seedSportsChannels()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Error seeding sports channels:", error);
    process.exit(1);
  });
