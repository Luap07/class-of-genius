import "dotenv/config";

import { createClient } from "@supabase/supabase-js";
import path from "path";
import { fileURLToPath } from "url";

// ============================================================
// PATH
// ============================================================

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// server/middleware -> server -> cog
const ROOT_ENV_PATH = path.resolve(
  __dirname,
  "../../.env"
);

// ============================================================
// ENVIRONMENT
// ============================================================

const SUPABASE_URL =
  process.env.SUPABASE_URL?.trim();

const SUPABASE_ANON_KEY =
  process.env.SUPABASE_ANON_KEY?.trim() ||
  process.env.VITE_SUPABASE_ANON_KEY?.trim();

// ============================================================
// DEBUG
// ============================================================

console.log(
  `🔐 Auth Supabase URL: ${
    SUPABASE_URL
      ? "FOUND ✅"
      : "MISSING ❌"
  }`
);

console.log(
  `🔑 Supabase Anon Key: ${
    SUPABASE_ANON_KEY
      ? "FOUND ✅"
      : "MISSING ❌"
  }`
);

// ============================================================
// VALIDATION
// ============================================================

if (!SUPABASE_URL) {
  throw new Error(
    `SUPABASE_URL is missing. Check ${ROOT_ENV_PATH}`
  );
}

if (!SUPABASE_ANON_KEY) {
  throw new Error(
    `SUPABASE_ANON_KEY or VITE_SUPABASE_ANON_KEY is missing. Check ${ROOT_ENV_PATH}`
  );
}

// ============================================================
// SUPABASE AUTH CLIENT
// ============================================================

const supabaseAuth = createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  }
);

// ============================================================
// REQUIRE SUPABASE USER
// ============================================================

export async function requireSupabaseUser(
  req,
  res,
  next
) {
  try {
    // ----------------------------------------------------------
    // GET AUTHORIZATION HEADER
    // ----------------------------------------------------------

    const authorization =
      req.headers.authorization;

    if (!authorization) {
      return res.status(401).json({
        success: false,
        error:
          "Authorization header is required.",
      });
    }

    // ----------------------------------------------------------
    // EXTRACT BEARER TOKEN
    // ----------------------------------------------------------

    const match =
      authorization.match(
        /^Bearer\s+(.+)$/i
      );

    if (!match) {
      return res.status(401).json({
        success: false,
        error:
          "Invalid authorization format. Use Bearer <token>.",
      });
    }

    const accessToken = match[1];

    // ----------------------------------------------------------
    // VERIFY SUPABASE USER
    // ----------------------------------------------------------

    const {
      data: { user },
      error,
    } =
      await supabaseAuth.auth.getUser(
        accessToken
      );

    if (error || !user) {
      console.error(
        "❌ Supabase authentication failed:",
        error?.message || "No user found"
      );

      return res.status(401).json({
        success: false,
        error:
          "Invalid or expired authentication token.",
      });
    }

    // ----------------------------------------------------------
    // ATTACH USER TO REQUEST
    // ----------------------------------------------------------

    req.user = user;

    // Useful shortcuts for routes
    req.userId = user.id;

    // ----------------------------------------------------------
    // CONTINUE
    // ----------------------------------------------------------

    next();
  } catch (error) {
    console.error(
      "❌ requireSupabaseUser error:",
      error
    );

    if (res.headersSent) {
      return next(error);
    }

    return res.status(500).json({
      success: false,
      error:
        "Authentication service error.",
    });
  }
}

// ============================================================
// DEFAULT EXPORT
//
// This also allows either:
//
// import { requireSupabaseUser } ...
//
// OR:
//
// import requireSupabaseUser ...
//
// ============================================================

export default requireSupabaseUser;