/**
 * Seed script — creates two demo users (already friends), each with a
 * handful of journal entries across different visibilities, so the feed
 * and friends features are immediately explorable after setup.
 *
 * Run with: npm run seed  (inside /backend)
 */
import { PrismaClient, Mood, AIMode, Visibility } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("Password123!", 12);

  const demo = await prisma.user.upsert({
    where: { email: "demo@ruth.app" },
    update: {},
    create: {
      email: "demo@ruth.app",
      username: "demo",
      passwordHash,
      isEmailVerified: true,
      profile: {
        create: {
          displayName: "Demo User",
          bio: "Documenting myself, one page at a time.",
        },
      },
      settings: { create: {} },
    },
  });

  const friend = await prisma.user.upsert({
    where: { email: "sam@ruth.app" },
    update: {},
    create: {
      email: "sam@ruth.app",
      username: "sam",
      passwordHash,
      isEmailVerified: true,
      profile: {
        create: {
          displayName: "Sam",
          bio: "Also documenting myself.",
        },
      },
      settings: { create: {} },
    },
  });

  // Make them friends so the feed shows FRIENDS-visibility entries too.
  await prisma.friendship.upsert({
    where: { requesterId_addresseeId: { requesterId: demo.id, addresseeId: friend.id } },
    update: { status: "ACCEPTED" },
    create: { requesterId: demo.id, addresseeId: friend.id, status: "ACCEPTED" },
  });

  const demoEntries = [
    {
      title: "A Quiet Morning",
      rawContent:
        "woke up early today, made coffee, sat on balcony and watched sunrise it was really peaceful",
      content:
        "I woke up early today and made a cup of coffee. I sat on the balcony and watched the sunrise — it was really peaceful, and I felt grateful for the quiet.",
      mood: Mood.CALM,
      aiMode: AIMode.DIARY_STYLE,
      visibility: Visibility.PUBLIC,
      daysAgo: 1,
    },
    {
      title: "Reunion with Sam",
      rawContent:
        "today i met my friend sam we laughed a lot then we watched a movie and later i came home",
      content:
        "Today I met up with my friend Sam. We laughed a lot, catching up on everything we'd missed. Afterward, we watched a movie together before I headed home, feeling lighter than I had in weeks.",
      mood: Mood.HAPPY,
      aiMode: AIMode.DIARY_STYLE,
      visibility: Visibility.FRIENDS,
      daysAgo: 5,
    },
    {
      title: "One Year Ago Today",
      rawContent: "long day at work, tired but proud of what we shipped",
      content:
        "It was a long day at work. I'm tired, but proud of what we managed to ship as a team.",
      mood: Mood.TIRED,
      aiMode: AIMode.MINIMAL,
      visibility: Visibility.PUBLIC,
      daysAgo: 365,
    },
    {
      title: "A private note to myself",
      rawContent: "just needed to write this down for me, not ready to share it",
      content: "Just needed to write this down for myself — not ready to share it yet.",
      mood: Mood.NOSTALGIC,
      aiMode: AIMode.MINIMAL,
      visibility: Visibility.PRIVATE,
      daysAgo: 2,
    },
  ];

  const friendEntries = [
    {
      title: "First week back at the gym",
      rawContent: "went back to the gym after months off, sore but proud i started again",
      content:
        "I went back to the gym today after months away. I'm sore already, but proud that I actually started again.",
      mood: Mood.HOPEFUL,
      aiMode: AIMode.DIARY_STYLE,
      visibility: Visibility.PUBLIC,
      daysAgo: 3,
    },
    {
      title: "Rainy Sunday",
      rawContent: "stayed in all day, read a book, made soup, felt cozy",
      content: "I stayed in all day, read a book, and made soup. It felt cozy and unhurried.",
      mood: Mood.CALM,
      aiMode: AIMode.DIARY_STYLE,
      visibility: Visibility.FRIENDS,
      daysAgo: 6,
    },
  ];

  for (const e of demoEntries) {
    const entryDate = new Date();
    entryDate.setDate(entryDate.getDate() - e.daysAgo);
    await prisma.journalEntry.create({
      data: {
        userId: demo.id,
        title: e.title,
        rawContent: e.rawContent,
        content: e.content,
        mood: e.mood,
        aiMode: e.aiMode,
        visibility: e.visibility,
        entryDate,
        tags: ["seed"],
      },
    });
  }

  for (const e of friendEntries) {
    const entryDate = new Date();
    entryDate.setDate(entryDate.getDate() - e.daysAgo);
    await prisma.journalEntry.create({
      data: {
        userId: friend.id,
        title: e.title,
        rawContent: e.rawContent,
        content: e.content,
        mood: e.mood,
        aiMode: e.aiMode,
        visibility: e.visibility,
        entryDate,
        tags: ["seed"],
      },
    });
  }

  console.log("Seed complete.");
  console.log("Demo login:   demo@ruth.app / Password123!");
  console.log("Friend login: sam@ruth.app / Password123! (already friends with demo)");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
