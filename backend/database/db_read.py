from .models import CaseInfor, ReportData, RoadCase
from datetime import datetime, timedelta

class DB_read:
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
        elif table_name == "roadcase":
            query = self.db_session.query(RoadCase).limit(limit)
        else:
            raise ValueError("無效的資料表名稱")

        results = query.all()
        return [
            {column.name: getattr(result, column.name) for column in result.__table__.columns}
            for result in results
        ]

    def select_within_date_range(self, table_name, date_column, start_date, end_date, limit=100000, offset=0):
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
                "rid":row["rid"],
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

    def format_roadcase_data(self, raw_data):
        """
        將 Contract 資料表結果格式化為前端需求的 JSON 格式
        """
        formatted_data = []

        for row in raw_data:
            formatted_data.append({
                "rcid": row['rcid'],
                "status": "啟用" if row['rcstatus'] == "2" else "停用",
                "caseCode": row['rcno'] or "",
                "caseName": row['rcname'] or "",
                "vendor": row['rconame'] or "",
                "contractPeriod": f"{row['rcsdate'].strftime('%Y/%m/%d')} ~ {row['rcedate'].strftime('%Y/%m/%d')}" 
                                if row['rcsdate'] and row['rcedate'] else "",
                "contactPerson": row['rconame'] or "",
                "contactPhone": row['rcotel'] or "",
                "managerAccount": row['bmodid'] or "",
                "managerName": row['rconame'] or "",
                "contractStart": row['rcsdate'].strftime('%Y/%m/%d') if row['rcsdate'] else "",
                "contractEnd": row['rcedate'].strftime('%Y/%m/%d') if row['rcedate'] else "",
                "notes": row['rcnote'] or "",
            })
        return formatted_data


