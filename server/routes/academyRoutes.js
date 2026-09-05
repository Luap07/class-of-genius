import express from "express";
import crypto from "crypto";
import bcrypt from "bcrypt";
import pool from "../lib/db.js";
import { Resend } from "resend";

const router = express.Router();

/* =========================================================
   EMAIL CONFIGURATION
   ---------------------------------------------------------
   Resend is still used ONLY for:
   - New student enrollment notification to admin
   - New tutor application notification to admin

   It is NOT used for account verification.
========================================================= */

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const RESEND_FROM_EMAIL =
  process.env.RESEND_FROM_EMAIL ||
  "Scholiqen <onboarding@resend.dev>";

const ACADEMY_EMAIL =
  process.env.ACADEMY_EMAIL ||
  process.env.CONTACT_EMAIL ||
  "scholiqen@gmail.com";

/* =========================================================
   URL CONFIGURATION
========================================================= */

const FRONTEND_URL = (
  process.env.FRONTEND_URL ||
  "http://localhost:5173"
).replace(/\/$/, "");

const BACKEND_URL = (
  process.env.BACKEND_URL ||
  process.env.API_URL ||
  "http://localhost:5000"
).replace(/\/$/, "");

/* =========================================================
   ACCEPTANCE FEE
========================================================= */

const ACCEPTANCE_FEE = {
  amount: 2000,
  bank: "Opay",
  accountNumber: "8104264197",
  accountName: "Komolafe Damilare Paul",
};

/* =========================================================
   PRIMARY GRADES
========================================================= */

const PRIMARY_GRADES = [
  "Primary 1",
  "Primary 2",
  "Primary 3",
  "Primary 4",
  "Primary 5",
  "Primary 6",
];

/* =========================================================
   SECONDARY CLASSES
========================================================= */

const SECONDARY_CLASSES = [
  "JSS 1",
  "JSS 2",
  "JSS 3",
  "SS 1",
  "SS 2",
  "SS 3",
];

/* =========================================================
   PRIMARY SUBJECTS
========================================================= */

const PRIMARY_BASIC_SUBJECTS = [
  "English Studies",
  "Mathematics",
  "Basic Science",
  "Basic Technology",
  "Social Studies",
  "Civic Education",
  "Security Education",
  "Computer Studies",
  "Cultural and Creative Arts",
  "Physical and Health Education",
  "Religious Studies",
];

const PRIMARY_UPPER_SUBJECTS = [
  ...PRIMARY_BASIC_SUBJECTS,
  "Agricultural Science",
  "Home Economics",
];

/* =========================================================
   JUNIOR SECONDARY SUBJECTS
========================================================= */

const JUNIOR_SUBJECTS = [
  "English Language",
  "Mathematics",
  "Basic Science",
  "Basic Technology",
  "Social Studies",
  "Civic Education",
  "Security Education",
  "Computer Studies",
  "Business Studies",
  "Home Economics",
  "Agricultural Science",
  "Cultural and Creative Arts",
  "Physical and Health Education",
  "Christian Religious Studies",
  "Islamic Religious Studies",
  "French",
];

/* =========================================================
   SENIOR SECONDARY SUBJECTS
========================================================= */

const SENIOR_SUBJECTS = [
  "English Language",
  "General Mathematics",
  "Further Mathematics",
  "Biology",
  "Chemistry",
  "Physics",
  "Agricultural Science",
  "Economics",
  "Government",
  "Geography",
  "Literature in English",
  "Commerce",
  "Financial Accounting",
  "Marketing",
  "Data Processing",
  "Computer Studies",
  "Civic Education",
  "Christian Religious Studies",
  "Islamic Religious Studies",
  "French",
  "Technical Drawing",
  "Food and Nutrition",
  "Home Management",
  "Yoruba",
  "Igbo",
  "Hausa",
];

/* =========================================================
   SUBJECTS BY CLASS
========================================================= */

const SUBJECTS_BY_CLASS = {
  "Primary 1": PRIMARY_BASIC_SUBJECTS,
  "Primary 2": PRIMARY_BASIC_SUBJECTS,

  "Primary 3": PRIMARY_UPPER_SUBJECTS,
  "Primary 4": PRIMARY_UPPER_SUBJECTS,
  "Primary 5": PRIMARY_UPPER_SUBJECTS,
  "Primary 6": PRIMARY_UPPER_SUBJECTS,

  "JSS 1": JUNIOR_SUBJECTS,
  "JSS 2": JUNIOR_SUBJECTS,
  "JSS 3": JUNIOR_SUBJECTS,

  "SS 1": SENIOR_SUBJECTS,
  "SS 2": SENIOR_SUBJECTS,
  "SS 3": SENIOR_SUBJECTS,
};

/* =========================================================
   NIGERIAN STATES
========================================================= */

const NIGERIAN_STATES = [
  "Abia",
  "Adamawa",
  "Akwa Ibom",
  "Anambra",
  "Bauchi",
  "Bayelsa",
  "Benue",
  "Borno",
  "Cross River",
  "Delta",
  "Ebonyi",
  "Edo",
  "Ekiti",
  "Enugu",
  "Gombe",
  "Imo",
  "Jigawa",
  "Kaduna",
  "Kano",
  "Katsina",
  "Kebbi",
  "Kogi",
  "Kwara",
  "Lagos",
  "Nasarawa",
  "Niger",
  "Ogun",
  "Ondo",
  "Osun",
  "Oyo",
  "Plateau",
  "Rivers",
  "Sokoto",
  "Taraba",
  "Yobe",
  "Zamfara",
  "Federal Capital Territory",
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

function normalizeEmail(value) {
  return clean(value).toLowerCase();
}

function normalizeSubject(value) {
  return clean(value)
    .replace(/\s+/g, " ")
    .toLowerCase();
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

  if (!value) {
    return [];
  }

  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);

      if (Array.isArray(parsed)) {
        return uniqueArray(parsed);
      }
    } catch {
      // Continue.
    }

    return uniqueArray(
      value
        .split(",")
        .map((item) => item.trim())
    );
  }

  return [];
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
    email
  );
}

function booleanValue(value) {
  return (
    value === true ||
    value === "true" ||
    value === 1 ||
    value === "1"
  );
}

function generateEnrollmentReference() {
  const year = new Date()
    .getFullYear();

  const random =
    crypto
      .randomBytes(4)
      .toString("hex")
      .toUpperCase();

  return `SCH-${year}-${random}`;
}

function generatePaymentReference() {
  const timestamp =
    Date.now();

  const random =
    crypto
      .randomBytes(3)
      .toString("hex")
      .toUpperCase();

  return `SFP-${timestamp}-${random}`;
}

function generateTutorReference() {
  const timestamp =
    Date.now()
      .toString()
      .slice(-6);

  const random =
    crypto
      .randomBytes(2)
      .toString("hex")
      .toUpperCase();

  return `SQA-${timestamp}-${random}`;
}

function isValidGradeForLevel(
  schoolLevel,
  grade
) {
  if (schoolLevel === "Primary") {
    return PRIMARY_GRADES.includes(
      grade
    );
  }

  if (schoolLevel === "Secondary") {
    return SECONDARY_CLASSES.includes(
      grade
    );
  }

  return false;
}

function getClassSubjects(grade) {
  return SUBJECTS_BY_CLASS[grade] || [];
}

function getDatabaseError(error) {
  return {
    message: error?.message || null,
    code: error?.code || null,
    detail: error?.detail || null,
    hint: error?.hint || null,
    table: error?.table || null,
    column: error?.column || null,
    constraint: error?.constraint || null,
    where: error?.where || null,
    schema: error?.schema || null,
  };
}

function escapeHtml(value) {
  return clean(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function normalizeStatus(value) {
  return clean(value)
    .toLowerCase()
    .replace(/[\s-]+/g, "_");
}

function isPaymentSubmittedOrPaid(
  paymentStatus
) {
  const status =
    normalizeStatus(
      paymentStatus
    );

  return [
    "submitted",
    "paid",
    "successful",
    "success",
    "completed",
    "verified",
    "payment_verified",
  ].includes(status);
}

/* =========================================================
   SUBJECT MATCHING
   ---------------------------------------------------------
   Handles common naming differences between Primary,
   Junior Secondary and Senior Secondary subjects.

   Examples:

     Mathematics
     General Mathematics

   and:

     English Studies
     English Language
========================================================= */

function subjectsMatch(
  first,
  second
) {
  const a =
    normalizeSubject(first);

  const b =
    normalizeSubject(second);

  if (!a || !b) {
    return false;
  }

  if (a === b) {
    return true;
  }

  const aliases = {
    mathematics: [
      "general mathematics",
    ],

    "general mathematics": [
      "mathematics",
    ],

    "english studies": [
      "english language",
    ],

    "english language": [
      "english studies",
    ],
  };

  return (
    aliases[a]?.includes(b) ||
    aliases[b]?.includes(a) ||
    false
  );
}

/* =========================================================
   HEALTH
========================================================= */

router.get(
  "/health",
  async (req, res) => {
    res.json({
      success: true,
      service: "academy",
      timestamp: new Date().toISOString(),
    });
  }
);

/* =========================================================
   STUDENT ENROLLMENT
========================================================= */

router.post(
  "/student-enrollment",
  async (req, res) => {
    try {
      const body = req.body || {};

      const firstName =
        clean(body.firstName);

      const middleName =
        clean(body.middleName);

      const lastName =
        clean(body.lastName);

      const dateOfBirth =
        clean(body.dateOfBirth);

      const gender =
        clean(body.gender);

      const studentPhone =
        clean(
          body.studentPhone ||
          body.phone
        );

      const email =
        normalizeEmail(body.email);

      const schoolLevel =
        clean(body.schoolLevel);

      const grade =
        clean(body.grade);

      const academicSession =
        clean(body.academicSession);

      const state =
        clean(body.state);

      const city =
        clean(body.city);

      const subjects =
        arrayFromValue(
          body.subjects
        );

      const guardianFirstName =
        clean(
          body.guardianFirstName
        );

      const guardianLastName =
        clean(
          body.guardianLastName
        );

      const guardianRelationship =
        clean(
          body.guardianRelationship
        );

      const guardianPhone =
        clean(
          body.guardianPhone
        );

      const guardianEmail =
        normalizeEmail(
          body.guardianEmail
        );

      /* =====================================================
         REQUIRED FIELDS
      ===================================================== */

      if (!firstName) {
        return res.status(400).json({
          message:
            "First name is required.",
        });
      }

      if (!lastName) {
        return res.status(400).json({
          message:
            "Last name is required.",
        });
      }

      if (
        !email ||
        !isValidEmail(email)
      ) {
        return res.status(400).json({
          message:
            "A valid email address is required.",
        });
      }

      if (!schoolLevel) {
        return res.status(400).json({
          message:
            "School level is required.",
        });
      }

      if (!grade) {
        return res.status(400).json({
          message:
            "Class is required.",
        });
      }

      if (
        !isValidGradeForLevel(
          schoolLevel,
          grade
        )
      ) {
        return res.status(400).json({
          message:
            `Invalid class "${grade}" for ${schoolLevel}.`,
        });
      }

      /* =====================================================
         SUBJECT VALIDATION
      ===================================================== */

      const allowedSubjects =
        getClassSubjects(grade);

      const normalizedAllowedSubjects =
        new Set(
          allowedSubjects.map(
            normalizeSubject
          )
        );

      const validSubjects =
        subjects.filter(
          (subject) =>
            normalizedAllowedSubjects.has(
              normalizeSubject(subject)
            )
        );

      if (!validSubjects.length) {
        return res.status(400).json({
          message:
            "Please select at least one valid subject.",
          availableSubjects:
            allowedSubjects,
        });
      }

      /* =====================================================
         STATE VALIDATION
      ===================================================== */

      if (
        state &&
        !NIGERIAN_STATES.includes(state)
      ) {
        return res.status(400).json({
          message:
            "Invalid Nigerian state.",
        });
      }

      /* =====================================================
         DUPLICATE EMAIL
      ===================================================== */

      const duplicate =
        await pool.query(
          `
          SELECT
            enrollment_id,
            enrollment_status,
            email_verified
          FROM academy_student_enrollments
          WHERE LOWER(email) = LOWER($1)
          LIMIT 1
          `,
          [email]
        );

      if (duplicate.rows.length) {
        const existing =
          duplicate.rows[0];

        return res.status(409).json({
          message:
            "A student enrollment already exists for this email address.",
          enrollmentId:
            existing.enrollment_id,
          status:
            existing.enrollment_status,
          emailVerified:
            existing.email_verified,
        });
      }

      /* =====================================================
         CREATE ENROLLMENT ID
      ===================================================== */

      const enrollmentId =
        generateEnrollmentReference();

      /* =====================================================
         INSERT
      ===================================================== */

      const result =
        await pool.query(
          `
          INSERT INTO academy_student_enrollments (
            enrollment_id,
            first_name,
            middle_name,
            last_name,
            date_of_birth,
            gender,
            student_phone,
            email,
            school_level,
            grade,
            academic_session,
            state,
            city,
            subjects,
            guardian_first_name,
            guardian_last_name,
            guardian_relationship,
            guardian_phone,
            guardian_email,
            enrollment_status,
            payment_status,
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
            $15,
            $16,
            $17,
            $18,
            $19,
            'pending',
            'pending',
            'pending',
            FALSE,
            NOW(),
            NOW()
          )
          RETURNING *
          `,
          [
            enrollmentId,
            firstName,
            middleName || null,
            lastName,
            dateOfBirth || null,
            gender || null,
            studentPhone || null,
            email,
            schoolLevel,
            grade,
            academicSession || null,
            state || null,
            city || null,
            JSON.stringify(
              validSubjects
            ),
            guardianFirstName ||
              null,
            guardianLastName ||
              null,
            guardianRelationship ||
              null,
            guardianPhone ||
              null,
            guardianEmail ||
              null,
          ]
        );

      /* =====================================================
         ADMIN EMAIL
      ===================================================== */

      if (resend) {
        try {
          await resend.emails.send({
            from: RESEND_FROM_EMAIL,
            to: [ACADEMY_EMAIL],
            subject:
              `New Scholiqen Student Enrollment - ${enrollmentId}`,

            html: `
              <h2>New Student Enrollment</h2>

              <p>
                A new student has submitted
                an Academy enrollment.
              </p>

              <p>
                <strong>Name:</strong>
                ${escapeHtml(
                  `${firstName} ${lastName}`
                )}
              </p>

              <p>
                <strong>Email:</strong>
                ${escapeHtml(email)}
              </p>

              <p>
                <strong>Class:</strong>
                ${escapeHtml(grade)}
              </p>

              <p>
                <strong>School Level:</strong>
                ${escapeHtml(schoolLevel)}
              </p>

              <p>
                <strong>Enrollment ID:</strong>
                ${escapeHtml(enrollmentId)}
              </p>
            `,
          });
        } catch (emailError) {
          console.error(
            "Student admin email error:",
            emailError
          );
        }
      }

      return res.status(201).json({
        success: true,
        message:
          "Student enrollment submitted successfully.",
        enrollment:
          result.rows[0],
        acceptanceFee:
          ACCEPTANCE_FEE,
      });

    } catch (error) {
      console.error(
        "Student enrollment error:",
        getDatabaseError(error)
      );

      return res.status(500).json({
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
  async (req, res) => {
    try {
      const {
        enrollmentId,
        paymentReference:
          suppliedPaymentReference,
        email,
        amount,
      } = req.body || {};

      const normalizedEmail =
        normalizeEmail(email);

      const numericAmount =
        Number(amount);

      if (!enrollmentId) {
        return res.status(400).json({
          message:
            "Enrollment ID is required.",
        });
      }

      if (
        !numericAmount ||
        numericAmount !==
          ACCEPTANCE_FEE.amount
      ) {
        return res.status(400).json({
          message:
            `Acceptance fee must be ₦${ACCEPTANCE_FEE.amount}.`,
        });
      }

      if (
        normalizedEmail &&
        !isValidEmail(
          normalizedEmail
        )
      ) {
        return res.status(400).json({
          message:
            "Invalid email address.",
        });
      }

      const studentResult =
        await pool.query(
          `
          SELECT
            enrollment_id,
            first_name,
            last_name,
            email,
            payment_status
          FROM academy_student_enrollments
          WHERE enrollment_id = $1
          LIMIT 1
          `,
          [enrollmentId]
        );

      if (
        !studentResult.rows.length
      ) {
        return res.status(404).json({
          message:
            "Student enrollment not found.",
        });
      }

      const student =
        studentResult.rows[0];

      if (
        normalizedEmail &&
        normalizeEmail(
          student.email
        ) !== normalizedEmail
      ) {
        return res.status(400).json({
          message:
            "The email does not match the enrollment.",
        });
      }

      const paymentReference =
        suppliedPaymentReference ||
        generatePaymentReference();

      await pool.query(
        `
        INSERT INTO academy_payments (
          payment_reference,
          enrollment_id,
          email,
          amount,
          payment_type,
          payment_status,
          created_at,
          updated_at
        )
        VALUES (
          $1,
          $2,
          $3,
          $4,
          'acceptance_fee',
          'pending',
          NOW(),
          NOW()
        )
        `,
        [
          paymentReference,
          enrollmentId,
          student.email,
          numericAmount,
        ]
      );

      await pool.query(
        `
        UPDATE academy_student_enrollments
        SET
          payment_status = 'submitted',
          payment_reference = $1,
          updated_at = NOW()
        WHERE enrollment_id = $2
        `,
        [
          paymentReference,
          enrollmentId,
        ]
      );

      return res.status(201).json({
        success: true,
        message:
          "Payment submission received and is awaiting confirmation.",
        paymentReference,
        amount:
          numericAmount,
        paymentStatus:
          "submitted",
      });

    } catch (error) {
      console.error(
        "Acceptance fee error:",
        getDatabaseError(error)
      );

      return res.status(500).json({
        message:
          "Unable to submit acceptance fee.",
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
   ADMIN - STUDENTS
========================================================= */

router.get(
  "/admin/enrollments",
  async (req, res) => {
    try {
      const result =
        await pool.query(
          `
          SELECT *
          FROM academy_student_enrollments
          ORDER BY created_at DESC
          `
        );

      return res.json({
        success: true,
        enrollments:
          result.rows,
      });

    } catch (error) {
      console.error(
        "Admin enrollments error:",
        getDatabaseError(error)
      );

      return res.status(500).json({
        message:
          "Unable to load student enrollments.",
      });
    }
  }
);

/* =========================================================
   ADMIN - TUTORS
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

      return res.json({
        success: true,
        tutors:
          result.rows,
      });

    } catch (error) {
      console.error(
        "Admin tutors error:",
        getDatabaseError(error)
      );

      return res.status(500).json({
        message:
          "Unable to load tutor applications.",
      });
    }
  }
);

/* =========================================================
   ADMIN - SINGLE STUDENT
========================================================= */

router.get(
  "/admin/enrollment/:enrollmentId",
  async (req, res) => {
    try {
      const {
        enrollmentId,
      } = req.params;

      const result =
        await pool.query(
          `
          SELECT *
          FROM academy_student_enrollments
          WHERE enrollment_id = $1
          LIMIT 1
          `,
          [enrollmentId]
        );

      if (!result.rows.length) {
        return res.status(404).json({
          message:
            "Student enrollment not found.",
        });
      }

      return res.json({
        success: true,
        enrollment:
          result.rows[0],
      });

    } catch (error) {
      console.error(
        "Single student error:",
        getDatabaseError(error)
      );

      return res.status(500).json({
        message:
          "Unable to load student enrollment.",
      });
    }
  }
);

/* =========================================================
   ADMIN - SINGLE TUTOR
========================================================= */

router.get(
  "/admin/tutor/:reference",
  async (req, res) => {
    try {
      const {
        reference,
      } = req.params;

      const result =
        await pool.query(
          `
          SELECT *
          FROM academy_tutor_applications
          WHERE reference = $1
          LIMIT 1
          `,
          [reference]
        );

      if (!result.rows.length) {
        return res.status(404).json({
          message:
            "Tutor application not found.",
        });
      }

      return res.json({
        success: true,
        tutor:
          result.rows[0],
      });

    } catch (error) {
      console.error(
        "Single tutor error:",
        getDatabaseError(error)
      );

      return res.status(500).json({
        message:
          "Unable to load tutor application.",
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
        clean(body.firstName);

      const middleName =
        clean(body.middleName);

      const lastName =
        clean(body.lastName);

      const email =
        normalizeEmail(body.email);

      const phone =
        clean(body.phone);

      const gender =
        clean(body.gender);

      const dateOfBirth =
        clean(body.dateOfBirth);

      const state =
        clean(body.state);

      const city =
        clean(body.city);

      const qualification =
        clean(body.qualification);

      const specialization =
        clean(body.specialization);

      const experience =
        clean(body.experience);

      const subjects =
        arrayFromValue(
          body.subjects
        );

      const classes =
        arrayFromValue(
          body.classes ||
          body.levels
        );

      const bio =
        body.bio || {};

      /* =====================================================
         VALIDATION
      ===================================================== */

      if (!firstName) {
        return res.status(400).json({
          message:
            "First name is required.",
        });
      }

      if (!lastName) {
        return res.status(400).json({
          message:
            "Last name is required.",
        });
      }

      if (
        !email ||
        !isValidEmail(email)
      ) {
        return res.status(400).json({
          message:
            "A valid email address is required.",
        });
      }

      if (!phone) {
        return res.status(400).json({
          message:
            "Phone number is required.",
        });
      }

      if (!qualification) {
        return res.status(400).json({
          message:
            "Qualification is required.",
        });
      }

      /* =====================================================
         DUPLICATE
      ===================================================== */

      const duplicate =
        await pool.query(
          `
          SELECT
            reference,
            application_status,
            email_verified
          FROM academy_tutor_applications
          WHERE LOWER(email) = LOWER($1)
          LIMIT 1
          `,
          [email]
        );

      if (duplicate.rows.length) {
        const existing =
          duplicate.rows[0];

        return res.status(409).json({
          success: false,
          code: "ALREADY_REGISTERED",
          message:
            "A tutor application already exists for this email address. Please sign in using your name and reference ID.",
          reference:
            existing.reference,
          status:
            existing.application_status,
          emailVerified:
            existing.email_verified,
        });
      }

      /* =====================================================
         GENERATE REFERENCE
         -----------------------------------------------------
         THIS REFERENCE ID BECOMES THE TUTOR'S PASSWORD.
      ===================================================== */

      const reference =
        generateTutorReference();

      /* =====================================================
         INSERT TUTOR
      ===================================================== */

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
            $16::jsonb,
            'pending',
            'pending',
            FALSE,
            NOW(),
            NOW()
          )
          RETURNING *
          `,
          [
            reference,
            firstName,
            middleName || null,
            lastName,
            email,
            phone,
            gender || null,
            dateOfBirth || null,
            state || null,
            city || null,
            qualification,
            specialization || null,
            experience || null,
            JSON.stringify(subjects),
            JSON.stringify(classes),
            JSON.stringify(bio),
          ]
        );

      /* =====================================================
         ADMIN EMAIL
      ===================================================== */

      if (resend) {
        try {
          await resend.emails.send({
            from: RESEND_FROM_EMAIL,
            to: [ACADEMY_EMAIL],
            subject:
              `New Scholiqen Tutor Application - ${reference}`,

            html: `
              <h2>New Tutor Application</h2>

              <p>
                A new tutor application
                has been submitted.
              </p>

              <p>
                <strong>Name:</strong>
                ${escapeHtml(
                  `${firstName} ${lastName}`
                )}
              </p>

              <p>
                <strong>Email:</strong>
                ${escapeHtml(email)}
              </p>

              <p>
                <strong>Qualification:</strong>
                ${escapeHtml(
                  qualification
                )}
              </p>

              <p>
                <strong>Reference:</strong>
                ${escapeHtml(reference)}
              </p>
            `,
          });
        } catch (emailError) {
          console.error(
            "Tutor admin email error:",
            emailError
          );
        }
      }

      /* =====================================================
         RESPONSE
      ===================================================== */

      return res.status(201).json({
        success: true,

        message:
          "Tutor application submitted successfully.",

        reference,

        tutor:
          result.rows[0],
      });

    } catch (error) {
      console.error(
        "Tutor application error:",
        getDatabaseError(error)
      );

      if (
        error?.code === "23505"
      ) {
        return res.status(409).json({
          success: false,
          code: "ALREADY_REGISTERED",
          message:
            "A tutor application already exists. Please sign in using your name and reference ID.",
        });
      }

      return res.status(500).json({
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
   ---------------------------------------------------------
   LOGIN CREDENTIALS:

   Full Name:
     first_name + middle_name + last_name

   Password:
     reference

   IMPORTANT:
   - No separate password is required.
   - No bcrypt password is required.
   - No email verification is required.
   - Tutor must have application_status = verified.
   - account_status is NOT checked.
========================================================= */

router.post(
  "/tutor-login",
  async (req, res) => {
    try {
      const name =
        clean(req.body?.name);

      const referenceId =
        clean(
          req.body?.referenceId ||
          req.body?.reference
        );

      /* =====================================================
         VALIDATION
      ===================================================== */

      if (!name) {
        return res.status(400).json({
          success: false,
          message:
            "Please enter your registered full name.",
        });
      }

      if (!referenceId) {
        return res.status(400).json({
          success: false,
          message:
            "Please enter your reference ID.",
        });
      }

      /* =====================================================
         FIND VERIFIED TUTOR
      ===================================================== */

      const result =
        await pool.query(
          `
          SELECT *
          FROM academy_tutor_applications
          WHERE LOWER(
            REGEXP_REPLACE(
              TRIM(
                CONCAT_WS(
                  ' ',
                  first_name,
                  middle_name,
                  last_name
                )
              ),
              '\\s+',
              ' ',
              'g'
            )
          ) = LOWER(
            REGEXP_REPLACE(
              TRIM($1),
              '\\s+',
              ' ',
              'g'
            )
          )
          AND LOWER(
            TRIM(reference)
          ) = LOWER(
            TRIM($2)
          )
          AND application_status = 'verified'
          LIMIT 1
          `,
          [
            name,
            referenceId,
          ]
        );

      /* =====================================================
         INVALID LOGIN
      ===================================================== */

      if (!result.rows.length) {
        return res.status(401).json({
          success: false,
          code: "INVALID_TUTOR_LOGIN",
          message:
            "Invalid name or reference ID, or your tutor application has not yet been verified.",
        });
      }

      const tutor =
        result.rows[0];

      /* =====================================================
         CREATE SESSION TOKEN
      ===================================================== */

      const tokenPayload =
        `${tutor.reference}:${tutor.email}:${Date.now()}`;

      const token =
        crypto
          .createHash("sha256")
          .update(
            tokenPayload +
              (
                process.env.SESSION_SECRET ||
                "scholiqen-session"
              )
          )
          .digest("hex");

      /* =====================================================
         RETURN TUTOR
      ===================================================== */

      return res.json({
        success: true,

        message:
          "Tutor login successful.",

        token,

        tutor: {
          reference:
            tutor.reference,

          firstName:
            tutor.first_name,

          middleName:
            tutor.middle_name,

          lastName:
            tutor.last_name,

          fullName:
            [
              tutor.first_name,
              tutor.middle_name,
              tutor.last_name,
            ]
              .filter(Boolean)
              .join(" "),

          email:
            tutor.email,

          phone:
            tutor.phone,

          gender:
            tutor.gender,

          dateOfBirth:
            tutor.date_of_birth,

          state:
            tutor.state,

          city:
            tutor.city,

          qualification:
            tutor.qualification,

          specialization:
            tutor.specialization,

          experience:
            tutor.experience,

          subjects:
            tutor.subjects,

          classes:
            tutor.classes,

          bio:
            tutor.bio,

          applicationStatus:
            tutor.application_status,

          accountStatus:
            tutor.account_status,

          createdAt:
            tutor.created_at,
        },
      });

    } catch (error) {
      console.error(
        "TUTOR LOGIN ERROR:",
        getDatabaseError(error)
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to process tutor login.",
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
   TUTOR - LIVE MY CLASSES
   ---------------------------------------------------------
   THIS IS THE CORRECTED VERSION.

   IMPORTANT:

   Tutor registration stores:

     academy_tutor_applications.classes
     academy_tutor_applications.subjects

   Student registration stores:

     academy_student_enrollments.grade
     academy_student_enrollments.subjects

   ---------------------------------------------------------

   DASHBOARD MEANING:

   TOTAL COURSES
     = number of classes/courses the tutor selected
       during registration.

   TOTAL SUBJECTS
     = number of subjects the tutor selected during
       registration.

   TOTAL STUDENTS
     = unique students who applied for one of the
       tutor's selected classes AND selected subjects.

   ACTIVE CLASSES
     = selected class/subject combinations that currently
       have at least one VERIFIED student.

   ASSIGNED COURSES
     = tutor's registered classes.

   ASSIGNED SUBJECTS
     = tutor's registered subjects.

   ---------------------------------------------------------

   IMPORTANT:

   The current database structure has separate JSONB arrays:

     classes:  ["Primary 3", "SS 2"]
     subjects: ["Mathematics", "Physics"]

   Therefore the backend cannot know an explicit pairing
   unless your database has a separate mapping.

   For now, the API correctly represents the registered
   class/subject selections and matches students against
   them.
========================================================= */

router.get(
  "/tutor/classes",
  async (req, res) => {
    try {
      /* =====================================================
         GET TUTOR REFERENCE
      ===================================================== */

      const reference =
        clean(
          req.query?.reference ||
          req.headers["x-tutor-reference"]
        );

      if (!reference) {
        return res.status(400).json({
          success: false,
          message:
            "Tutor reference is required.",
        });
      }

      /* =====================================================
         FIND TUTOR
      ===================================================== */

      const tutorResult =
        await pool.query(
          `
          SELECT
            reference,
            first_name,
            middle_name,
            last_name,
            email,
            subjects,
            classes,
            application_status
          FROM academy_tutor_applications
          WHERE LOWER(TRIM(reference)) =
                LOWER(TRIM($1))
          LIMIT 1
          `,
          [reference]
        );

      if (!tutorResult.rows.length) {
        return res.status(404).json({
          success: false,
          message:
            "Tutor not found.",
        });
      }

      const tutor =
        tutorResult.rows[0];

      /* =====================================================
         VERIFY TUTOR
      ===================================================== */

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

      /* =====================================================
         READ REGISTERED CLASSES
      ===================================================== */

      const tutorClasses =
        uniqueArray(
          arrayFromValue(
            tutor.classes
          )
        );

      /* =====================================================
         READ REGISTERED SUBJECTS
      ===================================================== */

      const tutorSubjects =
        uniqueArray(
          arrayFromValue(
            tutor.subjects
          )
        );

      /* =====================================================
         BASIC REGISTRATION STATISTICS
      ===================================================== */

      const totalCourses =
        tutorClasses.length;

      const totalSubjects =
        tutorSubjects.length;

      /* =====================================================
         NO SELECTION
      ===================================================== */

      if (
        !tutorClasses.length ||
        !tutorSubjects.length
      ) {
        return res.json({
          success: true,

          tutor: {
            reference:
              tutor.reference,

            firstName:
              tutor.first_name,

            middleName:
              tutor.middle_name,

            lastName:
              tutor.last_name,

            fullName:
              [
                tutor.first_name,
                tutor.middle_name,
                tutor.last_name,
              ]
                .filter(Boolean)
                .join(" "),

            email:
              tutor.email,

            subjects:
              tutorSubjects,

            classes:
              tutorClasses,

            applicationStatus:
              tutor.application_status,
          },

          selection: {
            courses:
              tutorClasses,

            subjects:
              tutorSubjects,
          },

          assignedCourses:
            tutorClasses,

          assignedSubjects:
            tutorSubjects,

          stats: {
            totalCourses,

            totalSubjects,

            totalStudents: 0,

            activeClasses: 0,

            inactiveClasses: 0,

            totalAssignedClasses: 0,

            totalClassStudents: 0,
          },

          classes: [],

          generatedAt:
            new Date().toISOString(),
        });
      }

      /* =====================================================
         GET ALL STUDENT APPLICATIONS
         -----------------------------------------------------
         We intentionally do NOT restrict this SQL query
         to verified students.

         Why?

         TOTAL STUDENTS means students who applied.

         The individual class card tells us:

           studentCount
           verifiedStudentCount
           pendingStudentCount

         ACTIVE CLASS means there is at least one verified
         student.
      ===================================================== */

      const studentResult =
        await pool.query(
          `
          SELECT
            enrollment_id,
            first_name,
            middle_name,
            last_name,
            email,
            student_phone,
            school_level,
            grade,
            academic_session,
            subjects,
            enrollment_status,
            payment_status,
            created_at
          FROM academy_student_enrollments
          ORDER BY
            first_name ASC,
            last_name ASC
          `
        );

      const students =
        studentResult.rows;

      /* =====================================================
         BUILD CLASS/SUBJECT CARDS
      ===================================================== */

      const classCards = [];

      for (
        const grade
        of tutorClasses
      ) {

        for (
          const subject
          of tutorSubjects
        ) {

          /* ===============================================
             FIND ALL STUDENTS WHO APPLIED FOR THIS
             CLASS + SUBJECT
          =============================================== */

          const matchingStudents =
            students.filter(
              (student) => {

                /* -------------------------------------------
                   CLASS MATCH
                ------------------------------------------- */

                const sameGrade =
                  normalizeSubject(
                    student.grade
                  ) ===
                  normalizeSubject(
                    grade
                  );

                if (!sameGrade) {
                  return false;
                }

                /* -------------------------------------------
                   SUBJECT MATCH
                ------------------------------------------- */

                const studentSubjects =
                  arrayFromValue(
                    student.subjects
                  );

                return studentSubjects.some(
                  (studentSubject) =>
                    subjectsMatch(
                      studentSubject,
                      subject
                    )
                );
              }
            );

          /* ===============================================
             VERIFIED STUDENTS
          =============================================== */

          const verifiedStudents =
            matchingStudents.filter(
              (student) =>
                normalizeStatus(
                  student.enrollment_status
                ) === "verified"
            );

          /* ===============================================
             PENDING STUDENTS
          =============================================== */

          const pendingStudents =
            matchingStudents.filter(
              (student) =>
                normalizeStatus(
                  student.enrollment_status
                ) === "pending"
            );

          /* ===============================================
             ACTIVE

             A class is active if at least one student
             assigned to that class + subject is verified.
          =============================================== */

          const active =
            verifiedStudents.length > 0;

          /* ===============================================
             CLASS ID
          =============================================== */

          const classId =
            `${grade}-${subject}`
              .toLowerCase()
              .replace(
                /[^a-z0-9]+/g,
                "-"
              )
              .replace(
                /^-|-$/g,
                "");

          /* ===============================================
             SCHOOL LEVEL
          =============================================== */

          const normalizedGrade =
            normalizeSubject(
              grade
            );

          const schoolLevel =
            normalizedGrade.startsWith(
              "primary"
            )
              ? "Primary"
              : "Secondary";

          /* ===============================================
             STUDENT OBJECTS
          =============================================== */

          const formattedStudents =
            matchingStudents.map(
              (student) => {

                const studentSubjects =
                  arrayFromValue(
                    student.subjects
                  );

                const matchedSubjects =
                  studentSubjects.filter(
                    (studentSubject) =>
                      subjectsMatch(
                        studentSubject,
                        subject
                      )
                  );

                return {
                  enrollmentId:
                    student.enrollment_id,

                  firstName:
                    student.first_name,

                  middleName:
                    student.middle_name,

                  lastName:
                    student.last_name,

                  fullName:
                    [
                      student.first_name,
                      student.middle_name,
                      student.last_name,
                    ]
                      .filter(Boolean)
                      .join(" "),

                  email:
                    student.email,

                  phone:
                    student.student_phone,

                  schoolLevel:
                    student.school_level,

                  grade:
                    student.grade,

                  academicSession:
                    student.academic_session,

                  subjects:
                    studentSubjects,

                  matchedSubjects,

                  enrollmentStatus:
                    student.enrollment_status,

                  paymentStatus:
                    student.payment_status,

                  createdAt:
                    student.created_at,
                };
              }
            );

          /* ===============================================
             CARD
          =============================================== */

          classCards.push({
            id: classId,

            grade,

            className:
              grade,

            course:
              grade,

            subject,

            schoolLevel,

            active,

            status:
              active
                ? "active"
                : "inactive",

            studentCount:
              matchingStudents.length,

            verifiedStudentCount:
              verifiedStudents.length,

            pendingStudentCount:
              pendingStudents.length,

            students:
              formattedStudents,
          });
        }
      }

      /* =====================================================
         UNIQUE STUDENTS
         -----------------------------------------------------
         A student taking multiple tutor subjects must only
         count once in TOTAL STUDENTS.

         Example:

           John
             SS 2 Mathematics
             SS 2 Physics

         totalStudents = 1

         But:

         totalClassStudents = 2
      ===================================================== */

      const uniqueStudentIds =
        new Set();

      classCards.forEach(
        (classItem) => {

          classItem.students.forEach(
            (student) => {

              if (
                student.enrollmentId
              ) {
                uniqueStudentIds.add(
                  student.enrollmentId
                );
              }
            }
          );
        }
      );

      /* =====================================================
         ACTIVE CLASSES
      ===================================================== */

      const activeClasses =
        classCards.filter(
          (classItem) =>
            classItem.active
        ).length;

      /* =====================================================
         INACTIVE CLASSES
      ===================================================== */

      const inactiveClasses =
        classCards.length -
        activeClasses;

      /* =====================================================
         TOTAL STUDENTS
      ===================================================== */

      const totalStudents =
        uniqueStudentIds.size;

      /* =====================================================
         TOTAL CLASS STUDENTS
         -----------------------------------------------------
         A student can appear more than once because the
         student may be taking multiple subjects.
      ===================================================== */

      const totalClassStudents =
        classCards.reduce(
          (
            total,
            classItem
          ) =>
            total +
            classItem.studentCount,
          0
        );

      /* =====================================================
         COURSE LEVEL COUNTS
      ===================================================== */

      const primaryCourses =
        tutorClasses.filter(
          (grade) =>
            normalizeSubject(
              grade
            ).startsWith(
              "primary"
            )
        ).length;

      const juniorCourses =
        tutorClasses.filter(
          (grade) =>
            normalizeSubject(
              grade
            ).startsWith(
              "jss"
            )
        ).length;

      const seniorCourses =
        tutorClasses.filter(
          (grade) =>
            normalizeSubject(
              grade
            ).startsWith(
              "ss"
            )
        ).length;

      /* =====================================================
         COURSE STUDENT COUNTS
         -----------------------------------------------------
         Useful for dashboard cards such as:

           Primary 3     12 students
           JSS 2          8 students
           SS 1          15 students
      ===================================================== */

      const courseStudentCounts =
        tutorClasses.map(
          (grade) => {

            const courseCards =
              classCards.filter(
                (classItem) =>
                  normalizeSubject(
                    classItem.grade
                  ) ===
                  normalizeSubject(
                    grade
                  )
              );

            const courseStudentIds =
              new Set();

            courseCards.forEach(
              (classItem) => {

                classItem.students.forEach(
                  (student) => {

                    if (
                      student.enrollmentId
                    ) {
                      courseStudentIds.add(
                        student.enrollmentId
                      );
                    }
                  }
                );
              }
            );

            return {
              grade,

              course:
                grade,

              studentCount:
                courseStudentIds.size,

              active:
                courseCards.some(
                  (classItem) =>
                    classItem.active
                ),
            };
          }
        );

      /* =====================================================
         SUBJECT STUDENT COUNTS
      ===================================================== */

      const subjectStudentCounts =
        tutorSubjects.map(
          (subject) => {

            const subjectCards =
              classCards.filter(
                (classItem) =>
                  subjectsMatch(
                    classItem.subject,
                    subject
                  )
              );

            const subjectStudentIds =
              new Set();

            subjectCards.forEach(
              (classItem) => {

                classItem.students.forEach(
                  (student) => {

                    if (
                      student.enrollmentId
                    ) {
                      subjectStudentIds.add(
                        student.enrollmentId
                      );
                    }
                  }
                );
              }
            );

            return {
              subject,

              studentCount:
                subjectStudentIds.size,

              active:
                subjectCards.some(
                  (classItem) =>
                    classItem.active
                ),
            };
          }
        );

      /* =====================================================
         RESPONSE
      ===================================================== */

      return res.json({
        success: true,

        tutor: {
          reference:
            tutor.reference,

          firstName:
            tutor.first_name,

          middleName:
            tutor.middle_name,

          lastName:
            tutor.last_name,

          fullName:
            [
              tutor.first_name,
              tutor.middle_name,
              tutor.last_name,
            ]
              .filter(Boolean)
              .join(" "),

          email:
            tutor.email,

          subjects:
            tutorSubjects,

          classes:
            tutorClasses,

          applicationStatus:
            tutor.application_status,
        },

        /* ===================================================
           EXACT REGISTRATION SELECTION
        =================================================== */

        selection: {
          courses:
            tutorClasses,

          subjects:
            tutorSubjects,

          primaryCourses,

          juniorCourses,

          seniorCourses,
        },

        /* ===================================================
           EASY FRONTEND ACCESS
        =================================================== */

        assignedCourses:
          tutorClasses,

        assignedSubjects:
          tutorSubjects,

        /* ===================================================
           DASHBOARD STATISTICS
        =================================================== */

        stats: {
          /*
           * Number of classes selected during registration.
           */
          totalCourses,

          /*
           * Unique students who applied for the tutor's
           * selected classes and subjects.
           */
          totalStudents,

          /*
           * Number of subjects selected during registration.
           */
          totalSubjects,

          /*
           * Number of active class/subject combinations.
           */
          activeClasses,

          /*
           * Number of inactive class/subject combinations.
           */
          inactiveClasses,

          /*
           * Number of generated class/subject teaching cards.
           */
          totalAssignedClasses:
            classCards.length,

          /*
           * Student count across all subject cards.
           */
          totalClassStudents,

          /*
           * Breakdown by school level.
           */
          primaryCourses,

          juniorCourses,

          seniorCourses,
        },

        /* ===================================================
           COURSE STATISTICS
        =================================================== */

        courseStudentCounts,

        /* ===================================================
           SUBJECT STATISTICS
        =================================================== */

        subjectStudentCounts,

        /* ===================================================
           CLASS CARDS
        =================================================== */

        classes:
          classCards,

        generatedAt:
          new Date().toISOString(),
      });

    } catch (error) {
      console.error(
        "TUTOR LIVE CLASSES ERROR:",
        getDatabaseError(error)
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
   TUTOR - SINGLE LIVE CLASS
========================================================= */

router.get(
  "/tutor/classes/:grade/:subject",
  async (req, res) => {
    try {
      const reference =
        clean(
          req.query?.reference ||
          req.headers["x-tutor-reference"]
        );

      const grade =
        clean(
          req.params.grade
        );

      const subject =
        clean(
          req.params.subject
        );

      /* =====================================================
         VALIDATION
      ===================================================== */

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
            "Class/grade is required.",
        });
      }

      if (!subject) {
        return res.status(400).json({
          success: false,
          message:
            "Subject is required.",
        });
      }

      /* =====================================================
         GET TUTOR
      ===================================================== */

      const tutorResult =
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
          WHERE LOWER(TRIM(reference)) =
                LOWER(TRIM($1))
          LIMIT 1
          `,
          [reference]
        );

      if (!tutorResult.rows.length) {
        return res.status(404).json({
          success: false,
          message:
            "Tutor not found.",
        });
      }

      const tutor =
        tutorResult.rows[0];

      /* =====================================================
         VERIFY TUTOR
      ===================================================== */

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

      /* =====================================================
         READ TUTOR REGISTRATION
      ===================================================== */

      const tutorClasses =
        arrayFromValue(
          tutor.classes
        );

      const tutorSubjects =
        arrayFromValue(
          tutor.subjects
        );

      /* =====================================================
         CHECK CLASS
      ===================================================== */

      const tutorHasClass =
        tutorClasses.some(
          (item) =>
            normalizeSubject(item) ===
            normalizeSubject(grade)
        );

      /* =====================================================
         CHECK SUBJECT
      ===================================================== */

      const tutorHasSubject =
        tutorSubjects.some(
          (item) =>
            subjectsMatch(
              item,
              subject
            )
        );

      if (
        !tutorHasClass ||
        !tutorHasSubject
      ) {
        return res.status(403).json({
          success: false,
          message:
            "This class or subject is not assigned to this tutor.",
        });
      }

      /* =====================================================
         GET ALL STUDENTS FOR THIS CLASS
      ===================================================== */

      const studentResult =
        await pool.query(
          `
          SELECT
            enrollment_id,
            first_name,
            middle_name,
            last_name,
            email,
            student_phone,
            school_level,
            grade,
            academic_session,
            subjects,
            enrollment_status,
            payment_status,
            created_at
          FROM academy_student_enrollments
          WHERE LOWER(TRIM(grade)) =
                LOWER(TRIM($1))
          ORDER BY
            first_name ASC,
            last_name ASC
          `,
          [grade]
        );

      /* =====================================================
         FILTER BY SUBJECT
      ===================================================== */

      const matchingStudents =
        studentResult.rows.filter(
          (student) => {

            const studentSubjects =
              arrayFromValue(
                student.subjects
              );

            return studentSubjects.some(
              (studentSubject) =>
                subjectsMatch(
                  studentSubject,
                  subject
                )
            );
          }
        );

      /* =====================================================
         VERIFIED STUDENTS
      ===================================================== */

      const verifiedStudents =
        matchingStudents.filter(
          (student) =>
            normalizeStatus(
              student.enrollment_status
            ) === "verified"
        );

      /* =====================================================
         PENDING STUDENTS
      ===================================================== */

      const pendingStudents =
        matchingStudents.filter(
          (student) =>
            normalizeStatus(
              student.enrollment_status
            ) === "pending"
        );

      /* =====================================================
         SCHOOL LEVEL
      ===================================================== */

      const normalizedGrade =
        normalizeSubject(
          grade
        );

      const schoolLevel =
        normalizedGrade.startsWith(
          "primary"
        )
          ? "Primary"
          : "Secondary";

      /* =====================================================
         CLASS ID
      ===================================================== */

      const classId =
        `${grade}-${subject}`
          .toLowerCase()
          .replace(
            /[^a-z0-9]+/g,
            "-"
          )
          .replace(
            /^-|-$/g,
            ""
          );

      /* =====================================================
         ACTIVE
      ===================================================== */

      const active =
        verifiedStudents.length > 0;

      /* =====================================================
         STUDENT OBJECTS
      ===================================================== */

      const formattedStudents =
        matchingStudents.map(
          (student) => ({
            enrollmentId:
              student.enrollment_id,

            firstName:
              student.first_name,

            middleName:
              student.middle_name,

            lastName:
              student.last_name,

            fullName:
              [
                student.first_name,
                student.middle_name,
                student.last_name,
              ]
                .filter(Boolean)
                .join(" "),

            email:
              student.email,

            phone:
              student.student_phone,

            schoolLevel:
              student.school_level,

            grade:
              student.grade,

            academicSession:
              student.academic_session,

            subjects:
              arrayFromValue(
                student.subjects
              ),

            enrollmentStatus:
              student.enrollment_status,

            paymentStatus:
              student.payment_status,

            createdAt:
              student.created_at,
          })
        );

      /* =====================================================
         RESPONSE
      ===================================================== */

      return res.json({
        success: true,

        class: {
          id:
            classId,

          grade,

          className:
            grade,

          course:
            grade,

          subject,

          schoolLevel,

          active,

          status:
            active
              ? "active"
              : "inactive",

          studentCount:
            matchingStudents.length,

          verifiedStudentCount:
            verifiedStudents.length,

          pendingStudentCount:
            pendingStudents.length,
        },

        students:
          formattedStudents,

        totalStudents:
          matchingStudents.length,

        generatedAt:
          new Date().toISOString(),
      });

    } catch (error) {
      console.error(
        "TUTOR SINGLE CLASS ERROR:",
        getDatabaseError(error)
      );

      return res.status(500).json({
        success: false,

        message:
          "Unable to load tutor class.",

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
   STUDENT BY USER ID
========================================================= */

router.get(
  "/student/:userId",
  async (req, res) => {
    try {
      const {
        userId,
      } = req.params;

      const result =
        await pool.query(
          `
          SELECT
            au.*,
            se.enrollment_id,
            se.school_level,
            se.grade,
            se.academic_session,
            se.subjects
          FROM academy_users au
          LEFT JOIN academy_student_enrollments se
            ON se.enrollment_id =
               au.student_enrollment_id
          WHERE au.id::text = $1
            AND au.user_type = 'student'
          LIMIT 1
          `,
          [userId]
        );

      if (!result.rows.length) {
        return res.status(404).json({
          message:
            "Student account not found.",
        });
      }

      return res.json({
        success: true,
        student:
          result.rows[0],
      });

    } catch (error) {
      console.error(
        "Student profile error:",
        getDatabaseError(error)
      );

      return res.status(500).json({
        message:
          "Unable to load student account.",
      });
    }
  }
);

/* =========================================================
   ADMIN - VERIFY ALL PENDING STATUSES
========================================================= */

router.patch(
  "/admin/verify-all-statuses",
  async (req, res) => {
    const client =
      await pool.connect();

    try {
      await client.query(
        "BEGIN"
      );

      /* =====================================================
         VERIFY ALL PENDING STUDENTS
      ===================================================== */

      const studentResult =
        await client.query(
          `
          UPDATE academy_student_enrollments
          SET
            enrollment_status = 'verified'
          WHERE enrollment_status = 'pending'
          RETURNING enrollment_id
          `
        );

      /* =====================================================
         VERIFY ALL PENDING TUTORS
      ===================================================== */

      const tutorResult =
        await client.query(
          `
          UPDATE academy_tutor_applications
          SET
            application_status = 'verified'
          WHERE application_status = 'pending'
          RETURNING reference
          `
        );

      await client.query(
        "COMMIT"
      );

      return res.json({
        success: true,

        message:
          "All pending student and tutor statuses have been changed to verified.",

        studentsVerified:
          studentResult.rowCount,

        tutorsVerified:
          tutorResult.rowCount,
      });

    } catch (error) {
      await client.query(
        "ROLLBACK"
      );

      console.error(
        "VERIFY ALL STATUSES ERROR:",
        getDatabaseError(error)
      );

      return res.status(500).json({
        success: false,

        message:
          "Unable to verify pending statuses.",
      });

    } finally {
      client.release();
    }
  }
);

/* =========================================================
   ADMIN - SINGLE STUDENT STATUS
========================================================= */

router.patch(
  "/admin/enrollment/:enrollmentId/status",
  async (req, res) => {
    try {
      const enrollmentId =
        clean(
          req.params.enrollmentId
        );

      const status =
        normalizeStatus(
          req.body?.status
        );

      if (!enrollmentId) {
        return res.status(400).json({
          success: false,
          message:
            "Enrollment ID is required.",
        });
      }

      if (status !== "verified") {
        return res.status(400).json({
          success: false,
          message:
            "Only verified status is allowed.",
        });
      }

      const result =
        await pool.query(
          `
          UPDATE academy_student_enrollments
          SET
            enrollment_status = 'verified'
          WHERE enrollment_id = $1
            AND enrollment_status = 'pending'
          RETURNING *
          `,
          [
            enrollmentId,
          ]
        );

      if (!result.rows.length) {
        return res.status(404).json({
          success: false,
          message:
            "Pending student enrollment not found.",
        });
      }

      return res.json({
        success: true,

        message:
          "Student status changed to verified.",

        enrollment:
          result.rows[0],
      });

    } catch (error) {
      console.error(
        "Student status error:",
        getDatabaseError(error)
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to update student status.",
      });
    }
  }
);

/* =========================================================
   ADMIN - SINGLE TUTOR STATUS
========================================================= */

router.patch(
  "/admin/tutor/:reference/status",
  async (req, res) => {
    try {
      const reference =
        clean(
          req.params.reference
        );

      const status =
        normalizeStatus(
          req.body?.status
        );

      if (!reference) {
        return res.status(400).json({
          success: false,
          message:
            "Tutor reference is required.",
        });
      }

      if (status !== "verified") {
        return res.status(400).json({
          success: false,
          message:
            "Only verified status is allowed.",
        });
      }

      const result =
        await pool.query(
          `
          UPDATE academy_tutor_applications
          SET
            application_status = 'verified'
          WHERE reference = $1
            AND application_status = 'pending'
          RETURNING *
          `,
          [
            reference,
          ]
        );

      if (!result.rows.length) {
        return res.status(404).json({
          success: false,
          message:
            "Pending tutor application not found.",
        });
      }

      return res.json({
        success: true,

        message:
          "Tutor status changed to verified.",

        tutor:
          result.rows[0],
      });

    } catch (error) {
      console.error(
        "Tutor status error:",
        getDatabaseError(error)
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
   ADMIN SET STUDENT PASSWORD
========================================================= */

router.post(
  "/admin/student-password",
  async (req, res) => {
    try {
      const {
        enrollmentId,
        password,
      } = req.body || {};

      if (!enrollmentId) {
        return res.status(400).json({
          message:
            "Enrollment ID is required.",
        });
      }

      if (!password) {
        return res.status(400).json({
          message:
            "Password is required.",
        });
      }

      if (String(password).length < 6) {
        return res.status(400).json({
          message:
            "Password must contain at least 6 characters.",
        });
      }

      const studentResult =
        await pool.query(
          `
          SELECT
            enrollment_id,
            first_name,
            last_name,
            email,
            email_verified
          FROM academy_student_enrollments
          WHERE enrollment_id = $1
          LIMIT 1
          `,
          [enrollmentId]
        );

      if (
        !studentResult.rows.length
      ) {
        return res.status(404).json({
          message:
            "Student enrollment not found.",
        });
      }

      const student =
        studentResult.rows[0];

      const passwordHash =
        await bcrypt.hash(
          String(password),
          12
        );

      const accountStatus =
        student.email_verified
          ? "active"
          : "pending";

      await pool.query(
        `
        INSERT INTO academy_users (
          user_type,
          student_enrollment_id,
          first_name,
          last_name,
          email,
          password_hash,
          account_status,
          email_verified,
          must_change_password,
          created_at,
          updated_at
        )
        VALUES (
          'student',
          $1,
          $2,
          $3,
          $4,
          $5,
          $6,
          $7,
          TRUE,
          NOW(),
          NOW()
        )
        ON CONFLICT (email)
        DO UPDATE SET
          user_type = 'student',
          student_enrollment_id = EXCLUDED.student_enrollment_id,
          first_name = EXCLUDED.first_name,
          last_name = EXCLUDED.last_name,
          password_hash = EXCLUDED.password_hash,
          account_status = EXCLUDED.account_status,
          email_verified = EXCLUDED.email_verified,
          must_change_password = TRUE,
          updated_at = NOW()
        `,
        [
          student.enrollment_id,
          student.first_name,
          student.last_name,
          student.email,
          passwordHash,
          accountStatus,
          Boolean(
            student.email_verified
          ),
        ]
      );

      return res.json({
        success: true,

        message:
          student.email_verified
            ? "Password saved successfully. The student account is active."
            : "Password saved successfully. The student must verify their email before logging in.",

        accountStatus:
          accountStatus,

        emailVerified:
          Boolean(
            student.email_verified
          ),
      });

    } catch (error) {
      console.error(
        "Student password error:",
        getDatabaseError(error)
      );

      return res.status(500).json({
        message:
          "Unable to save student password.",
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
   ADMIN SET TUTOR PASSWORD
========================================================= */

router.post(
  "/admin/tutor-password",
  async (req, res) => {
    try {
      const {
        reference,
        password,
      } = req.body || {};

      if (!reference) {
        return res.status(400).json({
          message:
            "Tutor reference is required.",
        });
      }

      if (!password) {
        return res.status(400).json({
          message:
            "Password is required.",
        });
      }

      if (String(password).length < 6) {
        return res.status(400).json({
          message:
            "Password must contain at least 6 characters.",
        });
      }

      const tutorResult =
        await pool.query(
          `
          SELECT
            reference,
            first_name,
            last_name,
            email,
            email_verified
          FROM academy_tutor_applications
          WHERE reference = $1
          LIMIT 1
          `,
          [reference]
        );

      if (
        !tutorResult.rows.length
      ) {
        return res.status(404).json({
          message:
            "Tutor application not found.",
        });
      }

      const tutor =
        tutorResult.rows[0];

      const passwordHash =
        await bcrypt.hash(
          String(password),
          12
        );

      const accountStatus =
        tutor.email_verified
          ? "active"
          : "pending";

      await pool.query(
        `
        INSERT INTO academy_users (
          user_type,
          tutor_application_reference,
          first_name,
          last_name,
          email,
          password_hash,
          account_status,
          email_verified,
          must_change_password,
          created_at,
          updated_at
        )
        VALUES (
          'tutor',
          $1,
          $2,
          $3,
          $4,
          $5,
          $6,
          $7,
          TRUE,
          NOW(),
          NOW()
        )
        ON CONFLICT (email)
        DO UPDATE SET
          user_type = 'tutor',
          tutor_application_reference =
            EXCLUDED.tutor_application_reference,
          first_name =
            EXCLUDED.first_name,
          last_name =
            EXCLUDED.last_name,
          password_hash =
            EXCLUDED.password_hash,
          account_status =
            EXCLUDED.account_status,
          email_verified =
            EXCLUDED.email_verified,
          must_change_password =
            TRUE,
          updated_at =
            NOW()
        `,
        [
          tutor.reference,
          tutor.first_name,
          tutor.last_name,
          tutor.email,
          passwordHash,
          accountStatus,
          Boolean(
            tutor.email_verified
          ),
        ]
      );

      return res.json({
        success: true,

        message:
          tutor.email_verified
            ? "Password saved successfully. The tutor account is active."
            : "Password saved successfully. The tutor must verify their email before logging in.",

        accountStatus:
          accountStatus,

        emailVerified:
          Boolean(
            tutor.email_verified
          ),
      });

    } catch (error) {
      console.error(
        "Tutor password error:",
        getDatabaseError(error)
      );

      return res.status(500).json({
        message:
          "Unable to save tutor password.",
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
   STUDENT LOGIN
========================================================= */

router.post(
  "/student-login",
  async (req, res) => {
    try {
      const {
        email,
        password,
      } = req.body || {};

      const normalizedEmail =
        normalizeEmail(email);

      if (
        !normalizedEmail ||
        !isValidEmail(
          normalizedEmail
        )
      ) {
        return res.status(400).json({
          message:
            "A valid email address is required.",
        });
      }

      if (!password) {
        return res.status(400).json({
          message:
            "Password is required.",
        });
      }

      const result =
        await pool.query(
          `
          SELECT
            id,
            user_type,
            student_enrollment_id,
            first_name,
            last_name,
            email,
            password_hash,
            account_status,
            email_verified,
            must_change_password
          FROM academy_users
          WHERE LOWER(email) = LOWER($1)
            AND user_type = 'student'
          LIMIT 1
          `,
          [normalizedEmail]
        );

      if (!result.rows.length) {
        return res.status(401).json({
          message:
            "Invalid email or password.",
        });
      }

      const user =
        result.rows[0];

      if (
        user.account_status !==
        "active"
      ) {
        if (
          !user.email_verified
        ) {
          return res.status(403).json({
            message:
              "Please verify your email address before logging in.",
            code:
              "EMAIL_NOT_VERIFIED",
          });
        }

        return res.status(403).json({
          message:
            "Your account is not active yet.",
          code:
            "ACCOUNT_NOT_ACTIVE",
        });
      }

      const passwordMatches =
        await bcrypt.compare(
          String(password),
          user.password_hash
        );

      if (!passwordMatches) {
        return res.status(401).json({
          message:
            "Invalid email or password.",
        });
      }

      const tokenPayload =
        `${user.id}:${user.email}:${Date.now()}`;

      const token =
        crypto
          .createHash("sha256")
          .update(
            tokenPayload +
              (process.env.SESSION_SECRET ||
                "scholiqen-session")
          )
          .digest("hex");

      return res.json({
        success: true,

        message:
          "Login successful.",

        token,

        user: {
          id:
            user.id,

          userType:
            user.user_type,

          studentEnrollmentId:
            user.student_enrollment_id,

          firstName:
            user.first_name,

          lastName:
            user.last_name,

          email:
            user.email,

          accountStatus:
            user.account_status,

          emailVerified:
            user.email_verified,

          mustChangePassword:
            user.must_change_password,
        },
      });

    } catch (error) {
      console.error(
        "Student login error:",
        getDatabaseError(error)
      );

      return res.status(500).json({
        message:
          "Unable to log in.",
      });
    }
  }
);

/* =========================================================
   EXPORT
========================================================= */

export default router;