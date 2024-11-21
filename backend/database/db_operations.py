from backend.database.models import CaseInfor, ReportData
from datetime import datetime, timedelta

class DbOperator:
    def __init__(self, db_session):
        """
        初始化 DbOperator 並接受 SQLAlchemy 的 Session 物件
        """
        self.db_session = db_session

    def select_all(self, table_name, limit=500000):
        """
        查詢資料表並限制返回筆數，預設最多 50000 筆
        :param table_name: 要查詢的資料表名稱
        :param limit: 返回的最大資料筆數
        """
        if table_name == "caseinfor":
            query = self.db_session.query(CaseInfor).limit(limit)
        elif table_name == "reportdata":
            query = self.db_session.query(ReportData).limit(limit)
        else:
            raise ValueError("無效的資料表名稱")

        results = query.all()
        return [
            {column.name: getattr(result, column.name) for column in result.__table__.columns}
            for result in results
        ]

    def select_within_date_range(self, table_name, date_column, start_date, end_date, limit=10000, offset=0):
        """
        查詢指定日期範圍內的資料，並支援分頁
        :param table_name: 資料表名稱
        :param date_column: 日期欄位名稱
        :param start_date: 查詢的起始日期
        :param end_date: 查詢的結束日期
        :param limit: 返回的最大資料筆數
        :param offset: 查詢起始位置（分頁用）
        """
        if table_name == "caseinfor":
            query = self.db_session.query(CaseInfor).filter(
                getattr(CaseInfor, date_column).between(start_date, end_date)
            ).order_by(CaseInfor.caid).limit(limit).offset(offset)
        elif table_name == "reportdata":
            query = self.db_session.query(ReportData).filter(
                getattr(ReportData, date_column).between(start_date, end_date)
            ).order_by(ReportData.rid).limit(limit).offset(offset)
        else:
            raise ValueError("無效的資料表名稱")

        results = query.all()
        return [
            {column.name: getattr(result, column.name) for column in result.__table__.columns}
            for result in results
        ]

    def format_report_data(self, raw_data):
        """
        將 ReportData 資料表結果格式化為特定 JSON 格式
        """
        formatted_data = []
        # one_month_ago = datetime.utcnow() - timedelta(days=30)
        
        for row in raw_data:
            # if row["rdate"] and row["rdate"] < one_month_ago.date():
            #     continue
            
            responsible_factory = "NRP-111-146-001_寬聯" if row["rcno"] == "NRP-111-146-001" else \
                                  "PR001_盤碩營造" if row["rcno"] == "PR001" else \
                                  "PR002_盤碩營造" if row["rcno"] == "PR002" else "未知工廠"

            formatted_data.append({
                "responsibleFactory": responsible_factory,
                "reportDate": row["rdate"].strftime("%Y-%m-%d") if row["rdate"] else None,
                "appLog": {
                    "xls": row['rfile_exc1'] if row["rfile_exc1"] else None,
                    "pdf": row['rfile_pdf1'] if row["rfile_pdf1"] else None,
                },
                "appResult": {
                    "xls": row['rfile_exc2'] if row["rfile_exc2"] else None,
                    "pdf": row['rfile_pdf2'] if row["rfile_pdf2"] else None,
                },
                "carLog": {
                    "xls": row['rfile_new1'] if row["rfile_new1"] else None,
                    "pdf": row['rfile_new2'] if row["rfile_new2"] else None,
                },
                "carResult": {
                    "xls": row['rfile_exc1_1'] if row["rfile_exc1_1"] else None,
                    "pdf": row['rfile_pdf1_1'] if row["rfile_pdf1_1"] else None,
                },
                "motorcycleLog": {
                    "xls": row['rfile_exc2_1'] if row["rfile_exc2_1"] else None,
                    "pdf": row['rfile_pdf2_1'] if row["rfile_pdf2_1"] else None,
                },
                "motorcycleResult": {
                    "xls": row['rfile_exc2_2'] if row["rfile_exc2_2"] else None,
                    "pdf": row['rfile_pdf2_2'] if row["rfile_pdf2_2"] else None,
                },
            })
        return formatted_data
    
    def format_caseinfor_data(self, raw_data):
        """
        將 CaseInfor 資料表結果格式化為指定 JSON 格式，並確保所有回傳文字不含空格
        """
        formatted_data = []
        for row in raw_data:
            # 設定 result 與 notification
            result = "是" if row["caifend"] == "Y" else "否"
            notification = "是" if row["isObserve"] == "Y" else "否"

            # 負責廠商
            responsible_factory = "NRP-111-146-001_寬聯" if row["rcno"] == "NRP-111-146-001" else \
                                  "PR001_盤碩營造" if row["rcno"] == "PR001" else \
                                  "PR002_盤碩營造" if row["rcno"] == "PR002" else "未知工廠"

            # 根據 cabaddegree 設定損壞等級
            damage_level = "輕" if row["cabaddegree"].strip() == "1" else \
                        "中" if row["cabaddegree"].strip() == "2" else \
                        "重" if row["cabaddegree"].strip() == "3" else "未知"

            # 格式化 JSON
            formatted_data.append({
                "result": result.strip(),
                "notification": notification.strip(),
                "responsibleFactory": responsible_factory.strip(),
                "inspectionNumber": row["casno"].strip(),
                "district": row["caDistrict"].strip(),
                "roadSegment": row["caAddr"].strip(),
                "damageItem": "AC路面" if row["catype"].strip() == "A" else "人行道及相關設施",
                "lane": f"順向({row['caroadNum']})" if row["caroadDirect"] else "",
                "damageLevel": damage_level.strip(),
                "damageCondition": row["camemo"].strip() if row["camemo"] == "F" else "",
                "reportDate": row["cadate"].strftime("%Y/%m/%d") if row["cadate"] else None,
                "status": "待審" if row["castatus"].strip() == "0" else "通過",
                "vehicleNumber": row["carno"].strip(),
                "postedPersonnel": row["cafromno"][:5].strip() if row["cafromno"] and row["cafromno"][0] == "C" else None,
                "thumbnail": row["caimg_1"].strip() if row["caimg_1"] else "default.png",
            })
        return formatted_data


