import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import pool from "../lib/db.js";

const router = express.Router();

router.use(express.json());
router.use(express.urlencoded({ extended: true }));

/* ============================================================
   BASIC HELPERS
============================================================ */

const clean = (value) => {
  if (value === undefined || value === null) {
    return "";
  }

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
  if (value === undefined || value === null || value === "") {
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

const uniqueStrings = (values = []) => {
  const result = [];
  const seen = new Set();

  for (const value of values) {
    const cleaned = clean(value);

    if (!cleaned) {
      continue;
    }

    const key = cleaned.toLowerCase();

    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    result.push(cleaned);
  }

  return result;
};

/* ============================================================
   SUBJECT HELPERS
============================================================ */

const SUBJECT_ALIASES = {
  "english studies": "English Language",
  "english study": "English Language",
  english: "English Language",

  maths: "Mathematics",
  math: "Mathematics",

  "basic science": "Basic Science",

  "basic technology": "Basic Technology",

  "social studies": "Social Studies",

  "civic education": "Civic Education",

  "computer studies": "Computer Studies",
  ict: "Computer Studies",

  "christian religious studies": "Christian Religious Studies",
  crs: "Christian Religious Studies",

  "islamic religious studies": "Islamic Religious Studies",
  irs: "Islamic Religious Studies",

  "home economics": "Home Economics",

  "agricultural science": "Agricultural Science",

  "physical health education": "Physical and Health Education",
  phe: "Physical and Health Education",

  "cultural and creative arts": "Cultural and Creative Arts",
  cca: "Cultural and Creative Arts",

  "business studies": "Business Studies",

  "literature in english": "Literature in English",

  "further mathematics": "Further Mathematics",

  economics: "Economics",
  biology: "Biology",
  chemistry: "Chemistry",
  physics: "Physics",
  geography: "Geography",
  government: "Government",
  commerce: "Commerce",
  accounting: "Accounting",
  "data processing": "Data Processing",
  "food and nutrition": "Food and Nutrition",
};

const normalizeSubject = (value) => {
  const subject = clean(value).replace(/\s+/g, " ");

  if (!subject) {
    return "";
  }

  const alias =
    SUBJECT_ALIASES[subject.toLowerCase()];

  return alias || subject;
};

const subjectsMatch = (a, b) => {
  const first = normalizeSubject(a);
  const second = normalizeSubject(b);

  if (!first || !second) {
    return false;
  }

  return (
    first.toLowerCase() ===
    second.toLowerCase()
  );
};

/* ============================================================
   CLASS HELPERS
============================================================ */

const normalizeClass = (value) => {
  return clean(value).replace(/\s+/g, " ");
};

const normalizeClassKey = (value) => {
  return normalizeClass(value)
    .toLowerCase()
    .replace(/\s+/g, " ");
};

const classesMatch = (a, b) => {
  const first = normalizeClassKey(a);
  const second = normalizeClassKey(b);

  if (!first || !second) {
    return false;
  }

  return first === second;
};

/* ============================================================
   JWT
============================================================ */

const getJwtSecret = () => {
  return (
    process.env.JWT_SECRET?.trim() ||
    "scholiqen-development-secret"
  );
};

const getBearerToken = (req) => {
  const authorization =
    req.headers.authorization;

  if (
    authorization &&
    authorization.startsWith("Bearer ")
  ) {
    return clean(
      authorization.substring(7)
    );
  }

  const academyToken =
    req.headers["x-academy-token"];

  return clean(academyToken);
};

/* ============================================================
   ENROLLMENT TABLE DISCOVERY
============================================================ */

const POSSIBLE_ENROLLMENT_TABLES = [
  "public.academy_student_enrollments",
  "public.academy_student_enrollment",
  "public.student_enrollments",
  "public.student_enrollment",
];

const findEnrollmentTable = async () => {
  for (const table of POSSIBLE_ENROLLMENT_TABLES) {
    const [schema, tableName] =
      table.split(".");

    const result =
      await pool.query(
        `
        SELECT EXISTS (
          SELECT 1
          FROM information_schema.tables
          WHERE table_schema = $1
            AND table_name = $2
        ) AS exists
        `,
        [
          schema,
          tableName,
        ]
      );

    if (result.rows[0]?.exists) {
      return table;
    }
  }

  return null;
};

/* ============================================================
   TABLE COLUMNS
============================================================ */

const getTableColumns = async (table) => {
  if (!table) {
    return [];
  }

  const [schema, tableName] =
    table.split(".");

  const result =
    await pool.query(
      `
      SELECT
        column_name
      FROM information_schema.columns
      WHERE table_schema = $1
        AND table_name = $2
      ORDER BY ordinal_position
      `,
      [
        schema,
        tableName,
      ]
    );

  return result.rows.map(
    (row) => row.column_name
  );
};

/* ============================================================
   ENSURE PASSWORD COLUMNS
============================================================ */

const ensurePasswordColumns = async (
  table
) => {
  if (!table) {
    return;
  }

  await pool.query(
    `
    ALTER TABLE ${table}
    ADD COLUMN IF NOT EXISTS password_hash TEXT
    `
  );

  await pool.query(
    `
    ALTER TABLE ${table}
    ADD COLUMN IF NOT EXISTS password_updated_at TIMESTAMP
    `
  );
};

/* ============================================================
   STUDENT IDENTIFIER COLUMNS
============================================================ */

const getStudentIdentifierColumns = (
  columns
) => {
  const possible = [
    "student_id",
    "studentId",
    "enrollment_id",
    "enrollmentId",
    "enrollment_reference",
    "enrollmentReference",
    "reference",
    "student_enrollment_id",
    "id",
  ];

  return possible.filter(
    (column) =>
      columns.includes(column)
  );
};

/* ============================================================
   FIND STUDENT ENROLLMENT
============================================================ */

const findStudentEnrollment = async ({
  table,
  columns,
  studentId,
  enrollmentId,
  email,
}) => {
  if (!table || !columns?.length) {
    return null;
  }

  const identifiers =
    uniqueStrings([
      studentId,
      enrollmentId,
    ]);

  const identifierColumns =
    getStudentIdentifierColumns(
      columns
    );

  /* ----------------------------------------------------------
     IDENTIFIER SEARCH
  ---------------------------------------------------------- */

  if (
    identifiers.length &&
    identifierColumns.length
  ) {
    for (const identifier of identifiers) {
      for (const column of identifierColumns) {
        const result =
          await pool.query(
            `
            SELECT *
            FROM ${table}
            WHERE CAST("${column}" AS TEXT) = $1
            LIMIT 1
            `,
            [
              identifier,
            ]
          );

        if (result.rows.length) {
          return result.rows[0];
        }
      }
    }
  }

  /* ----------------------------------------------------------
     EMAIL SEARCH
  ---------------------------------------------------------- */

  const emailColumns = [
    "email",
    "student_email",
    "studentEmail",
  ].filter(
    (column) =>
      columns.includes(column)
  );

  const normalizedEmail =
    clean(email).toLowerCase();

  if (
    normalizedEmail &&
    emailColumns.length
  ) {
    for (const column of emailColumns) {
      const result =
        await pool.query(
          `
          SELECT *
          FROM ${table}
          WHERE LOWER(TRIM(CAST("${column}" AS TEXT))) = $1
          LIMIT 1
          `,
          [
            normalizedEmail,
          ]
        );

      if (result.rows.length) {
        return result.rows[0];
      }
    }
  }

  return null;
};

/* ============================================================
   STUDENT SUBJECT EXTRACTION
============================================================ */

const getSubjectsFromEnrollment = (
  student,
  columns
) => {
  const possibleColumns = [
    "subjects",
    "subject",
    "student_subjects",
    "studentSubjects",
    "selected_subjects",
    "selectedSubjects",
    "registered_subjects",
    "registeredSubjects",
    "course_subjects",
    "courseSubjects",
  ];

  for (const column of possibleColumns) {
    if (!columns.includes(column)) {
      continue;
    }

    const raw =
      student[column];

    if (
      raw === undefined ||
      raw === null ||
      raw === ""
    ) {
      continue;
    }

    let values = [];

    if (Array.isArray(raw)) {
      values = raw;
    } else if (
      typeof raw === "object"
    ) {
      values = Object.values(raw);
    } else {
      const parsed =
        parseJsonValue(
          raw,
          null
        );

      if (Array.isArray(parsed)) {
        values = parsed;
      } else {
        values = String(raw)
          .split(",")
          .map(
            (item) =>
              item.trim()
          );
      }
    }

    const subjects =
      values
        .map((item) => {
          if (
            typeof item ===
            "string"
          ) {
            return normalizeSubject(
              item
            );
          }

          if (
            item &&
            typeof item ===
              "object"
          ) {
            return normalizeSubject(
              firstValue(
                item.subject,
                item.subject_name,
                item.subjectName,
                item.name,
                item.title
              )
            );
          }

          return "";
        })
        .filter(Boolean);

    if (subjects.length) {
      return uniqueStrings(
        subjects
      );
    }
  }

  return [];
};

/* ============================================================
   STUDENT CLASS
============================================================ */

const getStudentClass = (
  student,
  columns
) => {
  const possibleColumns = [
    "grade",
    "class",
    "current_class",
    "currentClass",
    "student_class",
    "studentClass",
    "school_class",
    "schoolClass",
    "level",
    "class_level",
    "classLevel",
    "academic_level",
    "academicLevel",
  ];

  for (const column of possibleColumns) {
    if (!columns.includes(column)) {
      continue;
    }

    const value =
      normalizeClass(
        student[column]
      );

    if (value) {
      return value;
    }
  }

  return "";
};

/* ============================================================
   STUDENT SCHOOL LEVEL
============================================================ */

const getStudentSchoolLevel = (
  student,
  columns
) => {
  const possibleColumns = [
    "school_level",
    "schoolLevel",
    "education_level",
    "educationLevel",
    "programme_level",
    "programmeLevel",
    "level",
  ];

  for (const column of possibleColumns) {
    if (!columns.includes(column)) {
      continue;
    }

    const value =
      clean(student[column]);

    if (value) {
      return value;
    }
  }

  return "";
};

/* ============================================================
   TUTOR ASSIGNMENT SUBJECTS
============================================================ */

const getSubjectsFromTutorAssignments =
  async (
    studentClass
  ) => {
    if (!studentClass) {
      return [];
    }

    try {
      const result =
        await pool.query(
          `
          SELECT
            assignments
          FROM academy_tutor_applications
          WHERE
            application_status = 'verified'
            OR account_status = 'verified'
          `
        );

      const subjects = [];

      for (const row of result.rows) {
        const assignments =
          parseJsonValue(
            row.assignments,
            []
          );

        if (
          !Array.isArray(
            assignments
          )
        ) {
          continue;
        }

        for (const assignment of assignments) {
          if (
            !assignment ||
            typeof assignment !==
              "object"
          ) {
            continue;
          }

          const assignedClass =
            firstValue(
              assignment.class,
              assignment.class_name,
              assignment.className,
              assignment.grade,
              assignment.level
            );

          const assignedSubject =
            firstValue(
              assignment.subject,
              assignment.subject_name,
              assignment.subjectName,
              assignment.subject_title,
              assignment.subjectTitle
            );

          if (
            classesMatch(
              assignedClass,
              studentClass
            ) &&
            assignedSubject
          ) {
            subjects.push(
              normalizeSubject(
                assignedSubject
              )
            );
          }
        }
      }

      return uniqueStrings(
        subjects
      );
    } catch (error) {
      console.error(
        "TUTOR ASSIGNMENT SUBJECT ERROR:",
        error
      );

      return [];
    }
  };

/* ============================================================
   BUILD STUDENT SUBJECTS
============================================================ */

const buildStudentSubjects = (
  subjects,
  studentClass
) => {
  return uniqueStrings(
    subjects
  ).map(
    (subject, index) => ({
      id: `student-subject-${index + 1}`,
      subject,
      name: subject,
      title: subject,
      class: studentClass,
      grade: studentClass,
      className: studentClass,
      progress: 0,
      lessons: 0,
      completedLessons: 0,
      tasks: 0,
      completedTasks: 0,
    })
  );
};

/* ============================================================
   SERIALIZE ENROLLMENT
============================================================ */

const serializeEnrollment = (
  row
) => {
  if (!row) {
    return null;
  }

  const firstName =
    firstValue(
      row.first_name,
      row.firstName,
      row.firstname
    );

  const lastName =
    firstValue(
      row.last_name,
      row.lastName,
      row.lastname
    );

  const fullName =
    firstValue(
      row.full_name,
      row.fullName,
      `${firstName} ${lastName}`.trim(),
      row.name
    );

  const email =
    firstValue(
      row.email,
      row.student_email,
      row.studentEmail
    );

  const studentId =
    firstValue(
      row.student_id,
      row.studentId,
      row.enrollment_id,
      row.enrollmentId,
      row.enrollment_reference,
      row.enrollmentReference,
      row.reference,
      row.id
    );

  const enrollmentId =
    firstValue(
      row.enrollment_id,
      row.enrollmentId,
      row.enrollment_reference,
      row.enrollmentReference,
      row.reference,
      row.id
    );

  const grade =
    firstValue(
      row.grade,
      row.class,
      row.current_class,
      row.currentClass,
      row.student_class,
      row.studentClass,
      row.school_class,
      row.schoolClass,
      row.level
    );

  const schoolLevel =
    firstValue(
      row.school_level,
      row.schoolLevel,
      row.education_level,
      row.educationLevel,
      row.programme_level,
      row.programmeLevel
    );

  return {
    ...row,

    userType: "student",
    user_type: "student",

    studentId,
    student_id: studentId,

    enrollmentId,
    enrollment_id: enrollmentId,

    firstName,
    first_name: firstName,

    lastName,
    last_name: lastName,

    fullName,
    full_name: fullName,

    email,

    grade,
    class: grade,
    className: grade,

    schoolLevel,
    school_level: schoolLevel,
  };
};

/* ============================================================
   RESOLVE AUTHENTICATED STUDENT
============================================================ */

const resolveAuthenticatedStudent =
  async (req) => {
    const table =
      await findEnrollmentTable();

    if (!table) {
      throw new Error(
        "Student enrollment table could not be found."
      );
    }

    let columns =
      await getTableColumns(
        table
      );

    await ensurePasswordColumns(
      table
    );

    columns =
      await getTableColumns(
        table
      );

    const studentId =
      firstValue(
        req.query.studentId,
        req.query.student_id,
        req.body?.studentId,
        req.body?.student_id
      );

    const enrollmentId =
      firstValue(
        req.query.enrollmentId,
        req.query.enrollment_id,
        req.query.enrollmentReference,
        req.query.enrollment_reference,
        req.body?.enrollmentId,
        req.body?.enrollment_id
      );

    const email =
      firstValue(
        req.query.email,
        req.body?.email
      );

    let student =
      await findStudentEnrollment({
        table,
        columns,
        studentId,
        enrollmentId,
        email,
      });

    let decoded = null;

    /* ----------------------------------------------------------
       JWT FALLBACK
    ---------------------------------------------------------- */

    if (!student) {
      const token =
        getBearerToken(req);

      if (!token) {
        const error =
          new Error(
            "Student authentication required."
          );

        error.status = 401;

        throw error;
      }

      try {
        decoded =
          jwt.verify(
            token,
            getJwtSecret()
          );
      } catch {
        const error =
          new Error(
            "Invalid or expired student authentication token."
          );

        error.status = 401;

        throw error;
      }

      if (
        decoded?.userType !==
        "student"
      ) {
        const error =
          new Error(
            "Student access required."
          );

        error.status = 403;

        throw error;
      }

      student =
        await findStudentEnrollment({
          table,
          columns,

          studentId:
            firstValue(
              decoded.studentId,
              decoded.student_id
            ),

          enrollmentId:
            firstValue(
              decoded.enrollmentId,
              decoded.enrollment_id
            ),

          email:
            firstValue(
              decoded.email
            ),
        });
    }

    if (!student) {
      const error =
        new Error(
          "Student enrollment could not be found."
        );

      error.status = 404;

      throw error;
    }

    const serialized =
      serializeEnrollment(
        student
      );

    const studentClass =
      getStudentClass(
        student,
        columns
      );

    const schoolLevel =
      getStudentSchoolLevel(
        student,
        columns
      );

    return {
      table,
      columns,
      student,
      serialized,
      studentClass,
      schoolLevel,
      decoded,
    };
  };

/* ============================================================
   RESOURCE FORMATTER
============================================================ */

const formatStudentResource = (
  resource
) => {
  if (!resource) {
    return null;
  }

  return {
    id: resource.id,

    title:
      clean(resource.title),

    description:
      clean(resource.description),

    resource_type:
      clean(
        resource.resource_type
      ),

    file_url:
      clean(resource.file_url),

    videoUrl:
      clean(resource.file_url),

    video_url:
      clean(resource.file_url),

    topic_id:
      resource.topic_id,

    topic_title:
      clean(resource.topic_title),

    class_name:
      normalizeClass(
        resource.class_name
      ),

    class:
      normalizeClass(
        resource.class_name
      ),

    grade:
      normalizeClass(
        resource.class_name
      ),

    className:
      normalizeClass(
        resource.class_name
      ),

    subject:
      normalizeSubject(
        resource.subject
      ),

    subject_name:
      normalizeSubject(
        resource.subject
      ),

    subject_title:
      normalizeSubject(
        resource.subject
      ),

    created_at:
      resource.created_at,
  };
};

/* ============================================================
   ADMIN ENROLLMENT HEALTH
============================================================ */

router.get(
  "/admin/enrollments/health",
  async (req, res) => {
    try {
      const table =
        await findEnrollmentTable();

      if (!table) {
        return res.status(500).json({
          success: false,
          message:
            "Student enrollment table not found.",
        });
      }

      const columns =
        await getTableColumns(
          table
        );

      return res.json({
        success: true,
        table,
        columns,
      });
    } catch (error) {
      console.error(
        "ENROLLMENT HEALTH ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to inspect student enrollment table.",
      });
    }
  }
);

/* ============================================================
   ADMIN GET ENROLLMENTS
============================================================ */

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
            "Student enrollment table not found.",
        });
      }

      const result =
        await pool.query(
          `
          SELECT *
          FROM ${table}
          ORDER BY
            created_at DESC NULLS LAST,
            id DESC
          `
        );

      const data =
        result.rows.map(
          serializeEnrollment
        );

      return res.json({
        success: true,
        enrollments: data,
        data,
        results: data,
        count: data.length,
      });
    } catch (error) {
      console.error(
        "ADMIN ENROLLMENTS ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        enrollments: [],
        data: [],
        results: [],
        count: 0,
        message:
          "Unable to fetch student enrollments.",
      });
    }
  }
);

/* ============================================================
   ADMIN GET SINGLE ENROLLMENT
============================================================ */

router.get(
  "/admin/enrollments/:id",
  async (req, res) => {
    try {
      const table =
        await findEnrollmentTable();

      const columns =
        await getTableColumns(
          table
        );

      const student =
        await findStudentEnrollment({
          table,
          columns,
          studentId:
            req.params.id,
          enrollmentId:
            req.params.id,
        });

      if (!student) {
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
            student
          ),
      });
    } catch (error) {
      console.error(
        "SINGLE ENROLLMENT ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to fetch student enrollment.",
      });
    }
  }
);

/* ============================================================
   ADMIN UPDATE ENROLLMENT STATUS
============================================================ */

router.patch(
  "/admin/enrollments/:id/status",
  async (req, res) => {
    try {
      const table =
        await findEnrollmentTable();

      const columns =
        await getTableColumns(
          table
        );

      const student =
        await findStudentEnrollment({
          table,
          columns,
          studentId:
            req.params.id,
          enrollmentId:
            req.params.id,
        });

      if (!student) {
        return res.status(404).json({
          success: false,
          message:
            "Student enrollment not found.",
        });
      }

      const status =
        firstValue(
          req.body.status,
          req.body.enrollment_status
        );

      if (!status) {
        return res.status(400).json({
          success: false,
          message:
            "Enrollment status is required.",
        });
      }

      const identifierColumns =
        getStudentIdentifierColumns(
          columns
        );

      const identifierColumn =
        identifierColumns.find(
          (column) =>
            clean(
              student[column]
            ) ===
            clean(req.params.id)
        ) ||
        identifierColumns[0];

      if (!identifierColumn) {
        return res.status(500).json({
          success: false,
          message:
            "No enrollment identifier column is available.",
        });
      }

      let statusColumn =
        columns.includes(
          "enrollment_status"
        )
          ? "enrollment_status"
          : columns.includes(
              "status"
            )
          ? "status"
          : null;

      if (!statusColumn) {
        return res.status(500).json({
          success: false,
          message:
            "Enrollment status column not found.",
        });
      }

      const result =
        await pool.query(
          `
          UPDATE ${table}
          SET "${statusColumn}" = $1
          WHERE "${identifierColumn}"::text = $2
          RETURNING *
          `,
          [
            status,
            req.params.id,
          ]
        );

      return res.json({
        success: true,
        enrollment:
          serializeEnrollment(
            result.rows[0]
          ),
      });
    } catch (error) {
      console.error(
        "ENROLLMENT STATUS UPDATE ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to update enrollment status.",
      });
    }
  }
);

/* ============================================================
   ADMIN STUDENT PASSWORD
============================================================ */

router.post(
  "/admin/student-password",
  async (req, res) => {
    try {
      const table =
        await findEnrollmentTable();

      if (!table) {
        return res.status(500).json({
          success: false,
          message:
            "Student enrollment table not found.",
        });
      }

      await ensurePasswordColumns(
        table
      );

      const columns =
        await getTableColumns(
          table
        );

      const identifier =
        firstValue(
          req.body.studentId,
          req.body.student_id,
          req.body.enrollmentId,
          req.body.enrollment_id,
          req.body.enrollmentReference,
          req.body.enrollment_reference,
          req.body.id
        );

      const password =
        clean(
          req.body.password
        );

      if (!identifier) {
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
            "Student password is required.",
        });
      }

      const student =
        await findStudentEnrollment({
          table,
          columns,
          studentId:
            identifier,
          enrollmentId:
            identifier,
        });

      if (!student) {
        return res.status(404).json({
          success: false,
          message:
            "Student enrollment not found.",
        });
      }

      const identifierColumns =
        getStudentIdentifierColumns(
          columns
        );

      let identifierColumn =
        identifierColumns.find(
          (column) =>
            clean(
              student[column]
            ) === identifier
        );

      if (!identifierColumn) {
        identifierColumn =
          identifierColumns[0];
      }

      if (!identifierColumn) {
        return res.status(500).json({
          success: false,
          message:
            "No enrollment identifier column is available.",
        });
      }

      const passwordHash =
        await bcrypt.hash(
          password,
          12
        );

      const result =
        await pool.query(
          `
          UPDATE ${table}
          SET
            password_hash = $1,
            password_updated_at = NOW()
          WHERE "${identifierColumn}"::text = $2
          RETURNING *
          `,
          [
            passwordHash,
            identifier,
          ]
        );

      if (
        result.rows.length ===
        0
      ) {
        return res.status(404).json({
          success: false,
          message:
            "Student password could not be updated.",
        });
      }

      return res.json({
        success: true,
        message:
          "Student password updated successfully.",
        student:
          serializeEnrollment(
            result.rows[0]
          ),
      });
    } catch (error) {
      console.error(
        "STUDENT PASSWORD ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          error?.message ||
          "Unable to update student password.",
      });
    }
  }
);

/* ============================================================
   STUDENT LOGIN
============================================================ */

router.post(
  "/student-login",
  async (req, res) => {
    try {
      const table =
        await findEnrollmentTable();

      if (!table) {
        return res.status(500).json({
          success: false,
          message:
            "Student enrollment table not found.",
        });
      }

      await ensurePasswordColumns(
        table
      );

      const columns =
        await getTableColumns(
          table
        );

      const email =
        clean(
          req.body.email
        ).toLowerCase();

      const password =
        clean(
          req.body.password
        );

      if (!email) {
        return res.status(400).json({
          success: false,
          message:
            "Email is required.",
        });
      }

      if (!password) {
        return res.status(400).json({
          success: false,
          message:
            "Password is required.",
        });
      }

      const student =
        await findStudentEnrollment({
          table,
          columns,
          email,
        });

      if (!student) {
        return res.status(401).json({
          success: false,
          message:
            "Invalid student email or password.",
        });
      }

      const storedHash =
        firstValue(
          student.password_hash
        );

      if (!storedHash) {
        return res.status(401).json({
          success: false,
          message:
            "Student password has not been created yet.",
        });
      }

      const passwordMatches =
        await bcrypt.compare(
          password,
          storedHash
        );

      if (!passwordMatches) {
        return res.status(401).json({
          success: false,
          message:
            "Invalid student email or password.",
        });
      }

      const serialized =
        serializeEnrollment(
          student
        );

      const studentIdentifier =
        firstValue(
          student.student_id,
          student.studentId,
          student.enrollment_id,
          student.enrollmentId,
          student.enrollment_reference,
          student.enrollmentReference,
          student.reference,
          student.id
        );

      const enrollmentIdentifier =
        firstValue(
          student.enrollment_id,
          student.enrollmentId,
          student.enrollment_reference,
          student.enrollmentReference,
          student.reference,
          student.id
        );

      const jwtSecret =
        getJwtSecret();

      const token =
        jwt.sign(
          {
            studentId:
              studentIdentifier,

            enrollmentId:
              enrollmentIdentifier,

            email,

            userType:
              "student",
          },
          jwtSecret,
          {
            expiresIn:
              "7d",
          }
        );

      const grade =
        firstValue(
          student.grade,
          student.class,
          student.current_class,
          student.currentClass,
          student.level
        );

      const schoolLevel =
        firstValue(
          student.school_level,
          student.schoolLevel,
          student.education_level,
          student.educationLevel,
          student.programme_level,
          student.programmeLevel
        );

      return res.json({
        success: true,

        message:
          "Student login successful.",

        token,

        user: {
          ...serialized,

          userType:
            "student",

          studentId:
            studentIdentifier,

          student_id:
            studentIdentifier,

          enrollmentId:
            enrollmentIdentifier,

          enrollment_id:
            enrollmentIdentifier,

          first_name:
            firstValue(
              student.first_name,
              student.firstName
            ),

          last_name:
            firstValue(
              student.last_name,
              student.lastName
            ),

          email,

          fullName:
            firstValue(
              student.full_name,
              student.fullName,
              `${firstValue(
                student.first_name,
                student.firstName
              )} ${firstValue(
                student.last_name,
                student.lastName
              )}`.trim()
            ),

          grade,

          class:
            grade,

          className:
            grade,

          school_level:
            schoolLevel,

          schoolLevel,

          academic_session:
            firstValue(
              student.academic_session,
              student.academicSession
            ),

          enrollment_date:
            firstValue(
              student.enrollment_date,
              student.enrollmentDate,
              student.created_at
            ),
        },
      });
    } catch (error) {
      console.error(
        "STUDENT LOGIN ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          error?.message ||
          "Student login failed.",
      });
    }
  }
);

/* ============================================================
   STUDENT SUBJECTS
============================================================ */

router.get(
  "/student/subjects",
  async (req, res) => {
    try {
      const resolved =
        await resolveAuthenticatedStudent(
          req
        );

      const {
        student,
        serialized,
        studentClass,
        schoolLevel,
      } = resolved;

      let subjects =
        getSubjectsFromEnrollment(
          student,
          resolved.columns
        );

      if (!subjects.length) {
        subjects =
          await getSubjectsFromTutorAssignments(
            studentClass
          );
      }

      const subjectData =
        buildStudentSubjects(
          subjects,
          studentClass
        );

      return res.json({
        success: true,

        student: serialized,

        studentId:
          serialized.studentId,

        enrollmentId:
          serialized.enrollmentId,

        class:
          studentClass,

        grade:
          studentClass,

        className:
          studentClass,

        schoolLevel,

        subjects:
          subjectData,

        data:
          subjectData,

        count:
          subjectData.length,
      });
    } catch (error) {
      console.error(
        "STUDENT SUBJECTS ERROR:",
        error
      );

      return res.status(
        error.status || 500
      ).json({
        success: false,

        subjects: [],

        data: [],

        count: 0,

        message:
          error?.message ||
          "Unable to fetch student subjects.",
      });
    }
  }
);

/* ============================================================
   STUDENT VIDEO LESSONS
===============================================================
   GET /api/academy/student/resources

   This endpoint is intentionally separate from
   /api/resources because /api/resources is admin-only.

   Students receive only:
   - video resources
   - belonging to their enrolled class
=============================================================== */

router.get(
  "/student/resources",
  async (req, res) => {
    try {
      const resolved =
        await resolveAuthenticatedStudent(
          req
        );

      const {
        serialized,
        studentClass,
        schoolLevel,
      } = resolved;

      if (!studentClass) {
        return res.json({
          success: true,

          student:
            serialized,

          studentId:
            serialized.studentId,

          enrollmentId:
            serialized.enrollmentId,

          class: "",

          grade: "",

          className: "",

          schoolLevel,

          resources: [],

          data: [],

          count: 0,
        });
      }

      /*
       * We use LOWER(TRIM(...)) for class matching.
       *
       * Admin uploads are already normalized through
       * resourceRoutes.js, but this also protects against
       * accidental spacing/case differences.
       */
      const result =
        await pool.query(
          `
          SELECT
            r.id,
            r.title,
            r.description,
            r.resource_type,
            r.file_url,
            r.topic_id,
            r.class_name,
            r.subject,
            r.created_at,

            t.title AS topic_title

          FROM resources r

          LEFT JOIN course_topics t
            ON t.id = r.topic_id

          WHERE
            r.resource_type = 'video'

            AND LOWER(
              REGEXP_REPLACE(
                TRIM(
                  COALESCE(
                    r.class_name,
                    ''
                  )
                ),
                '\\s+',
                ' ',
                'g'
              )
            )
            =
            LOWER(
              REGEXP_REPLACE(
                TRIM($1),
                '\\s+',
                ' ',
                'g'
              )
            )

          ORDER BY
            r.created_at DESC NULLS LAST,
            r.id DESC
          `,
          [
            studentClass,
          ]
        );

      const resources =
        result.rows.map(
          formatStudentResource
        );

      return res.json({
        success: true,

        student:
          serialized,

        studentId:
          serialized.studentId,

        enrollmentId:
          serialized.enrollmentId,

        class:
          studentClass,

        grade:
          studentClass,

        className:
          studentClass,

        schoolLevel,

        resources,

        data:
          resources,

        count:
          resources.length,
      });
    } catch (error) {
      console.error(
        "STUDENT VIDEO RESOURCES ERROR:",
        error
      );

      return res.status(
        error.status || 500
      ).json({
        success: false,

        resources: [],

        data: [],

        count: 0,

        message:
          error?.message ||
          "Unable to fetch student video lessons.",
      });
    }
  }
);

/* ============================================================
   STUDENT SINGLE VIDEO LESSON
===============================================================
   GET /api/academy/student/resources/:id

   The student can only open a video if it belongs to
   the student's enrolled class.
=============================================================== */

router.get(
  "/student/resources/:id",
  async (req, res) => {
    try {
      const resolved =
        await resolveAuthenticatedStudent(
          req
        );

      const {
        serialized,
        studentClass,
        schoolLevel,
      } = resolved;

      const resourceId =
        clean(
          req.params.id
        );

      if (!resourceId) {
        return res.status(400).json({
          success: false,

          message:
            "Video resource ID is required.",
        });
      }

      const result =
        await pool.query(
          `
          SELECT
            r.id,
            r.title,
            r.description,
            r.resource_type,
            r.file_url,
            r.topic_id,
            r.class_name,
            r.subject,
            r.created_at,

            t.title AS topic_title

          FROM resources r

          LEFT JOIN course_topics t
            ON t.id = r.topic_id

          WHERE
            r.id = $1

            AND r.resource_type =
              'video'

            AND LOWER(
              REGEXP_REPLACE(
                TRIM(
                  COALESCE(
                    r.class_name,
                    ''
                  )
                ),
                '\\s+',
                ' ',
                'g'
              )
            )
            =
            LOWER(
              REGEXP_REPLACE(
                TRIM($2),
                '\\s+',
                ' ',
                'g'
              )
            )

          LIMIT 1
          `,
          [
            resourceId,
            studentClass,
          ]
        );

      if (
        result.rows.length ===
        0
      ) {
        return res.status(404).json({
          success: false,

          message:
            "Video lesson not found or it is not available for your class.",
        });
      }

      const resource =
        formatStudentResource(
          result.rows[0]
        );

      return res.json({
        success: true,

        student:
          serialized,

        studentId:
          serialized.studentId,

        enrollmentId:
          serialized.enrollmentId,

        class:
          studentClass,

        grade:
          studentClass,

        className:
          studentClass,

        schoolLevel,

        resource,
      });
    } catch (error) {
      console.error(
        "STUDENT SINGLE VIDEO ERROR:",
        error
      );

      return res.status(
        error.status || 500
      ).json({
        success: false,

        message:
          error?.message ||
          "Unable to fetch video lesson.",
      });
    }
  }
);

/* ============================================================
   STUDENT PROFILE
===============================================================
   Useful for the StudentProfile page and keeps all student
   authentication in one place.
=============================================================== */

router.get(
  "/student/profile",
  async (req, res) => {
    try {
      const resolved =
        await resolveAuthenticatedStudent(
          req
        );

      return res.json({
        success: true,

        student:
          resolved.serialized,

        studentId:
          resolved.serialized.studentId,

        enrollmentId:
          resolved.serialized.enrollmentId,

        class:
          resolved.studentClass,

        grade:
          resolved.studentClass,

        className:
          resolved.studentClass,

        schoolLevel:
          resolved.schoolLevel,
      });
    } catch (error) {
      console.error(
        "STUDENT PROFILE ERROR:",
        error
      );

      return res.status(
        error.status || 500
      ).json({
        success: false,

        message:
          error?.message ||
          "Unable to fetch student profile.",
      });
    }
  }
);

/* ============================================================
   EXPORT HELPERS
============================================================ */

export {
  clean,
  firstValue,
  parseJsonValue,
  uniqueStrings,
  normalizeSubject,
  subjectsMatch,
  normalizeClass,
  classesMatch,
  findEnrollmentTable,
  getTableColumns,
  ensurePasswordColumns,
  findStudentEnrollment,
  getSubjectsFromEnrollment,
  getStudentClass,
  getStudentSchoolLevel,
  getSubjectsFromTutorAssignments,
  buildStudentSubjects,
  serializeEnrollment,
  resolveAuthenticatedStudent,
  formatStudentResource,
};

/* ============================================================
   EXPORT ROUTER
============================================================ */

export default router;
