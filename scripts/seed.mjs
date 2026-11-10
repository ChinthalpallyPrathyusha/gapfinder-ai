import "dotenv/config";
import { seedDemoAccounts } from "../lib/seed-service.ts";

async function runSeed() {
  console.log("Seeding demo accounts and curriculum into Neon Postgres...");
  const result = await seedDemoAccounts();
  console.log("Database seeded successfully! Demo Student ID:", result.studentId);
}

runSeed().catch((err) => {
  console.error("Seeding error:", err);
  process.exit(1);
});
