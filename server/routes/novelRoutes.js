import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import pool from "../lib/db.js";

const router = express.Router();

/* =========================================================
   PATH SETUP
   ========================================================= */

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// server/uploads/covers
const uploadDir = path.join(__dirname, "../uploads/covers");

// Create folder automatically
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, {
    recursive: true,
  });
}

/* =========================================================
   MULTER STORAGE
   ========================================================= */

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },

  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();

    const safeName = path
      .basename(file.originalname, ext)
      .replace(/[^a-zA-Z0-9-_]/g, "-")
      .replace(/-+/g, "-")
      .toLowerCase();

    cb(
      null,
      `${Date.now()}-${safeName}${ext}`
    );
  },
});

/* =========================================================
   FILE FILTER
   ========================================================= */

const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Only JPG, JPEG, PNG and WEBP cover images are allowed."
      ),
      false
    );
  }
};

/* =========================================================
   UPLOAD CONFIG
   ========================================================= */

const upload = multer({
  storage,
  fileFilter,

  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

/* =========================================================
   HELPERS
   ========================================================= */

/**
 * Parse chapters safely.
 */
const parseChapters = (chapters) => {
  if (chapters === undefined || chapters === null || chapters === "") {
    return null;
  }

  if (Array.isArray(chapters)) {
    return chapters;
  }

  if (typeof chapters === "string") {
    return JSON.parse(chapters);
  }

  return null;
};

/**
 * Delete a locally stored cover.
 *
 * Only deletes files inside uploads/covers.
 */
const deleteCoverFile = (coverUrl) => {
  if (!coverUrl || typeof coverUrl !== "string") {
    return;
  }

  if (!coverUrl.startsWith("/uploads/covers/")) {
    return;
  }

  const filename = path.basename(coverUrl);

  if (!filename) {
    return;
  }

  const filePath = path.join(uploadDir, filename);

  // Extra safety check.
  if (!filePath.startsWith(uploadDir)) {
    return;
  }

  if (fs.existsSync(filePath)) {
    try {
      fs.unlinkSync(filePath);

      console.log(
        `🗑️ Deleted cover: ${filename}`
      );
    } catch (error) {
      console.error(
        "Could not delete cover:",
        error
      );
    }
  }
};

/**
 * Return the standard novel fields.
 */
const NOVEL_FIELDS = `
  id,
  title,
  genre,
  description,
  chapters,
  created_at,
  cover_url,
  introduction,
  likes,
  author,
  status
`;

/* =========================================================
   GET ALL NOVELS
   GET /api/novels
   ========================================================= */

router.get("/", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        ${NOVEL_FIELDS}
      FROM novels
      ORDER BY created_at DESC NULLS LAST, title ASC
    `);

    return res.status(200).json({
      success: true,
      novels: result.rows,
      count: result.rows.length,
      total: result.rows.length,
    });
  } catch (error) {
    console.error("==============================================");
    console.error("❌ NOVELS API ERROR");
    console.error("Message:", error?.message);
    console.error("Code:", error?.code);
    console.error("Detail:", error?.detail);
    console.error("==============================================");

    return res.status(500).json({
      success: false,
      novels: [],
      count: 0,
      total: 0,
      error: "Unable to fetch novels.",
      details:
        process.env.NODE_ENV === "development"
          ? error?.message
          : undefined,
    });
  }
});

/* =========================================================
   CREATE / UPLOAD NOVEL
   POST /api/novels
   ========================================================= */

router.post(
  "/",
  upload.single("cover"),
  async (req, res) => {
    let uploadedFilePath = null;

    try {
      const {
        title,
        genre,
        description,
        introduction,
        author,
        content,
        chapters,
        status,
      } = req.body;

      /* -----------------------------------------------------
         VALIDATION
         ----------------------------------------------------- */

      if (!title?.trim()) {
        return res.status(400).json({
          success: false,
          error: "Novel title is required.",
        });
      }

      if (!author?.trim()) {
        return res.status(400).json({
          success: false,
          error: "Author is required.",
        });
      }

      /* -----------------------------------------------------
         COVER
         ----------------------------------------------------- */

      let coverUrl = null;

      if (req.file) {
        uploadedFilePath = req.file.path;

        coverUrl =
          `/uploads/covers/${req.file.filename}`;
      }

      /* -----------------------------------------------------
         CHAPTERS
         ----------------------------------------------------- */

      let chaptersData = [];

      if (chapters) {
        try {
          chaptersData = parseChapters(chapters);
        } catch {
          return res.status(400).json({
            success: false,
            error: "Invalid chapters JSON.",
          });
        }
      }

      if (
        !Array.isArray(chaptersData) ||
        chaptersData.length === 0
      ) {
        chaptersData = [
          {
            chapter: 1,
            title: "Chapter 1",
            content: content || "",
          },
        ];
      }

      /* -----------------------------------------------------
         INSERT
         ----------------------------------------------------- */

      const result = await pool.query(
        `
        INSERT INTO novels (
          title,
          genre,
          description,
          chapters,
          cover_url,
          introduction,
          likes,
          author,
          status
        )
        VALUES (
          $1,
          $2,
          $3,
          $4::jsonb,
          $5,
          $6,
          $7,
          $8,
          $9
        )
        RETURNING
          ${NOVEL_FIELDS}
        `,
        [
          title.trim(),
          genre?.trim() || null,
          description?.trim() || null,
          JSON.stringify(chaptersData),
          coverUrl,
          introduction?.trim() || null,
          0,
          author.trim(),
          status?.trim() || "published",
        ]
      );

      const novel = result.rows[0];

      return res.status(201).json({
        success: true,
        message: "Novel uploaded successfully.",
        novel,
      });
    } catch (error) {
      console.error("==============================================");
      console.error("❌ NOVEL UPLOAD ERROR");
      console.error("Message:", error?.message);
      console.error("Code:", error?.code);
      console.error("Detail:", error?.detail);
      console.error("Hint:", error?.hint);
      console.error("==============================================");

      /* -----------------------------------------------------
         REMOVE UPLOADED COVER IF DB INSERT FAILED
         ----------------------------------------------------- */

      if (
        uploadedFilePath &&
        fs.existsSync(uploadedFilePath)
      ) {
        try {
          fs.unlinkSync(uploadedFilePath);
        } catch (deleteError) {
          console.error(
            "Could not remove uploaded cover:",
            deleteError
          );
        }
      }

      return res.status(500).json({
        success: false,
        error: "Unable to upload novel.",
        details:
          process.env.NODE_ENV === "development"
            ? error?.message
            : undefined,
      });
    }
  }
);

/* =========================================================
   GET SINGLE NOVEL
   GET /api/novels/:id
   ========================================================= */

router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        error: "Novel ID is required.",
      });
    }

    const result = await pool.query(
      `
      SELECT
        ${NOVEL_FIELDS}
      FROM novels
      WHERE id = $1
      LIMIT 1
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Novel not found.",
      });
    }

    return res.status(200).json({
      success: true,
      novel: result.rows[0],
    });
  } catch (error) {
    console.error(
      "❌ SINGLE NOVEL API ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      error: "Unable to fetch novel.",
      details:
        process.env.NODE_ENV === "development"
          ? error?.message
          : undefined,
    });
  }
});

/* =========================================================
   UPDATE NOVEL
   PUT /api/novels/:id
   ========================================================= */

router.put(
  "/:id",
  upload.single("cover"),
  async (req, res) => {
    let uploadedFilePath = null;
    let oldCoverUrl = null;

    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({
          success: false,
          error: "Novel ID is required.",
        });
      }

      /* -----------------------------------------------------
         FIND EXISTING NOVEL
         ----------------------------------------------------- */

      const existingResult = await pool.query(
        `
        SELECT
          ${NOVEL_FIELDS}
        FROM novels
        WHERE id = $1
        LIMIT 1
        `,
        [id]
      );

      if (existingResult.rows.length === 0) {
        // Remove uploaded file if a file was uploaded
        // but the novel does not exist.
        if (req.file?.path && fs.existsSync(req.file.path)) {
          try {
            fs.unlinkSync(req.file.path);
          } catch {}
        }

        return res.status(404).json({
          success: false,
          error: "Novel not found.",
        });
      }

      const existingNovel =
        existingResult.rows[0];

      oldCoverUrl =
        existingNovel.cover_url || null;

      /* -----------------------------------------------------
         FIELDS
         ----------------------------------------------------- */

      const {
        title,
        genre,
        description,
        introduction,
        author,
        content,
        chapters,
        status,
      } = req.body;

      if (!title?.trim()) {
        return res.status(400).json({
          success: false,
          error: "Novel title is required.",
        });
      }

      if (!author?.trim()) {
        return res.status(400).json({
          success: false,
          error: "Author is required.",
        });
      }

      /* -----------------------------------------------------
         COVER
         ----------------------------------------------------- */

      let coverUrl =
        existingNovel.cover_url || null;

      if (req.file) {
        uploadedFilePath = req.file.path;

        coverUrl =
          `/uploads/covers/${req.file.filename}`;
      }

      /* -----------------------------------------------------
         CHAPTERS
         ----------------------------------------------------- */

      let chaptersData;

      if (
        chapters !== undefined &&
        chapters !== null &&
        chapters !== ""
      ) {
        try {
          chaptersData = parseChapters(chapters);
        } catch {
          if (
            uploadedFilePath &&
            fs.existsSync(uploadedFilePath)
          ) {
            try {
              fs.unlinkSync(uploadedFilePath);
            } catch {}
          }

          return res.status(400).json({
            success: false,
            error: "Invalid chapters JSON.",
          });
        }

        if (!Array.isArray(chaptersData)) {
          if (
            uploadedFilePath &&
            fs.existsSync(uploadedFilePath)
          ) {
            try {
              fs.unlinkSync(uploadedFilePath);
            } catch {}
          }

          return res.status(400).json({
            success: false,
            error: "Chapters must be an array.",
          });
        }
      } else {
        // IMPORTANT:
        // When editing without sending chapters,
        // preserve the existing chapters.
        chaptersData =
          Array.isArray(existingNovel.chapters)
            ? existingNovel.chapters
            : [];
      }

      /* -----------------------------------------------------
         UPDATE DATABASE
         ----------------------------------------------------- */

      const result = await pool.query(
        `
        UPDATE novels
        SET
          title = $1,
          genre = $2,
          description = $3,
          chapters = $4::jsonb,
          cover_url = $5,
          introduction = $6,
          author = $7,
          status = $8
        WHERE id = $9
        RETURNING
          ${NOVEL_FIELDS}
        `,
        [
          title.trim(),
          genre?.trim() || null,
          description?.trim() || null,
          JSON.stringify(chaptersData),
          coverUrl,
          introduction?.trim() || null,
          author.trim(),
          status?.trim() || "published",
          id,
        ]
      );

      const novel = result.rows[0];

      /* -----------------------------------------------------
         DELETE OLD COVER ONLY AFTER SUCCESSFUL UPDATE
         ----------------------------------------------------- */

      if (
        req.file &&
        oldCoverUrl &&
        oldCoverUrl !== coverUrl
      ) {
        deleteCoverFile(oldCoverUrl);
      }

      return res.status(200).json({
        success: true,
        message: "Novel updated successfully.",
        novel,
      });
    } catch (error) {
      console.error("==============================================");
      console.error("❌ NOVEL UPDATE ERROR");
      console.error("Message:", error?.message);
      console.error("Code:", error?.code);
      console.error("Detail:", error?.detail);
      console.error("Hint:", error?.hint);
      console.error("==============================================");

      /* -----------------------------------------------------
         DELETE NEW COVER IF UPDATE FAILED
         ----------------------------------------------------- */

      if (
        uploadedFilePath &&
        fs.existsSync(uploadedFilePath)
      ) {
        try {
          fs.unlinkSync(uploadedFilePath);
        } catch (deleteError) {
          console.error(
            "Could not remove uploaded cover:",
            deleteError
          );
        }
      }

      return res.status(500).json({
        success: false,
        error: "Unable to update novel.",
        details:
          process.env.NODE_ENV === "development"
            ? error?.message
            : undefined,
      });
    }
  }
);

/* =========================================================
   DELETE NOVEL
   DELETE /api/novels/:id
   ========================================================= */

router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        error: "Novel ID is required.",
      });
    }

    /* -----------------------------------------------------
       FIND NOVEL FIRST
       ----------------------------------------------------- */

    const existingResult = await pool.query(
      `
      SELECT
        id,
        cover_url
      FROM novels
      WHERE id = $1
      LIMIT 1
      `,
      [id]
    );

    if (existingResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Novel not found.",
      });
    }

    const existingNovel =
      existingResult.rows[0];

    const coverUrl =
      existingNovel.cover_url || null;

    /* -----------------------------------------------------
       DELETE DATABASE RECORD
       ----------------------------------------------------- */

    await pool.query(
      `
      DELETE FROM novels
      WHERE id = $1
      `,
      [id]
    );

    /* -----------------------------------------------------
       DELETE COVER FILE
       ----------------------------------------------------- */

    if (coverUrl) {
      deleteCoverFile(coverUrl);
    }

    return res.status(200).json({
      success: true,
      message: "Novel deleted successfully.",
      id,
    });
  } catch (error) {
    console.error("==============================================");
    console.error("❌ NOVEL DELETE ERROR");
    console.error("Message:", error?.message);
    console.error("Code:", error?.code);
    console.error("Detail:", error?.detail);
    console.error("==============================================");

    return res.status(500).json({
      success: false,
      error: "Unable to delete novel.",
      details:
        process.env.NODE_ENV === "development"
          ? error?.message
          : undefined,
    });
  }
});

export default router;
