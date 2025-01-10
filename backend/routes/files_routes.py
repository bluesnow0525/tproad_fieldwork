from flask import Blueprint, jsonify, send_from_directory
import os
from datetime import datetime

# 定義 Blueprint
files_bp = Blueprint('files', __name__)

# 定義檔案基礎路徑
BASE_DIR = os.path.abspath("D:/tproad/files")

@files_bp.route("/pdf/<filename>")
def download_pdf(filename):
    """
    提供 PDF 檔案下載服務
    """
    pdf_dir = os.path.join(BASE_DIR, "pdf")
    if not os.path.exists(os.path.join(pdf_dir, filename)):
        return jsonify({"error": "檔案不存在"}), 404
    return send_from_directory(pdf_dir, filename, as_attachment=True)

@files_bp.route("/xlsx/<filename>")
def download_xlsx(filename):
    """
    提供 Excel 檔案下載服務
    """
    xlsx_dir = os.path.join(BASE_DIR, "xlsx")
    if not os.path.exists(os.path.join(xlsx_dir, filename)):
        return jsonify({"error": "檔案不存在"}), 404
    return send_from_directory(xlsx_dir, filename, as_attachment=True)

@files_bp.route("/img/<date>/<filename>")
def get_image(date, filename):
    """
    提供圖片檔案存取，指定日期資料夾
    路徑格式: /img/YYYYMMDD/filename
    """
    try:
        img_path = os.path.join(BASE_DIR, "img", date)
        if not os.path.exists(os.path.join(img_path, filename)):
            return jsonify({"error": "檔案不存在"}), 404
        return send_from_directory(img_path, filename)
    except Exception as e:
        return jsonify({"error": f"存取圖片時發生錯誤: {str(e)}"}), 500