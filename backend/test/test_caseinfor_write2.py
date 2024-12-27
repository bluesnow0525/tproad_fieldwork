<<<<<<< HEAD
import sys
import os

# 將上層目錄加入 sys.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from database.db_write import DB_write
from database.models import CaseInfor
from app import create_app, db

def test_unformat_caseinfor_data():
    """
    測試當輸入資料僅包含 caid 和 result 時，是否會意外修改其他字段
    """
    app = create_app()
    with app.app_context():
        # 初始化 DB_write
        operator = DB_write(db.session)

        # 模擬資料庫內的原始資料
        original_record = CaseInfor(
            caid=1,
            casno="TestInspection001",
            caifend="N",
            isObserve="Y",
            rcno="NRP-111-146-001",
            caDistrict="測試區",
            caAddr="測試路 123 號",
            catype="A",
            caroadDirect="F",
            caroadNum=1,
            cabaddegree="2",
            camemo="測試備註",
            cadate="2024-11-01",
            castatus="0",
            carno="測試車牌",
            cafromno="C12345",
            caimg_1="test_img.png",
        )
        db.session.add(original_record)
        db.session.commit()

        # 模擬輸入資料，僅包含 caid 和 result
        input_data = {
            "caid": 1,
            "result": "是"
        }

        # 執行寫入操作
        operator.write_caseinfor(input_data)

        # 從資料庫讀取更新後的記錄
        updated_record = db.session.query(CaseInfor).filter_by(caid=1).first()

        # 驗證未被提供的欄位是否保持不變
        assert updated_record.casno == original_record.casno, "casno 不應被修改"
        assert updated_record.isObserve == original_record.isObserve, "isObserve 不應被修改"
        assert updated_record.rcno == original_record.rcno, "rcno 不應被修改"
        assert updated_record.caDistrict == original_record.caDistrict, "caDistrict 不應被修改"
        assert updated_record.caAddr == original_record.caAddr, "caAddr 不應被修改"
        assert updated_record.cabaddegree == original_record.cabaddegree, "cabaddegree 不應被修改"
        assert updated_record.camemo == original_record.camemo, "camemo 不應被修改"
        assert updated_record.carno == original_record.carno, "carno 不應被修改"
        assert updated_record.caimg_1 == original_record.caimg_1, "caimg_1 不應被修改"

        # 驗證被修改的欄位
        assert updated_record.caifend == "Y", "caifend 應該根據 result 被正確更新"

        print("測試通過：僅包含 caid 和 result 時，其他字段未被修改。")

if __name__ == "__main__":
    test_unformat_caseinfor_data()
=======
import sys
import os

# 將上層目錄加入 sys.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from database.db_write import DB_write
from database.models import CaseInfor
from app import create_app, db

def test_unformat_caseinfor_data():
    """
    測試當輸入資料僅包含 caid 和 result 時，是否會意外修改其他字段
    """
    app = create_app()
    with app.app_context():
        # 初始化 DB_write
        operator = DB_write(db.session)

        # 模擬資料庫內的原始資料
        original_record = CaseInfor(
            caid=1,
            casno="TestInspection001",
            caifend="N",
            isObserve="Y",
            rcno="NRP-111-146-001",
            caDistrict="測試區",
            caAddr="測試路 123 號",
            catype="A",
            caroadDirect="F",
            caroadNum=1,
            cabaddegree="2",
            camemo="測試備註",
            cadate="2024-11-01",
            castatus="0",
            carno="測試車牌",
            cafromno="C12345",
            caimg_1="test_img.png",
        )
        db.session.add(original_record)
        db.session.commit()

        # 模擬輸入資料，僅包含 caid 和 result
        input_data = {
            "caid": 1,
            "result": "是"
        }

        # 執行寫入操作
        operator.write_caseinfor(input_data)

        # 從資料庫讀取更新後的記錄
        updated_record = db.session.query(CaseInfor).filter_by(caid=1).first()

        # 驗證未被提供的欄位是否保持不變
        assert updated_record.casno == original_record.casno, "casno 不應被修改"
        assert updated_record.isObserve == original_record.isObserve, "isObserve 不應被修改"
        assert updated_record.rcno == original_record.rcno, "rcno 不應被修改"
        assert updated_record.caDistrict == original_record.caDistrict, "caDistrict 不應被修改"
        assert updated_record.caAddr == original_record.caAddr, "caAddr 不應被修改"
        assert updated_record.cabaddegree == original_record.cabaddegree, "cabaddegree 不應被修改"
        assert updated_record.camemo == original_record.camemo, "camemo 不應被修改"
        assert updated_record.carno == original_record.carno, "carno 不應被修改"
        assert updated_record.caimg_1 == original_record.caimg_1, "caimg_1 不應被修改"

        # 驗證被修改的欄位
        assert updated_record.caifend == "Y", "caifend 應該根據 result 被正確更新"

        print("測試通過：僅包含 caid 和 result 時，其他字段未被修改。")

if __name__ == "__main__":
    test_unformat_caseinfor_data()
>>>>>>> master
