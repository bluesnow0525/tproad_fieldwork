from backend.database.db_read import DB_read
from app import app, db  # 引入 Flask 應用程式和資料庫擴展

def test_connection():
    with app.app_context():  # 設定應用程式上下文
        try:
            # 初始化 DbOperator
            operator = DB_read(db.session)
            
            # 測試查詢 CaseInfor 資料表
            caseinfor_data = operator.select_all("caseinfor")
            print("CaseInfor 資料表前 20 筆資料:", caseinfor_data[:2])
            
            # 測試查詢 ReportData 資料表
            # reportdata_data = operator.select_all("reportdata")
            # print("ReportData 資料表前 5 筆資料:", reportdata_data[:20])
            
            print("\n資料庫連線成功並成功抓取資料！")
        except Exception as e:
            print("資料庫連線或查詢失敗:", e)

if __name__ == '__main__':
    test_connection()
