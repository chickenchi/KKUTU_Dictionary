import React, { useEffect, useRef } from "react";
import styled from "styled-components";
import { useAlert } from "./AlertProvider";

const AlertContainer = styled.div<{ isVisible: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: ${({ isVisible }) => (isVisible ? "flex" : "none")};
  align-items: center;
  justify-content: center;
  background-color: rgba(0, 0, 0, 0.5);
  font-family: "KCC-Hanbit";
  z-index: 9999;
`;

const Alert = styled.div`
  position: relative;
  background-color: rgb(250, 250, 250);
  width: auto;
  min-width: 300px;
  max-width: 500px;
  padding: 20px 25px;
  border-radius: 8px;
  box-shadow: 0px 0px 15px rgba(0, 0, 0, 0.2);
`;

const Title = styled.p`
  font-size: 18pt;
  margin-bottom: 20px;
  text-align: center;
`;

const Description = styled.p`
  font-size: 12pt;
  margin-bottom: 30px;
  text-align: center;
`;

const BtnContainer = styled.div`
  display: flex;
  justify-content: space-around;
`;

const Yes = styled.button`
  background-color: white;
  width: 100px;
  height: 35px;
  border-radius: 3px;
  border: 1px solid #000;
  font-size: 12pt;
  font-family: "KCC-Hanbit";

  &:hover {
    background-color: rgba(240, 240, 240);
  }

  &:active {
    background-color: rgba(220, 220, 220);
    transform: scale(0.98);
  }

  &:focus {
    outline: none;
  }
`;

const No = styled.button`
  background-color: white;
  width: 100px;
  height: 35px;
  border-radius: 3px;
  border: 1px solid #000;
  font-size: 12pt;
  font-family: "KCC-Hanbit";

  &:hover {
    background-color: rgba(240, 240, 240);
  }

  &:active {
    background-color: rgba(220, 220, 220);
    transform: scale(0.98);
  }

  &:focus {
    outline: none;
  }
`;

const HideInput = styled.input`
  position: absolute; /* 숨기기 */
  left: -9999px; /* 시각적으로 보이지 않게 함 */
`;

export const AlertManager = () => {
  const { alert, hideAlert } = useAlert();
  const alertRef = useRef<HTMLDivElement | null>(null); // 타입 명시
  const hideInputRef = useRef<HTMLInputElement | null>(null); // HideInput을 위한 ref

  useEffect(() => {
    if (!alert) return;

    // HideInput에 포커스 주기
    hideInputRef.current?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "Tab":
          e.preventDefault();
          break;

        case "Enter":
          e.preventDefault();
          alert?.onConfirm();
          hideAlert();
          break;

        case "Backspace":
          e.preventDefault();
          hideAlert();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [alert, hideAlert]); // alert와 hideAlert를 의존성 배열에 추가

  return (
    <AlertContainer isVisible={!!alert}>
      <Alert>
        <Title>{alert?.title}</Title>
        <Description>
          {alert?.description
            ?.split("\n")
            .map((line: string, index: number) => (
              <React.Fragment key={index}>
                {line}
                <br />
              </React.Fragment>
            ))}
        </Description>
        <BtnContainer>
          <Yes
            onClick={() => {
              alert?.onConfirm();
              hideAlert();
            }}
          >
            네
          </Yes>
          <No onClick={hideAlert}>아니요</No>
        </BtnContainer>
      </Alert>
      <HideInput type="text" ref={hideInputRef} />
    </AlertContainer>
  );
};
