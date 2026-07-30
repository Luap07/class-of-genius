import React, {
  useMemo,
  useState,
} from "react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import { motion } from "framer-motion";

import {
  ArrowLeft,
  Globe2,
  BookOpen,
  Volume2,
  Mic,
  Languages,
  GraduationCap,
  Brain,
  PlayCircle,
  PenSquare,
  PenTool,
  Headphones,
  Star,
  Award,
  ChevronRight,
} from "lucide-react";

import { languages } from "../../data/language/languages";

const tabs = [
  "Overview",
  "Alphabet",
  "Grammar",
  "Vocabulary",
  "Listening",
  "Speaking",
  "Writing",
  "Culture",
  "Lessons",
  "AI Tutor",
];

const LanguageDetails = () => {
  const navigate = useNavigate();
  const { slug } = useParams();
  const [activeTab, setActiveTab] = useState("Overview");

  const language = useMemo(() => {
    return (
      languages.find(
        (item) => item.slug === slug
      ) || languages[0]
    );
  }, [slug]);

  if (!language) {
    return (
      <section
        className="
        min-h-screen
        flex
        items-center
        justify-center
        bg-[#020617]
        text-white
        "
      >
        Language not found.
      </section>
    );
  }

  return (
    <section
      className="
      min-h-screen
      bg-[#020617]
      text-white
      "
    >
      {/* HERO */}
      <div
        className="
        relative
        h-[520px]
        overflow-hidden
        "
      >
        <img
          src={language.image}
          alt={language.name}
          className="
          absolute
          inset-0
          h-full
          w-full
          object-cover
          "
        />

        <div
          className="
          absolute
          inset-0
          bg-black/70
          "
        />

        <div
          className="
          absolute
          inset-0
          bg-gradient-to-t
          from-[#020617]
          via-[#020617]/30
          to-transparent
          "
        />

        <div
          className="
          relative
          z-20
          mx-auto
          flex
          h-full
          max-w-7xl
          flex-col
          justify-end
          px-6
          pb-16
          "
        >
          <button
            onClick={() => navigate(-1)}
            className="
            mb-8
            flex
            w-fit
            items-center
            gap-2
            rounded-full
            border
            border-white/10
            bg-white/10
            px-5
            py-3
            backdrop-blur-xl
            "
          >
            <ArrowLeft size={18} />
            Back
          </button>

          <motion.h1
            initial={{
              opacity: 0,
              y: 30,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            className="
            text-6xl
            font-black
            "
          >
            {language.name}
          </motion.h1>

          <p
            className="
            mt-3
            text-2xl
            text-blue-400
            "
          >
            {language.nativeName}
          </p>

          <p
            className="
            mt-6
            max-w-3xl
            text-lg
            leading-8
            text-slate-300
            "
          >
            {language.description}
          </p>

          <div
            className="
            mt-10
            flex
            flex-wrap
            gap-4
            "
          >
            <span
              className="
              rounded-full
              bg-blue-600
              px-6
              py-3
              font-semibold
              "
            >
              {language.level}
            </span>

            <span
              className="
              rounded-full
              bg-slate-800
              px-6
              py-3
              "
            >
              {language.continent}
            </span>

            <span
              className="
              rounded-full
              bg-slate-800
              px-6
              py-3
              "
            >
              {language.speakers}
            </span>
          </div>
        </div>
      </div>

      {/* QUICK STATS */}
      <div
        className="
        mx-auto
        -mt-14
        max-w-7xl
        px-6
        relative
        z-30
        "
      >
        <div
          className="
          grid
          gap-6
          md:grid-cols-2
          xl:grid-cols-4
          "
        >
          <motion.div
            whileHover={{ y: -6 }}
            className="
            rounded-3xl
            border
            border-white/10
            bg-slate-900/90
            p-7
            backdrop-blur-xl
            "
          >
            <Globe2
              size={34}
              className="text-blue-400"
            />
            <h3 className="mt-5 text-lg font-bold">
              Native Speakers
            </h3>
            <p className="mt-2 text-slate-400">
              {language.speakers}
            </p>
          </motion.div>

          <motion.div
            whileHover={{ y: -6 }}
            className="
            rounded-3xl
            border
            border-white/10
            bg-slate-900/90
            p-7
            backdrop-blur-xl
            "
          >
            <Languages
              size={34}
              className="text-violet-400"
            />
            <h3 className="mt-5 text-lg font-bold">
              Difficulty
            </h3>
            <p className="mt-2 text-slate-400">
              {language.level}
            </p>
          </motion.div>

          <motion.div
            whileHover={{ y: -6 }}
            className="
            rounded-3xl
            border
            border-white/10
            bg-slate-900/90
            p-7
            backdrop-blur-xl
            "
          >
            <GraduationCap
              size={34}
              className="text-green-400"
            />
            <h3 className="mt-5 text-lg font-bold">
              Lessons
            </h3>
            <p className="mt-2 text-slate-400">
              120+ Interactive Lessons
            </p>
          </motion.div>

          <motion.div
            whileHover={{ y: -6 }}
            className="
            rounded-3xl
            border
            border-white/10
            bg-slate-900/90
            p-7
            backdrop-blur-xl
            "
          >
            <Award
              size={34}
              className="text-yellow-400"
            />
            <h3 className="mt-5 text-lg font-bold">
              Certificate
            </h3>
            <p className="mt-2 text-slate-400">
              Earn after completion
            </p>
          </motion.div>
        </div>
      </div>

      {/* TABS */}
      <div
        className="
        mx-auto
        mt-14
        max-w-7xl
        px-6
        "
      >
        <div
          className="
          flex
          gap-3
          overflow-x-auto
          pb-4
          "
        >
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={
                activeTab === tab
                  ? "rounded-full bg-blue-600 px-6 py-3 font-bold whitespace-nowrap"
                  : "rounded-full bg-slate-900 px-6 py-3 text-slate-300 whitespace-nowrap hover:bg-slate-800"
              }
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* OVERVIEW */}
      {activeTab === "Overview" && (
        <section
          className="
          mx-auto
          mt-12
          max-w-7xl
          px-6
          "
        >
          <div
            className="
            grid
            gap-8
            xl:grid-cols-3
            "
          >
            <div
              className="
              xl:col-span-2
              rounded-3xl
              border
              border-white/10
              bg-slate-900
              p-8
              "
            >
              <div
                className="
                flex
                items-center
                gap-3
                "
              >
                <BookOpen
                  className="text-blue-400"
                />
                <h2
                  className="
                  text-3xl
                  font-black
                  "
                >
                  About {language.name}
                </h2>
              </div>

              <p
                className="
                mt-8
                leading-9
                text-slate-300
                "
              >
                {language.description}{" "}
                Learn real conversations,
                pronunciation,
                grammar,
                culture,
                writing,
                listening,
                reading
                and vocabulary with
                interactive lessons,
                AI explanations
                and practical exercises.
              </p>
            </div>

            <div
              className="
              rounded-3xl
              border
              border-white/10
              bg-slate-900
              p-8
              "
            >
              <h3
                className="
                text-2xl
                font-black
                "
              >
                Quick Actions
              </h3>

              <div
                className="
                mt-8
                space-y-4
                "
              >
                <button
                  className="
                  flex
                  w-full
                  items-center
                  justify-between
                  rounded-2xl
                  bg-blue-600
                  px-5
                  py-4
                  font-bold
                  "
                >
                  Start Course
                  <ChevronRight />
                </button>

                <button
                  className="
                  flex
                  w-full
                  items-center
                  justify-between
                  rounded-2xl
                  bg-slate-800
                  px-5
                  py-4
                  "
                >
                  <span className="flex items-center gap-2">
                    <PlayCircle />
                    Lessons
                  </span>
                  <ChevronRight />
                </button>

                <button
                  className="
                  flex
                  w-full
                  items-center
                  justify-between
                  rounded-2xl
                  bg-slate-800
                  px-5
                  py-4
                  "
                >
                  <span className="flex items-center gap-2">
                    <Brain />
                    AI Tutor
                  </span>
                  <ChevronRight />
                </button>

                <button
                  className="
                  flex
                  w-full
                  items-center
                  justify-between
                  rounded-2xl
                  bg-slate-800
                  px-5
                  py-4
                  "
                >
                  <span className="flex items-center gap-2">
                    <Volume2 />
                    Pronunciation
                  </span>
                  <ChevronRight />
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ALPHABET */}
      {activeTab === "Alphabet" && (
        <section
          className="
          mx-auto
          mt-12
          max-w-7xl
          px-6
          "
        >
          <div
            className="
            rounded-3xl
            border
            border-white/10
            bg-slate-900
            p-8
            "
          >
            <h2
              className="
              text-3xl
              font-black
              "
            >
              Alphabet
            </h2>
            <p className="mt-3 text-slate-400">
              Learn every letter with pronunciation and examples.
            </p>

            <div
              className="
              mt-10
              grid
              gap-5
              sm:grid-cols-3
              md:grid-cols-5
              xl:grid-cols-7
              "
            >
              {"ABCDEFGHIJKLMNOPQRSTUVWXYZ"
                .split("")
                .map((letter) => (
                  <motion.div
                    key={letter}
                    whileHover={{
                      y: -8,
                      scale: 1.05,
                    }}
                    className="
                    rounded-2xl
                    border
                    border-white/10
                    bg-slate-800
                    p-6
                    text-center
                    cursor-pointer
                    "
                  >
                    <h3
                      className="
                      text-5xl
                      font-black
                      text-blue-400
                      "
                    >
                      {letter}
                    </h3>
                    <button
                      className="
                      mt-5
                      rounded-full
                      bg-blue-600
                      px-5
                      py-2
                      "
                    >
                      Listen
                    </button>
                  </motion.div>
                ))}
            </div>
          </div>
        </section>
      )}

      {/* GRAMMAR */}
      {activeTab === "Grammar" && (
        <section
          className="
          mx-auto
          mt-12
          max-w-7xl
          px-6
          "
        >
          <div
            className="
            grid
            gap-6
            md:grid-cols-2
            "
          >
            {[
              "Nouns",
              "Pronouns",
              "Verbs",
              "Adjectives",
              "Adverbs",
              "Sentence Structure",
              "Past Tense",
              "Future Tense",
            ].map((topic) => (
              <motion.div
                key={topic}
                whileHover={{ y: -6 }}
                className="
                rounded-3xl
                border
                border-white/10
                bg-slate-900
                p-8
                "
              >
                <BookOpen
                  className="text-blue-400"
                />
                <h3
                  className="
                  mt-5
                  text-2xl
                  font-bold
                  "
                >
                  {topic}
                </h3>
                <p
                  className="
                  mt-4
                  leading-8
                  text-slate-400
                  "
                >
                  Learn rules, examples,
                  exercises and quizzes.
                </p>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* VOCABULARY */}
      {activeTab === "Vocabulary" && (
        <section
          className="
          mx-auto
          mt-12
          max-w-7xl
          px-6
          "
        >
          <div
            className="
            grid
            gap-6
            md:grid-cols-2
            xl:grid-cols-3
            "
          >
            {[
              "Greetings",
              "Family",
              "Travel",
              "Business",
              "Food",
              "Shopping",
              "Hospital",
              "Airport",
              "Technology",
            ].map((item) => (
              <motion.div
                key={item}
                whileHover={{
                  scale: 1.03,
                }}
                className="
                rounded-3xl
                border
                border-white/10
                bg-slate-900
                p-7
                "
              >
                <Languages
                  className="text-cyan-400"
                />
                <h3
                  className="
                  mt-5
                  text-xl
                  font-bold
                  "
                >
                  {item}
                </h3>
                <p
                  className="
                  mt-4
                  text-slate-400
                  "
                >
                  Master useful vocabulary,
                  pronunciation and examples.
                </p>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* LISTENING */}
      {activeTab === "Listening" && (
        <section
          className="
          mx-auto
          mt-12
          max-w-7xl
          px-6
          "
        >
          <div
            className="
            rounded-3xl
            border
            border-white/10
            bg-slate-900
            p-10
            text-center
            "
          >
            <Volume2
              size={70}
              className="
              mx-auto
              text-blue-400
              "
            />
            <h2
              className="
              mt-6
              text-3xl
              font-black
              "
            >
              Listening Practice
            </h2>
            <p
              className="
              mt-5
              max-w-3xl
              mx-auto
              leading-9
              text-slate-400
              "
            >
              Listen to native speakers,
              conversations,
              interviews,
              podcasts,
              news and stories.
            </p>
            <button
              className="
              mt-10
              rounded-full
              bg-blue-600
              px-8
              py-4
              font-bold
              "
            >
              Start Listening
            </button>
          </div>
        </section>
      )}

      {/* SPEAKING */}
      {activeTab === "Speaking" && (
        <section
          className="
          mx-auto
          mt-12
          max-w-7xl
          px-6
          "
        >
          <div
            className="
            rounded-3xl
            border
            border-white/10
            bg-slate-900
            p-10
            text-center
            "
          >
            <Mic
              size={70}
              className="
              mx-auto
              text-green-400
              "
            />
            <h2
              className="
              mt-6
              text-3xl
              font-black
              "
            >
              Speaking Practice
            </h2>
            <p
              className="
              mt-5
              leading-9
              text-slate-400
              "
            >
              Record your voice and compare it with native pronunciation.
            </p>
          </div>
        </section>
      )}

      {/* WRITING */}
      {activeTab === "Writing" && (
        <section
          className="
          mx-auto
          mt-12
          max-w-7xl
          px-6
          "
        >
          <div
            className="
            rounded-3xl
            border
            border-white/10
            bg-slate-900
            p-10
            "
          >
            <div className="flex items-center gap-4">
              <PenTool
                size={42}
                className="text-yellow-400"
              />
              <div>
                <h2 className="text-3xl font-black">
                  Writing Practice
                </h2>
                <p className="text-slate-400 mt-2">
                  Practice writing words, sentences and essays.
                </p>
              </div>
            </div>

            <textarea
              rows={10}
              placeholder="Write something here..."
              className="
              mt-8
              w-full
              rounded-3xl
              border
              border-white/10
              bg-slate-800
              p-6
              outline-none
              "
            />

            <button
              className="
              mt-8
              rounded-2xl
              bg-blue-600
              px-8
              py-4
              font-bold
              "
            >
              Check Writing
            </button>
          </div>
        </section>
      )}

      {/* CULTURE */}
      {activeTab === "Culture" && (
        <section
          className="
          mx-auto
          mt-12
          max-w-7xl
          px-6
          "
        >
          <div
            className="
            grid
            gap-6
            md:grid-cols-2
            xl:grid-cols-4
            "
          >
            {[
              "Food",
              "Traditions",
              "Festivals",
              "History",
              "Music",
              "Movies",
              "Religion",
              "Daily Life",
            ].map((item) => (
              <motion.div
                key={item}
                whileHover={{
                  y: -8,
                }}
                className="
                rounded-3xl
                border
                border-white/10
                bg-slate-900
                p-8
                "
              >
                <Globe2
                  className="text-cyan-400"
                />
                <h3
                  className="
                  mt-6
                  text-xl
                  font-bold
                  "
                >
                  {item}
                </h3>
                <p
                  className="
                  mt-3
                  text-slate-400
                  "
                >
                  Learn authentic cultural experiences.
                </p>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* LESSONS */}
      {activeTab === "Lessons" && (
        <section
          className="
          mx-auto
          mt-12
          max-w-7xl
          px-6
          pb-16
          "
        >
          <div
            className="
            space-y-5
            "
          >
            {Array.from({ length: 20 }).map((_, index) => (
              <motion.div
                key={index}
                whileHover={{
                  x: 8,
                }}
                className="
                flex
                items-center
                justify-between
                rounded-3xl
                border
                border-white/10
                bg-slate-900
                p-6
                "
              >
                <div>
                  <h3
                    className="
                    text-xl
                    font-bold
                    "
                  >
                    Lesson {index + 1}
                  </h3>
                  <p className="text-slate-400">
                    Interactive lesson with AI guidance.
                  </p>
                </div>

                <button
                  className="
                  rounded-2xl
                  bg-blue-600
                  px-6
                  py-3
                  font-bold
                  "
                >
                  Start
                </button>
              </motion.div>
            ))}
          </div>
        </section>
      )}
    </section>
  );
};

export default LanguageDetails;