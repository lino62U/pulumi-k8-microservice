from flask import Flask, jsonify, request
import mysql.connector
from flask_cors import CORS
import os

app = Flask(__name__)
CORS(app)

def get_db_connection():
    return mysql.connector.connect(
        host=os.environ.get("DB_HOST", "mysql"),
        user=os.environ.get("DB_USER", "myapp_user"),
        password=os.environ.get("DB_PASSWORD", "mypassword"),
        database=os.environ.get("DB_NAME", "myapp_db")
    )

@app.route("/users", methods=["POST"])
def add_user():
    data = request.json
    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute(
                "INSERT INTO users (name, email, password) VALUES (%s, %s, %s)",
                (data["name"], data["email"], data["password"])
            )
        conn.commit()
        return jsonify({"message": "User added!"}), 201
    finally:
        conn.close()

@app.route("/login", methods=["POST"])
def login():
    data = request.json
    email = data.get("email")
    password = data.get("password")

    conn = get_db_connection()
    try:
        # buffered=True consume todos los resultados auto para evitar "Unread result"
        with conn.cursor(dictionary=True, buffered=True) as cursor:
            cursor.execute("SELECT * FROM users WHERE email = %s AND password = %s", (email, password))
            users = cursor.fetchall()  # Consume todo; maneja duplicados
            user = users[0] if users else None  # Toma el primero
        if user:
            return jsonify({"message": "Login successful", "user": user}), 200
        else:
            return jsonify({"message": "Invalid email or password"}), 401
    finally:
        conn.close()

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001, debug=False)  # Desactiva debug para prod