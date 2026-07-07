import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Mail,
  Send,
  Bell,
  Sparkles,
  CheckCircle2,
} from "lucide-react";

const Newsletter = () => {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!email.trim()) return;

    // Connect your backend here later
    console.log("Newsletter:", email);

    setSubscribed(true);
    setEmail("");

    setTimeout(() => {
      setSubscribed(false);
    }, 3000);
  };

  return (
    <section className="pb-8">

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
          duration: 0.5,
        }}
        className="
          overflow-hidden
          rounded-[36px]
          bg-gradient-to-br
          from-slate-900
          via-blue-950
          to-slate-950
          border
          border-slate-800
        "
      >

        <div className="grid lg:grid-cols-2">

          {/* Left */}

          <div className="p-10 lg:p-16">

            <div
              className="
                w-20
                h-20
                rounded-3xl
                bg-blue-500/10
                flex
                items-center
                justify-center
                mb-8
              "
            >
              <Bell
                size={40}
                className="text-blue-400"
              />
            </div>

            <span
              className="
                inline-flex
                items-center
                gap-2
                rounded-full
                bg-blue-500/10
                border
                border-blue-500/20
                px-4
                py-2
                text-blue-400
                text-sm
                font-semibold
              "
            >

              <Sparkles size={16} />

              Newsletter

            </span>

            <h2 className="mt-6 text-5xl font-extrabold leading-tight">

              Stay Ahead

              <br />

              Keep Learning.

            </h2>

            <p className="mt-6 text-slate-400 text-lg leading-8">

              Subscribe to receive new courses,
              university materials,
              AI updates,
              virtual lab releases,
              scholarships,
              competitions,
              and learning tips.

            </p>

          </div>

          {/* Right */}

          <div
            className="
              flex
              items-center
              p-10
              lg:p-16
            "
          >

            <div className="w-full">

              <h3 className="text-2xl font-bold">

                Join our learning community

              </h3>

              <p className="mt-3 text-slate-400">

                Over 5 million learners already receive our weekly updates.

              </p>

              <form
                onSubmit={handleSubmit}
                className="mt-10 space-y-5"
              >

                <div className="relative">

                  <Mail
                    size={22}
                    className="
                      absolute
                      left-5
                      top-1/2
                      -translate-y-1/2
                      text-slate-500
                    "
                  />

                  <input
                    type="email"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) =>
                      setEmail(e.target.value)
                    }
                    className="
                      w-full
                      rounded-2xl
                      border
                      border-slate-700
                      bg-slate-900
                      pl-14
                      pr-5
                      py-4
                      outline-none
                      focus:border-blue-500
                    "
                  />

                </div>

                <button
                  type="submit"
                  className="
                    w-full
                    rounded-2xl
                    bg-blue-600
                    hover:bg-blue-700
                    transition
                    py-4
                    font-bold
                    flex
                    items-center
                    justify-center
                    gap-3
                  "
                >

                  <Send size={20} />

                  Subscribe Now

                </button>

              </form>

              {subscribed && (

                <motion.div
                  initial={{
                    opacity: 0,
                    y: 10,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  className="
                    mt-6
                    rounded-2xl
                    bg-emerald-500/10
                    border
                    border-emerald-500/20
                    p-4
                    flex
                    items-center
                    gap-3
                    text-emerald-400
                  "
                >

                  <CheckCircle2 size={22} />

                  Successfully subscribed!

                </motion.div>

              )}

              <div className="mt-10 grid grid-cols-3 gap-5">

                <div className="text-center">

                  <h3 className="text-3xl font-bold text-blue-400">

                    120K+

                  </h3>

                  <p className="text-slate-500 text-sm">

                    Courses

                  </p>

                </div>

                <div className="text-center">

                  <h3 className="text-3xl font-bold text-cyan-400">

                    5M+

                  </h3>

                  <p className="text-slate-500 text-sm">

                    Students

                  </p>

                </div>

                <div className="text-center">

                  <h3 className="text-3xl font-bold text-emerald-400">

                    190+

                  </h3>

                  <p className="text-slate-500 text-sm">

                    Countries

                  </p>

                </div>

              </div>

            </div>

          </div>

        </div>

      </motion.div>

    </section>
  );
};

export default Newsletter;