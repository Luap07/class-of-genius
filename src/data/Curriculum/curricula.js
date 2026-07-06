// ===============================================
// SCHOLIQ GLOBAL CURRICULA DATABASE
// Part 1 — Africa
// ===============================================

const curricula = [

  // ===============================================
  // 🇳🇬 NIGERIA
  // ===============================================

  {
    id: 1,
    country: "Nigeria",
    flag: "🇳🇬",
    curriculum: "NERDC Early Childhood Care Curriculum",
    level: "Early Childhood",
    authority: "NERDC",
    grades: ["Nursery 1","Nursery 2","Kindergarten"],
    examination: null
  },
  {
    id: 2,
    country: "Nigeria",
    flag: "🇳🇬",
    curriculum: "NERDC Basic Education Curriculum",
    level: "Primary",
    authority: "NERDC",
    grades: ["Primary 1","Primary 2","Primary 3","Primary 4","Primary 5","Primary 6"],
    examination: "Common Entrance"
  },
  {
    id: 3,
    country: "Nigeria",
    flag: "🇳🇬",
    curriculum: "NERDC Junior Secondary Curriculum",
    level: "Junior Secondary",
    authority: "NERDC",
    grades: ["JSS1","JSS2","JSS3"],
    examination: "BECE"
  },
  {
    id: 4,
    country: "Nigeria",
    flag: "🇳🇬",
    curriculum: "Senior Secondary School Curriculum",
    level: "Senior Secondary",
    authority: "NERDC",
    grades: ["SS1","SS2","SS3"],
    examination: "WAEC / NECO / NABTEB"
  },
  {
    id: 5,
    country: "Nigeria",
    flag: "🇳🇬",
    curriculum: "Undergraduate Degree Curriculum",
    level: "University",
    authority: "NUC",
    grades: ["100 Level","200 Level","300 Level","400 Level","500 Level"],
    examination: "University Assessment"
  },

  // ===============================================
  // 🇬🇭 GHANA
  // ===============================================

  {
    id: 6,
    country: "Ghana",
    flag: "🇬🇭",
    curriculum: "Standard-Based Curriculum",
    level: "Primary",
    authority: "NaCCA",
    grades: ["Primary 1","Primary 2","Primary 3","Primary 4","Primary 5","Primary 6"],
    examination: null
  },
  {
    id: 7,
    country: "Ghana",
    flag: "🇬🇭",
    curriculum: "Common Core Curriculum",
    level: "Junior High",
    authority: "NaCCA",
    grades: ["JHS1","JHS2","JHS3"],
    examination: "BECE"
  },
  {
    id: 8,
    country: "Ghana",
    flag: "🇬🇭",
    curriculum: "Senior High School Curriculum",
    level: "Senior High",
    authority: "NaCCA",
    grades: ["SHS1","SHS2","SHS3"],
    examination: "WASSCE"
  },
  {
    id: 9,
    country: "Ghana",
    flag: "🇬🇭",
    curriculum: "University Degree Curriculum",
    level: "University",
    authority: "GTEC",
    grades: ["Level 100","Level 200","Level 300","Level 400"],
    examination: "University Assessment"
  },

  // ===============================================
  // 🇰🇪 KENYA
  // ===============================================

  {
    id: 10,
    country: "Kenya",
    flag: "🇰🇪",
    curriculum: "Competency Based Curriculum",
    level: "Pre-Primary",
    authority: "KICD",
    grades: ["PP1","PP2"],
    examination: null
  },
  {
    id: 11,
    country: "Kenya",
    flag: "🇰🇪",
    curriculum: "Competency Based Curriculum",
    level: "Primary",
    authority: "KICD",
    grades: ["Grade 1","Grade 2","Grade 3","Grade 4","Grade 5","Grade 6"],
    examination: null
  },
  {
    id: 12,
    country: "Kenya",
    flag: "🇰🇪",
    curriculum: "Competency Based Curriculum",
    level: "Junior School",
    authority: "KICD",
    grades: ["Grade 7","Grade 8","Grade 9"],
    examination: null
  },
  {
    id: 13,
    country: "Kenya",
    flag: "🇰🇪",
    curriculum: "Competency Based Curriculum",
    level: "Senior School",
    authority: "KICD",
    grades: ["Grade 10","Grade 11","Grade 12"],
    examination: "KPSEA / KJSEA"
  },
  {
    id: 14,
    country: "Kenya",
    flag: "🇰🇪",
    curriculum: "University Curriculum",
    level: "University",
    authority: "CUE",
    grades: ["Year 1","Year 2","Year 3","Year 4"],
    examination: "University Assessment"
  },

  // ===============================================
  // 🇿🇦 SOUTH AFRICA
  // ===============================================

  {
    id: 15,
    country: "South Africa",
    flag: "🇿🇦",
    curriculum: "CAPS Curriculum",
    level: "Primary",
    authority: "DBE",
    grades: ["Grade R","Grade 1","Grade 2","Grade 3","Grade 4","Grade 5","Grade 6","Grade 7"],
    examination: null
  },
  {
    id: 16,
    country: "South Africa",
    flag: "🇿🇦",
    curriculum: "CAPS Curriculum",
    level: "Secondary",
    authority: "DBE",
    grades: ["Grade 8","Grade 9","Grade 10","Grade 11","Grade 12"],
    examination: "National Senior Certificate"
  },
  {
    id: 17,
    country: "South Africa",
    flag: "🇿🇦",
    curriculum: "University Curriculum",
    level: "University",
    authority: "DHET",
    grades: ["Year 1","Year 2","Year 3","Year 4"],
    examination: "University Assessment"
  },

  // ===============================================
  // 🇪🇬 EGYPT
  // ===============================================

  {
    id: 18,
    country: "Egypt",
    flag: "🇪🇬",
    curriculum: "Egyptian National Curriculum",
    level: "Primary",
    authority: "Ministry of Education",
    grades: ["Grade 1","Grade 2","Grade 3","Grade 4","Grade 5","Grade 6"],
    examination: null
  },
  {
    id: 19,
    country: "Egypt",
    flag: "🇪🇬",
    curriculum: "Egyptian National Curriculum",
    level: "Secondary",
    authority: "Ministry of Education",
    grades: ["Grade 10","Grade 11","Grade 12"],
    examination: "Thanaweya Amma"
  },
  {
    id: 20,
    country: "Egypt",
    flag: "🇪🇬",
    curriculum: "University Curriculum",
    level: "University",
    authority: "Supreme Council of Universities",
    grades: ["Year 1","Year 2","Year 3","Year 4"],
    examination: "University Assessment"
  },
  // ===============================================
// PART 2 — AFRICA
// Uganda → Mauritius
// ===============================================

// 🇺🇬 UGANDA
{
  id: 21,
  country: "Uganda",
  flag: "🇺🇬",
  curriculum: "Uganda Competency-Based Lower Secondary Curriculum",
  level: "Secondary",
  authority: "NCDC",
  grades: ["S1","S2","S3","S4"],
  examination: "UCE"
},
{
  id: 22,
  country: "Uganda",
  flag: "🇺🇬",
  curriculum: "Uganda Primary Curriculum",
  level: "Primary",
  authority: "NCDC",
  grades: ["P1","P2","P3","P4","P5","P6","P7"],
  examination: "PLE"
},
{
  id: 23,
  country: "Uganda",
  flag: "🇺🇬",
  curriculum: "University Degree Curriculum",
  level: "University",
  authority: "NCHE",
  grades: ["Year 1","Year 2","Year 3","Year 4"],
  examination: "University Assessment"
},

// 🇹🇿 TANZANIA
{
  id: 24,
  country: "Tanzania",
  flag: "🇹🇿",
  curriculum: "Tanzania Primary Education Curriculum",
  level: "Primary",
  authority: "TIE",
  grades: ["Standard I","Standard II","Standard III","Standard IV","Standard V","Standard VI","Standard VII"],
  examination: "PSLE"
},
{
  id: 25,
  country: "Tanzania",
  flag: "🇹🇿",
  curriculum: "Ordinary Secondary Curriculum",
  level: "Secondary",
  authority: "TIE",
  grades: ["Form I","Form II","Form III","Form IV"],
  examination: "CSEE"
},
{
  id: 26,
  country: "Tanzania",
  flag: "🇹🇿",
  curriculum: "Advanced Level Curriculum",
  level: "College",
  authority: "TIE",
  grades: ["Form V","Form VI"],
  examination: "ACSEE"
},

// 🇷🇼 RWANDA
{
  id: 27,
  country: "Rwanda",
  flag: "🇷🇼",
  curriculum: "Competence-Based Curriculum",
  level: "Primary",
  authority: "REB",
  grades: ["P1","P2","P3","P4","P5","P6"],
  examination: null
},
{
  id: 28,
  country: "Rwanda",
  flag: "🇷🇼",
  curriculum: "Competence-Based Curriculum",
  level: "Secondary",
  authority: "REB",
  grades: ["S1","S2","S3","S4","S5","S6"],
  examination: "National Examination"
},
{
  id: 29,
  country: "Rwanda",
  flag: "🇷🇼",
  curriculum: "University Curriculum",
  level: "University",
  authority: "HEC",
  grades: ["Year 1","Year 2","Year 3","Year 4"],
  examination: "University Assessment"
},

// 🇿🇲 ZAMBIA
{
  id: 30,
  country: "Zambia",
  flag: "🇿🇲",
  curriculum: "Zambian Primary Curriculum",
  level: "Primary",
  authority: "Ministry of Education",
  grades: ["Grade 1","Grade 2","Grade 3","Grade 4","Grade 5","Grade 6","Grade 7"],
  examination: null
},
{
  id: 31,
  country: "Zambia",
  flag: "🇿🇲",
  curriculum: "Zambian Secondary Curriculum",
  level: "Secondary",
  authority: "Ministry of Education",
  grades: ["Grade 8","Grade 9","Grade 10","Grade 11","Grade 12"],
  examination: "ECZ"
},
{
  id: 32,
  country: "Zambia",
  flag: "🇿🇲",
  curriculum: "University Degree Curriculum",
  level: "University",
  authority: "HEA",
  grades: ["Year 1","Year 2","Year 3","Year 4"],
  examination: "University Assessment"
},

// 🇿🇼 ZIMBABWE
{
  id: 33,
  country: "Zimbabwe",
  flag: "🇿🇼",
  curriculum: "Zimbabwe Heritage-Based Curriculum",
  level: "Primary",
  authority: "MoPSE",
  grades: ["Grade 1","Grade 2","Grade 3","Grade 4","Grade 5","Grade 6","Grade 7"],
  examination: null
},
{
  id: 34,
  country: "Zimbabwe",
  flag: "🇿🇼",
  curriculum: "Zimbabwe Heritage-Based Curriculum",
  level: "Secondary",
  authority: "MoPSE",
  grades: ["Form 1","Form 2","Form 3","Form 4","Form 5","Form 6"],
  examination: "ZIMSEC"
},
{
  id: 35,
  country: "Zimbabwe",
  flag: "🇿🇼",
  curriculum: "University Curriculum",
  level: "University",
  authority: "ZIMCHE",
  grades: ["Year 1","Year 2","Year 3","Year 4"],
  examination: "University Assessment"
},

// 🇧🇼 BOTSWANA
{
  id: 36,
  country: "Botswana",
  flag: "🇧🇼",
  curriculum: "Botswana Basic Education Curriculum",
  level: "Primary",
  authority: "Ministry of Child Welfare and Basic Education",
  grades: ["Standard 1","Standard 2","Standard 3","Standard 4","Standard 5","Standard 6","Standard 7"],
  examination: "PSLE"
},
{
  id: 37,
  country: "Botswana",
  flag: "🇧🇼",
  curriculum: "Botswana Secondary Curriculum",
  level: "Secondary",
  authority: "BEC",
  grades: ["Form 1","Form 2","Form 3","Form 4","Form 5"],
  examination: "BGCSE"
},

// 🇳🇦 NAMIBIA
{
  id: 38,
  country: "Namibia",
  flag: "🇳🇦",
  curriculum: "National Curriculum for Basic Education",
  level: "Primary",
  authority: "Ministry of Education",
  grades: ["Grade 1","Grade 2","Grade 3","Grade 4","Grade 5","Grade 6","Grade 7"],
  examination: null
},
{
  id: 39,
  country: "Namibia",
  flag: "🇳🇦",
  curriculum: "National Curriculum for Basic Education",
  level: "Secondary",
  authority: "Ministry of Education",
  grades: ["Grade 8","Grade 9","Grade 10","Grade 11","Grade 12"],
  examination: "NSSCO / NSSCAS"
},

// 🇪🇹 ETHIOPIA
{
  id: 40,
  country: "Ethiopia",
  flag: "🇪🇹",
  curriculum: "Ethiopian National Curriculum",
  level: "Primary",
  authority: "Ministry of Education",
  grades: ["Grade 1","Grade 2","Grade 3","Grade 4","Grade 5","Grade 6","Grade 7","Grade 8"],
  examination: null
},
{
  id: 41,
  country: "Ethiopia",
  flag: "🇪🇹",
  curriculum: "Ethiopian National Curriculum",
  level: "Secondary",
  authority: "Ministry of Education",
  grades: ["Grade 9","Grade 10","Grade 11","Grade 12"],
  examination: "National Examination"
},

// 🇲🇦 MOROCCO
{
  id: 42,
  country: "Morocco",
  flag: "🇲🇦",
  curriculum: "Moroccan National Curriculum",
  level: "Primary",
  authority: "Ministry of National Education",
  grades: ["Grade 1","Grade 2","Grade 3","Grade 4","Grade 5","Grade 6"],
  examination: null
},
{
  id: 43,
  country: "Morocco",
  flag: "🇲🇦",
  curriculum: "Moroccan National Curriculum",
  level: "Secondary",
  authority: "Ministry of National Education",
  grades: ["Year 1","Year 2","Year 3"],
  examination: "Baccalauréat"
},

// 🇲🇺 MAURITIUS
{
  id: 44,
  country: "Mauritius",
  flag: "🇲🇺",
  curriculum: "Mauritius Nine-Year Continuous Basic Education",
  level: "Primary",
  authority: "Ministry of Education",
  grades: ["Grade 1","Grade 2","Grade 3","Grade 4","Grade 5","Grade 6"],
  examination: "PSAC"
},
{
  id: 45,
  country: "Mauritius",
  flag: "🇲🇺",
  curriculum: "National Secondary Curriculum",
  level: "Secondary",
  authority: "Ministry of Education",
  grades: ["Grade 7","Grade 8","Grade 9","Grade 10","Grade 11","Grade 12","Grade 13"],
  examination: "School Certificate / Higher School Certificate"
},
    // =======================================================
// AFRICA
// =======================================================

{
  id: "nigeria",
  country: "Nigeria",
  flag: "🇳🇬",
  curriculum: "Nigerian National Curriculum",

  levels: [
    {
      id: "nursery",
      name: "Early Childhood",
      age: "3-5 years",
      years: ["Nursery 1", "Nursery 2", "Kindergarten"],
    },
    {
      id: "primary",
      name: "Primary Education",
      age: "6-11 years",
      years: [
        "Primary 1",
        "Primary 2",
        "Primary 3",
        "Primary 4",
        "Primary 5",
        "Primary 6",
      ],
    },
    {
      id: "junior",
      name: "Junior Secondary School",
      age: "12-14 years",
      years: [
        "JSS 1",
        "JSS 2",
        "JSS 3",
      ],
    },
    {
      id: "senior",
      name: "Senior Secondary School",
      age: "15-17 years",
      years: [
        "SSS 1",
        "SSS 2",
        "SSS 3",
      ],
    },
    {
      id: "tertiary",
      name: "Higher Education",
      age: "18+",
      years: [
        "100 Level",
        "200 Level",
        "300 Level",
        "400 Level",
        "500 Level",
      ],
    },
  ],
},

{
  id: "ghana",
  country: "Ghana",
  flag: "🇬🇭",
  curriculum: "NaCCA Curriculum",

  levels: [
    {
      id: "kindergarten",
      name: "Kindergarten",
      age: "4-5",
      years: ["KG1", "KG2"],
    },
    {
      id: "primary",
      name: "Primary School",
      age: "6-11",
      years: [
        "Primary 1",
        "Primary 2",
        "Primary 3",
        "Primary 4",
        "Primary 5",
        "Primary 6",
      ],
    },
    {
      id: "jhs",
      name: "Junior High School",
      age: "12-14",
      years: [
        "JHS 1",
        "JHS 2",
        "JHS 3",
      ],
    },
    {
      id: "shs",
      name: "Senior High School",
      age: "15-17",
      years: [
        "SHS 1",
        "SHS 2",
        "SHS 3",
      ],
    },
    {
      id: "university",
      name: "University",
      age: "18+",
      years: [
        "Level 100",
        "Level 200",
        "Level 300",
        "Level 400",
      ],
    },
  ],
},

{
  id: "kenya",
  country: "Kenya",
  flag: "🇰🇪",
  curriculum: "Competency Based Curriculum (CBC)",

  levels: [
    {
      id: "pre-primary",
      name: "Pre-Primary",
      age: "4-5",
      years: [
        "PP1",
        "PP2",
      ],
    },
    {
      id: "lower-primary",
      name: "Lower Primary",
      age: "6-8",
      years: [
        "Grade 1",
        "Grade 2",
        "Grade 3",
      ],
    },
    {
      id: "upper-primary",
      name: "Upper Primary",
      age: "9-11",
      years: [
        "Grade 4",
        "Grade 5",
        "Grade 6",
      ],
    },
    {
      id: "junior-school",
      name: "Junior School",
      age: "12-14",
      years: [
        "Grade 7",
        "Grade 8",
        "Grade 9",
      ],
    },
    {
      id: "senior-school",
      name: "Senior School",
      age: "15-17",
      years: [
        "Grade 10",
        "Grade 11",
        "Grade 12",
      ],
    },
    {
      id: "university",
      name: "University",
      age: "18+",
      years: [
        "Year 1",
        "Year 2",
        "Year 3",
        "Year 4",
      ],
    },
  ],
  
},
// =======================================================
// SOUTH AFRICA
// =======================================================

{
  id: "south-africa",
  country: "South Africa",
  flag: "🇿🇦",
  curriculum: "CAPS (Curriculum and Assessment Policy Statement)",

  levels: [
    {
      id: "grade-r",
      name: "Grade R",
      age: "5-6",
      years: ["Grade R"],
    },
    {
      id: "foundation",
      name: "Foundation Phase",
      age: "6-9",
      years: [
        "Grade 1",
        "Grade 2",
        "Grade 3",
      ],
    },
    {
      id: "intermediate",
      name: "Intermediate Phase",
      age: "9-12",
      years: [
        "Grade 4",
        "Grade 5",
        "Grade 6",
      ],
    },
    {
      id: "senior",
      name: "Senior Phase",
      age: "12-15",
      years: [
        "Grade 7",
        "Grade 8",
        "Grade 9",
      ],
    },
    {
      id: "fet",
      name: "Further Education and Training",
      age: "15-18",
      years: [
        "Grade 10",
        "Grade 11",
        "Grade 12",
      ],
    },
    {
      id: "university",
      name: "Higher Education",
      age: "18+",
      years: [
        "First Year",
        "Second Year",
        "Third Year",
        "Fourth Year",
      ],
    },
  ],
},

// =======================================================
// EGYPT
// =======================================================

{
  id: "egypt",
  country: "Egypt",
  flag: "🇪🇬",
  curriculum: "Egyptian National Curriculum",

  levels: [
    {
      id: "kindergarten",
      name: "Kindergarten",
      age: "4-5",
      years: [
        "KG1",
        "KG2",
      ],
    },
    {
      id: "primary",
      name: "Primary Education",
      age: "6-11",
      years: [
        "Grade 1",
        "Grade 2",
        "Grade 3",
        "Grade 4",
        "Grade 5",
        "Grade 6",
      ],
    },
    {
      id: "preparatory",
      name: "Preparatory Stage",
      age: "12-14",
      years: [
        "Grade 7",
        "Grade 8",
        "Grade 9",
      ],
    },
    {
      id: "secondary",
      name: "Secondary Education",
      age: "15-17",
      years: [
        "Grade 10",
        "Grade 11",
        "Grade 12",
      ],
    },
    {
      id: "university",
      name: "University",
      age: "18+",
      years: [
        "Year 1",
        "Year 2",
        "Year 3",
        "Year 4",
      ],
    },
  ],
},

// =======================================================
// MOROCCO
// =======================================================

{
  id: "morocco",
  country: "Morocco",
  flag: "🇲🇦",
  curriculum: "Moroccan National Curriculum",

  levels: [
    {
      id: "preschool",
      name: "Preschool",
      age: "4-5",
      years: [
        "Preschool 1",
        "Preschool 2",
      ],
    },
    {
      id: "primary",
      name: "Primary School",
      age: "6-11",
      years: [
        "Grade 1",
        "Grade 2",
        "Grade 3",
        "Grade 4",
        "Grade 5",
        "Grade 6",
      ],
    },
    {
      id: "lower-secondary",
      name: "Lower Secondary",
      age: "12-14",
      years: [
        "Year 1",
        "Year 2",
        "Year 3",
      ],
    },
    {
      id: "upper-secondary",
      name: "Upper Secondary",
      age: "15-17",
      years: [
        "Year 1",
        "Year 2",
        "Year 3",
      ],
    },
    {
      id: "university",
      name: "University",
      age: "18+",
      years: [
        "Licence Year 1",
        "Licence Year 2",
        "Licence Year 3",
        "Master",
      ],
    },
  ],
},

// =======================================================
// ETHIOPIA
// =======================================================

{
  id: "ethiopia",
  country: "Ethiopia",
  flag: "🇪🇹",
  curriculum: "Federal Democratic Republic of Ethiopia Curriculum",

  levels: [
    {
      id: "kindergarten",
      name: "Kindergarten",
      age: "4-6",
      years: [
        "KG1",
        "KG2",
      ],
    },
    {
      id: "primary-first",
      name: "Primary First Cycle",
      age: "7-10",
      years: [
        "Grade 1",
        "Grade 2",
        "Grade 3",
        "Grade 4",
      ],
    },
    {
      id: "primary-second",
      name: "Primary Second Cycle",
      age: "11-14",
      years: [
        "Grade 5",
        "Grade 6",
        "Grade 7",
        "Grade 8",
      ],
    },
    {
      id: "secondary",
      name: "Secondary School",
      age: "15-16",
      years: [
        "Grade 9",
        "Grade 10",
      ],
    },
    {
      id: "preparatory",
      name: "Preparatory School",
      age: "17-18",
      years: [
        "Grade 11",
        "Grade 12",
      ],
    },
    {
      id: "university",
      name: "Higher Education",
      age: "18+",
      years: [
        "Year 1",
        "Year 2",
        "Year 3",
        "Year 4",
      ],
    },
  ],
},

// =======================================================
// UNITED KINGDOM
// =======================================================

{
  id: "united-kingdom",
  country: "United Kingdom",
  flag: "🇬🇧",
  curriculum: "National Curriculum for England",

  levels: [
    {
      id: "early-years",
      name: "Early Years Foundation Stage (EYFS)",
      age: "3-5",
      years: [
        "Nursery",
        "Reception",
      ],
    },
    {
      id: "ks1",
      name: "Key Stage 1",
      age: "5-7",
      years: [
        "Year 1",
        "Year 2",
      ],
    },
    {
      id: "ks2",
      name: "Key Stage 2",
      age: "7-11",
      years: [
        "Year 3",
        "Year 4",
        "Year 5",
        "Year 6",
      ],
    },
    {
      id: "ks3",
      name: "Key Stage 3",
      age: "11-14",
      years: [
        "Year 7",
        "Year 8",
        "Year 9",
      ],
    },
    {
      id: "ks4",
      name: "Key Stage 4 (GCSE)",
      age: "14-16",
      years: [
        "Year 10",
        "Year 11",
      ],
    },
    {
      id: "ks5",
      name: "Key Stage 5 (A-Level)",
      age: "16-18",
      years: [
        "Year 12",
        "Year 13",
      ],
    },
    {
      id: "university",
      name: "Higher Education",
      age: "18+",
      years: [
        "Year 1",
        "Year 2",
        "Year 3",
        "Year 4",
      ],
    },
  ],
},

// =======================================================
// FRANCE
// =======================================================

{
  id: "france",
  country: "France",
  flag: "🇫🇷",
  curriculum: "French National Curriculum",

  levels: [
    {
      id: "maternelle",
      name: "École Maternelle",
      age: "3-5",
      years: [
        "Petite Section",
        "Moyenne Section",
        "Grande Section",
      ],
    },
    {
      id: "primaire",
      name: "École Élémentaire",
      age: "6-10",
      years: [
        "CP",
        "CE1",
        "CE2",
        "CM1",
        "CM2",
      ],
    },
    {
      id: "college",
      name: "Collège",
      age: "11-14",
      years: [
        "6e",
        "5e",
        "4e",
        "3e",
      ],
    },
    {
      id: "lycee",
      name: "Lycée",
      age: "15-17",
      years: [
        "Seconde",
        "Première",
        "Terminale",
      ],
    },
    {
      id: "university",
      name: "Higher Education",
      age: "18+",
      years: [
        "Licence 1",
        "Licence 2",
        "Licence 3",
        "Master",
      ],
    },
  ],
},

// =======================================================
// GERMANY
// =======================================================

{
  id: "germany",
  country: "Germany",
  flag: "🇩🇪",
  curriculum: "German State Curriculum (Bildungsplan)",

  levels: [
    {
      id: "kindergarten",
      name: "Kindergarten",
      age: "3-6",
      years: [
        "Kindergarten",
      ],
    },
    {
      id: "grundschule",
      name: "Grundschule",
      age: "6-10",
      years: [
        "Grade 1",
        "Grade 2",
        "Grade 3",
        "Grade 4",
      ],
    },
    {
      id: "secondary",
      name: "Secondary School",
      age: "10-18",
      years: [
        "Grade 5",
        "Grade 6",
        "Grade 7",
        "Grade 8",
        "Grade 9",
        "Grade 10",
        "Grade 11",
        "Grade 12",
      ],
    },
    {
      id: "abitur",
      name: "Abitur",
      age: "17-19",
      years: [
        "Year 12",
        "Year 13",
      ],
    },
    {
      id: "university",
      name: "University",
      age: "18+",
      years: [
        "Bachelor Year 1",
        "Bachelor Year 2",
        "Bachelor Year 3",
        "Master",
      ],
    },
  ],
},

// =======================================================
// ITALY
// =======================================================

{
  id: "italy",
  country: "Italy",
  flag: "🇮🇹",
  curriculum: "Italian National Curriculum",

  levels: [
    {
      id: "preschool",
      name: "Scuola dell'Infanzia",
      age: "3-5",
      years: [
        "Year 1",
        "Year 2",
        "Year 3",
      ],
    },
    {
      id: "primary",
      name: "Primary School",
      age: "6-10",
      years: [
        "Grade 1",
        "Grade 2",
        "Grade 3",
        "Grade 4",
        "Grade 5",
      ],
    },
    {
      id: "lower-secondary",
      name: "Lower Secondary School",
      age: "11-13",
      years: [
        "Grade 6",
        "Grade 7",
        "Grade 8",
      ],
    },
    {
      id: "upper-secondary",
      name: "Upper Secondary School",
      age: "14-18",
      years: [
        "Year 1",
        "Year 2",
        "Year 3",
        "Year 4",
        "Year 5",
      ],
    },
    {
      id: "university",
      name: "University",
      age: "19+",
      years: [
        "Bachelor Year 1",
        "Bachelor Year 2",
        "Bachelor Year 3",
        "Master",
      ],
    },
  ],
},
    // =======================================================
// SPAIN
// =======================================================

{
  id: "spain",
  country: "Spain",
  flag: "🇪🇸",
  curriculum: "Spanish National Curriculum (LOMLOE)",

  levels: [
    {
      id: "infantil",
      name: "Educación Infantil",
      age: "3-5",
      years: [
        "Year 1",
        "Year 2",
        "Year 3",
      ],
    },
    {
      id: "primaria",
      name: "Educación Primaria",
      age: "6-11",
      years: [
        "Grade 1",
        "Grade 2",
        "Grade 3",
        "Grade 4",
        "Grade 5",
        "Grade 6",
      ],
    },
    {
      id: "eso",
      name: "Educación Secundaria Obligatoria (ESO)",
      age: "12-15",
      years: [
        "ESO 1",
        "ESO 2",
        "ESO 3",
        "ESO 4",
      ],
    },
    {
      id: "bachillerato",
      name: "Bachillerato",
      age: "16-17",
      years: [
        "Year 1",
        "Year 2",
      ],
    },
    {
      id: "university",
      name: "University",
      age: "18+",
      years: [
        "Bachelor Year 1",
        "Bachelor Year 2",
        "Bachelor Year 3",
        "Bachelor Year 4",
      ],
    },
  ],
},

// =======================================================
// NETHERLANDS
// =======================================================

{
  id: "netherlands",
  country: "Netherlands",
  flag: "🇳🇱",
  curriculum: "Dutch National Curriculum",

  levels: [
    {
      id: "kindergarten",
      name: "Kindergarten",
      age: "4-5",
      years: [
        "Group 1",
        "Group 2",
      ],
    },
    {
      id: "primary",
      name: "Primary Education",
      age: "6-12",
      years: [
        "Group 3",
        "Group 4",
        "Group 5",
        "Group 6",
        "Group 7",
        "Group 8",
      ],
    },
    {
      id: "secondary",
      name: "Secondary Education",
      age: "12-18",
      years: [
        "Year 1",
        "Year 2",
        "Year 3",
        "Year 4",
        "Year 5",
        "Year 6",
      ],
    },
    {
      id: "university",
      name: "Higher Education",
      age: "18+",
      years: [
        "Bachelor Year 1",
        "Bachelor Year 2",
        "Bachelor Year 3",
        "Master",
      ],
    },
  ],
},

// =======================================================
// SWEDEN
// =======================================================

{
  id: "sweden",
  country: "Sweden",
  flag: "🇸🇪",
  curriculum: "Swedish National Curriculum (Lgr22)",

  levels: [
    {
      id: "preschool",
      name: "Preschool",
      age: "1-5",
      years: [
        "Preschool",
      ],
    },
    {
      id: "grundskola",
      name: "Compulsory School",
      age: "6-15",
      years: [
        "Grade 1",
        "Grade 2",
        "Grade 3",
        "Grade 4",
        "Grade 5",
        "Grade 6",
        "Grade 7",
        "Grade 8",
        "Grade 9",
      ],
    },
    {
      id: "gymnasium",
      name: "Upper Secondary School",
      age: "16-18",
      years: [
        "Year 1",
        "Year 2",
        "Year 3",
      ],
    },
    {
      id: "university",
      name: "University",
      age: "18+",
      years: [
        "Bachelor Year 1",
        "Bachelor Year 2",
        "Bachelor Year 3",
        "Master",
      ],
    },
  ],
},

// =======================================================
// NORWAY
// =======================================================

{
  id: "norway",
  country: "Norway",
  flag: "🇳🇴",
  curriculum: "Norwegian National Curriculum (LK20)",

  levels: [
    {
      id: "kindergarten",
      name: "Kindergarten",
      age: "1-5",
      years: [
        "Kindergarten",
      ],
    },
    {
      id: "primary",
      name: "Primary School",
      age: "6-12",
      years: [
        "Grade 1",
        "Grade 2",
        "Grade 3",
        "Grade 4",
        "Grade 5",
        "Grade 6",
        "Grade 7",
      ],
    },
    {
      id: "lower-secondary",
      name: "Lower Secondary",
      age: "13-15",
      years: [
        "Grade 8",
        "Grade 9",
        "Grade 10",
      ],
    },
    {
      id: "upper-secondary",
      name: "Upper Secondary",
      age: "16-18",
      years: [
        "VG1",
        "VG2",
        "VG3",
      ],
    },
    {
      id: "university",
      name: "Higher Education",
      age: "19+",
      years: [
        "Bachelor Year 1",
        "Bachelor Year 2",
        "Bachelor Year 3",
        "Master",
      ],
    },
  ],
},
    // =======================================================
// UNITED STATES
// =======================================================

{
  id: "united-states",
  country: "United States",
  flag: "🇺🇸",
  curriculum: "Common Core State Standards (CCSS)",

  levels: [
    {
      id: "pre-k",
      name: "Pre-Kindergarten",
      age: "3-4",
      years: [
        "Pre-K 3",
        "Pre-K 4",
      ],
    },
    {
      id: "elementary",
      name: "Elementary School",
      age: "5-10",
      years: [
        "Kindergarten",
        "Grade 1",
        "Grade 2",
        "Grade 3",
        "Grade 4",
        "Grade 5",
      ],
    },
    {
      id: "middle",
      name: "Middle School",
      age: "11-13",
      years: [
        "Grade 6",
        "Grade 7",
        "Grade 8",
      ],
    },
    {
      id: "high",
      name: "High School",
      age: "14-18",
      years: [
        "Grade 9 (Freshman)",
        "Grade 10 (Sophomore)",
        "Grade 11 (Junior)",
        "Grade 12 (Senior)",
      ],
    },
    {
      id: "college",
      name: "College / University",
      age: "18+",
      years: [
        "Freshman",
        "Sophomore",
        "Junior",
        "Senior",
      ],
    },
  ],
},

// =======================================================
// CANADA
// =======================================================

{
  id: "canada",
  country: "Canada",
  flag: "🇨🇦",
  curriculum: "Provincial Curriculum Framework",

  levels: [
    {
      id: "kindergarten",
      name: "Kindergarten",
      age: "4-5",
      years: [
        "Junior Kindergarten",
        "Senior Kindergarten",
      ],
    },
    {
      id: "elementary",
      name: "Elementary School",
      age: "6-13",
      years: [
        "Grade 1",
        "Grade 2",
        "Grade 3",
        "Grade 4",
        "Grade 5",
        "Grade 6",
        "Grade 7",
        "Grade 8",
      ],
    },
    {
      id: "secondary",
      name: "Secondary School",
      age: "14-18",
      years: [
        "Grade 9",
        "Grade 10",
        "Grade 11",
        "Grade 12",
      ],
    },
    {
      id: "college",
      name: "College / University",
      age: "18+",
      years: [
        "Year 1",
        "Year 2",
        "Year 3",
        "Year 4",
      ],
    },
  ],
},

// =======================================================
// MEXICO
// =======================================================

{
  id: "mexico",
  country: "Mexico",
  flag: "🇲🇽",
  curriculum: "Mexican National Curriculum",

  levels: [
    {
      id: "preschool",
      name: "Preschool",
      age: "3-5",
      years: [
        "Year 1",
        "Year 2",
        "Year 3",
      ],
    },
    {
      id: "primary",
      name: "Primary Education",
      age: "6-11",
      years: [
        "Grade 1",
        "Grade 2",
        "Grade 3",
        "Grade 4",
        "Grade 5",
        "Grade 6",
      ],
    },
    {
      id: "secondary",
      name: "Lower Secondary",
      age: "12-14",
      years: [
        "Grade 7",
        "Grade 8",
        "Grade 9",
      ],
    },
    {
      id: "upper-secondary",
      name: "Upper Secondary",
      age: "15-17",
      years: [
        "Grade 10",
        "Grade 11",
        "Grade 12",
      ],
    },
    {
      id: "university",
      name: "University",
      age: "18+",
      years: [
        "Year 1",
        "Year 2",
        "Year 3",
        "Year 4",
      ],
    },
  ],
},
// =======================================================
// INDIA
// =======================================================

{
  id: "india",
  country: "India",
  flag: "🇮🇳",
  curriculum: "National Curriculum Framework (NCF), CBSE & ICSE",

  levels: [
    {
      id: "pre-primary",
      name: "Pre-Primary",
      age: "3-5",
      years: [
        "Nursery",
        "LKG",
        "UKG",
      ],
    },
    {
      id: "primary",
      name: "Primary School",
      age: "6-10",
      years: [
        "Class 1",
        "Class 2",
        "Class 3",
        "Class 4",
        "Class 5",
      ],
    },
    {
      id: "upper-primary",
      name: "Upper Primary",
      age: "11-13",
      years: [
        "Class 6",
        "Class 7",
        "Class 8",
      ],
    },
    {
      id: "secondary",
      name: "Secondary",
      age: "14-15",
      years: [
        "Class 9",
        "Class 10",
      ],
    },
    {
      id: "senior-secondary",
      name: "Senior Secondary",
      age: "16-17",
      years: [
        "Class 11",
        "Class 12",
      ],
    },
    {
      id: "university",
      name: "Higher Education",
      age: "18+",
      years: [
        "Year 1",
        "Year 2",
        "Year 3",
        "Year 4",
      ],
    },
  ],
},

// =======================================================
// CHINA
// =======================================================

{
  id: "china",
  country: "China",
  flag: "🇨🇳",
  curriculum: "National Curriculum Standards",

  levels: [
    {
      id: "kindergarten",
      name: "Kindergarten",
      age: "3-6",
      years: [
        "Junior",
        "Middle",
        "Senior",
      ],
    },
    {
      id: "primary",
      name: "Primary School",
      age: "6-12",
      years: [
        "Grade 1",
        "Grade 2",
        "Grade 3",
        "Grade 4",
        "Grade 5",
        "Grade 6",
      ],
    },
    {
      id: "junior-secondary",
      name: "Junior Secondary",
      age: "12-15",
      years: [
        "Grade 7",
        "Grade 8",
        "Grade 9",
      ],
    },
    {
      id: "senior-secondary",
      name: "Senior Secondary",
      age: "15-18",
      years: [
        "Grade 10",
        "Grade 11",
        "Grade 12",
      ],
    },
    {
      id: "university",
      name: "University",
      age: "18+",
      years: [
        "Year 1",
        "Year 2",
        "Year 3",
        "Year 4",
      ],
    },
  ],
},

// =======================================================
// JAPAN
// =======================================================

{
  id: "japan",
  country: "Japan",
  flag: "🇯🇵",
  curriculum: "Course of Study (MEXT)",

  levels: [
    {
      id: "kindergarten",
      name: "Kindergarten",
      age: "3-5",
      years: [
        "Kindergarten Year 1",
        "Kindergarten Year 2",
        "Kindergarten Year 3",
      ],
    },
    {
      id: "elementary",
      name: "Elementary School",
      age: "6-12",
      years: [
        "Grade 1",
        "Grade 2",
        "Grade 3",
        "Grade 4",
        "Grade 5",
        "Grade 6",
      ],
    },
    {
      id: "lower-secondary",
      name: "Lower Secondary",
      age: "12-15",
      years: [
        "Grade 7",
        "Grade 8",
        "Grade 9",
      ],
    },
    {
      id: "upper-secondary",
      name: "Upper Secondary",
      age: "15-18",
      years: [
        "Grade 10",
        "Grade 11",
        "Grade 12",
      ],
    },
    {
      id: "university",
      name: "University",
      age: "18+",
      years: [
        "Year 1",
        "Year 2",
        "Year 3",
        "Year 4",
      ],
    },
  ],
},

// =======================================================
// SOUTH KOREA
// =======================================================

{
  id: "south-korea",
  country: "South Korea",
  flag: "🇰🇷",
  curriculum: "National Curriculum of Korea",

  levels: [
    {
      id: "kindergarten",
      name: "Kindergarten",
      age: "3-5",
      years: [
        "Year 1",
        "Year 2",
        "Year 3",
      ],
    },
    {
      id: "elementary",
      name: "Elementary School",
      age: "6-12",
      years: [
        "Grade 1",
        "Grade 2",
        "Grade 3",
        "Grade 4",
        "Grade 5",
        "Grade 6",
      ],
    },
    {
      id: "middle-school",
      name: "Middle School",
      age: "12-15",
      years: [
        "Grade 7",
        "Grade 8",
        "Grade 9",
      ],
    },
    {
      id: "high-school",
      name: "High School",
      age: "15-18",
      years: [
        "Grade 10",
        "Grade 11",
        "Grade 12",
      ],
    },
    {
      id: "university",
      name: "University",
      age: "18+",
      years: [
        "Year 1",
        "Year 2",
        "Year 3",
        "Year 4",
      ],
    },
  ],
},

// =========================
// FRANCE
// =========================
{
  id: "fr-primary",
  country: "France",
  flag: "🇫🇷",
  curriculum: "French National Curriculum",
  level: "Primary",
  age: "6–11",
  duration: "5 Years",
  authority: "Ministry of National Education",
  qualification: "Primary Education Certificate",
  grading: "Competency-based Assessment",
  language: "French",
  subjects: [
    "French Language",
    "Mathematics",
    "Science & Technology",
    "History",
    "Geography",
    "Civic Education",
    "Arts",
    "Music",
    "Physical Education",
    "Foreign Languages"
  ]
},

{
  id: "fr-secondary",
  country: "France",
  flag: "🇫🇷",
  curriculum: "Collège & Lycée Curriculum",
  level: "Secondary",
  age: "11–18",
  duration: "7 Years",
  authority: "Ministry of National Education",
  qualification: "Diplôme National du Brevet / Baccalauréat",
  grading: "0–20 Scale",
  language: "French",
  subjects: [
    "French",
    "Mathematics",
    "Physics",
    "Chemistry",
    "Biology",
    "History",
    "Geography",
    "Philosophy",
    "Economics",
    "Foreign Languages",
    "Computer Science",
    "Physical Education"
  ]
},

{
  id: "fr-university",
  country: "France",
  flag: "🇫🇷",
  curriculum: "French Higher Education",
  level: "University",
  age: "18+",
  duration: "Licence (3 yrs), Master (2 yrs), Doctorate (3+ yrs)",
  authority: "French Universities & Ministry of Higher Education",
  qualification: "Licence, Master, Doctorate",
  grading: "0–20 Scale",
  language: "French / English",
  subjects: [
    "Engineering",
    "Medicine",
    "Law",
    "Business",
    "Economics",
    "Arts",
    "Humanities",
    "Computer Science",
    "Education",
    "Architecture",
    "Political Science",
    "Agriculture"
  ]
},
// =========================
// GERMANY
// =========================
{
  id: "de-primary",
  country: "Germany",
  flag: "🇩🇪",
  curriculum: "German Primary School Curriculum (Grundschule)",
  level: "Primary",
  age: "6–10",
  duration: "4 Years",
  authority: "State Ministries of Education (Kultusministerien)",
  qualification: "Primary School Certificate",
  grading: "1–6 Scale (1 = Excellent)",
  language: "German",
  subjects: [
    "German Language",
    "Mathematics",
    "Science",
    "Social Studies",
    "Art",
    "Music",
    "Religious Education / Ethics",
    "Physical Education",
    "English"
  ]
},

{
  id: "de-secondary",
  country: "Germany",
  flag: "🇩🇪",
  curriculum: "Gymnasium / Realschule / Hauptschule",
  level: "Secondary",
  age: "10–18",
  duration: "8 Years",
  authority: "State Ministries of Education",
  qualification: "Abitur / Mittlere Reife",
  grading: "1–6 Scale",
  language: "German",
  subjects: [
    "German",
    "English",
    "Mathematics",
    "Physics",
    "Chemistry",
    "Biology",
    "History",
    "Geography",
    "Economics",
    "Computer Science",
    "Music",
    "Art",
    "Religious Education",
    "Physical Education"
  ]
},

{
  id: "de-university",
  country: "Germany",
  flag: "🇩🇪",
  curriculum: "German Higher Education",
  level: "University",
  age: "18+",
  duration: "Bachelor (3–4 yrs), Master (2 yrs), Doctorate (3–5 yrs)",
  authority: "German Universities",
  qualification: "Bachelor, Master, Doctorate",
  grading: "1.0–5.0 Scale",
  language: "German / English",
  subjects: [
    "Engineering",
    "Medicine",
    "Computer Science",
    "Law",
    "Business Administration",
    "Economics",
    "Architecture",
    "Education",
    "Agriculture",
    "Natural Sciences",
    "Humanities",
    "Social Sciences"
  ]
},

];

export default curricula;