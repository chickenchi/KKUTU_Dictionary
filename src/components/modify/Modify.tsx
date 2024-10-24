import React, { useState } from "react";
import { styled } from "styled-components";
import { Alarm } from "../../tools/alarmFunction/AlarmManager";
import { useAlarm } from "../../tools/alarmFunction/AlarmProvider";

import AddRemove from "./AddRemove";

const Header = styled.div`
  background-color: rgb(250, 250, 250);
  width: 100%;
  height: 88%;

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

const SearchTitle = styled.p`
  margin-right: 12px;
  margin-bottom: 10px;

  font-size: 18pt;
`;

const TypeContainer = styled.div`
  display: flex;
`;

const Subtitle = styled.p`
  font-size: 15pt;
`;

const ModifyType = styled.select`
  height: 25px;
  width: 90px;
  margin-left: 10px;
  margin-bottom: 10px;

  font-family: "Pretendard";
`;

const Modify = () => {
  const [editOption, setEditOption] = useState("addRemove");

  const { showAlarm, alarmIcon, alarmDescription, remainedTime } = useAlarm();

  const handleEditChange = (e: any) => {
    setEditOption(e.target.value);
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
          <SearchTitle>단어 수정</SearchTitle>

          <TypeContainer>
            <Subtitle>변경 유형</Subtitle>
            <ModifyType
              name="subject"
              value={editOption}
              onChange={handleEditChange}
            >
              <option value="addRemove">추가 / 삭제</option>
              <option value="modify">수정</option>
            </ModifyType>
          </TypeContainer>

          {editOption === "addRemove" ? <AddRemove /> : <></>}
        </SearchContainer>
      </ToolList>
    </Header>
  );
};

export default Modify;
