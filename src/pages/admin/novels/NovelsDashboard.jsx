// src/pages/admin/novels/NovelsDashboard.jsx

import React, { useEffect, useState } from "react";
import {
  BookOpen,
  Layers,
  MessageSquare,
  Users,
  Plus,
  Eye,
  Loader2,
} from "lucide-react";

import { useNavigate } from "react-router-dom";
import { supabase } from "../../../lib/supabaseClient";
import AdminButton from "../../../components/admin/ui/AdminButton";


const NovelsDashboard = () => {

  const navigate = useNavigate();

  const [stats, setStats] = useState({
    novels: 0,
    chapters: 0,
    reviews: 0,
    readers: 0,
  });


  const [recentNovels, setRecentNovels] = useState([]);

  const [loading, setLoading] = useState(true);



  /*
  ==============================
  FETCH LIVE DATA
  ==============================
  */

  useEffect(() => {

    const fetchDashboard = async () => {

      setLoading(true);


      // TOTAL NOVELS
      const { count: novelCount } = await supabase
        .from("novels")
        .select("*", { count: "exact", head: true });



      // TOTAL CHAPTERS
      const { count: chapterCount } = await supabase
        .from("chapters")
        .select("*", { count: "exact", head: true });



      // TOTAL REVIEWS
      const { count: reviewCount } = await supabase
        .from("reviews")
        .select("*", { count: "exact", head: true });



      // TOTAL READERS
      const { count: readerCount } = await supabase
        .from("users")
        .select("*", { count: "exact", head: true });



      // RECENT NOVELS
      const { data: novels } = await supabase
        .from("novels")
        .select("*")
        .order("created_at", {
          ascending: false,
        })
        .limit(5);



      setStats({
        novels: novelCount || 0,
        chapters: chapterCount || 0,
        reviews: reviewCount || 0,
        readers: readerCount || 0,
      });



      setRecentNovels(novels || []);


      setLoading(false);

    };


    fetchDashboard();


  }, []);




  const cards = [

    {
      title: "Total Novels",
      value: stats.novels,
      icon: BookOpen,
    },

    {
      title: "Total Chapters",
      value: stats.chapters,
      icon: Layers,
    },

    {
      title: "Reviews",
      value: stats.reviews,
      icon: MessageSquare,
    },

    {
      title: "Readers",
      value: stats.readers,
      icon: Users,
    },

  ];




  if(loading){

    return (

      <div className="flex justify-center py-20">

        <Loader2
          size={40}
          className="animate-spin text-blue-500"
        />

      </div>

    );

  }




  return (

    <div className="space-y-8 text-white">


      {/* HEADER */}

      <div className="flex justify-between items-center">


        <div>

          <h1 className="text-3xl font-bold">
            Novels Dashboard
          </h1>


          <p className="text-slate-400 mt-2">
            Manage your stories, chapters and readers.
          </p>

        </div>



        <AdminButton
          onClick={() =>
            navigate("/admin/novels/create")
          }
        >

          <span className="flex items-center gap-2">

            <Plus size={18}/>

            Add Novel

          </span>


        </AdminButton>


      </div>





      {/* STATS */}

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">


        {cards.map((card)=>{


          const Icon = card.icon;


          return (

            <div
              key={card.title}
              className="
              bg-slate-900
              border
              border-slate-800
              rounded-2xl
              p-5
              "
            >

              <div
                className="
                w-12
                h-12
                rounded-xl
                bg-blue-500/10
                text-blue-400
                flex
                items-center
                justify-center
                mb-4
                "
              >

                <Icon size={24}/>

              </div>


              <p className="text-slate-400">
                {card.title}
              </p>


              <h2 className="text-3xl font-bold mt-2">
                {card.value}
              </h2>


            </div>

          );


        })}


      </div>






      {/* ALL NOVELS BUTTON CARD */}

      <div
        onClick={() =>
          navigate("/admin/novels/list")
        }
        className="
        cursor-pointer
        bg-slate-900
        border
        border-slate-800
        rounded-2xl
        p-6
        hover:bg-slate-800
        transition
        "
      >

        <div className="flex items-center gap-3">

          <BookOpen className="text-blue-400"/>


          <div>

            <h2 className="text-xl font-bold">
              All Novels
            </h2>


            <p className="text-slate-400">
              Click to view and manage every uploaded novel.
            </p>


          </div>


        </div>


      </div>







      {/* RECENT NOVELS */}

      <div
        className="
        bg-slate-900
        border
        border-slate-800
        rounded-2xl
        p-6
        "
      >


        <h2 className="text-xl font-bold mb-5">
          Recent Novels
        </h2>



        <div className="space-y-4">


          {recentNovels.length === 0 && (

            <p className="text-slate-400">
              No novels uploaded yet.
            </p>

          )}




          {recentNovels.map((novel)=>(


            <div
              key={novel.id}
              className="
              flex
              items-center
              justify-between
              bg-slate-800
              rounded-xl
              p-4
              "
            >


              <div className="flex items-center gap-4">


                <img
                  src={novel.cover_url}
                  alt={novel.title}
                  className="
                  w-14
                  h-16
                  object-cover
                  rounded-lg
                  "
                />



                <div>

                  <h3 className="font-semibold">
                    {novel.title}
                  </h3>


                  <p className="text-sm text-slate-400">
                    {novel.genre}
                  </p>


                </div>


              </div>





              <button
                onClick={() =>
                   navigate(`/admin/novels/view/${novel.id}`)
                       }
                    className="text-blue-400"
                  >
                   <Eye size={20}/>
              </button>

            </div>


          ))}


        </div>


      </div>


    </div>

  );

};


export default NovelsDashboard;