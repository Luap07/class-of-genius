import React, { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";

import Cog from "../../assets/cog.png";

import {
  BookOpen,
  GraduationCap,
  BrainCircuit,
  FlaskConical,
  FileCheck2,
  BookMarked,
  LifeBuoy,
  Mail,
  Info,
  ArrowUpRight,
  Loader2,
  CheckCircle2,
} from "lucide-react";

import {
  FaFacebookF,
  FaInstagram,
  FaLinkedinIn,
  FaXTwitter,
} from "react-icons/fa6";

const exploreLinks = [
  {
    title: "Categories",
    path: "/subjects",
    icon: GraduationCap,
  },
  {
    title: "Courses",
    path: "/courses",
    icon: BookOpen,
  },
  {
    title: "LMS Portal",
    path: "/lms",
    icon: BookMarked,
  },
  {
    title: "Become Instructor",
    path: "/become-instructor",
    icon: ArrowUpRight,
  },
];

const learningLinks = [
  {
    title: "AI Tutor",
    path: "/ai-tutor",
    icon: BrainCircuit,
  },
  {
    title: "Virtual Labs",
    path: "/lab",
    icon: FlaskConical,
  },
  {
    title: "CBT Exams",
    path: "/cbt",
    icon: FileCheck2,
  },
  {
    title: "Novels",
    path: "/novels",
    icon: BookOpen,
  },
];

const supportLinks = [
  {
    title: "Support",
    path: "/support",
    icon: LifeBuoy,
  },
  {
    title: "Contact",
    path: "/contact",
    icon: Mail,
  },
  {
    title: "About",
    path: "/about",
    icon: Info,
  },
];

const socials = [
    {
    icon: FaLinkedinIn,
    href: "#",
  },
  {
    icon: FaInstagram,
    href: "#",
  },
  {
    icon: FaFacebookF ,
    href: "#",
  },
  {
    icon: FaXTwitter ,
    href: "#",
  },
];

export default function CategoriesFooter() {
    const [email, setEmail] = useState("");
const [loading, setLoading] = useState(false);
const [message, setMessage] = useState("");
const [success, setSuccess] = useState(false);

const handleSubscribe = async () => {
  setMessage("");

  if (!email.trim()) {
    setSuccess(false);
    setMessage("Please enter your email.");
    return;
  }

  const emailRegex =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(email)) {
    setSuccess(false);
    setMessage("Enter a valid email address.");
    return;
  }

  try {
    setLoading(true);

    const { error } = await supabase
      .from("newsletter_subscribers")
      .insert([
        {
          email: email.trim().toLowerCase(),
        },
      ]);

    if (error) {
      if (
        error.code === "23505" ||
        error.message.toLowerCase().includes("duplicate")
      ) {
        setSuccess(false);
        setMessage("You're already subscribed.");
      } else {
        throw error;
      }
    } else {
      setSuccess(true);
      setMessage(
        "Successfully subscribed! 🎉"
      );
      setEmail("");
    }
  } catch (err) {
    setSuccess(false);
    setMessage(err.message);
  } finally {
    setLoading(false);
  }
};
  return (
    <footer
      className="
        relative
        mt-32
        overflow-hidden
        border-t
        border-cyan-500/20
        bg-slate-950
      "
    >
      {/* Background */}

      <div
        className="
          absolute
          inset-0
          bg-[radial-gradient(circle_at_top,rgba(6,182,212,.12),transparent_40%),radial-gradient(circle_at_bottom_right,rgba(59,130,246,.10),transparent_40%)]
        "
      />

      <div
        className="
          absolute
          inset-0
          opacity-[0.05]
          bg-[radial-gradient(#94a3b8_1px,transparent_1px)]
          [background-size:28px_28px]
        "
      />

      <div
        className="
          relative
          z-10
          mx-auto
          max-w-7xl
          px-6
          py-20
        "
      >
        <motion.div
          initial={{
            opacity: 0,
            y: 20,
          }}
          whileInView={{
            opacity: 1,
            y: 0,
          }}
          viewport={{
            once: true,
          }}
          transition={{
            duration: 0.6,
          }}
          className="
            grid
            gap-14
            lg:grid-cols-[1.3fr_1fr_1fr_1fr]
          "
        >
          {/* Brand Column */}

          <div>
            <div className="flex items-center gap-4">
              <div
                className="
                  flex
                  h-16
                  w-16
                  items-center
                  justify-center
                  rounded-3xl
                  border
                  border-cyan-500/30
                  bg-cyan-500/10
                "
              >
                <img
                  src={Cog}
                  alt="Scholiqen"
                  className="h-10 w-10 object-contain"
                />
              </div>

              <div>
                <h2 className="text-3xl font-black text-white">
                  SCHOLIQEN
                </h2>

                <p className="text-cyan-400">
                  Learn Beyond Limits
                </p>
              </div>
            </div>

            <p
              className="
                mt-8
                max-w-md
                leading-8
                text-slate-400
              "
            >
              Scholiqen combines professional
              courses, AI tutoring, virtual
              laboratories, assessments and
              interactive learning into one
              intelligent education platform.
            </p>
                        <div className="mt-10 flex gap-4">
              {socials.map((social, index) => {
                const Icon = social.icon;

                return (
                  <motion.a
                    key={index}
                    href={social.href}
                    whileHover={{
                      y: -5,
                      scale: 1.08,
                    }}
                    className="
                      flex
                      h-12
                      w-12
                      items-center
                      justify-center
                      rounded-2xl
                      border
                      border-slate-800
                      bg-slate-900/70
                      text-slate-300
                      transition
                      hover:border-cyan-400
                      hover:text-cyan-400
                    "
                  >
                    <Icon size={20} />
                  </motion.a>
                );
              })}
            </div>
          </div>

          {/* Explore */}

          <div>
            <h3 className="mb-6 text-xl font-bold text-white">
              Explore
            </h3>

            <div className="space-y-4">
              {exploreLinks.map((item) => {
                const Icon = item.icon;

                return (
                  <Link
                    key={item.title}
                    to={item.path}
                    className="
                      group
                      flex
                      items-center
                      gap-3
                      text-slate-400
                      transition
                      hover:text-cyan-400
                    "
                  >
                    <Icon
                      size={18}
                      className="
                        transition
                        group-hover:scale-110
                      "
                    />

                    <span>{item.title}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Learning */}

          <div>
            <h3 className="mb-6 text-xl font-bold text-white">
              Learning
            </h3>

            <div className="space-y-4">
              {learningLinks.map((item) => {
                const Icon = item.icon;

                return (
                  <Link
                    key={item.title}
                    to={item.path}
                    className="
                      group
                      flex
                      items-center
                      gap-3
                      text-slate-400
                      transition
                      hover:text-cyan-400
                    "
                  >
                    <Icon
                      size={18}
                      className="
                        transition
                        group-hover:scale-110
                      "
                    />

                    <span>{item.title}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Support */}

          <div>
            <h3 className="mb-6 text-xl font-bold text-white">
              Support
            </h3>

            <div className="space-y-4">
              {supportLinks.map((item) => {
                const Icon = item.icon;

                return (
                  <Link
                    key={item.title}
                    to={item.path}
                    className="
                      group
                      flex
                      items-center
                      gap-3
                      text-slate-400
                      transition
                      hover:text-cyan-400
                    "
                  >
                    <Icon
                      size={18}
                      className="
                        transition
                        group-hover:scale-110
                      "
                    />

                    <span>{item.title}</span>
                  </Link>
                );
              })}
            </div>
          </div>
                  </motion.div>

        {/* Newsletter */}

        <motion.div
          initial={{
            opacity: 0,
            y: 30,
          }}
          whileInView={{
            opacity: 1,
            y: 0,
          }}
          viewport={{
            once: true,
          }}
          transition={{
            delay: 0.2,
            duration: 0.6,
          }}
          className="
            mt-20
            overflow-hidden
            rounded-[32px]
            border
            border-cyan-500/20
            bg-gradient-to-r
            from-cyan-500/10
            via-blue-500/10
            to-indigo-500/10
            p-10
          "
        >
          <div
            className="
              flex
              flex-col
              gap-8
              lg:flex-row
              lg:items-center
              lg:justify-between
            "
          >
            <div>
              <span
                className="
                  rounded-full
                  border
                  border-cyan-500/30
                  bg-cyan-500/10
                  px-4
                  py-2
                  text-sm
                  font-semibold
                  text-cyan-300
                "
              >
                Join Scholiqen
              </span>

              <h3
                className="
                  mt-6
                  text-4xl
                  font-black
                  text-white
                "
              >
                Continue Your Learning Journey
              </h3>

              <p
                className="
                  mt-4
                  max-w-2xl
                  text-slate-300
                  leading-8
                "
              >
                Access professional courses,
                AI-powered tutoring, virtual
                laboratories, CBT practice,
                certificates and more—all in
                one intelligent learning
                platform.
              </p>
            </div>

            <div
  className="
    w-full
    max-w-xl
  "
>
  <div
    className="
      flex
      flex-col
      gap-4
      sm:flex-row
    "
  >
    <input
  type="email"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  onKeyDown={(e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSubscribe();
    }
  }}
  placeholder="Enter your email"
  className="
    flex-1
    rounded-2xl
    border
    border-slate-700
    bg-slate-950/80
    px-6
    py-4
    text-white
    outline-none
    transition
    placeholder:text-slate-500
    focus:border-cyan-400
  "
/>

    <button
      onClick={handleSubscribe}
      disabled={loading}
      className="
        flex
        items-center
        justify-center
        gap-3
        rounded-2xl
        bg-cyan-500
        px-8
        py-4
        font-bold
        text-slate-950
        transition
        hover:bg-cyan-400
        disabled:cursor-not-allowed
        disabled:opacity-60
      "
    >
      {loading ? (
        <>
          <Loader2
            size={18}
            className="animate-spin"
          />
          Subscribing...
        </>
      ) : (
        "Subscribe"
      )}
    </button>
  </div>

  {message && (
    <div
      className={`
        mt-4
        flex
        items-center
        gap-2
        text-sm
        ${
          success
            ? "text-emerald-400"
            : "text-red-400"
        }
      `}
    >
      {success && <CheckCircle2 size={16} />}
      <span>{message}</span>
    </div>
  )}
</div>
          </div>
        </motion.div>
                {/* Bottom Bar */}

        <div
          className="
            mt-14
            border-t
            border-slate-800
            pt-8
          "
        >
          <div
            className="
              flex
              flex-col
              gap-6
              text-sm
              text-slate-500
              md:flex-row
              md:items-center
              md:justify-between
            "
          >
            <p>
              © {new Date().getFullYear()} Scholiqen · Class Of Genius.
              All rights reserved.
            </p>

            <div
              className="
                flex
                flex-wrap
                items-center
                gap-6
              "
            >
              <Link
                to="/about"
                className="transition hover:text-cyan-400"
              >
                About
              </Link>

              <Link
                to="/services"
                className="transition hover:text-cyan-400"
              >
                Services
              </Link>

              <Link
                to="/support"
                className="transition hover:text-cyan-400"
              >
                Support
              </Link>

              <Link
                to="/contact"
                className="transition hover:text-cyan-400"
              >
                Contact
              </Link>
            </div>
          </div>
        </div>

      </div>
    </footer>
  );
}