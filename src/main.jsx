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
            <App />
          </ProfileProvider>
        </SupportProvider>
      </ConnectProvider>
    </AuthProvider>
  </React.Fragment>
);