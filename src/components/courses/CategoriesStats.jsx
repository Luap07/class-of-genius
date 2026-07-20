import React from "react";
import { motion } from "framer-motion";
import {
  BookOpen,
  GraduationCap,
  Users,
  Award,
} from "lucide-react";

const stats = [
  {
    icon: BookOpen,
    value: "1,200+",
    label: "Courses",
  },
  {
    icon: GraduationCap,
    value: "250+",
    label: "Subjects",
  },
  {
    icon: Users,
    value: "65K+",
    label: "Students",
  },
  {
    icon: Award,
    value: "500+",
    label: "Certificates",
  },
];

export default function CategoryStats() {
  return (
    <section className="mt-20">
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="grid gap-6 md:grid-cols-2 xl:grid-cols-4"
      >
        {stats.map((item) => {
          const Icon = item.icon;

          return (
            <motion.div
              key={item.label}
              whileHover={{
                y: -8,
                scale: 1.02,
              }}
              className="
                rounded-3xl
                border
                border-slate-800
                bg-slate-900/70
                backdrop-blur-xl
                p-8
              "
            >
              <div className="flex justify-center">
                <div
                  className="
                    flex
                    h-16
                    w-16
                    items-center
                    justify-center
                    rounded-2xl
                    bg-cyan-500/10
                  "
                >
                  <Icon
                    size={30}
                    className="text-cyan-400"
                  />
                </div>
              </div>

              <h2 className="mt-6 text-center text-4xl font-black">
                {item.value}
              </h2>

              <p className="mt-3 text-center text-slate-400">
                {item.label}
              </p>
            </motion.div>
          );
        })}
      </motion.div>
    </section>
  );
}