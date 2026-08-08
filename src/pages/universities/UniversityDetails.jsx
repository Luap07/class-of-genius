import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  MapPin,
  Globe,
  GraduationCap,
  Building2,
  BookOpen,
  ClipboardCheck,
  Wallet,
  Phone,
  Mail,
  CheckCircle2,
} from "lucide-react";

/* =========================================================
   UNIVERSITY DATA
========================================================= */

const universities = {
  unilag: {
    id: "unilag",
    name: "University of Lagos",
    shortName: "UNILAG",
    location: "Akoka, Lagos",
    state: "Lagos",
    type: "Federal University",
    website: "https://unilag.edu.ng",
    image:
      "https://images.unsplash.com/photo-1564981797816-1043664bf78d?auto=format&fit=crop&w=1800&q=95",

    description:
      "The University of Lagos is a leading Nigerian university offering a broad range of undergraduate and postgraduate programs across multiple academic disciplines.",

    about:
      "The University of Lagos provides students with opportunities to pursue academic, professional and research-based education across a wide range of disciplines. Students can explore faculties, departments, degree programs, admission requirements and other important institutional information.",

    faculties: [
      "Faculty of Arts",
      "Faculty of Business Administration",
      "Faculty of Clinical Sciences",
      "Faculty of Dental Sciences",
      "Faculty of Education",
      "Faculty of Engineering",
      "Faculty of Environmental Sciences",
      "Faculty of Law",
      "Faculty of Pharmacy",
      "Faculty of Science",
      "Faculty of Social Sciences",
      "Faculty of Basic Medical Sciences",
    ],

    programs: [
      "Accounting",
      "Computer Science",
      "Electrical and Electronics Engineering",
      "Mechanical Engineering",
      "Business Administration",
      "Mass Communication",
      "Law",
      "Medicine and Surgery",
      "Pharmacy",
      "Economics",
      "Biochemistry",
      "Microbiology",
    ],

    requirements: [
      "Five relevant O'Level credits including English Language and Mathematics where applicable.",
      "Meet the required UTME subject combination for the selected program.",
      "Meet the university's minimum admission score for the relevant admission year.",
      "Satisfy any additional departmental requirements.",
    ],

    admission:
      "Admission requirements vary by program. Applicants should check the relevant departmental and university requirements before applying.",

    fees:
      "Tuition and other charges vary according to program, level and applicable institutional policies.",

    contact: {
      phone: "+234 1 280 2439",
      email: "info@unilag.edu.ng",
      address: "University of Lagos, Akoka, Lagos, Nigeria",
    },
  },

  ui: {
    id: "ui",
    name: "University of Ibadan",
    shortName: "UI",
    location: "Ibadan, Oyo",
    state: "Oyo",
    type: "Federal University",
    website: "https://ui.edu.ng",
    image:
      "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1800&q=95",

    description:
      "The University of Ibadan offers academic programs across the sciences, humanities, professional disciplines and other fields of study.",

    about:
      "The University of Ibadan is a major Nigerian higher education institution with a wide academic structure covering undergraduate, postgraduate and research programs.",

    faculties: [
      "Faculty of Agriculture",
      "Faculty of Arts",
      "Faculty of Education",
      "Faculty of Law",
      "Faculty of Science",
      "Faculty of Social Sciences",
      "Faculty of Technology",
      "Faculty of Pharmacy",
      "Faculty of Public Health",
    ],

    programs: [
      "Computer Science",
      "Economics",
      "Medicine",
      "Law",
      "Agricultural Economics",
      "Biochemistry",
      "Physics",
      "Chemistry",
      "Political Science",
      "Psychology",
      "Engineering",
      "Statistics",
    ],

    requirements: [
      "Meet the relevant O'Level requirements.",
      "Meet the required UTME subject combination.",
      "Meet the applicable admission score.",
      "Satisfy program-specific requirements.",
    ],

    admission:
      "Applicants should review the requirements for their chosen program before submitting an application.",

    fees:
      "Fees depend on the program, academic level and current institutional charges.",

    contact: {
      phone: "+234 2 810 3411",
      email: "info@ui.edu.ng",
      address: "University of Ibadan, Ibadan, Oyo State, Nigeria",
    },
  },

  abu: {
    id: "abu",
    name: "Ahmadu Bello University",
    shortName: "ABU",
    location: "Zaria, Kaduna",
    state: "Kaduna",
    type: "Federal University",
    website: "https://abu.edu.ng",
    image:
      "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=1800&q=95",

    description:
      "Ahmadu Bello University offers diverse academic programs spanning sciences, engineering, medicine, humanities, social sciences and professional fields.",

    about:
      "Ahmadu Bello University provides a broad academic environment for undergraduate and postgraduate education, research and professional development.",

    faculties: [
      "Faculty of Engineering",
      "Faculty of Science",
      "Faculty of Arts",
      "Faculty of Social Sciences",
      "Faculty of Law",
      "Faculty of Medicine",
      "Faculty of Education",
      "Faculty of Agriculture",
    ],

    programs: [
      "Computer Science",
      "Civil Engineering",
      "Mechanical Engineering",
      "Medicine",
      "Law",
      "Economics",
      "Accounting",
      "Biochemistry",
      "Architecture",
      "Mass Communication",
    ],

    requirements: [
      "Required O'Level credits.",
      "Relevant UTME subject combination.",
      "Required admission score.",
      "Program-specific requirements where applicable.",
    ],

    admission:
      "Admission requirements depend on the selected program and current admission cycle.",

    fees:
      "Current charges vary according to academic program and level.",

    contact: {
      phone: "+234 69 550 121",
      email: "info@abu.edu.ng",
      address: "Ahmadu Bello University, Zaria, Kaduna State, Nigeria",
    },
  },

  oau: {
    id: "oau",
    name: "Obafemi Awolowo University",
    shortName: "OAU",
    location: "Ile-Ife, Osun",
    state: "Osun",
    type: "Federal University",
    website: "https://oauife.edu.ng",
    image:
      "https://images.unsplash.com/photo-1592280771190-3e2e4d571952?auto=format&fit=crop&w=1800&q=95",

    description:
      "Obafemi Awolowo University provides undergraduate and postgraduate education across numerous academic and professional disciplines.",

    about:
      "Obafemi Awolowo University is a comprehensive institution offering education, research and professional development across many fields.",

    faculties: [
      "Faculty of Administration",
      "Faculty of Arts",
      "Faculty of Education",
      "Faculty of Engineering",
      "Faculty of Law",
      "Faculty of Pharmacy",
      "Faculty of Science",
      "Faculty of Social Sciences",
      "Faculty of Health Sciences",
    ],

    programs: [
      "Computer Science",
      "Engineering",
      "Medicine",
      "Law",
      "Accounting",
      "Economics",
      "Architecture",
      "Pharmacy",
      "Microbiology",
      "Political Science",
    ],

    requirements: [
      "Required O'Level credits.",
      "Relevant UTME subjects.",
      "Applicable admission score.",
      "Additional departmental requirements where applicable.",
    ],

    admission:
      "Applicants should confirm current requirements for their chosen program before applying.",

    fees:
      "Fees and charges vary according to academic program and level.",

    contact: {
      phone: "+234 803 123 4567",
      email: "info@oauife.edu.ng",
      address: "Obafemi Awolowo University, Ile-Ife, Osun State, Nigeria",
    },
  },

  uniben: {
    id: "uniben",
    name: "University of Benin",
    shortName: "UNIBEN",
    location: "Benin City, Edo",
    state: "Edo",
    type: "Federal University",
    website: "https://uniben.edu",
    image:
      "https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?auto=format&fit=crop&w=1800&q=95",

    description:
      "The University of Benin provides academic programs across science, technology, medicine, humanities, social sciences and professional disciplines.",

    about:
      "The University of Benin supports undergraduate and postgraduate education as well as research across numerous academic fields.",

    faculties: [
      "Faculty of Arts",
      "Faculty of Engineering",
      "Faculty of Education",
      "Faculty of Law",
      "Faculty of Science",
      "Faculty of Social Sciences",
      "Faculty of Medicine",
      "Faculty of Pharmacy",
    ],

    programs: [
      "Computer Science",
      "Medicine",
      "Law",
      "Engineering",
      "Accounting",
      "Economics",
      "Microbiology",
      "Biochemistry",
      "Political Science",
      "Education",
    ],

    requirements: [
      "Required O'Level credits.",
      "Relevant UTME combination.",
      "Required admission score.",
      "Departmental requirements where applicable.",
    ],

    admission:
      "Applicants should verify the current requirements for their chosen program.",

    fees:
      "Charges vary according to program, level and current university policies.",

    contact: {
      phone: "+234 52 600 000",
      email: "info@uniben.edu",
      address: "University of Benin, Benin City, Edo State, Nigeria",
    },
  },

  unn: {
    id: "unn",
    name: "University of Nigeria, Nsukka",
    shortName: "UNN",
    location: "Nsukka, Enugu",
    state: "Enugu",
    type: "Federal University",
    website: "https://unn.edu.ng",
    image:
      "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1800&q=95",

    description:
      "The University of Nigeria offers a wide range of undergraduate and postgraduate programs across diverse academic disciplines.",

    about:
      "The University of Nigeria provides academic and research opportunities across a broad range of faculties and departments.",

    faculties: [
      "Faculty of Agriculture",
      "Faculty of Arts",
      "Faculty of Biological Sciences",
      "Faculty of Business Administration",
      "Faculty of Engineering",
      "Faculty of Law",
      "Faculty of Medical Sciences",
      "Faculty of Physical Sciences",
      "Faculty of Social Sciences",
    ],

    programs: [
      "Computer Science",
      "Engineering",
      "Medicine",
      "Law",
      "Accounting",
      "Architecture",
      "Biochemistry",
      "Economics",
      "Mass Communication",
      "Pharmacy",
    ],

    requirements: [
      "Required O'Level credits.",
      "Relevant UTME subject combination.",
      "Applicable admission score.",
      "Program-specific requirements.",
    ],

    admission:
      "Admission requirements depend on the selected program and current admission cycle.",

    fees:
      "Fees vary according to program and academic level.",

    contact: {
      phone: "+234 42 770 555",
      email: "info@unn.edu.ng",
      address: "University of Nigeria, Nsukka, Enugu State, Nigeria",
    },
  },
};

/* =========================================================
   SECTION CARD
========================================================= */

const SectionCard = ({
  icon: Icon,
  title,
  children,
}) => {
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 20,
      }}
      whileInView={{
        opacity: 1,
        y: 0,
      }}
      viewport={{
        once: true,
      }}
      transition={{
        duration: 0.4,
      }}
      className="rounded-3xl border border-white/10 bg-slate-900/70 p-6 backdrop-blur-xl sm:p-8"
    >
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-400/10">
          <Icon
            size={21}
            className="text-cyan-400"
          />
        </div>

        <h2 className="text-xl font-black text-white">
          {title}
        </h2>
      </div>

      {children}
    </motion.div>
  );
};

/* =========================================================
   UNIVERSITY DETAILS
========================================================= */

const UniversityDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const university = universities[id];

  /* =======================================================
     NOT FOUND
  ======================================================= */

  if (!university) {
    return (
      <section className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-white">
        <div className="text-center">
          <GraduationCap
            size={55}
            className="mx-auto text-slate-700"
          />

          <h1 className="mt-6 text-3xl font-black">
            University not found
          </h1>

          <p className="mt-3 text-slate-500">
            The university you're looking for does not
            exist.
          </p>

          <button
            onClick={() =>
              navigate("/universities")
            }
            className="mt-7 rounded-xl bg-cyan-500 px-6 py-3 text-sm font-black text-slate-950 transition hover:bg-cyan-400"
          >
            Back to Universities
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen bg-slate-950 px-4 py-8 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">

        {/* =================================================
            BACK
        ================================================= */}

        <button
          onClick={() =>
            navigate("/universities")
          }
          className="mb-8 inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-bold text-slate-300 transition hover:bg-white/10 hover:text-white"
        >
          <ArrowLeft size={18} />
          Universities
        </button>

        {/* =================================================
            HERO
        ================================================= */}

        <motion.div
          initial={{
            opacity: 0,
            y: 25,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.6,
          }}
          className="relative mb-8 overflow-hidden rounded-[2rem] border border-white/10 bg-slate-900"
        >
          {/* HERO IMAGE */}

          <div className="relative h-[420px] sm:h-[500px]">
            <img
              src={university.image}
              alt={university.name}
              className="h-full w-full object-cover object-center"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/55 to-slate-950/10" />

            {/* HERO CONTENT */}

            <div className="absolute inset-x-0 bottom-0 p-6 sm:p-10">
              <div className="mb-4 inline-flex items-center rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-xs font-black text-cyan-300 backdrop-blur-xl">
                {university.type}
              </div>

              <h1 className="max-w-4xl text-4xl font-black tracking-tight text-white sm:text-5xl lg:text-6xl">
                {university.name}
              </h1>

              <div className="mt-5 flex flex-wrap gap-4 text-sm font-semibold text-slate-300">
                <span className="inline-flex items-center gap-2">
                  <MapPin
                    size={17}
                    className="text-cyan-400"
                  />
                  {university.location}
                </span>

                <span className="inline-flex items-center gap-2">
                  <Building2
                    size={17}
                    className="text-cyan-400"
                  />
                  {university.state}
                </span>
              </div>
            </div>
          </div>

          {/* HERO ACTIONS */}

          <div className="flex flex-wrap gap-3 border-t border-white/10 bg-slate-950/70 p-5 sm:p-6">
            <a
              href={university.website}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-5 py-3 text-sm font-black text-slate-950 transition hover:bg-cyan-400"
            >
              <Globe size={17} />
              Official Website
            </a>

            <button
              onClick={() =>
                document
                  .getElementById("programs")
                  ?.scrollIntoView({
                    behavior: "smooth",
                  })
              }
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-bold text-white transition hover:bg-white/10"
            >
              Explore Programs
              <ArrowRight size={17} />
            </button>
          </div>
        </motion.div>

        {/* =================================================
            QUICK INFO
        ================================================= */}

        <div className="mb-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">

          <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-5">
            <GraduationCap
              size={22}
              className="text-cyan-400"
            />

            <p className="mt-4 text-xs font-bold uppercase tracking-wider text-slate-500">
              Institution
            </p>

            <p className="mt-1 font-black text-white">
              {university.shortName}
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-5">
            <MapPin
              size={22}
              className="text-cyan-400"
            />

            <p className="mt-4 text-xs font-bold uppercase tracking-wider text-slate-500">
              Location
            </p>

            <p className="mt-1 font-black text-white">
              {university.state}
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-5">
            <Building2
              size={22}
              className="text-cyan-400"
            />

            <p className="mt-4 text-xs font-bold uppercase tracking-wider text-slate-500">
              Faculties
            </p>

            <p className="mt-1 font-black text-white">
              {university.faculties.length}
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-5">
            <BookOpen
              size={22}
              className="text-cyan-400"
            />

            <p className="mt-4 text-xs font-bold uppercase tracking-wider text-slate-500">
              Featured Programs
            </p>

            <p className="mt-1 font-black text-white">
              {university.programs.length}+
            </p>
          </div>
        </div>

        {/* =================================================
            MAIN CONTENT
        ================================================= */}

        <div className="grid gap-8 lg:grid-cols-[1.4fr_0.8fr]">

          {/* LEFT */}

          <div className="space-y-8">

            {/* ABOUT */}

            <SectionCard
              icon={Building2}
              title="About the University"
            >
              <p className="leading-8 text-slate-400">
                {university.about}
              </p>
            </SectionCard>

            {/* FACULTIES */}

            <SectionCard
              icon={GraduationCap}
              title="Faculties"
            >
              <div className="grid gap-3 sm:grid-cols-2">
                {university.faculties.map(
                  (faculty) => (
                    <div
                      key={faculty}
                      className="flex items-center gap-3 rounded-2xl border border-white/5 bg-slate-950/50 p-4"
                    >
                      <CheckCircle2
                        size={17}
                        className="shrink-0 text-cyan-400"
                      />

                      <span className="text-sm font-semibold text-slate-300">
                        {faculty}
                      </span>
                    </div>
                  )
                )}
              </div>
            </SectionCard>

            {/* PROGRAMS */}

            <div id="programs">
              <SectionCard
                icon={BookOpen}
                title="Programs"
              >
                <div className="grid gap-3 sm:grid-cols-2">
                  {university.programs.map(
                    (program) => (
                      <div
                        key={program}
                        className="rounded-2xl border border-white/5 bg-slate-950/50 p-4 text-sm font-semibold text-slate-300 transition hover:border-cyan-400/20 hover:text-cyan-300"
                      >
                        {program}
                      </div>
                    )
                  )}
                </div>
              </SectionCard>
            </div>

            {/* REQUIREMENTS */}

            <SectionCard
              icon={ClipboardCheck}
              title="Entry Requirements"
            >
              <div className="space-y-4">
                {university.requirements.map(
                  (requirement, index) => (
                    <div
                      key={index}
                      className="flex gap-3 rounded-2xl border border-white/5 bg-slate-950/50 p-4"
                    >
                      <CheckCircle2
                        size={19}
                        className="mt-0.5 shrink-0 text-cyan-400"
                      />

                      <p className="text-sm leading-7 text-slate-400">
                        {requirement}
                      </p>
                    </div>
                  )
                )}
              </div>
            </SectionCard>
          </div>

          {/* RIGHT */}

          <div className="space-y-8">

            {/* ADMISSION */}

            <SectionCard
              icon={ClipboardCheck}
              title="Admission"
            >
              <p className="leading-7 text-slate-400">
                {university.admission}
              </p>

              <button className="mt-6 flex w-full items-center justify-between rounded-2xl border border-cyan-400/20 bg-cyan-400/5 px-4 py-4 text-sm font-bold text-cyan-300 transition hover:bg-cyan-400/10">
                Admission Information
                <ArrowRight size={17} />
              </button>
            </SectionCard>

            {/* FEES */}

            <SectionCard
              icon={Wallet}
              title="Fees"
            >
              <p className="leading-7 text-slate-400">
                {university.fees}
              </p>

              <div className="mt-5 rounded-2xl border border-amber-400/10 bg-amber-400/5 p-4">
                <p className="text-xs leading-6 text-amber-300">
                  Fees can change. Always verify current
                  charges with the institution before making
                  payment.
                </p>
              </div>
            </SectionCard>

            {/* CONTACT */}

            <SectionCard
              icon={Phone}
              title="Contact"
            >
              <div className="space-y-4">

                <div className="flex gap-3">
                  <MapPin
                    size={18}
                    className="mt-1 shrink-0 text-cyan-400"
                  />

                  <p className="text-sm leading-6 text-slate-400">
                    {university.contact.address}
                  </p>
                </div>

                <div className="flex gap-3">
                  <Phone
                    size={18}
                    className="shrink-0 text-cyan-400"
                  />

                  <p className="text-sm text-slate-400">
                    {university.contact.phone}
                  </p>
                </div>

                <div className="flex gap-3">
                  <Mail
                    size={18}
                    className="shrink-0 text-cyan-400"
                  />

                  <p className="break-all text-sm text-slate-400">
                    {university.contact.email}
                  </p>
                </div>
              </div>
            </SectionCard>
          </div>
        </div>

        {/* =================================================
            BOTTOM
        ================================================= */}

        <div className="mt-12 flex justify-center">
          <button
            onClick={() =>
              navigate("/universities")
            }
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-6 py-3 text-sm font-bold text-white transition hover:bg-white/10"
          >
            <ArrowLeft size={17} />
            Back to All Universities
          </button>
        </div>

        <footer className="mt-16 border-t border-white/10 py-10 text-center">
          <p className="text-sm text-slate-500">
            University information on Scholiqen.
          </p>
        </footer>
      </div>
    </section>
  );
};

export default UniversityDetails;

