<<<<<<< HEAD
import sys
import os

# 將上層目錄加入 sys.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from flask import Blueprint, jsonify, request
from database.models import SystemLog
from database.extensions import db
from datetime import datetime, timedelta
from sqlalchemy.exc import SQLAlchemyError

systemlog_bp = Blueprint('systemlog', __name__)
@systemlog_bp.route('/read', methods=['POST'])
def query_systemlog():
    try:
        data = request.get_json()
        
        # sflag 狀態對應表
        sflag_mapping = {
            "新增": "A",
            "編輯": "E",
            "登入": "L",
            "刪除": "D"
        }
        
        # 建立基礎查詢
        query = SystemLog.query
        
        # sflag 狀態篩選 - 如果不是空字串則進行轉換後篩選
        if data.get('sflag') and data['sflag'] != "":
            db_sflag = sflag_mapping.get(data['sflag'])
            if db_sflag:
                query = query.filter(SystemLog.sflag == db_sflag)
        
        # slaccount 帳號篩選 - 如果不是空字串才進行篩選
        if data.get('slaccount') and data['slaccount'] != "":
            query = query.filter(SystemLog.slaccount.like(f"%{data['slaccount']}%"))
        
        # 日期篩選 - 只有當兩個日期都不是空字串時才進行篩選
        if (data.get('startDate') and data.get('endDate') and 
            data['startDate'] != "" and data['endDate'] != ""):
            try:
                start_date = datetime.strptime(data['startDate'], '%Y-%m-%d')
                end_date = datetime.strptime(data['endDate'], '%Y-%m-%d') + timedelta(days=1)
                query = query.filter(SystemLog.sodate.between(start_date, end_date))
            except ValueError as e:
                return jsonify({'error': '日期格式錯誤'}), 400

        # 執行查詢並排序（最新的排在前面）
        results = query.order_by(SystemLog.sodate.desc()).all()
        
        # 反向轉換 sflag 顯示值的對應表
        reverse_sflag_mapping = {
            "A": "新增",
            "E": "編輯",
            "L": "登入",
            "D": "刪除"
        }
        
        # 轉換為 JSON 格式，並將 sflag 轉換為顯示值
        return jsonify([{
            'slid': item.slid,
            'sflag': reverse_sflag_mapping.get(item.sflag, item.sflag),  # 轉換顯示值，如果找不到對應則保持原值
            'slaccount': item.slaccount,
            'sname': item.sname,
            'slevent': item.slevent,
            'sodate': item.sodate.strftime('%Y-%m-%d %H:%M:%S')
        } for item in results])
        
    except Exception as e:
        print(f"查詢發生錯誤: {str(e)}")
=======
import sys
import os

# 將上層目錄加入 sys.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from flask import Blueprint, jsonify, request
from database.models import SystemLog
from database.extensions import db
from datetime import datetime, timedelta
from sqlalchemy.exc import SQLAlchemyError

systemlog_bp = Blueprint('systemlog', __name__)
@systemlog_bp.route('/read', methods=['POST'])
def query_systemlog():
    try:
        data = request.get_json()
        
        # sflag 狀態對應表
        sflag_mapping = {
            "新增": "A",
            "編輯": "E",
            "登入": "L",
            "刪除": "D"
        }
        
        # 建立基礎查詢
        query = SystemLog.query
        
        # sflag 狀態篩選 - 如果不是空字串則進行轉換後篩選
        if data.get('sflag') and data['sflag'] != "":
            db_sflag = sflag_mapping.get(data['sflag'])
            if db_sflag:
                query = query.filter(SystemLog.sflag == db_sflag)
        
        # slaccount 帳號篩選 - 如果不是空字串才進行篩選
        if data.get('slaccount') and data['slaccount'] != "":
            query = query.filter(SystemLog.slaccount.like(f"%{data['slaccount']}%"))
        
        # 日期篩選 - 只有當兩個日期都不是空字串時才進行篩選
        if (data.get('startDate') and data.get('endDate') and 
            data['startDate'] != "" and data['endDate'] != ""):
            try:
                start_date = datetime.strptime(data['startDate'], '%Y-%m-%d')
                end_date = datetime.strptime(data['endDate'], '%Y-%m-%d') + timedelta(days=1)
                query = query.filter(SystemLog.sodate.between(start_date, end_date))
            except ValueError as e:
                return jsonify({'error': '日期格式錯誤'}), 400

        # 執行查詢並排序（最新的排在前面）
        results = query.order_by(SystemLog.sodate.desc()).all()
        
        # 反向轉換 sflag 顯示值的對應表
        reverse_sflag_mapping = {
            "A": "新增",
            "E": "編輯",
            "L": "登入",
            "D": "刪除"
        }
        
        # 轉換為 JSON 格式，並將 sflag 轉換為顯示值
        return jsonify([{
            'slid': item.slid,
            'sflag': reverse_sflag_mapping.get(item.sflag, item.sflag),  # 轉換顯示值，如果找不到對應則保持原值
            'slaccount': item.slaccount,
            'sname': item.sname,
            'slevent': item.slevent,
            'sodate': item.sodate.strftime('%Y-%m-%d %H:%M:%S')
        } for item in results])
        
    except Exception as e:
        print(f"查詢發生錯誤: {str(e)}")
>>>>>>> master
        return jsonify({'error': '查詢發生錯誤'}), 500