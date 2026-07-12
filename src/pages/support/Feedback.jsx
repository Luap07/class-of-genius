import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  MessageSquare,
  Star,
  CheckCircle2,
  Send,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Cog from "../../assets/cog.png";

const feedbackTypes = [
  "General Feedback",
  "Website Design",
  "Learning Experience",
  "Instructor Experience",
  "AI Tutor",
  "Virtual Labs",
  "CBT",
  "LMS",
  "Performance",
  "Bug Feedback",
  "Suggestion",
  "Other",
];

const Feedback = () => {
  const navigate = useNavigate();

  const [rating, setRating] = useState(0);

  const [loading, setLoading] = useState(false);

  const [submitted, setSubmitted] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    type: "",
    title: "",
    feedback: "",
    anonymous: false,
  });

  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (rating === 0) {
      alert("Please select a rating.");
      return;
    }

    setLoading(true);

    setTimeout(() => {
      console.log({
        ...formData,
        rating,
      });

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
            size={72}
            className="mx-auto text-blue-500"
          />

          <h1 className="mt-6 text-4xl font-black">
            Thank You!
          </h1>

          <p className="mt-5 leading-7 text-slate-400">
            Your feedback has been received.
            We appreciate every suggestion because it helps us improve Scholiqen.
          </p>

          <button
            onClick={() => navigate("/dashboard")}
            className="mt-8 rounded-2xl bg-blue-600 px-8 py-4 font-bold transition hover:bg-blue-700"
          >
            Back to Dashboard
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
                Feedback Center
              </p>

            </div>

          </div>

          <div className="rounded-full border border-blue-500/30 bg-blue-500/10 px-5 py-2 text-sm font-semibold text-blue-400">
            Feedback
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

          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-blue-500/10">

            <MessageSquare
              size={42}
              className="text-blue-500"
            />

          </div>

          <h1 className="mt-6 text-5xl font-black">
            Share Your Feedback
          </h1>

          <p className="mx-auto mt-5 max-w-3xl leading-8 text-slate-400">
            We'd love to hear your thoughts. Your ideas help us build a better
            learning experience for everyone.
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

            <div className="mb-8">

              <h2 className="text-2xl font-black">
                Your Information
              </h2>

              <p className="mt-2 text-slate-400">
                Tell us a little about yourself.
              </p>

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





          {/* ================= FEEDBACK TYPE ================= */}

          <section>

            <div className="mb-8">

              <h2 className="text-2xl font-black">
                Feedback Details
              </h2>

              <p className="mt-2 text-slate-400">
                Select the category that best describes your feedback.
              </p>

            </div>

            <div className="space-y-6">

              <div>

                <label className="mb-2 block text-sm font-semibold text-slate-300">
                  Feedback Category
                </label>

                <select
                  required
                  name="type"
                  value={formData.type}
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
                    transition
                    focus:border-blue-500
                  "
                >

                  <option value="">
                    Select Category
                  </option>

                  {feedbackTypes.map((item) => (

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

              <Input
                label="Feedback Title"
                name="title"
                placeholder="Briefly summarize your feedback"
                value={formData.title}
                onChange={handleChange}
              />

            </div>

          </section>





          {/* ================= RATING ================= */}

          <section>

            <div className="mb-8">

              <h2 className="text-2xl font-black">
                Rate Your Experience
              </h2>

              <p className="mt-2 text-slate-400">
                How satisfied are you with Scholiqen?
              </p>

            </div>

            <div className="rounded-3xl border border-slate-800 bg-slate-950 p-8">

              <div className="flex flex-wrap items-center justify-center gap-4">

                {[1, 2, 3, 4, 5].map((value) => (

                  <button
                    key={value}
                    type="button"
                    onClick={() => setRating(value)}
                    className="transition hover:scale-110"
                  >

                    <Star
                      size={44}
                      fill={rating >= value ? "#facc15" : "none"}
                      className={
                        rating >= value
                          ? "text-yellow-400"
                          : "text-slate-600"
                      }
                    />

                  </button>

                ))}

              </div>

              <p className="mt-6 text-center text-slate-400">

                {rating === 0 &&
                  "Click a star to rate your experience."}

                {rating === 1 &&
                  "Very Poor"}

                {rating === 2 &&
                  "Poor"}

                {rating === 3 &&
                  "Average"}

                {rating === 4 &&
                  "Good"}

                {rating === 5 &&
                  "Excellent"}

              </p>

            </div>

          </section>
                    {/* ================= FEEDBACK MESSAGE ================= */}

          <section>

            <div className="mb-8">

              <h2 className="text-2xl font-black">
                Your Feedback
              </h2>

              <p className="mt-2 text-slate-400">
                Tell us what you think. The more details you provide, the more
                helpful your feedback will be.
              </p>

            </div>

            <div>

              <label className="mb-2 block text-sm font-semibold text-slate-300">
                Feedback Message
              </label>

              <textarea
                required
                rows={8}
                name="feedback"
                value={formData.feedback}
                onChange={handleChange}
                placeholder="Share your experience, suggestions, compliments, or concerns..."
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

          </section>





          {/* ================= ANONYMOUS OPTION ================= */}

          <section className="rounded-[30px] border border-slate-800 bg-slate-950 p-8">

            <h2 className="text-2xl font-black">
              Privacy
            </h2>

            <p className="mt-2 text-slate-400">
              If you'd rather not have your name associated with this feedback,
              you can submit it anonymously.
            </p>

            <label className="mt-6 flex cursor-pointer items-start gap-4">

              <input
                type="checkbox"
                name="anonymous"
                checked={formData.anonymous}
                onChange={handleChange}
                className="mt-1 h-5 w-5 accent-blue-600"
              />

              <span className="leading-7 text-slate-300">
                Submit this feedback anonymously.
              </span>

            </label>

          </section>





          {/* ================= FEEDBACK TIPS ================= */}

          <section className="rounded-[30px] border border-blue-500/20 bg-blue-500/5 p-8">

            <h2 className="text-2xl font-black">
              Tips for Great Feedback
            </h2>

            <p className="mt-3 leading-7 text-slate-400">
              Help us understand your experience by being as specific as
              possible.
            </p>

            <div className="mt-8 grid gap-5 md:grid-cols-2">

              <TipItem text="Describe what happened." />

              <TipItem text="Explain what you expected." />

              <TipItem text="Suggest possible improvements." />

              <TipItem text="Mention the page or feature involved." />

              <TipItem text="Keep your feedback respectful." />

              <TipItem text="Include examples when possible." />

            </div>

          </section>
                    {/* ================= AGREEMENT ================= */}

          <section className="rounded-[30px] border border-slate-800 bg-slate-950 p-8">

            <h2 className="text-2xl font-black">
              Confirmation
            </h2>

            <p className="mt-3 text-slate-400 leading-7">
              Please confirm that your feedback follows our community guidelines.
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
                I confirm that this feedback is respectful, truthful, and
                complies with the Scholiqen Community Guidelines. I understand
                that my feedback may be reviewed by the Scholiqen team to help
                improve the platform.
              </span>

            </label>

          </section>





          {/* ================= WHY FEEDBACK MATTERS ================= */}

          <section className="rounded-[30px] border border-slate-800 bg-slate-950 p-8">

            <div className="flex items-start gap-5">

              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-500/10">

                <MessageSquare
                  size={30}
                  className="text-blue-500"
                />

              </div>

              <div>

                <h2 className="text-2xl font-black">
                  Why Your Feedback Matters
                </h2>

                <p className="mt-4 leading-7 text-slate-400">
                  Every idea, compliment and suggestion helps us improve
                  Scholiqen. We regularly review feedback to guide product
                  decisions and enhance the learning experience for students,
                  instructors and institutions.
                </p>

              </div>

            </div>

          </section>





          {/* ================= SUBMIT ================= */}

          <section className="rounded-[32px] border border-blue-500/20 bg-blue-500/5 p-8">

            <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">

              <div>

                <h2 className="text-3xl font-black">
                  Ready to send your feedback?
                </h2>

                <p className="mt-3 max-w-2xl leading-7 text-slate-400">
                  Thanks for taking the time to help us improve Scholiqen. Your
                  opinion is valuable to us.
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
                  : "Submit Feedback"}

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

/* ================= TIP ITEM ================= */

const TipItem = ({ text }) => (
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

export default Feedback;