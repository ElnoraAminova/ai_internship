# ✦ AI Internship Matchmaker

> A full-stack web application that matches students with internships based on their skills using an AI-powered recommendation engine.

Built with **React.js** · **Python Flask** · **MySQL**

---

## 📁 Project Structure

```
ai-internship-matchmaker/
├── backend/
│   ├── app.py               # Flask REST API
│   ├── requirements.txt     # Python dependencies
│   └── .env.example         # Environment variables template
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── Sidebar.js
│   │   │   └── MatchBadge.js
│   │   ├── context/
│   │   │   └── AuthContext.js
│   │   ├── pages/
│   │   │   ├── Login.js
│   │   │   ├── Register.js
│   │   │   ├── Dashboard.js
│   │   │   ├── Internships.js
│   │   │   ├── Recommendations.js
│   │   │   └── Profile.js
│   │   ├── utils/
│   │   │   └── api.js
│   │   ├── App.js
│   │   ├── index.js
│   │   └── index.css
│   └── package.json
├── database/
│   └── schema.sql           # MySQL schema + seed data
├── postman/
│   └── AI_Internship_Matchmaker.postman_collection.json
└── README.md
```

---

## 🗄️ Database Schema

### Users Table
| Column | Type | Description |
|--------|------|-------------|
| id | INT (PK) | Auto-increment |
| name | VARCHAR(100) | Full name |
| email | VARCHAR(150) | Unique email |
| password | VARCHAR(255) | Bcrypt hashed |
| skills | JSON | Array of skills |
| created_at | TIMESTAMP | Registration time |

### Internships Table
| Column | Type | Description |
|--------|------|-------------|
| id | INT (PK) | Auto-increment |
| title | VARCHAR(150) | Job title |
| company | VARCHAR(150) | Company name |
| requirements | JSON | Required skills array |

### Matches Table
| Column | Type | Description |
|--------|------|-------------|
| id | INT (PK) | Auto-increment |
| user_id | INT (FK) | References users |
| internship_id | INT (FK) | References internships |
| match_score | INT | 0–100 percentage |

---

## 🚀 Local Setup

### Prerequisites
- Node.js 18+
- Python 3.9+
- MySQL 8.0+

### 1. Database Setup

```bash
mysql -u root -p < database/schema.sql
```

### 2. Backend Setup

```bash
cd backend
pip install -r requirements.txt
cp .env.example .env
# Edit .env with your MySQL credentials
python app.py
```

Backend runs at: `http://localhost:5000`

### 3. Frontend Setup

```bash
cd frontend
npm install
npm start
```

Frontend runs at: `http://localhost:3000`

---

## 🌐 API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/health` | No | Health check |
| POST | `/register` | No | Register new user |
| POST | `/login` | No | Login and get JWT |
| GET | `/profile` | Yes | Get user profile |
| PUT | `/profile` | Yes | Update name & skills |
| GET | `/internships` | Yes | List all internships |
| GET | `/recommendations` | Yes | Get AI-matched recommendations |
| GET | `/matches` | Yes | Get saved match history |

### Example: POST /register
```json
{
  "name": "Jane Doe",
  "email": "jane@uni.edu",
  "password": "password123",
  "skills": ["Python", "SQL", "Power BI"]
}
```

### Example: GET /recommendations (Response)
```json
{
  "student_skills": ["Python", "SQL", "Power BI"],
  "recommendations": [
    {
      "internship_id": 1,
      "title": "Data Analyst Intern",
      "company": "DataCorp Analytics",
      "requirements": ["Python", "SQL", "Excel", "Power BI"],
      "match_score": 75,
      "matched_skills": ["python", "sql", "power bi"],
      "missing_skills": ["excel"]
    }
  ]
}
```

---

## 🤖 Recommendation Engine

The match score is calculated as:

```
match_score = (matched_skills / total_required_skills) × 100
```

**Example:**
- Student skills: Python, SQL, Power BI
- Internship requires: Python, SQL, Excel, Power BI
- Matched: Python, SQL, Power BI (3 of 4)
- Score: **75%**

---

## 🧪 Testing with Postman

1. Import `postman/AI_Internship_Matchmaker.postman_collection.json` into Postman
2. Run **Register** — token is auto-saved to collection variable
3. All protected routes use `{{token}}` automatically
4. Run requests in order: Register → Login → Get Profile → Get Recommendations

---

## ☁️ Deployment on Render

### Backend (Web Service)

1. Push code to GitHub
2. Go to [render.com](https://render.com) → New → Web Service
3. Connect your repo, set root to `backend/`
4. **Build command:** `pip install -r requirements.txt`
5. **Start command:** `gunicorn app:app`
6. Add environment variables:
   - `SECRET_KEY` = random secret string
   - `DB_HOST` = your MySQL host
   - `DB_USER` = your MySQL user
   - `DB_PASSWORD` = your MySQL password
   - `DB_NAME` = `internship_db`

> 💡 Use [PlanetScale](https://planetscale.com) or [Railway](https://railway.app) for free MySQL hosting.

### Frontend (Static Site)

1. Go to Render → New → Static Site
2. Connect your repo, set root to `frontend/`
3. **Build command:** `npm install && npm run build`
4. **Publish directory:** `build`
5. Add environment variable:
   - `REACT_APP_API_URL` = your backend Render URL (e.g. `https://your-api.onrender.com`)

---

## 🛠️ Technologies Used

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, React Router v6, Axios |
| Backend | Python Flask, Flask-CORS, Flask-Bcrypt |
| Auth | JWT (PyJWT) |
| Database | MySQL 8, mysql-connector-python |
| Deployment | Render (backend + frontend) |
| Testing | Postman |

---

## 🎓 University Assignment Notes

This project demonstrates:
- **RESTful API design** with proper HTTP methods and status codes
- **JWT authentication** for secure stateless auth
- **Password hashing** with bcrypt
- **Relational database** design with foreign keys
- **React hooks** and context API for state management
- **Algorithm design** — skill-matching recommendation engine
- **Full-stack integration** — frontend calling backend APIs

---

## 📄 License

MIT — Free for educational use.
