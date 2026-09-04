// server/routes/courseRoutes.js

import express from "express";
import pool from "../lib/db.js";

const router = express.Router();

/*
|--------------------------------------------------------------------------
| GET ALL COURSES
|--------------------------------------------------------------------------
| GET /api/courses
|
| Optional:
| ?status=Published
| ?featured=true
| ?category_id=UUID
| ?search=mathematics
|--------------------------------------------------------------------------
*/

router.get("/", async (req, res, next) => {
  try {
    const {
      status,
      featured,
      category_id,
      search,
    } = req.query;

    const values = [];
    const conditions = [];

    let query = `
      SELECT
        c.*
      FROM courses c
    `;

    if (status) {
      values.push(status);

      conditions.push(
        `c.status = $${values.length}`
      );
    }

    if (featured === "true") {
      conditions.push(
        `c.featured = true`
      );
    }

    if (category_id) {
      values.push(category_id);

      conditions.push(
        `c.category_id = $${values.length}`
      );
    }

    if (search?.trim()) {
      values.push(
        `%${search.trim()}%`
      );

      const searchParam =
        `$${values.length}`;

      conditions.push(`
        (
          c.title ILIKE ${searchParam}
          OR c.description ILIKE ${searchParam}
          OR c.instructor ILIKE ${searchParam}
          OR c.slug ILIKE ${searchParam}
        )
      `);
    }

    if (conditions.length > 0) {
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

    res.json({
      success: true,
      courses,
      count: courses.length,
    });
  } catch (error) {
    console.error(
      "GET COURSES ERROR:",
      error
    );

    next(error);
  }
});

/*
|--------------------------------------------------------------------------
| GET FEATURED COURSES
|--------------------------------------------------------------------------
| GET /api/courses/featured
|--------------------------------------------------------------------------
*/

router.get(
  "/featured",
  async (req, res, next) => {
    try {
      const result =
        await pool.query(`
          SELECT *
          FROM courses
          WHERE
            featured = true
            AND status = 'Published'
          ORDER BY
            created_at DESC NULLS LAST
        `);

      const courses =
        result.rows.map((course) => ({
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
        }));

      res.json({
        success: true,
        courses,
        count: courses.length,
      });
    } catch (error) {
      console.error(
        "FEATURED COURSES ERROR:",
        error
      );

      next(error);
    }
  }
);

/*
|--------------------------------------------------------------------------
| GET RECENT COURSES
|--------------------------------------------------------------------------
| GET /api/courses/recent
|--------------------------------------------------------------------------
*/

router.get(
  "/recent",
  async (req, res, next) => {
    try {
      let limit =
        Number(req.query.limit) || 12;

      limit = Math.min(
        Math.max(limit, 1),
        100
      );

      const result =
        await pool.query(
          `
            SELECT *
            FROM courses
            ORDER BY
              created_at DESC NULLS LAST
            LIMIT $1
          `,
          [limit]
        );

      const courses =
        result.rows.map((course) => ({
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
        }));

      res.json({
        success: true,
        courses,
        count: courses.length,
      });
    } catch (error) {
      console.error(
        "RECENT COURSES ERROR:",
        error
      );

      next(error);
    }
  }
);

/*
|--------------------------------------------------------------------------
| GET COURSE STATISTICS
|--------------------------------------------------------------------------
| GET /api/courses/stats
|--------------------------------------------------------------------------
*/

router.get(
  "/stats",
  async (req, res, next) => {
    try {
      const coursesResult =
        await pool.query(`
          SELECT COUNT(*)::int AS count
          FROM courses
          WHERE status = 'Published'
        `);

      const categoriesResult =
        await pool.query(`
          SELECT COUNT(*)::int AS count
          FROM course_categories
        `);

      const studentsResult =
        await pool.query(`
          SELECT COUNT(*)::int AS count
          FROM profiles
          WHERE LOWER(COALESCE(role, '')) = 'student'
        `);

      let certificatesCount = 0;

      try {
        const certificatesResult =
          await pool.query(`
            SELECT COUNT(*)::int AS count
            FROM certificates
          `);

        certificatesCount =
          Number(
            certificatesResult.rows[0]?.count
          ) || 0;
      } catch (certificateError) {
        console.warn(
          "CERTIFICATES TABLE ERROR:",
          certificateError.message
        );

        certificatesCount = 0;
      }

      const stats = {
        courses:
          Number(
            coursesResult.rows[0]?.count
          ) || 0,

        categories:
          Number(
            categoriesResult.rows[0]?.count
          ) || 0,

        students:
          Number(
            studentsResult.rows[0]?.count
          ) || 0,

        certificates:
          certificatesCount,
      };

      res.json({
        success: true,
        stats,
      });
    } catch (error) {
      console.error(
        "COURSE STATS ERROR:",
        error
      );

      next(error);
    }
  }
);

/*
|--------------------------------------------------------------------------
| GET TOPICS FOR A COURSE
|--------------------------------------------------------------------------
| GET /api/courses/:courseId/topics
|--------------------------------------------------------------------------
*/

router.get(
  "/:courseId/topics",
  async (req, res, next) => {
    try {
      const { courseId } = req.params;

      if (!courseId) {
        return res.status(400).json({
          success: false,
          message: "Course ID is required.",
        });
      }

      const result =
        await pool.query(
          `
            SELECT
              id,
              title,
              course_id,
              position
            FROM course_topics
            WHERE course_id = $1
            ORDER BY
              position ASC NULLS LAST,
              title ASC
          `,
          [courseId]
        );

      res.json({
        success: true,
        topics: result.rows || [],
        count: result.rows.length,
      });
    } catch (error) {
      console.error(
        "GET COURSE TOPICS ERROR:",
        error
      );

      next(error);
    }
  }
);

/*
|--------------------------------------------------------------------------
| GET SINGLE COURSE
|--------------------------------------------------------------------------
| GET /api/courses/:id
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
            FROM courses
            WHERE id = $1
            LIMIT 1
          `,
          [id]
        );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: "Course not found.",
        });
      }

      const course =
        result.rows[0];

      res.json({
        success: true,

        course: {
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
        },
      });
    } catch (error) {
      console.error(
        "GET COURSE ERROR:",
        error
      );

      next(error);
    }
  }
);

export default router;