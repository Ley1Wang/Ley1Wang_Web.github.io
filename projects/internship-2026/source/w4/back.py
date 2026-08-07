# -*- coding: utf-8 -*-
from flask import Flask, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)


@app.route("/api/get", methods=["GET"])
def get_value():
    value = request.args.get("value", "")
    return f"参数是 {value}"


@app.route("/api/post", methods=["POST"])
def post_value():
    param = request.args.get("param", "")
    data = request.get_json(silent=True) or {}
    body = data.get("body", "")

    return f"body中的参数是 {body}，param中的参数是 {param}"


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=True)
