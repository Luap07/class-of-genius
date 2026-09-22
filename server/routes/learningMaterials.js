import express from "express";
import multer from "multer";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import fs from "fs";
import path from "path";
import pool from "../lib/db.js";

const router = express.Router();

/* ============================================================
   CONFIG
============================================================ */

const uploadDir = path.resolve("uploads/materials");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },

  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    const base = path
      .basename(file.originalname, ext)
      .replace(/[^a-zA-Z0-9-_]/g, "_");

    cb(
      null,
      `${Date.now()}-${crypto.randomBytes(6).toString("hex")}-${base}${ext}`
    );
  },
});

const upload = multer({
  storage,

  limits: {
    fileSize: 250 * 1024 * 1024,
  },
});

/* ============================================================
   HELPERS
============================================================ */

const clean = (value) => {
  if (value === undefined || value === null) {
    return null;
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed === "" ? null : trimmed;
  }

  return value;
};

const getTokenFromRequest = (req) => {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.substring(7).trim();
  }

  return (
    req.headers["x-academy-token"] ||
    req.headers["x-auth-token"] ||
    req.cookies?.token ||
    null
  );
};

/* ============================================================
   ADMIN AUTH
============================================================ */

const requireAdmin = (req, res, next) => {
  try {
    const token = getTokenFromRequest(req);

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentication token is required.",
      });
    }

    const secret =
      process.env.JWT_SECRET ||
      process.env.JWT_ACCESS_SECRET ||
      "scholiqen-secret-key";

    const decoded = jwt.verify(token, secret);

    const role = String(
      decoded?.role ||
        decoded?.userType ||
        decoded?.user_type ||
        decoded?.accountType ||
        ""
    ).toLowerCase();

    const isAdmin =
      role === "admin" ||
      role === "administrator" ||
      role === "superadmin";

    if (!isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Admin access required.",
      });
    }

    req.admin = decoded;

    next();
  } catch (error) {
    console.error("ADMIN AUTH ERROR:", error);

    return res.status(401).json({
      success: false,
      message: "Invalid authentication token.",
    });
  }
};

/* ============================================================
   ACCESS CODE GENERATOR
============================================================ */

const generateAccessCode = () => {
  const part1 = crypto.randomBytes(3).toString("hex").toUpperCase();
  const part2 = crypto.randomBytes(3).toString("hex").toUpperCase();
  const part3 = crypto.randomBytes(3).toString("hex").toUpperCase();

  return `SCH-${part1}-${part2}-${part3}`;
};

/* ============================================================
   GET ALL MATERIALS
============================================================ */

router.get("/", requireAdmin, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        id,
        title,
        description,
        subject,
        level,
        material_type,
        file_url,
        created_at,
        file_name,
        file_size,
        file_mime_type,
        cover_page_url,
        back_page_url,
        is_locked,
        access_code_hash,
        access_code
      FROM learning_materials
      ORDER BY created_at DESC
    `);

    return res.json({
      success: true,
      materials: result.rows,
      data: result.rows,
      count: result.rows.length,
    });
  } catch (error) {
    console.error("GET MATERIALS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to load learning materials.",
      error: error.message,
    });
  }
});

/* ============================================================
   GET SINGLE MATERIAL
============================================================ */

router.get("/:id", requireAdmin, async (req, res) => {
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
        file_url,
        created_at,
        file_name,
        file_size,
        file_mime_type,
        cover_page_url,
        back_page_url,
        is_locked,
        access_code_hash,
        access_code
      FROM learning_materials
      WHERE id = $1
      LIMIT 1
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Learning material not found.",
      });
    }

    return res.json({
      success: true,
      material: result.rows[0],
      data: result.rows[0],
    });
  } catch (error) {
    console.error("GET SINGLE MATERIAL ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to load the learning material.",
      error: error.message,
    });
  }
});

/* ============================================================
   CREATE MATERIAL
============================================================ */

router.post(
  "/",
  requireAdmin,
  upload.fields([
    { name: "file", maxCount: 1 },
    { name: "cover_page", maxCount: 1 },
    { name: "back_page", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const {
        title,
        description,
        subject,
        level,
        material_type,
      } = req.body;

      if (!clean(title)) {
        return res.status(400).json({
          success: false,
          message: "Material title is required.",
        });
      }

      const mainFile = req.files?.file?.[0] || null;
      const coverPage = req.files?.cover_page?.[0] || null;
      const backPage = req.files?.back_page?.[0] || null;

      const fileUrl = mainFile
        ? `/uploads/materials/${mainFile.filename}`
        : null;

      const coverPageUrl = coverPage
        ? `/uploads/materials/${coverPage.filename}`
        : null;

      const backPageUrl = backPage
        ? `/uploads/materials/${backPage.filename}`
        : null;

      const result = await pool.query(
        `
        INSERT INTO learning_materials (
          title,
          description,
          subject,
          level,
          material_type,
          file_url,
          file_name,
          file_size,
          file_mime_type,
          cover_page_url,
          back_page_url,
          is_locked,
          access_code_hash,
          access_code
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
          $11,
          $12,
          $13,
          $14
        )
        RETURNING *
        `,
        [
          clean(title),
          clean(description),
          clean(subject),
          clean(level),
          clean(material_type),
          fileUrl,
          mainFile?.originalname || null,
          mainFile?.size || null,
          mainFile?.mimetype || null,
          coverPageUrl,
          backPageUrl,
          false,
          null,
          null,
        ]
      );

      return res.status(201).json({
        success: true,
        message: "Learning material created successfully.",
        material: result.rows[0],
        data: result.rows[0],
      });
    } catch (error) {
      console.error("CREATE MATERIAL ERROR:", error);

      return res.status(500).json({
        success: false,
        message: "Unable to create learning material.",
        error: error.message,
      });
    }
  }
);

/* ============================================================
   UPDATE MATERIAL
============================================================ */

router.put(
  "/:id",
  requireAdmin,
  upload.fields([
    { name: "file", maxCount: 1 },
    { name: "cover_page", maxCount: 1 },
    { name: "back_page", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const { id } = req.params;

      const existingResult = await pool.query(
        `
        SELECT *
        FROM learning_materials
        WHERE id = $1
        LIMIT 1
        `,
        [id]
      );

      if (existingResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Learning material not found.",
        });
      }

      const existing = existingResult.rows[0];

      const title =
        req.body.title !== undefined
          ? clean(req.body.title)
          : existing.title;

      const description =
        req.body.description !== undefined
          ? clean(req.body.description)
          : existing.description;

      const subject =
        req.body.subject !== undefined
          ? clean(req.body.subject)
          : existing.subject;

      const level =
        req.body.level !== undefined
          ? clean(req.body.level)
          : existing.level;

      const materialType =
        req.body.material_type !== undefined
          ? clean(req.body.material_type)
          : existing.material_type;

      const mainFile = req.files?.file?.[0] || null;
      const coverPage = req.files?.cover_page?.[0] || null;
      const backPage = req.files?.back_page?.[0] || null;

      const fileUrl = mainFile
        ? `/uploads/materials/${mainFile.filename}`
        : existing.file_url;

      const fileName = mainFile
        ? mainFile.originalname
        : existing.file_name;

      const fileSize = mainFile
        ? mainFile.size
        : existing.file_size;

      const fileMimeType = mainFile
        ? mainFile.mimetype
        : existing.file_mime_type;

      const coverPageUrl = coverPage
        ? `/uploads/materials/${coverPage.filename}`
        : existing.cover_page_url;

      const backPageUrl = backPage
        ? `/uploads/materials/${backPage.filename}`
        : existing.back_page_url;

      const isLocked =
        req.body.is_locked !== undefined
          ? String(req.body.is_locked) === "true" ||
            req.body.is_locked === true
          : existing.is_locked;

      const result = await pool.query(
        `
        UPDATE learning_materials
        SET
          title = $1,
          description = $2,
          subject = $3,
          level = $4,
          material_type = $5,
          file_url = $6,
          file_name = $7,
          file_size = $8,
          file_mime_type = $9,
          cover_page_url = $10,
          back_page_url = $11,
          is_locked = $12,
          access_code_hash = $13,
          access_code = $14
        WHERE id = $15
        RETURNING *
        `,
        [
          title,
          description,
          subject,
          level,
          materialType,
          fileUrl,
          fileName,
          fileSize,
          fileMimeType,
          coverPageUrl,
          backPageUrl,
          isLocked,
          existing.access_code_hash || null,
          existing.access_code || null,
          id,
        ]
      );

      return res.json({
        success: true,
        message: "Learning material updated successfully.",
        material: result.rows[0],
        data: result.rows[0],
      });
    } catch (error) {
      console.error("UPDATE MATERIAL ERROR:", error);

      return res.status(500).json({
        success: false,
        message: "Unable to update learning material.",
        error: error.message,
      });
    }
  }
);

/* ============================================================
   GENERATE ACCESS CODE
   IMPORTANT:
   - Generates ONCE
   - Saves the plaintext code
   - Saves bcrypt hash
   - Future requests return SAME code
============================================================ */

router.post("/:id/access-code", requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const existingResult = await pool.query(
      `
      SELECT
        id,
        title,
        access_code,
        access_code_hash,
        is_locked
      FROM learning_materials
      WHERE id = $1
      LIMIT 1
      `,
      [id]
    );

    if (existingResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Learning material not found.",
      });
    }

    const material = existingResult.rows[0];

    /*
     * If a code already exists, DO NOT generate another one.
     * This makes the code persistent across logout/login.
     */
    if (material.access_code) {
      return res.json({
        success: true,
        message: "Existing material access code returned.",
        accessCode: material.access_code,
        code: material.access_code,
        material: {
          id: material.id,
          title: material.title,
          is_locked: true,
        },
      });
    }

    const accessCode = generateAccessCode();

    const accessCodeHash = await bcrypt.hash(accessCode, 12);

    const result = await pool.query(
      `
      UPDATE learning_materials
      SET
        access_code = $1,
        access_code_hash = $2,
        is_locked = TRUE
      WHERE id = $3
      RETURNING
        id,
        title,
        is_locked,
        access_code,
        access_code_hash
      `,
      [accessCode, accessCodeHash, id]
    );

    return res.json({
      success: true,
      message: "Material access code generated successfully.",
      accessCode,
      code: accessCode,
      material: result.rows[0],
    });
  } catch (error) {
    console.error("GENERATE MATERIAL ACCESS CODE ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to generate material access code.",
      error: error.message,
    });
  }
});

/* ============================================================
   VERIFY ACCESS CODE
============================================================ */

router.post("/:id/verify-access", async (req, res) => {
  try {
    const { id } = req.params;
    const submittedCode = clean(
      req.body?.accessCode ||
        req.body?.access_code ||
        req.body?.code
    );

    if (!submittedCode) {
      return res.status(400).json({
        success: false,
        message: "Access code is required.",
      });
    }

    const result = await pool.query(
      `
      SELECT
        id,
        title,
        is_locked,
        access_code,
        access_code_hash
      FROM learning_materials
      WHERE id = $1
      LIMIT 1
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Learning material not found.",
      });
    }

    const material = result.rows[0];

    /*
     * Unlocked material does not require a code.
     */
    if (!material.is_locked) {
      return res.json({
        success: true,
        verified: true,
        message: "Material is not locked.",
      });
    }

    let valid = false;

    /*
     * Primary verification uses bcrypt.
     */
    if (material.access_code_hash) {
      valid = await bcrypt.compare(
        submittedCode,
        material.access_code_hash
      );
    }

    /*
     * Fallback for old records that have a plaintext code
     * but no hash yet.
     */
    if (!valid && material.access_code) {
      valid =
        submittedCode.toUpperCase() ===
        String(material.access_code).toUpperCase();
    }

    if (!valid) {
      return res.status(401).json({
        success: false,
        verified: false,
        message: "Invalid material access code.",
      });
    }

    return res.json({
      success: true,
      verified: true,
      message: "Material access granted.",
      material: {
        id: material.id,
        title: material.title,
      },
    });
  } catch (error) {
    console.error("VERIFY MATERIAL ACCESS ERROR:", error);

    return res.status(500).json({
      success: false,
      verified: false,
      message: "Unable to verify material access code.",
      error: error.message,
    });
  }
});

/* ============================================================
   LOCK / UNLOCK MATERIAL
============================================================ */

router.patch("/:id/lock", requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const locked =
      req.body?.is_locked === true ||
      String(req.body?.is_locked).toLowerCase() === "true";

    const result = await pool.query(
      `
      UPDATE learning_materials
      SET is_locked = $1
      WHERE id = $2
      RETURNING *
      `,
      [locked, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Learning material not found.",
      });
    }

    return res.json({
      success: true,
      message: locked
        ? "Material locked successfully."
        : "Material unlocked successfully.",
      material: result.rows[0],
    });
  } catch (error) {
    console.error("LOCK MATERIAL ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to update material lock status.",
      error: error.message,
    });
  }
});

/* ============================================================
   DELETE MATERIAL
============================================================ */

router.delete("/:id", requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `
      DELETE FROM learning_materials
      WHERE id = $1
      RETURNING *
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Learning material not found.",
      });
    }

    const material = result.rows[0];

    /*
     * Delete uploaded files from disk when possible.
     */
    const urls = [
      material.file_url,
      material.cover_page_url,
      material.back_page_url,
    ];

    for (const fileUrl of urls) {
      if (!fileUrl) continue;

      try {
        const relativePath = fileUrl.replace(/^\/+/, "");
        const absolutePath = path.resolve(relativePath);

        if (fs.existsSync(absolutePath)) {
          fs.unlinkSync(absolutePath);
        }
      } catch (fileError) {
        console.warn(
          "Unable to delete material file:",
          fileError.message
        );
      }
    }

    return res.json({
      success: true,
      message: "Learning material deleted successfully.",
      material,
    });
  } catch (error) {
    console.error("DELETE MATERIAL ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to delete learning material.",
      error: error.message,
    });
  }
});

/* ============================================================
   EXPORT
============================================================ */

export default router;