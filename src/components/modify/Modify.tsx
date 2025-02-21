import React, { useState } from "react";
import { styled } from "styled-components";
import { Alarm } from "../../tools/alarmFunction/AlarmManager";
import { useAlarm } from "../../tools/alarmFunction/AlarmProvider";

import AddRemove from "./AddRemove";
import SubjectModify from "./SubjectModify";

const Header = styled.div`
  background-color: white;
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
  margin-bottom: 15px;

  display: flex;
  align-items: center;
  flex-direction: row;
`;

const SearchTitle = styled.p`
  margin-right: 15px;

  font-size: 18pt;
`;

const TypeContainer = styled.div`
  display: flex;
`;

const ModifyType = styled.select`
  height: 25px;
  width: 90px;

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
          <SearchTitle>단어 변경</SearchTitle>

          <TypeContainer>
            <ModifyType
              name="subject"
              value={editOption}
              onChange={handleEditChange}
            >
              <option value="addRemove">추가 / 삭제</option>
              <option value="modify">주제 수정</option>
            </ModifyType>
          </TypeContainer>
        </SearchContainer>
        {editOption === "addRemove" ? <AddRemove /> : <></>}
        {editOption === "modify" ? <SubjectModify /> : <></>}
      </ToolList>
    </Header>
  );
};

export default Modify;
