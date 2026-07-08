import React, { useMemo, useState } from "react";
import {
  Search,
  Upload,
  Trash2,
  FileText,
  Eye,
  Download,
  Filter,
} from "lucide-react";


const pdfData = [
  {
    id:1,
    name:"Physics Formula Sheet",
    category:"Notes",
    size:"5 MB",
    pages:"24 pages",
    date:"July 7, 2026",
  },
  {
    id:2,
    name:"WAEC Mathematics Revision Guide",
    category:"Exam Prep",
    size:"12 MB",
    pages:"86 pages",
    date:"July 5, 2026",
  },
  {
    id:3,
    name:"Chemistry Practical Manual",
    category:"Virtual Lab",
    size:"18 MB",
    pages:"120 pages",
    date:"July 2, 2026",
  },
];


const categories = [
  "All",
  "Notes",
  "Exam Prep",
  "Virtual Lab",
  "Courses",
];



const PDFs = ()=>{


  const [files,setFiles] = useState(pdfData);

  const [search,setSearch] = useState("");

  const [category,setCategory] = useState("All");





  const deletePDF=(id)=>{


    setFiles(prev=>

      prev.filter(
        file=>file.id!==id
      )

    );


  };






  const filteredFiles = useMemo(()=>{


    return files.filter(file=>{


      const searchMatch =

      file.name
      .toLowerCase()
      .includes(search.toLowerCase());



      const categoryMatch =

      category==="All"

      ||

      file.category===category;



      return searchMatch && categoryMatch;


    });


  },[
    files,
    search,
    category
  ]);





  return (

    <div className="p-6 text-white">



      {/* Header */}


      <div className="
      flex
      flex-col
      md:flex-row
      justify-between
      gap-4
      mb-8
      ">


        <div>


          <h1 className="
          text-3xl
          font-bold
          flex
          items-center
          gap-3
          ">

            <FileText/>

            PDF Documents

          </h1>


          <p className="
          text-gray-400
          mt-2
          ">

            Manage educational documents and resources

          </p>


        </div>





        <button className="
        bg-blue-600
        hover:bg-blue-700
        px-5
        py-3
        rounded-xl
        flex
        items-center
        gap-2
        ">


          <Upload size={18}/>

          Upload PDF


        </button>



      </div>









      {/* Filters */}



      <div className="
      flex
      flex-col
      md:flex-row
      gap-4
      mb-8
      ">



        <div className="
        flex
        items-center
        flex-1
        bg-slate-900
        border
        border-slate-800
        rounded-xl
        px-4
        ">


          <Search
          size={18}
          className="text-gray-400"
          />


          <input

          value={search}

          onChange={(e)=>setSearch(e.target.value)}

          placeholder="Search PDFs..."

          className="
          bg-transparent
          outline-none
          px-3
          py-3
          w-full
          "

          />



        </div>







        <div className="
        flex
        items-center
        gap-2
        bg-slate-900
        border
        border-slate-800
        rounded-xl
        px-4
        ">


          <Filter size={16}/>


          <select

          value={category}

          onChange={(e)=>setCategory(e.target.value)}

          className="
          bg-transparent
          outline-none
          "

          >

            {
              categories.map(item=>(

                <option
                key={item}
                className="bg-slate-900"
                >

                  {item}

                </option>

              ))
            }

          </select>



        </div>




      </div>









      {/* PDF List */}



      <div className="space-y-4">



      {
        filteredFiles.map(file=>(


          <div

          key={file.id}

          className="
          bg-slate-900
          border
          border-slate-800
          rounded-2xl
          p-5
          flex
          flex-col
          md:flex-row
          justify-between
          gap-4
          "

          >



            <div className="
            flex
            gap-4
            items-center
            ">


              <div className="
              bg-red-500/20
              text-red-400
              p-4
              rounded-xl
              ">

                <FileText/>

              </div>




              <div>

                <h3 className="
                font-semibold
                ">

                  {file.name}

                </h3>



                <p className="
                text-gray-400
                text-sm
                mt-1
                ">

                  {file.category}

                </p>




                <div className="
                text-xs
                text-gray-400
                mt-2
                flex
                gap-4
                ">


                  <span>
                    {file.size}
                  </span>


                  <span>
                    {file.pages}
                  </span>


                  <span>
                    {file.date}
                  </span>


                </div>


              </div>


            </div>







            <div className="
            flex
            gap-2
            ">



              <button className="
              bg-slate-800
              rounded-lg
              px-4
              flex
              items-center
              gap-2
              ">

                <Eye size={16}/>

                View

              </button>





              <button className="
              bg-slate-800
              rounded-lg
              px-4
              flex
              items-center
              gap-2
              ">

                <Download size={16}/>

                Download

              </button>






              <button

              onClick={()=>deletePDF(file.id)}

              className="
              bg-red-500/20
              text-red-400
              rounded-lg
              px-4
              "

              >

                <Trash2 size={16}/>

              </button>



            </div>




          </div>


        ))
      }



      </div>








      {
        filteredFiles.length===0 && (

          <div className="
          text-center
          text-gray-400
          mt-10
          ">

            No PDF documents found

          </div>

        )
      }





    </div>

  );

};


export default PDFs;