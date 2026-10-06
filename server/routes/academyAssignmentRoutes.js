import express from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import { fileURLToPath } from "url";

import pool from "../lib/db.js";

import {
  resolveAuthenticatedStudent,
  normalizeSubject,
  normalizeClass,
} from "./academyEnrollmentRoutes.js";

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/* ============================================================
   DIRECTORIES
============================================================ */

const uploadDirectory = path.join(
  __dirname,
  "../uploads/academy-assignments"
);

if (!fs.existsSync(uploadDirectory)) {
  fs.mkdirSync(uploadDirectory, {
    recursive: true,
  });
}

/* ============================================================
   BASIC HELPERS
============================================================ */

const clean = (value) => {
  if (
    value === undefined ||
    value === null
  ) {
    return "";
  }

  return String(value).trim();
};

const toNumber = (
  value,
  fallback = 0
) => {
  const number = Number(value);

  return Number.isFinite(number)
    ? number
    : fallback;
};

const parseJsonValue = (
  value,
  fallback = null
) => {
  if (
    value === undefined ||
    value === null ||
    value === ""
  ) {
    return fallback;
  }

  if (
    typeof value !== "string"
  ) {
    return value;
  }

  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
};

const getGrade = (
  percentage
) => {
  const score =
    Number(percentage) || 0;

  if (score >= 80) {
    return "A";
  }

  if (score >= 70) {
    return "B";
  }

  if (score >= 60) {
    return "C";
  }

  if (score >= 50) {
    return "D";
  }

  if (score >= 40) {
    return "E";
  }

  return "F";
};

/* ============================================================
   CLASS NORMALIZATION
============================================================ */

const safeNormalizeClass = (
  value
) => {
  const text = clean(value);

  if (!text) {
    return "";
  }

  try {
    const normalized =
      normalizeClass(text);

    if (normalized) {
      return clean(normalized)
        .toLowerCase()
        .replace(
          /[^a-z0-9]/g,
          ""
        );
    }
  } catch {
    // fallback
  }

  return text
    .toLowerCase()
    .replace(
      /[^a-z0-9]/g,
      ""
    );
};

const classesMatch = (
  first,
  second
) => {
  const a =
    safeNormalizeClass(first);

  const b =
    safeNormalizeClass(second);

  if (!a || !b) {
    return false;
  }

  return a === b;
};

/* ============================================================
   SUBJECT NORMALIZATION
============================================================ */

const safeNormalizeSubject = (
  value
) => {
  const text = clean(value);

  if (!text) {
    return "";
  }

  try {
    return clean(
      normalizeSubject(text)
    ).toLowerCase();
  } catch {
    return text.toLowerCase();
  }
};

const subjectsMatch = (
  first,
  second
) => {
  return (
    safeNormalizeSubject(first) ===
    safeNormalizeSubject(second)
  );
};

/* ============================================================
   DATABASE HELPERS
============================================================ */

const tableExists = async (
  tableName
) => {
  const result =
    await pool.query(
      `
        SELECT EXISTS (
          SELECT 1
          FROM information_schema.tables
          WHERE table_schema = 'public'
            AND table_name = $1
        ) AS exists
      `,
      [tableName]
    );

  return Boolean(
    result.rows[0]?.exists
  );
};

const getTableColumns = async (
  tableName
) => {
  const result =
    await pool.query(
      `
        SELECT column_name
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = $1
        ORDER BY ordinal_position
      `,
      [tableName]
    );

  return result.rows.map(
    (row) =>
      row.column_name
  );
};

/* ============================================================
   TUTOR REFERENCE
============================================================ */

const getTutorReference = (
  req
) => {
  const candidates = [
    req.query?.tutorReference,
    req.query?.tutor_reference,
    req.query?.reference,
    req.query?.applicationReference,
    req.query?.application_reference,

    req.body?.tutorReference,
    req.body?.tutor_reference,
    req.body?.reference,
    req.body?.applicationReference,
    req.body?.application_reference,

    req.headers[
      "x-tutor-reference"
    ],

    req.headers[
      "x-tutor-ref"
    ],
  ];

  for (
    const candidate of candidates
  ) {
    const value =
      clean(candidate);

    if (
      /^SQA-/i.test(value)
    ) {
      return value;
    }
  }

  return "";
};

const isValidTutorReference = (
  reference
) => {
  return /^SQA-/i.test(
    clean(reference)
  );
};

/* ============================================================
   FILE HELPERS
============================================================ */

const normalizeStoredFilePath = (
  value
) => {
  return clean(value)
    .replace(/\\/g, "/")
    .replace(/^\/+/, "");
};

const createFileUrl = (
  filename
) => {
  if (!filename) {
    return null;
  }

  return `/uploads/academy-assignments/${encodeURIComponent(
    filename
  )}`;
};

const extractFileInfo = (
  assignment
) => {
  const filename =
    assignment.file_name ||
    assignment.filename ||
    assignment.fileName ||
    assignment.attachment_name ||
    assignment.attachmentName ||
    assignment.document_name ||
    assignment.documentName ||
    null;

  const filePath =
    assignment.file_path ||
    assignment.filePath ||
    assignment.attachment_path ||
    assignment.attachmentPath ||
    assignment.document_path ||
    assignment.documentPath ||
    null;

  const fileUrl =
    assignment.file_url ||
    assignment.fileUrl ||
    assignment.attachment_url ||
    assignment.attachmentUrl ||
    assignment.document_url ||
    assignment.documentUrl ||
    (filename
      ? createFileUrl(filename)
      : null);

  const fileType =
    assignment.file_type ||
    assignment.fileType ||
    assignment.mime_type ||
    assignment.attachment_type ||
    null;

  const fileSize =
    assignment.file_size ||
    assignment.fileSize ||
    null;

  return {
    filename,
    fileName: filename,

    filePath,
    file_path: filePath,

    fileUrl,
    file_url: fileUrl,

    fileType,
    file_type: fileType,

    fileSize,
    file_size: fileSize,
  };
};

/* ============================================================
   SECURE FILE RESOLUTION
============================================================ */

const resolveAssignmentPhysicalFile = (
  assignment
) => {
  const file =
    extractFileInfo(
      assignment
    );

  const candidates = [];

  const storedPath =
    normalizeStoredFilePath(
      file.filePath
    );

  const storedFilename =
    path.basename(
      storedPath ||
        clean(
          file.filename
        )
    );

  const databaseFilename =
    path.basename(
      clean(
        file.filename
      )
    );

  /*
   * 1. Stored absolute path.
   */
  if (
    file.filePath &&
    path.isAbsolute(
      file.filePath
    )
  ) {
    candidates.push(
      path.resolve(
        file.filePath
      )
    );
  }

  /*
   * 2. Stored relative path resolved
   *    from the server root.
   */
  if (
    storedPath &&
    !path.isAbsolute(
      file.filePath || ""
    )
  ) {
    candidates.push(
      path.resolve(
        __dirname,
        "..",
        storedPath
      )
    );
  }

  /*
   * 3. Filename in the current upload directory.
   */
  if (storedFilename) {
    candidates.push(
      path.join(
        uploadDirectory,
        storedFilename
      )
    );
  }

  /*
   * 4. file_name in the current upload directory.
   */
  if (databaseFilename) {
    candidates.push(
      path.join(
        uploadDirectory,
        databaseFilename
      )
    );
  }

  const uniqueCandidates =
    [
      ...new Set(
        candidates.map(
          (candidate) =>
            path.resolve(
              candidate
            )
        )
      ),
    ];

  const found =
    uniqueCandidates.find(
      (candidate) => {
        try {
          return (
            fs.existsSync(
              candidate
            ) &&
            fs.statSync(
              candidate
            ).isFile()
          );
        } catch {
          return false;
        }
      }
    );

  return {
    file,
    filename:
      databaseFilename ||
      storedFilename ||
      "assignment-file",
    candidates:
      uniqueCandidates,
    path:
      found || null,
  };
};

/* ============================================================
   ASSIGNMENT CLASS
============================================================ */

const getAssignmentClassColumns =
  async () => {
    const columns =
      await getTableColumns(
        "academy_assignments"
      );

    const possibleColumns = [
      "class_name",
      "class",
      "grade",
      "className",
      "current_class",
      "student_class",
    ];

    return possibleColumns.filter(
      (column) =>
        columns.includes(
          column
        )
    );
  };

const getAssignmentClass = (
  assignment
) => {
  return (
    assignment.class_name ||
    assignment.className ||
    assignment.class ||
    assignment.grade ||
    assignment.current_class ||
    assignment.student_class ||
    ""
  );
};

const buildAssignmentClassWhere = (
  classColumns,
  parameterNumber = 1
) => {
  if (
    !classColumns.length
  ) {
    return {
      sql: "FALSE",
    };
  }

  const expressions =
    classColumns.map(
      (column) => `
        LOWER(
          REGEXP_REPLACE(
            COALESCE("${column}"::text, ''),
            '[^a-zA-Z0-9]',
            '',
            'g'
          )
        )
        =
        LOWER(
          REGEXP_REPLACE(
            $${parameterNumber}::text,
            '[^a-zA-Z0-9]',
            '',
            'g'
          )
        )
      `
    );

  return {
    sql: `(${expressions.join(
      " OR "
    )})`,
  };
};

/* ============================================================
   QUESTIONS
============================================================ */

const formatQuestion = (
  question
) => {
  return {
    id:
      question.id,

    assignmentId:
      question.assignment_id,

    question:
      question.question ||
      question.question_text ||
      question.text ||
      "",

    questionText:
      question.question ||
      question.question_text ||
      question.text ||
      "",

    optionA:
      question.option_a ||
      question.optionA ||
      "",

    optionB:
      question.option_b ||
      question.optionB ||
      "",

    optionC:
      question.option_c ||
      question.optionC ||
      "",

    optionD:
      question.option_d ||
      question.optionD ||
      "",

    correctAnswer:
      question.correct_answer ||
      question.correctAnswer ||
      "",

    marks:
      toNumber(
        question.marks,
        1
      ),

    createdAt:
      question.created_at ||
      null,
  };
};

const getAssignmentQuestions =
  async (
    assignmentId
  ) => {
    const exists =
      await tableExists(
        "academy_assignment_questions"
      );

    if (!exists) {
      return [];
    }

    const columns =
      await getTableColumns(
        "academy_assignment_questions"
      );

    if (
      !columns.includes(
        "assignment_id"
      )
    ) {
      return [];
    }

    const orderColumn =
      columns.includes(
        "created_at"
      )
        ? "created_at"
        : "id";

    const result =
      await pool.query(
        `
          SELECT *
          FROM academy_assignment_questions
          WHERE assignment_id = $1
          ORDER BY ${orderColumn} ASC, id ASC
        `,
        [assignmentId]
      );

    return result.rows.map(
      formatQuestion
    );
  };

/* ============================================================
   ASSIGNMENT FORMATTER
============================================================ */

const formatAssignment = (
  assignment,
  questions = [],
  submission = null
) => {
  const file =
    extractFileInfo(
      assignment
    );

  const assignmentClass =
    getAssignmentClass(
      assignment
    );

  const subject =
    clean(
      assignment.subject
    );

  return {
    id:
      assignment.id,

    tutorReference:
      assignment.tutor_reference ||
      null,

    tutorName:
      assignment.tutor_name ||
      "Tutor",

    title:
      assignment.title ||
      "Untitled Assignment",

    description:
      assignment.description ||
      "",

    instructions:
      assignment.instructions ||
      "",

    className:
      assignmentClass,

    class:
      assignmentClass,

    grade:
      assignment.grade ||
      assignmentClass,

    subject,

    normalizedSubject:
      safeNormalizeSubject(
        subject
      ),

    dueDate:
      assignment.due_date ||
      assignment.due_at ||
      null,

    due_date:
      assignment.due_date ||
      assignment.due_at ||
      null,

    status:
      assignment.status ||
      "published",

    resultReleased:
      Boolean(
        assignment.result_released
      ),

    result_released:
      Boolean(
        assignment.result_released
      ),

    totalQuestions:
      toNumber(
        assignment.total_questions,
        questions.length
      ),

    total_questions:
      toNumber(
        assignment.total_questions,
        questions.length
      ),

    totalMarks:
      toNumber(
        assignment.total_marks,
        questions.reduce(
          (
            total,
            question
          ) =>
            total +
            toNumber(
              question.marks,
              1
            ),
          0
        )
      ),

    total_marks:
      toNumber(
        assignment.total_marks,
        questions.reduce(
          (
            total,
            question
          ) =>
            total +
            toNumber(
              question.marks,
              1
            ),
          0
        )
      ),

    fileName:
      file.fileName,

    filename:
      file.filename,

    file_name:
      file.fileName,

    fileUrl:
      file.fileUrl,

    file_url:
      file.file_url,

    filePath:
      file.filePath,

    file_path:
      file.file_path,

    fileType:
      file.fileType,

    file_type:
      file.file_type,

    fileSize:
      file.fileSize,

    file_size:
      file.file_size,

    attachmentName:
      file.fileName,

    attachment_name:
      file.fileName,

    attachmentUrl:
      file.fileUrl,

    attachment_url:
      file.file_url,

    file:
      file.fileName ||
      file.filePath ||
      file.fileUrl
        ? {
            name:
              file.fileName,

            fileName:
              file.fileName,

            url:
              file.fileUrl,

            fileUrl:
              file.fileUrl,

            path:
              file.filePath,

            filePath:
              file.filePath,

            type:
              file.fileType,

            size:
              file.fileSize,
          }
        : null,

    questions,

    submission,

    submissionStatus:
      submission?.status ||
      "pending",

    submitted:
      Boolean(
        submission
      ),

    score:
      submission?.score ??
      null,

    maxScore:
      submission?.max_score ??
      null,

    percentage:
      submission?.percentage ??
      null,

    gradeResult:
      submission?.grade ??
      null,

    submittedAt:
      submission?.submitted_at ||
      null,

    createdAt:
      assignment.created_at ||
      null,

    updatedAt:
      assignment.updated_at ||
      null,
  };
};

/* ============================================================
   STUDENT AUTHENTICATION
============================================================ */

const authenticateStudent =
  async (
    req,
    res
  ) => {
    try {
      const authenticated =
        await resolveAuthenticatedStudent(
          req
        );

      if (
        !authenticated ||
        !authenticated.student
      ) {
        res.status(401).json({
          success: false,
          message:
            "Student authentication is required. Please log in again.",
        });

        return null;
      }

      const studentClass =
        authenticated.studentClass ||
        authenticated.serialized
          ?.className ||
        authenticated.serialized
          ?.class ||
        authenticated.serialized
          ?.grade ||
        authenticated.student
          ?.className ||
        authenticated.student
          ?.class ||
        authenticated.student
          ?.grade ||
        "";

      if (!studentClass) {
        res.status(400).json({
          success: false,
          message:
            "Your student profile does not have a class assigned. Please contact the administrator.",
        });

        return null;
      }

      return {
        ...authenticated,
        studentClass,
      };
    } catch (error) {
      console.error(
        "STUDENT AUTH ERROR:",
        error
      );

      res.status(401).json({
        success: false,
        message:
          "Student authentication is required. Please log in again.",
      });

      return null;
    }
  };

const getAuthenticatedStudentReference =
  (
    authenticated
  ) => {
    const serialized =
      authenticated?.serialized ||
      {};

    const student =
      authenticated?.student ||
      {};

    const decoded =
      authenticated?.decoded ||
      {};

    return clean(
      serialized.studentId ||
        serialized.student_id ||
        serialized.registrationNumber ||
        serialized.registration_number ||
        serialized.reference ||
        serialized.enrollmentId ||
        serialized.enrollment_id ||

        student.studentId ||
        student.student_id ||
        student.registrationNumber ||
        student.registration_number ||
        student.reference ||
        student.enrollmentId ||
        student.enrollment_id ||

        decoded.studentId ||
        decoded.student_id ||
        decoded.registrationNumber ||
        decoded.registration_number ||
        decoded.reference ||
        decoded.enrollmentId ||
        decoded.enrollment_id
    );
  };

/* ============================================================
   STUDENT SUBMISSIONS
============================================================ */

const getLatestStudentSubmission =
  async (
    assignmentId,
    studentReference
  ) => {
    if (
      !studentReference
    ) {
      return null;
    }

    const exists =
      await tableExists(
        "academy_assignment_submissions"
      );

    if (!exists) {
      return null;
    }

    const columns =
      await getTableColumns(
        "academy_assignment_submissions"
      );

    if (
      !columns.includes(
        "assignment_id"
      ) ||
      !columns.includes(
        "student_reference"
      )
    ) {
      return null;
    }

    const orderColumn =
      columns.includes(
        "submitted_at"
      )
        ? "submitted_at"
        : columns.includes(
            "created_at"
          )
          ? "created_at"
          : "id";

    const result =
      await pool.query(
        `
          SELECT *
          FROM academy_assignment_submissions
          WHERE assignment_id = $1
            AND student_reference = $2
          ORDER BY ${orderColumn} DESC, id DESC
          LIMIT 1
        `,
        [
          assignmentId,
          studentReference,
        ]
      );

    return (
      result.rows[0] ||
      null
    );
  };

/* ============================================================
   TUTOR OWNERSHIP
============================================================ */

const verifyTutorOwnsAssignment =
  async (
    assignmentId,
    tutorReference
  ) => {
    const result =
      await pool.query(
        `
          SELECT *
          FROM academy_assignments
          WHERE id = $1
            AND tutor_reference = $2
          LIMIT 1
        `,
        [
          assignmentId,
          tutorReference,
        ]
      );

    return (
      result.rows[0] ||
      null
    );
  };

/* ============================================================
   MULTER
============================================================ */

const allowedExtensions =
  new Set([
    ".pdf",
    ".doc",
    ".docx",
    ".ppt",
    ".pptx",
    ".xls",
    ".xlsx",
    ".txt",
    ".jpg",
    ".jpeg",
    ".png",
    ".webp",
    ".zip",
    ".mp4",
    ".webm",
    ".mov",
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
        uploadDirectory
      );
    },

    filename: (
      _req,
      file,
      callback
    ) => {
      const extension =
        path.extname(
          file.originalname ||
            ""
        ).toLowerCase();

      const safeExtension =
        allowedExtensions.has(
          extension
        )
          ? extension
          : "";

      const filename =
        `${Date.now()}-${crypto
          .randomBytes(10)
          .toString("hex")}${safeExtension}`;

      callback(
        null,
        filename
      );
    },
  });

const upload =
  multer({
    storage,

    limits: {
      fileSize:
        250 *
        1024 *
        1024,
    },

    fileFilter: (
      _req,
      file,
      callback
    ) => {
      const extension =
        path.extname(
          file.originalname ||
            ""
        ).toLowerCase();

      if (
        !allowedExtensions.has(
          extension
        )
      ) {
        return callback(
          new Error(
            `Unsupported file type: ${
              extension ||
              "unknown"
            }`
          )
        );
      }

      callback(
        null,
        true
      );
    },
  });

/* ============================================================
   CREATE ASSIGNMENT
============================================================ */

router.post(
  "/tutor/assignments",
  upload.single("file"),
  async (
    req,
    res
  ) => {
    let uploadedFilePath =
      null;

    try {
      const tutorReference =
        getTutorReference(
          req
        );

      if (
        !tutorReference ||
        !isValidTutorReference(
          tutorReference
        )
      ) {
        if (
          req.file?.path &&
          fs.existsSync(
            req.file.path
          )
        ) {
          fs.unlinkSync(
            req.file.path
          );
        }

        return res.status(401).json({
          success: false,
          message:
            "A valid SQA tutor reference is required.",
        });
      }

      const title =
        clean(
          req.body.title
        );

      const description =
        clean(
          req.body.description
        );

      const instructions =
        clean(
          req.body.instructions
        );

      const className =
        clean(
          req.body.class_name ||
            req.body.className ||
            req.body.class ||
            req.body.grade
        );

      const subject =
        clean(
          req.body.subject
        );

      const tutorName =
        clean(
          req.body.tutor_name ||
            req.body.tutorName
        );

      const dueDate =
        clean(
          req.body.due_date ||
            req.body.dueDate ||
            req.body.due_at
        ) || null;

      if (
        title.length < 3
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Assignment title must be at least 3 characters.",
        });
      }

      if (!className) {
        return res.status(400).json({
          success: false,
          message:
            "Assignment class is required.",
        });
      }

      if (!subject) {
        return res.status(400).json({
          success: false,
          message:
            "Assignment subject is required.",
        });
      }

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message:
            "Please upload the assignment file.",
        });
      }

      uploadedFilePath =
        req.file.path;

      const assignmentColumns =
        await getTableColumns(
          "academy_assignments"
        );

      const questionsExist =
        await tableExists(
          "academy_assignment_questions"
        );

      const rawQuestions =
        parseJsonValue(
          req.body.questions,
          []
        );

      const questions =
        Array.isArray(
          rawQuestions
        )
          ? rawQuestions
          : [];

      const validQuestions =
        questions
          .map(
            (
              question
            ) => ({
              question:
                clean(
                  question.question ||
                    question.question_text ||
                    question.text
                ),

              optionA:
                clean(
                  question.optionA ||
                    question.option_a
                ),

              optionB:
                clean(
                  question.optionB ||
                    question.option_b
                ),

              optionC:
                clean(
                  question.optionC ||
                    question.option_c
                ),

              optionD:
                clean(
                  question.optionD ||
                    question.option_d
                ),

              correctAnswer:
                clean(
                  question.correctAnswer ||
                    question.correct_answer
                ).toUpperCase(),

              marks:
                Math.max(
                  1,
                  toNumber(
                    question.marks,
                    1
                  )
                ),
            })
          )
          .filter(
            (
              question
            ) =>
              question.question &&
              question.optionA &&
              question.optionB &&
              question.optionC &&
              question.optionD &&
              [
                "A",
                "B",
                "C",
                "D",
              ].includes(
                question.correctAnswer
              )
          );

      const totalQuestions =
        validQuestions.length;

      const totalMarks =
        validQuestions.reduce(
          (
            total,
            question
          ) =>
            total +
            question.marks,
          0
        );

      const columns = [];
      const values = [];
      const parameters = [];

      const addColumn = (
        column,
        value
      ) => {
        if (
          assignmentColumns.includes(
            column
          )
        ) {
          columns.push(
            `"${column}"`
          );

          values.push(
            value
          );

          parameters.push(
            `$${parameters.length + 1}`
          );
        }
      };

      addColumn(
        "tutor_reference",
        tutorReference
      );

      addColumn(
        "tutor_name",
        tutorName ||
          "Tutor"
      );

      addColumn(
        "title",
        title
      );

      addColumn(
        "description",
        description
      );

      addColumn(
        "instructions",
        instructions
      );

      if (
        assignmentColumns.includes(
          "class_name"
        )
      ) {
        addColumn(
          "class_name",
          className
        );
      } else if (
        assignmentColumns.includes(
          "class"
        )
      ) {
        addColumn(
          "class",
          className
        );
      }

      if (
        assignmentColumns.includes(
          "grade"
        )
      ) {
        addColumn(
          "grade",
          className
        );
      }

      addColumn(
        "subject",
        subject
      );

      addColumn(
        "due_date",
        dueDate
      );

      addColumn(
        "status",
        "published"
      );

      addColumn(
        "result_released",
        false
      );

      addColumn(
        "total_questions",
        totalQuestions
      );

      addColumn(
        "total_marks",
        totalMarks
      );

      const fileName =
        req.file.filename;

      const fileUrl =
        createFileUrl(
          fileName
        );

      addColumn(
        "file_name",
        fileName
      );

      addColumn(
        "file_url",
        fileUrl
      );

      /*
       * Store the relative path as well.
       * This prevents old absolute server paths
       * from becoming unusable after deployment.
       */
      const relativeFilePath =
        path
          .relative(
            path.join(
              __dirname,
              ".."
            ),
            req.file.path
          )
          .replace(
            /\\/g,
            "/"
          );

      addColumn(
        "file_path",
        relativeFilePath
      );

      addColumn(
        "file_type",
        req.file.mimetype
      );

      addColumn(
        "file_size",
        req.file.size
      );

      if (
        assignmentColumns.includes(
          "created_at"
        )
      ) {
        columns.push(
          `"created_at"`
        );

        values.push(
          new Date()
        );

        parameters.push(
          `$${parameters.length + 1}`
        );
      }

      const client =
        await pool.connect();

      try {
        await client.query(
          "BEGIN"
        );

        const result =
          await client.query(
            `
              INSERT INTO academy_assignments
              (${columns.join(", ")})
              VALUES
              (${parameters.join(", ")})
              RETURNING *
            `,
            values
          );

        const assignment =
          result.rows[0];

        if (
          questionsExist &&
          validQuestions.length
        ) {
          const questionColumns =
            await getTableColumns(
              "academy_assignment_questions"
            );

          for (
            const question of validQuestions
          ) {
            const qColumns = [];
            const qValues = [];
            const qParameters = [];

            const addQuestion = (
              column,
              value
            ) => {
              if (
                questionColumns.includes(
                  column
                )
              ) {
                qColumns.push(
                  `"${column}"`
                );

                qValues.push(
                  value
                );

                qParameters.push(
                  `$${qParameters.length + 1}`
                );
              }
            };

            addQuestion(
              "assignment_id",
              assignment.id
            );

            addQuestion(
              "question",
              question.question
            );

            addQuestion(
              "question_text",
              question.question
            );

            addQuestion(
              "option_a",
              question.optionA
            );

            addQuestion(
              "option_b",
              question.optionB
            );

            addQuestion(
              "option_c",
              question.optionC
            );

            addQuestion(
              "option_d",
              question.optionD
            );

            addQuestion(
              "correct_answer",
              question.correctAnswer
            );

            addQuestion(
              "marks",
              question.marks
            );

            if (
              questionColumns.includes(
                "created_at"
              )
            ) {
              addQuestion(
                "created_at",
                new Date()
              );
            }

            if (
              qColumns.length
            ) {
              await client.query(
                `
                  INSERT INTO academy_assignment_questions
                  (${qColumns.join(", ")})
                  VALUES
                  (${qParameters.join(", ")})
                `,
                qValues
              );
            }
          }
        }

        await client.query(
          "COMMIT"
        );

        const finalQuestions =
          await getAssignmentQuestions(
            assignment.id
          );

        const formatted =
          formatAssignment(
            assignment,
            finalQuestions
          );

        return res.status(201).json({
          success: true,

          message:
            "Assignment created successfully.",

          assignment:
            formatted,

          data:
            formatted,
        });
      } catch (error) {
        await client.query(
          "ROLLBACK"
        );

        throw error;
      } finally {
        client.release();
      }
    } catch (error) {
      console.error(
        "CREATE ASSIGNMENT ERROR:",
        error
      );

      if (
        uploadedFilePath &&
        fs.existsSync(
          uploadedFilePath
        )
      ) {
        try {
          fs.unlinkSync(
            uploadedFilePath
          );
        } catch {
          // ignore
        }
      }

      return res.status(500).json({
        success: false,
        message:
          error.message ||
          "Unable to create assignment.",
      });
    }
  }
);

/* ============================================================
   TUTOR ASSIGNMENTS
============================================================ */

router.get(
  "/tutor/assignments",
  async (
    req,
    res
  ) => {
    try {
      const tutorReference =
        getTutorReference(
          req
        );

      if (
        !tutorReference ||
        !isValidTutorReference(
          tutorReference
        )
      ) {
        return res.status(401).json({
          success: false,
          message:
            "A valid SQA tutor reference is required.",
        });
      }

      const columns =
        await getTableColumns(
          "academy_assignments"
        );

      const orderColumn =
        columns.includes(
          "created_at"
        )
          ? "created_at"
          : "id";

      const result =
        await pool.query(
          `
            SELECT *
            FROM academy_assignments
            WHERE tutor_reference = $1
            ORDER BY ${orderColumn} DESC, id DESC
          `,
          [
            tutorReference,
          ]
        );

      const assignments =
        await Promise.all(
          result.rows.map(
            async (
              assignment
            ) => {
              const questions =
                await getAssignmentQuestions(
                  assignment.id
                );

              return formatAssignment(
                assignment,
                questions
              );
            }
          )
        );

      return res.json({
        success: true,
        assignments,

        data:
          assignments,

        results:
          assignments,

        count:
          assignments.length,
      });
    } catch (error) {
      console.error(
        "TUTOR ASSIGNMENTS ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to load tutor assignments.",
      });
    }
  }
);

/* ============================================================
   TUTOR SINGLE ASSIGNMENT
============================================================ */

router.get(
  "/tutor/assignments/:id",
  async (
    req,
    res
  ) => {
    try {
      const tutorReference =
        getTutorReference(
          req
        );

      if (
        !tutorReference ||
        !isValidTutorReference(
          tutorReference
        )
      ) {
        return res.status(401).json({
          success: false,
          message:
            "A valid SQA tutor reference is required.",
        });
      }

      const assignment =
        await verifyTutorOwnsAssignment(
          req.params.id,
          tutorReference
        );

      if (!assignment) {
        return res.status(404).json({
          success: false,
          message:
            "Assignment not found.",
        });
      }

      const questions =
        await getAssignmentQuestions(
          assignment.id
        );

      const formatted =
        formatAssignment(
          assignment,
          questions
        );

      return res.json({
        success: true,

        assignment:
          formatted,

        data:
          formatted,
      });
    } catch (error) {
      console.error(
        "TUTOR ASSIGNMENT ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to load assignment.",
      });
    }
  }
);

/* ============================================================
   STUDENT ASSIGNMENTS
   ONLY ASSIGNMENTS MATCHING THE
   STUDENT'S CLASS ARE RETURNED.
============================================================ */

router.get(
  "/student/assignments",
  async (
    req,
    res
  ) => {
    try {
      const authenticated =
        await authenticateStudent(
          req,
          res
        );

      if (!authenticated) {
        return;
      }

      const studentClass =
        authenticated.studentClass;

      const requestedSubject =
        clean(
          req.query.subject
        );

      const assignmentColumns =
        await getTableColumns(
          "academy_assignments"
        );

      const classColumns =
        await getAssignmentClassColumns();

      if (
        !classColumns.length
      ) {
        return res.status(500).json({
          success: false,
          message:
            "Assignment class fields could not be found.",
        });
      }

      const classWhere =
        buildAssignmentClassWhere(
          classColumns,
          1
        );

      const values = [
        studentClass,
      ];

      let whereSql =
        `WHERE ${classWhere.sql}`;

      if (
        requestedSubject &&
        assignmentColumns.includes(
          "subject"
        )
      ) {
        values.push(
          requestedSubject
        );

        whereSql += `
          AND LOWER(TRIM(subject::text))
              =
              LOWER(TRIM($${values.length}::text))
        `;
      }

      const orderColumn =
        assignmentColumns.includes(
          "created_at"
        )
          ? "created_at"
          : "id";

      const result =
        await pool.query(
          `
            SELECT *
            FROM academy_assignments
            ${whereSql}
            ORDER BY ${orderColumn} DESC, id DESC
          `,
          values
        );

      let assignmentRows =
        result.rows.filter(
          (
            assignment
          ) =>
            classesMatch(
              getAssignmentClass(
                assignment
              ),
              studentClass
            )
        );

      if (
        requestedSubject
      ) {
        assignmentRows =
          assignmentRows.filter(
            (
              assignment
            ) =>
              subjectsMatch(
                assignment.subject,
                requestedSubject
              )
          );
      }

      const studentReference =
        getAuthenticatedStudentReference(
          authenticated
        );

      const assignments =
        await Promise.all(
          assignmentRows.map(
            async (
              assignment
            ) => {
              const questions =
                await getAssignmentQuestions(
                  assignment.id
                );

              const submission =
                await getLatestStudentSubmission(
                  assignment.id,
                  studentReference
                );

              /*
               * Never send correct answers to students.
               */
              const studentQuestions =
                questions.map(
                  (
                    question
                  ) => ({
                    id:
                      question.id,

                    assignmentId:
                      question.assignmentId,

                    question:
                      question.question,

                    questionText:
                      question.questionText,

                    optionA:
                      question.optionA,

                    optionB:
                      question.optionB,

                    optionC:
                      question.optionC,

                    optionD:
                      question.optionD,

                    marks:
                      question.marks,
                  })
                );

              const formatted =
                formatAssignment(
                  assignment,
                  studentQuestions,
                  submission
                );

              if (
                formatted.fileName
              ) {
                formatted.fileUrl =
                  `/api/academy/student/assignments/${encodeURIComponent(
                    assignment.id
                  )}/file`;

                formatted.file_url =
                  formatted.fileUrl;
              }

              return formatted;
            }
          )
        );

      const subjectMap =
        new Map();

      assignments.forEach(
        (
          assignment
        ) => {
          const subject =
            clean(
              assignment.subject
            );

          if (!subject) {
            return;
          }

          const key =
            safeNormalizeSubject(
              subject
            );

          if (
            !subjectMap.has(
              key
            )
          ) {
            subjectMap.set(
              key,
              {
                name:
                  subject,

                normalizedName:
                  key,

                count:
                  0,
              }
            );
          }

          subjectMap.get(
            key
          ).count += 1;
        }
      );

      const subjects =
        Array.from(
          subjectMap.values()
        ).sort(
          (
            a,
            b
          ) =>
            a.name.localeCompare(
              b.name
            )
        );

      return res.json({
        success: true,

        student:
          authenticated.serialized,

        class:
          studentClass,

        studentClass:
          studentClass,

        subjects,

        assignments,

        data:
          assignments,

        results:
          assignments,

        count:
          assignments.length,
      });
    } catch (error) {
      console.error(
        "STUDENT ASSIGNMENTS ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          error.message ||
          "Unable to load student assignments.",
      });
    }
  }
);

/* ============================================================
   STUDENT SINGLE ASSIGNMENT
============================================================ */

router.get(
  "/student/assignments/:id",
  async (
    req,
    res
  ) => {
    try {
      const authenticated =
        await authenticateStudent(
          req,
          res
        );

      if (!authenticated) {
        return;
      }

      const studentClass =
        authenticated.studentClass;

      const classColumns =
        await getAssignmentClassColumns();

      const classWhere =
        buildAssignmentClassWhere(
          classColumns,
          2
        );

      const result =
        await pool.query(
          `
            SELECT *
            FROM academy_assignments
            WHERE id = $1
              AND ${classWhere.sql}
            LIMIT 1
          `,
          [
            req.params.id,
            studentClass,
          ]
        );

      const assignment =
        result.rows[0];

      if (
        !assignment ||
        !classesMatch(
          getAssignmentClass(
            assignment
          ),
          studentClass
        )
      ) {
        return res.status(404).json({
          success: false,
          message:
            "Assignment not found for your class.",
        });
      }

      const questions =
        await getAssignmentQuestions(
          assignment.id
        );

      const studentQuestions =
        questions.map(
          (
            question
          ) => ({
            id:
              question.id,

            assignmentId:
              question.assignmentId,

            question:
              question.question,

            questionText:
              question.questionText,

            optionA:
              question.optionA,

            optionB:
              question.optionB,

            optionC:
              question.optionC,

            optionD:
              question.optionD,

            marks:
              question.marks,
          })
        );

      const studentReference =
        getAuthenticatedStudentReference(
          authenticated
        );

      const submission =
        await getLatestStudentSubmission(
          assignment.id,
          studentReference
        );

      const formatted =
        formatAssignment(
          assignment,
          studentQuestions,
          submission
        );

      if (
        formatted.fileName
      ) {
        formatted.fileUrl =
          `/api/academy/student/assignments/${encodeURIComponent(
            assignment.id
          )}/file`;

        formatted.file_url =
          formatted.fileUrl;
      }

      return res.json({
        success: true,

        student:
          authenticated.serialized,

        class:
          studentClass,

        assignment:
          formatted,

        data:
          formatted,

        submission,
      });
    } catch (error) {
      console.error(
        "STUDENT ASSIGNMENT DETAIL ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to load assignment.",
      });
    }
  }
);

/* ============================================================
   STUDENT AUTHENTICATED FILE
   FIXED PROTECTED FILE ROUTE
============================================================ */

router.get(
  "/student/assignments/:id/file",
  async (
    req,
    res
  ) => {
    try {
      /*
       * Authenticate the student first.
       */
      const authenticated =
        await authenticateStudent(
          req,
          res
        );

      if (!authenticated) {
        return;
      }

      const studentClass =
        authenticated.studentClass;

      /*
       * Only allow a student to access
       * assignments belonging to their class.
       */
      const classColumns =
        await getAssignmentClassColumns();

      const classWhere =
        buildAssignmentClassWhere(
          classColumns,
          2
        );

      const result =
        await pool.query(
          `
            SELECT *
            FROM academy_assignments
            WHERE id = $1
              AND ${classWhere.sql}
            LIMIT 1
          `,
          [
            req.params.id,
            studentClass,
          ]
        );

      const assignment =
        result.rows[0];

      if (
        !assignment ||
        !classesMatch(
          getAssignmentClass(
            assignment
          ),
          studentClass
        )
      ) {
        return res.status(404).json({
          success: false,
          message:
            "Assignment not found for your class.",
        });
      }

      /*
       * Extract every possible file field
       * supported by the assignment table.
       */
      const file =
        extractFileInfo(
          assignment
        );

      if (
        !file.filename &&
        !file.filePath
      ) {
        return res.status(404).json({
          success: false,
          message:
            "This assignment does not have a file.",
        });
      }

      /*
       * IMPORTANT FIX:
       *
       * Do NOT assume file_path is still a valid
       * absolute path.
       *
       * The application may have been moved,
       * redeployed, or the database may contain
       * a path from an older server location.
       *
       * resolveAssignmentPhysicalFile()
       * checks:
       *
       * 1. Stored absolute path
       * 2. Stored relative path
       * 3. Current uploads directory + stored filename
       * 4. Current uploads directory + file_name
       */
      const resolved =
        resolveAssignmentPhysicalFile(
          assignment
        );

      if (
        !resolved.path
      ) {
        console.error(
          "STUDENT ASSIGNMENT FILE NOT FOUND",
          {
            assignmentId:
              req.params.id,

            studentClass,

            databaseFileName:
              file.filename,

            databaseFilePath:
              file.filePath,

            databaseFileUrl:
              file.fileUrl,

            uploadDirectory,

            candidates:
              resolved.candidates,
          }
        );

        return res.status(404).json({
          success: false,
          message:
            "Assignment file not found.",
        });
      }

      /*
       * Determine a safe display filename.
       */
      const displayFilename =
        path.basename(
          clean(
            file.filename
          ) ||
            path.basename(
              resolved.path
            )
        );

      /*
       * Correct MIME type when the database
       * contains one.
       */
      if (
        file.fileType
      ) {
        res.type(
          file.fileType
        );
      } else {
        const extension =
          path.extname(
            resolved.path
          ).toLowerCase();

        const mimeTypes = {
          ".pdf":
            "application/pdf",

          ".doc":
            "application/msword",

          ".docx":
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",

          ".ppt":
            "application/vnd.ms-powerpoint",

          ".pptx":
            "application/vnd.openxmlformats-officedocument.presentationml.presentation",

          ".xls":
            "application/vnd.ms-excel",

          ".xlsx":
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",

          ".txt":
            "text/plain",

          ".jpg":
            "image/jpeg",

          ".jpeg":
            "image/jpeg",

          ".png":
            "image/png",

          ".webp":
            "image/webp",

          ".mp4":
            "video/mp4",

          ".webm":
            "video/webm",

          ".mov":
            "video/quicktime",
        };

        if (
          mimeTypes[
            extension
          ]
        ) {
          res.type(
            mimeTypes[
              extension
            ]
          );
        }
      }

      /*
       * Inline is important for PDF preview.
       * The frontend can still download the
       * returned Blob itself.
       */
      res.setHeader(
        "Content-Disposition",
        `inline; filename="${encodeURIComponent(
          displayFilename
        )}"`
      );

      /*
       * Prevent caching protected student files.
       */
      res.setHeader(
        "Cache-Control",
        "private, no-store, max-age=0"
      );

      return res.sendFile(
        resolved.path
      );
    } catch (error) {
      console.error(
        "STUDENT FILE ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to open assignment file.",
      });
    }
  }
);

/* ============================================================
   STUDENT SUBMIT
============================================================ */

router.post(
  "/student/assignments/:id/submit",
  async (
    req,
    res
  ) => {
    try {
      const authenticated =
        await authenticateStudent(
          req,
          res
        );

      if (!authenticated) {
        return;
      }

      const studentClass =
        authenticated.studentClass;

      const classColumns =
        await getAssignmentClassColumns();

      const classWhere =
        buildAssignmentClassWhere(
          classColumns,
          2
        );

      const assignmentResult =
        await pool.query(
          `
            SELECT *
            FROM academy_assignments
            WHERE id = $1
              AND ${classWhere.sql}
            LIMIT 1
          `,
          [
            req.params.id,
            studentClass,
          ]
        );

      const assignment =
        assignmentResult.rows[0];

      if (
        !assignment ||
        !classesMatch(
          getAssignmentClass(
            assignment
          ),
          studentClass
        )
      ) {
        return res.status(404).json({
          success: false,
          message:
            "Assignment not found for your class.",
        });
      }

      const questions =
        await getAssignmentQuestions(
          assignment.id
        );

      if (
        !questions.length
      ) {
        return res.status(400).json({
          success: false,
          message:
            "This assignment has no questions to submit.",
        });
      }

      const rawAnswers =
        req.body?.answers;

      const answers =
        Array.isArray(
          rawAnswers
        )
          ? rawAnswers
          : rawAnswers &&
              typeof rawAnswers ===
                "object"
            ? Object.entries(
                rawAnswers
              ).map(
                ([
                  questionId,
                  studentAnswer,
                ]) => ({
                  questionId,
                  studentAnswer,
                })
              )
            : [];

      const answerMap =
        new Map();

      answers.forEach(
        (
          answer
        ) => {
          const questionId =
            clean(
              answer.questionId ||
                answer.question_id ||
                answer.id
            );

          const studentAnswer =
            clean(
              answer.studentAnswer ||
                answer.student_answer ||
                answer.answer
            ).toUpperCase();

          if (
            questionId
          ) {
            answerMap.set(
              String(
                questionId
              ),
              studentAnswer
            );
          }
        }
      );

      let score = 0;
      let maxScore = 0;

      const gradedAnswers =
        questions.map(
          (
            question
          ) => {
            const marks =
              Math.max(
                1,
                toNumber(
                  question.marks,
                  1
                )
              );

            maxScore += marks;

            const studentAnswer =
              answerMap.get(
                String(
                  question.id
                )
              ) || "";

            const correctAnswer =
              clean(
                question.correctAnswer
              ).toUpperCase();

            const isCorrect =
              studentAnswer !== "" &&
              studentAnswer ===
                correctAnswer;

            const marksAwarded =
              isCorrect
                ? marks
                : 0;

            score +=
              marksAwarded;

            return {
              questionId:
                question.id,

              studentAnswer,

              correctAnswer,

              isCorrect,

              marksAwarded,
            };
          }
        );

      const percentage =
        maxScore > 0
          ? Number(
              (
                (score /
                  maxScore) *
                100
              ).toFixed(2)
            )
          : 0;

      const grade =
        getGrade(
          percentage
        );

      const studentReference =
        getAuthenticatedStudentReference(
          authenticated
        );

      if (
        !studentReference
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Your student reference could not be determined. Please log out and log in again.",
        });
      }

      const submissionsExist =
        await tableExists(
          "academy_assignment_submissions"
        );

      if (
        !submissionsExist
      ) {
        return res.status(500).json({
          success: false,
          message:
            "Assignment submissions table was not found.",
        });
      }

      const submissionColumns =
        await getTableColumns(
          "academy_assignment_submissions"
        );

      const columns = [];
      const values = [];
      const parameters = [];

      const addColumn = (
        column,
        value
      ) => {
        if (
          submissionColumns.includes(
            column
          )
        ) {
          columns.push(
            `"${column}"`
          );

          values.push(
            value
          );

          parameters.push(
            `$${parameters.length + 1}`
          );
        }
      };

      addColumn(
        "assignment_id",
        assignment.id
      );

      addColumn(
        "student_reference",
        studentReference
      );

      addColumn(
        "score",
        score
      );

      addColumn(
        "max_score",
        maxScore
      );

      addColumn(
        "percentage",
        percentage
      );

      addColumn(
        "grade",
        grade
      );

      addColumn(
        "status",
        "submitted"
      );

      addColumn(
        "submitted_at",
        new Date()
      );

      addColumn(
        "created_at",
        new Date()
      );

      if (
        !columns.length
      ) {
        return res.status(500).json({
          success: false,
          message:
            "No compatible submission fields were found.",
        });
      }

      const client =
        await pool.connect();

      try {
        await client.query(
          "BEGIN"
        );

        const submissionResult =
          await client.query(
            `
              INSERT INTO academy_assignment_submissions
              (${columns.join(", ")})
              VALUES
              (${parameters.join(", ")})
              RETURNING *
            `,
            values
          );

        const submission =
          submissionResult.rows[0];

        const answersExist =
          await tableExists(
            "academy_assignment_answers"
          );

        if (
          answersExist
        ) {
          const answerColumns =
            await getTableColumns(
              "academy_assignment_answers"
            );

          for (
            const answer of gradedAnswers
          ) {
            const answerInsertColumns =
              [];

            const answerValues =
              [];

            const answerParameters =
              [];

            const addAnswer = (
              column,
              value
            ) => {
              if (
                answerColumns.includes(
                  column
                )
              ) {
                answerInsertColumns.push(
                  `"${column}"`
                );

                answerValues.push(
                  value
                );

                answerParameters.push(
                  `$${answerParameters.length + 1}`
                );
              }
            };

            addAnswer(
              "submission_id",
              submission.id
            );

            addAnswer(
              "question_id",
              answer.questionId
            );

            addAnswer(
              "student_answer",
              answer.studentAnswer
            );

            addAnswer(
              "correct_answer",
              answer.correctAnswer
            );

            addAnswer(
              "is_correct",
              answer.isCorrect
            );

            addAnswer(
              "marks_awarded",
              answer.marksAwarded
            );

            if (
              answerInsertColumns.length
            ) {
              await client.query(
                `
                  INSERT INTO academy_assignment_answers
                  (${answerInsertColumns.join(
                    ", "
                  )})
                  VALUES
                  (${answerParameters.join(
                    ", "
                  )})
                `,
                answerValues
              );
            }
          }
        }

        await client.query(
          "COMMIT"
        );

        return res.status(201).json({
          success: true,

          message:
            "Assignment submitted successfully.",

          submission,

          result: {
            score,
            maxScore,
            percentage,
            grade,
          },
        });
      } catch (error) {
        await client.query(
          "ROLLBACK"
        );

        throw error;
      } finally {
        client.release();
      }
    } catch (error) {
      console.error(
        "STUDENT SUBMISSION ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          error.message ||
          "Unable to submit assignment.",
      });
    }
  }
);

/* ============================================================
   STUDENT RESULT
============================================================ */

router.get(
  "/student/assignments/:id/result",
  async (
    req,
    res
  ) => {
    try {
      const authenticated =
        await authenticateStudent(
          req,
          res
        );

      if (!authenticated) {
        return;
      }

      const studentClass =
        authenticated.studentClass;

      const classColumns =
        await getAssignmentClassColumns();

      const classWhere =
        buildAssignmentClassWhere(
          classColumns,
          2
        );

      const assignmentResult =
        await pool.query(
          `
            SELECT *
            FROM academy_assignments
            WHERE id = $1
              AND ${classWhere.sql}
            LIMIT 1
          `,
          [
            req.params.id,
            studentClass,
          ]
        );

      const assignment =
        assignmentResult.rows[0];

      if (
        !assignment ||
        !classesMatch(
          getAssignmentClass(
            assignment
          ),
          studentClass
        )
      ) {
        return res.status(404).json({
          success: false,
          message:
            "Assignment not found for your class.",
        });
      }

      const studentReference =
        getAuthenticatedStudentReference(
          authenticated
        );

      if (
        !studentReference
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Your student reference could not be determined.",
        });
      }

      const submission =
        await getLatestStudentSubmission(
          assignment.id,
          studentReference
        );

      if (!submission) {
        return res.status(404).json({
          success: false,
          message:
            "Result not found. This assignment has not been submitted yet.",
        });
      }

      return res.json({
        success: true,

        assignment: {
          id:
            assignment.id,

          title:
            assignment.title,

          subject:
            assignment.subject ||
            "",

          class:
            getAssignmentClass(
              assignment
            ),
        },

        submission,

        result: {
          score:
            submission.score ??
            0,

          maxScore:
            submission.max_score ??
            0,

          percentage:
            submission.percentage ??
            0,

          grade:
            submission.grade ||
            null,

          status:
            submission.status ||
            "submitted",

          submittedAt:
            submission.submitted_at ||
            null,
        },
      });
    } catch (error) {
      console.error(
        "STUDENT RESULT ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to load assignment result.",
      });
    }
  }
);

/* ============================================================
   LEGACY FILE ACCESS
============================================================ */

router.get(
  "/assignment-files/:filename",
  async (
    req,
    res
  ) => {
    try {
      const filename =
        path.basename(
          clean(
            req.params.filename
          )
        );

      if (!filename) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid assignment file.",
        });
      }

      const filePath =
        path.join(
          uploadDirectory,
          filename
        );

      if (
        !fs.existsSync(
          filePath
        )
      ) {
        return res.status(404).json({
          success: false,
          message:
            "Assignment file not found.",
        });
      }

      return res.sendFile(
        filePath
      );
    } catch (error) {
      console.error(
        "ASSIGNMENT FILE ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to open assignment file.",
      });
    }
  }
);

/* ============================================================
   MULTER / GENERAL ERROR HANDLER
============================================================ */

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
            "The uploaded file is too large. Maximum size is 250 MB.",
        });
      }

      return res.status(400).json({
        success: false,
        message:
          error.message ||
          "File upload failed.",
      });
    }

    if (error) {
      console.error(
        "ACADEMY ASSIGNMENTS ERROR:",
        error
      );

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

export default router;
