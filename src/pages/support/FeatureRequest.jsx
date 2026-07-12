import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Lightbulb,
  Send,
  CheckCircle2,
  Upload,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Cog from "../../assets/cog.png";

const categories = [
  "Dashboard",
  "Learning Management System (LMS)",
  "AI Tutor",
  "Virtual Labs",
  "CBT",
  "Curriculum",
  "Assignments",
  "Certificates",
  "Student Profile",
  "Instructor Portal",
  "Mobile App",
  "Payments",
  "Authentication",
  "Community",
  "Other",
];

const priorities = [
  "Nice to Have",
  "Important",
  "High Impact",
  "Game Changer",
];

const FeatureRequest = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    category: "",
    priority: "",
    title: "",
    description: "",
    benefits: "",
    mockup: null,
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
      alert("Please accept the agreement.");
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
      <div className="flex min-h-screen items-center justify-center bg-slate-950 px-6">

        <motion.div
          initial={{ opacity: 0, scale: .9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-xl rounded-[32px] border border-slate-800 bg-slate-900 p-10 text-center"
        >

          <CheckCircle2
            size={70}
            className="mx-auto text-blue-500"
          />

          <h1 className="mt-6 text-4xl font-black">
            Feature Submitted
          </h1>

          <p className="mt-5 leading-7 text-slate-400">
            Thank you for sharing your idea.
            Every suggestion helps us improve Scholiqen.
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
            className="flex items-center gap-2 text-slate-400 transition hover:text-white"
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
                Innovation Hub
              </p>

            </div>

          </div>

          <div className="rounded-full border border-yellow-500/30 bg-yellow-500/10 px-5 py-2 text-sm font-semibold text-yellow-400">
            Feature Request
          </div>

        </div>

      </header>

      <main className="mx-auto max-w-6xl px-6 py-10">

        {/* ================= HERO ================= */}

        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-[36px] border border-slate-800 bg-slate-900 p-10 text-center"
        >

          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-yellow-500/10">
            <Lightbulb
              size={40}
              className="text-yellow-400"
            />
          </div>

          <h1 className="mt-6 text-5xl font-black">
            Suggest a Feature
          </h1>

          <p className="mx-auto mt-5 max-w-3xl leading-8 text-slate-400">
            Have an idea that could improve Scholiqen?
            Tell us about it. Great ideas often come directly
            from our learners and instructors.
          </p>

        </motion.div>

        {/* ================= FORM ================= */}

        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-10 space-y-10 rounded-[32px] border border-slate-800 bg-slate-900 p-8"
        >
                      {/* ================= PERSONAL INFORMATION ================= */}

          <section>

            <div className="mb-8 flex items-center gap-4">

              <div className="rounded-2xl bg-blue-500/10 p-4">
                <Lightbulb
                  size={22}
                  className="text-blue-500"
                />
              </div>

              <div>

                <h2 className="text-2xl font-black">
                  Your Information
                </h2>

                <p className="text-slate-400">
                  Let us know who is submitting this feature request.
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

            </div>

          </section>





          {/* ================= FEATURE DETAILS ================= */}

          <section>

            <div className="mb-8">

              <h2 className="text-2xl font-black">
                Feature Details
              </h2>

              <p className="mt-2 text-slate-400">
                Tell us exactly what you'd like to see added to Scholiqen.
              </p>

            </div>

            <div className="space-y-6">

              {/* Category */}

              <div>

                <label className="mb-2 block text-sm font-semibold text-slate-300">
                  Feature Category
                </label>

                <select
                  required
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
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

                  {categories.map((item) => (

                    <option
                      key={item}
                      value={item}
                      className="bg-slate-950 text-white"
                    >
                      {item}
                    </option>

                  ))}

                </select>

              </div>

              {/* Priority */}

              <div>

                <label className="mb-2 block text-sm font-semibold text-slate-300">
                  Expected Impact
                </label>

                <select
                  required
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
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
                    Select impact
                  </option>

                  {priorities.map((item) => (

                    <option
                      key={item}
                      value={item}
                      className="bg-slate-950 text-white"
                    >
                      {item}
                    </option>

                  ))}

                </select>

              </div>

              {/* Title */}

              <Input
                label="Feature Title"
                name="title"
                placeholder="Example: AI Study Planner"
                value={formData.title}
                onChange={handleChange}
              />

              {/* Description */}

              <div>

                <label className="mb-2 block text-sm font-semibold text-slate-300">
                  Feature Description
                </label>

                <textarea
                  rows={7}
                  required
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Describe the feature in detail. Explain how it should work and what problem it solves..."
                  className="
                    w-full
                    resize-none
                    rounded-xl
                    border-2
                    border-slate-700
                    bg-slate-950
                    px-5
                    py-4
                    text-white
                    placeholder:text-slate-500
                    outline-none
                    focus:border-blue-500
                  "
                />

              </div>

            </div>

          </section>
                    {/* ================= BENEFITS ================= */}

          <section>

            <div className="mb-8">

              <h2 className="text-2xl font-black">
                Expected Benefits
              </h2>

              <p className="mt-2 text-slate-400">
                Help us understand why this feature is valuable.
              </p>

            </div>

            <div className="space-y-6">

              <div>

                <label className="mb-2 block text-sm font-semibold text-slate-300">
                  Who will benefit from this feature?
                </label>

                <textarea
                  rows={5}
                  required
                  name="benefits"
                  value={formData.benefits}
                  onChange={handleChange}
                  placeholder="Example: This feature will help students organize their study schedule more efficiently and improve productivity."
                  className="
                    w-full
                    resize-none
                    rounded-xl
                    border-2
                    border-slate-700
                    bg-slate-950
                    px-5
                    py-4
                    text-white
                    placeholder:text-slate-500
                    outline-none
                    transition
                    focus:border-blue-500
                    focus:ring-4
                    focus:ring-blue-500/20
                  "
                />

              </div>

            </div>

          </section>





          {/* ================= MOCKUP / IMAGE ================= */}

          <section>

            <div className="mb-8">

              <h2 className="text-2xl font-black">
                Attach Mockup (Optional)
              </h2>

              <p className="mt-2 text-slate-400">
                Upload a sketch, screenshot or UI design to explain your idea.
              </p>

            </div>

            <label
              htmlFor="mockup"
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
                py-14
                text-center
                transition
                hover:border-blue-500
                hover:bg-slate-900
              "
            >

              <Upload
                size={46}
                className="text-blue-500"
              />

              <h3 className="mt-6 text-xl font-bold">
                Upload Mockup
              </h3>

              <p className="mt-3 text-slate-400">
                PNG, JPG, JPEG or PDF (Max 10MB)
              </p>

              {formData.mockup && (
                <div className="mt-5 rounded-xl bg-blue-500/10 px-5 py-3 text-blue-400">
                  {formData.mockup.name}
                </div>
              )}

              <input
                id="mockup"
                type="file"
                accept=".png,.jpg,.jpeg,.pdf"
                name="mockup"
                onChange={handleChange}
                className="hidden"
              />

            </label>

          </section>





          {/* ================= ADDITIONAL NOTES ================= */}

          <section>

            <div className="mb-8">

              <h2 className="text-2xl font-black">
                Additional Notes
              </h2>

              <p className="mt-2 text-slate-400">
                Anything else you'd like our product team to know?
              </p>

            </div>

            <textarea
              rows={6}
              placeholder="Add extra information, examples, references, links or implementation ideas..."
              className="
                w-full
                resize-none
                rounded-xl
                border-2
                border-slate-700
                bg-slate-950
                px-5
                py-4
                text-white
                placeholder:text-slate-500
                outline-none
                transition
                focus:border-blue-500
                focus:ring-4
                focus:ring-blue-500/20
              "
            />

          </section>
                    {/* ================= COMMUNITY GUIDELINES ================= */}

          <section className="rounded-[30px] border border-slate-800 bg-slate-950 p-8">

            <h2 className="text-2xl font-black">
              Community Guidelines
            </h2>

            <p className="mt-3 leading-7 text-slate-400">
              We welcome every suggestion. Please make sure your request is
              respectful, original and clearly explains the value it brings to
              Scholiqen users.
            </p>

            <div className="mt-8 grid gap-5 md:grid-cols-2">

              <GuidelineItem text="Submit original feature ideas." />

              <GuidelineItem text="Explain the problem your idea solves." />

              <GuidelineItem text="Avoid duplicate feature requests." />

              <GuidelineItem text="Keep descriptions detailed and clear." />

              <GuidelineItem text="Respect community guidelines." />

              <GuidelineItem text="Upload only relevant mockups." />

            </div>

          </section>





          {/* ================= REVIEW TIMELINE ================= */}

          <section className="grid gap-6 lg:grid-cols-3">

            <div className="rounded-3xl border border-slate-800 bg-slate-950 p-7">

              <div className="text-3xl">📝</div>

              <h3 className="mt-5 text-xl font-bold">
                Submission
              </h3>

              <p className="mt-3 leading-7 text-slate-400">
                Your feature request is received and stored securely.
              </p>

            </div>

            <div className="rounded-3xl border border-slate-800 bg-slate-950 p-7">

              <div className="text-3xl">👨‍💻</div>

              <h3 className="mt-5 text-xl font-bold">
                Product Review
              </h3>

              <p className="mt-3 leading-7 text-slate-400">
                Our design and engineering teams review every suggestion.
              </p>

            </div>

            <div className="rounded-3xl border border-blue-500/30 bg-blue-500/5 p-7">

              <div className="text-3xl">🚀</div>

              <h3 className="mt-5 text-xl font-bold text-blue-400">
                Implementation
              </h3>

              <p className="mt-3 leading-7 text-slate-400">
                Popular and impactful ideas may become part of future releases.
              </p>

            </div>

          </section>





          {/* ================= AGREEMENT ================= */}

          <section className="rounded-[30px] border border-slate-800 bg-slate-950 p-8">

            <label className="flex cursor-pointer items-start gap-4">

              <input
                type="checkbox"
                name="agree"
                checked={formData.agree}
                onChange={handleChange}
                className="mt-1 h-5 w-5 accent-blue-600"
              />

              <span className="leading-7 text-slate-300">
                I confirm that this feature request is my own idea and I
                understand that submitting it does not guarantee it will be
                implemented. I agree to the Scholiqen Community Guidelines.
              </span>

            </label>

          </section>





          {/* ================= SUBMIT ================= */}

          <section className="rounded-[32px] border border-blue-500/20 bg-blue-500/5 p-8">

            <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">

              <div>

                <h2 className="text-3xl font-black">
                  Ready to submit your idea?
                </h2>

                <p className="mt-3 max-w-2xl leading-7 text-slate-400">
                  Thank you for helping improve Scholiqen. Every feature request
                  is reviewed by our product team.
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
                  : "Submit Feature Request"}
              </button>

            </div>

          </section>
                  </motion.form>

      </main>

    </div>
  );
};

/* ================= INPUT COMPONENT ================= */

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

/* ================= GUIDELINE ITEM ================= */

const GuidelineItem = ({ text }) => (
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

export default FeatureRequest;