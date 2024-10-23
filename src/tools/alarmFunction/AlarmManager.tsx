import React, { useEffect } from "react";
import { useAlarm } from "./AlarmProvider";
import styled from "styled-components";
import { useWaiting } from "../waitFunction/WaitProvider";

const AlarmContainer = styled.div`
  position: fixed;
  right: 0;
  background-color: rgb(255, 255, 255);
  width: 300px;
  height: 70px;
  border-radius: 10px 0 0 0;
  box-shadow: 10px 10px 20px rgba(0, 0, 0, 0.3);

  display: flex;
  align-items: center;

  font-family: "KCC-Hanbit";

  z-index: 2;
`;

const Description = styled.p`
  margin-left: 15px;
  font-size: 11pt;
`;

const Bar = styled.div<{ iconType: string; remainedTime: number }>`
  position: absolute;
  background-color: ${({ iconType }) =>
    iconType === "error" ? "red" : iconType === "warning" ? "yellow" : "blue"};
  height: 3px;
  width: ${({ remainedTime }) => `${remainedTime}%`};
  bottom: 0;
`;

const Icon = styled.img`
  margin-left: 15px;
  width: 40px;
  height: 40px;
`;

export const AlarmManager: React.FC = () => {
  const { alarmIcon, alarmDescription, remainedTime, showAlarm } = useAlarm();

  return (
    <>
      {showAlarm && (
        <Alarm
          iconType={alarmIcon}
          description={alarmDescription}
          remainedTime={remainedTime}
        />
      )}
    </>
  );
};

interface AlarmProps {
  iconType: string;
  description: string;
  remainedTime: number;
}

export const Alarm: React.FC<AlarmProps> = ({
  iconType,
  description,
  remainedTime,
}) => {
  const { showAlarm } = useAlarm();

  const { setWaiting } = useWaiting();

  useEffect(() => {
    if (showAlarm) setWaiting(false);
  }, [showAlarm]);

  return (
    <AlarmContainer>
      <Icon
        rel="preload"
        src={
          iconType === "error"
            ? "./image/Error.png"
            : iconType === "warning"
            ? "./image/Warning.png"
            : "./image/Success.png"
        }
      />
      <Description>{description}</Description>
      <Bar iconType={iconType} remainedTime={remainedTime} />
    </AlarmContainer>
  );
};
