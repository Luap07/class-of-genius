import express from "express";
import pool from "../lib/db.js";

const router = express.Router();

/* ============================================================
HELPERS
============================================================ */

const clean = (value) => {
if (
value === undefined ||
value === null
) {
return "";
}

return String(value).trim();
};

const getBearerToken = (req) => {
const header =
req.headers.authorization || "";

if (
!header ||
!header.toLowerCase().startsWith(
"bearer "
)
) {
return "";
}

return header
.slice(7)
.trim();
};

/* ============================================================
GET STUDENT MATERIALS
GET /api/academy/student/materials
============================================================ */

router.get("/", async (req, res) => {
try {
const token =
getBearerToken(req);

if (!token) {
  return res.status(401).json({
    success: false,
    message:
      "Academy authentication token is required.",
  });
}

const result =
  await pool.query(`
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

const materials =
  result.rows || [];

return res.json({
  success: true,
  materials,
  data: materials,
  results: materials,
  count: materials.length,
});
} catch (error) {
console.error(
"GET /api/academy/student/materials error:",
error
);

return res.status(500).json({
  success: false,
  message:
    "Unable to load Academy learning materials.",
  error:
    process.env.NODE_ENV ===
    "development"
      ? error.message
      : undefined,
});

}
});

export default router;
