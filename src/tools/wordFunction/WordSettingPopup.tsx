import axios from "axios";
import React, { Dispatch, SetStateAction, useEffect, useState } from "react";
import styled from "styled-components";
import { useAlarm } from "../alarmFunction/AlarmProvider";

const SettingPopupDiv = styled.button`
  background-color: rgba(255, 255, 255, 0.5);

  position: fixed;

  top: 0;
  left: 0;

  width: 100%;
  height: 100%;

  border: none;

  display: flex;
  justify-content: center;
  align-items: center;

  font-family: "KCC-Hanbit";

  z-index: 1;
`;

const Popup = styled.div`
  background-color: rgb(255, 255, 255);
  width: 350px;
  height: 250px;

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  border-radius: 5px;
`;

const Title = styled.h1``;

const WordDiv = styled.div`
  width: 100%;
  height: 30%;

  display: flex;
  justify-content: center;
  flex-direction: row;
`;

const KnownDiv = styled.button`
  background-color: rgba(0, 0, 0, 0);

  width: 50%;
  height: 100%;

  border: none;

  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;

  font-family: "KCC-Hanbit";
`;

const KeywordDiv = styled.button`
  background-color: rgba(0, 0, 0, 0);

  width: 50%;
  height: 100%;

  border: none;

  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;

  font-family: "KCC-Hanbit";
`;

const Known = styled.img`
  margin-bottom: 10px;
`;

const Keyword = styled.img`
  margin-bottom: 10px;
`;

const KnownText = styled.p``;

const KeywordText = styled.p``;

const PhraseDiv = styled.div`
  width: 100%;

  display: flex;
  align-items: center;
  flex-direction: column;
`;

const PhraseData = styled.p`
  width: 100%;
  margin-top: 10px;

  font-size: 12pt;
`;

const PhraseInputDiv = styled.div`
  width: 100%;
  height: 40px;

  margin-top: 10px;

  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: row;
`;

const Phrase = styled.textarea`
  width: 60%;
  height: 30px;
  padding-top: 4px;
  padding-left: 7px;

  resize: none;

  font-family: "KCC-Hanbit";
`;

const PhraseSubmit = styled.button`
  margin-left: 10px;
  height: 30px;
  width: 40px;

  font-family: "KCC-Hanbit";
`;

const Exit = styled.button`
  background-color: rgba(0, 0, 0, 0);

  border: none;

  width: 60px;
  height: 25px;

  margin-top: 10px;

  font-family: "KCC-Hanbit";
`;

interface WordSettingPopupProps {
  setWordOpenSetting: Dispatch<SetStateAction<boolean>>;
  word: string;
  checked: number;
  Search?: Dispatch<SetStateAction<void>>;
}

export const WordSettingPopup = ({
  setWordOpenSetting,
  word,
  checked,
  Search,
}: WordSettingPopupProps) => {
  const [title, setTitle] = useState("단어 설정");
  const [wordSettingScreenType, setWordSettingScreenType] =
    useState("단어 설정");
  const [phrase, setPhrase] = useState();
  const [currentPhraseData, setCurrentPhraseData] = useState();

  const { setAlarm } = useAlarm();

  const handlePhraseChange = (event: any) => {
    setPhrase(event.target.value);
  };

  const knownWord = async (word: any, checked: number) => {
    try {
      await axios.post("http://127.0.0.1:5000/known", {
        word: word,
        checked: checked,
      });

      if (Search) Search();
      setWordOpenSetting(false);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (wordSettingScreenType === "암기용 문구") currentPhrase();
  }, [wordSettingScreenType]);

  const currentPhrase = async () => {
    try {
      const response = await axios.post(
        "http://127.0.0.1:5000/current_phrase",
        {
          word: word,
        }
      );

      var requested = response.data;

      setCurrentPhraseData(requested);
    } catch (error) {
      console.log(error);
    }
  };

  const modifyRememberPhrase = async (phrase: any) => {
    try {
      const response = await axios.post("http://127.0.0.1:5000/reme_phrase", {
        word: word,
        phrase: phrase,
      });

      const result = response.data[0];

      switch (result) {
        case "success":
          setAlarm("success", `성공적으로 수정되었습니다.`);
          break;
        case "error":
          setAlarm("error", `오류가 발생했습니다.`);
          break;
      }
    } catch (error) {
      console.log(error);
    }
  };

  const rememberPhrase = () => {
    setTitle("암기용 문구");
    setWordSettingScreenType("암기용 문구");
  };

  const wordSetting = () => {
    setTitle("단어 설정");
    setWordSettingScreenType("단어 설정");
  };

  return (
    <SettingPopupDiv>
      <Popup>
        <Title>{title}</Title>

        {wordSettingScreenType === "단어 설정" && (
          <>
            <WordDiv>
              <KnownDiv onClick={() => knownWord(word, checked)}>
                <Known src="X"></Known>
                <KnownText>
                  {!checked ? "외움 표시" : "외우지 않음 표시"}
                </KnownText>
              </KnownDiv>

              <KeywordDiv onClick={rememberPhrase}>
                <Keyword src="X"></Keyword>
                <KeywordText>암기용 문구</KeywordText>
              </KeywordDiv>
            </WordDiv>

            <Exit onClick={() => setWordOpenSetting(false)}>나가기</Exit>
          </>
        )}

        {wordSettingScreenType === "암기용 문구" && (
          <>
            <WordDiv>
              <PhraseDiv>
                <PhraseData>현재 문구: {currentPhraseData}</PhraseData>
                <PhraseInputDiv>
                  <Phrase
                    value={phrase}
                    onChange={handlePhraseChange}
                    placeholder="암기 문구를 작성해 주세요!"
                  />
                  <PhraseSubmit onClick={() => modifyRememberPhrase(phrase)}>
                    설정
                  </PhraseSubmit>
                </PhraseInputDiv>
              </PhraseDiv>
            </WordDiv>

            <Exit onClick={wordSetting}>뒤로</Exit>
          </>
        )}
      </Popup>
    </SettingPopupDiv>
  );
};
