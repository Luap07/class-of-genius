import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";

// ============================================================
// LOAD ROOT .ENV
// ============================================================
//
// Project structure:
//
// cog/
// ├── .env
// ├── client/
// └── server/
//     ├── server.js
//     └── lib/
//         └── supabaseAdmin.js
//
// Therefore ../../ from this file is:
//
// C:\Users\DELL\cog\.env
//

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT_ENV_PATH = path.resolve(
  __dirname,
  "../../.env"
);

// ============================================================
// LOAD ENVIRONMENT
// ============================================================

const envResult = dotenv.config({
  path: ROOT_ENV_PATH,
});

// ============================================================
// ENVIRONMENT ERROR
// ============================================================

if (envResult.error) {
  console.error("");
  console.error(
    "=================================================="
  );
  console.error(
    "❌ ENVIRONMENT FILE ERROR"
  );
  console.error(
    "=================================================="
  );

  console.error(
    `Expected .env at: ${ROOT_ENV_PATH}`
  );

  console.error(
    envResult.error.message
  );

  console.error(
    "=================================================="
  );
  console.error("");

  throw envResult.error;
}

// ============================================================
// ENVIRONMENT VARIABLES
// ============================================================

const SUPABASE_URL =
  process.env.SUPABASE_URL?.trim();

const SUPABASE_SERVICE_ROLE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

// ============================================================
// DEBUG
// ============================================================

console.log(
  `🔐 Supabase .env: ${ROOT_ENV_PATH}`
);

console.log(
  `🔐 SUPABASE_URL: ${
    SUPABASE_URL
      ? "FOUND ✅"
      : "MISSING ❌"
  }`
);

console.log(
  `🔑 SUPABASE_SERVICE_ROLE_KEY: ${
    SUPABASE_SERVICE_ROLE_KEY
      ? "FOUND ✅"
      : "MISSING ❌"
  }`
);

// ============================================================
// VALIDATION
// ============================================================

if (!SUPABASE_URL) {
  throw new Error(
    `SUPABASE_URL is missing. Expected it in:\n${ROOT_ENV_PATH}`
  );
}

if (!SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error(
    `SUPABASE_SERVICE_ROLE_KEY is missing. Expected it in:\n${ROOT_ENV_PATH}`
  );
}

// ============================================================
// SUPABASE ADMIN CLIENT
// ============================================================
//
// Service-role key is server-side only.
// NEVER expose this key in your React frontend.
//

export const supabaseAdmin = createClient(
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

// ============================================================
// DEFAULT EXPORT
// ============================================================

export default supabaseAdmin;