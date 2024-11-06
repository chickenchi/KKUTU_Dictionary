export function getDoumChar(lastChar: string): string {
  if (lastChar.length !== 1) return "failed";
  const code = lastChar.charCodeAt(0);
  const BASE_CODE = 0xac00;
  const MAX_CODE = 0xd7a3;
  if (code < BASE_CODE || code > MAX_CODE) return "failed";

  let data = code - BASE_CODE;
  const ONSET_COUNT = 21;
  const NUCLEUS_COUNT = 28;

  let onset = Math.floor(data / (ONSET_COUNT * NUCLEUS_COUNT)) + 0x1100;
  let nucleus = (Math.floor(data / NUCLEUS_COUNT) % ONSET_COUNT) + 0x1161;
  let coda = (data % NUCLEUS_COUNT) + 0x11a7;

  const RIEUL_TO_NIEUN = [4449, 4450, 4457, 4460, 4462, 4467];
  const RIEUL_TO_IEUNG = [4451, 4455, 4456, 4461, 4466, 4469];
  const NIEUN_TO_IEUNG = [4455, 4461, 4466, 4469];

  let isDoumChar = false;

  if (onset === 4357) {
    if (RIEUL_TO_NIEUN.includes(nucleus)) {
      onset = 4354;
      isDoumChar = true;
    } else if (RIEUL_TO_IEUNG.includes(nucleus)) {
      onset = 4363;
      isDoumChar = true;
    }
  } else if (onset === 4354) {
    if (NIEUN_TO_IEUNG.includes(nucleus)) {
      onset = 4363;
      isDoumChar = true;
    }
  }

  if (isDoumChar) {
    onset -= 0x1100;
    nucleus -= 0x1161;
    coda -= 0x11a7;
    return String.fromCharCode(
      (onset * ONSET_COUNT + nucleus) * NUCLEUS_COUNT + coda + BASE_CODE
    );
  }

  return "failed";
}