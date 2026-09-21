import express from "express";
import pool from "../lib/db.js";

const router = express.Router();

// ============================================================
// HELPERS
// ============================================================

const clean = (value) => {
  if (value === undefined || value === null) {
    return "";
  }
  return String(value).trim();
};

const getBearerToken = (req) => {
  const authorization = req.headers.authorization || "";

  if (!authorization || !authorization.toLowerCase().startsWith("bearer ")) {
    return "";
  }

  return authorization.slice(7).trim();
};

const firstValue = (...values) => {
  for (const value of values) {
    if (value !== undefined && value !== null && String(value).trim() !== "") {
      return value;
    }
  }
  return "";
};

// ============================================================
// NORMALIZE MATERIAL
// ============================================================

const normalizeMaterial = (material) => {
  if (!material) {
    return null;
  }

  const materialType = clean(
    firstValue(material.material_type, material.type, material.file_mime_type)
  );

  const fileUrl = clean(
    firstValue(material.file_url, material.fileUrl, material.url)
  );

  const fileName = clean(
    firstValue(material.file_name, material.fileName, material.title)
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
    firstValue(material.subject, material.subject_name, material.subjectName)
  );

  return {
    ...material,
    id: material.id,
    title: clean(material.title),
    description: clean(material.description),
    subject,
    level,
    class_name: level,
    className: level,
    grade: level,
    material_type: materialType,
    type: materialType,
    file_name: fileName,
    fileName,
    file_size: material.file_size ?? null,
    file_mime_type: clean(material.file_mime_type),
    file_url: fileUrl,
    fileUrl,
    url: fileUrl,
    cover_page_url: clean(material.cover_page_url),
    back_page_url: clean(material.back_page_url),
    created_at: material.created_at,
  };
};

// ============================================================
// SELECT
// ============================================================

const MATERIAL_SELECT = `  SELECT
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
  FROM learning_materials`;

// ============================================================
// GET STUDENT MATERIALS
// GET /api/academy/student/materials
// ============================================================

router.get("/", async (req, res) => {
  try {
    console.log("");
    console.log("==================================================");
    console.log("📚 STUDENT MATERIALS REQUEST");
    console.log("==================================================");

    const token = getBearerToken(req);

    const studentId = clean(
      firstValue(req.query.studentId, req.query.student_id, req.query.id)
    );

    const email = clean(
      firstValue(req.query.email, req.query.studentEmail, req.query.student_email)
    );

    console.log("🔐 Token received:", token ? "YES ✅" : "NO ❌");
    console.log("👨‍🎓 Student ID:", studentId || "NOT PROVIDED");
    console.log("📧 Email:", email || "NOT PROVIDED");

    // --------------------------------------------------------
    // TOKEN CHECK
    // --------------------------------------------------------

    if (!token) {
      return res.status(401).json({
        success: false,
        materials: [],
        data: [],
        results: [],
        count: 0,
        total: 0,
        error: "Authentication token is required.",
      });
    }

    // --------------------------------------------------------
    // LOAD MATERIALS
    // --------------------------------------------------------

    const result = await pool.query(`
      ${MATERIAL_SELECT}
      ORDER BY created_at DESC
    `);

    const materials = (result.rows || [])
      .map(normalizeMaterial)
      .filter(Boolean);

    console.log(`📦 Materials found: ${materials.length}`);

    return res.status(200).json({
      success: true,
      materials,
      data: materials,
      results: materials,
      count: materials.length,
      total: materials.length,
    });
  } catch (error) {
    console.error("");
    console.error("==================================================");
    console.error("❌ STUDENT MATERIALS API ERROR");
    console.error("==================================================");
    console.error("Message:", error?.message);
    console.error("Code:", error?.code);
    console.error("Detail:", error?.detail);
    console.error("Hint:", error?.hint);
    console.error("Position:", error?.position);
    console.error("Stack:", error?.stack);
    console.error("==================================================");

    return res.status(500).json({
      success: false,
      materials: [],
      data: [],
      results: [],
      count: 0,
      total: 0,
      error: "Unable to load student materials.",
      details:
        process.env.NODE_ENV === "development" ? error?.message : undefined,
    });
  }
});

// ============================================================
// TEST ENDPOINT
// IMPORTANT:
// Keep this BEFORE /:id
// ============================================================

router.get("/test", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        COUNT(*)::integer AS count
      FROM learning_materials
    `);

    const count = Number(result.rows[0]?.count || 0);

    return res.status(200).json({
      success: true,
      message: "Student materials endpoint is working.",
      table: "learning_materials",
      count,
    });
  } catch (error) {
    console.error("Student materials test error:", error);

    return res.status(500).json({
      success: false,
      error: error?.message || "Unable to check materials.",
    });
  }
});

// ============================================================
// GET ONE STUDENT MATERIAL
// GET /api/academy/student/materials/:id
// ============================================================

router.get("/:id", async (req, res) => {
  try {
    console.log("");
    console.log("==================================================");
    console.log("📖 STUDENT SINGLE MATERIAL REQUEST");
    console.log("==================================================");

    const token = getBearerToken(req);
    const materialId = clean(req.params.id);

    console.log("🔐 Token received:", token ? "YES ✅" : "NO ❌");
    console.log("📚 Material ID:", materialId || "NOT PROVIDED");

    // --------------------------------------------------------
    // TOKEN CHECK
    // --------------------------------------------------------

    if (!token) {
      return res.status(401).json({
        success: false,
        material: null,
        error: "Authentication token is required.",
      });
    }

    // --------------------------------------------------------
    // ID CHECK
    // --------------------------------------------------------

    if (!materialId) {
      return res.status(400).json({
        success: false,
        material: null,
        error: "Material ID is required.",
      });
    }

    // --------------------------------------------------------
    // DATABASE
    // --------------------------------------------------------

    const result = await pool.query(
      `
        ${MATERIAL_SELECT}
        WHERE id = $1
        LIMIT 1
      `,
      [materialId]
    );

    if (!result.rows.length) {
      console.warn("⚠️ Material not found:", materialId);

      return res.status(404).json({
        success: false,
        material: null,
        data: null,
        error: "Material not found.",
      });
    }

    const material = normalizeMaterial(result.rows[0]);

    console.log("✅ Material found:", material?.title);
    console.log("📄 File:", material?.file_url || "NO FILE");

    return res.status(200).json({
      success: true,
      material,
      data: material,
    });
  } catch (error) {
    console.error("");
    console.error("==================================================");
    console.error("❌ SINGLE STUDENT MATERIAL ERROR");
    console.error("==================================================");
    console.error("Message:", error?.message);
    console.error("Code:", error?.code);
    console.error("Detail:", error?.detail);
    console.error("Stack:", error?.stack);
    console.error("==================================================");

    return res.status(500).json({
      success: false,
      material: null,
      data: null,
      error: "Unable to load this material.",
      details:
        process.env.NODE_ENV === "development" ? error?.message : undefined,
    });
  }
});

export default router;