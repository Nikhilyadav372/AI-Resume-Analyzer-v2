from routes.job_match import job_match_bp
from flask_cors import CORS
from dotenv import load_dotenv

# Load .env FIRST
load_dotenv()

from flask import Flask
from flask_jwt_extended import JWTManager
from datetime import timedelta
from routes.auth import auth

app = Flask(__name__)

CORS(app)

app.config["UPLOAD_FOLDER"] = "uploads"
app.config["JWT_SECRET_KEY"] = "your_super_secret_key"
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(days=7)

jwt = JWTManager(app)
@jwt.invalid_token_loader
def invalid_token_callback(error):
    print("INVALID TOKEN:", error)
    return {"message": error}, 422


@jwt.unauthorized_loader
def missing_token_callback(error):
    print("MISSING TOKEN:", error)
    return {"message": error}, 401


@jwt.expired_token_loader
def expired_token_callback(jwt_header, jwt_payload):
    print("TOKEN EXPIRED")
    return {"message": "Token has expired"}, 401
@jwt.invalid_token_loader
def invalid_token_callback(error):
    print("INVALID TOKEN:", error)
    return {"message": error}, 422


@jwt.unauthorized_loader
def missing_token_callback(error):
    print("MISSING TOKEN:", error)
    return {"message": error}, 401


@jwt.expired_token_loader
def expired_token_callback(jwt_header, jwt_payload):
    print("TOKEN EXPIRED")
    return {"message": "Token has expired"}, 401
app.register_blueprint(auth)
app.register_blueprint(job_match_bp)
@app.route("/")
def home():
    return "Welcome to AI Resume Analyzer"

if __name__ == "__main__":
    print(app.url_map)
    app.run(debug=True)