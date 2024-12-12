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

UPLOAD_FOLDER = "D:/tproad/files/img/"

@caseinfor_bp.route('/read', methods=['POST'])
def get_caseinfor():
    filters = request.json
    if not filters:
        return jsonify({"error": "Filters are required"}), 400

    # Extract date range
    report_date_from = filters.pop("reportDateFrom", None)
    report_date_to = filters.pop("reportDateTo", None)

    # Build SQLAlchemy query conditions
    conditions = []
    if report_date_from and report_date_to:
        try:
            date_from = datetime.strptime(report_date_from, "%Y-%m-%d")
            date_to = datetime.strptime(report_date_to, "%Y-%m-%d")
            conditions.append(CaseInfor.cadate.between(date_from, date_to))
        except ValueError:
            return jsonify({"error": "Invalid date format. Use YYYY-MM-DD"}), 400

    for column, value in filters.items():
        if value and hasattr(CaseInfor, column):  # Ignore empty filters
            if isinstance(value, str):
                conditions.append(getattr(CaseInfor, column).like(f"%{value}%"))
            else:
                conditions.append(getattr(CaseInfor, column) == value)

    # Query database
    query = db.session.query(CaseInfor)
    if conditions:
        query = query.filter(and_(*conditions))

    results = query.all()

    # Format results
    formatted_data = [
        {
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
            "responsibleFactory": {
                "NRP-111-146-001": "NRP-111-146-001_寬聯",
                "PR001": "PR001_盤碩營造",
                "PR002": "PR002_盤碩營造",
            }.get(row.rcno, "未知工廠"),
            # Additional fields
            "uploadToGovernment": "是" if row.caifupload == "Y" else "否",
            "source": row.casource or "",
            "longitude": float(row.cagis_lon) if row.cagis_lon else None,
            "latitude": float(row.cagis_lat) if row.cagis_lat else None,
            "area": f"{row.calength or ''} x {row.cawidth or ''}",
            "modifiedBy": row.bmodid,
            "modifiedDate": row.bmoddate.strftime("%Y/%m/%d %H:%M:%S") if row.bmoddate else None,
            "photoBefore": row.caimg_1 or "default.png",
            "photoAfter": row.caimg_2 or "default.png",
        }
        for row in results
    ]

    return jsonify(formatted_data)

@caseinfor_bp.route('/write', methods=['POST'])
def write_caseinfor():
    try:
        # Handle both JSON and form data
        if request.content_type == 'application/json':
            data = request.json
            if not data:
                return jsonify({"error": "Valid JSON data is required"}), 400
            if isinstance(data, dict):
                data = [data]
        else:
            form_data = request.form
            data = [form_data.to_dict()]

        for record in data:
            # Get case number for file naming
            casno = record.get("inspectionNumber")
            
            # Handle image files if present
            if request.files:
                if 'photoBefore' in request.files:
                    file = request.files['photoBefore']
                    if file and file.filename:
                        # Create filename using case number
                        ext = os.path.splitext(file.filename)[1]
                        new_filename = f"{casno}_before{ext}"
                        file_path = os.path.join(UPLOAD_FOLDER, new_filename)
                        file.save(file_path)
                        record['photoBefore'] = new_filename

                if 'photoAfter' in request.files:
                    file = request.files['photoAfter']
                    if file and file.filename:
                        ext = os.path.splitext(file.filename)[1]
                        new_filename = f"{casno}_after{ext}"
                        file_path = os.path.join(UPLOAD_FOLDER, new_filename)
                        file.save(file_path)
                        record['photoAfter'] = new_filename

            unformatted_data = {
                "caid": record.get("caid"),
                "casno": casno,
                "caifend": "Y" if record.get("result") == "是" else "N",
                "isObserve": "Y" if record.get("notification") == "是" else "N",
                "rcno": {
                    "NRP-111-146-001_寬聯": "NRP-111-146-001",
                    "PR001_盤碩營造": "PR001",
                    "PR002_盤碩營造": "PR002",
                }.get(record.get("responsibleFactory"), None),
                "caDistrict": record.get("district"),
                "caAddr": record.get("roadSegment"),
                "catype": "A" if record.get("damageItem") == "AC路面" else "B",
                "caroadDirect": "F" if "順向" in record.get("lane", "") else None,
                "caroadNum": int(record.get("lane").split("(")[-1][:-1]) if "順向" in record.get("lane", "") else None,
                "cabaddegree": {"輕": "1", "中": "2", "重": "3"}.get(record.get("damageLevel")),
                "camemo": record.get("damageCondition"),
                "cadate": datetime.strptime(record.get("reportDate"), "%Y/%m/%d") if record.get("reportDate") else None,
                "castatus": "0" if record.get("status") == "待審" else "1",
                "carno": record.get("vehicleNumber"),
                "cafromno": f"C{record.get('postedPersonnel')}" if record.get("postedPersonnel") else None,
                "caimg_1": record.get("photoBefore") if record.get("photoBefore") != "default.png" else None,
                "caimg_2": record.get("photoAfter") if record.get("photoAfter") != "default.png" else None,
                "calength": record.get("area").split("x")[0].strip() if record.get("area") else None,
                "cawidth": record.get("area").split("x")[1].strip() if record.get("area") else None,
                "cagis_lon": record.get("longitude"),
                "cagis_lat": record.get("latitude"),
                "bmodid": "system",
                "bmoddate": datetime.utcnow(),
            }

            # Update or insert data
            caid = unformatted_data.pop("caid", None)
            if caid:
                record = db.session.query(CaseInfor).filter_by(caid=caid).first()
                if record:
                    db.session.query(CaseInfor).filter_by(caid=caid).update(unformatted_data)
                else:
                    return jsonify({"error": f"Record with ID {caid} not found"}), 404
            else:
                new_record = CaseInfor(**unformatted_data)
                db.session.add(new_record)

        db.session.commit()
        return jsonify({"message": f"{len(data)} records successfully written"}), 200

    except Exception as e:
        db.session.rollback()
        if os.path.exists(file_path):
            os.remove(file_path)  # Clean up uploaded file if database operation fails
        return jsonify({"error": str(e)}), 500