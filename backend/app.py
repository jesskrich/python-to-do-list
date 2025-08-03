from flask import Flask, request, jsonify
from flask_cors import CORS
import firebase_admin
from firebase_admin import credentials, firestore
from datetime import datetime

app = Flask(__name__)
CORS(app)  # Enable CORS for React frontend

# Initialize Firebase
cred = credentials.Certificate("config/firebase_connection.json")
firebase_admin.initialize_app(cred)
db = firestore.client()

COLLECTION = "tasks"

def get_tasks():
    """Fetch all tasks ordered by creation time."""
    try:
        tasks = []
        docs = db.collection(COLLECTION).order_by("created_at").stream()
        for doc in docs:
            task_data = doc.to_dict()
            task_data['id'] = doc.id
            tasks.append(task_data)
        return tasks
    except Exception as e:
        print(f"Error fetching tasks: {e}")
        return []

@app.route('/api/tasks', methods=['GET'])
def list_tasks():
    """Get all tasks."""
    tasks = get_tasks()
    return jsonify({"tasks": tasks})

@app.route('/api/tasks', methods=['POST'])
def add_task():
    """Add a new task."""
    try:
        data = request.get_json()
        task_text = data.get('task', '').strip()
        
        if not task_text:
            return jsonify({'error': 'Task cannot be empty'}), 400
        
        doc_ref = db.collection(COLLECTION).add({
            "task": task_text,
            "created_at": datetime.now()
        })
        
        return jsonify({'message': 'Task added successfully', 'id': doc_ref[1].id}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/tasks/<task_id>', methods=['DELETE'])
def delete_task(task_id):
    """Delete a task by ID."""
    try:
        db.collection(COLLECTION).document(task_id).delete()
        return jsonify({'message': 'Task deleted successfully'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint."""
    return jsonify({'status': 'healthy'}), 200

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5001)
