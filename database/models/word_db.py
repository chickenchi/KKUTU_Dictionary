from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from collections import Counter

class WordDB:
    def setting(self):
        engine = create_engine('mysql+pymysql://root:1234@localhost/KKUTU', echo=False)
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
        subject = dto.subject

        if first_letter == None:
            first_letter = ""
        
        if item_letter == None:
            item_letter = ""

        sql = ""
        rangeSet = ""
        options = ""
        
        range = dto.checklist[0] if dto.checklist and len(dto.checklist) > 0 else False
        isKnown = dto.checklist[1] if dto.checklist and len(dto.checklist) > 1 else False
        isInjeong = dto.checklist[2] if dto.checklist and len(dto.checklist) > 2 else False
        isOneHitWord = dto.checklist[3] if dto.checklist and len(dto.checklist) > 3 else False
        isRio = dto.checklist[4] if dto.checklist and len(dto.checklist) > 4 else False
        isKKUKO = dto.checklist[5] if dto.checklist and len(dto.checklist) > 5 else False

        if first_letter != '' and first_letter in 'ㄱㄴㄷㄹㅁㅂㅅㅇㅈㅊㅋㅌㅍㅎ':
            start, end = self.get_hangul_range(first_letter)

            rangeSet = f"""
                Word.word >= '{start}' AND Word.word <= '{end}'
            """

        if range:
            min = range.split("~")[0]
            max = range.split("~")[1]

            options += f"""AND CHAR_LENGTH(Word.word) >= {min}
            AND CHAR_LENGTH(Word.word) <= {max}
            """
        if isKnown:
            options += "AND checked = true\n"
        if isInjeong:
            options += "AND injeong = false\n"
        if subject != 'all':
            options += f"AND subject = '{subject}'\n"
            subjectSet = "JOIN WordSubject ON Word.word = WordSubject.word"
        else:
            subjectSet = ""

        if isRio and isKKUKO:
            options += "AND (kkuko = true AND rio = true)\n"
        elif isRio:
            options += "AND (rio = true OR (kkuko = true AND rio = true))\n"
        elif isKKUKO:
            options += "AND (kkuko = true OR (kkuko = true AND rio = true))\n"
        else:
            options += "AND (kkuko = false AND rio = false)\n"

        if isOneHitWord:
            oneHitWordInitial = self.oneHitWordInitial(first_letter, item_letter, options, isOneHitWord)
            options += oneHitWordInitial

        if dto.type == 'attack':
            sql = self.attack(first_letter, item_letter, rangeSet, options, subjectSet)
        if dto.type == 'hardAttack':
            sql = self.hardAttack(first_letter, item_letter, rangeSet, options, subjectSet)
        elif dto.type == 'mission':
            if first_letter != "" and first_letter[0] not in 'ㄱㄴㄷㄹㅁㅂㅅㅇㅈㅊㅋㅌㅍㅎ':
                sql = f"""
                    SELECT first_letter_count('{first_letter[0]}');
                """

                count = self.session.execute(text(sql)).fetchall()
                count = count[0][0]
            else:
                count = 1000

            if dto.shMisType == 'value':
                return self.valueMission(count, first_letter, item_letter, dto.mission, rangeSet, options, subjectSet)
            sql = self.mission(count, first_letter, item_letter, dto.mission, rangeSet, dto.shMisType, options, subjectSet)
        elif dto.type == 'allMission':
            sql = self.allMission(first_letter, item_letter, rangeSet, dto.tier, options, subjectSet)
        elif dto.type == 'protect':
            sql = self.protect(first_letter, item_letter, rangeSet, options, subjectSet)
        elif dto.type == 'villain':
            sql = self.villain(first_letter, item_letter, dto.backWord, rangeSet, options, subjectSet)
        elif dto.type == 'long':
            sql = self.long(first_letter, item_letter, rangeSet, options, subjectSet)

        result = self.session.execute(text(sql)).fetchall()

        return result
    
    def oneHitWordInitial(self, front_initial1, front_initial2, options, isOneHitWord):
        rangeSet = f"""
        (
            word LIKE '{front_initial1}%' OR
            word LIKE '{front_initial2}%'
        )
        """
            
        back_initials = self.getBackInitials(rangeSet, options)

        oneHitWordInitials = "AND"

        if isOneHitWord == True:
            oneHitWordInitials += """
(
word LIKE '궰'"""
        else:
            oneHitWordInitials += """ NOT ("""

        for back_initial in back_initials:
            sql = f"""
            SELECT EXISTS (
                SELECT 1
                FROM word
                WHERE word LIKE '{back_initial[0]}%'
                OR word LIKE CONCAT(getDoumChar('{back_initial[0]}'), '%')
            );
            """

            result = self.session.execute(text(sql)).fetchall()

            if result[0][0] == 0:
                oneHitWordInitials += f"""
OR word LIKE '%{back_initial[0]}'"""

        oneHitWordInitials += """
)"""

        return oneHitWordInitials
    
    def attack(self, front_initial1, front_initial2, rangeSet, options, subjectSet):
        if not rangeSet:
            rangeSet = f"""
            (
                Word.word LIKE '{front_initial1}%' OR
                Word.word LIKE '{front_initial2}%'
            )
        """

        sql = f"""
                SELECT *
                FROM word
                {subjectSet}
                WHERE EXISTS (
                    SELECT 1
                    FROM AttackInitial a
                    WHERE Word.word LIKE CONCAT('%', a.initial)
                )
                AND {rangeSet}
                {options}
                ORDER BY CHAR_LENGTH(Word.word) DESC;
            """
        return sql
    
    def hardAttack(self, front_initial1, front_initial2, rangeSet, options, subjectSet):


        if not rangeSet:
            rangeSet = f"""
            (
                Word.word LIKE '{front_initial1}%' OR
                Word.word LIKE '{front_initial2}%'
            )
        """

        sql = f"""
                SELECT *
                FROM word
                {subjectSet}
                WHERE EXISTS (
                    SELECT 1
                    FROM HardAttackInitial a
                    WHERE Word.word LIKE CONCAT('%', a.initial)
                )
                AND {rangeSet}
                {options}
                ORDER BY CHAR_LENGTH(Word.word) DESC;
            """

        return sql
        
    def mission(self, count, front_initial1, front_initial2, mission, rangeSet, shMisType, options, subjectSet):
        if mission == "":
            if not rangeSet:
                rangeSet = f"""
                (
                    Word.word LIKE '{front_initial1}%' OR
                    Word.word LIKE '{front_initial2}%'
                )
            """

            sql = f"""
                SELECT Word.word,
                MaxCountCharacter(Word.word) AS mission,
                CHAR_LENGTH(Word.word) AS len,
                checked
                FROM word
{subjectSet}
                WHERE {rangeSet}
                {options}
                ORDER BY mission DESC, len DESC
                LIMIT 1000;
            """
        elif front_initial1 == "":
            if not rangeSet:
                rangeSet = f"""
                Word.word LIKE '%'
            """
                
            sql = f"""
                SELECT
                Word.word,
                (CountCharacter(Word.word, '{mission}'))
                AS mission,
                RANK() OVER (ORDER BY 
                    (CountCharacter(Word.word, '{mission}')) DESC,
                    CHAR_LENGTH(Word.word) DESC)
                AS ranking,
                checked
                FROM word
                {subjectSet}
                WHERE {rangeSet}
                {options}
                LIMIT 1000;
            """

        elif shMisType == 'score':
            if not rangeSet:
                rangeSet = f"""
                (
                    Word.word LIKE '{front_initial1}%' OR
                    Word.word LIKE '{front_initial2}%'
                )
            """

            sql = f"""
                SELECT
                Word.word,
                CAST(calculate_value(Word.word, '{mission}', 1, {count}) AS SIGNED)
                score,
                checked
                FROM Word
                {subjectSet}
                WHERE {rangeSet}
                {options}
                ORDER BY score DESC
                LIMIT 10;
            """
        elif shMisType == 'value':
            if not rangeSet:
                rangeSet = f"""
                (
                    Word.word LIKE '{front_initial1}%' OR
                    Word.word LIKE '{front_initial2}%'
                )
            """

            sql = f"""
                WITH SelectedWords AS (
                SELECT
                    word,
                    RIGHT(Word.word, 1) AS last_char,
                    CAST(calculate_value(Word.word, '{mission}', 1, {count}) AS SIGNED) AS score,
                    checked
                FROM word
                {subjectSet}
                WHERE {rangeSet}
                {options}
                ORDER BY score DESC
                LIMIT 10
            )
            SELECT 
            SelectedWords.word,
            SelectedWords.score - (
                SELECT
                CAST(GREATEST(
                    calculate_value(Word.word, '가', 1, {count}),
                    calculate_value(Word.word, '나', 1, {count}),
                    calculate_value(Word.word, '다', 1, {count}),
                    calculate_value(Word.word, '라', 1, {count}),
                    calculate_value(Word.word, '마', 1, {count}),
                    calculate_value(Word.word, '바', 1, {count}),
                    calculate_value(Word.word, '사', 1, {count}),
                    calculate_value(Word.word, '아', 1, {count}),
                    calculate_value(Word.word, '자', 1, {count}),
                    calculate_value(Word.word, '차', 1, {count}),
                    calculate_value(Word.word, '카', 1, {count}),
                    calculate_value(Word.word, '타', 1, {count}),
                    calculate_value(Word.word, '파', 1, {count}),
                    calculate_value(Word.word, '하', 1, {count})
                ) AS SIGNED) AS max_score
                FROM 
                    Word
                {subjectSet}
                WHERE 
                    Word.word LIKE CONCAT(last_char, '%')
                ORDER BY 
                    max_score DESC
                LIMIT 1
            ) as value,
            SelectedWords.checked
            FROM SelectedWords
            ORDER BY value DESC;
            """
            
        elif shMisType == 'theory':
            if not rangeSet:
                rangeSet = f"""
                (
                    LEFT(Word.word, {len(front_initial1)}) = '{front_initial1}'
                    OR LEFT(Word.word, {len(front_initial1)}) = '{front_initial2}'
                )
            """

            sql = f"""
                SELECT
                Word.word,
                (CountCharacter(Word.word, '{mission}'))
                AS mission,
                RANK() OVER (ORDER BY 
                    (CountCharacter(Word.word, '{mission}')) DESC,
                    CHAR_LENGTH(Word.word) DESC)
                AS ranking,
                checked
                FROM word
                {subjectSet}
                WHERE {rangeSet}
                {options}
                LIMIT 10;
            """

        return sql
    
    def get_initial_data(self, back_initial):
        sql = f"""
            SELECT *
            FROM initialScore
            WHERE initial = '{back_initial}'
        """
    
        try:
            result = self.session.execute(text(sql)).fetchall()
            return result
        
        except Exception as e:
            print(f"Error: {e}")
            return ["문제가 발생하였습니다."]

    def get_calculated_value(self, count, back_initial, chain):
        if '가' <= back_initial <= '힣':
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
                    ), 1, {count}) AS SIGNED) AS max_score
                FROM 
                    Word
                WHERE 
                    word LIKE '{back_initial}%'
                    OR word LIKE CONCAT(getDoumChar('{back_initial}'), '%')
                ORDER BY 
                    max_score DESC
                LIMIT 1;
            """
        else:
            sql = f"""
                SELECT 
                    word,
                    CAST(GREATEST(
                        calculate_value(word, 'a', {chain}, {count}),
                        calculate_value(word, 'b', {chain}, {count}),
                        calculate_value(word, 'c', {chain}, {count}),
                        calculate_value(word, 'd', {chain}, {count}),
                        calculate_value(word, 'e', {chain}, {count}),
                        calculate_value(word, 'f', {chain}, {count}),
                        calculate_value(word, 'g', {chain}, {count}),
                        calculate_value(word, 'h', {chain}, {count}),
                        calculate_value(word, 'i', {chain}, {count}),
                        calculate_value(word, 'j', {chain}, {count}),
                        calculate_value(word, 'k', {chain}, {count}),
                        calculate_value(word, 'l', {chain}, {count}),
                        calculate_value(word, 'm', {chain}, {count}),
                        calculate_value(word, 'n', {chain}, {count}),
                        calculate_value(word, 'o', {chain}, {count}),
                        calculate_value(word, 'p', {chain}, {count}),
                        calculate_value(word, 'q', {chain}, {count}),
                        calculate_value(word, 'r', {chain}, {count}),
                        calculate_value(word, 's', {chain}, {count}),
                        calculate_value(word, 't', {chain}, {count}),
                        calculate_value(word, 'u', {chain}, {count}),
                        calculate_value(word, 'v', {chain}, {count}),
                        calculate_value(word, 'w', {chain}, {count}),
                        calculate_value(word, 'x', {chain}, {count}),
                        calculate_value(word, 'y', {chain}, {count}),
                        calculate_value(word, 'z', {chain}, {count})
                    ) AS SIGNED) AS max_score
                FROM 
                    Word
                WHERE 
                    word LIKE '{back_initial}%'
                    OR word LIKE CONCAT(getDoumChar('{back_initial}'), '%')
                ORDER BY 
                    max_score DESC
                LIMIT 1;
            """
    
        try:
            result = self.session.execute(text(sql)).fetchall()

            if result == []:
                self.saveBackWordScore(back_initial, 0)
            else:
                self.saveBackWordScore(back_initial, result[0][1])
            return result

        except Exception as e:
            print(f"Error: {e}")
            return ["문제가 발생하였습니다."]  

    def saveBackWordScore(self, back_initial, score):
        sql = f"""
            INSERT INTO initialScore
            VALUES('{back_initial}', '{score}')
        """

        try:
            result = self.session.execute(text(sql))
            self.session.commit()
            print(f"Rows affected: {result}")
        except Exception as e:
            self.session.rollback()
            print(f"Error: {e}")
     
    def removeBackWordScore(self, back_initial):
        sql = f"""
            DELETE FROM initialScore
            WHERE word = '{back_initial}'
        """

        try:
            result = self.session.execute(text(sql))
            self.session.commit()
            print(f"Rows affected: {result}")
        except Exception as e:
            self.session.rollback()
            print(f"Error: {e}")

    def getBackInitials(self, rangeSet, options):
        sql = f"""
            SELECT RIGHT(word, 1)
            FROM word
            WHERE {rangeSet}
            {options}
        """

        try:
            result = self.session.execute(text(sql)).fetchall()
            return result

        except Exception as e:
            print(f"Error: {e}")
            return ["문제가 발생하였습니다."]

    def valueMission(self, count, front_initial1, front_initial2, mission, rangeSet, options, subjectSet):
        chain = 1

        if not rangeSet:
            rangeSet = f"""
            (
                LEFT(word, {len(front_initial1)}) = '{front_initial1}'
                OR LEFT(word, {len(front_initial1)}) = '{front_initial2}'
            )
        """

        result = self.getBackInitials(rangeSet, options)
        
        rsList = {}
        
        for back_initial in result:
            back_initial = back_initial[0]
            res = self.get_initial_data(back_initial)

            if res != []:
                rsList[back_initial] = res[0][1]
            else:
                rs = self.get_calculated_value(count, back_initial, chain)
                
                if rs == []:
                    rsList[back_initial] = 0
                else:
                    rsList[back_initial] = rs[0][1]

        sql = f"""
            SELECT
                word,
                CAST(calculate_value(word, '{mission}', 1, {count}) AS SIGNED) AS score,
                RIGHT(word, 1) AS last_char,
                checked,
                getDoumChar(RIGHT(word, 1)) AS doum_char
            FROM word
            {subjectSet}
            WHERE {rangeSet}
            {options}
        """

        res = []
        
        try:
            res = self.session.execute(text(sql)).fetchall()
        
        except Exception as e:
            print(f"Error: {e}")
            return ["문제가 발생하였습니다."]

        for i in range(len(res) - 1, -1, -1):
            resultValue = res[i]
            if rsList[resultValue[2]] == 0:
                del res[i]
            else:
                resultValue = list(resultValue)
                resultValue[1] -= rsList[resultValue[2]]
                resultValue[0] += "(-" + str(rsList[resultValue[2]]) + ")"
                res[i] = tuple(resultValue)

        return sorted(res, key=lambda x: x[1], reverse=True)
    
    def allMission(self, front_initial1, front_initial2, rangeSet, tier, options, subjectSet):
        if not rangeSet:
            rangeSet = f"""
            (
                LEFT(word, {len(front_initial1)}) = '{front_initial1}'
                OR LEFT(word, {len(front_initial1)}) = '{front_initial2}'
            )
        """

        if 'a' <= front_initial1 <= 'z':
            sql = f"""
                WITH CountMissions AS (
                    SELECT word, 'a' AS mission_letter, CountCharacter(word, 'a') AS letter_count, CHAR_LENGTH(Word.word) AS word_length, checked FROM word
                    {subjectSet}
                    WHERE {rangeSet} {options}
                    UNION ALL
                    SELECT word, 'b', CountCharacter(word, 'b'), CHAR_LENGTH(Word.word), checked FROM word
                    {subjectSet}
                    WHERE {rangeSet} {options}
                    UNION ALL
                    SELECT word, 'c', CountCharacter(word, 'c'), CHAR_LENGTH(Word.word), checked FROM word
                    {subjectSet}
                    WHERE {rangeSet} {options}
                    UNION ALL
                    SELECT word, 'd', CountCharacter(word, 'd'), CHAR_LENGTH(Word.word), checked FROM word
                    {subjectSet}
                    WHERE {rangeSet} {options}
                    UNION ALL
                    SELECT word, 'e', CountCharacter(word, 'e'), CHAR_LENGTH(Word.word), checked FROM word
                    {subjectSet}
                    WHERE {rangeSet} {options}
                    UNION ALL
                    SELECT word, 'f', CountCharacter(word, 'f'), CHAR_LENGTH(Word.word), checked FROM word
                    {subjectSet}
                    WHERE {rangeSet} {options}
                    UNION ALL
                    SELECT word, 'g', CountCharacter(word, 'g'), CHAR_LENGTH(Word.word), checked FROM word
                    {subjectSet}
                    WHERE {rangeSet} {options}
                    UNION ALL
                    SELECT word, 'h', CountCharacter(word, 'h'), CHAR_LENGTH(Word.word), checked FROM word
                    {subjectSet}
                    WHERE {rangeSet} {options}
                    UNION ALL
                    SELECT word, 'i', CountCharacter(word, 'i'), CHAR_LENGTH(Word.word), checked FROM word
                    {subjectSet}
                    WHERE {rangeSet} {options}
                    UNION ALL
                    SELECT word, 'j', CountCharacter(word, 'j'), CHAR_LENGTH(Word.word), checked FROM word
                    {subjectSet}
                    WHERE {rangeSet} {options}
                    UNION ALL
                    SELECT word, 'k', CountCharacter(word, 'k'), CHAR_LENGTH(Word.word), checked FROM word
                    {subjectSet}
                    WHERE {rangeSet} {options}
                    UNION ALL
                    SELECT word, 'l', CountCharacter(word, 'l'), CHAR_LENGTH(Word.word), checked FROM word
                    {subjectSet}
                    WHERE {rangeSet} {options}
                    UNION ALL
                    SELECT word, 'm', CountCharacter(word, 'm'), CHAR_LENGTH(Word.word), checked FROM word
                    {subjectSet}
                    WHERE {rangeSet} {options}
                    UNION ALL
                    SELECT word, 'n', CountCharacter(word, 'n'), CHAR_LENGTH(Word.word), checked FROM word
                    {subjectSet}
                    WHERE {rangeSet} {options}
                    UNION ALL
                    SELECT word, 'o', CountCharacter(word, 'o'), CHAR_LENGTH(Word.word), checked FROM word
                    {subjectSet}
                    WHERE {rangeSet} {options}
                    UNION ALL
                    SELECT word, 'p', CountCharacter(word, 'p'), CHAR_LENGTH(Word.word), checked FROM word
                    {subjectSet}
                    WHERE {rangeSet} {options}
                    UNION ALL
                    SELECT word, 'q', CountCharacter(word, 'q'), CHAR_LENGTH(Word.word), checked FROM word
                    {subjectSet}
                    WHERE {rangeSet} {options}
                    UNION ALL
                    SELECT word, 'r', CountCharacter(word, 'r'), CHAR_LENGTH(Word.word), checked FROM word
                    {subjectSet}
                    WHERE {rangeSet} {options}
                    UNION ALL
                    SELECT word, 's', CountCharacter(word, 's'), CHAR_LENGTH(Word.word), checked FROM word
                    {subjectSet}
                    WHERE {rangeSet} {options}
                    UNION ALL
                    SELECT word, 't', CountCharacter(word, 't'), CHAR_LENGTH(Word.word), checked FROM word
                    {subjectSet}
                    WHERE {rangeSet} {options}
                    UNION ALL
                    SELECT word, 'u', CountCharacter(word, 'u'), CHAR_LENGTH(Word.word), checked FROM word
                    {subjectSet}
                    WHERE {rangeSet} {options}
                    UNION ALL
                    SELECT word, 'v', CountCharacter(word, 'v'), CHAR_LENGTH(Word.word), checked FROM word
                    {subjectSet}
                    WHERE {rangeSet} {options}
                    UNION ALL
                    SELECT word, 'w', CountCharacter(word, 'w'), CHAR_LENGTH(Word.word), checked FROM word
                    {subjectSet}
                    WHERE {rangeSet} {options}
                    UNION ALL
                    SELECT word, 'x', CountCharacter(word, 'x'), CHAR_LENGTH(Word.word), checked FROM word
                    {subjectSet}
                    WHERE {rangeSet} {options}
                    UNION ALL
                    SELECT word, 'y', CountCharacter(word, 'y'), CHAR_LENGTH(Word.word), checked FROM word
                    {subjectSet}
                    WHERE {rangeSet} {options}
                    UNION ALL
                    SELECT word, 'z', CountCharacter(word, 'z'), CHAR_LENGTH(Word.word), checked FROM word
                    {subjectSet}
                    WHERE {rangeSet} {options}
                ),
                RankedResults AS (
                    SELECT word, mission_letter, letter_count, word_length, checked, 
                        ROW_NUMBER() OVER (PARTITION BY mission_letter ORDER BY letter_count DESC, word_length DESC) AS ranks 
                    FROM CountMissions
                )
                SELECT word, mission_letter FROM RankedResults WHERE ranks = {tier}
            """

        elif '가' <= front_initial1 <= '힣':
            sql = f"""
                WITH CountMissions AS (
                    SELECT word, '가' AS mission_letter, CountCharacter(word, '가') AS letter_count, CHAR_LENGTH(Word.word) AS word_length, checked FROM word
                    {subjectSet}
                    WHERE {rangeSet} {options}
                    UNION ALL
                    SELECT word, '나', CountCharacter(word, '나'), CHAR_LENGTH(Word.word), checked FROM word
                    {subjectSet}
                    WHERE {rangeSet} {options}
                    UNION ALL
                    SELECT word, '다', CountCharacter(word, '다'), CHAR_LENGTH(Word.word), checked FROM word
                    {subjectSet}
                    WHERE {rangeSet} {options}
                    UNION ALL
                    SELECT word, '라', CountCharacter(word, '라'), CHAR_LENGTH(Word.word), checked FROM word
                    {subjectSet}
                    WHERE {rangeSet} {options}
                    UNION ALL
                    SELECT word, '마', CountCharacter(word, '마'), CHAR_LENGTH(Word.word), checked FROM word
                    {subjectSet}
                    WHERE {rangeSet} {options}
                    UNION ALL
                    SELECT word, '바', CountCharacter(word, '바'), CHAR_LENGTH(Word.word), checked FROM word
                    {subjectSet}
                    WHERE {rangeSet} {options}
                    UNION ALL
                    SELECT word, '사', CountCharacter(word, '사'), CHAR_LENGTH(Word.word), checked FROM word
                    {subjectSet}
                    WHERE {rangeSet} {options}
                    UNION ALL
                    SELECT word, '아', CountCharacter(word, '아'), CHAR_LENGTH(Word.word), checked FROM word
                    {subjectSet}
                    WHERE {rangeSet} {options}
                    UNION ALL
                    SELECT word, '자', CountCharacter(word, '자'), CHAR_LENGTH(Word.word), checked FROM word
                    {subjectSet}
                    WHERE {rangeSet} {options}
                    UNION ALL
                    SELECT word, '차', CountCharacter(word, '차'), CHAR_LENGTH(Word.word), checked FROM word
                    {subjectSet}
                    WHERE {rangeSet} {options}
                    UNION ALL
                    SELECT word, '카', CountCharacter(word, '카'), CHAR_LENGTH(Word.word), checked FROM word
                    {subjectSet}
                    WHERE {rangeSet} {options}
                    UNION ALL
                    SELECT word, '타', CountCharacter(word, '타'), CHAR_LENGTH(Word.word), checked FROM word
                    {subjectSet}
                    WHERE {rangeSet} {options}
                    UNION ALL
                    SELECT word, '파', CountCharacter(word, '파'), CHAR_LENGTH(Word.word), checked FROM word
                    {subjectSet}
                    WHERE {rangeSet} {options}
                    UNION ALL
                    SELECT word, '하', CountCharacter(word, '하'), CHAR_LENGTH(Word.word), checked FROM word
                    {subjectSet}
                    WHERE {rangeSet} {options}
                ),
                RankedResults AS (
                    SELECT word, mission_letter, letter_count, word_length, checked, 
                        ROW_NUMBER() OVER (PARTITION BY mission_letter ORDER BY letter_count DESC, word_length DESC) AS ranks 
                    FROM CountMissions
                )
                SELECT word, mission_letter FROM RankedResults WHERE ranks = {tier}
            """

        return sql

    def villain(self, front_initial1, front_initial2, back_word, rangeSet, options, subjectSet):
        if not rangeSet:
            rangeSet = f"""
                (
                    Word.word LIKE '{front_initial1}%{back_word}' OR
                    Word.word LIKE '{front_initial2}%{back_word}'
                )
            """

        sql = f"""
                SELECT *
                FROM word
                {subjectSet}
                WHERE {rangeSet}
                {options}
                AND CHAR_LENGTH(Word.word) <> 1
                ORDER BY LEFT(Word.word, {len(front_initial1)}) ASC, CHAR_LENGTH(Word.word) DESC
                LIMIT 10000
            """
        
        return sql

    def protect(self, front_initial1, front_initial2, rangeSet, options, subjectSet):
        if not rangeSet:
            rangeSet = f"""
                (
                    Word.word LIKE '%{front_initial1}%' OR
                    Word.word LIKE '%{front_initial2}%'
                )
            """

        sql = f"""
                SELECT *
                FROM Word
                {subjectSet}
                WHERE {rangeSet}
                {options}
                AND CHAR_LENGTH(Word.word) <> 1
                ORDER BY CHAR_LENGTH(Word.word) DESC
                LIMIT 1000
            """
        
        return sql
        
    def long(self, front_initial1, front_initial2, rangeSet, options, subjectSet):
        if not rangeSet:
            rangeSet = f"""
                (
                    Word.word LIKE '{front_initial1}%' OR
                    Word.word LIKE '{front_initial2}%'
                )
            """

        sql = f"""
                SELECT *
                FROM Word
                {subjectSet}
                WHERE {rangeSet}
                {options}
                AND CHAR_LENGTH(Word.word) > 8
                ORDER BY CHAR_LENGTH(Word.word) DESC
                LIMIT 1000
            """
        
        return sql
    
    def precise_find_word(self, word):
        sql = """
        SELECT word, checked
        FROM word
{subjectSet}
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

        sql = f"""
            SELECT first_letter_count('{word[0]}')
        """

        count = self.session.execute(text(sql)).fetchall()
        count = count[0][0]
        
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
                CAST(GREATEST(
                    calculate_value(word, '가', {chain}, {count}),
                    calculate_value(word, '나', {chain}, {count}),
                    calculate_value(word, '다', {chain}, {count}),
                    calculate_value(word, '라', {chain}, {count}),
                    calculate_value(word, '마', {chain}, {count}),
                    calculate_value(word, '바', {chain}, {count}),
                    calculate_value(word, '사', {chain}, {count}),
                    calculate_value(word, '아', {chain}, {count}),
                    calculate_value(word, '자', {chain}, {count}),
                    calculate_value(word, '차', {chain}, {count}),
                    calculate_value(word, '카', {chain}, {count}),
                    calculate_value(word, '타', {chain}, {count}),
                    calculate_value(word, '파', {chain}, {count}),
                    calculate_value(word, '하', {chain}, {count})
                ) AS SIGNED) AS max_score
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
                    calculate_value(word, 'a', {chain}, {count}),
                    calculate_value(word, 'b', {chain}, {count}),
                    calculate_value(word, 'c', {chain}, {count}),
                    calculate_value(word, 'd', {chain}, {count}),
                    calculate_value(word, 'e', {chain}, {count}),
                    calculate_value(word, 'f', {chain}, {count}),
                    calculate_value(word, 'g', {chain}, {count}),
                    calculate_value(word, 'h', {chain}, {count}),
                    calculate_value(word, 'i', {chain}, {count}),
                    calculate_value(word, 'j', {chain}, {count}),
                    calculate_value(word, 'k', {chain}, {count}),
                    calculate_value(word, 'l', {chain}, {count}),
                    calculate_value(word, 'm', {chain}, {count}),
                    calculate_value(word, 'n', {chain}, {count}),
                    calculate_value(word, 'o', {chain}, {count}),
                    calculate_value(word, 'p', {chain}, {count}),
                    calculate_value(word, 'q', {chain}, {count}),
                    calculate_value(word, 'r', {chain}, {count}),
                    calculate_value(word, 's', {chain}, {count}),
                    calculate_value(word, 't', {chain}, {count}),
                    calculate_value(word, 'u', {chain}, {count}),
                    calculate_value(word, 'v', {chain}, {count}),
                    calculate_value(word, 'w', {chain}, {count}),
                    calculate_value(word, 'x', {chain}, {count}),
                    calculate_value(word, 'y', {chain}, {count}),
                    calculate_value(word, 'z', {chain}, {count})
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
        words = dto['word'].splitlines()
        rio = dto['rio']
        kkuko = dto['kkuko']

        sql = text(f"INSERT IGNORE INTO Word VALUES (:word, 0, '', 1, {rio}, {kkuko})")

        try:
            result = self.session.execute(
              sql,
              [
                {'word': w}
                for w in zip(words)
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
        words = word.splitlines()

        sql = text("DELETE FROM word WHERE word = (:word)")

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
        
    def insert_subject(self, dto):
        words = dto['word']
        subject = dto['subject']

        sql = text(f"INSERT IGNORE INTO WordSubject VALUES (:word, :subject)")

        try:
            self.session.execute(
              sql,
              [
                {'word': w, 'subject': s}
                for w, s in zip(words, subject)
              ]
            )
            self.session.commit()
            return ["success", f"주제가 성공적으로 추가되었습니다."]
        except Exception as e:
            self.session.rollback()
            print(f"Error: {e}")
            return ["error", "문제가 발생하였습니다."]
        
    def delete_subject(self, dto):
        words = dto['word']
        subject = dto['subject']

        sql = text(f"DELETE FROM WordSubject WHERE word = :word AND subject = :subject")

        try:
            for w, s in zip(words, subject):
                self.session.execute(sql, {'word': w, 'subject': s})

            self.session.commit()
            return ["success", f"주제가 성공적으로 삭제되었습니다."]
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
{subjectSet}
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
                    CHAR_LENGTH(Word.word) DESC)
                AS ranking
                FROM word
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
        AND (kkuko = true OR (kkuko = true AND rio = true))
        AND CHAR_LENGTH(Word.word) > 1
        """

        try:
            result = self.session.execute(text(sql)).fetchall()
            print(result)
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
        
    def rare_box(self, dto):
        pieces = dto.piece
        highPieces = dto.highPiece
        rarePieces = dto.rarePiece

        highPiecesSetting = ""
        rarePiecesSetting = ""
        elementPieceSetting = ""

        pieceList = ""

        for piece in highPieces:
            pieceItem = piece[0] # 글자 조각
            pieceCount = piece[1] # 개수

            pieceList += pieceItem

            if highPiecesSetting == "":
                highPiecesSetting = f"""
                    (CHAR_LENGTH(word) - CHAR_LENGTH(REPLACE(word, '{pieceItem}', '')))
                """
            else:
                highPiecesSetting += f""" +
                    (CHAR_LENGTH(word) - CHAR_LENGTH(REPLACE(word, '{pieceItem}', '')))
                """

            elementPieceSetting += f"""
                AND (CHAR_LENGTH(word) - CHAR_LENGTH(REPLACE(word, '{pieceItem}', '')) <= {pieceCount})
            """

        for piece in rarePieces:
            pieceItem = piece[0] # 글자 조각
            pieceCount = piece[1] # 개수

            pieceList += pieceItem

            if rarePiecesSetting == "":
                rarePiecesSetting = f"""
                    (CHAR_LENGTH(word) - CHAR_LENGTH(REPLACE(word, '{pieceItem}', '')))
                """
            else:
                rarePiecesSetting += f""" +
                    (CHAR_LENGTH(word) - CHAR_LENGTH(REPLACE(word, '{pieceItem}', '')))
                """

            elementPieceSetting += f"""
                AND (CHAR_LENGTH(word) - CHAR_LENGTH(REPLACE(word, '{pieceItem}', '')) <= {pieceCount})
            """

        for piece in pieces:
            pieceItem = piece[0] # 글자 조각
            pieceCount = piece[1] # 개수

            pieceList += pieceItem

            elementPieceSetting += f"""
                AND (CHAR_LENGTH(word) - CHAR_LENGTH(REPLACE(word, '{pieceItem}', '')) <= {pieceCount})
            """

        if rarePiecesSetting == "": rarePiecesSetting = 0
        if highPiecesSetting == "": highPiecesSetting = 0
          
        sql = f"""
            SELECT word
            FROM Word
            WHERE CHAR_LENGTH(word) = 6
            AND word REGEXP '^[{pieceList}]*$'
            {elementPieceSetting}
            AND
            (
                (
                    -- 고급 글자가 4개인 경우
                    {highPiecesSetting}
                    >= 4
                )
                OR
                ( -- 희귀 글자가 1개이고 고급 글자가 2개인 경우
                    (
                        {rarePiecesSetting}
                    ) >= 1
                    AND 
                    (
                        {highPiecesSetting}
                    ) >= 2
                )
                OR
                ( -- 희귀 글자가 2개일 경우
                    (
                        {rarePiecesSetting}
                    ) >= 2
                )
            );
        """

        result = self.session.execute(text(sql)).fetchall()
        return result
        
    def find_word_by_piece(self, dto):
        pieces = dto.piece

        if len(self.rare_box(dto)) != 0:
            return result
        
        if len(pieces) <= 300:
            pieceList = ""

            sql = f"""
                SELECT word
                FROM word
            """ 

            pieceSetting = ""

            for piece in pieces:
                pieceItem = piece[0]
                pieceCount = piece[1]

                pieceList += pieceItem

                pieceSetting += f"""
                    AND CHAR_LENGTH(word) - CHAR_LENGTH(REPLACE(word, '{pieceItem}', '')) BETWEEN 0 AND {pieceCount}
                """

            sql += f"""
                WHERE word REGEXP '^[{pieceList}]*$'
            """

            sql += pieceSetting

            sql += f"""
                AND CHAR_LENGTH(word) <= 6
                ORDER BY CHAR_LENGTH(word) DESC
            """

            try:
                result = self.session.execute(text(sql)).fetchall()
                return result
            except Exception as e:
                self.session.rollback()
                print(f"Error: {e}")
                return ["error", "문제가 발생하였습니다."]
                
        else:
            sql = f"""
            SELECT word
            FROM word
            WHERE CHAR_LENGTH(word) <= 6"""
        
            try:
                result = self.session.execute(text(sql)).fetchall()
            except Exception as e:
                self.session.rollback()
                print(f"Error: {e}")
                return ["error", "문제가 발생하였습니다."]
            
            passedWords = []
            pieceDict = {}

            for piece in pieces:
                pieceDict[piece[0]] = piece[1]
            
            for word in result:
                word = word[0]

                charCount = Counter(word)

                check = True

                for char, count in charCount.items():
                    if char not in pieceDict or pieceDict[char] < count:
                        check = False
                        break

                if check == True:
                    passedWords.append(word)

            return passedWords