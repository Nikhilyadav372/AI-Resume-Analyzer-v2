import os
from datetime import timedelta

from dotenv import load_dotenv

# Load environment variables before importing application modules.
load_dotenv()

from flask import Flask, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from werkzeug.middleware.proxy_fix import ProxyFix

from routes.auth import auth
from routes.job_match import job_match_bp


def create_app():
    app = Flask(__name__)

    app.config["JWT_SECRET_KEY"] = os.getenv(
        "JWT_SECRET_KEY",
        "local-development-secret-change-me",
    )
    app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(
        hours=int(os.getenv("JWT_EXPIRES_HOURS", "24"))
    )

    # Railway runs the app behind a reverse proxy.
    app.wsgi_app = ProxyFix(
        app.wsgi_app,
        x_for=1,
        x_proto=1,
        x_host=1,
    )

    allowed_origins = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ]

    for variable in ("FRONTEND_URL", "NETLIFY_URL"):
        url = os.getenv(variable)
        if url:
            allowed_origins.append(url.rstrip("/"))

    CORS(
        app,
        resources={r"/*": {"origins": allowed_origins}},
        supports_credentials=True,
    )

    jwt = JWTManager(app)

    @jwt.invalid_token_loader
    def invalid_token_callback(error):
        return jsonify(message="Invalid token", error=str(error)), 422

    @jwt.unauthorized_loader
    def missing_token_callback(error):
        return jsonify(message="Authorization token is required"), 401

    @jwt.expired_token_loader
    def expired_token_callback(jwt_header, jwt_payload):
        return jsonify(message="Token has expired"), 401

    app.register_blueprint(auth)
    app.register_blueprint(job_match_bp)

    @app.get("/")
    def home():
        return jsonify(
            service="AI Resume Analyzer API",
            status="running",
        )

    @app.get("/health")
    def health():
        return jsonify(status="ok")

    return app


app = create_app()


if __name__ == "__main__":
    app.run(
        host="0.0.0.0",
        port=int(os.getenv("PORT", "5000")),
        debug=os.getenv("FLASK_DEBUG", "false").lower() == "true",
    )