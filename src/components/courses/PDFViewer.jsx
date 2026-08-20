// import React, { useEffect, useState } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import {
//   FileText,
//   Download,
//   ExternalLink,
//   AlertCircle,
//   Maximize2,
//   BookOpen,
//   Sparkles,
//   ShieldCheck,
//   Eye,
//   X,
//   Loader2,
// } from "lucide-react";

// const PDFViewer = ({ pdf }) => {
//   const [isFullscreen, setIsFullscreen] = useState(false);
//   const [isLoaded, setIsLoaded] = useState(false);

//   /* =========================================================
//      RESET LOADING WHEN PDF CHANGES
//   ========================================================= */

//   useEffect(() => {
//     setIsLoaded(false);
//   }, [pdf]);

//   /* =========================================================
//      ESCAPE FULLSCREEN
//   ========================================================= */

//   useEffect(() => {
//     const handleEscape = (event) => {
//       if (event.key === "Escape") {
//         setIsFullscreen(false);
//       }
//     };

//     window.addEventListener("keydown", handleEscape);

//     return () => {
//       window.removeEventListener("keydown", handleEscape);
//     };
//   }, []);

//   /* =========================================================
//      NO PDF
//   ========================================================= */

//   if (!pdf) {
//     return (
//       <motion.div
//         initial={{
//           opacity: 0,
//           y: 20,
//         }}
//         animate={{
//           opacity: 1,
//           y: 0,
//         }}
//         transition={{
//           duration: 0.45,
//           ease: "easeOut",
//         }}
//         className="
//           relative
//           isolate
//           w-full
//           overflow-hidden
//           rounded-[28px]
//           border
//           border-white/10
//           bg-[#07101d]
//           p-8
//           text-center
//           shadow-2xl
//           shadow-black/30
//           sm:p-12
//         "
//       >
//         {/* GLOW */}

//         <div
//           className="
//             pointer-events-none
//             absolute
//             -left-24
//             -top-24
//             h-64
//             w-64
//             rounded-full
//             bg-blue-500/10
//             blur-[100px]
//           "
//         />

//         <div
//           className="
//             pointer-events-none
//             absolute
//             -bottom-24
//             -right-24
//             h-64
//             w-64
//             rounded-full
//             bg-indigo-500/10
//             blur-[100px]
//           "
//         />

//         {/* DOTS */}

//         <div
//           className="
//             pointer-events-none
//             absolute
//             inset-0
//             opacity-[0.035]
//           "
//           style={{
//             backgroundImage:
//               "radial-gradient(circle, rgba(255,255,255,0.9) 1px, transparent 1px)",
//             backgroundSize: "24px 24px",
//           }}
//         />

//         <div className="relative z-10">
//           <motion.div
//             animate={{
//               y: [0, -5, 0],
//             }}
//             transition={{
//               duration: 3,
//               repeat: Infinity,
//               ease: "easeInOut",
//             }}
//             className="
//               mx-auto
//               flex
//               h-20
//               w-20
//               items-center
//               justify-center
//               rounded-[24px]
//               border
//               border-white/10
//               bg-white/[0.04]
//               shadow-xl
//               shadow-black/20
//             "
//           >
//             <AlertCircle
//               size={34}
//               className="text-slate-500"
//             />
//           </motion.div>

//           <h2
//             className="
//               mt-7
//               text-2xl
//               font-black
//               tracking-tight
//               text-white
//               sm:text-3xl
//             "
//           >
//             PDF Not Available
//           </h2>

//           <p
//             className="
//               mx-auto
//               mt-3
//               max-w-md
//               text-sm
//               leading-7
//               text-slate-500
//             "
//           >
//             The course material has not been uploaded yet.
//             Please check back later.
//           </p>
//         </div>
//       </motion.div>
//     );
//   }

//   /* =========================================================
//      PDF URL
     
//      100 = browser PDF viewer requested zoom.
//      toolbar=0 is supported by some PDF viewers.
//   ========================================================= */

//   const pdfUrl = `${pdf}#zoom=100`;

//   /* =========================================================
//      FULLSCREEN
//   ========================================================= */

//   const openFullscreen = () => {
//     setIsFullscreen(true);
//     document.body.style.overflow = "hidden";
//   };

//   const closeFullscreen = () => {
//     setIsFullscreen(false);
//     document.body.style.overflow = "";
//   };

//   /* =========================================================
//      MAIN
//   ========================================================= */

//   return (
//     <>
//       {/* =====================================================
//           MAIN VIEWER
//       ===================================================== */}

//       <motion.div
//         initial={{
//           opacity: 0,
//           y: 20,
//         }}
//         animate={{
//           opacity: 1,
//           y: 0,
//         }}
//         transition={{
//           duration: 0.5,
//           ease: "easeOut",
//         }}
//         className="
//           relative
//           isolate
//           w-full
//           min-w-0
//           overflow-hidden
//           rounded-[28px]
//           border
//           border-white/10
//           bg-[#07101d]
//           shadow-2xl
//           shadow-black/40
//         "
//       >
//         {/* =================================================
//             AMBIENT GLOW
//         ================================================= */}

//         <div
//           className="
//             pointer-events-none
//             absolute
//             -left-32
//             -top-32
//             h-80
//             w-80
//             rounded-full
//             bg-blue-500/10
//             blur-[120px]
//           "
//         />

//         <div
//           className="
//             pointer-events-none
//             absolute
//             -right-32
//             top-20
//             h-80
//             w-80
//             rounded-full
//             bg-indigo-500/10
//             blur-[120px]
//           "
//         />

//         {/* =================================================
//             TOOLBAR
//         ================================================= */}

//         <div
//           className="
//             relative
//             z-20
//             flex
//             min-w-0
//             flex-wrap
//             items-center
//             justify-between
//             gap-3
//             border-b
//             border-white/10
//             bg-[#07101d]/95
//             px-4
//             py-4
//             backdrop-blur-2xl
//             sm:px-6
//           "
//         >
//           {/* LEFT */}

//           <div className="flex min-w-0 items-center gap-3">
//             <div
//               className="
//                 relative
//                 flex
//                 h-11
//                 w-11
//                 shrink-0
//                 items-center
//                 justify-center
//                 rounded-2xl
//                 border
//                 border-blue-400/20
//                 bg-blue-500/10
//               "
//             >
//               <div
//                 className="
//                   absolute
//                   inset-0
//                   rounded-2xl
//                   bg-blue-500/20
//                   blur-xl
//                 "
//               />

//               <FileText
//                 size={21}
//                 className="
//                   relative
//                   text-blue-400
//                 "
//               />
//             </div>

//             <div className="min-w-0">
//               <div className="flex items-center gap-2">
//                 <h3
//                   className="
//                     truncate
//                     text-sm
//                     font-black
//                     text-white
//                     sm:text-base
//                   "
//                 >
//                   Course Material
//                 </h3>

//                 <span
//                   className="
//                     hidden
//                     items-center
//                     gap-1
//                     rounded-full
//                     border
//                     border-emerald-400/20
//                     bg-emerald-400/10
//                     px-2
//                     py-1
//                     text-[8px]
//                     font-black
//                     uppercase
//                     tracking-wider
//                     text-emerald-300
//                     sm:inline-flex
//                   "
//                 >
//                   <ShieldCheck size={9} />
//                   Secure
//                 </span>
//               </div>

//               <div className="mt-1 flex items-center gap-2">
//                 <span
//                   className="
//                     text-[10px]
//                     font-medium
//                     text-slate-500
//                   "
//                 >
//                   PDF Document
//                 </span>

//                 <span className="h-1 w-1 rounded-full bg-slate-700" />

//                 <span
//                   className="
//                     flex
//                     items-center
//                     gap-1
//                     text-[9px]
//                     font-bold
//                     text-blue-400
//                   "
//                 >
//                   <Eye size={10} />
//                   100%
//                 </span>
//               </div>
//             </div>
//           </div>

//           {/* RIGHT */}

//           <div className="flex shrink-0 items-center gap-2">
//             {/* READ */}

//             <motion.a
//               href={pdfUrl}
//               target="_blank"
//               rel="noopener noreferrer"
//               whileHover={{
//                 y: -2,
//               }}
//               whileTap={{
//                 scale: 0.97,
//               }}
//               className="
//                 hidden
//                 items-center
//                 gap-2
//                 rounded-xl
//                 border
//                 border-blue-400/20
//                 bg-blue-500/10
//                 px-4
//                 py-2.5
//                 text-xs
//                 font-bold
//                 text-blue-300
//                 transition-all
//                 hover:border-blue-400/40
//                 hover:bg-blue-500/20
//                 hover:text-white
//                 sm:flex
//               "
//             >
//               <BookOpen size={15} />
//               Read
//             </motion.a>

//             {/* DOWNLOAD */}

//             <motion.a
//               href={pdf}
//               download
//               whileHover={{
//                 y: -2,
//               }}
//               whileTap={{
//                 scale: 0.97,
//               }}
//               className="
//                 flex
//                 items-center
//                 gap-2
//                 rounded-xl
//                 border
//                 border-white/10
//                 bg-white/[0.04]
//                 px-3
//                 py-2.5
//                 text-xs
//                 font-bold
//                 text-slate-300
//                 transition-all
//                 hover:border-white/20
//                 hover:bg-white/[0.08]
//                 hover:text-white
//                 sm:px-4
//               "
//             >
//               <Download size={15} />

//               <span className="hidden sm:inline">
//                 Download
//               </span>
//             </motion.a>

//             {/* OPEN */}

//             <motion.a
//               href={pdfUrl}
//               target="_blank"
//               rel="noopener noreferrer"
//               whileHover={{
//                 y: -2,
//               }}
//               whileTap={{
//                 scale: 0.97,
//               }}
//               className="
//                 flex
//                 items-center
//                 gap-2
//                 rounded-xl
//                 bg-gradient-to-r
//                 from-blue-600
//                 to-indigo-600
//                 px-3.5
//                 py-2.5
//                 text-xs
//                 font-black
//                 text-white
//                 shadow-lg
//                 shadow-blue-900/30
//                 transition-all
//                 hover:from-blue-500
//                 hover:to-indigo-500
//                 sm:px-5
//               "
//             >
//               <ExternalLink size={15} />

//               <span className="hidden sm:inline">
//                 Open
//               </span>
//             </motion.a>
//           </div>
//         </div>

//         {/* =================================================
//             READING BAR
//         ================================================= */}

//         <div
//           className="
//             relative
//             z-10
//             flex
//             items-center
//             justify-between
//             gap-3
//             border-b
//             border-white/[0.06]
//             bg-black/20
//             px-4
//             py-2.5
//             sm:px-6
//           "
//         >
//           <div className="flex min-w-0 items-center gap-2">
//             <Sparkles
//               size={12}
//               className="shrink-0 text-cyan-400"
//             />

//             <span
//               className="
//                 truncate
//                 text-[9px]
//                 font-black
//                 uppercase
//                 tracking-[0.18em]
//                 text-slate-500
//               "
//             >
//               Premium Reading Space
//             </span>
//           </div>

//           <div className="flex shrink-0 items-center gap-2">
//             <span
//               className="
//                 hidden
//                 text-[9px]
//                 font-bold
//                 text-slate-600
//                 md:block
//               "
//             >
//               Default 100%
//             </span>

//             <button
//               type="button"
//               onClick={openFullscreen}
//               className="
//                 flex
//                 items-center
//                 gap-1.5
//                 rounded-lg
//                 border
//                 border-white/10
//                 bg-white/[0.03]
//                 px-2.5
//                 py-1.5
//                 text-[9px]
//                 font-bold
//                 text-slate-400
//                 transition
//                 hover:bg-white/[0.08]
//                 hover:text-white
//               "
//             >
//               <Maximize2 size={11} />
//               Fullscreen
//             </button>
//           </div>
//         </div>

//         {/* =================================================
//             PDF CONTAINER

//             IMPORTANT:
//             overflow-hidden prevents the iframe from creating
//             an unwanted second horizontal scrollbar.

//             The iframe uses aspect/viewport sizing instead of
//             huge fixed heights.
//         ================================================= */}

//         <div
//           className="
//             relative
//             z-10
//             w-full
//             min-w-0
//             bg-[#030712]
//             p-2
//             sm:p-4
//           "
//         >
//           <div
//             className="
//               relative
//               w-full
//               min-w-0
//               overflow-hidden
//               rounded-[20px]
//               border
//               border-white/10
//               bg-[#111827]
//               shadow-2xl
//               shadow-black/30
//             "
//           >
//             {/* LOADING */}

//             <AnimatePresence>
//               {!isLoaded && (
//                 <motion.div
//                   initial={{
//                     opacity: 1,
//                   }}
//                   exit={{
//                     opacity: 0,
//                   }}
//                   className="
//                     absolute
//                     inset-0
//                     z-20
//                     flex
//                     min-h-[500px]
//                     items-center
//                     justify-center
//                     bg-[#07101d]
//                   "
//                 >
//                   <div className="text-center">
//                     <motion.div
//                       animate={{
//                         scale: [1, 1.06, 1],
//                       }}
//                       transition={{
//                         duration: 1.5,
//                         repeat: Infinity,
//                       }}
//                       className="
//                         mx-auto
//                         flex
//                         h-14
//                         w-14
//                         items-center
//                         justify-center
//                         rounded-2xl
//                         border
//                         border-blue-400/20
//                         bg-blue-500/10
//                       "
//                     >
//                       <Loader2
//                         size={24}
//                         className="
//                           animate-spin
//                           text-blue-400
//                         "
//                       />
//                     </motion.div>

//                     <p
//                       className="
//                         mt-4
//                         text-xs
//                         font-bold
//                         text-slate-400
//                       "
//                     >
//                       Preparing your document...
//                     </p>
//                   </div>
//                 </motion.div>
//               )}
//             </AnimatePresence>

//             {/* PDF IFRAME */}

//             <iframe
//               src={pdfUrl}
//               title="Course PDF"
//               onLoad={() => setIsLoaded(true)}
//               scrolling="yes"
//               className="
//                 block
//                 h-[70vh]
//                 min-h-[520px]
//                 w-full
//                 max-w-full
//                 border-0
//                 bg-white
//                 sm:h-[75vh]
//                 sm:min-h-[600px]
//               "
//             />
//           </div>
//         </div>

//         {/* =================================================
//             STATUS
//         ================================================= */}

//         <div
//           className="
//             relative
//             z-10
//             flex
//             flex-wrap
//             items-center
//             justify-between
//             gap-3
//             border-t
//             border-white/[0.06]
//             bg-[#07101d]/80
//             px-4
//             py-3
//             backdrop-blur-xl
//             sm:px-6
//           "
//         >
//           <div className="flex items-center gap-2">
//             <div
//               className={`
//                 h-1.5
//                 w-1.5
//                 rounded-full
//                 ${
//                   isLoaded
//                     ? "bg-emerald-400"
//                     : "animate-pulse bg-yellow-400"
//                 }
//               `}
//             />

//             <span
//               className="
//                 text-[10px]
//                 font-semibold
//                 text-slate-500
//               "
//             >
//               {isLoaded
//                 ? "Document ready"
//                 : "Loading document"}
//             </span>
//           </div>

//           <span
//             className="
//               text-[10px]
//               font-bold
//               text-slate-600
//             "
//           >
//             Scholiqen • Course Library
//           </span>
//         </div>
//       </motion.div>

//       {/* =====================================================
//           FULLSCREEN
//       ===================================================== */}

//       <AnimatePresence>
//         {isFullscreen && (
//           <motion.div
//             initial={{
//               opacity: 0,
//             }}
//             animate={{
//               opacity: 1,
//             }}
//             exit={{
//               opacity: 0,
//             }}
//             className="
//               fixed
//               inset-0
//               z-[9999]
//               flex
//               flex-col
//               overflow-hidden
//               bg-[#020617]
//             "
//           >
//             {/* HEADER */}

//             <div
//               className="
//                 flex
//                 h-[68px]
//                 shrink-0
//                 items-center
//                 justify-between
//                 border-b
//                 border-white/10
//                 bg-[#07101d]/95
//                 px-4
//                 backdrop-blur-2xl
//                 sm:px-6
//               "
//             >
//               <div className="flex min-w-0 items-center gap-3">
//                 <div
//                   className="
//                     flex
//                     h-9
//                     w-9
//                     shrink-0
//                     items-center
//                     justify-center
//                     rounded-xl
//                     bg-blue-500/10
//                   "
//                 >
//                   <FileText
//                     size={17}
//                     className="text-blue-400"
//                   />
//                 </div>

//                 <div className="min-w-0">
//                   <p
//                     className="
//                       truncate
//                       text-sm
//                       font-black
//                       text-white
//                     "
//                   >
//                     Course Material
//                   </p>

//                   <p
//                     className="
//                       text-[9px]
//                       font-bold
//                       uppercase
//                       tracking-wider
//                       text-slate-600
//                     "
//                   >
//                     Default Zoom 100%
//                   </p>
//                 </div>
//               </div>

//               <button
//                 type="button"
//                 onClick={closeFullscreen}
//                 className="
//                   flex
//                   h-10
//                   w-10
//                   shrink-0
//                   items-center
//                   justify-center
//                   rounded-xl
//                   border
//                   border-white/10
//                   bg-white/[0.04]
//                   text-slate-400
//                   transition
//                   hover:bg-white/[0.08]
//                   hover:text-white
//                 "
//               >
//                 <X size={18} />
//               </button>
//             </div>

//             {/* FULLSCREEN PDF */}

//             <div
//               className="
//                 min-h-0
//                 flex-1
//                 w-full
//                 overflow-hidden
//                 bg-[#030712]
//               "
//             >
//               <iframe
//                 src={pdfUrl}
//                 title="Fullscreen Course PDF"
//                 className="
//                   block
//                   h-full
//                   w-full
//                   border-0
//                   bg-white
//                 "
//               />
//             </div>
//           </motion.div>
//         )}
//       </AnimatePresence>
//     </>
//   );
// };

// export default PDFViewer;