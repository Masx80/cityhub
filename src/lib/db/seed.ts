import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { categories } from "@/db/schema";

// Initialize Neon Postgres client
const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

// Seed data
const categoryData = [
  { name: "Amateur", description: "Real couples and home-made content" },
  { name: "Anal", description: "Explicit anal sex scenes" },
  { name: "Asian", description: "Asian performers in a variety of scenes" },
  { name: "BBW", description: "Big beautiful women content" },
  { name: "Big Tits", description: "Large-breasted performers" },
  { name: "Blowjob", description: "Oral sex performed on men" },
  { name: "Bondage", description: "Light to extreme bondage scenes" },
  { name: "Creampie", description: "Internal ejaculation scenes" },
  { name: "Cuckold", description: "Watching partner with another person" },
  { name: "DP", description: "Double penetration scenes" },
  { name: "Ebony", description: "Black performers in adult scenes" },
  { name: "Feet", description: "Foot fetishes and foot play" },
  { name: "Fisting", description: "Explicit fisting content" },
  { name: "Group", description: "Threesomes and orgies" },
  { name: "Hardcore", description: "Rough and intense sex scenes" },
  { name: "Interracial", description: "Mixed-race sexual encounters" },
  { name: "Lesbian", description: "Female-on-female content" },
  { name: "MILF", description: "Mature women in sexual scenes" },
  { name: "Public", description: "Sex in public or semi-public places" },
  { name: "Teen", description: "Young (18+) adult performers" },
  { name: "Titfuck", description: "Breast-focused sex acts" },
  { name: "Trans", description: "Transgender performers and content" },
  { name: "Voyeur", description: "Watching others without them knowing" },
  { name: "Roleplay", description: "Fantasy and character-driven scenes" },
  { name: "Massage", description: "Erotic massage leading to sex" },
  { name: "Pantyhose", description: "Focus on nylons and fetish wear" },
];

// Seeding function
async function seedCategories() {
  try {
    console.log("Seeding categories...");

    const values = categoryData.map((cat) => ({
      name: cat.name,
      description: cat.description,
    }));

    await db.insert(categories).values(values).onConflictDoNothing();

    console.log("Categories seeded successfully!");
  } catch (error) {
    console.error("Error seeding categories:", error);
  }
}

// Run the seeder
seedCategories();
