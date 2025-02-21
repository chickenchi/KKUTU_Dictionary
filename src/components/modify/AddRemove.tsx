import React, { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { saveToLocalStorage } from "../../commonFunctions/LocalStorage";
import axios from "axios";
import useCommand from "../../tools/commandFunction/CommandProvider";
import { useWord } from "../../tools/wordFunction/WordProvider";
import { useWaiting } from "../../tools/waitFunction/WaitProvider";
import { useAlarm } from "../../tools/alarmFunction/AlarmProvider";
import { subjectOptions } from "../../commonFunctions/SubjectOptions";
import SubjectModal from "../../tools/subjectFunction/Subject";
import { useRecoilState } from "recoil";
import { subjectState } from "../../RecoilAtoms/common/Atom";

const AddRemoveContainer = styled.div``;

const TypeContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
`;

const TypeTitle = styled.p`
  font-size: 20px;

  margin-right: 8px;
`;

const ServerText = styled.option`
  margin-right: 5px;
`;

const ServerCheck = styled.input`
  margin-right: 8px;
`;

const Word = styled.textarea`
  width: 98%;
  height: 150px;

  margin-right: 10px;
  margin-top: 10px;
  margin-bottom: 10px;

  padding-left: 6px;
  padding-top: 6px;

  border: none;

  text-align: left;
  font-size: 9pt;
  font-family: "Pretendard";

  line-height: 1.7;

  resize: none;
  outline: none;
`;

const BtnContainer = styled.div`
  display: flex;
`;

const ModifyButton = styled.button<{ type: string }>`
  background-color: rgba(0, 0, 0, 0);

  border-radius: 4px;
  border: 1px solid ${({ type }) => (type === "add" ? "#719EFF" : "#ff7171")};

  margin-right: 5px;

  width: 68px;
  height: 25px;

  color: ${({ type }) => (type === "add" ? "#719EFF" : "#ff7171")};
  font-size: 9pt;
  font-family: "Pretendard";

  cursor: pointer;
  transition: background-color 0.3s ease, transform 0.2s ease,
    box-shadow 0.2s ease;

  &:hover {
    border-color: ${({ type }) => (type === "add" ? "#507acc" : "#CC5A5A")};
  }

  &:active {
    border-color: ${({ type }) => (type === "add" ? "#3E6BB3" : "#A94A4A")};
    transform: scale(0.98);
  }

  &:focus {
    outline: none;
  }
`;

const AddRemove = () => {
  const [isRioWord, setIsRioWord] = useState<boolean>(false);
  const [isKkukoWord, setIsKkukoWord] = useState<boolean>(true);

  const handleWordChange = (event: any) => {
    setWordValue(event.target.value);
  };

  const handleIsRioWordChange = () => {
    setIsRioWord(!isRioWord);
  };

  const handleIsKkukoWordChange = () => {
    setIsKkukoWord(!isKkukoWord);
  };

  const handleWordDown = (e: any) => {
    if (e.ctrlKey && e.key === "s") {
      e.preventDefault();
      adding();
    } else if (e.ctrlKey && e.key === "Delete") {
      e.preventDefault();
      removing();
    }
  };

  const { setAlarm } = useAlarm();

  const { wordValue, setWordValue } = useWord();

  const wordRef = useRef<HTMLTextAreaElement | null>(null);

  const {} = useCommand();
  const { setWaiting } = useWaiting();

  const adding = async () => {
    if (!wordValue) {
      setAlarm("error", "단어를 입력해 주세요.");
      return;
    }

    try {
      setWaiting(true);

      const response = await axios.post("http://127.0.0.1:5000/insert", {
        word: wordValue,
        rio: isRioWord,
        kkuko: isKkukoWord,
      });

      setWaiting(false);

      if (response.data[0] === "success") {
        saveToLocalStorage("isAcceptedAllWord", false);
      }

      setAlarm(response.data[0], response.data[1]);
    } catch (error) {
      console.log(error);
    }
  };

  const removing = async () => {
    if (!wordValue) {
      setAlarm("error", "단어를 입력해 주세요.");
      return;
    }

    try {
      setWaiting(true);

      const response = await axios.post("http://127.0.0.1:5000/delete", {
        word: wordValue,
      });

      setWaiting(false);

      if (response.data[0] === "success") {
        saveToLocalStorage("isAcceptedAllWord", false);
      }

      setAlarm(response.data[0], response.data[1]);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <AddRemoveContainer>
      <TypeContainer>
        <TypeTitle>서버</TypeTitle>
        <ServerText>끄투리오</ServerText>
        <ServerCheck
          type="checkbox"
          onChange={handleIsRioWordChange}
          checked={isRioWord}
        />
        <ServerText>끄투코리아</ServerText>
        <ServerCheck
          type="checkbox"
          onChange={handleIsKkukoWordChange}
          checked={isKkukoWord}
        />
      </TypeContainer>

      <Word
        value={wordValue}
        placeholder="단어만 입력해 주세요.
잡다한 내용이나 특수문자가 포함된 경우 삭제 작업에 차질이 생길 수 있습니다!&#13;
단축키 모음
 - 줄을 바꿀 땐 Shift+Enter를 누르시면 됩니다.
 - 적용하실 땐 Ctrl+S를 누르시면 됩니다."
        onChange={handleWordChange}
        onKeyDown={handleWordDown}
        ref={wordRef}
      />

      <BtnContainer>
        <ModifyButton type="add" onClick={adding}>
          추가
        </ModifyButton>
        <ModifyButton type="remove" onClick={removing}>
          삭제
        </ModifyButton>
      </BtnContainer>
    </AddRemoveContainer>
  );
};

export default AddRemove;
