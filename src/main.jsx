import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

import "katex/dist/katex.min.css";

import { AuthProvider } from "./context/AuthContext";
import { ConnectProvider } from "./context/ConnectContext";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      <ConnectProvider>
        <App />
      </ConnectProvider>
    </AuthProvider>
  </React.StrictMode>
);