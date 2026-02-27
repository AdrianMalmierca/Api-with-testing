import { config } from "./src/config";
import db from "./src/db";
import { app } from "./src/app";

async function start(): Promise<void> {
  await db.initialize();

  app.listen(config.PORT, () => {
    console.log(`🎬 MIMO Movies API listening on port ${config.PORT}`);
  });
}

start();