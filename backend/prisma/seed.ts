/**
 * Seed script — creates a demo user with a handful of journal entries
 * so the app is immediately explorable after setup.
 *
 * Run with: npm run seed  (inside /backend)
 */
import { PrismaClient, Mood, AIMode } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("Password123!", 12);

  const user = await prisma.user.upsert({
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

  const entries = [
    {
      title: "A Quiet Morning",
      rawContent:
        "woke up early today, made coffee, sat on balcony and watched sunrise it was really peaceful",
      content:
        "I woke up early today and made a cup of coffee. I sat on the balcony and watched the sunrise — it was really peaceful, and I felt grateful for the quiet.",
      mood: Mood.CALM,
      aiMode: AIMode.DIARY_STYLE,
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
      daysAgo: 5,
    },
    {
      title: "One Year Ago Today",
      rawContent: "long day at work, tired but proud of what we shipped",
      content:
        "It was a long day at work. I'm tired, but proud of what we managed to ship as a team.",
      mood: Mood.TIRED,
      aiMode: AIMode.MINIMAL,
      daysAgo: 365,
    },
  ];

  for (const e of entries) {
    const entryDate = new Date();
    entryDate.setDate(entryDate.getDate() - e.daysAgo);

    await prisma.journalEntry.create({
      data: {
        userId: user.id,
        title: e.title,
        rawContent: e.rawContent,
        content: e.content,
        mood: e.mood,
        aiMode: e.aiMode,
        entryDate,
        tags: ["seed"],
      },
    });
  }

  console.log("Seed complete. Demo login: demo@ruth.app / Password123!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
