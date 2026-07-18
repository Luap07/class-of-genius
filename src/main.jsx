// src/main.jsx

import React from "react";
import ReactDOM from "react-dom/client";

import App from "./App";
import "./index.css";

import "katex/dist/katex.min.css";


// ================= CONTEXTS =================

import { AuthProvider } 
from "./context/AuthContext";

import { ConnectProvider } 
from "./context/ConnectContext";

import { SupportProvider } 
from "./context/SupportContext";

import { ProfileProvider } 
from "./context/LMSContext/ProfileContext";





ReactDOM.createRoot(
  document.getElementById("root")
).render(

  <React.StrictMode>

    <AuthProvider>

      <ConnectProvider>

        <SupportProvider>

          <ProfileProvider>

            <App />

          </ProfileProvider>

        </SupportProvider>

      </ConnectProvider>

    </AuthProvider>

  </React.StrictMode>

);