import React from "react";
import styled from "styled-components";

const Header = styled.div`
  background-color: rgb(246, 246, 246);
  width: 100%;
  height: 12%;
  display: flex;
  align-items: center;
  padding-left: 30px;

  font-family: "Pretendard";
`;

const Title = styled.h1`
  font-size: 21pt;
  color: #404040;
  margin: 0; /* Remove default margin */
`;

const Logo = styled.img`
  width: 80%;
`;

const LogoContainer = styled.div`
  width: 60px;
  height: 55px;
  margin-right: 20px;
  background-color: white;
  border-radius: 10px;

  display: flex;
  align-items: center;
  justify-content: center;
`;

const Nav = styled.nav`
  margin-left: 50px;

  display: flex;
`;

const LinkText = styled.a`
  margin-right: 45px;

  text-decoration: none;
  font-size: 12pt;
  color: #404040;
`;

const HeaderComponent = () => {
  return (
    <Header>
      <LogoContainer>
        <Logo src="./image/Logo.png" />
      </LogoContainer>
      <Title>끄코 단어 검색</Title>

      <Nav>
        <LinkText href="/">검색</LinkText>
        <LinkText href="/modify">수정</LinkText>
        <LinkText href="/memo">메모</LinkText>
        <LinkText href="/practice">연습</LinkText>
        <LinkText href="/check_mission">미션 확인</LinkText>
        <LinkText href="/pattern">공격 패턴</LinkText>
      </Nav>
    </Header>
  );
};

export default HeaderComponent;
