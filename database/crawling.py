from flask import Flask, jsonify
import requests

app = Flask(__name__)

@app.route('/api/data', methods=['GET'])
def get_data():
    try:
        response = requests.get('http://kkukowiki.kr/w/긴 단어/한국어/ㄱ')
        response.raise_for_status()

        # 응답의 Content-Type이 JSON이 아닐 수도 있으므로 확인

        print(response.text.split('<td><a href="/')[1].split('title="')[1].split('"')[0])

        wordList = ""

        i = 1
        while response.text.count('<td><a href="/') != i:
            wordList = wordList + " INSERT IGNORE INTO LONG_WORD VALUES('" + response.text.split('<td><a href="/')[i].split('title="')[1].split('"')[0].replace(" (없는 문서)", "") + "');"
            i += 1

        return wordList

    except requests.exceptions.RequestException as e:
        print("Request Exception:", str(e))
        return jsonify({"error": str(e)}), 500


if __name__ == '__main__':
    app.run(port=5000)

    # (<td><a href="/) (title=") / (")
