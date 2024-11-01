import React, { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import useCommand from "./CommandProvider";
import { useAlarm } from "../alarmFunction/AlarmProvider";
import { WordSettingPopup } from "../wordFunction/WordSettingPopup";
import {
  commandList,
  commandPresets,
  CommandTypes,
} from "./CIFunction/CommandItems";
import {
  getFromLocalStorage,
  saveToLocalStorage,
} from "../../commonFunctions/LocalStorage";
import {
  getCurrentDateTime,
  getTimeDifference,
} from "./innerComFunction/TimeFunctions";
import CommandItemFunction from "./CIFunction/CommandItemFunction";
import { useWaiting } from "../waitFunction/WaitProvider";

const CommandManagerDiv = styled.div<{ visible: boolean }>`
  position: fixed;
  background-color: rgb(255, 255, 255, 0.5);
  border: none;
  width: 100%;
  height: 100%;

  display: ${({ visible }) => (visible ? "flex" : "none")};
  justify-content: center;
  align-items: center;
  flex-direction: column;

  font-family: "KCC-Hanbit";

  z-index: 1;
`;

const Prompt = styled.input`
  padding-left: 10px;

  width: 80%;
  height: 50px;

  border: 2px solid rgb(200, 200, 200);
  border-radius: 10px;

  color: rgb(110, 110, 110);
  font-size: 14pt;
  font-family: "KCC-Hanbit";

  &::placeholder {
    color: rgb(170, 170, 170);
  }
`;

const SearchList = styled.div`
  background-color: rgba(255, 255, 255, 0.6);

  width: 80%;
  height: 200px;

  padding-top: 5px;

  display: flex;
  flex-direction: column;

  overflow-y: auto;
  overflow-x: hidden;
`;

const CommandContent = styled.div`
  width: 100%;
  height: 40px;

  padding-left: 10px;

  margin-bottom: 5px;

  display: flex;
  align-items: center;
  flex-direction: row;

  flex-shrink: 0;

  &:hover {
    background-color: rgb(235, 235, 235);
  }
`;

const CommandPresetContent = styled.div`
  width: 100%;
  height: 40px;

  padding-left: 10px;

  margin-bottom: 5px;

  display: flex;
  align-items: center;
  flex-direction: row;

  flex-shrink: 0;
`;

const CommandName = styled.p`
  text-align: left;
  font-size: 16pt;
`;

const CommandPresetName = styled.p`
  color: gray;
  text-align: left;
  font-size: 16pt;
`;

const CommandDescription = styled.p`
  text-align: left;
  font-size: 11pt;

  margin-left: 10px;
`;

const CommandUsage = styled.p`
  text-align: left;
  font-size: 10pt;

  color: gray;

  margin-left: 10px;
`;

const CommandManager = () => {
  const { visible, hideCommandManager } = useCommand();
  const [prompt, setPrompt] = useState<string>("");
  const [callFunction, setCallFunction] = useState<string>("");

  const [openWordSetting, setOpenWordSetting] = useState<boolean>(false);
  const [wspProps, getWSPProps] = useState<[string, number]>(["", 0]);
  const [list, setList] = useState<React.JSX.Element>();

  const { setAlarm } = useAlarm();

  const hiding = () => {
    hideCommandManager();
    setPrompt("");
  };

  const handlePromptChange = (e: any) => {
    setPrompt(e.target.value);
  };

  useEffect(() => {
    autoFindCommand();
  }, [prompt]);

  const handlePromptDown = (e: any) => {
    if (e.key === "Enter") executePrompt();
  };

  /**
   * 프롬프트를 업데이트하는 함수입니다.
   * @param {string} description - 업데이트할 설명입니다.
   * @param {boolean} isFindPreset - 프리셋을 찾았는지 여부입니다.
   * @param {boolean} isList - 리스트에서 이 함수를 사용하는지에 대한 여부입니다.
   */
  const updatePrompt = (
    description: string,
    isFindPreset: boolean,
    isList: boolean
  ) => {
    setFocusedIndex(0);

    const newPrompt = isFindPreset
      ? recognizingCurrentPhrase() + description
      : `/${description}`;

    if (isList) {
      setPrompt(`${newPrompt}`);
    } else {
      setPrompt(`${newPrompt} `);
    }

    if (inputRef.current) inputRef.current.focus();
  };

  /**
   * 현재 문구를 인식하여 반환하는 함수입니다.
   * @returns {string} 현재 문구
   */
  const recognizingCurrentPhrase = () => {
    if (!prompt) return "";

    const phrases = prompt.split(" ");

    return phrases.slice(0, -1).join(" ") + " ";
  };

  const [focusedIndex, setFocusedIndex] = useState<number>(0);

  const commandRefs = useRef<(HTMLDivElement | null)[]>([]);
  const { setWaiting } = useWaiting();

  const autoFindCommand = async () => {
    try {
      let foundCommandList;
      let isFindPreset = false;

      let listTags: React.JSX.Element[] = [];

      if (prompt.includes(" ")) {
        const countSpace = prompt.split(" ").length - 2;
        const fndPS = findPresetPhrase();

        if (Array.isArray(fndPS)) {
          foundCommandList = fndPS[countSpace];

          const [presetName, presetDescription] = foundCommandList.title;

          isFindPreset = true;

          listTags.push(
            <CommandPresetContent>
              <CommandPresetName>{presetName}</CommandPresetName>
              <CommandDescription>{presetDescription}</CommandDescription>
            </CommandPresetContent>
          );

          foundCommandList = foundCommandList.options;
        }
      } else {
        foundCommandList = findCommandPhrase();
      }

      if (prompt) {
        if (Array.isArray(foundCommandList)) {
          foundCommandList.forEach((command: any, index: number) => {
            const [cmdName, cmdDesc, cmdUsage] = command;

            listTags.push(
              <CommandContent
                key={cmdName}
                onClick={() => updatePrompt(cmdName, isFindPreset, false)}
              >
                <CommandName>
                  {isFindPreset ? `${cmdName}` : `/${cmdName}`}
                </CommandName>
                <CommandDescription>{cmdDesc}</CommandDescription>
                <CommandUsage>{cmdUsage && `</${cmdUsage}>`}</CommandUsage>
              </CommandContent>
            );
          });
        } else {
          setList(
            <SearchList>
              <CommandPresetContent>
                <CommandPresetName>유효하지 않습니다!</CommandPresetName>
              </CommandPresetContent>
            </SearchList>
          );
        }
      } else {
        const commands: string = await getFromLocalStorage("commands");

        if (commands) {
          listTags.push(
            <CommandPresetContent>
              <CommandPresetName>최근 기록</CommandPresetName>
            </CommandPresetContent>
          );

          commands.split("\n").forEach((commandItem: any, index: number) => {
            const command = commandItem.split(";")[0];

            const createTime = getTimeDifference(
              new Date(commandItem.split(";")[1])
            );

            listTags.push(
              <CommandContent
                onClick={() => updatePrompt(command, isFindPreset, true)}
              >
                <CommandName>{`/${command}`}</CommandName>
                <CommandDescription>{createTime}</CommandDescription>
              </CommandContent>
            );
          });
        } else {
          listTags.push(
            <CommandPresetContent>
              <CommandPresetName>최근 기록이 없습니다.</CommandPresetName>
            </CommandPresetContent>
          );
        }
      }

      setList(<SearchList>{listTags}</SearchList>);
    } catch (e) {
      setList(
        <SearchList>
          <CommandPresetContent>
            <CommandPresetName>범위를 벗어났습니다!</CommandPresetName>
          </CommandPresetContent>
          <CommandContent>
            <CommandDescription>
              pdel 문구 사용 중에는 무시하시면 됩니다.
            </CommandDescription>
          </CommandContent>
        </SearchList>
      );
    }
  };

  const findCommandPhrase = () => {
    const target = prompt.split("/")[1];

    if (prompt !== "/")
      return commandList.filter((commandList) =>
        commandList[0].includes(target)
      );
    else return commandList;
  };

  const findPresetPhrase = () => {
    try {
      type CommandPresetKey = keyof typeof commandPresets;
      const target = prompt.split("/")[1].split(" ")[0] as CommandPresetKey;

      const selectedPreset = commandPresets[target];
      return selectedPreset;
    } catch (e) {
      console.log("index out of range");
    }

    return "";
  };

  const [currentTime, setCurrentTime] = useState(getCurrentDateTime());

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentTime(getCurrentDateTime());
    }, 1000);

    return () => clearInterval(intervalId);
  }, []);

  const savingCommand = async () => {
    const commands = await getFromLocalStorage("commands");

    const elementPrompt = prompt.split("/")[1];

    await saveToLocalStorage(
      "commands",
      `${elementPrompt};${currentTime}${commands ? `\n${commands}` : ""}`
    );
  };

  useEffect(() => {
    if (callFunction) {
      setCallFunction("");
    }
  }, [callFunction]);

  const executePrompt = async () => {
    if (!validateInput(prompt)) return;

    await savingCommand();

    let callFunctionName;

    if (prompt.startsWith(CommandTypes.MOVE_TO)) {
      callFunctionName = "handleMoveTo";
    } else if (prompt.startsWith(CommandTypes.UREAD)) {
      callFunctionName = "handleUread";
    } else if (prompt.startsWith(CommandTypes.WORD_SET)) {
      callFunctionName = "handleWordSet";
    } else if (prompt.startsWith(CommandTypes.PDEL)) {
      callFunctionName = "handlePdel";
    } else if (prompt.startsWith(CommandTypes.SEARCH)) {
      callFunctionName = "handleSearch";
    } else if (prompt.startsWith(CommandTypes.INI_MS)) {
      callFunctionName = "handleIniMS";
    } else if (prompt.startsWith(CommandTypes.CLEAR_LOG)) {
      callFunctionName = "handleClearLog";
    } else if (prompt === CommandTypes.EXIT) {
      hiding();
      return;
    } else {
      setAlarm("error", "존재하지 않는 명령어입니다.");
      return;
    }

    setWaiting(true);

    setCallFunction(callFunctionName);
  };

  const validateInput = (input: string) => {
    if (!input) {
      setAlarm("error", "내용을 입력해 주세요.");
      return false;
    }
    return true;
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        hiding();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [focusedIndex]);

  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [visible]);

  return (
    <CommandManagerDiv visible={visible}>
      <CommandItemFunction
        setOpenWordSetting={setOpenWordSetting}
        getWSPProps={getWSPProps}
        prompt={prompt}
        funName={callFunction}
        setPrompt={setPrompt}
      />
      {openWordSetting && (
        <WordSettingPopup
          setWordOpenSetting={setOpenWordSetting}
          word={wspProps[0]}
          checked={wspProps[1]}
        />
      )}

      <Prompt
        onChange={handlePromptChange}
        onKeyDown={handlePromptDown}
        value={prompt}
        placeholder="/를 입력해서 명령어를 확인해 보세요!"
        ref={inputRef}
      ></Prompt>

      {list}
    </CommandManagerDiv>
  );
};

export default CommandManager;
