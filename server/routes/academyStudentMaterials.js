import express from "express";
import pool from "../lib/db.js";
import crypto from "crypto";
import fs from "fs";
import path from "path";
import bcrypt from "bcryptjs";

const router = express.Router();

/* ============================================================
   HELPERS
============================================================ */

const clean = (value) => {
  if (value === undefined || value === null) {
    return "";
  }

  return String(value).trim();
};

const getBearerToken = (req) => {
  const authorization = req.headers.authorization || "";

  if (
    !authorization ||
    !authorization.toLowerCase().startsWith("bearer ")
  ) {
    return "";
  }

  return authorization.slice(7).trim();
};

const firstValue = (...values) => {
  for (const value of values) {
    if (
      value !== undefined &&
      value !== null &&
      String(value).trim() !== ""
    ) {
      return value;
    }
  }

  return "";
};

/* ============================================================
   MATERIAL ACCESS TOKEN
============================================================ */

/*
 * We do NOT use an environment variable for the student's
 * access code.
 *
 * The admin-generated access code is stored in:
 *
 *   access_code
 *   access_code_hash
 *
 * This token is only a temporary permission token that allows
 * the student to open/download the specific material.
 *
 * Format:
 *
 *   base64url(payload).signature
 *
 * Payload contains:
 *
 *   materialId
 *   issuedAt
 *   expiresAt
 *
 * The signature prevents students from changing the material ID
 * or expiration time.
 */

const MATERIAL_TOKEN_SECRET =
  process.env.JWT_SECRET ||
  "scholiqen-material-access-secret-change-later";

const MATERIAL_TOKEN_LIFETIME_MS =
  12 * 60 * 60 * 1000; // 12 hours

const base64UrlEncode = (value) => {
  return Buffer.from(value)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
};

const base64UrlDecode = (value) => {
  let normalized = String(value)
    .replace(/-/g, "+")
    .replace(/_/g, "/");

  while (normalized.length % 4 !== 0) {
    normalized += "=";
  }

  return Buffer.from(normalized, "base64").toString("utf8");
};

const createMaterialAccessToken = (materialId) => {
  const now = Date.now();

  const payload = {
    materialId: String(materialId),
    issuedAt: now,
    expiresAt: now + MATERIAL_TOKEN_LIFETIME_MS,
    type: "material_access",
  };

  const payloadEncoded = base64UrlEncode(
    JSON.stringify(payload)
  );

  const signature = crypto
    .createHmac(
      "sha256",
      MATERIAL_TOKEN_SECRET
    )
    .update(payloadEncoded)
    .digest("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");

  return `${payloadEncoded}.${signature}`;
};

const verifyMaterialAccessToken = (
  token,
  expectedMaterialId
) => {
  try {
    const value = clean(token);

    if (!value) {
      return {
        valid: false,
        reason: "Material access token is missing.",
      };
    }

    const parts = value.split(".");

    if (parts.length !== 2) {
      return {
        valid: false,
        reason: "Invalid material access token.",
      };
    }

    const [
      payloadEncoded,
      receivedSignature,
    ] = parts;

    const expectedSignature = crypto
      .createHmac(
        "sha256",
        MATERIAL_TOKEN_SECRET
      )
      .update(payloadEncoded)
      .digest("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/g, "");

    const receivedBuffer = Buffer.from(
      receivedSignature
    );

    const expectedBuffer = Buffer.from(
      expectedSignature
    );

    if (
      receivedBuffer.length !==
      expectedBuffer.length
    ) {
      return {
        valid: false,
        reason: "Invalid material access token.",
      };
    }

    if (
      !crypto.timingSafeEqual(
        receivedBuffer,
        expectedBuffer
      )
    ) {
      return {
        valid: false,
        reason: "Invalid material access token.",
      };
    }

    const payload = JSON.parse(
      base64UrlDecode(
        payloadEncoded
      )
    );

    if (
      !payload?.materialId ||
      String(payload.materialId) !==
        String(expectedMaterialId)
    ) {
      return {
        valid: false,
        reason:
          "This access token does not belong to this material.",
      };
    }

    if (
      !payload?.expiresAt ||
      Date.now() >
        Number(payload.expiresAt)
    ) {
      return {
        valid: false,
        reason:
          "Material access token has expired.",
      };
    }

    return {
      valid: true,
      payload,
    };
  } catch (error) {
    console.error(
      "Material access token verification error:",
      error
    );

    return {
      valid: false,
      reason: "Invalid material access token.",
    };
  }
};

/* ============================================================
   MATERIAL TYPE
============================================================ */

const getMaterialType = (
  material
) => {
  const value = String(
    material?.material_type ||
      material?.file_mime_type ||
      material?.file_name ||
      ""
  ).toLowerCase();

  if (
    value.includes("video") ||
    value.includes(".mp4") ||
    value.includes(".webm") ||
    value.includes(".mov") ||
    value.includes("quicktime")
  ) {
    return "video";
  }

  if (
    value.includes("pdf") ||
    value.includes(".pdf")
  ) {
    return "pdf";
  }

  return "document";
};

/* ============================================================
   NORMALIZE MATERIAL
============================================================ */

/*
 * IMPORTANT:
 *
 * file_url is intentionally NOT returned to the student.
 *
 * The student must use:
 *
 *   /:id/content
 *
 * with a valid X-Material-Access-Token.
 */

const normalizeMaterial = (
  material
) => {
  if (!material) {
    return null;
  }

  const materialType = clean(
    firstValue(
      material.material_type,
      material.type,
      material.file_mime_type
    )
  );

  const fileName = clean(
    firstValue(
      material.file_name,
      material.fileName,
      material.title
    )
  );

  const level = clean(
    firstValue(
      material.level,
      material.class_name,
      material.className,
      material.class,
      material.grade
    )
  );

  const subject = clean(
    firstValue(
      material.subject,
      material.subject_name,
      material.subjectName
    )
  );

  return {
    id: material.id,

    title: clean(
      material.title
    ),

    description: clean(
      material.description
    ),

    subject,

    level,

    class_name: level,

    className: level,

    grade: level,

    material_type:
      materialType,

    type:
      materialType,

    file_name:
      fileName,

    fileName,

    file_size:
      material.file_size ??
      null,

    file_mime_type:
      clean(
        material.file_mime_type
      ),

    cover_page_url:
      clean(
        material.cover_page_url
      ),

    back_page_url:
      clean(
        material.back_page_url
      ),

    created_at:
      material.created_at,

    is_locked:
      Boolean(
        material.is_locked
      ),

    /*
     * Do NOT expose:
     *
     * access_code
     * access_code_hash
     * file_url
     */

    material_kind:
      getMaterialType(
        material
      ),
  };
};

/* ============================================================
   DATABASE SELECT
============================================================ */

const MATERIAL_SELECT = `
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
    created_at,
    is_locked,
    access_code,
    access_code_hash
  FROM learning_materials
`;

/* ============================================================
   REQUIRE ACADEMY TOKEN
============================================================ */

const requireAcademyToken = (
  req,
  res
) => {
  const token =
    getBearerToken(req);

  if (!token) {
    res.status(401).json({
      success: false,
      error:
        "Authentication token is required.",
      message:
        "Your Academy login session is missing.",
    });

    return null;
  }

  return token;
};

/* ============================================================
   GET STUDENT MATERIALS
   GET /api/academy/student/materials
============================================================ */

router.get(
  "/",
  async (req, res) => {
    try {
      console.log("");
      console.log(
        "=================================================="
      );
      console.log(
        "📚 STUDENT MATERIALS REQUEST"
      );
      console.log(
        "=================================================="
      );

      const token =
        requireAcademyToken(
          req,
          res
        );

      if (!token) {
        return;
      }

      console.log(
        "🔐 Academy token:",
        token
          ? "YES ✅"
          : "NO ❌"
      );

      const result =
        await pool.query(`
          ${MATERIAL_SELECT}
          ORDER BY created_at DESC
        `);

      const materials =
        (result.rows || [])
          .map(
            normalizeMaterial
          )
          .filter(Boolean);

      console.log(
        `📦 Materials found: ${materials.length}`
      );

      return res.status(200).json({
        success: true,

        materials,

        data:
          materials,

        results:
          materials,

        count:
          materials.length,

        total:
          materials.length,
      });
    } catch (error) {
      console.error("");
      console.error(
        "=================================================="
      );
      console.error(
        "❌ STUDENT MATERIALS API ERROR"
      );
      console.error(
        "=================================================="
      );
      console.error(
        "Message:",
        error?.message
      );
      console.error(
        "Code:",
        error?.code
      );
      console.error(
        "Detail:",
        error?.detail
      );
      console.error(
        "Stack:",
        error?.stack
      );
      console.error(
        "=================================================="
      );

      return res.status(500).json({
        success: false,

        materials: [],

        data: [],

        results: [],

        count: 0,

        total: 0,

        error:
          "Unable to load student materials.",

        details:
          process.env.NODE_ENV ===
          "development"
            ? error?.message
            : undefined,
      });
    }
  }
);

/* ============================================================
   TEST ENDPOINT
   IMPORTANT:
   KEEP BEFORE /:id
============================================================ */

router.get(
  "/test",
  async (req, res) => {
    try {
      const result =
        await pool.query(`
          SELECT
            COUNT(*)::integer AS count
          FROM learning_materials
        `);

      const count =
        Number(
          result.rows[0]?.count ||
            0
        );

      return res.status(200).json({
        success: true,

        message:
          "Student materials endpoint is working.",

        table:
          "learning_materials",

        count,
      });
    } catch (error) {
      console.error(
        "Student materials test error:",
        error
      );

      return res.status(500).json({
        success: false,

        error:
          error?.message ||
          "Unable to check materials.",
      });
    }
  }
);

/* ============================================================
   GET ONE STUDENT MATERIAL
   GET /api/academy/student/materials/:id
============================================================ */

router.get(
  "/:id",
  async (req, res) => {
    try {
      console.log("");
      console.log(
        "=================================================="
      );
      console.log(
        "📖 STUDENT SINGLE MATERIAL REQUEST"
      );
      console.log(
        "=================================================="
      );

      const token =
        requireAcademyToken(
          req,
          res
        );

      if (!token) {
        return;
      }

      const materialId =
        clean(
          req.params.id
        );

      console.log(
        "📚 Material ID:",
        materialId ||
          "NOT PROVIDED"
      );

      if (!materialId) {
        return res.status(400).json({
          success: false,

          material: null,

          error:
            "Material ID is required.",
        });
      }

      const result =
        await pool.query(
          `
            ${MATERIAL_SELECT}
            WHERE id = $1
            LIMIT 1
          `,
          [materialId]
        );

      if (!result.rows.length) {
        console.warn(
          "⚠️ Material not found:",
          materialId
        );

        return res.status(404).json({
          success: false,

          material: null,

          data: null,

          error:
            "Material not found.",
        });
      }

      const material =
        normalizeMaterial(
          result.rows[0]
        );

      console.log(
        "✅ Material found:",
        material?.title
      );

      return res.status(200).json({
        success: true,

        material,

        data:
          material,
      });
    } catch (error) {
      console.error("");
      console.error(
        "=================================================="
      );
      console.error(
        "❌ SINGLE STUDENT MATERIAL ERROR"
      );
      console.error(
        "=================================================="
      );
      console.error(
        "Message:",
        error?.message
      );
      console.error(
        "Code:",
        error?.code
      );
      console.error(
        "Detail:",
        error?.detail
      );
      console.error(
        "Stack:",
        error?.stack
      );
      console.error(
        "=================================================="
      );

      return res.status(500).json({
        success: false,

        material: null,

        data: null,

        error:
          "Unable to load this material.",

        details:
          process.env.NODE_ENV ===
          "development"
            ? error?.message
            : undefined,
      });
    }
  }
);

/* ============================================================
   UNLOCK MATERIAL
   POST /api/academy/student/materials/:id/unlock
============================================================ */

/*
 * This is the route your StudentTextbooks.jsx was missing.
 *
 * Locked material:
 *
 *   student enters code
 *          ↓
 *   access_code / access_code_hash checked
 *          ↓
 *   temporary material access token generated
 *          ↓
 *   frontend stores token in sessionStorage
 *          ↓
 *   frontend opens PDF/video
 *
 * Unlocked material:
 *
 *   code can be empty
 *          ↓
 *   material access token generated
 */

router.post(
  "/:id/unlock",
  async (req, res) => {
    try {
      console.log("");
      console.log(
        "=================================================="
      );
      console.log(
        "🔓 STUDENT MATERIAL UNLOCK"
      );
      console.log(
        "=================================================="
      );

      const academyToken =
        requireAcademyToken(
          req,
          res
        );

      if (!academyToken) {
        return;
      }

      const materialId =
        clean(
          req.params.id
        );

      const submittedCode =
        clean(
          req.body?.code
        );

      console.log(
        "📚 Material ID:",
        materialId
      );

      console.log(
        "🔐 Code supplied:",
        submittedCode
          ? "YES"
          : "NO"
      );

      if (!materialId) {
        return res.status(400).json({
          success: false,

          accessToken: null,

          error:
            "Material ID is required.",

          message:
            "Material ID is required.",
        });
      }

      const result =
        await pool.query(
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
          [materialId]
        );

      if (!result.rows.length) {
        return res.status(404).json({
          success: false,

          accessToken: null,

          error:
            "Material not found.",

          message:
            "Material not found.",
        });
      }

      const material =
        result.rows[0];

      const isLocked =
        Boolean(
          material.is_locked
        );

      /* --------------------------------------------------------
         UNLOCKED MATERIAL
      -------------------------------------------------------- */

      if (!isLocked) {
        console.log(
          "🟢 Material is not locked."
        );

        const accessToken =
          createMaterialAccessToken(
            materialId
          );

        return res.status(200).json({
          success: true,

          unlocked: true,

          accessToken,

          materialId,

          message:
            "Material access granted.",
        });
      }

      /* --------------------------------------------------------
         LOCKED MATERIAL
      -------------------------------------------------------- */

      if (!submittedCode) {
        console.log(
          "❌ Locked material requires an access code."
        );

        return res.status(403).json({
          success: false,

          unlocked: false,

          accessToken: null,

          error:
            "Access code is required.",

          message:
            "Enter the access code provided by your Academy administrator.",
        });
      }

      let codeValid =
        false;

      /* --------------------------------------------------------
         BCRYPT HASH CHECK
      -------------------------------------------------------- */

      if (
        material.access_code_hash
      ) {
        try {
          codeValid =
            await bcrypt.compare(
              submittedCode,
              material.access_code_hash
            );
        } catch (hashError) {
          console.error(
            "Access code hash verification error:",
            hashError
          );
        }
      }

      /* --------------------------------------------------------
         PLAINTEXT FALLBACK
         
         This matches your current admin system because the
         generated code is also saved in access_code so it
         remains visible on the admin material card.
      -------------------------------------------------------- */

      if (
        !codeValid &&
        material.access_code
      ) {
        codeValid =
          submittedCode ===
          String(
            material.access_code
          ).trim();
      }

      if (!codeValid) {
        console.warn(
          "❌ Incorrect material access code:",
          materialId
        );

        return res.status(403).json({
          success: false,

          unlocked: false,

          accessToken: null,

          error:
            "Incorrect access code.",

          message:
            "The access code you entered is incorrect.",
        });
      }

      /* --------------------------------------------------------
         SUCCESS
      -------------------------------------------------------- */

      const accessToken =
        createMaterialAccessToken(
          materialId
        );

      console.log(
        "✅ MATERIAL UNLOCKED:",
        material.title
      );

      return res.status(200).json({
        success: true,

        unlocked: true,

        accessToken,

        materialId,

        message:
          "Material unlocked successfully.",
      });
    } catch (error) {
      console.error("");
      console.error(
        "=================================================="
      );
      console.error(
        "❌ MATERIAL UNLOCK ERROR"
      );
      console.error(
        "=================================================="
      );
      console.error(
        "Message:",
        error?.message
      );
      console.error(
        "Code:",
        error?.code
      );
      console.error(
        "Stack:",
        error?.stack
      );
      console.error(
        "=================================================="
      );

      return res.status(500).json({
        success: false,

        unlocked: false,

        accessToken: null,

        error:
          "Unable to unlock this material.",

        message:
          "Unable to unlock this material.",
      });
    }
  }
);

/* ============================================================
   SERVE PROTECTED MATERIAL CONTENT
   GET /api/academy/student/materials/:id/content
============================================================ */

/*
 * The frontend sends:
 *
 * Authorization: Bearer <academy token>
 *
 * X-Material-Access-Token:
 * <temporary material token>
 *
 * BOTH are required.
 */

router.get(
  "/:id/content",
  async (req, res) => {
    try {
      console.log("");
      console.log(
        "=================================================="
      );
      console.log(
        "📂 STUDENT MATERIAL CONTENT REQUEST"
      );
      console.log(
        "=================================================="
      );

      const academyToken =
        requireAcademyToken(
          req,
          res
        );

      if (!academyToken) {
        return;
      }

      const materialId =
        clean(
          req.params.id
        );

      const materialAccessToken =
        clean(
          req.headers[
            "x-material-access-token"
          ]
        );

      console.log(
        "📚 Material ID:",
        materialId
      );

      console.log(
        "🔑 Material access token:",
        materialAccessToken
          ? "YES"
          : "NO"
      );

      if (!materialId) {
        return res.status(400).json({
          success: false,

          error:
            "Material ID is required.",
        });
      }

      /* --------------------------------------------------------
         MATERIAL ACCESS TOKEN
      -------------------------------------------------------- */

      if (!materialAccessToken) {
        return res.status(401).json({
          success: false,

          error:
            "Material access token is required.",

          message:
            "Unlock this material before opening it.",
        });
      }

      const tokenResult =
        verifyMaterialAccessToken(
          materialAccessToken,
          materialId
        );

      if (!tokenResult.valid) {
        console.warn(
          "❌ Invalid material access token:",
          tokenResult.reason
        );

        return res.status(401).json({
          success: false,

          error:
            tokenResult.reason ||
            "Invalid material access token.",

          message:
            tokenResult.reason ||
            "Your material access has expired. Please unlock it again.",
        });
      }

      /* --------------------------------------------------------
         LOAD FILE
      -------------------------------------------------------- */

      const result =
        await pool.query(
          `
            SELECT
              id,
              title,
              file_url,
              file_name,
              file_mime_type,
              file_size
            FROM learning_materials
            WHERE id = $1
            LIMIT 1
          `,
          [materialId]
        );

      if (!result.rows.length) {
        return res.status(404).json({
          success: false,

          error:
            "Material not found.",
        });
      }

      const material =
        result.rows[0];

      const fileUrl =
        clean(
          material.file_url
        );

      if (!fileUrl) {
        return res.status(404).json({
          success: false,

          error:
            "This material does not have a file.",
        });
      }

      /* --------------------------------------------------------
         PROTECT AGAINST EXTERNAL URL REDIRECTS
      -------------------------------------------------------- */

      if (
        /^https?:\/\//i.test(
          fileUrl
        )
      ) {
        /*
         * If your material storage eventually moves to S3,
         * Cloudinary, Supabase Storage, etc., this section can
         * be replaced with a signed-storage URL flow.
         *
         * For the current local /uploads system, only local
         * files are served.
         */

        return res.status(400).json({
          success: false,

          error:
            "External material URLs are not supported by the protected content endpoint yet.",

          message:
            "This material must use the Academy server upload storage.",
        });
      }

      /* --------------------------------------------------------
         CONVERT DATABASE URL TO LOCAL FILE PATH
      -------------------------------------------------------- */

      let relativeFilePath =
        fileUrl;

      if (
        relativeFilePath.startsWith(
          "/"
        )
      ) {
        relativeFilePath =
          relativeFilePath.slice(
            1
          );
      }

      /*
       * Handle values such as:
       *
       * /uploads/materials/file.pdf
       *
       * uploads/materials/file.pdf
       *
       * /materials/file.pdf
       */

      const uploadsRoot =
        path.resolve(
          process.cwd(),
          "uploads"
        );

      let filePath =
        path.resolve(
          process.cwd(),
          relativeFilePath
        );

      /*
       * If the database contains a path without "uploads",
       * also allow it to resolve relative to uploads/.
       */

      if (
        !filePath.startsWith(
          uploadsRoot
        )
      ) {
        filePath =
          path.resolve(
            uploadsRoot,
            relativeFilePath
          );
      }

      /* --------------------------------------------------------
         PATH SECURITY
      -------------------------------------------------------- */

      const normalizedUploadsRoot =
        uploadsRoot.endsWith(
          path.sep
        )
          ? uploadsRoot
          : `${uploadsRoot}${path.sep}`;

      const normalizedFilePath =
        path.resolve(
          filePath
        );

      if (
        normalizedFilePath !==
          uploadsRoot &&
        !normalizedFilePath.startsWith(
          normalizedUploadsRoot
        )
      ) {
        console.warn(
          "❌ Blocked unsafe material path:",
          normalizedFilePath
        );

        return res.status(403).json({
          success: false,

          error:
            "Invalid material file path.",
        });
      }

      filePath =
        normalizedFilePath;

      console.log(
        "📄 Material file:",
        filePath
      );

      /* --------------------------------------------------------
         FILE EXISTS
      -------------------------------------------------------- */

      if (
        !fs.existsSync(
          filePath
        )
      ) {
        console.error(
          "❌ Material file does not exist:",
          filePath
        );

        return res.status(404).json({
          success: false,

          error:
            "The material file could not be found on the server.",

          message:
            "The administrator may need to upload this material again.",
        });
      }

      const stats =
        fs.statSync(
          filePath
        );

      if (
        !stats.isFile()
      ) {
        return res.status(404).json({
          success: false,

          error:
            "The material file is invalid.",
        });
      }

      /* --------------------------------------------------------
         MIME TYPE
      -------------------------------------------------------- */

      const mimeType =
        clean(
          material.file_mime_type
        ) ||
        "application/octet-stream";

      const fileName =
        clean(
          material.file_name
        ) ||
        "material";

      /* --------------------------------------------------------
         RESPONSE HEADERS
      -------------------------------------------------------- */

      res.setHeader(
        "Content-Type",
        mimeType
      );

      res.setHeader(
        "Content-Length",
        stats.size
      );

      res.setHeader(
        "Content-Disposition",
        `inline; filename="${fileName.replace(
          /["\\]/g,
          ""
        )}"`
      );

      res.setHeader(
        "Cache-Control",
        "private, no-store, max-age=0"
      );

      res.setHeader(
        "X-Content-Type-Options",
        "nosniff"
      );

      res.setHeader(
        "X-Material-Access",
        "granted"
      );

      /* --------------------------------------------------------
         SEND FILE
      -------------------------------------------------------- */

      return res.sendFile(
        filePath
      );
    } catch (error) {
      console.error("");
      console.error(
        "=================================================="
      );
      console.error(
        "❌ STUDENT MATERIAL CONTENT ERROR"
      );
      console.error(
        "=================================================="
      );
      console.error(
        "Message:",
        error?.message
      );
      console.error(
        "Code:",
        error?.code
      );
      console.error(
        "Stack:",
        error?.stack
      );
      console.error(
        "=================================================="
      );

      if (
        !res.headersSent
      ) {
        return res.status(500).json({
          success: false,

          error:
            "Unable to open this material.",

          message:
            "The material could not be opened.",
        });
      }
    }
  }
);

/* ============================================================
   EXPORT
============================================================ */

export default router;