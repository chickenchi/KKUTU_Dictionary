from flask import jsonify, render_template, request, redirect, url_for, Blueprint
from services.word_service import WordService
from dto.wordDTO import WordDTO
from dto.ureadDTO import UreadDTO
from dto.missionDTO import MissionDTO

word_blueprint = Blueprint('word', __name__)
word_service = WordService()

@word_blueprint.route('/word', methods=["POST"])
def find_word():
    dto = WordDTO(
        word=request.json['word'],
        type=request.json['type'],
        subject=request.json['subject'],
        mission=request.json['mission'],
        shMisType=request.json['shMisType'],
        backWord=request.json['backWord'],
        checklist=request.json.get('checklist', None),
        tier=request.json.get('tier', 1),
    )
    return jsonify(word_service.find_word(dto))

@word_blueprint.route('/precise_word', methods=["POST"])
def precise_find_word():
    word = request.json['word']
    return jsonify(word_service.precise_find_word(word))

@word_blueprint.route('/initial_max_score', methods=["POST"])
def initial_max_score():
    word = request.json['word']
    chain = request.json['chain']
    dto = {'word': word, 'chain': chain}
    return jsonify(word_service.initial_max_score(dto))

@word_blueprint.route('/insert', methods=["POST"])
def insert_word():
    word = request.json['word']
    subject = request.json['subject']
    dto = {'word': word, 'subject': subject}
    return word_service.insert_word(dto)

@word_blueprint.route('/delete', methods=["POST"])
def delete_word(): 
    return word_service.delete_word(request.json['word'])

@word_blueprint.route('/known', methods=["POST"])
def known_word(): 
    return word_service.known_word(request.json['word'], request.json['checked'])

@word_blueprint.route('/current_phrase', methods=["POST"])
def current_phrase():
    return jsonify(word_service.current_phrase(request.json['word']))

@word_blueprint.route('/reme_phrase', methods=["POST"])
def remember_phrase():
    return word_service.remember_phrase(request.json['word'], request.json['phrase'])

@word_blueprint.route('/uread', methods=["POST"])
def uread():
    dto = UreadDTO(
        words=request.json['words'],
        isRead=request.json['isRead']
    )
    return word_service.uread(dto)

@word_blueprint.route('/mission_word', methods=["POST"])
def mission_word():
    dto = MissionDTO(
        initial=request.json['initial'],
        shMisType=request.json['shMisType']
    )
    return jsonify(word_service.mission_word(dto))

# AttackPattern Workspace

@word_blueprint.route('/all_word', methods=["POST"])
def all_word():
    return jsonify(word_service.all_word())

@word_blueprint.route('/initial', methods=["POST"])
def initial():
    return jsonify(word_service.initial())