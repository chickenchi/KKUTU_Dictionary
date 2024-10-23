import { Dispatch, SetStateAction, useEffect } from "react";
import { useAlarm } from "../../alarmFunction/AlarmProvider";
import useCommand from "../CommandProvider";
import { clearLocalStorage } from "../../../commonFunctions/LocalStorage";
import { getInitialMaxScore } from "../innerComFunction/InitialMaxScore";
import { fetchWordData } from "../innerComFunction/SearchWord";
import { setWord } from "../innerComFunction/WordSet";
import { useWord } from "../../wordFunction/WordProvider";
import { UreadingWord } from "../innerComFunction/Ureading";

export const countOccurrences = (str: string, subStr: string) => {
  return str.split(subStr).length - 1;
};

interface CommandItemFunction {
  setOpenWordSetting: Dispatch<SetStateAction<boolean>>;
  setPrompt: Dispatch<SetStateAction<string>>;
  getWSPProps: Dispatch<SetStateAction<[string, number]>>;
  prompt: string;
  funName: string;
}

const CommandItemFunction = ({
  setOpenWordSetting,
  getWSPProps,
  prompt,
  funName,
  setPrompt,
}: CommandItemFunction) => {
  const { setAlarm } = useAlarm();
  const { visible, hideCommandManager } = useCommand();
  const { wordValue, setWordValue } = useWord();

  const handleWordSet = async () => {
    const result = await setWord(prompt);

    if (typeof result !== "object") {
      setAlarm("error", "단어를 입력해 주세요.");
      return;
    }

    if (Object.keys(result).length === 0) {
      setAlarm("warning", "단어가 존재하지 않습니다.");
      return;
    }

    setOpenWordSetting(true);
    const word = result[0][0];
    const checked = result[0][1];
    getWSPProps([word, checked]);
  };

  const uread = async () => {
    const ureading = prompt.split("uread ")[1];
    const readTarget = ureading.split(" ")[0];
    const isRead = ureading.split(" ")[1] === "unread" ? 0 : 1;
    let tier: number | string =
      ureading.split(" ")[2] === "*" ? "*" : parseInt(ureading.split(" ")[2]);

    if (tier === undefined) tier = 1;

    if (readTarget.includes(",")) {
      const words = readTarget.split(",");
      UreadingWord(words, isRead);
    } else if (readTarget.includes("-")) {
      const frontInitial = readTarget.split("-")[0];
      const missionInitial = readTarget.split("-")[1];

      const resultWord = await fetchWordData(
        "mission",
        frontInitial,
        "",
        tier,
        "theory",
        missionInitial,
        false,
        false
      );
      UreadingWord(resultWord.split("\n"), isRead);
    } else if (readTarget.includes("~")) {
      let frontInitial = readTarget.split("~")[0];
      let backInitial = readTarget.split("~")[1];

      const resultWord = await fetchWordData(
        "villain",
        frontInitial,
        backInitial,
        tier,
        "",
        "",
        false,
        false
      );

      UreadingWord(resultWord.split("\n"), isRead);
    } else {
      UreadingWord(readTarget, isRead);
    }
  };

  const handleMoveTo = () => {
    const moveDirection = prompt.split("moveTo ")[1];
    window.location.href = `./${
      moveDirection === "search" ? "" : moveDirection
    }`;
  };

  const handlePdel = () => {
    const delTarget = prompt.split("pdel ")[1];

    if (
      window.location.href.includes("/remove") ||
      window.location.href.includes("/add") ||
      window.location.href.includes("/memo")
    ) {
      setWordValue(wordValue.replace(new RegExp(delTarget, "g"), ""));
    } else {
      setAlarm("error", "이 페이지에선 사용이 불가합니다.");
    }
  };

  const handleSearch = async () => {
    if (
      countOccurrences(prompt, " ") < 2 ||
      countOccurrences(prompt, " ") > 7
    ) {
      setAlarm("error", "명령이 잘못되었습니다.");
      return;
    }

    const searchTarget = prompt.split("search ")[1];

    const parts = searchTarget.split(" ");
    const searchType = parts[0];
    const initial = parts[1];
    const options = parts.slice(2);

    let tier: number | string =
      options[0] === "*" ? "*" : options.length >= 1 ? parseInt(options[0]) : 1;
    const isTenSecond = options[1] === "true";
    const isKnown = options[2] === "true";
    const searchMissionType = options[3] || "theory";

    let resultWord;

    switch (searchType) {
      case "mission":
        const [frontInitial, missionInitial] = initial.split("-");
        resultWord = await fetchWordData(
          searchType,
          frontInitial,
          "",
          tier,
          searchMissionType,
          missionInitial,
          isTenSecond,
          isKnown
        );
        break;

      case "villain":
        const [front, back] = initial.split("~");
        resultWord = await fetchWordData(
          searchType,
          front,
          back,
          tier,
          searchMissionType,
          "",
          isTenSecond,
          isKnown
        );
        break;

      default:
        resultWord = await fetchWordData(
          searchType,
          initial,
          "",
          tier,
          searchMissionType,
          "",
          isTenSecond,
          isKnown
        );
        break;
    }

    if (resultWord === "없음") {
      setAlarm("error", "결과가 존재하지 않습니다.");
    } else {
      navigator.clipboard.writeText(resultWord);
      setAlarm("success", "결과가 클립보드에 복사되었습니다.");
    }
  };

  const handleIniMS = async () => {
    const result = await getInitialMaxScore(prompt);

    if (typeof result !== "object") {
      setAlarm("error", "앞 글자를 입력해 주세요.");
      return;
    }

    if (Object.keys(result).length === 0) {
      setAlarm("warning", "단어가 존재하지 않습니다.");
      return;
    }

    const word = result[0][0];
    const score = result[0][1];
    setAlarm("success", `이론상 ${score}점을 [${word}]로 받습니다.`);
  };

  const handleClearLog = async () => {
    await clearLocalStorage();
  };

  useEffect(() => {
    if (!funName) return;

    switch (funName) {
      case "handleWordSet":
        handleWordSet();
        setPrompt("");
        break;
      case "handleUread":
        uread();
        setPrompt("");
        break;
      case "handleMoveTo":
        handleMoveTo();
        setPrompt("");
        break;
      case "handlePdel":
        handlePdel();
        setPrompt("");
        break;
      case "handleSearch":
        handleSearch();
        setPrompt("");
        break;
      case "handleIniMS":
        handleIniMS();
        setPrompt("");
        break;
      case "handleClearLog":
        handleClearLog();
        setPrompt("");
        break;
    }
  }, [funName, prompt]);

  return null;
};

export default CommandItemFunction;