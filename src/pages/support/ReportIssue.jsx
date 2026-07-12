import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Bug,
  Upload,
  AlertTriangle,
  CheckCircle2,
  Send,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Cog from "../../assets/cog.png";

const issueCategories = [
  "Account",
  "Authentication",
  "Courses",
  "Instructor Portal",
  "AI Tutor",
  "Virtual Labs",
  "CBT Exams",
  "Curriculum",
  "Certificates",
  "Payments",
  "Notifications",
  "Mobile App",
  "Website",
  "Performance",
  "Other",
];

const severityLevels = [
  "Low",
  "Medium",
  "High",
  "Critical",
];

const ReportIssue = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    category: "",
    severity: "",
    title: "",
    description: "",
    browser: "",
    device: "",
    pageUrl: "",
    screenshot: null,
    agree: false,
  });

  const handleChange = (e) => {
    const { name, value, checked, type, files } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : type === "file"
          ? files[0]
          : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.agree) {
      alert("Please confirm the information before submitting.");
      return;
    }

    setLoading(true);

    setTimeout(() => {
      console.log(formData);
      setLoading(false);
      setSubmitted(true);
    }, 1800);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center px-6">

        <motion.div
          initial={{ opacity: 0, scale: .9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-xl rounded-[32px] border border-slate-800 bg-slate-900 p-10 text-center"
        >

          <CheckCircle2
            size={70}
            className="mx-auto text-green-500"
          />

          <h1 className="mt-6 text-4xl font-black">
            Issue Submitted
          </h1>

          <p className="mt-5 leading-7 text-slate-400">
            Thanks for reporting the issue.
            Our engineering team will investigate it
            and keep improving Scholiqen.
          </p>

          <button
            onClick={() => navigate("/dashboard")}
            className="mt-8 rounded-2xl bg-blue-600 px-8 py-4 font-bold hover:bg-blue-700"
          >
            Return to Dashboard
          </button>

        </motion.div>

      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">

      {/* ================= HEADER ================= */}

      <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/95 backdrop-blur-xl">

        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">

          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-slate-400 hover:text-white"
          >
            <ArrowLeft size={18} />
            Back
          </button>

          <div className="flex items-center gap-4">

            <img
              src={Cog}
              alt="Scholiqen"
              className="h-12 w-12"
            />

            <div>

              <h1 className="text-2xl font-black">
                Scholiqen
              </h1>

              <p className="text-xs text-slate-400">
                Bug Reporting Center
              </p>

            </div>

          </div>

          <div className="rounded-full border border-red-500/30 bg-red-500/10 px-5 py-2 text-sm font-semibold text-red-400">
            Report Issue
          </div>

        </div>

      </header>

      <main className="mx-auto max-w-6xl px-6 py-10">

        {/* ================= HERO ================= */}

        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-[36px] border border-slate-800 bg-slate-900 p-10"
        >

          <div className="flex flex-col items-center text-center">

            <div className="rounded-3xl bg-red-500/10 p-5">

              <Bug
                size={42}
                className="text-red-500"
              />

            </div>

            <h1 className="mt-6 text-5xl font-black">
              Report an Issue
            </h1>

            <p className="mt-5 max-w-3xl leading-8 text-slate-400">
              Found a bug or something isn't working as expected?
              Let us know by completing the form below.
              Your feedback helps us improve Scholiqen.
            </p>

          </div>

        </motion.div>

        {/* ================= FORM ================= */}

        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-10 rounded-[32px] border border-slate-800 bg-slate-900 p-8 space-y-10"
        >
                    {/* ================= REPORTER INFORMATION ================= */}

          <section>

            <div className="mb-8 flex items-center gap-3">

              <div className="rounded-xl bg-blue-500/10 p-3">
                <Bug size={22} className="text-blue-500" />
              </div>

              <div>
                <h2 className="text-2xl font-black">
                  Reporter Information
                </h2>
                <p className="text-slate-400">
                  Tell us who is reporting this issue.
                </p>
              </div>

            </div>

            <div className="grid gap-6 md:grid-cols-2">

              <Input
                label="Full Name"
                name="fullName"
                placeholder="John Doe"
                value={formData.fullName}
                onChange={handleChange}
              />

              <Input
                label="Email Address"
                name="email"
                type="email"
                placeholder="john@example.com"
                value={formData.email}
                onChange={handleChange}
              />

              <Input
                label="Phone Number"
                name="phone"
                placeholder="+234 800 000 0000"
                value={formData.phone}
                onChange={handleChange}
              />

              <Input
                label="Page URL (Optional)"
                name="pageUrl"
                placeholder="https://scholiqen.com/dashboard"
                value={formData.pageUrl}
                onChange={handleChange}
              />

            </div>

          </section>





          {/* ================= ISSUE DETAILS ================= */}

          <section>

            <div className="mb-8 flex items-center gap-3">

              <div className="rounded-xl bg-red-500/10 p-3">
                <AlertTriangle
                  size={22}
                  className="text-red-500"
                />
              </div>

              <div>

                <h2 className="text-2xl font-black">
                  Issue Details
                </h2>

                <p className="text-slate-400">
                  Help us understand the problem.
                </p>

              </div>

            </div>

            <div className="space-y-6">

              <div>

                <label className="mb-2 block text-sm font-semibold text-slate-300">
                  Issue Category
                </label>

                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                  className="
                    w-full
                    rounded-xl
                    border-2
                    border-slate-700
                    bg-slate-950
                    px-5
                    py-4
                    text-white
                    outline-none
                    focus:border-blue-500
                  "
                >

                  <option value="">
                    Select category
                  </option>

                  {issueCategories.map((item) => (

                    <option
                      key={item}
                      value={item}
                      className="bg-slate-950"
                    >
                      {item}
                    </option>

                  ))}

                </select>

              </div>

              <div>

                <label className="mb-2 block text-sm font-semibold text-slate-300">
                  Severity
                </label>

                <select
                  name="severity"
                  value={formData.severity}
                  onChange={handleChange}
                  required
                  className="
                    w-full
                    rounded-xl
                    border-2
                    border-slate-700
                    bg-slate-950
                    px-5
                    py-4
                    text-white
                    outline-none
                    focus:border-blue-500
                  "
                >

                  <option value="">
                    Select severity
                  </option>

                  {severityLevels.map((level) => (

                    <option
                      key={level}
                      value={level}
                      className="bg-slate-950"
                    >
                      {level}
                    </option>

                  ))}

                </select>

              </div>

              <Input
                label="Issue Title"
                name="title"
                placeholder="Brief summary of the problem"
                value={formData.title}
                onChange={handleChange}
              />

              <div>

                <label className="mb-2 block text-sm font-semibold text-slate-300">
                  Issue Description
                </label>

                <textarea
                  rows={7}
                  required
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Describe what happened, the steps to reproduce it, and what you expected instead..."
                  className="
                    w-full
                    rounded-xl
                    border-2
                    border-slate-700
                    bg-slate-950
                    px-5
                    py-4
                    text-white
                    placeholder:text-slate-500
                    outline-none
                    resize-none
                    focus:border-blue-500
                  "
                />

              </div>

            </div>

          </section>  
                    {/* ================= SCREENSHOT ================= */}

          <section>

            <div className="mb-8 flex items-center gap-3">

              <div className="rounded-xl bg-blue-500/10 p-3">
                <Upload
                  size={22}
                  className="text-blue-500"
                />
              </div>

              <div>

                <h2 className="text-2xl font-black">
                  Screenshot / Attachment
                </h2>

                <p className="text-slate-400">
                  Upload a screenshot to help us understand the issue faster.
                </p>

              </div>

            </div>

            <label
              htmlFor="screenshot"
              className="
                flex
                cursor-pointer
                flex-col
                items-center
                justify-center
                rounded-3xl
                border-2
                border-dashed
                border-slate-700
                bg-slate-950
                px-8
                py-12
                transition-all
                hover:border-blue-500
                hover:bg-slate-900
              "
            >

              <Upload
                size={48}
                className="text-blue-500"
              />

              <h3 className="mt-5 text-xl font-bold">
                Click to upload
              </h3>

              <p className="mt-2 text-center text-slate-400">
                PNG, JPG, JPEG, WEBP (Maximum 10MB)
              </p>

              {formData.screenshot && (
                <div className="mt-5 rounded-xl bg-blue-500/10 px-5 py-3 text-sm text-blue-400">
                  Selected: {formData.screenshot.name}
                </div>
              )}

              <input
                id="screenshot"
                type="file"
                name="screenshot"
                accept="image/*"
                onChange={handleChange}
                className="hidden"
              />

            </label>

          </section>





          {/* ================= DEVICE INFORMATION ================= */}

          <section>

            <div className="mb-8">

              <h2 className="text-2xl font-black">
                Device Information
              </h2>

              <p className="mt-2 text-slate-400">
                This helps us reproduce the problem.
              </p>

            </div>

            <div className="grid gap-6 md:grid-cols-2">

              <Input
                label="Browser"
                name="browser"
                placeholder="Chrome 138, Firefox, Safari..."
                value={formData.browser}
                onChange={handleChange}
              />

              <Input
                label="Device / Operating System"
                name="device"
                placeholder="Windows 11, macOS, Android..."
                value={formData.device}
                onChange={handleChange}
              />

            </div>

          </section>





          {/* ================= CONFIRMATION ================= */}

          <section className="rounded-3xl border border-slate-800 bg-slate-950 p-8">

            <h2 className="text-2xl font-black">
              Confirmation
            </h2>

            <p className="mt-3 leading-7 text-slate-400">
              Before submitting, please confirm that the information you've
              provided is accurate and that the screenshot (if attached)
              doesn't contain sensitive personal information.
            </p>

            <label className="mt-8 flex cursor-pointer items-start gap-4">

              <input
                type="checkbox"
                name="agree"
                checked={formData.agree}
                onChange={handleChange}
                className="mt-1 h-5 w-5 accent-blue-600"
              />

              <span className="leading-7 text-slate-300">
                I confirm that the information provided is accurate and I
                understand that Scholiqen may contact me for additional details
                regarding this issue.
              </span>

            </label>

          </section>
                    {/* ================= BEFORE YOU SUBMIT ================= */}

          <section className="rounded-[30px] border border-slate-800 bg-slate-950 p-8">

            <div className="flex items-start gap-4">

              <div className="rounded-2xl bg-amber-500/10 p-4">
                <AlertTriangle
                  size={28}
                  className="text-amber-400"
                />
              </div>

              <div>

                <h2 className="text-2xl font-black">
                  Before You Submit
                </h2>

                <p className="mt-3 leading-7 text-slate-400">
                  Please review the following checklist to help our engineers
                  resolve your issue as quickly as possible.
                </p>

              </div>

            </div>

            <div className="mt-8 grid gap-5 md:grid-cols-2">

              <ChecklistItem text="Clearly describe the issue." />

              <ChecklistItem text="Include steps to reproduce it." />

              <ChecklistItem text="Attach a screenshot if available." />

              <ChecklistItem text="Select the correct issue category." />

              <ChecklistItem text="Choose the correct severity." />

              <ChecklistItem text="Provide your browser and device." />

            </div>

          </section>





          {/* ================= RESPONSE TIME ================= */}

          <section className="grid gap-6 lg:grid-cols-3">

            <div className="rounded-3xl border border-slate-800 bg-slate-950 p-7">

              <h3 className="text-lg font-bold">
                🟢 Low Priority
              </h3>

              <p className="mt-3 leading-7 text-slate-400">
                Cosmetic issues, spelling mistakes and minor UI problems.
              </p>

              <div className="mt-5 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold">
                Response: 3–7 Days
              </div>

            </div>

            <div className="rounded-3xl border border-slate-800 bg-slate-950 p-7">

              <h3 className="text-lg font-bold">
                🟠 High Priority
              </h3>

              <p className="mt-3 leading-7 text-slate-400">
                Broken features affecting learning or instructors.
              </p>

              <div className="mt-5 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold">
                Response: 24–48 Hours
              </div>

            </div>

            <div className="rounded-3xl border border-red-500/30 bg-red-500/5 p-7">

              <h3 className="text-lg font-bold text-red-400">
                🔴 Critical
              </h3>

              <p className="mt-3 leading-7 text-slate-400">
                Payment failures, security vulnerabilities or platform outages.
              </p>

              <div className="mt-5 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold">
                Immediate Review
              </div>

            </div>

          </section>





          {/* ================= SUBMIT ================= */}

          <section className="rounded-[32px] border border-blue-500/20 bg-blue-500/5 p-8">

            <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">

              <div>

                <h2 className="text-3xl font-black">
                  Ready to submit?
                </h2>

                <p className="mt-3 max-w-2xl leading-7 text-slate-400">
                  Once submitted, our engineering team will investigate the
                  issue and keep you updated if additional information is
                  required.
                </p>

              </div>

              <button
                type="submit"
                disabled={loading}
                className="
                  flex
                  items-center
                  justify-center
                  gap-3
                  rounded-2xl
                  bg-blue-600
                  px-10
                  py-5
                  text-lg
                  font-bold
                  transition
                  hover:bg-blue-700
                  disabled:cursor-not-allowed
                  disabled:opacity-60
                "
              >

                <Send size={22} />

                {loading
                  ? "Submitting..."
                  : "Submit Report"}

              </button>

            </div>

          </section>
                  </motion.form>

      </main>

    </div>
  );
};

/* ================= INPUT ================= */

const Input = ({
  label,
  placeholder,
  ...props
}) => (
  <div>

    <label className="mb-2 block text-sm font-semibold text-slate-300">
      {label}
    </label>

    <input
      {...props}
      required
      placeholder={placeholder}
      className="
        w-full
        rounded-xl
        border-2
        border-slate-700
        bg-slate-950
        px-5
        py-4
        text-white
        placeholder:text-slate-500
        outline-none
        transition-all
        focus:border-blue-500
        focus:ring-4
        focus:ring-blue-500/20
      "
    />

  </div>
);

/* ================= CHECKLIST ITEM ================= */

const ChecklistItem = ({ text }) => (
  <div className="flex items-start gap-3 rounded-2xl border border-slate-800 bg-slate-900 p-5">

    <CheckCircle2
      size={20}
      className="mt-0.5 shrink-0 text-green-500"
    />

    <span className="leading-6 text-slate-300">
      {text}
    </span>

  </div>
);

export default ReportIssue;