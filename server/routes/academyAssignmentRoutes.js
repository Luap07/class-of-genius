import express from "express";
import pool from "../lib/db.js";

const router = express.Router();

/* ============================================================
   HELPERS
============================================================ */

const clean = (value) => {
  if (value === undefined || value === null) return "";
  return String(value).trim();
};

const toNumber = (value, fallback = 0) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
};

const getGrade = (percentage) => {
  const score = Number(percentage) || 0;

  if (score >= 80) return "A";
  if (score >= 70) return "B";
  if (score >= 60) return "C";
  if (score >= 50) return "D";
  if (score >= 40) return "E";

  return "F";
};

/* ============================================================
   REQUEST HELPERS
============================================================ */

const getTutorReference = (req) => {
  const body = req.body || {};
  const query = req.query || {};

  return clean(
    query.tutorReference ??
      query.tutor_reference ??
      query.reference ??
      body.tutorReference ??
      body.tutor_reference ??
      body.reference ??
      req.headers["x-tutor-reference"] ??
      req.headers["x-tutor-ref"]
  );
};

const getEnrollmentId = (req) => {
  const body = req.body || {};
  const query = req.query || {};

  return clean(
    query.enrollmentId ??
      query.enrollment_id ??
      query.enrollment ??
      body.enrollmentId ??
      body.enrollment_id ??
      body.enrollment ??
      body.student?.enrollmentId ??
      body.student?.enrollment_id ??
      body.student?.enrollment ??
      req.headers["x-enrollment-id"] ??
      req.headers["x-student-enrollment"]
  );
};

const getStudentReference = (req) => {
  const body = req.body || {};
  const query = req.query || {};

  return clean(
    query.studentReference ??
      query.student_reference ??
      query.reference ??
      body.studentReference ??
      body.student_reference ??
      body.reference ??
      body.student?.studentReference ??
      body.student?.student_reference ??
      body.student?.reference ??
      req.headers["x-student-reference"] ??
      req.headers["x-student-ref"]
  );
};

const getStudentName = (req) => {
  const body = req.body || {};

  return (
    clean(
      body.studentName ??
        body.student_name ??
        body.name ??
        body.student?.name ??
        body.student?.studentName
    ) || "Student"
  );
};

/* ============================================================
   DATABASE HELPERS
============================================================ */

const tableExists = async (tableName, client = pool) => {
  const result = await client.query(
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

  return Boolean(result.rows[0]?.exists);
};

const getTableColumns = async (tableName, client = pool) => {
  const result = await client.query(
    `
      SELECT
        column_name,
        data_type,
        udt_name,
        is_nullable,
        column_default
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = $1
      ORDER BY ordinal_position
    `,
    [tableName]
  );

  return result.rows.reduce((map, row) => {
    map[row.column_name] = row;
    return map;
  }, {});
};

/* ============================================================
   FORMAT QUESTION
============================================================ */

const formatQuestion = (question) => {
  if (!question) return null;

  return {
    id: question.id,

    assignmentId:
      question.assignment_id ??
      question.assignmentId ??
      null,

    question:
      question.question ??
      question.question_text ??
      "",

    optionA:
      question.option_a ??
      question.optionA ??
      "",

    optionB:
      question.option_b ??
      question.optionB ??
      "",

    optionC:
      question.option_c ??
      question.optionC ??
      "",

    optionD:
      question.option_d ??
      question.optionD ??
      "",

    correctAnswer:
      question.correct_answer ??
      question.correctAnswer ??
      "",

    marks: toNumber(question.marks, 1),

    createdAt:
      question.created_at ??
      question.createdAt ??
      null,
  };
};

/* ============================================================
   LOAD QUESTIONS
============================================================ */

const getAssignmentQuestions = async (
  client,
  assignmentId
) => {
  const result = await client.query(
    `
      SELECT
        id,
        assignment_id,
        question,
        option_a,
        option_b,
        option_c,
        option_d,
        correct_answer,
        marks,
        created_at
      FROM academy_assignment_questions
      WHERE assignment_id = $1
      ORDER BY id ASC
    `,
    [assignmentId]
  );

  return result.rows;
};

/* ============================================================
   FORMAT ASSIGNMENT
============================================================ */

const formatAssignment = (
  assignment,
  questions = []
) => {
  const formattedQuestions = questions
    .map(formatQuestion)
    .filter(Boolean);

  return {
    id: assignment.id,

    title:
      assignment.title ??
      "Untitled Assignment",

    description:
      assignment.description ??
      "",

    subject:
      assignment.subject ??
      "",

    class:
      assignment.class ??
      assignment.class_name ??
      "",

    className:
      assignment.class_name ??
      assignment.className ??
      assignment.class ??
      "",

    tutorReference:
      assignment.tutor_reference ??
      assignment.tutorReference ??
      "",

    totalQuestions: toNumber(
      assignment.total_questions,
      formattedQuestions.length
    ),

    totalMarks: toNumber(
      assignment.total_marks,
      formattedQuestions.reduce(
        (sum, question) =>
          sum + toNumber(question.marks, 1),
        0
      )
    ),

    duration:
      assignment.duration ??
      assignment.duration_minutes ??
      0,

    dueDate:
      assignment.due_date ??
      assignment.dueDate ??
      null,

    status:
      assignment.status ??
      "active",

    createdAt:
      assignment.created_at ??
      assignment.createdAt ??
      null,

    updatedAt:
      assignment.updated_at ??
      assignment.updatedAt ??
      null,

    questions: formattedQuestions,
  };
};

/* ============================================================
   TUTOR OWNS ASSIGNMENT
============================================================ */

const verifyTutorOwnsAssignment = async (
  client,
  assignmentId,
  tutorReference
) => {
  const result = await client.query(
    `
      SELECT *
      FROM academy_assignments
      WHERE id = $1
        AND tutor_reference = $2
      LIMIT 1
    `,
    [assignmentId, tutorReference]
  );

  return result.rows[0] || null;
};

/* ============================================================
   FORMAT SAVED ANSWER
============================================================ */

const formatSavedAnswer = (answer) => {
  const selectedAnswer = clean(
    answer.student_answer ??
      answer.studentAnswer ??
      answer.answer ??
      answer.selected_answer ??
      answer.selectedAnswer ??
      ""
  );

  const correctAnswer =
    clean(answer.correct_answer) ||
    clean(answer.question_correct_answer);

  const questionText =
    clean(answer.question_text) ||
    clean(answer.question);

  const rawIsCorrect = answer.is_correct;

  let isCorrect;

  if (typeof rawIsCorrect === "boolean") {
    isCorrect = rawIsCorrect;
  } else if (
    rawIsCorrect !== null &&
    rawIsCorrect !== undefined &&
    String(rawIsCorrect).trim() !== ""
  ) {
    isCorrect =
      String(rawIsCorrect).toLowerCase() === "true" ||
      String(rawIsCorrect) === "1";
  } else {
    isCorrect =
      selectedAnswer !== "" &&
      correctAnswer !== "" &&
      selectedAnswer.toLowerCase() ===
        correctAnswer.toLowerCase();
  }

  const marks = toNumber(
    answer.question_marks ??
      answer.marks,
    1
  );

  const marksAwarded = toNumber(
    answer.marks_awarded ??
      answer.answer_score ??
      answer.score,
    isCorrect ? marks : 0
  );

  return {
    id: answer.id,

    answerId: answer.id,

    submissionId:
      answer.submission_id ??
      null,

    questionId:
      answer.question_id ??
      answer.question_record_id ??
      null,

    questionNumber:
      answer.question_number ??
      null,

    question: questionText,

    optionA:
      answer.option_a ??
      "",

    optionB:
      answer.option_b ??
      "",

    optionC:
      answer.option_c ??
      "",

    optionD:
      answer.option_d ??
      "",

    selectedAnswer,

    studentAnswer:
      selectedAnswer,

    correctAnswer,

    isCorrect,

    marks,

    marksAwarded,

    score: marksAwarded,

    explanation:
      answer.explanation ??
      answer.reason ??
      "",

    reason:
      answer.reason ??
      answer.explanation ??
      "",

    createdAt:
      answer.answer_created_at ??
      answer.created_at ??
      null,
  };
};

/* ============================================================
   LOAD SUBMISSION ANSWERS

   IMPORTANT:
   We load answer records DIRECTLY by submission_id.

   Questions are attached afterwards.

   This means a missing question JOIN can never make an
   existing answer disappear.
============================================================ */

const getSubmissionAnswers = async (
  client,
  submissionId
) => {
  const normalizedSubmissionId =
    clean(submissionId);

  if (!normalizedSubmissionId) {
    return [];
  }

  const exists =
    await tableExists(
      "academy_assignment_answers",
      client
    );

  if (!exists) {
    throw new Error(
      "academy_assignment_answers table does not exist."
    );
  }

  const columns =
    await getTableColumns(
      "academy_assignment_answers",
      client
    );

  /*
   * Build SELECT dynamically so this route remains compatible
   * with the actual answer-table schema.
   */

  const selectColumns = [
    "id",
    "submission_id",
    "question_id",
  ];

  if (columns.student_answer) {
    selectColumns.push(
      "student_answer"
    );
  }

  if (columns.answer) {
    selectColumns.push(
      "answer"
    );
  }

  if (columns.selected_answer) {
    selectColumns.push(
      "selected_answer"
    );
  }

  if (columns.correct_answer) {
    selectColumns.push(
      "correct_answer"
    );
  }

  if (columns.is_correct) {
    selectColumns.push(
      "is_correct"
    );
  }

  if (columns.marks_awarded) {
    selectColumns.push(
      "marks_awarded"
    );
  }

  if (columns.score) {
    selectColumns.push(
      "score"
    );
  }

  if (columns.created_at) {
    selectColumns.push(
      "created_at"
    );
  }

  const rawResult =
    await client.query(
      `
        SELECT
          ${selectColumns.join(", ")}
        FROM academy_assignment_answers
        WHERE submission_id = $1
        ORDER BY id ASC
      `,
      [normalizedSubmissionId]
    );

  console.log(
    "🔎 ANSWER LOOKUP:",
    {
      submissionId:
        normalizedSubmissionId,

      rowsFound:
        rawResult.rows.length,

      answerIds:
        rawResult.rows.map(
          (row) => row.id
        ),

      questionIds:
        rawResult.rows.map(
          (row) => row.question_id
        ),
    }
  );

  if (
    rawResult.rows.length === 0
  ) {
    console.warn(
      "⚠️ NO ANSWER ROWS FOUND:",
      normalizedSubmissionId
    );

    return [];
  }

  /*
   * Load all question records associated with the answer rows.
   */

  const questionIds = [
    ...new Set(
      rawResult.rows
        .map(
          (row) =>
            row.question_id
        )
        .filter(
          (id) =>
            id !== null &&
            id !== undefined &&
            clean(id) !== ""
        )
        .map(
          (id) =>
            String(id)
        )
    ),
  ];

  let questionMap =
    new Map();

  if (
    questionIds.length > 0 &&
    await tableExists(
      "academy_assignment_questions",
      client
    )
  ) {
    const questionResult =
      await client.query(
        `
          SELECT
            id,
            question,
            option_a,
            option_b,
            option_c,
            option_d,
            correct_answer,
            marks,
            created_at
          FROM academy_assignment_questions
          WHERE id = ANY($1::bigint[])
        `,
        [questionIds]
      );

    questionMap =
      new Map(
        questionResult.rows.map(
          (question) => [
            String(question.id),
            question,
          ]
        )
      );
  }

  return rawResult.rows.map(
    (answerRow) => {
      const question =
        questionMap.get(
          String(
            answerRow.question_id
          )
        );

      return formatSavedAnswer({
        ...answerRow,

        question_record_id:
          question?.id ??
          answerRow.question_id ??
          null,

        question_text:
          question?.question ??
          "",

        option_a:
          question?.option_a ??
          "",

        option_b:
          question?.option_b ??
          "",

        option_c:
          question?.option_c ??
          "",

        option_d:
          question?.option_d ??
          "",

        question_correct_answer:
          question?.correct_answer ??
          "",

        question_marks:
          question?.marks ??
          1,

        question_created_at:
          question?.created_at ??
          null,
      });
    }
  );
};

/* ============================================================
   LOAD ONE SUBMISSION
============================================================ */

const getTutorSubmission = async (
  client,
  assignmentId,
  submissionId
) => {
  const submissionResult =
    await client.query(
      `
        SELECT *
        FROM academy_assignment_submissions
        WHERE id = $1
          AND assignment_id = $2
        LIMIT 1
      `,
      [
        submissionId,
        assignmentId,
      ]
    );

  if (
    submissionResult.rows.length === 0
  ) {
    return null;
  }

  const submission =
    submissionResult.rows[0];

  const answers =
    await getSubmissionAnswers(
      client,
      submission.id
    );

  const questions =
    await getAssignmentQuestions(
      client,
      assignmentId
    );

  const totalMarks =
    toNumber(
      submission.total_marks,
      questions.reduce(
        (sum, question) =>
          sum +
          toNumber(
            question.marks,
            1
          ),
        0
      )
    );

  const score =
    toNumber(
      submission.score,
      answers.reduce(
        (sum, answer) =>
          sum +
          toNumber(
            answer.marksAwarded,
            0
          ),
        0
      )
    );

  const percentage =
    toNumber(
      submission.percentage,
      totalMarks > 0
        ? Number(
            (
              (score /
                totalMarks) *
              100
            ).toFixed(2)
          )
        : 0
    );

  const status =
    submission.status ??
    "submitted";

  const resultReleased =
    Boolean(
      submission.result_released
    ) ||
    String(status).toLowerCase() ===
      "released";

  return {
    ...submission,

    enrollmentId:
      submission.enrollment_id,

    studentReference:
      submission.student_reference ??
      null,

    studentName:
      submission.student_name ??
      "Student",

    score,

    totalMarks,

    percentage,

    grade:
      submission.grade ??
      getGrade(percentage),

    status,

    resultReleased,

    submittedAt:
      submission.submitted_at ??
      submission.created_at ??
      null,

    answerCount:
      answers.length,

    answers,

    answersAvailable:
      answers.length > 0,
  };
};

/* ============================================================
   TUTOR — GET ALL ASSIGNMENTS
============================================================ */

router.get(
  "/tutor/assignments",
  async (req, res) => {
    try {
      const tutorReference =
        getTutorReference(req);

      if (!tutorReference) {
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
            FROM academy_assignments
            WHERE tutor_reference = $1
            ORDER BY created_at DESC
          `,
          [tutorReference]
        );

      const assignments = [];

      for (
        const assignment of result.rows
      ) {
        const questions =
          await getAssignmentQuestions(
            pool,
            assignment.id
          );

        assignments.push(
          formatAssignment(
            assignment,
            questions
          )
        );
      }

      return res.json({
        success: true,
        assignments,
        data: assignments,
        results: assignments,
        count: assignments.length,
      });
    } catch (error) {
      console.error(
        "Tutor assignments error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to load assignments.",
        error: error.message,
      });
    }
  }
);

/* ============================================================
   TUTOR — GET SINGLE ASSIGNMENT
============================================================ */

router.get(
  "/tutor/assignments/:id",
  async (req, res) => {
    try {
      const assignmentId =
        clean(req.params.id);

      const tutorReference =
        getTutorReference(req);

      if (!assignmentId) {
        return res.status(400).json({
          success: false,
          message:
            "Assignment ID is required.",
        });
      }

      if (!tutorReference) {
        return res.status(400).json({
          success: false,
          message:
            "Tutor reference is required.",
        });
      }

      const assignment =
        await verifyTutorOwnsAssignment(
          pool,
          assignmentId,
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
          pool,
          assignmentId
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

        questions:
          formatted.questions,

        data: {
          assignment:
            formatted,

          questions:
            formatted.questions,
        },
      });
    } catch (error) {
      console.error(
        "Tutor single assignment error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to load assignment.",
        error: error.message,
      });
    }
  }
);

/* ============================================================
   TUTOR — CREATE ASSIGNMENT
============================================================ */

router.post(
  "/tutor/assignments",
  async (req, res) => {
    const client =
      await pool.connect();

    try {
      const tutorReference =
        getTutorReference(req);

      if (!tutorReference) {
        return res.status(400).json({
          success: false,
          message:
            "Tutor reference is required.",
        });
      }

      const body =
        req.body || {};

      const title =
        clean(body.title);

      const description =
        clean(body.description);

      const subject =
        clean(body.subject);

      const className =
        clean(
          body.class ??
            body.className ??
            body.class_name
        );

      const duration =
        toNumber(
          body.duration ??
            body.duration_minutes,
          0
        );

      const dueDate =
        body.dueDate ??
        body.due_date ??
        null;

      const questions =
        Array.isArray(
          body.questions
        )
          ? body.questions
          : [];

      if (!title) {
        return res.status(400).json({
          success: false,
          message:
            "Assignment title is required.",
        });
      }

      if (
        questions.length === 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            "At least one question is required.",
        });
      }

      await client.query(
        "BEGIN"
      );

      const assignmentColumns =
        await getTableColumns(
          "academy_assignments",
          client
        );

      const insertColumns = [];
      const values = [];
      const params = [];

      const addColumn = (
        column,
        value
      ) => {
        if (
          assignmentColumns[column]
        ) {
          insertColumns.push(
            column
          );

          values.push(value);

          params.push(
            `$${values.length}`
          );
        }
      };

      addColumn(
        "title",
        title
      );

      addColumn(
        "description",
        description
      );

      addColumn(
        "subject",
        subject
      );

      if (
        assignmentColumns.class_name
      ) {
        addColumn(
          "class_name",
          className
        );
      } else if (
        assignmentColumns.class
      ) {
        addColumn(
          "class",
          className
        );
      }

      addColumn(
        "tutor_reference",
        tutorReference
      );

      if (
        assignmentColumns.duration
      ) {
        addColumn(
          "duration",
          duration
        );
      } else if (
        assignmentColumns.duration_minutes
      ) {
        addColumn(
          "duration_minutes",
          duration
        );
      }

      if (
        assignmentColumns.due_date
      ) {
        addColumn(
          "due_date",
          dueDate
        );
      }

      if (
        assignmentColumns.status
      ) {
        addColumn(
          "status",
          "active"
        );
      }

      if (
        assignmentColumns.total_questions
      ) {
        addColumn(
          "total_questions",
          questions.length
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
              question.marks,
              1
            ),
          0
        );

      if (
        assignmentColumns.total_marks
      ) {
        addColumn(
          "total_marks",
          totalMarks
        );
      }

      const assignmentResult =
        await client.query(
          `
            INSERT INTO academy_assignments
            (
              ${insertColumns.join(", ")}
            )
            VALUES
            (
              ${params.join(", ")}
            )
            RETURNING *
          `,
          values
        );

      const assignment =
        assignmentResult.rows[0];

      const questionColumns =
        await getTableColumns(
          "academy_assignment_questions",
          client
        );

      for (
        const question of questions
      ) {
        const qColumns = [];
        const qValues = [];
        const qParams = [];

        const addQuestionColumn = (
          column,
          value
        ) => {
          if (
            questionColumns[column]
          ) {
            qColumns.push(column);

            qValues.push(value);

            qParams.push(
              `$${qValues.length}`
            );
          }
        };

        addQuestionColumn(
          "assignment_id",
          assignment.id
        );

        addQuestionColumn(
          "question",
          clean(
            question.question
          )
        );

        addQuestionColumn(
          "option_a",
          clean(
            question.optionA ??
              question.option_a
          )
        );

        addQuestionColumn(
          "option_b",
          clean(
            question.optionB ??
              question.option_b
          )
        );

        addQuestionColumn(
          "option_c",
          clean(
            question.optionC ??
              question.option_c
          )
        );

        addQuestionColumn(
          "option_d",
          clean(
            question.optionD ??
              question.option_d
          )
        );

        addQuestionColumn(
          "correct_answer",
          clean(
            question.correctAnswer ??
              question.correct_answer
          )
        );

        addQuestionColumn(
          "marks",
          toNumber(
            question.marks,
            1
          )
        );

        await client.query(
          `
            INSERT INTO academy_assignment_questions
            (
              ${qColumns.join(", ")}
            )
            VALUES
            (
              ${qParams.join(", ")}
            )
          `,
          qValues
        );
      }

      await client.query(
        "COMMIT"
      );

      const savedQuestions =
        await getAssignmentQuestions(
          pool,
          assignment.id
        );

      return res.status(201).json({
        success: true,

        message:
          "Assignment created successfully.",

        assignment:
          formatAssignment(
            assignment,
            savedQuestions
          ),
      });
    } catch (error) {
      try {
        await client.query(
          "ROLLBACK"
        );
      } catch {}

      console.error(
        "Create assignment error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to create assignment.",
        error: error.message,
      });
    } finally {
      client.release();
    }
  }
);

/* ============================================================
   TUTOR — DELETE ASSIGNMENT
============================================================ */

router.delete(
  "/tutor/assignments/:id",
  async (req, res) => {
    try {
      const assignmentId =
        clean(req.params.id);

      const tutorReference =
        getTutorReference(req);

      if (!assignmentId) {
        return res.status(400).json({
          success: false,
          message:
            "Assignment ID is required.",
        });
      }

      if (!tutorReference) {
        return res.status(400).json({
          success: false,
          message:
            "Tutor reference is required.",
        });
      }

      const assignment =
        await verifyTutorOwnsAssignment(
          pool,
          assignmentId,
          tutorReference
        );

      if (!assignment) {
        return res.status(404).json({
          success: false,
          message:
            "Assignment not found.",
        });
      }

      await pool.query(
        `
          DELETE FROM academy_assignments
          WHERE id = $1
            AND tutor_reference = $2
        `,
        [
          assignmentId,
          tutorReference,
        ]
      );

      return res.json({
        success: true,
        message:
          "Assignment deleted successfully.",
      });
    } catch (error) {
      console.error(
        "Delete assignment error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to delete assignment.",
        error: error.message,
      });
    }
  }
);

/* ============================================================
   STUDENT — GET ASSIGNMENTS
============================================================ */

router.get(
  "/student/assignments",
  async (req, res) => {
    try {
      const enrollmentId =
        getEnrollmentId(req);

      const studentReference =
        getStudentReference(req);

      if (
        !enrollmentId &&
        !studentReference
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Student enrollment ID or student reference is required.",
        });
      }

      let result;

      if (enrollmentId) {
        result =
          await pool.query(
            `
              SELECT *
              FROM academy_assignments
              WHERE class_name = (
                SELECT class
                FROM academy_student_enrollments
                WHERE enrollment_id = $1
                LIMIT 1
              )
              ORDER BY created_at DESC
            `,
            [enrollmentId]
          );
      } else {
        result =
          await pool.query(
            `
              SELECT *
              FROM academy_assignments
              ORDER BY created_at DESC
            `
          );
      }

      const assignments = [];

      for (
        const assignment of result.rows
      ) {
        const questions =
          await getAssignmentQuestions(
            pool,
            assignment.id
          );

        assignments.push(
          formatAssignment(
            assignment,
            questions
          )
        );
      }

      return res.json({
        success: true,
        assignments,
        data: assignments,
        results: assignments,
        count: assignments.length,
      });
    } catch (error) {
      console.error(
        "Student assignments error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to load assignments.",
        error: error.message,
      });
    }
  }
);

/* ============================================================
   STUDENT — GET SINGLE ASSIGNMENT
============================================================ */

router.get(
  "/student/assignments/:id",
  async (req, res) => {
    try {
      const assignmentId =
        clean(req.params.id);

      if (!assignmentId) {
        return res.status(400).json({
          success: false,
          message:
            "Assignment ID is required.",
        });
      }

      const result =
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
        result.rows.length === 0
      ) {
        return res.status(404).json({
          success: false,
          message:
            "Assignment not found.",
        });
      }

      const questions =
        await getAssignmentQuestions(
          pool,
          assignmentId
        );

      const assignment =
        formatAssignment(
          result.rows[0],
          questions
        );

      return res.json({
        success: true,

        assignment,

        questions:
          assignment.questions,

        data: {
          assignment,

          questions:
            assignment.questions,
        },
      });
    } catch (error) {
      console.error(
        "Student single assignment error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to load assignment.",
        error: error.message,
      });
    }
  }
);

/* ============================================================
   NORMALIZE STUDENT ANSWER
============================================================ */

const normalizeStudentAnswer = (
  answer,
  questionsById
) => {
  if (
    answer === null ||
    answer === undefined
  ) {
    return null;
  }

  /*
   * Support all common frontend structures.
   */

  const questionId =
    answer.questionId ??
    answer.question_id ??
    answer.questionID ??
    answer.question?.id ??
    answer.id;

  if (
    questionId === undefined ||
    questionId === null ||
    clean(questionId) === ""
  ) {
    return null;
  }

  const question =
    questionsById.get(
      String(questionId)
    );

  if (!question) {
    console.warn(
      "⚠️ Answer references question outside assignment:",
      questionId
    );

    return null;
  }

  const selected = clean(
    answer.studentAnswer ??
      answer.student_answer ??
      answer.selectedAnswer ??
      answer.selected_answer ??
      answer.answer ??
      answer.value ??
      answer.response ??
      ""
  );

  const correct =
    clean(
      question.correct_answer
    );

  const isCorrect =
    selected !== "" &&
    correct !== "" &&
    selected.toLowerCase() ===
      correct.toLowerCase();

  const marks =
    toNumber(
      question.marks,
      1
    );

  return {
    questionId:
      question.id,

    selected,

    correct,

    isCorrect,

    marks,

    marksAwarded:
      isCorrect
        ? marks
        : 0,
  };
};

/* ============================================================
   STUDENT — SUBMIT ASSIGNMENT
============================================================ */

router.post(
  "/student/assignments/:id/submit",
  async (req, res) => {
    const client =
      await pool.connect();

    try {
      const assignmentId =
        clean(req.params.id);

      const enrollmentId =
        getEnrollmentId(req);

      const studentReference =
        getStudentReference(req);

      const studentName =
        getStudentName(req);

      const body =
        req.body || {};

      /*
       * Support:
       * answers
       * answerRecords
       * submittedAnswers
       * responses
       */

      let submittedAnswers =
        body.answers ??
        body.answerRecords ??
        body.submittedAnswers ??
        body.responses ??
        [];

      /*
       * Some clients send answers as an object:
       *
       * {
       *   "123": "A",
       *   "124": "B"
       * }
       *
       * Convert that into normal answer records.
       */

      if (
        submittedAnswers &&
        !Array.isArray(
          submittedAnswers
        ) &&
        typeof submittedAnswers ===
          "object"
      ) {
        submittedAnswers =
          Object.entries(
            submittedAnswers
          ).map(
            ([
              questionId,
              value,
            ]) => ({
              questionId,
              studentAnswer:
                value,
            })
          );
      }

      if (
        !Array.isArray(
          submittedAnswers
        )
      ) {
        submittedAnswers = [];
      }

      if (!assignmentId) {
        return res.status(400).json({
          success: false,
          message:
            "Assignment ID is required.",
        });
      }

      if (
        !enrollmentId &&
        !studentReference
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Student enrollment ID or student reference is required.",
        });
      }

      /*
       * Load assignment.
       */

      const assignmentResult =
        await client.query(
          `
            SELECT *
            FROM academy_assignments
            WHERE id = $1
            LIMIT 1
          `,
          [assignmentId]
        );

      if (
        assignmentResult.rows.length ===
        0
      ) {
        return res.status(404).json({
          success: false,
          message:
            "Assignment not found.",
        });
      }

      const assignment =
        assignmentResult.rows[0];

      /*
       * Load the actual assignment questions.
       */

      const questions =
        await getAssignmentQuestions(
          client,
          assignmentId
        );

      if (
        questions.length === 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            "This assignment has no questions.",
        });
      }

      /*
       * Map question IDs.
       */

      const questionsById =
        new Map(
          questions.map(
            (question) => [
              String(question.id),
              question,
            ]
          )
        );

      /*
       * Normalize frontend answers.
       */

      const normalizedSubmittedAnswers =
        submittedAnswers
          .map(
            (answer) =>
              normalizeStudentAnswer(
                answer,
                questionsById
              )
          )
          .filter(Boolean);

      /*
       * Create a map so duplicate frontend answers for
       * the same question do not create duplicate records.
       */

      const answerMap =
        new Map();

      for (
        const answer of
          normalizedSubmittedAnswers
      ) {
        answerMap.set(
          String(
            answer.questionId
          ),
          answer
        );
      }

      /*
       * IMPORTANT FIX:
       *
       * Create one answer record for EVERY question.
       *
       * If the student did not answer a question, its
       * student answer is simply "" and it receives 0 marks.
       *
       * This guarantees the tutor can always see the
       * complete submission.
       */

      const normalizedAnswers =
        questions.map(
          (question) => {
            const submitted =
              answerMap.get(
                String(question.id)
              );

            if (submitted) {
              return submitted;
            }

            return {
              questionId:
                question.id,

              selected:
                "",

              correct:
                clean(
                  question.correct_answer
                ),

              isCorrect:
                false,

              marks:
                toNumber(
                  question.marks,
                  1
                ),

              marksAwarded:
                0,
            };
          }
        );

      /*
       * Calculate score.
       */

      const score =
        normalizedAnswers.reduce(
          (
            total,
            answer
          ) =>
            total +
            toNumber(
              answer.marksAwarded,
              0
            ),
          0
        );

      const totalMarks =
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
        );

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

      const grade =
        getGrade(
          percentage
        );

      console.log(
        "📝 SUBMISSION NORMALIZED:",
        {
          assignmentId,

          enrollmentId,

          studentReference,

          questions:
            questions.length,

          frontendAnswers:
            submittedAnswers.length,

          normalizedAnswers:
            normalizedAnswers.length,

          score,

          totalMarks,

          percentage,
        }
      );

      await client.query(
        "BEGIN"
      );

      /* ======================================================
         CREATE SUBMISSION
      ====================================================== */

      const submissionColumns =
        await getTableColumns(
          "academy_assignment_submissions",
          client
        );

      const insertColumns = [];
      const values = [];
      const params = [];

      const addSubmissionColumn = (
        column,
        value
      ) => {
        if (
          submissionColumns[column]
        ) {
          insertColumns.push(
            column
          );

          values.push(value);

          params.push(
            `$${values.length}`
          );
        }
      };

      addSubmissionColumn(
        "assignment_id",
        assignmentId
      );

      if (
        submissionColumns.enrollment_id
      ) {
        addSubmissionColumn(
          "enrollment_id",
          enrollmentId ||
            null
        );
      }

      if (
        submissionColumns.student_reference
      ) {
        addSubmissionColumn(
          "student_reference",
          studentReference ||
            null
        );
      }

      if (
        submissionColumns.student_name
      ) {
        addSubmissionColumn(
          "student_name",
          studentName
        );
      }

      if (
        submissionColumns.answer
      ) {
        addSubmissionColumn(
          "answer",
          JSON.stringify(
            normalizedAnswers
          )
        );
      }

      if (
        submissionColumns.answers
      ) {
        addSubmissionColumn(
          "answers",
          JSON.stringify(
            normalizedAnswers
          )
        );
      }

      if (
        submissionColumns.score
      ) {
        addSubmissionColumn(
          "score",
          score
        );
      }

      if (
        submissionColumns.total_marks
      ) {
        addSubmissionColumn(
          "total_marks",
          totalMarks
        );
      }

      if (
        submissionColumns.percentage
      ) {
        addSubmissionColumn(
          "percentage",
          percentage
        );
      }

      if (
        submissionColumns.grade
      ) {
        addSubmissionColumn(
          "grade",
          grade
        );
      }

      if (
        submissionColumns.status
      ) {
        addSubmissionColumn(
          "status",
          "submitted"
        );
      }

      if (
        submissionColumns.result_released
      ) {
        addSubmissionColumn(
          "result_released",
          false
        );
      }

      if (
        submissionColumns.submitted_at
      ) {
        addSubmissionColumn(
          "submitted_at",
          new Date()
        );
      }

      if (
        insertColumns.length ===
        0
      ) {
        throw new Error(
          "No writable columns were found in academy_assignment_submissions."
        );
      }

      const submissionResult =
        await client.query(
          `
            INSERT INTO academy_assignment_submissions
            (
              ${insertColumns.join(", ")}
            )
            VALUES
            (
              ${params.join(", ")}
            )
            RETURNING *
          `,
          values
        );

      const submission =
        submissionResult.rows[0];

      console.log(
        "✅ SUBMISSION CREATED:",
        submission.id
      );

      /* ======================================================
         SAVE ANSWERS
      ====================================================== */

      const answersTableExists =
        await tableExists(
          "academy_assignment_answers",
          client
        );

      if (!answersTableExists) {
        throw new Error(
          "academy_assignment_answers table does not exist."
        );
      }

      const answerColumns =
        await getTableColumns(
          "academy_assignment_answers",
          client
        );

      /*
       * Save EVERY question.
       */

      for (
        const answer of
          normalizedAnswers
      ) {
        const answerInsertColumns =
          [];

        const answerValues =
          [];

        const answerParams =
          [];

        const addAnswerColumn =
          (
            column,
            value
          ) => {
            if (
              answerColumns[column]
            ) {
              answerInsertColumns.push(
                column
              );

              answerValues.push(
                value
              );

              answerParams.push(
                `$${answerValues.length}`
              );
            }
          };

        addAnswerColumn(
          "submission_id",
          submission.id
        );

        addAnswerColumn(
          "question_id",
          answer.questionId
        );

        if (
          answerColumns.student_answer
        ) {
          addAnswerColumn(
            "student_answer",
            answer.selected
          );
        }

        if (
          answerColumns.answer
        ) {
          addAnswerColumn(
            "answer",
            answer.selected
          );
        }

        if (
          answerColumns.selected_answer
        ) {
          addAnswerColumn(
            "selected_answer",
            answer.selected
          );
        }

        if (
          answerColumns.correct_answer
        ) {
          addAnswerColumn(
            "correct_answer",
            answer.correct
          );
        }

        if (
          answerColumns.is_correct
        ) {
          addAnswerColumn(
            "is_correct",
            answer.isCorrect
          );
        }

        if (
          answerColumns.marks_awarded
        ) {
          addAnswerColumn(
            "marks_awarded",
            answer.marksAwarded
          );
        }

        if (
          answerColumns.score
        ) {
          addAnswerColumn(
            "score",
            answer.marksAwarded
          );
        }

        if (
          answerInsertColumns.length ===
          0
        ) {
          throw new Error(
            "No writable columns were found in academy_assignment_answers."
          );
        }

        /*
         * Do not depend on ON CONFLICT here.
         *
         * A unique constraint on
         * (submission_id, question_id)
         * may or may not exist in the database.
         */

        await client.query(
          `
            INSERT INTO academy_assignment_answers
            (
              ${answerInsertColumns.join(
                ", "
              )}
            )
            VALUES
            (
              ${answerParams.join(
                ", "
              )}
            )
          `,
          answerValues
        );
      }

      /*
       * Verify the rows BEFORE committing.
       */

      const verification =
        await client.query(
          `
            SELECT
              COUNT(*)::int AS count
            FROM academy_assignment_answers
            WHERE submission_id = $1
          `,
          [submission.id]
        );

      const savedAnswerCount =
        Number(
          verification.rows[0]?.count ||
            0
        );

      console.log(
        "✅ ANSWERS SAVED:",
        {
          submissionId:
            submission.id,

          expected:
            normalizedAnswers.length,

          actual:
            savedAnswerCount,
        }
      );

      if (
        savedAnswerCount === 0
      ) {
        throw new Error(
          "Submission was created, but no answer records were saved."
        );
      }

      await client.query(
        "COMMIT"
      );

      /*
       * Load the exact rows again after COMMIT.
       */

      const savedAnswers =
        await getSubmissionAnswers(
          pool,
          submission.id
        );

      console.log(
        "✅ ANSWERS RELOADED:",
        {
          submissionId:
            submission.id,

          answerCount:
            savedAnswers.length,
        }
      );

      return res.status(201).json({
        success: true,

        message:
          "Assignment submitted successfully.",

        submission: {
          ...submission,

          score,

          totalMarks,

          percentage,

          grade,

          answerCount:
            savedAnswers.length,

          answers:
            savedAnswers,

          answersAvailable:
            savedAnswers.length > 0,
        },

        answers:
          savedAnswers,

        answerCount:
          savedAnswers.length,

        answersAvailable:
          savedAnswers.length > 0,
      });
    } catch (error) {
      try {
        await client.query(
          "ROLLBACK"
        );
      } catch {}

      console.error(
        "Submit assignment error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to submit assignment.",
        error: error.message,
      });
    } finally {
      client.release();
    }
  }
);

/* ============================================================
   TUTOR — GET SUBMISSIONS
============================================================ */

router.get(
  "/tutor/assignments/:id/submissions",
  async (req, res) => {
    try {
      const assignmentId =
        clean(req.params.id);

      const tutorReference =
        getTutorReference(req);

      if (!assignmentId) {
        return res.status(400).json({
          success: false,
          message:
            "Assignment ID is required.",
        });
      }

      if (!tutorReference) {
        return res.status(400).json({
          success: false,
          message:
            "Tutor reference is required.",
        });
      }

      const assignment =
        await verifyTutorOwnsAssignment(
          pool,
          assignmentId,
          tutorReference
        );

      if (!assignment) {
        return res.status(404).json({
          success: false,
          message:
            "Assignment not found.",
        });
      }

      const result =
        await pool.query(
          `
            SELECT *
            FROM academy_assignment_submissions
            WHERE assignment_id = $1
            ORDER BY submitted_at DESC NULLS LAST, id DESC
          `,
          [assignmentId]
        );

      const questions =
        await getAssignmentQuestions(
          pool,
          assignmentId
        );

      const totalMarks =
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
        );

      const submissions = [];

      for (
        const row of result.rows
      ) {
        const answers =
          await getSubmissionAnswers(
            pool,
            row.id
          );

        const score =
          toNumber(
            row.score,
            answers.reduce(
              (
                total,
                answer
              ) =>
                total +
                toNumber(
                  answer.marksAwarded,
                  0
                ),
              0
            )
          );

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

        submissions.push({
          ...row,

          enrollmentId:
            row.enrollment_id,

          studentReference:
            row.student_reference ??
            null,

          studentName:
            row.student_name ||
            "Student",

          score,

          totalMarks,

          percentage,

          grade:
            row.grade ??
            getGrade(
              percentage
            ),

          status:
            row.status ??
            "submitted",

          answerCount:
            answers.length,

          answersAvailable:
            answers.length > 0,
        });
      }

      return res.json({
        success: true,

        assignment:
          formatAssignment(
            assignment,
            questions
          ),

        submissions,

        data: {
          submissions,
        },

        results:
          submissions,

        count:
          submissions.length,
      });
    } catch (error) {
      console.error(
        "Tutor assignment submissions error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to load assignment submissions.",
        error: error.message,
      });
    }
  }
);

/* ============================================================
   TUTOR — GET SINGLE SUBMISSION
============================================================ */

router.get(
  "/tutor/assignments/:id/submissions/:submissionId",
  async (req, res) => {
    try {
      const assignmentId =
        clean(req.params.id);

      const submissionId =
        clean(
          req.params.submissionId
        );

      const tutorReference =
        getTutorReference(req);

      if (!assignmentId) {
        return res.status(400).json({
          success: false,
          message:
            "Assignment ID is required.",
        });
      }

      if (!submissionId) {
        return res.status(400).json({
          success: false,
          message:
            "Submission ID is required.",
        });
      }

      if (!tutorReference) {
        return res.status(400).json({
          success: false,
          message:
            "Tutor reference is required.",
        });
      }

      const assignment =
        await verifyTutorOwnsAssignment(
          pool,
          assignmentId,
          tutorReference
        );

      if (!assignment) {
        return res.status(404).json({
          success: false,
          message:
            "Assignment not found.",
        });
      }

      const submission =
        await getTutorSubmission(
          pool,
          assignmentId,
          submissionId
        );

      if (!submission) {
        return res.status(404).json({
          success: false,
          message:
            "Submission not found.",
        });
      }

      return res.json({
        success: true,

        submission,

        answers:
          submission.answers,

        answerCount:
          submission.answerCount,

        answersAvailable:
          submission.answersAvailable,

        data: {
          submission,

          answers:
            submission.answers,
        },

        result: {
          submission,

          answers:
            submission.answers,
        },
      });
    } catch (error) {
      console.error(
        "Tutor single submission error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to load submission.",
        error: error.message,
      });
    }
  }
);

/* ============================================================
   TUTOR — RELEASE RESULT
============================================================ */

router.patch(
  "/tutor/assignments/:id/submissions/:submissionId/release",
  async (req, res) => {
    const client =
      await pool.connect();

    try {
      const assignmentId =
        clean(req.params.id);

      const submissionId =
        clean(
          req.params.submissionId
        );

      const tutorReference =
        getTutorReference(req);

      if (
        !assignmentId ||
        !submissionId
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Assignment ID and submission ID are required.",
        });
      }

      if (!tutorReference) {
        return res.status(400).json({
          success: false,
          message:
            "Tutor reference is required.",
        });
      }

      const assignment =
        await verifyTutorOwnsAssignment(
          client,
          assignmentId,
          tutorReference
        );

      if (!assignment) {
        return res.status(404).json({
          success: false,
          message:
            "Assignment not found.",
        });
      }

      const submissionResult =
        await client.query(
          `
            SELECT *
            FROM academy_assignment_submissions
            WHERE id = $1
              AND assignment_id = $2
            LIMIT 1
          `,
          [
            submissionId,
            assignmentId,
          ]
        );

      if (
        submissionResult.rows.length ===
        0
      ) {
        return res.status(404).json({
          success: false,
          message:
            "Submission not found.",
        });
      }

      const body =
        req.body || {};

      const feedback =
        clean(
          body.feedback
        );

      const columns =
        await getTableColumns(
          "academy_assignment_submissions",
          client
        );

      const updates = [];
      const values = [];
      const params = [];

      const addUpdate = (
        column,
        value
      ) => {
        if (
          columns[column]
        ) {
          values.push(value);

          params.push(
            `$${values.length}`
          );

          updates.push(
            `${column} = ${params[params.length - 1]}`
          );
        }
      };

      if (columns.status) {
        addUpdate(
          "status",
          "released"
        );
      }

      if (columns.feedback) {
        addUpdate(
          "feedback",
          feedback
        );
      }

      if (
        columns.result_released
      ) {
        addUpdate(
          "result_released",
          true
        );
      }

      if (
        updates.length === 0
      ) {
        return res.status(500).json({
          success: false,
          message:
            "No releasable submission columns were found.",
        });
      }

      values.push(
        submissionId
      );

      params.push(
        `$${values.length}`
      );

      await client.query(
        `
          UPDATE academy_assignment_submissions
          SET ${updates.join(", ")}
          WHERE id = ${params[params.length - 1]}
        `,
        values
      );

      return res.json({
        success: true,

        message:
          "Assignment result released successfully.",
      });
    } catch (error) {
      console.error(
        "Release assignment result error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to release assignment result.",
        error: error.message,
      });
    } finally {
      client.release();
    }
  }
);

/* ============================================================
   STUDENT — GET RESULT
============================================================ */

router.get(
  "/student/assignments/:id/result",
  async (req, res) => {
    try {
      const assignmentId =
        clean(req.params.id);

      const enrollmentId =
        getEnrollmentId(req);

      const studentReference =
        getStudentReference(req);

      if (
        !enrollmentId &&
        !studentReference
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Student enrollment ID or student reference is required.",
        });
      }

      let result;

      if (enrollmentId) {
        result =
          await pool.query(
            `
              SELECT *
              FROM academy_assignment_submissions
              WHERE assignment_id = $1
                AND enrollment_id = $2
              ORDER BY id DESC
              LIMIT 1
            `,
            [
              assignmentId,
              enrollmentId,
            ]
          );
      } else {
        result =
          await pool.query(
            `
              SELECT *
              FROM academy_assignment_submissions
              WHERE assignment_id = $1
                AND student_reference = $2
              ORDER BY id DESC
              LIMIT 1
            `,
            [
              assignmentId,
              studentReference,
            ]
          );
      }

      if (
        result.rows.length ===
        0
      ) {
        return res.status(404).json({
          success: false,
          message:
            "Assignment submission not found.",
        });
      }

      const submission =
        result.rows[0];

      const answers =
        await getSubmissionAnswers(
          pool,
          submission.id
        );

      const questions =
        await getAssignmentQuestions(
          pool,
          assignmentId
        );

      const totalMarks =
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
        );

      const score =
        toNumber(
          submission.score,
          answers.reduce(
            (
              total,
              answer
            ) =>
              total +
              toNumber(
                answer.marksAwarded,
                0
              ),
            0
          )
        );

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

      const grade =
        submission.grade ??
        getGrade(
          percentage
        );

      const status =
        submission.status ??
        "submitted";

      const resultReleased =
        Boolean(
          submission.result_released
        ) ||
        String(status).toLowerCase() ===
          "released";

      if (
        !resultReleased
      ) {
        return res.status(403).json({
          success: false,
          message:
            "Assignment result has not been released yet.",
        });
      }

      const formattedSubmission = {
        ...submission,

        score,

        totalMarks,

        percentage,

        grade,

        status,

        resultReleased,

        answerCount:
          answers.length,

        answers,

        answersAvailable:
          answers.length > 0,
      };

      return res.json({
        success: true,

        submission:
          formattedSubmission,

        answers,

        data: {
          submission:
            formattedSubmission,

          answers,
        },

        result: {
          submission:
            formattedSubmission,

          answers,
        },
      });
    } catch (error) {
      console.error(
        "Student assignment result error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to load assignment result.",
        error: error.message,
      });
    }
  }
);

/* ============================================================
   DEBUG — CHECK SUBMISSION ANSWERS DIRECTLY
   REMOVE THIS ENDPOINT AFTER FIXING THE ISSUE
============================================================ */

router.get(
  "/debug/submission/:submissionId/answers",
  async (req, res) => {
    try {
      const submissionId =
        clean(req.params.submissionId);

      if (!submissionId) {
        return res.status(400).json({
          success: false,
          message:
            "Submission ID is required.",
        });
      }

      /* --------------------------------------------------------
         CHECK SUBMISSION
      -------------------------------------------------------- */

      const submissionResult =
        await pool.query(
          `
            SELECT *
            FROM academy_assignment_submissions
            WHERE id = $1
            LIMIT 1
          `,
          [submissionId]
        );

      /* --------------------------------------------------------
         CHECK ALL ANSWERS FOR THIS SUBMISSION
      -------------------------------------------------------- */

      const answersResult =
        await pool.query(
          `
            SELECT *
            FROM academy_assignment_answers
            WHERE submission_id = $1
            ORDER BY id ASC
          `,
          [submissionId]
        );

      /* --------------------------------------------------------
         CHECK ANSWERS USING STRING CAST
         This helps detect UUID/string/integer mismatches.
      -------------------------------------------------------- */

      const castResult =
        await pool.query(
          `
            SELECT *
            FROM academy_assignment_answers
            WHERE CAST(submission_id AS TEXT) = CAST($1 AS TEXT)
            ORDER BY id ASC
          `,
          [submissionId]
        );

      /* --------------------------------------------------------
         CHECK RECENT ANSWERS
      -------------------------------------------------------- */

      const recentAnswersResult =
        await pool.query(
          `
            SELECT
              id,
              submission_id,
              question_id,
              student_answer,
              correct_answer,
              is_correct,
              marks_awarded,
              created_at
            FROM academy_assignment_answers
            ORDER BY id DESC
            LIMIT 30
          `
        );

      /* --------------------------------------------------------
         CHECK TABLE COLUMNS
      -------------------------------------------------------- */

      const answerColumns =
        await getTableColumns(
          "academy_assignment_answers",
          pool
        );

      /* --------------------------------------------------------
         CHECK SUBMISSION COLUMNS
      -------------------------------------------------------- */

      const submissionColumns =
        await getTableColumns(
          "academy_assignment_submissions",
          pool
        );

      console.log(
        "================================================"
      );

      console.log(
        "🔍 SUBMISSION ANSWER DEBUG"
      );

      console.log({
        requestedSubmissionId:
          submissionId,

        submissionFound:
          submissionResult.rows.length > 0,

        submission:
          submissionResult.rows[0] ||
          null,

        directAnswerCount:
          answersResult.rows.length,

        castAnswerCount:
          castResult.rows.length,

        directAnswers:
          answersResult.rows,

        castAnswers:
          castResult.rows,

        recentAnswers:
          recentAnswersResult.rows,

        answerColumns:
          Object.keys(
            answerColumns
          ),

        submissionColumns:
          Object.keys(
            submissionColumns
          ),
      });

      console.log(
        "================================================"
      );

      return res.json({
        success: true,

        submissionId,

        submissionFound:
          submissionResult.rows.length >
          0,

        submission:
          submissionResult.rows[0] ||
          null,

        directAnswerCount:
          answersResult.rows.length,

        castAnswerCount:
          castResult.rows.length,

        answers:
          answersResult.rows,

        castAnswers:
          castResult.rows,

        recentAnswers:
          recentAnswersResult.rows,

        answerColumns:
          Object.keys(
            answerColumns
          ),

        submissionColumns:
          Object.keys(
            submissionColumns
          ),
      });
    } catch (error) {
      console.error(
        "Submission answer debug error:",
        error
      );

      return res.status(500).json({
        success: false,

        message:
          "Unable to inspect submission answers.",

        error:
          error.message,

        stack:
          error.stack,
      });
    }
  }
);


/* ============================================================
   EXPORT
============================================================ */

export default router;