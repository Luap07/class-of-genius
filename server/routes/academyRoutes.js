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

const JSS_GRADES = [
  "JSS 1",
  "JSS 2",
  "JSS 3",
];

const SS_GRADES = [
  "SS 1",
  "SS 2",
  "SS 3",
];

const ALL_TUTOR_CLASSES = [
  ...PRIMARY_GRADES,
  ...JSS_GRADES,
  ...SS_GRADES,
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

const ALL_SUBJECTS = [
  ...new Set([
    ...PRIMARY_SUBJECTS,
    ...JSS_SUBJECTS,
    ...SS_SUBJECTS,
  ]),
];

const subjectsByClass = {
  ...Object.fromEntries(
    PRIMARY_GRADES.map((grade) => [
      grade,
      PRIMARY_SUBJECTS,
    ])
  ),

  ...Object.fromEntries(
    JSS_GRADES.map((grade) => [
      grade,
      JSS_SUBJECTS,
    ])
  ),

  ...Object.fromEntries(
    SS_GRADES.map((grade) => [
      grade,
      SS_SUBJECTS,
    ])
  ),
};

/* =========================================================
   HELPERS
========================================================= */

function clean(value) {
  if (value === undefined || value === null) {
    return "";
  }

  return String(value).trim();
}

function normalizeEmail(value) {
  return clean(value).toLowerCase();
}

function normalizeName(value) {
  return clean(value)
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeStatus(value) {
  return clean(value)
    .toLowerCase()
    .replace(/[\s_-]+/g, "");
}

function normalizeClass(value) {
  return clean(value)
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeSubject(value) {
  return clean(value)
    .toLowerCase()
    .replace(/[\s_-]+/g, " ")
    .trim();
}

function uniqueArray(values = []) {
  return [
    ...new Set(
      values
        .map((value) => clean(value))
        .filter(Boolean)
    ),
  ];
}

function arrayFromValue(value) {
  if (Array.isArray(value)) {
    return value;
  }

  if (
    value === undefined ||
    value === null ||
    value === ""
  ) {
    return [];
  }

  if (typeof value === "string") {
    const trimmed = value.trim();

    if (!trimmed) {
      return [];
    }

    try {
      const parsed = JSON.parse(trimmed);

      if (Array.isArray(parsed)) {
        return parsed;
      }
    } catch {
      // Continue as comma-separated text.
    }

    return trimmed
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [value];
}

function getClassSubjects(grade) {
  const normalized = normalizeClass(grade);

  const found = ALL_TUTOR_CLASSES.find(
    (item) =>
      normalizeClass(item) === normalized
  );

  if (!found) {
    return [];
  }

  return subjectsByClass[found] || [];
}

function isValidTutorClass(grade) {
  return ALL_TUTOR_CLASSES.some(
    (item) =>
      normalizeClass(item) ===
      normalizeClass(grade)
  );
}

function getCanonicalClass(grade) {
  return (
    ALL_TUTOR_CLASSES.find(
      (item) =>
        normalizeClass(item) ===
        normalizeClass(grade)
    ) || null
  );
}

/* =========================================================
   SUBJECT MATCHING
========================================================= */

const SUBJECT_ALIASES = {
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
    "use of english language",
  ],

  "physical and health education": [
    "physical and health education",
    "physical health education",
    "physical education",
    "health education",
    "phe",
    "p h e",
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
    "christian religion",
  ],

  "islamic religious studies": [
    "islamic religious studies",
    "islamic religious knowledge",
    "irs",
    "irk",
    "islamic religion",
  ],

  "agricultural science": [
    "agricultural science",
    "agriculture",
    "agric science",
    "agric",
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

function subjectsMatch(first, second) {
  const a = normalizeSubject(first);
  const b = normalizeSubject(second);

  if (!a || !b) {
    return false;
  }

  if (a === b) {
    return true;
  }

  for (const aliases of Object.values(
    SUBJECT_ALIASES
  )) {
    const normalizedAliases =
      aliases.map(normalizeSubject);

    if (
      normalizedAliases.includes(a) &&
      normalizedAliases.includes(b)
    ) {
      return true;
    }
  }

  return false;
}

function getMatchingCanonicalSubject(
  grade,
  subject
) {
  const allowedSubjects =
    getClassSubjects(grade);

  return (
    allowedSubjects.find((item) =>
      subjectsMatch(item, subject)
    ) || null
  );
}

/* =========================================================
   TUTOR DATA
========================================================= */

function getTutorReference(tutor) {
  return clean(
    tutor?.reference ||
      tutor?.application_reference ||
      tutor?.applicationReference ||
      tutor?.tutor_reference ||
      tutor?.tutorReference
  );
}

function getTutorName(tutor) {
  return clean(
    tutor?.name ||
      tutor?.full_name ||
      tutor?.fullName ||
      [
        tutor?.first_name,
        tutor?.middle_name,
        tutor?.last_name,
      ]
        .filter(Boolean)
        .join(" ")
  );
}

function getTutorClasses(tutor) {
  const values = [
    ...arrayFromValue(tutor?.classes),
    ...arrayFromValue(tutor?.tutor_classes),
    ...arrayFromValue(
      tutor?.tutorClasses
    ),
    ...arrayFromValue(
      tutor?.registered_classes
    ),
    ...arrayFromValue(
      tutor?.registeredClasses
    ),
  ];

  return uniqueArray(
    values.map((item) => {
      if (typeof item === "string") {
        return item;
      }

      if (
        item &&
        typeof item === "object"
      ) {
        return (
          item.grade ||
          item.class ||
          item.class_name ||
          item.className ||
          item.name ||
          ""
        );
      }

      return "";
    })
  );
}

function getTutorSubjects(tutor) {
  const values = [
    ...arrayFromValue(tutor?.subjects),
    ...arrayFromValue(
      tutor?.tutor_subjects
    ),
    ...arrayFromValue(
      tutor?.tutorSubjects
    ),
    ...arrayFromValue(
      tutor?.registered_subjects
    ),
    ...arrayFromValue(
      tutor?.registeredSubjects
    ),
  ];

  return uniqueArray(
    values.map((item) => {
      if (typeof item === "string") {
        return item;
      }

      if (
        item &&
        typeof item === "object"
      ) {
        return (
          item.subject ||
          item.subject_name ||
          item.subjectName ||
          item.name ||
          ""
        );
      }

      return "";
    })
  );
}

function tutorHasClass(
  tutor,
  grade
) {
  return getTutorClasses(tutor).some(
    (item) =>
      normalizeClass(item) ===
      normalizeClass(grade)
  );
}

function tutorHasSubject(
  tutor,
  subject
) {
  return getTutorSubjects(tutor).some(
    (item) =>
      subjectsMatch(item, subject)
  );
}

/* =========================================================
   DATABASE-SAFE TUTOR LOOKUP
========================================================= */

async function findTutorByReference(
  reference
) {
  const wanted =
    clean(reference);

  if (!wanted) {
    return null;
  }

  const result =
    await pool.query(
      `
        SELECT *
        FROM academy_tutor_applications
        ORDER BY created_at DESC
      `
    );

  const tutors =
    result.rows || [];

  return (
    tutors.find(
      (tutor) =>
        clean(
          tutor.reference
        ) === wanted ||
        clean(
          tutor.application_reference
        ) === wanted ||
        clean(
          tutor.tutor_reference
        ) === wanted
    ) || null
  );
}

/* =========================================================
   VERIFIED TUTOR LOOKUP
========================================================= */

async function getVerifiedTutorForClassSubject(
  reference,
  grade,
  subject
) {
  const tutorReference =
    clean(reference);

  if (!tutorReference) {
    return {
      error: {
        status: 400,
        code:
          "TUTOR_REFERENCE_REQUIRED",
        message:
          "Tutor reference is required.",
      },
    };
  }

  try {
    const tutor =
      await findTutorByReference(
        tutorReference
      );

    if (!tutor) {
      return {
        error: {
          status: 404,
          code:
            "TUTOR_NOT_FOUND",
          message:
            "Tutor application could not be found.",
        },
      };
    }

    const status =
      normalizeStatus(
        tutor.application_status ||
          tutor.status
      );

    if (status !== "verified") {
      return {
        error: {
          status: 403,
          code:
            "TUTOR_NOT_VERIFIED",
          message:
            "Your tutor account has not been verified yet.",
        },
      };
    }

    if (
      !tutorHasClass(
        tutor,
        grade
      )
    ) {
      return {
        error: {
          status: 403,
          code:
            "CLASS_NOT_REGISTERED",
          message:
            `You are not registered to teach ${grade}.`,
        },
      };
    }

    if (
      !tutorHasSubject(
        tutor,
        subject
      )
    ) {
      return {
        error: {
          status: 403,
          code:
            "SUBJECT_NOT_REGISTERED",
          message:
            `You are not registered to teach ${subject}.`,
        },
      };
    }

    return {
      tutor,
    };
  } catch (error) {
    console.error(
      "Tutor verification error:",
      error
    );

    return {
      error: {
        status: 500,
        code:
          error?.code ||
          "TUTOR_VERIFICATION_ERROR",
        message:
          error?.message ||
          "Unable to verify tutor.",
      },
    };
  }
}

/* =========================================================
   CLASS CARDS
========================================================= */

function createClassCards(
  tutor,
  studentsByClass = {}
) {
  const tutorClasses =
    getTutorClasses(tutor);

  return tutorClasses.map(
    (rawGrade) => {
      const grade =
        getCanonicalClass(
          rawGrade
        ) || rawGrade;

      const key =
        normalizeClass(
          grade
        );

      const students =
        studentsByClass[key] ||
        [];

      return {
        id: grade
          .toLowerCase()
          .replace(
            /[^a-z0-9]+/g,
            "-"
          ),

        grade,

        class: grade,

        className: grade,

        class_name: grade,

        subjects:
          getClassSubjects(
            grade
          ),

        subjectCount:
          getClassSubjects(
            grade
          ).length,

        students,

        studentCount:
          students.length,

        activities: [],

        activityCount: 0,
      };
    }
  );
}

/* =========================================================
   STUDENT SERIALIZATION
========================================================= */

function serializeStudent(
  original,
  fallbackGrade = "",
  fallbackSubject = ""
) {
  const studentGrade =
    clean(
      original?.grade ||
        original?.class ||
        original?.level ||
        original?.class_name ||
        original?.className ||
        fallbackGrade
    );

  return {
    ...original,

    enrollmentId:
      original?.id ??
      original?.enrollment_id ??
      null,

    enrollment_id:
      original?.enrollment_id ??
      original?.id ??
      null,

    firstName:
      original?.first_name ??
      original?.firstName ??
      "",

    middleName:
      original?.middle_name ??
      original?.middleName ??
      "",

    lastName:
      original?.last_name ??
      original?.lastName ??
      "",

    name:
      original?.name ||
      [
        original?.first_name,
        original?.middle_name,
        original?.last_name,
      ]
        .filter(Boolean)
        .join(" ") ||
      "",

    email:
      original?.email ??
      "",

    studentPhone:
      original?.student_phone ??
      original?.studentPhone ??
      original?.phone ??
      "",

    phone:
      original?.phone ??
      original?.studentPhone ??
      original?.student_phone ??
      "",

    grade:
      studentGrade,

    className:
      studentGrade,

    class_name:
      original?.class_name ??
      original?.className ??
      studentGrade,

    schoolLevel:
      original?.school_level ??
      original?.schoolLevel ??
      "",

    school_level:
      original?.school_level ??
      original?.schoolLevel ??
      "",

    academicSession:
      original?.academic_session ??
      original?.academicSession ??
      "",

    academic_session:
      original?.academic_session ??
      original?.academicSession ??
      "",

    matchedSubject:
      fallbackSubject ||
      original?.matchedSubject ||
      original?.matched_subject ||
      "",

    matched_subject:
      fallbackSubject ||
      original?.matched_subject ||
      original?.matchedSubject ||
      "",
  };
}

/* =========================================================
   UPLOAD CONFIGURATION
========================================================= */

const UPLOAD_DIR =
  path.resolve(
    process.cwd(),
    "uploads",
    "tasks"
  );

fs.mkdirSync(
  UPLOAD_DIR,
  {
    recursive: true,
  }
);

const ALLOWED_MIME_TYPES =
  new Set([
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
  ]);

const storage =
  multer.diskStorage({
    destination: (
      _req,
      _file,
      callback
    ) => {
      callback(
        null,
        UPLOAD_DIR
      );
    },

    filename: (
      _req,
      file,
      callback
    ) => {
      const extension =
        path.extname(
          file.originalname
        );

      const safeExtension =
        extension
          .replace(
            /[^a-zA-Z0-9.]/g,
            ""
          )
          .toLowerCase();

      const filename =
        `${Date.now()}-${crypto
          .randomBytes(8)
          .toString(
            "hex"
          )}${safeExtension}`;

      callback(
        null,
        filename
      );
    },
  });

const taskUpload =
  multer({
    storage,

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
      callback
    ) => {
      if (
        ALLOWED_MIME_TYPES.has(
          file.mimetype
        )
      ) {
        return callback(
          null,
          true
        );
      }

      const error =
        new Error(
          "Only PDF, DOC, DOCX, images, MP4, WebM and MOV files are allowed."
        );

      error.code =
        "INVALID_FILE_TYPE";

      callback(
        error,
        false
      );
    },
  });

/* =========================================================
   FILE SERIALIZATION
========================================================= */

function getAttachmentType(
  mimeType
) {
  if (
    mimeType.startsWith(
      "video/"
    )
  ) {
    return "video";
  }

  if (
    mimeType.startsWith(
      "image/"
    )
  ) {
    return "image";
  }

  if (
    mimeType ===
    "application/pdf"
  ) {
    return "pdf";
  }

  return "document";
}

function buildAttachments(
  files = []
) {
  return files.map(
    (file) => ({
      id: crypto
        .randomBytes(8)
        .toString("hex"),

      originalName:
        file.originalname,

      filename:
        file.filename,

      mimeType:
        file.mimetype,

      type:
        getAttachmentType(
          file.mimetype
        ),

      size:
        file.size,

      url:
        `/uploads/tasks/${file.filename}`,
    })
  );
}

function deleteUploadedFiles(
  files = []
) {
  for (
    const file of files
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
    } catch (error) {
      console.error(
        "Uploaded file cleanup error:",
        error
      );
    }
  }
}

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
        service:
          "academy",
        database:
          true,
      });
    } catch (error) {
      console.error(
        "Academy health error:",
        error
      );

      return res
        .status(500)
        .json({
          success: false,
          service:
            "academy",
          database:
            false,
          message:
            error?.message ||
            "Database unavailable.",
        });
    }
  }
);

/* =========================================================
   TUTOR APPLICATION
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
          body.firstName ||
            body.first_name
        );

      const middleName =
        clean(
          body.middleName ||
            body.middle_name
        );

      const lastName =
        clean(
          body.lastName ||
            body.last_name
        );

      const name =
        clean(
          body.name ||
            body.fullName ||
            body.full_name ||
            [
              firstName,
              middleName,
              lastName,
            ]
              .filter(Boolean)
              .join(" ")
        );

      const email =
        normalizeEmail(
          body.email
        );

      const phone =
        clean(
          body.phone ||
            body.phoneNumber ||
            body.phone_number
        );

      const location =
        clean(
          body.location
        );

      const classes =
        uniqueArray(
          arrayFromValue(
            body.classes ||
              body.class ||
              body.grades
          )
        );

      const subjects =
        uniqueArray(
          arrayFromValue(
            body.subjects ||
              body.subject
          )
        );

      if (!name) {
        return res
          .status(400)
          .json({
            success: false,
            message:
              "Full name is required.",
          });
      }

      /*
       * Email remains required for the APPLICATION
       * because it can be used for application
       * communication.
       *
       * It is NOT required for TUTOR LOGIN.
       */
      if (!email) {
        return res
          .status(400)
          .json({
            success: false,
            message:
              "Email address is required.",
          });
      }

      if (!phone) {
        return res
          .status(400)
          .json({
            success: false,
            message:
              "Phone number is required.",
          });
      }

      if (!classes.length) {
        return res
          .status(400)
          .json({
            success: false,
            message:
              "At least one class is required.",
          });
      }

      if (!subjects.length) {
        return res
          .status(400)
          .json({
            success: false,
            message:
              "At least one subject is required.",
          });
      }

      const invalidClass =
        classes.find(
          (item) =>
            !isValidTutorClass(
              item
            )
        );

      if (invalidClass) {
        return res
          .status(400)
          .json({
            success: false,
            message:
              `Invalid class: ${invalidClass}.`,
          });
      }

      const normalizedClasses =
        uniqueArray(
          classes.map(
            (item) =>
              getCanonicalClass(
                item
              )
          )
        );

      /*
       * Normalize subjects against each selected
       * class where possible.
       */
      const normalizedSubjects =
        uniqueArray(
          subjects
        );

      const reference =
        `TUT-${Date.now()}-${crypto
          .randomBytes(4)
          .toString(
            "hex"
          )
          .toUpperCase()}`;

      const applicationStatus =
        "pending";

      const result =
        await pool.query(
          `
            INSERT INTO academy_tutor_applications (
              reference,
              name,
              email,
              phone,
              location,
              classes,
              subjects,
              application_status,
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
              NOW(),
              NOW()
            )
            RETURNING *
          `,
          [
            reference,
            name,
            email,
            phone,
            location ||
              null,
            JSON.stringify(
              normalizedClasses
            ),
            JSON.stringify(
              normalizedSubjects
            ),
            applicationStatus,
          ]
        );

      return res
        .status(201)
        .json({
          success: true,

          message:
            "Tutor application submitted successfully. Your application is pending review.",

          applicationReference:
            reference,

          reference,

          applicationId:
            result.rows[0]?.id ||
            null,

          application:
            result.rows[0],
        });
    } catch (error) {
      console.error(
        "Tutor application error:",
        error
      );

      return res
        .status(500)
        .json({
          success: false,

          code:
            error?.code ||
            "TUTOR_APPLICATION_ERROR",

          message:
            error?.message ||
            "Unable to submit tutor application.",

          detail:
            error?.detail ||
            null,

          column:
            error?.column ||
            null,

          constraint:
            error?.constraint ||
            null,
        });
    }
  }
);

/* =========================================================
   TUTOR LOGIN
   ---------------------------------------------------------
   IMPORTANT:
   LOGIN = REGISTERED FULL NAME + REFERENCE ID
   NO EMAIL REQUIRED
========================================================= */

router.post(
  "/tutor-login",
  async (
    req,
    res
  ) => {
    try {
      const registeredFullName =
        clean(
          req.body?.registeredFullName ||
            req.body?.registered_full_name ||
            req.body?.fullName ||
            req.body?.full_name ||
            req.body?.name
        );

      const reference =
        clean(
          req.body?.reference ||
            req.body?.referenceId ||
            req.body?.reference_id ||
            req.body?.tutorReference ||
            req.body?.tutor_reference
        );

      /*
       * DO NOT ASK FOR EMAIL HERE.
       */

      if (!registeredFullName) {
        return res
          .status(400)
          .json({
            success: false,

            code:
              "REGISTERED_NAME_REQUIRED",

            message:
              "Registered Full Name is required.",
          });
      }

      if (!reference) {
        return res
          .status(400)
          .json({
            success: false,

            code:
              "REFERENCE_ID_REQUIRED",

            message:
              "Reference ID is required.",
          });
      }

      /*
       * Get the rows first rather than using columns
       * that may not exist in every version of the
       * Academy table.
       */
      const result =
        await pool.query(
          `
            SELECT *
            FROM academy_tutor_applications
            ORDER BY created_at DESC
          `
        );

      const tutors =
        result.rows || [];

      const normalizedLoginName =
        normalizeName(
          registeredFullName
        );

      const normalizedReference =
        clean(reference);

      const tutor =
        tutors.find(
          (item) => {
            const tutorReference =
              getTutorReference(
                item
              );

            const tutorName =
              getTutorName(
                item
              );

            return (
              tutorReference ===
                normalizedReference &&
              normalizeName(
                tutorName
              ) ===
                normalizedLoginName
            );
          }
        );

      if (!tutor) {
        return res
          .status(404)
          .json({
            success: false,

            code:
              "INVALID_TUTOR_LOGIN",

            message:
              "The Registered Full Name and Reference ID do not match any tutor application.",
          });
      }

      const status =
        normalizeStatus(
          tutor.application_status ||
            tutor.status
        );

      if (status !== "verified") {
        return res
          .status(403)
          .json({
            success: false,

            code:
              "TUTOR_NOT_VERIFIED",

            message:
              status ===
              "rejected"
                ? "Your tutor application was rejected."
                : "Your tutor application is still pending review.",

            status:
              tutor.application_status ||
              tutor.status ||
              "pending",

            reference:
              getTutorReference(
                tutor
              ),
          });
      }

      const tutorReference =
        getTutorReference(
          tutor
        );

      const tutorClasses =
        getTutorClasses(
          tutor
        );

      const tutorSubjects =
        getTutorSubjects(
          tutor
        );

      return res.json({
        success: true,

        message:
          "Tutor login successful.",

        reference:
          tutorReference,

        tutorReference,

        registeredFullName:
          getTutorName(
            tutor
          ),

        tutor: {
          ...tutor,

          reference:
            tutorReference,

          tutorReference,

          registeredFullName:
            getTutorName(
              tutor
            ),

          classes:
            tutorClasses,

          tutorClasses:
            tutorClasses,

          registeredClasses:
            tutorClasses,

          subjects:
            tutorSubjects,

          tutorSubjects:
            tutorSubjects,

          registeredSubjects:
            tutorSubjects,
        },

        user: {
          ...tutor,

          reference:
            tutorReference,

          name:
            getTutorName(
              tutor
            ),
        },
      });
    } catch (error) {
      console.error(
        "Tutor login error:",
        error
      );

      return res
        .status(500)
        .json({
          success: false,

          code:
            error?.code ||
            "TUTOR_LOGIN_ERROR",

          message:
            error?.message ||
            "Unable to continue.",

          detail:
            error?.detail ||
            null,

          column:
            error?.column ||
            null,
        });
    }
  }
);

/* =========================================================
   GET TUTOR CLASSES
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
            req.query?.tutor_reference ||
            req.query?.tutorReference
        );

      /*
       * Registration mode.
       */
      if (!reference) {
        const classCards =
          ALL_TUTOR_CLASSES.map(
            (grade) => ({
              id: grade
                .toLowerCase()
                .replace(
                  /[^a-z0-9]+/g,
                  "-"
                ),

              grade,

              class: grade,

              className: grade,

              class_name: grade,

              subjects:
                getClassSubjects(
                  grade
                ),

              students: [],

              activities: [],
            })
          );

        return res.json({
          success: true,

          mode:
            "registration",

          classes:
            ALL_TUTOR_CLASSES,

          classOptions:
            ALL_TUTOR_CLASSES,

          availableClasses:
            ALL_TUTOR_CLASSES,

          subjectsByClass,

          subjects:
            ALL_SUBJECTS,

          availableSubjects:
            ALL_SUBJECTS,

          classCards,

          classCount:
            ALL_TUTOR_CLASSES.length,

          subjectCount:
            ALL_SUBJECTS.length,

          hasClasses: true,

          assignments: [],

          hasAssignments:
            false,

          assignmentCount:
            0,
        });
      }

      const tutor =
        await findTutorByReference(
          reference
        );

      if (!tutor) {
        return res
          .status(404)
          .json({
            success: false,

            code:
              "TUTOR_NOT_FOUND",

            message:
              "Tutor account could not be found.",
          });
      }

      const status =
        normalizeStatus(
          tutor.application_status ||
            tutor.status
        );

      if (status !== "verified") {
        return res
          .status(403)
          .json({
            success: false,

            code:
              "TUTOR_NOT_VERIFIED",

            message:
              "Your tutor account has not been verified yet.",
          });
      }

      const tutorReference =
        getTutorReference(
          tutor
        );

      const tutorClasses =
        getTutorClasses(
          tutor
        );

      const tutorSubjects =
        getTutorSubjects(
          tutor
        );

      const studentsResult =
        await pool.query(
          `
            SELECT *
            FROM academy_student_enrollments
            ORDER BY created_at DESC
          `
        );

      const students =
        studentsResult.rows ||
        [];

      const studentsByClass =
        {};

      for (
        const grade of tutorClasses
      ) {
        studentsByClass[
          normalizeClass(
            grade
          )
        ] = [];
      }

      for (
        const original of students
      ) {
        const studentGrade =
          clean(
            original.grade ||
              original.class ||
              original.level ||
              original.class_name ||
              original.className
          );

        if (!studentGrade) {
          continue;
        }

        const tutorGrade =
          tutorClasses.find(
            (item) =>
              normalizeClass(
                item
              ) ===
              normalizeClass(
                studentGrade
              )
          );

        if (!tutorGrade) {
          continue;
        }

        const enrolledSubjects =
          arrayFromValue(
            original.subjects ||
              original.subject ||
              original.selected_subjects ||
              original.selectedSubjects
          );

        const matchingSubjects =
          enrolledSubjects.filter(
            (
              studentSubject
            ) =>
              tutorSubjects.some(
                (
                  tutorSubject
                ) =>
                  subjectsMatch(
                    studentSubject,
                    tutorSubject
                  )
              )
          );

        /*
         * If subjects exist but none belong to
         * the tutor, do not show the student.
         */
        if (
          !matchingSubjects.length &&
          enrolledSubjects.length
        ) {
          continue;
        }

        const matchedSubject =
          matchingSubjects[0] ||
          "";

        const student =
          serializeStudent(
            original,
            tutorGrade,
            matchedSubject
          );

        student.tutorClassId =
          tutorGrade
            .toLowerCase()
            .replace(
              /[^a-z0-9]+/g,
              "-"
            );

        const key =
          normalizeClass(
            tutorGrade
          );

        if (
          !studentsByClass[key]
        ) {
          studentsByClass[key] =
            [];
        }

        const studentId =
          student.enrollmentId;

        const alreadyExists =
          studentsByClass[
            key
          ].some(
            (item) =>
              studentId !==
                null &&
              item.enrollmentId ===
                studentId
          );

        if (!alreadyExists) {
          studentsByClass[
            key
          ].push(student);
        }
      }

      const classCards =
        createClassCards(
          tutor,
          studentsByClass
        );

      /*
       * Load tutor activities.
       */
      let activities = [];

      try {
        const activitiesResult =
          await pool.query(
            `
              SELECT *
              FROM class_activities
              WHERE tutor_reference = $1
              ORDER BY created_at DESC
            `,
            [
              tutorReference,
            ]
          );

        activities =
          activitiesResult.rows ||
          [];
      } catch (activityError) {
        console.error(
          "Tutor activities loading error:",
          activityError
        );
      }

      for (
        const card of classCards
      ) {
        const cardActivities =
          activities.filter(
            (activity) => {
              const activityGrade =
                activity.grade ||
                activity.class ||
                activity.class_name ||
                "";

              const activitySubject =
                activity.subject ||
                "";

              const gradeMatches =
                normalizeClass(
                  activityGrade
                ) ===
                normalizeClass(
                  card.grade
                );

              const subjectMatches =
                !activitySubject ||
                getClassSubjects(
                  card.grade
                ).some(
                  (
                    allowedSubject
                  ) =>
                    subjectsMatch(
                      allowedSubject,
                      activitySubject
                    )
                );

              return (
                gradeMatches &&
                subjectMatches
              );
            }
          );

        card.activities =
          cardActivities;

        card.activityCount =
          cardActivities.length;
      }

      return res.json({
        success: true,

        mode: "tutor",

        reference:
          tutorReference,

        tutorReference,

        tutor: {
          ...tutor,

          reference:
            tutorReference,

          classes:
            tutorClasses,

          tutorClasses:
            tutorClasses,

          registeredClasses:
            tutorClasses,

          subjects:
            tutorSubjects,

          tutorSubjects:
            tutorSubjects,

          registeredSubjects:
            tutorSubjects,
        },

        classes:
          classCards,

        classCards,

        subjectsByClass,

        assignments: [],

        hasAssignments:
          false,

        assignmentCount:
          0,
      });
    } catch (error) {
      console.error(
        "GET tutor classes error:",
        error
      );

      return res
        .status(500)
        .json({
          success: false,

          code:
            error?.code ||
            "TUTOR_CLASSES_LOAD_ERROR",

          message:
            error?.message ||
            "Unable to load tutor classes.",

          detail:
            error?.detail ||
            null,
        });
    }
  }
);

/* =========================================================
   GET ONE TUTOR CLASS
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
            req.query?.tutor_reference ||
            req.query?.tutorReference
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
        return res
          .status(400)
          .json({
            success: false,

            code:
              "TUTOR_REFERENCE_REQUIRED",

            message:
              "Tutor reference is required.",
          });
      }

      const canonicalClass =
        getCanonicalClass(
          grade
        );

      if (!canonicalClass) {
        return res
          .status(400)
          .json({
            success: false,

            code:
              "INVALID_CLASS",

            message:
              `Invalid class: ${grade}.`,
          });
      }

      const canonicalSubject =
        getMatchingCanonicalSubject(
          canonicalClass,
          subject
        );

      if (!canonicalSubject) {
        return res
          .status(400)
          .json({
            success: false,

            code:
              "INVALID_SUBJECT",

            message:
              `The subject "${subject}" is not available for ${canonicalClass}.`,
          });
      }

      const auth =
        await getVerifiedTutorForClassSubject(
          reference,
          canonicalClass,
          canonicalSubject
        );

      if (auth.error) {
        return res
          .status(
            auth.error.status
          )
          .json({
            success: false,

            code:
              auth.error.code,

            message:
              auth.error.message,
          });
      }

      const studentsResult =
        await pool.query(
          `
            SELECT *
            FROM academy_student_enrollments
            ORDER BY created_at DESC
          `
        );

      const students =
        studentsResult.rows ||
        [];

      const matchedStudents =
        students
          .filter(
            (student) => {
              const studentGrade =
                clean(
                  student.grade ||
                    student.class ||
                    student.level ||
                    student.class_name ||
                    student.className
                );

              if (
                normalizeClass(
                  studentGrade
                ) !==
                normalizeClass(
                  canonicalClass
                )
              ) {
                return false;
              }

              const studentSubjects =
                arrayFromValue(
                  student.subjects ||
                    student.subject ||
                    student.selected_subjects ||
                    student.selectedSubjects
                );

              if (
                !studentSubjects.length
              ) {
                return true;
              }

              return studentSubjects.some(
                (item) =>
                  subjectsMatch(
                    item,
                    canonicalSubject
                  )
              );
            }
          )
          .map(
            (original) =>
              serializeStudent(
                original,
                canonicalClass,
                canonicalSubject
              )
          );

      let activities = [];

      try {
        const activitiesResult =
          await pool.query(
            `
              SELECT *
              FROM class_activities
              WHERE
                tutor_reference = $1
                AND LOWER(grade) = LOWER($2)
              ORDER BY created_at DESC
            `,
            [
              reference,
              canonicalClass,
            ]
          );

        activities =
          (
            activitiesResult.rows ||
            []
          ).filter(
            (activity) =>
              !activity.subject ||
              subjectsMatch(
                activity.subject,
                canonicalSubject
              )
          );
      } catch (activityError) {
        console.error(
          "Class activity query error:",
          activityError
        );
      }

      return res.json({
        success: true,

        reference,

        grade:
          canonicalClass,

        class:
          canonicalClass,

        subject:
          canonicalSubject,

        students:
          matchedStudents,

        studentCount:
          matchedStudents.length,

        activities,

        activityCount:
          activities.length,

        assignments: [],

        hasAssignments:
          false,

        assignmentCount:
          0,
      });
    } catch (error) {
      console.error(
        "GET tutor class error:",
        error
      );

      return res
        .status(500)
        .json({
          success: false,

          code:
            error?.code ||
            "TUTOR_CLASS_LOAD_ERROR",

          message:
            error?.message ||
            "Unable to load class.",
        });
    }
  }
);

/* =========================================================
   CREATE TUTOR TASK
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
            req.body?.class_name ||
            req.body?.className
        );

      const subject =
        clean(
          req.body?.subject ||
            req.body?.subject_name ||
            req.body?.subjectName
        );

      const activityType =
        clean(
          req.body?.activityType ||
            req.body?.activity_type ||
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
          req.body?.dueDate ||
            req.body?.due_date
        );

      const rawMaxScore =
        clean(
          req.body?.maxScore ||
            req.body?.max_score
        );

      let maxScore = null;

      if (rawMaxScore) {
        maxScore =
          Number(
            rawMaxScore
          );

        if (
          Number.isNaN(
            maxScore
          ) ||
          maxScore < 0
        ) {
          deleteUploadedFiles(
            uploadedFiles
          );

          return res
            .status(400)
            .json({
              success: false,

              code:
                "INVALID_MAX_SCORE",

              message:
                "Max score must be a valid non-negative number.",
            });
        }
      }

      if (!reference) {
        deleteUploadedFiles(
          uploadedFiles
        );

        return res
          .status(400)
          .json({
            success: false,

            code:
              "TUTOR_REFERENCE_REQUIRED",

            message:
              "Tutor reference is required.",
          });
      }

      if (!grade) {
        deleteUploadedFiles(
          uploadedFiles
        );

        return res
          .status(400)
          .json({
            success: false,

            code:
              "CLASS_REQUIRED",

            message:
              "Class is required.",
          });
      }

      if (!subject) {
        deleteUploadedFiles(
          uploadedFiles
        );

        return res
          .status(400)
          .json({
            success: false,

            code:
              "SUBJECT_REQUIRED",

            message:
              "Subject is required.",
          });
      }

      if (!title) {
        deleteUploadedFiles(
          uploadedFiles
        );

        return res
          .status(400)
          .json({
            success: false,

            code:
              "TITLE_REQUIRED",

            message:
              "Task title is required.",
          });
      }

      if (
        activityType !==
        "task"
      ) {
        deleteUploadedFiles(
          uploadedFiles
        );

        return res
          .status(400)
          .json({
            success: false,

            code:
              "INVALID_ACTIVITY_TYPE",

            message:
              "This endpoint is only for tasks.",
          });
      }

      const canonicalClass =
        getCanonicalClass(
          grade
        );

      if (!canonicalClass) {
        deleteUploadedFiles(
          uploadedFiles
        );

        return res
          .status(400)
          .json({
            success: false,

            code:
              "INVALID_CLASS",

            message:
              `The selected class is invalid: ${grade}.`,
          });
      }

      const canonicalSubject =
        getMatchingCanonicalSubject(
          canonicalClass,
          subject
        );

      if (!canonicalSubject) {
        deleteUploadedFiles(
          uploadedFiles
        );

        return res
          .status(400)
          .json({
            success: false,

            code:
              "INVALID_SUBJECT",

            message:
              `The subject "${subject}" is not available for ${canonicalClass}.`,
          });
      }

      const auth =
        await getVerifiedTutorForClassSubject(
          reference,
          canonicalClass,
          canonicalSubject
        );

      if (auth.error) {
        deleteUploadedFiles(
          uploadedFiles
        );

        return res
          .status(
            auth.error.status
          )
          .json({
            success: false,

            code:
              auth.error.code,

            message:
              auth.error.message,
          });
      }

      const attachments =
        buildAttachments(
          uploadedFiles
        );

      const metadata = {
        attachments,

        instructions:
          instructions ||
          null,

        dueDate:
          dueDate ||
          null,

        maxScore:
          maxScore !== null
            ? maxScore
            : null,

        activityType:
          "task",

        class:
          canonicalClass,

        grade:
          canonicalClass,

        subject:
          canonicalSubject,

        createdBy:
          reference,
      };

      /*
       * Check the actual table structure before
       * inserting optional fields.
       */
      const columnsResult =
        await pool.query(
          `
            SELECT column_name
            FROM information_schema.columns
            WHERE
              table_schema = 'public'
              AND table_name = 'class_activities'
          `
        );

      const availableColumns =
        new Set(
          columnsResult.rows.map(
            (row) =>
              row.column_name
          )
        );

      const requiredColumns = [
        "tutor_reference",
        "grade",
        "subject",
        "activity_type",
        "title",
      ];

      const missingRequired =
        requiredColumns.filter(
          (column) =>
            !availableColumns.has(
              column
            )
        );

      if (
        missingRequired.length
      ) {
        deleteUploadedFiles(
          uploadedFiles
        );

        return res
          .status(500)
          .json({
            success: false,

            code:
              "TASK_TABLE_SCHEMA_ERROR",

            message:
              "The class_activities table is missing required columns.",

            missingColumns:
              missingRequired,
          });
      }

      const insertColumns = [
        "tutor_reference",
        "grade",
        "subject",
        "activity_type",
        "title",
      ];

      const insertValues = [
        reference,
        canonicalClass,
        canonicalSubject,
        "task",
        title,
      ];

      const placeholders = [
        "$1",
        "$2",
        "$3",
        "$4",
        "$5",
      ];

      if (
        availableColumns.has(
          "description"
        )
      ) {
        insertColumns.push(
          "description"
        );

        insertValues.push(
          description ||
            null
        );

        placeholders.push(
          `$${insertValues.length}`
        );
      }

      if (
        availableColumns.has(
          "metadata"
        )
      ) {
        insertColumns.push(
          "metadata"
        );

        insertValues.push(
          JSON.stringify(
            metadata
          )
        );

        placeholders.push(
          `$${insertValues.length}::jsonb`
        );
      }

      if (
        availableColumns.has(
          "created_at"
        )
      ) {
        insertColumns.push(
          "created_at"
        );

        placeholders.push(
          "NOW()"
        );
      }

      if (
        availableColumns.has(
          "updated_at"
        )
      ) {
        insertColumns.push(
          "updated_at"
        );

        placeholders.push(
          "NOW()"
        );
      }

      const insertQuery = `
        INSERT INTO class_activities (
          ${insertColumns.join(
            ", "
          )}
        )
        VALUES (
          ${placeholders.join(
            ", "
          )}
        )
        RETURNING *
      `;

      console.log(
        "=============================================="
      );

      console.log(
        "CREATING ACADEMY TASK"
      );

      console.log({
        reference,
        grade:
          canonicalClass,
        subject:
          canonicalSubject,
        title,
        files:
          uploadedFiles.length,
        columns:
          insertColumns,
      });

      console.log(
        "=============================================="
      );

      const result =
        await pool.query(
          insertQuery,
          insertValues
        );

      const activity =
        result.rows[0];

      return res
        .status(201)
        .json({
          success: true,

          message:
            "Task created successfully.",

          activity,

          task:
            activity,

          class:
            canonicalClass,

          grade:
            canonicalClass,

          subject:
            canonicalSubject,

          title,

          attachments,

          files:
            attachments,

          fileCount:
            attachments.length,

          assignments: [],

          hasAssignments:
            false,

          assignmentCount:
            0,
        });
    } catch (error) {
      console.error(
        "================================================="
      );

      console.error(
        "CREATE TASK ERROR"
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
        "Hint:",
        error?.hint
      );

      console.error(
        "Constraint:",
        error?.constraint
      );

      console.error(
        "Table:",
        error?.table
      );

      console.error(
        "Column:",
        error?.column
      );

      console.error(
        "================================================="
      );

      deleteUploadedFiles(
        uploadedFiles
      );

      if (
        error?.code ===
        "LIMIT_FILE_SIZE"
      ) {
        return res
          .status(400)
          .json({
            success: false,

            code:
              "FILE_TOO_LARGE",

            message:
              "Each file must be 250MB or less.",
          });
      }

      if (
        error?.code ===
        "LIMIT_FILE_COUNT"
      ) {
        return res
          .status(400)
          .json({
            success: false,

            code:
              "TOO_MANY_FILES",

            message:
              "You can upload a maximum of 10 files.",
          });
      }

      if (
        error?.code ===
        "INVALID_FILE_TYPE"
      ) {
        return res
          .status(400)
          .json({
            success: false,

            code:
              "INVALID_FILE_TYPE",

            message:
              "Only PDF, DOC, DOCX, images, MP4, WebM and MOV are allowed.",
          });
      }

      return res
        .status(500)
        .json({
          success: false,

          code:
            error?.code ||
            "CREATE_TASK_ERROR",

          message:
            error?.message ||
            "Unable to create task.",

          detail:
            error?.detail ||
            null,

          hint:
            error?.hint ||
            null,

          column:
            error?.column ||
            null,

          constraint:
            error?.constraint ||
            null,
        });
    }
  }
);

/* =========================================================
   GET TUTOR ACTIVITIES
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
            req.query?.tutor_reference ||
            req.query?.tutorReference ||
            req.headers[
              "x-tutor-reference"
            ]
        );

      if (!reference) {
        return res
          .status(400)
          .json({
            success: false,

            code:
              "TUTOR_REFERENCE_REQUIRED",

            message:
              "Tutor reference is required.",
          });
      }

      const tutor =
        await findTutorByReference(
          reference
        );

      if (!tutor) {
        return res
          .status(404)
          .json({
            success: false,

            code:
              "TUTOR_NOT_FOUND",

            message:
              "Tutor account could not be found.",
          });
      }

      const status =
        normalizeStatus(
          tutor.application_status ||
            tutor.status
        );

      if (status !== "verified") {
        return res
          .status(403)
          .json({
            success: false,

            code:
              "TUTOR_NOT_VERIFIED",

            message:
              "Your tutor account has not been verified yet.",
          });
      }

      const tutorReference =
        getTutorReference(
          tutor
        );

      let activities =
        [];

      try {
        const result =
          await pool.query(
            `
              SELECT *
              FROM class_activities
              WHERE tutor_reference = $1
              ORDER BY created_at DESC
            `,
            [
              tutorReference,
            ]
          );

        activities =
          result.rows ||
          [];
      } catch (error) {
        console.error(
          "Activity loading error:",
          error
        );

        return res
          .status(500)
          .json({
            success: false,

            code:
              error?.code ||
              "ACTIVITY_LOAD_ERROR",

            message:
              error?.message ||
              "Unable to load tutor tasks.",
          });
      }

      return res.json({
        success: true,

        reference:
          tutorReference,

        activities,

        tasks:
          activities,

        activityCount:
          activities.length,

        taskCount:
          activities.length,

        assignments: [],

        hasAssignments:
          false,

        assignmentCount:
          0,
      });
    } catch (error) {
      console.error(
        "GET tutor activities error:",
        error
      );

      return res
        .status(500)
        .json({
          success: false,

          code:
            error?.code ||
            "ACTIVITY_LOAD_ERROR",

          message:
            error?.message ||
            "Unable to load tasks.",
        });
    }
  }
);

/* =========================================================
   GET ALL STUDENT ENROLLMENTS
   ---------------------------------------------------------
   This fixes:
   "Unable to load student enrollments."
========================================================= */

router.get(
  "/student-enrollments",
  async (
    _req,
    res
  ) => {
    try {
      const result =
        await pool.query(
          `
            SELECT *
            FROM academy_student_enrollments
            ORDER BY created_at DESC
          `
        );

      const enrollments =
        result.rows || [];

      const students =
        enrollments.map(
          (student) =>
            serializeStudent(
              student
            )
        );

      return res.json({
        success: true,

        enrollments,

        students,

        data:
          enrollments,

        count:
          enrollments.length,

        enrollmentCount:
          enrollments.length,

        studentCount:
          students.length,
      });
    } catch (error) {
      console.error(
        "GET student enrollments error:",
        error
      );

      return res
        .status(500)
        .json({
          success: false,

          code:
            error?.code ||
            "STUDENT_ENROLLMENTS_LOAD_ERROR",

          message:
            error?.message ||
            "Unable to load student enrollments.",

          detail:
            error?.detail ||
            null,

          hint:
            error?.hint ||
            null,

          table:
            error?.table ||
            null,

          column:
            error?.column ||
            null,
        });
    }
  }
);

/* =========================================================
   ADMIN ALIAS FOR STUDENT ENROLLMENTS
========================================================= */

router.get(
  "/admin/enrollments",
  async (
    _req,
    res
  ) => {
    try {
      const result =
        await pool.query(
          `
            SELECT *
            FROM academy_student_enrollments
            ORDER BY created_at DESC
          `
        );

      const enrollments =
        result.rows || [];

      const students =
        enrollments.map(
          (student) =>
            serializeStudent(
              student
            )
        );

      return res.json({
        success: true,

        enrollments,

        students,

        data:
          enrollments,

        count:
          enrollments.length,

        enrollmentCount:
          enrollments.length,

        studentCount:
          students.length,
      });
    } catch (error) {
      console.error(
        "Admin enrollments error:",
        error
      );

      return res
        .status(500)
        .json({
          success: false,

          code:
            error?.code ||
            "STUDENT_ENROLLMENTS_LOAD_ERROR",

          message:
            error?.message ||
            "Unable to load student enrollments.",

          detail:
            error?.detail ||
            null,
        });
    }
  }
);

/* =========================================================
   ADMIN: GET TUTORS
========================================================= */

router.get(
  "/admin/tutors",
  async (
    _req,
    res
  ) => {
    try {
      const result =
        await pool.query(
          `
            SELECT *
            FROM academy_tutor_applications
            ORDER BY created_at DESC
          `
        );

      return res.json({
        success: true,

        tutors:
          result.rows,

        data:
          result.rows,

        count:
          result.rows.length,
      });
    } catch (error) {
      console.error(
        "Admin tutors error:",
        error
      );

      return res
        .status(500)
        .json({
          success: false,

          message:
            error?.message ||
            "Unable to load tutors.",
        });
    }
  }
);

/* =========================================================
   ADMIN: GET ONE TUTOR
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

      const tutor =
        await findTutorByReference(
          reference
        );

      if (!tutor) {
        return res
          .status(404)
          .json({
            success: false,

            message:
              "Tutor not found.",
          });
      }

      return res.json({
        success: true,

        tutor,
      });
    } catch (error) {
      console.error(
        "Admin tutor detail error:",
        error
      );

      return res
        .status(500)
        .json({
          success: false,

          message:
            error?.message ||
            "Unable to load tutor.",
        });
    }
  }
);

/* =========================================================
   ADMIN: UPDATE TUTOR STATUS
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
            req.body?.application_status
        ).toLowerCase();

      const allowedStatuses = [
        "pending",
        "verified",
        "rejected",
      ];

      if (
        !allowedStatuses.includes(
          status
        )
      ) {
        return res
          .status(400)
          .json({
            success: false,

            message:
              "Invalid tutor status.",

            allowedStatuses,
          });
      }

      /*
       * Resolve the tutor first so this route
       * does not depend on optional columns.
       */
      const tutor =
        await findTutorByReference(
          reference
        );

      if (!tutor) {
        return res
          .status(404)
          .json({
            success: false,

            message:
              "Tutor not found.",
          });
      }

      const tutorReference =
        getTutorReference(
          tutor
        );

      const result =
        await pool.query(
          `
            UPDATE academy_tutor_applications
            SET
              application_status = $1,
              updated_at = NOW()
            WHERE reference = $2
            RETURNING *
          `,
          [
            status,
            tutorReference,
          ]
        );

      if (!result.rows.length) {
        return res
          .status(404)
          .json({
            success: false,

            message:
              "Tutor not found.",
          });
      }

      return res.json({
        success: true,

        message:
          `Tutor status updated to ${status}.`,

        tutor:
          result.rows[0],
      });
    } catch (error) {
      console.error(
        "Admin tutor status error:",
        error
      );

      return res
        .status(500)
        .json({
          success: false,

          code:
            error?.code ||
            "TUTOR_STATUS_UPDATE_ERROR",

          message:
            error?.message ||
            "Unable to update tutor status.",

          detail:
            error?.detail ||
            null,

          column:
            error?.column ||
            null,

          constraint:
            error?.constraint ||
            null,
        });
    }
  }
);

/* =========================================================
   ADMIN: UPDATE STUDENT ENROLLMENT STATUS
========================================================= */

router.patch(
  "/admin/enrollment/:enrollmentId/status",
  async (
    req,
    res
  ) => {
    try {
      const enrollmentId =
        req.params.enrollmentId;

      const status =
        clean(
          req.body?.status
        ).toLowerCase();

      const allowedStatuses = [
        "pending",
        "approved",
        "verified",
        "rejected",
        "active",
        "inactive",
      ];

      if (
        !allowedStatuses.includes(
          status
        )
      ) {
        return res
          .status(400)
          .json({
            success: false,

            message:
              "Invalid enrollment status.",

            allowedStatuses,
          });
      }

      const result =
        await pool.query(
          `
            UPDATE academy_student_enrollments
            SET
              status = $1,
              updated_at = NOW()
            WHERE id = $2
            RETURNING *
          `,
          [
            status,
            enrollmentId,
          ]
        );

      if (!result.rows.length) {
        return res
          .status(404)
          .json({
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
        "Admin enrollment status error:",
        error
      );

      return res
        .status(500)
        .json({
          success: false,

          code:
            error?.code ||
            "ENROLLMENT_STATUS_UPDATE_ERROR",

          message:
            error?.message ||
            "Unable to update enrollment status.",

          detail:
            error?.detail ||
            null,

          column:
            error?.column ||
            null,
        });
    }
  }
);

/* =========================================================
   ADMIN: VERIFY ALL PENDING TUTORS
========================================================= */

router.post(
  "/admin/verify-all-statuses",
  async (
    _req,
    res
  ) => {
    try {
      const result =
        await pool.query(
          `
            UPDATE academy_tutor_applications
            SET
              application_status = 'verified',
              updated_at = NOW()
            WHERE
              LOWER(
                COALESCE(
                  application_status,
                  ''
                )
              ) IN (
                'pending',
                'approved',
                'verified'
              )
            RETURNING *
          `
        );

      return res.json({
        success: true,

        message:
          "Tutor statuses synchronized.",

        tutors:
          result.rows,

        count:
          result.rows.length,
      });
    } catch (error) {
      console.error(
        "Verify all statuses error:",
        error
      );

      return res
        .status(500)
        .json({
          success: false,

          message:
            error?.message ||
            "Unable to verify tutor statuses.",

          detail:
            error?.detail ||
            null,
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
          body.firstName ||
            body.first_name
        );

      const middleName =
        clean(
          body.middleName ||
            body.middle_name
        );

      const lastName =
        clean(
          body.lastName ||
            body.last_name
        );

      const name =
        clean(
          body.name ||
            body.fullName ||
            body.full_name ||
            [
              firstName,
              middleName,
              lastName,
            ]
              .filter(Boolean)
              .join(" ")
        );

      const email =
        normalizeEmail(
          body.email
        );

      const phone =
        clean(
          body.phone ||
            body.studentPhone ||
            body.student_phone
        );

      const grade =
        clean(
          body.grade ||
            body.class ||
            body.class_name ||
            body.className
        );

      const subjects =
        uniqueArray(
          arrayFromValue(
            body.subjects ||
              body.subject ||
              body.selected_subjects ||
              body.selectedSubjects
          )
        );

      const schoolLevel =
        clean(
          body.schoolLevel ||
            body.school_level
        );

      const academicSession =
        clean(
          body.academicSession ||
            body.academic_session
        );

      if (!name) {
        return res
          .status(400)
          .json({
            success: false,

            message:
              "Student name is required.",
          });
      }

      if (!email) {
        return res
          .status(400)
          .json({
            success: false,

            message:
              "Student email is required.",
          });
      }

      if (!grade) {
        return res
          .status(400)
          .json({
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
        return res
          .status(400)
          .json({
            success: false,

            message:
              `Invalid class: ${grade}.`,
          });
      }

      if (!subjects.length) {
        return res
          .status(400)
          .json({
            success: false,

            message:
              "At least one subject is required.",
          });
      }

      const canonicalClass =
        getCanonicalClass(
          grade
        );

      const validSubjects =
        subjects
          .map(
            (subject) =>
              getMatchingCanonicalSubject(
                canonicalClass,
                subject
              )
          )
          .filter(Boolean);

      if (!validSubjects.length) {
        return res
          .status(400)
          .json({
            success: false,

            message:
              `None of the selected subjects are available for ${canonicalClass}.`,
          });
      }

      const normalizedSubjects =
        uniqueArray(
          validSubjects
        );

      const result =
        await pool.query(
          `
            INSERT INTO academy_student_enrollments (
              first_name,
              middle_name,
              last_name,
              name,
              email,
              student_phone,
              grade,
              subjects,
              school_level,
              academic_session,
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
              $7,
              $8,
              $9,
              $10,
              $11,
              NOW(),
              NOW()
            )
            RETURNING *
          `,
          [
            firstName ||
              null,

            middleName ||
              null,

            lastName ||
              null,

            name,

            email,

            phone ||
              null,

            canonicalClass,

            JSON.stringify(
              normalizedSubjects
            ),

            schoolLevel ||
              null,

            academicSession ||
              null,

            "pending",
          ]
        );

      return res
        .status(201)
        .json({
          success: true,

          message:
            "Student enrollment submitted successfully.",

          enrollment:
            result.rows[0],

          student:
            serializeStudent(
              result.rows[0]
            ),
        });
    } catch (error) {
      console.error(
        "Student enrollment error:",
        error
      );

      return res
        .status(500)
        .json({
          success: false,

          code:
            error?.code ||
            "STUDENT_ENROLLMENT_ERROR",

          message:
            error?.message ||
            "Unable to submit student enrollment.",

          detail:
            error?.detail ||
            null,

          column:
            error?.column ||
            null,

          constraint:
            error?.constraint ||
            null,
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

      if (!email) {
        return res
          .status(400)
          .json({
            success: false,

            message:
              "Email address is required.",
          });
      }

      const result =
        await pool.query(
          `
            SELECT *
            FROM academy_student_enrollments
            WHERE LOWER(email) = $1
            ORDER BY created_at DESC
            LIMIT 1
          `,
          [
            email,
          ]
        );

      if (!result.rows.length) {
        return res
          .status(404)
          .json({
            success: false,

            message:
              "No student enrollment was found for this email.",
          });
      }

      const student =
        result.rows[0];

      return res.json({
        success: true,

        message:
          "Student login successful.",

        student,

        user:
          student,

        enrollment:
          student,
      });
    } catch (error) {
      console.error(
        "Student login error:",
        error
      );

      return res
        .status(500)
        .json({
          success: false,

          message:
            error?.message ||
            "Unable to continue.",
        });
    }
  }
);

/* =========================================================
   GET STUDENT PROFILE
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

      const result =
        await pool.query(
          `
            SELECT *
            FROM academy_student_enrollments
            WHERE id = $1
            LIMIT 1
          `,
          [
            userId,
          ]
        );

      if (!result.rows.length) {
        return res
          .status(404)
          .json({
            success: false,

            message:
              "Student not found.",
          });
      }

      return res.json({
        success: true,

        student:
          result.rows[0],

        user:
          result.rows[0],

        enrollment:
          result.rows[0],
      });
    } catch (error) {
      console.error(
        "Student profile error:",
        error
      );

      return res
        .status(500)
        .json({
          success: false,

          message:
            error?.message ||
            "Unable to load student profile.",
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
    _next
  ) => {
    if (
      error instanceof
      multer.MulterError
    ) {
      if (
        error.code ===
        "LIMIT_FILE_SIZE"
      ) {
        return res
          .status(400)
          .json({
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
        return res
          .status(400)
          .json({
            success: false,

            code:
              "TOO_MANY_FILES",

            message:
              "You can upload a maximum of 10 files.",
          });
      }

      return res
        .status(400)
        .json({
          success: false,

          code:
            error.code ||
            "UPLOAD_ERROR",

          message:
            error.message ||
            "File upload failed.",
        });
    }

    if (
      error?.code ===
      "INVALID_FILE_TYPE"
    ) {
      return res
        .status(400)
        .json({
          success: false,

          code:
            "INVALID_FILE_TYPE",

          message:
            "Only PDF, DOC, DOCX, images, MP4, WebM and MOV are allowed.",
        });
    }

    console.error(
      "Academy route error:",
      error
    );

    return res
      .status(500)
      .json({
        success: false,

        code:
          error?.code ||
          "ACADEMY_ROUTE_ERROR",

        message:
          error?.message ||
          "Unable to continue.",

        detail:
          error?.detail ||
          null,

        column:
          error?.column ||
          null,

        constraint:
          error?.constraint ||
          null,
      });
  }
);

export default router;