console.log("==============================================");
console.log("🚚 SCHOLIQEN DOCUMENT MIGRATION");
console.log("==============================================");

import "dotenv/config";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";
import pool from "../lib/db.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SERVER_DIR = path.resolve(__dirname, "..");

const DOCUMENTS_DIR = path.join(
  SERVER_DIR,
  "uploads",
  "documents"
);

const THUMBNAILS_DIR = path.join(
  SERVER_DIR,
  "uploads",
  "thumbnails"
);

const SUPABASE_URL =
  process.env.SUPABASE_URL ||
  process.env.VITE_SUPABASE_URL;

const SUPABASE_SERVICE_ROLE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY;

const BACKEND_URL = (
  process.env.BACKEND_URL ||
  "http://localhost:5000"
).replace(/\/+$/, "");

const DOCUMENT_BUCKET = "course-documents";
const THUMBNAIL_BUCKET = "course-thumbnails";

if (!SUPABASE_URL) {
  console.error("❌ SUPABASE_URL is missing.");
  process.exit(1);
}

if (!SUPABASE_SERVICE_ROLE_KEY) {
  console.error(
    "❌ SUPABASE_SERVICE_ROLE_KEY is missing."
  );
  process.exit(1);
}

const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

fs.mkdirSync(DOCUMENTS_DIR, {
  recursive: true,
});

fs.mkdirSync(THUMBNAILS_DIR, {
  recursive: true,
});

const cleanName = (name) =>
  String(name || "file")
    .replace(/[^a-zA-Z0-9._-]/g, "_");

const getStoragePath = (url, bucket) => {
  if (!url) return null;

  const value = String(url);

  const markers = [
    `/storage/v1/object/public/${bucket}/`,
    `/storage/v1/object/authenticated/${bucket}/`,
    `/storage/v1/object/sign/${bucket}/`,
  ];

  for (const marker of markers) {
    const index = value.indexOf(marker);

    if (index !== -1) {
      return decodeURIComponent(
        value
          .slice(index + marker.length)
          .split("?")[0]
      );
    }
  }

  if (
    !value.startsWith("http://") &&
    !value.startsWith("https://")
  ) {
    return value
      .replace(/^\/+/, "")
      .replace(
        new RegExp(`^${bucket}/`),
        ""
      );
  }

  return null;
};

const downloadFile = async (
  bucket,
  storagePath,
  destination
) => {
  if (fs.existsSync(destination)) {
    console.log(
      `   ✓ Already exists: ${path.basename(destination)}`
    );

    return true;
  }

  console.log(
    `   ↓ Downloading ${storagePath}`
  );

  const {
    data,
    error,
  } = await supabase.storage
    .from(bucket)
    .download(storagePath);

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    throw new Error(
      "Supabase returned no file."
    );
  }

  const buffer = Buffer.from(
    await data.arrayBuffer()
  );

  fs.writeFileSync(
    destination,
    buffer
  );

  console.log(
    `   ✓ Saved ${path.basename(destination)}`
  );

  return true;
};

const localUrl = (
  folder,
  filename
) =>
  `${BACKEND_URL}/uploads/${folder}/${encodeURIComponent(
    filename
  )}`;

const getNeonCategoryId = async (
  categoryId
) => {
  if (!categoryId) return null;

  try {
    const result =
      await pool.query(
        `
        SELECT id
        FROM course_categories
        WHERE id = $1
        LIMIT 1
        `,
        [categoryId]
      );

    return (
      result.rows[0]?.id ||
      null
    );
  } catch {
    return null;
  }
};

const main = async () => {
  console.log(
    `📡 Supabase: ${SUPABASE_URL}`
  );

  console.log(
    `📁 Documents: ${DOCUMENTS_DIR}`
  );

  console.log(
    `🖼️ Thumbnails: ${THUMBNAILS_DIR}`
  );

  console.log("");

  const {
    data: documents,
    error,
  } = await supabase
    .from("documents")
    .select("*")
    .order("created_at", {
      ascending: true,
    });

  if (error) {
    throw new Error(
      `Could not fetch documents: ${error.message}`
    );
  }

  console.log(
    `📚 Found ${documents?.length || 0} old documents.`
  );

  if (!documents?.length) {
    console.log(
      "ℹ️ Nothing to migrate."
    );

    return;
  }

  let success = 0;
  let failed = 0;

  for (
    let i = 0;
    i < documents.length;
    i++
  ) {
    const doc = documents[i];

    console.log(
      `\n[${i + 1}/${documents.length}] ${
        doc.title || "Untitled"
      }`
    );

    try {
      let fileUrl =
        doc.file_url || null;

      let thumbnailUrl =
        doc.thumbnail_url || null;

      // ======================================================
      // DOCUMENT FILE
      // ======================================================

      const documentPath =
        getStoragePath(
          doc.file_url,
          DOCUMENT_BUCKET
        );

      if (documentPath) {
        const originalName =
          cleanName(
            path.basename(
              documentPath
            )
          );

        const filename =
          `${doc.id}_${originalName}`;

        const destination =
          path.join(
            DOCUMENTS_DIR,
            filename
          );

        await downloadFile(
          DOCUMENT_BUCKET,
          documentPath,
          destination
        );

        fileUrl = localUrl(
          "documents",
          filename
        );
      }

      // ======================================================
      // THUMBNAIL
      // ======================================================

      const thumbnailPath =
        getStoragePath(
          doc.thumbnail_url,
          THUMBNAIL_BUCKET
        );

      if (thumbnailPath) {
        const originalName =
          cleanName(
            path.basename(
              thumbnailPath
            )
          );

        const filename =
          `${doc.id}_${originalName}`;

        const destination =
          path.join(
            THUMBNAILS_DIR,
            filename
          );

        await downloadFile(
          THUMBNAIL_BUCKET,
          thumbnailPath,
          destination
        );

        thumbnailUrl = localUrl(
          "thumbnails",
          filename
        );
      }

      // ======================================================
      // CATEGORY
      // ======================================================

      const categoryId =
        await getNeonCategoryId(
          doc.category_id
        );

      // ======================================================
      // INSERT / UPDATE NEON
      // ======================================================

      await pool.query(
        `
        INSERT INTO documents (
          id,
          title,
          description,
          category_id,
          file_url,
          thumbnail_url,
          file_type,
          file_size,
          created_at
        )
        VALUES (
          $1,
          $2,
          $3,
          $4,
          $5,
          $6,
          $7,
          $8,
          COALESCE($9, NOW())
        )
        ON CONFLICT (id)
        DO UPDATE SET
          title = EXCLUDED.title,
          description = EXCLUDED.description,
          category_id = EXCLUDED.category_id,
          file_url = EXCLUDED.file_url,
          thumbnail_url = EXCLUDED.thumbnail_url,
          file_type = EXCLUDED.file_type,
          file_size = EXCLUDED.file_size
        `,
        [
          doc.id,
          doc.title ||
            "Untitled Document",
          doc.description || "",
          categoryId,
          fileUrl,
          thumbnailUrl,
          doc.file_type || null,
          doc.file_size || null,
          doc.created_at || null,
        ]
      );

      console.log(
        "   ✅ Neon record saved."
      );

      success++;
    } catch (err) {
      failed++;

      console.error(
        `   ❌ FAILED: ${err.message}`
      );
    }
  }

  console.log("");
  console.log(
    "=============================================="
  );
  console.log(
    "🎉 DOCUMENT MIGRATION COMPLETE"
  );
  console.log(
    "=============================================="
  );
  console.log(
    `📚 Total: ${documents.length}`
  );
  console.log(
    `✅ Successful: ${success}`
  );
  console.log(
    `❌ Failed: ${failed}`
  );
  console.log(
    "=============================================="
  );
};

main()
  .catch((error) => {
    console.error("");
    console.error(
      "❌ MIGRATION ERROR:"
    );
    console.error(
      error.message
    );

    process.exitCode = 1;
  })
  .finally(async () => {
    try {
      await pool.end();
    } catch {}
  });
