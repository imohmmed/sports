import { storage } from "./storage";
import { encryptUrl } from "./encryption";
import bcrypt from "bcrypt";

async function seedChannels() {
  console.log("Starting seed...");

  // Create admin user
  const hashedPassword = await bcrypt.hash("ZVwas511", 10);
  try {
    await storage.createUser({
      email: "it.mohmmed@yahoo.com",
      password: hashedPassword,
      firstName: "Mohammed",
      lastName: "Admin",
      isAdmin: true,
      isSubscribed: true,
    });
    console.log("✓ Admin user created");
  } catch (error) {
    console.log("Admin user already exists or error:", error);
  }

  // Create Categories
  const newsCategory = await storage.createCategory({
    name: "أخبار",
    displayOrder: 1,
  });

  const sportsCategory = await storage.createCategory({
    name: "رياضة",
    displayOrder: 2,
  });

  const generalCategory = await storage.createCategory({
    name: "عامة",
    displayOrder: 3,
  });

  console.log("✓ Categories created");

  // Helper function to create channel with streams
  async function createChannelGroup(
    categoryId: string,
    groupName: string,
    logo: string | null,
    displayOrder: number,
    channels: Array<{
      name: string;
      streams: Array<{
        quality: string;
        url: string;
        backupUrl?: string;
      }>;
      displayOrder: number;
    }>
  ) {
    const group = await storage.createChannelGroup({
      name: groupName,
      categoryId,
      logo,
      displayOrder,
    });

    for (const channelData of channels) {
      const channel = await storage.createChannel({
        name: channelData.name,
        groupId: group.id,
        displayOrder: channelData.displayOrder,
      });

      for (const stream of channelData.streams) {
        const encryptedUrl = encryptUrl(stream.url);
        const backupEncryptedUrl = stream.backupUrl
          ? encryptUrl(stream.backupUrl)
          : null;

        await storage.createChannelStream({
          channelId: channel.id,
          quality: stream.quality,
          encryptedUrl,
          backupEncryptedUrl,
        });
      }
    }
  }

  // الجزيرة Group
  await createChannelGroup(
    newsCategory.id,
    "الجزيرة",
    null,
    1,
    [
      {
        name: "الجزيرة",
        displayOrder: 1,
        streams: [
          {
            quality: "FHD",
            url: "http://tecflix.vip:80/live/2D9C0C398918689B8650CC3D84FEB4D7/516744.m3u8",
            backupUrl: "http://tecflix.vip:80/live/2D9C0C398918689B8650CC3D84FEB4D7/516799.m3u8",
          },
          {
            quality: "HD",
            url: "http://tecflix.vip:80/live/2D9C0C398918689B8650CC3D84FEB4D7/516745.m3u8",
          },
          {
            quality: "LOW",
            url: "http://tecflix.vip:80/live/2D9C0C398918689B8650CC3D84FEB4D7/516746.m3u8",
          },
        ],
      },
      {
        name: "الجزيرة مباشر",
        displayOrder: 2,
        streams: [
          {
            quality: "",
            url: "http://tecflix.vip:80/live/2D9C0C398918689B8650CC3D84FEB4D7/516747.m3u8",
            backupUrl: "http://tecflix.vip:80/live/2D9C0C398918689B8650CC3D84FEB4D7/516801.m3u8",
          },
        ],
      },
      {
        name: "الجزيرة DOC",
        displayOrder: 3,
        streams: [
          {
            quality: "",
            url: "http://tecflix.vip:80/live/2D9C0C398918689B8650CC3D84FEB4D7/516748.m3u8",
            backupUrl: "http://tecflix.vip:80/live/2D9C0C398918689B8650CC3D84FEB4D7/516802.m3u8",
          },
        ],
      },
    ]
  );

  // العربية Group
  await createChannelGroup(
    newsCategory.id,
    "العربية",
    null,
    2,
    [
      {
        name: "العربية",
        displayOrder: 1,
        streams: [
          {
            quality: "HD",
            url: "http://tecflix.vip:80/live/2D9C0C398918689B8650CC3D84FEB4D7/516749.m3u8",
            backupUrl: "http://tecflix.vip:80/live/2D9C0C398918689B8650CC3D84FEB4D7/516803.m3u8",
          },
          {
            quality: "LOW",
            url: "http://tecflix.vip:80/live/2D9C0C398918689B8650CC3D84FEB4D7/516750.m3u8",
          },
        ],
      },
      {
        name: "العربية الحدث",
        displayOrder: 2,
        streams: [
          {
            quality: "",
            url: "http://tecflix.vip:80/live/2D9C0C398918689B8650CC3D84FEB4D7/516751.m3u8",
            backupUrl: "http://tecflix.vip:80/live/2D9C0C398918689B8650CC3D84FEB4D7/516804.m3u8",
          },
        ],
      },
      {
        name: "العربية Business",
        displayOrder: 3,
        streams: [
          {
            quality: "FHD",
            url: "http://tecflix.vip:80/live/2D9C0C398918689B8650CC3D84FEB4D7/516772.m3u8",
            backupUrl: "http://tecflix.vip:80/live/2D9C0C398918689B8650CC3D84FEB4D7/516819.m3u8",
          },
          {
            quality: "HD",
            url: "http://tecflix.vip:80/live/2D9C0C398918689B8650CC3D84FEB4D7/516771.m3u8",
          },
        ],
      },
    ]
  );

  // قنوات الأخبار الدولية
  await createChannelGroup(
    newsCategory.id,
    "قنوات دولية",
    null,
    3,
    [
      {
        name: "Sky News عربية",
        displayOrder: 1,
        streams: [
          {
            quality: "",
            url: "http://tecflix.vip:80/live/2D9C0C398918689B8650CC3D84FEB4D7/516752.m3u8",
            backupUrl: "http://tecflix.vip:80/live/2D9C0C398918689B8650CC3D84FEB4D7/516805.m3u8",
          },
        ],
      },
      {
        name: "BBC عربية",
        displayOrder: 2,
        streams: [
          {
            quality: "",
            url: "http://tecflix.vip:80/live/2D9C0C398918689B8650CC3D84FEB4D7/516753.m3u8",
            backupUrl: "http://tecflix.vip:80/live/2D9C0C398918689B8650CC3D84FEB4D7/516806.m3u8",
          },
        ],
      },
      {
        name: "DW عربية",
        displayOrder: 3,
        streams: [
          {
            quality: "",
            url: "http://tecflix.vip:80/live/2D9C0C398918689B8650CC3D84FEB4D7/516754.m3u8",
            backupUrl: "http://tecflix.vip:80/live/2D9C0C398918689B8650CC3D84FEB4D7/516807.m3u8",
          },
        ],
      },
      {
        name: "France 24 عربية",
        displayOrder: 4,
        streams: [
          {
            quality: "",
            url: "http://tecflix.vip:80/live/2D9C0C398918689B8650CC3D84FEB4D7/516755.m3u8",
            backupUrl: "http://tecflix.vip:80/live/2D9C0C398918689B8650CC3D84FEB4D7/516808.m3u8",
          },
        ],
      },
      {
        name: "RT ENGLISH",
        displayOrder: 5,
        streams: [
          {
            quality: "",
            url: "http://tecflix.vip:80/live/2D9C0C398918689B8650CC3D84FEB4D7/516786.m3u8",
            backupUrl: "http://tecflix.vip:80/live/2D9C0C398918689B8650CC3D84FEB4D7/516829.m3u8",
          },
        ],
      },
      {
        name: "TRT عربية",
        displayOrder: 6,
        streams: [
          {
            quality: "",
            url: "http://tecflix.vip:80/live/2D9C0C398918689B8650CC3D84FEB4D7/516760.m3u8",
            backupUrl: "http://tecflix.vip:80/live/2D9C0C398918689B8650CC3D84FEB4D7/516812.m3u8",
          },
        ],
      },
      {
        name: "TRT WORLD",
        displayOrder: 7,
        streams: [
          {
            quality: "",
            url: "http://tecflix.vip:80/live/2D9C0C398918689B8650CC3D84FEB4D7/516779.m3u8",
            backupUrl: "http://tecflix.vip:80/live/2D9C0C398918689B8650CC3D84FEB4D7/516826.m3u8",
          },
        ],
      },
      {
        name: "CGTN عربية",
        displayOrder: 8,
        streams: [
          {
            quality: "",
            url: "http://tecflix.vip:80/live/2D9C0C398918689B8650CC3D84FEB4D7/516761.m3u8",
            backupUrl: "http://tecflix.vip:80/live/2D9C0C398918689B8650CC3D84FEB4D7/516813.m3u8",
          },
        ],
      },
    ]
  );

  // قنوات عربية أخرى
  await createChannelGroup(
    newsCategory.id,
    "قنوات عربية",
    null,
    4,
    [
      {
        name: "الحرة",
        displayOrder: 1,
        streams: [
          {
            quality: "",
            url: "http://tecflix.vip:80/live/2D9C0C398918689B8650CC3D84FEB4D7/516756.m3u8",
            backupUrl: "http://tecflix.vip:80/live/2D9C0C398918689B8650CC3D84FEB4D7/516809.m3u8",
          },
        ],
      },
      {
        name: "الشرق",
        displayOrder: 2,
        streams: [
          {
            quality: "FHD",
            url: "http://tecflix.vip:80/live/2D9C0C398918689B8650CC3D84FEB4D7/516758.m3u8",
            backupUrl: "http://tecflix.vip:80/live/2D9C0C398918689B8650CC3D84FEB4D7/516811.m3u8",
          },
          {
            quality: "HD",
            url: "http://tecflix.vip:80/live/2D9C0C398918689B8650CC3D84FEB4D7/516759.m3u8",
          },
        ],
      },
      {
        name: "الميدان",
        displayOrder: 3,
        streams: [
          {
            quality: "",
            url: "http://tecflix.vip:80/live/2D9C0C398918689B8650CC3D84FEB4D7/516762.m3u8",
          },
        ],
      },
      {
        name: "CNBC عربية",
        displayOrder: 4,
        streams: [
          {
            quality: "",
            url: "http://tecflix.vip:80/live/2D9C0C398918689B8650CC3D84FEB4D7/516764.m3u8",
            backupUrl: "http://tecflix.vip:80/live/2D9C0C398918689B8650CC3D84FEB4D7/516814.m3u8",
          },
        ],
      },
      {
        name: "العلم",
        displayOrder: 5,
        streams: [
          {
            quality: "",
            url: "http://tecflix.vip:80/live/2D9C0C398918689B8650CC3D84FEB4D7/516765.m3u8",
            backupUrl: "http://tecflix.vip:80/live/2D9C0C398918689B8650CC3D84FEB4D7/516815.m3u8",
          },
        ],
      },
      {
        name: "العربي",
        displayOrder: 6,
        streams: [
          {
            quality: "",
            url: "http://tecflix.vip:80/live/2D9C0C398918689B8650CC3D84FEB4D7/516766.m3u8",
            backupUrl: "http://tecflix.vip:80/live/2D9C0C398918689B8650CC3D84FEB4D7/516816.m3u8",
          },
        ],
      },
      {
        name: "العربي 2",
        displayOrder: 7,
        streams: [
          {
            quality: "FHD",
            url: "http://tecflix.vip:80/live/2D9C0C398918689B8650CC3D84FEB4D7/516767.m3u8",
          },
          {
            quality: "HD",
            url: "http://tecflix.vip:80/live/2D9C0C398918689B8650CC3D84FEB4D7/516768.m3u8",
          },
        ],
      },
      {
        name: "المستقلة",
        displayOrder: 8,
        streams: [
          {
            quality: "",
            url: "http://tecflix.vip:80/live/2D9C0C398918689B8650CC3D84FEB4D7/516769.m3u8",
            backupUrl: "http://tecflix.vip:80/live/2D9C0C398918689B8650CC3D84FEB4D7/516817.m3u8",
          },
        ],
      },
      {
        name: "الغد",
        displayOrder: 9,
        streams: [
          {
            quality: "",
            url: "http://tecflix.vip:80/live/2D9C0C398918689B8650CC3D84FEB4D7/516773.m3u8",
            backupUrl: "http://tecflix.vip:80/live/2D9C0C398918689B8650CC3D84FEB4D7/516820.m3u8",
          },
        ],
      },
      {
        name: "IRAN INTERNATIONAL",
        displayOrder: 10,
        streams: [
          {
            quality: "",
            url: "http://tecflix.vip:80/live/2D9C0C398918689B8650CC3D84FEB4D7/516770.m3u8",
            backupUrl: "http://tecflix.vip:80/live/2D9C0C398918689B8650CC3D84FEB4D7/516818.m3u8",
          },
        ],
      },
    ]
  );

  // قنوات عراقية
  await createChannelGroup(
    newsCategory.id,
    "قنوات عراقية",
    null,
    5,
    [
      {
        name: "NRT عربية",
        displayOrder: 1,
        streams: [
          {
            quality: "",
            url: "http://tecflix.vip:80/live/2D9C0C398918689B8650CC3D84FEB4D7/516774.m3u8",
            backupUrl: "http://tecflix.vip:80/live/2D9C0C398918689B8650CC3D84FEB4D7/516821.m3u8",
          },
        ],
      },
      {
        name: "الشرقية News",
        displayOrder: 2,
        streams: [
          {
            quality: "",
            url: "http://tecflix.vip:80/live/2D9C0C398918689B8650CC3D84FEB4D7/516775.m3u8",
            backupUrl: "http://tecflix.vip:80/live/2D9C0C398918689B8650CC3D84FEB4D7/516822.m3u8",
          },
        ],
      },
      {
        name: "السومرية",
        displayOrder: 3,
        streams: [
          {
            quality: "",
            url: "http://tecflix.vip:80/live/2D9C0C398918689B8650CC3D84FEB4D7/516776.m3u8",
            backupUrl: "http://tecflix.vip:80/live/2D9C0C398918689B8650CC3D84FEB4D7/516823.m3u8",
          },
        ],
      },
      {
        name: "الفلوجة",
        displayOrder: 4,
        streams: [
          {
            quality: "",
            url: "http://tecflix.vip:80/live/2D9C0C398918689B8650CC3D84FEB4D7/516778.m3u8",
            backupUrl: "http://tecflix.vip:80/live/2D9C0C398918689B8650CC3D84FEB4D7/516825.m3u8",
          },
        ],
      },
    ]
  );

  // المسيرة Group
  await createChannelGroup(
    newsCategory.id,
    "المسيرة",
    null,
    6,
    [
      {
        name: "المسيرة",
        displayOrder: 1,
        streams: [
          {
            quality: "",
            url: "http://tecflix.vip:80/live/2D9C0C398918689B8650CC3D84FEB4D7/516780.m3u8",
            backupUrl: "http://tecflix.vip:80/live/2D9C0C398918689B8650CC3D84FEB4D7/516781.m3u8",
          },
        ],
      },
      {
        name: "المسيرة 2",
        displayOrder: 2,
        streams: [
          {
            quality: "",
            url: "http://tecflix.vip:80/live/2D9C0C398918689B8650CC3D84FEB4D7/516782.m3u8",
            backupUrl: "http://tecflix.vip:80/live/2D9C0C398918689B8650CC3D84FEB4D7/516783.m3u8",
          },
        ],
      },
    ]
  );

  // قنوات فلسطينية
  await createChannelGroup(
    newsCategory.id,
    "قنوات فلسطينية",
    null,
    7,
    [
      {
        name: "فلسطين اليوم",
        displayOrder: 1,
        streams: [
          {
            quality: "",
            url: "http://tecflix.vip:80/live/2D9C0C398918689B8650CC3D84FEB4D7/516784.m3u8",
            backupUrl: "http://tecflix.vip:80/live/2D9C0C398918689B8650CC3D84FEB4D7/516827.m3u8",
          },
        ],
      },
      {
        name: "الأقصى",
        displayOrder: 2,
        streams: [
          {
            quality: "",
            url: "http://tecflix.vip:80/live/2D9C0C398918689B8650CC3D84FEB4D7/516785.m3u8",
            backupUrl: "http://tecflix.vip:80/live/2D9C0C398918689B8650CC3D84FEB4D7/516828.m3u8",
          },
        ],
      },
    ]
  );

  // قنوات لبنانية
  await createChannelGroup(
    newsCategory.id,
    "قنوات لبنانية",
    null,
    8,
    [
      {
        name: "المنار",
        displayOrder: 1,
        streams: [
          {
            quality: "",
            url: "http://tecflix.vip:80/live/2D9C0C398918689B8650CC3D84FEB4D7/516788.m3u8",
            backupUrl: "http://tecflix.vip:80/live/2D9C0C398918689B8650CC3D84FEB4D7/516789.m3u8",
          },
        ],
      },
      {
        name: "Al Mayadeen English",
        displayOrder: 2,
        streams: [
          {
            quality: "",
            url: "http://tecflix.vip:80/live/2D9C0C398918689B8650CC3D84FEB4D7/516790.m3u8",
            backupUrl: "http://tecflix.vip:80/live/2D9C0C398918689B8650CC3D84FEB4D7/516831.m3u8",
          },
        ],
      },
      {
        name: "LBCI",
        displayOrder: 3,
        streams: [
          {
            quality: "",
            url: "http://tecflix.vip:80/live/2D9C0C398918689B8650CC3D84FEB4D7/516791.m3u8",
            backupUrl: "http://tecflix.vip:80/live/2D9C0C398918689B8650CC3D84FEB4D7/516832.m3u8",
          },
        ],
      },
      {
        name: "OTV",
        displayOrder: 4,
        streams: [
          {
            quality: "",
            url: "http://tecflix.vip:80/live/2D9C0C398918689B8650CC3D84FEB4D7/516792.m3u8",
            backupUrl: "http://tecflix.vip:80/live/2D9C0C398918689B8650CC3D84FEB4D7/516833.m3u8",
          },
        ],
      },
      {
        name: "MTV",
        displayOrder: 5,
        streams: [
          {
            quality: "",
            url: "http://tecflix.vip:80/live/2D9C0C398918689B8650CC3D84FEB4D7/516793.m3u8",
            backupUrl: "http://tecflix.vip:80/live/2D9C0C398918689B8650CC3D84FEB4D7/516834.m3u8",
          },
        ],
      },
      {
        name: "Future TV",
        displayOrder: 6,
        streams: [
          {
            quality: "",
            url: "http://tecflix.vip:80/live/2D9C0C398918689B8650CC3D84FEB4D7/516794.m3u8",
            backupUrl: "http://tecflix.vip:80/live/2D9C0C398918689B8650CC3D84FEB4D7/516835.m3u8",
          },
        ],
      },
      {
        name: "الجديد",
        displayOrder: 7,
        streams: [
          {
            quality: "",
            url: "http://tecflix.vip:80/live/2D9C0C398918689B8650CC3D84FEB4D7/516795.m3u8",
            backupUrl: "http://tecflix.vip:80/live/2D9C0C398918689B8650CC3D84FEB4D7/516836.m3u8",
          },
        ],
      },
      {
        name: "Tele Liban",
        displayOrder: 8,
        streams: [
          {
            quality: "",
            url: "http://tecflix.vip:80/live/2D9C0C398918689B8650CC3D84FEB4D7/516796.m3u8",
            backupUrl: "http://tecflix.vip:80/live/2D9C0C398918689B8650CC3D84FEB4D7/516837.m3u8",
          },
        ],
      },
      {
        name: "NBN",
        displayOrder: 9,
        streams: [
          {
            quality: "",
            url: "http://tecflix.vip:80/live/2D9C0C398918689B8650CC3D84FEB4D7/516797.m3u8",
            backupUrl: "http://tecflix.vip:80/live/2D9C0C398918689B8650CC3D84FEB4D7/516838.m3u8",
          },
        ],
      },
      {
        name: "Lebanon 24",
        displayOrder: 10,
        streams: [
          {
            quality: "",
            url: "http://tecflix.vip:80/live/2D9C0C398918689B8650CC3D84FEB4D7/516798.m3u8",
            backupUrl: "http://tecflix.vip:80/live/2D9C0C398918689B8650CC3D84FEB4D7/516839.m3u8",
          },
        ],
      },
    ]
  );

  // Press TV
  await createChannelGroup(
    newsCategory.id,
    "قنوات إيرانية",
    null,
    9,
    [
      {
        name: "Press TV",
        displayOrder: 1,
        streams: [
          {
            quality: "",
            url: "http://tecflix.vip:80/live/2D9C0C398918689B8650CC3D84FEB4D7/516787.m3u8",
            backupUrl: "http://tecflix.vip:80/live/2D9C0C398918689B8650CC3D84FEB4D7/516830.m3u8",
          },
        ],
      },
    ]
  );

  console.log("✓ All channels seeded successfully!");
}

seedChannels()
  .then(() => {
    console.log("Seed completed!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  });
