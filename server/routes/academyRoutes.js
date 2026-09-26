import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import pool from "../lib/db.js";

const router = express.Router();

/* =========================================================
   BASIC HELPERS
========================================================= */

const clean = (value) =>
  value === undefined || value === null
    ? ""
    : String(value).trim();

const normalizeEmail = (value) =>
  clean(value).toLowerCase();

const normalizeName = (value) =>
  clean(value).replace(/\s+/g, " ");

const uniqueArray = (value) =>
  Array.isArray(value)
    ? [...new Set(value.map(clean).filter(Boolean))]
    : [];

const parseArray = (value) => {
  if (Array.isArray(value)) return value;

  if (!value) return [];

  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return value
        .split(",")
        .map(clean)
        .filter(Boolean);
    }
  }

  return [];
};

const parseJson = (value, fallback = {}) => {
  if (!value) return fallback;

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
   SUBJECTS
========================================================= */

const SUBJECT_ALIASES = {
  Maths: "Mathematics",
  Mathematics: "Mathematics",

  "English Studies": "English Language",
  "English Language": "English Language",

  ICT: "Computer Studies",
  "Computer Science": "Computer Studies",
  "Computer Studies": "Computer Studies",

  CRS: "Christian Religious Studies",
  CRK: "Christian Religious Studies",
  "Christian Religious Studies":
    "Christian Religious Studies",

  IRS: "Islamic Religious Studies",
  IRK: "Islamic Religious Studies",
  "Islamic Religious Studies":
    "Islamic Religious Studies",

  PHE: "Physical Education",
  "Physical Education": "Physical Education",

  "Basic Science": "Basic Science",
  "Basic Technology": "Basic Technology",

  Physics: "Physics",
  Chemistry: "Chemistry",
  Biology: "Biology",
  Economics: "Economics",
  Government: "Government",
  Geography: "Geography",
  "Agricultural Science": "Agricultural Science",
  "Literature in English": "Literature in English",
  Commerce: "Commerce",
  Accounting: "Accounting",
  "Social Studies": "Social Studies",
  Yoruba: "Yoruba",
  Igbo: "Igbo",
  Hausa: "Hausa",
  "Further Mathematics": "Further Mathematics",
  "Home Economics": "Home Economics",
  "Fine Arts": "Fine Arts",
  "Visual Arts": "Visual Arts",
  Music: "Music",
  "Civic Education": "Civic Education",
};

const normalizeSubject = (value) => {
  const subject = clean(value);

  if (!subject) return "";

  const match = Object.keys(SUBJECT_ALIASES).find(
    (key) => key.toLowerCase() === subject.toLowerCase()
  );

  return match ? SUBJECT_ALIASES[match] : subject;
};

const subjectsMatch = (a, b) =>
  normalizeSubject(a).toLowerCase() ===
  normalizeSubject(b).toLowerCase();

/* =========================================================
   CLASSES
========================================================= */

const normalizeClass = (value) =>
  clean(value)
    .replace(/\s+/g, " ")
    .toUpperCase();

const classesMatch = (a, b) =>
  normalizeClass(a) === normalizeClass(b);

/* =========================================================
   TUTOR ASSIGNMENTS
========================================================= */

const normalizeAssignments = (value) =>
  parseArray(value)
    .map((item) => {
      if (!item || typeof item !== "object") {
        return null;
      }

      const className = clean(
        item.class ||
          item.grade ||
          item.className ||
          item.class_name
      );

      const subjects = uniqueArray(
        parseArray(
          item.subjects ||
            item.subject ||
            item.subjectNames ||
            item.subject_names
        )
      ).map(normalizeSubject);

      if (!className) return null;

      return {
        class: className,
        subjects,
      };
    })
    .filter(Boolean);

const getClassesFromAssignments = (assignments) =>
  uniqueArray(
    assignments.map((item) => item.class)
  );

const getSubjectsFromAssignments = (assignments) =>
  uniqueArray(
    assignments.flatMap(
      (item) => item.subjects || []
    )
  ).map(normalizeSubject);

const getTutorSubjectsForClass = (
  tutor,
  className
) => {
  const assignments = normalizeAssignments(
    tutor.assignments
  );

  const assignment = assignments.find(
    (item) =>
      classesMatch(item.class, className)
  );

  return assignment?.subjects || [];
};

/* =========================================================
   TUTOR HELPERS
========================================================= */

const getTutorName = (tutor) =>
  normalizeName(
    [
      tutor.first_name,
      tutor.middle_name,
      tutor.last_name,
    ]
      .filter(Boolean)
      .join(" ")
  );

const findTutorByReference = async (reference) => {
  const ref = clean(reference);

  if (!ref) return null;

  const result = await pool.query(
    `
      SELECT *
      FROM academy_tutor_applications
      WHERE reference = $1
      LIMIT 1
    `,
    [ref]
  );

  return result.rows[0] || null;
};

const getTutorReferenceFromRequest = (req) =>
  clean(
    req.headers["x-tutor-reference"] ||
      req.query.reference ||
      req.query.tutorReference ||
      req.body?.reference ||
      req.body?.tutorReference ||
      req.body?.tutor_reference
  );

const isTutorVerified = (tutor) =>
  clean(tutor.application_status).toLowerCase() ===
  "verified";

/* =========================================================
   TUTOR SERIALIZER
========================================================= */

const serializeTutor = (tutor) => {
  const assignments = normalizeAssignments(
    tutor.assignments
  );

  const classes = getClassesFromAssignments(
    assignments
  );

  const subjects = getSubjectsFromAssignments(
    assignments
  );

  return {
    id: tutor.id,
    reference: tutor.reference,
    applicationReference: tutor.reference,

    firstName: tutor.first_name || "",
    middleName: tutor.middle_name || "",
    lastName: tutor.last_name || "",

    name: getTutorName(tutor),

    email: tutor.email || "",
    phone: tutor.phone || "",
    gender: tutor.gender || "",
    dateOfBirth: tutor.date_of_birth || "",

    address: tutor.address || "",
    city: tutor.city || "",
    state: tutor.state || "",

    qualification:
      tutor.qualification ||
      tutor.highest_qualification ||
      "",

    highestQualification:
      tutor.highest_qualification ||
      tutor.qualification ||
      "",

    specialization:
      tutor.specialization || "",

    institution:
      tutor.institution || "",

    courseOfStudy:
      tutor.course_of_study || "",

    graduationYear:
      tutor.graduation_year || "",

    professionalCertification:
      tutor.professional_certification || "",

    experience:
      tutor.experience ||
      tutor.teaching_experience ||
      "",

    yearsExperience:
      tutor.years_experience || "",

    teachingExperience:
      tutor.teaching_experience ||
      tutor.experience ||
      "",

    currentOccupation:
      tutor.current_occupation || "",

    teachingLevel:
      parseArray(tutor.teaching_level),

    subjects,
    classes,
    assignments,

    availableDays:
      parseArray(tutor.available_days),

    availableFrom:
      tutor.available_from || "",

    availableTo:
      tutor.available_to || "",

    preferredMode:
      tutor.preferred_mode || "",

    motivation:
      tutor.motivation || "",

    bio:
      parseJson(tutor.bio, {}),

    agreement:
      tutor.agreement === true,

    profileImageUrl:
      tutor.profile_image_url || "",

    profileImage:
      tutor.profile_image_url || "",

    applicationStatus:
      tutor.application_status || "",

    accountStatus:
      tutor.account_status || "",

    emailVerified:
      tutor.email_verified === true,

    createdAt: tutor.created_at,
    updatedAt: tutor.updated_at,
  };
};

/* =========================================================
   TUTOR CLASS + SUBJECT VERIFICATION
========================================================= */

const verifyTutorClassSubject = async (
  reference,
  grade,
  subject
) => {
  const tutor = await findTutorByReference(
    reference
  );

  if (!tutor) {
    return {
      ok: false,
      status: 404,
      message: "Tutor not found.",
    };
  }

  if (!isTutorVerified(tutor)) {
    return {
      ok: false,
      status: 403,
      message:
        "Your tutor account has not been verified.",
    };
  }

  const assignments = normalizeAssignments(
    tutor.assignments
  );

  const assignment = assignments.find(
    (item) =>
      classesMatch(item.class, grade)
  );

  if (!assignment) {
    return {
      ok: false,
      status: 403,
      message:
        "You are not assigned to this class.",
    };
  }

  const normalizedSubject =
    normalizeSubject(subject);

  const allowed = assignment.subjects.some(
    (item) =>
      subjectsMatch(
        item,
        normalizedSubject
      )
  );

  if (!allowed) {
    return {
      ok: false,
      status: 403,
      message:
        "You are not assigned to this subject for this class.",
    };
  }

  return {
    ok: true,
    tutor,
    assignment,
    subject: normalizedSubject,
  };
};

/* =========================================================
   FILE UPLOADS
========================================================= */

const uploadRoot = path.join(
  process.cwd(),
  "uploads"
);

const tutorUploadDir = path.join(
  uploadRoot,
  "tutors"
);

const taskUploadDir = path.join(
  uploadRoot,
  "tasks"
);

const submissionUploadDir = path.join(
  uploadRoot,
  "task-submissions"
);

[
  tutorUploadDir,
  taskUploadDir,
  submissionUploadDir,
].forEach((directory) =>
  fs.mkdirSync(directory, {
    recursive: true,
  })
);

/* =========================================================
   ALLOWED TASK FILE TYPES
========================================================= */

const allowedTaskMimeTypes = [
  "application/pdf",

  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",

  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",

  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",

  "text/plain",
  "text/csv",

  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",

  "audio/mpeg",
  "audio/mp3",
  "audio/wav",
  "audio/ogg",

  "video/mp4",
  "video/webm",
  "video/quicktime",

  "application/zip",
  "application/x-zip-compressed",
];

/* =========================================================
   FILE NAME
========================================================= */

const safeFileName = (name) =>
  path
    .basename(name)
    .replace(/[^a-zA-Z0-9._-]/g, "-");

/* =========================================================
   TUTOR IMAGE UPLOAD
========================================================= */

const tutorImageStorage =
  multer.diskStorage({
    destination: (req, file, callback) => {
      callback(null, tutorUploadDir);
    },

    filename: (req, file, callback) => {
      const reference =
        getTutorReferenceFromRequest(req)
          .replace(
            /[^a-zA-Z0-9_-]/g,
            ""
          );

      callback(
        null,
        `${
          reference || "tutor"
        }-${Date.now()}${path.extname(
          file.originalname
        ).toLowerCase()}`
      );
    },
  });

const tutorImageUpload = multer({
  storage: tutorImageStorage,

  limits: {
    fileSize: 10 * 1024 * 1024,
  },

  fileFilter: (req, file, callback) => {
    const allowed = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
    ];

    if (!allowed.includes(file.mimetype)) {
      return callback(
        new Error(
          "Only JPG, JPEG, PNG and WEBP images are allowed."
        )
      );
    }

    callback(null, true);
  },
});

/* =========================================================
   TASK FILE UPLOAD
========================================================= */

const taskStorage =
  multer.diskStorage({
    destination: (req, file, callback) => {
      callback(null, taskUploadDir);
    },

    filename: (req, file, callback) => {
      callback(
        null,
        `${Date.now()}-${crypto
          .randomBytes(4)
          .toString("hex")}-${safeFileName(
          file.originalname
        )}`
      );
    },
  });

const taskUpload = multer({
  storage: taskStorage,

  limits: {
    fileSize: 250 * 1024 * 1024,
    files: 10,
  },

  fileFilter: (req, file, callback) => {
    if (
      !allowedTaskMimeTypes.includes(
        file.mimetype
      )
    ) {
      return callback(
        new Error(
          `File type "${file.mimetype}" is not supported.`
        )
      );
    }

    callback(null, true);
  },
});

/* =========================================================
   SUBMISSION FILE UPLOAD
========================================================= */

const submissionStorage =
  multer.diskStorage({
    destination: (req, file, callback) => {
      callback(null, submissionUploadDir);
    },

    filename: (req, file, callback) => {
      callback(
        null,
        `${Date.now()}-${crypto
          .randomBytes(4)
          .toString("hex")}-${safeFileName(
          file.originalname
        )}`
      );
    },
  });

const submissionUpload = multer({
  storage: submissionStorage,

  limits: {
    fileSize: 250 * 1024 * 1024,
    files: 10,
  },

  fileFilter: (req, file, callback) => {
    if (
      !allowedTaskMimeTypes.includes(
        file.mimetype
      )
    ) {
      return callback(
        new Error(
          `File type "${file.mimetype}" is not supported.`
        )
      );
    }

    callback(null, true);
  },
});

/* =========================================================
   FILE SERIALIZATION
========================================================= */

const serializeFile = (
  file,
  folder
) => ({
  originalName:
    file.originalname,

  fileName:
    file.filename,

  mimeType:
    file.mimetype,

  size:
    Number(file.size || 0),

  url:
    `/uploads/${folder}/${file.filename}`,

  path:
    `/uploads/${folder}/${file.filename}`,
});

const serializeStoredFile = (
  file
) => {
  if (
    !file ||
    typeof file !== "object"
  ) {
    return null;
  }

  return {
    id: file.id || null,

    originalName:
      file.originalName ||
      file.original_name ||
      file.fileName ||
      file.file_name ||
      "",

    fileName:
      file.fileName ||
      file.file_name ||
      "",

    mimeType:
      file.mimeType ||
      file.mime_type ||
      "",

    size:
      Number(
        file.size ||
          file.file_size ||
          0
      ),

    url:
      file.url ||
      file.path ||
      "",

    path:
      file.path ||
      file.url ||
      "",
  };
};

const parseFiles = (value) => {
  const files = parseJson(value, []);

  if (!Array.isArray(files)) {
    return [];
  }

  return files
    .map(serializeStoredFile)
    .filter(Boolean);
};

/* =========================================================
   TASK SERIALIZER
========================================================= */

const serializeTask = (row) => {
  const metadata =
    parseJson(
      row.metadata,
      {}
    );

  const attachments =
    parseFiles(
      metadata.attachments
    );

  const submissionAttachments =
    parseFiles(
      row.submission_attachments
    );

  return {
    id: row.id,

    activityId: row.id,

    tutorReference:
      row.tutor_reference || "",

    tutorName:
      row.tutor_name || "",

    grade:
      row.grade || "",

    class:
      row.grade || "",

    className:
      row.grade || "",

    subject:
      normalizeSubject(
        row.subject
      ),

    activityType:
      row.activity_type || "task",

    type:
      row.activity_type || "task",

    title:
      row.title || "",

    description:
      row.description || "",

    instructions:
      metadata.instructions || "",

    dueDate:
      metadata.dueDate ||
      metadata.due_date ||
      null,

    maxScore:
      Number(
        metadata.maxScore ||
          metadata.max_score ||
          row.max_score ||
          100
      ),

    attachments,

    metadata,

    status:
      row.submission_status ||
      row.status ||
      "assigned",

    submissionStatus:
      row.submission_status ||
      null,

    submissionId:
      row.submission_id ||
      null,

    submittedAt:
      row.submitted_at ||
      null,

    score:
      row.score !== null &&
      row.score !== undefined
        ? Number(row.score)
        : null,

    tutorFeedback:
      row.tutor_feedback ||
      row.feedback ||
      "",

    submissionAttachments,

    createdAt:
      row.created_at ||
      null,

    updatedAt:
      row.updated_at ||
      null,
  };
};

/* =========================================================
   JWT AUTH
========================================================= */

const getBearerToken = (req) => {
  const authorization =
    clean(
      req.headers.authorization
    );

  if (
    !authorization
      .toLowerCase()
      .startsWith("bearer ")
  ) {
    return "";
  }

  return clean(
    authorization.slice(7)
  );
};

const getJwtSecret = () =>
  clean(
    process.env.JWT_SECRET ||
      process.env.ACADEMY_JWT_SECRET ||
      process.env.AUTH_SECRET
  );

/* =========================================================
   GET LOGGED-IN STUDENT
========================================================= */

const getStudentFromToken = async (
  req
) => {
  const token =
    getBearerToken(req);

  if (!token) {
    return {
      ok: false,
      status: 401,
      message:
        "Authentication token is required.",
    };
  }

  const secret =
    getJwtSecret();

  if (!secret) {
    return {
      ok: false,
      status: 500,
      message:
        "Academy authentication is not configured on the server.",
    };
  }

  let decoded;

  try {
    decoded = jwt.verify(
      token,
      secret
    );
  } catch {
    return {
      ok: false,
      status: 401,
      message:
        "Invalid authentication token.",
    };
  }

  const userType =
    clean(
      decoded?.userType ||
        decoded?.user_type ||
        decoded?.type ||
        decoded?.role
    ).toLowerCase();

  if (
    userType &&
    ![
      "student",
      "academy_student",
      "academystudent",
    ].includes(userType)
  ) {
    return {
      ok: false,
      status: 403,
      message:
        "This account is not a student account.",
    };
  }

  const userId =
    decoded?.id ??
    decoded?.userId ??
    decoded?.user_id ??
    null;

  const enrollmentId =
    decoded?.enrollmentId ??
    decoded?.enrollment_id ??
    decoded?.studentEnrollmentId ??
    decoded?.student_enrollment_id ??
    null;

  const studentId =
    decoded?.studentId ??
    decoded?.student_id ??
    null;

  const email =
    normalizeEmail(
      decoded?.email
    );

  let academyUser = null;

  if (userId) {
    const result =
      await pool.query(
        `
          SELECT *
          FROM academy_users
          WHERE id = $1
          LIMIT 1
        `,
        [userId]
      );

    academyUser =
      result.rows[0] || null;
  }

  if (
    !academyUser &&
    enrollmentId
  ) {
    const result =
      await pool.query(
        `
          SELECT *
          FROM academy_users
          WHERE student_enrollment_id = $1
          LIMIT 1
        `,
        [enrollmentId]
      );

    academyUser =
      result.rows[0] || null;
  }

  if (
    !academyUser &&
    email
  ) {
    const result =
      await pool.query(
        `
          SELECT *
          FROM academy_users
          WHERE LOWER(email) = LOWER($1)
          LIMIT 1
        `,
        [email]
      );

    academyUser =
      result.rows[0] || null;
  }

  const resolvedEnrollmentId =
    academyUser?.student_enrollment_id ||
    enrollmentId ||
    studentId;

  let enrollment = null;

  if (resolvedEnrollmentId) {
    const result =
      await pool.query(
        `
          SELECT *
          FROM academy_student_enrollments
          WHERE enrollment_id = $1
          LIMIT 1
        `,
        [resolvedEnrollmentId]
      );

    enrollment =
      result.rows[0] || null;
  }

  if (
    !enrollment &&
    email
  ) {
    const result =
      await pool.query(
        `
          SELECT *
          FROM academy_student_enrollments
          WHERE LOWER(email) = LOWER($1)
          ORDER BY created_at DESC NULLS LAST
          LIMIT 1
        `,
        [email]
      );

    enrollment =
      result.rows[0] || null;
  }

  if (!enrollment) {
    return {
      ok: false,
      status: 404,
      message:
        "Student enrollment could not be found.",
    };
  }

  const accountStatus =
    clean(
      academyUser?.account_status ||
        enrollment.account_status
    ).toLowerCase();

  if (
    [
      "disabled",
      "suspended",
      "blocked",
    ].includes(accountStatus)
  ) {
    return {
      ok: false,
      status: 403,
      message:
        "Your student account is not active.",
    };
  }

  const enrollmentStatus =
    clean(
      enrollment.enrollment_status
    ).toLowerCase();

  if (
    [
      "rejected",
      "cancelled",
      "canceled",
    ].includes(enrollmentStatus)
  ) {
    return {
      ok: false,
      status: 403,
      message:
        "Your student enrollment is not active.",
    };
  }

  const subjects =
    uniqueArray(
      parseArray(
        enrollment.subjects
      )
    ).map(
      normalizeSubject
    );

  return {
    ok: true,

    student: {
      userId:
        academyUser?.id ||
        userId ||
        null,

      enrollmentId:
        enrollment.enrollment_id,

      reference:
        enrollment.enrollment_id,

      studentId:
        studentId ||
        enrollment.student_id ||
        enrollment.enrollment_id,

      firstName:
        enrollment.first_name ||
        academyUser?.first_name ||
        "",

      middleName:
        enrollment.middle_name ||
        "",

      lastName:
        enrollment.last_name ||
        academyUser?.last_name ||
        "",

      name:
        normalizeName(
          [
            enrollment.first_name ||
              academyUser?.first_name,
            enrollment.middle_name,
            enrollment.last_name ||
              academyUser?.last_name,
          ]
            .filter(Boolean)
            .join(" ")
        ),

      email:
        enrollment.email ||
        academyUser?.email ||
        email,

      class:
        enrollment.grade ||
        enrollment.school_level ||
        "",

      grade:
        enrollment.grade ||
        enrollment.school_level ||
        "",

      schoolLevel:
        enrollment.school_level ||
        "",

      subjects,

      enrollmentStatus:
        enrollment.enrollment_status ||
        "",

      paymentStatus:
        enrollment.payment_status ||
        "",

      accountStatus:
        academyUser?.account_status ||
        enrollment.account_status ||
        "",

      emailVerified:
        academyUser?.email_verified === true ||
        enrollment.email_verified === true,

      enrollment,
      academyUser,
    },
  };
};

/* =========================================================
   HEALTH
========================================================= */

router.get(
  "/health",
  async (req, res) => {
    try {
      await pool.query("SELECT 1");

      res.json({
        success: true,
        message:
          "Academy API is running",
      });
    } catch (error) {
      console.error(
        "ACADEMY HEALTH ERROR:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          "Database connection failed.",
      });
    }
  }
);

/* =========================================================
   ADMIN - ALL TUTORS
========================================================= */

router.get(
  "/admin/tutors",
  async (req, res) => {
    try {
      const result =
        await pool.query(
          `
            SELECT *
            FROM academy_tutor_applications
            ORDER BY created_at DESC
          `
        );

      const tutors =
        result.rows.map(
          serializeTutor
        );

      res.json({
        success: true,
        tutors,
        data: tutors,
        results: tutors,
        count: tutors.length,
      });
    } catch (error) {
      console.error(
        "ADMIN TUTORS ERROR:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          "Unable to load tutor applications.",
        tutors: [],
      });
    }
  }
);

/* =========================================================
   ADMIN - SINGLE TUTOR
========================================================= */

router.get(
  "/admin/tutors/:reference",
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

      const serialized =
        serializeTutor(tutor);

      res.json({
        success: true,
        tutor: serialized,
        data: serialized,
      });
    } catch (error) {
      console.error(
        "ADMIN SINGLE TUTOR ERROR:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          "Unable to load tutor.",
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

      const firstName =
        clean(
          body.firstName ??
            body.first_name
        );

      const middleName =
        clean(
          body.middleName ??
            body.middle_name
        );

      const lastName =
        clean(
          body.lastName ??
            body.last_name
        );

      const email =
        normalizeEmail(
          body.email
        );

      const phone =
        clean(body.phone);

      const gender =
        clean(body.gender);

      const dateOfBirth =
        body.dateOfBirth ??
        body.date_of_birth ??
        null;

      const address =
        clean(body.address);

      const city =
        clean(body.city);

      const state =
        clean(body.state);

      const qualification =
        clean(
          body.qualification ??
            body.highestQualification ??
            body.highest_qualification
        );

      const highestQualification =
        clean(
          body.highestQualification ??
            body.highest_qualification ??
            body.qualification
        );

      const institution =
        clean(
          body.institution ??
            body.institution_name
        );

      const courseOfStudy =
        clean(
          body.courseOfStudy ??
            body.course_of_study
        );

      const graduationYear =
        clean(
          body.graduationYear ??
            body.graduation_year
        );

      const professionalCertification =
        clean(
          body.professionalCertification ??
            body.professional_certification
        );

      const specialization =
        clean(
          body.specialization
        );

      const experience =
        clean(
          body.experience ??
            body.teachingExperience ??
            body.teaching_experience
        );

      const yearsExperience =
        clean(
          body.yearsExperience ??
            body.years_experience
        );

      const teachingExperience =
        clean(
          body.teachingExperience ??
            body.teaching_experience
        );

      const currentOccupation =
        clean(
          body.currentOccupation ??
            body.current_occupation
        );

      const teachingLevel =
        uniqueArray(
          parseArray(
            body.teachingLevel ??
              body.teaching_level
          )
        );

      let subjects =
        uniqueArray(
          parseArray(
            body.subjects ??
              body.subjects_taught
          )
        ).map(
          normalizeSubject
        );

      const assignments =
        normalizeAssignments(
          body.assignments ??
            body.teachingAssignments ??
            body.teaching_assignments ??
            body.classSubjectAssignments ??
            body.class_subject_assignments
        );

      let classes =
        uniqueArray(
          parseArray(
            body.classes ??
              body.grades
          )
        );

      if (assignments.length) {
        classes =
          getClassesFromAssignments(
            assignments
          );

        subjects =
          getSubjectsFromAssignments(
            assignments
          );
      }

      const availableDays =
        uniqueArray(
          parseArray(
            body.availableDays ??
              body.available_days
          )
        );

      const availableFrom =
        clean(
          body.availableFrom ??
            body.available_from
        );

      const availableTo =
        clean(
          body.availableTo ??
            body.available_to
        );

      const preferredMode =
        clean(
          body.preferredMode ??
            body.preferred_mode
        );

      const motivation =
        clean(body.motivation);

      const agreement =
        body.agreement === true ||
        body.agreement === "true";

      if (!firstName || !lastName) {
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

      if (
        !assignments.length &&
        !classes.length
      ) {
        return res.status(400).json({
          success: false,
          message:
            "At least one class assignment is required.",
        });
      }

      if (
        !assignments.length &&
        !subjects.length
      ) {
        return res.status(400).json({
          success: false,
          message:
            "At least one subject is required.",
        });
      }

      const existing =
        await pool.query(
          `
            SELECT
              reference,
              application_status
            FROM academy_tutor_applications
            WHERE LOWER(email) = LOWER($1)
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
          reference:
            existing.rows[0].reference,
          applicationStatus:
            existing.rows[0]
              .application_status,
        });
      }

      const reference =
        `TUT-${Date.now()
          .toString(36)
          .toUpperCase()}-${crypto
          .randomBytes(3)
          .toString("hex")
          .toUpperCase()}`;

      const bio = {
        motivation,
        teachingExperience,
        currentOccupation,
      };

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
              bio,
              application_status,
              assignments,
              address,
              teaching_level,
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
              $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,
              $11,$12,$13,$14::jsonb,$15::jsonb,
              $16::jsonb,$17,$18::jsonb,$19,$20::jsonb,
              $21,$22,$23,$24,$25,$26,$27,$28::jsonb,
              $29,$30,$31,$32,$33,$34,NOW(),NOW()
            )
            RETURNING *
          `,
          [
            reference,
            firstName,
            middleName,
            lastName,
            email,
            phone,
            gender,
            dateOfBirth,
            state,
            city,
            qualification,
            specialization,
            experience,
            JSON.stringify(subjects),
            JSON.stringify(classes),
            JSON.stringify(bio),
            "pending",
            JSON.stringify(assignments),
            address,
            JSON.stringify(teachingLevel),
            yearsExperience,
            currentOccupation,
            highestQualification,
            institution,
            courseOfStudy,
            graduationYear,
            professionalCertification,
            JSON.stringify(availableDays),
            availableFrom,
            availableTo,
            preferredMode,
            motivation,
            teachingExperience,
            agreement,
          ]
        );

      const tutor =
        result.rows[0];

      const serialized =
        serializeTutor(tutor);

      res.status(201).json({
        success: true,
        message:
          "Tutor application submitted successfully.",
        applicationReference:
          tutor.reference,
        reference:
          tutor.reference,
        applicationId:
          tutor.id,
        tutor: serialized,
        application: serialized,
      });
    } catch (error) {
      console.error(
        "TUTOR APPLICATION ERROR:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          error.message ||
          "Failed to submit tutor application.",
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
      const name =
        normalizeName(
          req.body?.name ||
            req.body?.fullName ||
            req.body?.full_name
        );

      const reference =
        clean(
          req.body?.reference ||
            req.body?.tutorReference ||
            req.body?.tutor_reference
        );

      if (!name || !reference) {
        return res.status(400).json({
          success: false,
          message:
            "Full name and tutor reference are required.",
        });
      }

      const tutor =
        await findTutorByReference(
          reference
        );

      if (!tutor) {
        return res.status(401).json({
          success: false,
          message:
            "Invalid tutor reference.",
        });
      }

      if (
        getTutorName(tutor)
          .toLowerCase() !==
        name.toLowerCase()
      ) {
        return res.status(401).json({
          success: false,
          message:
            "The registered name does not match this tutor reference.",
        });
      }

      if (!isTutorVerified(tutor)) {
        return res.status(403).json({
          success: false,
          code:
            "TUTOR_NOT_VERIFIED",
          message:
            "Your tutor application has not been verified yet.",
          applicationStatus:
            tutor.application_status,
          tutor:
            serializeTutor(tutor),
        });
      }

      res.json({
        success: true,
        message:
          "Tutor login successful.",
        tutor:
          serializeTutor(tutor),
      });
    } catch (error) {
      console.error(
        "TUTOR LOGIN ERROR:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          "Unable to login tutor.",
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
        getTutorReferenceFromRequest(
          req
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
            "Tutor profile not found.",
        });
      }

      const profile =
        serializeTutor(tutor);

      res.json({
        success: true,
        tutor: profile,
        profile,
      });
    } catch (error) {
      console.error(
        "TUTOR PROFILE ERROR:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          "Failed to load tutor profile.",
      });
    }
  }
);

/* =========================================================
   TUTOR CLASSES
========================================================= */

router.get(
  "/tutor/classes",
  async (req, res) => {
    try {
      const reference =
        getTutorReferenceFromRequest(
          req
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
            "Tutor not found.",
        });
      }

      const assignments =
        normalizeAssignments(
          tutor.assignments
        );

      const classes =
        assignments.map(
          (assignment) => ({
            class:
              assignment.class,

            grade:
              assignment.class,

            className:
              assignment.class,

            subjects:
              assignment.subjects,
          })
        );

      res.json({
        success: true,
        reference,
        assignments,
        classes,
        subjects:
          getSubjectsFromAssignments(
            assignments
          ),
      });
    } catch (error) {
      console.error(
        "TUTOR CLASSES ERROR:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          "Failed to load tutor classes.",
      });
    }
  }
);

/* =========================================================
   TUTOR CLASS + SUBJECT
========================================================= */

router.get(
  "/tutor/classes/:grade/:subject",
  async (req, res) => {
    try {
      const reference =
        getTutorReferenceFromRequest(
          req
        );

      const grade =
        clean(req.params.grade);

      const subject =
        normalizeSubject(
          decodeURIComponent(
            req.params.subject
          )
        );

      const verification =
        await verifyTutorClassSubject(
          reference,
          grade,
          subject
        );

      if (!verification.ok) {
        return res.status(
          verification.status
        ).json({
          success: false,
          message:
            verification.message,
        });
      }

      res.json({
        success: true,
        class:
          verification.assignment.class,
        grade:
          verification.assignment.class,
        subject:
          verification.subject,
        subjects:
          verification.assignment.subjects,
      });
    } catch (error) {
      console.error(
        "TUTOR CLASS SUBJECT ERROR:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          "Failed to load tutor class.",
      });
    }
  }
);

/* =========================================================
   TUTOR PROFILE IMAGE
========================================================= */

router.post(
  "/tutor/profile/image",
  tutorImageUpload.single("image"),
  async (req, res) => {
    try {
      const reference =
        getTutorReferenceFromRequest(
          req
        );

      if (!reference) {
        if (req.file?.path) {
          fs.unlinkSync(
            req.file.path
          );
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
        fs.unlinkSync(
          req.file.path
        );

        return res.status(404).json({
          success: false,
          message:
            "Tutor profile not found.",
        });
      }

      const imageUrl =
        `/uploads/tutors/${req.file.filename}`;

      if (
        tutor.profile_image_url?.startsWith(
          "/uploads/tutors/"
        )
      ) {
        const oldFile =
          path.join(
            process.cwd(),
            tutor.profile_image_url.replace(
              /^\/+/,
              ""
            )
          );

        if (
          fs.existsSync(oldFile)
        ) {
          try {
            fs.unlinkSync(
              oldFile
            );
          } catch {}
        }
      }

      const result =
        await pool.query(
          `
            UPDATE academy_tutor_applications
            SET
              profile_image_url = $1,
              updated_at = NOW()
            WHERE reference = $2
            RETURNING *
          `,
          [
            imageUrl,
            reference,
          ]
        );

      const profile =
        serializeTutor(
          result.rows[0]
        );

      res.json({
        success: true,
        message:
          "Profile image updated successfully.",
        imageUrl,
        profileImageUrl:
          imageUrl,
        profileImage:
          imageUrl,
        tutor: profile,
        profile,
      });
    } catch (error) {
      console.error(
        "TUTOR IMAGE ERROR:",
        error
      );

      if (req.file?.path) {
        try {
          fs.unlinkSync(
            req.file.path
          );
        } catch {}
      }

      res.status(500).json({
        success: false,
        message:
          error.message ||
          "Failed to upload profile image.",
      });
    }
  }
);

/* =========================================================
   CREATE TASK
========================================================= */

router.post(
  "/tutor/class-activities",
  taskUpload.array("files", 10),
  async (req, res) => {
    try {
      const reference =
        getTutorReferenceFromRequest(
          req
        );

      const grade =
        clean(
          req.body?.grade ||
            req.body?.class ||
            req.body?.className
        );

      const subject =
        normalizeSubject(
          req.body?.subject
        );

      const title =
        clean(req.body?.title);

      const description =
        clean(
          req.body?.description
        );

      const instructions =
        clean(
          req.body?.instructions
        );

      const activityType =
        clean(
          req.body?.activityType ||
            req.body?.activity_type ||
            "task"
        ) || "task";

      const dueDate =
        clean(
          req.body?.dueDate ||
            req.body?.due_date
        ) || null;

      const maxScore =
        Number(
          req.body?.maxScore ??
            req.body?.max_score ??
            100
        );

      if (!reference) {
        return res.status(400).json({
          success: false,
          message:
            "Tutor reference is required.",
        });
      }

      if (!grade) {
        return res.status(400).json({
          success: false,
          message:
            "Class is required.",
        });
      }

      if (!subject) {
        return res.status(400).json({
          success: false,
          message:
            "Subject is required.",
        });
      }

      if (!title) {
        return res.status(400).json({
          success: false,
          message:
            "Task title is required.",
        });
      }

      if (!description) {
        return res.status(400).json({
          success: false,
          message:
            "Task description is required.",
        });
      }

      if (
        !Number.isFinite(maxScore) ||
        maxScore <= 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Maximum score must be greater than zero.",
        });
      }

      const verification =
        await verifyTutorClassSubject(
          reference,
          grade,
          subject
        );

      if (!verification.ok) {
        return res.status(
          verification.status
        ).json({
          success: false,
          message:
            verification.message,
        });
      }

      const attachments =
        (req.files || []).map(
          (file) =>
            serializeFile(
              file,
              "tasks"
            )
        );

      let metadata =
        parseJson(
          req.body?.metadata,
          {}
        );

      metadata = {
        ...metadata,

        instructions,
        dueDate,
        maxScore,

        attachments,

        tutorReference:
          reference,

        grade:
          verification.assignment.class,

        subject:
          verification.subject,

        activityType,
      };

      const result =
        await pool.query(
          `
            INSERT INTO academy_class_activities (
              tutor_reference,
              grade,
              subject,
              activity_type,
              title,
              description,
              metadata
            )
            VALUES (
              $1,
              $2,
              $3,
              $4,
              $5,
              $6,
              $7::jsonb
            )
            RETURNING *
          `,
          [
            reference,
            verification.assignment.class,
            verification.subject,
            activityType,
            title,
            description,
            JSON.stringify(
              metadata
            ),
          ]
        );

      const task =
        serializeTask(
          result.rows[0]
        );

      res.status(201).json({
        success: true,
        message:
          "Task created successfully.",
        task,
        activity: task,
        data: task,
      });
    } catch (error) {
      console.error(
        "CREATE TASK ERROR:",
        error
      );

      if (req.files?.length) {
        req.files.forEach(
          (file) => {
            try {
              fs.unlinkSync(
                file.path
              );
            } catch {}
          }
        );
      }

      res.status(500).json({
        success: false,
        message:
          error.message ||
          "Unable to create task.",
      });
    }
  }
);

/* =========================================================
   TUTOR - CREATED TASKS
========================================================= */

router.get(
  "/tutor/class-activities",
  async (req, res) => {
    try {
      const reference =
        getTutorReferenceFromRequest(
          req
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
            "Tutor not found.",
        });
      }

      const result =
        await pool.query(
          `
            SELECT
              a.*,

              (
                SELECT COUNT(*)
                FROM academy_task_submissions s
                WHERE s.task_id = a.id
              ) AS submission_count

            FROM academy_class_activities a

            WHERE
              a.tutor_reference = $1
              AND LOWER(
                COALESCE(
                  a.activity_type,
                  'task'
                )
              ) = 'task'

            ORDER BY
              a.created_at DESC
          `,
          [reference]
        );

      const tasks =
        result.rows.map(
          (row) => ({
            ...serializeTask(row),

            submissionCount:
              Number(
                row.submission_count ||
                  0
              ),
          })
        );

      res.json({
        success: true,
        tasks,
        activities: tasks,
        results: tasks,
        count: tasks.length,
      });
    } catch (error) {
      console.error(
        "GET TUTOR TASKS ERROR:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          error.message ||
          "Unable to load tutor tasks.",
        tasks: [],
      });
    }
  }
);

/* =========================================================
   TUTOR - SINGLE TASK
   Used by the edit page
========================================================= */

router.get(
  "/tutor/class-activities/:id",
  async (req, res) => {
    try {
      const reference =
        getTutorReferenceFromRequest(
          req
        );

      if (!reference) {
        return res.status(400).json({
          success: false,
          message:
            "Tutor reference is required.",
        });
      }

      const taskId =
        clean(req.params.id);

      if (!taskId) {
        return res.status(400).json({
          success: false,
          message:
            "Task ID is required.",
        });
      }

      const result =
        await pool.query(
          `
            SELECT
              a.*,

              (
                SELECT COUNT(*)
                FROM academy_task_submissions s
                WHERE s.task_id = a.id
              ) AS submission_count

            FROM academy_class_activities a

            WHERE
              a.id = $1
              AND a.tutor_reference = $2
              AND LOWER(
                COALESCE(
                  a.activity_type,
                  'task'
                )
              ) = 'task'

            LIMIT 1
          `,
          [
            taskId,
            reference,
          ]
        );

      if (!result.rows.length) {
        return res.status(404).json({
          success: false,
          message:
            "Task not found.",
        });
      }

      const task = {
        ...serializeTask(
          result.rows[0]
        ),

        submissionCount:
          Number(
            result.rows[0]
              .submission_count ||
              0
          ),
      };

      res.json({
        success: true,
        task,
        activity: task,
        data: task,
      });
    } catch (error) {
      console.error(
        "GET SINGLE TUTOR TASK ERROR:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          error.message ||
          "Unable to load task.",
      });
    }
  }
);

/* =========================================================
   TUTOR - EDIT TASK
========================================================= */

router.patch(
  "/tutor/class-activities/:id",
  taskUpload.array("files", 10),
  async (req, res) => {
    try {
      const reference =
        getTutorReferenceFromRequest(
          req
        );

      if (!reference) {
        return res.status(400).json({
          success: false,
          message:
            "Tutor reference is required.",
        });
      }

      const taskId =
        clean(req.params.id);

      if (!taskId) {
        return res.status(400).json({
          success: false,
          message:
            "Task ID is required.",
        });
      }

      const existingResult =
        await pool.query(
          `
            SELECT *
            FROM academy_class_activities
            WHERE
              id = $1
              AND tutor_reference = $2
            LIMIT 1
          `,
          [
            taskId,
            reference,
          ]
        );

      if (!existingResult.rows.length) {
        return res.status(404).json({
          success: false,
          message:
            "Task not found.",
        });
      }

      const existing =
        existingResult.rows[0];

      const existingMetadata =
        parseJson(
          existing.metadata,
          {}
        );

      const grade =
        clean(
          req.body?.grade ||
            req.body?.class ||
            req.body?.className ||
            existing.grade
        );

      const subject =
        normalizeSubject(
          req.body?.subject ||
            existing.subject
        );

      const title =
        clean(
          req.body?.title ??
            existing.title
        );

      const description =
        clean(
          req.body?.description ??
            existing.description
        );

      const instructions =
        clean(
          req.body?.instructions ??
            existingMetadata.instructions ??
            ""
        );

      const activityType =
        clean(
          req.body?.activityType ||
            req.body?.activity_type ||
            existing.activity_type ||
            "task"
        ) || "task";

      const dueDate =
        clean(
          req.body?.dueDate ??
            req.body?.due_date ??
            existingMetadata.dueDate ??
            existingMetadata.due_date ??
            ""
        ) || null;

      const submittedMaxScore =
        req.body?.maxScore ??
        req.body?.max_score;

      const oldMaxScore =
        existingMetadata.maxScore ??
        existingMetadata.max_score ??
        existing.max_score ??
        100;

      const maxScore =
        Number(
          submittedMaxScore ??
            oldMaxScore
        );

      if (!grade) {
        return res.status(400).json({
          success: false,
          message:
            "Class is required.",
        });
      }

      if (!subject) {
        return res.status(400).json({
          success: false,
          message:
            "Subject is required.",
        });
      }

      if (!title) {
        return res.status(400).json({
          success: false,
          message:
            "Task title is required.",
        });
      }

      if (!description) {
        return res.status(400).json({
          success: false,
          message:
            "Task description is required.",
        });
      }

      if (
        !Number.isFinite(maxScore) ||
        maxScore <= 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Maximum score must be greater than zero.",
        });
      }

      const verification =
        await verifyTutorClassSubject(
          reference,
          grade,
          subject
        );

      if (!verification.ok) {
        return res.status(
          verification.status
        ).json({
          success: false,
          message:
            verification.message,
        });
      }

      const newAttachments =
        (req.files || []).map(
          (file) =>
            serializeFile(
              file,
              "tasks"
            )
        );

      const replaceAttachments =
        String(
          req.body?.replaceAttachments ||
            req.body?.replace_attachments ||
            "false"
        ).toLowerCase() ===
        "true";

      const oldAttachments =
        parseFiles(
          existingMetadata.attachments
        );

      const attachments =
        replaceAttachments
          ? newAttachments
          : [
              ...oldAttachments,
              ...newAttachments,
            ];

      const metadataInput =
        parseJson(
          req.body?.metadata,
          {}
        );

      const metadata = {
        ...existingMetadata,
        ...metadataInput,

        instructions,
        dueDate,
        maxScore,
        attachments,

        tutorReference:
          reference,

        grade:
          verification.assignment.class,

        subject:
          verification.subject,

        activityType,
      };

      const result =
        await pool.query(
          `
            UPDATE academy_class_activities
            SET
              grade = $1,
              subject = $2,
              activity_type = $3,
              title = $4,
              description = $5,
              metadata = $6::jsonb,
              updated_at = NOW()
            WHERE
              id = $7
              AND tutor_reference = $8
            RETURNING *
          `,
          [
            verification.assignment.class,
            verification.subject,
            activityType,
            title,
            description,
            JSON.stringify(
              metadata
            ),
            taskId,
            reference,
          ]
        );

      if (!result.rows.length) {
        if (req.files?.length) {
          req.files.forEach(
            (file) => {
              try {
                fs.unlinkSync(
                  file.path
                );
              } catch {}
            }
          );
        }

        return res.status(404).json({
          success: false,
          message:
            "Task could not be updated.",
        });
      }

      const task =
        serializeTask(
          result.rows[0]
        );

      res.json({
        success: true,
        message:
          "Task updated successfully.",
        task,
        activity: task,
        data: task,
      });
    } catch (error) {
      console.error(
        "UPDATE TASK ERROR:",
        error
      );

      if (req.files?.length) {
        req.files.forEach(
          (file) => {
            try {
              fs.unlinkSync(
                file.path
              );
            } catch {}
          }
        );
      }

      res.status(500).json({
        success: false,
        message:
          error.message ||
          "Unable to update task.",
      });
    }
  }
);

/* =========================================================
   TUTOR - DELETE TASK
========================================================= */

router.delete(
  "/tutor/class-activities/:id",
  async (req, res) => {
    try {
      const reference =
        getTutorReferenceFromRequest(
          req
        );

      if (!reference) {
        return res.status(400).json({
          success: false,
          message:
            "Tutor reference is required.",
        });
      }

      const taskId =
        clean(req.params.id);

      const taskResult =
        await pool.query(
          `
            SELECT *
            FROM academy_class_activities
            WHERE
              id = $1
              AND tutor_reference = $2
            LIMIT 1
          `,
          [
            taskId,
            reference,
          ]
        );

      if (!taskResult.rows.length) {
        return res.status(404).json({
          success: false,
          message:
            "Task not found.",
        });
      }

      const task =
        taskResult.rows[0];

      const metadata =
        parseJson(
          task.metadata,
          {}
        );

      const attachments =
        parseFiles(
          metadata.attachments
        );

      const submissionResult =
        await pool.query(
          `
            SELECT attachments
            FROM academy_task_submissions
            WHERE task_id = $1
          `,
          [taskId]
        );

      await pool.query(
        `
          DELETE FROM academy_task_submissions
          WHERE task_id = $1
        `,
        [taskId]
      );

      await pool.query(
        `
          DELETE FROM academy_class_activities
          WHERE
            id = $1
            AND tutor_reference = $2
        `,
        [
          taskId,
          reference,
        ]
      );

      const filesToDelete = [
        ...attachments,
        ...submissionResult.rows.flatMap(
          (row) =>
            parseFiles(
              row.attachments
            )
        ),
      ];

      filesToDelete.forEach(
        (file) => {
          const filePath =
            clean(
              file.path ||
                file.url
            );

          if (
            filePath.startsWith(
              "/uploads/"
            )
          ) {
            const absolutePath =
              path.join(
                process.cwd(),
                filePath.replace(
                  /^\/+/,
                  ""
                )
              );

            if (
              fs.existsSync(
                absolutePath
              )
            ) {
              try {
                fs.unlinkSync(
                  absolutePath
                );
              } catch {}
            }
          }
        }
      );

      res.json({
        success: true,
        message:
          "Task deleted successfully.",
        taskId,
      });
    } catch (error) {
      console.error(
        "DELETE TASK ERROR:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          error.message ||
          "Unable to delete task.",
      });
    }
  }
);

/* =========================================================
   STUDENT TASKS
========================================================= */

router.get(
  "/student/tasks",
  async (req, res) => {
    try {
      const auth =
        await getStudentFromToken(
          req
        );

      if (!auth.ok) {
        return res.status(
          auth.status
        ).json({
          success: false,
          message:
            auth.message,
        });
      }

      const student =
        auth.student;

      if (!student.grade) {
        return res.json({
          success: true,
          tasks: [],
          activities: [],
          results: [],
          count: 0,
        });
      }

      const result =
        await pool.query(
          `
            SELECT
              a.*,

              s.id AS submission_id,
              s.status AS submission_status,
              s.response_text AS submission_answer,
              s.submitted_at,
              s.score,
              s.feedback AS tutor_feedback,
              s.attachments AS submission_attachments

            FROM academy_class_activities a

            LEFT JOIN academy_task_submissions s
              ON s.task_id = a.id
              AND (
                s.enrollment_id = $2
                OR s.student_id = $3
                OR LOWER(s.student_email) = LOWER($4)
              )

            WHERE
              LOWER(
                REGEXP_REPLACE(
                  TRIM(a.grade),
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

              AND LOWER(
                COALESCE(
                  a.activity_type,
                  'task'
                )
              ) = 'task'

            ORDER BY
              a.created_at DESC
          `,
          [
            student.grade,
            student.enrollmentId,
            student.studentId,
            student.email,
          ]
        );

      const tasks =
        result.rows
          .filter((row) => {
            if (
              !student.subjects.length
            ) {
              return true;
            }

            return student.subjects.some(
              (subject) =>
                subjectsMatch(
                  subject,
                  row.subject
                )
            );
          })
          .map(serializeTask);

      res.json({
        success: true,
        tasks,
        activities: tasks,
        results: tasks,
        count: tasks.length,

        student: {
          enrollmentId:
            student.enrollmentId,

          studentId:
            student.studentId,

          name:
            student.name,

          email:
            student.email,

          class:
            student.grade,

          grade:
            student.grade,

          subjects:
            student.subjects,
        },
      });
    } catch (error) {
      console.error(
        "GET STUDENT TASKS ERROR:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          error.message ||
          "Unable to load student tasks.",
        tasks: [],
      });
    }
  }
);

/* =========================================================
   STUDENT SINGLE TASK
========================================================= */

router.get(
  "/student/tasks/:id",
  async (req, res) => {
    try {
      const auth =
        await getStudentFromToken(
          req
        );

      if (!auth.ok) {
        return res.status(
          auth.status
        ).json({
          success: false,
          message:
            auth.message,
        });
      }

      const taskId =
        clean(req.params.id);

      const result =
        await pool.query(
          `
            SELECT
              a.*,

              s.id AS submission_id,
              s.status AS submission_status,
              s.response_text AS submission_answer,
              s.submitted_at,
              s.score,
              s.feedback AS tutor_feedback,
              s.attachments AS submission_attachments

            FROM academy_class_activities a

            LEFT JOIN academy_task_submissions s
              ON s.task_id = a.id
              AND (
                s.enrollment_id = $2
                OR s.student_id = $3
                OR LOWER(s.student_email) = LOWER($4)
              )

            WHERE
              a.id = $1
              AND LOWER(
                COALESCE(
                  a.activity_type,
                  'task'
                )
              ) = 'task'

            LIMIT 1
          `,
          [
            taskId,
            auth.student.enrollmentId,
            auth.student.studentId,
            auth.student.email,
          ]
        );

      if (!result.rows.length) {
        return res.status(404).json({
          success: false,
          message:
            "Task not found.",
        });
      }

      const row =
        result.rows[0];

      if (
        !classesMatch(
          row.grade,
          auth.student.grade
        )
      ) {
        return res.status(403).json({
          success: false,
          message:
            "This task is not assigned to your class.",
        });
      }

      if (
        auth.student.subjects.length &&
        !auth.student.subjects.some(
          (subject) =>
            subjectsMatch(
              subject,
              row.subject
            )
        )
      ) {
        return res.status(403).json({
          success: false,
          message:
            "This task is not assigned to your subject.",
        });
      }

      const task =
        serializeTask(row);

      res.json({
        success: true,
        task,
        activity: task,
        data: task,

        submission: {
          id:
            row.submission_id ||
            null,

          answer:
            row.submission_answer ||
            "",

          status:
            row.submission_status ||
            null,

          submittedAt:
            row.submitted_at ||
            null,

          score:
            row.score !== null &&
            row.score !== undefined
              ? Number(row.score)
              : null,

          feedback:
            row.tutor_feedback ||
            "",

          attachments:
            parseFiles(
              row.submission_attachments
            ),
        },
      });
    } catch (error) {
      console.error(
        "GET STUDENT TASK ERROR:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          error.message ||
          "Unable to load task.",
      });
    }
  }
);

/* =========================================================
   STUDENT SUBMIT TASK
========================================================= */

router.post(
  "/student/tasks/:id/submit",
  submissionUpload.array(
    "files",
    10
  ),
  async (req, res) => {
    try {
      const auth =
        await getStudentFromToken(
          req
        );

      if (!auth.ok) {
        return res.status(
          auth.status
        ).json({
          success: false,
          message:
            auth.message,
        });
      }

      const taskId =
        clean(req.params.id);

      const answer =
        clean(
          req.body?.answer ||
            req.body?.response_text ||
            req.body?.response
        );

      const taskResult =
        await pool.query(
          `
            SELECT *
            FROM academy_class_activities
            WHERE
              id = $1
              AND LOWER(
                COALESCE(
                  activity_type,
                  'task'
                )
              ) = 'task'
            LIMIT 1
          `,
          [taskId]
        );

      if (!taskResult.rows.length) {
        return res.status(404).json({
          success: false,
          message:
            "Task not found.",
        });
      }

      const task =
        taskResult.rows[0];

      if (
        !classesMatch(
          task.grade,
          auth.student.grade
        )
      ) {
        return res.status(403).json({
          success: false,
          message:
            "You cannot submit this task.",
        });
      }

      if (
        auth.student.subjects.length &&
        !auth.student.subjects.some(
          (subject) =>
            subjectsMatch(
              subject,
              task.subject
            )
        )
      ) {
        return res.status(403).json({
          success: false,
          message:
            "This task is not assigned to your subject.",
        });
      }

      const attachments =
        (req.files || []).map(
          (file) =>
            serializeFile(
              file,
              "task-submissions"
            )
        );

      if (
        !answer &&
        !attachments.length
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Please provide an answer or attach a file.",
        });
      }

      const existing =
        await pool.query(
          `
            SELECT id
            FROM academy_task_submissions
            WHERE
              task_id = $1
              AND (
                enrollment_id = $2
                OR student_id = $3
                OR LOWER(student_email) = LOWER($4)
              )
            ORDER BY created_at DESC
            LIMIT 1
          `,
          [
            taskId,
            auth.student.enrollmentId,
            auth.student.studentId,
            auth.student.email,
          ]
        );

      let submission;

      if (existing.rows.length) {
        const result =
          await pool.query(
            `
              UPDATE academy_task_submissions
              SET
                enrollment_id = $1,
                student_id = $2,
                student_name = $3,
                student_email = $4,
                grade = $5,
                subject = $6,
                response_text = $7,
                answer = $7,
                attachment_url = $8,
                attachments = $9::jsonb,
                status = 'submitted',
                submitted_at = NOW(),
                updated_at = NOW()
              WHERE id = $10
              RETURNING *
            `,
            [
              auth.student.enrollmentId,
              auth.student.studentId,
              auth.student.name,
              auth.student.email,
              auth.student.grade,
              task.subject,
              answer,
              attachments[0]?.url ||
                null,
              JSON.stringify(
                attachments
              ),
              existing.rows[0].id,
            ]
          );

        submission =
          result.rows[0];
      } else {
        const result =
          await pool.query(
            `
              INSERT INTO academy_task_submissions (
                task_id,
                enrollment_id,
                student_name,
                answer,
                attachment_url,
                submitted_at,
                status,
                student_id,
                student_email,
                grade,
                subject,
                response_text,
                attachments,
                max_score,
                created_at,
                updated_at
              )
              VALUES (
                $1,
                $2,
                $3,
                $4,
                $5,
                NOW(),
                'submitted',
                $6,
                $7,
                $8,
                $9,
                $10,
                $11::jsonb,
                $12,
                NOW(),
                NOW()
              )
              RETURNING *
            `,
            [
              taskId,
              auth.student.enrollmentId,
              auth.student.name,
              answer,
              attachments[0]?.url ||
                null,
              auth.student.studentId,
              auth.student.email,
              auth.student.grade,
              task.subject,
              answer,
              JSON.stringify(
                attachments
              ),
              Number(
                parseJson(
                  task.metadata,
                  {}
                ).maxScore || 100
              ),
            ]
          );

        submission =
          result.rows[0];
      }

      res.status(201).json({
        success: true,
        message:
          "Task submitted successfully.",

        submission: {
          id:
            submission.id,

          taskId:
            submission.task_id,

          studentId:
            submission.student_id,

          studentName:
            submission.student_name,

          studentEmail:
            submission.student_email,

          answer:
            submission.response_text ||
            submission.answer ||
            "",

          responseText:
            submission.response_text ||
            "",

          attachments:
            parseFiles(
              submission.attachments
            ),

          status:
            submission.status,

          submittedAt:
            submission.submitted_at,

          score:
            submission.score !== null &&
            submission.score !== undefined
              ? Number(
                  submission.score
                )
              : null,

          feedback:
            submission.feedback ||
            "",
        },
      });
    } catch (error) {
      console.error(
        "SUBMIT TASK ERROR:",
        error
      );

      if (req.files?.length) {
        req.files.forEach(
          (file) => {
            try {
              fs.unlinkSync(
                file.path
              );
            } catch {}
          }
        );
      }

      res.status(500).json({
        success: false,
        message:
          error.message ||
          "Unable to submit task.",
      });
    }
  }
);

/* =========================================================
   TUTOR - TASK SUBMISSIONS
========================================================= */

router.get(
  "/tutor/class-activities/:id/submissions",
  async (req, res) => {
    try {
      const reference =
        getTutorReferenceFromRequest(
          req
        );

      if (!reference) {
        return res.status(400).json({
          success: false,
          message:
            "Tutor reference is required.",
        });
      }

      const taskId =
        clean(req.params.id);

      const taskResult =
        await pool.query(
          `
            SELECT *
            FROM academy_class_activities
            WHERE
              id = $1
              AND tutor_reference = $2
            LIMIT 1
          `,
          [
            taskId,
            reference,
          ]
        );

      if (!taskResult.rows.length) {
        return res.status(404).json({
          success: false,
          message:
            "Task not found.",
        });
      }

      const result =
        await pool.query(
          `
            SELECT *
            FROM academy_task_submissions
            WHERE task_id = $1
            ORDER BY submitted_at DESC
          `,
          [taskId]
        );

      const submissions =
        result.rows.map(
          (row) => ({
            id:
              row.id,

            taskId:
              row.task_id,

            enrollmentId:
              row.enrollment_id,

            studentId:
              row.student_id,

            studentName:
              row.student_name || "",

            studentEmail:
              row.student_email || "",

            grade:
              row.grade || "",

            subject:
              normalizeSubject(
                row.subject
              ),

            answer:
              row.response_text ||
              row.answer ||
              "",

            responseText:
              row.response_text ||
              "",

            attachments:
              parseFiles(
                row.attachments
              ),

            score:
              row.score !== null &&
              row.score !== undefined
                ? Number(row.score)
                : null,

            feedback:
              row.feedback || "",

            status:
              row.status ||
              "submitted",

            submittedAt:
              row.submitted_at ||
              null,

            reviewedAt:
              row.reviewed_at ||
              null,

            reviewedBy:
              row.reviewed_by ||
              null,

            createdAt:
              row.created_at ||
              null,

            updatedAt:
              row.updated_at ||
              null,
          })
        );

      const task =
        serializeTask(
          taskResult.rows[0]
        );

      res.json({
        success: true,
        task,
        submissions,
        results: submissions,
        count:
          submissions.length,
      });
    } catch (error) {
      console.error(
        "GET TASK SUBMISSIONS ERROR:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          error.message ||
          "Unable to load task submissions.",
        submissions: [],
      });
    }
  }
);

/* =========================================================
   TUTOR - REVIEW / GRADE SUBMISSION
========================================================= */

router.patch(
  "/tutor/class-activities/:id/submissions/:submissionId",
  async (req, res) => {
    try {
      const reference =
        getTutorReferenceFromRequest(
          req
        );

      if (!reference) {
        return res.status(400).json({
          success: false,
          message:
            "Tutor reference is required.",
        });
      }

      const taskId =
        clean(req.params.id);

      const submissionId =
        Number(
          req.params.submissionId
        );

      if (
        !Number.isInteger(
          submissionId
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid submission ID.",
        });
      }

      const taskResult =
        await pool.query(
          `
            SELECT *
            FROM academy_class_activities
            WHERE
              id = $1
              AND tutor_reference = $2
            LIMIT 1
          `,
          [
            taskId,
            reference,
          ]
        );

      if (!taskResult.rows.length) {
        return res.status(404).json({
          success: false,
          message:
            "Task not found.",
        });
      }

      const task =
        taskResult.rows[0];

      const metadata =
        parseJson(
          task.metadata,
          {}
        );

      const maxScore =
        Number(
          metadata.maxScore ||
            metadata.max_score ||
            100
        );

      const score =
        req.body?.score === "" ||
        req.body?.score === null ||
        req.body?.score === undefined
          ? null
          : Number(
              req.body.score
            );

      const feedback =
        clean(
          req.body?.feedback ||
            req.body?.tutorFeedback ||
            req.body?.tutor_feedback
        );

      if (
        score !== null &&
        (
          !Number.isFinite(score) ||
          score < 0 ||
          score > maxScore
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            `Score must be between 0 and ${maxScore}.`,
        });
      }

      const result =
        await pool.query(
          `
            UPDATE academy_task_submissions
            SET
              score = $1,
              feedback = $2,
              status =
                CASE
                  WHEN $1 IS NULL
                    THEN status
                  ELSE 'graded'
                END,
              reviewed_at = NOW(),
              reviewed_by = $3,
              updated_at = NOW()
            WHERE
              id = $4
              AND task_id = $5
            RETURNING *
          `,
          [
            score,
            feedback,
            reference,
            submissionId,
            taskId,
          ]
        );

      if (!result.rows.length) {
        return res.status(404).json({
          success: false,
          message:
            "Submission not found.",
        });
      }

      const submission =
        result.rows[0];

      res.json({
        success: true,
        message:
          "Submission reviewed successfully.",

        submission: {
          id:
            submission.id,

          taskId:
            submission.task_id,

          studentId:
            submission.student_id,

          studentName:
            submission.student_name,

          studentEmail:
            submission.student_email,

          answer:
            submission.response_text ||
            submission.answer ||
            "",

          attachments:
            parseFiles(
              submission.attachments
            ),

          score:
            submission.score !== null &&
            submission.score !== undefined
              ? Number(
                  submission.score
                )
              : null,

          feedback:
            submission.feedback ||
            "",

          status:
            submission.status,

          submittedAt:
            submission.submitted_at,

          reviewedAt:
            submission.reviewed_at,

          reviewedBy:
            submission.reviewed_by,
        },
      });
    } catch (error) {
      console.error(
        "GRADE SUBMISSION ERROR:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          error.message ||
          "Unable to review submission.",
      });
    }
  }
);

/* =========================================================
   MULTER ERRORS
========================================================= */

router.use(
  (
    error,
    req,
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
          message:
            "File is too large. Maximum size is 250MB.",
        });
      }

      if (
        error.code ===
        "LIMIT_FILE_COUNT"
      ) {
        return res.status(400).json({
          success: false,
          message:
            "A maximum of 10 files can be uploaded.",
        });
      }

      return res.status(400).json({
        success: false,
        message:
          error.message,
      });
    }

    if (error) {
      return res.status(400).json({
        success: false,
        message:
          error.message ||
          "Request failed.",
      });
    }

    next();
  }
);

/* =========================================================
   EXPORTS
========================================================= */

export {
  clean,
  normalizeSubject,
  normalizeClass,
  subjectsMatch,
  classesMatch,
  normalizeAssignments,
  getClassesFromAssignments,
  getSubjectsFromAssignments,
  getTutorSubjectsForClass,
  findTutorByReference,
  getTutorReferenceFromRequest,
  serializeTutor,
  verifyTutorClassSubject,
};

export default router;
