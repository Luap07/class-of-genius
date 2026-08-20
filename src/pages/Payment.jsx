import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  BookOpen,
  Check,
  CheckCircle2,
  ClipboardCheck,
  Copy,
  CreditCard,
  Crown,
  Library,
  Loader2,
  LockKeyhole,
  ShieldCheck,
  Sparkles,
  Zap,
  AlertCircle,
  Landmark,
  Star,
  Gem,
  CircleDollarSign,
  Fingerprint,
} from "lucide-react";

import { supabase } from "../lib/supabaseClient";

/* =========================================================
   CONFIG
========================================================= */

const GENRE_PRICE = 5;

const normalizeGenre = (genre) =>
  genre
    ? genre
        .toString()
        .trim()
        .toUpperCase()
        .replace(/\s+/g, "_")
    : "";

const formatGenre = (genre) =>
  genre
    ? genre
        .toString()
        .replace(/_/g, " ")
        .toLowerCase()
        .replace(/\b\w/g, (char) => char.toUpperCase())
    : "Genre";

const PAYMENT_BANK_DETAILS = {
  bankName: "YOUR BANK NAME",
  accountName: "YOUR ACCOUNT NAME",
  accountNumber: "0000000000",
};

const PAYMENT_TABLE = "genre_payment_sessions";

/* =========================================================
   PAYMENT
========================================================= */

const Payment = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const paymentData = location.state || {};

  const genre = normalizeGenre(paymentData.genre);
  const storyId = paymentData.storyId || null;
  const storyTitle = paymentData.storyTitle || "";

  const amount = Number(paymentData.amount || GENRE_PRICE);

  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [creatingSession, setCreatingSession] = useState(false);
  const [session, setSession] = useState(null);
  const [copied, setCopied] = useState(false);
  const [checkingPayment, setCheckingPayment] = useState(false);
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);
  const [error, setError] = useState("");

  /* =========================================================
     LOAD USER
  ========================================================= */

  useEffect(() => {
    let mounted = true;

    const loadUser = async () => {
      setLoadingUser(true);
      setError("");

      try {
        const {
          data: { user: currentUser },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError) {
          throw authError;
        }

        if (!currentUser) {
          navigate("/login", {
            replace: true,
          });
          return;
        }

        if (mounted) {
          setUser(currentUser);
        }
      } catch (err) {
        console.error("Payment user error:", err);

        if (mounted) {
          setError(
            "Unable to load your account. Please log in again."
          );
        }
      } finally {
        if (mounted) {
          setLoadingUser(false);
        }
      }
    };

    loadUser();

    return () => {
      mounted = false;
    };
  }, [navigate]);

  /* =========================================================
     REFERENCE
  ========================================================= */

  const createReference = () => {
    const timestamp = Date.now();

    const random = Math.random()
      .toString(36)
      .substring(2, 9)
      .toUpperCase();

    return `GENRE-${timestamp}-${random}`;
  };

  /* =========================================================
     CREATE PAYMENT SESSION
  ========================================================= */

  const createPaymentSession = async () => {
    if (!user) {
      navigate("/login");
      return;
    }

    if (!genre) {
      setError(
        "No genre was provided for this payment."
      );
      return;
    }

    setCreatingSession(true);
    setError("");

    try {
      /* -----------------------------------------------------
         CHECK PAID
      ----------------------------------------------------- */

      const {
        data: existingPayment,
        error: existingError,
      } = await supabase
        .from(PAYMENT_TABLE)
        .select("*")
        .eq("user_id", user.id)
        .eq("genre", genre)
        .eq("status", "paid")
        .maybeSingle();

      if (existingError) {
        throw existingError;
      }

      if (existingPayment) {
        setPaymentConfirmed(true);

        if (storyId) {
          navigate(`/story/${storyId}`, {
            replace: true,
          });
        }

        return;
      }

      /* -----------------------------------------------------
         CHECK PENDING
      ----------------------------------------------------- */

      const {
        data: pendingPayment,
        error: pendingError,
      } = await supabase
        .from(PAYMENT_TABLE)
        .select("*")
        .eq("user_id", user.id)
        .eq("genre", genre)
        .eq("status", "pending")
        .order("created_at", {
          ascending: false,
        })
        .limit(1)
        .maybeSingle();

      if (pendingError) {
        throw pendingError;
      }

      if (pendingPayment) {
        setSession(pendingPayment);
        return;
      }

      /* -----------------------------------------------------
         CREATE
      ----------------------------------------------------- */

      const reference = createReference();

      const {
        data: newSession,
        error: sessionError,
      } = await supabase
        .from(PAYMENT_TABLE)
        .insert({
          user_id: user.id,
          genre,
          amount,
          reference,
          status: "pending",
          story_id: storyId,
          story_title: storyTitle,
        })
        .select()
        .single();

      if (sessionError) {
        throw sessionError;
      }

      setSession(newSession);
    } catch (err) {
      console.error(
        "Create payment session error:",
        err
      );

      setError(
        err?.message ||
          "Unable to create payment session."
      );
    } finally {
      setCreatingSession(false);
    }
  };

  /* =========================================================
     AUTO CREATE
  ========================================================= */

  useEffect(() => {
    if (
      !loadingUser &&
      user &&
      genre &&
      !session &&
      !paymentConfirmed
    ) {
      createPaymentSession();
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadingUser, user, genre]);

  /* =========================================================
     COPY
  ========================================================= */

  const copyAccountNumber = async () => {
    try {
      await navigator.clipboard.writeText(
        PAYMENT_BANK_DETAILS.accountNumber
      );

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (err) {
      console.error("Copy failed:", err);
    }
  };

  /* =========================================================
     CHECK PAYMENT
  ========================================================= */

  const checkPaymentStatus = async () => {
    if (!user || !genre) return;

    setCheckingPayment(true);
    setError("");

    try {
      const {
        data: paidPayment,
        error: paymentError,
      } = await supabase
        .from(PAYMENT_TABLE)
        .select("*")
        .eq("user_id", user.id)
        .eq("genre", genre)
        .eq("status", "paid")
        .order("paid_at", {
          ascending: false,
        })
        .limit(1)
        .maybeSingle();

      if (paymentError) {
        throw paymentError;
      }

      if (paidPayment) {
        setPaymentConfirmed(true);

        setTimeout(() => {
          if (storyId) {
            navigate(`/story/${storyId}`, {
              replace: true,
            });
          } else {
            navigate("/novels", {
              replace: true,
            });
          }
        }, 1200);

        return;
      }

      setError(
        "Your payment has not been confirmed yet. Please wait for confirmation and try again."
      );
    } catch (err) {
      console.error(
        "Payment status error:",
        err
      );

      setError(
        "Unable to check payment status. Please try again."
      );
    } finally {
      setCheckingPayment(false);
    }
  };

  const formattedAmount = useMemo(() => {
    return `₦${amount.toLocaleString()}`;
  }, [amount]);

  /* =========================================================
     LOADING
  ========================================================= */

  if (loadingUser) {
    return (
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#01030a] text-white">
        <PremiumBackground />

        <div className="relative z-10 flex flex-col items-center">
          <div className="relative flex h-24 w-24 items-center justify-center rounded-[30px] border border-blue-400/20 bg-white/[0.035] shadow-[0_0_100px_rgba(37,99,235,0.18)] backdrop-blur-2xl">
            <div className="absolute inset-2 rounded-[24px] border border-blue-400/10" />

            <Loader2 className="h-8 w-8 animate-spin text-blue-400" />

            <Sparkles className="absolute right-4 top-4 h-3 w-3 animate-pulse text-indigo-300" />
          </div>

          <p className="mt-7 text-sm font-black tracking-tight text-white">
            Preparing your secure checkout
          </p>

          <p className="mt-2 text-xs text-slate-500">
            Verifying your account and access...
          </p>

          <div className="mt-6 h-1 w-32 overflow-hidden rounded-full bg-white/[0.06]">
            <div className="h-full w-1/2 animate-[loadingBar_1.4s_ease-in-out_infinite] rounded-full bg-gradient-to-r from-blue-500 to-violet-500" />
          </div>
        </div>
      </div>
    );
  }

  /* =========================================================
     INVALID
  ========================================================= */

  if (!genre) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-[#01030a] px-4 py-10 text-white">
        <PremiumBackground />

        <div className="relative z-10 mx-auto flex min-h-[80vh] max-w-xl items-center justify-center">
          <div className="relative w-full overflow-hidden rounded-[36px] border border-white/10 bg-white/[0.045] p-8 text-center shadow-[0_30px_120px_rgba(0,0,0,0.45)] backdrop-blur-2xl sm:p-12">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-red-400/60 to-transparent" />

            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[26px] border border-red-400/20 bg-red-500/10 shadow-[0_0_50px_rgba(239,68,68,0.1)]">
              <AlertCircle className="h-8 w-8 text-red-400" />
            </div>

            <p className="mt-7 text-[10px] font-black uppercase tracking-[0.3em] text-red-400">
              Checkout Error
            </p>

            <h1 className="mt-3 text-3xl font-black tracking-tight">
              Payment Information Missing
            </h1>

            <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-slate-500">
              We could not determine which genre you
              are trying to unlock. Return to the library
              and select a genre again.
            </p>

            <button
              type="button"
              onClick={() => navigate("/novels")}
              className="group relative mt-8 inline-flex items-center gap-2 overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 px-7 py-3.5 text-sm font-black text-white shadow-[0_15px_40px_rgba(37,99,235,0.2)] transition duration-300 hover:-translate-y-1"
            >
              <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/15 to-transparent transition duration-700 group-hover:translate-x-full" />

              <span className="relative">
                Return to Library
              </span>

              <ArrowRight className="relative h-4 w-4 transition group-hover:translate-x-1" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* =========================================================
     MAIN
  ========================================================= */

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#01030a] text-white selection:bg-blue-500/30">
      <PremiumBackground />

      {/* =====================================================
          HEADER
      ===================================================== */}

      <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-[#01030a]/70 backdrop-blur-2xl">
        <div className="mx-auto flex h-[76px] max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="group flex items-center gap-2 rounded-2xl border border-white/[0.08] bg-white/[0.035] px-4 py-2.5 text-xs font-bold text-slate-400 shadow-xl shadow-black/10 transition duration-300 hover:-translate-y-0.5 hover:border-white/15 hover:bg-white/[0.065] hover:text-white"
          >
            <ArrowLeft className="h-4 w-4 transition group-hover:-translate-x-1" />

            Back
          </button>

          <div className="flex items-center gap-3">
            <div className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-emerald-400/20 bg-emerald-500/[0.08]">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />

              <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.9)]" />
            </div>

            <div className="hidden sm:block">
              <p className="text-[9px] font-black uppercase tracking-[0.22em] text-emerald-400">
                Secure Checkout
              </p>

              <p className="mt-0.5 text-[9px] text-slate-600">
                Encrypted account access
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* =====================================================
          MAIN
      ===================================================== */}

      <main className="relative z-10 mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8 lg:py-16">

        {/* ===================================================
            HERO
        =================================================== */}

        <div className="mx-auto mb-12 max-w-4xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-400/15 bg-blue-500/[0.06] px-4 py-2 shadow-[0_0_40px_rgba(59,130,246,0.05)] backdrop-blur-xl">
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-500/15">
              <Crown className="h-3 w-3 text-blue-300" />
            </div>

            <span className="text-[9px] font-black uppercase tracking-[0.24em] text-blue-300">
              Premium Genre Access
            </span>

            <span className="h-1 w-1 rounded-full bg-blue-400/50" />

            <span className="text-[9px] font-bold text-slate-500">
              One-time payment
            </span>
          </div>

          <h1 className="mt-7 text-4xl font-black leading-[0.98] tracking-[-0.055em] text-white sm:text-6xl lg:text-7xl">
            Your next great story
            <span className="block bg-gradient-to-r from-blue-300 via-indigo-300 to-violet-300 bg-clip-text pb-2 text-transparent">
              starts here.
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-sm leading-7 text-slate-500 sm:text-base">
            Unlock unlimited access to the{" "}
            <span className="font-bold text-slate-300">
              {formatGenre(genre)}
            </span>{" "}
            collection with one simple payment.
            No subscriptions. No recurring charges.
          </p>

          {/* PREMIUM MINI STATS */}

          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            <MiniTrust icon={ShieldCheck} text="Secure access" />
            <MiniTrust icon={Zap} text="Instant unlock" />
            <MiniTrust icon={Gem} text="Premium collection" />
          </div>
        </div>

        {/* ===================================================
            STEPS
        =================================================== */}

        <div className="mx-auto mb-9 flex max-w-2xl items-center justify-center">
          <Step
            number="01"
            title="Review"
            active
          />

          <StepLine active />

          <Step
            number="02"
            title="Transfer"
            active={!!session}
          />

          <StepLine active={!!session} />

          <Step
            number="03"
            title="Unlock"
            active={paymentConfirmed}
          />
        </div>

        {/* ===================================================
            GRID
        =================================================== */}

        <div className="grid gap-6 xl:grid-cols-[0.86fr_1.14fr]">

          {/* =================================================
              LEFT PREMIUM CARD
          ================================================= */}

          <section className="group relative overflow-hidden rounded-[36px] border border-white/[0.09] bg-white/[0.035] shadow-[0_30px_120px_rgba(0,0,0,0.35)] backdrop-blur-2xl">

            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-400/50 to-transparent" />

            <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-blue-500/[0.08] blur-[110px] transition duration-1000 group-hover:bg-blue-500/[0.13]" />

            <div className="absolute -bottom-40 -left-32 h-96 w-96 rounded-full bg-violet-500/[0.07] blur-[110px]" />

            <div className="relative p-7 sm:p-9 lg:p-10">

              {/* TOP */}

              <div className="flex items-start justify-between gap-4">
                <div className="relative flex h-[68px] w-[68px] items-center justify-center rounded-[24px] border border-blue-400/20 bg-gradient-to-br from-blue-500/15 via-indigo-500/10 to-transparent shadow-[0_0_60px_rgba(59,130,246,0.12)]">
                  <BookOpen className="h-7 w-7 text-blue-300" />

                  <div className="absolute -right-1.5 -top-1.5 flex h-6 w-6 items-center justify-center rounded-full border border-[#090d19] bg-gradient-to-br from-blue-400 to-indigo-500 shadow-lg">
                    <Sparkles className="h-3 w-3 text-white" />
                  </div>
                </div>

                <div className="rounded-full border border-emerald-400/15 bg-emerald-500/[0.055] px-3 py-1.5">
                  <span className="text-[8px] font-black uppercase tracking-[0.2em] text-emerald-400">
                    Lifetime Access
                  </span>
                </div>
              </div>

              <p className="mt-9 text-[9px] font-black uppercase tracking-[0.28em] text-blue-400">
                You're unlocking
              </p>

              <h2 className="mt-2 text-3xl font-black tracking-[-0.04em] text-white sm:text-4xl">
                {formatGenre(genre)}
              </h2>

              <p className="mt-4 max-w-md text-sm leading-7 text-slate-500">
                Get complete access to the entire
                collection in this genre. Read available
                stories without purchasing them one by
                one.
              </p>

              {/* STORY */}

              {storyTitle && (
                <div className="relative mt-7 overflow-hidden rounded-[24px] border border-white/[0.08] bg-black/20 p-4">
                  <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-blue-400 via-indigo-500 to-violet-500" />

                  <div className="flex items-center gap-3 pl-1">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/[0.06] bg-white/[0.035]">
                      <Library className="h-4 w-4 text-slate-400" />
                    </div>

                    <div className="min-w-0">
                      <p className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-600">
                        Starting with
                      </p>

                      <p className="mt-1 truncate text-xs font-bold text-white">
                        {storyTitle}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* BENEFITS */}

              <div className="mt-9">
                <p className="text-[9px] font-black uppercase tracking-[0.22em] text-slate-600">
                  Everything included
                </p>

                <div className="mt-4 grid gap-3">
                  <Benefit
                    icon={Library}
                    text={`All ${formatGenre(genre)} stories`}
                  />

                  <Benefit
                    icon={Zap}
                    text="Instant access after confirmation"
                  />

                  <Benefit
                    icon={BadgeCheck}
                    text="One payment for the entire genre"
                  />

                  <Benefit
                    icon={LockKeyhole}
                    text="Protected account-based access"
                  />
                </div>
              </div>

              {/* PRICE */}

              <div className="relative mt-9 overflow-hidden rounded-[28px] border border-white/[0.07] bg-black/20 p-5">
                <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-blue-500/[0.06] blur-3xl" />

                <div className="relative flex items-end justify-between gap-5">
                  <div>
                    <p className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-600">
                      Total today
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      No recurring subscription
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-4xl font-black tracking-[-0.04em] text-white">
                      {formattedAmount}
                    </p>

                    <p className="mt-1 text-[8px] font-black uppercase tracking-[0.2em] text-blue-400">
                      Lifetime genre unlock
                    </p>
                  </div>
                </div>
              </div>

              {/* GUARANTEE */}

              <div className="mt-6 flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-emerald-400/10 bg-emerald-500/[0.05]">
                  <Fingerprint className="h-4 w-4 text-emerald-400" />
                </div>

                <div>
                  <p className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-400">
                    Account protected
                  </p>

                  <p className="mt-0.5 text-[9px] text-slate-600">
                    Your purchase is linked securely to your account.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* =================================================
              RIGHT PAYMENT CARD
          ================================================= */}

          <section className="group relative overflow-hidden rounded-[36px] border border-white/[0.1] bg-white/[0.045] shadow-[0_35px_140px_rgba(0,0,0,0.45)] backdrop-blur-2xl">

            {/* TOP LIGHT */}

            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-400/80 to-transparent" />

            <div className="absolute -right-40 top-[-180px] h-[420px] w-[420px] rounded-full bg-blue-500/[0.06] blur-[100px]" />

            <div className="absolute -left-40 bottom-[-180px] h-[420px] w-[420px] rounded-full bg-indigo-500/[0.06] blur-[100px]" />

            <div className="relative p-6 sm:p-8 lg:p-10">

              {/* HEADER */}

              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-50" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-blue-400 shadow-[0_0_14px_rgba(96,165,250,0.8)]" />
                    </span>

                    <p className="text-[9px] font-black uppercase tracking-[0.24em] text-blue-400">
                      Payment Details
                    </p>
                  </div>

                  <h3 className="mt-2 text-2xl font-black tracking-[-0.03em] text-white sm:text-3xl">
                    Complete your transfer
                  </h3>

                  <p className="mt-2 text-xs text-slate-600">
                    Transfer the exact amount shown below.
                  </p>
                </div>

                <div className="hidden h-12 w-12 items-center justify-center rounded-2xl border border-white/[0.07] bg-white/[0.035] sm:flex">
                  <CreditCard className="h-5 w-5 text-slate-500" />
                </div>
              </div>

              {/* AMOUNT CARD */}

              <div className="relative mt-7 overflow-hidden rounded-[28px] border border-blue-400/15 bg-gradient-to-br from-blue-500/[0.11] via-indigo-500/[0.06] to-transparent p-6">
                <div className="absolute -right-12 -top-12 h-36 w-36 rounded-full bg-blue-400/[0.08] blur-3xl" />

                <div className="relative flex items-center justify-between">
                  <div>
                    <p className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-600">
                      Transfer exactly
                    </p>

                    <p className="mt-2 text-4xl font-black tracking-[-0.04em] text-white">
                      {formattedAmount}
                    </p>

                    <div className="mt-2 flex items-center gap-1.5">
                      <CircleDollarSign className="h-3 w-3 text-blue-400" />

                      <span className="text-[9px] font-bold text-blue-300">
                        Nigerian Naira
                      </span>
                    </div>
                  </div>

                  <div className="hidden h-14 w-14 items-center justify-center rounded-[20px] border border-blue-400/15 bg-blue-500/10 sm:flex">
                    <Landmark className="h-6 w-6 text-blue-400" />
                  </div>
                </div>
              </div>

              {/* BANK */}

              <div className="relative mt-6 overflow-hidden rounded-[28px] border border-white/[0.08] bg-black/20 p-5 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[8px] font-black uppercase tracking-[0.22em] text-slate-600">
                      Bank Transfer
                    </p>

                    <p className="mt-1 text-xs font-bold text-white">
                      Send payment to this account
                    </p>
                  </div>

                  <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-emerald-400/10 bg-emerald-500/[0.06]">
                    <ShieldCheck className="h-4 w-4 text-emerald-400" />
                  </div>
                </div>

                <div className="mt-6 space-y-5">
                  <PaymentDetail
                    label="Bank"
                    value={PAYMENT_BANK_DETAILS.bankName}
                  />

                  <PaymentDetail
                    label="Account Name"
                    value={PAYMENT_BANK_DETAILS.accountName}
                  />

                  <div>
                    <p className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-600">
                      Account Number
                    </p>

                    <div className="mt-2 flex items-center gap-3">
                      <div className="min-w-0 flex-1 rounded-2xl border border-white/[0.08] bg-white/[0.035] px-4 py-3.5 shadow-inner">
                        <p className="truncate text-lg font-black tracking-[0.14em] text-white">
                          {PAYMENT_BANK_DETAILS.accountNumber}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={copyAccountNumber}
                        className="group/copy flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-2xl border border-white/[0.08] bg-white/[0.045] text-slate-400 transition duration-300 hover:-translate-y-0.5 hover:border-blue-400/20 hover:bg-blue-500/10 hover:text-white"
                        aria-label="Copy account number"
                      >
                        {copied ? (
                          <Check className="h-4 w-4 text-emerald-400" />
                        ) : (
                          <Copy className="h-4 w-4 transition group-hover/copy:scale-110" />
                        )}
                      </button>
                    </div>

                    {copied && (
                      <div className="mt-2 flex items-center gap-1.5">
                        <Check className="h-3 w-3 text-emerald-400" />

                        <p className="text-[9px] font-bold text-emerald-400">
                          Account number copied
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* REFERENCE */}

              {session?.reference && (
                <div className="relative mt-5 overflow-hidden rounded-[24px] border border-violet-400/10 bg-violet-500/[0.045] p-4">
                  <div className="absolute inset-y-0 left-0 w-px bg-gradient-to-b from-transparent via-violet-400/60 to-transparent" />

                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-500/10">
                      <ClipboardCheck className="h-4 w-4 text-violet-400" />
                    </div>

                    <div className="min-w-0">
                      <p className="text-[8px] font-black uppercase tracking-[0.2em] text-violet-400">
                        Payment Reference
                      </p>

                      <p className="mt-1 break-all text-xs font-black text-white">
                        {session.reference}
                      </p>

                      <p className="mt-2 text-[9px] leading-5 text-slate-600">
                        Keep this reference available until your
                        payment has been confirmed.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* ERROR */}

              {error && (
                <div className="mt-5 flex gap-3 rounded-[24px] border border-red-400/15 bg-red-500/[0.055] p-4">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-500/10">
                    <AlertCircle className="h-4 w-4 text-red-400" />
                  </div>

                  <div>
                    <p className="text-[9px] font-black uppercase tracking-[0.12em] text-red-300">
                      Payment Status
                    </p>

                    <p className="mt-1 text-xs leading-5 text-red-300/75">
                      {error}
                    </p>
                  </div>
                </div>
              )}

              {/* CONFIRMED */}

              {paymentConfirmed ? (
                <div className="relative mt-6 overflow-hidden rounded-[28px] border border-emerald-400/20 bg-emerald-500/[0.055] p-7 text-center">
                  <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-400/60 to-transparent" />

                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[22px] border border-emerald-400/20 bg-emerald-500/10 shadow-[0_0_50px_rgba(52,211,153,0.1)]">
                    <CheckCircle2 className="h-8 w-8 text-emerald-400" />
                  </div>

                  <p className="mt-5 text-[9px] font-black uppercase tracking-[0.24em] text-emerald-400">
                    Access Granted
                  </p>

                  <h4 className="mt-2 text-xl font-black text-white">
                    Payment Confirmed
                  </h4>

                  <p className="mx-auto mt-2 max-w-sm text-xs leading-6 text-slate-500">
                    Your {formatGenre(genre)} collection has
                    been unlocked. Redirecting you now...
                  </p>
                </div>
              ) : (
                <>
                  {/* CTA */}

                  <button
                    type="button"
                    disabled={
                      creatingSession ||
                      checkingPayment ||
                      !session
                    }
                    onClick={checkPaymentStatus}
                    className="group relative mt-6 flex w-full items-center justify-center gap-3 overflow-hidden rounded-[24px] bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 px-6 py-4.5 text-sm font-black text-white shadow-[0_20px_60px_rgba(37,99,235,0.2)] transition duration-500 hover:-translate-y-1 hover:shadow-[0_25px_75px_rgba(79,70,229,0.28)] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0"
                  >
                    <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/[0.16] to-transparent transition duration-1000 group-hover:translate-x-full" />

                    <span className="absolute inset-0 rounded-[24px] ring-1 ring-inset ring-white/10" />

                    {checkingPayment ? (
                      <>
                        <Loader2 className="relative h-4 w-4 animate-spin" />

                        <span className="relative">
                          Checking Payment...
                        </span>
                      </>
                    ) : creatingSession ? (
                      <>
                        <Loader2 className="relative h-4 w-4 animate-spin" />

                        <span className="relative">
                          Preparing Checkout...
                        </span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="relative h-4 w-4" />

                        <span className="relative">
                          I Have Made Payment
                        </span>

                        <ArrowRight className="relative h-4 w-4 transition duration-300 group-hover:translate-x-1" />
                      </>
                    )}
                  </button>

                  <p className="mx-auto mt-4 max-w-md text-center text-[9px] leading-5 text-slate-600">
                    After completing your bank transfer,
                    click the button above. Your account will
                    unlock automatically once payment has been
                    confirmed.
                  </p>
                </>
              )}

              {/* SECURITY */}

              <div className="mt-7 flex items-center justify-center gap-2 border-t border-white/[0.06] pt-6">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-500/70" />

                <p className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-600">
                  Secure account-based access
                </p>

                <span className="h-1 w-1 rounded-full bg-slate-700" />

                <p className="text-[8px] font-bold text-slate-700">
                  Protected checkout
                </p>
              </div>
            </div>
          </section>
        </div>

        {/* ===================================================
            TRUST BAR
        =================================================== */}

        <div className="mx-auto mt-7 grid max-w-5xl gap-3 sm:grid-cols-3">
          <TrustItem
            icon={LockKeyhole}
            title="Secure"
            text="Protected account access"
          />

          <TrustItem
            icon={Zap}
            title="One Payment"
            text="No recurring charges"
          />

          <TrustItem
            icon={Library}
            title="Genre Access"
            text="Read available stories"
          />
        </div>

        {/* ===================================================
            BOTTOM MICRO COPY
        =================================================== */}

        <div className="mt-8 flex items-center justify-center gap-2">
          <Star className="h-3 w-3 text-blue-400/50" />

          <p className="text-center text-[8px] font-bold uppercase tracking-[0.2em] text-slate-700">
            Premium reading experience
          </p>

          <Star className="h-3 w-3 text-blue-400/50" />
        </div>
      </main>
    </div>
  );
};

/* =========================================================
   PREMIUM BACKGROUND
========================================================= */

const PremiumBackground = () => {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-[#01030a]">

      {/* BASE */}

      <div className="absolute inset-0 bg-[#01030a]" />

      {/* AURORA 1 */}

      <div
        className="absolute -left-[220px] -top-[220px] h-[700px] w-[700px] rounded-full bg-blue-600/[0.095] blur-[150px]"
        style={{
          animation:
            "premiumAuroraOne 20s ease-in-out infinite",
        }}
      />

      {/* AURORA 2 */}

      <div
        className="absolute -right-[250px] top-[5%] h-[720px] w-[720px] rounded-full bg-indigo-600/[0.085] blur-[160px]"
        style={{
          animation:
            "premiumAuroraTwo 25s ease-in-out infinite",
        }}
      />

      {/* AURORA 3 */}

      <div
        className="absolute bottom-[-350px] left-[18%] h-[700px] w-[700px] rounded-full bg-violet-600/[0.065] blur-[170px]"
        style={{
          animation:
            "premiumAuroraThree 28s ease-in-out infinite",
        }}
      />

      {/* CENTRAL GLOW */}

      <div
        className="absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-500/[0.02] blur-[120px]"
        style={{
          animation:
            "premiumCore 14s ease-in-out infinite",
        }}
      />

      {/* GRID */}

      <div
        className="absolute inset-[-120px] opacity-[0.027]"
        style={{
          backgroundImage: `
            linear-gradient(
              rgba(255,255,255,0.8) 1px,
              transparent 1px
            ),
            linear-gradient(
              90deg,
              rgba(255,255,255,0.8) 1px,
              transparent 1px
            )
          `,
          backgroundSize: "72px 72px",
          animation:
            "premiumGrid 22s linear infinite",
        }}
      />

      {/* DOT FIELD */}

      <div
        className="absolute inset-0 opacity-[0.045]"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(255,255,255,0.9) 1px, transparent 1px)",
          backgroundSize: "34px 34px",
          animation:
            "premiumDots 28s linear infinite",
        }}
      />

      {/* PARTICLES */}

      <div
        className="absolute left-[12%] top-[20%] h-1.5 w-1.5 rounded-full bg-blue-300/50 blur-[1px]"
        style={{
          animation:
            "premiumParticleOne 9s ease-in-out infinite",
        }}
      />

      <div
        className="absolute left-[75%] top-[17%] h-1 w-1 rounded-full bg-indigo-300/60"
        style={{
          animation:
            "premiumParticleTwo 11s ease-in-out infinite",
        }}
      />

      <div
        className="absolute left-[84%] top-[65%] h-1.5 w-1.5 rounded-full bg-blue-400/40 blur-[1px]"
        style={{
          animation:
            "premiumParticleThree 13s ease-in-out infinite",
        }}
      />

      <div
        className="absolute left-[17%] top-[75%] h-1 w-1 rounded-full bg-violet-300/50"
        style={{
          animation:
            "premiumParticleFour 10s ease-in-out infinite",
        }}
      />

      <div
        className="absolute left-[48%] top-[12%] h-1 w-1 rounded-full bg-white/25"
        style={{
          animation:
            "premiumParticleFive 12s ease-in-out infinite",
        }}
      />

      {/* LIGHT SWEEP */}

      <div
        className="absolute left-[-35%] top-[38%] h-px w-[42%] bg-gradient-to-r from-transparent via-blue-400/20 to-transparent"
        style={{
          animation:
            "premiumSweep 16s ease-in-out infinite",
        }}
      />

      {/* ATMOSPHERE */}

      <div className="absolute inset-x-0 top-0 h-[500px] bg-gradient-to-b from-blue-500/[0.025] via-transparent to-transparent" />

      {/* VIGNETTE */}

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_25%,rgba(0,0,0,0.5)_100%)]" />

      {/* ANIMATIONS */}

      <style>
        {`
          @keyframes premiumAuroraOne {
            0% {
              transform: translate3d(0,0,0) scale(1);
            }

            25% {
              transform: translate3d(130px,80px,0) scale(1.08);
            }

            50% {
              transform: translate3d(40px,180px,0) scale(.94);
            }

            75% {
              transform: translate3d(-120px,80px,0) scale(1.06);
            }

            100% {
              transform: translate3d(0,0,0) scale(1);
            }
          }

          @keyframes premiumAuroraTwo {
            0% {
              transform: translate3d(0,0,0) scale(1);
            }

            30% {
              transform: translate3d(-110px,90px,0) scale(1.08);
            }

            60% {
              transform: translate3d(-50px,-100px,0) scale(.95);
            }

            100% {
              transform: translate3d(0,0,0) scale(1);
            }
          }

          @keyframes premiumAuroraThree {
            0% {
              transform: translate3d(0,0,0);
            }

            35% {
              transform: translate3d(120px,-90px,0);
            }

            70% {
              transform: translate3d(-100px,-40px,0);
            }

            100% {
              transform: translate3d(0,0,0);
            }
          }

          @keyframes premiumCore {
            0% {
              transform: translate(-50%,-50%) scale(.88);
              opacity: .4;
            }

            50% {
              transform: translate(-50%,-50%) scale(1.18);
              opacity: 1;
            }

            100% {
              transform: translate(-50%,-50%) scale(.88);
              opacity: .4;
            }
          }

          @keyframes premiumGrid {
            0% {
              transform: translate3d(0,0,0);
            }

            100% {
              transform: translate3d(72px,72px,0);
            }
          }

          @keyframes premiumDots {
            0% {
              transform: translate3d(0,0,0);
            }

            50% {
              transform: translate3d(17px,-17px,0);
            }

            100% {
              transform: translate3d(34px,0,0);
            }
          }

          @keyframes premiumParticleOne {
            0%,100% {
              transform: translate3d(0,0,0);
              opacity: .2;
            }

            50% {
              transform: translate3d(40px,-55px,0);
              opacity: .85;
            }
          }

          @keyframes premiumParticleTwo {
            0%,100% {
              transform: translate3d(0,0,0);
              opacity: .2;
            }

            50% {
              transform: translate3d(-50px,38px,0);
              opacity: .75;
            }
          }

          @keyframes premiumParticleThree {
            0%,100% {
              transform: translate3d(0,0,0);
              opacity: .2;
            }

            50% {
              transform: translate3d(-35px,-50px,0);
              opacity: .8;
            }
          }

          @keyframes premiumParticleFour {
            0%,100% {
              transform: translate3d(0,0,0);
              opacity: .2;
            }

            50% {
              transform: translate3d(55px,28px,0);
              opacity: .7;
            }
          }

          @keyframes premiumParticleFive {
            0%,100% {
              transform: translate3d(0,0,0);
              opacity: .15;
            }

            50% {
              transform: translate3d(-28px,55px,0);
              opacity: .65;
            }
          }

          @keyframes premiumSweep {
            0% {
              transform: translateX(0) rotate(-4deg);
              opacity: 0;
            }

            20% {
              opacity: 1;
            }

            50% {
              opacity: .5;
            }

            80% {
              opacity: 1;
            }

            100% {
              transform: translateX(330%) rotate(-4deg);
              opacity: 0;
            }
          }

          @keyframes loadingBar {
            0% {
              transform: translateX(-100%);
            }

            100% {
              transform: translateX(250%);
            }
          }

          @media (prefers-reduced-motion: reduce) {
            *,
            *::before,
            *::after {
              animation-duration: .01ms !important;
              animation-iteration-count: 1 !important;
              scroll-behavior: auto !important;
            }
          }
        `}
      </style>
    </div>
  );
};

/* =========================================================
   MINI TRUST
========================================================= */

const MiniTrust = ({ icon: Icon, text }) => (
  <div className="flex items-center gap-2 rounded-full border border-white/[0.06] bg-white/[0.025] px-3 py-2">
    <Icon className="h-3 w-3 text-slate-500" />

    <span className="text-[8px] font-bold uppercase tracking-[0.12em] text-slate-600">
      {text}
    </span>
  </div>
);

/* =========================================================
   STEP
========================================================= */

const Step = ({
  number,
  title,
  active = false,
}) => (
  <div className="flex min-w-[54px] flex-col items-center">
    <div
      className={`relative flex h-10 w-10 items-center justify-center rounded-full border text-[9px] font-black transition-all duration-500 ${
        active
          ? "border-blue-400/30 bg-blue-500/15 text-blue-300 shadow-[0_0_30px_rgba(59,130,246,0.14)]"
          : "border-white/[0.08] bg-white/[0.025] text-slate-700"
      }`}
    >
      {active && number === "03" ? (
        <Check className="h-3.5 w-3.5" />
      ) : (
        number
      )}

      {active && (
        <span className="absolute inset-[-4px] rounded-full border border-blue-400/10" />
      )}
    </div>

    <span
      className={`mt-2 text-[8px] font-black uppercase tracking-[0.15em] ${
        active ? "text-slate-400" : "text-slate-700"
      }`}
    >
      {title}
    </span>
  </div>
);

/* =========================================================
   STEP LINE
========================================================= */

const StepLine = ({ active = false }) => (
  <div
    className={`mx-2 h-px w-8 transition-all duration-700 sm:mx-4 sm:w-20 ${
      active
        ? "bg-gradient-to-r from-blue-500/60 via-indigo-500/50 to-blue-500/20"
        : "bg-gradient-to-r from-white/10 to-white/[0.03]"
    }`}
  />
);

/* =========================================================
   BENEFIT
========================================================= */

const Benefit = ({
  icon: Icon,
  text,
}) => (
  <div className="group flex items-center gap-3">
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-emerald-400/10 bg-emerald-500/[0.055] transition duration-300 group-hover:border-emerald-400/20 group-hover:bg-emerald-500/[0.09]">
      <Icon className="h-3.5 w-3.5 text-emerald-400" />
    </div>

    <span className="text-xs font-semibold text-slate-400 transition group-hover:text-slate-300">
      {text}
    </span>
  </div>
);

/* =========================================================
   TRUST ITEM
========================================================= */

const TrustItem = ({
  icon: Icon,
  title,
  text,
}) => (
  <div className="group flex items-center justify-center gap-3 rounded-2xl border border-white/[0.07] bg-white/[0.025] px-4 py-4 backdrop-blur-xl transition duration-300 hover:border-white/[0.11] hover:bg-white/[0.04]">
    <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.05] bg-white/[0.035]">
      <Icon className="h-4 w-4 text-slate-500 transition group-hover:text-blue-400" />
    </div>

    <div>
      <p className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-400">
        {title}
      </p>

      <p className="mt-0.5 text-[9px] text-slate-700">
        {text}
      </p>
    </div>
  </div>
);

/* =========================================================
   PAYMENT DETAIL
========================================================= */

const PaymentDetail = ({
  label,
  value,
}) => (
  <div>
    <p className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-600">
      {label}
    </p>

    <p className="mt-1.5 text-sm font-bold text-white">
      {value}
    </p>
  </div>
);

export default Payment;