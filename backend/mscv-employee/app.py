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

# trigger build
@app.route('/employees', methods=['GET'])
def get_employees():
    try:
        conn = get_db_connection()
        with conn.cursor(dictionary=True, buffered=True) as cursor:
            cursor.execute("SELECT * FROM employees")
            employees = cursor.fetchall()
        return jsonify(employees), 200
    except mysql.connector.Error as e:
        print(f"❌ Database error: {e}")
        return jsonify({"error": "Database connection failed"}), 500
    finally:
        conn.close()

@app.route('/employees/<int:id>', methods=['GET'])
def get_employee_by_id(id):
    try:
        conn = get_db_connection()
        with conn.cursor(dictionary=True, buffered=True) as cursor:
            cursor.execute("SELECT * FROM employees WHERE id = %s", (id,))
            employee = cursor.fetchone()
        if employee:
            return jsonify(employee), 200
        else:
            return jsonify({"message": f"Employee with ID {id} not found"}), 404
    except mysql.connector.Error as e:
        print(f"❌ Database error: {e}")
        return jsonify({"error": "Database query failed"}), 500
    finally:
        conn.close()


@app.route('/employees', methods=['POST'])
def add_employee():
    data = request.get_json()
    required_fields = ['firstName', 'lastName', 'email', 'salary', 'date']

    if not all(field in data for field in required_fields):
        return jsonify({"error": "Missing required fields"}), 400

    conn = get_db_connection()
    try:
        with conn.cursor(dictionary=True) as cursor:
            cursor.execute("""
                INSERT INTO employees (firstName, lastName, email, salary, date)
                VALUES (%s, %s, %s, %s, %s)
            """, (data['firstName'], data['lastName'], data['email'], float(data['salary']), data['date']))
            conn.commit()

            cursor.execute("SELECT LAST_INSERT_ID() AS id")
            new_id = cursor.fetchone()['id']
        return jsonify({"message": "Employee added successfully", "id": new_id}), 201
    except mysql.connector.Error as e:
        print(f"❌ Database error: {e}")
        return jsonify({"error": "Failed to insert employee"}), 500
    finally:
        conn.close()


@app.route('/employees/<int:id>', methods=['PUT'])
def update_employee(id):
    data = request.get_json()
    required_fields = ['firstName', 'lastName', 'email', 'salary', 'date']

    if not all(field in data for field in required_fields):
        return jsonify({"error": "Missing required fields"}), 400

    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute("""
                UPDATE employees
                SET firstName=%s, lastName=%s, email=%s, salary=%s, date=%s
                WHERE id=%s
            """, (data['firstName'], data['lastName'], data['email'], float(data['salary']), data['date'], id))
            conn.commit()

            if cursor.rowcount == 0:
                return jsonify({"message": f"Employee with ID {id} not found"}), 404

        return jsonify({"message": f"Employee {id} updated successfully"}), 200
    except mysql.connector.Error as e:
        print(f"❌ Database error: {e}")
        return jsonify({"error": "Failed to update employee"}), 500
    finally:
        conn.close()


@app.route('/employees/<int:id>', methods=['DELETE'])
def delete_employee(id):
    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute("DELETE FROM employees WHERE id=%s", (id,))
            conn.commit()

            if cursor.rowcount == 0:
                return jsonify({"message": f"Employee with ID {id} not found"}), 404

        return jsonify({"message": f"Employee {id} deleted successfully"}), 200
    except mysql.connector.Error as e:
        print(f"❌ Database error: {e}")
        return jsonify({"error": "Failed to delete employee"}), 500
    finally:
        conn.close()

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5002, debug=False)  # Debug off para prod