import React from "react";
import { motion } from "framer-motion";
import {
  Brain,
  FlaskConical,
  BookOpen,
  Trophy,
  Sparkles,
  ShieldCheck,
} from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "AI Tutor",
    description:
      "Get instant explanations, guidance and personalized learning support.",
  },
  {
    icon: FlaskConical,
    title: "Virtual Experiments",
    description:
      "Perform realistic science experiments without physical equipment.",
  },
  {
    icon: BookOpen,
    title: "Interactive Learning",
    description:
      "Learn through simulations, animations and practical exploration.",
  },
  {
    icon: Trophy,
    title: "Achievements",
    description:
      "Earn badges and track your progress as you complete experiments.",
  },
  {
    icon: Sparkles,
    title: "Smart Recommendations",
    description:
      "Receive experiment suggestions based on your learning journey.",
  },
  {
    icon: ShieldCheck,
    title: "Safe Environment",
    description:
      "Experiment freely without risks while developing practical skills.",
  },
];

const FeaturesSection = () => {
  return (
    <section className="relative py-28 px-6 bg-[#020617] overflow-hidden">

      {/* Background Glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 blur-[140px] rounded-full" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/10 blur-[140px] rounded-full" />

      <div className="max-w-7xl mx-auto relative z-10">

        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-cyan-400 uppercase tracking-[0.25em] text-sm">
            Why Choose Us
          </span>

          <h2 className="text-white text-4xl md:text-6xl font-black mt-4">
            Powerful Learning
            <span className="text-cyan-400"> Features</span>
          </h2>

          <p className="text-slate-400 max-w-2xl mx-auto mt-6">
            Everything you need to master science and mathematics
            through immersive digital experiences.
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-8">

          {features.map((feature, index) => {
            const Icon = feature.icon;

            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 35 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.5,
                  delay: index * 0.08,
                }}
                whileHover={{
                  y: -8,
                }}
                className="group"
              >
                <div className="relative h-full rounded-3xl border border-white/10 bg-slate-900/70 backdrop-blur-xl p-8 overflow-hidden">

                  {/* Glow */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition duration-500">
                    <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-cyan-500/10 blur-3xl rounded-full" />
                  </div>

                  <div className="relative z-10">

                    <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                      <Icon
                        size={30}
                        className="text-cyan-400"
                      />
                    </div>

                    <h3 className="text-white text-2xl font-bold mt-6">
                      {feature.title}
                    </h3>

                    <p className="text-slate-400 mt-4 leading-relaxed">
                      {feature.description}
                    </p>

                  </div>

                </div>
              </motion.div>
            );
          })}

        </div>

      </div>
    </section>
  );
};

export default FeaturesSection;