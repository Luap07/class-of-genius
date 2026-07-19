// src/pages/courses/Subjects.jsx

import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Atom,
  FlaskConical,
  Dna,
  Calculator,
  Globe,
  Laptop,
  Briefcase,
  Palette,
  ArrowRight,
} from "lucide-react";

const SUBJECTS = {
  Science: [
    {
      id: "physics",
      name: "Physics",
      icon: Atom,
      description: "Mechanics, Electricity, Waves, Modern Physics",
    },
    {
      id: "chemistry",
      name: "Chemistry",
      icon: FlaskConical,
      description: "Organic, Inorganic, Physical Chemistry",
    },
    {
      id: "biology",
      name: "Biology",
      icon: Dna,
      description: "Genetics, Ecology, Human Biology",
    },
  ],

  Technology: [
    {
      id: "computer-science",
      name: "Computer Science",
      icon: Laptop,
      description: "Programming, AI, Cyber Security",
    },
  ],

  Mathematics: [
    {
      id: "mathematics",
      name: "Mathematics",
      icon: Calculator,
      description: "Pure & Applied Mathematics",
    },
  ],

  Geography: [
    {
      id: "geography",
      name: "Geography",
      icon: Globe,
      description: "Physical & Human Geography",
    },
  ],

  Business: [
    {
      id: "accounting",
      name: "Accounting",
      icon: Briefcase,
      description: "Financial Accounting",
    },
  ],

  Arts: [
    {
      id: "fine-art",
      name: "Fine Art",
      icon: Palette,
      description: "Creative Arts & Design",
    },
  ],
};

export default function Subjects() {
  const { category } = useParams();

  const navigate = useNavigate();

  const subjects = SUBJECTS[category] || [];

  return (
    <div className="min-h-screen bg-[#07111f] text-white">

      <div className="max-w-7xl mx-auto px-8 py-16">

        <h1 className="text-5xl font-black">
          {category}
        </h1>

        <p className="text-slate-400 mt-3">
          Choose a subject to continue.
        </p>

        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-8 mt-14">

          {subjects.map((subject) => {

            const Icon = subject.icon;

            return (

              <motion.div
                key={subject.id}
                whileHover={{ y: -8 }}
                onClick={() =>
                  navigate(
                    `/courses/${category}/${subject.id}`
                  )
                }
                className="cursor-pointer rounded-3xl border border-slate-800 bg-slate-900 p-8 hover:border-cyan-500 transition"
              >

                <div className="w-16 h-16 rounded-2xl bg-cyan-500/20 flex items-center justify-center">

                  <Icon
                    size={30}
                    className="text-cyan-400"
                  />

                </div>

                <h2 className="text-2xl font-bold mt-6">
                  {subject.name}
                </h2>

                <p className="text-slate-400 mt-3">
                  {subject.description}
                </p>

                <div className="flex items-center gap-2 mt-8 text-cyan-400 font-semibold">

                  Open Subject

                  <ArrowRight size={18} />

                </div>

              </motion.div>

            );

          })}

        </div>

      </div>

    </div>
  );
}