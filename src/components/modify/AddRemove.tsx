import React, { useRef, useState } from "react";
import styled from "styled-components";
import { saveToLocalStorage } from "../../commonFunctions/LocalStorage";
import axios from "axios";
import useCommand from "../../tools/commandFunction/CommandProvider";
import { useWord } from "../../tools/wordFunction/WordProvider";
import { useWaiting } from "../../tools/waitFunction/WaitProvider";
import { useAlarm } from "../../tools/alarmFunction/AlarmProvider";
import { subjectOptions } from "../../commonFunctions/SubjectOptions";

const AddRemoveContainer = styled.div``;

const Subject = styled.select`
  height: 25px;
  width: 200px;
  margin-right: 5px;
  margin-bottom: 10px;

  font-family: "Pretendard";
`;

const Word = styled.textarea`
  width: 98%;
  height: 100px;
  margin-right: 10px;
  margin-bottom: 10px;
  padding-left: 6px;
  padding-top: 6px;

  text-align: left;
  font-size: 9pt;
  font-family: "Pretendard";

  resize: none;
`;

const ViewWord = styled.div`
  background-color: white;

  width: 98%;
  height: 300px;

  margin-right: 10px;
  margin-bottom: 15px;

  padding-left: 10px;
  padding-top: 10px;

  color: rgb(80, 80, 80);
  font-size: 11pt;
  font-family: "Pretendard";

  text-align: left;

  overflow-x: auto;
  overflow-y: none;
`;

const WordItem = styled.div`
  margin: 7px 0;

  display: flex;
  align-items: center;
`;

const WordItemText = styled.p`
  height: 100%;

  margin-right: 6px;

  font-size: 12pt;
`;

const ExceptButton = styled.button`
  background-color: rgba(0, 0, 0, 0);

  width: 40px;
  height: 100%;

  border: 1px solid red;
  border-radius: 5px;

  color: red;
  font-size: 8pt;
`;

const BtnContainer = styled.div`
  display: flex;
`;

const ModifyButton = styled.button`
  background-color: rgb(230, 230, 230);

  border-radius: 4px;
  border: none;
  margin-right: 5px;

  width: 68px;
  height: 25px;

  color: rgba(80, 80, 80);
  font-size: 9pt;
  font-family: "Pretendard";

  cursor: pointer;
  transition: background-color 0.3s ease, transform 0.2s ease,
    box-shadow 0.2s ease;

  &:hover {
    background-color: rgba(210, 210, 210);
  }

  &:active {
    background-color: rgba(190, 190, 190);
    transform: scale(0.98);
  }

  &:focus {
    outline: none;
  }
`;

const CommitButton = styled.button`
  background-color: rgba(230, 230, 230);

  margin-bottom: 15px;
  margin-right: 5px;

  border-radius: 4px;
  border: none;

  width: 68px;
  height: 25px;

  color: rgba(80, 80, 80);
  font-size: 9pt;
  font-family: "Pretendard";

  cursor: pointer;
  transition: background-color 0.3s ease, transform 0.2s ease,
    box-shadow 0.2s ease;

  &:hover {
    background-color: rgba(210, 210, 210);
  }

  &:active {
    background-color: rgba(190, 190, 190);
    transform: scale(0.98);
  }

  &:focus {
    outline: none;
  }
`;

const AddRemove = () => {
  const [subjectOption, setSubjectOption] = useState<string>("all");
  const [words, setWords] = useState<string>("");

  const handleWordChange = (event: any) => {
    setWordValue(event.target.value);
  };

  const handleSubjectChange = (e: any) => {
    setSubjectOption(e.target.value);
  };

  const handleWordDown = (e: any) => {
    if (e.ctrlKey && e.key === "s") {
      e.preventDefault();
      pushWord();
    }
  };

  const { setAlarm } = useAlarm();

  const { wordValue, setWordValue } = useWord();

  const wordRef = useRef(null);

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
        subject: subjectOption,
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

  const pushWord = () => {
    let wordSet: string[] = wordValue.split("\n");
    let wordLabel: string = words;

    wordSet.forEach((word) => {
      wordLabel += `${word}[${subjectOption}]\n`;
    });

    setWords(wordLabel);
  };

  const pullWord = () => {
    let wordSet: string[] = wordValue.split("\n");
    let wordLabel: string = words;

    const regex = new RegExp(
      `${Array.from(wordSet).join(
        `\\[${subjectOption}\\]\\n|`
      )}\\[${subjectOption}\\]\\n`,
      "g"
    );
    wordLabel = wordLabel.replace(regex, "");

    setWords(wordLabel);
  };

  const exceptWord = (index: number) => {
    let line = words.split("\n")[index];
    let wordLabel: string = words.replace(line, "");

    setWords(wordLabel);
  };

  return (
    <AddRemoveContainer>
      <Subject
        name="subject"
        value={subjectOption}
        onChange={handleSubjectChange}
      >
        {subjectOptions.map((option, index) => (
          <option key={index} value={option.value} disabled={option.disabled}>
            {option.label}
          </option>
        ))}
      </Subject>

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

      <CommitButton onClick={() => pushWord()}>삽입</CommitButton>
      <CommitButton onClick={() => pullWord()}>제외</CommitButton>

      <ViewWord>
        {!words
          ? "추가된 단어가 없습니다."
          : words.split("\n").map((line, index) =>
              line ? (
                <WordItem key={index}>
                  <WordItemText>{line}</WordItemText>
                  <br />
                  <ExceptButton onClick={() => exceptWord(index)}>
                    제외
                  </ExceptButton>
                </WordItem>
              ) : (
                <></>
              )
            )}
      </ViewWord>

      <BtnContainer>
        <ModifyButton onClick={adding}>추가</ModifyButton>
        <ModifyButton onClick={removing}>삭제</ModifyButton>
      </BtnContainer>
    </AddRemoveContainer>
  );
};

export default AddRemove;
