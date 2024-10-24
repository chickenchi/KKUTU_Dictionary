import React from "react";
import styled from "styled-components";

const Hacking = styled.div`
  color: red;
  font-size: 60px;
  height: 88%;

  display: flex;
  justify-content: center;
  align-items: center;
`;

const Hack = () => {
  return (
    <Hacking>
      보안상의 이유로
      <br />
      작업하실 수 없습니다.
    </Hacking>
  );
};

export default Hack;
