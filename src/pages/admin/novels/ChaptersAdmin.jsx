// src/pages/admin/novels/ChapterAdmin.jsx

import React, { useEffect, useState } from "react";
import {
  Plus,
  Edit,
  Trash2,
  Save,
  Loader2,
} from "lucide-react";

import { supabase } from "../../../lib/supabaseClient";
import AdminButton from "../../../components/admin/ui/AdminButton";


const ChapterAdmin = () => {

  const [novels, setNovels] = useState([]);
  const [selectedNovel, setSelectedNovel] = useState("");

  const [chapters, setChapters] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [editingIndex, setEditingIndex] = useState(null);


  const [chapterForm, setChapterForm] = useState({
    title: "",
    content: "",
    status: "Draft",
  });



  // FETCH NOVELS

  const fetchNovels = async () => {

    setLoading(true);

    const { data, error } = await supabase
      .from("novels")
      .select("id,title,chapters")
      .order("created_at", {
        ascending:false,
      });


    if(error){

      console.log(error);

    } else {

      setNovels(data || []);

    }


    setLoading(false);

  };



  useEffect(() => {

    fetchNovels();

  }, []);




  // SELECT NOVEL

  const handleNovelChange = (e)=>{

    const id = e.target.value;

    setSelectedNovel(id);


    const novel = novels.find(
      (item)=>String(item.id) === String(id)
    );


    setChapters(
      novel?.chapters || []
    );

  };




  // INPUT

  const handleChange=(e)=>{

    setChapterForm({
      ...chapterForm,
      [e.target.name]:e.target.value,
    });

  };




  // SAVE CHAPTERS TO SUPABASE

  const saveChapters = async(updated)=>{

    if(!selectedNovel) return;


    setSaving(true);


    const {error}=await supabase
      .from("novels")
      .update({
        chapters:updated
      })
      .eq(
        "id",
        selectedNovel
      );



    if(error){

      console.log(error);

    }else{

      setChapters(updated);

    }


    setSaving(false);

  };





  // ADD / UPDATE

  const saveChapter = async()=>{


    if(!chapterForm.title || !chapterForm.content)
      return;



    let updated=[...chapters];



    if(editingIndex !== null){

      updated[editingIndex]={
        ...updated[editingIndex],
        ...chapterForm,
      };


    }else{


      updated.push({

        id:Date.now(),

        ...chapterForm,

      });


    }



    await saveChapters(updated);



    setChapterForm({

      title:"",
      content:"",
      status:"Draft",

    });


    setEditingIndex(null);


  };





  // EDIT

  const editChapter=(index)=>{

    setEditingIndex(index);

    setChapterForm(
      chapters[index]
    );

  };





  // DELETE

  const deleteChapter=async(index)=>{


    const confirmDelete=window.confirm(
      "Delete this chapter?"
    );


    if(!confirmDelete)return;



    const updated=chapters.filter(
      (_,i)=>i!==index
    );


    await saveChapters(updated);


  };





  if(loading){

    return (

      <div className="flex justify-center py-20">

        <Loader2
          className="animate-spin text-blue-500"
          size={40}
        />

      </div>

    );

  }




  return (

    <div className="space-y-6 text-white">


      <div>

        <h1 className="text-3xl font-bold">
          Chapters Management
        </h1>

        <p className="text-slate-400 mt-2">
          Manage chapters inside your uploaded novels.
        </p>

      </div>




      {/* SELECT NOVEL */}

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">


        <label className="block text-sm text-slate-400 mb-2">
          Select Novel
        </label>


        <select

          value={selectedNovel}

          onChange={handleNovelChange}

          className="w-full bg-slate-800 rounded-xl px-4 py-3"

        >

          <option value="">
            Choose a novel
          </option>


          {novels.map((novel)=>(

            <option
              key={novel.id}
              value={novel.id}
            >
              {novel.title}
            </option>

          ))}


        </select>


      </div>





      {selectedNovel && (

        <>


        {/* EDITOR */}

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">


          <h2 className="text-xl font-bold">
            {editingIndex !== null
              ? "Edit Chapter"
              : "Add Chapter"}
          </h2>


          <input

            name="title"

            value={chapterForm.title}

            onChange={handleChange}

            placeholder="Chapter title"

            className="w-full bg-slate-800 rounded-xl px-4 py-3"

          />



          <textarea

            name="content"

            value={chapterForm.content}

            onChange={handleChange}

            rows="8"

            placeholder="Chapter content"

            className="w-full bg-slate-800 rounded-xl px-4 py-3"

          />



          <select

            name="status"

            value={chapterForm.status}

            onChange={handleChange}

            className="w-full bg-slate-800 rounded-xl px-4 py-3"

          >

            <option>
              Draft
            </option>

            <option>
              Published
            </option>


          </select>



          <AdminButton
            onClick={saveChapter}
          >

            <span className="flex gap-2 items-center">

              {saving
                ?
                <Loader2 size={18} className="animate-spin"/>
                :
                <Save size={18}/>
              }

              Save Chapter

            </span>


          </AdminButton>


        </div>





        {/* CHAPTER LIST */}


        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">


          <table className="w-full text-left">


            <thead className="bg-slate-800">

              <tr>

                <th className="px-6 py-4">
                  Chapter
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


            {chapters.map((chapter,index)=>(


              <tr
                key={chapter.id || index}
                className="border-t border-slate-800"
              >


                <td className="px-6 py-4">

                  {chapter.title}

                </td>



                <td className="px-6 py-4">

                  {chapter.status}

                </td>



                <td className="px-6 py-4">

                  <div className="flex gap-3">


                    <button
                      onClick={()=>editChapter(index)}
                      className="text-blue-400"
                    >

                      <Edit size={18}/>

                    </button>


                    <button
                      onClick={()=>deleteChapter(index)}
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


        </>

      )}


    </div>

  );

};


export default ChapterAdmin;