import React from "react";
import {
  Ticket,
  Clock,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";


const TicketStatus = () => {


  const tickets = [
    {
      id: "#SCH-10245",
      title: "Unable to access enrolled course",
      status: "In Progress",
      time: "2 hours ago",
    },

    {
      id: "#SCH-10221",
      title: "Certificate download issue",
      status: "Resolved",
      time: "Yesterday",
    },

    {
      id: "#SCH-10198",
      title: "Payment verification request",
      status: "Pending",
      time: "3 days ago",
    },
  ];





  const statusStyle = (status) => {

    if(status === "Resolved"){

      return `
        bg-green-500/10
        text-green-400
        border-green-500/20
      `;

    }


    if(status === "Pending"){

      return `
        bg-yellow-500/10
        text-yellow-400
        border-yellow-500/20
      `;

    }


    return `
      bg-blue-500/10
      text-blue-400
      border-blue-500/20
    `;

  };





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

      <div
        className="
          flex
          items-center
          justify-between
          gap-5
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
              h-14
              w-14
              items-center
              justify-center
              rounded-2xl
              bg-blue-500/10
            "
          >

            <Ticket
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
              Ticket Status
            </h2>


            <p
              className="
                text-sm
                text-slate-400
              "
            >
              Track your support requests
            </p>


          </div>


        </div>




        <a
          href="/support/tickets"
          className="
            hidden
            items-center
            gap-2
            text-sm
            font-bold
            text-blue-400
            md:flex
          "
        >

          View All

          <ArrowRight size={16}/>

        </a>


      </div>







      {/* TICKETS */}

      <div
        className="
          mt-8
          space-y-4
        "
      >


        {tickets.map((ticket)=>(


          <div
            key={ticket.id}
            className="
              rounded-2xl
              border
              border-slate-800
              bg-slate-950
              p-5
              transition
              hover:border-blue-500/30
            "
          >


            <div
              className="
                flex
                flex-col
                justify-between
                gap-4
                md:flex-row
                md:items-center
              "
            >


              <div>


                <h3
                  className="
                    font-bold
                    text-white
                  "
                >

                  {ticket.title}

                </h3>



                <div
                  className="
                    mt-2
                    flex
                    items-center
                    gap-4
                    text-sm
                    text-slate-500
                  "
                >

                  <span>
                    {ticket.id}
                  </span>


                  <span className="flex items-center gap-1">

                    <Clock size={14}/>

                    {ticket.time}

                  </span>


                </div>


              </div>







              <span
                className={`
                  inline-flex
                  w-fit
                  items-center
                  gap-2
                  rounded-full
                  border
                  px-4
                  py-2
                  text-xs
                  font-bold
                  ${statusStyle(ticket.status)}
                `}
              >


                {ticket.status === "Resolved" && (
                  <CheckCircle2 size={14}/>
                )}


                {ticket.status}


              </span>



            </div>


          </div>


        ))}



      </div>




    </div>

  );

};



export default TicketStatus;