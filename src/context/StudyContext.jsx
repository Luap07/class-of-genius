import { createContext, useState } from 'react';

export const StudyContext = createContext();

export const StudyProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const logout = () => {
    setUser(null);
    localStorage.removeItem('token');
  };

  return (
    <StudyContext.Provider value={{ user, setUser, logout }}>
      {children}
    </StudyContext.Provider>
  );
};