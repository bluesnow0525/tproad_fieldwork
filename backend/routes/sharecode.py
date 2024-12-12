import sys
import os

# 將上層目錄加入 sys.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from flask import Blueprint, jsonify, request
from database.models import SharedCode
from database.extensions import db
from datetime import datetime
from sqlalchemy.exc import SQLAlchemyError

sharedcode_bp = Blueprint('sharedcode', __name__)

@sharedcode_bp.route('/read', methods=['GET'])
def read_shared_code():
    try:
        results = db.session.query(SharedCode).all()
        
        # 將資料庫資料轉換為前端格式
        formatted_data = [
            {
                "id": row.cid,
                "usable": "是" if row.ifuse.lower() == "y" else "否",
                "order": row.corder,
                "categoryCode": row.chkclass,
                "categoryName": row.chkclasstitle,
                "sharedCode": row.chkcode,
                "codeName": row.chkitem,
                "modifier": row.bmodid,
                "modifyDate": row.bmoddate.strftime("%Y/%m/%d %H:%M:%S") if row.bmoddate else None
            }
            for row in results
        ]

        return jsonify(formatted_data), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@sharedcode_bp.route('/write', methods=['POST'])
def write_shared_code():
    data = request.json
    if not data:
        return jsonify({"error": "請提供有效的 JSON 資料"}), 400

    try:
        # 將前端資料轉換為資料庫格式
        db_data = {
            "ifuse": "y" if data.get("usable") == "是" else "n",
            "corder": data.get("order"),
            "chkclass": data.get("categoryCode"),
            "chkclasstitle": data.get("categoryName"),
            "chkcode": data.get("sharedCode"),
            "chkitem": data.get("codeName"),
            "bmodid": data.get("modifier", "system"),
            "bmoddate": datetime.utcnow()
        }

        # 判斷是新增或更新
        cid = data.get("id")
        if cid:  # 更新
            record = db.session.query(SharedCode).filter_by(cid=cid).first()
            if record:
                for key, value in db_data.items():
                    setattr(record, key, value)
            else:
                return jsonify({"error": f"找不到 ID {cid} 的記錄"}), 404
        else:  # 新增
            new_record = SharedCode(**db_data)
            db.session.add(new_record)

        db.session.commit()
        return jsonify({"message": "資料已成功儲存"}), 200

    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({"error": f"資料庫錯誤: {str(e)}"}), 500
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@sharedcode_bp.route('/delete', methods=['POST'])
def delete_shared_code():
    data = request.json
    if not data or not data.get("ids"):
        return jsonify({"error": "請提供要刪除的 ID 列表"}), 400

    try:
        ids_to_delete = data.get("ids")
        if not isinstance(ids_to_delete, list):
            return jsonify({"error": "ID 列表格式不正確"}), 400

        # 刪除指定記錄
        records = db.session.query(SharedCode).filter(SharedCode.cid.in_(ids_to_delete)).all()
        if not records:
            return jsonify({"error": "找不到要刪除的記錄"}), 404

        for record in records:
            db.session.delete(record)

        db.session.commit()
        return jsonify({"message": "資料已成功刪除"}), 200

    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({"error": f"資料庫錯誤: {str(e)}"}), 500