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

const UPLOADS_DIR =
  path.join(
    __dirname,
    "../uploads"
  );

const VIDEOS_DIR =
  path.join(
    UPLOADS_DIR,
    "videos"
  );

// Make sure directory exists.
fs.mkdirSync(
  VIDEOS_DIR,
  {
    recursive: true,
  }
);

// ============================================================
// CONFIG
// ============================================================

const JWT_SECRET =
  process.env.JWT_SECRET?.trim();

const MAX_VIDEO_SIZE =
  500 * 1024 * 1024;

// ============================================================
// HELPERS
// ============================================================

const clean = (
  value
) => {
  if (
    value === undefined ||
    value === null
  ) {
    return "";
  }

  return String(value)
    .trim();
};

const normalizeClass = (
  value
) => {
  return clean(value)
    .replace(/\s+/g, " ");
};

const normalizeSubject = (
  value
) => {
  return clean(value)
    .replace(/\s+/g, " ");
};

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
          [
            decoded.id,
          ]
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

      req.user =
        user;

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
// BASE URL
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
// FORMAT RESOURCE
// ============================================================

const formatResource = (
  resource
) => {
  if (!resource) {
    return null;
  }

  return {
    ...resource,

    // Class aliases for frontend compatibility.
    class:
      resource.class_name ||
      "",

    grade:
      resource.class_name ||
      "",

    // Subject aliases for frontend compatibility.
    subject_name:
      resource.subject ||
      "",

    subject_title:
      resource.subject ||
      "",

    // Video aliases.
    videoUrl:
      resource.file_url ||
      "",

    video_url:
      resource.file_url ||
      "",
  };
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
            r.class_name,
            r.subject,
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

      const resources =
        result.rows.map(
          formatResource
        );

      return res.json({
        success: true,

        resources,

        count:
          resources.length,
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
            r.class_name,
            r.subject,
            r.created_at,

            t.title AS topic_title

          FROM resources r

          LEFT JOIN course_topics t
            ON t.id = r.topic_id

          WHERE
            r.id = $1

            AND r.resource_type =
              'video'

          LIMIT 1
          `,
          [
            req.params.id,
          ]
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
          formatResource(
            result.rows[0]
          ),
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
//
// Admin sends:
//
// title
// description
// class
// class_name
// grade
// subject
// subject_name
// video
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
      const title =
        clean(
          req.body.title
        );

      const description =
        clean(
          req.body.description
        );

      const className =
        normalizeClass(
          req.body.class ||
          req.body.class_name ||
          req.body.grade
        );

      const subject =
        normalizeSubject(
          req.body.subject ||
          req.body.subject_name
        );

      const topicId =
        clean(
          req.body.topic_id
        ) ||
        null;

      console.log("");
      console.log(
        "=================================================="
      );
      console.log(
        "🎥 SCHOLIQEN VIDEO UPLOAD"
      );
      console.log(
        "=================================================="
      );
      console.log(
        "Title:",
        title
      );
      console.log(
        "Class:",
        className
      );
      console.log(
        "Subject:",
        subject
      );
      console.log(
        "Topic:",
        topicId ||
          "NONE"
      );
      console.log(
        "File:",
        uploadedFile
          ?.originalname ||
          "NONE"
      );
      console.log(
        "=================================================="
      );

      // --------------------------------------------------------
      // TITLE
      // --------------------------------------------------------

      if (!title) {
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

      // --------------------------------------------------------
      // CLASS
      // --------------------------------------------------------

      if (!className) {
        if (uploadedFile) {
          safeDelete(
            uploadedFile.path
          );
        }

        return res.status(400).json({
          success: false,

          message:
            "Class is required.",
        });
      }

      // --------------------------------------------------------
      // SUBJECT
      // --------------------------------------------------------

      if (!subject) {
        if (uploadedFile) {
          safeDelete(
            uploadedFile.path
          );
        }

        return res.status(400).json({
          success: false,

          message:
            "Subject is required.",
        });
      }

      // --------------------------------------------------------
      // VIDEO
      // --------------------------------------------------------

      if (!uploadedFile) {
        return res.status(400).json({
          success: false,

          message:
            "Video file is required.",
        });
      }

      // --------------------------------------------------------
      // CHECK TOPIC IF PROVIDED
      // --------------------------------------------------------

      if (topicId) {
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
            [
              topicId,
            ]
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
      // SAVE
      // --------------------------------------------------------

      const result =
        await pool.query(
          `
          INSERT INTO resources (
            title,
            description,
            resource_type,
            file_url,
            topic_id,
            class_name,
            subject
          )

          VALUES (
            $1,
            $2,
            $3,
            $4,
            $5,
            $6,
            $7
          )

          RETURNING
            id,
            title,
            description,
            resource_type,
            file_url,
            topic_id,
            class_name,
            subject,
            created_at
          `,
          [
            title,

            description,

            "video",

            videoUrl,

            topicId,

            className,

            subject,
          ]
        );

      const resource =
        formatResource(
          result.rows[0]
        );

      console.log(
        "✅ VIDEO SAVED"
      );

      console.log(
        "ID:",
        resource.id
      );

      console.log(
        "Class:",
        resource.class_name
      );

      console.log(
        "Subject:",
        resource.subject
      );

      return res.status(201).json({
        success: true,

        message:
          "Video uploaded successfully.",

        resource,
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
// EDIT VIDEO RESOURCE
//
// PUT /api/resources/:id
//
// Allows admin to change:
//
// - title
// - description
// - class
// - subject
// - topic
// - video file
//
// The existing video is kept if no replacement
// video is selected.
// ============================================================

router.put(
  "/:id",

  requireAdmin,

  upload.single(
    "video"
  ),

  async (
    req,
    res
  ) => {
    const replacementFile =
      req.file;

    try {
      const resourceId =
        clean(
          req.params.id
        );

      if (!resourceId) {
        if (replacementFile) {
          safeDelete(
            replacementFile.path
          );
        }

        return res.status(400).json({
          success: false,

          message:
            "Video resource ID is required.",
        });
      }

      // --------------------------------------------------------
      // FIND EXISTING RESOURCE
      // --------------------------------------------------------

      const existingResult =
        await pool.query(
          `
          SELECT
            id,
            title,
            description,
            resource_type,
            file_url,
            topic_id,
            class_name,
            subject,
            created_at

          FROM resources

          WHERE
            id = $1

            AND resource_type =
              'video'

          LIMIT 1
          `,
          [
            resourceId,
          ]
        );

      if (
        existingResult.rows.length ===
        0
      ) {
        if (replacementFile) {
          safeDelete(
            replacementFile.path
          );
        }

        return res.status(404).json({
          success: false,

          message:
            "Video resource not found.",
        });
      }

      const existing =
        existingResult.rows[0];

      // --------------------------------------------------------
      // NEW VALUES
      // --------------------------------------------------------

      const title =
        req.body.title !==
        undefined
          ? clean(
              req.body.title
            )
          : existing.title;

      const description =
        req.body.description !==
        undefined
          ? clean(
              req.body.description
            )
          : existing.description ||
            "";

      const className =
        normalizeClass(
          req.body.class ||
          req.body.class_name ||
          req.body.grade ||
          existing.class_name
        );

      const subject =
        normalizeSubject(
          req.body.subject ||
          req.body.subject_name ||
          existing.subject
        );

      const topicId =
        req.body.topic_id !==
        undefined
          ? clean(
              req.body.topic_id
            ) ||
            null
          : existing.topic_id;

      // --------------------------------------------------------
      // VALIDATION
      // --------------------------------------------------------

      if (!title) {
        if (replacementFile) {
          safeDelete(
            replacementFile.path
          );
        }

        return res.status(400).json({
          success: false,

          message:
            "Video title is required.",
        });
      }

      if (!className) {
        if (replacementFile) {
          safeDelete(
            replacementFile.path
          );
        }

        return res.status(400).json({
          success: false,

          message:
            "Class is required.",
        });
      }

      if (!subject) {
        if (replacementFile) {
          safeDelete(
            replacementFile.path
          );
        }

        return res.status(400).json({
          success: false,

          message:
            "Subject is required.",
        });
      }

      // --------------------------------------------------------
      // CHECK TOPIC
      // --------------------------------------------------------

      if (topicId) {
        const topicResult =
          await pool.query(
            `
            SELECT
              id
            FROM course_topics
            WHERE id = $1
            LIMIT 1
            `,
            [
              topicId,
            ]
          );

        if (
          topicResult.rows.length ===
          0
        ) {
          if (replacementFile) {
            safeDelete(
              replacementFile.path
            );
          }

          return res.status(400).json({
            success: false,

            message:
              "Selected video category does not exist.",
          });
        }
      }

      // --------------------------------------------------------
      // VIDEO
      // --------------------------------------------------------

      let videoUrl =
        existing.file_url;

      if (replacementFile) {
        const baseUrl =
          getBaseUrl(req);

        videoUrl =
          `${baseUrl}/uploads/videos/${encodeURIComponent(
            replacementFile.filename
          )}`;
      }

      // --------------------------------------------------------
      // UPDATE DATABASE
      // --------------------------------------------------------

      const result =
        await pool.query(
          `
          UPDATE resources

          SET
            title = $1,
            description = $2,
            topic_id = $3,
            class_name = $4,
            subject = $5,
            file_url = $6

          WHERE
            id = $7

            AND resource_type =
              'video'

          RETURNING
            id,
            title,
            description,
            resource_type,
            file_url,
            topic_id,
            class_name,
            subject,
            created_at
          `,
          [
            title,

            description,

            topicId,

            className,

            subject,

            videoUrl,

            resourceId,
          ]
        );

      if (
        result.rows.length ===
        0
      ) {
        if (replacementFile) {
          safeDelete(
            replacementFile.path
          );
        }

        return res.status(404).json({
          success: false,

          message:
            "Video resource could not be updated.",
        });
      }

      const updatedResource =
        formatResource(
          result.rows[0]
        );

      // --------------------------------------------------------
      // DELETE OLD VIDEO
      // --------------------------------------------------------

      if (
        replacementFile &&
        existing.file_url
      ) {
        deleteStoredVideo(
          existing.file_url
        );
      }

      console.log("");
      console.log(
        "=================================================="
      );
      console.log(
        "✏️ VIDEO RESOURCE UPDATED"
      );
      console.log(
        "=================================================="
      );
      console.log(
        "ID:",
        updatedResource.id
      );
      console.log(
        "Title:",
        updatedResource.title
      );
      console.log(
        "Class:",
        updatedResource.class_name
      );
      console.log(
        "Subject:",
        updatedResource.subject
      );
      console.log(
        "Replacement video:",
        replacementFile
          ? "YES"
          : "NO"
      );
      console.log(
        "=================================================="
      );
      console.log("");

      return res.json({
        success: true,

        message:
          "Video updated successfully.",

        resource:
          updatedResource,
      });
    } catch (error) {
      console.error(
        "RESOURCE UPDATE ERROR:",
        error
      );

      if (replacementFile) {
        safeDelete(
          replacementFile.path
        );
      }

      return res.status(500).json({
        success: false,

        message:
          error?.message ||
          "Unable to update video.",
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

            AND resource_type =
              'video'

          LIMIT 1
          `,
          [
            resourceId,
          ]
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
        [
          resourceId,
        ]
      );

      // --------------------------------------------------------
      // DELETE LOCAL VIDEO
      // --------------------------------------------------------

      deleteStoredVideo(
        resource.file_url
      );

      console.log(
        `🗑️ VIDEO DELETED: ${resourceId}`
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

// ============================================================
// DELETE STORED VIDEO
// ============================================================

function deleteStoredVideo(
  url
) {
  try {
    if (!url) {
      return;
    }

    let pathname;

    try {
      pathname =
        new URL(url)
          .pathname;
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

    if (!filename) {
      return;
    }

    const videoPath =
      path.resolve(
        VIDEOS_DIR,
        filename
      );

    const videosDirectory =
      path.resolve(
        VIDEOS_DIR
      );

    // Security check.
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

// ============================================================
// EXPORT
// ============================================================

export default router;