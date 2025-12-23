"""
Simple Flask API to track website visitors
Stores visitor count in a JSON file
"""
from flask import Flask, jsonify, request
from flask_cors import CORS
import json
import os
from datetime import datetime

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

VISITOR_COUNT_FILE = 'visitor_count.json'

def load_visitor_count():
    """Load visitor count from file"""
    if os.path.exists(VISITOR_COUNT_FILE):
        try:
            with open(VISITOR_COUNT_FILE, 'r') as f:
                data = json.load(f)
                return data.get('count', 0), data.get('last_updated', '')
        except:
            return 0, ''
    return 0, ''

def save_visitor_count(count):
    """Save visitor count to file"""
    data = {
        'count': count,
        'last_updated': datetime.now().isoformat()
    }
    with open(VISITOR_COUNT_FILE, 'w') as f:
        json.dump(data, f, indent=2)

@app.route('/api/visitors', methods=['GET'])
def get_visitor_count():
    """Get current visitor count"""
    count, last_updated = load_visitor_count()
    return jsonify({
        'count': count,
        'last_updated': last_updated
    })

@app.route('/api/visitors/increment', methods=['POST'])
def increment_visitor_count():
    """Increment visitor count (called when a new visitor arrives)"""
    count, _ = load_visitor_count()
    count += 1
    save_visitor_count(count)
    return jsonify({
        'count': count,
        'success': True
    })

if __name__ == '__main__':
    # Initialize count file if it doesn't exist
    if not os.path.exists(VISITOR_COUNT_FILE):
        save_visitor_count(0)
    
    print("Visitor counter API running on http://127.0.0.1:5000")
    print("Endpoints:")
    print("  GET  /api/visitors - Get current count")
    print("  POST /api/visitors/increment - Increment count")
    app.run(host='127.0.0.1', port=5000, debug=True)

