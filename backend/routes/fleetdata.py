<<<<<<< HEAD
import sys
import os

# 將上層目錄加入 sys.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from flask import Blueprint, jsonify, request
from database.models import Fleet
from database.models import SystemLog
from database.extensions import db
from datetime import datetime
from sqlalchemy.exc import SQLAlchemyError

fleetdata_bp = Blueprint('fleet', __name__)

@fleetdata_bp.route('/read', methods=['GET'])
def read_fleet():
    try:
        # 查詢所有資料
        results = db.session.query(Fleet).all()

        # 定義 role 對應關係
        role_mapping = {
            "1": "公司管理員",
            "2": "內業人員",
            "4": "維修人員",
            "5": "巡查人員"
        }

        # 篩選出 rcno 不為 None 的記錄
        filtered_results = [row for row in results if row.rcno]

        # 格式化資料
        formatted_data = [
            {
                "emid": row.emid,
                "status": "啟用" if row.ifuse.lower() == "y" else "停用",
                "caseCode": row.rcno or "",
                "vendor": row.empworkcomp or "",
                "account": row.empid or "",
                "name": row.empname or "",
                "role": [role_mapping.get(role.strip(), "未知角色") for role in row.etype.split(",")] if row.etype else [],
                "password": row.emppasswd or "",
                "phone": row.entel or "",
                "email": row.enemail or "",
                "notes": row.empcomment or "",
                "passwordErrorCount": row.logincount or 0,
                "createdDate": row.jobdate.strftime("%Y/%m/%d") if row.jobdate else "",
                "lastLoginIp": row.loginip or "",
                "lastLoginTime": row.logindate.strftime("%Y/%m/%d %H:%M:%S") if row.logindate else "",
                "operator": row.bmodid or "",
                "lastModifiedTime": row.bmoddate.strftime("%Y/%m/%d %H:%M:%S") if row.bmoddate else "",
            }
            for row in filtered_results
        ]

        return jsonify(formatted_data), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@fleetdata_bp.route('/write', methods=['POST'])
def write_fleet():
    data = request.json  # 接收 JSON 資料
    if not data:
        return jsonify({"error": "請提供有效的 JSON 資料"}), 400

    try:
        # 將角色列表轉換為逗號分隔的字串
        role_mapping = {
            "公司管理員": "1",
            "內業人員": "2",
            "修補人員": "3",
            "維修人員": "4",
            "巡查人員": "5"
        }
        etype = ",".join([role_mapping.get(role, "") for role in data.get("role", []) if role_mapping.get(role)])

        # 將格式化資料轉換為資料庫資料格式
        db_data = {
            "ifuse": "y" if data.get("status") == "啟用" else "n",
            "rcno": data.get("caseCode"),
            "empworkcomp": data.get("vendor"),
            "empid": data.get("account"),
            "empname": data.get("name"),
            "etype": etype,
            "jobdate": datetime.strptime(data.get("createdDate"), "%Y/%m/%d") if data.get("createdDate") else None,
            "bmodid": data.get("operator", "system"),  # 使用提供的修改人資訊，默認為 "system"
            "bmoddate": datetime.now(),
            "emppasswd": data.get("password", ""),  # 處理密碼（如果提供）
            "entel": data.get("phone", ""),
            "enemail": data.get("email", ""),
            "empcomment": data.get("notes", ""),
            "logincount": data.get("passwordErrorCount", 0),
            "logindate": datetime.strptime(data.get("lastLoginTime"), "%Y/%m/%d %H:%M:%S") if data.get("lastLoginTime") else None,
            "loginip": data.get("lastLoginIp", ""),
        }

        emid = data.get("emid")
        if emid:  # 更新操作
            record = db.session.query(Fleet).filter_by(emid=emid).first()
            if record:
                for key, value in db_data.items():
                    setattr(record, key, value)
                new_log = SystemLog(
                    slaccount=data.get("operator"),        # 帳號
                    sname='系統管理 > 公司車隊管理',             # 姓名
                    slevent=f"帳號:{data.get("account")}，姓名:{data.get("name")}",         # 事件描述
                    sodate=datetime.now(),      # 操作日期時間
                    sflag='E'                   # 狀態標記
                )
                db.session.add(new_log)
            else:
                return jsonify({"error": f"ID {emid} 的記錄不存在，無法更新"}), 404
        else:  # 新增操作
            new_record = Fleet(**db_data)
            db.session.add(new_record)
            new_log = SystemLog(
                slaccount=data.get("operator"),        # 帳號
                sname='系統管理 > 公司車隊管理',             # 姓名
                slevent=f"帳號:{data.get("account")}，姓名:{data.get("name")}",         # 事件描述
                sodate=datetime.now(),      # 操作日期時間
                sflag='A'                   # 狀態標記
            )
            db.session.add(new_log)

        db.session.commit()
        return jsonify({"message": "資料已成功寫入"}), 200

    except ValueError as ve:
        return jsonify({"error": f"資料格式錯誤: {str(ve)}"}), 400
    except SQLAlchemyError as sae:
        db.session.rollback()
        return jsonify({"error": f"資料庫錯誤: {str(sae)}"}), 500

@fleetdata_bp.route('/delete', methods=['POST'])
def delete_fleet():
    data = request.json  # 接收 JSON 資料
    if not data or not data.get("emid"):
        return jsonify({"error": "請提供要刪除的 emid 列表"}), 400

    try:
        emids_to_delete = data.get("emid")

        # 確保提供的是一個列表
        if not isinstance(emids_to_delete, list):
            return jsonify({"error": "emid 列表格式不正確，應該是列表"}), 400

        # 根據 emid 查找並刪除記錄
        records_to_delete = db.session.query(Fleet).filter(Fleet.emid.in_(emids_to_delete)).all()

        if not records_to_delete:
            return jsonify({"error": "找不到任何匹配的記錄"}), 404

        deleted_names = [record.empname for record in records_to_delete]
        delete_message = "、".join(deleted_names)

        # 刪除找到的所有記錄
        for record in records_to_delete:
            db.session.delete(record)
            
        new_log = SystemLog(
            slaccount=data.get("operator"),        # 帳號
            sname='系統管理 > 公司車隊管理',             # 姓名
            slevent=f"刪除人員：{delete_message}",         # 事件描述
            sodate=datetime.now(),      # 操作日期時間
            sflag='D'                   # 狀態標記
        )
        db.session.add(new_log)

        db.session.commit()
        return jsonify({"message": "資料已成功刪除"}), 200

    except SQLAlchemyError as sae:
        db.session.rollback()
        return jsonify({"error": f"資料庫錯誤: {str(sae)}"}), 500
    except Exception as e:
        return jsonify({"error": str(e)}), 500
=======
import sys
import os

# 將上層目錄加入 sys.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from flask import Blueprint, jsonify, request
from database.models import Fleet
from database.models import SystemLog
from database.extensions import db
from datetime import datetime
from sqlalchemy.exc import SQLAlchemyError

fleetdata_bp = Blueprint('fleet', __name__)

@fleetdata_bp.route('/read', methods=['GET'])
def read_fleet():
    try:
        # 查詢所有資料
        results = db.session.query(Fleet).all()

        # 定義 role 對應關係
        role_mapping = {
            "1": "公司管理員",
            "2": "內業人員",
            "4": "維修人員",
            "5": "巡查人員"
        }

        # 篩選出 rcno 不為 None 的記錄
        filtered_results = [row for row in results if row.rcno]

        # 格式化資料
        formatted_data = [
            {
                "emid": row.emid,
                "status": "啟用" if row.ifuse.lower() == "y" else "停用",
                "caseCode": row.rcno or "",
                "vendor": row.empworkcomp or "",
                "account": row.empid or "",
                "name": row.empname or "",
                "role": [role_mapping.get(role.strip(), "未知角色") for role in row.etype.split(",")] if row.etype else [],
                "password": row.emppasswd or "",
                "phone": row.entel or "",
                "email": row.enemail or "",
                "notes": row.empcomment or "",
                "passwordErrorCount": row.logincount or 0,
                "createdDate": row.jobdate.strftime("%Y/%m/%d") if row.jobdate else "",
                "lastLoginIp": row.loginip or "",
                "lastLoginTime": row.logindate.strftime("%Y/%m/%d %H:%M:%S") if row.logindate else "",
                "operator": row.bmodid or "",
                "lastModifiedTime": row.bmoddate.strftime("%Y/%m/%d %H:%M:%S") if row.bmoddate else "",
            }
            for row in filtered_results
        ]

        return jsonify(formatted_data), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@fleetdata_bp.route('/write', methods=['POST'])
def write_fleet():
    data = request.json  # 接收 JSON 資料
    if not data:
        return jsonify({"error": "請提供有效的 JSON 資料"}), 400

    try:
        # 將角色列表轉換為逗號分隔的字串
        role_mapping = {
            "公司管理員": "1",
            "內業人員": "2",
            "修補人員": "3",
            "維修人員": "4",
            "巡查人員": "5"
        }
        etype = ",".join([role_mapping.get(role, "") for role in data.get("role", []) if role_mapping.get(role)])

        # 將格式化資料轉換為資料庫資料格式
        db_data = {
            "ifuse": "y" if data.get("status") == "啟用" else "n",
            "rcno": data.get("caseCode"),
            "empworkcomp": data.get("vendor"),
            "empid": data.get("account"),
            "empname": data.get("name"),
            "etype": etype,
            "jobdate": datetime.strptime(data.get("createdDate"), "%Y/%m/%d") if data.get("createdDate") else None,
            "bmodid": data.get("operator", "system"),  # 使用提供的修改人資訊，默認為 "system"
            "bmoddate": datetime.now(),
            "emppasswd": data.get("password", ""),  # 處理密碼（如果提供）
            "entel": data.get("phone", ""),
            "enemail": data.get("email", ""),
            "empcomment": data.get("notes", ""),
            "logincount": data.get("passwordErrorCount", 0),
            "logindate": datetime.strptime(data.get("lastLoginTime"), "%Y/%m/%d %H:%M:%S") if data.get("lastLoginTime") else None,
            "loginip": data.get("lastLoginIp", ""),
        }

        emid = data.get("emid")
        if emid:  # 更新操作
            record = db.session.query(Fleet).filter_by(emid=emid).first()
            if record:
                for key, value in db_data.items():
                    setattr(record, key, value)
                new_log = SystemLog(
                    slaccount=data.get("operator"),        # 帳號
                    sname='系統管理 > 公司車隊管理',             # 姓名
                    slevent=f"帳號:{data.get("account")}，姓名:{data.get("name")}",         # 事件描述
                    sodate=datetime.now(),      # 操作日期時間
                    sflag='E'                   # 狀態標記
                )
                db.session.add(new_log)
            else:
                return jsonify({"error": f"ID {emid} 的記錄不存在，無法更新"}), 404
        else:  # 新增操作
            new_record = Fleet(**db_data)
            db.session.add(new_record)
            new_log = SystemLog(
                slaccount=data.get("operator"),        # 帳號
                sname='系統管理 > 公司車隊管理',             # 姓名
                slevent=f"帳號:{data.get("account")}，姓名:{data.get("name")}",         # 事件描述
                sodate=datetime.now(),      # 操作日期時間
                sflag='A'                   # 狀態標記
            )
            db.session.add(new_log)

        db.session.commit()
        return jsonify({"message": "資料已成功寫入"}), 200

    except ValueError as ve:
        return jsonify({"error": f"資料格式錯誤: {str(ve)}"}), 400
    except SQLAlchemyError as sae:
        db.session.rollback()
        return jsonify({"error": f"資料庫錯誤: {str(sae)}"}), 500

@fleetdata_bp.route('/delete', methods=['POST'])
def delete_fleet():
    data = request.json  # 接收 JSON 資料
    if not data or not data.get("emid"):
        return jsonify({"error": "請提供要刪除的 emid 列表"}), 400

    try:
        emids_to_delete = data.get("emid")

        # 確保提供的是一個列表
        if not isinstance(emids_to_delete, list):
            return jsonify({"error": "emid 列表格式不正確，應該是列表"}), 400

        # 根據 emid 查找並刪除記錄
        records_to_delete = db.session.query(Fleet).filter(Fleet.emid.in_(emids_to_delete)).all()

        if not records_to_delete:
            return jsonify({"error": "找不到任何匹配的記錄"}), 404

        deleted_names = [record.empname for record in records_to_delete]
        delete_message = "、".join(deleted_names)

        # 刪除找到的所有記錄
        for record in records_to_delete:
            db.session.delete(record)
            
        new_log = SystemLog(
            slaccount=data.get("operator"),        # 帳號
            sname='系統管理 > 公司車隊管理',             # 姓名
            slevent=f"刪除人員：{delete_message}",         # 事件描述
            sodate=datetime.now(),      # 操作日期時間
            sflag='D'                   # 狀態標記
        )
        db.session.add(new_log)

        db.session.commit()
        return jsonify({"message": "資料已成功刪除"}), 200

    except SQLAlchemyError as sae:
        db.session.rollback()
        return jsonify({"error": f"資料庫錯誤: {str(sae)}"}), 500
    except Exception as e:
        return jsonify({"error": str(e)}), 500
>>>>>>> master
