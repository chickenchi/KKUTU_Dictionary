class RmMemoDTO:
    def __init__(self, index):
        self._index = index

    @property
    def index(self):
        return self._index