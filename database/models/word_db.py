from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

class WordDB:
    def setting(self):
        engine = create_engine('mysql+pymysql://root:1234@localhost/KKUTU')
        Session = sessionmaker(bind=engine)
        self.session = Session()
        print("connect ok")

    def __init__(self):
        self.setting()

    def get_hangul_range(self, first_letter):
        """한글 자음에 따른 유니코드 범위 반환"""
        ranges = {
            'ㄱ': ('가', '낗'),
            'ㄴ': ('나', '닣'),
            'ㄷ': ('다', '딯'),
            'ㄹ': ('라', '맇'),
            'ㅁ': ('마', '밓'),
            'ㅂ': ('바', '삫'),
            'ㅅ': ('사', '앃'),
            'ㅇ': ('아', '잏'),
            'ㅈ': ('자', '짛'),
            'ㅊ': ('차', '칳'),
            'ㅋ': ('카', '킿'),
            'ㅌ': ('타', '팋'),
            'ㅍ': ('파', '핗'),
            'ㅎ': ('하', '힣')
        }
        return ranges.get(first_letter, (None, None))
    
    def find_word(self, dto):
        first_letter = dto.word[0]
        item_letter = dto.word[1]

        if first_letter == None:
            first_letter = ""
        
        if item_letter == None:
            item_letter = ""

        sql = ""
        rangeSet = ""
        options = ""
        isTenSec = dto.checklist[0] if dto.checklist and len(dto.checklist) > 0 else False
        isKnown = dto.checklist[1] if dto.checklist and len(dto.checklist) > 1 else False
        subject = dto.subject

        if first_letter != '' and first_letter in 'ㄱㄴㄷㄹㅁㅂㅅㅇㅈㅊㅋㅌㅍㅎ':
            start, end = self.get_hangul_range(first_letter)

            rangeSet = f"""
                word >= '{start}' AND word <= '{end}'
            """

        if isTenSec:
            options += "AND CHAR_LENGTH(word) < 11\n"
        if isKnown:
            options += "AND checked = true\n"
        if subject != "all":
            options += f"AND subject = '{subject}'"

        if dto.type == 'attack':
            sql = self.attack(first_letter, item_letter, rangeSet, options)
        elif dto.type == 'mission':
            sql = self.mission(first_letter, item_letter, dto.mission, rangeSet, dto.shMisType, options)
        elif dto.type == 'allMission':
            sql = self.allMission(first_letter, item_letter, rangeSet, dto.tier, options)
        elif dto.type == 'protect':
            sql = self.protect(first_letter, item_letter, rangeSet, options)
        elif dto.type == 'villain':
            sql = self.villain(first_letter, item_letter, dto.backWord, rangeSet, options)
        elif dto.type == 'long':
            sql = self.long(first_letter, item_letter, rangeSet, options)

        result = self.session.execute(text(sql)).fetchall()
        return result
    
    def attack(self, front_initial1, front_initial2, rangeSet, options):
        if not rangeSet:
            rangeSet = f"""
            (
                w.word LIKE '{front_initial1}%' OR
                w.word LIKE '{front_initial2}%'
            )
        """

        sql = f"""
                SELECT *
                FROM Word w
                WHERE EXISTS (
                    SELECT 1
                    FROM AttackInitial a
                    WHERE w.word LIKE CONCAT('%', a.initial)
                )
                AND {rangeSet}
                {options}
                ORDER BY CHAR_LENGTH(w.word) DESC;
            """
        return sql
        
    def mission(self, front_initial1, front_initial2, mission, rangeSet, shMisType, options):
        if mission == "":
            if not rangeSet:
                rangeSet = f"""
                (
                    word LIKE '{front_initial1}%' OR
                    word LIKE '{front_initial2}%'
                )
            """

            sql = f"""
                SELECT word,
                MaxCountCharacter(word) AS mission,
                CHAR_LENGTH(word) AS len,
                checked
                FROM Word
                WHERE {rangeSet}
                {options}
                ORDER BY mission DESC, len DESC
                LIMIT 1000;
            """
        elif front_initial1 == "":
            if not rangeSet:
                rangeSet = f"""
                word LIKE '%'
            """
                
            sql = f"""
                SELECT
                word,
                (CountCharacter(word, '{mission}'))
                AS mission,
                RANK() OVER (ORDER BY 
                    (CountCharacter(word, '{mission}')) DESC,
                    CHAR_LENGTH(word) DESC)
                AS ranking,
                checked
                FROM Word
                WHERE {rangeSet}
                {options}
                LIMIT 1000;
            """
        elif shMisType == 'score':
            if not rangeSet:
                rangeSet = f"""
                (
                    word LIKE '{front_initial1}%' OR
                    word LIKE '{front_initial2}%'
                )
            """

            sql = f"""
                SELECT
                word,
                CAST(calculate_value(word, '{mission}', 1) AS SIGNED)
                score,
                checked
                FROM Word
                WHERE {rangeSet}
                {options}
                ORDER BY score DESC
                LIMIT 10;
            """
        elif shMisType == 'value':
            if not rangeSet:
                rangeSet = f"""
                (
                    word LIKE '{front_initial1}%' OR
                    word LIKE '{front_initial2}%'
                )
            """

            sql = f"""
                WITH SelectedWords AS (
                    SELECT
                        word,
                        RIGHT(word, 1) AS last_char,
                        calculate_value(word, '{mission}', 1) AS score,
                        checked,
                        getDoumChar(RIGHT(word, 1)) AS doum_char
                    FROM Word
                    WHERE {rangeSet}
                    {options}
                    ORDER BY score DESC
                    LIMIT 35
                )
                SELECT 
                DISTINCT SelectedWords.word,
                CAST(SelectedWords.score - (
                    SELECT
                    calculate_value_by_value(word, GREATEST(
                        CountCharacter(word, '가'),
                        CountCharacter(word, '나'),
                        CountCharacter(word, '다'),
                        CountCharacter(word, '라'),
                        CountCharacter(word, '마'),
                        CountCharacter(word, '바'),
                        CountCharacter(word, '사'),
                        CountCharacter(word, '아'),
                        CountCharacter(word, '자'),
                        CountCharacter(word, '차'),
                        CountCharacter(word, '카'),
                        CountCharacter(word, '타'),
                        CountCharacter(word, '파'),
                        CountCharacter(word, '하')
                    ), 1) as max_score
                    FROM 
                        Word
                    WHERE 
                        word LIKE CONCAT(SelectedWords.last_char, '%') 
                        OR word LIKE CONCAT(SelectedWords.doum_char, '%')
                    ORDER BY 
                        max_score DESC
                    LIMIT 1
                ) AS SIGNED) as value,
                SelectedWords.checked
                FROM SelectedWords
                ORDER BY value DESC;
            """
            
        elif shMisType == 'theory':
            if not rangeSet:
                rangeSet = f"""
                (
                    LEFT(word, 1) = '{front_initial1}'
                    OR LEFT(word, 1) = '{front_initial2}'
                )
            """

            sql = f"""
                SELECT
                word,
                (CountCharacter(word, '{mission}'))
                AS mission,
                RANK() OVER (ORDER BY 
                    (CountCharacter(word, '{mission}')) DESC,
                    CHAR_LENGTH(word) DESC)
                AS ranking,
                checked
                FROM Word
                WHERE {rangeSet}
                {options}
                LIMIT 10;
            """

        return sql
    
    def allMission(self, front_initial1, front_initial2, rangeSet, tier, options):
        if not rangeSet:
            rangeSet = f"""
            (
                LEFT(word, 1) = '{front_initial1}'
                OR LEFT(word, 1) = '{front_initial2}'
            )
        """

        if 'a' <= front_initial1 <= 'z':
            sql = f"""
                WITH CountMissions AS (
                    SELECT word, subject, 'a' AS mission_letter, CountCharacter(word, 'a') AS letter_count, CHAR_LENGTH(word) AS word_length, checked FROM word WHERE {rangeSet} {options}
                    UNION ALL
                    SELECT word, subject, 'b', CountCharacter(word, 'b'), CHAR_LENGTH(word), checked FROM word WHERE {rangeSet} {options}
                    UNION ALL
                    SELECT word, subject, 'c', CountCharacter(word, 'c'), CHAR_LENGTH(word), checked FROM word WHERE {rangeSet} {options}
                    UNION ALL
                    SELECT word, subject, 'd', CountCharacter(word, 'd'), CHAR_LENGTH(word), checked FROM word WHERE {rangeSet} {options}
                    UNION ALL
                    SELECT word, subject, 'e', CountCharacter(word, 'e'), CHAR_LENGTH(word), checked FROM word WHERE {rangeSet} {options}
                    UNION ALL
                    SELECT word, subject, 'f', CountCharacter(word, 'f'), CHAR_LENGTH(word), checked FROM word WHERE {rangeSet} {options}
                    UNION ALL
                    SELECT word, subject, 'g', CountCharacter(word, 'g'), CHAR_LENGTH(word), checked FROM word WHERE {rangeSet} {options}
                    UNION ALL
                    SELECT word, subject, 'h', CountCharacter(word, 'h'), CHAR_LENGTH(word), checked FROM word WHERE {rangeSet} {options}
                    UNION ALL
                    SELECT word, subject, 'i', CountCharacter(word, 'i'), CHAR_LENGTH(word), checked FROM word WHERE {rangeSet} {options}
                    UNION ALL
                    SELECT word, subject, 'j', CountCharacter(word, 'j'), CHAR_LENGTH(word), checked FROM word WHERE {rangeSet} {options}
                    UNION ALL
                    SELECT word, subject, 'k', CountCharacter(word, 'k'), CHAR_LENGTH(word), checked FROM word WHERE {rangeSet} {options}
                    UNION ALL
                    SELECT word, subject, 'l', CountCharacter(word, 'l'), CHAR_LENGTH(word), checked FROM word WHERE {rangeSet} {options}
                    UNION ALL
                    SELECT word, subject, 'm', CountCharacter(word, 'm'), CHAR_LENGTH(word), checked FROM word WHERE {rangeSet} {options}
                    UNION ALL
                    SELECT word, subject, 'n', CountCharacter(word, 'n'), CHAR_LENGTH(word), checked FROM word WHERE {rangeSet} {options}
                    UNION ALL
                    SELECT word, subject, 'o', CountCharacter(word, 'o'), CHAR_LENGTH(word), checked FROM word WHERE {rangeSet} {options}
                    UNION ALL
                    SELECT word, subject, 'p', CountCharacter(word, 'p'), CHAR_LENGTH(word), checked FROM word WHERE {rangeSet} {options}
                    UNION ALL
                    SELECT word, subject, 'q', CountCharacter(word, 'q'), CHAR_LENGTH(word), checked FROM word WHERE {rangeSet} {options}
                    UNION ALL
                    SELECT word, subject, 'r', CountCharacter(word, 'r'), CHAR_LENGTH(word), checked FROM word WHERE {rangeSet} {options}
                    UNION ALL
                    SELECT word, subject, 's', CountCharacter(word, 's'), CHAR_LENGTH(word), checked FROM word WHERE {rangeSet} {options}
                    UNION ALL
                    SELECT word, subject, 't', CountCharacter(word, 't'), CHAR_LENGTH(word), checked FROM word WHERE {rangeSet} {options}
                    UNION ALL
                    SELECT word, subject, 'u', CountCharacter(word, 'u'), CHAR_LENGTH(word), checked FROM word WHERE {rangeSet} {options}
                    UNION ALL
                    SELECT word, subject, 'v', CountCharacter(word, 'v'), CHAR_LENGTH(word), checked FROM word WHERE {rangeSet} {options}
                    UNION ALL
                    SELECT word, subject, 'w', CountCharacter(word, 'w'), CHAR_LENGTH(word), checked FROM word WHERE {rangeSet} {options}
                    UNION ALL
                    SELECT word, subject, 'x', CountCharacter(word, 'x'), CHAR_LENGTH(word), checked FROM word WHERE {rangeSet} {options}
                    UNION ALL
                    SELECT word, subject, 'y', CountCharacter(word, 'y'), CHAR_LENGTH(word), checked FROM word WHERE {rangeSet} {options}
                    UNION ALL
                    SELECT word, subject, 'z', CountCharacter(word, 'z'), CHAR_LENGTH(word), checked FROM word WHERE {rangeSet} {options}
                ),
                RankedResults AS (
                    SELECT word, subject, mission_letter, letter_count, word_length, checked, 
                        ROW_NUMBER() OVER (PARTITION BY mission_letter ORDER BY letter_count DESC, word_length DESC) AS ranks 
                    FROM CountMissions
                )
                SELECT word, subject, mission_letter FROM RankedResults WHERE ranks = {tier}
            """

        elif '가' <= front_initial1 <= '힣':
            sql = f"""
                WITH CountMissions AS (
                    SELECT word, subject, '가' AS mission_letter, CountCharacter(word, '가') AS letter_count, CHAR_LENGTH(word) AS word_length, checked FROM word WHERE {rangeSet} {options}
                    UNION ALL
                    SELECT word, subject, '나', CountCharacter(word, '나'), CHAR_LENGTH(word), checked FROM word WHERE {rangeSet} {options}
                    UNION ALL
                    SELECT word, subject, '다', CountCharacter(word, '다'), CHAR_LENGTH(word), checked FROM word WHERE {rangeSet} {options}
                    UNION ALL
                    SELECT word, subject, '라', CountCharacter(word, '라'), CHAR_LENGTH(word), checked FROM word WHERE {rangeSet} {options}
                    UNION ALL
                    SELECT word, subject, '마', CountCharacter(word, '마'), CHAR_LENGTH(word), checked FROM word WHERE {rangeSet} {options}
                    UNION ALL
                    SELECT word, subject, '바', CountCharacter(word, '바'), CHAR_LENGTH(word), checked FROM word WHERE {rangeSet} {options}
                    UNION ALL
                    SELECT word, subject, '사', CountCharacter(word, '사'), CHAR_LENGTH(word), checked FROM word WHERE {rangeSet} {options}
                    UNION ALL
                    SELECT word, subject, '아', CountCharacter(word, '아'), CHAR_LENGTH(word), checked FROM word WHERE {rangeSet} {options}
                    UNION ALL
                    SELECT word, subject, '자', CountCharacter(word, '자'), CHAR_LENGTH(word), checked FROM word WHERE {rangeSet} {options}
                    UNION ALL
                    SELECT word, subject, '차', CountCharacter(word, '차'), CHAR_LENGTH(word), checked FROM word WHERE {rangeSet} {options}
                    UNION ALL
                    SELECT word, subject, '카', CountCharacter(word, '카'), CHAR_LENGTH(word), checked FROM word WHERE {rangeSet} {options}
                    UNION ALL
                    SELECT word, subject, '타', CountCharacter(word, '타'), CHAR_LENGTH(word), checked FROM word WHERE {rangeSet} {options}
                    UNION ALL
                    SELECT word, subject, '파', CountCharacter(word, '파'), CHAR_LENGTH(word), checked FROM word WHERE {rangeSet} {options}
                    UNION ALL
                    SELECT word, subject, '하', CountCharacter(word, '하'), CHAR_LENGTH(word), checked FROM word WHERE {rangeSet} {options}
                ),
                RankedResults AS (
                    SELECT word, subject, mission_letter, letter_count, word_length, checked, 
                        ROW_NUMBER() OVER (PARTITION BY mission_letter ORDER BY letter_count DESC, word_length DESC) AS ranks 
                    FROM CountMissions
                )
                SELECT word, mission_letter FROM RankedResults WHERE ranks = {tier}
            """

        return sql

    def villain(self, front_initial1, front_initial2, back_word, rangeSet, options):
        if not rangeSet:
            rangeSet = f"""
                (
                    word LIKE '{front_initial1}%{back_word}' OR
                    word LIKE '{front_initial2}%{back_word}'
                )
            """

        sql = f"""
                SELECT *
                FROM Word
                WHERE {rangeSet}
                {options}
                AND CHAR_LENGTH(word) <> 1
                ORDER BY LEFT(word, 1) ASC, CHAR_LENGTH(word) DESC
                LIMIT 10000
            """
        
        return sql

    def protect(self, front_initial1, front_initial2, rangeSet, options):
        if not rangeSet:
            rangeSet = f"""
                (
                    word LIKE '{front_initial1}%' OR
                    word LIKE '{front_initial2}%'
                )
            """

        sql = f"""
                SELECT *
                FROM Word
                WHERE {rangeSet}
                {options}
                AND CHAR_LENGTH(word) <> 1
                ORDER BY CHAR_LENGTH(word) DESC
                LIMIT 1000
            """
        
        return sql
        
    def long(self, front_initial1, front_initial2, rangeSet, options):
        if not rangeSet:
            rangeSet = f"""
                (
                    word LIKE '{front_initial1}%' OR
                    word LIKE '{front_initial2}%'
                )
            """

        sql = f"""
                SELECT *
                FROM Word
                WHERE {rangeSet}
                {options}
                AND CHAR_LENGTH(word) > 8
                ORDER BY CHAR_LENGTH(word) DESC
                LIMIT 1000
            """
        
        return sql
    
    def precise_find_word(self, word):
        sql = """
        SELECT word, checked
        FROM word
        WHERE word = '{0}'
        """.format(word)

        try:
            result = self.session.execute(text(sql)).fetchall()
            return result
        except Exception as e:
            self.session.rollback()
            print(f"Error: {e}")
            return ["error", "문제가 발생하였습니다."]
        
    def initial_max_score(self, dto):
        rangeSet = ""

        word = dto['word']
        chain = dto['chain']

        if word[0] != '' and word[0] in 'ㄱㄴㄷㄹㅁㅂㅅㅇㅈㅊㅋㅌㅍㅎ':
            start, end = self.get_hangul_range(word[0])

            rangeSet = f"""
                word >= '{start}' AND word <= '{end}'
            """
        
        if not rangeSet:
            rangeSet = f"""
                (
                    word LIKE '{word[0]}%' OR
                    word LIKE '{word[1]}%'
                )
            """

        if '가' <= word[0] <= '힣':
            sql = f"""
                SELECT 
                word,
                CAST(calculate_value_by_value(word, GREATEST(
                    CountCharacter(word, '가'),
                    CountCharacter(word, '나'),
                    CountCharacter(word, '다'),
                    CountCharacter(word, '라'),
                    CountCharacter(word, '마'),
                    CountCharacter(word, '바'),
                    CountCharacter(word, '사'),
                    CountCharacter(word, '아'),
                    CountCharacter(word, '자'),
                    CountCharacter(word, '차'),
                    CountCharacter(word, '카'),
                    CountCharacter(word, '타'),
                    CountCharacter(word, '파'),
                    CountCharacter(word, '하')
                ), 1) AS SIGNED) AS max_score
                FROM 
                    Word
                WHERE 
                    {rangeSet}
                ORDER BY 
                    max_score DESC;
            """
        else:
            sql = f"""
                SELECT 
                word,
                CAST(GREATEST(
                    calculate_value(word, 'a', {chain}),
                    calculate_value(word, 'b', {chain}),
                    calculate_value(word, 'c', {chain}),
                    calculate_value(word, 'd', {chain}),
                    calculate_value(word, 'e', {chain}),
                    calculate_value(word, 'f', {chain}),
                    calculate_value(word, 'g', {chain}),
                    calculate_value(word, 'h', {chain}),
                    calculate_value(word, 'i', {chain}),
                    calculate_value(word, 'j', {chain}),
                    calculate_value(word, 'k', {chain}),
                    calculate_value(word, 'l', {chain}),
                    calculate_value(word, 'm', {chain}),
                    calculate_value(word, 'n', {chain}),
                    calculate_value(word, 'o', {chain}),
                    calculate_value(word, 'p', {chain}),
                    calculate_value(word, 'q', {chain}),
                    calculate_value(word, 'r', {chain}),
                    calculate_value(word, 's', {chain}),
                    calculate_value(word, 't', {chain}),
                    calculate_value(word, 'u', {chain}),
                    calculate_value(word, 'v', {chain}),
                    calculate_value(word, 'w', {chain}),
                    calculate_value(word, 'x', {chain}),
                    calculate_value(word, 'y', {chain}),
                    calculate_value(word, 'z', {chain})
                ) AS SIGNED) AS max_score
            FROM 
                Word
            WHERE 
                {rangeSet}
            ORDER BY 
                max_score DESC;
            """

        try:
            result = self.session.execute(text(sql)).fetchall()
            return result
        except Exception as e:
            self.session.rollback()
            print(f"Error: {e}")
            return ["error", "문제가 발생하였습니다."]
    
    def insert_word(self, dto):
        subjects = dto['subject'] if dto['subject'] != 'all' else "X"
        words = dto['word']

        sql = text(f"INSERT IGNORE INTO Word VALUES (:word, :subject, 0, '')")

        try:
            result = self.session.execute(
              sql, 
              [
                {'word': w, 'subject': s} 
                for w, s in zip(words, subjects)
              ]
            )
            self.session.commit()
            affected_rows = result.rowcount
            if affected_rows == 0:
                return ["warning", "이미 추가된 단어입니다."]
            else:
                return ["success", f"{affected_rows}개의 단어가 추가되었습니다."]
        except Exception as e:
            self.session.rollback()
            print(f"Error: {e}")
            return ["error", "문제가 발생하였습니다."]
        
    def delete_word(self, word):
        words = word

        sql = text("DELETE FROM Word WHERE word = (:word)")

        try:
            result = self.session.execute(sql, [{'word': w} for w in words])
            self.session.commit()
            affected_rows = result.rowcount
            if affected_rows == 0:
                return ["warning", "존재하지 않는 단어입니다."]
            else:
                return ["success", f"{affected_rows}개의 단어가 삭제되었습니다."]
        except Exception as e:
            self.session.rollback()
            print(f"Error: {e}")
            return ["error", "문제가 발생하였습니다."]
        
    def known_word(self, word, checked):
        sql = """
        UPDATE Word
        SET checked = '{1}'
        WHERE word = '{0}'
        """.format(word, 1 - checked)

        try:
            self.session.execute(text(sql))
            self.session.commit()
            return ["success", "표시 완료."]
        except Exception as e:
            self.session.rollback()
            print(f"Error: {e}")
            return ["error", "문제가 발생하였습니다."]
        
    def remember_phrase(self, word, phrase):
        sql = """
        UPDATE Word
        SET sentence = '{1}'
        WHERE word = '{0}'
        """.format(word, phrase)

        try:
            self.session.execute(text(sql))
            self.session.commit()
            return ["success", "표시 완료."]
        except Exception as e:
            self.session.rollback()
            print(f"Error: {e}")
            return ["error", "문제가 발생하였습니다."]
        
    def current_phrase(self, word):
        sql = """
        SELECT sentence
        FROM word
        WHERE word = '{0}'
        """.format(word)

        try:
            result = self.session.execute(text(sql)).fetchall()
            return result
        except Exception as e:
            self.session.rollback()
            print(f"Error: {e}")
            return ["error", "문제가 발생하였습니다."]
        
    def uread(self, dto):
        try:
            if isinstance(dto.words, str):
                # 단일 문자열인 경우
                sql = """
                    UPDATE Word
                    SET checked = :isRead
                    WHERE word = :word
                """
                self.session.execute(text(sql), {"isRead": dto.isRead, "word": dto.words})
            else:
                # 리스트인 경우
                for word in dto.words:
                    if '[' in word:
                        word = word.split('] ')[1]
                    sql = """
                        UPDATE Word
                        SET checked = :isRead
                        WHERE word = :word
                    """
                    self.session.execute(text(sql), {"isRead": dto.isRead, "word": word})

            self.session.commit()
            return ["success", "설정 완료."]
        except Exception as e:
            self.session.rollback()
            print(f"Error: {e}")
            return ["error", "문제가 발생하였습니다."]

    def mission_word(self, dto):
        # word, initial
        missionInitials = "가나다라마바사아자차카타파하"
        words = {"가": [], "나": [], "다": [], "라": [],
                 "마": [], "바": [], "사": [], "아": [],
                 "자": [], "차": [], "카": [], "타": [],
                 "파": [], "하": []}
        
        firstInitial = dto.initial[0]
        secondInitial = dto.initial[1]
    
        if dto.shMisType == "theory":

            for mi in missionInitials:
                sql = f"""
                SELECT
                word,
                (CountCharacter(word, '{mi}'))
                AS mission,
                RANK() OVER (ORDER BY 
                    (CountCharacter(word, '{mi}')) DESC,
                    CHAR_LENGTH(word) DESC)
                AS ranking
                FROM Word
                WHERE word LIKE '{firstInitial}%'
                AND word LIKE '{secondInitial}%'
                LIMIT 10;
                """

                try:
                    result = self.session.execute(text(sql)).fetchall()
                    words[mi] = [list(row) for row in result]
                except Exception as e:
                    self.session.rollback()
                    print(f"Error: {e}")
                    return ["error", "문제가 발생하였습니다."]
            
            return words
        else:
            return "아직 지원하지 않습니다."
        
    def all_word(self):
        sql = f"""
        SELECT *
        FROM word
        WHERE word NOT REGEXP '^[a-z]'
        AND length(word) > 1;
        """

        try:
            result = self.session.execute(text(sql)).fetchall()
            return result
        except Exception as e:
            self.session.rollback()
            print(f"Error: {e}")
            return ["error", "문제가 발생하였습니다."]
        
    def initial(self):
        sql = f"""
        SELECT *
        FROM LoseInitial;
        """

        try:
            result = self.session.execute(text(sql)).fetchall()
            return result
        except Exception as e:
            self.session.rollback()
            print(f"Error: {e}")
            return ["error", "문제가 발생하였습니다."]