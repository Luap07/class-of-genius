import React, {
  createContext,
  useContext
} from "react";


import useAdminUsers from "../../hooks/admin/useAdminUsers";
import useAdminCourses from "../../hooks/admin/useAdminCourses";
import useAdminPayments from "../../hooks/admin/useAdminPayments";
import useAdminAnalytics from "../../hooks/admin/useAdminAnalytics";
import useAdminUpload from "../../hooks/admin/useAdminUpload";


const AdminContext = createContext();



export const AdminProvider = ({
  children
}) => {


  const users =
    useAdminUsers();


  const courses =
    useAdminCourses();


  const payments =
    useAdminPayments();


  const analytics =
    useAdminAnalytics();


  const upload =
    useAdminUpload();



  const value = {

    // Users
    users,


    // Courses
    courses,


    // Payments
    payments,


    // Analytics
    analytics,


    // Uploads
    upload

  };



  return (

    <AdminContext.Provider value={value}>

      {children}

    </AdminContext.Provider>

  );

};




export const useAdmin = () => {

  const context =
    useContext(
      AdminContext
    );


  if (!context) {

    throw new Error(
      "useAdmin must be used inside AdminProvider"
    );

  }


  return context;

};



export default AdminContext;