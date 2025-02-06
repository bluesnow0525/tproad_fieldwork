import sys
import os

# 將上層目錄加入 sys.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from flask import Blueprint, jsonify, request
from database.db_read import DB_read
from database.models import RoadCase, ProjectDistrict, Vehicle
from database.models import SystemLog
from database.models import PermissionMain, PermissionDetail
from database.extensions import db
from datetime import datetime
from sqlalchemy.exc import SQLAlchemyError

roadcase_bp = Blueprint('roadcase', __name__)

@roadcase_bp.route('/read', methods=['POST'])
def get_roadcase():
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
                    PermissionDetail.sub_category == '標案管理'
                ).first()

            if not permission or not permission.is_permitted:
                return jsonify({"error": "您沒有權限查看此資料"}), 403

        except SQLAlchemyError as e:
            print(f"權限查詢錯誤: {str(e)}")
            return jsonify({"error": "權限驗證過程發生錯誤"}), 500

        # 原有的資料查詢邏輯
        operator = DB_read(db.session)
        raw_data = operator.select_all("roadcase")
        formatted_data = operator.format_roadcase_data(raw_data)
        return jsonify(formatted_data)

    except Exception as e:
        print(f"發生錯誤: {str(e)}")
        return jsonify({"error": "處理請求時發生錯誤"}), 500

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
                new_log = SystemLog(
                    slaccount=data.get("managerAccount"),        # 帳號
                    sname='系統管理 > 標案管理',             # 姓名
                    slevent=f"專案代碼：{data.get('caseCode')}",         # 事件描述
                    sodate=datetime.now(),      # 操作日期時間
                    sflag='E'                   # 狀態標記
                )
                db.session.add(new_log)
            else:
                return jsonify({"error": f"ID {rcid} 的記錄不存在，無法更新"}), 404
        else:  # 新增操作
            new_record = RoadCase(**db_data)
            db.session.add(new_record)
            new_log = SystemLog(
                slaccount=data.get("managerAccount"),        # 帳號
                sname='系統管理 > 標案管理',             # 姓名
                slevent=f"專案代碼：{data.get('caseCode')}",         # 事件描述
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
    
@roadcase_bp.route('/delete', methods=['POST'])
def delete_roadcase():
    data = request.json  # 接收 JSON 資料
    if not data or not isinstance(data.get('rcid'), list):  # 確保 rcid 是列表
        return jsonify({"error": "請提供有效的 rcid 列表"}), 400

    rcid_list = data['rcid']

    try:
        # 刪除對應的 rcid 資料
        # deleted_count = db.session.query(RoadCase).filter(RoadCase.rcid.in_(rcid_list)).delete(synchronize_session='fetch')

        # if deleted_count == 0:
        #     return jsonify({"error": "未找到符合條件的資料，無法刪除"}), 404
        
        records_to_delete = db.session.query(RoadCase).filter(RoadCase.rcid.in_(rcid_list)).all()

        if not records_to_delete:
            return jsonify({"error": "找不到任何匹配的記錄"}), 404

        deleted_names = [record.rcname for record in records_to_delete]
        delete_message = "、".join(deleted_names)

        # 刪除找到的所有記錄
        for record in records_to_delete:
            db.session.delete(record)
            
        new_log = SystemLog(
            slaccount="system",        # 帳號
            sname='系統管理 > 標案管理',             # 姓名
            slevent=f"刪除標案：{delete_message}",         # 事件描述
            sodate=datetime.now(),      # 操作日期時間
            sflag='D'                   # 狀態標記
        )
        db.session.add(new_log)

        db.session.commit()
        return jsonify({"message": "成功刪除"}), 200

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
        "rcomname": formatted_data.get("vendor"),
        "rconame": formatted_data.get("contactPerson"),
        "rcsdate": datetime.strptime(formatted_data.get("contractStart"), "%Y/%m/%d")
        if formatted_data.get("contractStart") else None,
        "rcedate": datetime.strptime(formatted_data.get("contractEnd"), "%Y/%m/%d")
        if formatted_data.get("contractEnd") else None,
        "rcotel": formatted_data.get("contactPhone"),
        "bmodid": formatted_data.get("managerAccount"),
        "bmoddate": datetime.now(),
        "rcnote": formatted_data.get("notes"),
    }
    # 去掉值為 None 或空字串的項目
    return {k: v for k, v in mapped_data.items() if v not in [None, ""]}

@roadcase_bp.route('/projects', methods=['GET'])
def get_projects():
    """獲取所有進行中的專案列表"""
    try:
        projects = RoadCase.query.filter(
            RoadCase.rcstatus == '2'
        ).with_entities(
            RoadCase.rcno,
            RoadCase.rcname
        ).all()
        
        return jsonify({
            'status': 'success',
            'data': [{
                'value': p.rcno,
                'label': f"{p.rcno} - {p.rcname}"
            } for p in projects]
        })
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@roadcase_bp.route('/districts/<project_code>', methods=['GET'])
def get_districts(project_code):
    """根據專案代碼獲取對應的行政區"""
    try:
        districts = ProjectDistrict.query.filter_by(
            ProjectCode=project_code
        ).with_entities(
            ProjectDistrict.District
        ).all()
        
        return jsonify({
            'status': 'success',
            'data': [d.District for d in districts]
        })
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@roadcase_bp.route('/vehicles/<project_code>', methods=['GET'])
def get_vehicles(project_code):
    """根據專案代碼和來源類型獲取車輛列表"""
    try:
        vehicle_type = request.args.get('type', 'car')
        query = Vehicle.query.filter_by(rcno=project_code)
        
        if vehicle_type == 'car':
            vehicles = query.filter_by(ifuse='Y').all()
        else:  # motorcycle
            vehicles = query.filter_by(ifuse='N').all()
        
        return jsonify({
            'status': 'success',
            'data': [{
                'value': v.cno,
                'label': v.cno + (f' (面積: {v.carea}平方公尺)' if v.carea else '')
            } for v in vehicles]
        })
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500