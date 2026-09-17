import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import pool from "../lib/db.js";

const router = express.Router();

/* =========================================================
IMPORTANT
Parse JSON at router level so this route always receives
req.body correctly, regardless of middleware order in
the main server file.
========================================================= */

router.use(express.json());
router.use(express.urlencoded({ extended: true }));

/* =========================================================
HELPERS
========================================================= */

const clean = (value) => {
if (value === undefined || value === null) return "";
return String(value).trim();
};

const firstValue = (...values) => {
for (const value of values) {
const cleaned = clean(value);

if (cleaned) {
  return cleaned;
}

}

return "";
};

const parseJsonValue = (value, fallback = []) => {
if (
value === undefined ||
value === null ||
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

try {
return JSON.parse(value);
} catch {
return fallback;
}
};

/* =========================================================
FIND STUDENT ENROLLMENT TABLE
========================================================= */

const findEnrollmentTable = async () => {
const candidates = [
"public.academy_student_enrollments",
"public.academy_student_enrollment",
"public.student_enrollments",
"public.student_enrollment",
];

for (const table of candidates) {
try {
const result = await pool.query(
`         SELECT to_regclass($1) AS table_name
        `,
[table]
);

  if (result.rows[0]?.table_name) {
    return table;
  }
} catch (error) {
  console.error(
    `TABLE CHECK ERROR FOR ${table}:`,
    error.message
  );
}

}

return null;
};

/* =========================================================
GET TABLE COLUMNS
========================================================= */

const getTableColumns = async (table) => {
if (!table) {
return [];
}

const result = await pool.query(
`     SELECT column_name
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = split_part($1, '.', 2)
    ORDER BY ordinal_position
    `,
[table]
);

return result.rows.map(
(row) => row.column_name
);
};

/* =========================================================
ENSURE PASSWORD COLUMNS
========================================================= */

const ensurePasswordColumns = async (table) => {
if (!table) {
throw new Error(
"Student enrollment table was not found."
);
}

const columns =
await getTableColumns(table);

if (!columns.includes("password_hash")) {
await pool.query(
`       ALTER TABLE ${table}
      ADD COLUMN IF NOT EXISTS password_hash TEXT
      `
);
}

if (!columns.includes("password_updated_at")) {
await pool.query(
`       ALTER TABLE ${table}
      ADD COLUMN IF NOT EXISTS password_updated_at TIMESTAMPTZ
      `
);
}
};

/* =========================================================
SERIALIZE ENROLLMENT
========================================================= */

const serializeEnrollment = (row = {}) => {
const enrollmentId = firstValue(
row.enrollment_id,
row.enrollment_reference,
row.reference,
row.student_enrollment_id,
row.id
);

return {
...row,

/*
 * IMPORTANT:
 * The frontend AcademyProtectedRoute requires
 * userType === "student".
 */
userType: "student",
user_type: "student",

enrollmentId,

enrollment_id: enrollmentId,

enrollment_reference: firstValue(
  row.enrollment_reference,
  row.enrollment_id,
  row.reference,
  enrollmentId
),

reference: firstValue(
  row.reference,
  row.enrollment_reference,
  row.enrollment_id,
  enrollmentId
),

firstName: firstValue(
  row.first_name,
  row.firstname,
  row.firstName
),

lastName: firstValue(
  row.last_name,
  row.lastname,
  row.lastName
),

email: firstValue(
  row.email,
  row.student_email,
  row.email_address
),

};
};

/* =========================================================
HEALTH CHECK
========================================================= */

router.get(
"/admin/enrollments/health",
async (req, res) => {
try {
const table =
await findEnrollmentTable();

  return res.json({
    success: true,
    table,
  });
} catch (error) {
  console.error(
    "ENROLLMENT HEALTH ERROR:",
    error
  );

  return res.status(500).json({
    success: false,
    message: error.message,
  });
}

}
);

/* =========================================================
GET ALL ENROLLMENTS
========================================================= */

router.get(
"/admin/enrollments",
async (req, res) => {
try {
const table =
await findEnrollmentTable();

  if (!table) {
    return res.status(500).json({
      success: false,
      message:
        "Student enrollment table was not found.",
      enrollments: [],
    });
  }

  const result =
    await pool.query(
      `
      SELECT *
      FROM ${table}
      ORDER BY created_at DESC NULLS LAST
      `
    );

  const enrollments =
    result.rows.map(
      serializeEnrollment
    );

  console.log(
    "ADMIN ENROLLMENTS RETURNED:",
    enrollments.length
  );

  return res.json({
    success: true,
    enrollments,
  });
} catch (error) {
  console.error(
    "GET ADMIN ENROLLMENTS ERROR:",
    error
  );

  return res.status(500).json({
    success: false,
    message: error.message,
    enrollments: [],
  });
}

}
);

/* =========================================================
GET SINGLE ENROLLMENT
========================================================= */

router.get(
"/admin/enrollments/:id",
async (req, res) => {
try {
const requestedId =
clean(req.params.id);

  if (!requestedId) {
    return res.status(400).json({
      success: false,
      message:
        "Enrollment ID is required.",
    });
  }

  const table =
    await findEnrollmentTable();

  if (!table) {
    return res.status(500).json({
      success: false,
      message:
        "Student enrollment table was not found.",
    });
  }

  const columns =
    await getTableColumns(table);

  const identifierColumns = [
    "enrollment_id",
    "enrollment_reference",
    "reference",
    "student_enrollment_id",
    "id",
  ].filter((column) =>
    columns.includes(column)
  );

  if (!identifierColumns.length) {
    return res.status(500).json({
      success: false,
      message:
        "No enrollment identifier column exists.",
    });
  }

  const conditions =
    identifierColumns
      .map(
        (column, index) =>
          `"${column}"::text = $${index + 1}`
      )
      .join(" OR ");

  const values =
    identifierColumns.map(
      () => requestedId
    );

  const result =
    await pool.query(
      `
      SELECT *
      FROM ${table}
      WHERE ${conditions}
      LIMIT 1
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

  return res.json({
    success: true,
    enrollment:
      serializeEnrollment(
        result.rows[0]
      ),
  });
} catch (error) {
  console.error(
    "GET SINGLE ENROLLMENT ERROR:",
    error
  );

  return res.status(500).json({
    success: false,
    message: error.message,
  });
}

}
);

/* =========================================================
UPDATE ENROLLMENT STATUS
========================================================= */

router.patch(
"/admin/enrollments/:id/status",
async (req, res) => {
try {
const requestedId =
clean(req.params.id);

  const status = firstValue(
    req.body?.status,
    req.body?.enrollment_status
  );

  if (!requestedId) {
    return res.status(400).json({
      success: false,
      message:
        "Enrollment ID is required.",
    });
  }

  if (!status) {
    return res.status(400).json({
      success: false,
      message:
        "Status is required.",
    });
  }

  const table =
    await findEnrollmentTable();

  if (!table) {
    return res.status(500).json({
      success: false,
      message:
        "Student enrollment table was not found.",
    });
  }

  const columns =
    await getTableColumns(table);

  const identifierColumns = [
    "enrollment_id",
    "enrollment_reference",
    "reference",
    "student_enrollment_id",
    "id",
  ].filter((column) =>
    columns.includes(column)
  );

  const statusColumn =
    columns.includes(
      "enrollment_status"
    )
      ? "enrollment_status"
      : columns.includes("status")
        ? "status"
        : null;

  if (!statusColumn) {
    return res.status(500).json({
      success: false,
      message:
        "Enrollment status column was not found.",
    });
  }

  const conditions =
    identifierColumns
      .map(
        (column, index) =>
          `"${column}"::text = $${index + 1}`
      )
      .join(" OR ");

  const values =
    identifierColumns.map(
      () => requestedId
    );

  values.push(status);

  const result =
    await pool.query(
      `
      UPDATE ${table}
      SET "${statusColumn}" = $${values.length}
      WHERE ${conditions}
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

  return res.json({
    success: true,
    enrollment:
      serializeEnrollment(
        result.rows[0]
      ),
  });
} catch (error) {
  console.error(
    "UPDATE ENROLLMENT STATUS ERROR:",
    error
  );

  return res.status(500).json({
    success: false,
    message: error.message,
  });
}

}
);

/* =========================================================
ADMIN STUDENT PASSWORD
========================================================= */

router.post(
"/admin/student-password",
async (req, res) => {
try {
console.log(
"\n================================================="
);

  console.log(
    "ADMIN STUDENT PASSWORD REQUEST"
  );

  console.log(
    "HEADERS CONTENT-TYPE:",
    req.headers["content-type"]
  );

  console.log(
    "BODY:",
    req.body
  );

  console.log(
    "================================================="
  );

  const body =
    req.body || {};

  const enrollmentId =
    firstValue(
      body.enrollmentId,
      body.enrollment_id,
      body.enrollment_reference,
      body.enrollmentReference,
      body.reference,
      body.student_id,
      body.studentId,
      body.student_enrollment_id,
      body.studentEnrollmentId
    );

  const password =
    clean(body.password);

  console.log(
    "RESOLVED STUDENT ENROLLMENT ID:",
    enrollmentId
  );

  if (!enrollmentId) {
    console.error(
      "STUDENT PASSWORD ERROR: No enrollment identifier received."
    );

    return res.status(400).json({
      success: false,
      message:
        "No enrollment identifier received.",
    });
  }

  if (!password) {
    return res.status(400).json({
      success: false,
      message:
        "Password is required.",
    });
  }

  if (password.length < 6) {
    return res.status(400).json({
      success: false,
      message:
        "Password must be at least 6 characters.",
    });
  }

  const table =
    await findEnrollmentTable();

  if (!table) {
    return res.status(500).json({
      success: false,
      message:
        "Student enrollment table was not found.",
    });
  }

  await ensurePasswordColumns(table);

  const columns =
    await getTableColumns(table);

  const identifierColumns = [
    "enrollment_id",
    "enrollment_reference",
    "reference",
    "student_enrollment_id",
    "id",
  ].filter((column) =>
    columns.includes(column)
  );

  if (!identifierColumns.length) {
    return res.status(500).json({
      success: false,
      message:
        "No student enrollment identifier column exists.",
    });
  }

  const conditions =
    identifierColumns
      .map(
        (column, index) =>
          `"${column}"::text = $${index + 1}`
      )
      .join(" OR ");

  const lookupValues =
    identifierColumns.map(
      () => enrollmentId
    );

  console.log(
    "STUDENT PASSWORD LOOKUP COLUMNS:",
    identifierColumns
  );

  const studentResult =
    await pool.query(
      `
      SELECT *
      FROM ${table}
      WHERE ${conditions}
      LIMIT 1
      `,
      lookupValues
    );

  if (!studentResult.rows.length) {
    console.error(
      "STUDENT PASSWORD ERROR: Student enrollment not found.",
      {
        enrollmentId,
        identifierColumns,
      }
    );

    return res.status(404).json({
      success: false,
      message:
        "Student enrollment not found.",
    });
  }

  const student =
    studentResult.rows[0];

  const passwordHash =
    await bcrypt.hash(
      password,
      12
    );

  let updateColumn = null;
  let updateValue = null;

  for (const column of identifierColumns) {
    const value =
      clean(student[column]);

    if (
      value &&
      value === enrollmentId
    ) {
      updateColumn = column;
      updateValue = value;
      break;
    }
  }

  if (!updateColumn) {
    for (const column of identifierColumns) {
      const value =
        clean(student[column]);

      if (value) {
        updateColumn = column;
        updateValue = value;
        break;
      }
    }
  }

  if (
    !updateColumn ||
    !updateValue
  ) {
    return res.status(500).json({
      success: false,
      message:
        "Unable to determine the student's database identifier.",
    });
  }

  const updatedResult =
    await pool.query(
      `
      UPDATE ${table}
      SET
        password_hash = $1,
        password_updated_at = NOW()
      WHERE "${updateColumn}"::text = $2
      RETURNING *
      `,
      [
        passwordHash,
        updateValue,
      ]
    );

  if (
    !updatedResult.rows.length
  ) {
    return res.status(404).json({
      success: false,
      message:
        "Student enrollment could not be updated.",
    });
  }

  const updatedStudent =
    updatedResult.rows[0];

  console.log(
    "================================================="
  );

  console.log(
    "STUDENT PASSWORD UPDATED SUCCESSFULLY"
  );

  console.log(
    "IDENTIFIER COLUMN:",
    updateColumn
  );

  console.log(
    "IDENTIFIER VALUE:",
    updateValue
  );

  console.log(
    "================================================="
  );

  return res.json({
    success: true,
    message:
      "Student password updated successfully.",
    student:
      serializeEnrollment(
        updatedStudent
      ),
  });
} catch (error) {
  console.error(
    "\n================================================="
  );

  console.error(
    "STUDENT PASSWORD ERROR:"
  );

  console.error(error);

  console.error(
    "=================================================\n"
  );

  return res.status(500).json({
    success: false,
    message:
      error.message ||
      "Failed to update student password.",
  });
}

}
);

/* =========================================================
STUDENT LOGIN
========================================================= */

router.post(
"/student-login",
async (req, res) => {
try {
console.log(
"\n================================================="
);

  console.log(
    "🎓 STUDENT LOGIN REQUEST"
  );

  console.log(
    "EMAIL:",
    clean(req.body?.email).toLowerCase()
  );

  console.log(
    "================================================="
  );

  const email =
    clean(
      req.body?.email
    ).toLowerCase();

  const password =
    clean(
      req.body?.password
    );

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message:
        "Email and password are required.",
    });
  }

  const table =
    await findEnrollmentTable();

  if (!table) {
    return res.status(500).json({
      success: false,
      message:
        "Student enrollment table was not found.",
    });
  }

  await ensurePasswordColumns(table);

  const columns =
    await getTableColumns(table);

  const emailColumns = [
    "email",
    "student_email",
    "email_address",
  ].filter((column) =>
    columns.includes(column)
  );

  if (!emailColumns.length) {
    return res.status(500).json({
      success: false,
      message:
        "Student email column was not found.",
    });
  }

  const conditions =
    emailColumns
      .map(
        (column, index) =>
          `LOWER("${column}"::text) = $${index + 1}`
      )
      .join(" OR ");

  const emailValues =
    emailColumns.map(
      () => email
    );

  const result =
    await pool.query(
      `
      SELECT *
      FROM ${table}
      WHERE ${conditions}
      LIMIT 1
      `,
      emailValues
    );

  if (!result.rows.length) {
    console.warn(
      "❌ STUDENT LOGIN FAILED: EMAIL NOT FOUND"
    );

    return res.status(401).json({
      success: false,
      message:
        "Invalid email or password.",
    });
  }

  const student =
    result.rows[0];

  if (!student.password_hash) {
    return res.status(401).json({
      success: false,
      message:
        "A password has not been assigned to this student yet.",
    });
  }

  const passwordMatches =
    await bcrypt.compare(
      password,
      student.password_hash
    );

  if (!passwordMatches) {
    console.warn(
      "❌ STUDENT LOGIN FAILED: INVALID PASSWORD"
    );

    return res.status(401).json({
      success: false,
      message:
        "Invalid email or password.",
    });
  }

  /*
   * ======================================================
   * BUILD STUDENT USER OBJECT
   * ======================================================
   *
   * IMPORTANT:
   * The frontend expects `user`, not `student`.
   *
   * AcademyProtectedRoute also expects:
   *
   * user.userType === "student"
   *
   * Therefore we explicitly provide both:
   *
   *   user
   *   student
   *
   * while keeping the same serialized enrollment data.
   */

  const serializedStudent =
    serializeEnrollment(
      student
    );

  const user = {
    ...serializedStudent,

    userType: "student",
    user_type: "student",

    student_id: firstValue(
      student.student_id,
      student.studentId,
      student.enrollment_id,
      student.enrollment_reference,
      student.reference,
      student.id
    ),

    first_name: firstValue(
      student.first_name,
      student.firstname,
      student.firstName
    ),

    last_name: firstValue(
      student.last_name,
      student.lastname,
      student.lastName
    ),

    email: firstValue(
      student.email,
      student.student_email,
      student.email_address
    ),

    grade: firstValue(
      student.grade,
      student.class,
      student.current_class,
      student.level
    ),

    school_level: firstValue(
      student.school_level,
      student.schoolLevel
    ),

    academic_session:
      firstValue(
        student.academic_session,
        student.academicSession
      ),

    enrollment_date:
      firstValue(
        student.enrollment_date,
        student.created_at
      ),
  };

  /*
   * ======================================================
   * JWT
   * ======================================================
   */

  const studentIdentifier =
    firstValue(
      student.student_id,
      student.studentId,
      student.enrollment_id,
      student.enrollment_reference,
      student.reference,
      student.id
    );

  const jwtSecret =
    process.env.JWT_SECRET ||
    "scholiqen-development-secret";

  const token =
    jwt.sign(
      {
        studentId:
          studentIdentifier,

        enrollmentId:
          firstValue(
            student.enrollment_id,
            student.enrollment_reference,
            student.reference,
            student.id
          ),

        email,

        userType: "student",
      },
      jwtSecret,
      {
        expiresIn: "7d",
      }
    );

  console.log(
    "================================================="
  );

  console.log(
    "✅ STUDENT LOGIN SUCCESSFUL"
  );

  console.log(
    "STUDENT ID:",
    studentIdentifier
  );

  console.log(
    "EMAIL:",
    email
  );

  console.log(
    "USER TYPE:",
    user.userType
  );

  console.log(
    "RETURNING USER OBJECT: YES"
  );

  console.log(
    "================================================="
  );

  /*
   * ======================================================
   * IMPORTANT RESPONSE SHAPE
   * ======================================================
   *
   * `user` is what StudentEnrollmentLogin.jsx expects.
   *
   * `student` is kept for backward compatibility with
   * any existing frontend code using response.student.
   */

  return res.json({
    success: true,

    message:
      "Login successful.",

    token,

    user,

    student:
      serializedStudent,
  });
} catch (error) {
  console.error(
    "\n================================================="
  );

  console.error(
    "❌ STUDENT LOGIN ERROR"
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
    "=================================================\n"
  );

  return res.status(500).json({
    success: false,
    message:
      error.message ||
      "Student login failed.",
  });
}

}
);

export default router;
