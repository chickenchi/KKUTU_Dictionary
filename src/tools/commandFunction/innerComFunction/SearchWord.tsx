import axios from "axios";
import { getDoumChar } from "../../../components/functions/GetDoumChar";
import {
  englishChars,
  hangulChars,
  isLowercaseLetter,
} from "../../../commonFunctions/wordNhangul";
import {
  getValueByLabel,
  subjectOptions,
} from "../../../commonFunctions/SubjectOptions";
import { jaccardSimilarity } from "../../../components/functions/JaccardSimilarity";

export const jaccardSubject = (subjectOption: string) => {
  if (
    subjectOption.includes("랜덤") ||
    subjectOption.toLowerCase().includes("random")
  ) {
    while (true) {
      const randomIndex = Math.floor(Math.random() * subjectOptions.length);

      const result = subjectOptions[randomIndex].label;
      if (result.includes("-")) continue;

      return subjectOptions[randomIndex].label;
    }
  }

  if (subjectOption === "*") {
    subjectOption = "주제 없음";
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

  return highSimilarity.subject;
};

export const fetchWordData = async (
  selectedOption: string,
  wordValue: string,
  backWordValue: string,
  subject: string,
  tier: number | string,
  shMisType: string,
  missionValue: string,
  isTenSec: boolean,
  isKnown: boolean,
  server: string
) => {
  try {
    let initialList: string[];

    if (getDoumChar(wordValue) !== "failed") {
      initialList = [wordValue, getDoumChar(wordValue)];
    } else {
      initialList = [wordValue, wordValue];
    }

    let isRioWord = server === "rio" || server === "all" ? true : false;
    let iskkukoWord = server === "kkuko" || server === "all" ? true : false;

    let checklist = [
      isTenSec ? "1~9" : "1~1000",
      isKnown,
      false,
      false,
      isRioWord,
      iskkukoWord,
    ];

    if (missionValue === "*") selectedOption = "allMission";

    if (selectedOption === "allMission" && typeof tier !== "number") {
      return "미션 몰아보기에서는 전 티어를 한 번에 볼 수 없습니다.";
    }

    let subjectName = getValueByLabel(jaccardSubject(subject));

    const response = await axios.post("http://127.0.0.1:5000/word", {
      word: initialList,
      backWord: backWordValue,
      subject: subjectName,
      type: selectedOption,
      mission: missionValue,
      shMisType: shMisType,
      checklist: checklist,
      tier: tier,
    });

    if (response.data === "단어 없음")
      if (isKnown) return `${wordValue}에서 아는 미션 단어가 없습니다.`;
      else return `${wordValue}(으)로 시작하는 단어가 없습니다.`;

    if (selectedOption === "allMission") {
      let missions: string = "";

      let endInitial: number = 0;

      if (isLowercaseLetter(wordValue)) {
        endInitial = 26; // a to z
      } else {
        endInitial = 14; // 가 to 하
      }

      if (!isKnown) {
        // 모르는 내용까지 포함하면
        for (let i = 0; i < endInitial; i++) {
          let word = response.data[i][0];

          if (isLowercaseLetter(wordValue)) {
            missions += `[${wordValue}-${englishChars[i]}] ${word}\n`;
          } else {
            missions += `[${wordValue}-${hangulChars[i]}] ${word}\n`;
          }
        }
      } else {
        // 아는 내용이면

        for (let j = 0; j < endInitial; j++) {
          for (let i = 0; response.data.length > i; i++) {
            let word = response.data[i][0];
            let initial = response.data[i][1];

            if (isLowercaseLetter(wordValue)) {
              if (englishChars[j] === initial)
                missions += `[${wordValue}-${initial}] ${word}\n`;
              break;
            } else {
              if (hangulChars[j] === initial) {
                missions += `[${wordValue}-${initial}] ${word}\n`;
                break;
              }
            }
          }

          if (!missions.includes(`[${wordValue}-${hangulChars[j]}]`)) {
            missions += `[${wordValue}-${hangulChars[j]}] 모르는 단어\n`;
          }
        }
      }

      return missions;
    }

    if (response.data == "단어 없음" || response.data === undefined)
      return "없음";

    if (typeof tier === "number") {
      return response.data[tier - 1][0];
    } else {
      let wordList = "";

      for (let i = 0; i < response.data.length; i++) {
        wordList += `${response.data[i][0]}\n`;
      }

      return wordList;
    }
  } catch (error) {
    console.log(error);
    alert("단어 검색 중 오류가 발생했습니다.");
  }
};
