// atoms.ts
import { atom } from "recoil";
import { subjectOptions } from "./commonFunctions/SubjectOptions";

export const modalState = atom({
  key: "modalState",
  default: false,
});

export const optionState = atom({
  key: "optionState",
  default: "villain",
});

export const subjectState = atom({
  key: "subjectState",
  default: "주제 없음",
});
