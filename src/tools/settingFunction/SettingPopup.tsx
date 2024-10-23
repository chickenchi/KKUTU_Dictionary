import axios from "axios";
import React, { Dispatch, SetStateAction, useState } from "react";
import styled from "styled-components";
import { useAlarm } from "../alarmFunction/AlarmProvider";
import { Alarm } from "../alarmFunction/AlarmManager";
import { saveToLocalStorage } from "../../commonFunctions/LocalStorage";

const SettingPopupDiv = styled.button`
  background-color: rgba(255, 255, 255, 0.5);

  position: fixed;

  top: 0;
  left: 0;

  width: 100%;
  height: 100%;

  border: none;

  font-family: "KCC-Hanbit";

  display: flex;
  justify-content: center;
  align-items: center;

  z-index: 1;
`;

const Popup = styled.div`
  background-color: rgb(255, 255, 255);
  width: 400px;
  height: 300px;

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  border-radius: 5px;
`;

const Title = styled.h1`
  margin-bottom: 30px;
`;

const AttackDiv = styled.div`
  width: 100%;
  height: 30px;

  margin-bottom: 10px;
`;

const Attack = styled.input`
  width: 85px;
  height: 100%;

  padding-left: 5px;
  margin-right: 5px;

  text-align: center;
  font-family: "KCC-Hanbit";
`;

const AttackLabel = styled.label`
  width: 80%;

  margin-right: 10px;

  font-size: 12pt;
`;

const AttackButton = styled.button`
  width: 45px;
  height: 100%;

  font-family: "KCC-Hanbit";
`;

const CloseButton = styled.button`
  padding: 5px 10px;

  font-family: "KCC-Hanbit";
`;

const ElementSearchTypeDiv = styled.div`
  width: 100%;
  height: 30px;

  margin-bottom: 10px;

  display: flex;
  justify-content: center;
  align-items: center;
`;

const EST = styled.select`
  width: 85px;
  height: 100%;

  margin-right: 5px;

  text-align: left;
  font-family: "KCC-Hanbit";
`;

const ESTLabel = styled.p`
  margin-right: 10px;

  font-size: 12pt;
`;

const ESTButton = styled.button`
  padding: 5px 10px;

  font-family: "KCC-Hanbit";
`;

interface SettingPopupProps {
  setOpenSetting: Dispatch<SetStateAction<boolean>>;
}

export const SettingPopup = ({ setOpenSetting }: SettingPopupProps) => {
  const [addAttackInitial, setAddAttackInitial] = useState("");
  const [pullAttackInitial, setPullAttackInitial] = useState("");
  const [selectedOption, setSelectedOption] = useState<string>("villain");

  const { setAlarm } = useAlarm();

  const addElementSearchType = async () => {
    saveToLocalStorage("searchType", selectedOption);
    setAlarm("success", `적용되었습니다.`);
  };

  const addAttackWord = async () => {
    try {
      const response = await axios.post("http://127.0.0.1:5000/attack_add", {
        initial: addAttackInitial,
      });

      var requested = response.data;

      switch (requested) {
        case "성공":
          setAlarm("success", `성공적으로 추가되었습니다.`);
          break;
        case "오류":
          setAlarm("error", `오류가 발생했습니다.`);
          break;
        case "존재":
          setAlarm("warning", `이미 존재하는 앞 글자입니다.`);
          break;
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleAddAttackChange = (e: any) => {
    setAddAttackInitial(e.target.value);
  };

  const handlePullAttackChange = (e: any) => {
    setPullAttackInitial(e.target.value);
  };

  const handleKeyDown = (event: any) => {
    if (event.key === "Enter") {
      event.preventDefault();
      addAttackWord();
    }
  };

  const handleKeyDownPull = (event: any) => {
    if (event.key === "Enter") {
      event.preventDefault();
      pull();
    }
  };

  const handleOptionChange = (e: any) => {
    setSelectedOption(e.target.value);
  };

  const pull = async () => {
    try {
      const response = await axios.post("http://127.0.0.1:5000/attack_pull", {
        initial: pullAttackInitial,
      });

      var requested = response.data;

      switch (requested) {
        case "성공":
          setAlarm("success", `성공적으로 제외되었습니다.`);
          break;
        case "오류":
          setAlarm("error", `오류가 발생했습니다.`);
          break;
        case "무효":
          setAlarm("warning", `존재하지 않는 앞 글자입니다.`);
          break;
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <SettingPopupDiv>
      <Popup>
        <Title>설정</Title>
        <ElementSearchTypeDiv>
          <ESTLabel>기본 검색 유형</ESTLabel>
          <EST name="subject" onChange={handleOptionChange}>
            <option value="villain">빌런 & 앞말</option>
            <option value="attack">공격</option>
            <option value="protect">모든 단어</option>
            <option value="long">장문</option>
            <option value="mission">미션</option>
          </EST>
          <ESTButton onClick={addElementSearchType}>적용</ESTButton>
        </ElementSearchTypeDiv>
        <AttackDiv>
          <AttackLabel>공격 글자 추가</AttackLabel>
          <Attack
            onChange={handleAddAttackChange}
            onKeyDown={handleKeyDown}
            placeholder="앞 글자 입력"
            maxLength={1}
          />
          <AttackButton onClick={addAttackWord}>설정</AttackButton>
        </AttackDiv>
        <AttackDiv>
          <AttackLabel>공격 글자 제외</AttackLabel>
          <Attack
            onChange={handlePullAttackChange}
            onKeyDown={handleKeyDownPull}
            placeholder="앞 글자 입력"
            maxLength={1}
          />
          <AttackButton onClick={pull}>설정</AttackButton>
        </AttackDiv>

        <CloseButton onClick={() => setOpenSetting(false)}>나가기</CloseButton>
      </Popup>
    </SettingPopupDiv>
  );
};
