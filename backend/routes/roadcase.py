import sys
import os

# 將上層目錄加入 sys.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from flask import Blueprint, jsonify, request
from database.db_read import DB_read
from database.models import RoadCase
from database.extensions import db
from datetime import datetime
from sqlalchemy.exc import SQLAlchemyError

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

    try:
        # 將前端資料轉換為資料庫格式
        db_data = unformat_roadcase_data(data)
        rcid = db_data.pop("rcid", None)

        if rcid:  # 更新操作
            record = db.session.query(RoadCase).filter_by(rcid=rcid).first()
            if record:
                for key, value in db_data.items():
                    setattr(record, key, value)
            else:
                return jsonify({"error": f"ID {rcid} 的記錄不存在，無法更新"}), 404
        else:  # 新增操作
            new_record = RoadCase(**db_data)
            db.session.add(new_record)

        db.session.commit()
        return jsonify({"message": "資料已成功寫入"}), 200

    except ValueError as ve:
        return jsonify({"error": f"資料格式錯誤: {str(ve)}"}), 400
    except SQLAlchemyError as sae:
        db.session.rollback()
        return jsonify({"error": f"資料庫錯誤: {str(sae)}"}), 500
    
@roadcase_bp.route('/delete', methods=['POST'])
def delete_roadcase():
    data = request.json  # 接收 JSON 資料
    if not data or not isinstance(data.get('rcid'), list):  # 確保 rcid 是列表
        return jsonify({"error": "請提供有效的 rcid 列表"}), 400

    rcid_list = data['rcid']

    try:
        # 刪除對應的 rcid 資料
        deleted_count = db.session.query(RoadCase).filter(RoadCase.rcid.in_(rcid_list)).delete(synchronize_session='fetch')

        if deleted_count == 0:
            return jsonify({"error": "未找到符合條件的資料，無法刪除"}), 404

        db.session.commit()
        return jsonify({"message": f"成功刪除 {deleted_count} 筆資料"}), 200

    except SQLAlchemyError as sae:
        db.session.rollback()
        return jsonify({"error": f"資料庫錯誤: {str(sae)}"}), 500

def unformat_roadcase_data(formatted_data):
    """
    將格式化的資料轉換回原本的資料庫欄位格式
    """
    mapped_data = {
        "rcid": formatted_data.get("rcid"),
        "rcstatus": "2" if formatted_data.get("status") == "啟用" else "1",
        "rcno": formatted_data.get("caseCode"),
        "rcname": formatted_data.get("caseName"),
        "rconame": formatted_data.get("vendor"),
        "rcsdate": datetime.strptime(formatted_data.get("contractStart"), "%Y/%m/%d")
        if formatted_data.get("contractStart") else None,
        "rcedate": datetime.strptime(formatted_data.get("contractEnd"), "%Y/%m/%d")
        if formatted_data.get("contractEnd") else None,
        "rcotel": formatted_data.get("contactPhone"),
        "bmodid": formatted_data.get("managerAccount"),
        "rcnote": formatted_data.get("notes"),
    }
    # 去掉值為 None 或空字串的項目
    return {k: v for k, v in mapped_data.items() if v not in [None, ""]}