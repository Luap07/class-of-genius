import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import { fileURLToPath } from "url";

import pool from "../lib/db.js";

const router = express.Router();

/* =========================================================
   PATHS
========================================================= */

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MATERIALS_DIR = path.join(
  __dirname,
  "..",
  "uploads",
  "materials"
);

if (!fs.existsSync(MATERIALS_DIR)) {
  fs.mkdirSync(MATERIALS_DIR, { recursive: true });
}

/* =========================================================
   CONSTANTS
========================================================= */

const MAX_FILE_SIZE = 250 * 1024 * 1024;
const MAX_COVER_SIZE = 15 * 1024 * 1024;

const MATERIAL_EXTENSIONS = new Set([
  ".pdf",
  ".doc",
  ".docx",
  ".mp4",
  ".webm",
  ".mov",
]);

const MATERIAL_MIME_TYPES = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "video/mp4",
  "video/webm",
  "video/quicktime",
]);

const IMAGE_EXTENSIONS = new Set([
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
]);

const IMAGE_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

/* =========================================================
   HELPERS
========================================================= */

function getExtension(filename = "") {
  return path.extname(filename).toLowerCase();
}

function getMaterialTypeFromExtension(extension) {
  switch (extension) {
    case ".pdf":
      return "pdf";

    case ".doc":
      return "doc";

    case ".docx":
      return "docx";

    case ".mp4":
    case ".webm":
    case ".mov":
      return "video";

    default:
      return null;
  }
}

function getMaterialTypeFromMime(mimeType = "") {
  if (mimeType === "application/pdf") {
    return "pdf";
  }

  if (mimeType === "application/msword") {
    return "doc";
  }

  if (
    mimeType ===
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    return "docx";
  }

  if (
    mimeType === "video/mp4" ||
    mimeType === "video/webm" ||
    mimeType === "video/quicktime"
  ) {
    return "video";
  }

  return null;
}

function makeSafeFilename(originalName = "") {
  const extension = path.extname(originalName).toLowerCase();

  const baseName = path
    .basename(originalName, extension)
    .replace(/[^a-zA-Z0-9_-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);

  const randomPart = crypto.randomBytes(8).toString("hex");

  return `${Date.now()}-${randomPart}-${baseName || "file"}${extension}`;
}

function getPhysicalPathFromUrl(fileUrl) {
  if (!fileUrl) {
    return null;
  }

  const cleanUrl = fileUrl.split("?")[0];

  if (!cleanUrl.startsWith("/uploads/")) {
    return null;
  }

  const relativePath = cleanUrl.replace(/^\/uploads\//, "");

  const fullPath = path.resolve(
    __dirname,
    "..",
    "uploads",
    relativePath
  );

  const uploadsRoot = path.resolve(
    __dirname,
    "..",
    "uploads"
  );

  if (
    fullPath !== uploadsRoot &&
    !fullPath.startsWith(`${uploadsRoot}${path.sep}`)
  ) {
    return null;
  }

  return fullPath;
}

function deletePhysicalFile(fileUrl) {
  try {
    const filePath = getPhysicalPathFromUrl(fileUrl);

    if (!filePath) {
      return;
    }

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (error) {
    console.error(
      "Unable to delete physical material file:",
      error
    );
  }
}

function cleanupUploadedFiles(files) {
  if (!files) {
    return;
  }

  const fields = Object.values(files);

  for (const fieldFiles of fields) {
    if (!Array.isArray(fieldFiles)) {
      continue;
    }

    for (const file of fieldFiles) {
      if (file?.path && fs.existsSync(file.path)) {
        try {
          fs.unlinkSync(file.path);
        } catch (error) {
          console.error(
            "Unable to clean uploaded file:",
            error
          );
        }
      }
    }
  }
}

function getUploadedFile(files, fieldName) {
  if (!files?.[fieldName]) {
    return null;
  }

  return files[fieldName][0] || null;
}

function normalizeMaterialType(value) {
  const type = String(value || "")
    .trim()
    .toLowerCase();

  if (["pdf", "doc", "docx", "video"].includes(type)) {
    return type;
  }

  return null;
}

function isValidImage(file) {
  if (!file) {
    return false;
  }

  const extension = getExtension(file.originalname);
  const mimeType = file.mimetype;

  return (
    IMAGE_EXTENSIONS.has(extension) &&
    IMAGE_MIME_TYPES.has(mimeType)
  );
}

/* =========================================================
   MULTER STORAGE
========================================================= */

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, MATERIALS_DIR);
  },

  filename: (req, file, cb) => {
    cb(null, makeSafeFilename(file.originalname));
  },
});

/* =========================================================
   MULTER
========================================================= */

const upload = multer({
  storage,

  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 3,
  },

  fileFilter: (req, file, cb) => {
    const extension = getExtension(file.originalname);
    const mimeType = file.mimetype;
    const fieldName = file.fieldname;

    /* ---------------------------------------------
       MAIN MATERIAL FILE
    --------------------------------------------- */

    if (fieldName === "file") {
      if (!MATERIAL_EXTENSIONS.has(extension)) {
        return cb(
          new Error(
            "Unsupported material file extension. Allowed files are PDF, DOC, DOCX, MP4, WEBM and MOV."
          )
        );
      }

      if (!MATERIAL_MIME_TYPES.has(mimeType)) {
        return cb(
          new Error(
            "Unsupported material file type."
          )
        );
      }

      return cb(null, true);
    }

    /* ---------------------------------------------
       FRONT COVER
    --------------------------------------------- */

    if (fieldName === "cover_page") {
      if (!IMAGE_EXTENSIONS.has(extension)) {
        return cb(
          new Error(
            "Unsupported front cover image. Use JPG, JPEG, PNG or WEBP."
          )
        );
      }

      if (!IMAGE_MIME_TYPES.has(mimeType)) {
        return cb(
          new Error(
            "Unsupported front cover image type."
          )
        );
      }

      return cb(null, true);
    }

    /* ---------------------------------------------
       BACK COVER
    --------------------------------------------- */

    if (fieldName === "back_page") {
      if (!IMAGE_EXTENSIONS.has(extension)) {
        return cb(
          new Error(
            "Unsupported back cover image. Use JPG, JPEG, PNG or WEBP."
          )
        );
      }

      if (!IMAGE_MIME_TYPES.has(mimeType)) {
        return cb(
          new Error(
            "Unsupported back cover image type."
          )
        );
      }

      return cb(null, true);
    }

    return cb(
      new Error(
        `Unexpected field: ${fieldName}`
      )
    );
  },
});

/* =========================================================
   GET ALL MATERIALS
   GET /api/admin/lms/materials
========================================================= */

router.get("/", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        id,
        title,
        description,
        subject,
        level,
        material_type,
        file_name,
        file_size,
        file_mime_type,
        file_url,
        cover_page_url,
        back_page_url,
        created_at
      FROM learning_materials
      ORDER BY created_at DESC
    `);

    return res.json({
      success: true,
      materials: result.rows,
    });
  } catch (error) {
    console.error(
      "GET /api/admin/lms/materials error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Unable to load materials.",
      error: error.message,
    });
  }
});

/* =========================================================
   GET ONE MATERIAL
   GET /api/admin/lms/materials/:id
========================================================= */

router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `
        SELECT
          id,
          title,
          description,
          subject,
          level,
          material_type,
          file_name,
          file_size,
          file_mime_type,
          file_url,
          cover_page_url,
          back_page_url,
          created_at
        FROM learning_materials
        WHERE id = $1
        LIMIT 1
      `,
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Material not found.",
      });
    }

    return res.json({
      success: true,
      material: result.rows[0],
    });
  } catch (error) {
    console.error(
      "GET /api/admin/lms/materials/:id error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Unable to load material.",
      error: error.message,
    });
  }
});

/* =========================================================
   CREATE MATERIAL
   POST /api/admin/lms/materials

   Expected FormData:

   title
   description
   subject
   level
   material_type
   file
   cover_page
   back_page
========================================================= */

router.post(
  "/",
  upload.fields([
    {
      name: "file",
      maxCount: 1,
    },
    {
      name: "cover_page",
      maxCount: 1,
    },
    {
      name: "back_page",
      maxCount: 1,
    },
  ]),
  async (req, res) => {
    const uploadedFiles = req.files;

    try {
      const {
        title,
        description,
        subject,
        level,
        material_type,
      } = req.body;

      const materialFile = getUploadedFile(
        uploadedFiles,
        "file"
      );

      const coverFile = getUploadedFile(
        uploadedFiles,
        "cover_page"
      );

      const backFile = getUploadedFile(
        uploadedFiles,
        "back_page"
      );

      /* ---------------------------------------------
         REQUIRED TEXT FIELDS
      --------------------------------------------- */

      if (!String(title || "").trim()) {
        cleanupUploadedFiles(uploadedFiles);

        return res.status(400).json({
          success: false,
          message: "Material title is required.",
        });
      }

      if (!String(subject || "").trim()) {
        cleanupUploadedFiles(uploadedFiles);

        return res.status(400).json({
          success: false,
          message: "Subject is required.",
        });
      }

      if (!String(level || "").trim()) {
        cleanupUploadedFiles(uploadedFiles);

        return res.status(400).json({
          success: false,
          message: "Academic level is required.",
        });
      }

      const normalizedMaterialType =
        normalizeMaterialType(material_type);

      if (!normalizedMaterialType) {
        cleanupUploadedFiles(uploadedFiles);

        return res.status(400).json({
          success: false,
          message:
            "A valid material type is required.",
        });
      }

      /* ---------------------------------------------
         REQUIRED MAIN FILE
      --------------------------------------------- */

      if (!materialFile) {
        cleanupUploadedFiles(uploadedFiles);

        return res.status(400).json({
          success: false,
          message: "The material file is required.",
        });
      }

      /* ---------------------------------------------
         REQUIRED FRONT COVER
      --------------------------------------------- */

      if (!coverFile) {
        cleanupUploadedFiles(uploadedFiles);

        return res.status(400).json({
          success: false,
          message:
            "The front cover page is required.",
        });
      }

      /* ---------------------------------------------
         REQUIRED BACK COVER
      --------------------------------------------- */

      if (!backFile) {
        cleanupUploadedFiles(uploadedFiles);

        return res.status(400).json({
          success: false,
          message:
            "The back cover page is required.",
        });
      }

      /* ---------------------------------------------
         VALIDATE MATERIAL TYPE AGAINST FILE
      --------------------------------------------- */

      const extension = getExtension(
        materialFile.originalname
      );

      const detectedType =
        getMaterialTypeFromExtension(extension) ||
        getMaterialTypeFromMime(
          materialFile.mimetype
        );

      if (
        detectedType &&
        detectedType !== normalizedMaterialType
      ) {
        cleanupUploadedFiles(uploadedFiles);

        return res.status(400).json({
          success: false,
          message:
            `Material type does not match the uploaded file. Detected: ${detectedType}.`,
        });
      }

      /* ---------------------------------------------
         VALIDATE COVER IMAGES
      --------------------------------------------- */

      if (!isValidImage(coverFile)) {
        cleanupUploadedFiles(uploadedFiles);

        return res.status(400).json({
          success: false,
          message:
            "Invalid front cover image.",
        });
      }

      if (!isValidImage(backFile)) {
        cleanupUploadedFiles(uploadedFiles);

        return res.status(400).json({
          success: false,
          message:
            "Invalid back cover image.",
        });
      }

      /* ---------------------------------------------
         COVER SIZE CHECK
      --------------------------------------------- */

      if (coverFile.size > MAX_COVER_SIZE) {
        cleanupUploadedFiles(uploadedFiles);

        return res.status(400).json({
          success: false,
          message:
            "Front cover image is too large. Maximum size is 15MB.",
        });
      }

      if (backFile.size > MAX_COVER_SIZE) {
        cleanupUploadedFiles(uploadedFiles);

        return res.status(400).json({
          success: false,
          message:
            "Back cover image is too large. Maximum size is 15MB.",
        });
      }

      /* ---------------------------------------------
         URLS
      --------------------------------------------- */

      const fileUrl =
        `/uploads/materials/${materialFile.filename}`;

      const coverPageUrl =
        `/uploads/materials/${coverFile.filename}`;

      const backPageUrl =
        `/uploads/materials/${backFile.filename}`;

      /* ---------------------------------------------
         DATABASE INSERT
      --------------------------------------------- */

      const result = await pool.query(
        `
          INSERT INTO learning_materials (
            title,
            description,
            subject,
            level,
            material_type,
            file_name,
            file_size,
            file_mime_type,
            file_url,
            cover_page_url,
            back_page_url
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
            $9,
            $10,
            $11
          )
          RETURNING
            id,
            title,
            description,
            subject,
            level,
            material_type,
            file_name,
            file_size,
            file_mime_type,
            file_url,
            cover_page_url,
            back_page_url,
            created_at
        `,
        [
          String(title).trim(),
          String(description || "").trim(),
          String(subject).trim(),
          String(level).trim(),
          normalizedMaterialType,
          materialFile.originalname,
          materialFile.size,
          materialFile.mimetype,
          fileUrl,
          coverPageUrl,
          backPageUrl,
        ]
      );

      return res.status(201).json({
        success: true,
        message: "Material created successfully.",
        material: result.rows[0],
      });
    } catch (error) {
      cleanupUploadedFiles(uploadedFiles);

      console.error(
        "POST /api/admin/lms/materials error:",
        error
      );

      return res.status(500).json({
        success: false,
        message: "Unable to create material.",
        error: error.message,
      });
    }
  }
);

/* =========================================================
   UPDATE MATERIAL
   PUT /api/admin/lms/materials/:id

   Any of these can optionally be replaced:

   file
   cover_page
   back_page
========================================================= */

router.put(
  "/:id",
  upload.fields([
    {
      name: "file",
      maxCount: 1,
    },
    {
      name: "cover_page",
      maxCount: 1,
    },
    {
      name: "back_page",
      maxCount: 1,
    },
  ]),
  async (req, res) => {
    const uploadedFiles = req.files;

    try {
      const { id } = req.params;

      const {
        title,
        description,
        subject,
        level,
        material_type,
      } = req.body;

      /* ---------------------------------------------
         GET EXISTING MATERIAL
      --------------------------------------------- */

      const existingResult = await pool.query(
        `
          SELECT
            id,
            title,
            description,
            subject,
            level,
            material_type,
            file_name,
            file_size,
            file_mime_type,
            file_url,
            cover_page_url,
            back_page_url
          FROM learning_materials
          WHERE id = $1
          LIMIT 1
        `,
        [id]
      );

      if (existingResult.rowCount === 0) {
        cleanupUploadedFiles(uploadedFiles);

        return res.status(404).json({
          success: false,
          message: "Material not found.",
        });
      }

      const existing =
        existingResult.rows[0];

      /* ---------------------------------------------
         VALIDATE TEXT
      --------------------------------------------- */

      if (!String(title || "").trim()) {
        cleanupUploadedFiles(uploadedFiles);

        return res.status(400).json({
          success: false,
          message: "Material title is required.",
        });
      }

      if (!String(subject || "").trim()) {
        cleanupUploadedFiles(uploadedFiles);

        return res.status(400).json({
          success: false,
          message: "Subject is required.",
        });
      }

      if (!String(level || "").trim()) {
        cleanupUploadedFiles(uploadedFiles);

        return res.status(400).json({
          success: false,
          message: "Academic level is required.",
        });
      }

      const normalizedMaterialType =
        normalizeMaterialType(material_type);

      if (!normalizedMaterialType) {
        cleanupUploadedFiles(uploadedFiles);

        return res.status(400).json({
          success: false,
          message:
            "A valid material type is required.",
        });
      }

      /* ---------------------------------------------
         NEW FILES
      --------------------------------------------- */

      const newMaterialFile =
        getUploadedFile(
          uploadedFiles,
          "file"
        );

      const newCoverFile =
        getUploadedFile(
          uploadedFiles,
          "cover_page"
        );

      const newBackFile =
        getUploadedFile(
          uploadedFiles,
          "back_page"
        );

      /* ---------------------------------------------
         FILE VARIABLES
      --------------------------------------------- */

      let fileName = existing.file_name;
      let fileSize = existing.file_size;
      let fileMimeType =
        existing.file_mime_type;
      let fileUrl = existing.file_url;

      let coverPageUrl =
        existing.cover_page_url;

      let backPageUrl =
        existing.back_page_url;

      /* ---------------------------------------------
         REPLACE MATERIAL FILE
      --------------------------------------------- */

      if (newMaterialFile) {
        const extension = getExtension(
          newMaterialFile.originalname
        );

        const detectedType =
          getMaterialTypeFromExtension(
            extension
          ) ||
          getMaterialTypeFromMime(
            newMaterialFile.mimetype
          );

        if (
          detectedType &&
          detectedType !== normalizedMaterialType
        ) {
          cleanupUploadedFiles(uploadedFiles);

          return res.status(400).json({
            success: false,
            message:
              `Material type does not match the uploaded file. Detected: ${detectedType}.`,
          });
        }

        fileName =
          newMaterialFile.originalname;

        fileSize =
          newMaterialFile.size;

        fileMimeType =
          newMaterialFile.mimetype;

        fileUrl =
          `/uploads/materials/${newMaterialFile.filename}`;
      }

      /* ---------------------------------------------
         REPLACE FRONT COVER
      --------------------------------------------- */

      if (newCoverFile) {
        if (!isValidImage(newCoverFile)) {
          cleanupUploadedFiles(uploadedFiles);

          return res.status(400).json({
            success: false,
            message:
              "Invalid front cover image.",
          });
        }

        if (newCoverFile.size > MAX_COVER_SIZE) {
          cleanupUploadedFiles(uploadedFiles);

          return res.status(400).json({
            success: false,
            message:
              "Front cover image is too large. Maximum size is 15MB.",
          });
        }

        coverPageUrl =
          `/uploads/materials/${newCoverFile.filename}`;
      }

      /* ---------------------------------------------
         REPLACE BACK COVER
      --------------------------------------------- */

      if (newBackFile) {
        if (!isValidImage(newBackFile)) {
          cleanupUploadedFiles(uploadedFiles);

          return res.status(400).json({
            success: false,
            message:
              "Invalid back cover image.",
          });
        }

        if (newBackFile.size > MAX_COVER_SIZE) {
          cleanupUploadedFiles(uploadedFiles);

          return res.status(400).json({
            success: false,
            message:
              "Back cover image is too large. Maximum size is 15MB.",
          });
        }

        backPageUrl =
          `/uploads/materials/${newBackFile.filename}`;
      }

      /* ---------------------------------------------
         UPDATE DATABASE
      --------------------------------------------- */

      const result = await pool.query(
        `
          UPDATE learning_materials
          SET
            title = $1,
            description = $2,
            subject = $3,
            level = $4,
            material_type = $5,
            file_name = $6,
            file_size = $7,
            file_mime_type = $8,
            file_url = $9,
            cover_page_url = $10,
            back_page_url = $11
          WHERE id = $12
          RETURNING
            id,
            title,
            description,
            subject,
            level,
            material_type,
            file_name,
            file_size,
            file_mime_type,
            file_url,
            cover_page_url,
            back_page_url,
            created_at
        `,
        [
          String(title).trim(),
          String(description || "").trim(),
          String(subject).trim(),
          String(level).trim(),
          normalizedMaterialType,
          fileName,
          fileSize,
          fileMimeType,
          fileUrl,
          coverPageUrl,
          backPageUrl,
          id,
        ]
      );

      /* ---------------------------------------------
         DELETE OLD MATERIAL FILE
         ONLY IF A NEW ONE WAS UPLOADED
      --------------------------------------------- */

      if (
        newMaterialFile &&
        existing.file_url &&
        existing.file_url !== fileUrl
      ) {
        deletePhysicalFile(
          existing.file_url
        );
      }

      /* ---------------------------------------------
         DELETE OLD FRONT COVER
         ONLY IF A NEW ONE WAS UPLOADED
      --------------------------------------------- */

      if (
        newCoverFile &&
        existing.cover_page_url &&
        existing.cover_page_url !== coverPageUrl
      ) {
        deletePhysicalFile(
          existing.cover_page_url
        );
      }

      /* ---------------------------------------------
         DELETE OLD BACK COVER
         ONLY IF A NEW ONE WAS UPLOADED
      --------------------------------------------- */

      if (
        newBackFile &&
        existing.back_page_url &&
        existing.back_page_url !== backPageUrl
      ) {
        deletePhysicalFile(
          existing.back_page_url
        );
      }

      return res.json({
        success: true,
        message: "Material updated successfully.",
        material: result.rows[0],
      });
    } catch (error) {
      cleanupUploadedFiles(uploadedFiles);

      console.error(
        "PUT /api/admin/lms/materials/:id error:",
        error
      );

      return res.status(500).json({
        success: false,
        message: "Unable to update material.",
        error: error.message,
      });
    }
  }
);

/* =========================================================
   DELETE MATERIAL
   DELETE /api/admin/lms/materials/:id
========================================================= */

router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    /* ---------------------------------------------
       GET FILE URLS FIRST
    --------------------------------------------- */

    const existingResult = await pool.query(
      `
        SELECT
          id,
          file_url,
          cover_page_url,
          back_page_url
        FROM learning_materials
        WHERE id = $1
        LIMIT 1
      `,
      [id]
    );

    if (existingResult.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Material not found.",
      });
    }

    const existing =
      existingResult.rows[0];

    /* ---------------------------------------------
       DELETE DATABASE RECORD
    --------------------------------------------- */

    await pool.query(
      `
        DELETE FROM learning_materials
        WHERE id = $1
      `,
      [id]
    );

    /* ---------------------------------------------
       DELETE MAIN MATERIAL FILE
    --------------------------------------------- */

    deletePhysicalFile(
      existing.file_url
    );

    /* ---------------------------------------------
       DELETE FRONT COVER
    --------------------------------------------- */

    deletePhysicalFile(
      existing.cover_page_url
    );

    /* ---------------------------------------------
       DELETE BACK COVER
    --------------------------------------------- */

    deletePhysicalFile(
      existing.back_page_url
    );

    return res.json({
      success: true,
      message: "Material deleted successfully.",
    });
  } catch (error) {
    console.error(
      "DELETE /api/admin/lms/materials/:id error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Unable to delete material.",
      error: error.message,
    });
  }
});

/* =========================================================
   MULTER / GENERAL ERROR HANDLER
========================================================= */

router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        message:
          "One of the uploaded files is too large. The maximum material file size is 250MB.",
      });
    }

    if (error.code === "LIMIT_FILE_COUNT") {
      return res.status(400).json({
        success: false,
        message:
          "Too many files were uploaded.",
      });
    }

    if (error.code === "LIMIT_UNEXPECTED_FILE") {
      return res.status(400).json({
        success: false,
        message:
          `Unexpected upload field: ${error.field || "unknown"}.`,
      });
    }

    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }

  if (error) {
    console.error(
      "Material upload error:",
      error
    );

    return res.status(400).json({
      success: false,
      message:
        error.message ||
        "Unable to process material upload.",
    });
  }

  next();
});

export default router;