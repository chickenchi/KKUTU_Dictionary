import React from "react";
import { AlertProvider } from "./tools/alertFunction/AlertProvider";
import { AlarmProvider } from "./tools/alarmFunction/AlarmProvider";
import { WordProvider } from "./tools/wordFunction/WordProvider";
import { WaitProvider } from "./tools/waitFunction/WaitProvider";

interface AllProvidersProps {
  children: React.ReactNode;
}

const AllProviders = ({ children }: AllProvidersProps) => {
  return (
    <AlertProvider>
      <AlarmProvider>
        <WaitProvider>
          <WordProvider>{children}</WordProvider>
        </WaitProvider>
      </AlarmProvider>
    </AlertProvider>
  );
};

export default AllProviders;
