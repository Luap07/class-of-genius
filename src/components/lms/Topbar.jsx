// src/components/lms/Topbar.jsx

import React from "react";
import {
  Menu,
  Bell,
  Search,
  UserCircle,
} from "lucide-react";


const Topbar = ({
  onMenuClick,
}) => {

  return (
    <header
      className="
        h-20
        bg-slate-950
        border-b
        border-slate-800
        flex
        items-center
        justify-between
        px-6
        sticky
        top-0
        z-30
      "
    >

      {/* Mobile Menu */}

      <button
        onClick={onMenuClick}
        className="
          lg:hidden
          p-3
          rounded-xl
          bg-slate-900
          border
          border-slate-800
        "
      >

        <Menu size={22}/>

      </button>



      {/* Search */}

      <div
        className="
          hidden
          md:flex
          items-center
          gap-3
          bg-slate-900
          border
          border-slate-800
          rounded-2xl
          px-5
          py-3
          w-96
        "
      >

        <Search
          size={20}
          className="text-slate-400"
        />

        <input
          placeholder="Search anything..."
          className="
            bg-transparent
            outline-none
            w-full
            text-sm
          "
        />

      </div>




      {/* Right Section */}

      <div
        className="
          flex
          items-center
          gap-5
        "
      >


        <button
          className="
            relative
            p-3
            rounded-xl
            bg-slate-900
            border
            border-slate-800
          "
        >

          <Bell size={22}/>


          <span
            className="
              absolute
              top-2
              right-2
              w-2
              h-2
              bg-blue-500
              rounded-full
            "
          />

        </button>



        <div
          className="
            flex
            items-center
            gap-3
          "
        >

          <UserCircle
            size={40}
            className="text-blue-400"
          />


          <div className="hidden md:block">

            <p className="font-semibold">
              Student
            </p>

            <p className="text-sm text-slate-400">
              Welcome back
            </p>

          </div>


        </div>


      </div>


    </header>
  );
};


export default Topbar;