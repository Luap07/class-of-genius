import React, {
  useState,
} from "react";

import {
  motion,
} from "framer-motion";

import {
  Code2,
  Stethoscope,
  Cpu,
  Briefcase,
  Scale,
  Palette,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";



const paths = [

  {
    icon: Code2,
    title: "Frontend Development",
    level: "Beginner → Advanced",
    duration: "6 Months",
    students: "120K+",
    color: "from-blue-500 to-cyan-500",

    modules: [
      "HTML & CSS",
      "JavaScript",
      "React",
      "Next.js",
      "Real World Projects",
      "Certificate",
    ],
  },


  {
    icon: Cpu,
    title: "Artificial Intelligence",
    level: "Intermediate",
    duration: "8 Months",
    students: "85K+",
    color: "from-violet-500 to-fuchsia-500",

    modules: [
      "Python",
      "Machine Learning",
      "Deep Learning",
      "Computer Vision",
      "Large Language Models",
      "AI Capstone Project",
    ],
  },


  {
    icon: Stethoscope,
    title: "Medical Sciences",
    level: "University",
    duration: "4 Years",
    students: "40K+",
    color: "from-emerald-500 to-green-500",

    modules: [
      "Anatomy",
      "Physiology",
      "Biochemistry",
      "Pathology",
      "Clinical Practice",
      "Assessments",
    ],
  },


  {
    icon: Briefcase,
    title: "Business Management",
    level: "Professional",
    duration: "5 Months",
    students: "70K+",
    color: "from-orange-500 to-amber-500",

    modules: [
      "Marketing",
      "Finance",
      "Leadership",
      "Operations",
      "Business Strategy",
      "Certificate",
    ],
  },


  {
    icon: Scale,
    title: "Law",
    level: "University",
    duration: "4 Years",
    students: "32K+",
    color: "from-slate-600 to-slate-800",

    modules: [
      "Constitutional Law",
      "Contract Law",
      "Criminal Law",
      "Civil Procedure",
      "Advocacy",
      "Examinations",
    ],
  },


  {
    icon: Palette,
    title: "Graphic Design",
    level: "Beginner",
    duration: "3 Months",
    students: "95K+",
    color: "from-pink-500 to-rose-500",

    modules: [
      "Color Theory",
      "Typography",
      "Photoshop",
      "Illustrator",
      "Brand Design",
      "Portfolio Creation",
    ],
  },

];







const LearningPaths = () => {


  const [openPath, setOpenPath] =
    useState(null);






  return (

    <section className="space-y-12">



      {/* HEADER */}

      <div className="
        mx-auto
        max-w-3xl
        text-center
      ">


        <span className="
          inline-flex
          rounded-full
          border
          border-indigo-500/20
          bg-indigo-500/10
          px-4
          py-2
          text-sm
          font-semibold
          text-indigo-400
        ">

          Learning Paths

        </span>




        <h2 className="
          mt-5
          text-4xl
          font-extrabold
        ">

          Follow a Structured Roadmap

        </h2>





        <p className="
          mt-4
          text-lg
          text-slate-400
        ">

          Don't just take random courses.
          Follow guided paths created to take you from beginner to expert.

        </p>



      </div>









      {/* CARDS */}


      <div className="
        grid
        gap-8
        lg:grid-cols-2
      ">


        {
          paths.map(
            (path,index)=>{


              const Icon =
                path.icon;



              const isOpen =
                openPath === path.title;





              return (

                <motion.div

                  key={path.title}


                  initial={{
                    opacity:0,
                    y:30
                  }}


                  whileInView={{
                    opacity:1,
                    y:0
                  }}


                  viewport={{
                    once:true
                  }}


                  transition={{
                    delay:index * 0.08
                  }}


                  whileHover={{
                    y:-8
                  }}



                  className="
                    overflow-hidden
                    rounded-3xl
                    border
                    border-slate-800
                    bg-slate-900
                  "

                >





                  {/* TOP */}


                  <div
                    className={`
                      bg-gradient-to-r
                      ${path.color}
                      p-8
                    `}
                  >



                    <div className="
                      flex
                      justify-between
                    ">



                      <div>


                        <div className="
                          flex
                          h-16
                          w-16
                          items-center
                          justify-center
                          rounded-2xl
                          bg-white/20
                        ">


                          <Icon size={30}/>


                        </div>




                        <h3 className="
                          mt-6
                          text-3xl
                          font-bold
                        ">

                          {path.title}

                        </h3>




                        <p className="
                          mt-2
                          text-white/80
                        ">

                          {path.level}

                        </p>



                      </div>







                      <div className="
                        text-right
                      ">


                        <p>

                          {path.students}

                        </p>


                        <p className="
                          text-sm
                          text-white/70
                        ">

                          Learners

                        </p>



                        <p className="
                          mt-4
                        ">

                          {path.duration}

                        </p>


                      </div>


                    </div>


                  </div>









                  {/* CONTENT */}



                  <div className="p-8">



                    <div className="space-y-4">


                      {
                        path.modules
                        .slice(0,3)
                        .map(
                          (module)=>(


                            <div
                              key={module}
                              className="
                                flex
                                items-center
                                gap-3
                              "
                            >


                              <CheckCircle2

                                size={18}

                                className="
                                  text-emerald-400
                                "

                              />


                              <span>

                                {module}

                              </span>



                            </div>


                          )
                        )
                      }


                    </div>









                    {/* DROPDOWN */}


                    <div className="mt-8">


                      <button

                        type="button"


                        onClick={() =>
                          setOpenPath(
                            isOpen
                            ? null
                            : path.title
                          )
                        }


                        className="
                          flex
                          w-full
                          items-center
                          justify-between
                          rounded-2xl
                          border
                          border-slate-700
                          bg-slate-800
                          px-6
                          py-4
                          font-semibold
                          transition
                          hover:border-blue-500
                          hover:bg-blue-600/20
                        "

                      >


                        <span>

                          Explore Roadmap

                        </span>



                        <ArrowRight

                          size={20}

                          className={`
                            transition
                            ${
                              isOpen
                              ? "rotate-90"
                              : ""
                            }
                          `}

                        />


                      </button>









                      {
                        isOpen && (

                          <motion.div


                            initial={{
                              opacity:0,
                              height:0
                            }}


                            animate={{
                              opacity:1,
                              height:"auto"
                            }}


                            className="
                              mt-4
                              rounded-2xl
                              border
                              border-slate-800
                              bg-slate-950
                              p-5
                            "

                          >



                            <h4 className="
                              mb-4
                              font-bold
                            ">

                              Complete Roadmap

                            </h4>




                            <div className="space-y-3">


                              {
                                path.modules.map(
                                  (item)=>(


                                    <div

                                      key={item}

                                      className="
                                        flex
                                        items-center
                                        gap-3
                                        rounded-xl
                                        bg-slate-900
                                        p-3
                                      "

                                    >


                                      <CheckCircle2

                                        size={17}

                                        className="
                                          text-emerald-400
                                        "

                                      />

                                      {item}


                                    </div>


                                  )
                                )
                              }


                            </div>



                          </motion.div>

                        )
                      }



                    </div>




                  </div>




                </motion.div>

              );


            }
          )
        }


      </div>


    </section>

  );

};



export default LearningPaths;