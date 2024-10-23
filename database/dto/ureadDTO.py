class UreadDTO:
    def __init__(self, words, isRead):
        self._words = words
        self._isRead = isRead

    @property
    def words(self):
        return self._words

    @property
    def isRead(self):
        return self._isRead