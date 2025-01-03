from flask import Blueprint, request, jsonify
from database.models import Fleet
from database.models import SystemLog
from database.models import PermissionMain, PermissionDetail
from database.extensions import db
from werkzeug.security import check_password_hash
from datetime import datetime

login_bp = Blueprint('login', __name__)

@login_bp.route('/login', methods=['POST'])
def login():
    data = request.json
    if not data or 'account' not in data or 'password' not in data:
        return jsonify({"error": "請提供帳號和密碼"}), 400

    account = data['account']
    password = data['password']

    user = db.session.query(Fleet).filter_by(empid=account, ifuse='y').first()
    if not user:
        return jsonify({"success": False, "message": "帳號不存在或被停用"}), 404

    # 驗證密碼
    if check_password_hash(user.emppasswd, password) or user.emppasswd == password:
        # 查詢用戶權限
        permissions = db.session.query(PermissionDetail)\
            .join(PermissionMain)\
            .filter(PermissionMain.msid == user.msid)\
            .all()

        # 組織權限結構
        user_permissions = {}
        for perm in permissions:
            if perm.main_category not in user_permissions:
                user_permissions[perm.main_category] = {}
            user_permissions[perm.main_category][perm.sub_category] = perm.is_permitted

        # 記錄登入日誌
        new_log = SystemLog(
            slaccount=user.empname,
            sname='臺北市道路巡查系統',
            slevent=f"登入成功!!",
            sodate=datetime.now(),
            sflag='L'
        )
        db.session.add(new_log)
        db.session.commit()
        
        return jsonify({
            "success": True,
            "message": "登入成功",
            "user": {
                "username": user.empname,
                "account": user.empid,
                "role": user.etype,
                "factory": user.rcno,
                "pid": user.msid,
                "permissions": user_permissions
            }
        }), 200
    else:
        return jsonify({"success": False, "message": "密碼錯誤"}), 401