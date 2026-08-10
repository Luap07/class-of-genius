import express from "express";
import { sendMail } from "../mail/mailService.js";
import { instructorApplicationEmail } from "../mail/mailTemplates.js";

const router = express.Router();

/* =========================================================
   POST INSTRUCTOR APPLICATION
========================================================= */

router.post("/instructor-application", async (req, res) => {
  try {
    const application = req.body;

    /* =====================================================
       REQUIRED FIELDS
    ===================================================== */

    const requiredFields = [
      "fullName",
      "email",
      "phone",
      "country",
      "expertise",
      "experience",
      "education",
      "occupation",
      "courseTitle",
      "courseLevel",
      "courseDescription",
      "teachingExperience",
      "availability",
    ];

    const missingFields = requiredFields.filter(
      (field) =>
        !application[field] ||
        String(application[field]).trim() === ""
    );

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Please complete all required fields.",
        missingFields,
      });
    }

    /* =====================================================
       EMAIL VALIDATION
    ===================================================== */

    const emailRegex =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(application.email)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email address.",
      });
    }

    /* =====================================================
       AGREEMENTS
    ===================================================== */

    const agreementsAccepted =
      application.instructorAgreement === true &&
      application.originalContent === true &&
      application.qualityStandards === true &&
      application.terms === true;

    if (!agreementsAccepted) {
      return res.status(400).json({
        success: false,
        message:
          "All instructor agreements must be accepted before submission.",
      });
    }

    /* =====================================================
       BUILD EMAIL
    ===================================================== */

    const email = instructorApplicationEmail(
      application
    );

    /* =====================================================
       SEND TO SCHOLIQEN EMAIL
    ===================================================== */

    const recipient =
      process.env.INSTRUCTOR_APPLICATION_EMAIL ||
      process.env.MAIL_USER;

    if (!recipient) {
      console.error(
        "❌ INSTRUCTOR_APPLICATION_EMAIL / MAIL_USER is missing."
      );

      return res.status(500).json({
        success: false,
        message:
          "Instructor application email is not configured.",
      });
    }

    const info = await sendMail({
      to: recipient,
      subject: email.subject,
      html: email.html,
      text: email.text,
      replyTo: email.replyTo,
    });

    /* =====================================================
       SUCCESS
    ===================================================== */

    console.log(
      "✅ Instructor application received:",
      {
        applicant: application.fullName,
        email: application.email,
        messageId: info.messageId,
      }
    );

    return res.status(200).json({
      success: true,
      message:
        "Instructor application submitted successfully.",
      messageId: info.messageId,
    });

  } catch (error) {
    console.error(
      "❌ Instructor application error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to submit instructor application at this time.",
    });
  }
});

export default router;