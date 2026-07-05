import React from "react";
import {
  Star,
  Quote,
} from "lucide-react";

const testimonials = [
  {
    name: "Sarah Johnson",
    role: "High School Teacher",
    country: "United Kingdom",
    image: "https://i.pravatar.cc/150?img=32",
    review:
      "The curriculum explorer makes lesson planning much easier. I can compare different education systems without jumping between websites.",
  },
  {
    name: "David Kim",
    role: "University Student",
    country: "South Korea",
    image: "https://i.pravatar.cc/150?img=15",
    review:
      "The AI tutor and curriculum roadmap helped me understand difficult concepts much faster than traditional textbooks.",
  },
  {
    name: "Amina Yusuf",
    role: "Secondary School Student",
    country: "Nigeria",
    image: "https://i.pravatar.cc/150?img=45",
    review:
      "The virtual laboratories completely changed how I learn Chemistry and Physics. It feels like a real laboratory.",
  },
];

const Testimonials = () => {
  return (
    <section className="mt-24">

      <div className="text-center">

        <span className="text-cyan-400 uppercase tracking-[4px] font-semibold">

          Testimonials

        </span>

        <h2 className="mt-4 text-5xl font-black text-white">

          Loved by Students & Teachers

        </h2>

        <p className="mt-5 text-slate-400 max-w-3xl mx-auto leading-8">

          Discover how learners and educators are using the platform to
          improve teaching, learning, and academic performance.

        </p>

      </div>

      <div className="grid xl:grid-cols-3 gap-8 mt-16">

        {testimonials.map((user) => (

          <div
            key={user.name}
            className="bg-slate-900 border border-slate-800 rounded-3xl p-8 hover:border-cyan-500 transition-all"
          >

            <Quote
              className="text-cyan-400"
              size={40}
            />

            <p className="text-slate-300 leading-8 mt-6">

              "{user.review}"

            </p>

            <div className="flex mt-8">

              {[1,2,3,4,5].map((i)=>(
                <Star
                  key={i}
                  size={18}
                  fill="#FACC15"
                  color="#FACC15"
                />
              ))}

            </div>

            <div className="flex items-center gap-4 mt-8">

              <img
                src={user.image}
                alt={user.name}
                className="w-14 h-14 rounded-full border border-slate-700"
              />

              <div>

                <h3 className="text-white font-bold">

                  {user.name}

                </h3>

                <p className="text-slate-400 text-sm">

                  {user.role}

                </p>

                <p className="text-cyan-400 text-sm">

                  {user.country}

                </p>

              </div>

            </div>

          </div>

        ))}

      </div>

    </section>
  );
};

export default Testimonials;