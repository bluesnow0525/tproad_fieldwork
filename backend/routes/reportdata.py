import sys
import os

# 將上層目錄加入 sys.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from flask import Blueprint, jsonify, request
from database.db_read import DB_read
from database.models import ReportData
from database.models import SystemLog
from database.models import PermissionMain, PermissionDetail
from database.extensions import db
from datetime import datetime
from sqlalchemy.exc import SQLAlchemyError

reportdata_bp = Blueprint('reportdata', __name__)

BASE_PDF_DIR = "D:/tproad/files/pdf"
BASE_XLSX_DIR = "D:/tproad/files/xlsx"
os.makedirs(BASE_PDF_DIR, exist_ok=True)
os.makedirs(BASE_XLSX_DIR, exist_ok=True)

@reportdata_bp.route('/read', methods=['POST'])
def get_reportdata():
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
                    PermissionDetail.main_category == '案件管理',
                    PermissionDetail.sub_category == '報表作業'
                ).first()

            if not permission or not permission.is_permitted:
                return jsonify({"error": "您沒有權限查看此資料"}), 403

        except SQLAlchemyError as e:
            print(f"權限查詢錯誤: {str(e)}")
            return jsonify({"error": "權限驗證過程發生錯誤"}), 500

        # 原有的資料查詢邏輯
        operator = DB_read(db.session)
        raw_data = operator.select_all("reportdata")
        formatted_data = operator.format_report_data(raw_data)
        return jsonify(formatted_data)

    except Exception as e:
        print(f"發生錯誤: {str(e)}")
        return jsonify({"error": "處理請求時發生錯誤"}), 500

@reportdata_bp.route('/write', methods=['POST'])
def write_reportdata():
    try:
        # 接收 rid
        rid = request.form.get("rid")
        if not rid:
            return jsonify({"error": "缺少項目 ID"}), 400

        uploaded_files = {}
        # 获取当前日期
        current_date = datetime.now().strftime("%Y%m%d")

        # 遍历上传的文件
        for key in request.files:
            file = request.files[key]
            if file:
                # 判断文件类型编号（1-6）
                file_type_map = {
                    "appLog": "1",
                    "appResult": "2",
                    "carLog": "3",
                    "carResult": "4",
                    "motorcycleLog": "5",
                    "motorcycleResult": "6",
                }
                file_type = file_type_map.get(key, "0")  # 默认为 "0"

                # 获取文件扩展名
                file_ext = file.filename.split('.')[-1].lower()

                # 判断存储路径（PDF 或 XLSX）
                if file_ext == "pdf":
                    save_dir = BASE_PDF_DIR
                elif file_ext in ["xlsx", "xls"]:
                    save_dir = BASE_XLSX_DIR
                else:
                    return jsonify({"error": f"不支持的文件類型: {file_ext}"}), 400

                # 生成文件名并保存
                filename = f"{current_date}_{rid}_{file_type}_{key}.{file_ext}"
                filepath = os.path.join(save_dir, filename)
                file.save(filepath)
                uploaded_files[key] = filepath
                
                write_reportdata(rid, key, file_ext, filename)

        return jsonify({"message": "上傳成功", "files": uploaded_files}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

def  write_reportdata(rid, key, file_type, filename):
    """
    更新指定的檔案欄位到 ReportData
    :param rid: int, ReportData 表的主鍵
    :param key: str, 更新的檔案類型（例如 'appLog', 'appResult', 'carLog', 'carResult', 'motorcycleLog', 'motorcycleResult'）
    :param file_type: str, 檔案類型（例如 'xls' 或 'pdf'）
    :param filename: str, 要存入的檔名
    """
    # 定義 key 到欄位的對應關係
    field_mapping = {
        "appLog": {"xlsx": "rfile_exc1", "pdf": "rfile_pdf1"},
        "appResult": {"xlsx": "rfile_exc2", "pdf": "rfile_pdf2"},
        "carLog": {"xlsx": "rfile_new1", "pdf": "rfile_new2"},
        "carResult": {"xlsx": "rfile_exc1_1", "pdf": "rfile_pdf1_1"},
        "motorcycleLog": {"xlsx": "rfile_exc2_1", "pdf": "rfile_pdf2_1"},
        "motorcycleResult": {"xlsx": "rfile_exc2_2", "pdf": "rfile_pdf2_2"},
    }

    if key not in field_mapping or file_type not in field_mapping[key]:
        raise ValueError(f"無效的 key 或 file_type: key={key}, file_type={file_type}")

    # 找到對應的資料欄位
    field_name = field_mapping[key][file_type]

    # 查找記錄
    record = db.session.query(ReportData).filter_by(rid=rid).first()
    if not record:
        raise ValueError(f"未找到 rid={rid} 的記錄")

    # 更新欄位
    setattr(record, field_name, filename)
    
    new_log = SystemLog(
        slaccount="system",        # 帳號
        sname='案件管理 > 報表作業',             # 姓名
        slevent=f"報表日期：{record.rdate}",         # 事件描述
        sodate=datetime.now(),      # 操作日期時間
        sflag='E'                   # 狀態標記
    )
    db.session.add(new_log)

    # 提交變更
    try:
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        raise e