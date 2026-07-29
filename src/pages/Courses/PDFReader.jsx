// src/pages/courses/PDFReader.jsx

import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  Document,
  Page,
  pdfjs,
} from "react-pdf";

import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Loader2,
  Download,
  Share2,
  AlertCircle,
} from "lucide-react";


import { supabase } from "../../lib/supabaseClient";

import Cog from "../../assets/cog.png";


import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";


// ================================
// PDF WORKER
// ================================

pdfjs.GlobalWorkerOptions.workerSrc =
  `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;



// ================================
// COMPONENT
// ================================

export default function PDFReader(){

  const navigate = useNavigate();

  const { id } = useParams();



  // ================================
  // STATES
  // ================================


  const [
    documentData,
    setDocumentData
  ] = useState(null);



  const [
    loading,
    setLoading
  ] = useState(true);



  const [
    error,
    setError
  ] = useState("");



  const [
    numPages,
    setNumPages
  ] = useState(0);



  const [
    pageNumber,
    setPageNumber
  ] = useState(1);



  const [
    scale,
    setScale
  ] = useState(1.2);



  const [
    pageWidth,
    setPageWidth
  ] = useState(900);





  // ================================
  // FETCH DOCUMENT
  // ================================


  const fetchDocument = useCallback(
    async()=>{


      try{


        setLoading(true);

        setError("");



        const {
          data,
          error:fetchError

        } = await supabase

          .from("documents")

          .select("*")

          .eq(
            "id",
            id
          )

          .single();



        if(fetchError)
          throw fetchError;



        console.log(
          "PDF DOCUMENT:",
          data
        );



        setDocumentData(data);



      }
      catch(err){


        console.error(
          "PDF FETCH ERROR:",
          err
        );



        setError(
          err.message ||
          "Unable to load document"
        );


      }
      finally{


        setLoading(false);


      }


    },
    [
      id
    ]
  );





  useEffect(()=>{


    fetchDocument();


  },[
    fetchDocument
  ]);






  // ================================
  // RESPONSIVE WIDTH
  // ================================


  useEffect(()=>{


    const updateWidth = ()=>{


      if(window.innerWidth < 640){


        setPageWidth(
          window.innerWidth - 40
        );


      }
      else if(
        window.innerWidth < 1024
      ){


        setPageWidth(
          window.innerWidth - 100
        );


      }
      else{


        setPageWidth(900);


      }


    };



    updateWidth();



    window.addEventListener(
      "resize",
      updateWidth
    );



    return()=>{


      window.removeEventListener(
        "resize",
        updateWidth
      );


    };


  },[]);






  // ================================
  // PDF DATA
  // ================================


  const fileUrl = useMemo(()=>{


    return (
      documentData?.file_url ||
      ""
    );


  },[
    documentData
  ]);





  const title = useMemo(()=>{


    return (
      documentData?.title ||
      "Document"
    );


  },[
    documentData
  ]);





  // ================================
  // CONTROLS
  // ================================


  const previousPage = ()=>{


    setPageNumber(
      prev =>
      Math.max(
        prev - 1,
        1
      )
    );


  };



  const nextPage = ()=>{


    setPageNumber(
      prev =>
      Math.min(
        prev + 1,
        numPages
      )
    );


  };



  const zoomIn = ()=>{


    setScale(
      prev =>
      Math.min(
        prev + 0.2,
        3
      )
    );


  };



  const zoomOut = ()=>{


    setScale(
      prev =>
      Math.max(
        prev - 0.2,
        0.6
      )
    );


  };



  const resetZoom = ()=>{


    setScale(1);


  };
// ================================
// DOWNLOAD PDF
// ================================


const downloadPDF = ()=>{


  if(!fileUrl)
    return;



  const link =
    document.createElement("a");



  link.href = fileUrl;


  link.download =
    title;



  document.body.appendChild(link);



  link.click();



  document.body.removeChild(link);



};






// ================================
// SHARE DOCUMENT
// ================================


const shareDocument = async()=>{


  try{


    if(
      navigator.share
    ){


      await navigator.share({

        title,

        url:fileUrl,

      });


    }
    else{


      await navigator.clipboard.writeText(
        fileUrl
      );


      alert(
        "Document link copied."
      );


    }


  }
  catch(err){


    console.error(
      err
    );


  }


};






// ================================
// KEYBOARD SHORTCUTS
// ================================


useEffect(()=>{


  const handleKeyDown = (event)=>{


    if(event.key === "ArrowLeft")
      previousPage();



    if(event.key === "ArrowRight")
      nextPage();



    if(event.key === "+")
      zoomIn();



    if(event.key === "-")
      zoomOut();


  };



  window.addEventListener(
    "keydown",
    handleKeyDown
  );



  return()=>{


    window.removeEventListener(
      "keydown",
      handleKeyDown
    );


  };


},[
  numPages
]);







// ================================
// LOADING
// ================================


if(loading){


  return(

    <div
      className="
        flex
        min-h-screen
        items-center
        justify-center
        bg-[#020617]
        text-white
      "
    >


      <div
        className="
          text-center
        "
      >


        <Loader2

          size={55}

          className="
            mx-auto
            animate-spin
            text-cyan-400
          "

        />



        <p
          className="
            mt-5
            text-slate-400
          "
        >

          Loading Document...

        </p>



      </div>


    </div>

  );


}






// ================================
// ERROR
// ================================


if(
  error ||
  !documentData
){


  return(

    <div
      className="
        flex
        min-h-screen
        items-center
        justify-center
        bg-[#020617]
        px-6
        text-white
      "
    >


      <div

        className="
          max-w-lg
          rounded-3xl
          border
          border-red-500/20
          bg-slate-900
          p-10
          text-center
        "

      >


        <AlertCircle

          size={60}

          className="
            mx-auto
            text-red-400
          "

        />



        <h2

          className="
            mt-6
            text-3xl
            font-black
          "

        >

          Failed To Load PDF

        </h2>




        <p

          className="
            mt-4
            text-slate-400
          "

        >

          {
            error ||
            "Document not found"
          }

        </p>





        <button

          onClick={()=>
            navigate(-1)
          }

          className="
            mt-8
            rounded-2xl
            bg-cyan-500
            px-8
            py-3
            font-bold
            text-slate-950
          "

        >

          Go Back

        </button>



      </div>


    </div>

  );


}







// ================================
// MAIN UI
// ================================


return (

<div
  className="
    min-h-screen
    bg-[#020617]
    text-white
  "
>


{/* HEADER */}

<div

  className="
    sticky
    top-0
    z-50
    border-b
    border-slate-800
    bg-slate-950/95
    backdrop-blur-xl
  "

>


<div

  className="
    relative
    mx-auto
    flex
    max-w-7xl
    items-center
    justify-between
    px-6
    py-4
  "

>


{/* LEFT SIDE */}

<div

  className="
    flex
    items-center
    gap-4
  "

>


<button

  onClick={()=>
    navigate(-1)
  }


  className="
    rounded-xl
    border
    border-slate-700
    p-3
    hover:border-cyan-500
  "

>


<ArrowLeft size={20}/>


</button>




<div>


<h1

  className="
    text-xl
    font-black
  "

>

{title}

</h1>




<p

 className="
   text-sm
   text-slate-400
 "

>


</p>



</div>


</div>





{/* CENTER COG LOGO */}


<div

 className="
   absolute
   left-1/2
   top-1/2
   -translate-x-1/2
   -translate-y-1/2
 "

>


<img

 src={Cog}

 alt="Cog"

 className="
   h-12
   w-12
   object-contain
 "

/>


</div>





{/* RIGHT CONTROLS */}


<div

className="
 flex
 items-center
 gap-3
"

>
  {/* ZOOM OUT */}

<button

  onClick={zoomOut}

  className="
    rounded-xl
    border
    border-slate-700
    p-3
    hover:border-cyan-500
  "

>

<ZoomOut size={18}/>

</button>





<span

className="
 w-16
 text-center
 font-semibold
"

>

{
 Math.round(
  scale * 100
 )
}%

</span>





{/* ZOOM IN */}

<button

 onClick={zoomIn}

 className="
   rounded-xl
   border
   border-slate-700
   p-3
   hover:border-cyan-500
 "

>

<ZoomIn size={18}/>

</button>






{/* RESET */}

<button

 onClick={resetZoom}

 className="
   rounded-xl
   border
   border-slate-700
   px-4
   py-3
 "

>

Reset

</button>







{/* SHARE */}

<button

 onClick={shareDocument}

 className="
   rounded-xl
   border
   border-slate-700
   p-3
   hover:border-cyan-500
 "

>

<Share2 size={18}/>

</button>






{/* DOWNLOAD */}

<button

 onClick={downloadPDF}

 className="
   rounded-xl
   bg-cyan-500
   px-5
   py-3
   font-bold
   text-slate-950
 "

>

<Download size={18}/>

</button>




</div>


</div>


</div>







{/* PDF LAYOUT */}


<div

className="
 mx-auto
 flex
 max-w-7xl
 gap-6
 p-6
 xl:pl-96
"

>







{/* FIXED SIDEBAR */}


<aside

className="
 hidden
 xl:block
 fixed
 left-6
 top-28
 h-[calc(100vh-8rem)]
 w-72
 overflow-y-auto
 rounded-3xl
 border
 border-slate-800
 bg-slate-900
 p-5
"

>



<h2

className="
 mb-5
 text-lg
 font-black
"

>

Document Details

</h2>





<div

className="
 space-y-5
"

>



<div>


<p

className="
 text-xs
 uppercase
 tracking-widest
 text-slate-500
"

>

Title

</p>



<p

className="
 mt-2
 font-semibold
"

>

{documentData.title}

</p>


</div>







<div>


<p

className="
 text-xs
 uppercase
 tracking-widest
 text-slate-500
"

>

Category

</p>



<p

className="
 mt-2
 font-semibold
"

>

{
 documentData.category ||
 "General"
}

</p>


</div>







<div>


<p

className="
 text-xs
 uppercase
 tracking-widest
 text-slate-500
"

>

File Type

</p>



<p

className="
 mt-2
 font-semibold
 uppercase
"

>

{
 documentData.file_type ||
 "PDF"
}

</p>


</div>







{
numPages > 0 && (

<div>


<p

className="
 text-xs
 uppercase
 tracking-widest
 text-slate-500
"

>

Total Pages

</p>



<p

className="
 mt-2
 text-3xl
 font-black
 text-cyan-400
"

>

{numPages}

</p>


</div>

)

}






{
documentData.description && (

<div>


<p

className="
 text-xs
 uppercase
 tracking-widest
 text-slate-500
"

>

Description

</p>



<p

className="
 mt-2
 text-sm
 leading-7
 text-slate-400
"

>

{documentData.description}

</p>


</div>

)

}




</div>


</aside>







{/* PDF VIEWER */}


<div

className="
 flex-1
"

>


<div

className="
 overflow-hidden
 rounded-3xl
 border
 border-slate-800
 bg-slate-900
"

>


<div

className="
 flex
 items-center
 justify-between
 border-b
 border-slate-800
 px-6
 py-4
"

>


<div>


<h2

className="
 font-bold
"

>

Reading Document

</h2>



<p

className="
 text-sm
 text-slate-400
"

>

Scroll to read all pages

</p>


</div>





{
numPages > 0 && (

<span

className="
 rounded-full
 bg-cyan-500/10
 px-4
 py-2
 text-sm
 font-semibold
 text-cyan-400
"

>

{numPages} Pages

</span>

)

}



</div>




{/* PDF CONTENT */}

<div

className="
 flex
 justify-center
 overflow-auto
 bg-[#111827]
 p-8
"

>


<Document

file={fileUrl}


loading={

<div

className="
 py-24
"

>

<Loader2

size={45}

className="
 animate-spin
 text-cyan-400
"

/>

</div>

}



onLoadSuccess={

({numPages})=>{

 setNumPages(numPages);

}

}



onLoadError={

(error)=>{


console.error(
 "PDF LOAD ERROR:",
 error
);



setError(
 "Failed to load PDF file."
);


}

}


>



{

Array.from(

new Array(numPages),

(_,index)=>(


<div

key={index}

className="
 mb-8
 flex
 justify-center
"

>


<Page


pageNumber={
 index + 1
}



scale={scale}



width={pageWidth}



renderAnnotationLayer={false}



renderTextLayer={true}



/>


</div>



)

)

}



</Document>



</div>




</div>


</div>


</div>







{/* MOBILE PAGE CONTROLS */}



{

numPages > 0 && (


<div


className="
 fixed
 bottom-6
 left-1/2
 z-50
 flex
 -translate-x-1/2
 items-center
 gap-3
 rounded-full
 border
 border-slate-700
 bg-slate-900/95
 px-5
 py-3
 shadow-2xl
 backdrop-blur-xl
 xl:hidden
"



>


<button


disabled={
 pageNumber === 1
}



onClick={
 previousPage
}



className="
 rounded-full
 bg-slate-800
 p-3
 disabled:opacity-40
"


>
Scholiqeb PDF reader

<ChevronLeft size={18}/>


</button>






<span

className="
 font-semibold
"

>


{pageNumber} / {numPages}


</span>






<button


disabled={
 pageNumber === numPages
}



onClick={
 nextPage
}



className="
 rounded-full
 bg-slate-800
 p-3
 disabled:opacity-40
"


>


<ChevronRight size={18}/>


</button>





</div>


)

}



</div>


);


}