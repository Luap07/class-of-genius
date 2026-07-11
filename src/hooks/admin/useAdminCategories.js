import {
  useEffect,
  useState,
} from "react";


import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../../services/admin/adminCategoryService";





const useAdminCategories = () => {


  const [categories, setCategories] = useState([]);


  const [loading, setLoading] = useState(false);


  const [error, setError] = useState(null);









  // =====================================
  // FETCH CATEGORIES
  // =====================================

  const fetchCategories = async () => {


    try {


      setLoading(true);

      setError(null);



      const data =
        await getCategories();



      setCategories(data || []);




    } catch (err) {


      console.error(
        "Fetch categories error:",
        err
      );


      setError(
        err.message
      );


    } finally {


      setLoading(false);


    }


  };









  // =====================================
  // ADD CATEGORY
  // =====================================

  const addCategory = async (
    categoryData
  ) => {


    try {


      setError(null);



      const newCategory =
        await createCategory(
          categoryData
        );



      setCategories(
        (prev)=>[
          newCategory,
          ...prev
        ]
      );



      return newCategory;



    } catch(err) {


      console.error(
        "Add category error:",
        err
      );


      setError(
        err.message
      );


      throw err;


    }


  };









  // =====================================
  // UPDATE CATEGORY
  // =====================================

  const editCategory = async (
    id,
    categoryData
  ) => {


    try {


      setError(null);



      const updatedCategory =
        await updateCategory(
          id,
          categoryData
        );





      setCategories(
        (prev)=>

          prev.map(
            (category)=>

              category.id === id

              ?

              {
                ...category,
                ...updatedCategory
              }

              :

              category

          )

      );



      return updatedCategory;



    } catch(err) {


      console.error(
        "Update category error:",
        err
      );


      setError(
        err.message
      );


      throw err;


    }


  };









  // =====================================
  // DELETE CATEGORY
  // =====================================

  const removeCategory = async (
    id
  ) => {


    try {


      setError(null);



      await deleteCategory(
        id
      );





      setCategories(
        (prev)=>

          prev.filter(
            (category)=>

              category.id !== id

          )

      );




    } catch(err) {


      console.error(
        "Delete category error:",
        err
      );


      setError(
        err.message
      );


      throw err;


    }


  };









  useEffect(()=>{


    fetchCategories();


  }, []);









  return {


    categories,


    loading,


    error,


    fetchCategories,


    addCategory,


    editCategory,


    removeCategory,


  };


};



export default useAdminCategories;