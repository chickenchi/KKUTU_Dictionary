import random
from models.memo_db import MemoDB

class MemoService:
    def __init__(self):
        self.memo_db = MemoDB()

    def search_memo(self, dto):
        return self.memo_db.search_memo(dto)
    
    def submit_memo(self, dto):
        return self.memo_db.submit_memo(dto)
    
    def remove_memo(self, dto):
        return self.memo_db.remove_memo(dto)
    
    def make_memo(self, type):
        return self.memo_db.make_memo(type)