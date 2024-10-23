import React from "react";
import styled from "styled-components";

const Footer = styled.div`
  background-color: rgb(246, 246, 246);
  width: 100%;
  height: 7%;
  display: flex;
  justify-content: center;
  align-items: center;
  position: fixed;
  bottom: 0;
  left: 0;

  font-family: "Pretendard";
`;

const Description = styled.p`
  margin: 0;
  color: #404040;
  font-size: 10pt;
`;

const FooterComponent = () => {
  return (
    <Footer>
      <Description>KKUTU Korea Word Search Website</Description>
    </Footer>
  );
};

export default FooterComponent;
