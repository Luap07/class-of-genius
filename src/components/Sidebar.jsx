// import React, { useEffect, useState, useContext } from "react";
// import { useNavigate, useLocation } from "react-router-dom";
// import {
//   Search,
//   Library,
//   CloudSun,
//   X,
//   PanelLeft,
//   LayoutDashboard,
//   GraduationCap,
//   ClipboardList,
//   Languages,
//   FlaskConical,
//   BookOpen,
//   Sparkles,
//   CalendarDays,
//   History,
// } from "lucide-react";

// import { StudyContext } from "../context/StudyContext";

// const Sidebar = ({ open = false, setOpen = () => {} }) => {
//   const navigate = useNavigate();
//   const location = useLocation();

//   const [weather, setWeather] = useState(null);
//   const [weatherError, setWeatherError] = useState("");
//   const [searchValue, setSearchValue] = useState("");

//   const studyContext = useContext(StudyContext);
//   const user = studyContext?.user;

//   const userName =
//     user?.displayName ||
//     user?.email?.split("@")[0] ||
//     "Genius";

//   /*
//   |--------------------------------------------------------------------------
//   | NAVIGATION
//   |--------------------------------------------------------------------------
//   */

//   const navItems = [
//     {
//       title: "Dashboard",
//       icon: LayoutDashboard,
//       path: "/dashboard",
//     },
//     {
//       title: "LMS",
//       icon: GraduationCap,
//       path: "/lms",
//     },
//     {
//       title: "CBT",
//       icon: ClipboardList,
//       path: "/cbt",
//     },
//     {
//       title: "Languages",
//       icon: Languages,
//       path: "/languages",
//     },
//     {
//       title: "Virtual Lab",
//       icon: FlaskConical,
//       path: "/lab",
//     },
//     {
//       title: "Novels",
//       icon: BookOpen,
//       path: "/novels",
//     },
//     {
//       title: "AI Tutor",
//       icon: Sparkles,
//       path: "/ai-tutor",
//     },
//     {
//       title: "Libraries",
//       icon: Library,
//       path: "/libraries",
//     },
//     {
//       title: "Calendar",
//       icon: CalendarDays,
//       path: "/calendar",
//     },
//     {
//       title: "History",
//       icon: History,
//       path: "/history",
//     },
//   ];

//   /*
//   |--------------------------------------------------------------------------
//   | SEARCH
//   |--------------------------------------------------------------------------
//   */

//   const handleSearchSubmit = () => {
//     const trimmed = searchValue.trim();

//     if (!trimmed) return;

//     navigate(`/search?q=${encodeURIComponent(trimmed)}`);

//     setSearchValue("");
//     setOpen(false);
//   };

//   /*
//   |--------------------------------------------------------------------------
//   | NAVIGATION HANDLER
//   |--------------------------------------------------------------------------
//   */

//   const handleNavigation = (path) => {
//     navigate(path);
//     setOpen(false);
//   };

//   /*
//   |--------------------------------------------------------------------------
//   | WEATHER
//   |--------------------------------------------------------------------------
//   */

//   useEffect(() => {
//     const fetchWeather = async () => {
//       try {
//         const apiKey =
//           import.meta.env.VITE_OPENWEATHER_API_KEY;

//         if (!apiKey) {
//           setWeatherError("Weather unavailable");
//           return;
//         }

//         const response = await fetch(
//           `https://api.openweathermap.org/data/2.5/weather?q=Lagos&units=metric&appid=${apiKey}`
//         );

//         const data = await response.json();

//         if (Number(data.cod) !== 200) {
//           setWeatherError("Weather unavailable");
//           return;
//         }

//         setWeather(data);
//       } catch (error) {
//         console.error("Weather Error:", error);
//         setWeatherError("Unable to load weather");
//       }
//     };

//     fetchWeather();
//   }, []);

//   /*
//   |--------------------------------------------------------------------------
//   | ACTIVE ROUTE
//   |--------------------------------------------------------------------------
//   */

//   const isActive = (path) => {
//     if (path === "/dashboard") {
//       return (
//         location.pathname === "/" ||
//         location.pathname === "/dashboard"
//       );
//     }

//     return (
//       location.pathname === path ||
//       location.pathname.startsWith(`${path}/`)
//     );
//   };

//   return (
//     <>
//       {/* =========================================================
//           MOBILE BACKDROP
//       ========================================================= */}

//       {open && (
//         <div
//           onClick={() => setOpen(false)}
//           className="
//             fixed
//             inset-0
//             z-40
//             bg-black/60
//             backdrop-blur-sm
//             lg:hidden
//           "
//         />
//       )}

//       {/* =========================================================
//           MOBILE TOGGLE
//           CLOSED BY DEFAULT
//       ========================================================= */}

//       {!open && (
//         <button
//           type="button"
//           onClick={() => setOpen(true)}
//           aria-label="Open sidebar"
//           className="
//             fixed
//             left-4
//             top-4
//             z-50
//             flex
//             h-11
//             w-11
//             items-center
//             justify-center
//             rounded-xl
//             border
//             border-white/10
//             bg-slate-900
//             text-white
//             shadow-xl
//             transition
//             hover:bg-slate-800
//             lg:hidden
//           "
//         >
//           <PanelLeft size={21} />
//         </button>
//       )}

//       {/* =========================================================
//           SIDEBAR
//       ========================================================= */}

//       <aside
//         className={`
//           fixed
//           left-0
//           top-0
//           z-50
//           flex
//           h-screen
//           w-72
//           flex-col
//           border-r
//           border-slate-800
//           bg-gradient-to-b
//           from-slate-900
//           via-slate-950
//           to-black
//           text-white
//           shadow-2xl
//           transition-transform
//           duration-300
//           ease-in-out

//           ${
//             open
//               ? "translate-x-0"
//               : "-translate-x-full lg:translate-x-0"
//           }
//         `}
//       >
//         {/* =======================================================
//             SIDEBAR TOP
//         ======================================================= */}

//         <div className="flex items-center justify-between border-b border-white/5 px-5 py-5">
//           <div>
//             <h2 className="text-lg font-black tracking-tight">
//               Scholiqen
//             </h2>

//             <p className="mt-0.5 text-[11px] uppercase tracking-[0.18em] text-slate-500">
//               Learning Platform
//             </p>
//           </div>

//           {/* MOBILE CLOSE */}

//           <button
//             type="button"
//             onClick={() => setOpen(false)}
//             aria-label="Close sidebar"
//             className="
//               flex
//               h-9
//               w-9
//               items-center
//               justify-center
//               rounded-lg
//               text-slate-400
//               transition
//               hover:bg-slate-800
//               hover:text-white
//               lg:hidden
//             "
//           >
//             <X size={19} />
//           </button>
//         </div>

//         {/* =======================================================
//             SCROLLABLE CONTENT
//         ======================================================= */}

//         <div className="flex-1 overflow-y-auto px-4 py-5 custom-scrollbar">

//           {/* =====================================================
//               USER CARD
//           ===================================================== */}

//           <div className="mb-6 overflow-hidden rounded-2xl border border-blue-400/10 bg-gradient-to-br from-blue-600 via-indigo-600 to-indigo-700 p-4 shadow-lg shadow-blue-900/20">
//             <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.16em] text-blue-100/70">
//               Welcome Back
//             </p>

//             <h2 className="truncate text-lg font-black text-white">
//               {userName}
//             </h2>

//             {user?.email && (
//               <p className="mt-1 truncate text-xs text-blue-100/70">
//                 {user.email}
//               </p>
//             )}
//           </div>

//           {/* =====================================================
//               SEARCH
//           ===================================================== */}

//           <div className="relative mb-6">
//             <Search
//               size={17}
//               className="
//                 absolute
//                 left-3.5
//                 top-1/2
//                 -translate-y-1/2
//                 text-slate-500
//               "
//             />

//             <input
//               type="text"
//               value={searchValue}
//               onChange={(event) =>
//                 setSearchValue(event.target.value)
//               }
//               onKeyDown={(event) => {
//                 if (event.key === "Enter") {
//                   handleSearchSubmit();
//                 }
//               }}
//               placeholder="Search..."
//               className="
//                 w-full
//                 rounded-xl
//                 border
//                 border-slate-800
//                 bg-slate-900
//                 py-3
//                 pl-10
//                 pr-4
//                 text-sm
//                 text-white
//                 outline-none
//                 placeholder:text-slate-600
//                 transition
//                 focus:border-blue-500/60
//                 focus:bg-slate-800
//               "
//             />
//           </div>

//           {/* =====================================================
//               MAIN NAVIGATION
//           ===================================================== */}

//           <div className="mb-3 px-2">
//             <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-600">
//               Main Menu
//             </p>
//           </div>

//           <nav className="flex flex-col gap-1.5">
//             {navItems.map((item) => {
//               const Icon = item.icon;
//               const active = isActive(item.path);

//               return (
//                 <button
//                   key={item.title}
//                   type="button"
//                   onClick={() =>
//                     handleNavigation(item.path)
//                   }
//                   className={`
//                     group
//                     flex
//                     w-full
//                     items-center
//                     gap-3
//                     rounded-xl
//                     px-3
//                     py-3
//                     text-left
//                     transition-all
//                     duration-200

//                     ${
//                       active
//                         ? `
//                           bg-blue-600
//                           text-white
//                           shadow-lg
//                           shadow-blue-600/20
//                         `
//                         : `
//                           text-slate-400
//                           hover:bg-slate-800
//                           hover:text-white
//                         `
//                     }
//                   `}
//                 >
//                   <span
//                     className={`
//                       flex
//                       h-9
//                       w-9
//                       shrink-0
//                       items-center
//                       justify-center
//                       rounded-lg
//                       transition

//                       ${
//                         active
//                           ? "bg-white/10"
//                           : "bg-slate-800/50 group-hover:bg-slate-700"
//                       }
//                     `}
//                   >
//                     <Icon size={17} />
//                   </span>

//                   <span className="flex-1 text-sm font-semibold">
//                     {item.title}
//                   </span>

//                   {active && (
//                     <span className="h-1.5 w-1.5 rounded-full bg-white" />
//                   )}
//                 </button>
//               );
//             })}
//           </nav>
//         </div>

//         {/* =======================================================
//             WEATHER
//         ======================================================= */}

//         <div className="shrink-0 border-t border-white/5 p-4">
//           <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
//             <div className="flex items-center justify-between gap-4">
//               <div className="min-w-0">
//                 <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-500">
//                   Lagos Weather
//                 </p>

//                 <p className="mt-1 text-xl font-black text-white">
//                   {weather?.main?.temp !== undefined
//                     ? `${Math.round(weather.main.temp)}°C`
//                     : weatherError || "Loading..."}
//                 </p>

//                 {weather?.weather?.[0]?.description && (
//                   <p className="mt-1 truncate text-xs capitalize text-slate-500">
//                     {weather.weather[0].description}
//                   </p>
//                 )}
//               </div>

//               <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-500/10">
//                 <CloudSun
//                   size={24}
//                   className="text-blue-400"
//                 />
//               </div>
//             </div>
//           </div>
//         </div>
//       </aside>
//     </>
//   );
// };

// export default Sidebar;