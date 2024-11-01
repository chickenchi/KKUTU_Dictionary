export const subjectOptions = [
  { value: "all", label: "주제 없음" },
  { value: "", label: "--------- 노인정 주제 ---------", disabled: true },
  { value: "economy", label: "경제" },
  { value: "historicalRemain", label: "고적" },
  { value: "industry", label: "공업" },
  { value: "education", label: "교육" },
  { value: "transportation", label: "교통" },
  { value: "agriculture", label: "농업" },
  { value: "animal", label: "동물" },
  { value: "literature", label: "문학" },
  { value: "physics", label: "물리" },
  { value: "art", label: "미술" },
  { value: "society", label: "사회" },
  { value: "biology", label: "생물" },
  { value: "math", label: "수학" },
  { value: "plant", label: "식물" },
  { value: "language", label: "언어" },
  { value: "history", label: "역사" },
  { value: "music", label: "음악" },
  { value: "geography", label: "지리" },
  { value: "toponym", label: "지명" },
  { value: "astronomy", label: "천문" },
  { value: "pe", label: "체육" },
  { value: "computer", label: "컴퓨터" },
  { value: "chemistry", label: "화학" },
  { value: "", label: "--------- 어인정 주제 ---------", disabled: true },
  { value: "snack", label: "간식" },
  { value: "nationalHeritage", label: "국가 지정 문화재" },
  { value: "localAttractionsAndFestival", label: "국내 관광지 / 축제" },
  { value: "localTVShow", label: "국내 방송 프로그램" },
  { value: "companyAndBrand", label: "기업 / 브랜드" },
  { value: "kkutu", label: "끄투코리아" },
  { value: "netflix", label: "넷플릭스" },
  { value: "publicInstitution", label: "대한민국 공공 기관" },
  { value: "publicSchool", label: "대한민국 학교" },
  { value: "doraemon", label: "도라에몽" },
  { value: "animalCrossing", label: "동물의 숲" },
  { value: "touhouProject", label: "동방 프로젝트" },
  { value: "digimon", label: "디지몬" },
  { value: "litenovel", label: "라이트 노벨" },
  { value: "loveLive", label: "러브 라이브!" },
  { value: "lostArk", label: "로스트 아크" },
  { value: "leagueOfLegend", label: "리그 오브 레전드" },
  { value: "minecraft", label: "마인크래프트" },
  { value: "manga/anime", label: "만화/애니메이션" },
  { value: "maplestory", label: "메이플스토리" },
  { value: "modooMarble", label: "모두의 마블" },
  { value: "mobileApp", label: "모바일 애플리케이션" },
  { value: "musical/theater", label: "뮤지컬/연극" },
  { value: "valorant", label: "발로란트" },
  { value: "boardGame", label: "보드 게임" },
  { value: "brawlStars", label: "브롤스타즈" },
  { value: "blueArchive", label: "블루 아카이브" },
  { value: "videoGame", label: "비디오 게임" },
  { value: "idiom", label: "성어" },
  { value: "sevenKnights", label: "세븐나이츠" },
  { value: "novels/poetry/play", label: "소설/시/희곡" },
  { value: "starCraft", label: "스타크래프트" },
  { value: "sidMeiersCivilization", label: "시드 마이어의 문명" },
  { value: "THE_iDOLM@STER", label: "아이돌마스터" },
  { value: "elsword", label: "엘소드" },
  { value: "movie", label: "영화" },
  { value: "overwatch", label: "오버워치" },
  { value: "genshin", label: "원신" },
  { value: "webtoon", label: "웹툰" },
  { value: "unesco", label: "유네스코 유산" },
  { value: "celebrity", label: "유명인" },
  { value: "Yu-Gi-Oh", label: "유희왕" },
  { value: "car", label: "자동차" },
  { value: "theLegendOfZelda", label: "젤다의 전설" },
  { value: "occupation", label: "직업" },
  { value: "kartRider", label: "카트라이더" },
  { value: "cookieRun", label: "쿠키런" },
  { value: "clashRoyale/clashOfClans", label: "클래시 로얄/클래시 오브 클랜" },
  { value: "pokemon", label: "포켓몬스터" },
  { value: "hearthstone", label: "하스스톤" },
  { value: "transportationFacilities", label: "한국 교통 시설" },
  { value: "kpop", label: "한국 대중음악" },
  { value: "koreanRadioPrograms", label: "한국 라디오 프로그램" },
  { value: "koreanAdministrativeDivisions", label: "한국 행정 구역" },
  { value: "koreanIncidentsAndAccidents", label: "한국사 사건 사고" },
  { value: "heroesOfTheStorm", label: "히어로즈 오브 더 스톰" },
];

export const getValueByLabel = (label: string) => {
  const option = subjectOptions.find((option) => option.label === label);
  return option ? option.value : null; // option이 있으면 value 반환, 없으면 null 반환
};
