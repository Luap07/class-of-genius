import React from "react";
import { motion } from "framer-motion";
import {
  MessageCircle,
  Mail,
  BookOpen,
  Ticket,
  Users,
  ArrowRight,
} from "lucide-react";

import SupportHero from "../../components/support/SupportHero";
import ContactCard from "../../components/support/ContactCard";
import FAQAccordion from "../../components/support/FAQAccordion";
import FeedbackCard from "../../components/support/FeedbackCard";
import TicketStatus from "../../components/support/TicketStatus";
import FAQ from "../../pages/support/FAQ";


const SupportHome = () => {


  const supportOptions = [
    {
      title: "Contact Support",
      description:
        "Need help? Reach our support team and get assistance quickly.",
      icon: Mail,
      link: "/support/contact",
    },

    {
      title: "Knowledge Base",
      description:
        "Find answers, guides, and tutorials to solve common issues.",
      icon: BookOpen,
      link: "/support/faq",
    },

    {
      title: "Community",
      description:
        "Connect with students, instructors, and other Scholiqen users.",
      icon: Users,
      link: "/support/community",
    },

    {
      title: "Support Tickets",
      description:
        "Track your submitted requests and monitor progress.",
      icon: Ticket,
      link: "/support/tickets",
    },
  ];




  const faqs = [
    {
      question: "How do I create an account on Scholiqen?",
      answer:
        "Click the Get Started button, register your account, and complete your profile.",
    },

    {
      question: "How can I become an instructor?",
      answer:
        "Visit the Become Instructor page and submit your instructor application.",
    },

    {
      question: "Can I access courses on mobile devices?",
      answer:
        "Yes. Scholiqen is designed to work across desktop, tablet, and mobile devices.",
    },

    {
      question: "How do I contact support?",
      answer:
        "You can contact our support team through email, tickets, or live chat.",
    },
  ];




  return (

    <div
      className="
        min-h-screen
        bg-slate-950
        px-5
        py-12
        text-white
      "
    >


      <div className="mx-auto max-w-7xl">


        {/* HERO */}

        <SupportHero />

        {/* SUPPORT OPTIONS */}

        <section className="mt-16">

  <div className="rounded-[35px] border border-slate-800 bg-slate-900 p-8">

    <div className="mb-8">

      <h2 className="text-3xl font-black">
        Frequently Asked Questions
      </h2>

      <p className="mt-3 text-slate-400">
        Find quick answers to common questions.
      </p>

    </div>


    <a
      href="/support/faq"
      className="
        inline-flex
        items-center
        gap-2
        rounded-xl
        bg-blue-600
        px-6
        py-3
        font-bold
        transition
        hover:bg-blue-700
      "
    >

      View All FAQs

      <ArrowRight size={18}/>

    </a>


  </div>

</section>


        {/* TICKET STATUS */}

        <section className="mt-16">

          <TicketStatus />

        </section>

        {/* FAQ */}

        <section className="mt-16">


          <div className="mb-8">

            <h2 className="text-3xl font-black">
              Frequently Asked Questions
            </h2>

            <p className="mt-3 text-slate-400">
              Quick answers to common questions.
            </p>

          </div>



          <div className="space-y-4">


            {faqs.map((faq)=>(

              <FAQAccordion

                key={faq.question}

                question={faq.question}

                answer={faq.answer}

              />

            ))}


          </div>



        </section>

        {/* CONTACT + FEEDBACK */}

        <section
          className="
            mt-16
            grid
            gap-8
            lg:grid-cols-2
          "
        >


          <ContactCard />

          <FeedbackCard />


        </section>







        {/* BOTTOM CTA */}

        <section className="mt-16">


          <div
            className="
              rounded-[35px]
              border
              border-blue-500/20
              bg-blue-500/10
              p-10
              text-center
            "
          >

            <MessageCircle
              size={50}
              className="
                mx-auto
                text-blue-400
              "
            />



            <h2 className="mt-5 text-3xl font-black">

              Still need help?

            </h2>



            <p className="mt-3 text-slate-300">

              Our support team is ready to assist you.

            </p>




            <a
              href="/support/contact"
              className="
                mt-7
                inline-block
                rounded-2xl
                bg-blue-600
                px-8
                py-4
                font-bold
                hover:bg-blue-700
              "
            >

              Contact Support

            </a>


          </div>


        </section>




      </div>


    </div>

  );

};


export default SupportHome;