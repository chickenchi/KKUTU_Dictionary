from flask import jsonify, render_template, request, redirect, url_for, Blueprint
from services.initial_service import InitialService

initial_blueprint = Blueprint('init', __name__)
initial_service = InitialService()

@initial_blueprint.route('/attack_add', methods=["POST"])
def add_initial():
    initial = request.json['initial']
    return jsonify(initial_service.add_initial(initial))

@initial_blueprint.route('/attack_pull', methods=["POST"])
def pull_initial():
    initial = request.json['initial']
    return jsonify(initial_service.pull_initial(initial))

@initial_blueprint.route('/recommend_attack_add', methods=["POST"])
def recommend_add_initial():
    initial = request.json['initial']
    return jsonify(initial_service.recommend_add_initial(initial))

@initial_blueprint.route('/recommend_attack_pull', methods=["POST"])
def recommend_pull_initial():
    initial = request.json['initial']
    return jsonify(initial_service.recommend_pull_initial(initial))