import pymysql

class InitialDB:
    def setting(self):
        self.db = pymysql.connect(host='localhost', user='root', password='1234', db='KKUTU')
        self.cur = self.db.cursor()
        print("connect ok")

    def __init__(self):
        self.setting()

    def add_initial(self, initial):
        sql = f"INSERT IGNORE INTO AttackInitial VALUES (%s)"

        try:
            self.cur.execute(sql, initial)
            self.db.commit()
            affected_rows = self.cur.rowcount
            if affected_rows == 0:
                return "존재"
            else:
                return "성공"
        except Exception as e:
            self.db.rollback()
            print(f"Error: {e}")
            return "오류"
        
    def pull_initial(self, initial):
        sql = f"DELETE FROM AttackInitial WHERE initial = (%s)"

        try:
            self.cur.execute(sql, initial)
            self.db.commit()
            affected_rows = self.cur.rowcount
            if affected_rows == 0:
                return "무효"
            else:
                return "성공"
        except Exception as e:
            self.db.rollback()
            print(f"Error: {e}")
            return "오류"
        
    def recommend_add_initial(self, initial):
        sql = f"INSERT IGNORE INTO HardAttackInitial VALUES (%s)"

        try:
            self.cur.execute(sql, initial)
            self.db.commit()
            affected_rows = self.cur.rowcount
            if affected_rows == 0:
                return "존재"
            else:
                return "성공"
        except Exception as e:
            self.db.rollback()
            print(f"Error: {e}")
            return "오류"
        
    def recommend_pull_initial(self, initial):
        sql = f"DELETE FROM HardAttackInitial WHERE initial = (%s)"

        try:
            self.cur.execute(sql, initial)
            self.db.commit()
            affected_rows = self.cur.rowcount
            if affected_rows == 0:
                return "무효"
            else:
                return "성공"
        except Exception as e:
            self.db.rollback()
            print(f"Error: {e}")
            return "오류"