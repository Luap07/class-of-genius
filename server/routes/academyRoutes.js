import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import crypto from "crypto";

import pool from "../lib/db.js";

const router = express.Router();

/* =========================================================
   CLASS LISTS
========================================================= */

const PRIMARY_GRADES = [
  "Primary 1",
  "Primary 2",
  "Primary 3",
  "Primary 4",
  "Primary 5",
  "Primary 6",
];

const SECONDARY_CLASSES = [
  "JSS 1",
  "JSS 2",
  "JSS 3",
  "SS 1",
  "SS 2",
  "SS 3",
];

const ALL_TUTOR_CLASSES = [
  ...PRIMARY_GRADES,
  ...SECONDARY_CLASSES,
];

/* =========================================================
   SUBJECT LISTS
========================================================= */

const PRIMARY_SUBJECTS = [
  "English Language",
  "Mathematics",
  "Basic Science",
  "Social Studies",
  "Civic Education",
  "Computer Studies",
  "Physical and Health Education",
  "Christian Religious Studies",
  "Islamic Religious Studies",
  "Home Economics",
  "Agricultural Science",
  "Cultural and Creative Arts",
];

const JSS_SUBJECTS = [
  "English Language",
  "Mathematics",
  "Basic Science",
  "Basic Technology",
  "Social Studies",
  "Civic Education",
  "Computer Studies",
  "Business Studies",
  "Agricultural Science",
  "Christian Religious Studies",
  "Islamic Religious Studies",
  "Physical and Health Education",
  "Cultural and Creative Arts",
  "French",
];

const SS_SUBJECTS = [
  "English Language",
  "Mathematics",
  "Further Mathematics",
  "Physics",
  "Chemistry",
  "Biology",
  "Agricultural Science",
  "Economics",
  "Government",
  "Literature in English",
  "Commerce",
  "Financial Accounting",
  "Geography",
  "Computer Science",
  "Civic Education",
  "Christian Religious Studies",
  "Islamic Religious Studies",
];

/* =========================================================
   HELPERS
========================================================= */

function clean(value) {
  return value === undefined || value === null
    ? ""
    : String(value).trim();
}

function normalizeEmail(value) {
  return clean(value).toLowerCase();
}

function normalizeSubject(value) {
  return clean(value)
    .replace(/\s+/g, " ")
    .toLowerCase();
}

function normalizeClass(value) {
  return clean(value)
    .replace(/\s+/g, " ")
    .toLowerCase();
}

function normalizeStatus(value) {
  return clean(value)
    .toLowerCase()
    .replace(/[\s-]+/g, "_");
}

function uniqueArray(values = []) {
  return [
    ...new Set(
      values
        .map(clean)
        .filter(Boolean)
    ),
  ];
}

function arrayFromValue(value) {
  if (Array.isArray(value)) {
    return uniqueArray(value);
  }

  if (value === null || value === undefined) {
    return [];
  }

  if (typeof value === "object") {
    if (Array.isArray(value.values)) {
      return uniqueArray(value.values);
    }

    return Object.values(value)
      .flatMap((item) => {
        if (Array.isArray(item)) {
          return item;
        }

        return clean(item);
      })
      .filter(Boolean)
      .map(clean);
  }

  const stringValue = clean(value);

  if (!stringValue) {
    return [];
  }

  try {
    const parsed = JSON.parse(stringValue);

    if (Array.isArray(parsed)) {
      return uniqueArray(parsed);
    }

    if (
      parsed &&
      typeof parsed === "object"
    ) {
      return uniqueArray(
        Object.values(parsed)
          .flatMap((item) =>
            Array.isArray(item)
              ? item
              : [item]
          )
      );
    }
  } catch {
    // Not JSON. Continue with comma-separated handling.
  }

  return uniqueArray(
    stringValue
      .split(",")
      .map((item) => item.trim())
  );
}

/* =========================================================
   SUBJECT ALIASES
========================================================= */

function subjectsMatch(first, second) {
  const a = normalizeSubject(first);
  const b = normalizeSubject(second);

  if (!a || !b) {
    return false;
  }

  if (a === b) {
    return true;
  }

  const aliases = {
    mathematics: [
      "mathematics",
      "math",
      "maths",
      "general mathematics",
      "general maths",
    ],

    "further mathematics": [
      "further mathematics",
      "further maths",
      "further math",
    ],

    "english language": [
      "english language",
      "english",
      "english studies",
      "use of english",
    ],

    "physical and health education": [
      "physical and health education",
      "physical health education",
      "physical & health education",
      "physical education",
      "phe",
      "p.h.e",
    ],

    "computer studies": [
      "computer studies",
      "computer science",
      "computer",
      "ict",
      "information technology",
    ],

    "christian religious studies": [
      "christian religious studies",
      "christian religious knowledge",
      "crs",
      "crk",
    ],

    "islamic religious studies": [
      "islamic religious studies",
      "islamic religious knowledge",
      "irs",
      "irk",
    ],

    "agricultural science": [
      "agricultural science",
      "agriculture",
      "agric science",
    ],

    "civic education": [
      "civic education",
      "civic",
    ],

    "basic science": [
      "basic science",
      "basic sciences",
    ],

    "basic technology": [
      "basic technology",
      "basic tech",
    ],

    "literature in english": [
      "literature in english",
      "literature",
      "english literature",
    ],
  };

  for (const values of Object.values(aliases)) {
    const normalizedValues =
      values.map(normalizeSubject);

    if (
      normalizedValues.includes(a) &&
      normalizedValues.includes(b)
    ) {
      return true;
    }
  }

  return false;
}

/* =========================================================
   CLASS SUBJECTS
========================================================= */

function getClassSubjects(grade) {
  const normalized = normalizeClass(grade);

  if (
    PRIMARY_GRADES.some(
      (item) =>
        normalizeClass(item) === normalized
    )
  ) {
    return PRIMARY_SUBJECTS;
  }

  if (
    ["jss 1", "jss 2", "jss 3"].includes(
      normalized
    )
  ) {
    return JSS_SUBJECTS;
  }

  if (
    ["ss 1", "ss 2", "ss 3"].includes(
      normalized
    )
  ) {
    return SS_SUBJECTS;
  }

  return [];
}

function isValidTutorClass(grade) {
  return ALL_TUTOR_CLASSES.some(
    (item) =>
      normalizeClass(item) ===
      normalizeClass(grade)
  );
}

function getMatchingCanonicalSubject(
  grade,
  subject
) {
  const subjects = getClassSubjects(grade);

  return (
    subjects.find((item) =>
      subjectsMatch(item, subject)
    ) || null
  );
}

function isValidTutorSubject(
  grade,
  subject
) {
  return Boolean(
    getMatchingCanonicalSubject(
      grade,
      subject
    )
  );
}

/* =========================================================
   VERIFIED TUTOR + REGISTERED CLASS/SUBJECT
   NOTE:
   Tutor classes and subjects are independent.
   The assignments column is NOT required.
========================================================= */

async function getVerifiedTutorForClassSubject(
  reference,
  grade,
  subject
) {
  const tutorResult = await pool.query(
    `
      SELECT
        reference,
        first_name,
        middle_name,
        last_name,
        email,
        phone,
        school,
        teaching_level,
        qualification,
        specialization,
        experience,
        subjects,
        classes,
        assignments,
        application_status,
        account_status,
        email_verified
      FROM academy_tutor_applications
      WHERE
        LOWER(TRIM(reference)) =
        LOWER(TRIM($1))
      LIMIT 1
    `,
    [reference]
  );

  if (!tutorResult.rows.length) {
    return {
      error: {
        status: 404,
        code: "TUTOR_NOT_FOUND",
        message: "Tutor not found.",
      },
    };
  }

  const tutor = tutorResult.rows[0];

  if (
    normalizeStatus(
      tutor.application_status
    ) !== "verified"
  ) {
    return {
      error: {
        status: 403,
        code: "TUTOR_NOT_VERIFIED",
        message:
          "Tutor account has not been verified.",
      },
    };
  }

  const tutorClasses = uniqueArray(
    arrayFromValue(tutor.classes)
  );

  const tutorSubjects = uniqueArray(
    arrayFromValue(tutor.subjects)
  );

  /* ---------------------------------------------
     CLASS MUST BELONG TO TUTOR
  --------------------------------------------- */

  const tutorHasClass = tutorClasses.some(
    (item) =>
      normalizeClass(item) ===
      normalizeClass(grade)
  );

  if (!tutorHasClass) {
    return {
      error: {
        status: 403,
        code: "TUTOR_CLASS_NOT_REGISTERED",
        message:
          `This class is not registered to this tutor: ${grade}.`,
      },
    };
  }

  /* ---------------------------------------------
     SUBJECT MUST BELONG TO TUTOR

     Uses aliases so:
     English Studies ↔ English Language
     Computer Studies ↔ Computer Science
     Physical & Health Education ↔ PHE
     Mathematics ↔ Maths
     etc.
  --------------------------------------------- */

  const tutorHasSubject = tutorSubjects.some(
    (item) =>
      subjectsMatch(
        item,
        subject
      )
  );

  if (!tutorHasSubject) {
    return {
      error: {
        status: 403,
        code: "TUTOR_SUBJECT_NOT_REGISTERED",
        message:
          `This subject is not registered to this tutor: ${subject}.`,
      },
    };
  }

  return {
    tutor,

    tutorClasses,

    tutorSubjects,

    /*
     * Keep this only as compatibility data.
     * It is NOT used for authorization.
     */
    tutorAssignments: [],
  };
}

/* =========================================================
   UPLOAD DIRECTORY
========================================================= */

const uploadDirectory =
  path.resolve(
    process.cwd(),
    "uploads",
    "tasks"
  );

if (
  !fs.existsSync(
    uploadDirectory
  )
) {
  fs.mkdirSync(
    uploadDirectory,
    {
      recursive: true,
    }
  );
}

/* =========================================================
   MULTER STORAGE
========================================================= */

const taskStorage =
  multer.diskStorage({
    destination: (
      _req,
      _file,
      cb
    ) => {
      cb(
        null,
        uploadDirectory
      );
    },

    filename: (
      _req,
      file,
      cb
    ) => {
      const extension =
        path.extname(
          file.originalname
        );

      const safeExtension =
        extension
          ? extension.toLowerCase()
          : "";

      const uniqueName =
        `${Date.now()}-${crypto.randomBytes(8).toString("hex")}${safeExtension}`;

      cb(
        null,
        uniqueName
      );
    },
  });

const ALLOWED_TASK_MIME_TYPES = [
  "application/pdf",

  "application/msword",

  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",

  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
  "image/avif",

  "video/mp4",
  "video/webm",
  "video/quicktime",
];

const taskUpload =
  multer({
    storage:
      taskStorage,

    limits: {
      fileSize:
        250 *
        1024 *
        1024,

      files: 10,
    },

    fileFilter: (
      _req,
      file,
      cb
    ) => {
      if (
        ALLOWED_TASK_MIME_TYPES.includes(
          file.mimetype
        )
      ) {
        cb(null, true);
        return;
      }

      cb(
        new Error(
          "Only PDF, DOC, DOCX, images, MP4, WebM and MOV files are allowed."
        )
      );
    },
  });

/* =========================================================
   HEALTH
========================================================= */

router.get(
  "/health",
  async (
    _req,
    res
  ) => {
    try {
      await pool.query(
        "SELECT 1"
      );

      return res.json({
        success: true,
        message:
          "Academy API is running.",
        database: true,
        timestamp:
          new Date().toISOString(),
      });
    } catch (error) {
      console.error(
        "Academy health error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Academy API is running but database connection failed.",
        error:
          process.env.NODE_ENV ===
          "development"
            ? error.message
            : undefined,
      });
    }
  }
);

/* =========================================================
   TUTOR APPLICATION
   NO ASSIGNMENTS REQUIRED
========================================================= */

router.post(
  "/tutor-application",
  async (
    req,
    res
  ) => {
    try {
      const body =
        req.body || {};

      const firstName =
        clean(
          body.firstName
        );

      const middleName =
        clean(
          body.middleName
        );

      const lastName =
        clean(
          body.lastName
        );

      const email =
        normalizeEmail(
          body.email
        );

      const phone =
        clean(
          body.phone
        );

      const gender =
        clean(
          body.gender
        );

      const dateOfBirth =
        clean(
          body.dateOfBirth ||
          body.date_of_birth
        );

      const state =
        clean(
          body.state
        );

      const city =
        clean(
          body.city
        );

      const qualification =
        clean(
          body.qualification
        );

      const specialization =
        clean(
          body.specialization
        );

      const experience =
        clean(
          body.experience
        );

      const bio =
        clean(
          body.bio
        );

      const classes =
        arrayFromValue(
          body.classes
        );

      const subjects =
        arrayFromValue(
          body.subjects
        );

      if (
        !firstName ||
        !lastName
      ) {
        return res.status(400).json({
          success: false,
          message:
            "First name and last name are required.",
        });
      }

      if (!email) {
        return res.status(400).json({
          success: false,
          message:
            "Email is required.",
        });
      }

      if (!classes.length) {
        return res.status(400).json({
          success: false,
          code:
            "NO_TUTOR_CLASSES",
          message:
            "Please select at least one class.",
        });
      }

      if (!subjects.length) {
        return res.status(400).json({
          success: false,
          code:
            "NO_TUTOR_SUBJECTS",
          message:
            "Please select at least one subject.",
        });
      }

      const invalidClasses =
        classes.filter(
          (item) =>
            !isValidTutorClass(
              item
            )
        );

      if (
        invalidClasses.length
      ) {
        return res.status(400).json({
          success: false,
          code:
            "INVALID_TUTOR_CLASSES",
          message:
            "One or more selected classes are invalid.",
          invalidClasses,
        });
      }

      /*
       * Subjects only need to be legitimate
       * Academy subjects. They do not need an
       * assignments array.
       */
      const allSubjects = uniqueArray([
        ...PRIMARY_SUBJECTS,
        ...JSS_SUBJECTS,
        ...SS_SUBJECTS,
      ]);

      const invalidSubjects =
        subjects.filter(
          (subject) =>
            !allSubjects.some(
              (allowed) =>
                subjectsMatch(
                  allowed,
                  subject
                )
            )
        );

      if (
        invalidSubjects.length
      ) {
        return res.status(400).json({
          success: false,
          code:
            "INVALID_TUTOR_SUBJECTS",
          message:
            "One or more selected subjects are invalid.",
          invalidSubjects,
        });
      }

      const finalClasses =
        uniqueArray(
          classes
        );

      const finalSubjects =
        uniqueArray(
          subjects
        );

      const existing =
        await pool.query(
          `
            SELECT
              reference,
              email
            FROM academy_tutor_applications
            WHERE
              LOWER(TRIM(email)) =
              $1
            LIMIT 1
          `,
          [email]
        );

      if (
        existing.rows.length
      ) {
        return res.status(409).json({
          success: false,
          code:
            "TUTOR_EMAIL_EXISTS",
          message:
            "A tutor application already exists with this email.",
          reference:
            existing.rows[0]
              .reference,
        });
      }

      const reference =
        `TUT-${Date.now()
          .toString(36)
          .toUpperCase()}-${crypto
          .randomBytes(3)
          .toString("hex")
          .toUpperCase()}`;

      const result =
        await pool.query(
          `
            INSERT INTO academy_tutor_applications (
              reference,
              first_name,
              middle_name,
              last_name,
              email,
              phone,
              gender,
              date_of_birth,
              state,
              city,
              qualification,
              specialization,
              experience,
              subjects,
              classes,
              assignments,
              bio,
              application_status,
              account_status,
              email_verified,
              created_at,
              updated_at
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
              $14::jsonb,
              $15::jsonb,
              '[]'::jsonb,
              $16,
              'pending',
              'pending',
              FALSE,
              NOW(),
              NOW()
            )
            RETURNING
              reference,
              first_name,
              middle_name,
              last_name,
              email,
              subjects,
              classes,
              application_status,
              account_status
          `,
          [
            reference,
            firstName,
            middleName,
            lastName,
            email,
            phone,
            gender,
            dateOfBirth || null,
            state,
            city,
            qualification,
            specialization,
            experience,
            JSON.stringify(
              finalSubjects
            ),
            JSON.stringify(
              finalClasses
            ),
            bio,
          ]
        );

      return res.status(201).json({
        success: true,
        message:
          "Tutor application submitted successfully.",
        tutor:
          result.rows[0],
        reference,
        classes:
          finalClasses,
        subjects:
          finalSubjects,
      });
    } catch (error) {
      console.error(
        "Tutor application error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to submit tutor application.",
        error:
          process.env.NODE_ENV ===
          "development"
            ? error.message
            : undefined,
      });
    }
  }
);

/* =========================================================
   TUTOR LOGIN
   NO ASSIGNMENTS REQUIRED
========================================================= */

router.post(
  "/tutor-login",
  async (
    req,
    res
  ) => {
    try {
      const name =
        clean(
          req.body?.name
        );

      const reference =
        clean(
          req.body?.referenceId ||
          req.body?.reference ||
          req.body?.tutorReference ||
          req.body?.tutor_reference
        );

      if (
        !name ||
        !reference
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Name and tutor reference are required.",
        });
      }

      const result =
        await pool.query(
          `
            SELECT *
            FROM academy_tutor_applications
            WHERE
              LOWER(TRIM(reference)) =
              LOWER(TRIM($1))
            LIMIT 1
          `,
          [reference]
        );

      if (
        !result.rows.length
      ) {
        return res.status(401).json({
          success: false,
          message:
            "Invalid tutor name or reference.",
        });
      }

      const tutor =
        result.rows[0];

      const tutorFullName =
        [
          tutor.first_name,
          tutor.middle_name,
          tutor.last_name,
        ]
          .map(clean)
          .filter(Boolean)
          .join(" ");

      const suppliedName =
        name
          .toLowerCase()
          .replace(/\s+/g, " ")
          .trim();

      const storedName =
        tutorFullName
          .toLowerCase()
          .replace(/\s+/g, " ")
          .trim();

      const firstLastName =
        [
          tutor.first_name,
          tutor.last_name,
        ]
          .map(clean)
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .replace(/\s+/g, " ")
          .trim();

      if (
        suppliedName !==
          storedName &&
        suppliedName !==
          firstLastName
      ) {
        return res.status(401).json({
          success: false,
          message:
            "Invalid tutor name or reference.",
        });
      }

      if (
        normalizeStatus(
          tutor.application_status
        ) !== "verified"
      ) {
        return res.status(403).json({
          success: false,
          code:
            "TUTOR_NOT_VERIFIED",
          message:
            "Your tutor account has not been verified yet.",
          applicationStatus:
            tutor.application_status,
        });
      }

      const classes =
        arrayFromValue(
          tutor.classes
        );

      const subjects =
        arrayFromValue(
          tutor.subjects
        );

      if (!classes.length) {
        return res.status(409).json({
          success: false,
          code:
            "NO_TUTOR_CLASSES",
          message:
            "Your tutor account has no registered classes.",
        });
      }

      if (!subjects.length) {
        return res.status(409).json({
          success: false,
          code:
            "NO_TUTOR_SUBJECTS",
          message:
            "Your tutor account has no registered subjects.",
        });
      }

      const token =
        crypto
          .randomBytes(32)
          .toString("hex");

      const tutorData = {
        reference:
          tutor.reference,

        tutorReference:
          tutor.reference,

        tutor_reference:
          tutor.reference,

        firstName:
          tutor.first_name,

        middleName:
          tutor.middle_name,

        lastName:
          tutor.last_name,

        fullName:
          tutorFullName,

        email:
          tutor.email,

        phone:
          tutor.phone || null,

        school:
          tutor.school || null,

        teachingLevel:
          tutor.teaching_level || null,

        qualification:
          tutor.qualification || null,

        specialization:
          tutor.specialization || null,

        experience:
          tutor.experience || null,

        classes,

        subjects,

        applicationStatus:
          tutor.application_status,

        accountStatus:
          tutor.account_status || null,

        emailVerified:
          Boolean(
            tutor.email_verified
          ),
      };

      return res.json({
        success: true,

        message:
          "Tutor login successful.",

        reference:
          tutor.reference,

        tutorReference:
          tutor.reference,

        token,

        tutor:
          tutorData,

        classes,

        subjects,

        /*
         * Kept only as an empty compatibility
         * value for any old frontend code.
         *
         * It is NOT used for authorization.
         */
        assignments: [],

        hasAssignments: false,

        assignmentCount: 0,
      });
    } catch (error) {
      console.error(
        "Tutor login error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Tutor login failed.",
        error:
          process.env.NODE_ENV ===
          "development"
            ? error.message
            : undefined,
      });
    }
  }
);

/* =========================================================
   TUTOR ASSIGNMENTS
   LEGACY COMPATIBILITY ONLY
   NO ASSIGNMENT LOGIC
========================================================= */

router.get(
  "/tutor/assignments",
  async (
    req,
    res
  ) => {
    try {
      const reference =
        clean(
          req.query?.reference ||
          req.headers[
            "x-tutor-reference"
          ]
        );

      if (!reference) {
        return res.status(400).json({
          success: false,
          message:
            "Tutor reference is required.",
        });
      }

      const result =
        await pool.query(
          `
            SELECT
              reference,
              first_name,
              middle_name,
              last_name,
              subjects,
              classes,
              application_status
            FROM academy_tutor_applications
            WHERE
              LOWER(TRIM(reference)) =
              LOWER(TRIM($1))
            LIMIT 1
          `,
          [reference]
        );

      if (
        !result.rows.length
      ) {
        return res.status(404).json({
          success: false,
          message:
            "Tutor not found.",
        });
      }

      const tutor =
        result.rows[0];

      if (
        normalizeStatus(
          tutor.application_status
        ) !== "verified"
      ) {
        return res.status(403).json({
          success: false,
          message:
            "Tutor account has not been verified.",
        });
      }

      const classes =
        arrayFromValue(
          tutor.classes
        );

      const subjects =
        arrayFromValue(
          tutor.subjects
        );

      return res.json({
        success: true,

        reference:
          tutor.reference,

        assignments: [],

        assignedAssignments: [],

        classes,

        subjects,

        hasAssignments: false,

        assignmentCount: 0,

        tutor: {
          reference:
            tutor.reference,

          applicationStatus:
            tutor.application_status,

          assignments: [],

          classes,

          subjects,
        },

        generatedAt:
          new Date().toISOString(),
      });
    } catch (error) {
      console.error(
        "Tutor assignments error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to load tutor classes and subjects.",
      });
    }
  }
);

/* =========================================================
   TUTOR CLASSES
========================================================= */

router.get(
  "/tutor/classes",
  async (
    req,
    res
  ) => {
    try {
      const reference =
        clean(
          req.query?.reference ||
          req.headers[
            "x-tutor-reference"
          ]
        );

      if (!reference) {
        return res.status(400).json({
          success: false,
          code:
            "TUTOR_REFERENCE_REQUIRED",
          message:
            "Tutor reference is required.",
        });
      }

      const tutorResult =
        await pool.query(
          `
            SELECT
              reference,
              first_name,
              middle_name,
              last_name,
              email,
              phone,
              school,
              subjects,
              classes,
              application_status,
              account_status
            FROM academy_tutor_applications
            WHERE
              LOWER(TRIM(reference)) =
              LOWER(TRIM($1))
            LIMIT 1
          `,
          [reference]
        );

      if (
        !tutorResult.rows.length
      ) {
        return res.status(404).json({
          success: false,
          message:
            "Tutor not found.",
        });
      }

      const tutor =
        tutorResult.rows[0];

      if (
        normalizeStatus(
          tutor.application_status
        ) !== "verified"
      ) {
        return res.status(403).json({
          success: false,
          message:
            "Tutor account has not been verified.",
        });
      }

      const tutorClasses =
        arrayFromValue(
          tutor.classes
        );

      const tutorSubjects =
        arrayFromValue(
          tutor.subjects
        );

      const enrollmentResult =
        await pool.query(
          `
            SELECT *
            FROM academy_student_enrollments
            ORDER BY created_at DESC
          `
        );

      const activityResult =
        await pool.query(
          `
            SELECT *
            FROM class_activities
            WHERE
              LOWER(TRIM(tutor_reference)) =
              LOWER(TRIM($1))
            ORDER BY created_at DESC
          `,
          [tutor.reference]
        );

      const students =
        enrollmentResult.rows;

      const activities =
        activityResult.rows;

      /*
       * Return one card for every class
       * registered to the tutor.
       *
       * Subjects remain separate so the
       * frontend can require a class and
       * subject when creating a task.
       */
      const classCards =
        tutorClasses.map(
          (grade) => {
            const matchingStudents =
              students.filter(
                (student) => {
                  const studentGrade =
                    clean(
                      student.grade ||
                      student.class ||
                      student.level
                    );

                  return (
                    normalizeClass(
                      studentGrade
                    ) ===
                    normalizeClass(
                      grade
                    )
                  );
                }
              );

            const classActivities =
              activities.filter(
                (activity) =>
                  normalizeClass(
                    activity.grade
                  ) ===
                  normalizeClass(
                    grade
                  )
              );

            return {
              id:
                grade
                  .toLowerCase()
                  .replace(
                    /[^a-z0-9]+/g,
                    "-"
                  ),

              class:
                grade,

              grade,

              subjects:
                tutorSubjects,

              students:
                matchingStudents,

              studentCount:
                matchingStudents.length,

              verifiedCount:
                matchingStudents.filter(
                  (student) =>
                    normalizeStatus(
                      student.status ||
                      student.application_status ||
                      student.verification_status
                    ) ===
                    "verified"
                ).length,

              pendingCount:
                matchingStudents.filter(
                  (student) =>
                    normalizeStatus(
                      student.status ||
                      student.application_status ||
                      student.verification_status
                    ) !==
                    "verified"
                ).length,

              activities:
                classActivities,

              activityCount:
                classActivities.length,
            };
          }
        );

      return res.json({
        success: true,

        reference:
          tutor.reference,

        /*
         * These are the values the
         * TutorCreateTask page should use.
         */
        classes:
          tutorClasses,

        subjects:
          tutorSubjects,

        classCards,

        hasClasses:
          tutorClasses.length > 0,

        classCount:
          tutorClasses.length,

        subjectCount:
          tutorSubjects.length,

        /*
         * Legacy compatibility only.
         */
        assignments: [],

        hasAssignments: false,

        assignmentCount: 0,
      });
    } catch (error) {
      console.error(
        "Tutor classes error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to load tutor classes.",
        error:
          process.env.NODE_ENV ===
          "development"
            ? error.message
            : undefined,
      });
    }
  }
);

/* =========================================================
   TUTOR SINGLE CLASS / SUBJECT
========================================================= */

router.get(
  "/tutor/classes/:grade/:subject",
  async (
    req,
    res
  ) => {
    try {
      const reference =
        clean(
          req.query?.reference ||
          req.headers[
            "x-tutor-reference"
          ]
        );

      const grade =
        clean(
          req.params.grade
        );

      const subject =
        clean(
          req.params.subject
        );

      if (!reference) {
        return res.status(400).json({
          success: false,
          message:
            "Tutor reference is required.",
        });
      }

      if (!grade || !subject) {
        return res.status(400).json({
          success: false,
          message:
            "Class and subject are required.",
        });
      }

      const auth =
        await getVerifiedTutorForClassSubject(
          reference,
          grade,
          subject
        );

      if (auth.error) {
        return res.status(
          auth.error.status
        ).json({
          success: false,
          code:
            auth.error.code,
          message:
            auth.error.message,
        });
      }

      const studentResult =
        await pool.query(
          `
            SELECT *
            FROM academy_student_enrollments
            WHERE
              LOWER(TRIM(grade)) =
              LOWER(TRIM($1))
            ORDER BY created_at DESC
          `,
          [grade]
        );

      const students =
        studentResult.rows.filter(
          (student) => {
            const studentSubjects =
              arrayFromValue(
                student.subjects
              );

            return studentSubjects.some(
              (item) =>
                subjectsMatch(
                  item,
                  subject
                )
            );
          }
        );

      const activityResult =
        await pool.query(
          `
            SELECT *
            FROM class_activities
            WHERE
              LOWER(TRIM(grade)) =
              LOWER(TRIM($1))
              AND
              LOWER(TRIM(tutor_reference)) =
              LOWER(TRIM($2))
            ORDER BY created_at DESC
          `,
          [
            grade,
            reference,
          ]
        );

      const activities =
        activityResult.rows.filter(
          (activity) =>
            subjectsMatch(
              activity.subject,
              subject
            )
        );

      return res.json({
        success: true,

        class:
          grade,

        grade,

        subject,

        students,

        studentCount:
          students.length,

        activities,

        activityCount:
          activities.length,
      });
    } catch (error) {
      console.error(
        "Tutor class details error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to load class.",
      });
    }
  }
);

/* =========================================================
   CREATE TUTOR TASK
   PDF / DOC / DOCX / IMAGE / VIDEO
========================================================= */

router.post(
  "/tutor/class-activities",
  taskUpload.array(
    "files",
    10
  ),
  async (
    req,
    res
  ) => {
    const uploadedFiles =
      req.files || [];

    try {
      const reference =
        clean(
          req.body?.reference ||
          req.body?.tutor_reference ||
          req.body?.tutorReference ||
          req.headers[
            "x-tutor-reference"
          ]
        );

      const grade =
        clean(
          req.body?.grade ||
          req.body?.class ||
          req.body?.className
        );

      const subject =
        clean(
          req.body?.subject
        );

      const activityType =
        clean(
          req.body?.activityType ||
          req.body?.type ||
          "task"
        ).toLowerCase();

      const title =
        clean(
          req.body?.title
        );

      const description =
        clean(
          req.body?.description
        );

      const instructions =
        clean(
          req.body?.instructions
        );

      const dueDate =
        clean(
          req.body?.dueDate
        );

      const rawMaxScore =
        clean(
          req.body?.maxScore
        );

      const maxScore =
        rawMaxScore
          ? Number(
              rawMaxScore
            )
          : null;

      if (!reference) {
        return res.status(400).json({
          success: false,
          code:
            "TUTOR_REFERENCE_REQUIRED",
          message:
            "Tutor reference is required.",
        });
      }

      if (!grade) {
        return res.status(400).json({
          success: false,
          code:
            "CLASS_REQUIRED",
          message:
            "Class is required.",
        });
      }

      if (!subject) {
        return res.status(400).json({
          success: false,
          code:
            "SUBJECT_REQUIRED",
          message:
            "Subject is required.",
        });
      }

      if (!title) {
        return res.status(400).json({
          success: false,
          code:
            "TITLE_REQUIRED",
          message:
            "Task title is required.",
        });
      }

      if (
        activityType !== "task"
      ) {
        return res.status(400).json({
          success: false,
          code:
            "INVALID_ACTIVITY_TYPE",
          message:
            "This endpoint is only for tasks.",
        });
      }

      /*
       * THIS IS THE IMPORTANT AUTHORIZATION.
       *
       * The tutor must have:
       * 1. The selected class in tutor.classes
       * 2. The selected subject in tutor.subjects
       *
       * assignments is never checked.
       */
      const auth =
        await getVerifiedTutorForClassSubject(
          reference,
          grade,
          subject
        );

      if (auth.error) {
        return res.status(
          auth.error.status
        ).json({
          success: false,
          code:
            auth.error.code,
          message:
            auth.error.message,
        });
      }

      if (
        rawMaxScore &&
        (
          Number.isNaN(
            maxScore
          ) ||
          maxScore < 0
        )
      ) {
        return res.status(400).json({
          success: false,
          code:
            "INVALID_MAX_SCORE",
          message:
            "Max score must be a valid non-negative number.",
        });
      }

      /*
       * Normalize subject to the Academy's
       * canonical subject name for the selected
       * class.
       */
      const canonicalSubject =
        getMatchingCanonicalSubject(
          grade,
          subject
        ) || subject;

      const attachments =
        uploadedFiles.map(
          (file) => {
            let type =
              "document";

            if (
              file.mimetype.startsWith(
                "video/"
              )
            ) {
              type = "video";
            } else if (
              file.mimetype.startsWith(
                "image/"
              )
            ) {
              type = "image";
            } else if (
              file.mimetype ===
              "application/pdf"
            ) {
              type = "pdf";
            }

            return {
              id:
                crypto
                  .randomBytes(8)
                  .toString(
                    "hex"
                  ),

              originalName:
                file.originalname,

              filename:
                file.filename,

              mimeType:
                file.mimetype,

              type,

              size:
                file.size,

              url:
                `/uploads/tasks/${file.filename}`,

              path:
                `/uploads/tasks/${file.filename}`,
            };
          }
        );

      /*
       * IMPORTANT:
       *
       * There is no assignment object here.
       * There is no classSubjectAssignment.
       *
       * The class and subject are already
       * first-class columns on class_activities.
       */
      const metadata = {
        attachments,

        instructions:
          instructions ||
          null,

        dueDate:
          dueDate ||
          null,

        maxScore:
          maxScore !== null &&
          !Number.isNaN(
            maxScore
          )
            ? maxScore
            : null,
      };

      const result =
        await pool.query(
          `
            INSERT INTO class_activities (
              tutor_reference,
              grade,
              subject,
              activity_type,
              title,
              description,
              metadata,
              created_at,
              updated_at
            )
            VALUES (
              $1,
              $2,
              $3,
              'task',
              $4,
              $5,
              $6::jsonb,
              NOW(),
              NOW()
            )
            RETURNING *
          `,
          [
            reference,
            grade,
            canonicalSubject,
            title,
            description || null,
            JSON.stringify(
              metadata
            ),
          ]
        );

      return res.status(201).json({
        success: true,

        message:
          "Task created successfully.",

        activity:
          result.rows[0],

        class:
          grade,

        grade,

        subject:
          canonicalSubject,

        attachments,

        recipientRule: {
          class:
            grade,

          subject:
            canonicalSubject,

          message:
            "This task is available to students enrolled in this class and subject.",
        },
      });
    } catch (error) {
      console.error(
        "Create class activity error:",
        error
      );

      /*
       * Delete uploaded files if the
       * database insert failed.
       */
      for (
        const file of uploadedFiles
      ) {
        try {
          if (
            file?.path &&
            fs.existsSync(
              file.path
            )
          ) {
            fs.unlinkSync(
              file.path
            );
          }
        } catch (
          cleanupError
        ) {
          console.error(
            "Upload cleanup error:",
            cleanupError
          );
        }
      }

      const message =
        clean(
          error?.message
        );

      if (
        message.includes(
          "Only PDF"
        )
      ) {
        return res.status(400).json({
          success: false,
          code:
            "INVALID_FILE_TYPE",
          message:
            "Only PDF, DOC, DOCX, images, MP4, WebM and MOV files are allowed.",
        });
      }

      if (
        error?.code ===
        "LIMIT_FILE_SIZE"
      ) {
        return res.status(400).json({
          success: false,
          code:
            "FILE_TOO_LARGE",
          message:
            "Each uploaded file must be 250MB or less.",
        });
      }

      if (
        error?.code ===
        "LIMIT_FILE_COUNT"
      ) {
        return res.status(400).json({
          success: false,
          code:
            "TOO_MANY_FILES",
          message:
            "You can upload a maximum of 10 files.",
        });
      }

      console.error(
        "Database/task creation error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to create task.",
        error:
          process.env.NODE_ENV ===
          "development"
            ? message
            : undefined,
      });
    }
  }
);

/* =========================================================
   START LIVE CLASS
========================================================= */

router.post(
  "/tutor/class-activities/live/start",
  async (
    req,
    res
  ) => {
    try {
      const reference =
        clean(
          req.body?.reference ||
          req.headers[
            "x-tutor-reference"
          ]
        );

      const grade =
        clean(
          req.body?.grade ||
          req.body?.class
        );

      const subject =
        clean(
          req.body?.subject
        );

      const title =
        clean(
          req.body?.title
        ) ||
        "Live Class";

      const description =
        clean(
          req.body?.description
        );

      if (
        !reference ||
        !grade ||
        !subject
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Tutor reference, class and subject are required.",
        });
      }

      const auth =
        await getVerifiedTutorForClassSubject(
          reference,
          grade,
          subject
        );

      if (auth.error) {
        return res.status(
          auth.error.status
        ).json({
          success: false,
          code:
            auth.error.code,
          message:
            auth.error.message,
        });
      }

      const canonicalSubject =
        getMatchingCanonicalSubject(
          grade,
          subject
        ) || subject;

      const result =
        await pool.query(
          `
            INSERT INTO class_activities (
              tutor_reference,
              grade,
              subject,
              activity_type,
              title,
              description,
              metadata,
              created_at,
              updated_at
            )
            VALUES (
              $1,
              $2,
              $3,
              'live',
              $4,
              $5,
              $6::jsonb,
              NOW(),
              NOW()
            )
            RETURNING *
          `,
          [
            reference,
            grade,
            canonicalSubject,
            title,
            description || null,
            JSON.stringify({
              live: true,
              status: "live",
              startedAt:
                new Date().toISOString(),
            }),
          ]
        );

      return res.status(201).json({
        success: true,
        message:
          "Live class started.",
        activity:
          result.rows[0],
      });
    } catch (error) {
      console.error(
        "Start live class error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to start live class.",
      });
    }
  }
);

/* =========================================================
   END LIVE CLASS
========================================================= */

router.patch(
  "/tutor/class-activities/:id/live/end",
  async (
    req,
    res
  ) => {
    try {
      const reference =
        clean(
          req.body?.reference ||
          req.headers[
            "x-tutor-reference"
          ]
        );

      const activityId =
        req.params.id;

      if (!reference) {
        return res.status(400).json({
          success: false,
          message:
            "Tutor reference is required.",
        });
      }

      const existing =
        await pool.query(
          `
            SELECT *
            FROM class_activities
            WHERE
              id = $1
              AND
              LOWER(TRIM(tutor_reference)) =
              LOWER(TRIM($2))
            LIMIT 1
          `,
          [
            activityId,
            reference,
          ]
        );

      if (
        !existing.rows.length
      ) {
        return res.status(404).json({
          success: false,
          message:
            "Live activity not found.",
        });
      }

      const activity =
        existing.rows[0];

      let metadata =
        activity.metadata;

      if (
        typeof metadata ===
        "string"
      ) {
        try {
          metadata =
            JSON.parse(
              metadata
            );
        } catch {
          metadata = {};
        }
      }

      metadata = {
        ...(metadata || {}),
        status: "ended",
        endedAt:
          new Date().toISOString(),
      };

      const result =
        await pool.query(
          `
            UPDATE class_activities
            SET
              metadata = $1::jsonb,
              updated_at = NOW()
            WHERE
              id = $2
              AND
              LOWER(TRIM(tutor_reference)) =
              LOWER(TRIM($3))
            RETURNING *
          `,
          [
            JSON.stringify(
              metadata
            ),
            activityId,
            reference,
          ]
        );

      return res.json({
        success: true,
        message:
          "Live class ended.",
        activity:
          result.rows[0],
      });
    } catch (error) {
      console.error(
        "End live class error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to end live class.",
      });
    }
  }
);

/* =========================================================
   TUTOR CLASS ACTIVITIES
========================================================= */

router.get(
  "/tutor/class-activities",
  async (
    req,
    res
  ) => {
    try {
      const reference =
        clean(
          req.query?.reference ||
          req.headers[
            "x-tutor-reference"
          ]
        );

      if (!reference) {
        return res.status(400).json({
          success: false,
          message:
            "Tutor reference is required.",
        });
      }

      const result =
        await pool.query(
          `
            SELECT *
            FROM class_activities
            WHERE
              LOWER(TRIM(tutor_reference)) =
              LOWER(TRIM($1))
            ORDER BY created_at DESC
          `,
          [reference]
        );

      return res.json({
        success: true,
        activities:
          result.rows,
      });
    } catch (error) {
      console.error(
        "Tutor activities error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to load tutor activities.",
      });
    }
  }
);

/* =========================================================
   STUDENT CLASS ACTIVITIES
========================================================= */

router.get(
  "/student/class-activities",
  async (
    req,
    res
  ) => {
    try {
      const enrollmentId =
        clean(
          req.query?.enrollmentId ||
          req.query?.enrollment_id
        );

      if (!enrollmentId) {
        return res.status(400).json({
          success: false,
          message:
            "Enrollment ID is required.",
        });
      }

      const studentResult =
        await pool.query(
          `
            SELECT *
            FROM academy_student_enrollments
            WHERE
              id = $1
            LIMIT 1
          `,
          [enrollmentId]
        );

      if (
        !studentResult.rows.length
      ) {
        return res.status(404).json({
          success: false,
          message:
            "Student enrollment not found.",
        });
      }

      const student =
        studentResult.rows[0];

      const studentGrade =
        clean(
          student.grade ||
          student.class ||
          student.level
        );

      const studentSubjects =
        arrayFromValue(
          student.subjects
        );

      if (!studentGrade) {
        return res.json({
          success: true,
          activities: [],
          tasks: [],
        });
      }

      const activityResult =
        await pool.query(
          `
            SELECT *
            FROM class_activities
            WHERE
              LOWER(TRIM(grade)) =
              LOWER(TRIM($1))
            ORDER BY created_at DESC
          `,
          [studentGrade]
        );

      const activities =
        activityResult.rows.filter(
          (activity) => {
            if (
              normalizeClass(
                activity.grade
              ) !==
              normalizeClass(
                studentGrade
              )
            ) {
              return false;
            }

            return studentSubjects.some(
              (
                studentSubject
              ) =>
                subjectsMatch(
                  studentSubject,
                  activity.subject
                )
            );
          }
        );

      const tasks =
        activities.filter(
          (activity) =>
            clean(
              activity.activity_type
            ).toLowerCase() ===
            "task"
        );

      return res.json({
        success: true,

        enrollmentId,

        grade:
          studentGrade,

        subjects:
          studentSubjects,

        activities,

        tasks,

        activityCount:
          activities.length,

        taskCount:
          tasks.length,
      });
    } catch (error) {
      console.error(
        "Student class activities error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to load student class activities.",
      });
    }
  }
);

/* =========================================================
   STUDENT BY USER ID
========================================================= */

router.get(
  "/student/:userId",
  async (
    req,
    res
  ) => {
    try {
      const userId =
        clean(
          req.params.userId
        );

      if (!userId) {
        return res.status(400).json({
          success: false,
          message:
            "User ID is required.",
        });
      }

      const result =
        await pool.query(
          `
            SELECT *
            FROM academy_student_enrollments
            WHERE
              user_id = $1
              OR
              student_id = $1
            ORDER BY created_at DESC
          `,
          [userId]
        );

      return res.json({
        success: true,
        students:
          result.rows,
      });
    } catch (error) {
      console.error(
        "Student lookup error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to load student.",
      });
    }
  }
);

/* =========================================================
   STUDENT ENROLLMENT
========================================================= */

router.post(
  "/student-enrollment",
  async (
    req,
    res
  ) => {
    try {
      const body =
        req.body || {};

      const firstName =
        clean(
          body.firstName
        );

      const middleName =
        clean(
          body.middleName
        );

      const lastName =
        clean(
          body.lastName
        );

      const email =
        normalizeEmail(
          body.email
        );

      const phone =
        clean(
          body.phone
        );

      const grade =
        clean(
          body.grade ||
          body.class ||
          body.level
        );

      const subjects =
        arrayFromValue(
          body.subjects
        );

      const state =
        clean(
          body.state
        );

      const city =
        clean(
          body.city
        );

      if (
        !firstName ||
        !lastName
      ) {
        return res.status(400).json({
          success: false,
          message:
            "First name and last name are required.",
        });
      }

      if (!grade) {
        return res.status(400).json({
          success: false,
          message:
            "Class is required.",
        });
      }

      if (
        !isValidTutorClass(
          grade
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid class selected.",
        });
      }

      if (!subjects.length) {
        return res.status(400).json({
          success: false,
          message:
            "At least one subject is required.",
        });
      }

      const invalidSubjects =
        subjects.filter(
          (subject) =>
            !isValidTutorSubject(
              grade,
              subject
            )
        );

      if (
        invalidSubjects.length
      ) {
        return res.status(400).json({
          success: false,
          message:
            "One or more selected subjects are not available for this class.",
          invalidSubjects,
        });
      }

      const finalSubjects =
        subjects.map(
          (subject) =>
            getMatchingCanonicalSubject(
              grade,
              subject
            ) || subject
        );

      const result =
        await pool.query(
          `
            INSERT INTO academy_student_enrollments (
              first_name,
              middle_name,
              last_name,
              email,
              phone,
              grade,
              subjects,
              state,
              city,
              status,
              created_at,
              updated_at
            )
            VALUES (
              $1,
              $2,
              $3,
              $4,
              $5,
              $6,
              $7::jsonb,
              $8,
              $9,
              'pending',
              NOW(),
              NOW()
            )
            RETURNING *
          `,
          [
            firstName,
            middleName,
            lastName,
            email,
            phone,
            grade,
            JSON.stringify(
              uniqueArray(
                finalSubjects
              )
            ),
            state,
            city,
          ]
        );

      return res.status(201).json({
        success: true,
        message:
          "Student enrollment submitted successfully.",
        student:
          result.rows[0],
      });
    } catch (error) {
      console.error(
        "Student enrollment error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to submit student enrollment.",
        error:
          process.env.NODE_ENV ===
          "development"
            ? error.message
            : undefined,
      });
    }
  }
);

/* =========================================================
   ACCEPTANCE FEE
========================================================= */

router.post(
  "/acceptance-fee",
  async (
    req,
    res
  ) => {
    try {
      const enrollmentId =
        clean(
          req.body?.enrollmentId ||
          req.body?.enrollment_id
        );

      const amount =
        Number(
          req.body?.amount
        );

      const paymentReference =
        clean(
          req.body?.paymentReference ||
          req.body?.payment_reference ||
          req.body?.reference
        );

      if (!enrollmentId) {
        return res.status(400).json({
          success: false,
          message:
            "Enrollment ID is required.",
        });
      }

      if (
        !Number.isFinite(
          amount
        ) ||
        amount <= 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            "A valid payment amount is required.",
        });
      }

      const result =
        await pool.query(
          `
            UPDATE academy_student_enrollments
            SET
              acceptance_fee_paid = TRUE,
              acceptance_fee_amount = $1,
              acceptance_fee_reference = $2,
              updated_at = NOW()
            WHERE id = $3
            RETURNING *
          `,
          [
            amount,
            paymentReference,
            enrollmentId,
          ]
        );

      if (
        !result.rows.length
      ) {
        return res.status(404).json({
          success: false,
          message:
            "Enrollment not found.",
        });
      }

      return res.json({
        success: true,
        message:
          "Acceptance fee recorded successfully.",
        enrollment:
          result.rows[0],
      });
    } catch (error) {
      console.error(
        "Acceptance fee error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to record acceptance fee.",
      });
    }
  }
);

/* =========================================================
   ADMIN VERIFY ALL STATUSES
========================================================= */

router.post(
  "/admin/verify-all-statuses",
  async (
    _req,
    res
  ) => {
    try {
      const tutorResult =
        await pool.query(
          `
            UPDATE academy_tutor_applications
            SET
              application_status = 'verified',
              account_status = 'active',
              updated_at = NOW()
            WHERE
              LOWER(TRIM(COALESCE(application_status, ''))) != 'verified'
          `
        );

      return res.json({
        success: true,
        message:
          "Tutor verification statuses updated.",
        tutorsUpdated:
          tutorResult.rowCount,
      });
    } catch (error) {
      console.error(
        "Verify all statuses error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to verify tutor statuses.",
      });
    }
  }
);

/* =========================================================
   ADMIN ENROLLMENT STATUS
========================================================= */

router.patch(
  "/admin/enrollment/:enrollmentId/status",
  async (
    req,
    res
  ) => {
    try {
      const enrollmentId =
        clean(
          req.params.enrollmentId
        );

      const status =
        clean(
          req.body?.status
        ).toLowerCase();

      if (!enrollmentId) {
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

      const result =
        await pool.query(
          `
            UPDATE academy_student_enrollments
            SET
              status = $1,
              updated_at = NOW()
            WHERE
              id = $2
            RETURNING *
          `,
          [
            status,
            enrollmentId,
          ]
        );

      if (
        !result.rows.length
      ) {
        return res.status(404).json({
          success: false,
          message:
            "Enrollment not found.",
        });
      }

      return res.json({
        success: true,
        message:
          "Enrollment status updated.",
        enrollment:
          result.rows[0],
      });
    } catch (error) {
      console.error(
        "Enrollment status error:",
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

/* =========================================================
   ADMIN TUTOR STATUS
========================================================= */

router.patch(
  "/admin/tutor/:reference/status",
  async (
    req,
    res
  ) => {
    try {
      const reference =
        clean(
          req.params.reference
        );

      const status =
        clean(
          req.body?.status ||
          req.body?.applicationStatus
        ).toLowerCase();

      if (!reference) {
        return res.status(400).json({
          success: false,
          message:
            "Tutor reference is required.",
        });
      }

      if (!status) {
        return res.status(400).json({
          success: false,
          message:
            "Status is required.",
        });
      }

      const accountStatus =
        status === "verified"
          ? "active"
          : status;

      const result =
        await pool.query(
          `
            UPDATE academy_tutor_applications
            SET
              application_status = $1,
              account_status = $2,
              updated_at = NOW()
            WHERE
              LOWER(TRIM(reference)) =
              LOWER(TRIM($3))
            RETURNING *
          `,
          [
            status,
            accountStatus,
            reference,
          ]
        );

      if (
        !result.rows.length
      ) {
        return res.status(404).json({
          success: false,
          message:
            "Tutor not found.",
        });
      }

      return res.json({
        success: true,
        message:
          "Tutor status updated.",
        tutor:
          result.rows[0],
      });
    } catch (error) {
      console.error(
        "Tutor status error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to update tutor status.",
      });
    }
  }
);

/* =========================================================
   ADMIN TUTOR LOOKUP
========================================================= */

router.get(
  "/admin/tutor/:reference",
  async (
    req,
    res
  ) => {
    try {
      const reference =
        clean(
          req.params.reference
        );

      if (!reference) {
        return res.status(400).json({
          success: false,
          message:
            "Tutor reference is required.",
        });
      }

      const result =
        await pool.query(
          `
            SELECT *
            FROM academy_tutor_applications
            WHERE
              LOWER(TRIM(reference)) =
              LOWER(TRIM($1))
            LIMIT 1
          `,
          [reference]
        );

      if (
        !result.rows.length
      ) {
        return res.status(404).json({
          success: false,
          message:
            "Tutor not found.",
        });
      }

      const tutor =
        result.rows[0];

      return res.json({
        success: true,

        tutor: {
          ...tutor,

          resolvedClasses:
            arrayFromValue(
              tutor.classes
            ),

          resolvedSubjects:
            arrayFromValue(
              tutor.subjects
            ),

          /*
           * Compatibility only.
           */
          assignments: [],
        },
      });
    } catch (error) {
      console.error(
        "Admin tutor lookup error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to load tutor.",
      });
    }
  }
);

/* =========================================================
   ADMIN STUDENT PASSWORD
========================================================= */

router.patch(
  "/admin/student-password",
  async (
    req,
    res
  ) => {
    try {
      const enrollmentId =
        clean(
          req.body?.enrollmentId ||
          req.body?.enrollment_id
        );

      const password =
        clean(
          req.body?.password
        );

      if (!enrollmentId) {
        return res.status(400).json({
          success: false,
          message:
            "Enrollment ID is required.",
        });
      }

      if (!password) {
        return res.status(400).json({
          success: false,
          message:
            "Password is required.",
        });
      }

      const result =
        await pool.query(
          `
            UPDATE academy_student_enrollments
            SET
              password = $1,
              updated_at = NOW()
            WHERE id = $2
            RETURNING id
          `,
          [
            password,
            enrollmentId,
          ]
        );

      if (
        !result.rows.length
      ) {
        return res.status(404).json({
          success: false,
          message:
            "Student enrollment not found.",
        });
      }

      return res.json({
        success: true,
        message:
          "Student password updated successfully.",
      });
    } catch (error) {
      console.error(
        "Student password error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to update student password.",
      });
    }
  }
);

/* =========================================================
   ADMIN TUTOR PASSWORD
========================================================= */

router.patch(
  "/admin/tutor-password",
  async (
    req,
    res
  ) => {
    try {
      const reference =
        clean(
          req.body?.reference ||
          req.body?.tutorReference
        );

      const password =
        clean(
          req.body?.password
        );

      if (!reference) {
        return res.status(400).json({
          success: false,
          message:
            "Tutor reference is required.",
        });
      }

      if (!password) {
        return res.status(400).json({
          success: false,
          message:
            "Password is required.",
        });
      }

      const result =
        await pool.query(
          `
            UPDATE academy_tutor_applications
            SET
              password = $1,
              updated_at = NOW()
            WHERE
              LOWER(TRIM(reference)) =
              LOWER(TRIM($2))
            RETURNING reference
          `,
          [
            password,
            reference,
          ]
        );

      if (
        !result.rows.length
      ) {
        return res.status(404).json({
          success: false,
          message:
            "Tutor not found.",
        });
      }

      return res.json({
        success: true,
        message:
          "Tutor password updated successfully.",
      });
    } catch (error) {
      console.error(
        "Tutor password error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to update tutor password.",
      });
    }
  }
);

/* =========================================================
   STUDENT LOGIN
========================================================= */

router.post(
  "/student-login",
  async (
    req,
    res
  ) => {
    try {
      const email =
        normalizeEmail(
          req.body?.email
        );

      const password =
        clean(
          req.body?.password
        );

      if (
        !email ||
        !password
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Email and password are required.",
        });
      }

      const result =
        await pool.query(
          `
            SELECT *
            FROM academy_student_enrollments
            WHERE
              LOWER(TRIM(email)) =
              LOWER(TRIM($1))
            LIMIT 1
          `,
          [email]
        );

      if (
        !result.rows.length
      ) {
        return res.status(401).json({
          success: false,
          message:
            "Invalid student email or password.",
        });
      }

      const student =
        result.rows[0];

      if (
        clean(
          student.password
        ) !== password
      ) {
        return res.status(401).json({
          success: false,
          message:
            "Invalid student email or password.",
        });
      }

      return res.json({
        success: true,

        message:
          "Student login successful.",

        student: {
          ...student,

          subjects:
            arrayFromValue(
              student.subjects
            ),
        },
      });
    } catch (error) {
      console.error(
        "Student login error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Student login failed.",
      });
    }
  }
);

/* =========================================================
   MULTER ERROR HANDLER
========================================================= */

router.use(
  (
    error,
    _req,
    res,
    next
  ) => {
    if (
      error instanceof
      multer.MulterError
    ) {
      if (
        error.code ===
        "LIMIT_FILE_SIZE"
      ) {
        return res.status(400).json({
          success: false,
          code:
            "FILE_TOO_LARGE",
          message:
            "Each file must be 250MB or less.",
        });
      }

      if (
        error.code ===
        "LIMIT_FILE_COUNT"
      ) {
        return res.status(400).json({
          success: false,
          code:
            "TOO_MANY_FILES",
          message:
            "A maximum of 10 files can be uploaded.",
        });
      }

      return res.status(400).json({
        success: false,
        code:
          error.code,
        message:
          error.message,
      });
    }

    if (
      error?.message?.includes(
        "Only PDF"
      )
    ) {
      return res.status(400).json({
        success: false,
        code:
          "INVALID_FILE_TYPE",
        message:
          "Only PDF, DOC, DOCX, images, MP4, WebM and MOV files are allowed.",
      });
    }

    next(error);
  }
);

export default router;