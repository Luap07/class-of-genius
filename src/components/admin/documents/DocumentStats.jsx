// src/components/admin/documents/DocumentStats.jsx

import React from "react";
import { motion } from "framer-motion";
import {
  Files,
  FolderOpen,
  FileText,
  FileSpreadsheet,
  Presentation,
  ImageIcon,
} from "lucide-react";

const cardVariants = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  visible: (index) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: index * 0.08,
      duration: 0.35,
    },
  }),
};

export default function DocumentStats({ stats }) {
  const cards = [
    {
      title: "Total Documents",
      value: stats.total,
      icon: Files,
      color:
        "from-cyan-500/20 to-cyan-600/5 border-cyan-500/20 text-cyan-400",
    },

    {
      title: "Categories",
      value: stats.categories,
      icon: FolderOpen,
      color:
        "from-violet-500/20 to-violet-600/5 border-violet-500/20 text-violet-400",
    },

    {
      title: "PDF Files",
      value: stats.pdfs,
      icon: FileText,
      color:
        "from-red-500/20 to-red-600/5 border-red-500/20 text-red-400",
    },

    {
      title: "Word Files",
      value: stats.words,
      icon: FileText,
      color:
        "from-blue-500/20 to-blue-600/5 border-blue-500/20 text-blue-400",
    },

    {
      title: "PowerPoint",
      value: stats.ppts,
      icon: Presentation,
      color:
        "from-orange-500/20 to-orange-600/5 border-orange-500/20 text-orange-400",
    },

    {
      title: "Excel Files",
      value: stats.excels,
      icon: FileSpreadsheet,
      color:
        "from-emerald-500/20 to-emerald-600/5 border-emerald-500/20 text-emerald-400",
    },

    {
      title: "With Thumbnail",
      value: stats.thumbnails,
      icon: ImageIcon,
      color:
        "from-pink-500/20 to-pink-600/5 border-pink-500/20 text-pink-400",
    },
  ];

  return (
    <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-7">
      {cards.map((card, index) => {
        const Icon = card.icon;

        return (
          <motion.div
            key={card.title}
            custom={index}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            whileHover={{
              y: -6,
              scale: 1.02,
            }}
            className={`relative overflow-hidden rounded-3xl border bg-gradient-to-br ${card.color} p-6`}
          >
            <div className="absolute -right-6 -top-6 h-28 w-28 rounded-full bg-white/5 blur-3xl" />

            <div className="relative flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-400">
                  {card.title}
                </p>

                <h2 className="mt-3 text-4xl font-black text-white">
                  {card.value}
                </h2>
              </div>

              <div className="rounded-2xl bg-slate-900/60 p-4">
                <Icon
                  size={28}
                  className={card.color.split(" ").pop()}
                />
              </div>
            </div>

            <div className="mt-6 h-1 w-full overflow-hidden rounded-full bg-slate-800">
              <motion.div
                initial={{
                  width: 0,
                }}
                animate={{
                  width: "100%",
                }}
                transition={{
                  duration: 1,
                  delay: index * 0.1,
                }}
                className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-blue-500"
              />
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}