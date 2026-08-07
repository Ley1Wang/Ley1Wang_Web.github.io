from flask import Flask, jsonify, request
from datetime import datetime, date, timedelta
import sqlite3

app = Flask(__name__)
DB = "movies.db"

MOVIES = [
    ("M01", 1, 1994, 9.7, "Drama"),
    ("M02", 2, 1993, 9.6, "Drama"),
    ("M03", 3, 1994, 9.5, "Drama"),
    ("M04", 4, 1997, 9.4, "Romance"),
    ("M05", 5, 2001, 9.4, "Animation"),
    ("M06", 6, 2010, 9.4, "SciFi"),
    ("M07", 7, 2014, 9.4, "SciFi"),
    ("M08", 8, 2016, 9.2, "Animation"),
    ("M09", 9, 2008, 9.2, "Action"),
    ("M10", 10, 2017, 9.1, "Animation"),
]


@app.after_request
def cors(response):
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
    return response


def connect():
    return sqlite3.connect(DB)


def query(sql, params=()):
    conn = connect()
    rows = conn.execute(sql, params).fetchall()
    conn.close()
    return rows


def columns(cur, table):
    return [row[1] for row in cur.execute(f"PRAGMA table_info({table})").fetchall()]


def init_db():
    conn = connect()
    cur = conn.cursor()

    movie_columns = columns(cur, "movies")
    if movie_columns and "movie_id" not in movie_columns:
        cur.execute("DROP TABLE movies")

    cur.execute(
        """
        CREATE TABLE IF NOT EXISTS movies (
            movie_id TEXT PRIMARY KEY,
            rank INTEGER,
            year INTEGER,
            rating REAL,
            category TEXT
        )
        """
    )
    cur.execute(
        """
        CREATE TABLE IF NOT EXISTS task_runs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            task_name TEXT,
            run_date TEXT,
            run_time TEXT,
            status TEXT,
            total INTEGER,
            new_count INTEGER DEFAULT 0,
            duplicate_count INTEGER DEFAULT 0
        )
        """
    )

    run_columns = columns(cur, "task_runs")
    if "new_count" not in run_columns:
        cur.execute("ALTER TABLE task_runs ADD COLUMN new_count INTEGER DEFAULT 0")
    if "duplicate_count" not in run_columns:
        cur.execute("ALTER TABLE task_runs ADD COLUMN duplicate_count INTEGER DEFAULT 0")

    cur.execute(
        """
        CREATE TABLE IF NOT EXISTS crawl_results (
            run_id INTEGER,
            movie_id TEXT,
            is_new INTEGER,
            PRIMARY KEY (run_id, movie_id)
        )
        """
    )
    conn.commit()
    conn.close()


@app.route("/")
def home():
    return "Flask API is running. Open the React page at http://localhost:5173/"


@app.route("/api/run", methods=["POST"])
def run_task():
    now = datetime.now()
    run_date = now.strftime("%Y-%m-%d")
    run_time = now.strftime("%H:%M:%S")
    total = len(MOVIES)
    new_count = 0
    duplicate_count = 0

    conn = connect()
    cur = conn.cursor()
    cur.execute(
        "INSERT INTO task_runs (task_name, run_date, run_time, status, total, new_count, duplicate_count) VALUES (?, ?, ?, ?, ?, ?, ?)",
        ("MovieCrawler", run_date, run_time, "success", total, 0, 0),
    )
    run_id = cur.lastrowid

    for movie in MOVIES:
        movie_id = movie[0]
        exists = cur.execute("SELECT 1 FROM movies WHERE movie_id = ?", (movie_id,)).fetchone()
        is_new = 0 if exists else 1
        cur.execute("INSERT OR IGNORE INTO movies VALUES (?, ?, ?, ?, ?)", movie)
        cur.execute("INSERT OR IGNORE INTO crawl_results VALUES (?, ?, ?)", (run_id, movie_id, is_new))
        new_count += is_new
        duplicate_count += 1 - is_new

    cur.execute("UPDATE task_runs SET new_count = ?, duplicate_count = ? WHERE id = ?", (new_count, duplicate_count, run_id))
    conn.commit()
    conn.close()
    return jsonify({"message": "crawler finished", "total": total, "new": new_count, "duplicate": duplicate_count})


@app.route("/api/runs")
def runs():
    run_date = request.args.get("date", date.today().strftime("%Y-%m-%d"))
    rows = query(
        "SELECT id, task_name, run_time, status, total, new_count, duplicate_count FROM task_runs WHERE run_date = ? ORDER BY id DESC",
        (run_date,),
    )
    return jsonify({
        "date": run_date,
        "runs": [
            {"id": r[0], "task": r[1], "time": r[2], "status": r[3], "total": r[4], "new": r[5], "duplicate": r[6]}
            for r in rows
        ],
    })


@app.route("/api/task-overview")
def task_overview():
    today_text = date.today().strftime("%Y-%m-%d")
    today_count = query("SELECT COUNT(*) FROM task_runs WHERE run_date = ?", (today_text,))[0][0]
    total_runs = query("SELECT COUNT(*) FROM task_runs")[0][0]
    unique_movies = query("SELECT COUNT(*) FROM movies")[0][0]
    latest = query("SELECT run_date, run_time, status, total, new_count, duplicate_count FROM task_runs ORDER BY id DESC LIMIT 1")
    latest_run = None
    if latest:
        r = latest[0]
        latest_run = {"date": r[0], "time": r[1], "status": r[2], "total": r[3], "new": r[4], "duplicate": r[5]}
    return jsonify({"today": today_count, "total": total_runs, "unique": unique_movies, "latest": latest_run})


@app.route("/api/run-summary")
def run_summary():
    days = [(date.today() - timedelta(days=i)).strftime("%Y-%m-%d") for i in range(6, -1, -1)]
    rows = dict(query("SELECT run_date, COUNT(*) FROM task_runs GROUP BY run_date"))
    return jsonify({"x": days, "y": [rows.get(day, 0) for day in days]})


@app.route("/api/rating")
def rating():
    rows = query("SELECT rating, COUNT(*) FROM movies GROUP BY rating ORDER BY rating")
    return jsonify({"x": [str(r[0]) for r in rows], "y": [r[1] for r in rows]})


@app.route("/api/year")
def year():
    rows = query("SELECT year, COUNT(*) FROM movies GROUP BY year ORDER BY year")
    return jsonify({"x": [r[0] for r in rows], "y": [r[1] for r in rows]})


@app.route("/api/category")
def category():
    rows = query("SELECT category, COUNT(*) FROM movies GROUP BY category")
    return jsonify({"data": [{"name": r[0], "value": r[1]} for r in rows]})


if __name__ == "__main__":
    init_db()
    app.run(debug=True, port=5000)