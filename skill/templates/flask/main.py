from flask import Flask, jsonify
from app.config import Config
from app.database import db

app = Flask(__name__)
app.config.from_object(Config)
db.init_app(app)

with app.app_context():
    from app import models

    db.create_all()


@app.route("/health")
def health_check():
    return jsonify({"status": "ok"})


@app.route("/")
def root():
    return jsonify({"message": f"Welcome to {Config.APP_NAME}"})


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
