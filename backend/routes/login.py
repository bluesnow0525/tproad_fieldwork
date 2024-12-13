from flask import Blueprint, request, jsonify
from database.models import Fleet
from database.extensions import db
from werkzeug.security import check_password_hash

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