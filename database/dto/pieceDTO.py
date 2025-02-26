class PieceDTO:
    def __init__(self, piece, highPiece, rarePiece):
        self._piece = piece
        self._highPiece = highPiece
        self._rarePiece = rarePiece

    @property
    def piece(self):
        return self._piece

    @property
    def highPiece(self):
        return self._highPiece
    
    @property
    def rarePiece(self):
        return self._rarePiece