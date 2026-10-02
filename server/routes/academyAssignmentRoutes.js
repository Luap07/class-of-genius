import express from "express";
import pool from "../lib/db.js";

const router = express.Router();

/* ============================================================
   HELPERS
============================================================ */

const clean = (value) => {
  if (value === undefined || value === null) {
    return "";
  }

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
   TUTOR REFERENCE
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

/* ============================================================
   STUDENT ENROLLMENT ID
============================================================ */

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

/* ============================================================
   STUDENT REFERENCE
============================================================ */

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

/* ============================================================
   STUDENT NAME
============================================================ */

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
   FORMAT QUESTION
============================================================ */

const formatQuestion = (question) => {
  if (!question) {
    return null;
  }

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

    marks: toNumber(
      question.marks,
      1
    ),

    createdAt:
      question.created_at ??
      question.createdAt ??
      null,
  };
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

    totalQuestions:
      toNumber(
        assignment.total_questions,
        formattedQuestions.length
      ),

    totalMarks:
      toNumber(
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
   CHECK TABLE
============================================================ */

const tableExists = async (
  tableName,
  client = pool
) => {
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

  return Boolean(
    result.rows[0]?.exists
  );
};

/* ============================================================
   GET TABLE COLUMNS
============================================================ */

const getTableColumns = async (
  tableName,
  client = pool
) => {
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

  return result.rows.reduce(
    (map, row) => {
      map[row.column_name] = row;
      return map;
    },
    {}
  );
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
    [
      assignmentId,
      tutorReference,
    ]
  );

  return result.rows[0] || null;
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
   FORMAT SAVED ANSWER
============================================================ */

const formatSavedAnswer = (answer) => {
  const selectedAnswer = clean(
    answer.student_answer ??
      answer.answer ??
      answer.selected_answer ??
      answer.studentAnswer ??
      answer.selectedAnswer ??
      ""
  );

  const correctAnswer =
    clean(answer.correct_answer) ||
    clean(answer.question_correct_answer) ||
    clean(answer.correctAnswer);

  const questionText =
    clean(answer.question_text) ||
    clean(answer.question);

  const rawIsCorrect =
    answer.is_correct ??
    answer.isCorrect;

  let isCorrect;

  if (typeof rawIsCorrect === "boolean") {
    isCorrect = rawIsCorrect;
  } else if (
    rawIsCorrect !== null &&
    rawIsCorrect !== undefined &&
    String(rawIsCorrect).trim() !== ""
  ) {
    isCorrect =
      String(rawIsCorrect).toLowerCase() ===
        "true" ||
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
      answer.marksAwarded ??
      answer.answer_score ??
      answer.score,
    isCorrect ? marks : 0
  );

  return {
    id:
      answer.id ??
      null,

    answerId:
      answer.id ??
      null,

    submissionId:
      answer.submission_id ??
      answer.submissionId ??
      null,

    questionId:
      answer.question_id ??
      answer.question_record_id ??
      answer.questionId ??
      null,

    questionNumber:
      answer.question_number ??
      answer.questionNumber ??
      null,

    question: questionText,

    optionA:
      answer.option_a ??
      answer.optionA ??
      "",

    optionB:
      answer.option_b ??
      answer.optionB ??
      "",

    optionC:
      answer.option_c ??
      answer.optionC ??
      "",

    optionD:
      answer.option_d ??
      answer.optionD ??
      "",

    selectedAnswer,

    studentAnswer:
      selectedAnswer,

    correctAnswer,

    isCorrect,

    marks,

    marksAwarded,

    score:
      marksAwarded,

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
      answer.createdAt ??
      null,
  };
};

/* ============================================================
   NORMALIZE STORED ANSWERS
============================================================ */

const normalizeStoredAnswers = (
  storedAnswers
) => {
  if (
    storedAnswers === null ||
    storedAnswers === undefined ||
    storedAnswers === ""
  ) {
    return [];
  }

  let parsed = storedAnswers;

  try {
    if (
      typeof storedAnswers === "string"
    ) {
      parsed =
        JSON.parse(storedAnswers);
    }
  } catch (error) {
    console.error(
      "❌ Failed to parse stored submission answers:",
      error
    );

    return [];
  }

  if (Array.isArray(parsed)) {
    return parsed;
  }

  if (
    parsed &&
    typeof parsed === "object"
  ) {
    return Object.entries(parsed).map(
      ([
        key,
        value,
      ]) => {
        if (
          value &&
          typeof value === "object"
        ) {
          return {
            ...value,

            questionId:
              value.questionId ??
              value.question_id ??
              key,
          };
        }

        return {
          questionId: key,

          studentAnswer:
            value,
        };
      }
    );
  }

  return [];
};

/* ============================================================
   LOAD SUBMISSION ANSWERS

   IMPORTANT:

   This function first checks academy_assignment_answers.

   If there are no rows there, it falls back to the
   "answer" column of academy_assignment_submissions.

   This fixes older submissions where the answers were stored
   as JSON in the submission but no individual answer records
   were inserted.
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

  /* ==========================================================
     LOAD SUBMISSION
  ========================================================== */

  const submissionResult =
    await client.query(
      `
        SELECT *
        FROM academy_assignment_submissions
        WHERE id = $1
        LIMIT 1
      `,
      [normalizedSubmissionId]
    );

  if (
    submissionResult.rows.length === 0
  ) {
    console.warn(
      "⚠️ Submission not found:",
      normalizedSubmissionId
    );

    return [];
  }

  const submission =
    submissionResult.rows[0];

  /* ==========================================================
     LOAD QUESTIONS
  ========================================================== */

  let questions = [];

  const questionsTableExists =
    await tableExists(
      "academy_assignment_questions",
      client
    );

  if (
    questionsTableExists &&
    submission.assignment_id
  ) {
    const questionResult =
      await client.query(
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
        [submission.assignment_id]
      );

    questions =
      questionResult.rows;
  }

  const questionMap =
    new Map(
      questions.map(
        (question) => [
          String(question.id),
          question,
        ]
      )
    );

  /* ==========================================================
     SOURCE 1:
     academy_assignment_answers
  ========================================================== */

  const answersTableExists =
    await tableExists(
      "academy_assignment_answers",
      client
    );

  if (answersTableExists) {
    const answerColumns =
      await getTableColumns(
        "academy_assignment_answers",
        client
      );

    if (
      answerColumns.submission_id
    ) {
      const selectColumns = [];

      const availableColumns = [
        "id",
        "submission_id",
        "question_id",
        "question_number",
        "student_answer",
        "answer",
        "selected_answer",
        "correct_answer",
        "is_correct",
        "marks_awarded",
        "score",
        "answer_score",
        "explanation",
        "reason",
        "created_at",
      ];

      for (
        const column of availableColumns
      ) {
        if (
          answerColumns[column]
        ) {
          selectColumns.push(
            column
          );
        }
      }

      if (
        selectColumns.length > 0
      ) {
        const answerResult =
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
          "🔎 ANSWER TABLE LOOKUP:",
          {
            submissionId:
              normalizedSubmissionId,

            rowsFound:
              answerResult.rows.length,

            answerIds:
              answerResult.rows.map(
                (row) =>
                  row.id
              ),

            questionIds:
              answerResult.rows.map(
                (row) =>
                  row.question_id
              ),
          }
        );

        if (
          answerResult.rows.length >
          0
        ) {
          return answerResult.rows.map(
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
        }
      }
    }
  }

  /* ==========================================================
     SOURCE 2:
     academy_assignment_submissions.answer
  ========================================================== */

  const storedAnswers =
    normalizeStoredAnswers(
      submission.answer
    );

  if (
    storedAnswers.length === 0
  ) {
    console.warn(
      "⚠️ No answer rows and no usable stored answers:",
      {
        submissionId:
          normalizedSubmissionId,

        submissionAnswer:
          submission.answer
            ? "present"
            : "empty",
      }
    );

    return [];
  }

  /* ==========================================================
     FORMAT FALLBACK ANSWERS
  ========================================================== */

  const formattedAnswers =
    storedAnswers.map(
      (
        answer,
        index
      ) => {
        const questionId =
          answer.questionId ??
          answer.question_id ??
          answer.questionRecordId ??
          answer.question_record_id ??
          answer.id;

        let question =
          questionMap.get(
            String(
              questionId
            )
          );

        /* Match by question number */

        if (
          !question &&
          (
            answer.questionNumber ??
            answer.question_number
          ) !== undefined
        ) {
          const questionNumber =
            Number(
              answer.questionNumber ??
                answer.question_number
            );

          if (
            Number.isFinite(
              questionNumber
            )
          ) {
            question =
              questions[
                questionNumber - 1
              ];
          }
        }

        /* Last fallback: array position */

        if (
          !question &&
          questions[index]
        ) {
          question =
            questions[index];
        }

        const selectedAnswer =
          clean(
            answer.studentAnswer ??
              answer.student_answer ??
              answer.answer ??
              answer.selectedAnswer ??
              answer.selected_answer ??
              answer.value
          );

        const correctAnswer =
          clean(
            answer.correctAnswer ??
              answer.correct_answer ??
              question?.correct_answer
          );

        const marks =
          toNumber(
            answer.marks ??
              answer.question_marks ??
              question?.marks,
            1
          );

        let isCorrect;

        const rawCorrect =
          answer.isCorrect ??
          answer.is_correct;

        if (
          typeof rawCorrect ===
          "boolean"
        ) {
          isCorrect =
            rawCorrect;
        } else if (
          rawCorrect !==
            undefined &&
          rawCorrect !== null &&
          String(
            rawCorrect
          ).trim() !== ""
        ) {
          const value =
            String(
              rawCorrect
            ).toLowerCase();

          isCorrect =
            value === "true" ||
            value === "1";
        } else {
          isCorrect =
            selectedAnswer !== "" &&
            correctAnswer !== "" &&
            selectedAnswer
              .toLowerCase() ===
              correctAnswer
                .toLowerCase();
        }

        const marksAwarded =
          toNumber(
            answer.marksAwarded ??
              answer.marks_awarded ??
              answer.score ??
              answer.answer_score,
            isCorrect
              ? marks
              : 0
          );

        return {
          id:
            answer.id ??
            `stored-${normalizedSubmissionId}-${index + 1}`,

          answerId:
            answer.id ??
            `stored-${normalizedSubmissionId}-${index + 1}`,

          submissionId:
            normalizedSubmissionId,

          questionId:
            question?.id ??
            questionId ??
            null,

          questionNumber:
            answer.questionNumber ??
            answer.question_number ??
            index + 1,

          question:
            clean(
              answer.question ??
                answer.question_text ??
                question?.question ??
                ""
            ),

          optionA:
            answer.optionA ??
            answer.option_a ??
            question?.option_a ??
            "",

          optionB:
            answer.optionB ??
            answer.option_b ??
            question?.option_b ??
            "",

          optionC:
            answer.optionC ??
            answer.option_c ??
            question?.option_c ??
            "",

          optionD:
            answer.optionD ??
            answer.option_d ??
            question?.option_d ??
            "",

          selectedAnswer,

          studentAnswer:
            selectedAnswer,

          correctAnswer,

          isCorrect,

          marks,

          marksAwarded,

          score:
            marksAwarded,

          explanation:
            answer.explanation ??
            answer.reason ??
            "",

          reason:
            answer.reason ??
            answer.explanation ??
            "",

          createdAt:
            answer.createdAt ??
            answer.created_at ??
            submission.submitted_at ??
            submission.created_at ??
            null,
        };
      }
    );

  console.log(
    "✅ FALLBACK ANSWERS LOADED:",
    {
      submissionId:
        normalizedSubmissionId,

      answerCount:
        formattedAnswers.length,

      questionIds:
        formattedAnswers.map(
          (answer) =>
            answer.questionId
        ),
    }
  );

  return formattedAnswers;
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

        data:
          assignments,

        results:
          assignments,

        count:
          assignments.length,
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
        client.release();

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
        client.release();

        return res.status(400).json({
          success: false,
          message:
            "Assignment title is required.",
        });
      }

      if (
        questions.length === 0
      ) {
        client.release();

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

      const assignmentInsertColumns =
        [];

      const assignmentValues =
        [];

      const assignmentParams =
        [];

      const addAssignmentColumn =
        (
          column,
          value
        ) => {
          if (
            assignmentColumns[column]
          ) {
            assignmentInsertColumns.push(
              column
            );

            assignmentValues.push(
              value
            );

            assignmentParams.push(
              `$${assignmentValues.length}`
            );
          }
        };

      addAssignmentColumn(
        "title",
        title
      );

      addAssignmentColumn(
        "description",
        description
      );

      addAssignmentColumn(
        "subject",
        subject
      );

      if (
        assignmentColumns.class_name
      ) {
        addAssignmentColumn(
          "class_name",
          className
        );
      } else if (
        assignmentColumns.class
      ) {
        addAssignmentColumn(
          "class",
          className
        );
      }

      addAssignmentColumn(
        "tutor_reference",
        tutorReference
      );

      if (
        assignmentColumns.duration
      ) {
        addAssignmentColumn(
          "duration",
          duration
        );
      } else if (
        assignmentColumns.duration_minutes
      ) {
        addAssignmentColumn(
          "duration_minutes",
          duration
        );
      }

      if (
        assignmentColumns.due_date
      ) {
        addAssignmentColumn(
          "due_date",
          dueDate
        );
      }

      if (
        assignmentColumns.status
      ) {
        addAssignmentColumn(
          "status",
          "active"
        );
      }

      if (
        assignmentColumns.total_questions
      ) {
        addAssignmentColumn(
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
        addAssignmentColumn(
          "total_marks",
          totalMarks
        );
      }

      const assignmentResult =
        await client.query(
          `
            INSERT INTO academy_assignments
            (
              ${assignmentInsertColumns.join(
                ", "
              )}
            )
            VALUES
            (
              ${assignmentParams.join(
                ", "
              )}
            )
            RETURNING *
          `,
          assignmentValues
        );

      const assignment =
        assignmentResult.rows[0];

      /* ======================================================
         QUESTIONS
      ====================================================== */

      const questionColumns =
        await getTableColumns(
          "academy_assignment_questions",
          client
        );

      for (
        const question of questions
      ) {
        const insertColumns =
          [];

        const values =
          [];

        const params =
          [];

        const addColumn =
          (
            column,
            value
          ) => {
            if (
              questionColumns[column]
            ) {
              insertColumns.push(
                column
              );

              values.push(
                value
              );

              params.push(
                `$${values.length}`
              );
            }
          };

        addColumn(
          "assignment_id",
          assignment.id
        );

        addColumn(
          "question",
          clean(
            question.question
          )
        );

        addColumn(
          "option_a",
          clean(
            question.optionA ??
              question.option_a
          )
        );

        addColumn(
          "option_b",
          clean(
            question.optionB ??
              question.option_b
          )
        );

        addColumn(
          "option_c",
          clean(
            question.optionC ??
              question.option_c
          )
        );

        addColumn(
          "option_d",
          clean(
            question.optionD ??
              question.option_d
          )
        );

        addColumn(
          "correct_answer",
          clean(
            question.correctAnswer ??
              question.correct_answer
          )
        );

        addColumn(
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
              ${insertColumns.join(
                ", "
              )}
            )
            VALUES
            (
              ${params.join(
                ", "
              )}
            )
          `,
          values
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

        data:
          assignments,

        results:
          assignments,

        count:
          assignments.length,
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

      /* ======================================================
         NORMALIZE ANSWERS

         Supports:

         [
           {
             questionId: 1,
             studentAnswer: "A"
           }
         ]

         AND:

         {
           "1": "A",
           "2": "B"
         }
      ====================================================== */

      const rawSubmittedAnswers =
        body.answers ??
        body.answerRecords ??
        body.answer_records ??
        body.responses ??
        body.answersMap ??
        [];

      let submittedAnswers;

      if (
        Array.isArray(
          rawSubmittedAnswers
        )
      ) {
        submittedAnswers =
          rawSubmittedAnswers;
      } else if (
        rawSubmittedAnswers &&
        typeof rawSubmittedAnswers ===
          "object"
      ) {
        submittedAnswers =
          Object.entries(
            rawSubmittedAnswers
          ).map(
            ([
              questionId,
              value,
            ]) => {
              if (
                value &&
                typeof value ===
                  "object"
              ) {
                return {
                  ...value,

                  questionId:
                    value.questionId ??
                    value.question_id ??
                    questionId,
                };
              }

              return {
                questionId,

                studentAnswer:
                  value,
              };
            }
          );
      } else {
        submittedAnswers = [];
      }

      if (!assignmentId) {
        client.release();

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
        client.release();

        return res.status(400).json({
          success: false,
          message:
            "Student enrollment ID or student reference is required.",
        });
      }

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
        client.release();

        return res.status(404).json({
          success: false,
          message:
            "Assignment not found.",
        });
      }

      const assignment =
        assignmentResult.rows[0];

      const questions =
        await getAssignmentQuestions(
          client,
          assignmentId
        );

      const questionMap =
        new Map(
          questions.map(
            (question) => [
              String(question.id),
              question,
            ]
          )
        );

      /* ======================================================
         NORMALIZE ANSWERS AGAINST QUESTIONS
      ====================================================== */

      const normalizedAnswers =
        [];

      for (
        let index = 0;
        index <
        submittedAnswers.length;
        index++
      ) {
        const answer =
          submittedAnswers[index] ||
          {};

        const questionId =
          answer.questionId ??
          answer.question_id ??
          answer.questionRecordId ??
          answer.question_record_id ??
          answer.id;

        let question =
          questionMap.get(
            String(
              questionId
            )
          );

        /* Match by question number */

        if (
          !question &&
          (
            answer.questionNumber ??
            answer.question_number
          ) !== undefined
        ) {
          const questionNumber =
            Number(
              answer.questionNumber ??
                answer.question_number
            );

          if (
            Number.isFinite(
              questionNumber
            )
          ) {
            question =
              questions[
                questionNumber - 1
              ];
          }
        }

        /* Match by position */

        if (
          !question &&
          questions[index]
        ) {
          question =
            questions[index];
        }

        if (!question) {
          console.warn(
            "⚠️ Could not match submitted answer to question:",
            {
              index,
              questionId,
              answer,
            }
          );

          continue;
        }

        const selected =
          clean(
            answer.studentAnswer ??
              answer.student_answer ??
              answer.answer ??
              answer.selectedAnswer ??
              answer.selected_answer ??
              answer.value
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

        normalizedAnswers.push({
          questionId:
            question.id,

          questionNumber:
            index + 1,

          selected,

          correct,

          isCorrect,

          marks,

          marksAwarded:
            isCorrect
              ? marks
              : 0,
        });
      }

      /* ======================================================
         SCORE
      ====================================================== */

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

      await client.query(
        "BEGIN"
      );

      /* ======================================================
         SUBMISSION
      ====================================================== */

      const submissionColumns =
        await getTableColumns(
          "academy_assignment_submissions",
          client
        );

      const insertColumns =
        [];

      const values =
        [];

      const params =
        [];

      const addSubmissionColumn =
        (
          column,
          value
        ) => {
          if (
            submissionColumns[column]
          ) {
            insertColumns.push(
              column
            );

            values.push(
              value
            );

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

      /*
        Save the original answers as JSON.

        This is important because it gives us a second source
        of truth if answer rows are unavailable.
      */

      if (
        submissionColumns.answer
      ) {
        addSubmissionColumn(
          "answer",
          JSON.stringify(
            submittedAnswers
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
        submissionColumns.submitted_at
      ) {
        addSubmissionColumn(
          "submitted_at",
          new Date()
        );
      }

      const submissionResult =
        await client.query(
          `
            INSERT INTO academy_assignment_submissions
            (
              ${insertColumns.join(
                ", "
              )}
            )
            VALUES
            (
              ${params.join(
                ", "
              )}
            )
            RETURNING *
          `,
          values
        );

      const submission =
        submissionResult.rows[0];

      /* ======================================================
         ANSWER RECORDS
      ====================================================== */

      const answersTableExists =
        await tableExists(
          "academy_assignment_answers",
          client
        );

      if (
        answersTableExists &&
        normalizedAnswers.length > 0
      ) {
        const answerColumns =
          await getTableColumns(
            "academy_assignment_answers",
            client
          );

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

          addAnswerColumn(
            "question_number",
            answer.questionNumber
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
            continue;
          }

          /*
            Only use ON CONFLICT if the expected unique
            constraint exists.

            This avoids breaking submission when the database
            does not have a unique constraint on
            (submission_id, question_id).
          */

          let hasUniqueConstraint =
            false;

          try {
            const constraintResult =
              await client.query(
                `
                  SELECT 1
                  FROM pg_constraint c
                  JOIN pg_class t
                    ON t.oid = c.conrelid
                  JOIN pg_attribute a
                    ON a.attrelid = t.oid
                  WHERE t.relname =
                    'academy_assignment_answers'
                    AND c.contype = 'u'
                  GROUP BY c.oid
                  HAVING
                    array_agg(a.attname ORDER BY a.attnum)
                    @>
                    ARRAY[
                      'submission_id',
                      'question_id'
                    ]::text[]
                    AND
                    cardinality(
                      array_agg(
                        a.attname
                        ORDER BY a.attnum
                      )
                    ) = 2
                `
              );

            hasUniqueConstraint =
              constraintResult.rows.length >
              0;
          } catch {
            hasUniqueConstraint =
              false;
          }

          if (
            hasUniqueConstraint
          ) {
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
                ON CONFLICT
                (
                  submission_id,
                  question_id
                )
                DO UPDATE SET
                  student_answer =
                    EXCLUDED.student_answer,
                  correct_answer =
                    EXCLUDED.correct_answer,
                  is_correct =
                    EXCLUDED.is_correct,
                  marks_awarded =
                    EXCLUDED.marks_awarded
              `,
              answerValues
            );
          } else {
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
        }
      }

      await client.query(
        "COMMIT"
      );

      /* ======================================================
         LOAD SAVED ANSWERS
      ====================================================== */

      const savedAnswers =
        await getSubmissionAnswers(
          pool,
          submission.id
        );

      console.log(
        "✅ SUBMISSION SAVED:",
        {
          submissionId:
            submission.id,

          assignmentId,

          submittedAnswerCount:
            submittedAnswers.length,

          normalizedAnswerCount:
            normalizedAnswers.length,

          savedAnswerCount:
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

      const submissions =
        [];

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

      console.log(
        "📄 SINGLE SUBMISSION RESPONSE:",
        {
          submissionId,

          answerCount:
            submission.answerCount,

          answersAvailable:
            submission.answersAvailable,
        }
      );

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
        client.release();

        return res.status(400).json({
          success: false,
          message:
            "Assignment ID and submission ID are required.",
        });
      }

      if (!tutorReference) {
        client.release();

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
        client.release();

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
        client.release();

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

      const updates =
        [];

      const values =
        [];

      const params =
        [];

      const addUpdate =
        (
          column,
          value
        ) => {
          if (
            columns[column]
          ) {
            values.push(
              value
            );

            params.push(
              `$${values.length}`
            );

            updates.push(
              `${column} = ${params[params.length - 1]}`
            );
          }
        };

      if (
        columns.status
      ) {
        addUpdate(
          "status",
          "released"
        );
      }

      if (
        columns.feedback
      ) {
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
        client.release();

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
          SET ${updates.join(
            ", "
          )}
          WHERE id = ${params[params.length - 1]}
        `,
        values
      );

      await client.query(
        "COMMIT"
      );

      return res.json({
        success: true,

        message:
          "Assignment result released successfully.",
      });
    } catch (error) {
      try {
        await client.query(
          "ROLLBACK"
        );
      } catch {}

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

        answerCount:
          answers.length,

        answersAvailable:
          answers.length > 0,

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
   EXPORT
============================================================ */

export default router;
