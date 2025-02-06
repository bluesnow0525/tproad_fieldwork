import os
from datetime import datetime
import base64
from flask import request, jsonify, Blueprint
from sqlalchemy import func
from database.models import CaseInfor
from database.models import Fleet
from database.extensions import db
from werkzeug.security import check_password_hash

# Define upload folder path
UPLOAD_FOLDER = "/app/files/img/"

upcasedata_bp = Blueprint('upcasedata', __name__)

@upcasedata_bp.route('/upcasedata', methods=['POST'])
def upload_case_data():
    try:
        # 驗證認證資訊
        account = request.headers.get('account')
        password = request.headers.get('pwd')
        if not verify_credentials(account, password):
            return jsonify({
                'StatusCode': 401,
                'Message': '認證失敗'
            }), 401

        data = request.get_json()
        
        # 基本驗證
        required_fields = ['cadate', 'isObserve', 'user', 'caDistrict', 'caRoad', 
                         'caAddr', 'catype', 'cabad', 'cabaddegree', 'cagis_lon', 
                         'cagis_lat', 'cafrom', 'caimg_1', 'addname', 'cafromno']
        
        missing_fields = [field for field in required_fields if not data.get(field)]
        if missing_fields:
            return jsonify({
                'StatusCode': 400,
                'Message': f'缺少必填欄位: {", ".join(missing_fields)}'
            }), 400

        # 格式驗證
        format_errors = validate_format(data)
        if format_errors:
            return jsonify({
                'StatusCode': 400,
                'Message': '格式錯誤',
                'Errors': format_errors
            }), 400

        # 建立新案件資訊
        new_case = CaseInfor()
        max_id = db.session.query(func.max(CaseInfor.caid)).scalar()
        new_case.caid = (max_id or 0) + 1

        # 取得日期資料夾名稱
        date_obj = datetime.strptime(data['cadate'], '%Y-%m-%d %H:%M:%S.%f')
        folder_date = date_obj.strftime('%Y%m%d')

        saved_images = []  # 記錄已保存的圖片，用於錯誤時清理

        # 處理圖片
        img_fields = ['caimg_1', 'caimg_2', 'caimg_3']
        for idx, field in enumerate(img_fields, 1):
            if data.get(field):
                filename = f"{data['cafromno']}"
                if idx == 1:
                    filename += "_before.jpg"
                elif idx == 2:
                    filename += "_after.jpg"
                else:
                    filename += "_detail.jpg"

                # 儲存圖片
                success, result = save_image(data[field], folder_date, filename)
                if not success:
                    # 清理已保存的圖片
                    for saved_path in saved_images:
                        try:
                            full_path = os.path.join(UPLOAD_FOLDER, saved_path)
                            if os.path.exists(full_path):
                                os.remove(full_path)
                        except Exception:
                            pass
                    return jsonify({
                        'StatusCode': 400,
                        'Message': f'圖片處理錯誤: {result}'
                    }), 400

                saved_images.append(result)
                setattr(new_case, field, result)  # 儲存包含日期資料夾的相對路徑

        # 設定其他欄位
        new_case.cadate = date_obj.date()
        new_case.isObserve = data['isObserve']
        new_case.caDistrict = data['caDistrict']
        new_case.caAddr = data['caRoad'] + data['caAddr']
        new_case.catype = data['catype']
        new_case.cabad = data['cabad']
        new_case.cabaddegree = data['cabaddegree']
        new_case.camemo = data.get('camemo')
        new_case.cagis_lon = data['cagis_lon']
        new_case.cagis_lat = data['cagis_lat']
        new_case.cafrom = data['cafrom']
        new_case.addname = data['addname']
        new_case.cafromno = data['cafromno']
        new_case.casno = data['cafromno']
        new_case.adddate = datetime.now()
        new_case.rcno = data['user']

        if data['catype'] == 'A':
            new_case.caroadDirect = data['caroadDirect']
            new_case.caroadNum = data['caroadNum']

        for field in ['carno', 'calength', 'cawidth', 'caarea']:
            if field in data:
                setattr(new_case, field, data[field])

        # 儲存到資料庫
        try:
            db.session.add(new_case)
            db.session.commit()
            return jsonify({
                'StatusCode': 200,
                'Message': '上傳成功'
            })
        except Exception as e:
            db.session.rollback()
            # 清理已保存的圖片
            for saved_path in saved_images:
                try:
                    full_path = os.path.join(UPLOAD_FOLDER, saved_path)
                    if os.path.exists(full_path):
                        os.remove(full_path)
                except Exception:
                    pass
            raise e

    except Exception as e:
        return jsonify({
            'StatusCode': 500,
            'Message': f'系統錯誤: {str(e)}'
        }), 500

def verify_credentials(account, password):
    user = db.session.query(Fleet).filter_by(empid=account, ifuse='y').first()
    if not user:
        return False
    if check_password_hash(user.emppasswd, password) or user.emppasswd == password:
        return True
    else:
        return False

def validate_base64_image(base64_string):
    """驗證 base64 字串是否為有效的圖片"""
    try:
        # 移除 data:image 前綴如果存在
        if ';base64,' in base64_string:
            base64_string = base64_string.split(';base64,')[1]
        
        # 嘗試解碼
        decoded_data = base64.b64decode(base64_string)
        
        # 檢查是否為有效的 JPG/JPEG 檔案 (檢查檔案標頭)
        if not (decoded_data.startswith(b'\xff\xd8') and decoded_data.endswith(b'\xff\xd9')):
            return False, "圖片格式必須為 JPEG/JPG"
            
        # 檢查檔案大小
        if len(decoded_data) > 3 * 1024 * 1024:  # 3MB
            return False, "圖片大小不能超過3MB"
            
        return True, decoded_data
    except Exception as e:
        return False, f"圖片格式錯誤: {str(e)}"

def save_image(base64_string, folder_date, filename):
    """儲存圖片到指定日期資料夾，但只返回檔名"""
    try:
        # 檢查並創建日期資料夾
        date_folder = os.path.join(UPLOAD_FOLDER, folder_date)
        os.makedirs(date_folder, exist_ok=True)
        
        # 完整的檔案路徑
        file_path = os.path.join(date_folder, filename)
        
        # 驗證並取得圖片數據
        is_valid, result = validate_base64_image(base64_string)
        if not is_valid:
            return False, result
            
        # 儲存圖片
        with open(file_path, 'wb') as f:
            f.write(result)
            
        # 只返回檔名，不包含日期資料夾
        return True, filename
    except Exception as e:
        return False, f"儲存圖片失敗: {str(e)}"
    
def validate_format(data):
    errors = []
    
    # Date format validation
    try:
        datetime.strptime(data['cadate'], '%Y-%m-%d %H:%M:%S.%f')
    except ValueError:
        errors.append("cadate 日期格式錯誤，應為 YYYY-MM-DD HH:MM:SS.fff")

    # isObserve validation (Y/N)
    if data['isObserve'] not in ['Y', 'N']:
        errors.append("isObserve 必須為 'Y' 或 'N'")

    # User validation
    if data.get('user') not in ['PR001', 'PR002']:
        errors.append("使用者代碼必須為 PR001 或 PR002")

    # Field length validations
    length_validations = {
        'caDistrict': 5,
        'caRoad': 20,
        'caAddr': 125,
        'addname': 50,
        'cafromno': 30,
        'user': 20
    }

    for field, max_length in length_validations.items():
        if len(str(data.get(field, ''))) > max_length:
            errors.append(f"{field} 長度不能超過 {max_length} 字元")

    # Damage type validation
    if data['catype'] not in ['A', 'B']:
        errors.append("catype 必須為 'A' 或 'B'")

    # Road specific validations for type A
    if data['catype'] == 'A':
        if not data.get('caroadDirect') or data['caroadDirect'] not in ['F', 'R']:
            errors.append("當 catype 為 'A' 時，caroadDirect 必須為 'F' 或 'R'")
        
        if not data.get('caroadNum') or not isinstance(data['caroadNum'], (int, str)) or \
           not str(data['caroadNum']).isdigit() or int(data['caroadNum']) not in range(1, 6):
            errors.append("當 catype 為 'A' 時，caroadNum 必須為 1-5 之間的數字")

    # Damage code validation
    valid_a_codes = [f'A{i}' for i in range(1, 17)]  # A1-A16
    valid_b_codes = [f'B{i}' for i in range(1, 12)]  # B1-B11
    if data['catype'] == 'A' and data['cabad'] not in valid_a_codes:
        errors.append("AC路面損壞情形代碼錯誤")
    elif data['catype'] == 'B' and data['cabad'] not in valid_b_codes:
        errors.append("人行道損壞情形代碼錯誤")

    # Damage degree validation
    if data['cabaddegree'] not in ['1', '2', '3']:
        errors.append("損壞程度必須為 1-3")

    # Source validation
    if data['cafrom'] not in ['1', '2']:
        errors.append("來源必須為 1(APP) 或 2(車巡)")

    # 檢查必要的圖片提供
    if data['cafrom'] == '1':  # APP來源
        if not data.get('caimg_1'):
            errors.append("APP來源必須上傳損壞照片(caimg_1)")
    
    elif data['cafrom'] == '2':  # 車巡來源
        if not data.get('caimg_1'):
            errors.append("車巡來源必須上傳損壞照片(caimg_1)")
        if not data.get('caimg_2'):
            errors.append("車巡來源必須上傳修復照片(caimg_2)")

    # 檢查所有提供的圖片格式
    if data.get('caimg_1'):
        is_valid, error_msg = validate_base64_image(data['caimg_1'])
        if not is_valid:
            errors.append(f"損壞照片: {error_msg}")
    
    if data.get('caimg_2'):
        is_valid, error_msg = validate_base64_image(data['caimg_2'])
        if not is_valid:
            errors.append(f"修復照片: {error_msg}")
    
    if data.get('caimg_3'):
        is_valid, error_msg = validate_base64_image(data['caimg_3'])
        if not is_valid:
            errors.append(f"細節照片: {error_msg}")

    # Optional numeric field validations
    for field in ['calength', 'cawidth', 'caarea']:
        if data.get(field):
            try:
                float(data[field])
            except ValueError:
                errors.append(f"{field} 必須為數字格式")

    return errors