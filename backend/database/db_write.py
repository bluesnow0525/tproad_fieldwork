from .models import CaseInfor, ReportData
from datetime import datetime

class DB_write:
    def __init__(self, db_session):
        """
        初始化 DB_write 並接受 SQLAlchemy 的 Session 物件
        """
        self.db_session = db_session

    def unformat_caseinfor_data(self, formatted_data):
        """
        將格式化的資料轉換回原本的資料庫欄位格式
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
            "cadate": datetime.strptime(formatted_data.get("reportDate"), "%Y/%m/%d") if formatted_data.get("reportDate") else None,
            "castatus": None if not formatted_data.get("status") else (
                "0" if formatted_data.get("status") == "待審" else "1"
            ),
            "carno": formatted_data.get("vehicleNumber"),
            "cafromno": f"C{formatted_data.get('postedPersonnel')}" if formatted_data.get("postedPersonnel") else None,
            "caimg_1": formatted_data.get("thumbnail") if formatted_data.get("thumbnail") != "default.png" else None,
        }
        return {k: v for k, v in mapped_data.items() if v is not None}  # 去掉值為 None 的項目

    def write_caseinfor(self, data):
        """
        寫入或更新 CaseInfor 資料
        """
        try:
            # 將傳入的格式化資料轉換為資料庫欄位格式
            unformatted_data = self.unformat_caseinfor_data(data)
            caid = unformatted_data.pop("caid", None)

            # 如果有提供 caid，嘗試更新記錄
            if caid:
                record = self.db_session.query(CaseInfor).filter_by(caid=caid).first()
                if record:
                    self.db_session.query(CaseInfor).filter_by(caid=caid).update(unformatted_data)
                else:
                    raise ValueError(f"ID {caid} 的記錄不存在，無法更新。")
            else:
                # 如果沒有 caid，則新增記錄
                new_record = CaseInfor(**unformatted_data)
                self.db_session.add(new_record)

            self.db_session.commit()
        except Exception as e:
            self.db_session.rollback()
            raise e

    def write_reportdata(self, data):
        """
        新增或更新 ReportData 資料
        :param data: 字典格式的資料，包含要新增或更新的欄位與值
        """
        if 'rid' in data:  # 更新操作（根據主鍵 rid）
            record = self.db_session.query(ReportData).get(data['rid'])
            if not record:
                raise ValueError("更新失敗：找不到對應的 rid")
            for key, value in data.items():
                if hasattr(record, key):
                    setattr(record, key, value)
        else:  # 新增操作
            # record = ReportData(**data)
            # self.db_session.add(record)
            pass

        self.db_session.commit()
