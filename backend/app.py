# app.py
from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
from config import SQLALCHEMY_DATABASE_URI
from backend.database.extensions import db
from backend.database.db_operations import DbOperator
from datetime import datetime
import os

app = Flask(__name__)
CORS(app)

app.config['SQLALCHEMY_DATABASE_URI'] = SQLALCHEMY_DATABASE_URI
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db.init_app(app)

# 定義檔案基礎路徑
BASE_DIR = os.path.abspath("D:/tproad/files")

# 提供 PDF 檔案下載服務
@app.route("/files/pdf/<filename>")
def download_pdf(filename):
    pdf_dir = os.path.join(BASE_DIR, "pdf")
    return send_from_directory(pdf_dir, filename, as_attachment=True)

# 提供 Excel 檔案下載服務
@app.route("/files/xlsx/<filename>")
def download_xlsx(filename):
    xlsx_dir = os.path.join(BASE_DIR, "xlsx")
    return send_from_directory(xlsx_dir, filename, as_attachment=True)

# 提供圖片檔案存取
@app.route("/files/img/<filename>")
def get_image(filename):
    img_dir = os.path.join(BASE_DIR, "img")
    return send_from_directory(img_dir, filename)

@app.route('/caseinfor', methods=['POST'])
def get_caseinfor():
    """
    接收 POST 請求，根據傳入的日期範圍查詢 CaseInfor 資料表
    """
    with app.app_context():
        # 獲取 POST 請求中的 JSON 資料
        data = request.json
        start_date = data.get('startDate')
        end_date = data.get('endDate')

        # 檢查必須的日期參數
        if not start_date or not end_date:
            return jsonify({"error": "startDate 和 endDate 是必填參數"}), 400

        # 將日期轉換為 datetime 對象
        try:
            start_date = datetime.strptime(start_date, "%Y-%m-%d")
            end_date = datetime.strptime(end_date, "%Y-%m-%d")
        except ValueError:
            return jsonify({"error": "日期格式錯誤，請使用 YYYY-MM-DD"}), 400

        # 查詢指定日期範圍的數據
        operator = DbOperator(db.session)
        raw_data = operator.select_within_date_range(
            table_name="caseinfor",
            date_column="cadate",
            start_date=start_date,
            end_date=end_date,
        )
        formatted_data = operator.format_caseinfor_data(raw_data)

    return jsonify(formatted_data)

@app.route('/reportdata', methods=['GET'])
def get_reportdata():
    with app.app_context():
        operator = DbOperator(db.session)
        raw_data = operator.select_all("reportdata")
        formatted_data = operator.format_report_data(raw_data)
    return jsonify(formatted_data)

if __name__ == '__main__':
    with app.app_context():
        db.create_all()  # 確保資料表存在
    app.run(debug=True)
