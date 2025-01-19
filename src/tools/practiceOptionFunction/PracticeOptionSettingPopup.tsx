import React, { Dispatch, SetStateAction, useState } from "react";
import styled, { createGlobalStyle } from "styled-components";
import { useAlarm } from "../alarmFunction/AlarmProvider";
import Modal from "react-modal";
import { useRecoilState } from "recoil";
import {
  optionState,
  practiceOptionOpenSetting,
} from "../../RecoilAtoms/common/Atom";
import OptionButton from "../../components/buttons/OptionButton";
import SubjectButton from "../../components/buttons/SubjectButton";
import {
  answerCheckState,
  changeMissionCheckState,
  currentTierState,
  injeongCheckState,
  missionValueState,
  onTierCheckState,
  randomMissionCheckState,
  rangeCheckState,
  resetMissionCheckState,
  shMisTypeState,
} from "../../RecoilAtoms/practice/PracticeAtom";

const GlobalStyle = createGlobalStyle`
  body {
    margin: 0;
    font-family: Arial, sans-serif;
  }

  .ReactModal__Overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.7); /* 오버레이 배경색 */
    z-index: 9998; /* 모달보다 아래에 위치 */
  }
`;

// 모달 스타일을 위한 Styled component
const StyledModal = styled(Modal)`
  &.ReactModal__Content {
    position: relative;
    top: 50%;
    left: 50%;

    background-color: rgb(250, 250, 250);

    max-width: 400px;
    width: 100%;
    height: 300px;

    padding: 30px;

    border-radius: 5px;

    transform: translate(-50%, -50%);

    display: flex;
    align-items: center;
    flex-direction: column;

    z-index: 9999;
  }
`;

const Title = styled.h1`
  margin-bottom: 30px;
`;

const RadioList = styled.div`
  width: 100%;

  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
`;

const TierContainer = styled.div`
  height: 30px;
  display: flex;
  align-items: center;
`;

const MissionContainer = styled.div<{ selectedOption: string }>`
  display: ${({ selectedOption }) =>
    selectedOption === "mission" ? "flex" : "none"};
  flex-direction: row;
`;

const EtcContainer = styled.div`
  display: flex;
  flex-direction: row;
`;

const CloseButton = styled.button`
  padding: 5px 10px;

  font-family: "KCC-Hanbit";
`;

const RadioContainer = styled.div`
  height: 30px;
  display: flex;
  align-items: center;
`;

const RadioTitle = styled.label`
  margin-left: 12px;
  margin-right: 8px;

  font-size: 10pt;
`;

const Checkbox = styled.input`
  width: auto;
  height: auto;

  font-family: "Pretendard";
`;

const TierNumber = styled.input`
  width: 30px;
  height: 18px;

  margin-left: 10px;

  font-size: 9pt;
  text-align: center;
`;

const MissionType = styled.select`
  width: 50px;
  height: 18px;

  margin-left: 5px;

  font-size: 9pt;
  font-family: "Pretendard";
`;

const ShMisType = styled.option``;

export const PracticeOptionSettingPopup = () => {
  const [selectedOption] = useRecoilState(optionState);
  const [openSetting, setOpenSetting] = useRecoilState(
    practiceOptionOpenSetting
  );
  const [answerCheck, setAnswerCheck] = useRecoilState(answerCheckState);
  const [onTierCheck, setOnTierCheck] = useRecoilState(onTierCheckState);
  const [currentTier, setCurrentTier] = useRecoilState(currentTierState);
  const [changeMissionCheck, setChangeMissionCheck] = useRecoilState(
    changeMissionCheckState
  );
  const [randomMissionCheck, setRandomMissionCheck] = useRecoilState(
    randomMissionCheckState
  );
  const [resetMissionCheck, setResetMissionCheck] = useRecoilState(
    resetMissionCheckState
  );
  const [injeongCheck, setInjeongCheck] = useRecoilState(injeongCheckState);
  const [rangeCheck, setRangeCheck] = useRecoilState(rangeCheckState);
  const [shMisType, setShMisType] = useRecoilState(shMisTypeState);
  const [, setMissionValue] = useRecoilState(missionValueState);

  const { setAlarm } = useAlarm();

  const handleSMTChange = (event: any) => {
    setShMisType(event.target.value);
  };

  const handleRangeChange = () => {
    setRangeCheck(!rangeCheck);
  };

  const handleInjeongChange = () => {
    setInjeongCheck(!injeongCheck);
  };

  const handleCheckChange = () => {
    setAnswerCheck(!answerCheck);
  };

  const handleOneTierChange = () => {
    setOnTierCheck(!onTierCheck);
  };

  const handleCurrentTierChange = (e: any) => {
    setCurrentTier(e.target.value);
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

  return (
    <StyledModal
      isOpen={openSetting}
      onRequestClose={() => setOpenSetting(false)}
      className="ReactModal__Content"
      overlayClassName="ReactModal__Overlay"
    >
      <GlobalStyle />
      <Title>연습 옵션</Title>
      <RadioList>
        <OptionButton />
        <SubjectButton />

        <EtcContainer>
          <RadioContainer>
            <RadioTitle>범위</RadioTitle>

            <Checkbox
              type="checkbox"
              onClick={handleRangeChange}
              checked={rangeCheck}
            />
          </RadioContainer>

          <RadioContainer>
            <RadioTitle>노인정</RadioTitle>

            <Checkbox
              type="checkbox"
              onClick={handleInjeongChange}
              checked={injeongCheck}
            />
          </RadioContainer>

          <RadioContainer>
            <RadioTitle>분석</RadioTitle>

            <Checkbox
              type="checkbox"
              onClick={handleCheckChange}
              checked={answerCheck}
            />
          </RadioContainer>
        </EtcContainer>

        <TierContainer>
          <RadioContainer>
            <RadioTitle>확인 티어 고정</RadioTitle>

            <Checkbox
              type="checkbox"
              onClick={handleOneTierChange}
              checked={onTierCheck}
            />
          </RadioContainer>

          {onTierCheck && (
            <>
              <TierNumber
                value={currentTier}
                onChange={handleCurrentTierChange}
                placeholder="티어"
              />

              <MissionType
                id="shMisType"
                name="shMisType"
                value={shMisType}
                onChange={handleSMTChange}
              >
                <ShMisType value="value">이론(딜레이 있음)</ShMisType>
                <ShMisType value="score">점수</ShMisType>
                <ShMisType value="theory">개수</ShMisType>
              </MissionType>
            </>
          )}
        </TierContainer>

        <MissionContainer selectedOption={selectedOption}>
          <RadioContainer>
            <RadioTitle>미션 변경</RadioTitle>

            <Checkbox
              type="checkbox"
              onClick={handleChangeMissionChange}
              checked={changeMissionCheck}
            />
          </RadioContainer>

          {changeMissionCheck && !resetMissionCheck && (
            <RadioContainer>
              <RadioTitle>랜덤</RadioTitle>

              <Checkbox
                type="checkbox"
                onClick={handleRandomMissionChange}
                checked={randomMissionCheck}
              />
            </RadioContainer>
          )}

          {changeMissionCheck && !randomMissionCheck && (
            <RadioContainer>
              <RadioTitle>틀리면 되돌리기</RadioTitle>

              <Checkbox
                type="checkbox"
                onClick={handleResetMissionChange}
                checked={resetMissionCheck}
              />
            </RadioContainer>
          )}
        </MissionContainer>
      </RadioList>

      <CloseButton onClick={() => setOpenSetting(false)}>나가기</CloseButton>
    </StyledModal>
  );
};
