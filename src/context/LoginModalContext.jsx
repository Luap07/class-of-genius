import { createContext, useState } from "react";

export const LoginModalContext = createContext();

export const LoginModalProvider = ({ children }) => {
  const [showLogin, setShowLogin] = useState(false);

  return (
    <LoginModalContext.Provider
      value={{
        showLogin,
        setShowLogin,
      }}
    >
      {children}
    </LoginModalContext.Provider>
  );
};