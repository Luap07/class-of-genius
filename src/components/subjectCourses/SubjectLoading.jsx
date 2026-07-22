import React from "react";
import { motion } from "framer-motion";

export default function SubjectLoading() {
  return (
    <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
      {[...Array(6)].map((_, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{
            delay: index * 0.08,
            duration: 0.4,
          }}
          className="overflow-hidden rounded-[32px] border border-slate-800 bg-slate-900/70 backdrop-blur-xl"
        >
          {/* Thumbnail Skeleton */}
          <div className="h-56 animate-pulse bg-slate-800" />

          {/* Content */}
          <div className="space-y-5 p-8">
            <div className="h-7 w-3/4 animate-pulse rounded-full bg-slate-800" />

            <div className="space-y-3">
              <div className="h-4 w-full animate-pulse rounded-full bg-slate-800" />
              <div className="h-4 w-5/6 animate-pulse rounded-full bg-slate-800" />
              <div className="h-4 w-2/3 animate-pulse rounded-full bg-slate-800" />
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 pt-4">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="flex flex-col items-center gap-3"
                >
                  <div className="h-6 w-6 animate-pulse rounded-full bg-slate-800" />
                  <div className="h-4 w-12 animate-pulse rounded-full bg-slate-800" />
                </div>
              ))}
            </div>

            {/* Button */}
            <div className="h-14 w-full animate-pulse rounded-2xl bg-slate-800" />
          </div>
        </motion.div>
      ))}
    </div>
  );
}