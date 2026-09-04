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

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const UPLOADS_DIR = path.join(
  __dirname,
  "../uploads"
);

const DOCUMENTS_DIR = path.join(
  UPLOADS_DIR,
  "documents"
);

const THUMBNAILS_DIR = path.join(
  UPLOADS_DIR,
  "thumbnails"
);

// Make sure directories exist
fs.mkdirSync(DOCUMENTS_DIR, {
  recursive: true,
});

fs.mkdirSync(THUMBNAILS_DIR, {
  recursive: true,
});

// ============================================================
// CONFIG
// ============================================================

const JWT_SECRET =
  process.env.JWT_SECRET?.trim();

const MAX_FILE_SIZE =
  100 * 1024 * 1024;

// ============================================================
// MULTER STORAGE
// ============================================================

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const isThumbnail =
      file.fieldname === "thumbnail";

    cb(
      null,
      isThumbnail
        ? THUMBNAILS_DIR
        : DOCUMENTS_DIR
    );
  },

  filename: (req, file, cb) => {
    const extension =
      path.extname(file.originalname);

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
        .substring(0, 80);

    const uniqueName =
      `${Date.now()}-${Math.random()
        .toString(36)
        .substring(2, 10)}-${baseName}${extension}`;

    cb(null, uniqueName);
  },
});

// ============================================================
// FILE FILTER
// ============================================================

const allowedDocumentExtensions = [
  ".pdf",
  ".doc",
  ".docx",
  ".ppt",
  ".pptx",
  ".xls",
  ".xlsx",
];

const allowedThumbnailExtensions = [
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".gif",
];

const fileFilter = (
  req,
  file,
  cb
) => {
  const extension =
    path
      .extname(file.originalname)
      .toLowerCase();

  if (
    file.fieldname ===
    "thumbnail"
  ) {
    if (
      allowedThumbnailExtensions.includes(
        extension
      )
    ) {
      return cb(null, true);
    }

    return cb(
      new Error(
        "Invalid thumbnail format. Use JPG, JPEG, PNG, WEBP or GIF."
      )
    );
  }

  if (
    file.fieldname ===
    "file"
  ) {
    if (
      allowedDocumentExtensions.includes(
        extension
      )
    ) {
      return cb(null, true);
    }

    return cb(
      new Error(
        "Invalid document format. Use PDF, DOC, DOCX, PPT, PPTX, XLS or XLSX."
      )
    );
  }

  cb(null, true);
};

const upload =
  multer({
    storage,
    fileFilter,
    limits: {
      fileSize:
        MAX_FILE_SIZE,
    },
  });

// ============================================================
// AUTHENTICATION
// ============================================================

const requireAdmin = async (
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
      authHeader.split(" ")[1];

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
      "Document authentication error:",
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
// GET CATEGORIES
// ============================================================

router.get(
  "/categories",
  requireAdmin,
  async (req, res) => {
    try {
      const result =
        await pool.query(`
          SELECT
            id,
            name,
            description,
            active,
            display_order,
            created_at
          FROM course_categories
          WHERE active = true
          ORDER BY
            display_order ASC NULLS LAST,
            name ASC
        `);

      return res.json({
        success: true,
        categories:
          result.rows,
      });
    } catch (error) {
      console.error(
        "DOCUMENT CATEGORY ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        categories: [],
        message:
          "Unable to fetch document categories.",
      });
    }
  }
);

// ============================================================
// GET DOCUMENTS
// ============================================================

router.get(
  "/",
  requireAdmin,
  async (req, res) => {
    try {
      const result =
        await pool.query(`
          SELECT
            d.id,
            d.title,
            d.description,
            d.category_id,
            d.category,
            d.file_url,
            d.thumbnail_url,
            d.file_type,
            d.file_size,
            d.created_at
          FROM documents d
          ORDER BY
            d.created_at DESC
        `);

      return res.json({
        success: true,

        documents:
          result.rows,

        count:
          result.rows.length,
      });
    } catch (error) {
      console.error(
        "DOCUMENT FETCH ERROR:",
        error
      );

      return res.status(500).json({
        success: false,

        documents: [],

        count: 0,

        message:
          "Unable to fetch documents.",
      });
    }
  }
);

// ============================================================
// GET DOCUMENT FILE
// Used by PDFReader.jsx
// ============================================================

router.get(
  "/:id/file",
  async (req, res) => {
    try {
      const { id } = req.params;

      const result = await pool.query(
        `
        SELECT
          id,
          title,
          file_url,
          file_type
        FROM documents
        WHERE id = $1
        LIMIT 1
        `,
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Document not found.",
        });
      }

      const document = result.rows[0];

      if (!document.file_url) {
        return res.status(404).json({
          success: false,
          message: "This document has no file.",
        });
      }

      // --------------------------------------------------------
      // Convert stored URL into local server file path
      // --------------------------------------------------------

      let pathname;

      try {
        pathname = new URL(
          document.file_url
        ).pathname;
      } catch {
        pathname = document.file_url;
      }

      if (!pathname.includes("/uploads/documents/")) {
        return res.status(400).json({
          success: false,
          message: "Invalid document file path.",
        });
      }

      const filename = decodeURIComponent(
        path.basename(pathname)
      );

      if (!filename) {
        return res.status(404).json({
          success: false,
          message: "Document filename is missing.",
        });
      }

      // --------------------------------------------------------
      // Prevent path traversal
      // --------------------------------------------------------

      const filePath = path.resolve(
        DOCUMENTS_DIR,
        filename
      );

      const resolvedDirectory =
        path.resolve(DOCUMENTS_DIR);

      if (
        !filePath.startsWith(
          resolvedDirectory + path.sep
        )
      ) {
        return res.status(403).json({
          success: false,
          message: "Invalid document path.",
        });
      }

      // --------------------------------------------------------
      // Check physical file
      // --------------------------------------------------------

      if (!fs.existsSync(filePath)) {
        console.error(
          "❌ Document file not found:",
          filePath
        );

        return res.status(404).json({
          success: false,
          message:
            "Document file not found on server.",
        });
      }

      console.log(
        `📄 Serving document: ${document.title}`
      );

      console.log(
        `📁 File: ${filePath}`
      );

      // --------------------------------------------------------
      // Determine content type
      // --------------------------------------------------------

      const extension = path
        .extname(filename)
        .toLowerCase();

      const contentTypes = {
        ".pdf": "application/pdf",
        ".doc": "application/msword",
        ".docx":
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ".ppt": "application/vnd.ms-powerpoint",
        ".pptx":
          "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        ".xls": "application/vnd.ms-excel",
        ".xlsx":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      };

      const contentType =
        contentTypes[extension] ||
        "application/octet-stream";

      res.setHeader(
        "Content-Type",
        contentType
      );

      res.setHeader(
        "Content-Disposition",
        `inline; filename="${filename.replace(
          /"/g,
          ""
        )}"`
      );

      res.setHeader(
        "Cache-Control",
        "no-store"
      );

      return res.sendFile(filePath);
    } catch (error) {
      console.error(
        "❌ DOCUMENT FILE ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to open document.",
      });
    }
  }
);

// ============================================================
// GET SINGLE DOCUMENT
// ============================================================

router.get(
  "/:id",
  requireAdmin,
  async (req, res) => {
    try {
      const result =
        await pool.query(
          `
          SELECT
            id,
            title,
            description,
            category_id,
            category,
            file_url,
            thumbnail_url,
            file_type,
            file_size,
            created_at
          FROM documents
          WHERE id = $1
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
            "Document not found.",
        });
      }

      return res.json({
        success: true,
        document:
          result.rows[0],
      });
    } catch (error) {
      console.error(
        "SINGLE DOCUMENT ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to fetch document.",
      });
    }
  }
);

// ============================================================
// UPLOAD DOCUMENT
// ============================================================

router.post(
  "/",
  requireAdmin,
  upload.fields([
    {
      name: "file",
      maxCount: 1,
    },
    {
      name: "thumbnail",
      maxCount: 1,
    },
  ]),
  async (req, res) => {
    try {
      const {
        title,
        description,
        category_id,
      } = req.body;

      const documentFile =
        req.files?.file?.[0];

      const thumbnailFile =
        req.files?.thumbnail?.[0];

      if (
        !title ||
        !title.trim()
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Document title is required.",
        });
      }

      if (!category_id) {
        return res.status(400).json({
          success: false,
          message:
            "Document category is required.",
        });
      }

      if (!documentFile) {
        return res.status(400).json({
          success: false,
          message:
            "Document file is required.",
        });
      }

      // --------------------------------------------------------
      // CATEGORY
      // --------------------------------------------------------

      const categoryResult =
        await pool.query(
          `
          SELECT
            id,
            name
          FROM course_categories
          WHERE id = $1
          LIMIT 1
          `,
          [category_id]
        );

      if (
        categoryResult.rows.length ===
        0
      ) {
        // Delete uploaded files
        safeDelete(
          documentFile.path
        );

        if (thumbnailFile) {
          safeDelete(
            thumbnailFile.path
          );
        }

        return res.status(400).json({
          success: false,
          message:
            "Selected category does not exist.",
        });
      }

      const category =
        categoryResult.rows[0];

      // --------------------------------------------------------
      // URLS
      // --------------------------------------------------------

      const baseUrl =
        getBaseUrl(req);

      const documentUrl =
        `${baseUrl}/uploads/documents/${encodeURIComponent(
          documentFile.filename
        )}`;

      let thumbnailUrl =
        "";

      if (thumbnailFile) {
        thumbnailUrl =
          `${baseUrl}/uploads/thumbnails/${encodeURIComponent(
            thumbnailFile.filename
          )}`;
      }

      // --------------------------------------------------------
      // SAVE DATABASE
      // --------------------------------------------------------

      const result =
        await pool.query(
          `
          INSERT INTO documents (
            title,
            description,
            category_id,
            category,
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
            NOW()
          )
          RETURNING
            id,
            title,
            description,
            category_id,
            category,
            file_url,
            thumbnail_url,
            file_type,
            file_size,
            created_at
          `,
          [
            title.trim(),
            description?.trim() ||
              "",
            category_id,
            category.name,
            documentUrl,
            thumbnailUrl,
            path
              .extname(
                documentFile.originalname
              )
              .replace(
                ".",
                ""
              )
              .toLowerCase(),
            documentFile.size,
          ]
        );

      return res.status(201).json({
        success: true,

        message:
          "Document uploaded successfully.",

        document:
          result.rows[0],
      });
    } catch (error) {
      console.error(
        "DOCUMENT UPLOAD ERROR:",
        error
      );

      // Cleanup uploaded files
      const documentFile =
        req.files?.file?.[0];

      const thumbnailFile =
        req.files?.thumbnail?.[0];

      if (documentFile) {
        safeDelete(
          documentFile.path
        );
      }

      if (thumbnailFile) {
        safeDelete(
          thumbnailFile.path
        );
      }

      return res.status(500).json({
        success: false,

        message:
          error?.message ||
          "Document upload failed.",
      });
    }
  }
);

// ============================================================
// UPDATE DOCUMENT
// ============================================================

router.put(
  "/:id",
  requireAdmin,
  upload.fields([
    {
      name: "file",
      maxCount: 1,
    },
    {
      name: "thumbnail",
      maxCount: 1,
    },
  ]),
  async (req, res) => {
    try {
      const documentId =
        req.params.id;

      const {
        title,
        description,
        category_id,
      } = req.body;

      if (
        !title ||
        !title.trim()
      ) {
        cleanupUploadedFiles(
          req.files
        );

        return res.status(400).json({
          success: false,
          message:
            "Document title is required.",
        });
      }

      if (!category_id) {
        cleanupUploadedFiles(
          req.files
        );

        return res.status(400).json({
          success: false,
          message:
            "Document category is required.",
        });
      }

      // --------------------------------------------------------
      // EXISTING DOCUMENT
      // --------------------------------------------------------

      const existingResult =
        await pool.query(
          `
          SELECT
            id,
            title,
            description,
            category_id,
            category,
            file_url,
            thumbnail_url,
            file_type,
            file_size
          FROM documents
          WHERE id = $1
          LIMIT 1
          `,
          [documentId]
        );

      if (
        existingResult.rows.length ===
        0
      ) {
        cleanupUploadedFiles(
          req.files
        );

        return res.status(404).json({
          success: false,
          message:
            "Document not found.",
        });
      }

      const existing =
        existingResult.rows[0];

      // --------------------------------------------------------
      // CATEGORY
      // --------------------------------------------------------

      const categoryResult =
        await pool.query(
          `
          SELECT
            id,
            name
          FROM course_categories
          WHERE id = $1
          LIMIT 1
          `,
          [category_id]
        );

      if (
        categoryResult.rows.length ===
        0
      ) {
        cleanupUploadedFiles(
          req.files
        );

        return res.status(400).json({
          success: false,
          message:
            "Selected category does not exist.",
        });
      }

      const category =
        categoryResult.rows[0];

      const documentFile =
        req.files?.file?.[0];

      const thumbnailFile =
        req.files?.thumbnail?.[0];

      // --------------------------------------------------------
      // FILE VALUES
      // --------------------------------------------------------

      let fileUrl =
        existing.file_url;

      let fileType =
        existing.file_type;

      let fileSize =
        existing.file_size;

      let thumbnailUrl =
        existing.thumbnail_url ||
        "";

      if (documentFile) {
        const baseUrl =
          getBaseUrl(req);

        fileUrl =
          `${baseUrl}/uploads/documents/${encodeURIComponent(
            documentFile.filename
          )}`;

        fileType =
          path
            .extname(
              documentFile.originalname
            )
            .replace(
              ".",
              ""
            )
            .toLowerCase();

        fileSize =
          documentFile.size;
      }

      if (thumbnailFile) {
        const baseUrl =
          getBaseUrl(req);

        thumbnailUrl =
          `${baseUrl}/uploads/thumbnails/${encodeURIComponent(
            thumbnailFile.filename
          )}`;
      }

      // --------------------------------------------------------
      // UPDATE
      // --------------------------------------------------------

      const result =
        await pool.query(
          `
          UPDATE documents
          SET
            title = $1,
            description = $2,
            category_id = $3,
            category = $4,
            file_url = $5,
            thumbnail_url = $6,
            file_type = $7,
            file_size = $8
          WHERE id = $9
          RETURNING
            id,
            title,
            description,
            category_id,
            category,
            file_url,
            thumbnail_url,
            file_type,
            file_size,
            created_at
          `,
          [
            title.trim(),
            description?.trim() ||
              "",
            category_id,
            category.name,
            fileUrl,
            thumbnailUrl,
            fileType,
            fileSize,
            documentId,
          ]
        );

      // --------------------------------------------------------
      // DELETE OLD FILES AFTER SUCCESS
      // --------------------------------------------------------

      if (documentFile) {
        deleteStoredFileFromUrl(
          existing.file_url,
          DOCUMENTS_DIR
        );
      }

      if (thumbnailFile) {
        deleteStoredFileFromUrl(
          existing.thumbnail_url,
          THUMBNAILS_DIR
        );
      }

      return res.json({
        success: true,

        message:
          "Document updated successfully.",

        document:
          result.rows[0],
      });
    } catch (error) {
      console.error(
        "DOCUMENT UPDATE ERROR:",
        error
      );

      cleanupUploadedFiles(
        req.files
      );

      return res.status(500).json({
        success: false,

        message:
          error?.message ||
          "Document update failed.",
      });
    }
  }
);

// ============================================================
// DELETE DOCUMENT
// ============================================================

router.delete(
  "/:id",
  requireAdmin,
  async (req, res) => {
    try {
      const documentId =
        req.params.id;

      const existingResult =
        await pool.query(
          `
          SELECT
            id,
            file_url,
            thumbnail_url
          FROM documents
          WHERE id = $1
          LIMIT 1
          `,
          [documentId]
        );

      if (
        existingResult.rows.length ===
        0
      ) {
        return res.status(404).json({
          success: false,
          message:
            "Document not found.",
        });
      }

      const document =
        existingResult.rows[0];

      // Delete database record first
      await pool.query(
        `
        DELETE FROM documents
        WHERE id = $1
        `,
        [documentId]
      );

      // Delete local files
      deleteStoredFileFromUrl(
        document.file_url,
        DOCUMENTS_DIR
      );

      deleteStoredFileFromUrl(
        document.thumbnail_url,
        THUMBNAILS_DIR
      );

      return res.json({
        success: true,

        message:
          "Document deleted successfully.",
      });
    } catch (error) {
      console.error(
        "DOCUMENT DELETE ERROR:",
        error
      );

      return res.status(500).json({
        success: false,

        message:
          "Unable to delete document.",
      });
    }
  }
);

// ============================================================
// HELPERS
// ============================================================

function safeDelete(
  filePath
) {
  try {
    if (
      filePath &&
      fs.existsSync(filePath)
    ) {
      fs.unlinkSync(
        filePath
      );
    }
  } catch (error) {
    console.error(
      "File cleanup error:",
      error
    );
  }
}

function cleanupUploadedFiles(
  files
) {
  if (!files) return;

  Object.values(files)
    .flat()
    .forEach((file) => {
      if (file?.path) {
        safeDelete(
          file.path
        );
      }
    });
}

function deleteStoredFileFromUrl(
  url,
  directory
) {
  try {
    if (!url) return;

    const pathname =
      new URL(url).pathname;

    const filename =
      decodeURIComponent(
        path.basename(
          pathname
        )
      );

    if (!filename) return;

    const filePath =
      path.join(
        directory,
        filename
      );

    // Prevent path traversal
    const resolvedDirectory =
      path.resolve(
        directory
      );

    const resolvedFile =
      path.resolve(
        filePath
      );

    if (
      !resolvedFile.startsWith(
        resolvedDirectory +
          path.sep
      )
    ) {
      return;
    }

    safeDelete(
      resolvedFile
    );
  } catch (error) {
    console.error(
      "Stored file deletion error:",
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
      return res.status(400).json({
        success: false,
        message:
          error.code ===
          "LIMIT_FILE_SIZE"
            ? "File is too large. Maximum size is 100MB."
            : error.message,
      });
    }

    if (error) {
      return res.status(400).json({
        success: false,
        message:
          error.message ||
          "File upload error.",
      });
    }

    next();
  }
);

export default router;