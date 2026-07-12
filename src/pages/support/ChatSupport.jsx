import React, {
  useEffect,
  useRef,
  useState,
} from "react";

import { motion } from "framer-motion";

import {
  Send,
  MessageCircle,
  Loader2,
} from "lucide-react";

import { supabase } from "../../lib/supabaseClient";


const ChatSupport = () => {


  const [user, setUser] = useState(null);

  const [conversationId, setConversationId] = useState(null);

  const [messages, setMessages] = useState([]);

  const [message, setMessage] = useState("");

  const [loading, setLoading] = useState(true);

  const [sending, setSending] = useState(false);


  const bottomRef = useRef(null);



  /* ================= AUTH ================= */


  useEffect(() => {


    const getUser = async () => {


      const {
        data: {
          user
        }
      } = await supabase.auth.getUser();


      setUser(user);

    };


    getUser();



    const {
      data: {
        subscription
      }
    } = supabase.auth.onAuthStateChange(
      (_, session) => {

        setUser(
          session?.user ?? null
        );

      }
    );



    return () => {

      subscription.unsubscribe();

    };


  }, []);






  /* ================= SCROLL ================= */


  useEffect(() => {


    bottomRef.current?.scrollIntoView({
      behavior:"smooth"
    });


  }, [messages]);







  /* ================= INITIAL CHAT ================= */


  useEffect(() => {


    if(user){

      initializeChat();

    }


  }, [user]);






  const initializeChat = async () => {


    setLoading(true);



    const {
      data: existing,
      error
    } = await supabase

      .from("support_conversations")

      .select("*")

      .eq(
        "user_id",
        user.id
      )

      .eq(
        "status",
        "open"
      )

      .limit(1);




    if(error){

      console.error(error);

      setLoading(false);

      return;

    }




    let conversation;




    if(existing?.length){


      conversation = existing[0];


    }else{


      const {
        data: created,
        error:createError
      } = await supabase

        .from("support_conversations")

        .insert({

          user_id:user.id,

          status:"open"

        })

        .select()

        .single();




      if(createError){

        console.error(createError);

        setLoading(false);

        return;

      }



      conversation = created;


    }





    setConversationId(
      conversation.id
    );


    await loadMessages(
      conversation.id
    );


    setLoading(false);


  };

    /* ================= LOAD MESSAGES ================= */


  const loadMessages = async (id) => {


    const {
      data,
      error
    } = await supabase

      .from("support_messages")

      .select("*")

      .eq(
        "conversation_id",
        id
      )

      .order(
        "created_at",
        {
          ascending:true
        }
      );



    if(error){

      console.error(error);

      return;

    }



    setMessages(
      data || []
    );


  };







  /* ================= REALTIME ================= */


  useEffect(() => {


    if(!conversationId)
      return;



    const channel = supabase

      .channel(
        `support-${conversationId}`
      )


      .on(

        "postgres_changes",

        {

          event:"INSERT",

          schema:"public",

          table:"support_messages",

          filter:
          `conversation_id=eq.${conversationId}`

        },


        (payload)=>{


          setMessages((prev)=>{


            const exists =
              prev.some(
                (msg)=>
                  msg.id === payload.new.id
              );



            if(exists)
              return prev;




            return [
              ...prev,
              payload.new
            ];



          });



        }


      )


      .subscribe();






    return ()=>{


      supabase.removeChannel(
        channel
      );


    };



  },[conversationId]);








  /* ================= SEND MESSAGE ================= */


  const sendMessage = async()=>{


    if(
      !message.trim() ||
      !conversationId ||
      !user
    ){

      return;

    }




    setSending(true);



    const text =
      message.trim();



    setMessage("");





    const {
      error
    } = await supabase

      .from("support_messages")

      .insert({

        conversation_id:
          conversationId,


        user_id:
          user.id,


        sender:
          "user",


        message:
          text

      });




    if(error){

      console.error(error);

    }



    setSending(false);


  };
  /* ================= UI ================= */

  return (

    <div
      className="
        min-h-screen
        bg-slate-950
        px-4
        py-8
        text-white
      "
    >

      <div
        className="
          mx-auto
          flex
          max-w-6xl
          flex-col
          overflow-hidden
          rounded-[32px]
          border
          border-white/10
         bg-slate-900
border-slate-800
        "
      >


        {/* HEADER */}

        <div
          className="
            flex
            items-center
            justify-between
            border-b
            border-white/10
            px-8
            py-6
          "
        >

          <div
            className="
              flex
              items-center
              gap-5
            "
          >

            <div
              className="
                relative
                flex
                h-16
                w-16
                items-center
                justify-center
                rounded-3xl
                bg-gradient-to-br
                from-blue-500
                to-cyan-400
              "
            >

              <MessageCircle size={34}/>


              <span
                className="
                  absolute
                  bottom-1
                  right-1
                  h-4
                  w-4
                  rounded-full
                  border-2
                  border-slate-900
                  bg-green-400
                "
              />

            </div>


            <div>

              <h1
                className="
                  text-2xl
                  font-black
                "
              >
                Scholiqen Support
              </h1>


              <p
                className="
                  text-sm
                  text-slate-400
                "
              >
                Live customer assistance
              </p>


            </div>

          </div>


          <div
            className="
              hidden
              rounded-full
              bg-green-400/10
              px-5
              py-2
              text-sm
              text-green-300
              md:block
            "
          >
            ● Online
          </div>


        </div>






        {/* MESSAGES */}


        <div
          className="
            h-[600px]
            overflow-y-auto
            px-8
            py-8
          "
        >


          {
            loading ?


            (

              <div
                className="
                  flex
                  h-full
                  items-center
                  justify-center
                "
              >

                <Loader2
                  size={45}
                  className="
                    animate-spin
                    text-blue-400
                  "
                />

              </div>

            )



            : messages.length === 0 ?



            (

              <motion.div

                initial={{
                  opacity:0,
                  y:20
                }}

                animate={{
                  opacity:1,
                  y:0
                }}

                className="
                  flex
                  h-full
                  flex-col
                  items-center
                  justify-center
                  text-center
                "
              >


                <div
                  className="
                    mb-6
                    flex
                    h-24
                    w-24
                    items-center
                    justify-center
                    rounded-full
                    bg-blue-500/10
                  "
                >

                  <MessageCircle
                    size={55}
                    className="text-blue-400"
                  />

                </div>



                <h2
                  className="
                    text-3xl
                    font-black
                  "
                >
                  Welcome 👋
                </h2>



                <p
                  className="
                    mt-4
                    max-w-md
                    text-slate-400
                  "
                >
                  Ask about courses, payments,
                  certificates, instructors,
                  or account problems.
                </p>


              </motion.div>


            )



            :


            messages.map((msg)=>(


              <motion.div

                key={msg.id}

                initial={{
                  opacity:0,
                  y:15
                }}

                animate={{
                  opacity:1,
                  y:0
                }}

                className={`
                  mb-5
                  flex
                  ${
                    msg.sender === "user"
                    ? "justify-end"
                    : "justify-start"
                  }
                `}
              >


                <div

                  className={`
                    max-w-[80%]
                    rounded-[28px]
                    px-6
                    py-4
                    shadow-xl

                    ${
                      msg.sender === "user"

                      ?

                      "bg-gradient-to-br from-blue-600 to-indigo-600"

                      :

                      "bg-slate-800 border border-slate-700"

                    }
                  `}

                >


                  <p>
                    {msg.message}
                  </p>


                  <div
                    className="
                      mt-3
                      text-right
                      text-xs
                      opacity-60
                    "
                  >

                    {
                      new Date(
                        msg.created_at
                      ).toLocaleTimeString(
                        [],
                        {
                          hour:"2-digit",
                          minute:"2-digit"
                        }
                      )
                    }

                  </div>


                </div>


              </motion.div>


            ))


          }



          <div ref={bottomRef}/>


        </div>






        {/* INPUT */}


        <div
          className="
            border-t
            border-white/10
            bg-black/20
            p-6
          "
        >

          <div
            className="
              flex
              items-center
              gap-4
              rounded-3xl
              border
             bg-slate-900
border-slate-800
              p-3
            "
          >

            <textarea

              rows={1}

              value={message}

              placeholder="Type your message..."

              onChange={(e)=>
                setMessage(e.target.value)
              }


              onKeyDown={(e)=>{

                if(
                  e.key==="Enter" &&
                  !e.shiftKey
                ){

                  e.preventDefault();

                  sendMessage();

                }

              }}


              className="
                flex-1
                resize-none
                bg-transparent
                px-4
                py-3
                outline-none
              "

            />



            <button

              onClick={sendMessage}

              disabled={
                sending ||
                !message.trim()
              }


              className="
                flex
                h-12
                w-12
                items-center
                justify-center
                rounded-2xl
                bg-gradient-to-br
                from-blue-500
                to-cyan-400
                transition
                hover:scale-105
                disabled:opacity-40
              "

            >

              {
                sending

                ?

                <Loader2
                  size={22}
                  className="animate-spin"
                />

                :

                <Send size={22}/>

              }


            </button>


          </div>


        </div>


      </div>


    </div>

  );


};


export default ChatSupport;