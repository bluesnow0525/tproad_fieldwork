from flask import Blueprint, request, jsonify
from database.models import Fleet
from database.models import SystemLog
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
        # 回傳更多使用者資訊
        new_log = SystemLog(
            slaccount=user.empname,        # 帳號
            sname='臺北市道路巡查系統',             # 姓名
            slevent=f"登入成功!!",         # 事件描述
            sodate=datetime.now(),      # 操作日期時間
            sflag='L'                   # 狀態標記
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
            }
        }), 200
    else:
        return jsonify({"success": False, "message": "密碼錯誤"}), 401