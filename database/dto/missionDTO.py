class MissionDTO:
    def __init__(self, initial, shMisType):
        self._initial = initial
        self._shMisType = shMisType

    @property
    def initial(self):
        return self._initial

    @property
    def shMisType(self):
        return self._shMisType