class MemoDTO:
    def __init__(self, search, type, searchType):
        self._search = search
        self._type = type
        self._searchType = searchType

    @property
    def search(self):
        return self._search

    @property
    def type(self):
        return self._type
    
    @property
    def searchType(self):
        return self._searchType