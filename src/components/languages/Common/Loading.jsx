import React from "react";
import { motion } from "framer-motion";
import {
  LoaderCircle,
  Languages,
} from "lucide-react";

const Loading = ({
  title = "Loading...",
  description = "Preparing your language experience.",
  fullPage = false,
}) => {
  return (
    <div
      className={`flex items-center justify-center ${
        fullPage
          ? "min-h-screen"
          : "min-h-[300px]"
      }`}
    >

      <motion.div
        initial={{
          opacity: 0,
          y: 20,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        className="rounded-3xl border border-white/10 bg-slate-900 p-10 text-center"
      >

        {/* Icon */}

        <div className="relative mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-cyan-500/10">

          <motion.div
            animate={{
              rotate: 360,
            }}
            transition={{
              repeat: Infinity,
              duration: 2,
              ease: "linear",
            }}
          >

            <LoaderCircle
              size={45}
              className="text-cyan-400"
            />

          </motion.div>


          <Languages
            size={20}
            className="absolute text-white"
          />

        </div>



        {/* Text */}

        <h2 className="mt-8 text-2xl font-black text-white">

          {title}

        </h2>



        <p className="mt-3 text-slate-400">

          {description}

        </p>



        {/* Loading dots */}

        <div className="mt-8 flex justify-center gap-2">

          {[1, 2, 3].map((item) => (

            <motion.span
              key={item}
              animate={{
                y: [0, -8, 0],
              }}
              transition={{
                repeat: Infinity,
                duration: 0.8,
                delay: item * 0.15,
              }}
              className="h-3 w-3 rounded-full bg-cyan-400"
            />

          ))}

        </div>


      </motion.div>

    </div>
  );
};

export default Loading;