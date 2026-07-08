import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Star,
  Users,
  Search,
  Filter,
  ThumbsUp,
  MessageSquare,
} from "lucide-react";

const defaultReviews = [
  {
    id: 1,
    name: "Sarah Johnson",
    avatar: "https://ui-avatars.com/api/?name=Sarah+Johnson&background=2563eb&color=fff",
    rating: 5,
    date: "2 weeks ago",
    courseProgress: "Completed",
    helpful: 124,
    comment:
      "One of the best courses I've ever taken. The explanations are clear, the projects are practical, and the AI tutor makes learning much easier.",
  },
  {
    id: 2,
    name: "Michael Brown",
    avatar: "https://ui-avatars.com/api/?name=Michael+Brown&background=059669&color=fff",
    rating: 5,
    date: "1 month ago",
    courseProgress: "Completed",
    helpful: 89,
    comment:
      "Fantastic course structure. Every lesson builds naturally on the previous one, making difficult concepts easy to understand.",
  },
  {
    id: 3,
    name: "Grace Wilson",
    avatar: "https://ui-avatars.com/api/?name=Grace+Wilson&background=7c3aed&color=fff",
    rating: 4,
    date: "3 weeks ago",
    courseProgress: "80% Complete",
    helpful: 42,
    comment:
      "Great content and practical weeklytasks. I especially enjoyed the quizzes and real-world examples.",
  },
];

const CourseReviews = ({ course }) => {

  const reviews =
    course.reviews || defaultReviews;

  const [search, setSearch] =
    useState("");

  const filteredReviews = useMemo(() => {

    const keyword =
      search.toLowerCase();

    return reviews.filter((review) =>
      review.name
        .toLowerCase()
        .includes(keyword) ||
      review.comment
        .toLowerCase()
        .includes(keyword)
    );

  }, [reviews, search]);

  const averageRating = (
    reviews.reduce(
      (sum, review) =>
        sum + review.rating,
      0
    ) / reviews.length
  ).toFixed(1);

  return (

    <motion.section
      initial={{
        opacity: 0,
        y: 25,
      }}
      whileInView={{
        opacity: 1,
        y: 0,
      }}
      viewport={{
        once: true,
      }}
      className="
        rounded-[32px]
        border
        border-slate-800
        bg-slate-900
        p-8
      "
    >

      <div className="flex items-center justify-between flex-wrap gap-6">

        <div>

          <h2 className="text-3xl font-bold">

            Student Reviews

          </h2>

          <p className="mt-2 text-slate-400">

            See what learners think about this course.

          </p>

        </div>

        <div className="flex items-center gap-4">

          <div className="flex items-center gap-2">

            <Star
              className="fill-yellow-400 text-yellow-400"
              size={22}
            />

            <span className="text-3xl font-bold">

              {averageRating}

            </span>

          </div>

          <div className="text-slate-400">

            ({reviews.length} Reviews)

          </div>

        </div>

      </div>

      {/* Search */}

      <div className="mt-10 relative">

        <Search
          className="
            absolute
            left-5
            top-1/2
            -translate-y-1/2
            text-slate-500
          "
          size={18}
        />

        <input
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
          placeholder="Search reviews..."
          className="
            w-full
            rounded-2xl
            border
            border-slate-800
            bg-slate-950
            py-4
            pl-14
            pr-5
            outline-none
            focus:border-blue-500
          "
        />

      </div>
            {/* =====================================
          Rating Overview
      ===================================== */}

      <div className="mt-10 grid lg:grid-cols-3 gap-8">

        <div className="rounded-3xl border border-slate-800 bg-slate-950 p-8">

          <div className="text-center">

            <h2 className="text-6xl font-extrabold">

              {averageRating}

            </h2>

            <div className="flex justify-center gap-1 mt-4">

              {[1, 2, 3, 4, 5].map((star) => (

                <Star
                  key={star}
                  size={22}
                  className="fill-yellow-400 text-yellow-400"
                />

              ))}

            </div>

            <p className="mt-4 text-slate-400">

              Based on {reviews.length} student reviews

            </p>

          </div>

        </div>

        <div className="lg:col-span-2 rounded-3xl border border-slate-800 bg-slate-950 p-8">

          {[5, 4, 3, 2, 1].map((rating) => {

            const count = reviews.filter(
              (review) => review.rating === rating
            ).length;

            const percentage =
              reviews.length > 0
                ? (count / reviews.length) * 100
                : 0;

            return (

              <div
                key={rating}
                className="flex items-center gap-4 mb-5"
              >

                <span className="w-10 font-semibold">

                  {rating}★

                </span>

                <div className="flex-1 h-3 rounded-full bg-slate-800 overflow-hidden">

                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{
                      width: `${percentage}%`,
                    }}
                    viewport={{ once: true }}
                    transition={{
                      duration: 0.8,
                    }}
                    className="h-full rounded-full bg-yellow-400"
                  />

                </div>

                <span className="w-12 text-right text-slate-400">

                  {count}

                </span>

              </div>

            );

          })}

        </div>

      </div>

      {/* =====================================
          Reviews
      ===================================== */}

      <div className="mt-12 space-y-6">

        {filteredReviews.map((review) => (

          <motion.div
            key={review.id}
            whileHover={{
              y: -3,
            }}
            className="
              rounded-3xl
              border
              border-slate-800
              bg-slate-950
              p-7
            "
          >

            <div className="flex justify-between items-start flex-wrap gap-6">

              <div className="flex gap-5">

                <img
                  src={review.avatar}
                  alt={review.name}
                  className="
                    h-16
                    w-16
                    rounded-full
                    object-cover
                    border-2
                    border-blue-500
                  "
                />

                <div>

                  <h3 className="text-xl font-bold">

                    {review.name}

                  </h3>

                  <div className="flex items-center gap-3 mt-2">

                    <span className="text-slate-400">

                      {review.date}

                    </span>

                    <span className="rounded-full bg-green-500/20 px-3 py-1 text-xs text-green-300">

                      {review.courseProgress}

                    </span>

                  </div>

                </div>

              </div>

              <div className="flex gap-1">

                {[1,2,3,4,5].map((star)=>(

                  <Star
                    key={star}
                    size={18}
                    className={
                      star <= review.rating
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-slate-700"
                    }
                  />

                ))}

              </div>

            </div>

            <p className="mt-6 text-slate-300 leading-8">

              {review.comment}

            </p>

            <div className="mt-6 flex items-center gap-6">

              <button
                className="
                  flex
                  items-center
                  gap-2
                  rounded-xl
                  border
                  border-slate-700
                  px-5
                  py-3
                  hover:bg-slate-800
                  transition
                "
              >

                <ThumbsUp size={18} />

                Helpful ({review.helpful})

              </button>

              <button
                className="
                  flex
                  items-center
                  gap-2
                  rounded-xl
                  border
                  border-slate-700
                  px-5
                  py-3
                  hover:bg-slate-800
                  transition
                "
              >

                <MessageSquare size={18} />

                Reply

              </button>

            </div>

          </motion.div>

        ))}

      </div>
            {/* =====================================
          Review Analytics
      ===================================== */}

      <div className="mt-14 grid md:grid-cols-3 gap-6">

        <div className="rounded-3xl border border-slate-800 bg-slate-950 p-6 text-center">

          <Users
            className="mx-auto text-blue-400"
            size={32}
          />

          <h3 className="mt-5 text-4xl font-bold">

            {reviews.length}

          </h3>

          <p className="mt-2 text-slate-400">

            Student Reviews

          </p>

        </div>

        <div className="rounded-3xl border border-slate-800 bg-slate-950 p-6 text-center">

          <Star
            className="mx-auto text-yellow-400 fill-yellow-400"
            size={32}
          />

          <h3 className="mt-5 text-4xl font-bold">

            {averageRating}

          </h3>

          <p className="mt-2 text-slate-400">

            Average Rating

          </p>

        </div>

        <div className="rounded-3xl border border-slate-800 bg-slate-950 p-6 text-center">

          <ThumbsUp
            className="mx-auto text-green-400"
            size={32}
          />

          <h3 className="mt-5 text-4xl font-bold">

            {reviews.reduce(
              (sum, review) => sum + review.helpful,
              0
            )}

          </h3>

          <p className="mt-2 text-slate-400">

            Helpful Votes

          </p>

        </div>

      </div>

      {/* =====================================
          Write Review
      ===================================== */}

      <motion.div
        whileHover={{
          y: -3,
        }}
        className="
          mt-14
          rounded-[32px]
          border
          border-slate-800
          bg-slate-950
          p-8
        "
      >

        <h2 className="text-2xl font-bold">

          Share Your Experience

        </h2>

        <p className="mt-3 text-slate-400">

          Tell other learners what you liked about this course.

        </p>

        <textarea
          rows={6}
          placeholder="Write your review..."
          className="
            mt-8
            w-full
            rounded-2xl
            border
            border-slate-800
            bg-slate-900
            p-5
            outline-none
            focus:border-blue-500
          "
        />

        <div className="mt-6 flex flex-wrap gap-4">

          {[1,2,3,4,5].map((star)=>(

            <button
              key={star}
              className="
                rounded-xl
                border
                border-slate-700
                p-3
                hover:bg-slate-800
                transition
              "
            >

              <Star
                size={22}
                className="text-yellow-400"
              />

            </button>

          ))}

        </div>

        <button
          className="
            mt-8
            rounded-2xl
            bg-blue-600
            px-8
            py-4
            font-bold
            hover:bg-blue-700
            transition
          "
        >

          Submit Review

        </button>

      </motion.div>

      {/* =====================================
          Load More
      ===================================== */}

      <div className="mt-12 text-center">

        <button
          className="
            rounded-2xl
            border
            border-slate-700
            px-10
            py-4
            hover:bg-slate-800
            transition
          "
        >

          Load More Reviews

        </button>

      </div>

    </motion.section>

  );

};

export default CourseReviews;