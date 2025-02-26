from flask import Flask, jsonify
import requests

app = Flask(__name__)

@app.route('/api/data', methods=['GET'])
def get_data():
    try:
        response = requests.get('https://www.db.yugioh-card.com/yugiohdb/card_search.action?ope=1&sess=3&page=1&stype=1&link_m=2&othercon=2&releaseYStart=1999&releaseMStart=1&releaseDStart=1&sort=1&rp=10')
        response.raise_for_status()

        # 응답의 Content-Type이 JSON이 아닐 수도 있으므로 확인

        print(response.text.split('<span class="card_name">')[1].split("</span>")[0])

        wordList = ""

        return wordList

    except requests.exceptions.RequestException as e:
        print("Request Exception:", str(e))
        return jsonify({"error": str(e)}), 500


if __name__ == '__main__':
    app.run(port=5000)

    # (<td><a href="/) (title=") / (")
