// src/context/LMSContext.jsx

import React from "react";

import {
  CourseProvider
} from "./LMSContext/CourseContext";

import {
  ProgressProvider
} from "./LMSContext/ProgressContext";

import {
  WeeklyTaskProvider
} from "./LMSContext/WeeklyTaskContext";

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

        <WeeklyTaskProvider>

          <CertificateProvider>

            <AchievementProvider>

              {children}

            </AchievementProvider>

          </CertificateProvider>

        </WeeklyTaskProvider>

      </ProgressProvider>

    </CourseProvider>

  );

};



export { LMSProvider };


export default LMSProvider;