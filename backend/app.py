from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_bcrypt import Bcrypt
import jwt
import sqlite3
import json
import os
from datetime import datetime, timedelta
from functools import wraps
from dotenv import load_dotenv

# Ensure we load the .env located in the backend directory
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), '.env'))

app = Flask(__name__)
# Allow the deployed frontend by default; can be overridden with CORS_ORIGINS env var
CORS(app, resources={r"/*": {"origins": os.getenv('CORS_ORIGINS', 'https://ai-internship-frontend2.onrender.com')}})
bcrypt = Bcrypt(app)

app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'your-super-secret-key-change-in-production')

# ─── Database Connection ────────────────────────────────────────────────────
def get_db():
    db_path = os.path.join(os.path.dirname(__file__), 'database.sqlite3')
    conn = sqlite3.connect(db_path, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    # enable foreign keys
    conn.execute('PRAGMA foreign_keys = ON;')
    return conn

# ─── JWT Auth Decorator ──────────────────────────────────────────────────────
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization', '').replace('Bearer ', '')
        if not token:
            return jsonify({'error': 'Token is missing'}), 401
        try:
            data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
            current_user_id = data['user_id']
        except jwt.ExpiredSignatureError:
            return jsonify({'error': 'Token has expired'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'error': 'Token is invalid'}), 401
        return f(current_user_id, *args, **kwargs)
    return decorated

# ─── AUTH ROUTES ─────────────────────────────────────────────────────────────

@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    name = data.get('name', '').strip()
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')
    skills = data.get('skills', [])

    if not name or not email or not password:
        return jsonify({'error': 'Name, email, and password are required'}), 400
    if len(password) < 6:
        return jsonify({'error': 'Password must be at least 6 characters'}), 400

    skills_json = json.dumps(skills)
    hashed_pw = bcrypt.generate_password_hash(password).decode('utf-8')

    try:
        db = get_db()
        cursor = db.cursor()
        cursor.execute('SELECT id FROM users WHERE email = ?', (email,))
        if cursor.fetchone():
            cursor.close()
            db.close()
            return jsonify({'error': 'Email already registered'}), 409

        cursor.execute(
            'INSERT INTO users (name, email, password, skills) VALUES (?, ?, ?, ?)',
            (name, email, hashed_pw, skills_json)
        )
        user_id = cursor.lastrowid
        db.commit()
        cursor.close()
        db.close()

        token = jwt.encode({
            'user_id': user_id,
            'exp': datetime.utcnow() + timedelta(days=7)
        }, app.config['SECRET_KEY'], algorithm='HS256')

        return jsonify({
            'message': 'Registration successful',
            'token': token,
            'user': {'id': user_id, 'name': name, 'email': email, 'skills': skills}
        }), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')

    if not email or not password:
        return jsonify({'error': 'Email and password are required'}), 400

    try:
        db = get_db()
        cursor = db.cursor()
        cursor.execute('SELECT * FROM users WHERE email = ?', (email,))
        row = cursor.fetchone()
        cursor.close()
        db.close()

        user = dict(row) if row else None

        if not user or not bcrypt.check_password_hash(user['password'], password):
            return jsonify({'error': 'Invalid email or password'}), 401

        token = jwt.encode({
            'user_id': user['id'],
            'exp': datetime.utcnow() + timedelta(days=7)
        }, app.config['SECRET_KEY'], algorithm='HS256')

        skills = json.loads(user['skills']) if user['skills'] else []

        return jsonify({
            'message': 'Login successful',
            'token': token,
            'user': {
                'id': user['id'],
                'name': user['name'],
                'email': user['email'],
                'skills': skills
            }
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


# ─── PROFILE ROUTES ──────────────────────────────────────────────────────────

@app.route('/profile', methods=['GET'])
@token_required
def get_profile(current_user_id):
    try:
        db = get_db()
        cursor = db.cursor()
        cursor.execute('SELECT id, name, email, skills FROM users WHERE id = ?', (current_user_id,))
        row = cursor.fetchone()
        cursor.close()
        db.close()

        if not row:
            return jsonify({'error': 'User not found'}), 404

        user = dict(row)
        user['skills'] = json.loads(user['skills']) if user['skills'] else []
        return jsonify({'user': user}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/profile', methods=['PUT'])
@token_required
def update_profile(current_user_id):
    data = request.get_json()
    name = data.get('name', '').strip()
    skills = data.get('skills', [])

    if not name:
        return jsonify({'error': 'Name is required'}), 400

    try:
        db = get_db()
        cursor = db.cursor()
        cursor.execute(
            'UPDATE users SET name = ?, skills = ? WHERE id = ?',
            (name, json.dumps(skills), current_user_id)
        )
        db.commit()
        cursor.close()
        db.close()

        return jsonify({
            'message': 'Profile updated successfully',
            'user': {'id': current_user_id, 'name': name, 'skills': skills}
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


# ─── INTERNSHIP ROUTES ────────────────────────────────────────────────────────

@app.route('/internships', methods=['GET'])
@token_required
def get_internships(current_user_id):
    try:
        db = get_db()
        cursor = db.cursor()
        cursor.execute('SELECT * FROM internships')
        rows = cursor.fetchall()
        cursor.close()
        db.close()

        internships = [dict(r) for r in rows]
        for i in internships:
            i['requirements'] = json.loads(i['requirements']) if i['requirements'] else []

        return jsonify({'internships': internships}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/internships', methods=['POST'])
@token_required
def create_internship(current_user_id):
    data = request.get_json()
    title = data.get('title', '').strip()
    company = data.get('company', '').strip()
    requirements = data.get('requirements', [])

    if not title or not company:
        return jsonify({'error': 'Title and company are required'}), 400

    try:
        db = get_db()
        cursor = db.cursor()
        cursor.execute(
            'INSERT INTO internships (title, company, requirements) VALUES (?, ?, ?)',
            (title, company, json.dumps(requirements))
        )
        internship_id = cursor.lastrowid
        db.commit()
        cursor.close()
        db.close()

        return jsonify({
            'message': 'Internship created',
            'internship': {'id': internship_id, 'title': title, 'company': company, 'requirements': requirements}
        }), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500


# ─── RECOMMENDATION ENGINE ────────────────────────────────────────────────────

def calculate_match_score(student_skills, internship_requirements):
    """Calculate percentage match between student skills and internship requirements."""
    if not internship_requirements:
        return 0
    student_set = set(s.lower() for s in student_skills)
    req_set = set(r.lower() for r in internship_requirements)
    matched = student_set & req_set
    score = round((len(matched) / len(req_set)) * 100)
    return score, list(matched), list(req_set - student_set)


def init_db():
    db = get_db()
    cursor = db.cursor()

    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            skills TEXT
        );
    ''')

    cursor.execute('''
        CREATE TABLE IF NOT EXISTS internships (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            company TEXT NOT NULL,
            requirements TEXT
        );
    ''')

    cursor.execute('''
        CREATE TABLE IF NOT EXISTS matches (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            internship_id INTEGER NOT NULL,
            match_score REAL,
            FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY(internship_id) REFERENCES internships(id) ON DELETE CASCADE
        );
    ''')

    # seed internships if empty
    cursor.execute('SELECT COUNT(*) as cnt FROM internships')
    row = cursor.fetchone()
    cnt = row['cnt'] if row else 0
    if cnt == 0:
        seed = [
            ('AI Intern', 'OpenAI', json.dumps(['Python', 'Machine Learning', 'TensorFlow'])),
            ('Web Dev Intern', 'Acme Corp', json.dumps(['JavaScript', 'React', 'CSS'])),
            ('Data Analyst Intern', 'DataWorks', json.dumps(['SQL', 'Excel', 'Python']))
        ]
        cursor.executemany('INSERT INTO internships (title, company, requirements) VALUES (?, ?, ?)', seed)

    db.commit()
    cursor.close()
    db.close()


@app.route('/recommendations', methods=['GET'])
@token_required
def get_recommendations(current_user_id):
    try:
        db = get_db()
        cursor = db.cursor()

        cursor.execute('SELECT skills FROM users WHERE id = ?', (current_user_id,))
        row = cursor.fetchone()
        if not row:
            cursor.close()
            db.close()
            return jsonify({'error': 'User not found'}), 404

        student_skills = json.loads(row['skills']) if row['skills'] else []

        cursor.execute('SELECT * FROM internships')
        rows = cursor.fetchall()

        recommendations = []
        for internship_row in rows:
            internship = dict(internship_row)
            reqs = json.loads(internship['requirements']) if internship['requirements'] else []
            score, matched, missing = calculate_match_score(student_skills, reqs)

            # Save/update match in DB
            cursor.execute(
                'SELECT id FROM matches WHERE user_id = ? AND internship_id = ?',
                (current_user_id, internship['id'])
            )
            existing_row = cursor.fetchone()
            if existing_row:
                existing = dict(existing_row)
                cursor.execute(
                    'UPDATE matches SET match_score = ? WHERE id = ?',
                    (score, existing['id'])
                )
            else:
                cursor.execute(
                    'INSERT INTO matches (user_id, internship_id, match_score) VALUES (?, ?, ?)',
                    (current_user_id, internship['id'], score)
                )

            recommendations.append({
                'internship_id': internship['id'],
                'title': internship['title'],
                'company': internship['company'],
                'requirements': reqs,
                'match_score': score,
                'matched_skills': matched,
                'missing_skills': missing
            })

        db.commit()
        cursor.close()
        db.close()

        recommendations.sort(key=lambda x: x['match_score'], reverse=True)

        return jsonify({
            'student_skills': student_skills,
            'recommendations': recommendations
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/matches', methods=['GET'])
@token_required
def get_matches(current_user_id):
    try:
        db = get_db()
        cursor = db.cursor()
        cursor.execute('''
            SELECT m.id, m.match_score, i.title, i.company, i.requirements
            FROM matches m
            JOIN internships i ON m.internship_id = i.id
            WHERE m.user_id = ?
            ORDER BY m.match_score DESC
        ''', (current_user_id,))
        rows = cursor.fetchall()
        cursor.close()
        db.close()

        matches = [dict(r) for r in rows]
        for m in matches:
            m['requirements'] = json.loads(m['requirements']) if m['requirements'] else []

        return jsonify({'matches': matches}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok', 'message': 'AI Internship Matchmaker API is running'}), 200


if __name__ == '__main__':
    init_db()
    app.run(debug=True, port=5000)
