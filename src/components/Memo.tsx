import React, { useEffect, useRef, useState } from "react";
import { styled } from "styled-components";
import axios from "axios";
import { useAlert } from "../tools/alertFunction/AlertProvider";
import { Alarm } from "../tools/alarmFunction/AlarmManager";
import { useAlarm } from "../tools/alarmFunction/AlarmProvider";
import { useWord } from "../tools/wordFunction/WordProvider";
import { useWaiting } from "../tools/waitFunction/WaitProvider";

const Section = styled.div`
  background-color: rgb(250, 250, 250);
  width: 100%;
  height: 88%;
  padding-top: 20px;
  padding-left: 15px;

  font-family: "Pretendard";
`;

const SearchContainer = styled.div`
  width: 100%;
  margin-bottom: 20px;

  display: flex;
  align-items: center;
`;

const Subject = styled.select`
  height: 25px;
  margin-right: 5px;

  font-family: "Pretendard";
`;

const SearchTo = styled.select`
  height: 25px;
  margin-right: 5px;

  font-family: "Pretendard";
`;

const SearchInput = styled.input`
  width: 210px;
  height: 25px;
  margin-right: 10px;

  text-align: left;
  padding-left: 5px;

  font-size: 9pt;
  font-family: "Pretendard";
`;

const SearchTitle = styled.p`
  margin-right: 12px;

  font-size: 13pt;
`;

const SearchButton = styled.button`
  background-color: rgba(230, 230, 230);

  width: 68px;
  height: 25px;

  border-radius: 4px;
  border: none;

  font-size: 9pt;
  color: rgba(80, 80, 80);
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

const MemoContainer = styled.div`
  background-color: white;
  width: 95%;
  height: 90%;

  display: flex;
`;

const MemoList = styled.div`
  background-color: rgb(250, 250, 250);
  box-shadow: 10px 10px 20px rgba(0, 0, 0, 0.05);

  width: 20%;
`;

const Lists = styled.button<{ no: number; memoNumber: number }>`
  background-color: ${({ no, memoNumber }) =>
    no !== memoNumber ? "rgb(250, 250, 250);" : "rgb(253, 253, 253)"};

  width: 100%;
  height: 20%;

  padding-left: 10px;
  padding-bottom: 3px;

  border: none;

  display: flex;
  justify-content: center;
  flex-direction: column;

  font-family: "Pretendard";

  &:hover {
    background-color: rgb(255, 255, 255);
  }

  &:active {
    background-color: rgba(255, 255, 255);
  }

  &:focus {
    outline: none;
  }
`;

const Titl = styled.h1`
  color: rgb(60, 60, 60);
  font-weight: 400;
  font-size: 10pt;
`;

const Sub = styled.h2`
  margin-top: 5px;

  color: rgb(100, 100, 100);
  font-weight: 300;
  font-size: 8pt;
`;

const ListContainer = styled.div`
  background-color: rgb(250, 250, 250);
  height: 90%;

  overflow-y: auto;
  overflow-x: hidden;
`;

const MemoWriter = styled.div`
  background-color: none;

  width: 76%;
  padding-left: 20px;
  padding-top: 20px;

  display: flex;
  flex-direction: column;
`;

const EmptyMemo = styled.div`
  width: 76%;
  height: 100%;

  padding-bottom: 40px;

  display: flex;
  justify-content: center;
  align-items: center;
`;

const EmptyMemoDescribe = styled.p`
  font-size: 35px;
`;

const TitleDiv = styled.div`
  position: relative;
  margin-bottom: 10px;

  display: flex;
  align-items: center;
`;

const Title = styled.input`
  width: auto;

  color: rgb(60, 60, 60);
  font-size: 20pt;
  font-weight: 700;
  font-family: "Pretendard";

  border: none;
  outline: none;
`;

const DeleteMemo = styled.button`
  position: absolute;
  right: 0;

  background-color: rgba(0, 0, 0, 0);

  border: none;

  width: 50px;
  height: 30px;

  font-family: "Pretendard";
`;

const DeleteImage = styled.img`
  width: 30px;
  height: 30px;
`;

const Subtitle = styled.input`
  margin-bottom: 10px;

  color: rgb(180, 180, 180);
  font-size: 15pt;
  font-weight: 600;
  font-family: "Pretendard";

  border: none;
  outline: none;

  &::placeholder {
    color: rgb(150, 150, 150);
  }
`;

const Description = styled.textarea`
  width: 100%;
  height: 400px;

  margin-right: 10px;
  margin-top: 10px;

  padding-left: 7px;
  padding-top: 7px;

  border: none;

  line-height: 25px;

  color: rgb(50, 50, 50);
  text-align: left;
  font-size: 11pt;
  font-family: "Pretendard";

  resize: none;
  outline: none;
`;

const AddMemoContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;

  height: 10%;
`;

const AddMemo = styled.button`
  background-color: rgb(240, 240, 240);
  width: 40px;
  height: 30px;

  border-radius: 15px;
  border: none;

  font-size: 17pt;
  font-family: "Pretendard";
  color: gray;

  &:hover {
    background-color: rgb(255, 255, 255);
  }

  &:active {
    background-color: rgba(230, 230, 230);
    transform: scale(0.98);
  }

  &:focus {
    outline: none;
  }
`;

const MemoBtnContainer = styled.div`
  width: 100%;

  margin-top: 10px;

  display: flex;
  justify-content: right;
`;

const CommitMemo = styled.button`
  background-color: white;

  border-radius: 3px;

  border: none;

  width: 50px;
  height: 30px;

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

const Memo = () => {
  const [selectedOption, setSelectedOption] = useState<string>("");
  const [selectedSearchOption, setSelectedSearchOption] = useState<string>("");

  const [searchValue, setSearchValue] = useState<string>("");

  const [memoTitle, setMemoTitle] = useState<string>("");
  const [memoSubtitle, setMemoSubtitle] = useState<string>("");
  const { wordValue, setWordValue } = useWord();

  const [memoNumber, setMemoNumber] = useState<number>(0);
  const [memoDBIndex, setMemoDBIndex] = useState<number>(0);
  const [memoList, setMemoList] = useState([]);

  const [inChanged, setInChanged] = useState<boolean>(false);

  const wordRef = useRef<HTMLInputElement>(null);

  const { showAlert } = useAlert();
  const { setAlarm, showAlarm, alarmIcon, alarmDescription, remainedTime } =
    useAlarm();
  const { setWaiting } = useWaiting();

  const handleSelectedOptionChange = (event: any) => {
    const handlingSelectedOptionChange = () => {
      setSelectedOption(event.target.value);
      setMemoNumber(0);
    };

    if (inChanged) {
      showAlert({
        title: "끄코 단어 검색",
        description: `변경 사항을 저장하지 않고 이동하시겠습니까?
                기존에 작성한 데이터는 삭제될 수 있습니다!`,
        onConfirm: () => {
          handlingSelectedOptionChange();
        },
      });

      return;
    }

    handlingSelectedOptionChange();
  };

  const handleSelectedSearchOptionChange = (event: any) => {
    setSelectedSearchOption(event.target.value);
  };

  const handleWordChange = (event: any) => {
    setSearchValue(event.target.value);
  };

  const handleMemoTitleChange = (event: any) => {
    setMemoTitle(event.target.value);
    setInChanged(true);
  };

  const handleMemoSubtitleChange = (event: any) => {
    setMemoSubtitle(event.target.value);
    setInChanged(true);
  };

  const handleMemoDescriptionChange = (event: any) => {
    setWordValue(event.target.value);
    setInChanged(true);
  };

  const handleDescriptionDown = (e: any) => {
    if (e.ctrlKey && e.key === "s") {
      e.preventDefault();
      submit();
    }
  };

  const handleMemoNumberChange = (index: number, dbi: number) => {
    const handlingMemoNumberChange = () => {
      setMemoNumber(index);
      setMemoDBIndex(dbi);
    };

    if (inChanged) {
      showAlert({
        title: "끄코 단어 검색",
        description: `변경 사항을 저장하지 않고 이동하시겠습니까?
                기존에 작성한 데이터는 삭제될 수 있습니다!`,
        onConfirm: () => {
          handlingMemoNumberChange();
        },
      });
      return;
    }

    handlingMemoNumberChange();
  };

  useEffect(() => {
    search();
  }, [selectedOption]);

  useEffect(() => {
    if (memoList.length) changeMemo();
  }, [memoList, memoNumber]);

  useEffect(() => {
    if (memoList.length > 0) {
      setMemoDBIndex(memoList[memoNumber][0]);
      changeMemo();
    }
  }, [memoNumber, memoList]);

  const makeMemo = () => {
    const makingMemo = async () => {
      try {
        setWaiting(true);

        await axios.post("http://127.0.0.1:5000/make", {
          type: selectedOption,
        });

        setWaiting(false);

        search();
      } catch (error) {
        console.log(error);
      }
    };
    if (inChanged) {
      showAlert({
        title: "끄코 단어 검색",
        description: `변경 사항을 저장하지 않고 이동하시겠습니까?
                기존에 작성한 데이터는 삭제될 수 있습니다!`,
        onConfirm: async () => {
          makingMemo();
        },
      });

      return;
    }

    makingMemo();
  };

  const changeMemo = () => {
    setInChanged(false);
    setMemoTitle(memoList[memoNumber][1]);
    setMemoSubtitle(memoList[memoNumber][2]);
    setWordValue(memoList[memoNumber][3]);
  };

  const searchBtn = () => {
    if (inChanged) {
      showAlert({
        title: "끄코 단어 검색",
        description: `변경 사항을 저장하지 않고 이동하시겠습니까?
                기존에 작성한 데이터는 삭제될 수 있습니다!`,
        onConfirm: async () => {
          search();
        },
      });
      return;
    }
    search();
  };

  const search = async () => {
    setMemoNumber(0);

    try {
      setWaiting(true);

      const response = await axios.post("http://127.0.0.1:5000/memo", {
        search: searchValue,
        type: selectedOption,
        searchType: selectedSearchOption,
      });

      setWaiting(false);

      if (response.data !== "메모 없음") setMemoList(response.data);
      else setMemoList([]);
    } catch (error) {
      console.log(error);
    }
  };

  const submit = () => {
    showAlert({
      title: "끄코 단어 검색",
      description: `제출하시겠습니까?`,
      onConfirm: async () => {
        try {
          setWaiting(true);

          const response = await axios.post("http://127.0.0.1:5000/submit", {
            title: memoTitle,
            subtitle: memoSubtitle,
            description: wordValue,
            index: memoDBIndex,
          });

          setWaiting(false);

          setAlarm(response.data[0], response.data[1]);

          if (response.data[0] === "warning") search();
        } catch (error) {
          console.log(error);
        }
      },
    });
  };

  const remove = () => {
    showAlert({
      title: "끄코 단어 검색",
      description: `삭제하시겠습니까?
            삭제 시 복구가 불가능합니다!`,
      onConfirm: async () => {
        try {
          const response = await axios.post("http://127.0.0.1:5000/remove", {
            index: memoDBIndex,
          });

          setAlarm(response.data[0], response.data[1]);
          if (
            response.data[0] === "success" ||
            response.data[0] === "warning"
          ) {
            if (memoNumber) setMemoNumber(memoNumber - 1);
            search();
          }
        } catch (error) {
          console.log(error);
        }
      },
    });
  };

  const handleKeyDown = (event: any) => {
    if (event.key === "Enter") {
      event.preventDefault();
      search();
    }
  };

  return (
    <Section className="Header">
      {showAlarm && (
        <Alarm
          iconType={alarmIcon}
          description={alarmDescription}
          remainedTime={remainedTime}
        />
      )}
      <SearchContainer>
        <SearchTitle>찾기</SearchTitle>

        <Subject name="subject" onChange={handleSelectedOptionChange}>
          <option value="">전체</option>
          <option value="villain">빌런</option>
          <option value="attack">공격</option>
          <option value="protect">방어</option>
          <option value="long">장문</option>
          <option value="language">언어</option>
          <option value="mission">미션</option>
          <option value="kkutu">공통</option>
        </Subject>

        <SearchTo name="searchTo" onChange={handleSelectedSearchOptionChange}>
          <option value="title">제목</option>
          <option value="subtitle">소제목</option>
          <option value="description">내용</option>
        </SearchTo>

        <SearchInput
          type="text"
          value={searchValue}
          placeholder="제목 혹은 내용 입력"
          onChange={handleWordChange}
          onKeyDown={handleKeyDown}
          ref={wordRef}
        />

        <SearchButton onClick={searchBtn}>검색</SearchButton>
      </SearchContainer>

      <MemoContainer>
        <MemoList>
          <ListContainer>
            {memoList.map((word: any, index: any) => (
              <Lists
                no={index}
                memoNumber={memoNumber}
                onClick={() => handleMemoNumberChange(index, word[0])}
              >
                <Titl key={index}>{word[1]}</Titl>
                <Sub key={index}>{word[2]}</Sub>
              </Lists>
            ))}
          </ListContainer>
          <AddMemoContainer>
            <AddMemo onClick={makeMemo}>+</AddMemo>
          </AddMemoContainer>
        </MemoList>

        {memoList.length ? (
          <MemoWriter>
            <TitleDiv>
              <Title
                type="text"
                value={memoTitle}
                placeholder="제목을 입력하세요"
                onChange={handleMemoTitleChange}
              />
              <DeleteMemo onClick={remove}>
                <DeleteImage src="./image/bin.png" />
              </DeleteMemo>
            </TitleDiv>
            <Subtitle
              type="text"
              placeholder="소제목을 입력하세요"
              value={memoSubtitle}
              onChange={handleMemoSubtitleChange}
            />
            <Description
              placeholder="내용을 입력하세요"
              value={wordValue}
              onChange={handleMemoDescriptionChange}
              onKeyDown={handleDescriptionDown}
            />

            <MemoBtnContainer>
              {inChanged && <CommitMemo onClick={submit}>적용</CommitMemo>}
            </MemoBtnContainer>
          </MemoWriter>
        ) : (
          <EmptyMemo>
            <EmptyMemoDescribe>
              작성할 유형을 고르고
              <br />
              추가(+) 버튼을 눌러
              <br />
              메모장을 추가하세요.
            </EmptyMemoDescribe>
          </EmptyMemo>
        )}
      </MemoContainer>
    </Section>
  );
};

export default Memo;
