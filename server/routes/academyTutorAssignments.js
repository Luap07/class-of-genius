// server/routes/academyTutorAssignments.js

import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import crypto from "crypto";

import pool from "../lib/db.js";

const router = express.Router();

/* ============================================================
   CONSTANTS
============================================================ */

const MAX_FILE_SIZE =
  250 * 1024 * 1024;

const MAX_FILES = 10;

const UPLOAD_DIRECTORY =
  path.join(
    process.cwd(),
    "uploads",
    "academy-assignments"
  );

const ALLOWED_MIME_TYPES =
  new Set([
    "application/pdf",

    "application/msword",

    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",

    "video/mp4",

    "video/webm",

    "video/quicktime",
  ]);

const ALLOWED_EXTENSIONS =
  new Set([
    ".pdf",
    ".doc",
    ".docx",
    ".mp4",
    ".webm",
    ".mov",
  ]);

/* ============================================================
   ENSURE UPLOAD DIRECTORY
============================================================ */

fs.mkdirSync(
  UPLOAD_DIRECTORY,
  {
    recursive: true,
  }
);

/* ============================================================
   MULTER STORAGE
============================================================ */

const storage =
  multer.diskStorage({
    destination: (
      req,
      file,
      cb
    ) => {
      cb(
        null,
        UPLOAD_DIRECTORY
      );
    },

    filename: (
      req,
      file,
      cb
    ) => {
      const extension =
        path.extname(
          file.originalname
        ).toLowerCase();

      const uniqueName =
        `${Date.now()}-${crypto.randomBytes(12).toString("hex")}${extension}`;

      cb(
        null,
        uniqueName
      );
    },
  });

/* ============================================================
   MULTER FILTER
============================================================ */

const fileFilter = (
  req,
  file,
  cb
) => {
  const extension =
    path.extname(
      file.originalname
    ).toLowerCase();

  const mimeAllowed =
    ALLOWED_MIME_TYPES.has(
      file.mimetype
    );

  const extensionAllowed =
    ALLOWED_EXTENSIONS.has(
      extension
    );

  if (
    mimeAllowed ||
    extensionAllowed
  ) {
    cb(
      null,
      true
    );

    return;
  }

  cb(
    new Error(
      "Unsupported file type. Allowed files are PDF, DOC, DOCX, MP4, WebM and MOV."
    )
  );
};

const upload =
  multer({
    storage,
    fileFilter,

    limits: {
      fileSize:
        MAX_FILE_SIZE,

      files:
        MAX_FILES,
    },
  });

/* ============================================================
   BASIC HELPERS
============================================================ */

const clean = (
  value
) => {
  if (
    value === undefined ||
    value === null
  ) {
    return "";
  }

  return String(
    value
  ).trim();
};

const toNumber = (
  value,
  fallback = 0
) => {
  const number =
    Number(value);

  return Number.isFinite(
    number
  )
    ? number
    : fallback;
};

const parseJson = (
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
    typeof value ===
    "object"
  ) {
    return value;
  }

  try {
    return JSON.parse(
      value
    );
  } catch {
    return fallback;
  }
};

const quoteIdentifier = (
  identifier
) => {
  return `"${String(
    identifier
  ).replace(
    /"/g,
    '""'
  )}"`;
};

const firstExistingColumn = (
  columns,
  candidates
) => {
  const available =
    new Set(
      columns.map(
        (column) =>
          column.column_name
      )
    );

  return (
    candidates.find(
      (candidate) =>
        available.has(
          candidate
        )
    ) || null
  );
};

/* ============================================================
   GET TUTOR REFERENCE
============================================================ */

const getTutorReference = (
  req
) => {
  const directValues = [
    req.headers[
      "x-tutor-reference"
    ],

    req.query?.tutorReference,

    req.query?.tutor_reference,

    req.query?.reference,

    req.body?.tutorReference,

    req.body?.tutor_reference,

    req.body?.reference,
  ];

  for (
    const value of directValues
  ) {
    const cleaned =
      clean(value);

    if (cleaned) {
      return cleaned;
    }
  }

  return "";
};

/* ============================================================
   GET ASSIGNMENT ID
============================================================ */

const getAssignmentId = (
  req
) => {
  return clean(
    req.params?.id ??
      req.params?.assignmentId ??
      req.query?.id ??
      req.body?.id ??
      req.body?.assignmentId ??
      req.body?.assignment_id
  );
};

/* ============================================================
   TABLE COLUMNS
============================================================ */

const getTableColumns = async (
  client,
  tableName
) => {
  const result =
    await client.query(
      `
        SELECT
          column_name,
          data_type,
          udt_name,
          is_nullable
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = $1
        ORDER BY ordinal_position
      `,
      [tableName]
    );

  return result.rows;
};

/* ============================================================
   FIND ASSIGNMENT FOR TUTOR
============================================================ */

const findAssignmentByTutor =
  async (
    client,
    assignmentId,
    tutorReference
  ) => {
    const result =
      await client.query(
        `
          SELECT *
          FROM academy_assignments
          WHERE id::text = $1
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
   FIND TUTOR ASSIGNMENTS
============================================================ */

const findTutorAssignments =
  async (
    client,
    tutorReference
  ) => {
    const result =
      await client.query(
        `
          SELECT *
          FROM academy_assignments
          WHERE tutor_reference = $1
          ORDER BY
            COALESCE(
              updated_at,
              created_at,
              NOW()
            ) DESC
        `,
        [
          tutorReference,
        ]
      );

    return result.rows;
  };

/* ============================================================
   FILE INFO
============================================================ */

const getAssignmentFileInfo = (
  assignment
) => {
  if (!assignment) {
    return {
      url: "",
      path: "",
      name: "",
      type: "",
      size: 0,
    };
  }

  let attachment =
    null;

  const attachmentValue =
    assignment.attachments ??
    assignment.attachment ??
    assignment.files;

  const parsedAttachment =
    parseJson(
      attachmentValue,
      null
    );

  if (
    Array.isArray(
      parsedAttachment
    )
  ) {
    attachment =
      parsedAttachment[0] ||
      null;
  } else if (
    parsedAttachment &&
    typeof parsedAttachment ===
      "object"
  ) {
    attachment =
      parsedAttachment;
  }

  return {
    url: clean(
      assignment.file_url ??
        assignment.fileUrl ??
        assignment.attachment_url ??
        assignment.attachmentUrl ??
        assignment.document_url ??
        assignment.documentUrl ??
        attachment?.url ??
        attachment?.fileUrl
    ),

    path: clean(
      assignment.file_path ??
        assignment.filePath ??
        assignment.attachment_path ??
        assignment.attachmentPath ??
        assignment.document_path ??
        assignment.documentPath ??
        attachment?.path
    ),

    name: clean(
      assignment.file_name ??
        assignment.filename ??
        assignment.attachment_name ??
        assignment.attachmentName ??
        assignment.document_name ??
        assignment.documentName ??
        attachment?.originalName ??
        attachment?.name ??
        attachment?.fileName ??
        attachment?.filename
    ),

    type: clean(
      assignment.file_type ??
        assignment.fileType ??
        assignment.mime_type ??
        assignment.mimeType ??
        assignment.content_type ??
        assignment.contentType ??
        assignment.document_type ??
        assignment.documentType ??
        attachment?.mimeType
    ),

    size: toNumber(
      assignment.file_size ??
        assignment.fileSize ??
        assignment.attachment_size ??
        assignment.attachmentSize ??
        assignment.document_size ??
        assignment.documentSize ??
        attachment?.size,
      0
    ),
  };
};

/* ============================================================
   REMOVE ASSIGNMENT FILE
============================================================ */

const removeAssignmentFile = (
  assignment
) => {
  const fileInfo =
    getAssignmentFileInfo(
      assignment
    );

  if (
    fileInfo.path &&
    fs.existsSync(
      fileInfo.path
    )
  ) {
    try {
      fs.unlinkSync(
        fileInfo.path
      );

      return true;
    } catch (
      error
    ) {
      console.error(
        "Unable to remove assignment file:",
        error
      );
    }
  }

  if (
    fileInfo.name
  ) {
    const possiblePath =
      path.join(
        UPLOAD_DIRECTORY,
        path.basename(
          fileInfo.name
        )
      );

    if (
      fs.existsSync(
        possiblePath
      )
    ) {
      try {
        fs.unlinkSync(
          possiblePath
        );

        return true;
      } catch (
        error
      ) {
        console.error(
          "Unable to remove assignment file:",
          error
        );
      }
    }
  }

  if (
    fileInfo.url
  ) {
    try {
      const pathname =
        new URL(
          fileInfo.url,
          "http://localhost"
        ).pathname;

      const possiblePath =
        path.join(
          UPLOAD_DIRECTORY,
          path.basename(
            pathname
          )
        );

      if (
        fs.existsSync(
          possiblePath
        )
      ) {
        fs.unlinkSync(
          possiblePath
        );

        return true;
      }
    } catch {
      // Ignore invalid URL.
    }
  }

  return false;
};

/* ============================================================
   SERIALIZE ASSIGNMENT
============================================================ */

const serializeAssignment = (
  row
) => {
  if (!row) {
    return null;
  }

  const questions =
    parseJson(
      row.questions,
      []
    );

  const safeQuestions =
    Array.isArray(
      questions
    )
      ? questions
      : [];

  const fileInfo =
    getAssignmentFileInfo(
      row
    );

  const grade =
    clean(
      row.grade ??
        row.class_name ??
        row.className ??
        row.class ??
        row.student_class ??
        row.studentClass
    );

  const dueDate =
    row.due_date ??
    row.dueDate ??
    row.due_at ??
    row.dueAt ??
    null;

  const totalMarks =
    toNumber(
      row.total_marks ??
        row.totalMarks ??
        row.max_score ??
        row.maxScore ??
        row.total_mark ??
        row.totalMark,
      safeQuestions.reduce(
        (
          total,
          question
        ) =>
          total +
          toNumber(
            question?.marks ??
              question?.maxMarks ??
              question?.max_marks ??
              1,
            1
          ),
        0
      )
    );

  const assignment = {
    ...row,

    id:
      row.id,

    reference:
      clean(
        row.reference ??
          row.assignment_reference ??
          row.assignmentReference
      ),

    assignmentReference:
      clean(
        row.assignment_reference ??
          row.assignmentReference ??
          row.reference
      ),

    title:
      clean(
        row.title
      ),

    description:
      clean(
        row.description
      ),

    instructions:
      clean(
        row.instructions
      ),

    grade,

    className:
      grade,

    class:
      grade,

    subject:
      clean(
        row.subject
      ),

    dueDate,

    dueAt:
      dueDate,

    createdAt:
      row.created_at ??
      row.createdAt ??
      null,

    updatedAt:
      row.updated_at ??
      row.updatedAt ??
      null,

    questions:
      safeQuestions,

    totalQuestions:
      safeQuestions.length,

    totalMarks,

    maxScore:
      toNumber(
        row.max_score ??
          row.maxScore ??
          totalMarks,
        totalMarks
      ),

    fileName:
      fileInfo.name,

    fileUrl:
      fileInfo.url,

    attachmentUrl:
      fileInfo.url,

    attachmentName:
      fileInfo.name,

    fileType:
      fileInfo.type,

    mimeType:
      fileInfo.type,

    fileSize:
      fileInfo.size,

    file:
      fileInfo.url ||
      fileInfo.name
        ? {
            name:
              fileInfo.name,

            originalName:
              fileInfo.name,

            filename:
              fileInfo.name,

            url:
              fileInfo.url,

            fileUrl:
              fileInfo.url,

            path:
              fileInfo.path,

            mimeType:
              fileInfo.type,

            size:
              fileInfo.size,
          }
        : null,
  };

  return assignment;
};

/* ============================================================
   CREATE ASSIGNMENT
============================================================ */

router.post(
  "/",
  upload.single("file"),
  async (
    req,
    res
  ) => {
    const client =
      await pool.connect();

    try {
      const tutorReference =
        getTutorReference(
          req
        );

      if (
        !tutorReference
      ) {
        if (
          req.file?.path
        ) {
          try {
            fs.unlinkSync(
              req.file.path
            );
          } catch {}
        }

        return res
          .status(401)
          .json({
            success: false,
            error:
              "Valid tutor reference is required.",
          });
      }

      const title =
        clean(
          req.body?.title
        );

      if (!title) {
        if (
          req.file?.path
        ) {
          try {
            fs.unlinkSync(
              req.file.path
            );
          } catch {}
        }

        return res
          .status(400)
          .json({
            success: false,
            error:
              "Assignment title is required.",
          });
      }

      const description =
        clean(
          req.body?.description
        );

      const instructions =
        clean(
          req.body?.instructions
        );

      const subject =
        clean(
          req.body?.subject
        );

      const grade =
        clean(
          req.body?.class ??
            req.body?.grade ??
            req.body?.className ??
            req.body?.class_name ??
            req.body?.studentClass ??
            req.body?.student_class
        );

      const dueDate =
        clean(
          req.body?.dueDate ??
            req.body?.due_date ??
            req.body?.dueAt ??
            req.body?.due_at
        );

      let questions =
        parseJson(
          req.body?.questions,
          []
        );

      if (
        !Array.isArray(
          questions
        )
      ) {
        questions = [];
      }

      const activityType =
        clean(
          req.body?.activityType ??
            req.body?.activity_type ??
            "assignment"
        ) ||
        "assignment";

      const columns =
        await getTableColumns(
          client,
          "academy_assignments"
        );

      const available =
        new Set(
          columns.map(
            (
              column
            ) =>
              column.column_name
          )
        );

      const insertColumns =
        [];

      const insertValues =
        [];

      const addInsert =
        (
          column,
          value
        ) => {
          if (
            !available.has(
              column
            )
          ) {
            return;
          }

          insertColumns.push(
            quoteIdentifier(
              column
            )
          );

          insertValues.push(
            value
          );
        };

      addInsert(
        "tutor_reference",
        tutorReference
      );

      addInsert(
        "title",
        title
      );

      addInsert(
        "description",
        description
      );

      addInsert(
        "instructions",
        instructions
      );

      addInsert(
        "subject",
        subject
      );

      addInsert(
        "class_name",
        grade
      );

      addInsert(
        "class",
        grade
      );

      addInsert(
        "grade",
        grade
      );

      addInsert(
        "student_class",
        grade
      );

      addInsert(
        "due_date",
        dueDate ||
          null
      );

      addInsert(
        "due_at",
        dueDate ||
          null
      );

      addInsert(
        "activity_type",
        activityType
      );

      addInsert(
        "activityType",
        activityType
      );

      if (
        available.has(
          "questions"
        )
      ) {
        addInsert(
          "questions",
          JSON.stringify(
            questions
          )
        );
      }

      if (
        available.has(
          "total_marks"
        )
      ) {
        const calculatedMarks =
          questions.reduce(
            (
              total,
              question
            ) =>
              total +
              toNumber(
                question?.marks ??
                  question?.maxMarks ??
                  question?.max_marks ??
                  1,
                1
              ),
            0
          );

        addInsert(
          "total_marks",
          calculatedMarks
        );
      }

      if (
        available.has(
          "max_score"
        )
      ) {
        addInsert(
          "max_score",
          100
        );
      }

      if (
        available.has(
          "created_at"
        )
      ) {
        insertColumns.push(
          `"created_at"`
        );

        insertValues.push(
          new Date()
        );
      }

      if (
        available.has(
          "updated_at"
        )
      ) {
        insertColumns.push(
          `"updated_at"`
        );

        insertValues.push(
          new Date()
        );
      }

      /* ======================================================
         FILE METADATA
      ====================================================== */

      if (req.file) {
        const fileUrl =
          `/uploads/academy-assignments/${encodeURIComponent(
            req.file.filename
          )}`;

        const fileNameColumn =
          firstExistingColumn(
            columns,
            [
              "file_name",
              "filename",
              "attachment_name",
              "attachmentName",
              "document_name",
              "documentName",
            ]
          );

        const fileUrlColumn =
          firstExistingColumn(
            columns,
            [
              "file_url",
              "fileUrl",
              "attachment_url",
              "attachmentUrl",
              "document_url",
              "documentUrl",
            ]
          );

        const filePathColumn =
          firstExistingColumn(
            columns,
            [
              "file_path",
              "filePath",
              "attachment_path",
              "attachmentPath",
              "document_path",
              "documentPath",
            ]
          );

        const fileTypeColumn =
          firstExistingColumn(
            columns,
            [
              "file_type",
              "fileType",
              "mime_type",
              "mimeType",
              "content_type",
              "contentType",
              "document_type",
              "documentType",
            ]
          );

        const fileSizeColumn =
          firstExistingColumn(
            columns,
            [
              "file_size",
              "fileSize",
              "attachment_size",
              "attachmentSize",
              "document_size",
              "documentSize",
            ]
          );

        if (
          fileNameColumn
        ) {
          addInsert(
            fileNameColumn,
            req.file.originalname
          );
        }

        if (
          fileUrlColumn
        ) {
          addInsert(
            fileUrlColumn,
            fileUrl
          );
        }

        if (
          filePathColumn
        ) {
          addInsert(
            filePathColumn,
            req.file.path
          );
        }

        if (
          fileTypeColumn
        ) {
          addInsert(
            fileTypeColumn,
            req.file.mimetype ||
              ""
          );
        }

        if (
          fileSizeColumn
        ) {
          addInsert(
            fileSizeColumn,
            req.file.size
          );
        }

        const attachmentColumn =
          firstExistingColumn(
            columns,
            [
              "attachments",
              "attachment",
              "files",
            ]
          );

        if (
          attachmentColumn
        ) {
          const attachmentData =
            [
              {
                name:
                  req.file.originalname,

                originalName:
                  req.file.originalname,

                fileName:
                  req.file.filename,

                filename:
                  req.file.filename,

                url:
                  fileUrl,

                fileUrl:
                  fileUrl,

                path:
                  req.file.path,

                mimeType:
                  req.file.mimetype,

                size:
                  req.file.size,
              },
            ];

          addInsert(
            attachmentColumn,
            JSON.stringify(
              attachmentData
            )
          );
        }
      }

      if (
        !insertColumns.length
      ) {
        if (
          req.file?.path
        ) {
          try {
            fs.unlinkSync(
              req.file.path
            );
          } catch {}
        }

        return res
          .status(500)
          .json({
            success: false,
            error:
              "Unable to determine assignment database columns.",
          });
      }

      const placeholders =
        insertValues.map(
          (
            _,
            index
          ) =>
            `$${index + 1}`
        );

      const result =
        await client.query(
          `
            INSERT INTO academy_assignments
            (
              ${insertColumns.join(
                ", "
              )}
            )
            VALUES
            (
              ${placeholders.join(
                ", "
              )}
            )
            RETURNING *
          `,
          insertValues
        );

      const assignment =
        serializeAssignment(
          result.rows[0]
        );

      return res
        .status(201)
        .json({
          success: true,

          assignment,

          data:
            assignment,

          message:
            "Assignment created successfully.",
        });
    } catch (
      error
    ) {
      if (
        req.file?.path
      ) {
        try {
          if (
            fs.existsSync(
              req.file.path
            )
          ) {
            fs.unlinkSync(
              req.file.path
            );
          }
        } catch {}
      }

      console.error(
        "CREATE ASSIGNMENT ERROR:",
        error
      );

      return res
        .status(500)
        .json({
          success: false,

          error:
            "Unable to create assignment.",

          details:
            process.env.NODE_ENV ===
            "development"
              ? error?.message
              : undefined,
        });
    } finally {
      client.release();
    }
  }
);

/* ============================================================
   GET ALL ASSIGNMENTS
============================================================ */

router.get(
  "/",
  async (
    req,
    res
  ) => {
    const client =
      await pool.connect();

    try {
      const tutorReference =
        getTutorReference(
          req
        );

      if (
        !tutorReference
      ) {
        return res
          .status(401)
          .json({
            success: false,
            error:
              "Valid tutor reference is required.",
          });
      }

      const rows =
        await findTutorAssignments(
          client,
          tutorReference
        );

      const assignments =
        rows.map(
          serializeAssignment
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
    } catch (
      error
    ) {
      console.error(
        "GET TUTOR ASSIGNMENTS ERROR:",
        error
      );

      return res
        .status(500)
        .json({
          success: false,
          error:
            "Unable to load assignments.",
          details:
            process.env.NODE_ENV ===
            "development"
              ? error?.message
              : undefined,
        });
    } finally {
      client.release();
    }
  }
);

/* ============================================================
   GET SINGLE ASSIGNMENT
============================================================ */

router.get(
  "/:id",
  async (
    req,
    res
  ) => {
    const client =
      await pool.connect();

    try {
      const assignmentId =
        getAssignmentId(
          req
        );

      const tutorReference =
        getTutorReference(
          req
        );

      if (
        !assignmentId
      ) {
        return res
          .status(400)
          .json({
            success: false,
            error:
              "Assignment ID is required.",
          });
      }

      if (
        !tutorReference
      ) {
        return res
          .status(401)
          .json({
            success: false,
            error:
              "Valid tutor reference is required.",
          });
      }

      const assignment =
        await findAssignmentByTutor(
          client,
          assignmentId,
          tutorReference
        );

      if (!assignment) {
        return res
          .status(404)
          .json({
            success: false,
            error:
              "Assignment not found.",
          });
      }

      const serialized =
        serializeAssignment(
          assignment
        );

      return res.json({
        success: true,

        assignment:
          serialized,

        data:
          serialized,
      });
    } catch (
      error
    ) {
      console.error(
        "GET SINGLE ASSIGNMENT ERROR:",
        error
      );

      return res
        .status(500)
        .json({
          success: false,
          error:
            "Unable to load assignment.",
          details:
            process.env.NODE_ENV ===
            "development"
              ? error?.message
              : undefined,
        });
    } finally {
      client.release();
    }
  }
);

/* ============================================================
   UPDATE / EDIT ASSIGNMENT
   ALSO REPLACES DOCUMENT
============================================================ */

router.patch(
  "/:id",
  upload.single("file"),
  async (
    req,
    res
  ) => {
    const client =
      await pool.connect();

    let oldAssignment =
      null;

    try {
      const assignmentId =
        getAssignmentId(
          req
        );

      const tutorReference =
        getTutorReference(
          req
        );

      if (
        !assignmentId
      ) {
        if (
          req.file?.path
        ) {
          try {
            fs.unlinkSync(
              req.file.path
            );
          } catch {}
        }

        return res
          .status(400)
          .json({
            success: false,
            error:
              "Assignment ID is required.",
          });
      }

      if (
        !tutorReference
      ) {
        if (
          req.file?.path
        ) {
          try {
            fs.unlinkSync(
              req.file.path
            );
          } catch {}
        }

        return res
          .status(401)
          .json({
            success: false,
            error:
              "Valid tutor reference is required.",
          });
      }

      oldAssignment =
        await findAssignmentByTutor(
          client,
          assignmentId,
          tutorReference
        );

      if (!oldAssignment) {
        if (
          req.file?.path
        ) {
          try {
            fs.unlinkSync(
              req.file.path
            );
          } catch {}
        }

        return res
          .status(404)
          .json({
            success: false,
            error:
              "Assignment not found.",
          });
      }

      const columns =
        await getTableColumns(
          client,
          "academy_assignments"
        );

      const available =
        new Set(
          columns.map(
            (
              column
            ) =>
              column.column_name
          )
        );

      const updates =
        [];

      const values =
        [];

      const addUpdate =
        (
          column,
          value
        ) => {
          if (
            !available.has(
              column
            )
          ) {
            return false;
          }

          values.push(
            value
          );

          updates.push(
            `${quoteIdentifier(
              column
            )} = $${values.length}`
          );

          return true;
        };

      /* ======================================================
         TITLE
      ====================================================== */

      if (
        req.body?.title !==
        undefined
      ) {
        const title =
          clean(
            req.body.title
          );

        if (!title) {
          if (
            req.file?.path
          ) {
            try {
              fs.unlinkSync(
                req.file.path
              );
            } catch {}
          }

          return res
            .status(400)
            .json({
              success: false,
              error:
                "Assignment title cannot be empty.",
            });
        }

        addUpdate(
          "title",
          title
        );
      }

      /* ======================================================
         DESCRIPTION
      ====================================================== */

      if (
        req.body?.description !==
        undefined
      ) {
        addUpdate(
          "description",
          clean(
            req.body.description
          )
        );
      }

      /* ======================================================
         INSTRUCTIONS
      ====================================================== */

      if (
        req.body?.instructions !==
        undefined
      ) {
        addUpdate(
          "instructions",
          clean(
            req.body.instructions
          )
        );
      }

      /* ======================================================
         SUBJECT
      ====================================================== */

      if (
        req.body?.subject !==
        undefined
      ) {
        addUpdate(
          "subject",
          clean(
            req.body.subject
          )
        );
      }

      /* ======================================================
         CLASS / GRADE
      ====================================================== */

      const classWasProvided =
        req.body?.class !==
          undefined ||
        req.body?.grade !==
          undefined ||
        req.body?.className !==
          undefined ||
        req.body?.class_name !==
          undefined ||
        req.body?.studentClass !==
          undefined ||
        req.body?.student_class !==
          undefined;

      if (
        classWasProvided
      ) {
        const className =
          clean(
            req.body?.class ??
              req.body?.grade ??
              req.body?.className ??
              req.body?.class_name ??
              req.body?.studentClass ??
              req.body?.student_class
          );

        addUpdate(
          "class_name",
          className
        );

        addUpdate(
          "className",
          className
        );

        addUpdate(
          "class",
          className
        );

        addUpdate(
          "grade",
          className
        );

        addUpdate(
          "student_class",
          className
        );

        addUpdate(
          "studentClass",
          className
        );
      }

      /* ======================================================
         DUE DATE
      ====================================================== */

      const dueDateWasProvided =
        req.body?.dueDate !==
          undefined ||
        req.body?.due_date !==
          undefined ||
        req.body?.dueAt !==
          undefined ||
        req.body?.due_at !==
          undefined;

      if (
        dueDateWasProvided
      ) {
        const dueDate =
          clean(
            req.body?.dueDate ??
              req.body?.due_date ??
              req.body?.dueAt ??
              req.body?.due_at
          );

        const dueColumn =
          firstExistingColumn(
            columns,
            [
              "due_date",
              "dueDate",
              "due_at",
              "dueAt",
            ]
          );

        if (
          dueColumn
        ) {
          addUpdate(
            dueColumn,
            dueDate ||
              null
          );
        }
      }

      /* ======================================================
         DURATION
      ====================================================== */

      const durationWasProvided =
        req.body?.durationMinutes !==
          undefined ||
        req.body?.duration !==
          undefined ||
        req.body?.timeLimit !==
          undefined;

      if (
        durationWasProvided
      ) {
        const duration =
          toNumber(
            req.body?.durationMinutes ??
              req.body?.duration ??
              req.body?.timeLimit,
            0
          );

        addUpdate(
          "duration_minutes",
          duration
        );

        addUpdate(
          "duration",
          duration
        );

        addUpdate(
          "time_limit",
          duration
        );
      }

      /* ======================================================
         QUESTIONS
      ====================================================== */

      if (
        req.body?.questions !==
        undefined
      ) {
        let questions =
          parseJson(
            req.body.questions,
            []
          );

        if (
          !Array.isArray(
            questions
          )
        ) {
          questions = [];
        }

        if (
          available.has(
            "questions"
          )
        ) {
          addUpdate(
            "questions",
            JSON.stringify(
              questions
            )
          );
        }

        const totalMarks =
          questions.reduce(
            (
              total,
              question
            ) =>
              total +
              toNumber(
                question?.marks ??
                  question?.maxMarks ??
                  question?.max_marks ??
                  1,
                1
              ),
            0
          );

        addUpdate(
          "total_marks",
          totalMarks
        );
      }

      /* ======================================================
         REPLACE DOCUMENT
      ====================================================== */

      let replacingFile =
        false;

      let newFileUrl =
        "";

      if (
        req.file
      ) {
        replacingFile =
          true;

        newFileUrl =
          `/uploads/academy-assignments/${encodeURIComponent(
            req.file.filename
          )}`;

        const fileNameColumn =
          firstExistingColumn(
            columns,
            [
              "file_name",
              "filename",
              "attachment_name",
              "attachmentName",
              "document_name",
              "documentName",
            ]
          );

        const fileUrlColumn =
          firstExistingColumn(
            columns,
            [
              "file_url",
              "fileUrl",
              "attachment_url",
              "attachmentUrl",
              "document_url",
              "documentUrl",
            ]
          );

        const filePathColumn =
          firstExistingColumn(
            columns,
            [
              "file_path",
              "filePath",
              "attachment_path",
              "attachmentPath",
              "document_path",
              "documentPath",
            ]
          );

        const fileTypeColumn =
          firstExistingColumn(
            columns,
            [
              "file_type",
              "fileType",
              "mime_type",
              "mimeType",
              "content_type",
              "contentType",
              "document_type",
              "documentType",
            ]
          );

        const fileSizeColumn =
          firstExistingColumn(
            columns,
            [
              "file_size",
              "fileSize",
              "attachment_size",
              "attachmentSize",
              "document_size",
              "documentSize",
            ]
          );

        if (
          fileNameColumn
        ) {
          addUpdate(
            fileNameColumn,
            req.file.originalname
          );
        }

        if (
          fileUrlColumn
        ) {
          addUpdate(
            fileUrlColumn,
            newFileUrl
          );
        }

        if (
          filePathColumn
        ) {
          addUpdate(
            filePathColumn,
            req.file.path
          );
        }

        if (
          fileTypeColumn
        ) {
          addUpdate(
            fileTypeColumn,
            req.file.mimetype ||
              ""
          );
        }

        if (
          fileSizeColumn
        ) {
          addUpdate(
            fileSizeColumn,
            req.file.size
          );
        }

        const attachmentColumn =
          firstExistingColumn(
            columns,
            [
              "attachments",
              "attachment",
              "files",
            ]
          );

        if (
          attachmentColumn
        ) {
          const attachmentData =
            [
              {
                name:
                  req.file.originalname,

                originalName:
                  req.file.originalname,

                fileName:
                  req.file.filename,

                filename:
                  req.file.filename,

                url:
                  newFileUrl,

                fileUrl:
                  newFileUrl,

                path:
                  req.file.path,

                mimeType:
                  req.file.mimetype,

                size:
                  req.file.size,
              },
            ];

          addUpdate(
            attachmentColumn,
            JSON.stringify(
              attachmentData
            )
          );
        }
      }

      /* ======================================================
         UPDATED AT
      ====================================================== */

      if (
        available.has(
          "updated_at"
        )
      ) {
        updates.push(
          `"updated_at" = NOW()`
        );
      }

      /* ======================================================
         NOTHING TO UPDATE
      ====================================================== */

      if (
        updates.length ===
        0
      ) {
        if (
          req.file?.path
        ) {
          try {
            fs.unlinkSync(
              req.file.path
            );
          } catch {}
        }

        return res
          .status(400)
          .json({
            success: false,
            error:
              "There are no changes to save.",
          });
      }

      /* ======================================================
         PARAMETERS
      ====================================================== */

      values.push(
        assignmentId
      );

      values.push(
        tutorReference
      );

      const assignmentIdParam =
        values.length -
        1;

      const tutorReferenceParam =
        values.length;

      /* ======================================================
         UPDATE
      ====================================================== */

      const updateResult =
        await client.query(
          `
            UPDATE academy_assignments
            SET
              ${updates.join(
                ", "
              )}
            WHERE id::text = $${assignmentIdParam}
              AND tutor_reference = $${tutorReferenceParam}
            RETURNING *
          `,
          values
        );

      if (
        updateResult.rows
          .length === 0
      ) {
        if (
          req.file?.path
        ) {
          try {
            fs.unlinkSync(
              req.file.path
            );
          } catch {}
        }

        return res
          .status(404)
          .json({
            success: false,
            error:
              "Assignment could not be updated.",
          });
      }

      const updatedAssignment =
        updateResult.rows[0];

      /* ======================================================
         REMOVE OLD FILE ONLY AFTER DB UPDATE SUCCEEDS
      ====================================================== */

      if (
        replacingFile
      ) {
        removeAssignmentFile(
          oldAssignment
        );
      }

      const assignment =
        serializeAssignment(
          updatedAssignment
        );

      /* ======================================================
         ENSURE NEW FILE IS RETURNED
      ====================================================== */

      if (
        req.file
      ) {
        assignment.file = {
          name:
            req.file.originalname,

          originalName:
            req.file.originalname,

          filename:
            req.file.filename,

          url:
            newFileUrl,

          fileUrl:
            newFileUrl,

          mimeType:
            req.file.mimetype,

          size:
            req.file.size,
        };

        assignment.fileName =
          req.file.originalname;

        assignment.fileUrl =
          newFileUrl;

        assignment.attachmentUrl =
          newFileUrl;

        assignment.attachmentName =
          req.file.originalname;

        assignment.fileType =
          req.file.mimetype;

        assignment.mimeType =
          req.file.mimetype;

        assignment.fileSize =
          req.file.size;
      }

      return res.json({
        success: true,

        assignment,

        data:
          assignment,

        message:
          replacingFile
            ? "Assignment and document updated successfully."
            : "Assignment updated successfully.",
      });
    } catch (
      error
    ) {
      if (
        req.file?.path
      ) {
        try {
          if (
            fs.existsSync(
              req.file.path
            )
          ) {
            fs.unlinkSync(
              req.file.path
            );
          }
        } catch {}
      }

      console.error(
        "UPDATE ASSIGNMENT ERROR:",
        error
      );

      return res
        .status(500)
        .json({
          success: false,

          error:
            "Unable to update assignment.",

          details:
            process.env.NODE_ENV ===
            "development"
              ? error?.message
              : undefined,
        });
    } finally {
      client.release();
    }
  }
);

/* ============================================================
   DELETE ASSIGNMENT
============================================================ */

router.delete(
  "/:id",
  async (
    req,
    res
  ) => {
    const client =
      await pool.connect();

    try {
      const assignmentId =
        getAssignmentId(
          req
        );

      const tutorReference =
        getTutorReference(
          req
        );

      if (
        !assignmentId
      ) {
        return res
          .status(400)
          .json({
            success: false,
            error:
              "Assignment ID is required.",
          });
      }

      if (
        !tutorReference
      ) {
        return res
          .status(401)
          .json({
            success: false,
            error:
              "Valid tutor reference is required.",
          });
      }

      const assignment =
        await findAssignmentByTutor(
          client,
          assignmentId,
          tutorReference
        );

      if (!assignment) {
        return res
          .status(404)
          .json({
            success: false,
            error:
              "Assignment not found.",
          });
      }

      await client.query(
        "BEGIN"
      );

      await client.query(
        `
          DELETE FROM academy_assignments
          WHERE id::text = $1
            AND tutor_reference = $2
        `,
        [
          assignmentId,
          tutorReference,
        ]
      );

      await client.query(
        "COMMIT"
      );

      removeAssignmentFile(
        assignment
      );

      return res.json({
        success: true,

        message:
          "Assignment deleted successfully.",
      });
    } catch (
      error
    ) {
      try {
        await client.query(
          "ROLLBACK"
        );
      } catch {}

      console.error(
        "DELETE ASSIGNMENT ERROR:",
        error
      );

      return res
        .status(500)
        .json({
          success: false,
          error:
            "Unable to delete assignment.",
          details:
            process.env.NODE_ENV ===
            "development"
              ? error?.message
              : undefined,
        });
    } finally {
      client.release();
    }
  }
);

/* ============================================================
   GET SUBMISSIONS FOR AN ASSIGNMENT
============================================================ */

router.get(
  "/:id/submissions",
  async (
    req,
    res
  ) => {
    const client =
      await pool.connect();

    try {
      const assignmentId =
        getAssignmentId(
          req
        );

      const tutorReference =
        getTutorReference(
          req
        );

      if (
        !assignmentId
      ) {
        return res
          .status(400)
          .json({
            success: false,
            error:
              "Assignment ID is required.",
          });
      }

      if (
        !tutorReference
      ) {
        return res
          .status(401)
          .json({
            success: false,
            error:
              "Valid tutor reference is required.",
          });
      }

      const assignment =
        await findAssignmentByTutor(
          client,
          assignmentId,
          tutorReference
        );

      if (!assignment) {
        return res
          .status(404)
          .json({
            success: false,
            error:
              "Assignment not found.",
          });
      }

      const submissionTables =
        [
          "academy_assignment_submissions",
          "academy_task_submissions",
        ];

      let submissionRows =
        [];

      let usedTable =
        null;

      for (
        const table of submissionTables
      ) {
        try {
          const existsResult =
            await client.query(
              `
                SELECT EXISTS (
                  SELECT 1
                  FROM information_schema.tables
                  WHERE table_schema = 'public'
                    AND table_name = $1
                ) AS exists
              `,
              [table]
            );

          if (
            !existsResult.rows[0]
              ?.exists
          ) {
            continue;
          }

          const result =
            await client.query(
              `
                SELECT *
                FROM ${quoteIdentifier(
                  table
                )}
                WHERE assignment_id::text = $1
                ORDER BY
                  COALESCE(
                    updated_at,
                    created_at,
                    NOW()
                  ) DESC
              `,
              [assignmentId]
            );

          submissionRows =
            result.rows;

          usedTable =
            table;

          break;
        } catch (
          error
        ) {
          console.warn(
            `Unable to read ${table}:`,
            error?.message
          );
        }
      }

      return res.json({
        success: true,

        assignment:
          serializeAssignment(
            assignment
          ),

        submissions:
          submissionRows,

        data:
          submissionRows,

        count:
          submissionRows.length,

        sourceTable:
          usedTable,
      });
    } catch (
      error
    ) {
      console.error(
        "GET ASSIGNMENT SUBMISSIONS ERROR:",
        error
      );

      return res
        .status(500)
        .json({
          success: false,
          error:
            "Unable to load assignment submissions.",
          details:
            process.env.NODE_ENV ===
            "development"
              ? error?.message
              : undefined,
        });
    } finally {
      client.release();
    }
  }
);

/* ============================================================
   MULTER ERROR HANDLER
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
        return res
          .status(400)
          .json({
            success: false,
            error:
              "The file is too large. Maximum file size is 250 MB.",
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
            error:
              `You can upload a maximum of ${MAX_FILES} files.`,
          });
      }

      return res
        .status(400)
        .json({
          success: false,
          error:
            error.message ||
            "File upload failed.",
        });
    }

    if (
      error
    ) {
      return res
        .status(400)
        .json({
          success: false,
          error:
            error.message ||
            "Request failed.",
        });
    }

    next();
  }
);

export default router;