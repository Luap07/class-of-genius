import React from "react";
import {
  Mail,
  Phone,
  MessageCircle,
  Clock,
  MapPin,
} from "lucide-react";


const ContactCard = () => {


  const contacts = [
    {
      title: "Email Support",
      value: "support@scholiqen.com",
      icon: Mail,
      action: "Send Email",
    },

    {
      title: "Live Chat",
      value: "Chat with our support team",
      icon: MessageCircle,
      action: "Start Chat",
    },

    {
      title: "Phone Support",
      value: "+234 800 000 0000",
      icon: Phone,
      action: "Call Now",
    },
  ];



  return (

    <div
      className="
        rounded-[35px]
        border
        border-slate-800
        bg-slate-900
        p-8
      "
    >


      {/* HEADER */}

      <div className="flex items-center gap-4">


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

          <MessageCircle
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
            Contact Support
          </h2>


          <p
            className="
              text-sm
              text-slate-400
            "
          >
            We are here to help you
          </p>


        </div>


      </div>







      {/* CONTACT OPTIONS */}

      <div
        className="
          mt-8
          space-y-5
        "
      >


        {contacts.map((item)=>{


          const Icon = item.icon;


          return (

            <div
              key={item.title}
              className="
                rounded-2xl
                border
                border-slate-800
                bg-slate-950
                p-5
                transition
                hover:border-blue-500/40
              "
            >


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
                    h-12
                    w-12
                    items-center
                    justify-center
                    rounded-xl
                    bg-blue-500/10
                  "
                >

                  <Icon
                    size={22}
                    className="text-blue-400"
                  />

                </div>




                <div>

                  <h3
                    className="
                      font-bold
                      text-white
                    "
                  >
                    {item.title}
                  </h3>


                  <p
                    className="
                      mt-1
                      text-sm
                      text-slate-400
                    "
                  >
                    {item.value}
                  </p>


                </div>


              </div>



              <a
  href={
    item.title === "Email Support"
      ? "mailto:scholiqen@gmail.com"
      : item.title === "Phone Support"
      ? "tel:+2348000000000"
      : "/support/chat"
  }
  className="
    mt-5
    block
    w-full
    rounded-xl
    border
    border-slate-700
    bg-slate-900
    py-3
    text-center
    text-sm
    font-bold
    text-blue-400
    transition
    hover:border-blue-500
    hover:bg-blue-500/10
  "
>
  {item.action}
</a>


            </div>

          );

        })}


      </div>







      {/* WORKING HOURS */}

      <div
        className="
          mt-8
          rounded-2xl
          border
          border-slate-800
          bg-slate-950
          p-5
        "
      >

        <div
          className="
            flex
            items-center
            gap-3
          "
        >

          <Clock
            size={20}
            className="text-blue-400"
          />

          <h3 className="font-bold">
            Support Hours
          </h3>

        </div>



        <p
          className="
            mt-3
            text-sm
            leading-6
            text-slate-400
          "
        >
          Monday - Friday: 8:00 AM - 6:00 PM
          <br />
          Saturday: 10:00 AM - 3:00 PM
        </p>


      </div>







      {/* LOCATION */}

      <div
        className="
          mt-5
          flex
          items-center
          gap-3
          text-sm
          text-slate-400
        "
      >

        <MapPin
          size={18}
          className="text-blue-400"
        />

        Scholiqen Global Support Center

      </div>



    </div>

  );

};


export default ContactCard;