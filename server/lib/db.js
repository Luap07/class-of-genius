import dotenv from "dotenv";
import pg from "pg";
import path from "path";
import { fileURLToPath } from "url";

const { Pool } = pg;

/*
|--------------------------------------------------------------------------
| Resolve project root reliably
|--------------------------------------------------------------------------
*/

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// db.js:
// C:\Users\DELL\cog\server\lib\db.js
//
// Project root:
// C:\Users\DELL\cog

const projectRoot = path.resolve(__dirname, "../..");

const envPath = path.join(projectRoot, ".env");

console.log("");
console.log("==============================================");
console.log("🗄️ DATABASE CONFIGURATION");
console.log("==============================================");
console.log("📁 Project root:", projectRoot);
console.log("📄 .env path:", envPath);

/*
|--------------------------------------------------------------------------
| Load root .env
|--------------------------------------------------------------------------
*/

dotenv.config({
  path: envPath,
  override: false,
});

const databaseUrl = process.env.DATABASE_URL;

console.log(
  "DATABASE_URL exists:",
  Boolean(databaseUrl)
);

if (!databaseUrl) {
  console.error("");
  console.error("❌ DATABASE_URL is missing.");
  console.error("❌ Expected file:");
  console.error(envPath);
  console.error("");
  console.error(
    "Make sure your root .env contains DATABASE_URL=..."
  );
  console.error("");
} else {
  try {
    const database = new URL(databaseUrl);

    console.log(
      "Database protocol:",
      database.protocol
    );

    console.log(
      "Database host:",
      database.hostname
    );

    console.log(
      "Database port:",
      database.port || "5432"
    );

    console.log(
      "Database name:",
      database.pathname
    );

    console.log("✅ Neon DATABASE_URL loaded.");
  } catch (error) {
    console.error("");
    console.error("❌ DATABASE_URL is invalid.");
    console.error(error.message);
    console.error("");
  }
}

console.log("==============================================");
console.log("");

/*
|--------------------------------------------------------------------------
| Stop if DATABASE_URL is missing
|--------------------------------------------------------------------------
*/

if (!databaseUrl) {
  throw new Error(
    "DATABASE_URL is missing. Add your Neon PostgreSQL connection string to C:\\Users\\DELL\\cog\\.env"
  );
}

/*
|--------------------------------------------------------------------------
| Neon PostgreSQL Pool
|--------------------------------------------------------------------------
*/

const pool = new Pool({
  connectionString: databaseUrl,

  ssl: {
    rejectUnauthorized: false,
  },

  max: 10,

  idleTimeoutMillis: 30000,

  connectionTimeoutMillis: 10000,
});

/*
|--------------------------------------------------------------------------
| PostgreSQL pool errors
|--------------------------------------------------------------------------
*/

pool.on("error", (error) => {
  console.error("");
  console.error("❌ PostgreSQL Pool Error");
  console.error("Message:", error?.message);
  console.error("Code:", error?.code);
  console.error("Detail:", error?.detail);
  console.error("");
});

/*
|--------------------------------------------------------------------------
| Test Neon connection
|--------------------------------------------------------------------------
*/

const testDatabaseConnection = async () => {
  try {
    const result = await pool.query(
      "SELECT NOW() AS current_time"
    );

    console.log(
      "✅ Neon PostgreSQL connection successful."
    );

    console.log(
      "🕐 Database time:",
      result.rows[0]?.current_time
    );

    console.log("");
  } catch (error) {
    console.error("");
    console.error(
      "❌ Neon PostgreSQL connection failed."
    );

    console.error(
      "Message:",
      error?.message
    );

    console.error(
      "Code:",
      error?.code
    );

    console.error(
      "Detail:",
      error?.detail
    );

    console.error("");
  }
};

testDatabaseConnection();

export default pool;