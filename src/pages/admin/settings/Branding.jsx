import React, { useState } from "react";
import {
  Palette,
  Upload,
  Save,
  Image,
  Sparkles,
} from "lucide-react";


const Branding = ()=>{


  const [branding,setBranding] = useState({

    brandName:"Class Of Genius",

    tagline:
    "Learn smarter. Become a genius.",

    primaryColor:"#2563eb",

    secondaryColor:"#7c3aed",

    logo:null,

    favicon:null,

  });





  const updateBrand=(key,value)=>{


    setBranding(prev=>({

      ...prev,

      [key]:value

    }));


  };





  const handleFile=(key,e)=>{


    const file=e.target.files[0];


    if(file){


      updateBrand(
        key,
        URL.createObjectURL(file)
      );


    }


  };






  const saveBranding=()=>{


    console.log(
      "Branding Saved",
      branding
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


          <Palette/>

          Branding


        </h1>



        <p className="
        text-gray-400
        mt-2
        ">


          Customize your platform appearance


        </p>



      </div>


<div className="
      max-w-5xl
      space-y-6
      ">








        {/* Brand Identity */}



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


            <Sparkles size={20}/>

            Brand Identity


          </h2>

          <div className="space-y-5">



            <div>


              <label className="
              text-sm
              text-gray-400
              ">

                Brand Name

              </label>


              <input

              value={
                branding.brandName
              }

              onChange={(e)=>

                updateBrand(
                  "brandName",
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

                Tagline

              </label>


              <input

              value={
                branding.tagline
              }

              onChange={(e)=>

                updateBrand(
                  "tagline",
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

          </div>

        </div>

        {/* Logo Upload */}

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

            Brand Assets

          </h2>

          <div className="
          grid
          md:grid-cols-2
          gap-6
          ">

            <div>

              <label className="
              text-gray-400
              text-sm
              ">

                Logo

              </label>




              <label className="
              mt-3
              h-40
              border-2
              border-dashed
              border-slate-700
              rounded-xl
              flex
              flex-col
              items-center
              justify-center
              cursor-pointer
              ">


                {
                  branding.logo

                  ?

                  <img

                  src={branding.logo}

                  className="
                  h-24
                  object-contain
                  "

                  />

                  :

                  <>

                    <Upload/>

                    <span className="text-sm text-gray-400">
                      Upload Logo
                    </span>

                  </>

                }



                <input

                type="file"

                hidden

                accept="image/*"

                onChange={(e)=>
                  handleFile(
                    "logo",
                    e
                  )
                }

                />


              </label>


            </div>

            <div>


              <label className="
              text-gray-400
              text-sm
              ">

                Favicon

              </label>




              <label className="
              mt-3
              h-40
              border-2
              border-dashed
              border-slate-700
              rounded-xl
              flex
              flex-col
              items-center
              justify-center
              cursor-pointer
              ">



                {
                  branding.favicon

                  ?

                  <img

                  src={branding.favicon}

                  className="
                  h-20
                  "

                  />

                  :

                  <>

                    <Image/>

                    <span className="text-sm text-gray-400">
                      Upload Favicon
                    </span>

                  </>

                }





                <input

                type="file"

                hidden

                accept="image/*"

                onChange={(e)=>
                  handleFile(
                    "favicon",
                    e
                  )
                }

                />



              </label>



            </div>





          </div>



        </div>


        {/* Colors */}
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

            Theme Colors

          </h2>
          <div className="
          grid
          md:grid-cols-2
          gap-6
          ">




            <div>


              <label className="
              text-gray-400
              ">

                Primary Color

              </label>



              <input

              type="color"

              value={
                branding.primaryColor
              }

              onChange={(e)=>

                updateBrand(
                  "primaryColor",
                  e.target.value
                )

              }

              className="
              mt-3
              w-full
              h-12
              rounded-lg
              "

              />



            </div>






            <div>


              <label className="
              text-gray-400
              ">

                Secondary Color

              </label>



              <input

              type="color"

              value={
                branding.secondaryColor
              }

              onChange={(e)=>

                updateBrand(
                  "secondaryColor",
                  e.target.value
                )

              }

              className="
              mt-3
              w-full
              h-12
              rounded-lg
              "

              />

            </div>
          </div>
        </div>


        {/* Preview */}
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
          mb-4
          ">

            Preview

          </h2>



          <div

          style={{
            background:
            branding.primaryColor
          }}

          className="
          rounded-xl
          p-6
          "

          >


            <h3 className="
            text-2xl
            font-bold
            ">

              {branding.brandName}

            </h3>


            <p>

              {branding.tagline}

            </p>


          </div>



        </div>

        <button

        onClick={saveBranding}

        className="
        bg-blue-600
        hover:bg-blue-700
        rounded-xl
        px-6
        py-3
        flex
        items-center
        gap-2
        "

        >

          <Save size={18}/>

          Save Branding


        </button>




      </div>




    </div>

  );

};


export default Branding;