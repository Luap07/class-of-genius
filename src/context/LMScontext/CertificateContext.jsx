// src/context/CertificateContext.jsx

import React, { createContext, useContext, useEffect, useState } from "react";


// Create Context
const CertificateContext = createContext();


// Storage Key
const CERTIFICATE_STORAGE_KEY = "lms_certificates";


// Default Data
const defaultCertificates = [];




// Provider
export const CertificateProvider = ({ children }) => {


  const [certificates, setCertificates] = useState(
    defaultCertificates
  );







  // Load certificates
  useEffect(() => {


    const savedCertificates =
      localStorage.getItem(
        CERTIFICATE_STORAGE_KEY
      );


    if(savedCertificates){

      setCertificates(
        JSON.parse(savedCertificates)
      );

    }


  }, []);







  // Save certificates
  useEffect(() => {


    localStorage.setItem(

      CERTIFICATE_STORAGE_KEY,

      JSON.stringify(certificates)

    );


  }, [

    certificates

  ]);









  // Generate Certificate
  const generateCertificate = (
    course
  ) => {


    const existingCertificate =
      certificates.find(

        certificate =>

        certificate.courseId === course.id

      );



    if(existingCertificate){

      return existingCertificate;

    }







    const certificate = {


      id:
        Date.now(),


      certificateId:
        `CERT-${Date.now()}`,


      courseId:
        course.id,


      courseTitle:
        course.title,


      student:
        "Student",


      issuedDate:
        new Date().toISOString(),


      status:
        "completed"


    };






    setCertificates(prev => [

      ...prev,

      certificate

    ]);




    return certificate;


  };









  // Remove certificate
  const removeCertificate = (
    certificateId
  ) => {


    setCertificates(prev =>


      prev.filter(

        certificate =>

        certificate.id !== certificateId

      )


    );


  };









  // Find certificate
  const getCertificate = (
    certificateId
  ) => {


    return certificates.find(

      certificate =>

      certificate.id === certificateId

    );


  };









  // Verify certificate
  const verifyCertificate = (
    verificationId
  ) => {


    return certificates.find(

      certificate =>

      certificate.certificateId === verificationId

    );


  };









  // Get certificates by course
  const getCourseCertificate = (
    courseId
  ) => {


    return certificates.find(

      certificate =>

      certificate.courseId === courseId

    );


  };









  // Total certificates
  const totalCertificates =
    certificates.length;









  return (

    <CertificateContext.Provider

      value={{

        certificates,

        generateCertificate,

        removeCertificate,

        getCertificate,

        verifyCertificate,

        getCourseCertificate,

        totalCertificates

      }}

    >

      {children}

    </CertificateContext.Provider>

  );


};









// Custom Hook
export const useCertificates = () => {


  const context =
    useContext(
      CertificateContext
    );



  if(!context){


    throw new Error(
      "useCertificates must be used inside CertificateProvider"
    );


  }



  return context;


};






export default CertificateContext;