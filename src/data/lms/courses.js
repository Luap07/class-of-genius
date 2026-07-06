// src/data/courses.js

const courses = [
  {
    id: 1,
    title: "Physics",
    category: "Science",
    instructor: "ClassOfGenius",
    image: "",
    description:
      "Master mechanics, electricity, waves, optics, modern physics, and practical applications through interactive lessons.",

    duration: "18 Hours",
    lessons: 48,
    students: "24,500",
    rating: 4.9,
    progress: 72,

    color: "from-blue-600 to-cyan-500",

    modules: [
      "Mechanics",
      "Heat Energy",
      "Waves",
      "Electricity",
      "Magnetism",
      "Modern Physics",
    ],
  },

  {
    id: 2,
    title: "Chemistry",
    category: "Science",
    instructor: "ClassOfGenius",
    image: "",
    description:
      "Study atoms, molecules, reactions, organic chemistry, and laboratory experiments.",

    duration: "20 Hours",
    lessons: 55,
    students: "18,900",
    rating: 4.8,
    progress: 41,

    color: "from-emerald-500 to-green-600",

    modules: [
      "Atomic Structure",
      "Chemical Bonding",
      "Organic Chemistry",
      "Electrochemistry",
      "Equilibrium",
      "Titration",
    ],
  },

  {
    id: 3,
    title: "Biology",
    category: "Science",
    instructor: "ClassOfGenius",
    image: "",
    description:
      "Explore living organisms, genetics, ecology, evolution, and human physiology.",

    duration: "17 Hours",
    lessons: 46,
    students: "17,300",
    rating: 4.9,
    progress: 63,

    color: "from-green-500 to-lime-500",

    modules: [
      "Cell Biology",
      "Genetics",
      "Ecology",
      "Evolution",
      "Human Anatomy",
      "Plant Biology",
    ],
  },

  {
    id: 4,
    title: "Mathematics",
    category: "Mathematics",
    instructor: "ClassOfGenius",
    image: "",
    description:
      "Develop strong mathematical skills through algebra, calculus, geometry, and statistics.",

    duration: "25 Hours",
    lessons: 62,
    students: "29,100",
    rating: 5.0,
    progress: 81,

    color: "from-purple-600 to-pink-600",

    modules: [
      "Algebra",
      "Calculus",
      "Trigonometry",
      "Geometry",
      "Statistics",
      "Probability",
    ],
  },

  {
    id: 5,
    title: "English Language",
    category: "Languages",
    instructor: "ClassOfGenius",
    image: "",
    description:
      "Improve grammar, vocabulary, comprehension, essay writing, and communication skills.",

    duration: "15 Hours",
    lessons: 39,
    students: "15,800",
    rating: 4.8,
    progress: 56,

    color: "from-orange-500 to-red-500",

    modules: [
      "Grammar",
      "Comprehension",
      "Essay Writing",
      "Vocabulary",
      "Oral English",
    ],
  },

  {
    id: 6,
    title: "Computer Science",
    category: "Technology",
    instructor: "ClassOfGenius",
    image: "",
    description:
      "Learn programming, algorithms, databases, networking, cybersecurity, and AI fundamentals.",

    duration: "30 Hours",
    lessons: 75,
    students: "34,000",
    rating: 5.0,
    progress: 15,

    color: "from-indigo-600 to-blue-600",

    modules: [
      "Programming",
      "Algorithms",
      "Databases",
      "Networking",
      "Cybersecurity",
      "Artificial Intelligence",
    ],
  },
];

export default courses;