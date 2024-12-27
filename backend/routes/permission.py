<<<<<<< HEAD
import sys
import os

# 將上層目錄加入 sys.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from flask import Blueprint, jsonify, request
from database.models import MenuPermission
from database.models import SystemLog
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

    print(data)
    return jsonify({"message": "資料已成功儲存"}), 200

@permission_bp.route('/add', methods=['POST'])
def add_permission():
    data = request.json
    if not data:
        return jsonify({"error": "請提供有效的 JSON 資料"}), 400
    try:
        # 檢查必要欄位
        if not data.get('msid') or not data.get('roleName'):
            return jsonify({"error": "權限代碼和權限名稱為必填欄位"}), 400
        
        # 檢查權限代碼是否已存在
        existing_permission = MenuPermission.query.filter_by(msid=data['msid']).first()
        if existing_permission:
            return jsonify({"error": "權限代碼已存在"}), 400
        
        # 創建新的權限記錄
        new_permission = MenuPermission(
            msid=data['msid'],
            mstitle=data['roleName'],
            bmodid=data['operator'],
            comid='taipei',
            bmoddate=datetime.now()
        )
        
        # 將新記錄添加到資料庫
        db.session.add(new_permission)
        
        new_log = SystemLog(
                slaccount=data["operator"],        # 帳號
                sname='系統管理 > 選單權限管理',             # 姓名
                slevent=f"權限代碼:{data['msid']}，權限名稱:{data['roleName']}",         # 事件描述
                sodate=datetime.now(),      # 操作日期時間
                sflag='A'                   # 狀態標記
            )
        db.session.add(new_log)
            
        db.session.commit()
        
        return jsonify({"message": "新權限已成功新增"}), 200
        
    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({"error": f"資料庫錯誤: {str(e)}"}), 500
    except Exception as e:
        return jsonify({"error": str(e)}), 500

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
        records_to_delete = db.session.query(MenuPermission).filter(
            MenuPermission.msid.in_(msids)
        ).all()

        if not records_to_delete:
            return jsonify({"error": "找不到任何匹配的記錄"}), 404
        
        deleted_names = [record.mstitle for record in records_to_delete]
        delete_message = "、".join(deleted_names)

        # 刪除找到的所有記錄
        for record in records_to_delete:
            db.session.delete(record)
            
        new_log = SystemLog(
            slaccount=data.get("operator"),        # 帳號
            sname='系統管理 > 選單權限管理',             # 姓名
            slevent=f"刪除權限：{delete_message}",         # 事件描述
            sodate=datetime.now(),      # 操作日期時間
            sflag='D'                   # 狀態標記
        )
        db.session.add(new_log)

        db.session.commit()
        return jsonify({"message": "資料已成功刪除"}), 200

    except SQLAlchemyError as e:
        db.session.rollback()
=======
import sys
import os

# 將上層目錄加入 sys.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from flask import Blueprint, jsonify, request
from database.models import MenuPermission
from database.models import SystemLog
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

    print(data)
    return jsonify({"message": "資料已成功儲存"}), 200

@permission_bp.route('/add', methods=['POST'])
def add_permission():
    data = request.json
    if not data:
        return jsonify({"error": "請提供有效的 JSON 資料"}), 400
    try:
        # 檢查必要欄位
        if not data.get('msid') or not data.get('roleName'):
            return jsonify({"error": "權限代碼和權限名稱為必填欄位"}), 400
        
        # 檢查權限代碼是否已存在
        existing_permission = MenuPermission.query.filter_by(msid=data['msid']).first()
        if existing_permission:
            return jsonify({"error": "權限代碼已存在"}), 400
        
        # 創建新的權限記錄
        new_permission = MenuPermission(
            msid=data['msid'],
            mstitle=data['roleName'],
            bmodid=data['operator'],
            comid='taipei',
            bmoddate=datetime.now()
        )
        
        # 將新記錄添加到資料庫
        db.session.add(new_permission)
        
        new_log = SystemLog(
                slaccount=data["operator"],        # 帳號
                sname='系統管理 > 選單權限管理',             # 姓名
                slevent=f"權限代碼:{data['msid']}，權限名稱:{data['roleName']}",         # 事件描述
                sodate=datetime.now(),      # 操作日期時間
                sflag='A'                   # 狀態標記
            )
        db.session.add(new_log)
            
        db.session.commit()
        
        return jsonify({"message": "新權限已成功新增"}), 200
        
    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({"error": f"資料庫錯誤: {str(e)}"}), 500
    except Exception as e:
        return jsonify({"error": str(e)}), 500

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
        records_to_delete = db.session.query(MenuPermission).filter(
            MenuPermission.msid.in_(msids)
        ).all()

        if not records_to_delete:
            return jsonify({"error": "找不到任何匹配的記錄"}), 404
        
        deleted_names = [record.mstitle for record in records_to_delete]
        delete_message = "、".join(deleted_names)

        # 刪除找到的所有記錄
        for record in records_to_delete:
            db.session.delete(record)
            
        new_log = SystemLog(
            slaccount=data.get("operator"),        # 帳號
            sname='系統管理 > 選單權限管理',             # 姓名
            slevent=f"刪除權限：{delete_message}",         # 事件描述
            sodate=datetime.now(),      # 操作日期時間
            sflag='D'                   # 狀態標記
        )
        db.session.add(new_log)

        db.session.commit()
        return jsonify({"message": "資料已成功刪除"}), 200

    except SQLAlchemyError as e:
        db.session.rollback()
>>>>>>> master
        return jsonify({"error": f"資料庫錯誤: {str(e)}"}), 500