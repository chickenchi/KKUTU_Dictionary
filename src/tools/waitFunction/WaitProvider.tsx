import React, { createContext, useContext, useEffect, useState } from "react";

const WordContext = createContext<any>(null);

export const WaitProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [waiting, setWaiting] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (waiting)
        if (e.ctrlKey || e.key || e.altKey) {
          e.preventDefault();
        }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [waiting]);

  return (
    <WordContext.Provider value={{ waiting, setWaiting }}>
      {children}
    </WordContext.Provider>
  );
};

export const useWaiting = () => useContext(WordContext);
