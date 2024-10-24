import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import HeaderComponent from "./components/HeaderComponent";
import Main from "./components/Main";
import Modify from "./components/modify/Modify";
import { AlertManager } from "./tools/alertFunction/AlertManager";
import Memo from "./components/Memo";
import Practice from "./components/Practice";
import CommandManager from "./tools/commandFunction/CommandManager";
import AllProviders from "./AllProviders";
import PreventProvider from "./tools/preventFunction/PreventProvider";
import Hack from "./components/Hack";
import CheckMission from "./components/CheckMission";
import AttackPattern from "./components/AttackPattern";
import Waiting from "./tools/waitFunction/Waiting";
import SubjectPopup from "./tools/subjectFunction/Subject";

const App = () => {
  return (
    <BrowserRouter>
      <AllProviders>
        <Waiting />
        <PreventProvider />
        <CommandManager />
        <AlertManager />
        <HeaderComponent />
        <SubjectPopup />
        <Routes>
          <Route path="/" element={<Main />} />
          <Route path="/modify" element={<Modify />} />
          <Route path="/memo" element={<Memo />} />
          <Route path="/practice" element={<Practice />} />
          <Route path="/hack" element={<Hack />} />
          <Route path="/check_mission" element={<CheckMission />} />
          <Route path="/pattern" element={<AttackPattern />} />
        </Routes>
      </AllProviders>
    </BrowserRouter>
  );
};

export default App;
