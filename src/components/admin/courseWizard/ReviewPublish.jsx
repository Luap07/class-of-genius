import React from "react";
import {
  CheckCircle,
  BookOpen,
  DollarSign,
  Award,
  Image
} from "lucide-react";

const ReviewPublish = ({ data, onPublish }) => {

  return (
    <div className="space-y-6">

      <div>
        <h2 className="text-xl font-semibold">
          Review & Publish
        </h2>

        <p className="text-sm text-slate-400 mt-1">
          Check your course details before publishing.
        </p>
      </div>


      <div className="grid md:grid-cols-2 gap-6">


        <div className="bg-[#111827] border border-[#243047] rounded-2xl p-5">

          <div className="flex items-center gap-3 mb-4">

            <div className="h-10 w-10 rounded-xl bg-blue-600 flex items-center justify-center">
              <BookOpen size={20}/>
            </div>

            <h3 className="font-semibold">
              Basic Information
            </h3>

          </div>


          <p className="text-slate-300">
            {data.title || "No title added"}
          </p>


          <p className="text-sm text-slate-400 mt-2">
            {data.category || "No category"}
          </p>


          <p className="text-sm text-slate-500 mt-3">
            {data.description ||
              "No description"}
          </p>

        </div>



        <div className="bg-[#111827] border border-[#243047] rounded-2xl p-5">

          <div className="flex items-center gap-3 mb-4">

            <div className="h-10 w-10 rounded-xl bg-purple-600 flex items-center justify-center">
              <Image size={20}/>
            </div>


            <h3 className="font-semibold">
              Media
            </h3>

          </div>


          {data.thumbnailPreview ? (

            <img
              src={data.thumbnailPreview}
              alt="thumbnail"
              className="w-full h-40 object-cover rounded-xl"
            />

          ) : (

            <p className="text-slate-500 text-sm">
              No thumbnail uploaded
            </p>

          )}

        </div>



        <div className="bg-[#111827] border border-[#243047] rounded-2xl p-5">

          <div className="flex items-center gap-3 mb-4">

            <div className="h-10 w-10 rounded-xl bg-green-600 flex items-center justify-center">
              <DollarSign size={20}/>
            </div>


            <h3 className="font-semibold">
              Pricing
            </h3>

          </div>


          <p className="text-slate-300">
            {data.freeCourse
              ? "Free Course"
              : `$${data.price || 0}`}
          </p>


        </div>




        <div className="bg-[#111827] border border-[#243047] rounded-2xl p-5">

          <div className="flex items-center gap-3 mb-4">

            <div className="h-10 w-10 rounded-xl bg-orange-600 flex items-center justify-center">
              <Award size={20}/>
            </div>


            <h3 className="font-semibold">
              Certificate
            </h3>

          </div>


          <p className="text-slate-300">
            {data.certificateEnabled
              ? data.certificateName ||
                "Certificate Enabled"
              : "Disabled"}
          </p>

        </div>


      </div>



      <div className="bg-[#111827] border border-[#243047] rounded-2xl p-6">

        <h3 className="font-semibold mb-4">
          Curriculum Summary
        </h3>


        <p className="text-slate-400 text-sm">
          Sections:
          {" "}
          {data.curriculum?.length || 0}
        </p>


        <p className="text-slate-400 text-sm mt-2">
          Resources:
          {" "}
          {data.resources?.length || 0}
        </p>


      </div>



      <button
        onClick={onPublish}
        className="
          w-full
          flex
          items-center
          justify-center
          gap-2
          rounded-xl
          bg-blue-600
          hover:bg-blue-700
          py-3
          font-semibold
          transition
        "
      >

        <CheckCircle size={20}/>

        Publish Course

      </button>


    </div>
  );
};

export default ReviewPublish;