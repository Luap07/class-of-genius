// server/routes/courseCategoryRoutes.js

import express from "express";
import pool from "../lib/db.js";

const router = express.Router();

/*
|--------------------------------------------------------------------------
| GET ALL COURSE CATEGORIES
|--------------------------------------------------------------------------
| GET /api/course-categories
|
| Optional:
| ?active=true
| ?featured=true
| ?academic_level=secondary
| ?education_stage=secondary
| ?subject_area=mathematics
| ?course_type=exam
| ?search=science
|--------------------------------------------------------------------------
*/

router.get("/", async (req, res, next) => {
  try {
    const {
      active,
      featured,
      academic_level,
      education_stage,
      subject_area,
      course_type,
      search,
    } = req.query;

    const values = [];
    const conditions = [];

    let query = `
      SELECT *
      FROM course_categories
    `;

    /*
    |--------------------------------------------------------------------------
    | ACTIVE FILTER
    |--------------------------------------------------------------------------
    */

    if (active === "true") {
      conditions.push(`active = true`);
    }

    if (active === "false") {
      conditions.push(`active = false`);
    }

    /*
    |--------------------------------------------------------------------------
    | FEATURED FILTER
    |--------------------------------------------------------------------------
    */

    if (featured === "true") {
      conditions.push(`featured = true`);
    }

    if (featured === "false") {
      conditions.push(`featured = false`);
    }

    /*
    |--------------------------------------------------------------------------
    | ACADEMIC LEVEL
    |--------------------------------------------------------------------------
    */

    if (academic_level?.trim()) {
      values.push(academic_level.trim());

      conditions.push(
        `academic_level = $${values.length}`
      );
    }

    /*
    |--------------------------------------------------------------------------
    | EDUCATION STAGE
    |--------------------------------------------------------------------------
    */

    if (education_stage?.trim()) {
      values.push(education_stage.trim());

      conditions.push(
        `education_stage = $${values.length}`
      );
    }

    /*
    |--------------------------------------------------------------------------
    | SUBJECT AREA
    |--------------------------------------------------------------------------
    */

    if (subject_area?.trim()) {
      values.push(subject_area.trim());

      conditions.push(
        `subject_area = $${values.length}`
      );
    }

    /*
    |--------------------------------------------------------------------------
    | COURSE TYPE
    |--------------------------------------------------------------------------
    */

    if (course_type?.trim()) {
      values.push(course_type.trim());

      conditions.push(
        `course_type = $${values.length}`
      );
    }

    /*
    |--------------------------------------------------------------------------
    | SEARCH
    |--------------------------------------------------------------------------
    */

    if (search?.trim()) {
      values.push(
        `%${search.trim()}%`
      );

      const searchParam =
        `$${values.length}`;

      conditions.push(`
        (
          name ILIKE ${searchParam}
          OR description ILIKE ${searchParam}
          OR slug ILIKE ${searchParam}
          OR subject_area ILIKE ${searchParam}
          OR academic_level ILIKE ${searchParam}
          OR education_stage ILIKE ${searchParam}
        )
      `);
    }

    /*
    |--------------------------------------------------------------------------
    | WHERE
    |--------------------------------------------------------------------------
    */

    if (conditions.length > 0) {
      query += `
        WHERE ${conditions.join(
          " AND "
        )}
      `;
    }

    /*
    |--------------------------------------------------------------------------
    | ORDER
    |--------------------------------------------------------------------------
    |
    | display_order is preferred when available.
    | NULL values are pushed to the end.
    |
    */

    query += `
      ORDER BY
        display_order ASC NULLS LAST,
        sort_order ASC NULLS LAST,
        name ASC
    `;

    const result =
      await pool.query(
        query,
        values
      );

    res.json({
      success: true,
      categories: result.rows,
      count: result.rows.length,
    });
  } catch (error) {
    console.error(
      "GET COURSE CATEGORIES ERROR:",
      error
    );

    next(error);
  }
});

/*
|--------------------------------------------------------------------------
| GET FEATURED CATEGORIES
|--------------------------------------------------------------------------
| GET /api/course-categories/featured
|--------------------------------------------------------------------------
*/

router.get(
  "/featured",
  async (req, res, next) => {
    try {
      const result =
        await pool.query(`
          SELECT *
          FROM course_categories
          WHERE featured = true
          ORDER BY
            display_order ASC NULLS LAST,
            sort_order ASC NULLS LAST,
            name ASC
        `);

      res.json({
        success: true,
        categories: result.rows,
        count: result.rows.length,
      });
    } catch (error) {
      console.error(
        "FEATURED CATEGORIES ERROR:",
        error
      );

      next(error);
    }
  }
);

/*
|--------------------------------------------------------------------------
| GET ACTIVE CATEGORIES
|--------------------------------------------------------------------------
| GET /api/course-categories/active
|--------------------------------------------------------------------------
*/

router.get(
  "/active",
  async (req, res, next) => {
    try {
      const result =
        await pool.query(`
          SELECT *
          FROM course_categories
          WHERE active = true
          ORDER BY
            display_order ASC NULLS LAST,
            sort_order ASC NULLS LAST,
            name ASC
        `);

      res.json({
        success: true,
        categories: result.rows,
        count: result.rows.length,
      });
    } catch (error) {
      console.error(
        "ACTIVE CATEGORIES ERROR:",
        error
      );

      next(error);
    }
  }
);

/*
|--------------------------------------------------------------------------
| GET CATEGORY BY ID
|--------------------------------------------------------------------------
| GET /api/course-categories/:id
|--------------------------------------------------------------------------
*/

router.get(
  "/:id",
  async (req, res, next) => {
    try {
      const { id } = req.params;

      const result =
        await pool.query(
          `
            SELECT *
            FROM course_categories
            WHERE id = $1
            LIMIT 1
          `,
          [id]
        );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: "Course category not found.",
        });
      }

      res.json({
        success: true,
        category: result.rows[0],
      });
    } catch (error) {
      console.error(
        "GET COURSE CATEGORY ERROR:",
        error
      );

      next(error);
    }
  }
);

/*
|--------------------------------------------------------------------------
| GET COURSES IN CATEGORY
|--------------------------------------------------------------------------
| GET /api/course-categories/:id/courses
|--------------------------------------------------------------------------
*/

router.get(
  "/:id/courses",
  async (req, res, next) => {
    try {
      const { id } = req.params;

      const categoryResult =
        await pool.query(
          `
            SELECT *
            FROM course_categories
            WHERE id = $1
            LIMIT 1
          `,
          [id]
        );

      if (
        categoryResult.rows.length === 0
      ) {
        return res.status(404).json({
          success: false,
          error: "Course category not found.",
        });
      }

      const coursesResult =
        await pool.query(
          `
            SELECT *
            FROM courses
            WHERE category_id = $1
            ORDER BY
              created_at DESC NULLS LAST
          `,
          [id]
        );

      const courses =
        coursesResult.rows.map(
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
          })
        );

      res.json({
        success: true,

        category:
          categoryResult.rows[0],

        courses,

        count:
          courses.length,
      });
    } catch (error) {
      console.error(
        "GET CATEGORY COURSES ERROR:",
        error
      );

      next(error);
    }
  }
);

/*
|--------------------------------------------------------------------------
| GET CATEGORY COURSE COUNT
|--------------------------------------------------------------------------
| GET /api/course-categories/:id/count
|--------------------------------------------------------------------------
*/

router.get(
  "/:id/count",
  async (req, res, next) => {
    try {
      const { id } = req.params;

      const result =
        await pool.query(
          `
            SELECT COUNT(*)::int AS count
            FROM courses
            WHERE category_id = $1
          `,
          [id]
        );

      res.json({
        success: true,

        category_id: id,

        count:
          Number(
            result.rows[0]?.count
          ) || 0,
      });
    } catch (error) {
      console.error(
        "CATEGORY COURSE COUNT ERROR:",
        error
      );

      next(error);
    }
  }
);

/*
|--------------------------------------------------------------------------
| CATEGORY STATISTICS
|--------------------------------------------------------------------------
| GET /api/course-categories/stats
|--------------------------------------------------------------------------
*/

router.get(
  "/stats",
  async (req, res, next) => {
    try {
      const result =
        await pool.query(`
          SELECT
            COUNT(*)::int AS total,

            COUNT(*) FILTER (
              WHERE active = true
            )::int AS active,

            COUNT(*) FILTER (
              WHERE featured = true
            )::int AS featured
          
          FROM course_categories
        `);

      const stats =
        result.rows[0] || {};

      res.json({
        success: true,

        stats: {
          total:
            Number(stats.total) || 0,

          active:
            Number(stats.active) || 0,

          featured:
            Number(stats.featured) || 0,
        },
      });
    } catch (error) {
      console.error(
        "CATEGORY STATS ERROR:",
        error
      );

      next(error);
    }
  }
);

/*
|--------------------------------------------------------------------------
| EXPORT
|--------------------------------------------------------------------------
*/

export default router;
