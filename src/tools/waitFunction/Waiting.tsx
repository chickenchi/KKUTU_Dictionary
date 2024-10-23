import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { useWaiting } from "./WaitProvider";

const WaitingDiv = styled.div<{ visible: boolean }>`
  position: fixed;

  background-color: rgb(0, 0, 0, 0.8);

  bottom: 0;
  left: 0;

  width: 100%;
  height: 100%;

  display: ${({ visible }) => (visible ? "flex" : "none")};
  justify-content: center;
  align-items: center;
  flex-direction: column;

  font-family: "Pretendard";

  z-index: 9999;
`;

const Description = styled.p`
  margin-top: 30px;

  color: white;
  font-size: 20pt;
`;

const LongWaitMessage = styled.p`
  margin-top: 20px;
  color: yellow;
  font-size: 12pt;
`;

const Waiting = () => {
  const { waiting } = useWaiting();
  const [isLongWait, setIsLongWait] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (waiting) {
      // 10초 후에 메시지를 표시
      timer = setTimeout(() => {
        setIsLongWait(true);
      }, 10000); // 10초 (10000ms)
    }

    return () => {
      // 컴포넌트가 언마운트되거나 waiting이 변경될 때 타이머를 정리
      clearTimeout(timer);
      setIsLongWait(false); // 상태 초기화
    };
  }, [waiting]);

  return (
    <WaitingDiv visible={waiting}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 100 100"
        width="100"
        height="100"
      >
        <circle
          cx="50"
          cy="50"
          r="40"
          stroke="white"
          stroke-width="10"
          fill="none"
          stroke-linecap="round"
          stroke-dasharray="150 50"
          stroke-dashoffset="0"
          transform="rotate(-90 50 50)"
        >
          <animateTransform
            attributeName="transform"
            type="rotate"
            from="0 50 50"
            to="360 50 50"
            dur="1s"
            repeatCount="indefinite"
          />
        </circle>
      </svg>

      <Description>요청을 기다리고 있습니다...</Description>

      {isLongWait && (
        <LongWaitMessage>
          시간이 오래 걸리고 있습니다. 잠시만 더 기다려 주세요...
        </LongWaitMessage>
      )}
    </WaitingDiv>
  );
};

export default Waiting;
