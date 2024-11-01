import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import { styled } from "styled-components";
import { Alarm } from "../tools/alarmFunction/AlarmManager";
import { getDoumChar } from "./functions/GetDoumChar";
import { jaccardSimilarity } from "./functions/JaccardSimilarity";
import { compareStrings } from "./functions/CompareStrings";
import { useAlarm } from "../tools/alarmFunction/AlarmProvider";
import { characters, hangulChars } from "../commonFunctions/wordNhangul";
import { getFromLocalStorage } from "../commonFunctions/LocalStorage";
import { useWaiting } from "../tools/waitFunction/WaitProvider";
import SubjectButton from "./buttons/SubjectButton";
import OptionButton from "./buttons/OptionButton";
import { useRecoilState } from "recoil";
import { optionState, subjectState } from "../Atom";
import { getValueByLabel } from "../commonFunctions/SubjectOptions";
import SubjectModal from "../tools/subjectFunction/Subject";

const Header = styled.div`
  position: relative;
  background-image: url("./image/gamebg.png");

  width: 100%;
  height: 81%;

  font-family: "Pretendard";
`;

const TestContainer = styled.div`
  width: 100%;
  height: 30%;

  display: flex;
  align-items: center;
  justify-content: center;
`;

const MissionContainer = styled.div`
  position: relative;
  width: 95px;
  height: 90px;

  display: flex;
  align-items: center;
  justify-content: center;
`;

const MissionImg = styled.img`
  width: 90%;
`;

const Mission = styled.input`
  position: absolute;

  background-color: rgba(0, 0, 0, 0);

  color: white;
  font-size: 22px;
  font-family: "Pretendard";

  outline: none;
  border: none;

  width: 20px;

  bottom: 17.5px;
  left: 37.5px;
`;

const Keyword = styled.div`
  background-color: #deaf56;
  border: 4px solid #42341a;
  width: 80%;
  height: 120px;

  box-shadow: 10px 10px 20px rgba(0, 0, 0, 0.3);

  border-radius: 10px;
  margin-left: 15px;

  color: white;

  display: flex;
  justify-content: center;
  align-items: center;
`;

const InKeyword = styled.div`
  background-color: #42341a;
  width: 96%;
  height: 80%;

  border-radius: 10px;

  box-shadow: 10px 10px 20px rgba(0, 0, 0, 0.3);

  display: flex;
  align-items: center;
  justify-content: center;
`;

const Spell = styled.input`
  width: 500px;
  height: auto;
  background-color: #42341a;
  border: none;
  outline: none;

  color: white;
  font-size: 25pt;
  font-family: "Pretendard";

  text-align: center;

  &::placeholder {
    color: white;
  }
`;

const InputContainer = styled.div`
  width: 100%;

  display: flex;
  justify-content: center;
  align-items: center;
`;

const Type = styled.input`
  width: 80%;
  height: 50px;

  margin-right: 5px;
  padding-left: 10px;

  border: 1px solid #c3c3c3;
  border-radius: 10px;

  font-size: 12pt;
  font-family: "Pretendard";

  outline: none;
`;

const Shuffle = styled.button`
  background-color: white;

  border-radius: 10px;
  border: none;

  width: 50px;
  height: 40px;

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

const RadioList = styled.div`
  background-color: white;
  width: 100%;
  height: 40px;

  display: flex;
  justify-content: center;
  align-items: center;
`;

const ShowRadioButton = styled.button<{ folded: boolean }>`
  background-color: rgba(255, 255, 255, 0.3);

  width: 100%;
  height: 30px;

  border: none;

  transform: ${({ folded }) => (!folded ? "rotate(0deg)" : "rotate(180deg)")};

  margin-right: 10px;
`;

const SRBImage = styled.img`
  width: 30px;
  height: 30px;
`;

const RadioContainer = styled.div`
  height: 30px;
  display: flex;
  align-items: center;
`;

const RadioTitle = styled.p`
  margin-left: 12px;
  margin-right: 8px;

  font-size: 11pt;
`;

const Checkbox = styled.input`
  width: auto;
  height: auto;

  font-family: "Pretendard";
`;

const Console = styled.p`
  background-color: rgba(0, 0, 0, 0.1);
  position: absolute;
  width: 100%;
  bottom: 0;

  min-height: 10%;
  max-height: 40%;

  padding-top: 15px;
  padding-left: 10px;

  overflow-y: auto;
  overflow-x: hidden;
`;

const Practice = () => {
  const [answerCheck, setAnswerCheck] = useState<boolean>(true);
  const [oneTierCheck, setOneTierCheck] = useState<boolean>(true);
  const [changeMissionCheck, setChangeMissionCheck] = useState<boolean>(true);
  const [randomMissionCheck, setRandomMissionCheck] = useState<boolean>(false);
  const [resetMissionCheck, setResetMissionCheck] = useState<boolean>(false);

  const [selectedOption, setSelectedOption] = useRecoilState(optionState);
  const [subjectOption, setSubjectOption] = useRecoilState(subjectState);
  const [answer, setAnswer] = useState("");
  const [missionValue, setMissionValue] = useState("가");
  const [initial, setInitial] = useState("가");

  const [currentNumber, setCurrentNumber] = useState(0);
  const [maxCurrentNumber, setMaxCurrentNumber] = useState(0);
  const [villainWord, setVillainWord] = useState("");

  const [folded, setFolded] = useState(false);

  const [log, setLog] = useState("");

  type handleAlarmArray = [string, number, string, [string, number, number]];
  const [handlingAlarm, setHandlingAlarm] = useState<handleAlarmArray>([
    "",
    0,
    "",
    ["", 0, 0],
  ]);

  const divRef = useRef<HTMLDivElement | null>(null);
  const { showAlarm, setAlarm, alarmIcon, alarmDescription, remainedTime } =
    useAlarm();
  const { setWaiting } = useWaiting();

  useEffect(() => {
    if (!answer) return;

    setAnswer("");

    const wroteAnswer: string = handlingAlarm[0];
    const tier: number = handlingAlarm[1];
    const first: string = handlingAlarm[2];
    const similarityWord: string = handlingAlarm[3][0];
    const similarityRate: number = handlingAlarm[3][1];
    const similarityTier: number = handlingAlarm[3][2];

    const compareWord: string = compareStrings(similarityWord, wroteAnswer);

    if (changeMissionCheck) {
      changeMission(tier);
    }

    if (!tier) {
      switch (selectedOption) {
        case "mission":
        case "language":
        case "long":
          setAlarm(
            "warning",
            `존재하지 않거나 10티어 안에 들지 않는 단어입니다.`
          );
          writeLog(
            `[console] warning: 존재하지 않거나 10티어 안에 들지 않는 단어입니다.${
              oneTierCheck ? `\n1티어는 ${first}입니다.` : ""
            }${
              answerCheck
                ? `\n작성한 단어와 유사도가 높은 단어는 [${similarityWord}]입니다.
            티어는 ${similarityTier}티어이고 유사율은 ${similarityRate.toFixed(
                    1
                  )}%입니다.
            분석 결과는 위와 같습니다: ${compareWord}`
                : ""
            }`
          );
          break;
        case "attack":
        case "protect":
          setAlarm("warning", `존재하지 않는 단어입니다.`);
          writeLog(
            `[console] warning: 존재하지 않는 단어입니다.${
              answerCheck
                ? `\n작성한 단어와 유사도가 높은 단어는 [${similarityWord}]입니다.
            티어는 ${similarityTier}티어이고 유사율은 ${similarityRate.toFixed(
                    1
                  )}%입니다.
            분석 결과는 위와 같습니다: ${compareWord}`
                : ""
            }`
          );
          break;
        case "villain":
          setAlarm("warning", `틀렸습니다.`);
          writeLog(
            `[console] warning: 틀렸습니다.${
              answerCheck
                ? `\n${similarityTier}티어의 단어는 [${similarityWord}]입니다.
              유사율은 ${similarityRate.toFixed(1)}%입니다.
              분석 결과는 위와 같습니다: ${compareWord}`
                : ""
            }`
          );
      }
    } else {
      switch (selectedOption) {
        case "mission":
        case "language":
        case "long":
          setAlarm("success", `위 단어는 ${tier}티어입니다.`);
          writeLog(
            `[console] success: 위 단어는 ${tier}티어입니다.${
              oneTierCheck ? `\n1티어는 ${first}입니다.` : ""
            }`
          );
          break;
        case "attack":
        case "protect":
        case "villain":
          setAlarm("success", `정답입니다.`);
          writeLog(`[console] success: 정답입니다.`);
          break;
      }
    }
  }, [handlingAlarm]);

  useEffect(() => {
    if (divRef.current) {
      divRef.current.scrollTop = divRef.current.scrollHeight;
    }
  }, [log]);

  const writeLog = (description: string) => {
    setLog(log + description + "\n");
  };

  const changeMission = (tier?: number) => {
    if (randomMissionCheck) {
      const randomIndex = Math.floor(Math.random() * hangulChars.length);
      setMissionValue(hangulChars[randomIndex]);
    } else {
      const index = hangulChars.indexOf(missionValue);

      if (resetMissionCheck && !tier) {
        setMissionValue(hangulChars[0]);
        return;
      }

      setMissionValue(hangulChars[(index + 1) % 14]);
    }
  };

  const changeInitial = () => {
    const randomIndex = Math.floor(Math.random() * characters.length);

    if (getDoumChar(characters[randomIndex]) == "failed")
      setInitial(characters[randomIndex]);
    else
      setInitial(
        characters[randomIndex] +
          "(" +
          getDoumChar(characters[randomIndex]) +
          ")"
      );
  };

  const submit = async (event: any) => {
    if (event.key === "Enter") {
      if (answer === "") {
        setAlarm("error", `단어를 입력하세요.`);
        return;
      }

      if (selectedOption === "villain") {
        let correctAnswer = villainWord[currentNumber][0];
        let tier = 0;
        writeLog(`[user] ${answer} 입력`);

        var similarity: number = jaccardSimilarity(correctAnswer, answer);
        var highSimilarity: [string, number, number] = ["", 0, 0];
        highSimilarity = [correctAnswer, similarity, currentNumber + 1];

        if (correctAnswer === answer) {
          tier = 1;
          setInitial(villainWord[(currentNumber + 1) % maxCurrentNumber][0][0]);
          setCurrentNumber((currentNumber + 1) % maxCurrentNumber);
        }

        setHandlingAlarm([answer, tier, correctAnswer, highSimilarity]);

        return;
      }

      const reviewWordResult = await reviewWord();
      if (reviewWordResult) setHandlingAlarm(reviewWordResult);
    }
  };

  const reviewWord = async () => {
    let initialList: string[];
    let initialone: string = initial[0];

    if (initialone && getDoumChar(initialone) !== "failed") {
      initialList = [initialone, getDoumChar(initialone)];
    } else {
      initialList = [initialone, initialone];
    }

    try {
      setWaiting(true);

      const subject = getValueByLabel(subjectOption);

      let response = await axios.post("http://127.0.0.1:5000/word", {
        word: initialList,
        type: selectedOption,
        subject: subject,
        mission: missionValue,
        backWord: "",
        shMisType: "theory",
      });

      setWaiting(false);

      if (response.data === "단어 없음") {
        setAlarm("error", `받아칠 수 있는 단어가 없습니다.`);
        return;
      }

      var tier: number = 0;
      var first = selectedOption !== "villain" ? response.data[0][0] : "";
      var highSimilarity: [string, number, number] = ["", 0, 0];

      wordSearchLoop: for (tier = 0; tier < response.data.length; tier++) {
        var word = response.data[tier][0];
        var similarity: number = jaccardSimilarity(word, answer);

        if (highSimilarity[1] < similarity)
          highSimilarity = [word, similarity, tier + 1];

        switch (selectedOption) {
          case "mission":
            if (word[0] === answer) {
              tier = word[2];
              break;
            }
          default:
            if (word === answer) break wordSearchLoop;
            break;
        }
      }

      if (tier === response.data.length) tier = -1;

      tier += 1;

      writeLog(`[user] mission [${missionValue}]에서 ${answer} 입력`);

      const values: handleAlarmArray = [answer, tier, first, highSimilarity];
      return values;
    } catch (error) {
      console.log(error);
    }
  };

  const settingInitial = async () => {
    if (selectedOption !== "villain") {
      changeInitial();
    } else {
      setWaiting(true);

      const subject = getValueByLabel(subjectOption);

      const response = await axios.post("http://127.0.0.1:5000/word", {
        word: ["", ""],
        type: selectedOption,
        subject: subject,
        mission: "",
        backWord: missionValue,
        shMisType: "theory",
      });

      setWaiting(false);

      setInitial(response.data[0][0][0]);
      setCurrentNumber(0);
      setMaxCurrentNumber(response.data.length);
      setVillainWord(response.data);
    }
  };

  const hint = async () => {
    let word: string = "";
    let tier: number = 0;

    const findType = prompt(
      `원하시는 힌트를 입력해 주세요.
 1. 유사도를 통한 검색
 2. 티어를 통한 검색`
    );

    if (!findType) return;

    switch (findType) {
      case "1":
        const reviewWordResult = await reviewWord();

        if (!reviewWordResult) {
          return;
        }

        alert(reviewWordResult);

        word = reviewWordResult[3][0];
        tier = reviewWordResult[3][2];

        if (typeof word !== "string" || typeof tier !== "number") return;

        break;

      case "2":
        const wordTier = prompt(`티어를 입력해 주세요.`);

        if (!wordTier) return;

        tier = parseInt(wordTier);

        if (!tier) {
          alert("형식이 일치하지 않습니다.");
          return;
        }

        let initialList: string[];
        let initialone: string = initial[0];

        if (getDoumChar(initialone) !== "failed") {
          initialList = [initialone, getDoumChar(initialone)];
        } else {
          initialList = [initialone, initialone];
        }

        try {
          setWaiting(true);

          const subject = getValueByLabel(subjectOption);

          let response = await axios.post("http://127.0.0.1:5000/word", {
            word: initialList,
            type: selectedOption,
            subject: subject,
            mission: missionValue,
            backWord: "",
            shMisType: "theory",
          });

          setWaiting(false);

          word = response.data[tier - 1][0];

          if (typeof word !== "string") return;

          if (response.data === "단어 없음") {
            setAlarm("error", `받아칠 수 있는 단어가 없습니다.`);
            return;
          }
        } catch (e) {
          alert(e);
        }

        break;
    }

    try {
      setWaiting(true);

      const response = await axios.post(
        "http://127.0.0.1:5000/current_phrase",
        {
          word: word,
        }
      );

      setWaiting(false);

      if (response.data) alert(response.data);

      writeLog(`[console] hint: 유사도가 높은 ${tier}티어 단어의 암기 문구는 아래와 같습니다.
        => ${response.data ? response.data : "설명이 없습니다."}`);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    const getElementSearchType = async () => {
      let searchType = await getFromLocalStorage("searchType");
      setSelectedOption(searchType);
    };

    getElementSearchType();
  }, []);

  useEffect(() => {
    if (randomMissionCheck) changeMission();
  }, [randomMissionCheck]);

  const handleCheckChange = () => {
    setAnswerCheck(!answerCheck);
  };

  const handleOneTierChange = () => {
    setOneTierCheck(!oneTierCheck);
  };

  const handleChangeMissionChange = () => {
    setChangeMissionCheck(!changeMissionCheck);
    setRandomMissionCheck(false);
  };

  const handleRandomMissionChange = () => {
    setRandomMissionCheck(!randomMissionCheck);
    if (randomMissionCheck) setMissionValue("가");
  };

  const handleResetMissionChange = () => {
    setResetMissionCheck(!resetMissionCheck);
  };

  const handleAnswerChange = (event: any) => {
    setAnswer(event.target.value);
  };

  const handleInitialChange = (event: any) => {
    setInitial(event.target.value);
  };

  const handleMissionValueChange = (event: any) => {
    setMissionValue(event.target.value);
  };

  const handleFoldingChange = () => {
    setFolded(!folded);
  };

  const wordRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setTimeout(() => {
      if (wordRef.current) wordRef.current.focus();
    }, 0);
  }, []);

  return (
    <Header className="Header">
      <SubjectModal setSubjectChange={setSubjectOption} />

      {!folded && (
        <RadioList>
          <RadioContainer>
            <RadioTitle>검색 유형</RadioTitle>
          </RadioContainer>

          <OptionButton />
          <SubjectButton />

          <RadioContainer>
            <RadioTitle>분석 허용</RadioTitle>
          </RadioContainer>

          <Checkbox
            type="checkbox"
            onClick={handleCheckChange}
            checked={answerCheck}
          />

          <RadioContainer>
            <RadioTitle>1티어 공개</RadioTitle>
          </RadioContainer>

          <Checkbox
            type="checkbox"
            onClick={handleOneTierChange}
            checked={oneTierCheck}
          />

          <RadioContainer>
            <RadioTitle>미션 변경</RadioTitle>
          </RadioContainer>

          <Checkbox
            type="checkbox"
            onClick={handleChangeMissionChange}
            checked={changeMissionCheck}
          />

          {changeMissionCheck && !resetMissionCheck && (
            <>
              <RadioContainer>
                <RadioTitle>랜덤 미션</RadioTitle>
              </RadioContainer>

              <Checkbox
                type="checkbox"
                onClick={handleRandomMissionChange}
                checked={randomMissionCheck}
              />
            </>
          )}

          {changeMissionCheck && !randomMissionCheck && (
            <>
              <RadioContainer>
                <RadioTitle>모르면 처음부터</RadioTitle>
              </RadioContainer>

              <Checkbox
                type="checkbox"
                onClick={handleResetMissionChange}
                checked={resetMissionCheck}
              />
            </>
          )}
        </RadioList>
      )}

      <ShowRadioButton onClick={handleFoldingChange} folded={folded}>
        <SRBImage src="./image/TopArrow.png" />
      </ShowRadioButton>

      {showAlarm && (
        <Alarm
          iconType={alarmIcon}
          description={alarmDescription}
          remainedTime={remainedTime}
        />
      )}

      <TestContainer>
        {(selectedOption === "mission" || selectedOption === "villain") && (
          <MissionContainer>
            <MissionImg src="./image/lefthand.png" />
            <Mission
              type="text"
              value={missionValue}
              onChange={handleMissionValueChange}
              maxLength={1}
            />
          </MissionContainer>
        )}

        <Keyword>
          <InKeyword>
            <Spell
              type="text"
              value={initial}
              onChange={handleInitialChange}
              maxLength={4}
              placeholder={`<${subjectOption}>`}
            />
          </InKeyword>
        </Keyword>
      </TestContainer>

      <InputContainer>
        <Type
          type="text"
          placeholder="위 상황에 적절한 단어를 입력하세요"
          value={answer}
          onChange={handleAnswerChange}
          onKeyUp={submit}
          ref={wordRef}
        />
        <Shuffle onClick={settingInitial}>
          {selectedOption === "villain" ? "처음" : "섞기"}
        </Shuffle>
        <Shuffle onClick={hint}>힌트</Shuffle>
      </InputContainer>

      <Console ref={divRef}>
        {log.split("\n").map((line: any, index: any) => (
          <React.Fragment key={index}>
            {line}
            <br />
          </React.Fragment>
        ))}
      </Console>
    </Header>
  );
};

export default Practice;
