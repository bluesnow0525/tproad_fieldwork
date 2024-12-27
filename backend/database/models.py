# models.py
from .extensions import db

class CaseInfor(db.Model):
    __tablename__ = 'caseinfor'
    caid = db.Column(db.BigInteger, primary_key=True)
    casno = db.Column(db.String(30))
    caifend = db.Column(db.String(1))
    caereason = db.Column(db.String(1000))
    caifupload = db.Column(db.String(1))
    casource = db.Column(db.String(3))
    rcno = db.Column(db.String(30))
    cadate = db.Column(db.Date)
    token = db.Column(db.String(100))
    isObserve = db.Column(db.String(1))
    caDistrict = db.Column(db.String(60))
    caRoad = db.Column(db.String(200))
    caAddr = db.Column(db.String(300))
    caroadDirect = db.Column(db.String(1))
    caroadNum = db.Column(db.BigInteger)
    catype = db.Column(db.String(3))
    cabad = db.Column(db.String(3))
    cabaddegree = db.Column(db.String(3))
    camemo = db.Column(db.String(500))
    cagis_lon = db.Column(db.Numeric(15, 10))
    cagis_lat = db.Column(db.Numeric(15, 10))
    caimg_1 = db.Column(db.String(100))
    caimg_2 = db.Column(db.String(100))
    caimg_3 = db.Column(db.String(100))
    adddate = db.Column(db.DateTime)
    addid = db.Column(db.String(20))
    addname = db.Column(db.String(100))
    cafrom = db.Column(db.String(1))
    cafromno = db.Column(db.String(30))
    cimgsuc = db.Column(db.String(1))
    return_ID = db.Column(db.String(30))
    failreason = db.Column(db.String(4000))
    bmodid = db.Column(db.String(20))
    bmoddate = db.Column(db.DateTime)
    carno = db.Column(db.String(10))
    castatus = db.Column(db.String(1))
    calength = db.Column(db.String(40))
    cawidth = db.Column(db.String(40))
    caarea = db.Column(db.String(40))
    caimg_4 = db.Column(db.String(100))
    caimg_5 = db.Column(db.String(100))
    catime = db.Column(db.DateTime)

class ReportData(db.Model):
    __tablename__ = 'reportdata'
    rid = db.Column(db.BigInteger, primary_key=True)
    rtype = db.Column(db.String(1))
    rdate = db.Column(db.Date)
    rfile_exc1 = db.Column(db.String(50))
    rfile_pdf1 = db.Column(db.String(50))
    rfile_exc2 = db.Column(db.String(50))
    rfile_pdf2 = db.Column(db.String(50))
    radate = db.Column(db.DateTime)
    rfile_new1 = db.Column(db.String(50))
    rfile_new2 = db.Column(db.String(50))
    rcno = db.Column(db.String(30))
    bmodid = db.Column(db.String(20))
    bmoddate = db.Column(db.DateTime)
    rfile_exc1_1 = db.Column(db.String(50))
    rfile_pdf1_1 = db.Column(db.String(50))
    rfile_exc1_2 = db.Column(db.String(50))
    rfile_pdf1_2 = db.Column(db.String(50))
    rfile_exc2_1 = db.Column(db.String(50))
    rfile_pdf2_1 = db.Column(db.String(50))
    rfile_exc2_2 = db.Column(db.String(50))
    rfile_pdf2_2 = db.Column(db.String(50))
    rfile_new1_1 = db.Column(db.String(50))
    rfile_new1_2 = db.Column(db.String(50))
    rfile_new2_1 = db.Column(db.String(50))
    rfile_new2_2 = db.Column(db.String(50))

class RoadCase(db.Model):
    __tablename__ = 'roadcase'

    rcid = db.Column(db.Integer, primary_key=True, autoincrement=True)
    rcstatus = db.Column(db.String(1), nullable=False)
    rcno = db.Column(db.String(30))
    rcname = db.Column(db.String(200))
    rconame = db.Column(db.String(100))
    rcomname = db.Column(db.String(100))
    rcotel = db.Column(db.String(20))
    rcsdate = db.Column(db.Date)
    rcedate = db.Column(db.Date)
    rcnote = db.Column(db.String(500))
    bmodid = db.Column(db.String(20))
    bmoddate = db.Column(db.DateTime)
    rrpttitle = db.Column(db.String(100))
    
class Fleet(db.Model):
    __tablename__ = 'employee'
    emid = db.Column(db.Integer, primary_key=True)
    ifuse = db.Column(db.String(1), nullable=False)  # 是否啟用
    empid = db.Column(db.String(20), nullable=False)  # 帳號
    empworkcomp = db.Column(db.String(10), nullable=False)  # 公司
    empworkdepid = db.Column(db.String(3), nullable=False)  # 部門
    emppasswd = db.Column(db.String(100), nullable=False)  # 密碼
    empname = db.Column(db.String(50), nullable=False)  # 員工名稱
    jobdate = db.Column(db.DateTime, nullable=False)  # 入職日期
    entel = db.Column(db.String(20))  # 聯絡電話
    enemail = db.Column(db.String(100))  # 電子郵件
    msid = db.Column(db.String(10))  # 系統 ID
    rcno = db.Column(db.String(20))  # 負責案件號碼
    etype = db.Column(db.String(30))  # 角色類型
    empcomment = db.Column(db.String(500))  # 備註
    logincount = db.Column(db.Integer, nullable=False, default=0)  # 登錄次數
    logindate = db.Column(db.DateTime)  # 上次登錄日期
    loginip = db.Column(db.String(50))  # 上次登錄 IP
    bmodid = db.Column(db.String(20))  # 修改人
    bmoddate = db.Column(db.DateTime)  # 修改時間
    
class SharedCode(db.Model):
    __tablename__ = 'Checkcode'  # 資料表名稱

    cid = db.Column(db.Integer, primary_key=True)
    ifuse = db.Column(db.String(1), nullable=False)
    corder = db.Column(db.Integer)
    chkclass = db.Column(db.String(2))
    chkclasstitle = db.Column(db.String(50))
    chkcode = db.Column(db.String(5))
    chkitem = db.Column(db.String(100))
    bmodid = db.Column(db.String(20))
    bmoddate = db.Column(db.DateTime)
    
class RoadClass(db.Model):
    __tablename__ = 'roadcode'  # 假設資料表名稱為 roadclass
    rcid = db.Column(db.Integer, primary_key=True)
    caDistrict = db.Column(db.String(255))
    rclass = db.Column(db.String(255))
    rcname = db.Column(db.String(255))
    rcname1 = db.Column(db.String(255))
    rcarea = db.Column(db.String(255))
    
class MenuPermission(db.Model):
    __tablename__ = 'privrole'
    msid = db.Column(db.String(10), primary_key=True)
    mstitle = db.Column(db.String(50))
    comid = db.Column(db.String(10))
    bmodid = db.Column(db.String(20))
    bmoddate = db.Column(db.DateTime)
    
class SystemLog(db.Model):
    __tablename__ = 'Systemlog'
    slid = db.Column(db.Integer, primary_key=True, autoincrement=True)
    slaccount = db.Column(db.String(20))
    sname = db.Column(db.String(20))
    slevent = db.Column(db.String(255))
    sodate = db.Column(db.DateTime)
    sflag = db.Column(db.String(5))