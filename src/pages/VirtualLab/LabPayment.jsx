import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Atom,
  FlaskConical,
  Dna,
  Calculator,
  CheckCircle2,
  Lock,
  ShieldCheck,
  Sparkles,
  Loader2,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";

const LAB_PRICE_USD = 7;

const laboratories = {
  physics: {
    title: "Physics Laboratory",
    icon: Atom,
    gradient: "from-cyan-400 to-blue-600",
    description:
      "Explore motion, force, electricity, waves, energy and mechanics through interactive simulations.",
    experiments: 24,
  },

  chemistry: {
    title: "Chemistry Laboratory",
    icon: FlaskConical,
    gradient: "from-green-400 to-emerald-600",
    description:
      "Investigate reactions, molecules, chemical properties and laboratory processes through simulations.",
    experiments: 18,
  },

  biology: {
    title: "Biology Laboratory",
    icon: Dna,
    gradient: "from-pink-400 to-purple-600",
    description:
      "Discover cells, genetics, ecosystems and human body systems through interactive experiments.",
    experiments: 20,
  },

  mathematics: {
    title: "Mathematics Laboratory",
    icon: Calculator,
    gradient: "from-orange-400 to-red-600",
    description:
      "Visualize graphs, geometry, statistics, algebra and mathematical models interactively.",
    experiments: 16,
  },
};

const LabPayment = () => {
  const navigate = useNavigate();
  const { subject } = useParams();
  const { user } = useContext(AuthContext);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const laboratory = useMemo(
    () => laboratories[subject?.toLowerCase()],
    [subject]
  );

  /* ============================================================
     INVALID SUBJECT
  ============================================================ */

  if (!laboratory) {
    return (
      <div className="min-h-screen bg-[#020617] text-white flex items-center justify-center px-6">
        <div className="text-center">
          <h1 className="text-3xl font-black">
            Laboratory Not Found
          </h1>

          <p className="mt-3 text-slate-400">
            The laboratory you are trying to access does not exist.
          </p>

          <button
            type="button"
            onClick={() => navigate("/lab")}
            className="mt-6 rounded-xl bg-cyan-500 px-6 py-3 font-bold text-slate-950"
          >
            Back to Virtual Lab
          </button>
        </div>
      </div>
    );
  }

  const Icon = laboratory.icon;

  /* ============================================================
     PAYMENT
  ============================================================ */

  const handlePayment = async () => {
    setError("");

    if (!user) {
      navigate("/login", {
        state: {
          from: `/lab/payment/${subject}`,
        },
      });

      return;
    }

    try {
      setLoading(true);

      /*
        IMPORTANT:

        Do NOT put your Paystack SECRET KEY here.

        Your backend should expose something like:

        POST /api/lab/payment/initialize

        and receive:

        {
          subject: "physics",
          userId: user.id
        }

        The backend should create the Paystack transaction
        and return the authorization_url.
      */

      const response = await fetch(
        "/api/lab/payment/initialize",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            subject: subject.toLowerCase(),
            userId: user.id,
            amount: LAB_PRICE_USD,
            currency: "USD",
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message ||
            "Unable to initialize payment."
        );
      }

      if (!data?.authorization_url) {
        throw new Error(
          "Payment URL was not returned by the server."
        );
      }

      /*
        Send the user to Paystack.
      */

      window.location.href = data.authorization_url;
    } catch (err) {
      console.error("Lab payment error:", err);

      setError(
        err?.message ||
          "Something went wrong while starting payment."
      );

      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#020617] text-white">

      {/* ======================================================
          BACKGROUND
      ====================================================== */}

      <div className="pointer-events-none absolute inset-0">

        <div className="absolute left-[-150px] top-[-150px] h-[500px] w-[500px] rounded-full bg-cyan-500/10 blur-[150px]" />

        <div className="absolute bottom-[-150px] right-[-150px] h-[500px] w-[500px] rounded-full bg-purple-500/10 blur-[150px]" />

        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,.2) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,.2) 1px, transparent 1px)
            `,
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      {/* ======================================================
          CONTENT
      ====================================================== */}

      <main className="relative z-10 mx-auto flex min-h-screen max-w-6xl items-center px-6 py-16">

        <div className="grid w-full gap-10 lg:grid-cols-[1.1fr_.9fr]">

          {/* ==================================================
              LEFT
          ================================================== */}

          <motion.div
            initial={{
              opacity: 0,
              x: -30,
            }}
            animate={{
              opacity: 1,
              x: 0,
            }}
            transition={{
              duration: 0.6,
            }}
            className="flex flex-col justify-center"
          >

            <button
              type="button"
              onClick={() => navigate("/lab")}
              className="mb-8 flex w-fit items-center gap-2 text-sm font-bold text-slate-400 transition hover:text-white"
            >
              <ArrowLeft size={18} />
              Back to Virtual Laboratory
            </button>

            <div
              className={`mb-7 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br ${laboratory.gradient} shadow-2xl`}
            >
              <Icon size={38} />
            </div>

            <div className="flex items-center gap-2 text-sm font-black uppercase tracking-[0.2em] text-cyan-400">
              <Sparkles size={15} />
              Premium Laboratory
            </div>

            <h1 className="mt-4 text-5xl font-black leading-tight md:text-6xl">
              Unlock Your
              <span className="block text-cyan-400">
                {laboratory.title}
              </span>
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate-400">
              {laboratory.description}
            </p>

            <div className="mt-8 grid max-w-xl gap-4 sm:grid-cols-2">

              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-xl">
                <p className="text-2xl font-black text-white">
                  {laboratory.experiments}
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  Interactive Experiments
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-xl">
                <p className="text-2xl font-black text-white">
                  AI
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  Guided Learning Support
                </p>
              </div>

            </div>

          </motion.div>

          {/* ==================================================
              PAYMENT CARD
          ================================================== */}

          <motion.div
            initial={{
              opacity: 0,
              y: 30,
              scale: 0.97,
            }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
            }}
            transition={{
              duration: 0.6,
            }}
            className="relative"
          >

            <div className="absolute -inset-1 rounded-[2rem] bg-gradient-to-r from-cyan-500/20 via-blue-500/20 to-purple-500/20 blur-xl" />

            <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-slate-900/90 p-8 shadow-2xl backdrop-blur-2xl md:p-10">

              {/* TOP */}

              <div className="flex items-center justify-between">

                <div>
                  <p className="text-xs font-black uppercase tracking-widest text-slate-500">
                    Laboratory Access
                  </p>

                  <h2 className="mt-2 text-2xl font-black">
                    {laboratory.title}
                  </h2>
                </div>

                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-400/10 text-amber-300">
                  <Lock size={21} />
                </div>

              </div>

              {/* PRICE */}

              <div className="my-8 rounded-3xl border border-cyan-400/10 bg-cyan-400/[0.04] p-7">

                <p className="text-xs font-black uppercase tracking-widest text-slate-500">
                  One-time access
                </p>

                <div className="mt-2 flex items-end gap-2">

                  <span className="text-6xl font-black tracking-tight">
                    ${LAB_PRICE_USD}
                  </span>

                  <span className="mb-2 text-sm font-bold text-slate-500">
                    USD
                  </span>

                </div>

                <p className="mt-3 text-sm text-slate-400">
                  Unlock this laboratory and access all
                  included experiments.
                </p>

              </div>

              {/* FEATURES */}

              <div className="space-y-4">

                {[
                  "Full laboratory access",
                  `${laboratory.experiments} interactive experiments`,
                  "Real-time simulations",
                  "AI-powered learning guidance",
                ].map((feature) => (
                  <div
                    key={feature}
                    className="flex items-center gap-3"
                  >
                    <CheckCircle2
                      size={18}
                      className="shrink-0 text-cyan-400"
                    />

                    <span className="text-sm font-semibold text-slate-300">
                      {feature}
                    </span>
                  </div>
                ))}

              </div>

              {/* ERROR */}

              {error && (
                <div className="mt-6 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm font-semibold text-red-300">
                  {error}
                </div>
              )}

              {/* PAYMENT BUTTON */}

              <button
                type="button"
                onClick={handlePayment}
                disabled={loading}
                className="
                  mt-8
                  flex
                  w-full
                  items-center
                  justify-center
                  gap-3
                  rounded-2xl
                  bg-gradient-to-r
                  from-cyan-400
                  via-blue-500
                  to-indigo-500
                  px-6
                  py-4
                  font-black
                  text-slate-950
                  shadow-xl
                  shadow-cyan-500/10
                  transition-all
                  hover:-translate-y-1
                  hover:shadow-cyan-500/20
                  disabled:cursor-not-allowed
                  disabled:opacity-60
                "
              >
                {loading ? (
                  <>
                    <Loader2
                      size={20}
                      className="animate-spin"
                    />

                    Preparing Payment...
                  </>
                ) : (
                  <>
                    Unlock {laboratory.title}

                    <ArrowRightIcon />
                  </>
                )}
              </button>

              {/* SECURITY */}

              <div className="mt-6 flex items-start gap-3 rounded-2xl border border-white/[0.06] bg-white/[0.025] p-4">

                <ShieldCheck
                  size={20}
                  className="mt-0.5 shrink-0 text-green-400"
                />

                <div>
                  <p className="text-sm font-bold text-white">
                    Secure payment
                  </p>

                  <p className="mt-1 text-xs leading-relaxed text-slate-500">
                    Your payment is processed securely.
                    Your card information is not stored by
                    the Virtual Laboratory.
                  </p>
                </div>

              </div>

              {/* ACCOUNT */}

              {user?.email && (
                <p className="mt-5 text-center text-xs text-slate-600">
                  Payment will be associated with{" "}
                  <span className="text-slate-400">
                    {user.email}
                  </span>
                </p>
              )}

            </div>

          </motion.div>

        </div>

      </main>
    </div>
  );
};

/* ============================================================
   SMALL ARROW COMPONENT
============================================================ */

const ArrowRightIcon = () => (
  <svg
    width="19"
    height="19"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M5 12h14" />
    <path d="m12 5 7 7-7 7" />
  </svg>
);

export default LabPayment;
