import React, { useState } from "react";
import {
  Settings,
  Save,
  Globe,
  Clock,
  ShieldCheck,
} from "lucide-react";


const GeneralSettings = ()=>{


  const [settings,setSettings] = useState({

    platformName:"Class Of Genius",

    description:
    "AI powered learning platform",

    language:"English",

    timezone:"Africa/Lagos",

    maintenance:false,

    allowRegistration:true,

  });





  const updateSetting=(key,value)=>{


    setSettings(prev=>({

      ...prev,

      [key]:value

    }));


  };






  const saveSettings=()=>{


    console.log(
      "Saved Settings:",
      settings
    );


  };





  return (

    <div className="p-6 text-white">



      {/* Header */}



      <div className="mb-8">


        <h1 className="
        text-3xl
        font-bold
        flex
        items-center
        gap-3
        ">


          <Settings/>

          General Settings


        </h1>


        <p className="
        text-gray-400
        mt-2
        ">


          Manage basic platform configuration


        </p>



      </div>









      <div className="
      max-w-4xl
      space-y-6
      ">







        {/* Platform Information */}



        <div className="
        bg-slate-900
        border
        border-slate-800
        rounded-2xl
        p-6
        ">



          <h2 className="
          text-xl
          font-bold
          mb-6
          ">

            Platform Information

          </h2>





          <div className="space-y-5">



            <div>


              <label className="
              text-sm
              text-gray-400
              ">

                Platform Name

              </label>



              <input

              value={settings.platformName}

              onChange={(e)=>

                updateSetting(
                  "platformName",
                  e.target.value
                )

              }

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


            </div>







            <div>


              <label className="
              text-sm
              text-gray-400
              ">

                Description

              </label>




              <textarea

              value={settings.description}

              onChange={(e)=>

                updateSetting(
                  "description",
                  e.target.value
                )

              }

              rows="4"

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



            </div>



          </div>



        </div>









        {/* Localization */}



        <div className="
        bg-slate-900
        border
        border-slate-800
        rounded-2xl
        p-6
        ">


          <h2 className="
          text-xl
          font-bold
          mb-6
          ">

            Localization

          </h2>





          <div className="
          grid
          md:grid-cols-2
          gap-5
          ">



            <div>

              <label className="
              text-sm
              text-gray-400
              flex
              gap-2
              items-center
              ">

                <Globe size={16}/>

                Language

              </label>




              <select

              value={settings.language}

              onChange={(e)=>

                updateSetting(
                  "language",
                  e.target.value
                )

              }

              className="
              mt-2
              w-full
              bg-slate-800
              rounded-xl
              px-4
              py-3
              "

              >


                <option>
                  English
                </option>


                <option>
                  French
                </option>


                <option>
                  Spanish
                </option>


              </select>



            </div>






            <div>


              <label className="
              text-sm
              text-gray-400
              flex
              gap-2
              items-center
              ">


                <Clock size={16}/>

                Timezone


              </label>




              <select

              value={settings.timezone}

              onChange={(e)=>

                updateSetting(
                  "timezone",
                  e.target.value
                )

              }

              className="
              mt-2
              w-full
              bg-slate-800
              rounded-xl
              px-4
              py-3
              "

              >


                <option>
                  Africa/Lagos
                </option>


                <option>
                  Europe/London
                </option>


                <option>
                  America/New_York
                </option>


              </select>



            </div>



          </div>



        </div>









        {/* System Controls */}



        <div className="
        bg-slate-900
        border
        border-slate-800
        rounded-2xl
        p-6
        ">



          <h2 className="
          text-xl
          font-bold
          mb-6
          flex
          items-center
          gap-2
          ">


            <ShieldCheck/>

            System Controls


          </h2>






          <div className="space-y-5">





            <label className="
            flex
            justify-between
            items-center
            ">


              <span>
                Allow User Registration
              </span>


              <input

              type="checkbox"

              checked={
                settings.allowRegistration
              }

              onChange={(e)=>

                updateSetting(
                  "allowRegistration",
                  e.target.checked
                )

              }

              className="
              w-5
              h-5
              "

              />


            </label>






            <label className="
            flex
            justify-between
            items-center
            ">


              <span>
                Maintenance Mode
              </span>


              <input

              type="checkbox"

              checked={
                settings.maintenance
              }

              onChange={(e)=>

                updateSetting(
                  "maintenance",
                  e.target.checked
                )

              }

              className="
              w-5
              h-5
              "

              />


            </label>





          </div>



        </div>









        {/* Save */}



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

          Save Settings


        </button>




      </div>





    </div>

  );

};


export default GeneralSettings;