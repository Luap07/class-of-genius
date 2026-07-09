// src/pages/admin/novels/NovelReview.jsx

import React, { useEffect, useState } from "react";
import {
  Trash2,
  Check,
  EyeOff,
  Star
} from "lucide-react";

import { supabase } from "../../../lib/supabaseClient";



const NovelReview = () => {


  const [reviews,setReviews] = useState([]);

  const [loading,setLoading] = useState(true);





  /*
  =========================
  LOAD REVIEWS
  =========================
  */

  useEffect(()=>{

    fetchReviews();

  },[]);





  const fetchReviews = async()=>{


    const {data,error}=await supabase

      .from("novel_reviews")

      .select(`
        *,
        novels(
          title
        )
      `)

      .order(
        "created_at",
        {
          ascending:false
        }
      );




    if(error){

      console.log(error);

    }



    setReviews(data || []);

    setLoading(false);


  };









  /*
  =========================
  UPDATE STATUS
  =========================
  */


  const updateStatus = async(id,status)=>{


    await supabase

      .from("novel_reviews")

      .update({

        status

      })

      .eq(
        "id",
        id
      );



    fetchReviews();


  };








  /*
  =========================
  DELETE REVIEW
  =========================
  */


  const deleteReview = async(id)=>{


    await supabase

      .from("novel_reviews")

      .delete()

      .eq(
        "id",
        id
      );



    fetchReviews();


  };








  if(loading){

    return (

      <div className="text-white p-10">

        Loading reviews...

      </div>

    );

  }







  return (

    <div className="space-y-6 text-white">



      <div>


        <h1 className="text-3xl font-bold">

          Novel Reviews

        </h1>



        <p className="text-slate-400 mt-2">

          Manage reader feedback and ratings.

        </p>


      </div>








      <div className="
        bg-slate-900
        border
        border-slate-800
        rounded-2xl
        overflow-hidden
      ">



        <table className="w-full text-left">


          <thead className="bg-slate-800">


            <tr>


              <th className="px-6 py-4">
                Novel
              </th>


              <th className="px-6 py-4">
                User
              </th>


              <th className="px-6 py-4">
                Rating
              </th>


              <th className="px-6 py-4">
                Comment
              </th>


              <th className="px-6 py-4">
                Status
              </th>


              <th className="px-6 py-4">
                Actions
              </th>


            </tr>


          </thead>








          <tbody>


          {reviews.map((review)=>(


            <tr

              key={review.id}

              className="
                border-t
                border-slate-800
                hover:bg-slate-800/50
              "

            >



              <td className="px-6 py-4 font-semibold">


                {review.novels?.title || "Unknown"}


              </td>





              <td className="px-6 py-4">


                {review.user_name}


              </td>






              <td className="px-6 py-4">


                <div className="flex items-center gap-1 text-yellow-400">


                <Star size={16} fill="currentColor"/>


                {review.rating}


                </div>


              </td>







              <td className="px-6 py-4 text-slate-400 max-w-xs">


                {review.comment}


              </td>







              <td className="px-6 py-4">


                <span className={`
                  px-3
                  py-1
                  rounded-full
                  text-xs

                  ${
                    review.status==="Approved"

                    ?

                    "bg-green-500/10 text-green-400"

                    :

                    review.status==="Hidden"

                    ?

                    "bg-red-500/10 text-red-400"

                    :

                    "bg-yellow-500/10 text-yellow-400"

                  }

                `}>

                  {review.status}


                </span>


              </td>








              <td className="px-6 py-4">


                <div className="flex gap-3">



                  <button

                    onClick={()=>
                      updateStatus(
                        review.id,
                        "Approved"
                      )
                    }

                    className="text-green-400"

                  >

                    <Check size={18}/>

                  </button>





                  <button

                    onClick={()=>
                      updateStatus(
                        review.id,
                        "Hidden"
                      )
                    }

                    className="text-yellow-400"

                  >

                    <EyeOff size={18}/>

                  </button>





                  <button

                    onClick={()=>
                      deleteReview(
                        review.id
                      )
                    }

                    className="text-red-400"

                  >

                    <Trash2 size={18}/>

                  </button>



                </div>
              </td>
            </tr>
          ))}
          </tbody>
        </table>
      </div>
    </div>

  );

};



export default NovelReview;