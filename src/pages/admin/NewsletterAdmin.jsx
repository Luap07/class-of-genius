// src/admin/pages/NewsletterAdmin.jsx

import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import { motion } from "framer-motion";

import { supabase } from "../../lib/supabaseClient";

import {
  Mail,
  Users,
  BarChart3,
  Search,
  RefreshCw,
  Loader2,
  Trash2,
  Send,
} from "lucide-react";


export default function NewsletterAdmin() {


  /* ===============================
      STATES
  =============================== */

  const [
    subscribers,
    setSubscribers
  ] = useState([]);


  const [
    loading,
    setLoading
  ] = useState(true);


  const [
    refreshing,
    setRefreshing
  ] = useState(false);


  const [
    search,
    setSearch
  ] = useState("");


  const [
    deletingId,
    setDeletingId
  ] = useState(null);


  const [
    message,
    setMessage
  ] = useState("");


  const [
    messageType,
    setMessageType
  ] = useState("");



  /* ===============================
      FETCH SUBSCRIBERS
  =============================== */


  const fetchSubscribers = async () => {

    try {

      setLoading(true);


      const {
        data,
        error
      } = await supabase

        .from(
          "newsletter_subscribers"
        )

        .select("*")

        .order(
          "created_at",
          {
            ascending:false
          }
        );


      if(error)
        throw error;


      setSubscribers(
        data || []
      );


    } catch(error){

      console.error(
        "Newsletter Fetch Error:",
        error
      );


      setSubscribers([]);


    } finally {

      setLoading(false);

    }

  };



  /* ===============================
      REFRESH
  =============================== */


  const refreshSubscribers = async()=>{

    setRefreshing(true);


    await fetchSubscribers();


    setRefreshing(false);

  };



  useEffect(()=>{

    fetchSubscribers();

  },[]);




  /* ===============================
      SEARCH FILTER
  =============================== */


  const filteredSubscribers =
    useMemo(()=>{


      const keyword =
        search
        .toLowerCase()
        .trim();



      if(!keyword)
        return subscribers;



      return subscribers.filter(
        (subscriber)=>

          subscriber.email
          ?.toLowerCase()
          .includes(keyword)

      );


    },[
      search,
      subscribers
    ]);





  /* ===============================
      DELETE SUBSCRIBER
  =============================== */


  const deleteSubscriber =
  async(id)=>{


    const confirmDelete =
      window.confirm(
        "Delete this subscriber?"
      );


    if(!confirmDelete)
      return;



    try{


      setDeletingId(id);



      const {
        error
      } = await supabase

        .from(
          "newsletter_subscribers"
        )

        .delete()

        .eq(
          "id",
          id
        );



      if(error)
        throw error;



      setSubscribers(
        (prev)=>
          prev.filter(
            item =>
            item.id !== id
          )
      );



      setMessage(
        "Subscriber deleted successfully"
      );


      setMessageType(
        "success"
      );



    }catch(error){


      console.error(error);


      setMessage(
        "Delete failed"
      );


      setMessageType(
        "error"
      );



    }finally{


      setDeletingId(null);



      setTimeout(()=>{

        setMessage("");

        setMessageType("");

      },3000);


    }


  };
    /* ===============================
      UI
  =============================== */


  return (

    <div
      className="
        min-h-screen
        bg-[#030712]
        p-8
        text-white
      "
    >


      {/* ================= HEADER ================= */}


      <div
        className="
          mb-10
          flex
          flex-col
          gap-6
          lg:flex-row
          lg:items-center
          lg:justify-between
        "
      >

        <div>

          <h1
            className="
              text-5xl
              font-black
            "
          >
            Newsletter
          </h1>


          <p
            className="
              mt-3
              text-slate-400
            "
          >
            Manage Scholiqen subscribers and newsletter campaigns.
          </p>


        </div>



        <button

          onClick={refreshSubscribers}

          className="
            flex
            items-center
            gap-3
            rounded-2xl
            bg-cyan-500
            px-6
            py-3
            font-bold
            text-slate-950
            transition
            hover:bg-cyan-400
          "

        >

          {
            refreshing ?

            <Loader2
              size={18}
              className="animate-spin"
            />

            :

            <RefreshCw
              size={18}
            />
          }


          Refresh


        </button>


      </div>





      {/* ================= MESSAGE ================= */}


      {
        message && (

          <div
            className={`
              mb-8
              rounded-2xl
              border
              px-6
              py-4
              ${
                messageType === "success"
                ?
                "border-green-500/30 bg-green-500/10 text-green-400"
                :
                "border-red-500/30 bg-red-500/10 text-red-400"
              }
            `}
          >

            {message}

          </div>

        )
      }





      {/* ================= STATS ================= */}


      <div
        className="
          grid
          gap-6
          md:grid-cols-3
        "
      >


        <StatCard

          icon={Users}

          title="Total Subscribers"

          value={
            subscribers.length
          }

        />


        <StatCard

          icon={Mail}

          title="Filtered Results"

          value={
            filteredSubscribers.length
          }

        />


        <StatCard

          icon={BarChart3}

          title="Campaigns Sent"

          value="0"

        />


      </div>





      {/* ================= SEARCH ================= */}


      <div
        className="
          mt-10
          flex
          items-center
          gap-4
          rounded-2xl
          border
          border-slate-800
          bg-slate-900
          px-5
        "
      >

        <Search
          className="
            text-slate-500
          "
        />


        <input

          value={search}

          onChange={(e)=>
            setSearch(
              e.target.value
            )
          }

          placeholder="
          Search subscriber email...
          "

          className="
            w-full
            bg-transparent
            py-5
            outline-none
          "

        />


      </div>





      {/* ================= TABLE ================= */}


      <div
        className="
          mt-10
          overflow-hidden
          rounded-3xl
          border
          border-slate-800
          bg-slate-900
        "
      >


        <div
          className="
            border-b
            border-slate-800
            px-8
            py-6
          "
        >

          <h2
            className="
              text-2xl
              font-bold
            "
          >
            Subscribers
          </h2>


          <p
            className="
              mt-2
              text-slate-400
            "
          >
            People subscribed to Scholiqen updates.
          </p>


        </div>



        {
          loading ? (


            <div
              className="
                flex
                justify-center
                py-24
              "
            >

              <Loader2
                size={40}
                className="
                  animate-spin
                  text-cyan-400
                "
              />

            </div>


          )

          :

          filteredSubscribers.length === 0 ? (


            <div
              className="
                py-24
                text-center
              "
            >

              <Mail
                size={50}
                className="
                  mx-auto
                  text-slate-600
                "
              />


              <h3
                className="
                  mt-5
                  text-2xl
                  font-bold
                "
              >

                No Subscribers

              </h3>


              <p
                className="
                  mt-2
                  text-slate-500
                "
              >

                Newsletter subscribers will appear here.

              </p>


            </div>


          )

          :

          (
            <div
              className="
                overflow-x-auto
              "
            >

              <table
                className="
                  w-full
                "
              >

                <thead>

                  <tr
                    className="
                      border-b
                      border-slate-800
                      text-left
                      text-slate-400
                    "
                  >

                    <th className="px-8 py-5">
                      #
                    </th>


                    <th className="px-8 py-5">
                      Email
                    </th>


                    <th className="px-8 py-5">
                      Joined
                    </th>


                    <th className="px-8 py-5">
                      Status
                    </th>


                    <th className="px-8 py-5 text-right">
                      Action
                    </th>


                  </tr>


                </thead>


                <tbody>
                    {filteredSubscribers.map(
  (subscriber, index) => (

    <motion.tr

      key={subscriber.id}

      initial={{
        opacity:0,
        y:10,
      }}

      animate={{
        opacity:1,
        y:0,
      }}

      className="
        border-b
        border-slate-800
        transition
        hover:bg-slate-800/40
      "

    >


      <td
        className="
          px-8
          py-6
        "
      >

        {index + 1}

      </td>



      <td
        className="
          px-8
          py-6
          font-medium
        "
      >

        {subscriber.email}

      </td>



      <td
        className="
          px-8
          py-6
          text-slate-400
        "
      >

        {
          subscriber.created_at

          ?

          new Date(
            subscriber.created_at
          )
          .toLocaleDateString()

          :

          "-"
        }


      </td>



      <td
        className="
          px-8
          py-6
        "
      >

        <span
          className="
            rounded-full
            bg-green-500/10
            px-4
            py-2
            text-sm
            font-semibold
            text-green-400
          "
        >

          Active

        </span>


      </td>




      <td
        className="
          px-8
          py-6
          text-right
        "
      >

        <button

          onClick={() =>
            deleteSubscriber(
              subscriber.id
            )
          }

          disabled={
            deletingId === subscriber.id
          }

          className="
            inline-flex
            items-center
            gap-2
            rounded-xl
            border
            border-red-500/30
            px-5
            py-2
            text-red-400
            transition
            hover:bg-red-500/10
            disabled:opacity-50
          "

        >

          {
            deletingId === subscriber.id

            ?

            <Loader2
              size={16}
              className="animate-spin"
            />

            :

            <Trash2
              size={16}
            />

          }


          Delete


        </button>


      </td>



    </motion.tr>

  )

)}


</tbody>

</table>

</div>

)

}


</div>


</div>

  );

}





/* =================================
   STAT CARD COMPONENT
================================= */


function StatCard({
  icon: Icon,
  title,
  value,
}) {


return (

<motion.div

whileHover={{
  y:-5,
}}

className="
  rounded-3xl
  border
  border-slate-800
  bg-slate-900
  p-7
"

>


<Icon

size={34}

className="
  text-cyan-400
"

/>



<p

className="
  mt-5
  text-slate-400
"

>

{title}

</p>



<h2

className="
  mt-2
  text-4xl
  font-black
"

>

{value}

</h2>



</motion.div>

);


}