import React from "react";
import { useNavigate } from "react-router-dom";
import {
  FileText,
  Bot,
  FlaskConical,
  PlayCircle,
  BookOpen,
  Download,
  ArrowRight,
} from "lucide-react";

const StudyResources = ({
  country,
  grade,
  subject,
  topic,
}) => {
  const navigate = useNavigate();

  const resources = [
    {
      title: "Study Notes",
      description: "Read comprehensive curriculum notes.",
      icon: FileText,
      color: "text-cyan-400",
      action: () =>
        navigate("notes"),
    },

    {
      title: "AI Tutor",
      description: "Ask questions and get instant explanations.",
      icon: Bot,
      color: "text-violet-400",
      action: () =>
        navigate("/ai-tutor"),
    },

    {
      title: "Virtual Lab",
      description: "Perform practical experiments.",
      icon: FlaskConical,
      color: "text-green-400",
      action: () =>
        navigate("/lab"),
    },

    {
      title: "Video Lessons",
      description: "Watch instructor-led lessons.",
      icon: PlayCircle,
      color: "text-red-400",
      action: () =>
        navigate("videos"),
    },

    {
      title: "Recommended Books",
      description: "Reference textbooks and materials.",
      icon: BookOpen,
      color: "text-amber-400",
      action: () =>
        navigate("books"),
    },

    {
      title: "Downloads",
      description: "PDFs, worksheets and resources.",
      icon: Download,
      color: "text-blue-400",
      action: () =>
        navigate("downloads"),
    },
  ];

  return (
    <section className="mt-12">

      <div className="flex items-center justify-between mb-6">

        <div>

          <h2 className="text-3xl font-bold">

            Study Resources

          </h2>

          <p className="text-slate-400 mt-2">

            Everything you need to master this topic.

          </p>

        </div>

      </div>

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">

        {resources.map((resource) => {

          const Icon = resource.icon;

          return (

            <button
              key={resource.title}
              onClick={resource.action}
              className="text-left bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-cyan-500 transition-all duration-300 hover:-translate-y-1"
            >

              <div className="flex justify-between items-start">

                <div
                  className={`w-14 h-14 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center ${resource.color}`}
                >

                  <Icon size={28} />

                </div>

                <ArrowRight
                  size={20}
                  className="text-slate-500"
                />

              </div>

              <h3 className="text-xl font-bold mt-6">

                {resource.title}

              </h3>

              <p className="text-slate-400 mt-3 leading-7">

                {resource.description}

              </p>

            </button>

          );

        })}

      </div>

    </section>
  );
};

export default StudyResources;