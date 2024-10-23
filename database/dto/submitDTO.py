class SubmitDTO:
    def __init__(self, title, subtitle, description, index):
        self._title = title
        self._subtitle = subtitle
        self._description = description
        self._index = index

    @property
    def title(self):
        return self._title

    @property
    def subtitle(self):
        return self._subtitle
    
    @property
    def description(self):
        return self._description

    @property
    def index(self):
        return self._index