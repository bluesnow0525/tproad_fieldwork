import sys
import os

# 將上層目錄加入 sys.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from flask import Blueprint, jsonify, request
from datetime import datetime
from sqlalchemy import and_
from database.models import CaseInfor
from database.extensions import db

caseinfor_bp = Blueprint('caseinfor', __name__)

@caseinfor_bp.route('/read', methods=['POST'])
def get_caseinfor():
    filters = request.json
    if not filters:
        return jsonify({"error": "請提供篩選條件"}), 400

    # 提取日期範圍並移除
    report_date_from = filters.pop("reportDateFrom", None)
    report_date_to = filters.pop("reportDateTo", None)

    # 將條件進行 unformat 轉換
    db_filters = unformat_caseinfor_data(filters)

    # 構建 SQLAlchemy 查詢條件
    conditions = []
    if report_date_from and report_date_to:
        try:
            date_from = datetime.strptime(report_date_from, "%Y-%m-%d")
            date_to = datetime.strptime(report_date_to, "%Y-%m-%d")
            conditions.append(CaseInfor.cadate.between(date_from, date_to))
        except ValueError:
            return jsonify({"error": "日期格式錯誤，請使用 YYYY-MM-DD"}), 400

    for column, value in db_filters.items():
        if value and hasattr(CaseInfor, column):  # 忽略空值條件
            conditions.append(getattr(CaseInfor, column) == value)

    # 查詢資料庫
    query = db.session.query(CaseInfor)
    if conditions:
        query = query.filter(and_(*conditions))

    results = query.all()

    # 格式化查詢結果為前端所需的格式
    formatted_data = []
    for row in results:
        formatted_data.append({
            "caid": row.caid,
            "result": "是" if row.caifend == "Y" else "否",
            "notification": "是" if row.isObserve == "Y" else "否",
            "inspectionNumber": row.casno,
            "district": row.caDistrict,
            "roadSegment": row.caAddr,
            "damageItem": "AC路面" if row.catype == "A" else "人行道及相關設施",
            "lane": f"順向({row.caroadNum})" if row.caroadDirect == "F" else "",
            "damageLevel": {"1": "輕", "2": "中", "3": "重"}.get(row.cabaddegree, "未知"),
            "damageCondition": row.camemo,
            "reportDate": row.cadate.strftime("%Y/%m/%d") if row.cadate else None,
            "status": "待審" if row.castatus == "0" else "通過",
            "vehicleNumber": row.carno,
            "postedPersonnel": row.cafromno[1:] if row.cafromno and row.cafromno.startswith("C") else None,
            "thumbnail": row.caimg_1 or "default.png",
            "responsibleFactory": {
                "NRP-111-146-001": "NRP-111-146-001_寬聯",
                "PR001": "PR001_盤碩營造",
                "PR002": "PR002_盤碩營造",
            }.get(row.rcno, "未知工廠"),
        })

    return jsonify(formatted_data)

@caseinfor_bp.route('/write', methods=['POST'])
def write_caseinfor():
    data = request.json  # 接收 JSON 資料
    if not data:
        return jsonify({"error": "請提供有效的 JSON 資料"}), 400

    # 如果是單筆資料，包裝成列表
    if isinstance(data, dict):
        data = [data]

    try:
        # 迴圈處理每一筆資料
        for record in data:
            write_caseinfor(record)

        return jsonify({"message": f"共 {len(data)} 筆 CaseInfor 資料已成功寫入"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

def unformat_caseinfor_data(formatted_data):
    """
    將前端條件資料轉換為資料庫條件資料格式，忽略空值。
    """
    mapped_data = {
        "caid": formatted_data.get("caid"),
        "casno": formatted_data.get("inspectionNumber"),
        "caifend": "Y" if formatted_data.get("result") == "是" else "N",
        "isObserve": None if not formatted_data.get("notification") else (
            "Y" if formatted_data.get("notification") == "是" else "N"
        ),
        "rcno": None if not formatted_data.get("responsibleFactory") else (
            "NRP-111-146-001" if "寬聯" in formatted_data["responsibleFactory"] else
            "PR001" if "盤碩營造" in formatted_data["responsibleFactory"] else
            "PR002" if "盤碩營造" in formatted_data["responsibleFactory"] else None
        ),
        "caDistrict": formatted_data.get("district"),
        "caAddr": formatted_data.get("roadSegment"),
        "catype": None if not formatted_data.get("damageItem") else (
            "A" if formatted_data["damageItem"] == "AC路面" else "B"
        ),
        "caroadDirect": "F" if "順向" in formatted_data.get("lane", "") else None,
        "caroadNum": int(formatted_data.get("lane").split("(")[-1][:-1]) if "順向" in formatted_data.get("lane", "") else None,
        "cabaddegree": None if not formatted_data.get("damageLevel") else (
            "1" if formatted_data["damageLevel"] == "輕" else
            "2" if formatted_data["damageLevel"] == "中" else
            "3" if formatted_data["damageLevel"] == "重" else None
        ),
        "camemo": formatted_data.get("damageCondition"),
        "castatus": None if not formatted_data.get("status") else (
            "0" if formatted_data["status"] == "待審" else "1"
        ),
        "carno": formatted_data.get("vehicleNumber"),
        "cafromno": f"C{formatted_data.get('postedPersonnel')}" if formatted_data.get("postedPersonnel") else None,
        "caimg_1": formatted_data.get("thumbnail") if formatted_data.get("thumbnail") != "default.png" else None,
    }
    # 去掉值為 None 或空的項目
    return {k: v for k, v in mapped_data.items() if v not in [None, ""]}

def write_caseinfor(data):
    """
    寫入或更新 CaseInfor 資料
    """
    try:
        # 將傳入的格式化資料轉換為資料庫欄位格式
        unformatted_data = unformat_caseinfor_data(data)
        caid = unformatted_data.pop("caid", None)

        # 如果有提供 caid，嘗試更新記錄
        if caid:
            record = db.session.query(CaseInfor).filter_by(caid=caid).first()
            if record:
                db.session.query(CaseInfor).filter_by(caid=caid).update(unformatted_data)
            else:
                raise ValueError(f"ID {caid} 的記錄不存在，無法更新。")
        else:
            # 如果沒有 caid，則新增記錄
            new_record = CaseInfor(**unformatted_data)
            db.session.add(new_record)

        db.session.commit()
    except Exception as e:
        db.session.rollback()
        raise e