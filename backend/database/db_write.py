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

    def write_reportdata(self, rid, key, file_type, filename):
        """
        更新指定的檔案欄位到 ReportData
        :param rid: int, ReportData 表的主鍵
        :param key: str, 更新的檔案類型（例如 'appLog', 'appResult', 'carLog', 'carResult', 'motorcycleLog', 'motorcycleResult'）
        :param file_type: str, 檔案類型（例如 'xls' 或 'pdf'）
        :param filename: str, 要存入的檔名
        """
        # 定義 key 到欄位的對應關係
        field_mapping = {
            "appLog": {"xlsx": "rfile_exc1", "pdf": "rfile_pdf1"},
            "appResult": {"xlsx": "rfile_exc2", "pdf": "rfile_pdf2"},
            "carLog": {"xlsx": "rfile_new1", "pdf": "rfile_new2"},
            "carResult": {"xlsx": "rfile_exc1_1", "pdf": "rfile_pdf1_1"},
            "motorcycleLog": {"xlsx": "rfile_exc2_1", "pdf": "rfile_pdf2_1"},
            "motorcycleResult": {"xlsx": "rfile_exc2_2", "pdf": "rfile_pdf2_2"},
        }

        if key not in field_mapping or file_type not in field_mapping[key]:
            raise ValueError(f"無效的 key 或 file_type: key={key}, file_type={file_type}")

        # 找到對應的資料欄位
        field_name = field_mapping[key][file_type]

        # 查找記錄
        record = self.db_session.query(ReportData).filter_by(rid=rid).first()
        if not record:
            raise ValueError(f"未找到 rid={rid} 的記錄")

        # 更新欄位
        setattr(record, field_name, filename)

        # 提交變更
        try:
            self.db_session.commit()
        except Exception as e:
            self.db_session.rollback()
            raise e
