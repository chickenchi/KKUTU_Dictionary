import React, { SetStateAction, useEffect, useRef, useState } from "react";
import Modal from "react-modal";
import styled, { createGlobalStyle } from "styled-components";
import { jaccardSimilarity } from "../../components/functions/JaccardSimilarity";
import { subjectOptions } from "../../commonFunctions/SubjectOptions";

import { useRecoilState } from "recoil";
import { modalState } from "../../Atom";

// 전역 스타일을 설정합니다.
const GlobalStyle = createGlobalStyle`
  body {
    margin: 0;
    font-family: Arial, sans-serif;
  }

  .ReactModal__Overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.7); /* 오버레이 배경색 */
    z-index: 9998; /* 모달보다 아래에 위치 */
  }
`;

// 모달 스타일을 위한 Styled component
const StyledModal = styled(Modal)`
  &.ReactModal__Content {
    position: relative;
    top: 50%;
    left: 50%;

    background-color: rgb(250, 250, 250);

    max-width: 550px;
    width: 100%;
    height: 500px;

    padding: 30px;

    border-radius: 5px;

    transform: translate(-50%, -50%);

    display: flex;
    align-items: center;
    flex-direction: column;

    z-index: 9999;
  }
`;

const Title = styled.h2`
  margin-bottom: 20px;
`;

const SearchDiv = styled.div`
  width: 90%;
  height: 35px;

  margin-bottom: 20px;
`;

const SearchInput = styled.input`
  background-color: rgb(255, 255, 255);

  padding: 10px;

  width: 75%;
  height: 100%;

  margin: 0 10px;

  border: none;
  border-radius: 5px;

  color: rgb(80, 80, 80);
  font-size: 11pt;
`;

const SearchButton = styled.button`
  background-color: rgb(215, 215, 215);

  width: 20%;
  height: 100%;

  border: none;
  border-radius: 5px;
`;

const SubjectList = styled.div`
  background-color: rgb(238, 238, 238);

  width: 90%;
  height: 300px;

  padding: 10px;

  border-radius: 5px;

  overflow-x: auto;
  overflow-y: none;
`;

const SubjectItem = styled.button<{ element: boolean }>`
  background-color: ${({ element }) =>
    element ? "rgb(225, 225, 225)" : "rgba(0, 0, 0, 0)"};

  border: none;

  width: 100%;
  height: 30px;

  margin: 5px 0;

  padding-left: 10px;

  display: flex;
  align-items: center;

  font-size: 12pt;

  &:hover {
    background-color: rgb(230, 230, 230);
  }
`;

const ButtonContainer = styled.div`
  position: absolute;
  bottom: 20px;

  width: 100%;

  display: flex;
  justify-content: center;
  align-items: center;
`;

const Close = styled.button`
  width: 60px;
  height: 35px;

  margin-right: 10px;

  border: none;
  border-radius: 5px;
`;

interface SubjectModalProps {
  setSubjectChange: (e: any) => void;
}

function SubjectModal({ setSubjectChange }: SubjectModalProps) {
  const [isOpen, setIsOpen] = useRecoilState(modalState);

  const [subject, setSubject] = useState("");
  const [result, setResult] = useState<string[]>([]);
  const [selected, setSelected] = useState("");

  const searchInput = useRef<HTMLInputElement | null>(null);

  const handleModalSubjectChange = (e: any) => {
    setSubject(e.target.value);
  };

  useEffect(() => {
    Search();

    setTimeout(() => {
      if (searchInput.current) {
        searchInput.current.focus();
      }
    }, 0);
  }, [isOpen]);

  const Search = () => {
    setSelected("");

    let similarity: { subject: string; score: number }[] = [
      {
        subject: "",
        score: 0,
      },
    ];

    subjectOptions.forEach((el) => {
      let subjectName = el.label;
      if (!subjectName.includes("-") && subjectName !== "") {
        let score = jaccardSimilarity(subject, subjectName);

        similarity.push({ subject: subjectName, score: score });
      }
    });

    similarity.sort((a, b) => b.score - a.score);

    let items: string[] = [];

    similarity.forEach((el) => {
      if (el.score || !subject) items.push(el.subject);
    });

    setResult(items);
  };

  const handleKeyDown = (e: any) => {
    if (e.key === "Enter") {
      e.preventDefault();
      Search();
    }
  };

  return (
    <>
      <GlobalStyle />
      <StyledModal
        isOpen={isOpen}
        onRequestClose={() => setIsOpen(false)}
        className="ReactModal__Content"
        overlayClassName="ReactModal__Overlay"
      >
        <Title>단어 주제 변경</Title>

        <SearchDiv>
          <SearchInput
            value={subject}
            onChange={handleModalSubjectChange}
            onKeyDown={handleKeyDown}
            placeholder="주제를 입력해 주세요"
            ref={searchInput}
          />
          <SearchButton onClick={Search}>검색</SearchButton>
        </SearchDiv>

        <SubjectList>
          {result.map(
            (subject, index) =>
              subject && (
                <SubjectItem
                  onClick={() => setSelected(subject)}
                  element={subject === selected}
                  key={index}
                >
                  {subject}
                </SubjectItem>
              )
          )}
        </SubjectList>

        <ButtonContainer>
          {selected && (
            <Close
              onClick={() => {
                setIsOpen(false);
                setSubjectChange(selected);
              }}
            >
              선택
            </Close>
          )}
          <Close onClick={() => setIsOpen(false)}>닫기</Close>
        </ButtonContainer>
      </StyledModal>
    </>
  );
}

export default SubjectModal;
