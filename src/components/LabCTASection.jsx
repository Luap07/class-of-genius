import React from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  FlaskConical,
  Atom,
  Microscope,
  Sparkles,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const LabCTASection = () => {
  const navigate = useNavigate();

  return (
    <section className="relative overflow-hidden bg-[#020617] px-6 py-32 text-white">

      {/* =====================================================
          BACKGROUND ATMOSPHERE
      ===================================================== */}

      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[15%] top-0 h-96 w-96 rounded-full bg-blue-500/[0.08] blur-[150px]" />
        <div className="absolute right-[15%] bottom-0 h-96 w-96 rounded-full bg-cyan-400/[0.08] blur-[150px]" />
      </div>

      {/* =====================================================
          SUBTLE GRID
      ===================================================== */}

      <div
        className="pointer-events-none absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,.35) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.35) 1px, transparent 1px)",
          backgroundSize: "55px 55px",
        }}
      />

      <div className="relative z-10 mx-auto max-w-7xl">

        {/* ===================================================
            MAIN CTA
        =================================================== */}

        <motion.div
          initial={{
            opacity: 0,
            y: 45,
          }}
          whileInView={{
            opacity: 1,
            y: 0,
          }}
          viewport={{
            once: true,
            amount: 0.2,
          }}
          transition={{
            duration: 0.8,
            ease: "easeOut",
          }}
          className="
            relative
            overflow-hidden
            rounded-[36px]
            border
            border-white/[0.10]
            bg-slate-950/70
            px-7
            py-16
            text-center
            shadow-[0_30px_100px_rgba(0,0,0,0.35)]
            backdrop-blur-2xl
            md:px-14
            md:py-20
          "
        >

          {/* =================================================
              INNER LIGHT
          ================================================= */}

          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-400/60 to-transparent" />

          <div className="pointer-events-none absolute -left-32 -top-32 h-72 w-72 rounded-full bg-blue-500/[0.08] blur-[100px]" />

          <div className="pointer-events-none absolute -bottom-32 -right-32 h-72 w-72 rounded-full bg-cyan-400/[0.08] blur-[100px]" />

          {/* =================================================
              FLOATING SCIENCE ICONS
          ================================================= */}

          <motion.div
            animate={{
              y: [0, -8, 0],
              rotate: [0, 3, 0],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="
              pointer-events-none
              absolute
              left-[8%]
              top-[18%]
              hidden
              h-14
              w-14
              items-center
              justify-center
              rounded-2xl
              border
              border-blue-400/10
              bg-blue-500/[0.06]
              text-blue-300/40
              md:flex
            "
          >
            <Atom size={25} />
          </motion.div>

          <motion.div
            animate={{
              y: [0, 10, 0],
              rotate: [0, -4, 0],
            }}
            transition={{
              duration: 5.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="
              pointer-events-none
              absolute
              right-[8%]
              bottom-[18%]
              hidden
              h-14
              w-14
              items-center
              justify-center
              rounded-2xl
              border
              border-cyan-400/10
              bg-cyan-400/[0.06]
              text-cyan-300/40
              md:flex
            "
          >
            <Microscope size={25} />
          </motion.div>

          {/* =================================================
              CONTENT
          ================================================= */}

          <div className="relative z-10 mx-auto max-w-4xl">

            {/* Small Label */}

            <motion.div
              initial={{
                opacity: 0,
                y: 15,
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
                delay: 0.15,
              }}
              className="
                mx-auto
                inline-flex
                items-center
                gap-2.5
                rounded-full
                border
                border-cyan-300/15
                bg-cyan-400/[0.06]
                px-4
                py-2
                text-xs
                font-black
                uppercase
                tracking-[0.18em]
                text-cyan-300
              "
            >
              <Sparkles size={14} />

              Your Laboratory Awaits
            </motion.div>

            {/* =================================================
                HEADING
            ================================================= */}

            <h2
              className="
                mt-7
                text-4xl
                font-black
                leading-[1.02]
                tracking-[-0.035em]
                sm:text-5xl
                md:text-6xl
                lg:text-7xl
              "
            >
              Don't Just Learn Science.

              <span
                className="
                  mt-2
                  block
                  bg-gradient-to-r
                  from-blue-200
                  via-cyan-300
                  to-teal-300
                  bg-clip-text
                  text-transparent
                "
              >
                Experience It.
              </span>
            </h2>

            {/* =================================================
                DESCRIPTION
            ================================================= */}

            <p
              className="
                mx-auto
                mt-7
                max-w-2xl
                text-base
                leading-8
                text-slate-400
                md:text-lg
              "
            >
              Perform experiments, explore scientific concepts,
              investigate real-world phenomena and build practical
              understanding through interactive simulations.
            </p>

            {/* =================================================
                CTA BUTTONS
            ================================================= */}

            <div className="mt-10 flex flex-wrap justify-center gap-4">

              <motion.button
                type="button"
onClick={() => {
  document.getElementById("lab-subjects")?.scrollIntoView({
    behavior: "smooth",
    block: "start",
  });
}}                whileHover={{
                  y: -3,
                }}
                whileTap={{
                  scale: 0.97,
                }}
                className="
                  group
                  inline-flex
                  items-center
                  gap-3
                  rounded-2xl
                  bg-gradient-to-r
                  from-blue-500
                  via-cyan-500
                  to-teal-400
                  px-7
                  py-4
                  text-sm
                  font-black
                  text-slate-950
                  shadow-[0_15px_40px_rgba(6,182,212,0.16)]
                  transition-all
                  duration-300
                  hover:shadow-[0_20px_55px_rgba(6,182,212,0.28)]
                "
              >
                Enter Virtual Laboratory

                <ArrowRight
                  size={19}
                  className="
                    transition-transform
                    duration-300
                    group-hover:translate-x-1.5
                  "
                />
              </motion.button>

              <motion.button
                type="button"
                onClick={() => navigate("/ai-tutor")}
                whileHover={{
                  y: -3,
                }}
                whileTap={{
                  scale: 0.97,
                }}
                className="
                  inline-flex
                  items-center
                  gap-3
                  rounded-2xl
                  border
                  border-white/10
                  bg-white/[0.04]
                  px-7
                  py-4
                  text-sm
                  font-bold
                  text-white
                  backdrop-blur-md
                  transition-all
                  duration-300
                  hover:border-cyan-400/30
                  hover:bg-cyan-400/[0.06]
                "
              >
                Ask AI Assistant

                <FlaskConical
                  size={18}
                  className="text-cyan-300"
                />
              </motion.button>

            </div>

            {/* =================================================
                SUBJECT STRIP
            ================================================= */}

            <div
              className="
                mx-auto
                mt-14
                flex
                max-w-2xl
                flex-wrap
                justify-center
                gap-x-7
                gap-y-4
                border-t
                border-white/[0.07]
                pt-8
                text-sm
                text-slate-400
              "
            >

              <div className="flex items-center gap-2">
                <Atom
                  size={17}
                  className="text-blue-300"
                />
                Physics
              </div>

              <div className="h-5 w-px bg-white/10" />

              <div className="flex items-center gap-2">
                <FlaskConical
                  size={17}
                  className="text-cyan-300"
                />
                Chemistry
              </div>

              <div className="h-5 w-px bg-white/10" />

              <div className="flex items-center gap-2">
                <Microscope
                  size={17}
                  className="text-teal-300"
                />
                Biology
              </div>

              <div className="h-5 w-px bg-white/10" />

              <div className="flex items-center gap-2">
                <span className="text-base font-bold text-blue-300">
                  ∑
                </span>
                Mathematics
              </div>

            </div>

          </div>

        </motion.div>

        {/* ===================================================
            BOTTOM STATISTICS
        =================================================== */}

        <motion.div
          initial={{
            opacity: 0,
            y: 25,
          }}
          whileInView={{
            opacity: 1,
            y: 0,
          }}
          viewport={{
            once: true,
          }}
          transition={{
            duration: 0.7,
            delay: 0.15,
          }}
          className="
            mx-auto
            mt-10
            grid
            max-w-4xl
            gap-4
            sm:grid-cols-3
          "
        >

          {/* Experiments */}

          <div
            className="
              rounded-2xl
              border
              border-white/[0.07]
              bg-white/[0.025]
              px-6
              py-5
              text-center
              backdrop-blur-md
              transition-all
              duration-300
              hover:border-cyan-400/20
              hover:bg-cyan-400/[0.035]
            "
          >
            <div className="text-2xl font-black text-cyan-300">
              50+
            </div>

            <div className="mt-1 text-xs font-semibold uppercase tracking-wider text-slate-500">
              Interactive Experiments
            </div>
          </div>

          {/* Subjects */}

          <div
            className="
              rounded-2xl
              border
              border-white/[0.07]
              bg-white/[0.025]
              px-6
              py-5
              text-center
              backdrop-blur-md
              transition-all
              duration-300
              hover:border-blue-400/20
              hover:bg-blue-400/[0.035]
            "
          >
            <div className="text-2xl font-black text-blue-300">
              4
            </div>

            <div className="mt-1 text-xs font-semibold uppercase tracking-wider text-slate-500">
              Science Subjects
            </div>
          </div>

          {/* Learning */}

          <div
            className="
              rounded-2xl
              border
              border-white/[0.07]
              bg-white/[0.025]
              px-6
              py-5
              text-center
              backdrop-blur-md
              transition-all
              duration-300
              hover:border-teal-400/20
              hover:bg-teal-400/[0.035]
            "
          >
            <div className="text-2xl font-black text-teal-300">
              AI
            </div>

            <div className="mt-1 text-xs font-semibold uppercase tracking-wider text-slate-500">
              Learning Assistant
            </div>
          </div>

        </motion.div>

      </div>
    </section>
  );
};

export default LabCTASection;
