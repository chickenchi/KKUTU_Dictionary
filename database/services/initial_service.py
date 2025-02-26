import random
from models.initial_db import InitialDB

class InitialService:
    def __init__(self):
        self.memo_db = InitialDB()
        
    def add_initial(self, initial):
        return self.memo_db.add_initial(initial)
    
    def pull_initial(self, initial):
        return self.memo_db.pull_initial(initial)
    
    def recommend_add_initial(self, initial):
        return self.memo_db.recommend_add_initial(initial)
    
    def recommend_pull_initial(self, initial):
        return self.memo_db.recommend_pull_initial(initial)