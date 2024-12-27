<<<<<<< HEAD
from flask import Blueprint, jsonify, send_from_directory
import os

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


@files_bp.route("/img/<filename>")
def get_image(filename):
    """
    提供圖片檔案存取
    """
    img_dir = os.path.join(BASE_DIR, "img")
    if not os.path.exists(os.path.join(img_dir, filename)):
        return jsonify({"error": "檔案不存在"}), 404
    return send_from_directory(img_dir, filename)
=======
from flask import Blueprint, jsonify, send_from_directory
import os

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


@files_bp.route("/img/<filename>")
def get_image(filename):
    """
    提供圖片檔案存取
    """
    img_dir = os.path.join(BASE_DIR, "img")
    if not os.path.exists(os.path.join(img_dir, filename)):
        return jsonify({"error": "檔案不存在"}), 404
    return send_from_directory(img_dir, filename)
>>>>>>> master
