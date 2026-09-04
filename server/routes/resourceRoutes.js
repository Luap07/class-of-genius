import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import jwt from "jsonwebtoken";
import { fileURLToPath } from "url";

import pool from "../lib/db.js";

const router = express.Router();

// ============================================================
// PATH CONFIGURATION
// ============================================================

const __filename =
  fileURLToPath(import.meta.url);

const __dirname =
  path.dirname(__filename);

const UPLOADS_DIR = path.join(
  __dirname,
  "../uploads"
);

const VIDEOS_DIR = path.join(
  UPLOADS_DIR,
  "videos"
);

// Make sure directory exists
fs.mkdirSync(VIDEOS_DIR, {
  recursive: true,
});

// ============================================================
// CONFIG
// ============================================================

const JWT_SECRET =
  process.env.JWT_SECRET?.trim();

const MAX_VIDEO_SIZE =
  500 * 1024 * 1024;

// ============================================================
// MULTER STORAGE
// ============================================================

const storage =
  multer.diskStorage({
    destination: (
      req,
      file,
      cb
    ) => {
      cb(
        null,
        VIDEOS_DIR
      );
    },

    filename: (
      req,
      file,
      cb
    ) => {
      const extension =
        path
          .extname(
            file.originalname
          )
          .toLowerCase();

      const baseName =
        path
          .basename(
            file.originalname,
            extension
          )
          .replace(
            /[^a-zA-Z0-9_-]/g,
            "-"
          )
          .substring(
            0,
            80
          );

      const uniqueName =
        `${Date.now()}-${Math.random()
          .toString(36)
          .substring(
            2,
            10
          )}-${baseName}${extension}`;

      cb(
        null,
        uniqueName
      );
    },
  });

// ============================================================
// VIDEO FILE FILTER
// ============================================================

const allowedVideoExtensions = [
  ".mp4",
  ".webm",
  ".mov",
  ".avi",
  ".mkv",
  ".m4v",
  ".mpeg",
  ".mpg",
  ".3gp",
  ".ogv",
];

const fileFilter = (
  req,
  file,
  cb
) => {
  const extension =
    path
      .extname(
        file.originalname
      )
      .toLowerCase();

  if (
    allowedVideoExtensions.includes(
      extension
    )
  ) {
    return cb(
      null,
      true
    );
  }

  return cb(
    new Error(
      "Invalid video format. Supported formats: MP4, WEBM, MOV, AVI, MKV, M4V, MPEG, MPG, 3GP and OGV."
    )
  );
};

const upload =
  multer({
    storage,
    fileFilter,
    limits: {
      fileSize:
        MAX_VIDEO_SIZE,
    },
  });

// ============================================================
// AUTHENTICATION
// ============================================================

const requireAdmin =
  async (
    req,
    res,
    next
  ) => {
    try {
      if (!JWT_SECRET) {
        return res.status(500).json({
          success: false,
          message:
            "JWT_SECRET is not configured.",
        });
      }

      const authHeader =
        req.headers.authorization;

      if (
        !authHeader ||
        !authHeader.startsWith(
          "Bearer "
        )
      ) {
        return res.status(401).json({
          success: false,
          message:
            "Authentication required.",
        });
      }

      const token =
        authHeader
          .split(" ")[1];

      if (!token) {
        return res.status(401).json({
          success: false,
          message:
            "Authentication token missing.",
        });
      }

      const decoded =
        jwt.verify(
          token,
          JWT_SECRET
        );

      if (!decoded?.id) {
        return res.status(401).json({
          success: false,
          message:
            "Invalid authentication token.",
        });
      }

      const result =
        await pool.query(
          `
          SELECT
            id,
            username,
            email,
            role,
            created_at
          FROM users
          WHERE id = $1
          LIMIT 1
          `,
          [decoded.id]
        );

      if (
        result.rows.length ===
        0
      ) {
        return res.status(401).json({
          success: false,
          message:
            "User account not found.",
        });
      }

      const user =
        result.rows[0];

      if (
        user.role !==
        "admin"
      ) {
        return res.status(403).json({
          success: false,
          message:
            "Admin access required.",
        });
      }

      req.user = user;

      next();
    } catch (error) {
      console.error(
        "Resource authentication error:",
        error
      );

      return res.status(401).json({
        success: false,
        message:
          "Invalid or expired authentication token.",
      });
    }
  };

// ============================================================
// HELPER
// ============================================================

const getBaseUrl = (
  req
) => {
  const configured =
    process.env.BACKEND_URL?.trim();

  if (configured) {
    return configured.replace(
      /\/+$/,
      ""
    );
  }

  return `${req.protocol}://${req.get(
    "host"
  )}`;
};

// ============================================================
// GET TOPICS
// ============================================================

router.get(
  "/topics",
  requireAdmin,
  async (
    req,
    res
  ) => {
    try {
      const result =
        await pool.query(
          `
          SELECT
            id,
            title,
            position
          FROM course_topics
          ORDER BY
            position ASC NULLS LAST,
            title ASC
          `
        );

      return res.json({
        success: true,
        topics:
          result.rows,
      });
    } catch (error) {
      console.error(
        "RESOURCE TOPICS ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        topics: [],
        message:
          "Unable to fetch video categories.",
      });
    }
  }
);

// ============================================================
// GET ALL VIDEO RESOURCES
// ============================================================

router.get(
  "/",
  requireAdmin,
  async (
    req,
    res
  ) => {
    try {
      const result =
        await pool.query(
          `
          SELECT
            r.id,
            r.title,
            r.description,
            r.resource_type,
            r.file_url,
            r.topic_id,
            r.created_at,
            t.title AS topic_title
          FROM resources r
          LEFT JOIN course_topics t
            ON t.id = r.topic_id
          WHERE
            r.resource_type = 'video'
          ORDER BY
            r.created_at DESC
          `
        );

      return res.json({
        success: true,

        resources:
          result.rows,

        count:
          result.rows.length,
      });
    } catch (error) {
      console.error(
        "RESOURCE FETCH ERROR:",
        error
      );

      return res.status(500).json({
        success: false,

        resources: [],

        count: 0,

        message:
          "Unable to fetch video resources.",
      });
    }
  }
);

// ============================================================
// GET SINGLE RESOURCE
// ============================================================

router.get(
  "/:id",
  requireAdmin,
  async (
    req,
    res
  ) => {
    try {
      const result =
        await pool.query(
          `
          SELECT
            r.id,
            r.title,
            r.description,
            r.resource_type,
            r.file_url,
            r.topic_id,
            r.created_at,
            t.title AS topic_title
          FROM resources r
          LEFT JOIN course_topics t
            ON t.id = r.topic_id
          WHERE
            r.id = $1
            AND r.resource_type = 'video'
          LIMIT 1
          `,
          [req.params.id]
        );

      if (
        result.rows.length ===
        0
      ) {
        return res.status(404).json({
          success: false,
          message:
            "Video resource not found.",
        });
      }

      return res.json({
        success: true,

        resource:
          result.rows[0],
      });
    } catch (error) {
      console.error(
        "SINGLE RESOURCE ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to fetch video resource.",
      });
    }
  }
);

// ============================================================
// UPLOAD VIDEO
// ============================================================

router.post(
  "/",
  requireAdmin,
  upload.single(
    "video"
  ),
  async (
    req,
    res
  ) => {
    const uploadedFile =
      req.file;

    try {
      const {
        title,
        description,
        topic_id,
      } = req.body;

      if (
        !title ||
        !title.trim()
      ) {
        if (uploadedFile) {
          safeDelete(
            uploadedFile.path
          );
        }

        return res.status(400).json({
          success: false,
          message:
            "Video title is required.",
        });
      }

      if (!uploadedFile) {
        return res.status(400).json({
          success: false,
          message:
            "Video file is required.",
        });
      }

      // --------------------------------------------------------
      // CHECK TOPIC
      // --------------------------------------------------------

      if (topic_id) {
        const topicResult =
          await pool.query(
            `
            SELECT
              id,
              title
            FROM course_topics
            WHERE id = $1
            LIMIT 1
            `,
            [topic_id]
          );

        if (
          topicResult.rows.length ===
          0
        ) {
          safeDelete(
            uploadedFile.path
          );

          return res.status(400).json({
            success: false,
            message:
              "Selected video category does not exist.",
          });
        }
      }

      // --------------------------------------------------------
      // VIDEO URL
      // --------------------------------------------------------

      const baseUrl =
        getBaseUrl(req);

      const videoUrl =
        `${baseUrl}/uploads/videos/${encodeURIComponent(
          uploadedFile.filename
        )}`;

      // --------------------------------------------------------
      // SAVE RESOURCE
      // --------------------------------------------------------

      const result =
        await pool.query(
          `
          INSERT INTO resources (
            title,
            description,
            resource_type,
            file_url,
            topic_id
          )
          VALUES (
            $1,
            $2,
            $3,
            $4,
            $5
          )
          RETURNING
            id,
            title,
            description,
            resource_type,
            file_url,
            topic_id,
            created_at
          `,
          [
            title.trim(),

            description?.trim() ||
              "",

            "video",

            videoUrl,

            topic_id ||
              null,
          ]
        );

      return res.status(201).json({
        success: true,

        message:
          "Video uploaded successfully.",

        resource:
          result.rows[0],
      });
    } catch (error) {
      console.error(
        "RESOURCE UPLOAD ERROR:",
        error
      );

      if (uploadedFile) {
        safeDelete(
          uploadedFile.path
        );
      }

      return res.status(500).json({
        success: false,
        message:
          error?.message ||
          "Video upload failed.",
      });
    }
  }
);

// ============================================================
// DELETE VIDEO
// ============================================================

router.delete(
  "/:id",
  requireAdmin,
  async (
    req,
    res
  ) => {
    try {
      const resourceId =
        req.params.id;

      const existingResult =
        await pool.query(
          `
          SELECT
            id,
            title,
            file_url
          FROM resources
          WHERE
            id = $1
            AND resource_type = 'video'
          LIMIT 1
          `,
          [resourceId]
        );

      if (
        existingResult.rows.length ===
        0
      ) {
        return res.status(404).json({
          success: false,
          message:
            "Video resource not found.",
        });
      }

      const resource =
        existingResult.rows[0];

      // --------------------------------------------------------
      // DELETE DATABASE RECORD
      // --------------------------------------------------------

      await pool.query(
        `
        DELETE FROM resources
        WHERE id = $1
        `,
        [resourceId]
      );

      // --------------------------------------------------------
      // DELETE LOCAL VIDEO
      // --------------------------------------------------------

      deleteStoredVideo(
        resource.file_url
      );

      return res.json({
        success: true,

        message:
          "Video deleted successfully.",
      });
    } catch (error) {
      console.error(
        "RESOURCE DELETE ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to delete video.",
      });
    }
  }
);

// ============================================================
// FILE CLEANUP
// ============================================================

function safeDelete(
  filePath
) {
  try {
    if (
      filePath &&
      fs.existsSync(
        filePath
      )
    ) {
      fs.unlinkSync(
        filePath
      );
    }
  } catch (error) {
    console.error(
      "Video file cleanup error:",
      error
    );
  }
}

function deleteStoredVideo(
  url
) {
  try {
    if (!url) return;

    let pathname;

    try {
      pathname =
        new URL(url).pathname;
    } catch {
      pathname = url;
    }

    if (
      !pathname.includes(
        "/uploads/videos/"
      )
    ) {
      return;
    }

    const filename =
      decodeURIComponent(
        path.basename(
          pathname
        )
      );

    if (!filename) return;

    const videoPath =
      path.resolve(
        VIDEOS_DIR,
        filename
      );

    const videosDirectory =
      path.resolve(
        VIDEOS_DIR
      );

    if (
      !videoPath.startsWith(
        videosDirectory +
          path.sep
      )
    ) {
      return;
    }

    safeDelete(
      videoPath
    );
  } catch (error) {
    console.error(
      "Stored video deletion error:",
      error
    );
  }
}

// ============================================================
// MULTER ERROR HANDLER
// ============================================================

router.use(
  (
    error,
    req,
    res,
    next
  ) => {
    if (
      error instanceof
      multer.MulterError
    ) {
      if (
        error.code ===
        "LIMIT_FILE_SIZE"
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Video is too large. Maximum size is 500MB.",
        });
      }

      return res.status(400).json({
        success: false,
        message:
          error.message ||
          "Video upload error.",
      });
    }

    if (error) {
      return res.status(400).json({
        success: false,
        message:
          error.message ||
          "Video upload error.",
      });
    }

    next();
  }
);

export default router;