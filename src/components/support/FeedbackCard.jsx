import React, { useState } from "react";
import {
  MessageSquareHeart,
  Send,
  CheckCircle2,
} from "lucide-react";

import RatingStar from "./RatingStars";


const FeedbackCard = () => {


  const [rating, setRating] = useState(0);
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);



  const handleSubmit = (e) => {

    e.preventDefault();

    if(!rating || !message.trim()){
      alert("Please provide a rating and feedback");
      return;
    }


    console.log({
      rating,
      message,
    });


    setSubmitted(true);

  };




  if(submitted){

    return (

      <div
        className="
          rounded-[32px]
          border
          border-slate-800
          bg-slate-900
          p-8
          text-center
        "
      >

        <CheckCircle2
          size={60}
          className="
            mx-auto
            text-green-400
          "
        />


        <h3
          className="
            mt-5
            text-2xl
            font-black
          "
        >
          Thank You!
        </h3>


        <p
          className="
            mt-3
            text-slate-400
          "
        >
          Your feedback helps us improve Scholiqen.
        </p>


      </div>

    );

  }




  return (

    <div
      className="
        rounded-[32px]
        border
        border-slate-800
        bg-slate-900
        p-8
      "
    >


      {/* HEADER */}

      <div
        className="
          flex
          items-center
          gap-4
        "
      >

        <div
          className="
            flex
            h-14
            w-14
            items-center
            justify-center
            rounded-2xl
            bg-blue-500/10
          "
        >

          <MessageSquareHeart
            size={28}
            className="text-blue-400"
          />

        </div>



        <div>

          <h2
            className="
              text-2xl
              font-black
            "
          >
            Share Feedback
          </h2>


          <p
            className="
              text-sm
              text-slate-400
            "
          >
            Help us improve your learning experience.
          </p>


        </div>


      </div>






      <form
        onSubmit={handleSubmit}
        className="
          mt-8
          space-y-6
        "
      >



        {/* RATING */}

        <div>

          <label
            className="
              mb-3
              block
              text-sm
              font-semibold
              text-slate-300
            "
          >
            Rate your experience
          </label>



          <div
            className="
              flex
              gap-2
            "
          >

            {[1,2,3,4,5].map((star)=>(

              <RatingStar

                key={star}

                active={star <= rating}

                onClick={() =>
                  setRating(star)
                }

              />

            ))}


          </div>


        </div>







        {/* MESSAGE */}

        <div>


          <label
            className="
              mb-2
              block
              text-sm
              font-semibold
              text-slate-300
            "
          >
            Your Feedback
          </label>



          <textarea

            rows="5"

            value={message}

            onChange={(e)=>setMessage(e.target.value)}

            placeholder="Tell us what you think..."

            className="
              w-full
              rounded-2xl
              border-2
              border-slate-700
              bg-slate-950
              p-4
              text-white
              placeholder:text-slate-500
              outline-none
              transition
              focus:border-blue-500
            "

          />


        </div>






        <button

          type="submit"

          className="
            flex
            w-full
            items-center
            justify-center
            gap-3
            rounded-2xl
            bg-blue-600
            py-4
            font-bold
            transition
            hover:bg-blue-700
          "

        >

          <Send size={18}/>

          Submit Feedback

        </button>



      </form>


    </div>

  );

};



export default FeedbackCard;