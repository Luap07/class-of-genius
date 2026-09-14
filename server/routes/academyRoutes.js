import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import pool from "../lib/db.js";

const router = express.Router();

/* =========================================================
   BASIC HELPERS
========================================================= */

const clean = (value) => {
  if (value === undefined || value === null) return "";
  return String(value).trim();
};

const normalizeEmail = (value) =>
  clean(value).toLowerCase();

const normalizeName = (value) =>
  clean(value)
    .replace(/\s+/g, " ")
    .trim();

const uniqueArray = (value) => {
  if (!Array.isArray(value)) return [];

  return [
    ...new Set(
      value
        .map((item) => clean(item))
        .filter(Boolean)
    ),
  ];
};

const arrayFromValue = (value) => {
  if (Array.isArray(value)) return value;

  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return [];
  }

  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);

      if (Array.isArray(parsed)) {
        return parsed;
      }
    } catch {
      return value
        .split(",")
        .map((item) => clean(item))
        .filter(Boolean);
    }
  }

  return [];
};

const jsonValue = (value, fallback = []) => {
  if (value === null || value === undefined) {
    return fallback;
  }

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
   NAME
========================================================= */

const getTutorName = (tutor) => {
  return normalizeName(
    [
      tutor.first_name,
      tutor.middle_name,
      tutor.last_name,
    ]
      .filter(Boolean)
      .join(" ")
  );
};

/* =========================================================
   SUBJECT ALIASES
========================================================= */

const SUBJECT_ALIASES = {
  "English Studies": "English Language",
  "English Language": "English Language",

  Mathematics: "Mathematics",
  Maths: "Mathematics",

  "Basic Science": "Basic Science",
  "Basic Technology": "Basic Technology",

  Physics: "Physics",
  Chemistry: "Chemistry",
  Biology: "Biology",

  Economics: "Economics",
  Government: "Government",
  "Civic Education": "Civic Education",

  Geography: "Geography",
  "Agricultural Science": "Agricultural Science",

  "Computer Studies": "Computer Studies",
  "Computer Science": "Computer Science",

  "Literature in English": "Literature in English",

  Commerce: "Commerce",
  Accounting: "Accounting",

  "Social Studies": "Social Studies",
  "Christian Religious Studies":
    "Christian Religious Studies",
  "Islamic Religious Studies":
    "Islamic Religious Studies",

  Yoruba: "Yoruba",
  Igbo: "Igbo",
  Hausa: "Hausa",

  "Further Mathematics": "Further Mathematics",
  "Home Economics": "Home Economics",
  "Physical Education": "Physical Education",
  "Fine Arts": "Fine Arts",
  "Visual Arts": "Visual Arts",
  Music: "Music",
};

const normalizeSubject = (subject) => {
  const value = clean(subject);

  if (!value) return "";

  return (
    SUBJECT_ALIASES[value] ||
    SUBJECT_ALIASES[
      Object.keys(SUBJECT_ALIASES).find(
        (key) =>
          key.toLowerCase() ===
          value.toLowerCase()
      )
    ] ||
    value
  );
};

const subjectsMatch = (a, b) => {
  return (
    normalizeSubject(a).toLowerCase() ===
    normalizeSubject(b).toLowerCase()
  );
};

/* =========================================================
   CLASS NORMALIZATION
========================================================= */

const normalizeClass = (value) => {
  return clean(value)
    .replace(/\s+/g, " ")
    .toUpperCase();
};

const classesMatch = (a, b) => {
  return (
    normalizeClass(a) ===
    normalizeClass(b)
  );
};

/* =========================================================
   ASSIGNMENTS
========================================================= */

const normalizeAssignments = (value) => {
  const input = arrayFromValue(value);

  if (!Array.isArray(input)) {
    return [];
  }

  return input
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
        arrayFromValue(
          item.subjects ||
            item.subject ||
            item.subjectNames ||
            item.subject_names
        )
      ).map(normalizeSubject);

      if (!className) {
        return null;
      }

      return {
        class: className,
        subjects,
      };
    })
    .filter(Boolean);
};

/* =========================================================
   DERIVE CLASSES / SUBJECTS
========================================================= */

const getClassesFromAssignments = (
  assignments
) => {
  return uniqueArray(
    assignments.map(
      (item) => item.class
    )
  );
};

const getSubjectsFromAssignments = (
  assignments
) => {
  return uniqueArray(
    assignments.flatMap(
      (item) => item.subjects || []
    )
  );
};

/* =========================================================
   GET SUBJECTS FOR A PARTICULAR CLASS
========================================================= */

const getTutorSubjectsForClass = (
  tutor,
  className
) => {
  const assignments =
    normalizeAssignments(
      tutor.assignments
    );

  const assignment =
    assignments.find((item) =>
      classesMatch(
        item.class,
        className
      )
    );

  if (!assignment) {
    return [];
  }

  return uniqueArray(
    assignment.subjects
  );
};

/* =========================================================
   TUTOR LOOKUP
========================================================= */

const findTutorByReference = async (
  reference
) => {
  const ref = clean(reference);

  if (!ref) {
    return null;
  }

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

const getTutorReferenceFromRequest = (
  req
) => {
  return clean(
    req.headers["x-tutor-reference"] ||
      req.query.reference ||
      req.query.tutorReference ||
      req.body?.reference ||
      req.body?.tutorReference ||
      req.body?.tutor_reference
  );
};

/* =========================================================
   SERIALIZE TUTOR
========================================================= */

const serializeTutor = (tutor) => {
  const assignments =
    normalizeAssignments(
      tutor.assignments
    );

  const assignmentClasses =
    getClassesFromAssignments(
      assignments
    );

  const assignmentSubjects =
    getSubjectsFromAssignments(
      assignments
    );

  const subjects = uniqueArray(
    assignmentSubjects.length
      ? assignmentSubjects
      : arrayFromValue(tutor.subjects)
  );

  const classes = uniqueArray(
    assignmentClasses.length
      ? assignmentClasses
      : arrayFromValue(tutor.classes)
  );

  const teachingLevel =
    arrayFromValue(
      tutor.teaching_level
    );

  const availableDays =
    arrayFromValue(
      tutor.available_days
    );

  const bio = jsonValue(
    tutor.bio,
    {}
  );

  return {
    id: tutor.id,

    reference: tutor.reference,
    applicationReference:
      tutor.reference,

    firstName:
      tutor.first_name || "",

    middleName:
      tutor.middle_name || "",

    lastName:
      tutor.last_name || "",

    name: getTutorName(tutor),

    email:
      tutor.email || "",

    phone:
      tutor.phone || "",

    gender:
      tutor.gender || "",

    dateOfBirth:
      tutor.date_of_birth || "",

    address:
      tutor.address || "",

    city:
      tutor.city || "",

    state:
      tutor.state || "",

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
      tutor.professional_certification ||
      "",

    experience:
      tutor.experience ||
      tutor.teaching_experience ||
      "",

    yearsExperience:
      tutor.years_experience ||
      "",

    teachingExperience:
      tutor.teaching_experience ||
      tutor.experience ||
      "",

    currentOccupation:
      tutor.current_occupation ||
      "",

    teachingLevel,

    subjects,

    classes,

    assignments,

    availableDays,

    availableFrom:
      tutor.available_from || "",

    availableTo:
      tutor.available_to || "",

    preferredMode:
      tutor.preferred_mode || "",

    motivation:
      tutor.motivation || "",

    bio,

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

    createdAt:
      tutor.created_at,

    updatedAt:
      tutor.updated_at,
  };
};

/* =========================================================
   HEALTH
========================================================= */

router.get(
  "/health",
  async (req, res) => {
    try {
      await pool.query(
        "SELECT 1"
      );

      res.json({
        success: true,
        message:
          "Academy API is running",
      });
    } catch (error) {
      console.error(
        "Academy health error:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          "Database connection failed",
      });
    }
  }
);

/* =========================================================
   TUTOR REGISTRATION
========================================================= */

router.post(
  "/tutor-application",
  async (req, res) => {
    try {
      const body = req.body || {};

      /* PERSONAL INFORMATION */

      const firstName = clean(
        body.firstName ??
          body.first_name
      );

      const middleName = clean(
        body.middleName ??
          body.middle_name
      );

      const lastName = clean(
        body.lastName ??
          body.last_name
      );

      const email =
        normalizeEmail(body.email);

      const phone = clean(
        body.phone
      );

      const gender = clean(
        body.gender
      );

      const dateOfBirth =
        body.dateOfBirth ??
        body.date_of_birth ??
        null;

      const address = clean(
        body.address
      );

      const city = clean(
        body.city
      );

      const state = clean(
        body.state
      );

      /* QUALIFICATION */

      const highestQualification =
        clean(
          body.highestQualification ??
            body.highest_qualification ??
            body.qualification
        );

      const qualification =
        clean(
          body.qualification ??
            body.highestQualification ??
            body.highest_qualification
        );

      const institution = clean(
        body.institution ??
          body.institution_name
      );

      const courseOfStudy = clean(
        body.courseOfStudy ??
          body.course_of_study
      );

      const graduationYear = clean(
        body.graduationYear ??
          body.graduation_year
      );

      const professionalCertification =
        clean(
          body.professionalCertification ??
            body.professional_certification
        );

      /* SPECIALIZATION */

      const specialization =
        clean(
          body.specialization ??
            body.courseOfStudy ??
            body.course_of_study
        );

      /* TEACHING EXPERIENCE */

      const yearsExperience = clean(
        body.yearsExperience ??
          body.years_experience
      );

      const teachingExperience =
        clean(
          body.teachingExperience ??
            body.teaching_experience
        );

      const experience = clean(
        body.experience ??
          body.teachingExperience ??
          body.teaching_experience
      );

      const currentOccupation =
        clean(
          body.currentOccupation ??
            body.current_occupation
        );

      /* TEACHING LEVEL */

      const teachingLevel =
        uniqueArray(
          arrayFromValue(
            body.teachingLevel ??
              body.teaching_level
          )
        );

      /* SUBJECTS */

      let subjects =
        uniqueArray(
          arrayFromValue(
            body.subjects ??
              body.subjects_taught
          )
        );

      subjects =
        subjects.map(
          normalizeSubject
        );

      /* ASSIGNMENTS */

      const assignments =
        normalizeAssignments(
          body.assignments ??
            body.teachingAssignments ??
            body.teaching_assignments ??
            body.classSubjectAssignments ??
            body.class_subject_assignments
        );

      /* CLASSES */

      let classes =
        uniqueArray(
          arrayFromValue(
            body.classes ??
              body.grades
          )
        );

      /* ASSIGNMENTS ARE SOURCE OF TRUTH */

      if (assignments.length > 0) {
        classes =
          getClassesFromAssignments(
            assignments
          );

        subjects =
          getSubjectsFromAssignments(
            assignments
          ).map(
            normalizeSubject
          );
      }

      /* AVAILABILITY */

      const availableDays =
        uniqueArray(
          arrayFromValue(
            body.availableDays ??
              body.available_days
          )
        );

      const availableFrom = clean(
        body.availableFrom ??
          body.available_from
      );

      const availableTo = clean(
        body.availableTo ??
          body.available_to
      );

      const preferredMode = clean(
        body.preferredMode ??
          body.preferred_mode
      );

      /* OTHER */

      const motivation = clean(
        body.motivation
      );

      const agreement =
        body.agreement === true ||
        body.agreement === "true";

      const bio =
        body.bio &&
        typeof body.bio === "object"
          ? body.bio
          : {
              motivation,
              teachingExperience,
              currentOccupation,
            };

      /* VALIDATION */

      if (!firstName) {
        return res.status(400).json({
          success: false,
          message:
            "First name is required.",
        });
      }

      if (!lastName) {
        return res.status(400).json({
          success: false,
          message:
            "Last name is required.",
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

      /* DUPLICATE EMAIL */

      const existing =
        await pool.query(
          `
            SELECT reference
            FROM academy_tutor_applications
            WHERE LOWER(email) = LOWER($1)
            ORDER BY created_at DESC
            LIMIT 1
          `,
          [email]
        );

      if (
        existing.rows.length > 0
      ) {
        return res.status(409).json({
          success: false,
          code:
            "ALREADY_REGISTERED",
          message:
            "A tutor application already exists for this email.",
          reference:
            existing.rows[0]
              .reference,
        });
      }

      /* REFERENCE */

      const reference =
        `TUT-${Date.now()
          .toString(36)
          .toUpperCase()}-${crypto
          .randomBytes(3)
          .toString("hex")
          .toUpperCase()}`;

      /* INSERT */

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
              $17,
              $18::jsonb,
              $19,
              $20::jsonb,
              $21,
              $22,
              $23,
              $24,
              $25,
              $26,
              $27,
              $28::jsonb,
              $29,
              $30,
              $31,
              $32,
              $33,
              $34,
              NOW(),
              NOW()
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

            dateOfBirth || null,

            state,
            city,

            qualification,
            specialization,
            experience,

            JSON.stringify(subjects),

            JSON.stringify(classes),

            JSON.stringify(bio),

            "pending",

            JSON.stringify(
              assignments
            ),

            address,

            JSON.stringify(
              teachingLevel
            ),

            yearsExperience,
            currentOccupation,
            highestQualification,

            institution,
            courseOfStudy,
            graduationYear,
            professionalCertification,

            JSON.stringify(
              availableDays
            ),

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

        assignments:
          normalizeAssignments(
            tutor.assignments
          ),

        tutor:
          serializeTutor(tutor),

        application:
          serializeTutor(tutor),
      });
    } catch (error) {
      console.error(
        "TUTOR REGISTRATION ERROR:",
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
      const fullName =
        normalizeName(
          req.body?.name ||
            req.body?.fullName ||
            req.body?.full_name
        );

      const reference = clean(
        req.body?.reference ||
          req.body?.tutorReference ||
          req.body?.tutor_reference
      );

      if (
        !fullName ||
        !reference
      ) {
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
        normalizeName(
          getTutorName(tutor)
        ).toLowerCase() !==
        fullName.toLowerCase()
      ) {
        return res.status(401).json({
          success: false,
          message:
            "The registered name does not match this tutor reference.",
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
   GET TUTOR PROFILE
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

      res.json({
        success: true,
        tutor:
          serializeTutor(tutor),
        profile:
          serializeTutor(tutor),
      });
    } catch (error) {
      console.error(
        "GET TUTOR PROFILE ERROR:",
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
   UPDATE TUTOR PROFILE
========================================================= */

router.patch(
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

      const body = req.body || {};

      const updates = [];
      const values = [];

      const addUpdate = (
        column,
        value
      ) => {
        if (
          value === undefined
        ) {
          return;
        }

        values.push(value);

        updates.push(
          `${column} = $${values.length}`
        );
      };

      /* PERSONAL */

      if (
        body.firstName !==
          undefined ||
        body.first_name !==
          undefined
      ) {
        addUpdate(
          "first_name",
          clean(
            body.firstName ??
              body.first_name
          )
        );
      }

      if (
        body.middleName !==
          undefined ||
        body.middle_name !==
          undefined
      ) {
        addUpdate(
          "middle_name",
          clean(
            body.middleName ??
              body.middle_name
          )
        );
      }

      if (
        body.lastName !==
          undefined ||
        body.last_name !==
          undefined
      ) {
        addUpdate(
          "last_name",
          clean(
            body.lastName ??
              body.last_name
          )
        );
      }

      if (
        body.phone !==
        undefined
      ) {
        addUpdate(
          "phone",
          clean(body.phone)
        );
      }

      if (
        body.gender !==
        undefined
      ) {
        addUpdate(
          "gender",
          clean(body.gender)
        );
      }

      if (
        body.dateOfBirth !==
          undefined ||
        body.date_of_birth !==
          undefined
      ) {
        addUpdate(
          "date_of_birth",
          body.dateOfBirth ??
            body.date_of_birth ??
            null
        );
      }

      if (
        body.address !==
        undefined
      ) {
        addUpdate(
          "address",
          clean(body.address)
        );
      }

      if (
        body.city !==
        undefined
      ) {
        addUpdate(
          "city",
          clean(body.city)
        );
      }

      if (
        body.state !==
        undefined
      ) {
        addUpdate(
          "state",
          clean(body.state)
        );
      }

      /* QUALIFICATION */

      if (
        body.qualification !==
          undefined ||
        body.highestQualification !==
          undefined ||
        body.highest_qualification !==
          undefined
      ) {
        const qualification =
          clean(
            body.qualification ??
              body.highestQualification ??
              body.highest_qualification
          );

        addUpdate(
          "qualification",
          qualification
        );

        addUpdate(
          "highest_qualification",
          qualification
        );
      }

      if (
        body.institution !==
        undefined
      ) {
        addUpdate(
          "institution",
          clean(
            body.institution
          )
        );
      }

      if (
        body.courseOfStudy !==
          undefined ||
        body.course_of_study !==
          undefined
      ) {
        addUpdate(
          "course_of_study",
          clean(
            body.courseOfStudy ??
              body.course_of_study
          )
        );
      }

      if (
        body.graduationYear !==
          undefined ||
        body.graduation_year !==
          undefined
      ) {
        addUpdate(
          "graduation_year",
          clean(
            body.graduationYear ??
              body.graduation_year
          )
        );
      }

      if (
        body.professionalCertification !==
          undefined ||
        body.professional_certification !==
          undefined
      ) {
        addUpdate(
          "professional_certification",
          clean(
            body.professionalCertification ??
              body.professional_certification
          )
        );
      }

      if (
        body.specialization !==
        undefined
      ) {
        addUpdate(
          "specialization",
          clean(
            body.specialization
          )
        );
      }

      /* TEACHING EXPERIENCE */

      if (
        body.experience !==
          undefined ||
        body.teachingExperience !==
          undefined ||
        body.teaching_experience !==
          undefined
      ) {
        const experience =
          clean(
            body.experience ??
              body.teachingExperience ??
              body.teaching_experience
          );

        addUpdate(
          "experience",
          experience
        );

        addUpdate(
          "teaching_experience",
          experience
        );
      }

      if (
        body.yearsExperience !==
          undefined ||
        body.years_experience !==
          undefined
      ) {
        addUpdate(
          "years_experience",
          clean(
            body.yearsExperience ??
              body.years_experience
          )
        );
      }

      if (
        body.currentOccupation !==
          undefined ||
        body.current_occupation !==
          undefined
      ) {
        addUpdate(
          "current_occupation",
          clean(
            body.currentOccupation ??
              body.current_occupation
          )
        );
      }

      /* TEACHING LEVEL */

      if (
        body.teachingLevel !==
          undefined ||
        body.teaching_level !==
          undefined
      ) {
        addUpdate(
          "teaching_level",
          JSON.stringify(
            uniqueArray(
              arrayFromValue(
                body.teachingLevel ??
                  body.teaching_level
              )
            )
          )
        );
      }

      /* ASSIGNMENTS */

      if (
        body.assignments !==
          undefined ||
        body.teachingAssignments !==
          undefined ||
        body.teaching_assignments !==
          undefined ||
        body.classSubjectAssignments !==
          undefined ||
        body.class_subject_assignments !==
          undefined
      ) {
        const assignments =
          normalizeAssignments(
            body.assignments ??
              body.teachingAssignments ??
              body.teaching_assignments ??
              body.classSubjectAssignments ??
              body.class_subject_assignments
          );

        const classes =
          getClassesFromAssignments(
            assignments
          );

        const subjects =
          getSubjectsFromAssignments(
            assignments
          ).map(
            normalizeSubject
          );

        addUpdate(
          "assignments",
          JSON.stringify(
            assignments
          )
        );

        addUpdate(
          "classes",
          JSON.stringify(
            classes
          )
        );

        addUpdate(
          "subjects",
          JSON.stringify(
            subjects
          )
        );
      }

      /* AVAILABILITY */

      if (
        body.availableDays !==
          undefined ||
        body.available_days !==
          undefined
      ) {
        addUpdate(
          "available_days",
          JSON.stringify(
            uniqueArray(
              arrayFromValue(
                body.availableDays ??
                  body.available_days
              )
            )
          )
        );
      }

      if (
        body.availableFrom !==
          undefined ||
        body.available_from !==
          undefined
      ) {
        addUpdate(
          "available_from",
          clean(
            body.availableFrom ??
              body.available_from
          )
        );
      }

      if (
        body.availableTo !==
          undefined ||
        body.available_to !==
          undefined
      ) {
        addUpdate(
          "available_to",
          clean(
            body.availableTo ??
              body.available_to
          )
        );
      }

      if (
        body.preferredMode !==
          undefined ||
        body.preferred_mode !==
          undefined
      ) {
        addUpdate(
          "preferred_mode",
          clean(
            body.preferredMode ??
              body.preferred_mode
          )
        );
      }

      /* MOTIVATION */

      if (
        body.motivation !==
        undefined
      ) {
        addUpdate(
          "motivation",
          clean(
            body.motivation
          )
        );
      }

      /* AGREEMENT */

      if (
        body.agreement !==
        undefined
      ) {
        addUpdate(
          "agreement",
          body.agreement ===
            true ||
            body.agreement ===
              "true"
        );
      }

      /* BIO */

      if (
        body.bio !==
          undefined &&
        typeof body.bio ===
          "object"
      ) {
        addUpdate(
          "bio",
          JSON.stringify(
            body.bio
          )
        );
      }

      /* NOTHING TO UPDATE */

      if (
        updates.length === 0
      ) {
        return res.json({
          success: true,
          message:
            "Nothing to update.",
          tutor:
            serializeTutor(
              tutor
            ),
        });
      }

      values.push(reference);

      const result =
        await pool.query(
          `
            UPDATE academy_tutor_applications
            SET
              ${updates.join(", ")},
              updated_at = NOW()
            WHERE reference = $${values.length}
            RETURNING *
          `,
          values
        );

      const updatedTutor =
        result.rows[0];

      res.json({
        success: true,

        message:
          "Tutor profile updated successfully.",

        tutor:
          serializeTutor(
            updatedTutor
          ),

        profile:
          serializeTutor(
            updatedTutor
          ),
      });
    } catch (error) {
      console.error(
        "UPDATE TUTOR PROFILE ERROR:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          "Failed to update tutor profile.",
        error:
          error.message,
      });
    }
  }
);

/* =========================================================
   PROFILE IMAGE UPLOAD
   IMPORTANT:
   FRONTEND SENDS:
      formData.append("image", file)

   THEREFORE MULTER MUST USE:
      .single("image")
========================================================= */

const tutorUploadDir =
  path.join(
    process.cwd(),
    "uploads",
    "tutors"
  );

fs.mkdirSync(
  tutorUploadDir,
  {
    recursive: true,
  }
);

const tutorImageStorage =
  multer.diskStorage({
    destination: (
      req,
      file,
      cb
    ) => {
      cb(
        null,
        tutorUploadDir
      );
    },

    filename: (
      req,
      file,
      cb
    ) => {
      const reference =
        getTutorReferenceFromRequest(
          req
        ).replace(
          /[^a-zA-Z0-9_-]/g,
          ""
        );

      const extension =
        path.extname(
          file.originalname
        ).toLowerCase();

      cb(
        null,
        `${
          reference ||
          "tutor"
        }-${Date.now()}${extension}`
      );
    },
  });

const tutorImageUpload =
  multer({
    storage:
      tutorImageStorage,

    limits: {
      fileSize:
        10 * 1024 * 1024,
    },

    fileFilter: (
      req,
      file,
      cb
    ) => {
      const allowed = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/webp",
      ];

      if (
        !allowed.includes(
          file.mimetype
        )
      ) {
        return cb(
          new Error(
            "Only JPG, JPEG, PNG and WEBP images are allowed."
          )
        );
      }

      cb(
        null,
        true
      );
    },
  });

router.post(
  "/tutor/profile/image",

  /*
   * FIXED:
   *
   * Your TutorProfile.jsx has:
   *
   * formData.append("image", file)
   *
   * So this MUST be "image".
   */
  tutorImageUpload.single(
    "image"
  ),

  async (
    req,
    res
  ) => {
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
        /*
         * Delete newly uploaded file
         * if tutor does not exist.
         */
        try {
          fs.unlinkSync(
            req.file.path
          );
        } catch {}

        return res.status(404).json({
          success: false,
          message:
            "Tutor profile not found.",
        });
      }

      const imageUrl =
        `/uploads/tutors/${req.file.filename}`;

      /* ---------------------------------------------
         DELETE OLD LOCAL IMAGE
      --------------------------------------------- */

      if (
        tutor.profile_image_url &&
        tutor.profile_image_url.startsWith(
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
          fs.existsSync(
            oldFile
          )
        ) {
          try {
            fs.unlinkSync(
              oldFile
            );
          } catch (deleteError) {
            console.warn(
              "Could not delete old tutor image:",
              deleteError.message
            );
          }
        }
      }

      /* ---------------------------------------------
         SAVE IMAGE URL
      --------------------------------------------- */

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

      const updatedTutor =
        result.rows[0];

      res.json({
        success: true,

        message:
          "Profile image updated successfully.",

        imageUrl,

        profileImageUrl:
          imageUrl,

        profileImage:
          imageUrl,

        tutor:
          serializeTutor(
            updatedTutor
          ),

        profile:
          serializeTutor(
            updatedTutor
          ),
      });
    } catch (error) {
      console.error(
        "PROFILE IMAGE ERROR:",
        error
      );

      /*
       * If database update fails after
       * the file was uploaded, remove
       * the newly uploaded file.
       */
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
   GET TUTOR CLASSES
   RETURNS EXACT REGISTERED CLASS/SUBJECT PAIRS
========================================================= */

router.get(
  "/tutor/classes",
  async (
    req,
    res
  ) => {
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

            assignments: [
              {
                class:
                  assignment.class,

                subjects:
                  assignment.subjects,
              },
            ],
          })
        );

      res.json({
        success: true,

        reference:
          tutor.reference,

        assignments,

        classes,

        subjects:
          getSubjectsFromAssignments(
            assignments
          ),
      });
    } catch (error) {
      console.error(
        "GET TUTOR CLASSES ERROR:",
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
   GET TUTOR CLASS + SUBJECT
========================================================= */

router.get(
  "/tutor/classes/:grade/:subject",
  async (
    req,
    res
  ) => {
    try {
      const reference =
        getTutorReferenceFromRequest(
          req
        );

      const grade =
        clean(
          req.params.grade
        );

      const subject =
        normalizeSubject(
          decodeURIComponent(
            req.params.subject
          )
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

      const assignment =
        assignments.find(
          (item) =>
            classesMatch(
              item.class,
              grade
            )
        );

      if (!assignment) {
        return res.status(403).json({
          success: false,
          message:
            "You are not assigned to this class.",
        });
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
        return res.status(403).json({
          success: false,
          message:
            "You are not assigned to this subject for this class.",
        });
      }

      res.json({
        success: true,

        class:
          assignment.class,

        grade:
          assignment.class,

        subject,

        subjects:
          assignment.subjects,

        assignment: {
          class:
            assignment.class,

          subjects:
            assignment.subjects,
        },
      });
    } catch (error) {
      console.error(
        "GET TUTOR CLASS SUBJECT ERROR:",
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
   MULTER ERROR HANDLER
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
            "The uploaded image is too large. Maximum size is 10MB.",
        });
      }

      if (
        error.code ===
        "LIMIT_UNEXPECTED_FILE"
      ) {
        return res.status(400).json({
          success: false,
          message:
            `Unexpected upload field "${error.field}". Expected field name "image".`,
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

export default router;