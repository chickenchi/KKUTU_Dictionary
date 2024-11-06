import React, { useEffect, useRef, useState } from "react";
import { styled } from "styled-components";
import axios from "axios";
import { SettingPopup } from "../tools/settingFunction/SettingPopup";
import { getDoumChar } from "./functions/GetDoumChar";
import { WordSettingPopup } from "../tools/wordFunction/WordSettingPopup";
import { useAlarm } from "../tools/alarmFunction/AlarmProvider";
import { Alarm } from "../tools/alarmFunction/AlarmManager";
import { getFromLocalStorage } from "../commonFunctions/LocalStorage";
import { useWaiting } from "../tools/waitFunction/WaitProvider";
import {
  getValueByLabel,
  subjectOptions,
} from "../commonFunctions/SubjectOptions";
import { useRecoilState } from "recoil";
import { optionState, subjectState } from "../Atom";
import SubjectModal from "../tools/subjectFunction/Subject";
import SubjectButton from "./buttons/SubjectButton";
import OptionButton from "./buttons/OptionButton";

const Header = styled.div`
  background-color: rgb(250, 250, 250);
  width: 100%;
  height: 88%;

  font-family: "Pretendard";
`;

const Checkbox = styled.input`
  width: auto;
  height: auto;
  margin-right: 5px;
`;

const RadioTitle = styled.p`
  margin-right: 12px;
  font-size: 13pt;
`;

const Label = styled.label`
  margin-right: 10px;
  color: #111111;
  font-size: 10pt;
`;

const ToolList = styled.div`
  padding-left: 20px;
  padding-top: 20px;

  width: 100%;
  height: 15%;

  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
`;

const RadioList = styled.div`
  width: 100%;
  display: flex;
  padding-bottom: 5px;
`;

const SearchContainer = styled.div`
  width: 100%;
  margin-bottom: 5px;

  display: flex;
  align-items: center;
`;

const SettingButton = styled.button`
  background-color: rgba(10, 10, 10, 0);

  border: none;

  margin-left: 10px;
`;

const Setting = styled.img`
  width: 20px;
  height: 20px;
`;

const RadioContainer = styled.div`
  height: 30px;

  display: flex;
  align-items: center;
`;

const SearchTitle = styled.p`
  margin-right: 12px;
  font-size: 13pt;
`;

const ImportWord = styled.div`
  position: relative;
  background-color: rgb(245, 245, 245);

  margin-top: 20px;
  margin-left: 20px;

  border-radius: 10px;
  border: 2px solid rgb(235, 235, 235);

  width: 95%;
  height: 70%;

  padding-left: 20px;
  padding-top: 20px;

  overflow-y: auto;
  overflow-x: hidden;
`;

const MissionType = styled.select`
  position: absolute;

  right: 20px;

  width: 110px;
  height: 25px;

  font-size: 9pt;
  font-family: "Pretendard";
`;

const ShMisType = styled.option``;

const Word = styled.input`
  width: 150px;
  height: 25px;
  margin-right: 10px;
  padding-left: 5px;

  font-size: 9pt;
  font-family: "Pretendard";
`;

const Mission = styled.input`
  width: 150px;
  height: 25px;
  margin-right: 10px;
  padding-left: 5px;

  font-size: 9pt;
  font-family: "Pretendard";
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

const Words = styled.button<{ checked: number; rank?: number }>`
  background-color: rgba(0, 0, 0, 0);
  display: block;

  margin-bottom: 5px;
  padding-bottom: 5px;

  border: none;

  color: ${({ checked }) =>
    checked === 0 ? "rgb(80, 80, 80)" : "rgb(160, 160, 160)"};

  font-size: 11pt;
  font-weight: ${({ rank }) => (rank != null && rank <= 3 ? "600" : "0")};
  font-family: "Pretendard";

  &:hover {
    color: rgb(120, 120, 120);
  }
`;

const Main = () => {
  const [selectedOption, setSelectedOption] = useRecoilState(optionState);

  const [subjectOption, setSubjectOption] = useRecoilState(subjectState);
  const [wordValue, setWordValue] = useState("");
  const [backWordValue, setBackWordValue] = useState("");
  const [missionValue, setMissionValue] = useState("");
  const [shMisType, setShMisType] = useState("theory");

  const [isTenSec, setIsTenSec] = useState<boolean>(false);
  const [isKnown, setIsKnown] = useState<boolean>(false);

  const [wordList, setWordList] = useState<string[]>([]);

  const [openSetting, setOpenSetting] = useState<boolean>(false);
  const [openWordSetting, setOpenWordSetting] = useState<boolean>(false);

  const [wspProps, getWSPProps] = useState<[string, number]>(["", 0]);

  const wordRef = useRef<HTMLInputElement>(null);
  const backWordRef = useRef<HTMLInputElement>(null);
  const missionRef = useRef<HTMLInputElement>(null);

  const { showAlarm, alarmIcon, alarmDescription, remainedTime } = useAlarm();

  const { setWaiting } = useWaiting();

  const setSubjectChange = (subject: string) => {
    setSubjectOption(subject);
  };

  const handleWordChange = (event: any) => {
    setWordValue(event.target.value);
  };

  const handleBackWordChange = (event: any) => {
    setBackWordValue(event.target.value);
  };

  const handleMissionChange = (event: any) => {
    setMissionValue(event.target.value);
  };

  const handleSMTChange = (event: any) => {
    setShMisType(event.target.value);
  };

  const handleOpenSettingChange = () => {
    setOpenSetting(!openSetting);
  };

  const handleIsTenSecChange = () => {
    setIsTenSec(!isTenSec);
  };

  const handleIsKnownChange = () => {
    setIsKnown(!isKnown);
  };

  useEffect(() => {
    const getElementSearchType = async () => {
      let searchType = await getFromLocalStorage("searchType");
      setSelectedOption(searchType);
    };

    getElementSearchType();
  }, [shMisType]);

  const handleKeyDown = (event: any) => {
    if (event.key === "Enter") {
      event.preventDefault();
      search();
    }
  };

  const activeWSP = (wspProps: [string, number]) => {
    getWSPProps(wspProps);
    setOpenWordSetting(true);
  };

  const showWord = () => {
    let words: React.JSX.Element[];

    if (wordList[0] === "아쉽게도 단어가 없네요...") {
      return wordList[0];
    } else if (selectedOption === "mission") {
      if (missionValue === "") {
        words = wordList.map((word: any, index: any) => (
          <Words
            onClick={() => activeWSP([word[0], word[3]])}
            key={index}
            checked={word[3]}
          >
            {`${word[0]}[${word[1]}]`}
          </Words>
        ));
      } else if (shMisType === "theory") {
        words = wordList.map((word: any, index: any) => (
          <Words
            onClick={() => activeWSP([word[0], word[3]])}
            key={index}
            checked={word[3]}
            rank={word[2]}
          >
            {`${word[2]} Tier. ${word[0]}[${word[1]}]`}
          </Words>
        ));
      } else {
        // score & value
        words = wordList.map((word: any, index: any) => (
          <Words
            onClick={() => activeWSP([word[0], word[2]])}
            key={index}
            checked={word[2]}
          >
            {`${word[0]}[${word[1]}]`}
          </Words>
        ));
      }
    } else {
      words = wordList.map((word: any, index: any) => (
        <Words
          onClick={() => activeWSP([word[0], word[1]])}
          key={index}
          checked={word[1]}
        >
          {word[0]}
        </Words>
      ));
    }

    return words;
  };

  const { setAlarm } = useAlarm();

  const search = async () => {
    try {
      let initialList: string[];

      if (getDoumChar(wordValue) !== "failed") {
        initialList = [wordValue, getDoumChar(wordValue)];
      } else {
        initialList = [wordValue, wordValue];
      }

      let checklist = [isTenSec, isKnown];

      setWaiting(true);

      const subject = getValueByLabel(subjectOption);

      const response = await axios.post("http://127.0.0.1:5000/word", {
        word: initialList,
        backWord: backWordValue,
        type: selectedOption,
        subject: subject,
        mission: missionValue,
        shMisType: shMisType,
        checklist: checklist,
      });

      setWaiting(false);

      if (response.data !== "단어 없음") {
        setWordList(response.data);
      } else {
        setWordList(["아쉽게도 단어가 없네요..."]);
      }
    } catch (error) {
      console.log(error);
      setAlarm("error", "데이터를 받아오는 도중 문제가 생겼습니다.");
      setWaiting(false);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey) {
        switch (e.key) {
          case "ArrowLeft":
            e.preventDefault();
            if (wordRef.current) {
              wordRef.current.focus();
              setWordValue("");
            }
            break;
          case "ArrowRight":
            e.preventDefault();

            if (missionRef.current) {
              missionRef.current.focus();
              setMissionValue("");
            } else if (backWordRef.current) {
              backWordRef.current.focus();
              setBackWordValue("");
            }
            break;
          case "1":
            e.preventDefault();
            setSelectedOption("mission");
            break;
          case "2":
            e.preventDefault();
            setSelectedOption("attack");
            break;
          case "3":
            e.preventDefault();
            setSelectedOption("long");
            break;
          case "4":
            e.preventDefault();
            setSelectedOption("villain");
            break;
          case "5":
            e.preventDefault();
            setSelectedOption("protect");
            break;
        }

        if (e.altKey) {
          switch (e.key) {
            case "t":
              setIsTenSec(!isTenSec);
              break;
            case "k":
              setIsKnown(!isKnown);
              break;
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isTenSec, isKnown]);

  useEffect(() => {
    setTimeout(() => {
      if (wordRef.current) {
        wordRef.current.focus();
      }
    }, 0);
  }, []);

  return (
    <Header className="Header">
      {showAlarm && (
        <Alarm
          iconType={alarmIcon}
          description={alarmDescription}
          remainedTime={remainedTime}
        />
      )}
      {openSetting && <SettingPopup setOpenSetting={setOpenSetting} />}
      {openWordSetting && (
        <WordSettingPopup
          setWordOpenSetting={setOpenWordSetting}
          word={wspProps[0]}
          checked={wspProps[1]}
          Search={search}
        />
      )}
      <SubjectModal setSubjectChange={setSubjectChange} />
      <ToolList>
        <RadioList>
          <RadioContainer>
            <RadioTitle>검색 유형</RadioTitle>
          </RadioContainer>

          <RadioContainer>
            <OptionButton />
            <SubjectButton />

            <Checkbox
              type="checkbox"
              onChange={handleIsTenSecChange}
              checked={isTenSec}
            />
            <Label htmlFor="10s">10초</Label>
            <Checkbox
              type="checkbox"
              onChange={handleIsKnownChange}
              checked={isKnown}
            />
            <Label htmlFor="memorize">암기한 단어</Label>
          </RadioContainer>

          <SettingButton onClick={handleOpenSettingChange}>
            <Setting src="./image/setting.png" />
          </SettingButton>
        </RadioList>

        <SearchContainer>
          <SearchTitle>단어 찾기</SearchTitle>

          <Word
            type="text"
            value={wordValue}
            placeholder="앞 글자 입력"
            onChange={handleWordChange}
            onKeyDown={handleKeyDown}
            ref={wordRef}
          />
          {selectedOption === "villain" && (
            <Word
              type="text"
              value={backWordValue}
              placeholder="뒷 글자 입력"
              onChange={handleBackWordChange}
              onKeyDown={handleKeyDown}
              ref={backWordRef}
            />
          )}
          {selectedOption === "mission" && (
            <Mission
              type="text"
              value={missionValue}
              placeholder="미션 글자 입력"
              onChange={handleMissionChange}
              onKeyDown={handleKeyDown}
              ref={missionRef}
            />
          )}
          <SearchButton onClick={search}>검색</SearchButton>
        </SearchContainer>
      </ToolList>

      <ImportWord>
        {selectedOption === "mission" && (
          <MissionType
            id="shMisType"
            name="shMisType"
            value={shMisType}
            onChange={handleSMTChange}
          >
            <ShMisType value="value">이론적 가치순</ShMisType>
            <ShMisType value="score">점수</ShMisType>
            <ShMisType value="theory">미션 + 장문순</ShMisType>
          </MissionType>
        )}

        {showWord()}
      </ImportWord>
    </Header>
  );
};

export default Main;
