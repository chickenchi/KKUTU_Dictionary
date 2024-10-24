import React, { useState } from "react";
import Modal from "react-modal";
import styled, { createGlobalStyle } from "styled-components";

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

    max-width: 500px;
    width: 100%;
    height: 500px;

    padding: 20px;

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
`;

const SearchInput = styled.input`
  margin: 0 10px;

  border: none;

  width: 75%;
  height: 100%;
`;

const SearchButton = styled.button`
  border: none;

  width: 20%;
  height: 100%;
`;

const SubjectList = styled.div`
  background-color: gray;

  width: 90%;
  height: 300px;
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

function SubjectModal() {
  const [isOpen, setIsOpen] = useState(true);

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
          <SearchInput />
          <SearchButton>검색</SearchButton>
        </SearchDiv>

        <SubjectList></SubjectList>

        <ButtonContainer>
          <Close
            onClick={() => {
              setIsOpen(false);
            }}
          >
            선택
          </Close>
          <Close onClick={() => setIsOpen(false)}>닫기</Close>
        </ButtonContainer>
      </StyledModal>
    </>
  );
}

export default SubjectModal;
