import React, { useEffect, useState } from "react";
import { Star, Send } from "lucide-react";
import { supabase } from "../lib/supabaseClient";


const ReaderReviews = ({ novelId }) => {

  const [reviews, setReviews] = useState([]);

  const [form, setForm] = useState({
    user_name: "",
    rating: 5,
    comment: ""
  });

  const [loading, setLoading] = useState(false);



  /*
  ==========================
  FETCH APPROVED REVIEWS
  ==========================
  */

  useEffect(() => {

    fetchReviews();

  }, [novelId]);



  const fetchReviews = async () => {

    const { data, error } = await supabase
      .from("novel_reviews")
      .select("*")
      .eq("novel_id", novelId)
      .eq("status", "Approved")
      .order("created_at", {
        ascending: false
      });



    if(error){

      console.log(error);

      return;
    }


    setReviews(data || []);

  };





  /*
  ==========================
  HANDLE INPUT
  ==========================
  */

  const handleChange = (e) => {

    setForm({

      ...form,

      [e.target.name]: e.target.value

    });

  };







  /*
  ==========================
  SUBMIT REVIEW
  ==========================
  */

  const submitReview = async (e)=>{

    e.preventDefault();


    if(!form.user_name || !form.comment){

      alert("Please fill all fields");

      return;

    }


    setLoading(true);



    const {error} = await supabase
      .from("novel_reviews")
      .insert({

        novel_id: novelId,

        user_name: form.user_name,

        rating: Number(form.rating),

        comment: form.comment,

        status:"Pending"

      });





    if(error){

      console.log(error);

      alert("Could not submit review");

    }
    else{

      alert(
        "Review submitted. Waiting for approval."
      );


      setForm({

        user_name:"",

        rating:5,

        comment:""

      });

    }


    setLoading(false);

  };







  return (

    <div className="mt-12 space-y-8">


      {/* TITLE */}

      <div>

        <h2 className="text-3xl font-bold">

          Reader Reviews

        </h2>


        <p className="text-slate-400 mt-1">

          Share your thoughts about this story.

        </p>

      </div>






      {/* REVIEW FORM */}

      <form

        onSubmit={submitReview}

        className="
        bg-slate-900
        border
        border-slate-800
        rounded-2xl
        p-6
        space-y-5
        "

      >



        <input

          name="user_name"

          value={form.user_name}

          onChange={handleChange}

          placeholder="Your name"

          className="
          w-full
          bg-slate-800
          rounded-xl
          px-4
          py-3
          outline-none
          "

        />





        <div>

          <p className="text-sm text-slate-400 mb-2">

            Rating

          </p>


          <div className="flex gap-2">


            {[1,2,3,4,5].map((star)=>(


              <button

                type="button"

                key={star}

                onClick={()=>setForm({

                  ...form,

                  rating:star

                })}

              >

                <Star

                  size={25}

                  className={
                    star <= form.rating
                    ?
                    "text-yellow-400 fill-yellow-400"
                    :
                    "text-slate-600"
                  }

                />


              </button>


            ))}


          </div>


        </div>







        <textarea

          name="comment"

          value={form.comment}

          onChange={handleChange}

          rows="4"

          placeholder="Write your review..."

          className="
          w-full
          bg-slate-800
          rounded-xl
          px-4
          py-3
          outline-none
          "

        />







        <button

          disabled={loading}

          className="
          flex
          items-center
          gap-2
          bg-blue-600
          hover:bg-blue-700
          px-5
          py-3
          rounded-xl
          font-semibold
          "

        >

          <Send size={18}/>

          {loading ? "Sending..." : "Submit Review"}

        </button>



      </form>








      {/* REVIEWS LIST */}


      <div className="space-y-4">


        {reviews.length === 0 && (

          <div className="text-slate-400">

            No reviews yet.

          </div>

        )}

        {reviews.map((review)=>(

          <div
            key={review.id}
           className="
            bg-slate-900
            border
            border-slate-800
            rounded-2xl
            p-5
            "
          >
            <div className="flex justify-between">

              <h3 className="font-bold">

                {review.user_name}

              </h3>

              <div className="flex text-yellow-400">

                {Array.from({
                  length: review.rating
                }).map((_,i)=>(

                  <Star

                    key={i}

                    size={16}

                    fill="currentColor"

                  />

                ))}

              </div>

            </div>
            <p className="mt-3 text-slate-400">

              {review.comment}

            </p>

          </div>

        ))}

      </div>

    </div>

  );

};

export default ReaderReviews;