from flask import Flask, jsonify, request
from flask_cors import CORS
import time
import math
import os

app = Flask(__name__)
CORS(app)

# trigger build

# trigger build
@app.route("/heavy_task")
def heavy_task():
    """Simula una carga de CPU por N segundos."""
    seconds = float(request.args.get("seconds", 3))
    start = time.time()
    # Cálculo intensivo para consumir CPU
    while time.time() - start < seconds:
        math.sqrt(999999)  # operación tonta pero pesada
    return jsonify({"message": f"Task done after {seconds} seconds!"})

@app.route("/")
def home():
    return jsonify({"status": "ok", "message": "mscv-stress running"})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5003, debug=False)
