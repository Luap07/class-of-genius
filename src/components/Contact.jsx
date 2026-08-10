import React, { useState } from "react";
import {
  MessageCircle,
  Send,
  Mail,
  User,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { supabase } from "../lib/supabaseClient";

const Contact = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  /* =========================================================
     HANDLE INPUT
  ========================================================= */

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (error) {
      setError("");
    }

    if (success) {
      setSuccess("");
    }
  };

  /* =========================================================
     SUBMIT CONTACT MESSAGE
  ========================================================= */

  const handleSubmit = async (e) => {
    e.preventDefault();

    setSuccess("");
    setError("");

    const name = form.name.trim();
    const email = form.email.trim();
    const message = form.message.trim();

    /* -------------------------------------------------------
       VALIDATION
    ------------------------------------------------------- */

    if (!name || !email || !message) {
      setError("Please fill in all fields.");
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    setLoading(true);

    try {
      /* =====================================================
         SAVE DIRECTLY TO SUPABASE

         NO EMAIL
         NO RESEND
         NO BACKEND
         NO API ROUTE
      ===================================================== */

      const { error: insertError } = await supabase
        .from("contact_messages")
        .insert([
          {
            name,
            email,
            message,
          },
        ]);

      if (insertError) {
        throw insertError;
      }

      /* -----------------------------------------------------
         SUCCESS
      ----------------------------------------------------- */

      setSuccess(
        "Your message has been sent successfully. The Scholiqen team will review it."
      );

      setForm({
        name: "",
        email: "",
        message: "",
      });
    } catch (err) {
      console.error("Contact form error:", err);

      setError(
        err?.message ||
          "Unable to send your message. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#050912] px-6 py-16 text-white">
      <div className="mx-auto w-full max-w-4xl">

        {/* =====================================================
            HEADER
        ===================================================== */}

        <div className="mb-10 text-center">

          <div
            className="
              mx-auto
              mb-4
              flex
              h-14
              w-14
              items-center
              justify-center
              rounded-2xl
              border
              border-cyan-500/20
              bg-cyan-500/10
              text-cyan-400
            "
          >
            <Mail size={26} />
          </div>

          <h1
            className="
              text-4xl
              font-black
              tracking-tight
              sm:text-5xl
            "
          >
            Get in{" "}
            <span className="text-cyan-400">
              Touch
            </span>
          </h1>

          <p
            className="
              mx-auto
              mt-4
              max-w-2xl
              text-base
              leading-7
              text-slate-400
            "
          >
            Have a question, suggestion,
            partnership idea or need help?
            Send us a message and the
            Scholiqen team will review it.
          </p>

        </div>

        {/* =====================================================
            CONTACT CARD
        ===================================================== */}

        <div
          className="
            overflow-hidden
            rounded-[30px]
            border
            border-white/[0.07]
            bg-[#0b1220]/90
            shadow-[0_30px_100px_rgba(0,0,0,0.35)]
            backdrop-blur-2xl
          "
        >

          {/* ===================================================
              CARD HEADER
          =================================================== */}

          <div
            className="
              border-b
              border-white/[0.06]
              bg-gradient-to-r
              from-cyan-500/[0.07]
              via-transparent
              to-blue-500/[0.07]
              px-7
              py-6
              sm:px-9
            "
          >
            <h2 className="text-xl font-bold">
              Send us a message
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Your message will be securely
              submitted to the Scholiqen
              administration team.
            </p>
          </div>

          {/* ===================================================
              FORM
          =================================================== */}

          <form
            onSubmit={handleSubmit}
            className="space-y-6 p-7 sm:p-9"
          >

            {/* =================================================
                NAME
            ================================================= */}

            <div>

              <label
                htmlFor="name"
                className="
                  mb-2
                  block
                  text-sm
                  font-semibold
                  text-slate-300
                "
              >
                Your Name
              </label>

              <div className="relative">

                <User
                  size={18}
                  className="
                    absolute
                    left-4
                    top-1/2
                    -translate-y-1/2
                    text-slate-500
                  "
                />

                <input
                  id="name"
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Enter your name"
                  disabled={loading}
                  autoComplete="name"
                  className="
                    w-full
                    rounded-2xl
                    border
                    border-slate-800
                    bg-slate-950/70
                    py-4
                    pl-12
                    pr-4
                    text-white
                    outline-none
                    placeholder:text-slate-600
                    transition
                    focus:border-cyan-500/50
                    focus:ring-2
                    focus:ring-cyan-500/10
                    disabled:cursor-not-allowed
                    disabled:opacity-60
                  "
                />

              </div>

            </div>

            {/* =================================================
                EMAIL
            ================================================= */}

            <div>

              <label
                htmlFor="email"
                className="
                  mb-2
                  block
                  text-sm
                  font-semibold
                  text-slate-300
                "
              >
                Email Address
              </label>

              <div className="relative">

                <Mail
                  size={18}
                  className="
                    absolute
                    left-4
                    top-1/2
                    -translate-y-1/2
                    text-slate-500
                  "
                />

                <input
                  id="email"
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  disabled={loading}
                  autoComplete="email"
                  className="
                    w-full
                    rounded-2xl
                    border
                    border-slate-800
                    bg-slate-950/70
                    py-4
                    pl-12
                    pr-4
                    text-white
                    outline-none
                    placeholder:text-slate-600
                    transition
                    focus:border-cyan-500/50
                    focus:ring-2
                    focus:ring-cyan-500/10
                    disabled:cursor-not-allowed
                    disabled:opacity-60
                  "
                />

              </div>

            </div>

            {/* =================================================
                MESSAGE
            ================================================= */}

            <div>

              <label
                htmlFor="message"
                className="
                  mb-2
                  block
                  text-sm
                  font-semibold
                  text-slate-300
                "
              >
                Message
              </label>

              <textarea
                id="message"
                name="message"
                value={form.message}
                onChange={handleChange}
                placeholder="Tell us how we can help..."
                rows={7}
                disabled={loading}
                className="
                  w-full
                  resize-none
                  rounded-2xl
                  border
                  border-slate-800
                  bg-slate-950/70
                  p-4
                  text-white
                  outline-none
                  placeholder:text-slate-600
                  transition
                  focus:border-cyan-500/50
                  focus:ring-2
                  focus:ring-cyan-500/10
                  disabled:cursor-not-allowed
                  disabled:opacity-60
                "
              />

            </div>

            {/* =================================================
                SUCCESS
            ================================================= */}

            {success && (
              <div
                className="
                  flex
                  items-start
                  gap-3
                  rounded-2xl
                  border
                  border-emerald-500/20
                  bg-emerald-500/10
                  p-4
                  text-sm
                  text-emerald-300
                "
              >
                <CheckCircle2
                  size={20}
                  className="mt-0.5 shrink-0"
                />

                <span>
                  {success}
                </span>
              </div>
            )}

            {/* =================================================
                ERROR
            ================================================= */}

            {error && (
              <div
                className="
                  flex
                  items-start
                  gap-3
                  rounded-2xl
                  border
                  border-red-500/20
                  bg-red-500/10
                  p-4
                  text-sm
                  text-red-300
                "
              >
                <AlertCircle
                  size={20}
                  className="mt-0.5 shrink-0"
                />

                <span>
                  {error}
                </span>
              </div>
            )}

            {/* =================================================
                ACTIONS
            ================================================= */}

            <div className="grid gap-3 sm:grid-cols-2">

              {/* SEND MESSAGE */}

              <button
                type="submit"
                disabled={loading}
                className="
                  group
                  flex
                  items-center
                  justify-center
                  gap-3
                  rounded-2xl
                  bg-cyan-500
                  px-6
                  py-4
                  font-bold
                  text-slate-950
                  transition-all
                  duration-300
                  hover:-translate-y-0.5
                  hover:bg-cyan-400
                  hover:shadow-[0_15px_40px_rgba(6,182,212,0.20)]
                  disabled:cursor-not-allowed
                  disabled:opacity-60
                  disabled:hover:translate-y-0
                "
              >
                <Send
                  size={18}
                  className={
                    loading
                      ? "animate-pulse"
                      : ""
                  }
                />

                {loading
                  ? "Sending..."
                  : "Send Message"}

                {!loading && (
                  <Send
                    size={16}
                    className="
                      transition-transform
                      duration-300
                      group-hover:translate-x-1
                    "
                  />
                )}
              </button>

              {/* WHATSAPP */}

              <a
                href="https://wa.me/2348153274924"
                target="_blank"
                rel="noopener noreferrer"
                className="
                  flex
                  items-center
                  justify-center
                  gap-3
                  rounded-2xl
                  border
                  border-emerald-500/20
                  bg-emerald-500/10
                  px-6
                  py-4
                  font-bold
                  text-emerald-300
                  transition-all
                  duration-300
                  hover:-translate-y-0.5
                  hover:border-emerald-400/30
                  hover:bg-emerald-500/15
                "
              >
                <MessageCircle size={19} />

                Chat on WhatsApp
              </a>

            </div>

            {/* =================================================
                SECURITY
            ================================================= */}

            <p
              className="
                text-center
                text-xs
                leading-5
                text-slate-600
              "
            >
              Your message is securely
              submitted to the Scholiqen
              administration system.
            </p>

          </form>

        </div>

      </div>
    </div>
  );
};

export default Contact;