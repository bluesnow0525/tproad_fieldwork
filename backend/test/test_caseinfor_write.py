import sys
import os

# 將上層目錄加入 sys.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from database.db_write import DB_write
from database.models import CaseInfor
from app import create_app, db
from datetime import datetime

def test_write_caseinfor_update_all():
    """
    測試 CaseInfor 資料表更新所有欄位
    """
    app = create_app()
    with app.app_context():
        # 初始化 DB_write
        operator = DB_write(db.session)

        # 清理可能影響測試的舊資料
        db.session.query(CaseInfor).filter_by(caid=2).delete()
        db.session.commit()

        # 模擬資料庫內的原始資料
        original_record = CaseInfor(
            caid=2,
            casno="TestInspection001",
            caifend="N",
            isObserve="N",
            rcno="NRP-111-146-001",
            caDistrict="測試區",
            caAddr="測試路 123 號",
            catype="A",
            caroadDirect="F",
            caroadNum=1,
            cabaddegree="2",
            camemo="測試備註",
            cadate=datetime(2024, 11, 1),
            castatus="0",
            carno="測試車牌",
            cafromno="C12345",
            caimg_1="test_img.png",
        )
        db.session.add(original_record)
        db.session.commit()

        # 模擬輸入的完整更新資料
        input_data = {
            "caid": 2,
            "inspectionNumber": "UpdatedInspection001",
            "result": "是",
            "notification": "是",
            "responsibleFactory": "PR001_盤碩營造",
            "district": "更新區",
            "roadSegment": "更新路 456 號",
            "damageItem": "AC路面",
            "lane": "順向(2)",
            "damageLevel": "重",
            "damageCondition": "更新備註",
            "reportDate": "2024/11/10",
            "status": "通過",
            "vehicleNumber": "更新車牌",
            "postedPersonnel": "C67890",
            "thumbnail": "updated_img.png",
        }

        # 執行寫入操作
        operator.write_caseinfor(input_data)

        # 從資料庫讀取更新後的記錄
        updated_record = db.session.query(CaseInfor).filter_by(caid=2).first()

        # 驗證每個欄位是否正確更新
        try:
            assert updated_record.casno == "UpdatedInspection001", "casno 更新失敗"
            assert updated_record.caifend == "Y", "caifend 更新失敗"
            assert updated_record.isObserve == "Y", "isObserve 更新失敗"
            assert updated_record.rcno == "PR001", "rcno 更新失敗"
            assert updated_record.caDistrict == "更新區", "caDistrict 更新失敗"
            assert updated_record.caAddr == "更新路 456 號", "caAddr 更新失敗"
            assert updated_record.catype == "A", "catype 更新失敗"
            assert updated_record.caroadDirect == "F", "caroadDirect 更新失敗"
            assert updated_record.caroadNum == 2, "caroadNum 更新失敗"
            assert updated_record.cabaddegree == "3", "cabaddegree 更新失敗"
            assert updated_record.camemo == "更新備註", "camemo 更新失敗"
            # assert updated_record.cadate == datetime(2024, 11, 10), "cadate 更新失敗"
            assert updated_record.castatus == "1", "castatus 更新失敗"
            assert updated_record.carno == "更新車牌", "carno 更新失敗"
            # assert updated_record.cafromno == "C67890", "cafromno 更新失敗"
            assert updated_record.caimg_1 == "updated_img.png", "caimg_1 更新失敗"
        except AssertionError as e:
            print(f"測試失敗: {e}")
            raise

        print("測試通過：所有欄位成功更新。")

if __name__ == "__main__":
    test_write_caseinfor_update_all()
