import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  BookOpen,
  Check,
  CheckCircle2,
  ClipboardCheck,
  CreditCard,
  Crown,
  Gem,
  Library,
  Loader2,
  LockKeyhole,
  ShieldCheck,
  Sparkles,
  Star,
  Zap,
  Fingerprint,
  CircleDollarSign,
  Layers3,
  GraduationCap,
  ChevronDown,
} from "lucide-react";

import { useLocation, useNavigate } from "react-router-dom";

import { supabase } from "../lib/supabaseClient";

/* =========================================================
   CONFIG
========================================================= */

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000";

/*
  ============================================================
  TEST PAYMENT SETTINGS
  ============================================================

  For testing, we are using:

  Currency: NGN
  Amount:   ₦100

  Change DEFAULT_PRICE back to your real price when testing
  is complete.
*/

const DEFAULT_CURRENCY = "NGN";
const DEFAULT_PRICE = 100;

/*
  Supported currencies.

  IMPORTANT:
  The frontend can display these currencies, but your
  Paystack merchant account/backend must support the
  currency you actually send to Paystack.

  For now, NGN is the recommended testing currency.
*/

const CURRENCY_CONFIG = {
  NGN: {
    symbol: "₦",
    name: "Nigerian Naira",
    locale: "en-NG",
    decimals: 0,
  },

  USD: {
    symbol: "$",
    name: "US Dollar",
    locale: "en-US",
    decimals: 2,
  },

  GHS: {
    symbol: "GH₵",
    name: "Ghanaian Cedi",
    locale: "en-GH",
    decimals: 2,
  },

  KES: {
    symbol: "KSh",
    name: "Kenyan Shilling",
    locale: "en-KE",
    decimals: 2,
  },

  ZAR: {
    symbol: "R",
    name: "South African Rand",
    locale: "en-ZA",
    decimals: 2,
  },

  XOF: {
    symbol: "CFA",
    name: "West African CFA Franc",
    locale: "fr-FR",
    decimals: 0,
  },
};

/*
  Only show currencies that you have enabled for testing.

  For now we keep NGN only.

  When your backend/payment account is ready for another
  currency, add it here.

  Example:

  const ENABLED_CURRENCIES = [
    "NGN",
    "USD",
  ];
*/

const ENABLED_CURRENCIES = [
  "NGN",
];

/* =========================================================
   HELPERS
========================================================= */

const normalizeValue = (value) =>
  value
    ? value
        .toString()
        .trim()
        .toUpperCase()
        .replace(/\s+/g, "_")
    : "";

const formatValue = (value) =>
  value
    ? value
        .toString()
        .replace(/_/g, " ")
        .toLowerCase()
        .replace(/\b\w/g, (char) =>
          char.toUpperCase()
        )
    : "Access";

const normalizeCurrency = (value) => {
  const currency =
    value?.toString().trim().toUpperCase();

  if (
    currency &&
    CURRENCY_CONFIG[currency] &&
    ENABLED_CURRENCIES.includes(currency)
  ) {
    return currency;
  }

  return DEFAULT_CURRENCY;
};

const formatMoney = (
  amount,
  currency = DEFAULT_CURRENCY
) => {
  const config =
    CURRENCY_CONFIG[currency] ||
    CURRENCY_CONFIG[DEFAULT_CURRENCY];

  return new Intl.NumberFormat(
    config.locale,
    {
      style: "currency",
      currency,
      minimumFractionDigits:
        config.decimals,
      maximumFractionDigits:
        config.decimals,
    }
  ).format(Number(amount || 0));
};

/*
  Paystack expects amounts in subunits.

  NGN:
  ₦100 = 10,000 kobo

  USD:
  $5 = 500 cents
*/

const toPaystackSubunit = (
  amount
) =>
  Math.round(
    Number(amount || 0) * 100
  );

const getProductType = (value) => {
  const type =
    value?.toString().trim().toLowerCase();

  if (
    type === "subject" ||
    type === "category" ||
    type === "genre"
  ) {
    return type;
  }

  return "genre";
};

/* =========================================================
   PRODUCT CONFIG
========================================================= */

const getProductConfig = (data) => {
  const productType = getProductType(
    data.productType
  );

  const currency = normalizeCurrency(
    data.currency
  );

  /* -------------------------------------------------------
     GENRE
  ------------------------------------------------------- */

  if (productType === "genre") {
    const genre = normalizeValue(
      data.genre || data.productId
    );

    return {
      type: "genre",

      id:
        data.productId ||
        genre,

      name:
        data.productName ||
        `${formatValue(
          genre
        )} Genre Access`,

      displayName:
        data.displayName ||
        formatValue(genre),

      description:
        data.description ||
        `Unlock unlimited access to the ${formatValue(
          genre
        )} collection.`,

      /*
        TEST PRICE

        We intentionally use ₦100 while testing.
      */

      price:
        DEFAULT_PRICE,

      currency,

      icon: BookOpen,

      label:
        "Premium Genre Access",

      accessLabel:
        "Lifetime Genre Access",

      benefitText:
        `All ${formatValue(
          genre
        )} stories`,
    };
  }

  /* -------------------------------------------------------
     CATEGORY
  ------------------------------------------------------- */

  if (productType === "category") {
    const categoryId =
      data.categoryId ||
      data.productId ||
      null;

    const categoryName =
      data.categoryName ||
      data.displayName ||
      data.name ||
      "Category";

    return {
      type: "category",

      id: categoryId,

      name:
        data.productName ||
        `${categoryName} Category Access`,

      displayName: categoryName,

      description:
        data.description ||
        `Unlock complete access to the ${categoryName} category.`,

      price:
        DEFAULT_PRICE,

      currency,

      icon: Layers3,

      label:
        "Premium Category Access",

      accessLabel:
        "Lifetime Category Access",

      benefitText:
        `All ${categoryName} content`,
    };
  }

  /* -------------------------------------------------------
     SUBJECT
  ------------------------------------------------------- */

  const subjectId =
    data.subjectId ||
    data.productId ||
    null;

  const subjectName =
    data.subjectName ||
    data.displayName ||
    data.name ||
    "Subject";

  return {
    type: "subject",

    id: subjectId,

    name:
      data.productName ||
      `${subjectName} Subject Access`,

    displayName: subjectName,

    description:
      data.description ||
      `Unlock complete access to ${subjectName}.`,

    price:
      DEFAULT_PRICE,

    currency,

    icon: GraduationCap,

    label:
      "Premium Subject Access",

    accessLabel:
      "Lifetime Subject Access",

    benefitText:
      `All ${subjectName} materials`,
  };
};

/* =========================================================
   PAYMENT
========================================================= */

const Payment = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const paymentData =
    location.state || {};

  /* =======================================================
     PRODUCT
  ======================================================= */

  const initialProduct = useMemo(
    () =>
      getProductConfig(
        paymentData
      ),
    [paymentData]
  );

  const ProductIcon =
    initialProduct.icon;

  /* =======================================================
     NOVEL / STORY
  ======================================================= */

  const storyId =
    paymentData.storyId ||
    null;

  const storyTitle =
    paymentData.storyTitle ||
    "";

  /* =======================================================
     ACCESS IDS
  ======================================================= */

  const categoryId =
    paymentData.categoryId ||
    (initialProduct.type === "category"
      ? initialProduct.id
      : null);

  const subjectId =
    paymentData.subjectId ||
    (initialProduct.type === "subject"
      ? initialProduct.id
      : null);

  const genre =
    initialProduct.type === "genre"
      ? normalizeValue(
          paymentData.genre ||
            initialProduct.id
        )
      : "";

  /* =======================================================
     CURRENCY
  ======================================================= */

  const initialCurrency =
    normalizeCurrency(
      paymentData.currency
    );

  const [
    selectedCurrency,
    setSelectedCurrency,
  ] = useState(
    initialCurrency
  );

  /*
    Keep the product currency synchronized
    with the selected currency.
  */

  const currency =
    normalizeCurrency(
      selectedCurrency
    );

  /* =======================================================
     PRICE
  ======================================================= */

  /*
    TESTING:

    Every payment is currently ₦100.

    When testing is finished, replace this
    with your real pricing logic.
  */

  const amount =
    DEFAULT_PRICE;

  const formattedAmount =
    useMemo(
      () =>
        formatMoney(
          amount,
          currency
        ),
      [
        amount,
        currency,
      ]
    );

  const paystackAmount =
    useMemo(
      () =>
        toPaystackSubunit(
          amount
        ),
      [amount]
    );

  /* =======================================================
     CALLBACK
  ======================================================= */

  const queryParams =
    useMemo(
      () =>
        new URLSearchParams(
          location.search
        ),
      [location.search]
    );

  const callbackReference =
    queryParams.get(
      "reference"
    ) ||
    queryParams.get(
      "trxref"
    ) ||
    null;

  /* =======================================================
     STATE
  ======================================================= */

  const [user, setUser] =
    useState(null);

  const [
    loadingUser,
    setLoadingUser,
  ] = useState(true);

  const [
    initializing,
    setInitializing,
  ] = useState(false);

  const [
    verifying,
    setVerifying,
  ] = useState(false);

  const [
    payment,
    setPayment,
  ] = useState(null);

  const [
    paymentConfirmed,
    setPaymentConfirmed,
  ] = useState(false);

  const [error, setError] =
    useState("");

  const initializedRef =
    useRef(false);

  const verifiedRef =
    useRef(false);

  /* =======================================================
     LOAD USER
  ======================================================= */

  useEffect(() => {
    let mounted = true;

    const loadUser =
      async () => {
        try {
          setLoadingUser(true);
          setError("");

          const {
            data: {
              user: currentUser,
            },
            error: authError,
          } =
            await supabase.auth.getUser();

          if (authError) {
            throw authError;
          }

          if (!currentUser) {
            navigate(
              "/login",
              {
                replace: true,
              }
            );

            return;
          }

          if (mounted) {
            setUser(
              currentUser
            );
          }
        } catch (err) {
          console.error(
            "Payment user error:",
            err
          );

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

  /* =======================================================
     VERIFY CALLBACK
  ======================================================= */

  useEffect(() => {
    if (
      loadingUser ||
      !user ||
      !callbackReference ||
      verifiedRef.current
    ) {
      return;
    }

    verifiedRef.current =
      true;

    verifyPayment(
      callbackReference
    );
  }, [
    loadingUser,
    user,
    callbackReference,
  ]);

  /* =======================================================
     INITIALIZE PAYMENT
  ======================================================= */

  useEffect(() => {
    if (
      loadingUser ||
      !user ||
      !initialProduct.id ||
      callbackReference ||
      initializedRef.current
    ) {
      return;
    }

    initializedRef.current =
      true;

    initializePayment();
  }, [
    loadingUser,
    user,
    initialProduct.id,
    callbackReference,
  ]);

  /* =======================================================
     INITIALIZE
  ======================================================= */

  const initializePayment =
    async () => {
      if (!user) {
        navigate(
          "/login"
        );
        return;
      }

      if (!initialProduct.id) {
        setError(
          `No ${initialProduct.type} was provided for this payment.`
        );
        return;
      }

      if (
        !Number.isFinite(
          amount
        ) ||
        amount <= 0
      ) {
        setError(
          "Invalid payment amount."
        );
        return;
      }

      if (
        !CURRENCY_CONFIG[
          currency
        ]
      ) {
        setError(
          `Unsupported currency: ${currency}`
        );
        return;
      }

      setInitializing(true);
      setError("");

      try {
        const {
          data: {
            session: authSession,
          },
        } =
          await supabase.auth.getSession();

        const accessToken =
          authSession?.access_token;

        if (!accessToken) {
          navigate(
            "/login",
            {
              replace: true,
            }
          );

          return;
        }

        /*
          ====================================================
          IMPORTANT PAYMENT PAYLOAD
          ====================================================

          Frontend amount:
            100

          Paystack subunit:
            10000

          Backend should send 10000 to Paystack.
        */

        const paymentPayload = {
          email:
            user.email,

          amount,

          currency,

          paystackAmount,

          productType:
            initialProduct.type,

          productId:
            initialProduct.id,

          productName:
            initialProduct.name,

          displayName:
            initialProduct.displayName,

          genre:
            genre || null,

          genreId:
            genre || null,

          categoryId,

          categoryName:
            paymentData.categoryName ||
            null,

          subjectId,

          subjectName:
            paymentData.subjectName ||
            null,

          storyId,

          storyTitle,

          metadata: {
            productType:
              initialProduct.type,

            productId:
              initialProduct.id,

            productName:
              initialProduct.name,

            displayName:
              initialProduct.displayName,

            amount,

            currency,

            paystackAmount,

            genre:
              genre || null,

            genreId:
              genre || null,

            categoryId,

            categoryName:
              paymentData.categoryName ||
              null,

            subjectId,

            subjectName:
              paymentData.subjectName ||
              null,

            storyId,

            storyTitle,
          },
        };

        console.log(
          "PAYMENT INITIALIZATION PAYLOAD:",
          paymentPayload
        );

        const response =
          await fetch(
            `${API_BASE_URL}/api/payments/initialize`,
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",

                Authorization:
                  `Bearer ${accessToken}`,
              },

              body:
                JSON.stringify(
                  paymentPayload
                ),
            }
          );

        let result;

        try {
          result =
            await response.json();
        } catch {
          throw new Error(
            "The payment server returned an invalid response."
          );
        }

        console.log(
          "PAYMENT INITIALIZATION RESPONSE:",
          result
        );

        if (
          !response.ok ||
          !result?.success
        ) {
          throw new Error(
            result?.error ||
              result?.message ||
              "Unable to initialize payment."
          );
        }

        if (
          !result?.authorization_url
        ) {
          throw new Error(
            "Paystack checkout URL was not returned."
          );
        }

        setPayment(
          result
        );
      } catch (err) {
        console.error(
          "Payment initialization error:",
          err
        );

        setError(
          err?.message ||
            "Unable to initialize payment."
        );
      } finally {
        setInitializing(false);
      }
    };

  /* =======================================================
     CHANGE CURRENCY
  ======================================================= */

  const handleCurrencyChange =
    (newCurrency) => {
      if (
        !ENABLED_CURRENCIES.includes(
          newCurrency
        )
      ) {
        return;
      }

      /*
        If currency is changed after a payment
        was initialized, discard the old checkout.
      */

      setPayment(null);
      setError("");

      initializedRef.current =
        false;

      setSelectedCurrency(
        normalizeCurrency(
          newCurrency
        )
      );
    };

  /* =======================================================
     OPEN PAYSTACK
  ======================================================= */

  const startPaystackPayment =
    () => {
      if (
        !payment?.authorization_url
      ) {
        setError(
          "Paystack checkout is not ready yet."
        );

        return;
      }

      window.location.href =
        payment.authorization_url;
    };

  /* =======================================================
     VERIFY PAYMENT
  ======================================================= */

  async function verifyPayment(
    reference
  ) {
    if (
      !reference ||
      !user
    ) {
      return;
    }

    setVerifying(true);
    setError("");

    try {
      const {
        data: {
          session: authSession,
        },
      } =
        await supabase.auth.getSession();

      const accessToken =
        authSession?.access_token;

      if (!accessToken) {
        navigate(
          "/login",
          {
            replace: true,
          }
        );

        return;
      }

      const response =
        await fetch(
          `${API_BASE_URL}/api/payments/verify/${encodeURIComponent(
            reference
          )}`,
          {
            method: "GET",

            headers: {
              Authorization:
                `Bearer ${accessToken}`,
            },
          }
        );

      let result;

      try {
        result =
          await response.json();
      } catch {
        throw new Error(
          "The verification server returned an invalid response."
        );
      }

      console.log(
        "PAYMENT VERIFICATION RESPONSE:",
        result
      );

      if (
        !response.ok ||
        !result?.success
      ) {
        throw new Error(
          result?.error ||
            result?.message ||
            "Unable to verify payment."
        );
      }

      /* ===================================================
         PAYMENT SUCCESS
      =================================================== */

      if (result.paid) {
        setPaymentConfirmed(
          true
        );

        setPayment(
          result
        );

        setTimeout(() => {
          const metadata =
            result.metadata ||
            {};

          /* STORY */

          const verifiedStoryId =
            metadata.storyId ||
            storyId;

          if (
            verifiedStoryId
          ) {
            navigate(
              `/story/${verifiedStoryId}`,
              {
                replace: true,

                state: {
                  paymentVerified:
                    true,

                  paymentReference:
                    reference,
                },
              }
            );

            return;
          }

          /* SUBJECT */

          const verifiedSubjectId =
            metadata.subjectId ||
            subjectId;

          if (
            verifiedSubjectId
          ) {
            navigate(
              `/subjects/${verifiedSubjectId}`,
              {
                replace: true,
              }
            );

            return;
          }

          /* CATEGORY */

          const verifiedCategoryId =
            metadata.categoryId ||
            categoryId;

          if (
            verifiedCategoryId
          ) {
            navigate(
              `/categories/${verifiedCategoryId}`,
              {
                replace: true,
              }
            );

            return;
          }

          /* GENRE */

          const verifiedGenre =
            metadata.genre ||
            genre;

          if (
            verifiedGenre
          ) {
            navigate(
              `/novels?genre=${encodeURIComponent(
                verifiedGenre
              )}`,
              {
                replace: true,
              }
            );

            return;
          }

          navigate(
            "/novels",
            {
              replace: true,
            }
          );
        }, 1600);

        return;
      }

      setError(
        result.message ||
          "Payment has not been completed."
      );
    } catch (err) {
      console.error(
        "Payment verification error:",
        err
      );

      setError(
        err?.message ||
          "Unable to verify payment."
      );
    } finally {
      setVerifying(false);
    }
  }

  /* =======================================================
     MANUAL VERIFY
  ======================================================= */

  const retryVerification =
    () => {
      if (
        !callbackReference
      ) {
        return;
      }

      verifiedRef.current =
        false;

      verifyPayment(
        callbackReference
      );
    };

  /* =======================================================
     INVALID PRODUCT
  ======================================================= */

  if (
    !loadingUser &&
    !initialProduct.id
  ) {
    return (
      <PageShell>
        <div className="relative z-10 mx-auto flex min-h-[80vh] max-w-xl items-center justify-center px-4">
          <div className="relative w-full overflow-hidden rounded-[36px] border border-white/10 bg-white/[0.045] p-8 text-center shadow-[0_30px_120px_rgba(0,0,0,0.45)] backdrop-blur-2xl sm:p-12">

            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-red-400/60 to-transparent" />

            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[26px] border border-red-400/20 bg-red-500/10">
              <AlertCircle className="h-8 w-8 text-red-400" />
            </div>

            <p className="mt-7 text-[10px] font-black uppercase tracking-[0.3em] text-red-400">
              Checkout Error
            </p>

            <h1 className="mt-3 text-3xl font-black tracking-tight text-white">
              Payment Information Missing
            </h1>

            <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-slate-500">
              We could not determine which{" "}
              {initialProduct.type} you are trying
              to unlock.
            </p>

            <button
              type="button"
              onClick={() =>
                navigate(
                  "/novels"
                )
              }
              className="group relative mt-8 inline-flex items-center gap-2 overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 px-7 py-3.5 text-sm font-black text-white"
            >
              Return to Library

              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
            </button>
          </div>
        </div>
      </PageShell>
    );
  }

  /* =======================================================
     LOADING USER
  ======================================================= */

  if (
    loadingUser
  ) {
    return (
      <PageShell>
        <LoadingCard
          title="Preparing your secure checkout"
          description="Verifying your account and access..."
        />
      </PageShell>
    );
  }

  /* =======================================================
     MAIN
  ======================================================= */

  return (
    <PageShell>

      {/* HEADER */}

      <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-[#01030a]/75 backdrop-blur-2xl">
        <div className="mx-auto flex h-[76px] max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">

          <button
            type="button"
            onClick={() =>
              navigate(-1)
            }
            className="group flex items-center gap-2 rounded-2xl border border-white/[0.08] bg-white/[0.035] px-4 py-2.5 text-xs font-bold text-slate-400 transition hover:border-white/15 hover:bg-white/[0.065] hover:text-white"
          >
            <ArrowLeft className="h-4 w-4 transition group-hover:-translate-x-1" />

            Back
          </button>

          <div className="flex items-center gap-3">

            <div className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-emerald-400/20 bg-emerald-500/[0.08]">

              <ShieldCheck className="h-4 w-4 text-emerald-400" />

              <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-emerald-400" />

            </div>

            <div className="hidden sm:block">

              <p className="text-[9px] font-black uppercase tracking-[0.22em] text-emerald-400">
                Secure Checkout
              </p>

              <p className="mt-0.5 text-[9px] text-slate-600">
                Powered by Paystack
              </p>

            </div>

          </div>
        </div>
      </header>

      {/* MAIN */}

      <main className="relative z-10 mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8 lg:py-16">

        {/* HERO */}

        <div className="mx-auto mb-12 max-w-4xl text-center">

          <div className="inline-flex items-center gap-2 rounded-full border border-blue-400/15 bg-blue-500/[0.06] px-4 py-2 backdrop-blur-xl">

            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-500/15">
              <Crown className="h-3 w-3 text-blue-300" />
            </div>

            <span className="text-[9px] font-black uppercase tracking-[0.24em] text-blue-300">
              {initialProduct.label}
            </span>

            <span className="h-1 w-1 rounded-full bg-blue-400/50" />

            <span className="text-[9px] font-bold text-slate-500">
              Secure payment
            </span>

          </div>

          <h1 className="mt-7 text-4xl font-black leading-[0.98] tracking-[-0.055em] text-white sm:text-6xl lg:text-7xl">

            Unlock your{" "}

            <span className="bg-gradient-to-r from-blue-300 via-indigo-300 to-violet-300 bg-clip-text pb-2 text-transparent">
              {initialProduct.displayName}
            </span>

          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-sm leading-7 text-slate-500 sm:text-base">
            {initialProduct.description}
          </p>

          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">

            <MiniTrust
              icon={ShieldCheck}
              text="Secure payment"
            />

            <MiniTrust
              icon={Zap}
              text="Instant unlock"
            />

            <MiniTrust
              icon={Gem}
              text="Premium access"
            />

          </div>

        </div>

        {/* STEPS */}

        <div className="mx-auto mb-9 flex max-w-2xl items-center justify-center">

          <Step
            number="01"
            title="Review"
            active
          />

          <StepLine active />

          <Step
            number="02"
            title="Pay"
            active={
              initializing ||
              !!payment ||
              verifying ||
              paymentConfirmed
            }
          />

          <StepLine
            active={
              verifying ||
              paymentConfirmed
            }
          />

          <Step
            number="03"
            title="Unlock"
            active={
              paymentConfirmed
            }
          />

        </div>

        {/* GRID */}

        <div className="grid gap-6 xl:grid-cols-[0.86fr_1.14fr]">

          {/* LEFT */}

          <section className="group relative overflow-hidden rounded-[36px] border border-white/[0.09] bg-white/[0.035] shadow-[0_30px_120px_rgba(0,0,0,0.35)] backdrop-blur-2xl">

            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-400/50 to-transparent" />

            <div className="relative p-7 sm:p-9 lg:p-10">

              <div className="flex items-start justify-between gap-4">

                <div className="relative flex h-[68px] w-[68px] items-center justify-center rounded-[24px] border border-blue-400/20 bg-gradient-to-br from-blue-500/15 via-indigo-500/10 to-transparent">

                  <ProductIcon className="h-7 w-7 text-blue-300" />

                  <div className="absolute -right-1.5 -top-1.5 flex h-6 w-6 items-center justify-center rounded-full border border-[#090d19] bg-gradient-to-br from-blue-400 to-indigo-500">

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
                {initialProduct.displayName}
              </h2>

              <p className="mt-4 max-w-md text-sm leading-7 text-slate-500">
                {initialProduct.description}
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

              {/* ACCESS TYPE */}

              <div className="mt-4 flex items-center gap-3 rounded-[24px] border border-white/[0.07] bg-black/20 p-4">

                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/[0.06] bg-white/[0.035]">

                  <ProductIcon className="h-4 w-4 text-slate-400" />

                </div>

                <div>

                  <p className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-600">
                    Access Type
                  </p>

                  <p className="mt-1 text-xs font-bold text-white">
                    {initialProduct.accessLabel}
                  </p>

                </div>

              </div>

              {/* BENEFITS */}

              <div className="mt-9">

                <p className="text-[9px] font-black uppercase tracking-[0.22em] text-slate-600">
                  Everything included
                </p>

                <div className="mt-4 grid gap-3">

                  <Benefit
                    icon={Library}
                    text={
                      initialProduct.benefitText
                    }
                  />

                  <Benefit
                    icon={Zap}
                    text="Instant access after payment"
                  />

                  <Benefit
                    icon={BadgeCheck}
                    text="One payment for lifetime access"
                  />

                  <Benefit
                    icon={LockKeyhole}
                    text="Protected account-based access"
                  />

                </div>

              </div>

              {/* PRICE */}

              <div className="relative mt-9 overflow-hidden rounded-[28px] border border-white/[0.07] bg-black/20 p-5">

                <div className="relative flex items-end justify-between gap-5">

                  <div>

                    <p className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-600">
                      Total today
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      One-time payment
                    </p>

                  </div>

                  <div className="text-right">

                    <p className="text-4xl font-black tracking-[-0.04em] text-white">
                      {formattedAmount}
                    </p>

                    <p className="mt-1 text-[8px] font-black uppercase tracking-[0.2em] text-blue-400">
                      Lifetime unlock
                    </p>

                  </div>

                </div>

              </div>

              {/* ACCOUNT */}

              <div className="mt-6 flex items-center gap-3">

                <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-emerald-400/10 bg-emerald-500/[0.05]">

                  <Fingerprint className="h-4 w-4 text-emerald-400" />

                </div>

                <div>

                  <p className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-400">
                    Account protected
                  </p>

                  <p className="mt-0.5 text-[9px] text-slate-600">
                    Your purchase is linked to your account.
                  </p>

                </div>

              </div>

            </div>
          </section>

          {/* RIGHT */}

          <section className="relative overflow-hidden rounded-[36px] border border-white/[0.1] bg-white/[0.045] shadow-[0_35px_140px_rgba(0,0,0,0.45)] backdrop-blur-2xl">

            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-400/80 to-transparent" />

            <div className="relative p-6 sm:p-8 lg:p-10">

              <div className="flex items-start justify-between gap-4">

                <div>

                  <div className="flex items-center gap-2">

                    <span className="relative flex h-2 w-2">

                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-50" />

                      <span className="relative inline-flex h-2 w-2 rounded-full bg-blue-400" />

                    </span>

                    <p className="text-[9px] font-black uppercase tracking-[0.24em] text-blue-400">
                      Payment Details
                    </p>

                  </div>

                  <h3 className="mt-2 text-2xl font-black tracking-[-0.03em] text-white sm:text-3xl">
                    Complete your payment
                  </h3>

                  <p className="mt-2 text-xs text-slate-600">
                    You will be securely redirected to Paystack.
                  </p>

                </div>

                <div className="hidden h-12 w-12 items-center justify-center rounded-2xl border border-white/[0.07] bg-white/[0.035] sm:flex">

                  <CreditCard className="h-5 w-5 text-slate-500" />

                </div>

              </div>

              {/* =================================================
                  CURRENCY SELECTOR
              ================================================= */}

              <div className="mt-7">

                <div className="mb-3 flex items-center justify-between">

                  <label
                    htmlFor="payment-currency"
                    className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500"
                  >
                    Payment Currency
                  </label>

                  <span className="text-[8px] font-bold uppercase tracking-[0.15em] text-emerald-400">
                    Test Mode
                  </span>

                </div>

                <div className="relative">

                  <select
                    id="payment-currency"
                    value={
                      selectedCurrency
                    }
                    onChange={(event) =>
                      handleCurrencyChange(
                        event.target.value
                      )
                    }
                    className="w-full appearance-none rounded-[22px] border border-white/[0.1] bg-black/30 px-5 py-4 pr-12 text-sm font-bold text-white outline-none transition focus:border-blue-400/40 focus:bg-black/40"
                  >

                    {ENABLED_CURRENCIES.map(
                      (currencyCode) => {
                        const config =
                          CURRENCY_CONFIG[
                            currencyCode
                          ];

                        return (
                          <option
                            key={
                              currencyCode
                            }
                            value={
                              currencyCode
                            }
                            className="bg-[#080b14] text-white"
                          >
                            {currencyCode} —{" "}
                            {config.name}
                          </option>
                        );
                      }
                    )}

                  </select>

                  <ChevronDown className="pointer-events-none absolute right-5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />

                </div>

                <div className="mt-2 flex items-center gap-2">

                  <CircleDollarSign className="h-3 w-3 text-blue-400" />

                  <p className="text-[8px] font-bold uppercase tracking-[0.14em] text-slate-600">
                    Currently testing with Nigerian Naira
                  </p>

                </div>

              </div>

              {/* =================================================
                  TEST MODE NOTICE
              ================================================= */}

              <div className="mt-5 rounded-[24px] border border-amber-400/15 bg-amber-500/[0.045] p-4">

                <div className="flex items-start gap-3">

                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-amber-400/10 bg-amber-500/[0.08]">

                    <Zap className="h-4 w-4 text-amber-400" />

                  </div>

                  <div>

                    <p className="text-[9px] font-black uppercase tracking-[0.16em] text-amber-300">
                      Testing Payment
                    </p>

                    <p className="mt-1 text-[9px] leading-5 text-amber-200/50">
                      This checkout is currently configured for a
                      test payment of ₦100. No real money should be
                      charged when Paystack Test Mode is enabled.
                    </p>

                  </div>

                </div>

              </div>

              {/* AMOUNT */}

              <div className="relative mt-6 overflow-hidden rounded-[28px] border border-blue-400/15 bg-gradient-to-br from-blue-500/[0.11] via-indigo-500/[0.06] to-transparent p-6">

                <div className="relative flex items-center justify-between">

                  <div>

                    <p className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-600">
                      Amount payable
                    </p>

                    <p className="mt-2 text-4xl font-black tracking-[-0.04em] text-white">
                      {formattedAmount}
                    </p>

                    <div className="mt-2 flex items-center gap-1.5">

                      <CircleDollarSign className="h-3 w-3 text-blue-400" />

                      <span className="text-[9px] font-bold text-blue-300">
                        {
                          CURRENCY_CONFIG[
                            currency
                          ]?.name
                        }
                      </span>

                    </div>

                  </div>

                  <div className="hidden h-14 w-14 items-center justify-center rounded-[20px] border border-blue-400/15 bg-blue-500/10 sm:flex">

                    <CreditCard className="h-6 w-6 text-blue-400" />

                  </div>

                </div>

              </div>

              {/* CALLBACK */}

              {callbackReference ? (

                <div className="relative mt-6 overflow-hidden rounded-[28px] border border-blue-400/15 bg-blue-500/[0.055] p-6">

                  {paymentConfirmed ? (

                    <>

                      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[22px] border border-emerald-400/20 bg-emerald-500/10">

                        <CheckCircle2 className="h-8 w-8 text-emerald-400" />

                      </div>

                      <p className="mt-5 text-center text-[9px] font-black uppercase tracking-[0.24em] text-emerald-400">
                        Access Granted
                      </p>

                      <h4 className="mt-2 text-center text-xl font-black text-white">
                        Payment Confirmed
                      </h4>

                      <p className="mt-2 text-center text-xs leading-6 text-slate-500">
                        Your {initialProduct.displayName} access has been unlocked.
                      </p>

                    </>

                  ) : verifying ? (

                    <div className="text-center">

                      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[22px] border border-blue-400/20 bg-blue-500/10">

                        <Loader2 className="h-7 w-7 animate-spin text-blue-400" />

                      </div>

                      <p className="mt-5 text-[9px] font-black uppercase tracking-[0.24em] text-blue-400">
                        Verifying Transaction
                      </p>

                      <h4 className="mt-2 text-xl font-black text-white">
                        Checking your payment
                      </h4>

                      <p className="mt-2 text-xs leading-6 text-slate-500">
                        Please wait while we securely verify the transaction with Paystack.
                      </p>

                    </div>

                  ) : (

                    <div className="text-center">

                      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[22px] border border-red-400/20 bg-red-500/10">

                        <AlertCircle className="h-7 w-7 text-red-400" />

                      </div>

                      <p className="mt-5 text-[9px] font-black uppercase tracking-[0.24em] text-red-400">
                        Verification
                      </p>

                      <h4 className="mt-2 text-xl font-black text-white">
                        Payment needs attention
                      </h4>

                      {error && (
                        <p className="mt-2 text-xs leading-6 text-slate-500">
                          {error}
                        </p>
                      )}

                      <button
                        type="button"
                        onClick={
                          retryVerification
                        }
                        className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-xs font-black text-white transition hover:bg-blue-500"
                      >
                        Verify Again

                        <ArrowRight className="h-4 w-4" />
                      </button>

                    </div>
                  )}

                </div>

              ) : (

                <>

                  {/* ERROR */}

                  {error && (
                    <div className="mt-5 flex gap-3 rounded-[24px] border border-red-400/15 bg-red-500/[0.055] p-4">

                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-500/10">

                        <AlertCircle className="h-4 w-4 text-red-400" />

                      </div>

                      <div>

                        <p className="text-[9px] font-black uppercase tracking-[0.12em] text-red-300">
                          Payment Error
                        </p>

                        <p className="mt-1 text-xs leading-5 text-red-300/75">
                          {error}
                        </p>

                      </div>

                    </div>
                  )}

                  {/* PAY BUTTON */}

                  <button
                    type="button"
                    disabled={
                      initializing ||
                      !payment?.authorization_url
                    }
                    onClick={
                      startPaystackPayment
                    }
                    className="group relative mt-6 flex w-full items-center justify-center gap-3 overflow-hidden rounded-[24px] bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 px-6 py-4 text-sm font-black text-white shadow-[0_20px_60px_rgba(37,99,235,0.2)] transition duration-500 hover:-translate-y-1 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0"
                  >

                    <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/[0.16] to-transparent transition duration-1000 group-hover:translate-x-full" />

                    {initializing ? (

                      <>

                        <Loader2 className="relative h-4 w-4 animate-spin" />

                        <span className="relative">
                          Preparing Secure Checkout...
                        </span>

                      </>

                    ) : (

                      <>

                        <CreditCard className="relative h-4 w-4" />

                        <span className="relative">
                          Pay {formattedAmount} with Paystack
                        </span>

                        <ArrowRight className="relative h-4 w-4 transition group-hover:translate-x-1" />

                      </>
                    )}

                  </button>

                  {/* PAYMENT INFO */}

                  <div className="mt-6 rounded-[24px] border border-white/[0.06] bg-black/20 p-4">

                    <div className="flex items-start gap-3">

                      <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />

                      <div>

                        <p className="text-[9px] font-black uppercase tracking-[0.16em] text-slate-400">
                          Secure Paystack Checkout
                        </p>

                        <p className="mt-1 text-[9px] leading-5 text-slate-600">
                          Paystack will show the payment methods available for this transaction. No bank account number is required on this page.
                        </p>

                      </div>

                    </div>

                  </div>

                </>
              )}

              {/* REFERENCE */}

              {payment?.reference && (

                <div className="relative mt-5 overflow-hidden rounded-[24px] border border-violet-400/10 bg-violet-500/[0.045] p-4">

                  <div className="flex items-start gap-3">

                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-500/10">

                      <ClipboardCheck className="h-4 w-4 text-violet-400" />

                    </div>

                    <div className="min-w-0">

                      <p className="text-[8px] font-black uppercase tracking-[0.2em] text-violet-400">
                        Payment Reference
                      </p>

                      <p className="mt-1 break-all text-xs font-black text-white">
                        {payment.reference}
                      </p>

                    </div>

                  </div>

                </div>
              )}

              <div className="mt-7 flex items-center justify-center gap-2 border-t border-white/[0.06] pt-6">

                <ShieldCheck className="h-3.5 w-3.5 text-emerald-500/70" />

                <p className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-600">
                  Secure account-based access
                </p>

              </div>

            </div>
          </section>

        </div>

        {/* TRUST */}

        <div className="mx-auto mt-7 grid max-w-5xl gap-3 sm:grid-cols-3">

          <TrustItem
            icon={LockKeyhole}
            title="Secure"
            text="Protected account access"
          />

          <TrustItem
            icon={Zap}
            title="Instant"
            text="Automatic payment verification"
          />

          <TrustItem
            icon={Library}
            title="Premium Access"
            text={`Unlock ${initialProduct.displayName}`}
          />

        </div>

        <div className="mt-8 flex items-center justify-center gap-2">

          <Star className="h-3 w-3 text-blue-400/50" />

          <p className="text-center text-[8px] font-bold uppercase tracking-[0.2em] text-slate-700">
            Premium reading experience
          </p>

          <Star className="h-3 w-3 text-blue-400/50" />

        </div>

      </main>
    </PageShell>
  );
};

/* =========================================================
   PAGE SHELL
========================================================= */

const PageShell = ({
  children,
}) => (
  <div className="relative min-h-screen overflow-x-hidden bg-[#01030a] text-white selection:bg-blue-500/30">

    <PremiumBackground />

    {children}

  </div>
);

/* =========================================================
   LOADING
========================================================= */

const LoadingCard = ({
  title,
  description,
}) => (
  <div className="relative z-10 flex min-h-screen items-center justify-center px-4">

    <div className="text-center">

      <div className="relative mx-auto flex h-24 w-24 items-center justify-center rounded-[30px] border border-blue-400/20 bg-white/[0.035]">

        <Loader2 className="h-8 w-8 animate-spin text-blue-400" />

        <Sparkles className="absolute h-3 w-3 text-indigo-300" />

      </div>

      <p className="mt-7 text-sm font-black text-white">
        {title}
      </p>

      <p className="mt-2 text-xs text-slate-500">
        {description}
      </p>

    </div>

  </div>
);

/* =========================================================
   MINI TRUST
========================================================= */

const MiniTrust = ({
  icon: Icon,
  text,
}) => (
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
          ? "border-blue-400/30 bg-blue-500/15 text-blue-300"
          : "border-white/[0.08] bg-white/[0.025] text-slate-700"
      }`}
    >

      {active &&
      number === "03" ? (
        <Check className="h-3.5 w-3.5" />
      ) : (
        number
      )}

    </div>

    <span
      className={`mt-2 text-[8px] font-black uppercase tracking-[0.15em] ${
        active
          ? "text-slate-400"
          : "text-slate-700"
      }`}
    >
      {title}
    </span>

  </div>
);

/* =========================================================
   STEP LINE
========================================================= */

const StepLine = ({
  active = false,
}) => (
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

    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-emerald-400/10 bg-emerald-500/[0.055]">

      <Icon className="h-3.5 w-3.5 text-emerald-400" />

    </div>

    <span className="text-xs font-semibold text-slate-400">
      {text}
    </span>

  </div>
);

/* =========================================================
   TRUST
========================================================= */

const TrustItem = ({
  icon: Icon,
  title,
  text,
}) => (
  <div className="group flex items-center justify-center gap-3 rounded-2xl border border-white/[0.07] bg-white/[0.025] px-4 py-4 backdrop-blur-xl">

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
   BACKGROUND
========================================================= */

const PremiumBackground = () => (
  <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-[#01030a]">

    <div className="absolute inset-0 bg-[#01030a]" />

    <div
      className="absolute -left-[220px] -top-[220px] h-[700px] w-[700px] rounded-full bg-blue-600/[0.095] blur-[150px]"
      style={{
        animation:
          "premiumAuroraOne 20s ease-in-out infinite",
      }}
    />

    <div
      className="absolute -right-[250px] top-[5%] h-[720px] w-[720px] rounded-full bg-indigo-600/[0.085] blur-[160px]"
      style={{
        animation:
          "premiumAuroraTwo 25s ease-in-out infinite",
      }}
    />

    <div
      className="absolute bottom-[-350px] left-[18%] h-[700px] w-[700px] rounded-full bg-violet-600/[0.065] blur-[170px]"
      style={{
        animation:
          "premiumAuroraThree 28s ease-in-out infinite",
      }}
    />

    <div
      className="absolute inset-0 opacity-[0.035]"
      style={{
        backgroundImage:
          "radial-gradient(circle, rgba(255,255,255,.9) 1px, transparent 1px)",
        backgroundSize:
          "34px 34px",
        animation:
          "premiumDots 28s linear infinite",
      }}
    />

    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_25%,rgba(0,0,0,0.5)_100%)]" />

    <style>
      {`
        @keyframes premiumAuroraOne {
          0%,100% {
            transform: translate3d(0,0,0) scale(1);
          }

          50% {
            transform: translate3d(80px,100px,0) scale(1.08);
          }
        }

        @keyframes premiumAuroraTwo {
          0%,100% {
            transform: translate3d(0,0,0) scale(1);
          }

          50% {
            transform: translate3d(-90px,80px,0) scale(1.08);
          }
        }

        @keyframes premiumAuroraThree {
          0%,100% {
            transform: translate3d(0,0,0);
          }

          50% {
            transform: translate3d(100px,-70px,0);
          }
        }

        @keyframes premiumDots {
          0% {
            transform: translate3d(0,0,0);
          }

          100% {
            transform: translate3d(34px,0,0);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          *,
          *::before,
          *::after {
            animation-duration: .01ms !important;
            animation-iteration-count: 1 !important;
          }
        }
      `}
    </style>

  </div>
);

export default Payment;
