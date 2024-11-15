from models.word_db import WordDB

class WordService:
    def __init__(self):
        self.word_db = WordDB()

    async def find_word(self, dto):
        if dto.type == "mission":
            if dto.shMisType == "theory":
                words = [[s[0], s[1], s[2], s[3]] for s in await self.word_db.find_word(dto)]
            else:
                words = [[s[0], s[1], s[2]] for s in await self.word_db.find_word(dto)]
        elif dto.type == "allMission":
            words = [[s[0], s[1]] for s in await self.word_db.find_word(dto)]
        else:
            words = [[s[0], s[2]] for s in await self.word_db.find_word(dto)]

        if len(words) == 0:
            return "단어 없음"

        return words
    
    def precise_find_word(self, word):
        phrase = [[s[0], s[1]] for s in self.word_db.precise_find_word(word)]
        return phrase
    
    def initial_max_score(self, dto):
        phrase = [[s[0], s[1]] for s in self.word_db.initial_max_score(dto)]
        return phrase
    
    def insert_word(self, dto):
        return self.word_db.insert_word(dto)
    
    def delete_word(self, word):
        return self.word_db.delete_word(word)
    
    def known_word(self, word, checked):
        return self.word_db.known_word(word, checked)
    
    def current_phrase(self, word):
        phrase = [[s[0]] for s in self.word_db.current_phrase(word)]
        return phrase

    def remember_phrase(self, word, phrase):
        return self.word_db.remember_phrase(word, phrase)
    
    def uread(self, dto):
        return self.word_db.uread(dto)
    
    def mission_word(self, dto):
        words = self.word_db.mission_word(dto)  # words는 {'가': [...], '나': [...], ...}
        
        missionWord = {}
        for key, values in words.items():
            # 각 초기 글자에 대해 빈 리스트를 생성
            missionWord[key] = []
            
            for value in values:
                # 각 값을 딕셔너리로 변환하여 초기 글자에 추가
                missionWord[key].append({
                    "word": value[0],   # 첫 번째 값(단어)
                    "mission": value[1],  # 두 번째 값(미션)
                    "ranking": value[2]   # 세 번째 값(랭킹)
                })

        return missionWord
    
    def all_word(self):
        selectedOption = [s[0] for s in self.word_db.all_word()]
        return selectedOption
    
    def initial(self):
        selectedOption = [s[0] for s in self.word_db.initial()]
        return selectedOption