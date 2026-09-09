// src/main.jsx

import React from "react";
import ReactDOM from "react-dom/client";

import "./index.css";
import "katex/dist/katex.min.css";
import cog from "./assets/cog.png";

import App from "./App";

/* ===========================
   GLOBAL PROVIDERS
=========================== */

import { AuthProvider } from "./context/AuthContext";
import { ConnectProvider } from "./context/ConnectContext";
import { SupportProvider } from "./context/SupportContext";
import { ProfileProvider } from "./context/LMSContext/ProfileContext";
import { SearchProvider } from "./context/SearchContext";
import { CourseProvider } from "./context/LMSContext/CourseContext";

/* ===========================
   APP
=========================== */

document.querySelector('link[rel="icon"]').href = cog;

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.Fragment>
    <AuthProvider>
      <ConnectProvider>
        <SupportProvider>
          <ProfileProvider>
            <SearchProvider>
              <CourseProvider>
                <App />
              </CourseProvider>
            </SearchProvider>
          </ProfileProvider>
        </SupportProvider>
      </ConnectProvider>
    </AuthProvider>
  </React.Fragment>
);