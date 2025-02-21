export const CommandTypes = {
  WORD_SET: "/wordSet ",
  UREAD: "/uread ",
  MOVE_TO: "/moveTo ",
  PDEL: "/pdel ",
  SEARCH: "/search ",
  INI_MS: "/iniMS ",
  EXIT: "/exit",
  CLEAR_LOG: "/clearLog",
};

export const commandList = [
  ["moveTo", "페이지를 이동합니다.", "moveTo [location]"],
  [
    "uread",
    "단어를 읽음/읽지 않음 처리합니다.",
    "uread [word(s)] [read/unread] [subject] {tier}",
  ],
  ["wordSet", "단어 설정을 수정합니다.", "wordSet [wordName]"],
  [
    "pdel",
    "내용의 일부를 모두 삭제합니다(정규식 사용 가능, 유효하지 않다고 뜨더라도 무시).",
    "pdel [phrase]",
  ],
  [
    "search",
    "단어를 검색합니다.",
    "search [searchType] [initial] [server] [subject] {tier} {isTenSecond} {isKnown} {shMisType}",
  ],
  ["iniMS", "앞 글자의 최대 점수를 구합니다.", "iniMS [initial] {chain}"],
  ["exit", "명령어를 나갑니다.", "exit"],
  ["clearLog", "기록된 명령어 로그를 모두 지웁니다.", "clearLog"],
];

export const commandPresets = {
  // 단어 설정 관련 명령어
  wordSet: [
    {
      sectionName: "단어 설정 관련",
      title: ["wordName", "(필수) 단어를 입력하세요!"],
      options: [],
    },
  ],

  // 읽음/읽지 않음 표시 관련 명령어
  uread: [
    {
      sectionName: "단어 입력 관련",
      title: ["word(s)", "(필수) 읽음/읽지 않음 표시할 단어(들)를 입력합니다."],
      options: [
        ["a,b,c,...", "띄어쓰기 없이 쉼표로 구분해 단어 여러 개를 입력합니다."],
        ["a-b / a~b", "해당되는 미션/빌런 단어를 설정합니다."],
        [
          "a-* / ~a(a~)",
          "해당되는 앞 글자의 모든 미션/빌런 단어를 설정합니다.",
        ],
      ],
    },
    {
      sectionName: "읽음/읽지 않음 선택",
      title: [
        "read/unread",
        "(필수) 읽음 표시할지, 읽지 않음 표시할지 선택합니다.",
      ],
      options: [
        ["read", "읽음 표시합니다."],
        ["unread", "읽지 않음 표시합니다."],
      ],
    },
    {
      sectionName: "주제 설정",
      title: [
        "subject",
        "(필수) 주제를 입력해 주세요. 전체를 찾을 땐 *를 입력하세요. 만약 입력이 정확하지 않으면 알고리즘이 판단해 줍니다.",
      ],
    },
    {
      sectionName: "티어 설정",
      title: [
        "tier",
        "(선택) 티어를 숫자만 입력합니다(티어가 있는 형식에만 사용하세요).",
      ],
      options: [["*", "모든 티어를 읽음 표시합니다."]],
    },
  ],

  // 위치 이동 관련 명령어
  moveTo: [
    {
      sectionName: "위치 이동 관련",
      title: ["location", "(필수) 위치를 입력하세요!"],
      options: [
        ["search", "검색으로 이동합니다."],
        ["add", "추가로 이동합니다."],
        ["remove", "삭제로 이동합니다."],
        ["memo", "메모로 이동합니다."],
        ["practice", "연습으로 이동합니다."],
        ["check_mission", "미션 확인으로 이동합니다."],
        ["pattern", "공격 패턴으로 이동합니다."],
      ],
    },
  ],

  // 앞 글자 및 체인 설정 관련 명령어
  iniMS: [
    {
      sectionName: "앞 글자 및 체인 설정",
      title: ["initial", "(필수) 앞 글자를 입력하세요!"],
      options: [["chain", "(선택) 체인을 입력하세요(숫자만 입력합니다)!"]],
    },
  ],

  // 삭제할 문구 관련 명령어
  pdel: [
    {
      sectionName: "삭제할 문구",
      title: ["phrase", "(필수) 삭제할 문구를 입력하세요!"],
      options: [],
    },
  ],

  // 검색 관련 명령어
  search: [
    {
      sectionName: "검색 유형 선택",
      title: ["searchType", "(필수) 유형을 입력해 주세요!"],
      options: [
        ["mission", "미션 단어를 찾습니다."],
        ["villain", "반복해서 줄 단어를 찾습니다."],
        ["attack", "공격 단어를 찾습니다."],
        ["protect", "모든 유형의 단어를 찾습니다."],
        ["long", "긴 단어를 찾습니다."],
        ["language", "언어 주제의 단어를 찾습니다."],
      ],
    },
    {
      sectionName: "서버 선택",
      title: ["searchType", "(필수) 서버를 입력해 주세요!"],
      options: [
        ["kkuko", "끄투코리아 서버입니다."],
        ["rio", "끄투리오 서버입니다."],
        ["all", "있는 서버 중 모두 선택합니다."],
      ],
    },
    {
      sectionName: "앞 글자 형식 선택",
      title: [
        "initial",
        "(필수) 입력할 앞 글자를 형식에 맞게 작성해 주세요! 소괄호는 포함하지 않습니다.",
      ],
      options: [
        [
          "(initial)-(mission)",
          "[미션 형식] initial: 앞 글자, mission: 미션 글자 입력",
        ],
        ["(fI)~(bI)", "[빌런 형식] fI: 앞 글자, bI: 뒤 글자 입력"],
        ["(initial)", "[그 외 형식] initial: 앞 글자 입력"],
      ],
    },
    {
      sectionName: "주제 입력",
      title: [
        "subject",
        "(필수) 주제를 입력해 주세요. 전체를 찾을 땐 *를 입력하세요. 만약 입력이 정확하지 않으면 알고리즘이 판단해 줍니다.",
      ],
      options: [],
    },
    {
      sectionName: "티어 입력",
      title: [
        "tier",
        "(선택) 티어를 입력해 주세요. 1티어면 1을 입력하시면 됩니다.",
      ],
      options: [],
    },
    {
      sectionName: "10초전 단어 선택",
      title: [
        "isTenSecond",
        "(선택) 10초전에서 사용할 단어로 할지 선택해 주세요!",
      ],
      options: [
        ["true", "10초전 단어로 선택합니다."],
        ["false", "검색에 해당하는 모든 단어로 선택합니다."],
      ],
    },
    {
      sectionName: "알고 있는 단어만 선택",
      title: ["isKnown", "(선택) 알고 있는 단어만 뽑을 것인지 선택해 주세요!"],
      options: [
        ["true", "알고 있는 단어만 뽑습니다."],
        ["false", "검색에 해당하는 모든 단어로 선택합니다."],
      ],
    },
    {
      sectionName: "미션 유형 선택",
      title: ["shMisType", "(선택) 미션 유형을 선택해 주세요!"],
      options: [
        ["theory", "미션 개수와 길이만으로 티어를 판별합니다."],
        ["score", "점수로 판별합니다. ※ 전체 미션 보기에는 지원하지 않습니다."],
      ],
    },
  ],

  // 종료 명령어
  exit: [
    {
      sectionName: "종료",
      title: ["(X)", "공백을 지우고 그대로 사용하시면 됩니다."],
      options: [],
    },
  ],

  // 로그 삭제 명령어
  clearLog: [
    {
      sectionName: "로그 삭제",
      title: ["(X)", "공백을 지우고 그대로 사용하시면 됩니다."],
      options: [],
    },
  ],
};
