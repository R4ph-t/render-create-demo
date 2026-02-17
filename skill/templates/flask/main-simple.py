import os

from flask import Flask, jsonify

app = Flask(__name__)


@app.route("/health")
def health_check():
    return jsonify({"status": "ok"})


@app.route("/")
def root():
    return jsonify({"message": "Welcome to {{PROJECT_NAME}}"})


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)
