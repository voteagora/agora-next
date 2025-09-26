#!/usr/bin/env tsx

// Load environment variables FIRST, before any other imports
import { config } from "dotenv";
config();

import { ForumSearchService } from "@/lib/search";


async function main() {
  console.log("🚀 Initializing forum index...");
  
  try {
    const forumSearchService = new ForumSearchService();
    await forumSearchService.initializeIndex("UNI");
    console.log("✅ Forum index initialized successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Failed to initialize forum index:", error);
    process.exit(1);
  }
}

main();
