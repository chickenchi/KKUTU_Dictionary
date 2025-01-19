import React, { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import axios from "axios";
import {
  getFromLocalStorage,
  saveToLocalStorage,
} from "../commonFunctions/LocalStorage";
import { Alarm } from "../tools/alarmFunction/AlarmManager";
import { useAlarm } from "../tools/alarmFunction/AlarmProvider";
import { getDoumChar } from "./functions/GetDoumChar";
import { useWaiting } from "../tools/waitFunction/WaitProvider";

const Header = styled.div`
  background-color: white;
  width: 100%;
  height: 88%;

  font-family: "Pretendard";
`;

const Title = styled.p`
  padding-top: 50px;
  margin-left: 50px;
  font-weight: 500;
  font-size: 28pt;
`;

const SearchInput = styled.input`
  width: 136px;
  height: 35px;

  border: none;
  border-radius: 4px;

  margin-left: 50px;
  margin-right: 10px;
  margin-top: 30px;

  padding-left: 10px;

  color: rgb(150, 150, 150);
  font-size: 12pt;
  font-weight: 300;
  font-family: "Pretendard";

  &::placeholder {
    color: rgb(200, 200, 200);
  }
`;

const SearchButton = styled.button`
  background-color: #719eff;

  width: 68px;
  height: 35px;

  border-radius: 4px;
  border: none;

  color: white;
  font-size: 12pt;
  font-weight: 300;
  font-family: "Pretendard";

  cursor: pointer;

  transition: background-color 0.3s ease, transform 0.2s ease,
    box-shadow 0.2s ease;

  &:hover {
    background-color: #507acc;
  }

  &:active {
    background-color: #3e6bb3;
    transform: scale(0.98);
  }

  &:focus {
    outline: none;
  }
`;

const ImportWord = styled.div`
  background-color: none;

  margin-top: 20px;
  margin-left: 20px;

  border-radius: 10px;
  border: none;

  width: 95%;
  height: 70%;

  padding-left: 20px;
  padding-top: 20px;

  overflow-y: auto;
  overflow-x: hidden;
`;

const WordType = styled.div`
  margin-bottom: 10px;
`;

const WordTypeText = styled.p`
  color: rgb(60, 60, 60);
  font-size: 18pt;
`;

const Result = styled.div``;

const WinWordText = styled.button`
  background-color: rgba(230, 230, 230, 0);

  margin-bottom: 5px;

  border: none;

  display: block;

  color: rgb(130, 130, 130);
  font-size: 13pt;
  font-family: "Pretendard";
`;

const GroupHeader = styled.div`
  cursor: pointer;
  font-weight: bold;
  padding: 10px;
  margin: 5px 0;
`;

const GroupBody = styled.div`
  padding-left: 20px;
`;

const ToggleIcon = styled.span`
  margin-right: 10px;
  font-size: 12px;
`;

const AttackPattern = () => {
  const { setWaiting } = useWaiting();

  const getAllWord = async () => {
    try {
      setWaiting(true);

      const response = await axios.post("http://127.0.0.1:5000/all_word", {});
      const allData = response.data;

      const groupedData: { [key: string]: any[] } = {};

      allData.forEach((item: any[]) => {
        const firstChar = item[0];
        if (!groupedData[firstChar]) {
          groupedData[firstChar] = [];
        }
        groupedData[firstChar].push(item);
      });

      return groupedData;
    } catch (e) {
      console.error("Error fetching words:", e);
      return null;
    }
  };

  const getInitial = async () => {
    try {
      const response = await axios.post("http://127.0.0.1:5000/initial", {});

      setWaiting(false);

      const initials = response.data;

      return initials;
    } catch (e) {
      console.error("Error fetching words:", e);
      return null;
    }
  };

  const [words, setWords] = useState<{ [key: string]: any[] }>({});
  const [initial, setInitial] = useState<string>("");

  const settingSearchAttackRoute = async () => {
    if (!textInitial) {
      setAlarm("warning", "앞 글자를 입력하세요.");
      return;
    }

    const isAccepted = await getFromLocalStorage("isAcceptedAllWord");

    let fetchedAllWords;
    let fetchedInitial;

    if (!isAccepted) {
      fetchedAllWords = await getAllWord();
      if (fetchedAllWords) setWords(fetchedAllWords);

      fetchedInitial = await getInitial();
      fetchedInitial = fetchedInitial.join(",");
      if (fetchedInitial) setInitial(fetchedInitial);

      await saveToLocalStorage("isAcceptedAllWord", true);

      await saveToLocalStorage("AllWord", fetchedAllWords);
      await saveToLocalStorage("Initial", fetchedInitial);
    } else {
      fetchedAllWords = await getFromLocalStorage("AllWord");
      await setWords(fetchedAllWords);

      fetchedInitial = await getFromLocalStorage("Initial");
      await setInitial(fetchedInitial);
    }
  };

  useEffect(() => {
    if (Object.keys(initial).length !== 0) {
      analyzeWord(textInitial);
    }
  }, [initial]);

  const [result, setResult] = useState<any>();
  const [wordType, setWordType] = useState<any>();

  const findWinWord = (matchingWords: string[]) => {
    const winningWords = [];

    for (const word of matchingWords) {
      const lastChar = word[word.length - 1];

      if (initial.includes(lastChar)) {
        winningWords.push(word);
      }
    }

    return winningWords;
  };

  const [openGroups, setOpenGroups] = useState<{ [key: string]: boolean }>({});

  // 그룹을 열고 닫는 함수
  const toggleGroup = (lastChar: string) => {
    setOpenGroups((prevState) => ({
      ...prevState,
      [lastChar]: !prevState[lastChar], // 해당 키의 열림/닫힘 상태 토글
    }));
  };

  useEffect(() => {
    if (Object.keys(openGroups).length !== 0) settingSearchAttackRoute();
  }, [openGroups]);

  const analyzeWord = (ini: string) => {
    setResult(null);

    if (words[ini] === undefined && words[getDoumChar(ini)] === undefined) {
      setWordType(<WordTypeText>한방 단어</WordTypeText>);
      setInitial("");
      return;
    }

    if (initial.includes(ini)) {
      setWordType(<WordTypeText>필패 단어</WordTypeText>);

      const matchingWords = words[ini] || words[getDoumChar(ini)];
      let winningWords: { [key: string]: string[] } = {};

      if (matchingWords !== undefined) {
        for (const word of matchingWords) {
          const lastChar = word[word.length - 1];
          const doumLastChar: string = getDoumChar(lastChar);

          let matchingWordsList;

          if (
            words[lastChar] === undefined &&
            words[doumLastChar] === undefined
          ) {
            continue;
          }

          matchingWordsList = [
            ...(words[lastChar] || []),
            ...(words[doumLastChar] || []),
          ];

          if (matchingWordsList !== undefined) {
            const foundWinningWords = findWinWord(matchingWordsList);

            // 끝 글자를 키로 하는 방식으로 관리
            if (foundWinningWords.length > 0) {
              for (const foundWord of foundWinningWords) {
                const foundFirstChar = foundWord[0];

                if (!winningWords[foundFirstChar]) {
                  winningWords[foundFirstChar] = [];
                }

                winningWords[foundFirstChar] = [
                  ...winningWords[foundFirstChar],
                  foundWord,
                ];
              }
            } else {
              if (!winningWords[lastChar]) {
                winningWords[lastChar] = [];
              }
            }
          }
        }
      }

      setResult(
        <>
          {Object.entries(winningWords).map(([lastChar, words], index) => (
            <div key={index}>
              <GroupHeader onClick={() => toggleGroup(lastChar)}>
                <ToggleIcon>{openGroups[lastChar] ? "▼" : "►"}</ToggleIcon>
                {lastChar} ({words.length})
              </GroupHeader>

              {openGroups[lastChar] && (
                <GroupBody>
                  {words.map((word, wordIndex) => (
                    <WinWordText
                      onClick={() => {
                        setTextInitial(word[word.length - 1]);
                        analyzeWord(word[word.length - 1]);
                      }}
                      key={`${index}-${wordIndex}`}
                    >
                      {word}
                    </WinWordText>
                  ))}
                </GroupBody>
              )}
            </div>
          ))}
        </>
      );

      setInitial("");

      return;
    }

    const doumLastChar: string | undefined = getDoumChar(ini);
    let winningWords: { [key: string]: string[] } = {};
    let foundWinningWords;

    let matchingWords = [...words[ini], ...(words[doumLastChar] || [])];

    if (matchingWords !== undefined) {
      foundWinningWords = findWinWord(matchingWords);
    } else {
      return;
    }

    if (foundWinningWords.length > 0) {
      for (const foundWord of foundWinningWords) {
        const foundLastChar = foundWord[foundWord.length - 1];

        if (!winningWords[foundLastChar]) {
          winningWords[foundLastChar] = [];
        }

        winningWords[foundLastChar] = [
          ...winningWords[foundLastChar],
          foundWord,
        ];
      }
    } else {
      if (!winningWords[ini]) {
        winningWords[ini] = [];
      }
    }

    if (foundWinningWords.length > 0) {
      setWordType(<WordTypeText>필승 단어</WordTypeText>);
      setResult(
        <>
          {Object.entries(winningWords).map(([lastChar, words], index) => (
            <div key={index}>
              <GroupHeader onClick={() => toggleGroup(lastChar)}>
                <ToggleIcon>{openGroups[lastChar] ? "▼" : "►"}</ToggleIcon>
                {lastChar} ({words.length})
              </GroupHeader>

              {openGroups[lastChar] && (
                <GroupBody>
                  {words.map((word, wordIndex) => (
                    <WinWordText
                      onClick={() => {
                        setTextInitial(word[word.length - 1]);
                        analyzeWord(word[word.length - 1]);
                      }}
                      key={`${index}-${wordIndex}`}
                    >
                      {word}
                    </WinWordText>
                  ))}
                </GroupBody>
              )}
            </div>
          ))}
        </>
      );
    } else {
      let winningWords: { [key: string]: string[] } = {};
      let neuturalWords: { [key: string]: string[] } = {};
      let isNoFail: boolean = false;
      let repeatedWord: string[] = [];

      if (matchingWords !== undefined) {
        for (const word of matchingWords) {
          const lastChar = word[word.length - 1];
          const doumLastChar: string = getDoumChar(lastChar);

          if (words[lastChar] === undefined) {
            continue;
          }

          let matchingWords = [
            ...words[lastChar],
            ...(words[doumLastChar] || []),
          ];

          const fw = findWinWord(matchingWords);

          if (fw.length !== 0) {
            if (!winningWords[lastChar]) winningWords[lastChar] = [];
            winningWords[lastChar] = [...winningWords[lastChar], ...fw];
          } else {
            if (initial.includes(lastChar) || initial.includes(doumLastChar)) {
              if (winningWords[lastChar])
                winningWords[lastChar] = [...winningWords[lastChar], word];
              else winningWords[lastChar] = [word];
              continue;
            }

            if (lastChar === ini || doumLastChar === ini) {
              repeatedWord.push(word);
              continue;
            }

            isNoFail = true;

            if (neuturalWords[lastChar])
              neuturalWords[lastChar] = [...neuturalWords[lastChar], word];
            else neuturalWords[lastChar] = [word];
          }
        }

        for (const word of Object.keys(neuturalWords)) {
          const lastChar = word[word.length - 1];
          const doumLastChar: string = getDoumChar(lastChar);

          if (words[lastChar] === undefined) {
            continue;
          }

          let wordSet: string[] = words[lastChar] || [];
          let lastWordSet: string[] = words[doumLastChar] || [];

          wordSet = wordSet.filter((item) => item[0] !== item[item.length - 1]);

          lastWordSet = lastWordSet.filter(
            (item) => item[0] !== item[item.length - 1]
          );

          let matchingWords = [...wordSet, ...(lastWordSet || [])];

          let isNoFail = false;

          for (const word of matchingWords) {
            const lastChar = word[word.length - 1];
            const doumLastChar: string = getDoumChar(lastChar);

            if (words[lastChar] === undefined) {
              continue;
            }

            let matchingWords = [
              ...words[lastChar],
              ...(words[doumLastChar] || []),
            ];

            const fw = findWinWord(matchingWords);

            if (fw.length === 0) {
              isNoFail = true;
              break;
            }
          }

          if (!isNoFail) {
            if (Object.keys(neuturalWords[lastChar]).length === 1) {
              delete neuturalWords[lastChar];
            } else {
              neuturalWords[lastChar] = neuturalWords[lastChar].filter(
                (item) => item !== word
              );
            }
          }
        }
      }

      if (isNoFail) {
        if (repeatedWord.length !== 0) {
          neuturalWords[ini] = [];
          neuturalWords[ini] = [...neuturalWords[ini], ...repeatedWord];
        }

        setWordType(<WordTypeText>중립 단어</WordTypeText>);
        setResult(
          <>
            {Object.entries(neuturalWords).map(([lastChar, words], index) => (
              <div key={index}>
                <GroupHeader onClick={() => toggleGroup(lastChar)}>
                  <ToggleIcon>{openGroups[lastChar] ? "▼" : "►"}</ToggleIcon>
                  {lastChar} ({words.length})
                </GroupHeader>

                {openGroups[lastChar] && (
                  <GroupBody>
                    {words.map((word, wordIndex) => (
                      <WinWordText
                        onClick={() => {
                          setTextInitial(word[word.length - 1]);
                          analyzeWord(word[word.length - 1]);
                        }}
                        key={`${index}-${wordIndex}`}
                      >
                        {word}
                      </WinWordText>
                    ))}
                  </GroupBody>
                )}
              </div>
            ))}
          </>
        );
      } else {
        if (repeatedWord.length !== 0) {
          winningWords[ini] = [];
          winningWords[ini] = [...winningWords[ini], ...repeatedWord];
        }

        setWordType(<WordTypeText>필승 단어</WordTypeText>);
        setResult(
          <>
            {Object.entries(winningWords).map(([lastChar, words], index) => (
              <div key={index}>
                <GroupHeader onClick={() => toggleGroup(lastChar)}>
                  <ToggleIcon>{openGroups[lastChar] ? "▼" : "►"}</ToggleIcon>
                  {lastChar} ({words.length})
                </GroupHeader>

                {openGroups[lastChar] && (
                  <GroupBody>
                    {words.map((word, wordIndex) => (
                      <WinWordText
                        onClick={() => {
                          setTextInitial(word[word.length - 1]);
                          analyzeWord(word[word.length - 1]);
                        }}
                        key={`${index}-${wordIndex}`}
                      >
                        {word}
                      </WinWordText>
                    ))}
                  </GroupBody>
                )}
              </div>
            ))}
          </>
        );
      }
    }

    setInitial("");
  };

  const [textInitial, setTextInitial] = useState<string>("");

  const handleTextInitialChange = (e: any) => {
    setTextInitial(e.target.value);
  };

  const handleKeyDown = (e: any) => {
    if (e.key === "Enter") {
      e.preventDefault();
      settingSearchAttackRoute();
    }
  };

  const { setAlarm, showAlarm, alarmIcon, alarmDescription, remainedTime } =
    useAlarm();

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

      <Title>공격 루트</Title>

      <SearchInput
        value={textInitial}
        onChange={handleTextInitialChange}
        onKeyDown={handleKeyDown}
        type="text"
        placeholder="앞 글자 입력"
        maxLength={1}
        ref={wordRef}
      />

      <SearchButton onClick={settingSearchAttackRoute}>검색</SearchButton>

      <ImportWord>
        <WordType>{wordType}</WordType>
        <Result>{result}</Result>
      </ImportWord>
    </Header>
  );
};

export default AttackPattern;
