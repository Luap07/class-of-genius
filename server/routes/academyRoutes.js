import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import pool from "../lib/db.js";

const router = express.Router();

/* =========================================================
   CLASSES
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
   SUBJECTS
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

const ALL_SUBJECTS = [
  ...new Set([
    ...PRIMARY_SUBJECTS,
    ...JSS_SUBJECTS,
    ...SS_SUBJECTS,
  ]),
];

/* =========================================================
   BASIC HELPERS
========================================================= */

function clean(value) {
  return value === undefined || value === null
    ? ""
    : String(value).trim();
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

function normalizeClass(value) {
  return clean(value)
    .toLowerCase()
    .replace(/\s+/g, " ");
}

function normalizeSubject(value) {
  return clean(value)
    .toLowerCase()
    .replace(/[\s_-]+/g, " ");
}

function normalizeStatus(value) {
  return clean(value)
    .toLowerCase()
    .replace(/[\s_-]+/g, "");
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
  if (Array.isArray(value)) return value;

  if (
    value === undefined ||
    value === null ||
    value === ""
  ) {
    return [];
  }

  if (typeof value === "string") {
    const text = value.trim();

    if (!text) return [];

    try {
      const parsed = JSON.parse(text);

      if (Array.isArray(parsed)) {
        return parsed;
      }
    } catch {
      // Treat as comma-separated text.
    }

    return text
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [value];
}

/* =========================================================
   CLASS HELPERS
========================================================= */

function getCanonicalClass(value) {
  return (
    ALL_TUTOR_CLASSES.find(
      (item) =>
        normalizeClass(item) ===
        normalizeClass(value)
    ) || null
  );
}

function isValidTutorClass(value) {
  return Boolean(getCanonicalClass(value));
}

function getClassSubjects(grade) {
  const canonical = getCanonicalClass(grade);

  return canonical
    ? subjectsByClass[canonical] || []
    : [];
}

/* =========================================================
   SUBJECT HELPERS
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
  ],

  "physical and health education": [
    "physical and health education",
    "physical health education",
    "physical education",
    "health education",
    "phe",
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

  if (!a || !b) return false;
  if (a === b) return true;

  return Object.values(SUBJECT_ALIASES).some(
    (aliases) => {
      const normalized = aliases.map(
        normalizeSubject
      );

      return (
        normalized.includes(a) &&
        normalized.includes(b)
      );
    }
  );
}

function getMatchingCanonicalSubject(
  grade,
  subject
) {
  return (
    getClassSubjects(grade).find(
      (item) =>
        subjectsMatch(item, subject)
    ) || null
  );
}

/* =========================================================
   ASSIGNMENTS
   IMPORTANT:
   Keeps exact CLASS -> SUBJECT relationship
========================================================= */

function normalizeAssignments(value) {
  const raw = arrayFromValue(value);

  return raw
    .map((item) => {
      if (!item || typeof item !== "object") {
        return null;
      }

      const rawClass = clean(
        item.class ||
          item.grade ||
          item.className ||
          item.class_name
      );

      const className =
        getCanonicalClass(rawClass) ||
        rawClass;

      if (!className) return null;

      const subjects = uniqueArray(
        arrayFromValue(
          item.subjects ||
            item.subject ||
            item.subjects_taught ||
            item.registeredSubjects
        ).map((subject) => {
          const canonical =
            getMatchingCanonicalSubject(
              className,
              subject
            );

          return canonical || clean(subject);
        })
      );

      if (!subjects.length) return null;

      return {
        class: className,
        subjects,
      };
    })
    .filter(Boolean);
}

function getTutorAssignments(tutor) {
  return normalizeAssignments(
    tutor?.assignments ||
      tutor?.teaching_assignments ||
      tutor?.class_subject_assignments
  );
}

function getTutorClasses(tutor) {
  const assignments =
    getTutorAssignments(tutor);

  if (assignments.length) {
    return uniqueArray(
      assignments.map(
        (item) => item.class
      )
    );
  }

  return uniqueArray(
    arrayFromValue(
      tutor?.classes ||
        tutor?.tutor_classes ||
        tutor?.registered_classes
    ).map((item) => {
      if (typeof item === "string") {
        return (
          getCanonicalClass(item) ||
          item
        );
      }

      return (
        item?.grade ||
        item?.class ||
        item?.class_name ||
        item?.className ||
        ""
      );
    })
  );
}

function getTutorSubjects(tutor) {
  const assignments =
    getTutorAssignments(tutor);

  if (assignments.length) {
    return uniqueArray(
      assignments.flatMap(
        (item) => item.subjects
      )
    );
  }

  return uniqueArray(
    arrayFromValue(
      tutor?.subjects ||
        tutor?.tutor_subjects ||
        tutor?.registered_subjects
    ).map((item) => {
      if (typeof item === "string") {
        return item;
      }

      return (
        item?.subject ||
        item?.subject_name ||
        item?.subjectName ||
        item?.name ||
        ""
      );
    })
  );
}

function getSubjectsForTutorClass(
  tutor,
  grade
) {
  const assignments =
    getTutorAssignments(tutor);

  const assignment =
    assignments.find(
      (item) =>
        normalizeClass(item.class) ===
        normalizeClass(grade)
    );

  if (assignment) {
    return assignment.subjects;
  }

  return getTutorSubjects(tutor);
}

/* =========================================================
   TUTOR HELPERS
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
  const firstName = clean(
    tutor?.first_name
  );

  const middleName = clean(
    tutor?.middle_name
  );

  const lastName = clean(
    tutor?.last_name
  );

  return (
    clean(tutor?.name) ||
    [firstName, middleName, lastName]
      .filter(Boolean)
      .join(" ")
  );
}

async function findTutorByReference(
  reference
) {
  const wanted = clean(reference);

  if (!wanted) return null;

  const result = await pool.query(
    `
      SELECT *
      FROM academy_tutor_applications
      WHERE
        reference = $1
        OR application_reference = $1
        OR tutor_reference = $1
      ORDER BY created_at DESC
      LIMIT 1
    `,
    [wanted]
  );

  return result.rows[0] || null;
}

async function getVerifiedTutorForClassSubject(
  reference,
  grade,
  subject
) {
  const tutor =
    await findTutorByReference(
      reference
    );

  if (!tutor) {
    return {
      error: {
        status: 404,
        code: "TUTOR_NOT_FOUND",
        message:
          "Tutor account could not be found.",
      },
    };
  }

  const status = normalizeStatus(
    tutor.application_status ||
      tutor.status
  );

  if (status !== "verified") {
    return {
      error: {
        status: 403,
        code: "TUTOR_NOT_VERIFIED",
        message:
          "Your tutor account has not been verified yet.",
      },
    };
  }

  const assignments =
    getTutorAssignments(tutor);

  if (assignments.length) {
    const assignment =
      assignments.find(
        (item) =>
          normalizeClass(item.class) ===
          normalizeClass(grade)
      );

    if (!assignment) {
      return {
        error: {
          status: 403,
          code: "CLASS_NOT_REGISTERED",
          message:
            `You are not registered to teach ${grade}.`,
        },
      };
    }

    const allowed =
      assignment.subjects.some(
        (item) =>
          subjectsMatch(
            item,
            subject
          )
      );

    if (!allowed) {
      return {
        error: {
          status: 403,
          code: "SUBJECT_NOT_REGISTERED",
          message:
            `You are not registered to teach ${subject} for ${grade}.`,
        },
      };
    }
  } else {
    const classes =
      getTutorClasses(tutor);

    const subjects =
      getTutorSubjects(tutor);

    if (
      !classes.some(
        (item) =>
          normalizeClass(item) ===
          normalizeClass(grade)
      )
    ) {
      return {
        error: {
          status: 403,
          code: "CLASS_NOT_REGISTERED",
          message:
            `You are not registered to teach ${grade}.`,
        },
      };
    }

    if (
      !subjects.some(
        (item) =>
          subjectsMatch(
            item,
            subject
          )
      )
    ) {
      return {
        error: {
          status: 403,
          code: "SUBJECT_NOT_REGISTERED",
          message:
            `You are not registered to teach ${subject}.`,
        },
      };
    }
  }

  return { tutor };
}

/* =========================================================
   STUDENT SERIALIZER
========================================================= */

function serializeStudent(
  student,
  fallbackGrade = "",
  fallbackSubject = ""
) {
  const grade =
    clean(
      student?.grade ||
        student?.class ||
        student?.level ||
        student?.class_name ||
        fallbackGrade
    );

  const name =
    clean(student?.name) ||
    [
      student?.first_name,
      student?.middle_name,
      student?.last_name,
    ]
      .filter(Boolean)
      .join(" ");

  return {
    ...student,

    enrollmentId:
      student?.id ??
      student?.enrollment_id ??
      null,

    firstName:
      student?.first_name ||
      student?.firstName ||
      "",

    middleName:
      student?.middle_name ||
      student?.middleName ||
      "",

    lastName:
      student?.last_name ||
      student?.lastName ||
      "",

    name,

    email:
      student?.email || "",

    phone:
      student?.phone ||
      student?.student_phone ||
      "",

    studentPhone:
      student?.student_phone ||
      student?.phone ||
      "",

    grade,

    className: grade,

    class_name:
      student?.class_name ||
      grade,

    schoolLevel:
      student?.school_level ||
      student?.schoolLevel ||
      "",

    academicSession:
      student?.academic_session ||
      student?.academicSession ||
      "",

    matchedSubject:
      fallbackSubject ||
      student?.matched_subject ||
      "",
  };
}

/* =========================================================
   PROFILE SERIALIZER
========================================================= */

function serializeTutorProfile(tutor) {
  const assignments =
    getTutorAssignments(tutor);

  const classes =
    assignments.length
      ? uniqueArray(
          assignments.map(
            (item) => item.class
          )
        )
      : getTutorClasses(tutor);

  const subjects =
    assignments.length
      ? uniqueArray(
          assignments.flatMap(
            (item) => item.subjects
          )
        )
      : getTutorSubjects(tutor);

  const firstName =
    clean(tutor?.first_name);

  const middleName =
    clean(tutor?.middle_name);

  const lastName =
    clean(tutor?.last_name);

  const name =
    [firstName, middleName, lastName]
      .filter(Boolean)
      .join(" ") ||
    clean(tutor?.name);

  return {
    ...tutor,

    reference:
      getTutorReference(tutor),

    tutorReference:
      getTutorReference(tutor),

    firstName,
    middleName,
    lastName,

    name,

    fullName: name,

    email:
      tutor?.email || "",

    phone:
      tutor?.phone || "",

    gender:
      tutor?.gender || "",

    dateOfBirth:
      tutor?.date_of_birth || "",

    address:
      tutor?.address || "",

    city:
      tutor?.city || "",

    state:
      tutor?.state || "",

    teachingLevel:
      arrayFromValue(
        tutor?.teaching_level
      ),

    assignments,

    classes,

    subjects,

    yearsExperience:
      tutor?.years_experience || "",

    currentOccupation:
      tutor?.current_occupation || "",

    highestQualification:
      tutor?.highest_qualification ||
      "",

    institution:
      tutor?.institution || "",

    courseOfStudy:
      tutor?.course_of_study || "",

    graduationYear:
      tutor?.graduation_year || "",

    professionalCertification:
      tutor?.professional_certification ||
      "",

    availableDays:
      arrayFromValue(
        tutor?.available_days
      ),

    availableFrom:
      tutor?.available_from || "",

    availableTo:
      tutor?.available_to || "",

    preferredMode:
      tutor?.preferred_mode || "",

    motivation:
      tutor?.motivation || "",

    teachingExperience:
      tutor?.teaching_experience || "",

    agreement:
      Boolean(tutor?.agreement),

    profileImageUrl:
      tutor?.profile_image_url || "",

    profileImage:
      tutor?.profile_image_url || "",
  };
}

/* =========================================================
   TASK UPLOAD
========================================================= */

const TASK_UPLOAD_DIR = path.resolve(
  process.cwd(),
  "uploads",
  "tasks"
);

fs.mkdirSync(
  TASK_UPLOAD_DIR,
  { recursive: true }
);

const TASK_MIME_TYPES = new Set([
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

const taskStorage =
  multer.diskStorage({
    destination: (
      _req,
      _file,
      callback
    ) => {
      callback(
        null,
        TASK_UPLOAD_DIR
      );
    },

    filename: (
      _req,
      file,
      callback
    ) => {
      const ext = path
        .extname(
          file.originalname
        )
        .replace(
          /[^a-zA-Z0-9.]/g,
          ""
        )
        .toLowerCase();

      callback(
        null,
        `${Date.now()}-${crypto
          .randomBytes(6)
          .toString("hex")}${ext}`
      );
    },
  });

const taskUpload = multer({
  storage: taskStorage,

  limits: {
    fileSize:
      250 * 1024 * 1024,
    files: 10,
  },

  fileFilter: (
    _req,
    file,
    callback
  ) => {
    if (
      TASK_MIME_TYPES.has(
        file.mimetype
      )
    ) {
      return callback(
        null,
        true
      );
    }

    const error = new Error(
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
   PROFILE IMAGE UPLOAD
========================================================= */

const PROFILE_UPLOAD_DIR =
  path.resolve(
    process.cwd(),
    "uploads",
    "tutors"
  );

fs.mkdirSync(
  PROFILE_UPLOAD_DIR,
  { recursive: true }
);

const profileStorage =
  multer.diskStorage({
    destination: (
      _req,
      _file,
      callback
    ) => {
      callback(
        null,
        PROFILE_UPLOAD_DIR
      );
    },

    filename: (
      _req,
      file,
      callback
    ) => {
      const ext = path
        .extname(
          file.originalname
        )
        .toLowerCase();

      callback(
        null,
        `tutor-${Date.now()}-${crypto
          .randomBytes(6)
          .toString("hex")}${ext}`
      );
    },
  });

const profileUpload = multer({
  storage: profileStorage,

  limits: {
    fileSize:
      10 * 1024 * 1024,
  },

  fileFilter: (
    _req,
    file,
    callback
  ) => {
    if (
      [
        "image/jpeg",
        "image/png",
        "image/webp",
      ].includes(
        file.mimetype
      )
    ) {
      return callback(
        null,
        true
      );
    }

    const error = new Error(
      "Only JPG, PNG and WebP images are allowed."
    );

    error.code =
      "INVALID_PROFILE_IMAGE";

    callback(
      error,
      false
    );
  },
});

/* =========================================================
   FILE HELPERS
========================================================= */

function getAttachmentType(
  mime
) {
  if (mime.startsWith("video/"))
    return "video";

  if (mime.startsWith("image/"))
    return "image";

  if (mime === "application/pdf")
    return "pdf";

  return "document";
}

function buildAttachments(files) {
  return (files || []).map(
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
  files
) {
  for (const file of files || []) {
    try {
      if (
        file?.path &&
        fs.existsSync(file.path)
      ) {
        fs.unlinkSync(file.path);
      }
    } catch (error) {
      console.error(
        "File cleanup error:",
        error.message
      );
    }
  }
}

/* =========================================================
   HEALTH
========================================================= */

router.get(
  "/health",
  async (_req, res) => {
    try {
      await pool.query(
        "SELECT 1"
      );

      res.json({
        success: true,
        service: "academy",
        database: true,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        database: false,
        message:
          error.message,
      });
    }
  }
);

/* =========================================================
   TUTOR APPLICATION
========================================================= */

router.post(
  "/tutor-application",
  async (req, res) => {
    try {
      const body =
        req.body || {};

      const firstName = clean(
        body.firstName ||
          body.first_name
      );

      const middleName = clean(
        body.middleName ||
          body.middle_name
      );

      const lastName = clean(
        body.lastName ||
          body.last_name
      );

      const name =
        clean(
          body.name ||
            body.fullName ||
            body.full_name
        ) ||
        [
          firstName,
          middleName,
          lastName,
        ]
          .filter(Boolean)
          .join(" ");

      const email =
        normalizeEmail(
          body.email
        );

      const phone = clean(
        body.phone ||
          body.phoneNumber ||
          body.phone_number
      );

      const assignments =
        normalizeAssignments(
          body.assignments ||
            body.teaching_assignments ||
            body.class_subject_assignments
        );

      let classes;

      let subjects;

      if (assignments.length) {
        classes = uniqueArray(
          assignments.map(
            (item) => item.class
          )
        );

        subjects = uniqueArray(
          assignments.flatMap(
            (item) =>
              item.subjects
          )
        );
      } else {
        classes = uniqueArray(
          arrayFromValue(
            body.classes ||
              body.class ||
              body.grades
          )
        ).map(
          (item) =>
            getCanonicalClass(
              item
            ) || item
        );

        subjects = uniqueArray(
          arrayFromValue(
            body.subjects ||
              body.subject
          )
        );
      }

      if (!name) {
        return res.status(400).json({
          success: false,
          message:
            "Full name is required.",
        });
      }

      if (!email) {
        return res.status(400).json({
          success: false,
          message:
            "Email address is required.",
        });
      }

      if (!phone) {
        return res.status(400).json({
          success: false,
          message:
            "Phone number is required.",
        });
      }

      if (!classes.length) {
        return res.status(400).json({
          success: false,
          message:
            "At least one class is required.",
        });
      }

      if (!subjects.length) {
        return res.status(400).json({
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
        return res.status(400).json({
          success: false,
          message:
            `Invalid class: ${invalidClass}.`,
        });
      }

      const existing =
        await pool.query(
          `
            SELECT *
            FROM academy_tutor_applications
            WHERE LOWER(email) = $1
            ORDER BY created_at DESC
            LIMIT 1
          `,
          [email]
        );

      if (existing.rows.length) {
        return res.status(409).json({
          success: false,
          code:
            "ALREADY_REGISTERED",
          message:
            "A tutor application already exists for this email.",
          application:
            existing.rows[0],
          applicationReference:
            getTutorReference(
              existing.rows[0]
            ),
        });
      }

      const reference =
        `TUT-${Date.now()}-${crypto
          .randomBytes(4)
          .toString("hex")
          .toUpperCase()}`;

      const teachingLevel =
        uniqueArray(
          arrayFromValue(
            body.teachingLevel ||
              body.teaching_level
          )
        );

      const availableDays =
        uniqueArray(
          arrayFromValue(
            body.availableDays ||
              body.available_days
          )
        );

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

            first_name,
            middle_name,
            last_name,
            gender,
            date_of_birth,
            address,
            city,
            state,
            teaching_level,
            assignments,
            years_experience,
            current_occupation,
            highest_qualification,
            institution,
            course_of_study,
            graduation_year,
            professional_certification,
            available_days,
            available_from,
            available_to,
            preferred_mode,
            motivation,
            teaching_experience,
            agreement,

            created_at,
            updated_at
          )
          VALUES (
            $1,$2,$3,$4,$5,$6,$7,$8,
            $9,$10,$11,$12,$13,$14,$15,$16,
            $17::jsonb,$18::jsonb,$19,$20,$21,
            $22,$23,$24,$25,$26::jsonb,$27,$28,
            $29,$30,$31,$32,
            NOW(),NOW()
          )
          RETURNING *
          `,
          [
            reference,
            name,
            email,
            phone,
            clean(
              body.location
            ) || null,

            JSON.stringify(
              classes
            ),

            JSON.stringify(
              subjects
            ),

            "pending",

            firstName || null,
            middleName || null,
            lastName || null,

            clean(body.gender) ||
              null,

            clean(
              body.dateOfBirth ||
                body.date_of_birth
            ) || null,

            clean(
              body.address
            ) || null,

            clean(
              body.city
            ) || null,

            clean(
              body.state
            ) || null,

            JSON.stringify(
              teachingLevel
            ),

            JSON.stringify(
              assignments
            ),

            clean(
              body.yearsExperience ||
                body.years_experience
            ) || null,

            clean(
              body.currentOccupation ||
                body.current_occupation
            ) || null,

            clean(
              body.highestQualification ||
                body.highest_qualification
            ) || null,

            clean(
              body.institution ||
                body.institution_name
            ) || null,

            clean(
              body.courseOfStudy ||
                body.course_of_study
            ) || null,

            clean(
              body.graduationYear ||
                body.graduation_year
            ) || null,

            clean(
              body.professionalCertification ||
                body.professional_certification
            ) || null,

            JSON.stringify(
              availableDays
            ),

            clean(
              body.availableFrom ||
                body.available_from
            ) || null,

            clean(
              body.availableTo ||
                body.available_to
            ) || null,

            clean(
              body.preferredMode ||
                body.preferred_mode
            ) || null,

            clean(
              body.motivation
            ) || null,

            clean(
              body.teachingExperience ||
                body.teaching_experience
            ) || null,

            Boolean(
              body.agreement
            ),
          ]
        );

      const tutor =
        serializeTutorProfile(
          result.rows[0]
        );

      return res.status(201).json({
        success: true,

        message:
          "Tutor application submitted successfully.",

        applicationReference:
          reference,

        reference,

        applicationId:
          result.rows[0]?.id ||
          null,

        assignments:
          tutor.assignments,

        classes:
          tutor.classes,

        subjects:
          tutor.subjects,

        application:
          result.rows[0],

        tutor,
      });
    } catch (error) {
      console.error(
        "Tutor application error:",
        error
      );

      res.status(500).json({
        success: false,
        code:
          error.code ||
          "TUTOR_APPLICATION_ERROR",
        message:
          error.message ||
          "Unable to submit tutor application.",
        detail:
          error.detail || null,
        column:
          error.column || null,
      });
    }
  }
);

/* =========================================================
   TUTOR PROFILE
========================================================= */

router.get(
  "/tutor/profile",
  async (req, res) => {
    try {
      const reference =
        clean(
          req.query?.reference ||
            req.query?.tutorReference ||
            req.query?.tutor_reference ||
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

      const tutor =
        await findTutorByReference(
          reference
        );

      if (!tutor) {
        return res.status(404).json({
          success: false,
          code:
            "TUTOR_NOT_FOUND",
          message:
            "Tutor profile could not be found.",
        });
      }

      const profile =
        serializeTutorProfile(
          tutor
        );

      return res.json({
        success: true,
        profile,
        tutor: profile,
        data: profile,
      });
    } catch (error) {
      console.error(
        "Tutor profile error:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          error.message ||
          "Unable to load tutor profile.",
      });
    }
  }
);

/* =========================================================
   UPDATE TUTOR PROFILE
========================================================= */

router.patch(
  "/tutor/profile",
  async (req, res) => {
    try {
      const body =
        req.body || {};

      const reference =
        clean(
          body.reference ||
            body.tutorReference ||
            body.tutor_reference ||
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

      const current =
        await findTutorByReference(
          reference
        );

      if (!current) {
        return res.status(404).json({
          success: false,
          message:
            "Tutor profile not found.",
        });
      }

      const has = (key) =>
        Object.prototype.hasOwnProperty.call(
          body,
          key
        );

      const firstName = has(
        "firstName"
      ) || has("first_name")
        ? clean(
            body.firstName ||
              body.first_name
          )
        : clean(
            current.first_name
          );

      const middleName = has(
        "middleName"
      ) || has("middle_name")
        ? clean(
            body.middleName ||
              body.middle_name
          )
        : clean(
            current.middle_name
          );

      const lastName = has(
        "lastName"
      ) || has("last_name")
        ? clean(
            body.lastName ||
              body.last_name
          )
        : clean(
            current.last_name
          );

      const name =
        [
          firstName,
          middleName,
          lastName,
        ]
          .filter(Boolean)
          .join(" ") ||
        clean(current.name);

      let assignments =
        getTutorAssignments(
          current
        );

      if (
        has("assignments") ||
        has("teaching_assignments") ||
        has("class_subject_assignments")
      ) {
        assignments =
          normalizeAssignments(
            body.assignments ||
              body.teaching_assignments ||
              body.class_subject_assignments
          );
      }

      let classes =
        getTutorClasses(
          current
        );

      let subjects =
        getTutorSubjects(
          current
        );

      if (assignments.length) {
        classes = uniqueArray(
          assignments.map(
            (item) => item.class
          )
        );

        subjects = uniqueArray(
          assignments.flatMap(
            (item) =>
              item.subjects
          )
        );
      } else {
        if (
          has("classes") ||
          has("grades")
        ) {
          classes = uniqueArray(
            arrayFromValue(
              body.classes ||
                body.grades
            )
          );
        }

        if (
          has("subjects") ||
          has("subject")
        ) {
          subjects = uniqueArray(
            arrayFromValue(
              body.subjects ||
                body.subject
            )
          );
        }
      }

      const teachingLevel =
        has("teachingLevel") ||
        has("teaching_level")
          ? uniqueArray(
              arrayFromValue(
                body.teachingLevel ||
                  body.teaching_level
              )
            )
          : arrayFromValue(
              current.teaching_level
            );

      const availableDays =
        has("availableDays") ||
        has("available_days")
          ? uniqueArray(
              arrayFromValue(
                body.availableDays ||
                  body.available_days
              )
            )
          : arrayFromValue(
              current.available_days
            );

      const result =
        await pool.query(
          `
          UPDATE academy_tutor_applications
          SET
            name = $1,
            email = $2,
            phone = $3,
            first_name = $4,
            middle_name = $5,
            last_name = $6,
            gender = $7,
            date_of_birth = $8,
            address = $9,
            city = $10,
            state = $11,
            teaching_level = $12::jsonb,
            assignments = $13::jsonb,
            classes = $14,
            subjects = $15,
            years_experience = $16,
            current_occupation = $17,
            highest_qualification = $18,
            institution = $19,
            course_of_study = $20,
            graduation_year = $21,
            professional_certification = $22,
            available_days = $23::jsonb,
            available_from = $24,
            available_to = $25,
            preferred_mode = $26,
            motivation = $27,
            teaching_experience = $28,
            agreement = $29,
            updated_at = NOW()
          WHERE reference = $30
          RETURNING *
          `,
          [
            name,

            has("email")
              ? normalizeEmail(
                  body.email
                )
              : current.email,

            has("phone")
              ? clean(body.phone)
              : current.phone,

            firstName || null,
            middleName || null,
            lastName || null,

            has("gender")
              ? clean(body.gender)
              : current.gender,

            has("dateOfBirth") ||
            has("date_of_birth")
              ? clean(
                  body.dateOfBirth ||
                    body.date_of_birth
                )
              : current.date_of_birth,

            has("address")
              ? clean(body.address)
              : current.address,

            has("city")
              ? clean(body.city)
              : current.city,

            has("state")
              ? clean(body.state)
              : current.state,

            JSON.stringify(
              teachingLevel
            ),

            JSON.stringify(
              assignments
            ),

            JSON.stringify(
              classes
            ),

            JSON.stringify(
              subjects
            ),

            has("yearsExperience") ||
            has("years_experience")
              ? clean(
                  body.yearsExperience ||
                    body.years_experience
                )
              : current.years_experience,

            has("currentOccupation") ||
            has("current_occupation")
              ? clean(
                  body.currentOccupation ||
                    body.current_occupation
                )
              : current.current_occupation,

            has("highestQualification") ||
            has("highest_qualification")
              ? clean(
                  body.highestQualification ||
                    body.highest_qualification
                )
              : current.highest_qualification,

            has("institution")
              ? clean(body.institution)
              : current.institution,

            has("courseOfStudy") ||
            has("course_of_study")
              ? clean(
                  body.courseOfStudy ||
                    body.course_of_study
                )
              : current.course_of_study,

            has("graduationYear") ||
            has("graduation_year")
              ? clean(
                  body.graduationYear ||
                    body.graduation_year
                )
              : current.graduation_year,

            has("professionalCertification") ||
            has("professional_certification")
              ? clean(
                  body.professionalCertification ||
                    body.professional_certification
                )
              : current.professional_certification,

            JSON.stringify(
              availableDays
            ),

            has("availableFrom") ||
            has("available_from")
              ? clean(
                  body.availableFrom ||
                    body.available_from
                )
              : current.available_from,

            has("availableTo") ||
            has("available_to")
              ? clean(
                  body.availableTo ||
                    body.available_to
                )
              : current.available_to,

            has("preferredMode") ||
            has("preferred_mode")
              ? clean(
                  body.preferredMode ||
                    body.preferred_mode
                )
              : current.preferred_mode,

            has("motivation")
              ? clean(body.motivation)
              : current.motivation,

            has("teachingExperience") ||
            has("teaching_experience")
              ? clean(
                  body.teachingExperience ||
                    body.teaching_experience
                )
              : current.teaching_experience,

            has("agreement")
              ? Boolean(body.agreement)
              : Boolean(
                  current.agreement
                ),

            reference,
          ]
        );

      const profile =
        serializeTutorProfile(
          result.rows[0]
        );

      return res.json({
        success: true,
        message:
          "Tutor profile updated successfully.",
        profile,
        tutor: profile,
      });
    } catch (error) {
      console.error(
        "Tutor profile update error:",
        error
      );

      res.status(500).json({
        success: false,
        code:
          error.code ||
          "TUTOR_PROFILE_UPDATE_ERROR",
        message:
          error.message ||
          "Unable to update tutor profile.",
      });
    }
  }
);

/* =========================================================
   TUTOR PROFILE IMAGE
========================================================= */

router.post(
  "/tutor/profile/image",
  profileUpload.single(
    "profileImage"
  ),
  async (req, res) => {
    try {
      const reference =
        clean(
          req.body?.reference ||
            req.body?.tutorReference ||
            req.body?.tutor_reference ||
            req.headers[
              "x-tutor-reference"
            ]
        );

      if (!reference) {
        if (req.file) {
          deleteUploadedFiles([
            req.file,
          ]);
        }

        return res.status(400).json({
          success: false,
          message:
            "Tutor reference is required.",
        });
      }

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message:
            "Profile image is required.",
        });
      }

      const tutor =
        await findTutorByReference(
          reference
        );

      if (!tutor) {
        deleteUploadedFiles([
          req.file,
        ]);

        return res.status(404).json({
          success: false,
          message:
            "Tutor profile not found.",
        });
      }

      const imageUrl =
        `/uploads/tutors/${req.file.filename}`;

      await pool.query(
        `
          UPDATE academy_tutor_applications
          SET
            profile_image_url = $1,
            updated_at = NOW()
          WHERE reference = $2
        `,
        [
          imageUrl,
          getTutorReference(
            tutor
          ),
        ]
      );

      const oldImage =
        tutor.profile_image_url;

      if (
        oldImage &&
        oldImage.startsWith(
          "/uploads/tutors/"
        )
      ) {
        const oldPath =
          path.resolve(
            process.cwd(),
            oldImage.replace(
              /^\//,
              ""
            )
          );

        if (
          fs.existsSync(oldPath)
        ) {
          try {
            fs.unlinkSync(
              oldPath
            );
          } catch {}
        }
      }

      return res.json({
        success: true,
        message:
          "Profile image updated successfully.",
        profileImageUrl:
          imageUrl,
        profileImage:
          imageUrl,
      });
    } catch (error) {
      if (req.file) {
        deleteUploadedFiles([
          req.file,
        ]);
      }

      console.error(
        "Profile image error:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          error.message ||
          "Unable to update profile image.",
      });
    }
  }
);

/* =========================================================
   TUTOR LOGIN
========================================================= */

router.post(
  "/tutor-login",
  async (req, res) => {
    try {
      const fullName = clean(
        req.body?.registeredFullName ||
          req.body?.fullName ||
          req.body?.full_name ||
          req.body?.name
      );

      const reference = clean(
        req.body?.reference ||
          req.body?.referenceId ||
          req.body?.reference_id ||
          req.body?.tutorReference ||
          req.body?.tutor_reference
      );

      if (!fullName) {
        return res.status(400).json({
          success: false,
          code:
            "REGISTERED_NAME_REQUIRED",
          message:
            "Registered Full Name is required.",
        });
      }

      if (!reference) {
        return res.status(400).json({
          success: false,
          code:
            "REFERENCE_ID_REQUIRED",
          message:
            "Reference ID is required.",
        });
      }

      const tutor =
        await findTutorByReference(
          reference
        );

      if (
        !tutor ||
        normalizeName(
          getTutorName(tutor)
        ) !==
          normalizeName(
            fullName
          )
      ) {
        return res.status(404).json({
          success: false,
          code:
            "INVALID_TUTOR_LOGIN",
          message:
            "The Registered Full Name and Reference ID do not match.",
        });
      }

      const status =
        normalizeStatus(
          tutor.application_status
        );

      if (status !== "verified") {
        return res.status(403).json({
          success: false,
          code:
            "TUTOR_NOT_VERIFIED",
          message:
            status === "rejected"
              ? "Your tutor application was rejected."
              : "Your tutor application is still pending review.",
          status:
            tutor.application_status ||
            "pending",
        });
      }

      const profile =
        serializeTutorProfile(
          tutor
        );

      return res.json({
        success: true,
        message:
          "Tutor login successful.",
        reference:
          profile.reference,
        tutorReference:
          profile.reference,
        registeredFullName:
          profile.name,
        tutor: profile,
        user: profile,
      });
    } catch (error) {
      console.error(
        "Tutor login error:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          error.message ||
          "Unable to continue.",
      });
    }
  }
);

/* =========================================================
   GET TUTOR CLASSES
========================================================= */

router.get(
  "/tutor/classes",
  async (req, res) => {
    try {
      const reference =
        clean(
          req.query?.reference ||
            req.query?.tutorReference ||
            req.query?.tutor_reference
        );

      /* Registration mode */
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
          mode: "registration",
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
          assignments: [],
          hasAssignments: false,
          assignmentCount: 0,
        });
      }

      const tutor =
        await findTutorByReference(
          reference
        );

      if (!tutor) {
        return res.status(404).json({
          success: false,
          code:
            "TUTOR_NOT_FOUND",
          message:
            "Tutor account could not be found.",
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
        });
      }

      const tutorClasses =
        getTutorClasses(tutor);

      const assignments =
        getTutorAssignments(
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
        studentsResult.rows || [];

      const studentsByClass = {};

      for (
        const grade of tutorClasses
      ) {
        studentsByClass[
          normalizeClass(grade)
        ] = [];
      }

      for (
        const original of students
      ) {
        const studentGrade =
          clean(
            original.grade ||
              original.class ||
              original.class_name
          );

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

        if (!tutorGrade) continue;

        const allowedSubjects =
          getSubjectsForTutorClass(
            tutor,
            tutorGrade
          );

        const studentSubjects =
          arrayFromValue(
            original.subjects ||
              original.subject
          );

        const matchingSubjects =
          studentSubjects.filter(
            (subject) =>
              allowedSubjects.some(
                (allowed) =>
                  subjectsMatch(
                    subject,
                    allowed
                  )
              )
          );

        if (
          studentSubjects.length &&
          !matchingSubjects.length
        ) {
          continue;
        }

        const student =
          serializeStudent(
            original,
            tutorGrade,
            matchingSubjects[0] ||
              ""
          );

        const key =
          normalizeClass(
            tutorGrade
          );

        studentsByClass[key] ||= [];

        if (
          !studentsByClass[key].some(
            (item) =>
              item.enrollmentId ===
              student.enrollmentId
          )
        ) {
          studentsByClass[key].push(
            student
          );
        }
      }

      const classCards =
        tutorClasses.map(
          (rawGrade) => {
            const grade =
              getCanonicalClass(
                rawGrade
              ) || rawGrade;

            const subjects =
              getSubjectsForTutorClass(
                tutor,
                grade
              );

            const students =
              studentsByClass[
                normalizeClass(
                  grade
                )
              ] || [];

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

              subjects,

              subjectCount:
                subjects.length,

              students,

              studentCount:
                students.length,

              activities: [],
              activityCount: 0,
            };
          }
        );

      let activities = [];

      try {
        const result =
          await pool.query(
            `
              SELECT *
              FROM class_activities
              WHERE tutor_reference = $1
              ORDER BY created_at DESC
            `,
            [reference]
          );

        activities =
          result.rows || [];
      } catch {}

      for (
        const card of classCards
      ) {
        card.activities =
          activities.filter(
            (activity) =>
              normalizeClass(
                activity.grade ||
                  activity.class
              ) ===
                normalizeClass(
                  card.grade
                ) &&
              (
                !activity.subject ||
                card.subjects.some(
                  (subject) =>
                    subjectsMatch(
                      subject,
                      activity.subject
                    )
                )
              )
          );

        card.activityCount =
          card.activities.length;
      }

      const profile =
        serializeTutorProfile(
          tutor
        );

      return res.json({
        success: true,
        mode: "tutor",
        reference,
        tutorReference: reference,
        tutor: profile,
        classes: classCards,
        classCards,
        subjectsByClass,
        assignments,
        hasAssignments:
          assignments.length > 0,
        assignmentCount:
          assignments.length,
      });
    } catch (error) {
      console.error(
        "Tutor classes error:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          error.message ||
          "Unable to load tutor classes.",
      });
    }
  }
);

/* =========================================================
   GET ONE TUTOR CLASS
========================================================= */

router.get(
  "/tutor/classes/:grade/:subject",
  async (req, res) => {
    try {
      const reference =
        clean(
          req.query?.reference ||
            req.query?.tutorReference ||
            req.query?.tutor_reference
        );

      const grade =
        clean(req.params.grade);

      const subject =
        clean(req.params.subject);

      if (!reference) {
        return res.status(400).json({
          success: false,
          message:
            "Tutor reference is required.",
        });
      }

      const canonicalClass =
        getCanonicalClass(grade);

      if (!canonicalClass) {
        return res.status(400).json({
          success: false,
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
        return res.status(400).json({
          success: false,
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
          .status(auth.error.status)
          .json({
            success: false,
            code:
              auth.error.code,
            message:
              auth.error.message,
          });
      }

      const result =
        await pool.query(
          `
            SELECT *
            FROM academy_student_enrollments
            ORDER BY created_at DESC
          `
        );

      const students =
        result.rows || [];

      const matchedStudents =
        students
          .filter((student) => {
            const studentGrade =
              clean(
                student.grade ||
                  student.class ||
                  student.class_name
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

            const subjects =
              arrayFromValue(
                student.subjects ||
                  student.subject
              );

            return (
              !subjects.length ||
              subjects.some(
                (item) =>
                  subjectsMatch(
                    item,
                    canonicalSubject
                  )
              )
            );
          })
          .map((student) =>
            serializeStudent(
              student,
              canonicalClass,
              canonicalSubject
            )
          );

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

      const activities =
        (
          activitiesResult.rows ||
          []
        ).filter(
          (item) =>
            !item.subject ||
            subjectsMatch(
              item.subject,
              canonicalSubject
            )
        );

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
      });
    } catch (error) {
      console.error(
        "Tutor class error:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          error.message ||
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
  async (req, res) => {
    const files =
      req.files || [];

    try {
      const reference =
        clean(
          req.body?.reference ||
            req.body?.tutorReference ||
            req.body?.tutor_reference ||
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
          req.body?.subject ||
            req.body?.subjectName
        );

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

      if (!reference) {
        deleteUploadedFiles(files);

        return res.status(400).json({
          success: false,
          message:
            "Tutor reference is required.",
        });
      }

      if (!grade || !subject) {
        deleteUploadedFiles(files);

        return res.status(400).json({
          success: false,
          message:
            "Class and subject are required.",
        });
      }

      if (!title) {
        deleteUploadedFiles(files);

        return res.status(400).json({
          success: false,
          message:
            "Task title is required.",
        });
      }

      const canonicalClass =
        getCanonicalClass(grade);

      const canonicalSubject =
        getMatchingCanonicalSubject(
          canonicalClass,
          subject
        );

      if (
        !canonicalClass ||
        !canonicalSubject
      ) {
        deleteUploadedFiles(files);

        return res.status(400).json({
          success: false,
          message:
            "Invalid class or subject.",
        });
      }

      const auth =
        await getVerifiedTutorForClassSubject(
          reference,
          canonicalClass,
          canonicalSubject
        );

      if (auth.error) {
        deleteUploadedFiles(files);

        return res
          .status(auth.error.status)
          .json({
            success: false,
            code:
              auth.error.code,
            message:
              auth.error.message,
          });
      }

      const attachments =
        buildAttachments(files);

      const metadata = {
        attachments,
        instructions:
          instructions || null,
        dueDate:
          clean(
            req.body?.dueDate ||
              req.body?.due_date
          ) || null,
        maxScore:
          req.body?.maxScore
            ? Number(
                req.body.maxScore
              )
            : null,
        activityType: "task",
        grade:
          canonicalClass,
        class:
          canonicalClass,
        subject:
          canonicalSubject,
      };

      const columns =
        await pool.query(
          `
            SELECT column_name
            FROM information_schema.columns
            WHERE
              table_schema = 'public'
              AND table_name = 'class_activities'
          `
        );

      const available =
        new Set(
          columns.rows.map(
            (row) =>
              row.column_name
          )
        );

      const required = [
        "tutor_reference",
        "grade",
        "subject",
        "activity_type",
        "title",
      ];

      const missing =
        required.filter(
          (column) =>
            !available.has(
              column
            )
        );

      if (missing.length) {
        deleteUploadedFiles(files);

        return res.status(500).json({
          success: false,
          message:
            "class_activities table is missing required columns.",
          missingColumns:
            missing,
        });
      }

      const insertColumns = [
        "tutor_reference",
        "grade",
        "subject",
        "activity_type",
        "title",
      ];

      const values = [
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
        available.has(
          "description"
        )
      ) {
        insertColumns.push(
          "description"
        );

        values.push(
          description || null
        );

        placeholders.push(
          `$${values.length}`
        );
      }

      if (
        available.has("metadata")
      ) {
        insertColumns.push(
          "metadata"
        );

        values.push(
          JSON.stringify(
            metadata
          )
        );

        placeholders.push(
          `$${values.length}::jsonb`
        );
      }

      if (
        available.has("created_at")
      ) {
        insertColumns.push(
          "created_at"
        );

        placeholders.push(
          "NOW()"
        );
      }

      if (
        available.has("updated_at")
      ) {
        insertColumns.push(
          "updated_at"
        );

        placeholders.push(
          "NOW()"
        );
      }

      const result =
        await pool.query(
          `
            INSERT INTO class_activities
            (${insertColumns.join(", ")})
            VALUES
            (${placeholders.join(", ")})
            RETURNING *
          `,
          values
        );

      return res.status(201).json({
        success: true,
        message:
          "Task created successfully.",
        activity:
          result.rows[0],
        task:
          result.rows[0],
        attachments,
      });
    } catch (error) {
      deleteUploadedFiles(files);

      console.error(
        "Create task error:",
        error
      );

      res.status(500).json({
        success: false,
        code:
          error.code ||
          "CREATE_TASK_ERROR",
        message:
          error.message ||
          "Unable to create task.",
      });
    }
  }
);

/* =========================================================
   GET TUTOR ACTIVITIES
========================================================= */

router.get(
  "/tutor/class-activities",
  async (req, res) => {
    try {
      const reference =
        clean(
          req.query?.reference ||
            req.query?.tutorReference ||
            req.query?.tutor_reference ||
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

      const tutor =
        await findTutorByReference(
          reference
        );

      if (!tutor) {
        return res.status(404).json({
          success: false,
          message:
            "Tutor account could not be found.",
        });
      }

      if (
        normalizeStatus(
          tutor.application_status
        ) !== "verified"
      ) {
        return res.status(403).json({
          success: false,
          message:
            "Your tutor account has not been verified yet.",
        });
      }

      const result =
        await pool.query(
          `
            SELECT *
            FROM class_activities
            WHERE tutor_reference = $1
            ORDER BY created_at DESC
          `,
          [reference]
        );

      return res.json({
        success: true,
        reference,
        activities:
          result.rows || [],
        tasks:
          result.rows || [],
      });
    } catch (error) {
      console.error(
        "Get tutor activities error:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          error.message ||
          "Unable to load tasks.",
      });
    }
  }
);

/* =========================================================
   STUDENT ENROLLMENTS
========================================================= */

router.get(
  "/student-enrollments",
  async (_req, res) => {
    try {
      const result =
        await pool.query(
          `
            SELECT *
            FROM academy_student_enrollments
            ORDER BY created_at DESC
          `
        );

      const students =
        result.rows.map(
          (student) =>
            serializeStudent(
              student
            )
        );

      res.json({
        success: true,
        enrollments:
          result.rows,
        students,
        data:
          result.rows,
        count:
          result.rows.length,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message:
          error.message ||
          "Unable to load student enrollments.",
      });
    }
  }
);

router.get(
  "/admin/enrollments",
  async (_req, res) => {
    try {
      const result =
        await pool.query(
          `
            SELECT *
            FROM academy_student_enrollments
            ORDER BY created_at DESC
          `
        );

      res.json({
        success: true,
        enrollments:
          result.rows,
        students:
          result.rows.map(
            serializeStudent
          ),
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message:
          error.message,
      });
    }
  }
);

/* =========================================================
   ADMIN TUTORS
========================================================= */

router.get(
  "/admin/tutors",
  async (_req, res) => {
    try {
      const result =
        await pool.query(
          `
            SELECT *
            FROM academy_tutor_applications
            ORDER BY created_at DESC
          `
        );

      res.json({
        success: true,
        tutors:
          result.rows,
        data:
          result.rows,
        count:
          result.rows.length,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message:
          error.message ||
          "Unable to load tutors.",
      });
    }
  }
);

router.get(
  "/admin/tutor/:reference",
  async (req, res) => {
    try {
      const tutor =
        await findTutorByReference(
          req.params.reference
        );

      if (!tutor) {
        return res.status(404).json({
          success: false,
          message:
            "Tutor not found.",
        });
      }

      res.json({
        success: true,
        tutor:
          serializeTutorProfile(
            tutor
          ),
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message:
          error.message,
      });
    }
  }
);

/* =========================================================
   ADMIN TUTOR STATUS
========================================================= */

router.patch(
  "/admin/tutor/:reference/status",
  async (req, res) => {
    try {
      const status =
        clean(
          req.body?.status ||
            req.body?.application_status
        ).toLowerCase();

      if (
        ![
          "pending",
          "verified",
          "rejected",
        ].includes(status)
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid tutor status.",
        });
      }

      const tutor =
        await findTutorByReference(
          req.params.reference
        );

      if (!tutor) {
        return res.status(404).json({
          success: false,
          message:
            "Tutor not found.",
        });
      }

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
            getTutorReference(
              tutor
            ),
          ]
        );

      res.json({
        success: true,
        message:
          `Tutor status updated to ${status}.`,
        tutor:
          result.rows[0],
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message:
          error.message,
      });
    }
  }
);

/* =========================================================
   ADMIN STUDENT STATUS
========================================================= */

router.patch(
  "/admin/enrollment/:enrollmentId/status",
  async (req, res) => {
    try {
      const status =
        clean(
          req.body?.status
        ).toLowerCase();

      const allowed = [
        "pending",
        "approved",
        "verified",
        "rejected",
        "active",
        "inactive",
      ];

      if (!allowed.includes(status)) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid enrollment status.",
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
            req.params.enrollmentId,
          ]
        );

      if (!result.rows.length) {
        return res.status(404).json({
          success: false,
          message:
            "Enrollment not found.",
        });
      }

      res.json({
        success: true,
        enrollment:
          result.rows[0],
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message:
          error.message,
      });
    }
  }
);

/* =========================================================
   VERIFY ALL TUTORS
========================================================= */

router.post(
  "/admin/verify-all-statuses",
  async (_req, res) => {
    try {
      const result =
        await pool.query(
          `
            UPDATE academy_tutor_applications
            SET
              application_status = 'verified',
              updated_at = NOW()
            WHERE LOWER(
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

      res.json({
        success: true,
        message:
          "Tutor statuses synchronized.",
        tutors:
          result.rows,
        count:
          result.rows.length,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message:
          error.message,
      });
    }
  }
);

/* =========================================================
   STUDENT ENROLLMENT
========================================================= */

router.post(
  "/student-enrollment",
  async (req, res) => {
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
          body.name
        ) ||
        [
          firstName,
          middleName,
          lastName,
        ]
          .filter(Boolean)
          .join(" ");

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
            body.className ||
            body.class_name
        );

      const subjects =
        uniqueArray(
          arrayFromValue(
            body.subjects ||
              body.subject
          )
        );

      if (!name) {
        return res.status(400).json({
          success: false,
          message:
            "Student name is required.",
        });
      }

      if (!email) {
        return res.status(400).json({
          success: false,
          message:
            "Student email is required.",
        });
      }

      if (!grade) {
        return res.status(400).json({
          success: false,
          message:
            "Class is required.",
        });
      }

      if (!isValidTutorClass(grade)) {
        return res.status(400).json({
          success: false,
          message:
            `Invalid class: ${grade}.`,
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
        return res.status(400).json({
          success: false,
          message:
            `None of the selected subjects are available for ${canonicalClass}.`,
        });
      }

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
              $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,
              'pending',NOW(),NOW()
            )
            RETURNING *
          `,
          [
            firstName || null,
            middleName || null,
            lastName || null,
            name,
            email,
            phone || null,
            canonicalClass,
            JSON.stringify(
              uniqueArray(
                validSubjects
              )
            ),
            clean(
              body.schoolLevel ||
                body.school_level
            ) || null,
            clean(
              body.academicSession ||
                body.academic_session
            ) || null,
          ]
        );

      res.status(201).json({
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

      res.status(500).json({
        success: false,
        message:
          error.message ||
          "Unable to submit student enrollment.",
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
      const email =
        normalizeEmail(
          req.body?.email
        );

      if (!email) {
        return res.status(400).json({
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
          [email]
        );

      if (!result.rows.length) {
        return res.status(404).json({
          success: false,
          message:
            "No student enrollment was found for this email.",
        });
      }

      const student =
        result.rows[0];

      res.json({
        success: true,
        message:
          "Student login successful.",
        student,
        user: student,
        enrollment: student,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message:
          error.message ||
          "Unable to continue.",
      });
    }
  }
);

/* =========================================================
   STUDENT PROFILE
========================================================= */

router.get(
  "/student/:userId",
  async (req, res) => {
    try {
      const result =
        await pool.query(
          `
            SELECT *
            FROM academy_student_enrollments
            WHERE id = $1
            LIMIT 1
          `,
          [req.params.userId]
        );

      if (!result.rows.length) {
        return res.status(404).json({
          success: false,
          message:
            "Student not found.",
        });
      }

      res.json({
        success: true,
        student:
          result.rows[0],
        user:
          result.rows[0],
        enrollment:
          result.rows[0],
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message:
          error.message ||
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
        return res.status(400).json({
          success: false,
          code:
            "FILE_TOO_LARGE",
          message:
            "The uploaded file is too large.",
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
            "Too many files uploaded.",
        });
      }

      return res.status(400).json({
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
      return res.status(400).json({
        success: false,
        code:
          "INVALID_FILE_TYPE",
        message:
          "Only PDF, DOC, DOCX, images, MP4, WebM and MOV are allowed.",
      });
    }

    if (
      error?.code ===
      "INVALID_PROFILE_IMAGE"
    ) {
      return res.status(400).json({
        success: false,
        code:
          "INVALID_PROFILE_IMAGE",
        message:
          "Only JPG, PNG and WebP profile images are allowed.",
      });
    }

    console.error(
      "Academy route error:",
      error
    );

    return res.status(500).json({
      success: false,
      code:
        error?.code ||
        "ACADEMY_ROUTE_ERROR",
      message:
        error?.message ||
        "Unable to continue.",
    });
  }
);

export default router;