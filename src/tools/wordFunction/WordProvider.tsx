import React, { createContext, useContext, useState } from "react";
import { useRecoilState } from "recoil";
import { wordValueState } from "../../RecoilAtoms/common/Atom";

const WordContext = createContext<any>(null);

export const WordProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [wordValue, setWordValue] = useRecoilState(wordValueState);

  return (
    <WordContext.Provider value={{ wordValue, setWordValue }}>
      {children}
    </WordContext.Provider>
  );
};

export const useWord = () => useContext(WordContext);
