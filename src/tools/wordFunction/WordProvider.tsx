import React, { createContext, useContext, useState } from "react";

const WordContext = createContext<any>(null);

export const WordProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [wordValue, setWordValue] = useState("");

  return (
    <WordContext.Provider value={{ wordValue, setWordValue }}>
      {children}
    </WordContext.Provider>
  );
};

export const useWord = () => useContext(WordContext);
