import express from "express";
import crypto from "crypto";
import bcrypt from "bcrypt";
import pool from "../lib/db.js";
import { Resend } from "resend";

const router = express.Router();

/* =========================================================
   CONFIGURATION
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
   ACCEPTANCE FEE
========================================================= */

const ACCEPTANCE_FEE = {
  amount: 2000,
  bank: "Opay",
  accountNumber: "8104264197",
  accountName: "Komolafe Damilare Paul",
};

/* =========================================================
   LEVELS
========================================================= */

const PRIMARY_GRADES = [
  "Grade 1",
  "Grade 2",
  "Grade 3",
  "Grade 4",
  "Grade 5",
  "Grade 6",
];

const SECONDARY_CLASSES = [
  "JSS 1",
  "JSS 2",
  "JSS 3",
  "SS 1",
  "SS 2",
  "SS 3",
];

/* =========================================================
   SUBJECTS
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

const SUBJECTS_BY_CLASS = {
  "Grade 1": PRIMARY_BASIC_SUBJECTS,
  "Grade 2": PRIMARY_BASIC_SUBJECTS,
  "Grade 3": PRIMARY_UPPER_SUBJECTS,
  "Grade 4": PRIMARY_UPPER_SUBJECTS,
  "Grade 5": PRIMARY_UPPER_SUBJECTS,
  "Grade 6": PRIMARY_UPPER_SUBJECTS,

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
  if (value === undefined || value === null) {
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

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function generateEnrollmentReference() {
  const year = new Date().getFullYear();

  const random = crypto
    .randomBytes(4)
    .toString("hex")
    .toUpperCase();

  return `SCH-${year}-${random}`;
}

function generatePaymentReference() {
  const timestamp = Date.now();

  const random = crypto
    .randomBytes(3)
    .toString("hex")
    .toUpperCase();

  return `SFP-${timestamp}-${random}`;
}

function generateTutorReference() {
  const timestamp = Date.now()
    .toString()
    .slice(-6);

  const random = crypto
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
    return PRIMARY_GRADES.includes(grade);
  }

  if (schoolLevel === "Secondary") {
    return SECONDARY_CLASSES.includes(grade);
  }

  return false;
}

function getClassSubjects(grade) {
  return SUBJECTS_BY_CLASS[grade] || [];
}

function getDatabaseError(error) {
  return {
    message: error?.message,
    code: error?.code,
    detail: error?.detail,
    hint: error?.hint,
    table: error?.table,
    column: error?.column,
    constraint: error?.constraint,
    where: error?.where,
  };
}

/* =========================================================
   HEALTH
========================================================= */

router.get("/health", async (req, res) => {
  try {
    await pool.query("SELECT 1");

    return res.json({
      success: true,
      message: "Scholiqen Academy API is running.",
    });
  } catch (error) {
    console.error(
      "ACADEMY HEALTH ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Academy API database is unavailable.",
    });
  }
});

/* =========================================================
   STUDENT ENROLLMENT
========================================================= */

router.post(
  "/student-enrollment",
  async (req, res) => {
    try {
      const {
        firstName,
        middleName,
        lastName,
        dateOfBirth,
        gender,
        studentPhone,
        email,
        schoolLevel,
        grade,
        academicSession,
        state,
        city,
        subjects,
        guardianFirstName,
        guardianLastName,
        guardianRelationship,
        guardianPhone,
        guardianEmail,
      } = req.body;

      const first = clean(firstName);
      const middle = clean(middleName);
      const last = clean(lastName);
      const dob = clean(dateOfBirth);
      const studentGender = clean(gender);
      const phone = clean(studentPhone);
      const studentEmail = normalizeEmail(email);
      const level = clean(schoolLevel);
      const studentGrade = clean(grade);
      const session = clean(academicSession);
      const studentState = clean(state);
      const studentCity = clean(city);

      const selectedSubjects = uniqueArray(
        Array.isArray(subjects)
          ? subjects
          : []
      );

      const guardianFirst = clean(
        guardianFirstName
      );

      const guardianLast = clean(
        guardianLastName
      );

      const relationship = clean(
        guardianRelationship
      );

      const guardianPhoneValue = clean(
        guardianPhone
      );

      const guardianEmailValue =
        normalizeEmail(guardianEmail);

      /* -----------------------------------------------------
         REQUIRED FIELDS
      ----------------------------------------------------- */

      if (
        !first ||
        !last ||
        !dob ||
        !studentGender ||
        !phone ||
        !studentEmail ||
        !level ||
        !studentGrade ||
        !session ||
        !studentState ||
        !studentCity ||
        !guardianFirst ||
        !guardianLast ||
        !relationship ||
        !guardianPhoneValue
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Please complete all required enrollment fields.",
        });
      }

      /* -----------------------------------------------------
         EMAIL
      ----------------------------------------------------- */

      if (!isValidEmail(studentEmail)) {
        return res.status(400).json({
          success: false,
          message:
            "Please enter a valid student email address.",
        });
      }

      if (
        guardianEmailValue &&
        !isValidEmail(guardianEmailValue)
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Please enter a valid guardian email address.",
        });
      }

      /* -----------------------------------------------------
         LEVEL
      ----------------------------------------------------- */

      if (
        ![
          "Primary",
          "Secondary",
        ].includes(level)
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Please select a valid school level.",
        });
      }

      /* -----------------------------------------------------
         CLASS
      ----------------------------------------------------- */

      if (
        !isValidGradeForLevel(
          level,
          studentGrade
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "The selected class does not belong to the selected school level.",
        });
      }

      /* -----------------------------------------------------
         SUBJECT VALIDATION
      ----------------------------------------------------- */

      if (selectedSubjects.length === 0) {
        return res.status(400).json({
          success: false,
          message:
            "Please select at least one subject.",
        });
      }

      const allowedSubjects =
        getClassSubjects(studentGrade);

      const allowedNormalized = new Set(
        allowedSubjects.map(normalizeSubject)
      );

      const invalidSubjects =
        selectedSubjects.filter(
          (subject) =>
            !allowedNormalized.has(
              normalizeSubject(subject)
            )
        );

      if (invalidSubjects.length > 0) {
        return res.status(400).json({
          success: false,
          message:
            "One or more selected subjects are not available for this class.",
          invalidSubjects,
          availableSubjects:
            allowedSubjects,
        });
      }

      /* -----------------------------------------------------
         STATE VALIDATION
      ----------------------------------------------------- */

      if (
        !NIGERIAN_STATES.includes(
          studentState
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Please select a valid Nigerian state.",
        });
      }

      /* -----------------------------------------------------
         DUPLICATE EMAIL
      ----------------------------------------------------- */

      const duplicateResult =
        await pool.query(
          `
            SELECT
              id,
              enrollment_id
            FROM academy_student_enrollments
            WHERE LOWER(email) = LOWER($1)
            LIMIT 1
          `,
          [studentEmail]
        );

      if (duplicateResult.rows.length > 0) {
        return res.status(409).json({
          success: false,
          message:
            "A student enrollment already exists with this email address.",
          enrollmentId:
            duplicateResult.rows[0]
              .enrollment_id,
        });
      }

      /* -----------------------------------------------------
         REFERENCE
      ----------------------------------------------------- */

      const enrollmentId =
        generateEnrollmentReference();

      /* -----------------------------------------------------
         INSERT ENROLLMENT
      ----------------------------------------------------- */

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
              NOW(),
              NOW()
            )
            RETURNING *
          `,
          [
            enrollmentId,
            first,
            middle || null,
            last,
            dob,
            studentGender,
            phone,
            studentEmail,
            level,
            studentGrade,
            session,
            studentState,
            studentCity,
            JSON.stringify(
              selectedSubjects
            ),
            guardianFirst,
            guardianLast,
            relationship,
            guardianPhoneValue,
            guardianEmailValue ||
              null,
          ]
        );

      const enrollment =
        result.rows[0];

      /* -----------------------------------------------------
         ADMIN EMAIL
      ----------------------------------------------------- */

      if (resend) {
        try {
          await resend.emails.send({
            from: RESEND_FROM_EMAIL,
            to: ACADEMY_EMAIL,
            subject:
              `New Student Enrollment - ${enrollmentId}`,
            html: `
              <div style="font-family:Arial,sans-serif">
                <h2>New Scholiqen Academy Enrollment</h2>

                <p>
                  A new student enrollment has been submitted.
                </p>

                <p>
                  <strong>Enrollment ID:</strong>
                  ${enrollmentId}
                </p>

                <p>
                  <strong>Student:</strong>
                  ${first} ${last}
                </p>

                <p>
                  <strong>Email:</strong>
                  ${studentEmail}
                </p>

                <p>
                  <strong>Class:</strong>
                  ${studentGrade}
                </p>

                <p>
                  <strong>Level:</strong>
                  ${level}
                </p>

                <p>
                  <strong>Subjects:</strong>
                  ${selectedSubjects.join(", ")}
                </p>

                <p>
                  <strong>Status:</strong>
                  Pending
                </p>
              </div>
            `,
          });
        } catch (emailError) {
          console.error(
            "ACADEMY ADMIN EMAIL ERROR:",
            emailError
          );
        }
      }

      return res.status(201).json({
        success: true,
        message:
          "Student enrollment submitted successfully.",
        enrollmentId,
        acceptanceFee:
          ACCEPTANCE_FEE,
        enrollment,
      });
    } catch (error) {
      console.error(
        "❌ STUDENT ENROLLMENT ERROR:",
        getDatabaseError(error)
      );

      console.error(error?.stack);

      return res.status(500).json({
        success: false,
        message:
          "Unable to submit student enrollment.",
        error:
          process.env.NODE_ENV ===
          "development"
            ? error?.message
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
        paymentReference,
        email,
        amount,
      } = req.body;

      const enrollmentRef =
        clean(enrollmentId);

      const suppliedPaymentReference =
        clean(paymentReference);

      const studentEmail =
        normalizeEmail(email);

      const paymentAmount =
        Number(amount);

      if (
        !enrollmentRef ||
        !suppliedPaymentReference ||
        !studentEmail ||
        !paymentAmount
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Enrollment ID, payment reference, email and amount are required.",
        });
      }

      if (
        paymentAmount !==
        ACCEPTANCE_FEE.amount
      ) {
        return res.status(400).json({
          success: false,
          message:
            "The acceptance fee must be exactly ₦2,000.",
        });
      }

      const enrollmentResult =
        await pool.query(
          `
            SELECT *
            FROM academy_student_enrollments
            WHERE enrollment_id = $1
            LIMIT 1
          `,
          [enrollmentRef]
        );

      if (
        enrollmentResult.rows.length ===
        0
      ) {
        return res.status(404).json({
          success: false,
          message:
            "Student enrollment not found.",
        });
      }

      const enrollment =
        enrollmentResult.rows[0];

      if (
        normalizeEmail(
          enrollment.email
        ) !== studentEmail
      ) {
        return res.status(403).json({
          success: false,
          message:
            "The email does not match this enrollment.",
        });
      }

      /* -----------------------------------------------------
         PAYMENT RECORD
      ----------------------------------------------------- */

      const generatedPaymentReference =
        suppliedPaymentReference ||
        generatePaymentReference();

      const paymentResult =
        await pool.query(
          `
            INSERT INTO academy_payments (
              enrollment_id,
              payment_reference,
              amount,
              bank,
              account_number,
              account_name,
              payer_email,
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
              'pending',
              NOW(),
              NOW()
            )
            RETURNING *
          `,
          [
            enrollmentRef,
            generatedPaymentReference,
            paymentAmount,
            ACCEPTANCE_FEE.bank,
            ACCEPTANCE_FEE.accountNumber,
            ACCEPTANCE_FEE.accountName,
            studentEmail,
          ]
        );

      /* -----------------------------------------------------
         UPDATE ENROLLMENT
      ----------------------------------------------------- */

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
          generatedPaymentReference,
          enrollmentRef,
        ]
      );

      return res.status(201).json({
        success: true,
        message:
          "Payment information submitted successfully. Awaiting verification.",
        paymentReference:
          generatedPaymentReference,
        status: "pending",
        payment:
          paymentResult.rows[0],
      });
    } catch (error) {
      console.error(
        "❌ ACCEPTANCE FEE ERROR:",
        getDatabaseError(error)
      );

      console.error(error?.stack);

      return res.status(500).json({
        success: false,
        message:
          "Unable to submit acceptance fee information.",
        error:
          process.env.NODE_ENV ===
          "development"
            ? error?.message
            : undefined,
      });
    }
  }
);

/* =========================================================
   ADMIN - ALL ENROLLMENTS
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
        "ADMIN ENROLLMENTS ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to load student enrollments.",
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

      return res.json({
        success: true,
        tutors: result.rows,
      });
    } catch (error) {
      console.error(
        "ADMIN TUTORS ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to load tutor applications.",
      });
    }
  }
);

/* =========================================================
   ADMIN - SINGLE ENROLLMENT
========================================================= */

router.get(
  "/admin/enrollment/:enrollmentId",
  async (req, res) => {
    try {
      const enrollmentId =
        clean(
          req.params.enrollmentId
        );

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

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message:
            "Enrollment not found.",
        });
      }

      return res.json({
        success: true,
        enrollment:
          result.rows[0],
      });
    } catch (error) {
      console.error(
        "ADMIN SINGLE ENROLLMENT ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to load enrollment.",
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
      const reference =
        clean(req.params.reference);

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

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
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
        "ADMIN SINGLE TUTOR ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
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
      const {
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
        subjects,
        classes,
        bio,
      } = req.body;

      const first = clean(firstName);
      const middle = clean(middleName);
      const last = clean(lastName);
      const tutorEmail =
        normalizeEmail(email);
      const tutorPhone = clean(phone);
      const tutorGender = clean(gender);
      const dob = clean(dateOfBirth);
      const tutorState = clean(state);
      const tutorCity = clean(city);
      const tutorQualification =
        clean(qualification);
      const tutorSpecialization =
        clean(specialization);
      const tutorExperience =
        clean(experience);

      const tutorSubjects =
        uniqueArray(
          Array.isArray(subjects)
            ? subjects
            : []
        );

      const tutorClasses =
        uniqueArray(
          Array.isArray(classes)
            ? classes
            : []
        );

      const tutorBio = clean(bio);

      /* -----------------------------------------------------
         REQUIRED
      ----------------------------------------------------- */

      if (
        !first ||
        !last ||
        !tutorEmail ||
        !tutorPhone ||
        !tutorGender ||
        !dob ||
        !tutorState ||
        !tutorCity ||
        !tutorQualification
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Please complete all required tutor application fields.",
        });
      }

      if (!isValidEmail(tutorEmail)) {
        return res.status(400).json({
          success: false,
          message:
            "Please enter a valid email address.",
        });
      }

      if (
        !NIGERIAN_STATES.includes(
          tutorState
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Please select a valid Nigerian state.",
        });
      }

      /* -----------------------------------------------------
         DUPLICATE
      ----------------------------------------------------- */

      const duplicate =
        await pool.query(
          `
            SELECT reference
            FROM academy_tutor_applications
            WHERE LOWER(email) = LOWER($1)
            LIMIT 1
          `,
          [tutorEmail]
        );

      if (duplicate.rows.length > 0) {
        return res.status(409).json({
          success: false,
          message:
            "A tutor application already exists with this email address.",
          reference:
            duplicate.rows[0]
              .reference,
        });
      }

      const reference =
        generateTutorReference();

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
              $16,
              'pending',
              NOW(),
              NOW()
            )
            RETURNING *
          `,
          [
            reference,
            first,
            middle || null,
            last,
            tutorEmail,
            tutorPhone,
            tutorGender,
            dob,
            tutorState,
            tutorCity,
            tutorQualification,
            tutorSpecialization ||
              null,
            tutorExperience ||
              null,
            JSON.stringify(
              tutorSubjects
            ),
            JSON.stringify(
              tutorClasses
            ),
            tutorBio || null,
          ]
        );

      /* -----------------------------------------------------
         EMAIL ADMIN
      ----------------------------------------------------- */

      if (resend) {
        try {
          await resend.emails.send({
            from: RESEND_FROM_EMAIL,
            to: ACADEMY_EMAIL,
            subject:
              `New Tutor Application - ${reference}`,
            html: `
              <div style="font-family:Arial,sans-serif">
                <h2>New Scholiqen Academy Tutor Application</h2>

                <p>
                  <strong>Reference:</strong>
                  ${reference}
                </p>

                <p>
                  <strong>Name:</strong>
                  ${first} ${last}
                </p>

                <p>
                  <strong>Email:</strong>
                  ${tutorEmail}
                </p>

                <p>
                  <strong>Phone:</strong>
                  ${tutorPhone}
                </p>

                <p>
                  <strong>Qualification:</strong>
                  ${tutorQualification}
                </p>

                <p>
                  <strong>Subjects:</strong>
                  ${tutorSubjects.join(", ")}
                </p>

                <p>
                  <strong>Status:</strong>
                  Pending
                </p>
              </div>
            `,
          });
        } catch (emailError) {
          console.error(
            "TUTOR ADMIN EMAIL ERROR:",
            emailError
          );
        }
      }

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
        "❌ TUTOR APPLICATION ERROR:",
        getDatabaseError(error)
      );

      console.error(error?.stack);

      return res.status(500).json({
        success: false,
        message:
          "Unable to submit tutor application.",
        error:
          process.env.NODE_ENV ===
          "development"
            ? error?.message
            : undefined,
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
      const userId =
        clean(req.params.userId);

      if (!userId) {
        return res.status(400).json({
          success: false,
          message:
            "Student ID is required.",
        });
      }

      const result =
        await pool.query(
          `
            SELECT *
            FROM academy_student_enrollments
            WHERE enrollment_id = $1
               OR id::text = $1
            LIMIT 1
          `,
          [userId]
        );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message:
            "Student profile not found.",
        });
      }

      return res.json({
        success: true,
        student:
          result.rows[0],
      });
    } catch (error) {
      console.error(
        "STUDENT PROFILE ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to load student profile.",
      });
    }
  }
);

/* =========================================================
   TUTOR APPLICATION LOOKUP
========================================================= */

router.get(
  "/tutor-application/:reference",
  async (req, res) => {
    try {
      const reference =
        clean(req.params.reference);

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

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
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
        "TUTOR APPLICATION LOOKUP ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to load tutor application.",
      });
    }
  }
);

/* =========================================================
   ADMIN - CREATE / ASSIGN STUDENT PASSWORD
========================================================= */

router.post(
  "/admin/student-password",
  async (req, res) => {
    try {
      const {
        enrollmentId,
        password,
      } = req.body;

      const enrollmentRef =
        clean(enrollmentId);

      const cleanPassword =
        clean(password);

      if (
        !enrollmentRef ||
        !cleanPassword
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Enrollment ID and password are required.",
        });
      }

      if (cleanPassword.length < 6) {
        return res.status(400).json({
          success: false,
          message:
            "Password must contain at least 6 characters.",
        });
      }

      /* -----------------------------------------------------
         FIND STUDENT
      ----------------------------------------------------- */

      const enrollmentResult =
        await pool.query(
          `
            SELECT
              enrollment_id,
              first_name,
              last_name,
              email
            FROM academy_student_enrollments
            WHERE enrollment_id = $1
            LIMIT 1
          `,
          [enrollmentRef]
        );

      if (
        enrollmentResult.rows.length ===
        0
      ) {
        return res.status(404).json({
          success: false,
          message:
            "Student enrollment not found.",
        });
      }

      const student =
        enrollmentResult.rows[0];

      const studentEmail =
        normalizeEmail(student.email);

      /* -----------------------------------------------------
         HASH PASSWORD
      ----------------------------------------------------- */

      const passwordHash =
        await bcrypt.hash(
          cleanPassword,
          12
        );

      /* -----------------------------------------------------
         CREATE / UPDATE ACADEMY USER
      ----------------------------------------------------- */

      const result =
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
              must_change_password
            )
            VALUES (
              'student',
              $1,
              $2,
              $3,
              $4,
              $5,
              'active',
              TRUE
            )
            ON CONFLICT (email)
            DO UPDATE SET
              user_type = 'student',
              student_enrollment_id = EXCLUDED.student_enrollment_id,
              first_name = EXCLUDED.first_name,
              last_name = EXCLUDED.last_name,
              password_hash = EXCLUDED.password_hash,
              account_status = 'active',
              must_change_password = TRUE,
              updated_at = NOW()
            RETURNING
              id,
              user_type,
              student_enrollment_id,
              first_name,
              last_name,
              email,
              account_status,
              must_change_password,
              created_at,
              updated_at
          `,
          [
            student.enrollment_id,
            student.first_name,
            student.last_name,
            studentEmail,
            passwordHash,
          ]
        );

      return res.json({
        success: true,
        message:
          "Student password assigned successfully.",
        user:
          result.rows[0],
      });
    } catch (error) {
      console.error(
        "❌ STUDENT PASSWORD ERROR:",
        getDatabaseError(error)
      );

      console.error(error?.stack);

      return res.status(500).json({
        success: false,
        message:
          "Unable to assign student password.",
        error:
          process.env.NODE_ENV ===
          "development"
            ? error?.message
            : undefined,
      });
    }
  }
);

/* =========================================================
   ADMIN - CREATE / ASSIGN TUTOR PASSWORD
========================================================= */

router.post(
  "/admin/tutor-password",
  async (req, res) => {
    try {
      const {
        reference,
        password,
      } = req.body;

      const tutorReference =
        clean(reference);

      const cleanPassword =
        clean(password);

      if (
        !tutorReference ||
        !cleanPassword
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Tutor reference and password are required.",
        });
      }

      if (cleanPassword.length < 6) {
        return res.status(400).json({
          success: false,
          message:
            "Password must contain at least 6 characters.",
        });
      }

      /* -----------------------------------------------------
         FIND TUTOR
      ----------------------------------------------------- */

      const tutorResult =
        await pool.query(
          `
            SELECT
              reference,
              first_name,
              last_name,
              email
            FROM academy_tutor_applications
            WHERE reference = $1
            LIMIT 1
          `,
          [tutorReference]
        );

      if (
        tutorResult.rows.length ===
        0
      ) {
        return res.status(404).json({
          success: false,
          message:
            "Tutor application not found.",
        });
      }

      const tutor =
        tutorResult.rows[0];

      const tutorEmail =
        normalizeEmail(tutor.email);

      /* -----------------------------------------------------
         HASH
      ----------------------------------------------------- */

      const passwordHash =
        await bcrypt.hash(
          cleanPassword,
          12
        );

      /* -----------------------------------------------------
         CREATE / UPDATE
      ----------------------------------------------------- */

      const result =
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
              must_change_password
            )
            VALUES (
              'tutor',
              $1,
              $2,
              $3,
              $4,
              $5,
              'active',
              TRUE
            )
            ON CONFLICT (email)
            DO UPDATE SET
              user_type = 'tutor',
              tutor_application_reference = EXCLUDED.tutor_application_reference,
              first_name = EXCLUDED.first_name,
              last_name = EXCLUDED.last_name,
              password_hash = EXCLUDED.password_hash,
              account_status = 'active',
              must_change_password = TRUE,
              updated_at = NOW()
            RETURNING
              id,
              user_type,
              tutor_application_reference,
              first_name,
              last_name,
              email,
              account_status,
              must_change_password,
              created_at,
              updated_at
          `,
          [
            tutor.reference,
            tutor.first_name,
            tutor.last_name,
            tutorEmail,
            passwordHash,
          ]
        );

      return res.json({
        success: true,
        message:
          "Tutor password assigned successfully.",
        user:
          result.rows[0],
      });
    } catch (error) {
      console.error(
        "❌ TUTOR PASSWORD ERROR:",
        getDatabaseError(error)
      );

      console.error(error?.stack);

      return res.status(500).json({
        success: false,
        message:
          "Unable to assign tutor password.",
        error:
          process.env.NODE_ENV ===
          "development"
            ? error?.message
            : undefined,
      });
    }
  }
);

/* =========================================================
   ⭐ STUDENT LOGIN
   THIS IS THE ROUTE THAT WAS MISSING
========================================================= */

router.post(
  "/student-login",
  async (req, res) => {
    try {
      const email =
        normalizeEmail(req.body.email);

      const password =
        clean(req.body.password);

      /* -----------------------------------------------------
         VALIDATION
      ----------------------------------------------------- */

      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message:
            "Email and password are required.",
        });
      }

      if (!isValidEmail(email)) {
        return res.status(400).json({
          success: false,
          message:
            "Please enter a valid email address.",
        });
      }

      /* -----------------------------------------------------
         FIND STUDENT ACCOUNT
      ----------------------------------------------------- */

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
              must_change_password,
              last_login_at,
              created_at,
              updated_at
            FROM academy_users
            WHERE LOWER(email) = LOWER($1)
              AND user_type = 'student'
            LIMIT 1
          `,
          [email]
        );

      /* -----------------------------------------------------
         ACCOUNT NOT FOUND
      ----------------------------------------------------- */

      if (result.rows.length === 0) {
        return res.status(401).json({
          success: false,
          message:
            "Invalid email or password.",
        });
      }

      const user =
        result.rows[0];

      /* -----------------------------------------------------
         ACCOUNT STATUS
      ----------------------------------------------------- */

      if (
        user.account_status !==
        "active"
      ) {
        return res.status(403).json({
          success: false,
          message:
            "Your student account is not active. Please contact Scholiqen Academy.",
        });
      }

      /* -----------------------------------------------------
         CHECK PASSWORD
      ----------------------------------------------------- */

      const passwordMatches =
        await bcrypt.compare(
          password,
          user.password_hash
        );

      if (!passwordMatches) {
        return res.status(401).json({
          success: false,
          message:
            "Invalid email or password.",
        });
      }

      /* -----------------------------------------------------
         UPDATE LAST LOGIN
      ----------------------------------------------------- */

      await pool.query(
        `
          UPDATE academy_users
          SET
            last_login_at = NOW(),
            updated_at = NOW()
          WHERE id = $1
        `,
        [user.id]
      );

      /* -----------------------------------------------------
         CREATE SESSION TOKEN
         
         NOTE:
         This is a random token used by the frontend.
         It is NOT a JWT.
      ----------------------------------------------------- */

      const token =
        crypto
          .randomBytes(32)
          .toString("hex");

      /* -----------------------------------------------------
         NEVER RETURN PASSWORD HASH
      ----------------------------------------------------- */

      delete user.password_hash;

      /* -----------------------------------------------------
         RESPONSE
      ----------------------------------------------------- */

      return res.json({
        success: true,
        message:
          "Student login successful.",

        token,

        user: {
          id: user.id,

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

          mustChangePassword:
            user.must_change_password,

          lastLoginAt:
            new Date().toISOString(),

          createdAt:
            user.created_at,

          updatedAt:
            user.updated_at,
        },
      });
    } catch (error) {
      console.error(
        "❌ STUDENT LOGIN ERROR:",
        getDatabaseError(error)
      );

      console.error(error?.stack);

      return res.status(500).json({
        success: false,
        message:
          "Unable to log in to the student portal.",

        error:
          process.env.NODE_ENV ===
          "development"
            ? error?.message
            : undefined,

        details:
          process.env.NODE_ENV ===
          "development"
            ? getDatabaseError(error)
            : undefined,
      });
    }
  }
);

/* =========================================================
   ADMIN - UPDATE ENROLLMENT STATUS
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
        clean(
          req.body.status
        ).toLowerCase();

      const allowedStatuses = [
        "pending",
        "approved",
        "rejected",
        "verified",
        "active",
      ];

      if (
        !allowedStatuses.includes(
          status
        )
      ) {
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
              enrollment_status = $1,
              updated_at = NOW()
            WHERE enrollment_id = $2
            RETURNING *
          `,
          [
            status,
            enrollmentId,
          ]
        );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message:
            "Enrollment not found.",
        });
      }

      return res.json({
        success: true,
        message:
          "Enrollment status updated successfully.",
        enrollment:
          result.rows[0],
      });
    } catch (error) {
      console.error(
        "UPDATE ENROLLMENT STATUS ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to update enrollment status.",
      });
    }
  }
);

/* =========================================================
   ADMIN - UPDATE TUTOR STATUS
========================================================= */

router.patch(
  "/admin/tutor/:reference/status",
  async (req, res) => {
    try {
      const reference =
        clean(req.params.reference);

      const status =
        clean(
          req.body.status
        ).toLowerCase();

      const allowedStatuses = [
        "pending",
        "approved",
        "rejected",
        "active",
      ];

      if (
        !allowedStatuses.includes(
          status
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid tutor application status.",
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
            reference,
          ]
        );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message:
            "Tutor application not found.",
        });
      }

      return res.json({
        success: true,
        message:
          "Tutor application status updated successfully.",
        tutor:
          result.rows[0],
      });
    } catch (error) {
      console.error(
        "UPDATE TUTOR STATUS ERROR:",
        error
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
   EXPORT
========================================================= */

export default router;