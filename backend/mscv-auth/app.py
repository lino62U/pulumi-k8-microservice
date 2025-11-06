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
    name = data.get("name")
    email = data.get("email")
    password = data.get("password") or data.get("pass")


    if not all([name, email, password]):
        return jsonify({"error": "Missing fields"}), 400

    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute(
                "INSERT INTO users (name, email, password) VALUES (%s, %s, %s)",
                (name, email, password)
            )
        conn.commit()
        return jsonify({"message": "User added!"}), 201
    except mysql.connector.Error as err:
        print(f"❌ MySQL Error: {err}")
        return jsonify({"error": "Database error"}), 500
    finally:
        conn.close()

# trigger build


@app.route("/login", methods=["POST"])
def login():
    data = request.json
    email = data.get("email")
    password = data.get("password") or data.get("pass")


    if not all([email, password]):
        return jsonify({"error": "Email and password are required"}), 400

    conn = get_db_connection()
    try:
        # buffered=True consume todos los resultados auto para evitar "Unread result"
        with conn.cursor(dictionary=True, buffered=True) as cursor:
            cursor.execute(
                "SELECT id, name, email, role, department FROM users WHERE email = %s AND password = %s",
                (email, password)
            )
            user = cursor.fetchone()

        if user:
            return jsonify({"message": "Login successful", "user": user}), 200
        else:
            return jsonify({"message": "Invalid email or password"}), 401
    except mysql.connector.Error as err:
        print(f"❌ MySQL Error: {err}")
        return jsonify({"error": "Database query failed"}), 500
    finally:
        conn.close()

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001, debug=False)  # Desactiva debug para prod