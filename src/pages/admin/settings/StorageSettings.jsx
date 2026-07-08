import React, { useState } from "react";
import {
  HardDrive,
  Save,
  Cloud,
  File,
  Image,
  Video,
} from "lucide-react";


const StorageSettings = () => {

  const [storage, setStorage] = useState({
    provider: "Supabase Storage",
    maxUpload: "100",
    cdn: true,
    images: true,
    videos: true,
    pdfs: true,
  });


  const updateStorage = (key, value) => {
    setStorage(prev => ({
      ...prev,
      [key]: value,
    }));
  };


  const saveSettings = () => {
    console.log("Storage Settings:", storage);
  };


  return (
    <div className="p-6 text-white">

      <div className="mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <HardDrive />
          Storage Settings
        </h1>

        <p className="text-gray-400 mt-2">
          Manage files, uploads and storage configuration
        </p>
      </div>



      <div className="max-w-4xl space-y-5">


        <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6">

          <h2 className="text-xl font-bold flex items-center gap-2 mb-5">
            <Cloud size={20}/>
            Storage Provider
          </h2>


          <select
            value={storage.provider}
            onChange={(e)=>updateStorage(
              "provider",
              e.target.value
            )}
            className="w-full bg-slate-800 rounded-xl px-4 py-3 outline-none"
          >

            <option>
              Supabase Storage
            </option>

            <option>
              Firebase Storage
            </option>

            <option>
              AWS S3
            </option>

          </select>


        </section>





        <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6">


          <h2 className="text-xl font-bold mb-5">
            Upload Limits
          </h2>


          <label className="text-gray-400 text-sm">
            Maximum file size (MB)
          </label>


          <input
            value={storage.maxUpload}
            onChange={(e)=>updateStorage(
              "maxUpload",
              e.target.value
            )}
            className="
            mt-2
            w-full
            bg-slate-800
            rounded-xl
            px-4
            py-3
            outline-none
            "
          />


        </section>





        <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6">


          <h2 className="text-xl font-bold mb-5">
            Allowed Media Types
          </h2>


          <div className="space-y-4">


            {[
              ["images","Images",Image],
              ["videos","Videos",Video],
              ["pdfs","PDF Documents",File],
            ].map(([key,label,Icon])=>(

              <label
              key={key}
              className="flex justify-between items-center"
              >

                <span className="flex items-center gap-3">
                  <Icon size={18}/>
                  {label}
                </span>


                <input
                  type="checkbox"
                  checked={storage[key]}
                  onChange={(e)=>
                    updateStorage(
                      key,
                      e.target.checked
                    )
                  }
                  className="w-5 h-5"
                />

              </label>

            ))}


          </div>


        </section>





        <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6">


          <h2 className="text-xl font-bold mb-5">
            CDN & Performance
          </h2>


          <label className="flex justify-between items-center">

            <span>
              Enable CDN
            </span>


            <input
              type="checkbox"
              checked={storage.cdn}
              onChange={(e)=>
                updateStorage(
                  "cdn",
                  e.target.checked
                )
              }
              className="w-5 h-5"
            />

          </label>


        </section>




        <button
          onClick={saveSettings}
          className="
          bg-blue-600
          hover:bg-blue-700
          px-6
          py-3
          rounded-xl
          flex
          items-center
          gap-2
          "
        >

          <Save size={18}/>
          Save Storage Settings

        </button>


      </div>


    </div>
  );
};


export default StorageSettings;