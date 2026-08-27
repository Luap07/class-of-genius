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
      (doc) =>
        String(doc.id) === String(documentId)
    );
  }, [documents, documentId]);

  /* =========================================================
     FIND CATEGORY
  ========================================================= */

  const category = useMemo(() => {
    if (!categoryId) return null;

    return categories.find(
      (cat) =>
        String(cat.id) === String(categoryId)
    );
  }, [categories, categoryId]);

  /* =========================================================
     PAYMENT
  ========================================================= */

  const handlePayment = () => {
    /*
      IMPORTANT:

      Put your real payment gateway initialization
      here.

      The payment must be tied to THIS document only.

      documentId = the exact document being purchased.
    */

    console.log("Starting payment:", {
      documentId,
      categoryId,
      amount: DOCUMENT_PRICE,
    });

    /*
      Example:

      initializePayment({
        amount: DOCUMENT_PRICE,
        documentId,
        categoryId,
      });
    */
  };

  /* =========================================================
     INVALID PAYMENT REQUEST
  ========================================================= */

  if (!documentId) {
    return (
      <div className="min-h-screen bg-[#080d1d] px-6 py-20 text-white">
        <div className="mx-auto max-w-xl text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-red-400/10 text-red-300">
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
              rounded-2xl
              bg-gradient-to-r
              from-cyan-300
              to-blue-400
              px-6
              py-3
              text-sm
              font-black
              text-slate-950
            "
          >
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
        bg-[#080d1d]
        text-slate-100
      "
    >
      {/* =====================================================
          BACKGROUND
      ===================================================== */}

      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div
          className="
            absolute
            -left-40
            -top-40
            h-[600px]
            w-[600px]
            rounded-full
            bg-cyan-400/10
            blur-[150px]
          "
        />

        <div
          className="
            absolute
            -right-40
            top-20
            h-[650px]
            w-[650px]
            rounded-full
            bg-violet-500/10
            blur-[160px]
          "
        />

        <div
          className="
            absolute
            inset-0
            bg-[linear-gradient(to_right,rgba(56,189,248,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(56,189,248,0.05)_1px,transparent_1px)]
            [background-size:4rem_4rem]
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
          border-white/[0.08]
          bg-[#0a1022]/80
          backdrop-blur-2xl
        "
      >
        <div
          className="
            mx-auto
            flex
            max-w-6xl
            items-center
            justify-between
            px-6
            py-4
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
              bg-white/[0.04]
              px-4
              py-2.5
              text-xs
              font-black
              text-slate-300
              transition
              hover:border-cyan-400/30
              hover:bg-cyan-400/10
              hover:text-cyan-300
            "
          >
            <ArrowLeft
              size={15}
              className="transition-transform group-hover:-translate-x-1"
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
              bg-emerald-400/[0.07]
              px-4
              py-2
              text-[11px]
              font-black
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

      <main className="relative z-10 mx-auto max-w-6xl px-6 py-12">
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
            duration: 0.5,
          }}
          className="mx-auto max-w-4xl"
        >
          {/* HEADER */}

          <div className="text-center">
            <div
              className="
                mx-auto
                flex
                h-16
                w-16
                items-center
                justify-center
                rounded-2xl
                bg-gradient-to-br
                from-cyan-300
                via-blue-500
                to-violet-600
                shadow-xl
                shadow-cyan-500/20
              "
            >
              <CreditCard
                size={28}
                className="text-white"
              />
            </div>

            <div
              className="
                mt-6
                inline-flex
                items-center
                gap-2
                rounded-full
                border
                border-cyan-400/20
                bg-cyan-400/[0.07]
                px-4
                py-2
                text-[10px]
                font-black
                uppercase
                tracking-[0.18em]
                text-cyan-300
              "
            >
              <Sparkles size={13} />

              Premium Resource
            </div>

            <h1 className="mt-5 text-3xl font-black text-white md:text-5xl">
              Unlock This Document
            </h1>

            <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-slate-400 md:text-base">
              Purchase access to this specific learning
              resource. Your payment unlocks this document
              only.
            </p>
          </div>

          {/* =================================================
              PAYMENT CARD
          ================================================= */}

          <div className="mt-10 grid gap-6 lg:grid-cols-[1fr_380px]">
            {/* DOCUMENT */}

            <div
              className="
                rounded-[30px]
                border
                border-white/[0.08]
                bg-[#101a34]/80
                p-6
                shadow-2xl
                backdrop-blur-2xl
              "
            >
              <div className="flex items-center gap-4">
                <div
                  className="
                    flex
                    h-14
                    w-14
                    shrink-0
                    items-center
                    justify-center
                    rounded-2xl
                    bg-cyan-400/10
                    text-cyan-300
                  "
                >
                  <BookOpen size={25} />
                </div>

                <div className="min-w-0">
                  <p className="text-[10px] font-black uppercase tracking-widest text-cyan-300/60">
                    Selected Resource
                  </p>

                  <h2 className="mt-1 truncate text-xl font-black text-white">
                    {document?.title ||
                      "Learning Document"}
                  </h2>
                </div>
              </div>

              <div className="mt-6 rounded-2xl border border-white/[0.06] bg-[#080f25]/70 p-5">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Description
                </p>

                <p className="mt-2 text-sm leading-7 text-slate-300">
                  {document?.description ||
                    "Premium educational material available for individual purchase."}
                </p>
              </div>

              {category?.name && (
                <div className="mt-4 flex items-center justify-between rounded-2xl border border-white/[0.06] bg-[#080f25]/50 px-4 py-3">
                  <span className="text-xs text-slate-500">
                    Category
                  </span>

                  <span className="text-xs font-black text-cyan-300">
                    {category.name}
                  </span>
                </div>
              )}

              <div className="mt-6 space-y-3">
                <AccessItem>
                  Individual document access
                </AccessItem>

                <AccessItem>
                  Read the purchased resource
                </AccessItem>

                <AccessItem>
                  Download access
                </AccessItem>

                <AccessItem>
                  Secure payment verification
                </AccessItem>
              </div>
            </div>

            {/* =================================================
                CHECKOUT
            ================================================= */}

            <div
              className="
                h-fit
                rounded-[30px]
                border
                border-cyan-400/20
                bg-gradient-to-b
                from-[#142b52]/90
                via-[#101a35]/90
                to-[#171331]/90
                p-6
                shadow-2xl
              "
            >
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">
                  Document price
                </span>

                <span className="text-2xl font-black text-white">
                  ₦
                  {DOCUMENT_PRICE.toLocaleString()}
                </span>
              </div>

              <div className="my-6 h-px bg-white/[0.08]" />

              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-slate-300">
                  Total
                </span>

                <span className="text-3xl font-black text-cyan-300">
                  ₦
                  {DOCUMENT_PRICE.toLocaleString()}
                </span>
              </div>

              <button
                onClick={handlePayment}
                className="
                  mt-7
                  flex
                  w-full
                  items-center
                  justify-center
                  gap-2
                  rounded-2xl
                  bg-gradient-to-r
                  from-cyan-300
                  via-blue-400
                  to-indigo-400
                  px-6
                  py-4
                  text-sm
                  font-black
                  text-slate-950
                  shadow-xl
                  shadow-cyan-500/10
                  transition-all
                  hover:-translate-y-1
                  active:scale-[0.98]
                "
              >
                <CreditCard size={18} />

                Pay ₦
                {DOCUMENT_PRICE.toLocaleString()}
              </button>

              <div className="mt-5 flex items-center justify-center gap-2 text-[11px] text-slate-500">
                <Lock size={12} />

                Secure payment
              </div>

              <div className="mt-6 rounded-2xl border border-amber-400/15 bg-amber-400/[0.05] p-4">
                <p className="text-xs font-black text-amber-300">
                  Important
                </p>

                <p className="mt-1 text-[11px] leading-5 text-slate-500">
                  This payment unlocks only the selected
                  document. Other documents in this category
                  remain locked until purchased separately.
                </p>
              </div>
            </div>
          </div>
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
    <div className="flex items-center gap-3">
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
