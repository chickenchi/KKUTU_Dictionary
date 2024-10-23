import React, { createContext, useContext, useState, useEffect } from "react";

interface AlarmContextType {
  alarmIcon: string;
  alarmDescription: string;
  remainedTime: number;
  showAlarm: boolean;
  setAlarm: (icon: string, description: string) => void;
  hideAlarm: () => void;
}

const AlarmContext = createContext<AlarmContextType | null>(null);

export const useAlarm = () => {
  const context = useContext(AlarmContext);
  if (!context) {
    throw new Error("useAlarm must be used within an AlarmProvider");
  }
  return context;
};

export const AlarmProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [showAlarm, setShowAlarm] = useState<boolean>(false);
  const [alarmIcon, setAlarmIcon] = useState<string>("");
  const [alarmDescription, setAlarmDescription] = useState<string>("");
  const [remainedTime, setRemainedTime] = useState<number>(0);

  const setAlarm = (icon: string, description: string) => {
    setShowAlarm(true);
    setAlarmIcon(icon);
    setAlarmDescription(description);
    setRemainedTime(100); // 알람이 100%에서 시작
  };

  const hideAlarm = () => {
    setShowAlarm(false);
    setAlarmIcon("");
    setAlarmDescription("");
  };

  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;

    if (showAlarm && remainedTime > 0) {
      timer = setInterval(() => {
        setRemainedTime((prevTime) => {
          if (prevTime <= 1) {
            hideAlarm();
            return 0;
          }
          return prevTime - 1;
        });
      }, 30);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [showAlarm, remainedTime]);

  return (
    <AlarmContext.Provider
      value={{
        alarmIcon,
        alarmDescription,
        remainedTime,
        showAlarm,
        setAlarm,
        hideAlarm,
      }}
    >
      {children}
    </AlarmContext.Provider>
  );
};
