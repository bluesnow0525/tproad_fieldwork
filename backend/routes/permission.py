import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from flask import Blueprint, jsonify, request
from database.models import MenuPermission, SystemLog, PermissionMain, PermissionDetail
from database.extensions import db
from datetime import datetime
from sqlalchemy.exc import SQLAlchemyError

permission_bp = Blueprint('permission', __name__)

@permission_bp.route('/default', methods=['GET'])
def get_default_permissions():
    try:
        default_permissions = {
            "案件管理": {
                "案件管理": False,
                "報表作業": False,
            },
            "申請單": {
                "案件管理": False,
                "清冊管理": False,
            },
            "施工": {
                "案件管理": False,
                "自主檢查表": False,
                "清冊製作與管理": False,
            },
            "請款": {
                "請款": False,
            },
            "圖台": {
                "即時車輛軌跡與影像": False,
                "歷史軌跡查詢與下載": False,
                "案件查詢後呈現": False,
                "車隊巡查覆蓋率": False,
            },
            "道路履歷": {
                "AAR道路區塊": False,
                "PC道路區塊": False,
                "EPC道路區塊": False,
            },
            "查詢統計": {
                "查詢統計": False,
            },
            "系統管理": {
                "標案管理": False,
                "公司車隊管理": False,
                "工務帳號管理": False,
                "共用代碼管理": False,
                "選單權限管理": False,
                "系統異動紀錄": False,
            },
        }
        return jsonify({"permissions": default_permissions}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@permission_bp.route('/read', methods=['POST'])
def read_permission():
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
                    PermissionDetail.sub_category == '選單權限管理'
                ).first()

            if not permission or not permission.is_permitted:
                return jsonify({"error": "您沒有權限查看此資料"}), 403

        except SQLAlchemyError as e:
            print(f"權限查詢錯誤: {str(e)}")
            return jsonify({"error": "權限驗證過程發生錯誤"}), 500

        # 從資料庫取得所有主表資料
        results = db.session.query(MenuPermission).all()
        
        formatted_data = []
        for row in results:
            # 查詢對應的權限詳細資料
            permission_details = db.session.query(PermissionDetail)\
                .join(PermissionMain)\
                .filter(PermissionMain.msid == row.msid)\
                .all()

            # 組織權限結構
            permissions = {}
            if permission_details:
                for detail in permission_details:
                    if detail.main_category not in permissions:
                        permissions[detail.main_category] = {}
                    permissions[detail.main_category][detail.sub_category] = detail.is_permitted
            else:
                # 如果沒有詳細權限記錄，使用預設結構
                default_permissions = get_default_permissions()[0].json['permissions']
                permissions = default_permissions

            formatted_data.append({
                "msid": row.msid,
                "roleName": row.mstitle,
                "operator": row.bmodid,
                "lastModifiedTime": row.bmoddate.strftime("%Y/%m/%d %H:%M:%S") if row.bmoddate else "",
                "permissions": permissions
            })

        return jsonify(formatted_data), 200

    except Exception as e:
        print(f"發生錯誤: {str(e)}")
        return jsonify({"error": "處理請求時發生錯誤"}), 500

@permission_bp.route('/write', methods=['POST'])
def write_permission():
    data = request.json
    if not data:
        return jsonify({"error": "請提供有效的 JSON 資料"}), 400

    try:
        print(data)
        # 更新 MenuPermission 表
        menu_permission = MenuPermission.query.filter_by(msid=data['msid']).first()
        if not menu_permission:
            return jsonify({"error": "找不到指定的權限記錄"}), 404

        menu_permission.mstitle = data['roleName']
        menu_permission.bmodid = data['operator']
        menu_permission.bmoddate = datetime.now()

        # 更新 PermissionMain 表
        permission_main = PermissionMain.query.filter_by(msid=data['msid']).first()
        if permission_main:
            # 更新主表記錄
            permission_main.mstitle = data['roleName']
            permission_main.bmodid = data['operator']
            permission_main.bmoddate = datetime.now()
            
            # 刪除現有的詳細權限記錄
            PermissionDetail.query.filter_by(pid=permission_main.pid).delete()
        else:
            # 創建新的主表記錄
            permission_main = PermissionMain(
                msid=data['msid'],
                mstitle=data['roleName'],
                bmodid=data['operator']
            )
            db.session.add(permission_main)
            db.session.flush()

        # 批量新增詳細權限記錄
        detail_records = []
        for main_cat, sub_cats in data['permissions'].items():
            for sub_cat, is_permitted in sub_cats.items():
                detail = PermissionDetail(
                    pid=permission_main.pid,
                    main_category=main_cat,
                    sub_category=sub_cat,
                    is_permitted=is_permitted
                )
                detail_records.append(detail)
        
        if detail_records:
            db.session.bulk_save_objects(detail_records)

        # 添加系統日誌
        new_log = SystemLog(
            slaccount=data['operator'],
            sname='系統管理 > 選單權限管理',
            slevent=f"修改權限：{data['roleName']}",
            sodate=datetime.now(),
            sflag='E'
        )
        db.session.add(new_log)

        db.session.commit()
        return jsonify({"message": "資料已成功更新"}), 200

    except SQLAlchemyError as e:
        db.session.rollback()
        print(f"Database error: {str(e)}")
        return jsonify({"error": f"資料庫錯誤: {str(e)}"}), 500
    except Exception as e:
        db.session.rollback()
        print(f"General error: {str(e)}")
        return jsonify({"error": str(e)}), 500

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
        
        # 創建 MenuPermission 記錄
        new_menu_permission = MenuPermission(
            msid=data['msid'],
            mstitle=data['roleName'],
            bmodid=data['operator'],
            comid='taipei',
            bmoddate=datetime.now()
        )
        db.session.add(new_menu_permission)
        
        # 創建 PermissionMain 記錄
        new_permission_main = PermissionMain(
            msid=data['msid'],
            role_name=data['roleName'],
            operator=data['operator']
        )
        db.session.add(new_permission_main)
        db.session.flush()  # 獲取 pid

        # 創建權限詳細記錄
        for main_cat, sub_cats in data['permissions'].items():
            for sub_cat, is_permitted in sub_cats.items():
                detail = PermissionDetail(
                    pid=new_permission_main.pid,
                    main_category=main_cat,
                    sub_category=sub_cat,
                    is_permitted=is_permitted
                )
                db.session.add(detail)

        # 新增系統日誌
        new_log = SystemLog(
            slaccount=data['operator'],
            sname='系統管理 > 選單權限管理',
            slevent=f"新增權限：{data['roleName']}",
            sodate=datetime.now(),
            sflag='A'
        )
        db.session.add(new_log)

        db.session.commit()
        return jsonify({"message": "新權限已成功新增"}), 200

    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({"error": f"資料庫錯誤: {str(e)}"}), 500
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@permission_bp.route('/delete', methods=['POST'])
def delete_permission():
    data = request.json
    if not data or "emid" not in data:
        return jsonify({"error": "請提供要刪除的權限代碼"}), 400

    try:
        msids = data["emid"]
        if not isinstance(msids, list):
            msids = [msids]

        # 刪除所有相關記錄
        deleted_names = []
        for msid in msids:
            # 查找並刪除 MenuPermission
            menu_permission = MenuPermission.query.filter_by(msid=msid).first()
            if menu_permission:
                deleted_names.append(menu_permission.mstitle)
                db.session.delete(menu_permission)

            # 查找並刪除 PermissionMain（會級聯刪除 PermissionDetail）
            permission_main = PermissionMain.query.filter_by(msid=msid).first()
            if permission_main:
                db.session.delete(permission_main)

        if not deleted_names:
            return jsonify({"error": "找不到任何匹配的記錄"}), 404

        # 新增系統日誌
        delete_message = "、".join(deleted_names)
        new_log = SystemLog(
            slaccount=data.get("operator"),
            sname='系統管理 > 選單權限管理',
            slevent=f"刪除權限：{delete_message}",
            sodate=datetime.now(),
            sflag='D'
        )
        db.session.add(new_log)

        db.session.commit()
        return jsonify({"message": "資料已成功刪除"}), 200

    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({"error": f"資料庫錯誤: {str(e)}"}), 500
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500