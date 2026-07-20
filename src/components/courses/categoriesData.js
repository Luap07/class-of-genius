import {
  Atom,
  Laptop,
  Briefcase,
  Palette,
  Globe,
  HeartPulse,
  GraduationCap,
} from "lucide-react";

export const categories = [
  {
    id: "science",
    title: "Science",
    description:
      "Master Physics, Chemistry, Biology and Mathematics with interactive learning.",
    icon: Atom,
    color: "from-cyan-500 to-blue-600",
    courses: "120+",
    students: "18K+",
    ai: true,
    labs: true,
    subjects: [
      "Physics",
      "Chemistry",
      "Biology",
      "Mathematics",
    ],
  },

  {
    id: "technology",
    title: "Technology",
    description:
      "Programming, Artificial Intelligence, Cyber Security and Cloud Computing.",
    icon: Laptop,
    color: "from-indigo-500 to-blue-600",
    courses: "95+",
    students: "14K+",
    ai: true,
    labs: false,
    subjects: [
      "Programming",
      "Artificial Intelligence",
      "Cyber Security",
      "Cloud Computing",
    ],
  },

  {
    id: "business",
    title: "Business",
    description:
      "Accounting, Finance, Entrepreneurship, Marketing and Business Management.",
    icon: Briefcase,
    color: "from-emerald-500 to-green-600",
    courses: "82+",
    students: "11K+",
    ai: true,
    labs: false,
    subjects: [
      "Accounting",
      "Finance",
      "Marketing",
      "Management",
    ],
  },

  {
    id: "arts",
    title: "Arts",
    description:
      "Creative Arts, Literature, Music, Design and Digital Creativity.",
    icon: Palette,
    color: "from-pink-500 to-rose-600",
    courses: "70+",
    students: "8K+",
    ai: false,
    labs: false,
    subjects: [
      "Design",
      "Literature",
      "Music",
      "Creative Arts",
    ],
  },

  {
    id: "geography",
    title: "Geography",
    description:
      "Earth Science, GIS, Climate Change and Environmental Studies.",
    icon: Globe,
    color: "from-teal-500 to-cyan-600",
    courses: "45+",
    students: "5K+",
    ai: false,
    labs: true,
    subjects: [
      "GIS",
      "Climate",
      "Environment",
      "Earth Science",
    ],
  },

  {
    id: "health",
    title: "Health",
    description:
      "Medicine, Anatomy, Nursing, Pharmacy and Public Health.",
    icon: HeartPulse,
    color: "from-red-500 to-orange-600",
    courses: "88+",
    students: "13K+",
    ai: true,
    labs: true,
    subjects: [
      "Medicine",
      "Anatomy",
      "Nursing",
      "Public Health",
    ],
  },

  {
    id: "university",
    title: "University",
    description:
      "Engineering, Computer Science, Law, Medicine and Degree Programmes.",
    icon: GraduationCap,
    color: "from-yellow-500 to-amber-600",
    courses: "250+",
    students: "32K+",
    ai: true,
    labs: true,
    subjects: [
      "Engineering",
      "Computer Science",
      "Law",
      "Medicine",
    ],
  },
];