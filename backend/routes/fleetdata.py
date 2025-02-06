import sys
import os

# 將上層目錄加入 sys.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from flask import Blueprint, jsonify, request
from database.models import Fleet
from database.models import SystemLog
from database.models import PermissionMain, PermissionDetail
from database.extensions import db
from datetime import datetime
from sqlalchemy.exc import SQLAlchemyError
from werkzeug.security import generate_password_hash

fleetdata_bp = Blueprint('fleet', __name__)

@fleetdata_bp.route('/read', methods=['POST'])
def read_fleet():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "需要提供請求資料"}), 400

        # 檢查權限
        user_pid = data.get('pid')
        if not user_pid:
            return jsonify({"error": "未提供使用者ID"}), 400

        # 查詢使用者權限
        try:
            permission = db.session.query(PermissionDetail)\
                .join(PermissionMain)\
                .filter(
                    PermissionMain.msid == user_pid,
                    PermissionDetail.main_category == '系統管理',
                    PermissionDetail.sub_category == '公司車隊管理'
                ).first()

            if not permission or not permission.is_permitted:
                return jsonify({"error": "您沒有權限查看此資料"}), 403

        except SQLAlchemyError as e:
            print(f"權限查詢錯誤: {str(e)}")
            return jsonify({"error": "權限驗證過程發生錯誤"}), 500

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
                "password": "",
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
        print(f"發生錯誤: {str(e)}")
        return jsonify({"error": "處理請求時發生錯誤"}), 500

@fleetdata_bp.route('/write', methods=['POST'])
def write_fleet():
    data = request.json
    if not data:
        return jsonify({"error": "請提供有效的 JSON 資料"}), 400

    try:
        print("收到的請求數據:", data)  # 檢查收到的數據
        
        # 將角色列表轉換為逗號分隔的字串
        role_mapping = {
            "公司管理員": "1",
            "內業人員": "2",
            "修補人員": "3",
            "維修人員": "4",
            "巡查人員": "5"
        }
        etype = ",".join([role_mapping.get(role, "") for role in data.get("role", []) if role_mapping.get(role)])
        print("處理後的角色字串:", etype)  # 檢查角色轉換

        # 生成密碼雜湊值
        try:
            raw_password = data.get("password", "")
            print("原始密碼長度:", len(raw_password))  # 檢查原始密碼
            password_hash = generate_password_hash(raw_password) if raw_password else ""
            print("生成的密碼雜湊值長度:", len(password_hash))  # 檢查雜湊值
        except Exception as e:
            print("密碼雜湊過程發生錯誤:", str(e))
            return jsonify({"error": f"密碼加密錯誤: {str(e)}"}), 500

        # 將格式化資料轉換為資料庫資料格式
        db_data = {
            "ifuse": "y" if data.get("status") == "啟用" else "n",
            "rcno": data.get("caseCode"),
            "empworkcomp": data.get("vendor"),
            "empid": data.get("account"),
            "empname": data.get("name"),
            "etype": etype,
            "jobdate": datetime.strptime(data.get("createdDate"), "%Y/%m/%d") if data.get("createdDate") else None,
            "bmodid": data.get("operator", "system"),
            "bmoddate": datetime.now(),
            "emppasswd": password_hash,
            "entel": data.get("phone", ""),
            "enemail": data.get("email", ""),
            "empcomment": data.get("notes", ""),
            "logincount": data.get("passwordErrorCount", 0),
            "logindate": datetime.strptime(data.get("lastLoginTime"), "%Y/%m/%d %H:%M:%S") if data.get("lastLoginTime") else None,
            "loginip": data.get("lastLoginIp", ""),
        }
        print("準備寫入的資料:", {k: v for k, v in db_data.items() if k != 'emppasswd'})  # 打印除密碼外的所有資料

        emid = data.get("emid")
        if emid:  # 更新操作
            print(f"執行更新操作, emid: {emid}")
            record = db.session.query(Fleet).filter_by(emid=emid).first()
            if record:
                if not data.get("password"):
                    print("未提供新密碼，保留原密碼")
                    db_data.pop("emppasswd")
                
                for key, value in db_data.items():
                    setattr(record, key, value)
                new_log = SystemLog(
                    slaccount=data.get("operator"),
                    sname='系統管理 > 公司車隊管理',
                    slevent=f"帳號:{data.get('account')}，姓名:{data.get('name')}",
                    sodate=datetime.now(),
                    sflag='E'
                )
                db.session.add(new_log)
            else:
                return jsonify({"error": f"ID {emid} 的記錄不存在，無法更新"}), 404
        else:  # 新增操作
            print("執行新增操作")
            existing_account = db.session.query(Fleet).filter_by(empid=data.get("account")).first()
            if existing_account:
                return jsonify({"error": f"帳號 '{data.get('account')}' 已存在"}), 400
            
            db_data["msid"] = "A03"
            try:
                new_record = Fleet(**db_data)
                db.session.add(new_record)
                print("新記錄已添加到 session")
            except Exception as e:
                print("創建新記錄時發生錯誤:", str(e))
                raise

            new_log = SystemLog(
                slaccount=data.get("operator"),
                sname='系統管理 > 公司車隊管理',
                slevent=f"帳號:{data.get('account')}，姓名:{data.get('name')}",
                sodate=datetime.now(),
                sflag='A'
            )
            db.session.add(new_log)

        try:
            db.session.commit()
            print("資料庫提交成功")
            return jsonify({"message": "資料已成功寫入"}), 200
        except Exception as e:
            print("提交到資料庫時發生錯誤:", str(e))
            db.session.rollback()
            raise

    except ValueError as ve:
        print("資料格式錯誤:", str(ve))
        return jsonify({"error": f"資料格式錯誤: {str(ve)}"}), 400
    except SQLAlchemyError as sae:
        print("SQLAlchemy錯誤:", str(sae))
        db.session.rollback()
        return jsonify({"error": f"資料庫錯誤: {str(sae)}"}), 500
    except Exception as e:
        print("未預期的錯誤:", str(e))
        return jsonify({"error": f"未預期的錯誤: {str(e)}"}), 500

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
