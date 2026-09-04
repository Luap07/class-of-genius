import express from "express";
import pool from "../lib/db.js";

const router = express.Router();

/* =========================================================
   GET ALL COURSES
========================================================= */

router.get("/", async (req, res) => {
  try {
    const {
      status,
      featured,
      category_id,
      search,
    } = req.query;

    let query = `
      SELECT
        c.*,
        cc.name AS category_name
      FROM courses c
      LEFT JOIN course_categories cc
        ON cc.id = c.category_id
    `;

    const conditions = [];
    const values = [];

    if (status) {
      values.push(status);
      conditions.push(
        `c.status = $${values.length}`
      );
    }

    if (featured === "true") {
      conditions.push(`c.featured = true`);
    }

    if (category_id) {
      values.push(category_id);
      conditions.push(
        `c.category_id = $${values.length}`
      );
    }

    if (search) {
      values.push(`%${search}%`);

      conditions.push(`
        (
          c.title ILIKE $${values.length}
          OR c.description ILIKE $${values.length}
          OR c.instructor ILIKE $${values.length}
          OR c.slug ILIKE $${values.length}
        )
      `);
    }

    if (conditions.length) {
      query += `
        WHERE ${conditions.join(" AND ")}
      `;
    }

    query += `
      ORDER BY c.created_at DESC NULLS LAST
    `;

    const result = await pool.query(
      query,
      values
    );

    const courses = result.rows.map(
      (course) => ({
        ...course,
        thumbnail:
          course.thumbnail_url ||
          course.thumbnail ||
          "",
        rating:
          Number(course.rating) || 0,
        students:
          Number(course.students) || 0,
        price:
          Number(course.price) || 0,
        featured:
          course.featured === true,
      })
    );

    return res.json({
      success: true,
      courses,
      count: courses.length,
    });
  } catch (error) {
    console.error(
      "Get courses error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch courses.",
    });
  }
});

/* =========================================================
   GET FEATURED COURSES
========================================================= */

router.get(
  "/featured",
  async (req, res) => {
    try {
      const result = await pool.query(`
        SELECT
          c.*,
          cc.name AS category_name
        FROM courses c
        LEFT JOIN course_categories cc
          ON cc.id = c.category_id
        WHERE c.featured = true
          AND c.status = 'Published'
        ORDER BY c.created_at DESC NULLS LAST
      `);

      return res.json({
        success: true,
        courses: result.rows,
        count: result.rows.length,
      });
    } catch (error) {
      console.error(
        "Featured courses error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to fetch featured courses.",
      });
    }
  }
);

/* =========================================================
   GET RECENT COURSES
========================================================= */

router.get(
  "/recent",
  async (req, res) => {
    try {
      let limit =
        Number(req.query.limit) || 12;

      limit = Math.max(
        1,
        Math.min(limit, 100)
      );

      const result = await pool.query(
        `
        SELECT
          c.*,
          cc.name AS category_name
        FROM courses c
        LEFT JOIN course_categories cc
          ON cc.id = c.category_id
        ORDER BY c.created_at DESC NULLS LAST
        LIMIT $1
        `,
        [limit]
      );

      return res.json({
        success: true,
        courses: result.rows,
        count: result.rows.length,
      });
    } catch (error) {
      console.error(
        "Recent courses error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to fetch recent courses.",
      });
    }
  }
);

/* =========================================================
   COURSE PAGE STATS
=========================================================

   IMPORTANT:

   Published Courses
   -----------------
   This now counts ALL uploaded documents.

   Course Categories
   -----------------
   This counts ALL subject categories.

   Learning Materials
   ------------------
   This counts ALL uploaded documents.

========================================================= */

router.get(
  "/stats",
  async (req, res) => {
    try {
      const [
        documentsResult,
        categoriesResult,
      ] = await Promise.all([
        pool.query(`
          SELECT COUNT(*)::int AS count
          FROM documents
          WHERE file_url IS NOT NULL
            AND TRIM(file_url) <> ''
        `),

        pool.query(`
          SELECT COUNT(*)::int AS count
          FROM course_categories
        `),
      ]);

      const documentCount =
        Number(
          documentsResult.rows[0]?.count
        ) || 0;

      const categoryCount =
        Number(
          categoriesResult.rows[0]?.count
        ) || 0;

      return res.json({
        success: true,

        stats: {
          courses: documentCount,
          categories: categoryCount,
          materials: documentCount,
        },
      });
    } catch (error) {
      console.error(
        "Course stats error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to fetch course statistics.",
      });
    }
  }
);

/* =========================================================
   SUBJECT CATEGORIES
=========================================================

   Every category comes from course_categories.

   document_count tells the frontend how many
   uploaded documents belong to that subject.

========================================================= */

router.get(
  "/categories",
  async (req, res) => {
    try {
      const result = await pool.query(`
        SELECT
          cc.id,
          cc.name,
          cc.slug,
          COUNT(d.id)::int AS document_count
        FROM course_categories cc

        LEFT JOIN documents d
          ON d.category_id = cc.id
          AND d.file_url IS NOT NULL
          AND TRIM(d.file_url) <> ''

        GROUP BY
          cc.id,
          cc.name,
          cc.slug

        ORDER BY
          cc.name ASC
      `);

      return res.json({
        success: true,
        categories: result.rows,
        count: result.rows.length,
      });
    } catch (error) {
      console.error(
        "Course categories error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to fetch subject categories.",
      });
    }
  }
);

/* =========================================================
   GET DOCUMENTS FOR A SUBJECT CATEGORY
========================================================= */

router.get(
  "/categories/:categoryId/documents",
  async (req, res) => {
    try {
      const {
        categoryId,
      } = req.params;

      const result = await pool.query(
        `
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
          d.created_at,
          cc.name AS category_name
        FROM documents d

        LEFT JOIN course_categories cc
          ON cc.id = d.category_id

        WHERE d.category_id = $1
          AND d.file_url IS NOT NULL
          AND TRIM(d.file_url) <> ''

        ORDER BY
          d.created_at DESC NULLS LAST
        `,
        [categoryId]
      );

      return res.json({
        success: true,
        documents: result.rows,
        count: result.rows.length,
      });
    } catch (error) {
      console.error(
        "Category documents error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to fetch category documents.",
      });
    }
  }
);

export default router;
