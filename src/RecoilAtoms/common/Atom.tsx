// atoms.ts
import { atom } from "recoil";

export const modalState = atom({
  key: "modalState",
  default: false,
});

export const optionState = atom<string>({
  key: "optionState",
  default: "villain",
});

export const subjectState = atom({
  key: "subjectState",
  default: "주제 없음",
});

export const wordValueState = atom<string>({
  key: "wordValueState",
  default: "",
});

export const practiceOptionOpenSetting = atom<boolean>({
  key: "practiceOptionOpenSetting",
  default: false,
});
