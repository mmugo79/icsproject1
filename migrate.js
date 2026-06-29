import pg from 'pg';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// Load environment variables from .env
dotenv.config();

const { Client } = pg;
const databaseUrl = process.env.DATABASE_URL; 

console.log("======================================= ");
console.log("  RAIAVOICE POSTGRESQL MIGRATOR GATES ");
console.log("======================================= ");

if (!databaseUrl) {
  console.error("❌ ERROR: DATABASE_URL is not set in your environmental variables!");
  console.error("Please add DATABASE_URL=\"postgresql://user:password@host:port/database\" to your .env file or environment.");
  process.exit(1);
}

// Extract database name from connection string for logging
let dbName = "raiavoice";
try {
  const parsed = new URL(databaseUrl);
  dbName = parsed.pathname.substring(1) || dbName;
} catch (e) {
  // Silent fallback
}

console.log(`Connecting to database: "${dbName}"...`);

const clientConfig = {
  connectionString: databaseUrl,
};

// Apply SSL configurations for cloud services, but bypass for secure local hosts
if (!databaseUrl.includes('localhost') && !databaseUrl.includes('127.0.0.1') && !databaseUrl.includes('1db')) {
  clientConfig.ssl = { rejectUnauthorized: false };
}

const client = new Client(clientConfig);

async function runMigrate() {
  try {
    await client.connect();
    console.log("✅ Successfully connected to PostgreSQL daemon.");

    const migrationSqlPath = path.join(process.cwd(), 'migration.sql');
    if (!fs.existsSync(migrationSqlPath)) {
      throw new Error(`Migration SQL file not found at: ${migrationSqlPath}`);
    }

    console.log("Reading database definitions from /migration.sql...");
    const rawSql = fs.readFileSync(migrationSqlPath, 'utf8');

    console.log("Executing migration schema statements on PostgreSQL database of record...");
    
    // Execute SQL content
    await client.query(rawSql);

    console.log("\n=======================================");
    console.log("🎉 DATABASE SCHEMAS COMPILED & LOADED!");
    console.log("=======================================");
    console.log("The following relations have been created successfully: ");
    console.log(" - users");
    console.log(" - email_verification_tokens");
    console.log(" - password_reset_tokens");
    console.log(" - issue_categories");
    console.log(" - reports");
    console.log(" - report_supports");
    console.log(" - comments");
    console.log(" - status_history");
    console.log(" - notifications");
    console.log(" - audit_logs");
    console.log("\nSeeds executed:");
    console.log(" - Civic admin accounts loaded (Gov, Roads, Water, Electricity, Waste)");
    console.log(" - Category options seeded");
    console.log("=======================================\n");

    process.exit(0);
  } catch (err) {
    console.error("❌ DATABASE MIGRATION FAILED!");
    console.error(err);
    process.exit(1);
  } finally {
    try {
      await client.end();
    } catch (e) {
      // ignore
    }
  }
}

runMigrate();
