import { atom } from "recoil";

export const rareWordPiecesState = atom<Set<[string, number]>>({
  key: "rareWordPiecesState",
  default: new Set<[string, number]>(),
});

export const highWordPiecesState = atom<Set<[string, number]>>({
  key: "highWordPiecesState",
  default: new Set<[string, number]>(),
});

export const wordPiecesState = atom<Set<[string, number]>>({
  key: "wordPiecesState",
  default: new Set<[string, number]>(),
});

export const wordPieceSettingState = atom<string>({
  key: "wordPieceSettingState",
  default: "wordPiece",
});
