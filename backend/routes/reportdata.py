import sys
import os

# 將上層目錄加入 sys.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from flask import Blueprint, jsonify, request
from database.db_read import DB_read
from database.db_write import DB_write
from database.extensions import db
from datetime import datetime

reportdata_bp = Blueprint('reportdata', __name__)

BASE_PDF_DIR = "D:/tproad/files/pdf"
BASE_XLSX_DIR = "D:/tproad/files/xlsx"
os.makedirs(BASE_PDF_DIR, exist_ok=True)
os.makedirs(BASE_XLSX_DIR, exist_ok=True)

@reportdata_bp.route('/read', methods=['GET'])
def get_reportdata():
    operator = DB_read(db.session)
    raw_data = operator.select_all("reportdata")
    formatted_data = operator.format_report_data(raw_data)
    return jsonify(formatted_data)

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
        
        operator = DB_write(db.session)

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
                
                operator.write_reportdata(rid, key, file_ext, filename)

        return jsonify({"message": "上傳成功", "files": uploaded_files}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500
