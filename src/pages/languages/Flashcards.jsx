import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  RotateCcw,
  Volume2,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  XCircle,
  Brain,
} from "lucide-react";

const flashcards = [
  {
    id: 1,
    word: "Innovation",
    meaning: "The introduction of new ideas, methods or products.",
    example: "Innovation drives economic growth.",
    pronunciation: "/ˌɪnəˈveɪʃən/",
  },

  {
    id: 2,
    word: "Courage",
    meaning: "The ability to face fear with confidence.",
    example: "She showed courage during the rescue.",
    pronunciation: "/ˈkʌrɪdʒ/",
  },

  {
    id: 3,
    word: "Journey",
    meaning: "Travel from one place to another or a process of personal growth.",
    example: "Learning is a lifelong journey.",
    pronunciation: "/ˈdʒɜːni/",
  },

  {
    id: 4,
    word: "Achievement",
    meaning: "Something successfully completed through effort and skill.",
    example: "Graduating was a great achievement.",
    pronunciation: "/əˈtʃiːvmənt/",
  },

  {
    id: 5,
    word: "Opportunity",
    meaning: "A favorable chance to do something valuable.",
    example: "This opportunity can change your future.",
    pronunciation: "/ˌɒpəˈtjuːnəti/",
  },

  {
    id: 6,
    word: "Confidence",
    meaning: "A feeling of trust in your abilities or decisions.",
    example: "Practice builds confidence over time.",
    pronunciation: "/ˈkɒnfɪdəns/",
  },

  {
    id: 7,
    word: "Persistence",
    meaning: "The ability to continue despite difficulties or challenges.",
    example: "Persistence leads to success.",
    pronunciation: "/pəˈsɪstəns/",
  },

  {
    id: 8,
    word: "Knowledge",
    meaning: "Information and understanding gained through learning.",
    example: "Knowledge helps people make better decisions.",
    pronunciation: "/ˈnɒlɪdʒ/",
  },

  {
    id: 9,
    word: "Communication",
    meaning: "The process of sharing information, ideas and feelings.",
    example: "Good communication improves teamwork.",
    pronunciation: "/kəˌmjuːnɪˈkeɪʃən/",
  },

  {
    id: 10,
    word: "Creativity",
    meaning: "The ability to produce new and original ideas.",
    example: "Creativity helps solve complex problems.",
    pronunciation: "/ˌkriːeɪˈtɪvəti/",
  },

  {
    id: 11,
    word: "Strategy",
    meaning: "A planned approach used to achieve a goal.",
    example: "The company developed a new strategy.",
    pronunciation: "/ˈstrætədʒi/",
  },

  {
    id: 12,
    word: "Discipline",
    meaning: "The ability to control actions and stay focused on goals.",
    example: "Discipline creates long-term success.",
    pronunciation: "/ˈdɪsəplɪn/",
  },

  {
    id: 13,
    word: "Wisdom",
    meaning: "The ability to make good decisions using knowledge and experience.",
    example: "Wisdom grows through experience.",
    pronunciation: "/ˈwɪzdəm/",
  },
  {
  id: 14,
  word: "Adaptability",
  meaning: "The ability to adjust successfully to new situations or changes.",
  example: "Adaptability is important in a fast-changing world.",
  pronunciation: "/əˌdæptəˈbɪləti/",
},

{
  id: 15,
  word: "Responsibility",
  meaning: "The duty to take care of tasks, decisions or actions.",
  example: "Taking responsibility builds trust.",
  pronunciation: "/rɪˌspɒnsəˈbɪləti/",
},

{
  id: 16,
  word: "Opportunity",
  meaning: "A situation that provides a chance for progress or success.",
  example: "Every challenge can become an opportunity.",
  pronunciation: "/ˌɒpəˈtjuːnəti/",
},

{
  id: 17,
  word: "Motivation",
  meaning: "The reason or desire that encourages someone to take action.",
  example: "Strong motivation helps people achieve their goals.",
  pronunciation: "/ˌməʊtɪˈveɪʃən/",
},

{
  id: 18,
  word: "Leadership",
  meaning: "The ability to guide, influence and inspire others.",
  example: "Great leadership creates successful teams.",
  pronunciation: "/ˈliːdəʃɪp/",
},

{
  id: 19,
  word: "Curiosity",
  meaning: "A strong desire to learn or discover new information.",
  example: "Curiosity encourages lifelong learning.",
  pronunciation: "/ˌkjʊəriˈɒsəti/",
},

{
  id: 20,
  word: "Determination",
  meaning: "A firm decision to achieve something despite difficulties.",
  example: "Her determination helped her overcome obstacles.",
  pronunciation: "/dɪˌtɜːmɪˈneɪʃən/",
},

{
  id: 21,
  word: "Collaboration",
  meaning: "Working together with others to achieve a shared goal.",
  example: "Collaboration improves creativity and results.",
  pronunciation: "/kəˌlæbəˈreɪʃən/",
},

{
  id: 22,
  word: "Innovation",
  meaning: "The process of creating improved ideas, products or solutions.",
  example: "Technology companies depend on innovation.",
  pronunciation: "/ˌɪnəˈveɪʃən/",
},

{
  id: 23,
  word: "Excellence",
  meaning: "The quality of being extremely good or outstanding.",
  example: "Excellence comes from consistent improvement.",
  pronunciation: "/ˈeksələns/",
},
{
  id: 24,
  word: "Perspective",
  meaning: "A particular way of thinking about or understanding something.",
  example: "Travel can change your perspective on life.",
  pronunciation: "/pəˈspektɪv/",
},

{
  id: 25,
  word: "Integrity",
  meaning: "The quality of being honest and having strong moral principles.",
  example: "Integrity builds respect and trust.",
  pronunciation: "/ɪnˈteɡrəti/",
},

{
  id: 26,
  word: "Efficiency",
  meaning: "The ability to achieve results with minimum waste of time or resources.",
  example: "The new system improves efficiency.",
  pronunciation: "/ɪˈfɪʃənsi/",
},

{
  id: 27,
  word: "Resilience",
  meaning: "The ability to recover quickly from difficulties or challenges.",
  example: "Resilience helps people handle tough situations.",
  pronunciation: "/rɪˈzɪliəns/",
},

{
  id: 28,
  word: "Achievement",
  meaning: "A successful result gained through effort and determination.",
  example: "Completing the project was a major achievement.",
  pronunciation: "/əˈtʃiːvmənt/",
},

{
  id: 29,
  word: "Influence",
  meaning: "The ability to affect the thoughts, actions or decisions of others.",
  example: "Teachers have a strong influence on students.",
  pronunciation: "/ˈɪnfluəns/",
},

{
  id: 30,
  word: "Innovation",
  meaning: "A new idea or method that improves existing solutions.",
  example: "Innovation transforms industries.",
  pronunciation: "/ˌɪnəˈveɪʃən/",
},

{
  id: 31,
  word: "Awareness",
  meaning: "Knowledge or understanding of a situation or fact.",
  example: "Environmental awareness is growing worldwide.",
  pronunciation: "/əˈweənəs/",
},

{
  id: 32,
  word: "Confidence",
  meaning: "Belief in your own abilities and decisions.",
  example: "Confidence improves communication skills.",
  pronunciation: "/ˈkɒnfɪdəns/",
},

{
  id: 33,
  word: "Growth",
  meaning: "The process of developing, improving or becoming stronger.",
  example: "Personal growth requires continuous learning.",
  pronunciation: "/ɡrəʊθ/",
},
];

export default function Flashcards() {
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  const card = flashcards[index];

  const nextCard = () => {
    setFlipped(false);
    setIndex((prev) => (prev + 1) % flashcards.length);
  };

  const previousCard = () => {
    setFlipped(false);
    setIndex((prev) =>
      prev === 0 ? flashcards.length - 1 : prev - 1
    );
  };

  return (
    <section className="min-h-screen bg-[#030712] text-white px-6 py-16">

      <div className="mx-auto max-w-6xl">

        <div className="text-center">

          <div className="inline-flex items-center gap-2 rounded-full bg-cyan-500/20 px-5 py-2 text-cyan-400 font-bold">
            <Brain size={18} />
            AI Flashcards
          </div>

          <h1 className="mt-6 text-5xl font-black">
            Flashcards
          </h1>

          <p className="mt-5 text-slate-400 max-w-3xl mx-auto leading-8">
            Learn faster using interactive flashcards powered by
            spaced repetition and AI explanations.
          </p>

        </div>

        <div className="mt-16 flex justify-center">

          <motion.div
            layout
            whileTap={{ scale: 0.97 }}
            onClick={() => setFlipped(!flipped)}
            className="cursor-pointer w-full max-w-xl rounded-3xl border border-cyan-500/20 bg-slate-900 p-10 shadow-2xl"
          >

            {!flipped ? (
              <>
                <p className="text-cyan-400 font-bold">
                  Word
                </p>

                <h2 className="mt-6 text-5xl font-black">
                  {card.word}
                </h2>

                <p className="mt-5 text-lg text-slate-400">
                  {card.pronunciation}
                </p>

                <div className="mt-10 flex justify-center">
                  <button className="rounded-full bg-cyan-600 p-4">
                    <Volume2 />
                  </button>
                </div>

                <p className="mt-12 text-center text-slate-500">
                  Click card to reveal meaning
                </p>
              </>
            ) : (
              <>
                <p className="text-green-400 font-bold">
                  Meaning
                </p>

                <h2 className="mt-6 text-3xl font-black leading-relaxed">
                  {card.meaning}
                </h2>

                <div className="mt-8 rounded-2xl bg-slate-800 p-5">
                  <p className="text-slate-400">
                    Example
                  </p>

                  <p className="mt-3 text-lg">
                    {card.example}
                  </p>
                </div>

                <button className="mt-8 rounded-xl bg-cyan-600 px-6 py-3 font-bold">
                  Explain with AI
                </button>
              </>
            )}

          </motion.div>

        </div>

        <div className="mt-14 flex flex-wrap justify-center gap-4">

          <button
            onClick={previousCard}
            className="flex items-center gap-2 rounded-xl bg-slate-800 px-6 py-3"
          >
            <ChevronLeft size={18} />
            Previous
          </button>

          <button
            onClick={() => setFlipped(false)}
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3"
          >
            <RotateCcw size={18} />
            Reset
          </button>

          <button
            onClick={nextCard}
            className="flex items-center gap-2 rounded-xl bg-slate-800 px-6 py-3"
          >
            Next
            <ChevronRight size={18} />
          </button>

        </div>

        <div className="mt-16 grid gap-6 md:grid-cols-2">

          <button className="rounded-2xl bg-green-600 p-8">
            <CheckCircle className="mx-auto mb-4" size={40} />

            <h2 className="text-2xl font-black">
              I Know This
            </h2>

            <p className="mt-3 text-green-100">
              Increase mastery level
            </p>

          </button>

          <button className="rounded-2xl bg-red-600 p-8">

            <XCircle className="mx-auto mb-4" size={40} />

            <h2 className="text-2xl font-black">
              Study Again
            </h2>

            <p className="mt-3 text-red-100">
              AI will show this word again later.
            </p>

          </button>

        </div>

      </div>

    </section>
  );
}