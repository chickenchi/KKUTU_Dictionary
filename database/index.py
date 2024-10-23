from flask import Flask
from flask_cors import CORS
from controllers.word_controller import word_blueprint
from controllers.memo_controller import memo_blueprint
from controllers.initial_controller import initial_blueprint

app = Flask(__name__)
CORS(app)

app.register_blueprint(word_blueprint)
app.register_blueprint(memo_blueprint)
app.register_blueprint(initial_blueprint)

if __name__ == '__main__':
    app.run(debug = True)