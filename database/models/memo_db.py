import re
import pymysql

class MemoDB:
    def setting(self):
        self.db = pymysql.connect(host='localhost', user='root', password='1234', db='KKUTU')
        self.cur = self.db.cursor()
        print("connect ok")

    def __init__(self):
        self.setting()

    def jaccard_similarity(self, str1, str2):
        set1 = set(re.findall(r'\w+', str1))
        set2 = set(re.findall(r'\w+', str2))

        if not set1 or not set2:
            return 0

        intersection = len(set1.intersection(set2))
        union = len(set1.union(set2))

        return intersection / union if union != 0 else 0

    def mixed_similarity(self, search, target):
        if len(search) == 1:
            return 1 if search in target else 0
        return self.jaccard_similarity(search, target)
        
    def search_memo(self, dto):
        search_field = dto.searchType if dto.searchType in ['title', 'subtitle', 'description'] else 'title'
        
        sql = """
            SELECT id, title, subtitle, description
            FROM Memo
            WHERE sType LIKE '%{0}%'
        """.format(dto.type)

        self.cur.execute(sql)
        affected_rows = self.cur.rowcount

        if affected_rows == 0:
            return '메모 없음'
        
        result = self.cur.fetchall()

        if not dto.search.strip():
            return result

        similarities = []
        for row in result:
            id, title, subtitle, description = row

            if search_field == 'title':
                similarity = self.mixed_similarity(dto.search, title)
            elif search_field == 'subtitle':
                similarity = self.mixed_similarity(dto.search, subtitle)
            elif search_field == 'description':
                similarity = self.mixed_similarity(dto.search, description)

            print(similarity)

            if similarity != 0:
                similarities.append((id, title, subtitle, description, similarity))

        sorted_result = sorted(similarities, key=lambda x: x[4], reverse=True)

        if not sorted_result:
            return '메모 없음'

        return sorted_result
        
    def submit_memo(self, dto):
        sql = """
            UPDATE Memo
            SET Title = %s,
                Subtitle = %s,
                Description = %s
            WHERE id = %s
        """
        params = (dto.title, dto.subtitle, dto.description, dto.index)

        try:
            self.cur.execute(sql, params)
            self.db.commit()
            return ["success", "적용되었습니다."]
        except Exception as e:
            self.db.rollback()
            return ["error", "문제가 발생하였습니다."]
        
    def remove_memo(self, dto):
        sql = """
            DELETE FROM Memo
            WHERE id = {0}
        """.format(dto.index)
    
        try:
            self.cur.execute(sql)
            self.db.commit()
            return ["success", "메모 삭제가 완료되었습니다."]
        except Exception as e:
            self.db.rollback()
            return ["error", "문제가 발생하였습니다."]
        
    def make_memo(self, type):
        if type == "": type = "%"

        print(type)
        
        sql = """
            INSERT INTO Memo
            (`Title`, `Subtitle`, `Description`, `sType`)
            VALUES('제목 없음', '소제목 없음', '', '{0}')
        """.format(type)

        try:
            self.cur.execute(sql)
            self.db.commit()
            return "성공"
        except Exception as e:
            self.db.rollback()
            return ["error", "문제가 발생하였습니다."]