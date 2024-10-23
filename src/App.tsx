import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import HeaderComponent from "./components/HeaderComponent";
import FooterComponent from "./components/FooterComponent";
import Main from "./components/Main";
import Add from "./components/Add";
import Remove from "./components/Remove";
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

const App = () => {
  return (
    <BrowserRouter>
      <AllProviders>
        <Waiting />
        <PreventProvider />
        <CommandManager />
        <AlertManager />
        <HeaderComponent />
        <Routes>
          <Route path="/" element={<Main />} />
          <Route path="/add" element={<Add />} />
          <Route path="/remove" element={<Remove />} />
          <Route path="/memo" element={<Memo />} />
          <Route path="/practice" element={<Practice />} />
          <Route path="/hack" element={<Hack />} />
          <Route path="/check_mission" element={<CheckMission />} />
          <Route path="/pattern" element={<AttackPattern />} />
        </Routes>
        <FooterComponent />
      </AllProviders>
    </BrowserRouter>
  );
};

export default App;
