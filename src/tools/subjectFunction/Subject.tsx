import React, { SetStateAction, useEffect, useRef, useState } from "react";
import Modal from "react-modal";
import styled, { createGlobalStyle } from "styled-components";
import { jaccardSimilarity } from "../../components/functions/JaccardSimilarity";
import { subjectOptions } from "../../commonFunctions/SubjectOptions";

import { useRecoilState } from "recoil";
import { modalState } from "../../RecoilAtoms/common/Atom";
import {
  getFromLocalStorage,
  saveToLocalStorage,
} from "../../commonFunctions/LocalStorage";

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

  display: flex;
  align-items: center;
`;

const SearchInput = styled.input`
  background-color: rgb(255, 255, 255);

  padding: 10px;

  width: 87%;
  height: 100%;

  margin: 0 10px;

  border: none;
  border-radius: 5px;

  color: rgb(80, 80, 80);
  font-size: 11pt;
`;

const RecentSearchesButton = styled.img`
  width: 30px;
  height: 30px;
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
  position: relative;

  background-color: ${({ element }) =>
    element ? "rgb(225, 225, 225)" : "rgba(255, 255, 255, 0)"};

  border: none;

  width: 100%;
  height: 30px;

  margin-bottom: 6px;

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

  const [searchMode, setSearchMode] = useState<"recent" | "subject">("subject");
  const [subject, setSubject] = useState("");
  const [result, setResult] = useState<string[]>([]);
  const [selected, setSelected] = useState("");
  const [searchList, setSearchList] = useState<string[]>([]);

  const searchInput = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    search(subject);
  }, [subject]);

  const handleModalSubjectChange = (e: any) => {
    setSubject(e.target.value);
  };

  useEffect(() => {
    search(subject);

    setTimeout(() => {
      if (searchInput.current) {
        searchInput.current.focus();
      }
    }, 0);
  }, [isOpen]);

  useEffect(() => {
    const getSearchList = async () => {
      const search = await getFromLocalStorage("searchList");

      if (searchList !== null) setSearchList(search);
    };

    getSearchList();
  }, []);

  const search = async (subject: string) => {
    setSelected("");

    setSearchMode("subject");

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

  const switchSearchMode = () => {
    setSearchMode(searchMode === "subject" ? "recent" : "subject");
  };

  const handleKeyDown = (e: any) => {
    if (e.key === "Enter") {
      e.preventDefault();
      search(subject);
    }
  };

  const saveSearchMode = async () => {
    const searchList = await getFromLocalStorage("searchList");
    let updatedList: string[] = [];
    if (searchList === null) {
      updatedList = [subject];
      saveToLocalStorage("searchList", updatedList);
    } else {
      updatedList = [...searchList, subject];
      saveToLocalStorage("searchList", updatedList);
    }

    setSearchList(updatedList);
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
            onBlur={saveSearchMode}
            placeholder="주제를 입력해 주세요"
            ref={searchInput}
          />
          <RecentSearchesButton
            src={
              searchMode === "subject"
                ? "./image/recent.png"
                : "./image/search.png"
            }
            onClick={switchSearchMode}
          />
        </SearchDiv>

        <SubjectList>
          {searchMode === "subject"
            ? result.map(
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
              )
            : searchList.reverse().map(
                (subject, index) =>
                  subject && (
                    <SubjectItem
                      onClick={() => search(subject)}
                      element={false}
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
