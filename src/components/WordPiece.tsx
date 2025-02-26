import React, { useEffect, useRef, useState } from "react";
import { styled } from "styled-components";
import axios from "axios";
import { useAlarm } from "../tools/alarmFunction/AlarmProvider";
import { Alarm } from "../tools/alarmFunction/AlarmManager";
import { useRecoilState } from "recoil";
import {
  highWordPiecesState,
  rareWordPiecesState,
  wordPieceSettingState,
  wordPiecesState,
} from "../RecoilAtoms/wordPiece/WordPieceAtom";

const Header = styled.div`
  background-color: white;
  width: 100%;
  height: 88%;

  font-family: "Pretendard";
`;

const Title = styled.p`
  margin: 70px 70px 30px 70px;

  font-weight: 500;
  font-size: 28pt;
`;

const WordPieces = styled.div`
  background-color: rgb(240, 240, 240);
  width: 100%;
  height: 90px;

  padding-left: 10px;

  margin-bottom: 50px;

  display: flex;
  align-items: center;
  overflow-x: auto;

  &::-webkit-scrollbar {
    display: none;
  }
`;

const Piece = styled.button<{ colorType: string }>`
  background-color: ${({ colorType }) =>
    colorType === "common"
      ? "#dddddd"
      : colorType === "high"
      ? "#A6C5FF"
      : "#FFED30"};

  height: 70px;
  width: 70px;

  border: none;
  border-radius: 100px;

  display: flex;
  align-items: center;
  justify-content: center;

  color: rgb(40, 40, 40);
  font-size: 17pt;

  margin-right: 10px;

  flex-shrink: 0;

  cursor: pointer;
  transition: background-color 0.3s ease, transform 0.2s ease,
    box-shadow 0.2s ease;

  &:hover {
    background-color: rgba(250, 0, 0);
  }
`;

const PieceDiv = styled.div`
  position: relative;
`;

const PieceCount = styled.p`
  position: absolute;

  top: 0;
  right: 10px;
`;

const InputDiv = styled.div`
  width: 100%;

  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
`;

const InputTitle = styled.p`
  font-size: 22pt;
  margin-bottom: 15px;
`;

const InputTextDiv = styled.div`
  margin-bottom: 20px;
`;

const InputPiece = styled.input`
  width: 60px;
  height: 60px;

  margin-right: 20px;

  font-size: 14pt;
  text-align: center;
`;

const InputPieceCount = styled.input`
  width: 60px;
  height: 60px;

  font-size: 14pt;
  text-align: center;
`;

const SubmitPiece = styled.button`
  background-color: rgba(0, 0, 0, 0);

  width: 90px;
  height: 35px;

  color: #719eff;
  font-size: 11pt;

  margin-bottom: 5px;

  border: 1px solid #719eff;
  border-radius: 4px;

  cursor: pointer;
  transition: background-color 0.3s ease, transform 0.2s ease,
    box-shadow 0.2s ease;
  font-family: "Pretendard";

  &:hover {
    background-color: rgba(230, 230, 230);
  }

  &:active {
    background-color: rgba(240, 240, 240);
    transform: scale(0.98);
  }

  &:focus {
    outline: none;
  }
`;

const SearchButton = styled.button`
  background-color: #719eff;

  width: 90px;
  height: 35px;

  color: white;
  font-size: 11pt;

  border: none;
  border-radius: 4px;

  cursor: pointer;
  transition: background-color 0.3s ease, transform 0.2s ease,
    box-shadow 0.2s ease;
  font-family: "Pretendard";

  &:hover {
    background-color: rgba(230, 230, 230);
  }

  &:active {
    background-color: rgba(240, 240, 240);
    transform: scale(0.98);
  }

  &:focus {
    outline: none;
  }
`;

const WordDiv = styled.div`
  width: 100%;
  height: auto;
`;

const WordTitle = styled.p`
  font-size: 17pt;

  margin-left: 20px;
  margin-bottom: 10px;
`;

const Words = styled.div`
  background-color: rgb(230, 230, 230);

  width: 100%;
  height: 70px;

  margin-bottom: 20px;

  display: flex;
  align-items: center;

  overflow-x: auto;

  &::-webkit-scrollbar {
    display: none;
  }
`;

const Word = styled.button`
  background-color: rgba(0, 0, 0, 0);

  border: 1px solid rgb(40, 40, 40);
  border-radius: 3px;

  color: rgb(40, 40, 40);

  width: 100px;
  height: 40px;
  margin-right: 10px;

  flex-shrink: 0;

  display: flex;
  align-items: center;
  justify-content: center;
`;

const BackButton = styled.button`
  background-color: #719eff;

  width: 90px;
  height: 35px;

  color: white;
  font-size: 11pt;

  border: none;
  border-radius: 4px;

  cursor: pointer;
  transition: background-color 0.3s ease, transform 0.2s ease,
    box-shadow 0.2s ease;
  font-family: "Pretendard";

  &:hover {
    background-color: rgba(230, 230, 230);
  }

  &:active {
    background-color: rgba(240, 240, 240);
    transform: scale(0.98);
  }

  &:focus {
    outline: none;
  }
`;

const WordPiece = () => {
  const [setting] = useRecoilState(wordPieceSettingState);
  const { showAlarm, alarmIcon, alarmDescription, remainedTime } = useAlarm();

  return (
    <Header className="Header">
      <Title>글자 조각</Title>

      {showAlarm && (
        <Alarm
          iconType={alarmIcon}
          description={alarmDescription}
          remainedTime={remainedTime}
        />
      )}

      {setting === "wordPiece" ? (
        <WordPieceComponent />
      ) : (
        <WordResultComponent />
      )}
    </Header>
  );
};

const WordPieceComponent = () => {
  const [, setSetting] = useRecoilState(wordPieceSettingState);
  const [pieces, setPieces] = useRecoilState(wordPiecesState);
  const [highPieces, setHighPieces] = useRecoilState(highWordPiecesState);
  const [rarePieces, setRarePieces] = useRecoilState(rareWordPiecesState);

  const [word, setWord] = useState("");
  const [wordCount, setWordCount] = useState<string>("");

  const { setAlarm } = useAlarm();

  const removePiece = (word: string, pieceType: string) => {
    const removingPiece = (prevPieces: Set<[string, number]>) => {
      const newPieces = new Set(prevPieces);

      newPieces.forEach((piece) => {
        if (piece[0] === word) newPieces.delete(piece);
      });

      return newPieces;
    };

    switch (pieceType) {
      case "common":
        setPieces((prevPieces) => {
          return removingPiece(prevPieces);
        });
        break;

      case "high":
        setHighPieces((prevPieces) => {
          return removingPiece(prevPieces);
        });
        break;

      case "rare":
        setRarePieces((prevPieces) => {
          return removingPiece(prevPieces);
        });
        break;
    }
  };

  const insertPiece = () => {
    let wc = parseInt(wordCount);

    if (!word) {
      setAlarm("warning", "글자를 입력해 주세요.");
      return;
    }

    if (!wordCount) {
      wc = 1;
    }

    if (isNaN(wc)) {
      setAlarm("warning", "오른쪽 개수란에 숫자를 입력해 주세요.");
      return;
    }

    const newPieces = new Set(pieces);
    let isDuplicate = false;

    newPieces.forEach((piece) => {
      if (piece[0] === word) {
        isDuplicate = true;

        if (piece[1] !== wc) {
          newPieces.delete(piece);
          newPieces.add([word, wc]);
        }
      }
    });

    if (!isDuplicate) newPieces.add([word, wc]);

    setPieces(newPieces);
  };

  const loadPiece = async () => {
    const copied: string = await navigator.clipboard.readText();

    const itemLength: number =
      copied.split('<div class="dress-item-title">').length - 1;

    const newPieces = new Set<[string, number]>(pieces);
    const newHighPieces = new Set<[string, number]>(pieces);
    const newRarePieces = new Set<[string, number]>(pieces);

    for (let i = 1; i < itemLength; i++) {
      let item = copied
        .split('<div class="dress-item-title">')
        [i].split("</div>")[0];

      if (item.includes("글자 조각")) {
        let itemPiece = item.split("글자 조각 - ")[1];
        let itemCount = parseInt(copied.split(">x")[i].split("</div>")[0]);

        if (item.includes("희귀 글자 조각")) {
          newRarePieces.add([itemPiece, itemCount]);
        } else if (item.includes("고급 글자 조각")) {
          newHighPieces.add([itemPiece, itemCount]);
        } else {
          newPieces.add([itemPiece, itemCount]);
        }
      }
    }

    setPieces(newPieces);
    setHighPieces(newHighPieces);
    setRarePieces(newRarePieces);
  };

  const moveWordResult = () => {
    if (!pieces.size) {
      setAlarm("warning", "최소 한 개의 글자 조각이 필요합니다.");
      return;
    }
    setSetting("wordResult");
  };

  useEffect(() => {
    setWord("");
    setWordCount("");
  }, [pieces, setPieces]);

  const setWordChange = (e: any) => {
    setWord(e.target.value);
  };

  const setWordCountChange = (e: any) => {
    setWordCount(e.target.value);
  };

  const pieceRef = useRef<HTMLInputElement | null>(null);
  const pieceCountRef = useRef<HTMLInputElement | null>(null);

  const handleKeyDown = (e: any) => {
    switch (e.key) {
      case "Enter":
        if (pieceRef.current) {
          pieceRef.current.focus();
        }
        insertPiece();
        break;
      case "ArrowLeft":
        if (pieceRef.current) {
          pieceRef.current.value = "";
          pieceRef.current.focus();
        }
        break;
      case "ArrowRight":
        if (pieceCountRef.current) {
          pieceCountRef.current.value = "";
          pieceCountRef.current.focus();
        }
        break;
    }
  };

  return (
    <>
      <WordPieces>
        {Array.from(rarePieces).map((word) => (
          <PieceDiv>
            <Piece
              colorType="rare"
              onClick={() => removePiece(word[0], "rare")}
            >
              {word[0]}
            </Piece>
            <PieceCount>x{word[1]}</PieceCount>
          </PieceDiv>
        ))}
        {Array.from(highPieces).map((word) => (
          <PieceDiv>
            <Piece
              colorType="high"
              onClick={() => removePiece(word[0], "high")}
            >
              {word[0]}
            </Piece>
            <PieceCount>x{word[1]}</PieceCount>
          </PieceDiv>
        ))}
        {Array.from(pieces).map((word) => (
          <PieceDiv>
            <Piece
              colorType="common"
              onClick={() => removePiece(word[0], "common")}
            >
              {word[0]}
            </Piece>
            <PieceCount>x{word[1]}</PieceCount>
          </PieceDiv>
        ))}
      </WordPieces>

      <InputDiv>
        <InputTitle>조각 입력</InputTitle>

        <InputTextDiv>
          <InputPiece
            value={word}
            type="text"
            placeholder="글자"
            onChange={setWordChange}
            onKeyDown={handleKeyDown}
            maxLength={1}
            ref={pieceRef}
          />
          <InputPieceCount
            value={wordCount}
            type="text"
            placeholder="개수"
            onKeyDown={handleKeyDown}
            onChange={setWordCountChange}
            maxLength={3}
            ref={pieceCountRef}
          />
        </InputTextDiv>

        <SubmitPiece onClick={() => insertPiece()}>삽입</SubmitPiece>
        <SubmitPiece onClick={() => loadPiece()}>불러오기</SubmitPiece>
        <SearchButton onClick={() => moveWordResult()}>단어 찾기</SearchButton>
      </InputDiv>
    </>
  );
};

const WordResultComponent = () => {
  const [, setSetting] = useRecoilState(wordPieceSettingState);
  const [pieces, setPieces] = useRecoilState(wordPiecesState);
  const [highPieces, setHighPieces] = useRecoilState(highWordPiecesState);
  const [rarePieces, setRarePieces] = useRecoilState(rareWordPiecesState);

  const { setAlarm } = useAlarm();

  const [wordList, setWordList] = useState<{ [key: number]: any[] }>({
    6: [],
    5: [],
    4: [],
    3: [],
    2: [],
    1: [],
  });

  useEffect(() => {
    const findWord = async () => {
      const piecesArray = Array.from(pieces);
      const highPiecesArray = Array.from(highPieces);
      const rarePiecesArray = Array.from(rarePieces);

      const response = await axios.post(
        "http://127.0.0.1:5000/find_word_by_piece",
        {
          pieces: piecesArray,
          highPieces: highPiecesArray,
          rarePieces: rarePiecesArray,
        }
      );

      const result = response.data;

      const newWordList: { [key: number]: any[] } = {
        6: [],
        5: [],
        4: [],
        3: [],
        2: [],
        1: [],
      };

      for (let i = 0; i < result.length; i++) {
        let wordLength = result[i].length;
        let word = result[i];

        if (wordLength == 0) continue;

        if (
          result.length < 300 ||
          (result.length >= 300 && newWordList[wordLength].length <= 10)
        )
          newWordList[wordLength].push(word);
      }

      setWordList(newWordList);
    };

    findWord();
  }, [setSetting]);

  const removePiece = (word: string) => {
    const newPieces = new Set(pieces);

    navigator.clipboard.writeText(word);
    setAlarm("success", "단어가 복사되었습니다.");

    for (let initial of word) {
      const toUpdate: [string, number][] = [];

      newPieces.forEach((value) => {
        const [piece, count] = value;

        if (piece === initial) {
          if (count > 1) {
            toUpdate.push([piece, count - 1]);
          }
        } else {
          toUpdate.push([piece, count]);
        }
      });

      newPieces.clear();
      toUpdate.forEach((value) => newPieces.add(value));
    }

    setPieces(newPieces);

    backToWordPiece();
  };

  const backToWordPiece = () => {
    setSetting("wordPiece");
  };

  return (
    <WordDiv>
      {Object.entries(wordList)
        .reverse()
        .map(
          ([key, words]) =>
            words.length > 0 && (
              <div key={key}>
                <WordTitle>{key}글자</WordTitle>
                <Words>
                  {words.map((word, index) => (
                    <Word onClick={() => removePiece(words[index])} key={index}>
                      {word}
                    </Word>
                  ))}
                </Words>
              </div>
            )
        )}

      <BackButton onClick={() => backToWordPiece()}>돌아가기</BackButton>
    </WordDiv>
  );
};

export default WordPiece;
