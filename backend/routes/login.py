from flask import Blueprint, request, jsonify
from database.models import Fleet
from database.extensions import db
from werkzeug.security import check_password_hash

login_bp = Blueprint('login', __name__)

@login_bp.route('/login', methods=['POST'])
def login():
    # 接收前端傳來的 JSON 資料
    data = request.json
    if not data or 'account' not in data or 'password' not in data:
        return jsonify({"error": "請提供帳號和密碼"}), 400

    account = data['account']
    password = data['password']

    # 從資料庫查找對應的帳號
    user = db.session.query(Fleet).filter_by(empid=account, ifuse='y').first()
    if not user:
        return jsonify({"success": False, "message": "帳號不存在或被停用"}), 404

    # 驗證密碼（需要確認是否使用了密碼雜湊加密）
    if check_password_hash(user.emppasswd, password):  # 如果密碼使用加密存儲
        return jsonify({"success": True, "message": "登入成功"}), 200
    elif user.emppasswd == password:  # 如果密碼未加密，直接比對
        return jsonify({"success": True, "message": "登入成功"}), 200
    else:
        return jsonify({"success": False, "message": "密碼錯誤"}), 401
