import React from "react";
import {
  School,
  Building2,
  Globe2,
  GraduationCap,
  Landmark,
  Library,
} from "lucide-react";

const partners = [
  {
    name: "Universities",
    description: "Higher Education",
    icon: GraduationCap,
  },
  {
    name: "Schools",
    description: "Primary & Secondary",
    icon: School,
  },
  {
    name: "Education Boards",
    description: "National Authorities",
    icon: Landmark,
  },
  {
    name: "Learning Centers",
    description: "Private Institutions",
    icon: Library,
  },
  {
    name: "Organizations",
    description: "Educational Partners",
    icon: Building2,
  },
  {
    name: "Global Networks",
    description: "International Programs",
    icon: Globe2,
  },
];

const PartnersSection = () => {
  return (
    <section className="mt-24">

      <div className="text-center">

        <span className="text-cyan-400 uppercase tracking-[4px] text-sm font-semibold">
          Trusted Ecosystem
        </span>

        <h2 className="mt-4 text-5xl font-black text-white">
          Built for Schools, Teachers & Learners
        </h2>

        <p className="mt-5 max-w-3xl mx-auto text-slate-400 leading-8">
          Our platform is designed to support educational institutions,
          curriculum developers, teachers, and students across different
          countries and learning systems.
        </p>

      </div>

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-7 mt-14">

        {partners.map((partner) => {

          const Icon = partner.icon;

          return (

            <div
              key={partner.name}
              className="group bg-slate-900 border border-slate-800 rounded-3xl p-8 hover:border-cyan-500 transition-all duration-300"
            >

              <div className="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center group-hover:bg-cyan-500 transition">

                <Icon
                  size={30}
                  className="group-hover:text-white text-cyan-400"
                />

              </div>

              <h3 className="mt-7 text-2xl font-bold text-white">
                {partner.name}
              </h3>

              <p className="mt-3 text-slate-400">
                {partner.description}
              </p>

            </div>

          );

        })}

      </div>

    </section>
  );
};

export default PartnersSection;