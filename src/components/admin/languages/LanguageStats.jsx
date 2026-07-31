import React from "react";
import { motion } from "framer-motion";

import {
  Languages,
  Globe,
  CheckCircle2,
  XCircle,
} from "lucide-react";

export default function LanguageStats({
  totalLanguages = 0,
  activeLanguages = 0,
  inactiveLanguages = 0,
  totalRegions = 0,
}) {
  const stats = [
    {
      title: "Total Languages",
      value: totalLanguages,
      icon: Languages,
      color:
        "from-indigo-500/20 to-violet-500/20 border-indigo-500/30",
      iconBg: "bg-indigo-500/20",
      iconColor: "text-indigo-400",
    },

    {
      title: "Active",
      value: activeLanguages,
      icon: CheckCircle2,
      color:
        "from-emerald-500/20 to-green-500/20 border-emerald-500/30",
      iconBg: "bg-emerald-500/20",
      iconColor: "text-emerald-400",
    },

    {
      title: "Inactive",
      value: inactiveLanguages,
      icon: XCircle,
      color:
        "from-red-500/20 to-rose-500/20 border-red-500/30",
      iconBg: "bg-red-500/20",
      iconColor: "text-red-400",
    },

    {
      title: "Regions",
      value: totalRegions,
      icon: Globe,
      color:
        "from-cyan-500/20 to-blue-500/20 border-cyan-500/30",
      iconBg: "bg-cyan-500/20",
      iconColor: "text-cyan-400",
    },
  ];

  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4 mb-8">
      {stats.map((stat, index) => {
        const Icon = stat.icon;

        return (
          <motion.div
            key={stat.title}
            initial={{
              opacity: 0,
              y: 25,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              delay: index * 0.08,
            }}
            whileHover={{
              y: -6,
            }}
            className={`
              rounded-3xl
              border
              bg-gradient-to-br
              ${stat.color}
              backdrop-blur-xl
              p-6
              shadow-xl
            `}
          >
            <div className="flex items-center justify-between">
              <div>
                <p
                  className="
                  text-gray-400
                  text-sm
                  font-medium
                "
                >
                  {stat.title}
                </p>

                <h2
                  className="
                  text-4xl
                  font-black
                  text-white
                  mt-3
                "
                >
                  {stat.value}
                </h2>
              </div>

              <div
                className={`
                  w-16
                  h-16
                  rounded-2xl
                  flex
                  items-center
                  justify-center
                  ${stat.iconBg}
                `}
              >
                <Icon
                  className={`
                    w-8
                    h-8
                    ${stat.iconColor}
                  `}
                />
              </div>
            </div>

            <div
              className="
              mt-6
              h-1.5
              rounded-full
              bg-white/10
              overflow-hidden
            "
            >
              <motion.div
                initial={{
                  width: 0,
                }}
                animate={{
                  width: "100%",
                }}
                transition={{
                  duration: 1,
                  delay: index * 0.15,
                }}
                className="
                  h-full
                  rounded-full
                  bg-white/40
                "
              />
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}