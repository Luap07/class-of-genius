import React, { useMemo, useState } from "react";
import {
  Search,
  Filter,
  Star,
  Trash2,
  CheckCircle,
  XCircle,
  MessageSquare,
} from "lucide-react";


const initialReviews = [
  {
    id: 1,
    user: "John David",
    novel: "The Lost Kingdom",
    rating: 5,
    comment:
      "Amazing story with great characters. I really enjoyed every chapter.",
    status: "Approved",
    date: "2026-07-01",
  },
  {
    id: 2,
    user: "Sarah Williams",
    novel: "Shadow World",
    rating: 4,
    comment:
      "Good novel but some chapters were slow.",
    status: "Pending",
    date: "2026-07-02",
  },
  {
    id: 3,
    user: "Michael Brown",
    novel: "Future Earth",
    rating: 2,
    comment:
      "Not what I expected.",
    status: "Rejected",
    date: "2026-07-03",
  },
];


const filters = [
  "All",
  "Approved",
  "Pending",
  "Rejected",
];


const ReviewsAdmin = () => {

  const [reviews,setReviews] = useState(initialReviews);

  const [search,setSearch] = useState("");

  const [filter,setFilter] = useState("All");


  const updateStatus = (id,status)=>{

    setReviews(prev =>
      prev.map(review =>
        review.id === id
        ? {...review,status}
        : review
      )
    );

  };


  const deleteReview = (id)=>{

    setReviews(prev =>
      prev.filter(review => review.id !== id)
    );

  };


  const filteredReviews = useMemo(()=>{

    return reviews.filter(review=>{

      const matchesSearch =
        review.user
        .toLowerCase()
        .includes(search.toLowerCase()) ||

        review.novel
        .toLowerCase()
        .includes(search.toLowerCase());


      const matchesFilter =
        filter === "All" ||
        review.status === filter;


      return matchesSearch && matchesFilter;

    });


  },[reviews,search,filter]);



  return (

    <div className="p-6 text-white">


      {/* Header */}

      <div className="flex flex-col md:flex-row justify-between gap-4 mb-8">


        <div>

          <h1 className="text-3xl font-bold">
            Novel Reviews
          </h1>

          <p className="text-gray-400 mt-2">
            Manage reader feedback and ratings
          </p>

        </div>



        <div className="flex items-center gap-3">


          <div className="
            flex items-center
            bg-slate-900
            border border-slate-700
            rounded-xl
            px-4
          ">

            <Search size={18}
              className="text-gray-400"
            />

            <input

              value={search}

              onChange={(e)=>setSearch(e.target.value)}

              placeholder="Search reviews..."

              className="
              bg-transparent
              outline-none
              px-3 py-2
              text-sm
              "

            />

          </div>


        </div>


      </div>



      {/* Filters */}

      <div className="
        flex gap-3
        mb-6
        flex-wrap
      ">


        {filters.map(item=>(

          <button

          key={item}

          onClick={()=>setFilter(item)}

          className={`
          px-4 py-2
          rounded-xl
          flex items-center gap-2
          transition

          ${
            filter===item
            ?
            "bg-blue-600"
            :
            "bg-slate-900 hover:bg-slate-800"
          }

          `}

          >

            {item==="All" &&
              <Filter size={16}/>
            }

            {item}


          </button>

        ))}


      </div>




      {/* Reviews Table */}


      <div className="
        bg-slate-900
        rounded-2xl
        border border-slate-800
        overflow-hidden
      ">


        <div className="
          grid
          grid-cols-12
          p-4
          text-gray-400
          text-sm
          border-b
          border-slate-800
        ">

          <span className="col-span-2">
            User
          </span>

          <span className="col-span-2">
            Novel
          </span>

          <span className="col-span-3">
            Review
          </span>

          <span>
            Rating
          </span>

          <span>
            Status
          </span>

          <span>
            Date
          </span>

          <span>
            Action
          </span>


        </div>




        {
          filteredReviews.map(review=>(


            <div

            key={review.id}

            className="
            grid
            grid-cols-12
            items-center
            p-4
            border-b
            border-slate-800
            hover:bg-slate-800/50
            "

            >


              <div className="col-span-2">

                <p className="font-semibold">
                  {review.user}
                </p>

              </div>



              <div className="col-span-2 text-blue-400">

                {review.novel}

              </div>




              <div className="
              col-span-3
              text-sm
              text-gray-300
              flex gap-2
              ">

                <MessageSquare size={16}/>

                {review.comment}


              </div>




              <div className="flex">

                {
                  [...Array(5)]
                  .map((_,i)=>(

                    <Star

                    key={i}

                    size={15}

                    className={
                      i < review.rating
                      ?
                      "fill-yellow-400 text-yellow-400"
                      :
                      "text-gray-600"
                    }

                    />

                  ))
                }

              </div>





              <div>


                <span className={`
                px-3 py-1
                rounded-full
                text-xs

                ${
                  review.status==="Approved"
                  &&
                  "bg-green-500/20 text-green-400"
                }

                ${
                  review.status==="Pending"
                  &&
                  "bg-yellow-500/20 text-yellow-400"
                }

                ${
                  review.status==="Rejected"
                  &&
                  "bg-red-500/20 text-red-400"
                }

                `}>

                  {review.status}

                </span>


              </div>





              <div className="text-sm text-gray-400">

                {review.date}

              </div>




              <div className="
              flex gap-2
              ">


                <button

                onClick={()=>updateStatus(
                  review.id,
                  "Approved"
                )}

                className="
                p-2
                rounded-lg
                bg-green-600/20
                text-green-400
                "

                >

                  <CheckCircle size={17}/>

                </button>



                <button

                onClick={()=>updateStatus(
                  review.id,
                  "Rejected"
                )}

                className="
                p-2
                rounded-lg
                bg-red-600/20
                text-red-400
                "

                >

                  <XCircle size={17}/>

                </button>




                <button

                onClick={()=>deleteReview(review.id)}

                className="
                p-2
                rounded-lg
                bg-slate-700
                text-red-400
                "

                >

                  <Trash2 size={17}/>

                </button>


              </div>



            </div>


          ))
        }


        {
          filteredReviews.length===0 && (

            <div className="
            p-10
            text-center
            text-gray-400
            ">

              No reviews found

            </div>

          )
        }


      </div>



    </div>

  );

};


export default ReviewsAdmin;