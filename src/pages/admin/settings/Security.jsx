import React, { useState } from "react";
import {
  Shield,
  Lock,
  KeyRound,
  Clock,
  Save,
  AlertTriangle,
} from "lucide-react";


const Security = ()=>{


  const [security,setSecurity] = useState({

    twoFactor:true,

    strongPasswords:true,

    sessionTimeout:"30",

    maxLoginAttempts:"5",

    emailVerification:true,

  });





  const updateSecurity=(key,value)=>{


    setSecurity(prev=>({

      ...prev,

      [key]:value

    }));


  };





  const saveSecurity=()=>{


    console.log(
      "Security Settings:",
      security
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


          <Shield/>

          Security Settings


        </h1>



        <p className="
        text-gray-400
        mt-2
        ">


          Protect your platform and administrator accounts


        </p>



      </div>









      <div className="
      max-w-4xl
      space-y-6
      ">









        {/* Authentication */}



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


            <KeyRound/>

            Authentication


          </h2>







          <div className="space-y-5">






            <label className="
            flex
            justify-between
            items-center
            ">


              <div>

                <p className="font-medium">
                  Two Factor Authentication
                </p>


                <span className="
                text-sm
                text-gray-400
                ">

                  Add extra protection to accounts

                </span>


              </div>




              <input

              type="checkbox"

              checked={
                security.twoFactor
              }

              onChange={(e)=>

                updateSecurity(
                  "twoFactor",
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


              <div>

                <p className="font-medium">
                  Email Verification
                </p>


                <span className="
                text-sm
                text-gray-400
                ">

                  Require users to verify email

                </span>


              </div>




              <input

              type="checkbox"

              checked={
                security.emailVerification
              }

              onChange={(e)=>

                updateSecurity(
                  "emailVerification",
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









        {/* Password Policy */}



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


            <Lock/>

            Password Policy


          </h2>






          <label className="
          flex
          justify-between
          items-center
          ">



            <div>


              <p className="font-medium">

                Strong Password Requirement

              </p>


              <span className="
              text-sm
              text-gray-400
              ">

                Require uppercase, numbers and symbols

              </span>


            </div>




            <input

            type="checkbox"

            checked={
              security.strongPasswords
            }

            onChange={(e)=>

              updateSecurity(
                "strongPasswords",
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









        {/* Session Controls */}



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


            <Clock/>

            Session Controls


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
              ">

                Session Timeout (minutes)

              </label>




              <input

              value={
                security.sessionTimeout
              }

              onChange={(e)=>

                updateSecurity(
                  "sessionTimeout",
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

              />


            </div>

           <div>


              <label className="
              text-sm
              text-gray-400
              ">

                Maximum Login Attempts

              </label>




              <input

              value={
                security.maxLoginAttempts
              }

              onChange={(e)=>

                updateSecurity(
                  "maxLoginAttempts",
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

              />


            </div>




          </div>




        </div>

        {/* Warning */}
        <div className="
        bg-yellow-500/10
        border
        border-yellow-500/30
        rounded-2xl
        p-5
        flex
        gap-3
        ">


          <AlertTriangle
          className="text-yellow-400"
          />


          <p className="
          text-yellow-300
          ">


            Security changes affect all users.
            Review settings carefully before saving.


          </p>



        </div>
        <button

        onClick={saveSecurity}

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

          Save Security


        </button>




      </div>





    </div>

  );

};


export default Security;