import { useEffect, useState } from "react";
import { useWord } from "../wordFunction/WordProvider";

const useCommand = () => {
  const [visible, setVisible] = useState<boolean>(false);
  const {} = useWord();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === "/") {
        setVisible(true);
      }

      if (!visible) return;

      switch (e.key) {
        case "Tab":
          e.preventDefault();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [visible]);

  const hideCommandManager = () => setVisible(false);

  return { visible, hideCommandManager };
};

export default useCommand;
