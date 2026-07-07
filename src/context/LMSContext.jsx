// src/context/LMSContext.jsx

import React from "react";

import {
  CourseProvider
} from "./LMSContext/CourseContext";

import {
  ProgressProvider
} from "./LMSContext/ProgressContext";

import {
  AssignmentProvider
} from "./LMSContext/AssignmentContext";

import {
  CertificateProvider
} from "./LMSContext/CertificateContext";

import {
  AchievementProvider
} from "./LMSContext/AchievementContext";



const LMSProvider = ({ children }) => {

  return (

    <CourseProvider>

      <ProgressProvider>

        <AssignmentProvider>

          <CertificateProvider>

            <AchievementProvider>

              {children}

            </AchievementProvider>

          </CertificateProvider>

        </AssignmentProvider>

      </ProgressProvider>

    </CourseProvider>

  );

};



export { LMSProvider };


export default LMSProvider;