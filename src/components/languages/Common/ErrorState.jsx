import React from "react";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  RefreshCcw,
  WifiOff,
  ServerCrash,
} from "lucide-react";

const ErrorState = ({
  title = "Something Went Wrong",
  description = "Unable to load this content. Please try again.",
  type = "default",
  onRetry,
  retryText = "Try Again",
}) => {

  const icons = {
    default: AlertTriangle,
    network: WifiOff,
    server: ServerCrash,
  };

  const Icon =
    icons[type] || icons.default;


  return (
    <motion.section
      initial={{
        opacity: 0,
        y: 20,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      className="flex min-h-[350px] items-center justify-center rounded-3xl border border-red-500/20 bg-slate-900 p-8"
    >

      <div className="max-w-md text-center">


        {/* Icon */}

        <motion.div
          animate={{
            rotate: [0, -8, 8, 0],
          }}
          transition={{
            repeat: Infinity,
            duration: 2,
          }}
          className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-red-500/10"
        >

          <Icon
            size={45}
            className="text-red-400"
          />

        </motion.div>



        {/* Content */}

        <h2 className="mt-8 text-3xl font-black text-white">

          {title}

        </h2>



        <p className="mt-3 leading-relaxed text-slate-400">

          {description}

        </p>



        {onRetry && (

          <button
            onClick={onRetry}
            className="mt-8 inline-flex items-center gap-2 rounded-2xl bg-red-600 px-6 py-3 font-bold text-white transition hover:bg-red-500"
          >

            <RefreshCcw size={18} />

            {retryText}

          </button>

        )}


      </div>


    </motion.section>
  );
};


export default ErrorState;