import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import styled from "styled-components";

const AlertDiv = styled.div`
  height: auto;
`;

interface AlertContextType {
  alert: { title: string; description: string; onConfirm: () => void } | null;
  showAlert: (alertData: {
    title: string;
    description: string;
    onConfirm: () => void;
  }) => void;
  hideAlert: () => void;
}

const AlertContext = createContext<AlertContextType | null>(null);

export const useAlert = () => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error("useAlert must be used within an AlertProvider");
  }
  return context;
};

export const AlertProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [alert, setAlert] = useState<AlertContextType["alert"]>(null);
  const alertRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "Tab":
          e.preventDefault();
          break;

        case "Enter":
          if (alert) {
            alert.onConfirm();
            hideAlert();
          }
          break;

        case "Backspace":
          hideAlert();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [alert]);

  const showAlert = (alertData: AlertContextType["alert"]) =>
    setAlert(alertData);
  const hideAlert = () => setAlert(null);

  return (
    <AlertContext.Provider value={{ alert, showAlert, hideAlert }}>
      {children}
    </AlertContext.Provider>
  );
};
