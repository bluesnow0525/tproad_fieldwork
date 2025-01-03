import sys
import os

# 將上層目錄加入 sys.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from flask import Blueprint, jsonify, request
from database.models import SystemLog
from database.models import PermissionMain, PermissionDetail
from database.extensions import db
from datetime import datetime, timedelta
from sqlalchemy.exc import SQLAlchemyError

systemlog_bp = Blueprint('systemlog', __name__)

@systemlog_bp.route('/read', methods=['POST'])
def query_systemlog():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "需要提供請求資料"}), 400
        # 檢查權限
        user_pid = data.pop('pid', None)  # 取出並移除 pid，避免影響其他篩選條件
        if not user_pid:
            return jsonify({"error": "未提供使用者ID"}), 400

        # 查詢使用者權限
        try:
            permission = db.session.query(PermissionDetail)\
                .join(PermissionMain)\
                .filter(
                    PermissionMain.msid == user_pid,
                    PermissionDetail.main_category == '系統管理',
                    PermissionDetail.sub_category == '系統異動紀錄'
                ).first()

            if not permission or not permission.is_permitted:
                return jsonify({"error": "您沒有權限查看此資料"}), 403

        except SQLAlchemyError as e:
            print(f"權限查詢錯誤: {str(e)}")
            return jsonify({"error": "權限驗證過程發生錯誤"}), 500
        
        # sflag 狀態對應表
        sflag_mapping = {
            "新增": "A",
            "編輯": "E",
            "登入": "L",
            "刪除": "D"
        }
        
        # 建立基礎查詢，添加所需欄位以提升性能
        query = SystemLog.query.with_entities(
            SystemLog.slid,
            SystemLog.sflag,
            SystemLog.slaccount,
            SystemLog.sname,
            SystemLog.slevent,
            SystemLog.sodate
        )

        # 先處理日期範圍，這是最基本的篩選條件
        try:
            if data.get('startDate') and data.get('endDate'):
                start_date = datetime.strptime(data['startDate'], '%Y-%m-%d')
                end_date = datetime.strptime(data['endDate'], '%Y-%m-%d') + timedelta(days=1)
            else:
                end_date = datetime.now()
                start_date = end_date - timedelta(days=7)
                
            # 先加入日期條件
            query = query.filter(SystemLog.sodate.between(start_date, end_date))
            
        except ValueError:
            return jsonify({'error': '日期格式錯誤'}), 400

        # sflag 狀態篩選 - 使用 IN 運算子來優化
        if data.get('sflag'):
            db_sflag = sflag_mapping.get(data['sflag'])
            if not db_sflag:
                return jsonify([])
            query = query.filter(SystemLog.sflag == db_sflag)
            # 先執行這個查詢以限制資料量
            query = query.order_by(SystemLog.sodate.desc()).limit(100)

        # slaccount 帳號篩選 - 如果有 flag 篩選，則進一步縮小範圍
        if data.get('slaccount'):
            query = query.filter(SystemLog.slaccount.like(f"{data['slaccount']}%"))

        # 如果沒有 flag 篩選，則在這裡限制結果數量
        if not data.get('sflag'):
            query = query.order_by(SystemLog.sodate.desc()).limit(500)

        # 執行查詢
        try:
            results = query.all()
        except SQLAlchemyError as e:
            print(f"查詢執行錯誤: {str(e)}")
            return jsonify({'error': '查詢執行錯誤'}), 500

        # 反向轉換 sflag 顯示值的對應表
        reverse_sflag_mapping = {
            "A": "新增",
            "E": "編輯",
            "L": "登入",
            "D": "刪除"
        }

        # 轉換資料 - 使用更安全的方式處理
        formatted_results = []
        for item in results:
            if item.sflag in reverse_sflag_mapping:
                formatted_results.append({
                    'slid': item.slid,
                    'sflag': reverse_sflag_mapping.get(item.sflag),
                    'slaccount': item.slaccount,
                    'sname': item.sname,
                    'slevent': item.slevent,
                    'sodate': item.sodate.strftime('%Y-%m-%d %H:%M:%S')
                })

        return jsonify(formatted_results)

    except Exception as e:
        print(f"查詢發生錯誤: {str(e)}")
        return jsonify({'error': '查詢發生錯誤'}), 500