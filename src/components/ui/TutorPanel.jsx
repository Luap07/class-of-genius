// src/components/ui/TutorPanel.jsx

import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bot,
  Sparkles,
  Send,
  Lightbulb,
  BookOpen,
  TriangleAlert,
  CircleHelp,
  GraduationCap,
  CheckCircle2,
} from "lucide-react";

const TutorPanel = ({
  ph = 7,
  endpointReached = false,
  indicator = "Phenolphthalein",
  acid = "Hydrochloric Acid",
  base = "Sodium Hydroxide",
  volumeAdded = 0,
  endpointVolume = 25,
}) => {
  const navigate = useNavigate();

  const [question, setQuestion] = useState("");

  const tips = useMemo(() => {
    const list = [];

    if (volumeAdded < endpointVolume * 0.8) {
      list.push(
        "You are still far from the endpoint. You can add titrant at a moderate rate."
      );
    }

    if (
      volumeAdded >= endpointVolume * 0.8 &&
      !endpointReached
    ) {
      list.push(
        "Slow down. Add one drop at a time to avoid overshooting the endpoint."
      );
    }

    if (endpointReached) {
      list.push(
        "Excellent! Record the final burette reading before resetting the experiment."
      );
    }

    if (indicator === "Phenolphthalein") {
      list.push(
        "Phenolphthalein changes from colourless to pale pink at the endpoint."
      );
    }

    if (ph < 7) {
      list.push("The solution is currently acidic.");
    }

    if (ph === 7) {
      list.push("The solution is approximately neutral.");
    }

    if (ph > 7) {
      list.push("The solution is now basic.");
    }

    return list;
  }, [
    ph,
    endpointReached,
    indicator,
    volumeAdded,
    endpointVolume,
  ]);

  const quickQuestions = [
    "Why do we use an indicator?",
    "What is the endpoint?",
    "Why add titrant drop by drop?",
    "How is pH changing?",
    "What is the equivalence point?",
    "Why rinse the burette first?",
  ];

  const handleAskTutor = () => {
    navigate("/ai-tutor/session", {
      state: {
        question,
        subject: "Chemistry",
        topic: "Acid-Base Titration",

        experiment: {
          acid,
          base,
          indicator,
          ph,
          volumeAdded,
          endpointReached,
          endpointVolume,
        },
      },
    });
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl">

      {/* Header */}
      <div className="border-b border-slate-800 p-5 flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-cyan-500/20 flex items-center justify-center">
          <Bot className="text-cyan-400" size={24} />
        </div>

        <div>
          <h2 className="text-xl font-bold">
            AI Laboratory Tutor
          </h2>

          <p className="text-slate-400 text-sm">
            Real-time guidance during your experiment
          </p>
        </div>
      </div>

      {/* Experiment Summary */}
      <div className="p-5 border-b border-slate-800">
        <div className="flex items-center gap-2 mb-4">
          <GraduationCap
            className="text-cyan-400"
            size={18}
          />
          <h3 className="font-semibold">
            Current Experiment
          </h3>
        </div>

        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-400">Acid</span>
            <span>{acid}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-slate-400">Base</span>
            <span>{base}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-slate-400">Indicator</span>
            <span>{indicator}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-slate-400">Current pH</span>
            <span>{Number(ph).toFixed(2)}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-slate-400">Volume Added</span>
            <span>{volumeAdded.toFixed(2)} mL</span>
          </div>
        </div>
      </div>

      {/* Live Advice */}
      <div className="p-5">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles
            className="text-yellow-400"
            size={18}
          />

          <h3 className="font-semibold">
            Live Advice
          </h3>
        </div>

        <div className="space-y-3">
          {tips.map((tip, index) => (
            <div
              key={index}
              className="flex gap-3 rounded-xl bg-slate-800 p-3"
            >
              <Lightbulb
                className="text-yellow-400 mt-1"
                size={18}
              />

              <p className="text-sm leading-6 text-slate-300">
                {tip}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Safety */}
      <div className="px-5 pb-5">
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-4">
          <div className="flex gap-3">
            <TriangleAlert
              className="text-amber-400 mt-1"
              size={18}
            />

            <div>
              <h4 className="font-semibold text-amber-300">
                Safety Reminder
              </h4>

              <p className="mt-1 text-sm text-slate-300 leading-6">
                Always wear safety goggles and rinse all
                apparatus with distilled water before
                beginning the experiment.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Questions */}
      <div className="px-5 pb-5">
        <div className="flex items-center gap-2 mb-4">
          <CircleHelp
            className="text-cyan-400"
            size={18}
          />

          <h3 className="font-semibold">
            Quick Questions
          </h3>
        </div>

        <div className="flex flex-wrap gap-2">
          {quickQuestions.map((item) => (
            <button
              key={item}
              onClick={() => setQuestion(item)}
              className="rounded-lg bg-slate-800 hover:bg-slate-700 px-3 py-2 text-sm"
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      {/* Ask Tutor */}
      <div className="border-t border-slate-800 p-5">
        <div className="flex items-center gap-2 mb-4">
          <BookOpen
            className="text-cyan-400"
            size={18}
          />

          <h3 className="font-semibold">
            Ask the Tutor
          </h3>
        </div>

        <div className="flex gap-3">
          <input
            type="text"
            value={question}
            onChange={(e) =>
              setQuestion(e.target.value)
            }
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleAskTutor();
              }
            }}
            placeholder="Ask a chemistry question..."
            className="flex-1 rounded-xl bg-slate-800 border border-slate-700 px-4 py-3 outline-none focus:border-cyan-500"
          />

          <button
            onClick={handleAskTutor}
            className="rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black px-5 flex items-center justify-center"
          >
            <Send size={18} />
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-slate-800 px-5 py-4 flex items-center justify-between text-sm">
        <div className="flex items-center gap-2 text-green-400">
          <CheckCircle2 size={16} />
          Tutor Ready
        </div>

        <span className="text-slate-400">
          Chemistry AI Assistant
        </span>
      </div>
    </div>
  );
};

export default TutorPanel;