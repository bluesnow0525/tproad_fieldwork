import sys
import os

# 將上層目錄加入 sys.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from flask import Blueprint, jsonify, request
from datetime import datetime
from database.db_read import DB_read
from database.db_write import DB_write
from database.extensions import db

caseinfor_bp = Blueprint('caseinfor', __name__)

@caseinfor_bp.route('/read', methods=['POST'])
def get_caseinfor():
    data = request.json
    start_date = data.get('startDate')
    end_date = data.get('endDate')

    if not start_date or not end_date:
        return jsonify({"error": "startDate 和 endDate 是必填參數"}), 400

    try:
        start_date = datetime.strptime(start_date, "%Y-%m-%d")
        end_date = datetime.strptime(end_date, "%Y-%m-%d")
    except ValueError:
        return jsonify({"error": "日期格式錯誤，請使用 YYYY-MM-DD"}), 400

    operator = DB_read(db.session)
    raw_data = operator.select_within_date_range(
        table_name="caseinfor",
        date_column="cadate",
        start_date=start_date,
        end_date=end_date,
    )
    formatted_data = operator.format_caseinfor_data(raw_data)
    return jsonify(formatted_data)

@caseinfor_bp.route('/write', methods=['POST'])
def write_caseinfor():
    data = request.json  # 接收 JSON 資料
    if not data:
        return jsonify({"error": "請提供有效的 JSON 資料"}), 400

    # 如果是單筆資料，包裝成列表
    if isinstance(data, dict):
        data = [data]

    try:
        operator = DB_write(db.session)

        # 迴圈處理每一筆資料
        for record in data:
            operator.write_caseinfor(record)

        return jsonify({"message": f"共 {len(data)} 筆 CaseInfor 資料已成功寫入"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

