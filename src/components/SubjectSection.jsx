
import React from "react";
import { motion } from "framer-motion";
import {
  Atom,
  FlaskConical,
  Dna,
  Calculator,
  Lock,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const LAB_PRICE = 7;

const subjects = [
  {
    title: "Physics",
    icon: Atom,
    color: "from-cyan-500 to-blue-600",
    description:
      "Explore motion, force, electricity, waves and energy through simulations.",
    experiments: 24,
    path: "/lab/physics",
    paymentKey: "physics",
  },
  {
    title: "Chemistry",
    icon: FlaskConical,
    color: "from-green-500 to-emerald-600",
    description:
      "Perform reactions, study molecules and investigate chemical properties.",
    experiments: 18,
    path: "/lab/chemistry",
    paymentKey: "chemistry",
  },
  {
    title: "Biology",
    icon: Dna,
    color: "from-pink-500 to-purple-600",
    description:
      "Discover cells, genetics, ecosystems and human body systems.",
    experiments: 20,
    path: "/lab/biology",
    paymentKey: "biology",
  },
  {
    title: "Mathematics",
    icon: Calculator,
    color: "from-orange-500 to-red-600",
    description:
      "Visualize graphs, geometry, statistics and mathematical models.",
    experiments: 16,
    path: "/lab/mathematics",
    paymentKey: "mathematics",
  },
];

const SubjectSection = () => {
  const navigate = useNavigate();

  const handleUnlock = (subject) => {
    /*
      Each subject has its own payment key.

      Example:

      Physics     → /lab/payment/physics
      Chemistry   → /lab/payment/chemistry
      Biology     → /lab/payment/biology
      Mathematics → /lab/payment/mathematics

      The payment page will handle Paystack.
    */

    navigate(
      `/lab/payment/${subject.paymentKey}`
    );
  };

  return (
    <section className="relative overflow-hidden bg-[#020617] px-6 py-28 text-white">

      {/* =====================================================
          BACKGROUND GLOW
      ===================================================== */}

      <div className="pointer-events-none absolute left-0 top-0 h-96 w-96 rounded-full bg-cyan-500/10 blur-[140px]" />

      <div className="pointer-events-none absolute bottom-0 right-0 h-96 w-96 rounded-full bg-purple-500/10 blur-[140px]" />

      <div className="relative z-10 mx-auto max-w-7xl">

        {/* =====================================================
            HEADER
        ===================================================== */}

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
            duration: 0.6,
          }}
          className="mb-16 text-center"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/[0.07] px-4 py-2 text-xs font-black uppercase tracking-widest text-cyan-300">
            <Sparkles size={14} />

            Premium Laboratories
          </div>

          <h2 className="mt-5 text-4xl font-black md:text-6xl">
            Choose Your
            <span className="text-cyan-400">
              {" "}Laboratory
            </span>
          </h2>

          <p className="mx-auto mt-6 max-w-2xl text-slate-400">
            Unlock individual virtual laboratories and gain
            access to interactive experiments, simulations
            and practical learning tools.
          </p>

          <div className="mt-5 flex items-center justify-center gap-2 text-sm font-bold text-amber-300">
            <Lock size={15} />

            Each laboratory costs ${LAB_PRICE}
          </div>
        </motion.div>

        {/* =====================================================
            SUBJECT CARDS
        ===================================================== */}

        <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-4">

          {subjects.map((subject, index) => {
            const Icon = subject.icon;

            return (
              <motion.div
                key={subject.title}
                initial={{
                  opacity: 0,
                  y: 40,
                }}
                whileInView={{
                  opacity: 1,
                  y: 0,
                }}
                viewport={{
                  once: true,
                }}
                transition={{
                  duration: 0.5,
                  delay: index * 0.1,
                }}
                whileHover={{
                  y: -10,
                  scale: 1.02,
                }}
                className="group relative"
              >

                {/* Glow */}

                <div
                  className={`
                    absolute
                    inset-0
                    rounded-3xl
                    bg-gradient-to-br
                    ${subject.color}
                    opacity-10
                    blur-xl
                    transition
                    duration-500
                    group-hover:opacity-30
                  `}
                />

                {/* Card */}

                <div className="
                  relative
                  h-full
                  overflow-hidden
                  rounded-3xl
                  border
                  border-white/10
                  bg-slate-900/80
                  p-8
                  backdrop-blur-xl
                  transition-all
                  duration-300
                  group-hover:border-white/20
                ">

                  {/* Premium Badge */}

                  <div className="
                    absolute
                    right-5
                    top-5
                    flex
                    items-center
                    gap-1.5
                    rounded-full
                    border
                    border-amber-400/20
                    bg-amber-400/[0.08]
                    px-3
                    py-1.5
                    text-[10px]
                    font-black
                    uppercase
                    tracking-wider
                    text-amber-300
                  ">
                    <Lock size={11} />

                    Premium
                  </div>

                  {/* Gradient Accent */}

                  <div
                    className={`
                      absolute
                      left-0
                      top-0
                      h-1
                      w-full
                      bg-gradient-to-r
                      ${subject.color}
                    `}
                  />

                  {/* Icon */}

                  <div
                    className={`
                      flex
                      h-16
                      w-16
                      items-center
                      justify-center
                      rounded-2xl
                      bg-gradient-to-br
                      ${subject.color}
                      shadow-lg
                      transition-transform
                      duration-300
                      group-hover:scale-110
                    `}
                  >
                    <Icon
                      size={30}
                      className="text-white"
                    />
                  </div>

                  {/* Title */}

                  <h3 className="mt-6 text-2xl font-black">
                    {subject.title}
                  </h3>

                  {/* Description */}

                  <p className="mt-4 min-h-[84px] leading-relaxed text-slate-400">
                    {subject.description}
                  </p>

                  {/* Experiments */}

                  <div className="mt-6 flex items-center justify-between">

                    <span className="text-sm font-bold text-cyan-400">
                      {subject.experiments} Experiments
                    </span>

                    <span className="rounded-full bg-white/[0.05] px-3 py-1 text-xs font-bold text-slate-400">
                      Premium
                    </span>

                  </div>

                  {/* Divider */}

                  <div className="my-6 h-px bg-white/[0.08]" />

                  {/* Price */}

                  <div className="flex items-end justify-between">

                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                        Unlock access
                      </p>

                      <div className="mt-1 text-3xl font-black text-white">
                        ${LAB_PRICE}
                      </div>
                    </div>

                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/[0.05] text-slate-400">
                      <Lock size={18} />
                    </div>

                  </div>

                  {/* Unlock Button */}

                  <button
                    type="button"
                    onClick={() => handleUnlock(subject)}
                    className="
                      mt-6
                      flex
                      w-full
                      items-center
                      justify-center
                      gap-2
                      rounded-2xl
                      bg-gradient-to-r
                      from-cyan-400
                      via-blue-500
                      to-indigo-500
                      px-5
                      py-3.5
                      text-sm
                      font-black
                      text-slate-950
                      shadow-lg
                      shadow-cyan-500/10
                      transition-all
                      hover:-translate-y-1
                      hover:shadow-cyan-500/20
                      active:scale-[0.98]
                    "
                  >
                    Unlock {subject.title}

                    <ArrowRight
                      size={17}
                      className="transition-transform group-hover:translate-x-1"
                    />
                  </button>

                  {/* Bottom Glow */}

                  <div
                    className={`
                      absolute
                      -bottom-10
                      -right-10
                      h-32
                      w-32
                      rounded-full
                      bg-gradient-to-br
                      ${subject.color}
                      opacity-10
                      blur-3xl
                      transition
                      duration-500
                      group-hover:opacity-20
                    `}
                  />

                </div>
              </motion.div>
            );
          })}

        </div>

      </div>
    </section>
  );
};

export default SubjectSection;
