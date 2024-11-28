from flask import Flask
from flask_cors import CORS
from database.extensions import db
from database.config import SQLALCHEMY_DATABASE_URI
from routes.caseinfor import caseinfor_bp
from routes.reportdata import reportdata_bp
from routes.roadcase import roadcase_bp
from routes.files_routes import files_bp  # 匯入檔案相關路由

def create_app():
    app = Flask(__name__)
    CORS(app)

    # 配置資料庫
    app.config['SQLALCHEMY_DATABASE_URI'] = SQLALCHEMY_DATABASE_URI
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

    # 初始化資料庫
    db.init_app(app)

    # 註冊 Blueprint
    app.register_blueprint(caseinfor_bp, url_prefix='/caseinfor')
    app.register_blueprint(reportdata_bp, url_prefix='/reportdata')
    app.register_blueprint(roadcase_bp, url_prefix='/roadcase')
    app.register_blueprint(files_bp, url_prefix='/files')  # 註冊檔案相關路由

    return app

if __name__ == '__main__':
    app = create_app()
    with app.app_context():
        db.create_all()
    app.run(debug=True)
