class WordDTO:
    def __init__(self, word, type, subject, mission, shMisType, backWord, checklist=[], tier=1):
        self._word = word
        self._backWord = backWord
        self._type = type
        self._subject = subject
        self._mission = mission
        self._shMisType = shMisType
        self._checklist = checklist
        self._tier = tier

    @property
    def word(self):
        return self._word

    @property
    def type(self):
        return self._type
    
    @property
    def subject(self):
        return self._subject
    
    @property
    def mission(self):
        return self._mission
    
    @property
    def backWord(self):
        return self._backWord

    @property
    def shMisType(self):
        return self._shMisType
    
    @property
    def checklist(self):
        return self._checklist
    
    @property
    def tier(self):
        return self._tier
    