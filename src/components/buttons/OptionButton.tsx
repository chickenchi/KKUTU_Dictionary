import React, { useState } from "react";
import { useRecoilState } from "recoil";
import styled from "styled-components";
import { optionState } from "../../RecoilAtoms/common/Atom";

const Options = styled.select`
  height: 25px;
  margin-right: 5px;

  padding-right: 5px;

  font-family: "Pretendard";
`;

const OptionButton = () => {
  const [selectedOption, setSelectedOption] = useRecoilState(optionState);

  const handleOptionChange = (e: any) => {
    setSelectedOption(e.target.value);
  };

  return (
    <Options
      name="subject"
      value={selectedOption}
      onChange={handleOptionChange}
    >
      <option value="mission">미션</option>
      <option value="attack">공격</option>
      <option value="hardAttack">선호 공격</option>
      <option value="long">장문</option>
      <option value="villain">빌런 & 앞말</option>
      <option value="protect">모든 단어</option>
    </Options>
  );
};

export default OptionButton;
