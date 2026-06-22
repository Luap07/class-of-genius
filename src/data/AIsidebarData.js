import {
  Home,
  BookOpen,
  GraduationCap,
  Bot,
  BarChart3,
  Library,
  Settings,
} from "lucide-react";

const AISidebarData = [
  {
    name: "Home",
    icon: Home,
    path: "/",
  },

  {
    name: "Subjects",
    icon: BookOpen,
    children: {
      "Secondary School": [
        "Mathematics",
        "English Language",
        "Physics",
        "Chemistry",
        "Biology",
        "Further Mathematics",
        "Economics",
        "Government",
        "Geography",
      ],
      Languages: ["French", "Yoruba", "Hausa", "Igbo"],
      Others: ["Accounting", "Commerce", "Computer Studies", "CRS", "IRS"],
    },
  },

  {
    name: "Exam Prep",
    icon: GraduationCap,
    children: {
      Exams: [
        "WAEC",
        "NECO",
        "JAMB",
        "JUPEB",
        "IJMB",
        "NABTEB",
        "IELTS",
        "SAT",
        "ACT",
      ],
      Advanced: ["GCSE", "IGCSE", "A-Level", "AP"],
    },
  },

  {
    name: "AI Tutor",
    icon: Bot,
    children: {
      Features: [
        "Ask Anything",
        "Explain Topic",
        "Solve Question",
        "Homework Help",
        "Quiz Generator",
      ],
      Modes: ["Teacher Mode", "Exam Coach", "Revision Mode"],
    },
  },

  {
    name: "Progress",
    icon: BarChart3,
    children: {
      Overview: [
        "Dashboard",
        "Study Time",
        "Lessons Completed",
        "Streak Counter",
      ],
      Analytics: [
        "Strengths",
        "Weaknesses",
        "Exam Readiness",
      ],
    },
  },

  {
    name: "Library",
    icon: Library,
    children: {
      Notes: ["WAEC Notes", "NECO Notes", "JAMB Notes"],
      Resources: ["Past Questions", "Formula Sheets", "Mock Exams"],
      Media: ["Videos", "Audio", "Infographics"],
    },
  },

  {
    name: "Settings",
    icon: Settings,
    children: {
      Account: ["Profile", "Email", "Password"],
      Learning: ["Goal", "Study Hours", "Reminder"],
      AI: ["Voice", "Speed", "Language"],
    },
  },
];

export default AISidebarData;