import React, { useRef, useState } from "react";
import { styled } from "styled-components";
import axios from "axios";
import { Alarm } from "../tools/alarmFunction/AlarmManager";
import useCommand from "../tools/commandFunction/CommandProvider";
import { useAlarm } from "../tools/alarmFunction/AlarmProvider";
import { useWord } from "../tools/wordFunction/WordProvider";
import { saveToLocalStorage } from "../commonFunctions/LocalStorage";
import { useWaiting } from "../tools/waitFunction/WaitProvider";
import { subjectOptions } from "../commonFunctions/SubjectOptions";

const Header = styled.div`
  background-color: rgb(250, 250, 250);
  width: 100%;
  height: 81%;

  font-family: "Pretendard";
`;

const ToolList = styled.div`
  padding-left: 20px;
  padding-top: 20px;

  width: 100%;
  height: 100%;

  display: flex;
  flex-direction: column;
`;

const SearchContainer = styled.div`
  width: 100%;
  margin-bottom: 5px;

  display: flex;
  justify-content: center;
  flex-direction: column;
`;

const InsertContainer = styled.div`
  display: flex;
  flex-direction: column;
  margin-top: 10px;
`;

const SearchTitle = styled.p`
  margin-right: 12px;
  font-size: 13pt;
`;

const Word = styled.textarea`
  width: 98%;
  height: 300px;
  margin-right: 10px;
  margin-bottom: 10px;
  padding-left: 6px;
  padding-top: 6px;

  text-align: left;
  font-size: 9pt;
  font-family: "Pretendard";

  resize: none;
`;

const SearchButton = styled.button`
  width: 68px;
  height: 25px;
  font-size: 9pt;
  color: rgba(80, 80, 80);
  background-color: rgba(230, 230, 230);
  border-radius: 4px;
  border: 1px solid rgba(200, 200, 200);
  cursor: pointer;
  transition: background-color 0.3s ease, transform 0.2s ease,
    box-shadow 0.2s ease;

  font-family: "Pretendard";

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

const Subject = styled.select`
  height: 25px;
  width: 300px;
  margin-right: 5px;
  margin-bottom: 10px;

  font-family: "Pretendard";
`;

const Add = () => {
  const [subjectOption, setSubjectOption] = useState<string>("all");

  const { wordValue, setWordValue } = useWord();

  const wordRef = useRef(null);

  const {} = useCommand();
  const { showAlarm, setAlarm, alarmIcon, alarmDescription, remainedTime } =
    useAlarm();
  const { setWaiting } = useWaiting();

  const handleWordChange = (event: any) => {
    setWordValue(event.target.value);
  };

  const handleWordDown = (e: any) => {
    if (e.ctrlKey && e.key === "s") {
      e.preventDefault();
      adding();
    }
  };

  const handleSubjectChange = (e: any) => {
    setSubjectOption(e.target.value);
  };

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

  return (
    <Header className="Header">
      {showAlarm && (
        <Alarm
          iconType={alarmIcon}
          description={alarmDescription}
          remainedTime={remainedTime}
        />
      )}

      <ToolList>
        <SearchContainer>
          <Subject
            name="subject"
            value={subjectOption}
            onChange={handleSubjectChange}
          >
            {subjectOptions.map((option, index) => (
              <option
                key={index}
                value={option.value}
                disabled={option.disabled}
              >
                {option.label}
              </option>
            ))}
          </Subject>
          <SearchTitle>단어 추가</SearchTitle>
          <InsertContainer>
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

            <SearchButton onClick={adding}>추가</SearchButton>
          </InsertContainer>
        </SearchContainer>
      </ToolList>
    </Header>
  );
};

export default Add;
