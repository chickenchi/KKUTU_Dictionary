import React, { useState } from "react";
import { useRecoilState } from "recoil";
import styled from "styled-components";
import { modalState, subjectState } from "../../Atom";
import { subjectOptions } from "../../commonFunctions/SubjectOptions";
import { jaccardSimilarity } from "../functions/JaccardSimilarity";

const SubjectDiv = styled.div`
  position: relative;

  background-color: white;

  height: 25px;
  width: 130px;

  margin-right: 5px;

  border: 1px solid black;
  border-radius: 3px;

  display: flex;
  justify-content: center;
  align-items: center;
`;

const Subject = styled.input`
  position: absolute;
  left: 3px;

  background-color: white;

  height: 22px;
  width: 90px;

  padding-left: 5px;

  border: none;

  font-family: "Pretendard";

  text-overflow: ellipsis;
  outline: none;
`;

const SubjectListBtn = styled.button`
  position: absolute;
  right: 3px;

  background-image: url("./image/list.png");
  background-color: rgba(0, 0, 0, 0);
  background-size: cover;

  width: 20px;
  height: 20px;

  border: none;
`;

const SubjectButton = () => {
  const [subjectOption, setSubjectOption] = useRecoilState(subjectState);
  const [showModal, setShowModal] = useRecoilState(modalState);

  const handleSubjectChange = (e: any) => {
    setSubjectOption(e.target.value);
  };

  const handleBlur = () => {
    if (
      subjectOption.includes("랜덤") ||
      subjectOption.toLowerCase().includes("random")
    ) {
      while (true) {
        const randomIndex = Math.floor(Math.random() * subjectOptions.length);

        const result = subjectOptions[randomIndex].label;
        if (result.includes("-")) continue;

        setSubjectOption(subjectOptions[randomIndex].label);

        return;
      }
    }

    let highSimilarity: { subject: string; score: number } = {
      subject: "주제 없음",
      score: 0,
    };

    subjectOptions.forEach((el) => {
      let subjectName = el.label;
      if (!subjectName.includes("-") && subjectName !== "") {
        let score = jaccardSimilarity(subjectOption, subjectName);

        if (highSimilarity.score < score) {
          highSimilarity = { subject: subjectName, score: score };
        }
      }
    });

    console.log(highSimilarity);

    setSubjectOption(highSimilarity.subject);
  };

  const handleKeyDown = (e: any) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleBlur();
    }
  };

  return (
    <SubjectDiv>
      <Subject
        type="text"
        name="subject"
        value={subjectOption}
        onChange={handleSubjectChange}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
      />
      <SubjectListBtn onClick={() => setShowModal(true)} />
    </SubjectDiv>
  );
};

export default SubjectButton;
