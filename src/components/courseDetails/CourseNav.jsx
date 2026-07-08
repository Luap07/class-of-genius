import React from "react";
import {
  BookOpen,
  Target,
  Layers3,
  UserSquare2,
  Star,
  HelpCircle,
  Link2,
} from "lucide-react";

const links = [
  {
    id: "overview",
    label: "Overview",
    icon: BookOpen,
  },
  {
    id: "outcomes",
    label: "Learning Outcomes",
    icon: Target,
  },
  {
    id: "curriculum",
    label: "Curriculum",
    icon: Layers3,
  },
  {
    id: "instructor",
    label: "Instructor",
    icon: UserSquare2,
  },
  {
    id: "reviews",
    label: "Reviews",
    icon: Star,
  },
  {
    id: "faq",
    label: "FAQ",
    icon: HelpCircle,
  },
  {
    id: "related",
    label: "Related Courses",
    icon: Link2,
  },
];

const CourseNav = () => {
  const scrollToSection = (id) => {
    const section = document.getElementById(id);

    if (!section) return;

    section.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  return (
    <div
      className="
        rounded-[28px]
        border
        border-slate-800
        bg-slate-900
        p-6
        shadow-xl
      "
    >
      <h3 className="text-xl font-bold">

        Course Navigation

      </h3>

      <p className="mt-2 text-sm text-slate-400 leading-6">
        Jump quickly to any section of this course.
      </p>

      <div className="mt-8 space-y-2">

        {links.map((item) => {

          const Icon = item.icon;

          return (

            <button
              key={item.id}
              onClick={() => scrollToSection(item.id)}
              className="
                w-full
                flex
                items-center
                gap-4
                rounded-2xl
                px-4
                py-4
                text-left
                transition-all
                duration-300
                hover:bg-slate-800
                hover:translate-x-2
                group
              "
            >

              <div
                className="
                  h-12
                  w-12
                  rounded-xl
                  bg-blue-600/10
                  text-blue-400
                  flex
                  items-center
                  justify-center
                  group-hover:bg-blue-600
                  group-hover:text-white
                  transition
                "
              >
                <Icon size={20} />
              </div>

              <div>

                <h4 className="font-semibold">

                  {item.label}

                </h4>

                <p className="text-sm text-slate-500">

                  View section

                </p>

              </div>

            </button>

          );

        })}

      </div>

      <div
        className="
          mt-8
          rounded-2xl
          bg-gradient-to-br
          from-blue-600
          to-indigo-700
          p-6
        "
      >

        <h4 className="text-lg font-bold">

          Need Help?

        </h4>

        <p className="mt-3 text-blue-100 leading-7">

          Ask Wonder AI any question about this course,
          solve problems instantly and get personalized
          explanations while you learn.

        </p>

        <button
          className="
            mt-6
            w-full
            rounded-xl
            bg-white
            py-3
            font-bold
            text-slate-900
            hover:scale-[1.02]
            transition
          "
        >

          Open AI Tutor

        </button>

      </div>

    </div>
  );
};

export default CourseNav;