import React, { useEffect, useState } from "react";
import styled from "styled-components";

const Container = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  background-color: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18pt;
  z-index: 9999;
`;

const PreventProvider = () => {
  return <></>;

  const [isNavigatingAway, setIsNavigatingAway] = useState(false);

  useEffect(() => {
    let beforeUnloadListener: (event: BeforeUnloadEvent) => void;

    const handleBeforeUnload = (event: any) => {
      event.preventDefault();
      event.returnValue = "";
    };

    const handleBlur = () => {
      setIsNavigatingAway(true);
    };

    const handleFocus = () => {
      setIsNavigatingAway(false);
    };

    const checkDevToolsOpen = () => {
      const threshold = 10;
      const devtoolsOpen =
        window.outerHeight - window.innerHeight > threshold ||
        window.outerWidth - window.innerWidth > threshold;
      if (devtoolsOpen) {
        window.removeEventListener("beforeunload", beforeUnloadListener);
        window.location.href = "./hack";
      }
    };

    beforeUnloadListener = (event: any) => {
      handleBeforeUnload(event);
    };

    window.addEventListener("resize", checkDevToolsOpen);
    window.addEventListener("beforeunload", beforeUnloadListener);
    window.addEventListener("blur", handleBlur);
    window.addEventListener("focus", handleFocus);

    setInterval(checkDevToolsOpen, 1);

    return () => {
      window.removeEventListener("resize", checkDevToolsOpen);
      window.removeEventListener("beforeunload", beforeUnloadListener);
      window.removeEventListener("blur", handleBlur);
      window.removeEventListener("focus", handleFocus);
    };
  }, []);

  if (!isNavigatingAway) {
    return null;
  }

  return <Container>창을 나간 채로 이용할 수 없습니다.</Container>;
};

export default PreventProvider;
