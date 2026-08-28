import React, { useMemo } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  CreditCard,
  Lock,
  ShieldCheck,
  Sparkles,
  FileText,
  Download,
  Zap,
  BadgeCheck,
  Crown,
  ChevronRight,
} from "lucide-react";
import {
  useNavigate,
  useSearchParams,
} from "react-router-dom";

import { useCourses } from "../../context/LMSContext/CourseContext";

const DOCUMENT_PRICE = 4000;

export default function CategorySubjectPayment() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const documentId = searchParams.get("documentId");
  const categoryId = searchParams.get("categoryId");

  const courseContext = useCourses() || {};

  const {
    documents = [],
    categories = [],
  } = courseContext;

  /* =========================================================
     FIND DOCUMENT
  ========================================================= */

  const document = useMemo(() => {
    if (!documentId) return null;

    return documents.find(
      (doc) => String(doc.id) === String(documentId)
    );
  }, [documents, documentId]);

  /* =========================================================
     FIND CATEGORY
  ========================================================= */

  const category = useMemo(() => {
    if (!categoryId) return null;

    return categories.find(
      (cat) => String(cat.id) === String(categoryId)
    );
  }, [categories, categoryId]);

  /* =========================================================
     PAYMENT
     
     PAYSTACK WILL BE CONNECTED HERE NEXT.
  ========================================================= */

  const handlePayment = () => {
    console.log("Starting payment:", {
      documentId,
      categoryId,
      amount: DOCUMENT_PRICE,
    });
  };

  /* =========================================================
     INVALID PAYMENT REQUEST
  ========================================================= */

  if (!documentId) {
    return (
      <div className="min-h-screen bg-[#060a16] px-6 py-20 text-white">
        <div className="mx-auto max-w-xl text-center">
          <div
            className="
              mx-auto
              flex
              h-20
              w-20
              items-center
              justify-center
              rounded-3xl
              border
              border-red-400/20
              bg-red-400/10
              text-red-300
            "
          >
            <FileText size={32} />
          </div>

          <h1 className="mt-6 text-3xl font-black">
            Invalid Payment Request
          </h1>

          <p className="mt-3 text-slate-400">
            No document was selected for payment.
          </p>

          <button
            onClick={() => navigate("/subjects")}
            className="
              mt-8
              inline-flex
              items-center
              gap-2
              rounded-2xl
              bg-gradient-to-r
              from-cyan-300
              to-blue-400
              px-6
              py-3
              text-sm
              font-black
              text-slate-950
              shadow-lg
              shadow-cyan-500/20
              transition
              hover:-translate-y-1
            "
          >
            <ArrowLeft size={16} />
            Back to Categories
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="
        relative
        min-h-screen
        overflow-hidden
        bg-[#060a16]
        text-slate-100
      "
    >
      {/* =====================================================
          PREMIUM BACKGROUND
      ===================================================== */}

      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div
          className="
            absolute
            -left-60
            -top-60
            h-[700px]
            w-[700px]
            rounded-full
            bg-cyan-500/[0.08]
            blur-[160px]
          "
        />

        <div
          className="
            absolute
            -right-60
            top-0
            h-[700px]
            w-[700px]
            rounded-full
            bg-violet-600/[0.08]
            blur-[170px]
          "
        />

        <div
          className="
            absolute
            bottom-[-300px]
            left-[35%]
            h-[600px]
            w-[600px]
            rounded-full
            bg-blue-500/[0.06]
            blur-[160px]
          "
        />

        <div
          className="
            absolute
            inset-0
            opacity-40
            [background-image:radial-gradient(rgba(148,163,184,0.15)_1px,transparent_1px)]
            [background-size:24px_24px]
          "
        />
      </div>

      {/* =====================================================
          NAVBAR
      ===================================================== */}

      <header
        className="
          sticky
          top-0
          z-50
          border-b
          border-white/[0.07]
          bg-[#070c1a]/75
          backdrop-blur-2xl
        "
      >
        <div
          className="
            mx-auto
            flex
            max-w-7xl
            items-center
            justify-between
            px-5
            py-4
            md:px-8
          "
        >
          <button
            onClick={() => navigate(-1)}
            className="
              group
              flex
              items-center
              gap-2
              rounded-xl
              border
              border-white/[0.08]
              bg-white/[0.035]
              px-4
              py-2.5
              text-xs
              font-black
              text-slate-300
              transition-all
              hover:border-cyan-400/30
              hover:bg-cyan-400/[0.08]
              hover:text-cyan-300
            "
          >
            <ArrowLeft
              size={15}
              className="
                transition-transform
                group-hover:-translate-x-1
              "
            />

            Back
          </button>

          <div
            className="
              flex
              items-center
              gap-2
              rounded-full
              border
              border-emerald-400/20
              bg-emerald-400/[0.06]
              px-4
              py-2
              text-[10px]
              font-black
              uppercase
              tracking-wider
              text-emerald-300
            "
          >
            <ShieldCheck size={14} />

            Secure Checkout
          </div>
        </div>
      </header>

      {/* =====================================================
          MAIN
      ===================================================== */}

      <main className="relative z-10 mx-auto max-w-7xl px-5 py-10 md:px-8 md:py-14">
        <motion.div
          initial={{
            opacity: 0,
            y: 25,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.5,
          }}
        >
          {/* =================================================
              PREMIUM HEADER
          ================================================= */}

          <div className="mx-auto max-w-3xl text-center">
            <motion.div
              initial={{
                scale: 0.8,
                opacity: 0,
              }}
              animate={{
                scale: 1,
                opacity: 1,
              }}
              transition={{
                duration: 0.45,
              }}
              className="
                mx-auto
                flex
                h-16
                w-16
                items-center
                justify-center
                rounded-[22px]
                border
                border-cyan-300/20
                bg-gradient-to-br
                from-cyan-300
                via-blue-500
                to-violet-600
                shadow-2xl
                shadow-cyan-500/20
              "
            >
              <Crown
                size={27}
                className="text-white"
              />
            </motion.div>

            <div
              className="
                mt-6
                inline-flex
                items-center
                gap-2
                rounded-full
                border
                border-violet-400/20
                bg-violet-400/[0.07]
                px-4
                py-2
                text-[10px]
                font-black
                uppercase
                tracking-[0.2em]
                text-violet-300
              "
            >
              <Sparkles size={13} />

              Premium Resource
            </div>

            <h1
              className="
                mt-5
                text-3xl
                font-black
                tracking-tight
                text-white
                md:text-5xl
              "
            >
              Unlock Premium Access
            </h1>

            <p
              className="
                mx-auto
                mt-4
                max-w-2xl
                text-sm
                leading-7
                text-slate-400
                md:text-base
              "
            >
              Get instant access to this premium learning
              document with a secure one-time payment.
            </p>
          </div>

          {/* =================================================
              CHECKOUT GRID
          ================================================= */}

          <div
            className="
              mx-auto
              mt-10
              grid
              max-w-6xl
              gap-6
              lg:grid-cols-[1fr_400px]
            "
          >
            {/* =================================================
                DOCUMENT CARD
            ================================================= */}

            <motion.div
              initial={{
                opacity: 0,
                x: -20,
              }}
              animate={{
                opacity: 1,
                x: 0,
              }}
              transition={{
                delay: 0.1,
              }}
              className="
                relative
                overflow-hidden
                rounded-[30px]
                border
                border-white/[0.08]
                bg-[#0d1529]/85
                p-6
                shadow-2xl
                backdrop-blur-2xl
                md:p-8
              "
            >
              {/* Top glow */}

              <div
                className="
                  pointer-events-none
                  absolute
                  -right-24
                  -top-24
                  h-52
                  w-52
                  rounded-full
                  bg-cyan-400/10
                  blur-3xl
                "
              />

              <div className="relative">
                {/* DOCUMENT HEADER */}

                <div className="flex items-start gap-4">
                  <div
                    className="
                      flex
                      h-16
                      w-16
                      shrink-0
                      items-center
                      justify-center
                      rounded-2xl
                      border
                      border-cyan-400/20
                      bg-gradient-to-br
                      from-cyan-400/15
                      to-blue-500/10
                      text-cyan-300
                    "
                  >
                    <BookOpen size={28} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p
                        className="
                          text-[10px]
                          font-black
                          uppercase
                          tracking-[0.18em]
                          text-cyan-300/60
                        "
                      >
                        Selected Resource
                      </p>

                      <span
                        className="
                          inline-flex
                          items-center
                          gap-1
                          rounded-full
                          border
                          border-emerald-400/20
                          bg-emerald-400/[0.06]
                          px-2.5
                          py-1
                          text-[9px]
                          font-black
                          uppercase
                          text-emerald-300
                        "
                      >
                        <BadgeCheck size={11} />

                        Premium
                      </span>
                    </div>

                    <h2
                      className="
                        mt-2
                        break-words
                        text-xl
                        font-black
                        leading-tight
                        text-white
                        md:text-2xl
                      "
                    >
                      {document?.title ||
                        "Learning Document"}
                    </h2>
                  </div>
                </div>

                {/* CATEGORY */}

                {category?.name && (
                  <div
                    className="
                      mt-6
                      flex
                      items-center
                      justify-between
                      rounded-2xl
                      border
                      border-white/[0.06]
                      bg-white/[0.025]
                      px-4
                      py-3
                    "
                  >
                    <span className="text-xs text-slate-500">
                      Category
                    </span>

                    <span className="text-xs font-black text-cyan-300">
                      {category.name}
                    </span>
                  </div>
                )}

                {/* DESCRIPTION */}

                <div
                  className="
                    mt-5
                    rounded-2xl
                    border
                    border-white/[0.06]
                    bg-[#070d1c]/70
                    p-5
                  "
                >
                  <div className="flex items-center gap-2">
                    <FileText
                      size={15}
                      className="text-slate-500"
                    />

                    <p
                      className="
                        text-[10px]
                        font-black
                        uppercase
                        tracking-wider
                        text-slate-500
                      "
                    >
                      About this resource
                    </p>
                  </div>

                  <p
                    className="
                      mt-3
                      text-sm
                      leading-7
                      text-slate-300
                    "
                  >
                    {document?.description ||
                      "Premium educational material available for individual purchase."}
                  </p>
                </div>

                {/* PREMIUM BENEFITS */}

                <div className="mt-7">
                  <div className="flex items-center gap-2">
                    <Zap
                      size={16}
                      className="text-cyan-300"
                    />

                    <h3 className="text-sm font-black text-white">
                      Your premium access includes
                    </h3>
                  </div>

                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <AccessItem>
                      Individual document access
                    </AccessItem>

                    <AccessItem>
                      Full document reading
                    </AccessItem>

                    <AccessItem>
                      Download access
                    </AccessItem>

                    <AccessItem>
                      Secure payment verification
                    </AccessItem>
                  </div>
                </div>

                {/* PURCHASE NOTICE */}

                <div
                  className="
                    mt-7
                    rounded-2xl
                    border
                    border-cyan-400/10
                    bg-cyan-400/[0.035]
                    p-4
                  "
                >
                  <div className="flex gap-3">
                    <div
                      className="
                        flex
                        h-9
                        w-9
                        shrink-0
                        items-center
                        justify-center
                        rounded-xl
                        bg-cyan-400/10
                        text-cyan-300
                      "
                    >
                      <Lock size={15} />
                    </div>

                    <div>
                      <p className="text-xs font-black text-cyan-300">
                        One document. One purchase.
                      </p>

                      <p className="mt-1 text-[11px] leading-5 text-slate-500">
                        Your payment unlocks this selected
                        document only. Other premium resources
                        remain protected.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* =================================================
                PREMIUM CHECKOUT CARD
            ================================================= */}

            <motion.div
              initial={{
                opacity: 0,
                x: 20,
              }}
              animate={{
                opacity: 1,
                x: 0,
              }}
              transition={{
                delay: 0.15,
              }}
              className="
                relative
                h-fit
                overflow-hidden
                rounded-[30px]
                border
                border-cyan-400/20
                bg-gradient-to-b
                from-[#14294b]
                via-[#0d1830]
                to-[#12102a]
                p-6
                shadow-2xl
                shadow-cyan-950/30
              "
            >
              {/* PREMIUM GLOW */}

              <div
                className="
                  pointer-events-none
                  absolute
                  -right-20
                  -top-20
                  h-48
                  w-48
                  rounded-full
                  bg-cyan-400/10
                  blur-3xl
                "
              />

              <div
                className="
                  pointer-events-none
                  absolute
                  -bottom-20
                  -left-20
                  h-48
                  w-48
                  rounded-full
                  bg-violet-500/10
                  blur-3xl
                "
              />

              <div className="relative">
                {/* CHECKOUT HEADER */}

                <div className="flex items-center justify-between">
                  <div>
                    <p
                      className="
                        text-[10px]
                        font-black
                        uppercase
                        tracking-[0.18em]
                        text-cyan-300/60
                      "
                    >
                      Premium Checkout
                    </p>

                    <h3 className="mt-1 text-xl font-black text-white">
                      Unlock Resource
                    </h3>
                  </div>

                  <div
                    className="
                      flex
                      h-11
                      w-11
                      items-center
                      justify-center
                      rounded-xl
                      border
                      border-cyan-400/20
                      bg-cyan-400/10
                      text-cyan-300
                    "
                  >
                    <CreditCard size={19} />
                  </div>
                </div>

                {/* PRICE */}

                <div
                  className="
                    mt-7
                    rounded-2xl
                    border
                    border-white/[0.07]
                    bg-black/20
                    p-5
                  "
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-400">
                      Document access
                    </span>

                    <span className="text-lg font-black text-white">
                      ₦
                      {DOCUMENT_PRICE.toLocaleString()}
                    </span>
                  </div>

                  <div className="my-5 h-px bg-white/[0.07]" />

                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-xs text-slate-500">
                        Total payment
                      </p>

                      <p
                        className="
                          mt-1
                          text-3xl
                          font-black
                          tracking-tight
                          text-cyan-300
                        "
                      >
                        ₦
                        {DOCUMENT_PRICE.toLocaleString()}
                      </p>
                    </div>

                    <span
                      className="
                        rounded-full
                        border
                        border-emerald-400/20
                        bg-emerald-400/[0.07]
                        px-3
                        py-1.5
                        text-[9px]
                        font-black
                        uppercase
                        tracking-wider
                        text-emerald-300
                      "
                    >
                      One-time
                    </span>
                  </div>
                </div>

                {/* PAYMENT BUTTON */}

                <button
                  onClick={handlePayment}
                  className="
                    group
                    mt-6
                    flex
                    w-full
                    items-center
                    justify-center
                    gap-3
                    rounded-2xl
                    bg-gradient-to-r
                    from-cyan-300
                    via-blue-400
                    to-indigo-500
                    px-6
                    py-4
                    text-sm
                    font-black
                    text-slate-950
                    shadow-xl
                    shadow-cyan-500/15
                    transition-all
                    duration-300
                    hover:-translate-y-1
                    hover:shadow-2xl
                    hover:shadow-cyan-500/20
                    active:scale-[0.98]
                  "
                >
                  <CreditCard size={18} />

                  <span>
                    Pay ₦
                    {DOCUMENT_PRICE.toLocaleString()}
                  </span>

                  <ChevronRight
                    size={17}
                    className="
                      transition-transform
                      group-hover:translate-x-1
                    "
                  />
                </button>

                {/* PAYMENT PROVIDER AREA */}

                <div
                  className="
                    mt-5
                    flex
                    items-center
                    justify-center
                    gap-2
                    text-[11px]
                    text-slate-500
                  "
                >
                  <Lock size={12} />

                  Secure payment processing
                </div>

                {/* SECURITY */}

                <div
                  className="
                    mt-6
                    grid
                    grid-cols-2
                    gap-3
                  "
                >
                  <TrustItem
                    icon={<ShieldCheck size={15} />}
                    title="Secure"
                    text="Protected checkout"
                  />

                  <TrustItem
                    icon={<BadgeCheck size={15} />}
                    title="Verified"
                    text="Payment verification"
                  />
                </div>

                {/* IMPORTANT */}

                <div
                  className="
                    mt-6
                    rounded-2xl
                    border
                    border-amber-400/15
                    bg-amber-400/[0.045]
                    p-4
                  "
                >
                  <div className="flex gap-3">
                    <div
                      className="
                        mt-0.5
                        h-2
                        w-2
                        shrink-0
                        rounded-full
                        bg-amber-300
                        shadow-lg
                        shadow-amber-300/30
                      "
                    />

                    <div>
                      <p className="text-xs font-black text-amber-300">
                        Important
                      </p>

                      <p
                        className="
                          mt-1
                          text-[11px]
                          leading-5
                          text-slate-500
                        "
                      >
                        This purchase gives access only to
                        the selected document. Other documents
                        must be purchased separately.
                      </p>
                    </div>
                  </div>
                </div>

                {/* GUARANTEE */}

                <div
                  className="
                    mt-5
                    flex
                    items-center
                    justify-center
                    gap-2
                    text-[10px]
                    font-bold
                    text-slate-600
                  "
                >
                  <ShieldCheck size={13} />

                  Your payment is handled securely
                </div>
              </div>
            </motion.div>
          </div>

          {/* =================================================
              BOTTOM PREMIUM MESSAGE
          ================================================= */}

          <motion.div
            initial={{
              opacity: 0,
              y: 15,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              delay: 0.25,
            }}
            className="
              mx-auto
              mt-8
              flex
              max-w-6xl
              flex-col
              items-center
              justify-between
              gap-4
              rounded-2xl
              border
              border-white/[0.06]
              bg-white/[0.02]
              px-5
              py-4
              text-center
              sm:flex-row
              sm:text-left
            "
          >
            <div className="flex items-center gap-3">
              <div
                className="
                  flex
                  h-9
                  w-9
                  items-center
                  justify-center
                  rounded-xl
                  bg-violet-400/10
                  text-violet-300
                "
              >
                <Sparkles size={15} />
              </div>

              <div>
                <p className="text-xs font-black text-slate-300">
                  Premium educational content
                </p>

                <p className="mt-0.5 text-[10px] text-slate-600">
                  Access your purchased resource after successful
                  payment.
                </p>
              </div>
            </div>

            <div
              className="
                flex
                items-center
                gap-2
                text-[10px]
                font-bold
                text-slate-600
              "
            >
              <Download size={13} />

              Read & download
            </div>
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
}

/* =========================================================
   ACCESS ITEM
========================================================= */

function AccessItem({ children }) {
  return (
    <div
      className="
        flex
        items-center
        gap-3
        rounded-xl
        border
        border-white/[0.04]
        bg-white/[0.02]
        px-3
        py-3
      "
    >
      <div
        className="
          flex
          h-8
          w-8
          shrink-0
          items-center
          justify-center
          rounded-lg
          bg-emerald-400/10
          text-emerald-300
        "
      >
        <CheckCircle2 size={15} />
      </div>

      <span className="text-xs font-semibold text-slate-300">
        {children}
      </span>
    </div>
  );
}

/* =========================================================
   TRUST ITEM
========================================================= */

function TrustItem({ icon, title, text }) {
  return (
    <div
      className="
        rounded-2xl
        border
        border-white/[0.06]
        bg-white/[0.025]
        p-3
      "
    >
      <div className="flex items-center gap-2">
        <span className="text-cyan-300">
          {icon}
        </span>

        <span className="text-[10px] font-black text-slate-300">
          {title}
        </span>
      </div>

      <p className="mt-1 text-[9px] text-slate-600">
        {text}
      </p>
    </div>
  );
}