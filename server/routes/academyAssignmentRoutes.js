import express from "express";
import pool from "../lib/db.js";

const router = express.Router();

/* =========================================================
   CONSTANTS
========================================================= */

const ALL_GRADES = [
  "Primary 1",
  "Primary 2",
  "Primary 3",
  "Primary 4",
  "Primary 5",
  "Primary 6",
  "JSS 1",
  "JSS 2",
  "JSS 3",
  "SS 1",
  "SS 2",
  "SS 3",
];

const ALL_SUBJECTS = [
  "English",
  "English Studies",
  "English Language",
  "Mathematics",
  "Basic Science",
  "Basic Technology",
  "Social Studies",
  "Civic Education",
  "Computer Studies",
  "Computer Science",
  "Data Processing",
  "Agricultural Science",
  "Home Economics",
  "Physical and Health Education",
  "Religious Studies",
  "Creative Arts",
  "Cultural and Creative Arts",
  "Verbal Reasoning",
  "Quantitative Reasoning",
  "Business Studies",
  "French",
  "Christian Religious Studies",
  "Islamic Religious Studies",
  "Biology",
  "Chemistry",
  "Physics",
  "Further Mathematics",
  "Government",
  "Economics",
  "Commerce",
  "Accounting",
  "Financial Accounting",
  "Literature in English",
  "Geography",
  "History",
  "Technical Drawing",
];

/* =========================================================
   HELPERS
========================================================= */

function clean(value) {
  if (
    value === undefined ||
    value === null
  ) {
    return "";
  }

  return String(value).trim();
}

function normalize(value) {
  return clean(value)
    .toLowerCase()
    .replace(/\s+/g, " ");
}

function findGrade(value) {
  const normalized = normalize(value);

  return (
    ALL_GRADES.find(
      (grade) =>
        normalize(grade) === normalized
    ) || ""
  );
}

function findSubject(value) {
  const normalized = normalize(value);

  return (
    ALL_SUBJECTS.find(
      (subject) =>
        normalize(subject) === normalized
    ) || ""
  );
}

function normalizeAnswer(value) {
  const answer = clean(value).toUpperCase();

  if (
    ["A", "B", "C", "D"].includes(answer)
  ) {
    return answer;
  }

  return "";
}

function getMarks(value) {
  const number = Number(value);

  if (
    !Number.isFinite(number) ||
    number <= 0
  ) {
    return 1;
  }

  return number;
}

function normalizeDueDate(value) {
  const cleaned = clean(value);

  if (!cleaned) {
    return null;
  }

  const date = new Date(cleaned);

  if (Number.isNaN(date.getTime())) {
    throw new Error("Invalid due date.");
  }

  return date.toISOString();
}

/* =========================================================
   TUTOR REFERENCE
========================================================= */

function getTutorReference(req) {
  return clean(
    req.body?.reference ||
      req.body?.tutorReference ||
      req.body?.tutor_reference ||
      req.query?.reference ||
      req.query?.tutorReference ||
      req.query?.tutor_reference ||
      req.headers?.["x-tutor-reference"]
  );
}

/* =========================================================
   DATABASE HELPERS
========================================================= */

async function getTableColumns(tableName) {
  const result = await pool.query(
    `
      SELECT column_name
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = $1
    `,
    [tableName]
  );

  return new Set(
    result.rows.map(
      (row) => row.column_name
    )
  );
}

/* =========================================================
   FIND TUTOR
========================================================= */

async function findTutorByReference(
  reference
) {
  const tutorReference = clean(reference);

  if (!tutorReference) {
    return null;
  }

  const columns =
    await getTableColumns(
      "academy_tutor_applications"
    );

  const possibleReferenceColumns = [
    "reference",
    "application_reference",
    "tutor_reference",
  ].filter((column) =>
    columns.has(column)
  );

  if (
    possibleReferenceColumns.length === 0
  ) {
    throw new Error(
      "The academy_tutor_applications table does not contain a supported tutor reference column."
    );
  }

  const conditions =
    possibleReferenceColumns
      .map(
        (column) => `
          LOWER(
            TRIM(
              COALESCE(
                CAST("${column}" AS TEXT),
                ''
              )
            )
          )
          =
          LOWER(
            TRIM($1::TEXT)
          )
        `
      )
      .join(" OR ");

  const orderBy =
    columns.has("created_at")
      ? `ORDER BY "created_at" DESC NULLS LAST`
      : "";

  const result = await pool.query(
    `
      SELECT *
      FROM academy_tutor_applications
      WHERE ${conditions}
      ${orderBy}
      LIMIT 1
    `,
    [tutorReference]
  );

  return result.rows[0] || null;
}

async function verifyTutor(reference) {
  const tutor =
    await findTutorByReference(
      reference
    );

  if (!tutor) {
    return {
      valid: false,
      tutor: null,
      error:
        "Tutor account could not be found.",
    };
  }

  const status = normalize(
    tutor.status
  );

  if (
    status &&
    ![
      "verified",
      "approved",
      "active",
    ].includes(status)
  ) {
    return {
      valid: false,
      tutor,
      error:
        "Tutor account is not verified.",
    };
  }

  return {
    valid: true,
    tutor,
    error: null,
  };
}

/* =========================================================
   TUTOR NAME
========================================================= */

function getTutorName(tutor) {
  if (!tutor) {
    return "Tutor";
  }

  return (
    clean(tutor.name) ||
    clean(tutor.full_name) ||
    clean(tutor.fullName) ||
    clean(tutor.tutor_name) ||
    [
      clean(tutor.first_name),
      clean(tutor.last_name),
    ]
      .filter(Boolean)
      .join(" ") ||
    "Tutor"
  );
}

/* =========================================================
   FORMAT QUESTION
========================================================= */

function formatQuestion(
  row,
  index = 0
) {
  const questionNumber =
    Number(row.question_number) ||
    Number(row.questionNumber) ||
    index + 1;

  const question = clean(
    row.question ||
      row.question_text ||
      row.text
  );

  const optionA = clean(
    row.option_a ||
      row.optionA ||
      row.options?.A ||
      row.options?.a
  );

  const optionB = clean(
    row.option_b ||
      row.optionB ||
      row.options?.B ||
      row.options?.b
  );

  const optionC = clean(
    row.option_c ||
      row.optionC ||
      row.options?.C ||
      row.options?.c
  );

  const optionD = clean(
    row.option_d ||
      row.optionD ||
      row.options?.D ||
      row.options?.d
  );

  return {
    id:
      row.id ?? null,

    assignmentId:
      row.assignment_id ??
      row.assignmentId ??
      null,

    assignment_id:
      row.assignment_id ??
      row.assignmentId ??
      null,

    questionNumber,

    question_number:
      questionNumber,

    question,

    text: question,

    optionA,

    optionB,

    optionC,

    optionD,

    option_a: optionA,

    option_b: optionB,

    option_c: optionC,

    option_d: optionD,

    options: [
      {
        key: "A",
        label: "A",
        text: optionA,
      },
      {
        key: "B",
        label: "B",
        text: optionB,
      },
      {
        key: "C",
        label: "C",
        text: optionC,
      },
      {
        key: "D",
        label: "D",
        text: optionD,
      },
    ],

    marks:
      Number(row.marks) || 1,
  };
}

/* =========================================================
   GET TUTOR ASSIGNMENTS
========================================================= */

router.get(
  "/tutor/assignments",
  async (req, res) => {
    const tutorReference =
      getTutorReference(req);

    if (!tutorReference) {
      return res.status(400).json({
        success: false,
        error:
          "Tutor reference is required.",
      });
    }

    try {
      console.log(
        "GET /tutor/assignments",
        {
          tutorReference,
        }
      );

      const result =
        await pool.query(
          `
            SELECT *
            FROM academy_assignments
            WHERE LOWER(
              TRIM(
                CAST(tutor_reference AS TEXT)
              )
            )
            =
            LOWER(
              TRIM($1::TEXT)
            )
            ORDER BY
              created_at DESC NULLS LAST
          `,
          [tutorReference]
        );

      return res.json({
        success: true,
        assignments:
          result.rows,
      });
    } catch (error) {
      console.error(
        "GET /tutor/assignments error:",
        error
      );

      return res.status(500).json({
        success: false,
        error:
          "Unable to load assignments.",
        details:
          error?.message ||
          "Database request failed.",
      });
    }
  }
);

/* =========================================================
   GET SINGLE TUTOR ASSIGNMENT
========================================================= */

router.get(
  "/tutor/assignments/:id",
  async (req, res) => {
    const assignmentId =
      clean(req.params.id);

    try {
      const assignmentResult =
        await pool.query(
          `
            SELECT *
            FROM academy_assignments
            WHERE id = $1
            LIMIT 1
          `,
          [assignmentId]
        );

      if (
        !assignmentResult.rows.length
      ) {
        return res.status(404).json({
          success: false,
          error:
            "Assignment not found.",
        });
      }

      const questionResult =
        await pool.query(
          `
            SELECT *
            FROM academy_assignment_questions
            WHERE assignment_id = $1
            ORDER BY
              question_number ASC,
              id ASC
          `,
          [assignmentId]
        );

      const questions =
        questionResult.rows.map(
          (row, index) =>
            formatQuestion(
              row,
              index
            )
        );

      const assignment =
        assignmentResult.rows[0];

      const totalQuestions =
        questions.length ||
        Number(
          assignment.total_questions
        ) ||
        0;

      const totalMarks =
        questions.reduce(
          (sum, question) =>
            sum +
            Number(
              question.marks || 1
            ),
          0
        ) ||
        Number(
          assignment.total_marks
        ) ||
        0;

      return res.json({
        success: true,

        assignment: {
          ...assignment,

          totalQuestions,

          total_questions:
            totalQuestions,

          totalMarks,

          total_marks:
            totalMarks,

          questions,
        },

        questions,

        totalQuestions,

        totalMarks,
      });
    } catch (error) {
      console.error(
        "GET /tutor/assignments/:id error:",
        error
      );

      return res.status(500).json({
        success: false,
        error:
          "Unable to load assignment.",
        details:
          error?.message ||
          "Database request failed.",
      });
    }
  }
);

/* =========================================================
   CREATE ASSIGNMENT
========================================================= */

router.post(
  "/tutor/assignments",
  async (req, res) => {
    let client = null;
    let transactionStarted = false;

    try {
      const tutorReference =
        getTutorReference(req);

      if (!tutorReference) {
        return res.status(400).json({
          success: false,
          error:
            "Tutor reference is required.",
        });
      }

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

      const grade =
        findGrade(
          req.body?.class ||
            req.body?.grade ||
            req.body?.className
        );

      const subject =
        findSubject(
          req.body?.subject
        );

      const dueDate =
        normalizeDueDate(
          req.body?.dueDate ||
            req.body?.due_date
        );

      const questions =
        Array.isArray(
          req.body?.questions
        )
          ? req.body.questions
          : [];

      if (title.length < 3) {
        return res.status(400).json({
          success: false,
          error:
            "Assignment title must be at least 3 characters.",
        });
      }

      if (!grade) {
        return res.status(400).json({
          success: false,
          error:
            "A valid class is required.",
        });
      }

      if (!subject) {
        return res.status(400).json({
          success: false,
          error:
            "A valid subject is required.",
        });
      }

      if (!questions.length) {
        return res.status(400).json({
          success: false,
          error:
            "At least one question is required.",
        });
      }

      const tutorVerification =
        await verifyTutor(
          tutorReference
        );

      if (
        !tutorVerification.valid
      ) {
        return res.status(403).json({
          success: false,
          error:
            tutorVerification.error,
        });
      }

      const tutor =
        tutorVerification.tutor;

      const tutorName =
        getTutorName(tutor);

      const normalizedQuestions =
        questions.map(
          (item, index) => {
            const question =
              clean(
                item?.question ||
                  item?.question_text ||
                  item?.text
              );

            const optionA =
              clean(
                item?.optionA ||
                  item?.option_a ||
                  item?.options?.A ||
                  item?.options?.a
              );

            const optionB =
              clean(
                item?.optionB ||
                  item?.option_b ||
                  item?.options?.B ||
                  item?.options?.b
              );

            const optionC =
              clean(
                item?.optionC ||
                  item?.option_c ||
                  item?.options?.C ||
                  item?.options?.c
              );

            const optionD =
              clean(
                item?.optionD ||
                  item?.option_d ||
                  item?.options?.D ||
                  item?.options?.d
              );

            const correctAnswer =
              normalizeAnswer(
                item?.correctAnswer ||
                  item?.correct_answer ||
                  item?.answer
              );

            const reason =
              clean(
                item?.explanation ||
                  item?.reason
              );

            const marks =
              getMarks(
                item?.marks ||
                  item?.maxMarks ||
                  item?.max_marks
              );

            return {
              questionNumber:
                Number(
                  item?.questionNumber
                ) ||
                Number(
                  item?.question_number
                ) ||
                index + 1,

              question,

              optionA,

              optionB,

              optionC,

              optionD,

              correctAnswer,

              reason,

              marks,
            };
          }
        );

      for (
        let index = 0;
        index <
        normalizedQuestions.length;
        index++
      ) {
        const item =
          normalizedQuestions[index];

        const number =
          index + 1;

        if (!item.question) {
          return res.status(400).json({
            success: false,
            error:
              `Question ${number} is empty.`,
          });
        }

        if (!item.optionA) {
          return res.status(400).json({
            success: false,
            error:
              `Option A for question ${number} is required.`,
          });
        }

        if (!item.optionB) {
          return res.status(400).json({
            success: false,
            error:
              `Option B for question ${number} is required.`,
          });
        }

        if (!item.optionC) {
          return res.status(400).json({
            success: false,
            error:
              `Option C for question ${number} is required.`,
          });
        }

        if (!item.optionD) {
          return res.status(400).json({
            success: false,
            error:
              `Option D for question ${number} is required.`,
          });
        }

        if (!item.correctAnswer) {
          return res.status(400).json({
            success: false,
            error:
              `Correct answer for question ${number} must be A, B, C, or D.`,
          });
        }
      }

      const totalQuestions =
        normalizedQuestions.length;

      const totalMarks =
        normalizedQuestions.reduce(
          (sum, item) =>
            sum +
            Number(
              item.marks || 1
            ),
          0
        );

      const assignmentColumns =
        await getTableColumns(
          "academy_assignments"
        );

      const requiredAssignmentColumns = [
        "tutor_reference",
        "tutor_name",
        "grade",
        "subject",
        "title",
        "description",
        "instructions",
        "due_date",
        "total_questions",
        "total_marks",
        "status",
        "result_released",
      ];

      const missingAssignmentColumns =
        requiredAssignmentColumns.filter(
          (column) =>
            !assignmentColumns.has(
              column
            )
        );

      if (
        missingAssignmentColumns.length
      ) {
        throw new Error(
          `academy_assignments is missing these columns: ${missingAssignmentColumns.join(
            ", "
          )}`
        );
      }

      const questionColumns =
        await getTableColumns(
          "academy_assignment_questions"
        );

      const requiredQuestionColumns = [
        "assignment_id",
        "question_number",
        "question",
        "option_a",
        "option_b",
        "option_c",
        "option_d",
        "correct_answer",
        "reason",
        "marks",
      ];

      const missingQuestionColumns =
        requiredQuestionColumns.filter(
          (column) =>
            !questionColumns.has(
              column
            )
        );

      if (
        missingQuestionColumns.length
      ) {
        throw new Error(
          `academy_assignment_questions is missing these columns: ${missingQuestionColumns.join(
            ", "
          )}`
        );
      }

      client =
        await pool.connect();

      await client.query(
        "BEGIN"
      );

      transactionStarted = true;

      const assignmentResult =
        await client.query(
          `
            INSERT INTO academy_assignments (
              tutor_reference,
              tutor_name,
              grade,
              subject,
              title,
              description,
              instructions,
              due_date,
              total_questions,
              total_marks,
              status,
              result_released
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
              'published',
              false
            )
            RETURNING *
          `,
          [
            tutorReference,
            tutorName,
            grade,
            subject,
            title,
            description,
            instructions,
            dueDate,
            totalQuestions,
            totalMarks,
          ]
        );

      const assignment =
        assignmentResult.rows[0];

      const insertedQuestions = [];

      for (
        let index = 0;
        index <
        normalizedQuestions.length;
        index++
      ) {
        const item =
          normalizedQuestions[index];

        const questionResult =
          await client.query(
            `
              INSERT INTO academy_assignment_questions (
                assignment_id,
                question_number,
                question,
                option_a,
                option_b,
                option_c,
                option_d,
                correct_answer,
                reason,
                marks
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
                $10
              )
              RETURNING *
            `,
            [
              assignment.id,
              index + 1,
              item.question,
              item.optionA,
              item.optionB,
              item.optionC,
              item.optionD,
              item.correctAnswer,
              item.reason,
              item.marks,
            ]
          );

        insertedQuestions.push(
          formatQuestion(
            questionResult.rows[0],
            index
          )
        );
      }

      await client.query(
        "COMMIT"
      );

      transactionStarted = false;

      return res.status(201).json({
        success: true,

        message:
          "Assignment created successfully.",

        assignment: {
          ...assignment,

          totalQuestions,

          total_questions:
            totalQuestions,

          totalMarks,

          total_marks:
            totalMarks,

          questions:
            insertedQuestions,
        },

        questions:
          insertedQuestions,

        totalQuestions,

        totalMarks,
      });
    } catch (error) {
      console.error(
        "POST /tutor/assignments error:",
        error
      );

      if (
        client &&
        transactionStarted
      ) {
        try {
          await client.query(
            "ROLLBACK"
          );
        } catch (
          rollbackError
        ) {
          console.error(
            "Assignment rollback error:",
            rollbackError
          );
        }
      }

      return res.status(500).json({
        success: false,
        error:
          "Unable to create assignment.",
        details:
          error?.message ||
          "Unknown server error.",
        code:
          error?.code || null,
      });
    } finally {
      if (client) {
        client.release();
      }
    }
  }
);

/* =========================================================
   UPDATE ASSIGNMENT
========================================================= */

router.patch(
  "/tutor/assignments/:id",
  async (req, res) => {
    try {
      const { id } =
        req.params;

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

      const grade =
        findGrade(
          req.body?.class ||
            req.body?.grade ||
            req.body?.className
        );

      const subject =
        findSubject(
          req.body?.subject
        );

      const dueDate =
        normalizeDueDate(
          req.body?.dueDate ||
            req.body?.due_date
        );

      if (title.length < 3) {
        return res.status(400).json({
          success: false,
          error:
            "Assignment title must be at least 3 characters.",
        });
      }

      if (!grade) {
        return res.status(400).json({
          success: false,
          error:
            "A valid class is required.",
        });
      }

      if (!subject) {
        return res.status(400).json({
          success: false,
          error:
            "A valid subject is required.",
        });
      }

      const result =
        await pool.query(
          `
            UPDATE academy_assignments
            SET
              title = $1,
              description = $2,
              instructions = $3,
              grade = $4,
              subject = $5,
              due_date = $6,
              updated_at = NOW()
            WHERE id = $7
            RETURNING *
          `,
          [
            title,
            description,
            instructions,
            grade,
            subject,
            dueDate,
            id,
          ]
        );

      if (!result.rows.length) {
        return res.status(404).json({
          success: false,
          error:
            "Assignment not found.",
        });
      }

      return res.json({
        success: true,

        message:
          "Assignment updated successfully.",

        assignment:
          result.rows[0],
      });
    } catch (error) {
      console.error(
        "PATCH /tutor/assignments/:id error:",
        error
      );

      return res.status(500).json({
        success: false,
        error:
          "Unable to update assignment.",
        details:
          error?.message ||
          "Database request failed.",
      });
    }
  }
);

/* =========================================================
   DELETE ASSIGNMENT
========================================================= */

router.delete(
  "/tutor/assignments/:id",
  async (req, res) => {
    let client = null;
    let transactionStarted = false;

    try {
      const { id } =
        req.params;

      client =
        await pool.connect();

      await client.query(
        "BEGIN"
      );

      transactionStarted = true;

      /*
       * IMPORTANT:
       * academy_assignment_answers is not used here.
       * The student submission route stores answer
       * information in academy_assignment_answers only
       * when that table exists in the current schema.
       *
       * We first remove submissions, then questions,
       * then the assignment.
       */

      await client.query(
        `
          DELETE FROM academy_assignment_submissions
          WHERE assignment_id = $1
        `,
        [id]
      );

      await client.query(
        `
          DELETE FROM academy_assignment_questions
          WHERE assignment_id = $1
        `,
        [id]
      );

      const result =
        await client.query(
          `
            DELETE FROM academy_assignments
            WHERE id = $1
            RETURNING id
          `,
          [id]
        );

      if (!result.rows.length) {
        await client.query(
          "ROLLBACK"
        );

        transactionStarted = false;

        return res.status(404).json({
          success: false,
          error:
            "Assignment not found.",
        });
      }

      await client.query(
        "COMMIT"
      );

      transactionStarted = false;

      return res.json({
        success: true,

        message:
          "Assignment deleted successfully.",
      });
    } catch (error) {
      console.error(
        "DELETE /tutor/assignments/:id error:",
        error
      );

      if (
        client &&
        transactionStarted
      ) {
        try {
          await client.query(
            "ROLLBACK"
          );
        } catch {}
      }

      return res.status(500).json({
        success: false,
        error:
          "Unable to delete assignment.",
        details:
          error?.message ||
          "Database request failed.",
      });
    } finally {
      if (client) {
        client.release();
      }
    }
  }
);

/* =========================================================
   STUDENT ASSIGNMENTS
========================================================= */

router.get(
  "/student/assignments",
  async (req, res) => {
    try {
      const studentReference =
        clean(
          req.query?.studentReference ||
            req.query?.student_reference ||
            req.query?.reference ||
            req.headers?.[
              "x-student-reference"
            ]
        );

      const studentId =
        clean(
          req.query?.studentId ||
            req.query?.student_id
        );

      const result =
        await pool.query(
          `
            SELECT *
            FROM academy_assignments
            WHERE status = 'published'
            ORDER BY
              created_at DESC NULLS LAST
          `
        );

      return res.status(200).json({
        success: true,

        studentReference,

        studentId,

        assignments:
          result.rows,
      });
    } catch (error) {
      console.error(
        "GET /student/assignments error:",
        error
      );

      return res.status(500).json({
        success: false,
        error:
          "Unable to load student assignments.",
        details:
          error?.message ||
          "Database request failed.",
      });
    }
  }
);

/* =========================================================
   STUDENT SINGLE ASSIGNMENT
   QUESTIONS + OPTIONS

   GET
   /api/academy/student/assignments/:id

   THIS IS THE IMPORTANT FIX.
========================================================= */

router.get(
  "/student/assignments/:id",
  async (req, res) => {
    const assignmentId =
      clean(req.params.id);

    console.log(
      "================================================="
    );

    console.log(
      "📚 STUDENT ASSIGNMENT DETAILS REQUEST"
    );

    console.log(
      "Assignment ID:",
      assignmentId
    );

    console.log(
      "================================================="
    );

    if (!assignmentId) {
      return res.status(400).json({
        success: false,
        error:
          "Assignment ID is required.",
      });
    }

    try {
      /* -----------------------------------------------------
         GET ASSIGNMENT
      ----------------------------------------------------- */

      const assignmentResult =
        await pool.query(
          `
            SELECT *
            FROM academy_assignments
            WHERE id = $1
              AND status = 'published'
            LIMIT 1
          `,
          [assignmentId]
        );

      console.log(
        "📌 Assignment rows found:",
        assignmentResult.rows.length
      );

      if (
        assignmentResult.rows.length ===
        0
      ) {
        console.log(
          "❌ Assignment not found:",
          assignmentId
        );

        return res.status(404).json({
          success: false,

          error:
            "Assignment not found.",

          assignmentId,
        });
      }

      const assignment =
        assignmentResult.rows[0];

      console.log(
        "✅ Assignment found:",
        {
          id:
            assignment.id,

          title:
            assignment.title,

          status:
            assignment.status,

          total_questions:
            assignment.total_questions,

          total_marks:
            assignment.total_marks,
        }
      );

      /* -----------------------------------------------------
         GET QUESTIONS
      ----------------------------------------------------- */

      const questionResult =
        await pool.query(
          `
            SELECT
              id,
              assignment_id,
              question_number,
              question,
              option_a,
              option_b,
              option_c,
              option_d,
              marks
            FROM academy_assignment_questions
            WHERE assignment_id = $1
            ORDER BY
              question_number ASC,
              id ASC
          `,
          [assignmentId]
        );

      console.log(
        "📝 Questions found:",
        questionResult.rows.length
      );

      console.log(
        "📝 Raw question rows:",
        questionResult.rows
      );

      /* -----------------------------------------------------
         FORMAT QUESTIONS
      ----------------------------------------------------- */

      const questions =
        questionResult.rows.map(
          (row, index) => {
            const formatted =
              formatQuestion(
                row,
                index
              );

            return {
              ...formatted,

              id:
                row.id,

              assignment_id:
                row.assignment_id,

              assignmentId:
                row.assignment_id,

              question_number:
                row.question_number,

              questionNumber:
                row.question_number,

              question:
                clean(
                  row.question
                ),

              text:
                clean(
                  row.question
                ),

              option_a:
                clean(
                  row.option_a
                ),

              option_b:
                clean(
                  row.option_b
                ),

              option_c:
                clean(
                  row.option_c
                ),

              option_d:
                clean(
                  row.option_d
                ),

              optionA:
                clean(
                  row.option_a
                ),

              optionB:
                clean(
                  row.option_b
                ),

              optionC:
                clean(
                  row.option_c
                ),

              optionD:
                clean(
                  row.option_d
                ),

              options: [
                {
                  key: "A",
                  label: "A",
                  text: clean(
                    row.option_a
                  ),
                },

                {
                  key: "B",
                  label: "B",
                  text: clean(
                    row.option_b
                  ),
                },

                {
                  key: "C",
                  label: "C",
                  text: clean(
                    row.option_c
                  ),
                },

                {
                  key: "D",
                  label: "D",
                  text: clean(
                    row.option_d
                  ),
                },
              ],

              marks:
                Number(
                  row.marks
                ) || 1,
            };
          }
        );

      /* -----------------------------------------------------
         CALCULATE TOTALS FROM ACTUAL QUESTIONS
      ----------------------------------------------------- */

      const actualQuestionCount =
        questions.length;

      const actualTotalMarks =
        questions.reduce(
          (sum, question) =>
            sum +
            (
              Number(
                question.marks
              ) || 1
            ),
          0
        );

      const totalQuestions =
        actualQuestionCount ||
        Number(
          assignment.total_questions
        ) ||
        0;

      const totalMarks =
        actualTotalMarks ||
        Number(
          assignment.total_marks
        ) ||
        0;

      /* -----------------------------------------------------
         BUILD FRONTEND ASSIGNMENT
      ----------------------------------------------------- */

      const formattedAssignment = {
        ...assignment,

        id:
          assignment.id,

        title:
          clean(
            assignment.title
          ),

        description:
          clean(
            assignment.description
          ),

        instructions:
          clean(
            assignment.instructions
          ),

        grade:
          clean(
            assignment.grade
          ),

        subject:
          clean(
            assignment.subject
          ),

        total_questions:
          totalQuestions,

        totalQuestions:
          totalQuestions,

        total_marks:
          totalMarks,

        totalMarks:
          totalMarks,

        questionCount:
          actualQuestionCount,

        questions,
      };

      /* -----------------------------------------------------
         FINAL DEBUG
      ----------------------------------------------------- */

      console.log(
        "================================================="
      );

      console.log(
        "📤 STUDENT ASSIGNMENT RESPONSE"
      );

      console.log(
        "Assignment:",
        formattedAssignment.id,
        formattedAssignment.title
      );

      console.log(
        "Question count:",
        questions.length
      );

      console.log(
        "Questions:",
        questions.map(
          (question) => ({
            id:
              question.id,

            number:
              question.questionNumber,

            text:
              question.question,
          })
        )
      );

      console.log(
        "================================================="
      );

      /* -----------------------------------------------------
         RESPONSE
      ----------------------------------------------------- */

      return res.status(200).json({
        success: true,

        assignment:
          formattedAssignment,

        questions,

        data: {
          assignment:
            formattedAssignment,

          questions,

          totalQuestions,

          totalMarks,

          questionCount:
            actualQuestionCount,
        },

        totalQuestions,

        totalMarks,

        questionCount:
          actualQuestionCount,
      });
    } catch (error) {
      console.error(
        "❌ GET /student/assignments/:id error:"
      );

      console.error(error);

      return res.status(500).json({
        success: false,

        error:
          "Unable to load assignment.",

        details:
          error?.message ||
          "Database request failed.",

        code:
          error?.code || null,

        assignmentId,
      });
    }
  }
);

/* =========================================================
   SUBMIT STUDENT ASSIGNMENT
========================================================= */

router.post(
  "/student/assignments/:id/submit",
  async (req, res) => {
    let client = null;
    let transactionStarted = false;

    try {
      const { id } =
        req.params;

      const studentId =
        clean(
          req.body?.studentId ||
            req.body?.student_id
        );

      const studentReference =
        clean(
          req.body?.studentReference ||
            req.body?.student_reference ||
            req.body?.reference
        );

      const submittedAnswers =
        req.body?.answers || {};

      if (
        !studentId &&
        !studentReference
      ) {
        return res.status(400).json({
          success: false,
          error:
            "Student ID or student reference is required.",
        });
      }

      const assignmentResult =
        await pool.query(
          `
            SELECT *
            FROM academy_assignments
            WHERE id = $1
              AND status = 'published'
            LIMIT 1
          `,
          [id]
        );

      if (
        !assignmentResult.rows.length
      ) {
        return res.status(404).json({
          success: false,
          error:
            "Assignment not found.",
        });
      }

      const questionsResult =
        await pool.query(
          `
            SELECT *
            FROM academy_assignment_questions
            WHERE assignment_id = $1
            ORDER BY
              question_number ASC,
              id ASC
          `,
          [id]
        );

      const questions =
        questionsResult.rows;

      if (!questions.length) {
        return res.status(400).json({
          success: false,
          error:
            "This assignment has no questions.",
        });
      }

      let score = 0;
      let totalMarks = 0;

      const answerRows = [];

      for (
        const question of questions
      ) {
        const submittedAnswer =
          normalizeAnswer(
            submittedAnswers?.[
              question.id
            ] ||
              submittedAnswers?.[
                String(
                  question.question_number
                )
              ] ||
              submittedAnswers?.[
                question.question_number
              ]
          );

        const correctAnswer =
          normalizeAnswer(
            question.correct_answer
          );

        const marks =
          Number(
            question.marks
          ) || 1;

        const isCorrect =
          Boolean(
            submittedAnswer &&
              submittedAnswer ===
                correctAnswer
          );

        if (isCorrect) {
          score += marks;
        }

        totalMarks += marks;

        answerRows.push({
          questionId:
            question.id,

          studentAnswer:
            submittedAnswer ||
            null,

          isCorrect,

          marksAwarded:
            isCorrect
              ? marks
              : 0,
        });
      }

      const percentage =
        totalMarks > 0
          ? Number(
              (
                (score /
                  totalMarks) *
                100
              ).toFixed(2)
            )
          : 0;

      let resultGrade = "F";

      if (percentage >= 70) {
        resultGrade = "A";
      } else if (
        percentage >= 60
      ) {
        resultGrade = "B";
      } else if (
        percentage >= 50
      ) {
        resultGrade = "C";
      } else if (
        percentage >= 45
      ) {
        resultGrade = "D";
      } else if (
        percentage >= 40
      ) {
        resultGrade = "E";
      }

      client =
        await pool.connect();

      await client.query(
        "BEGIN"
      );

      transactionStarted = true;

      const submissionResult =
        await client.query(
          `
            INSERT INTO academy_assignment_submissions (
              assignment_id,
              student_id,
              student_reference,
              score,
              total_marks,
              percentage,
              grade,
              result_released,
              submitted_at
            )
            VALUES (
              $1,
              NULLIF($2, ''),
              NULLIF($3, ''),
              $4,
              $5,
              $6,
              $7,
              false,
              NOW()
            )
            RETURNING *
          `,
          [
            id,
            studentId,
            studentReference,
            score,
            totalMarks,
            percentage,
            resultGrade,
          ]
        );

      const submission =
        submissionResult.rows[0];

      /*
       * Insert answer records only when the table
       * exists in the database.
       */

      const answerTableCheck =
        await client.query(
          `
            SELECT EXISTS (
              SELECT 1
              FROM information_schema.tables
              WHERE table_schema = 'public'
                AND table_name =
                  'academy_assignment_answers'
            ) AS exists
          `
        );

      const answerTableExists =
        answerTableCheck.rows[0]
          ?.exists === true;

      if (answerTableExists) {
        for (
          const answer of answerRows
        ) {
          await client.query(
            `
              INSERT INTO academy_assignment_answers (
                submission_id,
                question_id,
                student_answer,
                is_correct,
                marks_awarded
              )
              VALUES (
                $1,
                $2,
                $3,
                $4,
                $5
              )
            `,
            [
              submission.id,
              answer.questionId,
              answer.studentAnswer,
              answer.isCorrect,
              answer.marksAwarded,
            ]
          );
        }
      }

      await client.query(
        "COMMIT"
      );

      transactionStarted = false;

      return res.status(201).json({
        success: true,

        message:
          "Assignment submitted successfully.",

        submission: {
          ...submission,

          score,

          totalMarks,

          percentage,

          grade:
            resultGrade,
        },
      });
    } catch (error) {
      console.error(
        "POST /student/assignments/:id/submit error:",
        error
      );

      if (
        client &&
        transactionStarted
      ) {
        try {
          await client.query(
            "ROLLBACK"
          );
        } catch {}
      }

      return res.status(500).json({
        success: false,

        error:
          "Unable to submit assignment.",

        details:
          error?.message ||
          "Database request failed.",

        code:
          error?.code || null,
      });
    } finally {
      if (client) {
        client.release();
      }
    }
  }
);

/* =========================================================
   TUTOR SUBMISSIONS
========================================================= */

router.get(
  "/tutor/assignments/:id/submissions",
  async (req, res) => {
    try {
      const { id } =
        req.params;

      const result =
        await pool.query(
          `
            SELECT *
            FROM academy_assignment_submissions
            WHERE assignment_id = $1
            ORDER BY
              submitted_at DESC NULLS LAST
          `,
          [id]
        );

      return res.json({
        success: true,

        submissions:
          result.rows,

        count:
          result.rows.length,
      });
    } catch (error) {
      console.error(
        "GET submissions error:",
        error
      );

      return res.status(500).json({
        success: false,
        error:
          "Unable to load submissions.",
        details:
          error?.message ||
          "Database request failed.",
      });
    }
  }
);

/* =========================================================
   RELEASE RESULT
========================================================= */

router.patch(
  "/tutor/assignments/:id/submissions/:submissionId/release",
  async (req, res) => {
    try {
      const {
        id,
        submissionId,
      } = req.params;

      const result =
        await pool.query(
          `
            UPDATE academy_assignment_submissions
            SET
              result_released = true
            WHERE id = $1
              AND assignment_id = $2
            RETURNING *
          `,
          [
            submissionId,
            id,
          ]
        );

      if (!result.rows.length) {
        return res.status(404).json({
          success: false,
          error:
            "Submission not found.",
        });
      }

      await pool.query(
        `
          UPDATE academy_assignments
          SET
            result_released = true,
            updated_at = NOW()
          WHERE id = $1
        `,
        [id]
      );

      return res.json({
        success: true,

        message:
          "Result released successfully.",

        submission:
          result.rows[0],
      });
    } catch (error) {
      console.error(
        "Release result error:",
        error
      );

      return res.status(500).json({
        success: false,
        error:
          "Unable to release result.",
        details:
          error?.message ||
          "Database request failed.",
      });
    }
  }
);

/* =========================================================
   STUDENT RESULT
========================================================= */

router.get(
  "/student/assignments/:id/result",
  async (req, res) => {
    try {
      const { id } =
        req.params;

      const studentId =
        clean(
          req.query?.studentId ||
            req.query?.student_id
        );

      const studentReference =
        clean(
          req.query?.studentReference ||
            req.query?.student_reference ||
            req.query?.reference
        );

      if (
        !studentId &&
        !studentReference
      ) {
        return res.status(400).json({
          success: false,
          error:
            "Student ID or student reference is required.",
        });
      }

      let whereStudent = "";

      const values = [id];

      if (studentId) {
        values.push(studentId);

        whereStudent =
          `student_id = $${values.length}`;
      } else {
        values.push(
          studentReference
        );

        whereStudent = `
          LOWER(
            TRIM(
              CAST(
                student_reference
                AS TEXT
              )
            )
          )
          =
          LOWER(
            TRIM(
              $${values.length}::TEXT
            )
          )
        `;
      }

      const submissionResult =
        await pool.query(
          `
            SELECT *
            FROM academy_assignment_submissions
            WHERE assignment_id = $1
              AND ${whereStudent}
            ORDER BY
              submitted_at DESC NULLS LAST
            LIMIT 1
          `,
          values
        );

      if (
        !submissionResult.rows.length
      ) {
        return res.status(404).json({
          success: false,
          error:
            "No submission found for this assignment.",
        });
      }

      const submission =
        submissionResult.rows[0];

      if (
        !submission.result_released
      ) {
        return res.json({
          success: true,

          released: false,

          submission,

          message:
            "Your result has not been released yet.",
        });
      }

      const answerTableCheck =
        await pool.query(
          `
            SELECT EXISTS (
              SELECT 1
              FROM information_schema.tables
              WHERE table_schema = 'public'
                AND table_name =
                  'academy_assignment_answers'
            ) AS exists
          `
        );

      const answerTableExists =
        answerTableCheck.rows[0]
          ?.exists === true;

      if (!answerTableExists) {
        return res.json({
          success: true,

          released: true,

          submission,

          answers: [],
        });
      }

      const answersResult =
        await pool.query(
          `
            SELECT
              a.*,
              q.question,
              q.option_a,
              q.option_b,
              q.option_c,
              q.option_d,
              q.correct_answer,
              q.reason,
              q.question_number
            FROM academy_assignment_answers a
            INNER JOIN academy_assignment_questions q
              ON q.id = a.question_id
            WHERE a.submission_id = $1
            ORDER BY
              q.question_number ASC
          `,
          [submission.id]
        );

      const answers =
        answersResult.rows.map(
          (row, index) => ({
            ...formatQuestion(
              row,
              index
            ),

            studentAnswer:
              row.student_answer,

            isCorrect:
              row.is_correct,

            marksAwarded:
              Number(
                row.marks_awarded
              ) || 0,

            correctAnswer:
              normalizeAnswer(
                row.correct_answer
              ),

            explanation:
              row.reason || "",
          })
        );

      return res.json({
        success: true,

        released: true,

        submission,

        answers,
      });
    } catch (error) {
      console.error(
        "GET student result error:",
        error
      );

      return res.status(500).json({
        success: false,
        error:
          "Unable to load result.",
        details:
          error?.message ||
          "Database request failed.",
      });
    }
  }
);

/* =========================================================
   EXPORT
========================================================= */

export default router;
