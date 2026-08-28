import React, { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  CreditCard,
  Lock,
  ShieldCheck,
  Loader2,
  AlertCircle,
  BookOpen,
} from "lucide-react";

import { AuthContext } from "../../context/AuthContext";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

const CBT_PRICE_NAIRA = 5500;

const examDescriptions = {
  WAEC: "West African Examinations Council",
  NECO: "National Examinations Council",
  GCE: "General Certificate Examination",
  JAMB: "Joint Admissions & Matriculation Board",
  JUPEB: "Foundation examination",
  IJMB: "Interim Joint Matriculation Board",
  SAT: "Scholastic Assessment Test",
  IGCSE: "International GCSE",
  ACT: "American College Testing",
  IB: "International Baccalaureate",
  JEE: "Joint Entrance Examination",
  NEET: "National Eligibility Entrance Test",
  GCSE: "General Certificate of Secondary Education",
  HSC: "Higher School Certificate",
  VCE: "Victorian Certificate of Education",
  QCE: "Queensland Certificate of Education",
  NCEA: "National Certificate of Educational Achievement",
  IELTS: "International English Language Testing",
};

const CBTPayment = () => {
  const { exam } = useParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useContext(AuthContext);

  const [checkingAccess, setCheckingAccess] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState("");

  const examName = decodeURIComponent(exam || "").toUpperCase();

  /*
   * ============================================================
   * CHECK WHETHER USER HAS ALREADY PAID
   * ============================================================
   */

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      navigate("/login", {
        replace: true,
        state: {
          from: `/cbt/payment/${examName}`,
        },
      });

      return;
    }

    const checkAccess = async () => {
      try {
        setCheckingAccess(true);
        setError("");

        const token =
          user?.access_token ||
          user?.accessToken ||
          null;

        if (!token) {
          setError("Your login session has expired. Please log in again.");
          return;
        }

        const response = await fetch(
          `${API_URL}/api/cbt/access/${encodeURIComponent(
            examName
          )}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Unable to check payment access."
          );
        }

        if (data.hasAccess) {
          setHasAccess(true);
        }
      } catch (err) {
        console.error("CBT Access Error:", err);

        setError(
          err.message ||
            "Unable to check your CBT access."
        );
      } finally {
        setCheckingAccess(false);
      }
    };

    checkAccess();
  }, [user, authLoading, navigate, examName]);

  /*
   * ============================================================
   * PAY WITH PAYSTACK
   * ============================================================
   */

  const handlePayment = async () => {
    if (!user) {
      navigate("/login");
      return;
    }

    try {
      setPaying(true);
      setError("");

      const token =
        user?.access_token ||
        user?.accessToken ||
        null;

      if (!token) {
        throw new Error(
          "Your login session has expired. Please log in again."
        );
      }

      /*
       * Backend initializes Paystack transaction.
       *
       * IMPORTANT:
       * The Paystack SECRET KEY never comes to React.
       */

      const response = await fetch(
        `${API_URL}/api/cbt/payment/initialize`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            exam: examName,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to initialize payment."
        );
      }

      if (!data.authorization_url) {
        throw new Error(
          "Paystack did not return a payment URL."
        );
      }

      /*
       * Send the student to Paystack.
       */

      window.location.href = data.authorization_url;
    } catch (err) {
      console.error("CBT Payment Error:", err);

      setError(
        err.message ||
          "Something went wrong while starting payment."
      );

      setPaying(false);
    }
  };

  /*
   * ============================================================
   * LOADING
   * ============================================================
   */

  if (
    authLoading ||
    checkingAccess
  ) {
    return (
      <div className="min-h-screen bg-[#050816] text-white flex items-center justify-center px-6">
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10">
            <Loader2
              size={26}
              className="animate-spin text-cyan-400"
            />
          </div>

          <p className="mt-5 text-sm font-semibold text-slate-400">
            Checking your CBT access...
          </p>
        </div>
      </div>
    );
  }

  /*
   * ============================================================
   * ALREADY PAID
   * ============================================================
   */

  if (hasAccess) {
    return (
      <div className="min-h-screen bg-[#050816] text-white">
        <div className="mx-auto flex min-h-screen max-w-3xl items-center justify-center px-6 py-16">
          <motion.div
            initial={{
              opacity: 0,
              y: 30,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            className="w-full rounded-3xl border border-emerald-400/20 bg-white/[0.035] p-8 text-center backdrop-blur-xl sm:p-12"
          >
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-400/10">
              <CheckCircle2
                size={42}
                className="text-emerald-400"
              />
            </div>

            <p className="mt-7 text-xs font-bold uppercase tracking-[0.2em] text-emerald-400">
              Access Granted
            </p>

            <h1 className="mt-3 text-3xl font-black sm:text-4xl">
              {examName} CBT
            </h1>

            <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-slate-400">
              You already have access to this examination.
              Your payment has been successfully verified.
            </p>

            <button
              type="button"
              onClick={() =>
                navigate(
                  `/cbt/exam/${encodeURIComponent(
                    examName
                  )}`
                )
              }
              className="mt-8 inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-cyan-500 px-7 py-4 font-black text-slate-950 transition hover:-translate-y-1"
            >
              Continue to {examName}

              <ArrowRight size={18} />
            </button>
          </motion.div>
        </div>
      </div>
    );
  }

  /*
   * ============================================================
   * PAYMENT PAGE
   * ============================================================
   */

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#050816] text-white">
      {/* Background */}

      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-150px] top-[-150px] h-[450px] w-[450px] rounded-full bg-blue-600/10 blur-[150px]" />

        <div className="absolute right-[-150px] top-[20%] h-[450px] w-[450px] rounded-full bg-purple-600/10 blur-[150px]" />

        <div className="absolute bottom-[-150px] left-[30%] h-[400px] w-[400px] rounded-full bg-cyan-500/[0.06] blur-[150px]" />

        <div
          className="absolute inset-0 opacity-[0.15]"
          style={{
            backgroundImage:
              "radial-gradient(rgba(255,255,255,0.18) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
      </div>

      <main className="relative z-10 mx-auto max-w-5xl px-5 py-10 sm:px-8 lg:px-10">
        {/* Back */}

        <button
          type="button"
          onClick={() => navigate("/cbt")}
          className="mb-10 flex items-center gap-2 text-sm font-semibold text-slate-400 transition hover:text-white"
        >
          <ArrowLeft size={17} />

          Back to CBT
        </button>

        <div className="grid gap-8 lg:grid-cols-[1fr_420px]">
          {/* LEFT */}

          <motion.div
            initial={{
              opacity: 0,
              x: -30,
            }}
            animate={{
              opacity: 1,
              x: 0,
            }}
          >
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-500/[0.08] px-4 py-2 text-xs font-bold uppercase tracking-wider text-blue-300">
              <Lock size={14} />

              Premium CBT Access
            </div>

            <h1 className="text-4xl font-black tracking-tight sm:text-6xl">
              Unlock{" "}
              <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-purple-400 bg-clip-text text-transparent">
                {examName}
              </span>
            </h1>

            <p className="mt-6 max-w-2xl text-sm leading-7 text-slate-400 sm:text-base">
              Get full access to {examName} practice questions,
              timed CBT sessions, detailed explanations and
              performance tracking.
            </p>

            <div className="mt-10 space-y-4">
              {[
                "Full examination practice access",
                "Exam-style CBT questions",
                "Timed examination sessions",
                "Instant results and explanations",
                "Performance tracking",
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-3 text-sm text-slate-300"
                >
                  <CheckCircle2
                    size={19}
                    className="shrink-0 text-emerald-400"
                  />

                  {item}
                </div>
              ))}
            </div>

            <div className="mt-10 flex items-center gap-3 rounded-2xl border border-white/[0.07] bg-white/[0.025] p-5">
              <ShieldCheck
                size={24}
                className="text-cyan-400"
              />

              <div>
                <p className="text-sm font-bold text-white">
                  Secure payment
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Your payment is processed securely by Paystack.
                </p>
              </div>
            </div>
          </motion.div>

          {/* RIGHT PAYMENT CARD */}

          <motion.div
            initial={{
              opacity: 0,
              y: 30,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              delay: 0.15,
            }}
            className="relative"
          >
            <div className="overflow-hidden rounded-3xl border border-white/[0.09] bg-white/[0.045] shadow-2xl backdrop-blur-xl">
              {/* Top */}

              <div className="border-b border-white/[0.07] p-7">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400">
                    <BookOpen
                      size={23}
                      className="text-white"
                    />
                  </div>

                  <div>
                    <p className="text-xs text-slate-500">
                      Examination
                    </p>

                    <h2 className="text-xl font-black">
                      {examName}
                    </h2>
                  </div>
                </div>
              </div>

              {/* Price */}

              <div className="p-7">
                <p className="text-xs font-bold uppercase tracking-widest text-slate-500">
                  One-time access
                </p>

                <div className="mt-3 flex items-end gap-2">
                  <span className="text-5xl font-black">
                    ₦{CBT_PRICE_NAIRA.toLocaleString()}
                  </span>
                </div>

                <p className="mt-2 text-xs text-slate-500">
                  Approximately $4 USD
                </p>

                {/* Email */}

                <div className="mt-7 rounded-2xl border border-white/[0.07] bg-black/20 p-4">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-600">
                    Payment account
                  </p>

                  <p className="mt-2 break-all text-sm font-semibold text-slate-300">
                    {user?.email || "Your account"}
                  </p>
                </div>

                {/* Error */}

                {error && (
                  <div className="mt-5 flex gap-3 rounded-2xl border border-red-400/20 bg-red-500/[0.08] p-4">
                    <AlertCircle
                      size={18}
                      className="mt-0.5 shrink-0 text-red-400"
                    />

                    <p className="text-xs leading-5 text-red-300">
                      {error}
                    </p>
                  </div>
                )}

                {/* Pay */}

                <button
                  type="button"
                  disabled={paying}
                  onClick={handlePayment}
                  className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 via-cyan-500 to-indigo-500 px-5 py-4 text-sm font-black text-white shadow-xl shadow-blue-500/20 transition hover:-translate-y-1 hover:shadow-blue-500/30 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {paying ? (
                    <>
                      <Loader2
                        size={18}
                        className="animate-spin"
                      />

                      Preparing payment...
                    </>
                  ) : (
                    <>
                      <CreditCard size={18} />

                      Pay ₦{CBT_PRICE_NAIRA.toLocaleString()}
                    </>
                  )}
                </button>

                {/* Security */}

                <div className="mt-5 flex items-center justify-center gap-2 text-[10px] text-slate-600">
                  <Lock size={12} />

                  Secure payment powered by Paystack
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default CBTPayment;