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
import SubjectButton from "../buttons/SubjectButton";
import { useRecoilState } from "recoil";
import { subjectState } from "../../RecoilAtoms/common/Atom";

const AddRemoveContainer = styled.div``;

const TypeContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
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

const ViewWord = styled.div`
  width: 98%;
  height: 300px;

  margin-right: 10px;
  margin-bottom: 15px;

  padding-left: 10px;
  padding-top: 10px;

  color: rgb(40, 40, 40);
  font-size: 11pt;
  font-family: "Pretendard";

  line-height: 1.5;

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
  height: 20px;

  border: 1px solid red;
  border-radius: 5px;

  color: red;
  font-size: 8pt;
`;

const BtnContainer = styled.div`
  display: flex;
`;

const ModifyButton = styled.button<{ type: string }>`
  background-color: rgba(0, 0, 0, 0);

  border-radius: 4px;
  border: 1px solid ${({ type }) => (type === "add" ? "#719EFF" : "#ff7171")};

  margin-right: 5px;

  width: 75px;
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

const CommitButton = styled.button`
  background-color: rgba(0, 0, 0, 0);

  margin-bottom: 15px;
  margin-right: 5px;

  border-radius: 4px;
  border: 1px solid rgb(80, 80, 80);

  width: 68px;
  height: 25px;

  color: rgb(80, 80, 80);
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

const SubjectModify = () => {
  const [subjectOption, setSubjectOption] = useRecoilState(subjectState);
  const [wordContainer, setWordContainer] = useState<string>("");

  const handleWordChange = (event: any) => {
    setWordValue(event.target.value);
  };

  const setSubjectChange = (subject: string) => {
    setSubjectOption(subject);
  };

  const handleWordDown = (e: any) => {
    if (e.ctrlKey && e.key === "s") {
      e.preventDefault();
      pushWord();
    }
  };

  const { setAlarm } = useAlarm();

  const { wordValue, setWordValue } = useWord();

  const wordRef = useRef<HTMLTextAreaElement | null>(null);

  const {} = useCommand();
  const { setWaiting } = useWaiting();

  const wordContainerToWordItem = () => {
    let words: string[] = [];
    let subjects: string[] = [];

    wordContainer.split("\n").forEach((w) => {
      if (w) {
        let word = w.split("[")[0];
        let subject = w.split("[")[1].split("]")[0];

        words.push(word);
        subjects.push(subject);
      }
    });

    return [words, subjects];
  };

  const adding = async () => {
    if (!wordContainer) {
      setAlarm("error", "단어를 입력해 주세요.");
      return;
    }

    const wordItem = wordContainerToWordItem();

    try {
      setWaiting(true);

      const response = await axios.post(
        "http://127.0.0.1:5000/insert_subject",
        {
          word: wordItem[0],
          subject: wordItem[1],
        }
      );

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
    if (!wordContainer) {
      setAlarm("error", "단어를 입력해 주세요.");
      return;
    }

    const wordItem = wordContainerToWordItem();

    try {
      setWaiting(true);

      const response = await axios.post(
        "http://127.0.0.1:5000/delete_subject",
        {
          word: wordItem[0],
          subject: wordItem[1],
        }
      );

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
    let wordLabel: string = wordContainer;
    let subject = getValueByLabel(subjectOption);

    wordSet.forEach((word) => {
      if (wordLabel.includes(`${word}[${subject}]`) || !word) return;

      wordLabel += `${word}[${subject}]\n`;
    });

    setWordContainer(wordLabel);
  };

  const pullWord = () => {
    let wordSet: string[] = wordValue.split("\n");
    let subject = getValueByLabel(subjectOption);
    let wordLabel: string = wordContainer;

    wordSet.forEach((word) => {
      if (word) wordLabel = wordLabel.replace(`${word}[${subject}]\n`, "");
    });

    setWordContainer(wordLabel);
  };

  const exceptWord = (index: number) => {
    let line = wordContainer.split("\n")[index] + "\n";
    let wordLabel: string = wordContainer.replace(line, "");

    setWordContainer(wordLabel);
  };

  const getValueByLabel = (label: string) => {
    const option = subjectOptions.find((option) => option.label === label);
    return option ? option.value : null; // option이 있으면 value 반환, 없으면 null 반환
  };

  useEffect(() => {
    setTimeout(() => {
      if (wordRef.current) wordRef.current.focus();
    }, 0);
  }, []);

  return (
    <AddRemoveContainer>
      <SubjectModal setSubjectChange={setSubjectChange} />

      <TypeContainer>
        <SubjectButton />
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

      <CommitButton onClick={() => pushWord()}>삽입</CommitButton>
      <CommitButton onClick={() => pullWord()}>제외</CommitButton>

      <ViewWord>
        {!wordContainer
          ? "추가된 단어가 없습니다."
          : wordContainer.split("\n").map((line, index) =>
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
        <ModifyButton type="add" onClick={adding}>
          주제 추가
        </ModifyButton>
        <ModifyButton type="remove" onClick={removing}>
          주제 제외
        </ModifyButton>
      </BtnContainer>
    </AddRemoveContainer>
  );
};

export default SubjectModify;
