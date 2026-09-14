import express from "express";
import pool from "../lib/db.js";

const router = express.Router();

/*
|--------------------------------------------------------------------------
| Helpers
|--------------------------------------------------------------------------
*/

function clean(value) {
  if (value === undefined || value === null) {
    return "";
  }

  return String(value).trim();
}

function getTutorReference(req) {
  return clean(
    req.body?.tutorReference ||
      req.body?.tutor_reference ||
      req.query?.tutorReference ||
      req.query?.tutor_reference ||
      req.headers["x-tutor-reference"]
  );
}

/*
|--------------------------------------------------------------------------
| GET /messages
|
| Get all private conversations belonging to the tutor
|--------------------------------------------------------------------------
*/

router.get("/messages", async (req, res) => {
  try {
    const tutorReference = getTutorReference(req);

    if (!tutorReference) {
      return res.status(400).json({
        success: false,
        error: "Tutor reference is required.",
      });
    }

    const result = await pool.query(
      `
      SELECT
        c.id,

        c.student_reference AS student_id,
        c.student_reference,

        c.student_name,
        c.student_avatar,

        c.class_name,
        c.subject,

        c.last_message,
        c.last_message_at,

        c.unread_count_tutor AS unread_count,

        c.created_at,
        c.updated_at

      FROM academy_tutor_student_conversations c

      WHERE LOWER(TRIM(c.tutor_reference)) =
            LOWER(TRIM($1))

      ORDER BY
        c.last_message_at DESC NULLS LAST,
        c.updated_at DESC NULLS LAST,
        c.id DESC
      `,
      [tutorReference]
    );

    return res.json({
      success: true,
      conversations: result.rows,
    });
  } catch (error) {
    console.error(
      "GET /tutor/messages error:",
      error
    );

    return res.status(500).json({
      success: false,
      error: "Unable to load student messages.",
      details: error.message,
    });
  }
});

/*
|--------------------------------------------------------------------------
| GET /messages/:conversationId
|
| Get all messages inside one private conversation
|--------------------------------------------------------------------------
*/

router.get("/messages/:conversationId", async (req, res) => {
  try {
    const tutorReference = getTutorReference(req);

    const conversationId = clean(
      req.params.conversationId
    );

    if (!tutorReference) {
      return res.status(400).json({
        success: false,
        error: "Tutor reference is required.",
      });
    }

    if (!conversationId) {
      return res.status(400).json({
        success: false,
        error: "Conversation ID is required.",
      });
    }

    const conversationResult = await pool.query(
      `
      SELECT
        id,
        tutor_reference,
        student_reference,
        student_name,
        student_avatar,
        class_name,
        subject
      FROM academy_tutor_student_conversations
      WHERE id = $1
        AND LOWER(TRIM(tutor_reference)) =
            LOWER(TRIM($2))
      LIMIT 1
      `,
      [conversationId, tutorReference]
    );

    if (conversationResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Conversation not found.",
      });
    }

    const result = await pool.query(
      `
      SELECT
        id,

        sender_type,
        sender_reference,

        sender_type AS role,
        sender_reference AS sender_id,

        message,
        message AS content,

        is_read,
        is_read AS read,

        created_at
      FROM academy_tutor_student_messages

      WHERE conversation_id = $1

      ORDER BY created_at ASC, id ASC
      `,
      [conversationId]
    );

    /*
    |--------------------------------------------------------------------------
    | Mark student messages as read by tutor
    |--------------------------------------------------------------------------
    */

    await pool.query(
      `
      UPDATE academy_tutor_student_messages
      SET is_read = TRUE
      WHERE conversation_id = $1
        AND LOWER(sender_type) = 'student'
        AND is_read = FALSE
      `,
      [conversationId]
    );

    /*
    |--------------------------------------------------------------------------
    | Reset tutor unread count
    |--------------------------------------------------------------------------
    */

    await pool.query(
      `
      UPDATE academy_tutor_student_conversations
      SET
        unread_count_tutor = 0,
        updated_at = NOW()
      WHERE id = $1
        AND LOWER(TRIM(tutor_reference)) =
            LOWER(TRIM($2))
      `,
      [conversationId, tutorReference]
    );

    return res.json({
      success: true,
      conversation: conversationResult.rows[0],
      messages: result.rows,
    });
  } catch (error) {
    console.error(
      "GET /tutor/messages/:conversationId error:",
      error
    );

    return res.status(500).json({
      success: false,
      error: "Unable to load conversation messages.",
      details: error.message,
    });
  }
});

/*
|--------------------------------------------------------------------------
| POST /messages/:conversationId
|
| Tutor sends a private message to a student
|--------------------------------------------------------------------------
*/

router.post("/messages/:conversationId", async (req, res) => {
  try {
    const tutorReference = getTutorReference(req);

    const conversationId = clean(
      req.params.conversationId
    );

    const message = clean(
      req.body?.message ||
        req.body?.content ||
        req.body?.text
    );

    if (!tutorReference) {
      return res.status(400).json({
        success: false,
        error: "Tutor reference is required.",
      });
    }

    if (!conversationId) {
      return res.status(400).json({
        success: false,
        error: "Conversation ID is required.",
      });
    }

    if (!message) {
      return res.status(400).json({
        success: false,
        error: "Message cannot be empty.",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | Verify conversation belongs to tutor
    |--------------------------------------------------------------------------
    */

    const conversationResult = await pool.query(
      `
      SELECT
        id,
        tutor_reference,
        student_reference,
        student_name,
        student_avatar,
        class_name,
        subject
      FROM academy_tutor_student_conversations

      WHERE id = $1
        AND LOWER(TRIM(tutor_reference)) =
            LOWER(TRIM($2))

      LIMIT 1
      `,
      [conversationId, tutorReference]
    );

    if (conversationResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Conversation not found.",
      });
    }

    const conversation =
      conversationResult.rows[0];

    /*
    |--------------------------------------------------------------------------
    | Insert message
    |--------------------------------------------------------------------------
    */

    const result = await pool.query(
      `
      INSERT INTO academy_tutor_student_messages (
        conversation_id,
        tutor_reference,
        student_reference,
        sender_type,
        sender_reference,
        message,
        is_read,
        created_at
      )

      VALUES (
        $1,
        $2,
        $3,
        'tutor',
        $2,
        $4,
        FALSE,
        NOW()
      )

      RETURNING
        id,
        conversation_id,

        sender_type,
        sender_reference,

        message,
        message AS content,

        is_read,
        is_read AS read,

        created_at
      `,
      [
        conversationId,
        tutorReference,
        conversation.student_reference,
        message,
      ]
    );

    /*
    |--------------------------------------------------------------------------
    | Update conversation
    |--------------------------------------------------------------------------
    */

    await pool.query(
      `
      UPDATE academy_tutor_student_conversations

      SET
        last_message = $1,
        last_message_at = NOW(),
        unread_count_student =
          COALESCE(unread_count_student, 0) + 1,
        updated_at = NOW()

      WHERE id = $2
      `,
      [message, conversationId]
    );

    const createdMessage = result.rows[0];

    return res.status(201).json({
      success: true,
      message: createdMessage,
      data: createdMessage,
    });
  } catch (error) {
    console.error(
      "POST /tutor/messages/:conversationId error:",
      error
    );

    return res.status(500).json({
      success: false,
      error: "Unable to send message.",
      details: error.message,
    });
  }
});

/*
|--------------------------------------------------------------------------
| POST /messages/start
|
| Create or find a private tutor/student conversation.
|
| This is useful when the student sends the tutor a message
| for the first time.
|--------------------------------------------------------------------------
*/

router.post("/messages/start", async (req, res) => {
  try {
    const tutorReference = getTutorReference(req);

    const studentReference = clean(
      req.body?.studentReference ||
        req.body?.student_reference ||
        req.body?.studentId ||
        req.body?.student_id
    );

    const studentName = clean(
      req.body?.studentName ||
        req.body?.student_name ||
        req.body?.name
    );

    const studentAvatar = clean(
      req.body?.studentAvatar ||
        req.body?.student_avatar ||
        req.body?.avatar ||
        req.body?.profileImage
    );

    const className = clean(
      req.body?.className ||
        req.body?.class_name ||
        req.body?.grade
    );

    const subject = clean(
      req.body?.subject ||
        req.body?.subject_name
    );

    if (!tutorReference) {
      return res.status(400).json({
        success: false,
        error: "Tutor reference is required.",
      });
    }

    if (!studentReference) {
      return res.status(400).json({
        success: false,
        error: "Student reference is required.",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | Find existing conversation
    |--------------------------------------------------------------------------
    */

    const existing = await pool.query(
      `
      SELECT *
      FROM academy_tutor_student_conversations

      WHERE LOWER(TRIM(tutor_reference)) =
            LOWER(TRIM($1))

        AND LOWER(TRIM(student_reference)) =
            LOWER(TRIM($2))

      LIMIT 1
      `,
      [tutorReference, studentReference]
    );

    if (existing.rows.length > 0) {
      return res.json({
        success: true,
        conversation: existing.rows[0],
        created: false,
      });
    }

    /*
    |--------------------------------------------------------------------------
    | Create new conversation
    |--------------------------------------------------------------------------
    */

    const result = await pool.query(
      `
      INSERT INTO academy_tutor_student_conversations (
        tutor_reference,
        student_reference,
        student_name,
        student_avatar,
        class_name,
        subject,
        last_message,
        last_message_at,
        unread_count_tutor,
        unread_count_student,
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
        NULL,
        NULL,
        0,
        0,
        NOW(),
        NOW()
      )

      RETURNING *
      `,
      [
        tutorReference,
        studentReference,
        studentName || "Student",
        studentAvatar || null,
        className || null,
        subject || null,
      ]
    );

    return res.status(201).json({
      success: true,
      conversation: result.rows[0],
      created: true,
    });
  } catch (error) {
    console.error(
      "POST /tutor/messages/start error:",
      error
    );

    return res.status(500).json({
      success: false,
      error: "Unable to create conversation.",
      details: error.message,
    });
  }
});

export default router;