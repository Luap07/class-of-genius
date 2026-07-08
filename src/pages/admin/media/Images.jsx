import React, { useMemo, useState } from "react";
import {
  Search,
  Upload,
  Trash2,
  Eye,
  Image as ImageIcon,
  Filter,
} from "lucide-react";


const imageData = [
  {
    id:1,
    name:"Physics Motion Lab",
    category:"Virtual Lab",
    size:"2.4 MB",
    date:"July 7, 2026",
    url:"https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa",
  },
  {
    id:2,
    name:"Mathematics Course Cover",
    category:"Courses",
    size:"1.8 MB",
    date:"July 5, 2026",
    url:"https://images.unsplash.com/photo-1509228468518-180dd4864904",
  },
  {
    id:3,
    name:"Novel Cover Design",
    category:"Novels",
    size:"900 KB",
    date:"July 3, 2026",
    url:"https://images.unsplash.com/photo-1543002588-bfa74002ed7e",
  },
];


const categories = [
  "All",
  "Courses",
  "Virtual Lab",
  "Novels",
  "Profile",
];



const Images = ()=>{


  const [images,setImages] = useState(imageData);

  const [search,setSearch] = useState("");

  const [category,setCategory] = useState("All");




  const deleteImage=(id)=>{


    setImages(prev=>

      prev.filter(
        image=>image.id!==id
      )

    );


  };





  const filteredImages = useMemo(()=>{


    return images.filter(image=>{


      const searchMatch =

      image.name
      .toLowerCase()
      .includes(search.toLowerCase());



      const categoryMatch =

      category==="All"

      ||

      image.category===category;



      return searchMatch && categoryMatch;


    });


  },[
    images,
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


            <ImageIcon/>

            Images


          </h1>


          <p className="
          text-gray-400
          mt-2
          ">

            Manage platform images and assets

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

          Upload Image


        </button>



      </div>







      {/* Controls */}



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

          placeholder="Search images..."

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









      {/* Gallery */}



      <div className="
      grid
      sm:grid-cols-2
      lg:grid-cols-3
      xl:grid-cols-4
      gap-6
      ">




      {
        filteredImages.map(image=>(


          <div

          key={image.id}

          className="
          bg-slate-900
          border
          border-slate-800
          rounded-2xl
          overflow-hidden
          "

          >



            <img

            src={image.url}

            alt={image.name}

            className="
            h-44
            w-full
            object-cover
            "

            />





            <div className="p-4">



              <h3 className="
              font-semibold
              truncate
              ">

                {image.name}

              </h3>




              <p className="
              text-sm
              text-gray-400
              mt-1
              ">

                {image.category}

              </p>




              <div className="
              flex
              justify-between
              text-xs
              text-gray-400
              mt-3
              ">


                <span>
                  {image.size}
                </span>


                <span>
                  {image.date}
                </span>


              </div>





              <div className="
              flex
              gap-2
              mt-4
              ">



                <button className="
                flex-1
                bg-slate-800
                rounded-lg
                py-2
                flex
                justify-center
                ">

                  <Eye size={16}/>

                </button>





                <button

                onClick={()=>deleteImage(image.id)}

                className="
                flex-1
                bg-red-500/20
                text-red-400
                rounded-lg
                py-2
                flex
                justify-center
                "

                >

                  <Trash2 size={16}/>

                </button>



              </div>



            </div>



          </div>


        ))
      }



      </div>







      {
        filteredImages.length===0 && (

          <div className="
          mt-10
          text-center
          text-gray-400
          ">

            No images found

          </div>

        )
      }




    </div>

  );

};


export default Images;