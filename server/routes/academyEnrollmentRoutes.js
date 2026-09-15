import express from "express";
import pool from "../lib/db.js";

const router = express.Router();

/* =========================================================
   HELPERS
========================================================= */

const clean = (value) => {
  if (value === undefined || value === null) {
    return "";
  }

  return String(value).trim();
};

const firstValue = (row, keys, fallback = "") => {
  for (const key of keys) {
    if (
      row[key] !== undefined &&
      row[key] !== null &&
      row[key] !== ""
    ) {
      return row[key];
    }
  }

  return fallback;
};

const parseJsonValue = (value, fallback = []) => {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return fallback;
  }

  if (Array.isArray(value)) {
    return value;
  }

  if (typeof value === "object") {
    return value;
  }

  if (typeof value === "string") {
    try {
      return JSON.parse(value);
    } catch {
      return value
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
    }
  }

  return fallback;
};

/* =========================================================
   FIND STUDENT ENROLLMENT TABLE
========================================================= */

const findEnrollmentTable = async () => {
  /*
    First try the expected table name.
  */

  const exact = await pool.query(`
    SELECT
      table_schema,
      table_name
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name = 'academy_student_enrollments'
    LIMIT 1
  `);

  if (exact.rows.length > 0) {
    return exact.rows[0];
  }

  /*
    If the expected table does not exist, look for tables
    containing "enroll".
  */

  const candidates = await pool.query(`
    SELECT
      table_schema,
      table_name
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND (
        LOWER(table_name) LIKE '%enroll%'
        OR LOWER(table_name) LIKE '%student%'
      )
    ORDER BY
      CASE
        WHEN LOWER(table_name) LIKE '%enroll%' THEN 0
        ELSE 1
      END,
      table_name
  `);

  /*
    Only accept candidate tables that actually contain
    enrollment-related columns.
  */

  for (const candidate of candidates.rows) {
    const columns = await pool.query(
      `
        SELECT column_name
        FROM information_schema.columns
        WHERE table_schema = $1
          AND table_name = $2
      `,
      [
        candidate.table_schema,
        candidate.table_name,
      ]
    );

    const columnNames =
      columns.rows.map(
        (item) =>
          item.column_name.toLowerCase()
      );

    const hasEnrollmentColumn =
      columnNames.some((column) =>
        [
          "enrollment_status",
          "enrollment_id",
          "enrollment_reference",
          "student_name",
          "student_id",
          "account_status",
        ].includes(column)
      );

    if (hasEnrollmentColumn) {
      return candidate;
    }
  }

  return null;
};

/* =========================================================
   GET TABLE COLUMNS
========================================================= */

const getTableColumns = async (
  schema,
  table
) => {
  const result = await pool.query(
    `
      SELECT column_name
      FROM information_schema.columns
      WHERE table_schema = $1
        AND table_name = $2
      ORDER BY ordinal_position
    `,
    [schema, table]
  );

  return result.rows.map(
    (row) => row.column_name
  );
};

/* =========================================================
   SERIALIZE ENROLLMENT
========================================================= */

const serializeEnrollment = (
  row
) => {
  const firstName = clean(
    firstValue(row, [
      "first_name",
      "firstName",
      "firstname",
    ])
  );

  const middleName = clean(
    firstValue(row, [
      "middle_name",
      "middleName",
      "middlename",
    ])
  );

  const lastName = clean(
    firstValue(row, [
      "last_name",
      "lastName",
      "lastname",
    ])
  );

  const fallbackName = clean(
    firstValue(row, [
      "name",
      "full_name",
      "fullName",
      "student_name",
      "studentName",
    ])
  );

  const name =
    fallbackName ||
    [firstName, middleName, lastName]
      .filter(Boolean)
      .join(" ");

  const enrollmentId = firstValue(
    row,
    [
      "enrollment_id",
      "enrollmentId",
      "enrollment_reference",
      "enrollmentReference",
      "reference",
      "id",
    ]
  );

  const className = firstValue(
    row,
    [
      "class",
      "class_name",
      "className",
      "grade",
      "student_class",
      "studentClass",
      "school_class",
    ]
  );

  const subjects = parseJsonValue(
    firstValue(row, [
      "subjects",
      "subject",
      "selected_subjects",
      "selectedSubjects",
    ]),
    []
  );

  return {
    ...row,

    id: row.id ?? enrollmentId,

    enrollmentId,

    enrollment_id: enrollmentId,

    reference:
      firstValue(row, [
        "reference",
        "enrollment_reference",
        "enrollmentReference",
      ]) || enrollmentId,

    firstName,

    middleName,

    lastName,

    name,

    fullName: name,

    email: firstValue(row, [
      "email",
      "student_email",
    ]),

    phone: firstValue(row, [
      "phone",
      "phone_number",
      "phoneNumber",
      "student_phone",
    ]),

    class: className,

    className,

    grade: className,

    subjects,

    enrollmentStatus:
      firstValue(row, [
        "enrollment_status",
        "enrollmentStatus",
        "status",
      ]),

    enrollment_status:
      firstValue(row, [
        "enrollment_status",
        "enrollmentStatus",
        "status",
      ]),

    paymentStatus:
      firstValue(row, [
        "payment_status",
        "paymentStatus",
      ]),

    payment_status:
      firstValue(row, [
        "payment_status",
        "paymentStatus",
      ]),

    accountStatus:
      firstValue(row, [
        "account_status",
        "accountStatus",
      ]),

    account_status:
      firstValue(row, [
        "account_status",
        "accountStatus",
      ]),

    emailVerified:
      row.email_verified ??
      row.emailVerified ??
      false,

    email_verified:
      row.email_verified ??
      row.emailVerified ??
      false,

    createdAt:
      row.created_at ??
      row.createdAt ??
      null,

    created_at:
      row.created_at ??
      row.createdAt ??
      null,

    updatedAt:
      row.updated_at ??
      row.updatedAt ??
      null,

    updated_at:
      row.updated_at ??
      row.updatedAt ??
      null,
  };
};

/* =========================================================
   HEALTH
   GET /api/academy/admin/enrollments/health
========================================================= */

router.get(
  "/admin/enrollments/health",
  async (req, res) => {
    try {
      const table =
        await findEnrollmentTable();

      return res.json({
        success: true,
        enrollmentTable: table
          ? `${table.table_schema}.${table.table_name}`
          : null,
        message: table
          ? "Student enrollment table found."
          : "No student enrollment table was found.",
      });
    } catch (error) {
      console.error(
        "ENROLLMENT HEALTH ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to inspect student enrollment database.",
        error: error.message,
      });
    }
  }
);

/* =========================================================
   ADMIN - GET ALL STUDENT ENROLLMENTS

   GET /api/academy/admin/enrollments
========================================================= */

router.get(
  "/admin/enrollments",
  async (req, res) => {
    try {
      const table =
        await findEnrollmentTable();

      if (!table) {
        return res.status(404).json({
          success: false,

          message:
            "No student enrollment table was found in the database.",

          enrollments: [],
          students: [],
          data: [],
          results: [],
          count: 0,

          error:
            "Create the student enrollment table or add the student enrollment POST route first.",
        });
      }

      const columns =
        await getTableColumns(
          table.table_schema,
          table.table_name
        );

      if (!columns.length) {
        return res.status(500).json({
          success: false,
          message:
            "The student enrollment table has no readable columns.",
          enrollments: [],
          students: [],
          data: [],
          results: [],
          count: 0,
        });
      }

      /*
        table and column names come directly from
        information_schema, so they are trusted identifiers.
      */

      const qualifiedTable = `"${table.table_schema}"."${table.table_name}"`;

      const result = await pool.query(
        `
          SELECT *
          FROM ${qualifiedTable}
          ORDER BY
            CASE
              WHEN created_at IS NOT NULL
              THEN created_at
              ELSE NULL
            END DESC NULLS LAST
        `
      );

      const enrollments =
        result.rows.map(
          serializeEnrollment
        );

      return res.status(200).json({
        success: true,

        enrollments,

        students: enrollments,

        data: enrollments,

        results: enrollments,

        count: enrollments.length,

        total: enrollments.length,
      });
    } catch (error) {
      console.error(
        "GET ADMIN ENROLLMENTS ERROR:",
        error
      );

      return res.status(500).json({
        success: false,

        message:
          "Unable to load student enrollments.",

        enrollments: [],

        students: [],

        data: [],

        results: [],

        count: 0,

        error:
          error.message,
      });
    }
  }
);

/* =========================================================
   ADMIN - GET SINGLE ENROLLMENT
   GET /api/academy/admin/enrollments/:id
========================================================= */

router.get(
  "/admin/enrollments/:id",
  async (req, res) => {
    try {
      const id = clean(
        req.params.id
      );

      if (!id) {
        return res.status(400).json({
          success: false,
          message:
            "Enrollment ID is required.",
        });
      }

      const table =
        await findEnrollmentTable();

      if (!table) {
        return res.status(404).json({
          success: false,
          message:
            "No student enrollment table was found.",
        });
      }

      const columns =
        await getTableColumns(
          table.table_schema,
          table.table_name
        );

      const idColumn =
        [
          "enrollment_id",
          "reference",
          "enrollment_reference",
          "id",
        ].find((column) =>
          columns.includes(column)
        );

      if (!idColumn) {
        return res.status(500).json({
          success: false,
          message:
            "No enrollment identifier column exists in the student enrollment table.",
        });
      }

      const qualifiedTable =
        `"${table.table_schema}"."${table.table_name}"`;

      const qualifiedColumn =
        `"${idColumn}"`;

      const result = await pool.query(
        `
          SELECT *
          FROM ${qualifiedTable}
          WHERE ${qualifiedColumn}::text = $1
          LIMIT 1
        `,
        [id]
      );

      if (!result.rows.length) {
        return res.status(404).json({
          success: false,
          message:
            "Student enrollment not found.",
        });
      }

      const enrollment =
        serializeEnrollment(
          result.rows[0]
        );

      return res.json({
        success: true,

        enrollment,

        student: enrollment,

        data: enrollment,
      });
    } catch (error) {
      console.error(
        "GET SINGLE ENROLLMENT ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to load student enrollment.",
        error:
          error.message,
      });
    }
  }
);

/* =========================================================
   ADMIN - UPDATE ENROLLMENT STATUS

   PATCH
   /api/academy/admin/enrollments/:id/status

   Body:
   {
     "enrollmentStatus": "verified",
     "accountStatus": "active"
   }
========================================================= */

router.patch(
  "/admin/enrollments/:id/status",
  async (req, res) => {
    try {
      const id = clean(
        req.params.id
      );

      if (!id) {
        return res.status(400).json({
          success: false,
          message:
            "Enrollment ID is required.",
        });
      }

      const table =
        await findEnrollmentTable();

      if (!table) {
        return res.status(404).json({
          success: false,
          message:
            "No student enrollment table was found.",
        });
      }

      const columns =
        await getTableColumns(
          table.table_schema,
          table.table_name
        );

      const idColumn =
        [
          "enrollment_id",
          "reference",
          "enrollment_reference",
          "id",
        ].find((column) =>
          columns.includes(column)
        );

      if (!idColumn) {
        return res.status(500).json({
          success: false,
          message:
            "No enrollment identifier column exists.",
        });
      }

      const enrollmentStatus =
        req.body?.enrollmentStatus ??
        req.body?.enrollment_status;

      const accountStatus =
        req.body?.accountStatus ??
        req.body?.account_status;

      const paymentStatus =
        req.body?.paymentStatus ??
        req.body?.payment_status;

      const updates = [];
      const values = [];

      const addUpdate = (
        column,
        value
      ) => {
        if (
          value === undefined
        ) {
          return;
        }

        if (
          !columns.includes(column)
        ) {
          return;
        }

        values.push(value);

        updates.push(
          `"${column}" = $${values.length}`
        );
      };

      addUpdate(
        "enrollment_status",
        enrollmentStatus
      );

      addUpdate(
        "account_status",
        accountStatus
      );

      addUpdate(
        "payment_status",
        paymentStatus
      );

      if (
        columns.includes(
          "updated_at"
        )
      ) {
        updates.push(
          `"updated_at" = NOW()`
        );
      }

      if (!updates.length) {
        return res.status(400).json({
          success: false,
          message:
            "No valid enrollment status fields were supplied.",
        });
      }

      values.push(id);

      const qualifiedTable =
        `"${table.table_schema}"."${table.table_name}"`;

      const result = await pool.query(
        `
          UPDATE ${qualifiedTable}
          SET ${updates.join(", ")}
          WHERE "${idColumn}"::text = $${values.length}
          RETURNING *
        `,
        values
      );

      if (!result.rows.length) {
        return res.status(404).json({
          success: false,
          message:
            "Student enrollment not found.",
        });
      }

      const enrollment =
        serializeEnrollment(
          result.rows[0]
        );

      return res.json({
        success: true,

        message:
          "Student enrollment updated successfully.",

        enrollment,

        student: enrollment,

        data: enrollment,
      });
    } catch (error) {
      console.error(
        "UPDATE ENROLLMENT STATUS ERROR:",
        error
      );

      return res.status(500).json({
        success: false,

        message:
          "Unable to update student enrollment.",

        error:
          error.message,
      });
    }
  }
);

export default router;
