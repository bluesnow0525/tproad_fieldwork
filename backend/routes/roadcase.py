import sys
import os

# 將上層目錄加入 sys.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from flask import Blueprint, jsonify, request
from database.db_read import DB_read
from database.db_write import DB_write
from database.extensions import db
from datetime import datetime

roadcase_bp = Blueprint('roadcase', __name__)

@roadcase_bp.route('/read', methods=['GET'])
def get_roadcase():
    operator = DB_read(db.session)
    raw_data = operator.select_all("roadcase")
    formatted_data = operator.format_roadcase_data(raw_data)
    return jsonify(formatted_data)

@roadcase_bp.route('/write', methods=['POST'])
def write_roadcase():
    data = request.json  # 接收 JSON 資料
    if not data:
        return jsonify({"error": "請提供有效的 JSON 資料"}), 400
    print(data)
    return jsonify({"message": "更新成功"}), 200
