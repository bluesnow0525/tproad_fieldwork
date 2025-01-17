import sys
import os

# 將上層目錄加入 sys.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from flask import Blueprint, jsonify, request
from datetime import datetime
from sqlalchemy import and_
from database.models import CaseInfor
from database.models import RoadClass
from database.models import SystemLog
from database.models import PermissionMain, PermissionDetail
from sqlalchemy.exc import SQLAlchemyError
from database.extensions import db

caseinfor_bp = Blueprint('caseinfor', __name__)

UPLOAD_FOLDER = "D:/tproad/files/img/"

@caseinfor_bp.route('/read', methods=['POST'])
def get_caseinfor():
    try:
        filters = request.json
        print("接收到的篩選條件:", filters)
        if not filters:
            return jsonify({"error": "需要提供篩選條件"}), 400
        
        # 檢查權限
        user_pid = filters.get('pid')
        if not user_pid:
            return jsonify({"error": "未提供使用者ID"}), 400

        # 查詢使用者權限
        try:
            permission = db.session.query(PermissionDetail)\
                .join(PermissionMain)\
                .filter(
                    PermissionMain.msid == user_pid,
                    PermissionDetail.main_category == '案件管理',
                    PermissionDetail.sub_category == '案件管理'
                ).first()

            if not permission or not permission.is_permitted:
                return jsonify({"error": "您沒有權限查看此資料"}), 403

        except SQLAlchemyError as e:
            print(f"權限查詢錯誤: {str(e)}")
            return jsonify({"error": "權限驗證過程發生錯誤"}), 500

        # 移除 pid，避免影響後續的篩選邏輯
        filters.pop('pid', None)

        # 前端欄位到資料庫欄位的映射
        field_mapping = {
            "result": "caifend",
            "notification": "isObserve",
            "inspectionNumber": "casno",
            "district": "caDistrict",
            "roadSegment": "caAddr",
            "damageItem": "catype",
            "laneDirection": "caroadDirect",
            "laneNumber": "caroadNum",
            "damageLevel": "cabaddegree",
            "damageCondition": "camemo",
            "status": "castatus",
            "vehicleNumber": "carno",
            "postedPersonnel": "cafromno",
            "responsibleFactory": "rcno",
            "source": "cafrom",
        }

        # 值的轉換映射
        value_mapping = {
            "cabaddegree": {"輕": "1", "中": "2", "重": "3"},
            "catype": {"AC路面": "A", "人行道及相關設施": "B"},
            "cafrom": {
                "APP通報": "1",
                "車巡": "2",
                "系統通報": "3",
                "機車": "4"
            },
            "castatus": {
                "待審": "0",
                "通過": "1"
            },
            "rcno": {
                "NRP-111-146-001_寬聯": "NRP-111-146-001",
                "PR001_盤碩營造": "PR001",
                "PR002_盤碩營造": "PR002"
            },
            "cabad": {
                "A1": "坑洞",
                "A2": "縱向及橫向裂縫",
                "A3": "龜裂",
                "A4": "車轍",
                "A5": "隆起與凹陷",
                "A6": "塊狀裂縫",
                "A7": "推擠",
                "A8": "補綻及管線回填",
                "A9": "冒油",
                "A10": "波浪狀鋪面",
                "A11": "車道與路肩分離",
                "A12": "滑溜裂縫",
                "A13": "骨材剝落",
                "A14": "其他",
                "A15": "人手孔缺失",
                "A16": "薄層剝離",
                "B1": "坑洞",
                "B2": "鋪面破損",
                "B3": "孔蓋周邊破損",
                "B4": "樹穴緣石",
                "B5": "溝蓋路邊緣石",
                "B6": "其他",
                "B7": "鋪面鬆動",
                "B8": "樹木竄根",
                "B9": "私設斜坡道",
                "B10": "側溝蓋破損",
                "B11": "雜草"
            }
        }

        conditions = []

        # 處理日期範圍
        report_date_from = filters.get("reportDateFrom")
        report_date_to = filters.get("reportDateTo")
        
        if report_date_from and report_date_to:
            try:
                date_from = datetime.strptime(report_date_from, "%Y-%m-%d")
                date_to = datetime.strptime(report_date_to, "%Y-%m-%d")
                conditions.append(CaseInfor.cadate.between(date_from, date_to))
            except ValueError:
                return jsonify({"error": "日期格式錯誤"}), 400

        # 處理其他篩選條件
        for front_field, value in filters.items():
            # 跳過空值和日期欄位
            if not value or value == "" or front_field in ["reportDateFrom", "reportDateTo"]:
                continue

            # 獲取對應的資料庫欄位名稱
            db_field = field_mapping.get(front_field)
            if not db_field or not hasattr(CaseInfor, db_field):
                continue

            # 取得資料庫欄位
            db_column = getattr(CaseInfor, db_field)

            # 處理多選值（用逗號分隔的字串）
            if isinstance(value, str) and ',' in value:
                values = [v.strip() for v in value.split(',') if v.strip()]
                if not values:
                    continue

                # 特殊處理特定欄位
                if front_field == "damageItem":
                    mapped_values = ['B' if v == "人行道及相關設施" else 'A' for v in values]
                    conditions.append(db_column.in_(mapped_values))
                elif front_field == "source":
                    mapped_values = [value_mapping["cafrom"].get(v) for v in values]
                    mapped_values = [v for v in mapped_values if v is not None]
                    if mapped_values:
                        conditions.append(db_column.in_(mapped_values))
                else:
                    conditions.append(db_column.in_(values))
            else:
                # 單一值的處理
                if front_field == "damageItem":
                    mapped_value = "B" if value == "人行道及相關設施" else "A"
                    conditions.append(db_column == mapped_value)
                elif front_field == "status":
                    mapped_value = "0" if value == "待審" else "1"
                    conditions.append(db_column == mapped_value)
                elif front_field == "source":
                    mapped_value = value_mapping["cafrom"].get(value)
                    if mapped_value is not None:
                        conditions.append(db_column == mapped_value)
                elif front_field == "responsibleFactory":
                    factory_code = value.split('_')[0] if '_' in value else value
                    conditions.append(db_column == factory_code)
                elif db_field in value_mapping:
                    mapped_value = value_mapping[db_field].get(value)
                    if mapped_value is not None:
                        conditions.append(db_column == mapped_value)
                    elif isinstance(value, str) and value.strip():
                        conditions.append(db_column.like(f"%{value}%"))
                elif isinstance(value, str) and value.strip():
                    conditions.append(db_column.like(f"%{value}%"))

            # 添加 debug 日誌
            print(f"處理欄位 {front_field} (DB: {db_field}), 值: {value}, 條件: {conditions[-1] if conditions else None}")

        print("查詢條件:", conditions)

        # 執行查詢
        query = db.session.query(CaseInfor)
        if conditions:
            query = query.filter(and_(*conditions))

        results = query.all()
        print(f"查詢到 {len(results)} 筆結果")

        # 格式化查詢結果
        formatted_data = [
            {
                "caid": row.caid,
                "result": "是" if row.caifend == "Y" else "否",
                "notification": "是" if row.isObserve == "Y" else "否",
                "inspectionNumber": row.casno,
                "district": row.caDistrict,
                "roadSegment": row.caAddr,
                "caRoad": str(row.caRoad) if row.caRoad else "",
                "damageItem": "AC路面" if row.catype == "A" else "人行道及相關設施",
                "laneDirection": "順向" if row.caroadDirect == "F" else "",
                "laneNumber": str(row.caroadNum) if row.caroadNum else "",
                "damageLevel": {"1": "輕", "2": "中", "3": "重"}.get(row.cabaddegree, "未知"),
                "damageCondition": value_mapping["cabad"].get(row.cabad, ""),
                "damageCondition_code": row.cabad,
                "reportDate": row.cadate.strftime("%Y/%m/%d") if row.cadate else None,
                "status": "待審" if row.castatus == "0" else "通過",
                "vehicleNumber": row.carno,
                "postedPersonnel": row.cafromno if row.cafromno and row.cafromno.startswith("C") else None,
                "responsibleFactory": {
                    "NRP-111-146-001": "NRP-111-146-001_寬聯",
                    "PR001": "PR001_盤碩營造",
                    "PR002": "PR002_盤碩營造",
                }.get(row.rcno, "未知工廠"),
                "uploadToGovernment": "是" if row.caifupload == "Y" else "否",
                "source": {
                    "1": "APP通報",
                    "2": "車巡",
                    "3": "系統通報",
                    "4": "機車"
                }.get(row.cafrom, ""),
                "longitude": float(row.cagis_lon) if row.cagis_lon else None,
                "latitude": float(row.cagis_lat) if row.cagis_lat else None,
                "area": f"{row.caarea or ''}",
                "length": f"{row.calength or ''}",
                "width": f"{row.cawidth or ''}",
                "modifiedBy": row.bmodid,
                "modifiedDate": row.bmoddate.strftime("%Y/%m/%d %H:%M:%S") if row.bmoddate else None,
                "photoBefore": row.caimg_1 or "default.png",
                "photoAfter": row.caimg_2 or "default.png",
            }
            for row in results
        ]

        return jsonify(formatted_data), 200

    except Exception as e:
        print(f"發生錯誤: {str(e)}")
        return jsonify({"error": "處理請求時發生錯誤"}), 500

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
            is_batch_review = (
                record.get("caid") and 
                record.get("result") == "是" and 
                record.get("district") and 
                record.get("caRoad") and
                not record.get("inspectionNumber")  # 用來區分是否為一般更新
            )

            if is_batch_review:
                # 批次審查更新邏輯
                caid = record.get("caid")
                if caid:
                    records = db.session.query(CaseInfor).filter_by(caid=caid).first()
                    if records:
                        update_data = {
                            "caifend": "Y",  # 結案
                            "castatus": "1",  # 狀態改為通過
                            "caDistrict": record.get("district"),
                            "caRoad": record.get("caRoad"),
                            "bmodid": record.get("modifiedBy"),
                            "bmoddate": datetime.now()
                        }
                        db.session.query(CaseInfor).filter_by(caid=caid).update(update_data)
                        
                        # 新增系統日誌
                        new_log = SystemLog(
                            slaccount=record.get("modifiedBy"),
                            sname='案件管理 > 案件管理',
                            slevent=f"批次審查更新，caid：{caid}",
                            sodate=datetime.now(),
                            sflag='E'
                        )
                        db.session.add(new_log)
                    else:
                        return jsonify({"error": f"Record with ID {caid} not found"}), 404
                    continue  # 跳過後續的一般更新邏輯
            else:
                # Get case number for file naming
                casno = record.get("inspectionNumber")
                print(record)
                
                # 取得日期資料夾名稱 (從 reportDate 建立)
                date_folder = None
                if record.get("reportDate"):
                    try:
                        date_obj = datetime.strptime(record.get("reportDate"), "%Y/%m/%d")
                        date_folder = date_obj.strftime('%Y%m%d')
                    except ValueError:
                        return jsonify({"error": "日期格式錯誤"}), 400
                
                # Handle image files if present
                if request.files:
                    if 'photoBefore' in request.files:
                        file = request.files['photoBefore']
                        if file and file.filename:
                            # Create date folder if it doesn't exist
                            folder_path = os.path.join(UPLOAD_FOLDER, date_folder)
                            os.makedirs(folder_path, exist_ok=True)
                            
                            # Create filename using case number
                            ext = os.path.splitext(file.filename)[1]
                            new_filename = f"{casno}_before{ext}"
                            file_path = os.path.join(folder_path, new_filename)
                            file.save(file_path)
                            record['photoBefore'] = new_filename  # 只存檔名

                    if 'photoAfter' in request.files:
                        file = request.files['photoAfter']
                        if file and file.filename:
                            # Create date folder if it doesn't exist
                            folder_path = os.path.join(UPLOAD_FOLDER, date_folder)
                            os.makedirs(folder_path, exist_ok=True)
                            
                            ext = os.path.splitext(file.filename)[1]
                            new_filename = f"{casno}_after{ext}"
                            file_path = os.path.join(folder_path, new_filename)
                            file.save(file_path)
                            record['photoAfter'] = new_filename  # 只存檔名

                # 建立資料庫存儲資料
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
                    "caRoad": record.get("caRoad"),
                    "catype": "A" if record.get("damageItem") == "AC路面" else "B",
                    "caroadDirect": "F" if record.get("laneDirection") == "順向" else None,
                    "caroadNum": int(record.get("laneNumber")) if record.get("laneNumber") else None,
                    "cabaddegree": {"輕": "1", "中": "2", "重": "3"}.get(record.get("damageLevel")),
                    "cabad": {
                        "坑洞": "A1" if record.get("damageItem") == "AC路面" else "B1",
                        "縱向及橫向裂縫": "A2",
                        "龜裂": "A3",
                        "車轍": "A4",
                        "隆起與凹陷": "A5",
                        "塊狀裂縫": "A6",
                        "推擠": "A7",
                        "補綻及管線回填": "A8",
                        "冒油": "A9",
                        "波浪狀鋪面": "A10",
                        "車道與路肩分離": "A11",
                        "滑溜裂縫": "A12",
                        "骨材剝落": "A13",
                        "其他": "A14" if record.get("damageItem") == "AC路面" else "B6",
                        "人手孔缺失": "A15",
                        "薄層剝離": "A16",
                        "鋪面破損": "B2",
                        "孔蓋周邊破損": "B3",
                        "樹穴緣石": "B4",
                        "溝蓋路邊緣石": "B5",
                        "鋪面鬆動": "B7",
                        "樹木竄根": "B8",
                        "私設斜坡道": "B9",
                        "側溝蓋破損": "B10",
                        "雜草": "B11"
                    }.get(record.get("damageCondition"), ""),
                    "cadate": datetime.strptime(record.get("reportDate"), "%Y/%m/%d") if record.get("reportDate") else None,
                    "castatus": "0" if record.get("status") == "待審" else "1",
                    "carno": record.get("vehicleNumber"),
                    "cafrom": {
                        "APP通報": "1",
                        "車巡": "2",
                        "系統通報": "3",
                        "機車": "4"
                    }.get(record.get("source")), 
                    "cafromno": f"{record.get('postedPersonnel')}" if record.get("postedPersonnel") else None,
                    "caimg_1": record.get("photoBefore") if record.get("photoBefore") != "default.png" else None,
                    "caimg_2": record.get("photoAfter") if record.get("photoAfter") != "default.png" else None,
                    "caarea": record.get("area") if record.get("area") else None,
                    "calength": record.get("length") if record.get("length") else None,
                    "cawidth": record.get("width") if record.get("width") else None,
                    "cagis_lon": record.get("longitude"),
                    "cagis_lat": record.get("latitude"),
                    "bmodid": record.get("modifiedBy"),
                    "bmoddate": datetime.now(),
                }

                # Update or insert data
                caid = unformatted_data.pop("caid", None)
                if caid:
                    records = db.session.query(CaseInfor).filter_by(caid=caid).first()
                    if records:
                        db.session.query(CaseInfor).filter_by(caid=caid).update(unformatted_data)
                        new_log = SystemLog(
                            slaccount=record.get("modifiedBy"),
                            sname='案件管理 > 案件管理',
                            slevent=f"巡查編號：{casno}，查報日期：{record.get('reportDate')}",
                            sodate=datetime.now(),
                            sflag='E'
                        )
                        db.session.add(new_log)
                    else:
                        return jsonify({"error": f"Record with ID {caid} not found"}), 404
                else:
                    new_record = CaseInfor(**unformatted_data)
                    db.session.add(new_record)
        
        db.session.commit()
        return jsonify({"message": f"{len(data)} records successfully written"}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@caseinfor_bp.route('/delete', methods=['POST'])
def delete_caseinfor():
    try:
        data = request.get_json()
        ids_to_delete = data.get('ids', [])
        
        if not ids_to_delete:
            return jsonify({"error": "No IDs provided for deletion"}), 400
            
        # 刪除相關圖片
        cases = CaseInfor.query.filter(CaseInfor.caid.in_(ids_to_delete)).all()
        for case in cases:
            # 根據日期取得資料夾名稱
            if case.cadate:
                date_folder = case.cadate.strftime('%Y%m%d')
                
                # 刪除相關的圖片文件
                for img_field in [case.caimg_1, case.caimg_2, case.caimg_3]:
                    if img_field:
                        try:
                            # 組合完整路徑
                            file_path = os.path.join(UPLOAD_FOLDER, date_folder, img_field)
                            if os.path.exists(file_path):
                                os.remove(file_path)
                                # 檢查並刪除空的日期資料夾
                                folder_path = os.path.dirname(file_path)
                                if not os.listdir(folder_path):
                                    os.rmdir(folder_path)
                        except Exception as e:
                            print(f"Error deleting image file {img_field}: {str(e)}")
            
            # 記錄系統日誌
            new_log = SystemLog(
                slaccount=request.headers.get('user', 'unknown'),
                sname='案件管理 > 案件管理',
                slevent=f"刪除巡查編號：{case.casno}",
                sodate=datetime.now(),
                sflag='D'
            )
            db.session.add(new_log)

        # 執行批量刪除
        delete_result = CaseInfor.query.filter(CaseInfor.caid.in_(ids_to_delete)).delete(synchronize_session=False)
        
        db.session.commit()
        
        return jsonify({
            "message": f"Successfully deleted {delete_result} records",
            "deleted_count": delete_result
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500
    
@caseinfor_bp.route('/road-segments/<district>', methods=['GET'])
def get_road_segments(district):
    try:
        # Get category from query parameters
        category = request.args.get('category')
        
        # Create base query
        query = RoadClass.query.filter_by(caDistrict=district)
        
        # Add category filter if provided
        if category:
            # Map frontend categories to rclass values
            category_mapping = {
                "8上": "8上",
                "8下": "8下",
                "步巡": "步巡",
                "地下道高架橋": "地下道高架橋"
            }
            
            mapped_category = category_mapping.get(category)
            if mapped_category:
                query = query.filter_by(rclass=mapped_category)
        
        # Execute query
        segments = query.all()
        
        return jsonify([{
            'value': str(seg.rcid),
            'label': f"{seg.rclass}-{seg.rcname}-{seg.rcarea}".strip()
        } for seg in segments]), 200
        
    except Exception as e:
        print(f"Error in get_road_segments: {str(e)}")  # Add logging for debugging
        return jsonify({"error": str(e)}), 500