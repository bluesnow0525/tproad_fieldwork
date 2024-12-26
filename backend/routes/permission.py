import sys
import os

# 將上層目錄加入 sys.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from flask import Blueprint, jsonify, request
from database.models import MenuPermission
from database.extensions import db
from datetime import datetime
from sqlalchemy.exc import SQLAlchemyError

permission_bp = Blueprint('permission', __name__)

@permission_bp.route('/read', methods=['GET'])
def read_permission():
    try:
        # 從資料庫取得所有資料
        results = db.session.query(MenuPermission).all()

        # 格式化資料
        formatted_data = []
        for row in results:
            formatted_data.append({
                "msid": row.msid,
                "roleName": row.mstitle,
                "operator": row.bmodid,
                "lastModifiedTime": row.bmoddate.strftime("%Y/%m/%d %H:%M:%S") if row.bmoddate else ""
            })

        return jsonify(formatted_data), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@permission_bp.route('/write', methods=['POST'])
def write_permission():
    data = request.json
    if not data:
        return jsonify({"error": "請提供有效的 JSON 資料"}), 400

    try:
        msid = data.get("msid")
        record = db.session.query(MenuPermission).filter_by(msid=msid).first()

        if record:  # 更新
            record.mstitle = data.get("roleName")
            record.bmodid = data.get("operator", "system")
            record.bmoddate = datetime.now()
        else:  # 新增
            new_record = MenuPermission(
                msid=msid,
                mstitle=data.get("roleName"),
                comid="Taipei",  # 固定值
                bmodid=data.get("operator", "system"),
                bmoddate=datetime.now()
            )
            db.session.add(new_record)

        db.session.commit()
        return jsonify({"message": "資料已成功儲存"}), 200

    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({"error": f"資料庫錯誤: {str(e)}"}), 500

@permission_bp.route('/delete', methods=['POST'])
def delete_permission():
    data = request.json
    if not data or "emid" not in data:  # 前端使用 emid 傳值，但實際上是 msid
        return jsonify({"error": "請提供要刪除的權限代碼"}), 400

    try:
        msids = data["emid"]
        if not isinstance(msids, list):
            msids = [msids]

        # 刪除指定的記錄
        deleted_count = db.session.query(MenuPermission).filter(
            MenuPermission.msid.in_(msids)
        ).delete(synchronize_session='fetch')

        if deleted_count == 0:
            return jsonify({"error": "找不到要刪除的記錄"}), 404

        db.session.commit()
        return jsonify({"message": "資料已成功刪除"}), 200

    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({"error": f"資料庫錯誤: {str(e)}"}), 500