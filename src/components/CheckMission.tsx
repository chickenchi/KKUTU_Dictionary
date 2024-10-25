import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import { styled } from "styled-components";
import { Alarm } from "../tools/alarmFunction/AlarmManager";
import { getDoumChar } from "./functions/GetDoumChar";
import { jaccardSimilarity } from "./functions/JaccardSimilarity";
import { compareStrings } from "./functions/CompareStrings";
import { useAlarm } from "../tools/alarmFunction/AlarmProvider";
import { characters, hangulChars } from "../commonFunctions/wordNhangul";
import { useAlert } from "../tools/alertFunction/AlertProvider";
import { useWaiting } from "../tools/waitFunction/WaitProvider";

const Header = styled.div`
  position: relative;

  width: 100%;
  height: 88%;

  font-family: "Pretendard";
`;

const Title = styled.p`
  margin: 70px;

  font-weight: 500;
  font-size: 28pt;
`;

const MissionDiv = styled.div`
  width: 100%;
  height: 88%;

  display: flex;
  align-items: center;
  flex-direction: column;
`;

const AnalyzingWordDiv = styled.div`
  width: 100%;
  height: 220px;

  display: flex;
  justify-content: center;
  align-items: center;
`;

const AWLabel = styled.p`
  margin-right: 20px;

  font-size: 18pt;
`;

const AWInput = styled.input`
  width: 45px;
  height: 45px;

  border: 1px solid rgb(205, 205, 205);
  border-radius: 5px;

  font-size: 16pt;
  color: rgb(150, 150, 150);
  text-align: center;
`;

const MissionLineDiv = styled.div`
  width: 100%;
  height: 220px;

  margin-bottom: 20px;

  display: flex;
  align-items: center;
  flex-direction: column;
`;

const CircleDiv = styled.div`
  margin-bottom: 20px;

  display: flex;
  align-items: center;
`;

const Circle = styled.button<{
  status: string;
  index: number;
  currentIndex: number;
}>`
  background-color: ${({ index, currentIndex }) =>
    index === currentIndex ? "#c5c5c5" : "rgba(0, 0, 0, 0)"};

  width: 15px;
  height: 15px;

  margin-right: 6px;

  border: ${({ status }) =>
    status === "answered"
      ? "1px solid #719eff"
      : status === "postponed"
      ? "1px solid #fff839"
      : status === "correct"
      ? "1px solid #2d6fff"
      : status === "wrong"
      ? "1px solid #e6463f"
      : "1px solid #c5c5c5"};

  border-radius: 50%;
`;

const MissionInput = styled.textarea`
  background-color: #efefef;

  width: 60%;
  height: 100%;
  resize: none;

  margin-left: 10px;
  padding: 15px;

  box-shadow: none;
  outline: none;
  border: 1px solid white;
  border-radius: 6px;

  color: #a4a4a4;

  font-size: 17pt;

  &::placeholder {
    color: #adadad;
  }
`;

const ButtonContainer = styled.div`
  height: 45px;

  display: flex;
`;

const RandomWordButton = styled.button`
  background-color: rgba(255, 255, 255, 0);

  width: 60px;
  height: 45px;

  margin-right: 20px;

  border: 1px solid #d2d2d2;
  border-radius: 8px;

  font-size: 11pt;
  color: #d2d2d2;
  transition: transform 0.2s, background 0.4s;
  font-family: "Pretendard";

  &:hover {
    transform: scale(1.03);
  }
`;

const HintButton = styled.button`
  background-color: rgba(255, 255, 255, 0);

  width: 60px;
  height: 45px;

  margin-right: 10px;

  border: 1px solid #eeeb82;
  border-radius: 8px;

  font-size: 12pt;
  color: #eeeb82;
  transition: transform 0.2s, background 0.4s;
  font-family: "Pretendard";

  &:hover {
    transform: scale(1.03);
  }
`;

const PendingButton = styled.button<{ postponed: boolean }>`
  background-color: rgba(255, 255, 255, 0);

  width: 60px;
  height: 45px;

  margin-right: 10px;

  border: ${({ postponed }) =>
    postponed === true ? "1px solid #b2b2b2" : "1px solid #d2d2d2"};
  border-radius: 8px;

  font-size: 12pt;
  color: ${({ postponed }) => (postponed === true ? "#b2b2b2" : "#d2d2d2")};
  transition: transform 0.2s, background 0.4s;
  font-family: "Pretendard";

  &:hover {
    transform: scale(1.03);
  }
`;

const RefuseButton = styled.button`
  background-color: rgba(255, 255, 255, 0);

  width: 110px;
  height: 45px;

  margin-right: 10px;

  border: 1px solid #719eff;
  border-radius: 8px;

  font-size: 12pt;
  color: #719eff;
  transition: transform 0.2s, background 0.4s;
  font-family: "Pretendard";

  &:hover {
    transform: scale(1.03);
  }
`;

const PreviousButton = styled.button`
  background-color: rgba(255, 255, 255, 0);

  width: 110px;
  height: 45px;

  margin-right: 10px;

  border: 1px solid #719eff;
  border-radius: 8px;

  font-size: 12pt;
  color: #719eff;
  transition: transform 0.2s, background 0.4s;
  font-family: "Pretendard";

  &:hover {
    transform: scale(1.03);
  }
`;

const NextButton = styled.button`
  background: #719eff;

  width: 110px;
  height: 45px;

  border: none;
  border-radius: 8px;

  font-size: 12pt;
  color: white;
  transition: transform 0.2s, background 0.4s;
  font-family: "Pretendard";

  &:hover {
    transform: scale(1.03);
  }
`;

const SubmitButton = styled.button`
  background: #719eff;

  width: 110px;
  height: 45px;

  border: none;
  border-radius: 8px;

  font-size: 12pt;
  color: white;
  transition: transform 0.2s, background 0.4s;
  font-family: "Pretendard";

  &:hover {
    transform: scale(1.03);
  }
`;

const CheckMission = () => {
  const [selectedOption, setSelectedOption] = useState<string>("mission");
  const [initial, setInitial] = useState("");

  const [currentStatusInitial, setCurrentStatusInitial] = useState("select");
  const [circleStatus, setCircleStatus] = useState([
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
  ]);
  const [currentCircleIndex, setCurrentCircleIndex] = useState(0);
  const [currentCircleStatus, setCurrentCircleStatus] = useState("");

  const [descriptionStatus, setDescriptionStatus] = useState([
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
  ]);
  const [currentDescription, setCurrentDescription] = useState("");

  const [submittedAnswer, setSubmittedAnswer] = useState(false);

  const { setWaiting } = useWaiting();

  interface WordObject {
    mission: number;
    ranking: number;
    word: string;
  }

  type WordsArray = WordObject[][]; // 2차원 배열, 배열의 각 요소가 WordObject 배열

  const [changeWordStatus, setChangeWordStatus] = useState<WordsArray>(
    Array(14).fill(Array(10).fill({ mission: 0, ranking: 0, word: "" }))
  );

  useEffect(() => {
    if (
      currentCircleStatus === "postponed" ||
      currentCircleStatus === "correct" ||
      currentCircleStatus === "wrong"
    )
      return;

    if (currentDescription) {
      updateCircleStatus("answered");
    } else {
      updateCircleStatus("");
    }
  }, [currentDescription]);

  const randomWord = () => {
    const randomIndex = Math.floor(Math.random() * characters.length);
    setInitial(characters[randomIndex]);
  };

  const updateChangeWordStatus = (desc: [], index: number) => {
    setChangeWordStatus((prevItems) =>
      prevItems.map((item, i) => (i === index ? desc : item))
    );
  };

  const updateManualDescriptionStatus = (desc: string, index: number) => {
    setDescriptionStatus((prevItems) =>
      prevItems.map((item, i) => (i === index ? desc : item))
    );

    setCurrentDescription(desc);
  };

  const updateDescriptionStatus = (e: any) => {
    let index = hangulChars.indexOf(currentStatusInitial);

    setDescriptionStatus((prevItems) =>
      prevItems.map((item, i) => (i === index ? e.target.value : item))
    );

    setCurrentDescription(e.target.value);
  };

  const updateCircleStatus = (status: string, ci?: number) => {
    let index =
      ci !== undefined ? ci : hangulChars.indexOf(currentStatusInitial);

    if (status === "" && currentDescription) {
      status = "answered";
    }

    setCircleStatus((prevItems) =>
      prevItems.map((item, i) => (i === index ? status : item))
    );

    setCurrentCircleStatus(status);
  };

  type handleAlarmArray = [string, number, string, [string, number, number]];

  const { showAlarm, setAlarm, alarmIcon, alarmDescription, remainedTime } =
    useAlarm();

  useEffect(() => {
    setCurrentCircleStatus(
      circleStatus[hangulChars.indexOf(currentStatusInitial)]
    );
    setCurrentCircleIndex(hangulChars.indexOf(currentStatusInitial));
  }, [currentStatusInitial]);

  const movePage = (page: number) => {
    setCurrentStatusInitial(hangulChars[page]);
    setCurrentDescription(descriptionStatus[page]);
  };

  const reviewWord = async () => {
    let initialList: string[];
    let initialone: string = initial;

    if (getDoumChar(initialone) !== "failed") {
      initialList = [initialone, getDoumChar(initialone)];
    } else {
      initialList = [initialone, initialone];
    }

    try {
      setWaiting(true);

      let response = await axios.post("http://127.0.0.1:5000/word", {
        word: initialList,
        type: "mission",
        mission: hangulChars[currentCircleIndex],
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

      for (tier = 0; tier < response.data.length; tier++) {
        var word = response.data[tier][0];
        var similarity: number = jaccardSimilarity(word, currentDescription);

        if (highSimilarity[1] < similarity)
          highSimilarity = [word, similarity, tier + 1];

        if (word[0] === currentDescription) {
          tier = word[2];
          break;
        }
      }

      if (tier === response.data.length) tier = -1;

      tier += 1;

      const values: handleAlarmArray = [
        currentDescription,
        tier,
        first,
        highSimilarity,
      ];
      return values;
    } catch (error) {
      console.log(error);
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
        let initialone: string = initial;

        if (getDoumChar(initialone) !== "failed") {
          initialList = [initialone, getDoumChar(initialone)];
        } else {
          initialList = [initialone, initialone];
        }

        try {
          setWaiting(true);

          let response = await axios.post("http://127.0.0.1:5000/word", {
            word: initialList,
            type: "mission",
            mission: hangulChars[currentCircleIndex],
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
    } catch (error) {
      console.log(error);
    }
  };

  const changeWrongWord = () => {
    const words = changeWordStatus[currentCircleIndex];

    let displayWord: string = "";

    for (let i = 0; i < 10; i++) {
      displayWord += `${i + 1}. ${words[i].word}\n`;
    }

    const findType = prompt(
      `변경해서 분석할 단어의 숫자를 입력해 주세요.
${displayWord}`
    );

    if (findType === null) return;

    let index = parseInt(findType) - 1;

    if (index > 9 || index < 0) {
      setAlarm("warning", "인덱스를 넘어갈 수 없습니다.");
      return;
    }

    const analyzeWord = words[index].word;
    const answeredWord = currentDescription
      .split("작성한 단어: ")[1]
      .split("\n")[0];

    let similarity: number = jaccardSimilarity(analyzeWord, answeredWord);

    const compareWord: string = compareStrings(analyzeWord, answeredWord);

    let desc = `작성한 단어: ${answeredWord}
${compareWord}
유사 단어는 ${analyzeWord}입니다.
유사율은 ${similarity.toFixed(2)}%입니다.
위 단어는 ${index + 1}티어입니다.`;

    updateManualDescriptionStatus(desc, index);
  };

  const changePage = (move: string) => {
    switch (move) {
      case "previous":
        if (currentStatusInitial === "가") {
          setCurrentStatusInitial("select");
        } else {
          setCurrentStatusInitial(
            hangulChars[hangulChars.indexOf(currentStatusInitial) - 1]
          );
          setCurrentDescription(
            descriptionStatus[hangulChars.indexOf(currentStatusInitial) - 1]
          );
        }
        break;
      case "next":
        if (currentStatusInitial === "select") {
          if (!initial) {
            setAlarm("error", "앞 글자가 비어 있을 수 없습니다.");
            return;
          }

          setCurrentStatusInitial("가");
          setCurrentDescription(descriptionStatus[0]);
        } else {
          setCurrentStatusInitial(
            hangulChars[hangulChars.indexOf(currentStatusInitial) + 1]
          );
          setCurrentDescription(
            descriptionStatus[hangulChars.indexOf(currentStatusInitial) + 1]
          );
        }
        break;
    }
  };

  const { showAlert } = useAlert();

  const receiveResetRequest = () => {
    showAlert({
      title: "끄코 단어 검색",
      description: `확인을 완료하고 초기로 돌아갑니다.`,
      onConfirm: () => {
        reset();
      },
    });
  };

  const reset = () => {
    setDescriptionStatus([
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
    ]);
    setCircleStatus(["", "", "", "", "", "", "", "", "", "", "", "", "", ""]);
    setInitial("");
    setCurrentStatusInitial("select");

    setSubmittedAnswer(false);
  };

  const submit = async () => {
    if (submittedAnswer) {
      receiveResetRequest();
      return;
    }

    let emptyDescription: boolean = false;
    for (let i = 0; i < descriptionStatus.length; i++) {
      if (descriptionStatus[i] === "" || circleStatus[i] === "postponed") {
        emptyDescription = true;
      }
    }

    let desc = emptyDescription
      ? "보류되거나 입력하지 않은 내용이 있습니다.\n"
      : "";

    showAlert({
      title: "끄코 단어 검색",
      description: `${desc}제출하시겠습니까?
      제출 이후에는 수정이 불가능합니다!`,
      onConfirm: () => {
        checkingAnswer();
      },
    });
  };

  const checkingAnswer = async () => {
    setSubmittedAnswer(true);

    let initialList: string[];
    let initialone: string = initial;

    if (getDoumChar(initialone) !== "failed") {
      initialList = [initialone, getDoumChar(initialone)];
    } else {
      initialList = [initialone, initialone];
    }

    try {
      setWaiting(true);

      let response = await axios.post("http://127.0.0.1:5000/mission_word", {
        initial: initialList,
        word: descriptionStatus,
        shMisType: "theory",
      });

      setWaiting(false);

      for (let i = 0; i < hangulChars.length; i++) {
        const words = response.data[hangulChars[i]];
        const answeredWord = descriptionStatus[i];

        const result = CheckCorrectWord(words, answeredWord);

        if (result.succeed === true) {
          let desc = `작성한 단어: ${result.compare}
위 단어는 ${result.tier}티어입니다.`;

          updateManualDescriptionStatus(desc, i);
          updateCircleStatus("correct", i);
        } else {
          let desc = `작성한 단어: ${answeredWord}
분석 결과: ${result.compare}
유사 단어는 ${result.jaccard.word}입니다.
유사율은 ${result.jaccard.rate.toFixed(2)}%입니다.
위 단어는 ${result.jaccard.tier}티어입니다.`;

          updateManualDescriptionStatus(desc, i);
          updateCircleStatus("wrong", i);
          updateChangeWordStatus(words, i);
        }
      }
    } catch (e) {
      console.log(e);
    }
  };

  const CheckCorrectWord = (words: [], answeredWord: string) => {
    let highSimilarity = { word: "", rate: 0, tier: 0 };
    let tier = 0;

    for (tier; tier < 10; tier++) {
      let word = words[tier]["word"];
      let similarity: number = jaccardSimilarity(word, answeredWord);

      if (highSimilarity.rate < similarity)
        highSimilarity = { word: word, rate: similarity, tier: tier + 1 };

      if (word === answeredWord) {
        break;
      }
    }

    const succeed = tier !== 10 ? true : false;
    const compareWord: string = compareStrings(
      highSimilarity.word,
      answeredWord
    );

    const result = {
      succeed: succeed,
      tier: tier + 1,
      jaccard: highSimilarity,
      compare: compareWord,
    };
    return result;
  };

  const handleInitialChange = (e: any) => {
    setInitial(e.target.value);
  };

  const wordRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setTimeout(() => {
      if (wordRef.current) wordRef.current.focus();
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

      <Title>미션 확인</Title>

      <MissionDiv>
        {currentStatusInitial === "select" ? (
          <AnalyzingWordDiv>
            <AWLabel>
              {!submittedAnswer ? "앞 글자 입력" : "설정한 앞 글자"}
            </AWLabel>
            <AWInput
              type="text"
              value={initial}
              onChange={handleInitialChange}
              maxLength={1}
              disabled={submittedAnswer}
              ref={wordRef}
            />
          </AnalyzingWordDiv>
        ) : (
          <MissionLineDiv>
            <CircleDiv>
              {circleStatus.map((status: string, index: number) => (
                <Circle
                  status={status}
                  index={index}
                  currentIndex={currentCircleIndex}
                  onClick={() => movePage(index)}
                />
              ))}
            </CircleDiv>
            <MissionInput
              onChange={updateDescriptionStatus}
              value={currentDescription}
              placeholder={`${hangulChars[currentCircleIndex]} 미션을 입력해 주세요.`}
              disabled={submittedAnswer}
            />
          </MissionLineDiv>
        )}

        <ButtonContainer>
          {currentStatusInitial !== "select" ? (
            submittedAnswer ? (
              <>
                {currentCircleStatus === "wrong" && (
                  <RefuseButton onClick={changeWrongWord}>
                    단어 변경
                  </RefuseButton>
                )}
                <PreviousButton onClick={() => changePage("previous")}>
                  이전
                </PreviousButton>
              </>
            ) : (
              <>
                <PendingButton
                  postponed={currentCircleStatus === "postponed" ? true : false}
                  onClick={() =>
                    updateCircleStatus(
                      currentCircleStatus === "postponed" ? "" : "postponed"
                    )
                  }
                >
                  {currentCircleStatus === "postponed" ? "해제" : "보류"}
                </PendingButton>
                <HintButton onClick={hint}>힌트</HintButton>
                <PreviousButton onClick={() => changePage("previous")}>
                  이전
                </PreviousButton>
              </>
            )
          ) : !submittedAnswer ? (
            <RandomWordButton onClick={randomWord}>랜덤</RandomWordButton>
          ) : (
            <></>
          )}
          {currentStatusInitial !== "하" ? (
            <NextButton onClick={() => changePage("next")}>다음</NextButton>
          ) : (
            <SubmitButton onClick={() => submit()}>
              {submittedAnswer ? "확인 완료" : "정답 확인"}
            </SubmitButton>
          )}
        </ButtonContainer>
      </MissionDiv>
    </Header>
  );
};

export default CheckMission;
