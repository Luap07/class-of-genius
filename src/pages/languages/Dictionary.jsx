import React, {
  useMemo,
  useState,
} from "react";

import { motion } from "framer-motion";

import {
  Search,
  Mic,
  Camera,
  BookOpen,
  Languages,
  Volume2,
  Sparkles,
  History,
  TrendingUp,
  ArrowRight,
  Star,
  Brain,
  Globe2,
  Bookmark,
  Copy,
  Share2,
} from "lucide-react";

const Dictionary = () => {
  const [query, setQuery] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("English");

  const [history] = useState([
    "education",
    "science",
    "beautiful",
    "computer",
    "knowledge",
    "physics",
  ]);

  const [trending] = useState([
    "Artificial Intelligence",
    "Quantum",
    "Democracy",
    "Sustainability",
    "Innovation",
    "Entrepreneur",
  ]);

  const languages = [
    "English",
    "French",
    "Spanish",
    "German",
    "Italian",
    "Portuguese",
    "Arabic",
    "Chinese",
    "Japanese",
    "Korean",
    "Hindi",
    "Yoruba",
    "Igbo",
    "Hausa",
    "Swahili",
  ];

  const wordOfDay = useMemo(
    () => ({
      word: "Resilience",
      phonetic: "/rɪˈzɪliəns/",
      meaning:
        "The ability to recover quickly from difficulties or adapt to change.",
      example:
        "Her resilience helped her succeed despite many challenges.",
    }),
    []
  );

  return (
    <div
      className="
      min-h-screen
      bg-[#050816]
      text-white
      "
    >
      {/* HERO */}
      <section
        className="
        relative
        overflow-hidden
        border-b
        border-white/10
        "
      >
        <div
          className="
          absolute
          inset-0
          bg-gradient-to-br
          from-cyan-500/10
          via-transparent
          to-blue-600/10
          "
        />

        <div
          className="
          relative
          mx-auto
          max-w-7xl
          px-6
          py-24
          "
        >
          <motion.div
            initial={{
              opacity: 0,
              y: 40,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.7,
            }}
          >
            <div
              className="
              inline-flex
              items-center
              gap-2
              rounded-full
              bg-cyan-500/10
              px-5
              py-2
              text-cyan-300
              "
            >
              <BookOpen size={18} />
              Scholiqen Dictionary
            </div>

            <h1
              className="
              mt-8
              max-w-4xl
              text-6xl
              font-black
              leading-tight
              "
            >
              Understand
              <span
                className="
                bg-gradient-to-r
                from-cyan-400
                to-blue-500
                bg-clip-text
                text-transparent
                "
              >
                {" "}
                Every Word
              </span>
              In Every Language
            </h1>

            <p
              className="
              mt-8
              max-w-3xl
              text-lg
              leading-9
              text-slate-400
              "
            >
              Search millions of words, discover meanings, pronunciation,
              synonyms, antonyms, grammar, examples, AI explanations and
              translations across 100+ world languages.
            </p>
          </motion.div>

          {/* SEARCH */}
          <div
            className="
            mt-14
            rounded-[32px]
            border
            border-white/10
            bg-slate-900/70
            p-8
            backdrop-blur-xl
            "
          >
            <div
              className="
              grid
              gap-6
              lg:grid-cols-[1fr_220px]
              "
            >
              <div
                className="
                flex
                items-center
                rounded-2xl
                border
                border-white/10
                bg-slate-800
                px-5
                "
              >
                <Search
                  size={22}
                  className="text-cyan-400"
                />

                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search any word..."
                  className="
                  h-16
                  flex-1
                  bg-transparent
                  px-5
                  outline-none
                  placeholder:text-slate-500
                  "
                />

                <button
                  className="
                  rounded-xl
                  bg-cyan-500
                  px-6
                  py-3
                  font-bold
                  "
                >
                  Search
                </button>
              </div>

              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="
                rounded-2xl
                border
                border-white/10
                bg-slate-800
                px-5
                outline-none
                "
              >
                {languages.map((language) => (
                  <option key={language}>{language}</option>
                ))}
              </select>
            </div>

            <div
              className="
              mt-8
              flex
              flex-wrap
              gap-4
              "
            >
              <button
                className="
                flex
                items-center
                gap-2
                rounded-xl
                bg-slate-800
                px-5
                py-3
                "
              >
                <Mic size={18} />
                Voice Search
              </button>

              <button
                className="
                flex
                items-center
                gap-2
                rounded-xl
                bg-slate-800
                px-5
                py-3
                "
              >
                <Camera size={18} />
                Camera Search
              </button>

              <button
                className="
                flex
                items-center
                gap-2
                rounded-xl
                bg-slate-800
                px-5
                py-3
                "
              >
                <Languages size={18} />
                Translate
              </button>

              <button
                className="
                flex
                items-center
                gap-2
                rounded-xl
                bg-slate-800
                px-5
                py-3
                "
              >
                <Brain size={18} />
                Ask AI
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* WORD OF THE DAY */}
      <section
        className="
        mx-auto
        mt-16
        max-w-7xl
        px-6
        "
      >
        <div
          className="
          rounded-[32px]
          border
          border-cyan-500/20
          bg-gradient-to-br
          from-cyan-500/10
          to-blue-600/10
          p-10
          "
        >
          <div
            className="
            flex
            flex-wrap
            items-center
            justify-between
            gap-8
            "
          >
            <div>
              <div
                className="
                flex
                items-center
                gap-2
                text-cyan-300
                "
              >
                <Sparkles size={20} />
                Word of the Day
              </div>

              <h2
                className="
                mt-5
                text-5xl
                font-black
                "
              >
                {wordOfDay.word}
              </h2>

              <p
                className="
                mt-3
                text-cyan-300
                "
              >
                {wordOfDay.phonetic}
              </p>

              <p
                className="
                mt-8
                max-w-3xl
                leading-8
                text-slate-300
                "
              >
                {wordOfDay.meaning}
              </p>

              <p
                className="
                mt-5
                italic
                text-slate-400
                "
              >
                "{wordOfDay.example}"
              </p>
            </div>

            <button
              className="
              rounded-full
              bg-cyan-500
              px-8
              py-4
              font-bold
              "
            >
              Learn More
            </button>
          </div>
        </div>
      </section>

      {/* TRENDING + HISTORY */}
      <section
        className="
        mx-auto
        mt-14
        max-w-7xl
        px-6
        "
      >
        <div
          className="
          grid
          gap-8
          lg:grid-cols-3
          "
        >
          {/* TRENDING */}
          <div
            className="
            rounded-3xl
            border
            border-white/10
            bg-slate-900
            p-8
            "
          >
            <div
              className="
              mb-6
              flex
              items-center
              gap-3
              "
            >
              <TrendingUp
                className="text-cyan-400"
                size={24}
              />
              <h2
                className="
                text-2xl
                font-black
                "
              >
                Trending Words
              </h2>
            </div>

            <div className="space-y-4">
              {trending.map((word, index) => (
                <motion.button
                  key={word}
                  whileHover={{
                    x: 8,
                  }}
                  className="
                  flex
                  w-full
                  items-center
                  justify-between
                  rounded-2xl
                  bg-slate-800
                  px-5
                  py-4
                  transition
                  hover:bg-slate-700
                  "
                >
                  <span
                    className="
                    font-semibold
                    "
                  >
                    {index + 1}. {word}
                  </span>
                  <ArrowRight size={18} />
                </motion.button>
              ))}
            </div>
          </div>

          {/* HISTORY */}
          <div
            className="
            rounded-3xl
            border
            border-white/10
            bg-slate-900
            p-8
            "
          >
            <div
              className="
              mb-6
              flex
              items-center
              gap-3
              "
            >
              <History
                className="text-blue-400"
                size={24}
              />
              <h2
                className="
                text-2xl
                font-black
                "
              >
                Recent Searches
              </h2>
            </div>

            <div
              className="
              flex
              flex-wrap
              gap-3
              "
            >
              {history.map((item) => (
                <button
                  key={item}
                  className="
                  rounded-full
                  bg-slate-800
                  px-5
                  py-2
                  text-sm
                  transition
                  hover:bg-cyan-500
                  "
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          {/* QUICK ACTIONS */}
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
              mb-6
              text-2xl
              font-black
              "
            >
              Quick Actions
            </h2>

            <div className="space-y-4">
              <button
                className="
                flex
                w-full
                items-center
                gap-3
                rounded-2xl
                bg-slate-800
                px-5
                py-4
                transition
                hover:bg-cyan-500
                "
              >
                <BookOpen />
                Browse Dictionary
              </button>

              <button
                className="
                flex
                w-full
                items-center
                gap-3
                rounded-2xl
                bg-slate-800
                px-5
                py-4
                transition
                hover:bg-blue-500
                "
              >
                <Languages />
                Translate Sentence
              </button>

              <button
                className="
                flex
                w-full
                items-center
                gap-3
                rounded-2xl
                bg-slate-800
                px-5
                py-4
                transition
                hover:bg-purple-500
                "
              >
                <Brain />
                Ask AI
              </button>

              <button
                className="
                flex
                w-full
                items-center
                gap-3
                rounded-2xl
                bg-slate-800
                px-5
                py-4
                transition
                hover:bg-green-500
                "
              >
                <Volume2 />
                Pronunciation Practice
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* PLATFORM STATS */}
      <section
        className="
        mx-auto
        mt-14
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
          <div
            className="
            rounded-3xl
            border
            border-white/10
            bg-slate-900
            p-8
            "
          >
            <Globe2
              size={36}
              className="text-cyan-400"
            />
            <h3
              className="
              mt-6
              text-4xl
              font-black
              "
            >
              100+
            </h3>
            <p className="mt-2 text-slate-400">Languages</p>
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
            <BookOpen
              size={36}
              className="text-blue-400"
            />
            <h3
              className="
              mt-6
              text-4xl
              font-black
              "
            >
              2M+
            </h3>
            <p className="mt-2 text-slate-400">Dictionary Words</p>
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
            <Brain
              size={36}
              className="text-purple-400"
            />
            <h3
              className="
              mt-6
              text-4xl
              font-black
              "
            >
              AI
            </h3>
            <p className="mt-2 text-slate-400">Smart Explanations</p>
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
            <Star
              size={36}
              className="text-yellow-400"
            />
            <h3
              className="
              mt-6
              text-4xl
              font-black
              "
            >
              Daily
            </h3>
            <p className="mt-2 text-slate-400">Word Challenges</p>
          </div>
        </div>
      </section>

      {/* DICTIONARY RESULT */}
      <section
        className="
        mx-auto
        mt-16
        max-w-7xl
        px-6
        "
      >
        <div
          className="
          overflow-hidden
          rounded-3xl
          border
          border-white/10
          bg-slate-900
          "
        >
          {/* HEADER */}
          <div
            className="
            border-b
            border-white/10
            p-8
            "
          >
            <div
              className="
              flex
              flex-wrap
              items-center
              justify-between
              gap-6
              "
            >
              <div>
                <h2
                  className="
                  text-5xl
                  font-black
                  "
                >
                  Hello
                </h2>

                <div
                  className="
                  mt-3
                  flex
                  flex-wrap
                  items-center
                  gap-4
                  "
                >
                  <span
                    className="
                    rounded-full
                    bg-cyan-500/20
                    px-4
                    py-2
                    text-cyan-400
                    "
                  >
                    Interjection
                  </span>
                  <span className="text-slate-400">/həˈləʊ/</span>
                </div>
              </div>

              <button
                className="
                flex
                items-center
                gap-3
                rounded-2xl
                bg-cyan-600
                px-6
                py-4
                font-bold
                "
              >
                <Volume2 size={20} />
                Listen
              </button>
            </div>
          </div>

          {/* BODY */}
          <div
            className="
            grid
            gap-10
            p-8
            xl:grid-cols-3
            "
          >
            {/* LEFT */}
            <div className="xl:col-span-2">
              <h3
                className="
                text-2xl
                font-black
                "
              >
                Definition
              </h3>

              <p
                className="
                mt-5
                leading-9
                text-slate-300
                "
              >
                Used as a greeting or to begin a phone conversation.
              </p>

              <div className="mt-10">
                <h3
                  className="
                  text-2xl
                  font-black
                  "
                >
                  Example Sentences
                </h3>

                <div className="mt-6 space-y-5">
                  <div
                    className="
                    rounded-2xl
                    bg-slate-800
                    p-5
                    "
                  >
                    "Hello, how are you today?"
                  </div>

                  <div
                    className="
                    rounded-2xl
                    bg-slate-800
                    p-5
                    "
                  >
                    She smiled and said hello.
                  </div>

                  <div
                    className="
                    rounded-2xl
                    bg-slate-800
                    p-5
                    "
                  >
                    Hello everyone, welcome to Scholiqen.
                  </div>
                </div>
              </div>

              <div className="mt-10">
                <h3
                  className="
                  text-2xl
                  font-black
                  "
                >
                  Word Origin
                </h3>

                <p
                  className="
                  mt-5
                  leading-8
                  text-slate-400
                  "
                >
                  Originated from Old High German expressions used to attract
                  attention before becoming the modern English greeting.
                </p>
              </div>
            </div>

            {/* RIGHT */}
            <div className="space-y-8">
              <div
                className="
                rounded-2xl
                bg-slate-800
                p-6
                "
              >
                <h4 className="font-bold">Synonyms</h4>
                <div
                  className="
                  mt-5
                  flex
                  flex-wrap
                  gap-3
                  "
                >
                  {["Hi", "Hey", "Greetings", "Welcome"].map((item) => (
                    <button
                      key={item}
                      className="
                      rounded-full
                      bg-cyan-500/20
                      px-4
                      py-2
                      "
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>

              <div
                className="
                rounded-2xl
                bg-slate-800
                p-6
                "
              >
                <h4 className="font-bold">Related Words</h4>
                <div
                  className="
                  mt-5
                  flex
                  flex-wrap
                  gap-3
                  "
                >
                  {[
                    "Good Morning",
                    "Welcome",
                    "Greetings",
                    "Salutations",
                  ].map((item) => (
                    <button
                      key={item}
                      className="
                      rounded-full
                      bg-blue-500/20
                      px-4
                      py-2
                      "
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>

              <div
                className="
                rounded-2xl
                bg-slate-800
                p-6
                "
              >
                <h4 className="font-bold">Quick Actions</h4>
                <div className="mt-6 space-y-4">
                  <button
                    className="
                    flex
                    w-full
                    items-center
                    gap-3
                    rounded-xl
                    bg-slate-700
                    px-4
                    py-3
                    "
                  >
                    <Bookmark size={18} />
                    Save Word
                  </button>

                  <button
                    className="
                    flex
                    w-full
                    items-center
                    gap-3
                    rounded-xl
                    bg-slate-700
                    px-4
                    py-3
                    "
                  >
                    <Copy size={18} />
                    Copy Definition
                  </button>

                  <button
                    className="
                    flex
                    w-full
                    items-center
                    gap-3
                    rounded-xl
                    bg-slate-700
                    px-4
                    py-3
                    "
                  >
                    <Share2 size={18} />
                    Share Word
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* AI WORD TEACHER */}
      <section
        className="
        mx-auto
        mt-16
        max-w-7xl
        px-6
        "
      >
        <div
          className="
          overflow-hidden
          rounded-3xl
          border
          border-cyan-500/20
          bg-gradient-to-br
          from-slate-900
          via-slate-900
          to-cyan-950/40
          p-10
          "
        >
          <div
            className="
            flex
            flex-wrap
            items-center
            justify-between
            gap-8
            "
          >
            <div>
              <div
                className="
                inline-flex
                items-center
                gap-2
                rounded-full
                bg-cyan-500/20
                px-4
                py-2
                text-cyan-400
                font-semibold
                "
              >
                <Sparkles size={18} />
                AI Language Teacher
              </div>

              <h2
                className="
                mt-6
                text-4xl
                font-black
                "
              >
                Learn Every Word Like a Teacher is Beside You
              </h2>

              <p
                className="
                mt-5
                max-w-3xl
                leading-8
                text-slate-300
                "
              >
                Scholiqen AI doesn't only translate words. It explains meanings,
                pronunciation, grammar usage, sentence structure, culture and
                common mistakes.
              </p>
            </div>

            <button
              className="
              rounded-2xl
              bg-cyan-600
              px-8
              py-4
              font-bold
              hover:bg-cyan-500
              transition
              "
            >
              Ask AI
            </button>
          </div>

          <div
            className="
            mt-12
            grid
            gap-6
            md:grid-cols-2
            xl:grid-cols-3
            "
          >
            {[
              {
                title: "Explain Like I'm 10",
                desc: "Simple explanations anyone can understand.",
              },
              {
                title: "Grammar Breakdown",
                desc: "Learn why the word is used in a sentence.",
              },
              {
                title: "Conversation Practice",
                desc: "Generate realistic conversations instantly.",
              },
              {
                title: "Pronunciation Coach",
                desc: "Practice speaking with AI feedback.",
              },
              {
                title: "Memory Tricks",
                desc: "AI creates mnemonics to remember words.",
              },
              {
                title: "Word Comparison",
                desc: "Understand differences between similar words.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="
                rounded-2xl
                border
                border-white/10
                bg-slate-800/70
                p-6
                "
              >
                <Brain
                  size={30}
                  className="text-cyan-400"
                />

                <h3
                  className="
                  mt-5
                  text-xl
                  font-bold
                  "
                >
                  {item.title}
                </h3>

                <p
                  className="
                  mt-4
                  leading-7
                  text-slate-400
                  "
                >
                  {item.desc}
                </p>
              </div>
            ))}
          </div>

          <div
            className="
            mt-12
            rounded-2xl
            bg-slate-950
            p-8
            "
          >
            <h3
              className="
              text-2xl
              font-black
              "
            >
              Example AI Response
            </h3>

            <div
              className="
              mt-6
              rounded-2xl
              bg-slate-900
              p-6
              leading-8
              text-slate-300
              "
            >
              <strong className="text-cyan-400">Word:</strong> &nbsp;Hello
              <br />
              <br />
              Hello is a greeting used when meeting someone or starting a
              conversation. It is friendly, polite and one of the first English
              words learners usually know.
              <br />
              <br />
              You can use it in formal and informal situations.
              <br />
              <br />
              Example:
              <div
                className="
                mt-4
                rounded-xl
                bg-slate-800
                p-4
                "
              >
                Hello John, welcome to Scholiqen.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* VOCABULARY BUILDER */}
      <section
        className="
        mx-auto
        mt-16
        max-w-7xl
        px-6
        pb-16
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
          <div
            className="
            flex
            flex-wrap
            items-center
            justify-between
            gap-6
            "
          >
            <div>
              <span
                className="
                rounded-full
                bg-blue-500/20
                px-4
                py-2
                text-blue-400
                font-semibold
                "
              >
                Vocabulary Builder
              </span>

              <h2
                className="
                mt-5
                text-4xl
                font-black
                "
              >
                Learn New Words Every Day
              </h2>

              <p
                className="
                mt-4
                max-w-3xl
                leading-8
                text-slate-400
                "
              >
                Build your vocabulary through daily practice, quizzes, AI
                explanations, flashcards and real-world examples.
              </p>
            </div>

            <button
              className="
              rounded-2xl
              bg-blue-600
              px-7
              py-4
              font-bold
              "
            >
              Start Learning
            </button>
          </div>

          <div
            className="
            mt-12
            grid
            gap-6
            md:grid-cols-2
            xl:grid-cols-4
            "
          >
            {[
              {
                title: "Today's Word",
                value: "Innovation",
                color: "text-cyan-400",
              },
              {
                title: "Words Learned",
                value: "1,245",
                color: "text-green-400",
              },
              {
                title: "Current Streak",
                value: "18 Days",
                color: "text-yellow-400",
              },
              {
                title: "Mastered Words",
                value: "653",
                color: "text-pink-400",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="
                rounded-2xl
                bg-slate-800
                p-7
                "
              >
                <p className="text-slate-400">{item.title}</p>
                <h2 className={`mt-4 text-3xl font-black ${item.color}`}>
                  {item.value}
                </h2>
              </div>
            ))}
          </div>

          <div
            className="
            mt-12
            grid
            gap-6
            md:grid-cols-2
            xl:grid-cols-3
            "
          >
            {[
              {
                word: "Ambitious",
                meaning: "Having a strong desire to succeed.",
              },
              {
                word: "Brilliant",
                meaning: "Exceptionally clever or talented.",
              },
              {
                word: "Confident",
                meaning: "Feeling certain about yourself.",
              },
              {
                word: "Determine",
                meaning: "To decide or establish.",
              },
              {
                word: "Encourage",
                meaning: "To inspire confidence.",
              },
              {
                word: "Flexible",
                meaning: "Able to change easily.",
              },
            ].map((item) => (
              <div
                key={item.word}
                className="
                rounded-2xl
                border
                border-white/10
                bg-slate-800
                p-6
                "
              >
                <h3
                  className="
                  text-2xl
                  font-black
                  "
                >
                  {item.word}
                </h3>
                <p
                  className="
                  mt-4
                  leading-7
                  text-slate-400
                  "
                >
                  {item.meaning}
                </p>

                <button
                  className="
                  mt-6
                  rounded-xl
                  bg-cyan-600
                  px-5
                  py-3
                  font-semibold
                  "
                >
                  Learn More
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Dictionary;