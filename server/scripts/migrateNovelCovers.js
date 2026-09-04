import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import pool from "../lib/db.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ============================================================
// CONFIG
// ============================================================

const SERVER_PORT = process.env.PORT || 5000;

const PUBLIC_API_URL = (
  process.env.PUBLIC_API_URL ||
  process.env.BACKEND_URL ||
  `http://localhost:${SERVER_PORT}`
)
  .trim()
  .replace(/\/+$/, "");

const UPLOAD_DIR = path.join(
  __dirname,
  "..",
  "uploads",
  "covers"
);

// Old Supabase URL from your existing database
const OLD_SUPABASE_HOST = "iulnmfxoshfolxnhmbhb.supabase.co";

// ============================================================
// HELPERS
// ============================================================

function isOldSupabaseCover(url) {
  if (!url || typeof url !== "string") {
    return false;
  }

  return (
    url.includes(OLD_SUPABASE_HOST) ||
    url.includes("/storage/v1/object/public/covers/")
  );
}

function getFilenameFromUrl(url) {
  try {
    const parsed = new URL(url);

    const pathname = decodeURIComponent(parsed.pathname);

    let filename = path.basename(pathname);

    if (!filename || filename === "/" || filename === ".") {
      return null;
    }

    // Remove unsafe characters
    filename = filename
      .replace(/[<>:"/\\|?*\x00-\x1F]/g, "_")
      .replace(/\s+/g, "-")
      .trim();

    // Prevent weird filenames
    if (!filename) {
      return null;
    }

    return filename;
  } catch {
    return null;
  }
}

async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function getUniqueFilename(filename) {
  const extension = path.extname(filename);
  const base = path.basename(filename, extension);

  let candidate = filename;
  let counter = 1;

  while (await fileExists(path.join(UPLOAD_DIR, candidate))) {
    candidate = `${base}-${counter}${extension}`;
    counter++;
  }

  return candidate;
}

async function downloadImage(url) {
  console.log(`   ↓ Downloading...`);

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(
      `Download failed: HTTP ${response.status} ${response.statusText}`
    );
  }

  const contentType = (
    response.headers.get("content-type") || ""
  ).toLowerCase();

  if (!contentType.startsWith("image/")) {
    throw new Error(
      `URL did not return an image. Content-Type: ${contentType || "unknown"}`
    );
  }

  const arrayBuffer = await response.arrayBuffer();

  if (!arrayBuffer.byteLength) {
    throw new Error("Downloaded image is empty.");
  }

  return Buffer.from(arrayBuffer);
}

// ============================================================
// MAIN MIGRATION
// ============================================================

async function migrateNovelCovers() {
  console.log("");
  console.log("==================================================");
  console.log("      SCHOLIQEN NOVEL COVER MIGRATION");
  console.log("==================================================");
  console.log("");

  console.log("Upload directory:");
  console.log(UPLOAD_DIR);

  console.log("");

  // Make sure upload directory exists
  await fs.mkdir(UPLOAD_DIR, {
    recursive: true,
  });

  // ----------------------------------------------------------
  // GET NOVELS
  // ----------------------------------------------------------

  console.log("📚 Loading novels from Neon...");

  const result = await pool.query(`
    SELECT
      id,
      title,
      cover_url
    FROM novels
    ORDER BY created_at DESC NULLS LAST, title ASC
  `);

  const novels = result.rows;

  console.log(`✅ Found ${novels.length} novel(s).`);
  console.log("");

  // ----------------------------------------------------------
  // FILTER NOVELS THAT STILL USE SUPABASE
  // ----------------------------------------------------------

  const novelsToMigrate = novels.filter((novel) =>
    isOldSupabaseCover(novel.cover_url)
  );

  console.log(
    `🔎 Found ${novelsToMigrate.length} novel(s) with old Supabase covers.`
  );

  console.log("");

  if (novelsToMigrate.length === 0) {
    console.log("🎉 Nothing needs to be migrated.");
    console.log("");
    return;
  }

  // ----------------------------------------------------------
  // COUNTERS
  // ----------------------------------------------------------

  let successful = 0;
  let failed = 0;
  let skipped = 0;

  const failures = [];

  // ----------------------------------------------------------
  // MIGRATE EACH COVER
  // ----------------------------------------------------------

  for (let index = 0; index < novelsToMigrate.length; index++) {
    const novel = novelsToMigrate[index];

    console.log("--------------------------------------------------");
    console.log(
      `[${index + 1}/${novelsToMigrate.length}] ${novel.title}`
    );
    console.log("ID:", novel.id);
    console.log("Old cover:", novel.cover_url);

    try {
      if (!novel.cover_url) {
        console.log("⚠️ No cover URL. Skipping.");
        skipped++;
        continue;
      }

      const originalFilename = getFilenameFromUrl(
        novel.cover_url
      );

      if (!originalFilename) {
        throw new Error(
          "Could not determine filename from old cover URL."
        );
      }

      const filename = await getUniqueFilename(
        originalFilename
      );

      const destinationPath = path.join(
        UPLOAD_DIR,
        filename
      );

      // ------------------------------------------------------
      // DOWNLOAD
      // ------------------------------------------------------

      const imageBuffer = await downloadImage(
        novel.cover_url
      );

      // ------------------------------------------------------
      // SAVE
      // ------------------------------------------------------

      await fs.writeFile(
        destinationPath,
        imageBuffer
      );

      console.log(
        `   💾 Saved: ${filename}`
      );

      // ------------------------------------------------------
      // NEW URL
      // ------------------------------------------------------

      const newCoverUrl =
        `${PUBLIC_API_URL}/uploads/covers/${encodeURIComponent(
          filename
        )}`;

      console.log(
        `   🔗 New URL: ${newCoverUrl}`
      );

      // ------------------------------------------------------
      // UPDATE NEON
      // ------------------------------------------------------

      await pool.query(
        `
          UPDATE novels
          SET cover_url = $1
          WHERE id = $2
        `,
        [
          newCoverUrl,
          novel.id,
        ]
      );

      console.log(
        "   ✅ Database updated."
      );

      successful++;
    } catch (error) {
      failed++;

      console.error(
        "   ❌ Migration failed:"
      );

      console.error(
        `   ${error?.message || error}`
      );

      failures.push({
        id: novel.id,
        title: novel.title,
        oldCover: novel.cover_url,
        error:
          error?.message || String(error),
      });

      // If something went wrong after creating the file,
      // we deliberately leave it alone for inspection.
    }

    console.log("");
  }

  // ----------------------------------------------------------
  // FINAL REPORT
  // ----------------------------------------------------------

  console.log("");
  console.log("==================================================");
  console.log("                 MIGRATION REPORT");
  console.log("==================================================");
  console.log("");

  console.log(
    `📚 Total novels:        ${novels.length}`
  );

  console.log(
    `🔎 Old covers found:    ${novelsToMigrate.length}`
  );

  console.log(
    `✅ Successfully moved:  ${successful}`
  );

  console.log(
    `❌ Failed:              ${failed}`
  );

  console.log(
    `⚠️ Skipped:             ${skipped}`
  );

  console.log("");

  // ----------------------------------------------------------
  // FAILURE REPORT
  // ----------------------------------------------------------

  if (failures.length > 0) {
    console.log("==================================================");
    console.log("                  FAILED COVERS");
    console.log("==================================================");
    console.log("");

    for (const failure of failures) {
      console.log(`❌ ${failure.title}`);
      console.log(`   ID: ${failure.id}`);
      console.log(`   URL: ${failure.oldCover}`);
      console.log(`   Error: ${failure.error}`);
      console.log("");
    }
  }

  console.log("==================================================");
  console.log("");

  if (failed === 0) {
    console.log(
      "🎉 NOVEL COVER MIGRATION COMPLETED SUCCESSFULLY."
    );
  } else {
    console.log(
      "⚠️ MIGRATION COMPLETED WITH SOME FAILURES."
    );

    console.log(
      "The failed covers were NOT deleted from Supabase."
    );
  }

  console.log("");

  // Close database connection
  await pool.end();
}

// ============================================================
// RUN
// ============================================================

migrateNovelCovers()
  .catch((error) => {
    console.error("");
    console.error("==================================================");
    console.error("❌ MIGRATION SCRIPT ERROR");
    console.error("==================================================");
    console.error("");
    console.error(error);
    console.error("");

    process.exitCode = 1;
  });