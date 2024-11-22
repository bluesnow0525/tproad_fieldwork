import sys
import os

# 將上層目錄加入 sys.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from flask import Blueprint, jsonify, request
from database.db_read import DB_read
from database.db_write import DB_write
from database.extensions import db

reportdata_bp = Blueprint('reportdata', __name__)

@reportdata_bp.route('/read', methods=['GET'])
def get_reportdata():
    operator = DB_read(db.session)
    raw_data = operator.select_all("reportdata")
    formatted_data = operator.format_report_data(raw_data)
    return jsonify(formatted_data)

@reportdata_bp.route('/write', methods=['POST'])
def write_reportdata():
    data = request.json
    if not data:
        return jsonify({"error": "請提供有效的 JSON 資料"}), 400

    try:
        operator = DB_write(db.session)
        operator.write_reportdata(data)
        return jsonify({"message": "ReportData 資料已成功寫入"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
