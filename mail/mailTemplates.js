/* =========================================================
   SCHOLIQEN MAIL TEMPLATES
   server/mail/mailTemplates.js
========================================================= */

/* =========================================================
   BRAND COLORS
========================================================= */

const BLUE = "#2563eb";
const CYAN = "#06b6d4";
const DARK = "#020617";
const CARD = "#0f172a";
const BORDER = "#1e293b";
const TEXT = "#f8fafc";
const MUTED = "#94a3b8";

/* =========================================================
   ESCAPE HTML
========================================================= */

const escapeHtml = (value = "") => {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

/* =========================================================
   FORMAT FIELD
========================================================= */

const field = (label, value) => {
  return `
    <div style="
      padding:18px;
      margin-bottom:12px;
      background:${CARD};
      border:1px solid ${BORDER};
      border-radius:14px;
    ">
      <div style="
        margin-bottom:7px;
        font-size:11px;
        font-weight:700;
        letter-spacing:1.5px;
        text-transform:uppercase;
        color:${MUTED};
      ">
        ${escapeHtml(label)}
      </div>

      <div style="
        font-size:15px;
        line-height:1.7;
        color:${TEXT};
        white-space:pre-wrap;
        word-break:break-word;
      ">
        ${escapeHtml(value || "Not provided")}
      </div>
    </div>
  `;
};

/* =========================================================
   CHECKBOX STATUS
========================================================= */

const agreement = (label, value) => {
  return `
    <div style="
      display:flex;
      align-items:center;
      gap:10px;
      padding:12px 14px;
      margin-bottom:8px;
      border-radius:12px;
      background:${value ? "rgba(16,185,129,.08)" : "rgba(239,68,68,.08)"};
      border:1px solid ${
        value ? "rgba(16,185,129,.25)" : "rgba(239,68,68,.25)"
      };
    ">
      <span style="
        display:inline-block;
        width:8px;
        height:8px;
        border-radius:50%;
        background:${value ? "#10b981" : "#ef4444"};
      "></span>

      <span style="
        font-size:13px;
        color:${value ? "#a7f3d0" : "#fecaca"};
      ">
        ${escapeHtml(label)}
      </span>

      <strong style="
        margin-left:auto;
        font-size:11px;
        color:${value ? "#34d399" : "#f87171"};
      ">
        ${value ? "ACCEPTED" : "NOT ACCEPTED"}
      </strong>
    </div>
  `;
};

/* =========================================================
   INSTRUCTOR APPLICATION EMAIL
========================================================= */

export const instructorApplicationEmail = (data = {}) => {
  const {
    fullName = "",
    email = "",
    phone = "",
    countryCode = "",
    country = "",

    expertise = "",
    experience = "",
    education = "",
    occupation = "",

    courseTitle = "",
    courseLevel = "",
    courseDescription = "",

    website = "",
    linkedin = "",
    youtube = "",

    teachingExperience = "",
    availability = "",

    instructorAgreement = false,
    originalContent = false,
    qualityStandards = false,
    terms = false,
  } = data;

  const phoneNumber = `${countryCode} ${phone}`.trim();

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />

  <meta
    name="viewport"
    content="width=device-width, initial-scale=1.0"
  />

  <title>New Instructor Application</title>
</head>

<body style="
  margin:0;
  padding:0;
  background:${DARK};
  font-family:Arial,Helvetica,sans-serif;
">

  <div style="
    width:100%;
    padding:40px 15px;
    box-sizing:border-box;
    background:
      radial-gradient(
        circle at top right,
        rgba(37,99,235,.18),
        transparent 35%
      ),
      ${DARK};
  ">

    <div style="
      max-width:760px;
      margin:0 auto;
    ">

      <!-- HEADER -->

      <div style="
        padding:30px;
        text-align:center;
        border:1px solid ${BORDER};
        border-radius:24px 24px 0 0;
        background:linear-gradient(
          135deg,
          #0f172a,
          #111827
        );
      ">

        <div style="
          display:inline-block;
          padding:8px 15px;
          margin-bottom:15px;
          border-radius:999px;
          border:1px solid rgba(6,182,212,.25);
          background:rgba(6,182,212,.08);
          color:${CYAN};
          font-size:11px;
          font-weight:bold;
          letter-spacing:2px;
          text-transform:uppercase;
        ">
          Instructor Program
        </div>

        <h1 style="
          margin:0;
          color:${TEXT};
          font-size:30px;
          line-height:1.2;
        ">
          New Instructor Application
        </h1>

        <p style="
          margin:12px 0 0;
          color:${MUTED};
          font-size:14px;
          line-height:1.7;
        ">
          A new instructor application has been submitted
          through Scholiqen.
        </p>

      </div>

      <!-- CONTENT -->

      <div style="
        padding:30px;
        border-left:1px solid ${BORDER};
        border-right:1px solid ${BORDER};
        background:#020617;
      ">

        <!-- APPLICANT -->

        <div style="
          margin-bottom:30px;
        ">

          <h2 style="
            margin:0 0 15px;
            color:${TEXT};
            font-size:20px;
          ">
            Applicant Information
          </h2>

          ${field("Full Name", fullName)}
          ${field("Professional Email", email)}
          ${field("Phone Number", phoneNumber)}
          ${field("Country", country)}

        </div>

        <!-- PROFESSIONAL -->

        <div style="
          margin-bottom:30px;
        ">

          <h2 style="
            margin:0 0 15px;
            color:${TEXT};
            font-size:20px;
          ">
            Professional Background
          </h2>

          ${field("Area of Expertise", expertise)}
          ${field("Years of Experience", experience)}
          ${field("Current Occupation", occupation)}
          ${field("Education / Certifications", education)}

        </div>

        <!-- COURSE -->

        <div style="
          margin-bottom:30px;
        ">

          <h2 style="
            margin:0 0 15px;
            color:${TEXT};
            font-size:20px;
          ">
            Proposed Course
          </h2>

          ${field("Course Title", courseTitle)}
          ${field("Course Level", courseLevel)}
          ${field("Course Description", courseDescription)}

        </div>

        <!-- ONLINE PRESENCE -->

        <div style="
          margin-bottom:30px;
        ">

          <h2 style="
            margin:0 0 15px;
            color:${TEXT};
            font-size:20px;
          ">
            Online Presence
          </h2>

          ${field("Website", website)}
          ${field("LinkedIn", linkedin)}
          ${field("YouTube", youtube)}

        </div>

        <!-- TEACHING -->

        <div style="
          margin-bottom:30px;
        ">

          <h2 style="
            margin:0 0 15px;
            color:${TEXT};
            font-size:20px;
          ">
            Teaching Experience
          </h2>

          ${field(
            "Previous Teaching Experience",
            teachingExperience
          )}

          ${field(
            "Availability",
            availability
          )}

        </div>

        <!-- AGREEMENTS -->

        <div>

          <h2 style="
            margin:0 0 15px;
            color:${TEXT};
            font-size:20px;
          ">
            Instructor Agreements
          </h2>

          ${agreement(
            "Instructor Code of Conduct",
            instructorAgreement
          )}

          ${agreement(
            "Original Content Declaration",
            originalContent
          )}

          ${agreement(
            "Quality Assurance",
            qualityStandards
          )}

          ${agreement(
            "Terms & Privacy Policy",
            terms
          )}

        </div>

      </div>

      <!-- FOOTER -->

      <div style="
        padding:25px 30px;
        text-align:center;
        border:1px solid ${BORDER};
        border-top:none;
        border-radius:0 0 24px 24px;
        background:#0f172a;
      ">

        <div style="
          font-size:18px;
          font-weight:900;
          color:${TEXT};
        ">
          Scholiqen
        </div>

        <div style="
          margin-top:7px;
          color:${MUTED};
          font-size:12px;
        ">
          Learn • Teach • Inspire
        </div>

        <div style="
          margin-top:18px;
          padding-top:18px;
          border-top:1px solid ${BORDER};
          color:#64748b;
          font-size:11px;
          line-height:1.6;
        ">
          This email was automatically generated from
          the Scholiqen Instructor Program.
        </div>

      </div>

    </div>

  </div>

</body>
</html>
`;

  /* =======================================================
     PLAIN TEXT VERSION
  ======================================================= */

  const text = `
SCHOLIQEN
Learn • Teach • Inspire

NEW INSTRUCTOR APPLICATION
==========================

APPLICANT INFORMATION

Full Name:
${fullName || "Not provided"}

Professional Email:
${email || "Not provided"}

Phone:
${phoneNumber || "Not provided"}

Country:
${country || "Not provided"}


PROFESSIONAL BACKGROUND

Area of Expertise:
${expertise || "Not provided"}

Years of Experience:
${experience || "Not provided"}

Current Occupation:
${occupation || "Not provided"}

Education / Certifications:
${education || "Not provided"}


PROPOSED COURSE

Course Title:
${courseTitle || "Not provided"}

Course Level:
${courseLevel || "Not provided"}

Course Description:
${courseDescription || "Not provided"}


ONLINE PRESENCE

Website:
${website || "Not provided"}

LinkedIn:
${linkedin || "Not provided"}

YouTube:
${youtube || "Not provided"}


TEACHING EXPERIENCE

Previous Teaching Experience:
${teachingExperience || "Not provided"}

Availability:
${availability || "Not provided"}


INSTRUCTOR AGREEMENTS

Instructor Code of Conduct:
${instructorAgreement ? "ACCEPTED" : "NOT ACCEPTED"}

Original Content Declaration:
${originalContent ? "ACCEPTED" : "NOT ACCEPTED"}

Quality Assurance:
${qualityStandards ? "ACCEPTED" : "NOT ACCEPTED"}

Terms & Privacy Policy:
${terms ? "ACCEPTED" : "NOT ACCEPTED"}


This email was automatically generated
from the Scholiqen Instructor Program.
`;

  return {
    subject: `New Instructor Application — ${fullName || "Applicant"}`,
    html,
    text,
    replyTo: email || undefined,
  };
};

/* =========================================================
   CONTACT MESSAGE EMAIL
========================================================= */

export const contactMessageEmail = (data = {}) => {
  const {
    name = "",
    email = "",
    message = "",
  } = data;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
</head>

<body style="
  margin:0;
  padding:0;
  background:#020617;
  font-family:Arial,Helvetica,sans-serif;
">

  <div style="
    max-width:700px;
    margin:40px auto;
    padding:30px;
    background:#0f172a;
    border:1px solid #1e293b;
    border-radius:24px;
  ">

    <div style="
      margin-bottom:25px;
    ">

      <div style="
        color:#06b6d4;
        font-size:11px;
        font-weight:bold;
        letter-spacing:2px;
        text-transform:uppercase;
      ">
        Scholiqen Contact
      </div>

      <h1 style="
        color:#f8fafc;
        font-size:28px;
        margin:10px 0;
      ">
        New Contact Message
      </h1>

      <p style="
        color:#94a3b8;
        font-size:14px;
        line-height:1.7;
      ">
        Someone has contacted Scholiqen through the
        website.
      </p>

    </div>

    ${field("Name", name)}
    ${field("Email", email)}
    ${field("Message", message)}

    <div style="
      margin-top:25px;
      padding-top:20px;
      border-top:1px solid #1e293b;
      color:#64748b;
      font-size:11px;
      text-align:center;
    ">
      Scholiqen • Learn • Teach • Inspire
    </div>

  </div>

</body>
</html>
`;

  const text = `
SCHOLIQEN CONTACT MESSAGE

Name:
${name || "Not provided"}

Email:
${email || "Not provided"}

Message:
${message || "Not provided"}
`;

  return {
    subject: `New Contact Message — ${name || "Website Visitor"}`,
    html,
    text,
    replyTo: email || undefined,
  };
};