import db from "../src/db";
import * as fs from "fs";
import { config } from "../src/config";

async function reset(): Promise<void> {
  console.log("🗑️  Deleting database...");

  //Close database connection if open
  try {
    await db.close();
  } catch {
    //Ignore closure errors
  }

  //Delete database file if it exists
  if (fs.existsSync(config.DB_PATH)) {
    fs.unlinkSync(config.DB_PATH);
    console.log(`   File ${config.DB_PATH} deleted`);
  } else {
    console.log(`   File ${config.DB_PATH} did not exist`);
  }

  console.log("\n✅ Database reset successfully!");
  console.log("   Run 'npm run db:seed' to populate with test data");
}

reset().catch((error) => {
  console.error("❌ Error resetting the database:", error);
  process.exit(1);
});

