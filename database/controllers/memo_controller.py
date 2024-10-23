from flask import jsonify, render_template, request, redirect, url_for, Blueprint
from services.memo_service import MemoService
from dto.memoDTO import MemoDTO
from dto.submitDTO import SubmitDTO
from dto.rmMemoDTO import RmMemoDTO

memo_blueprint = Blueprint('memo', __name__)
memo_service = MemoService()

@memo_blueprint.route('/memo', methods=["POST"])
def search_memo():
    dto = MemoDTO(request.json['search'], request.json['type'], request.json['searchType'])
    return jsonify(memo_service.search_memo(dto))

@memo_blueprint.route('/submit', methods=["POST"])
def submit_memo():
    dto = SubmitDTO(request.json['title'], request.json['subtitle'], request.json['description'], request.json['index'])
    return jsonify(memo_service.submit_memo(dto))

@memo_blueprint.route('/remove', methods=["POST"])
def remove_memo():
    dto = RmMemoDTO(request.json['index'])
    return jsonify(memo_service.remove_memo(dto))

@memo_blueprint.route('/make', methods=["POST"])
def make_memo():
    type = request.json['type']
    return jsonify(memo_service.make_memo(type))