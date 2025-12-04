const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path'); // <--- LINIE NOUĂ IMPORTANTĂ
const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public')); // Servește fișierele din folderul 'public'

app.use(express.static(path.join(__dirname, '../frontend/public')));

// ==========================================
// 1. CONFIGURARE BAZA DE DATE
// ==========================================
const db = new sqlite3.Database('./bugtracker.db', (err) => {
    if (err) {
        console.error('Eroare conexiune DB:', err.message);
    } else {
        console.log('>> Conectat la baza de date SQLite.');
    }
});

// ==========================================
// 2. CREARE TABELE ȘI DATE DE TEST (SEED)
// ==========================================
db.serialize(() => {
    // --- Creare Tabele ---
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE,
        password TEXT
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS projects (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        repository TEXT,
        owner_id INTEGER
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS project_members (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        project_id INTEGER,
        user_id INTEGER,
        role TEXT
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS bugs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        project_id INTEGER,
        description TEXT,
        severity TEXT,
        priority TEXT,
        commit_link TEXT,
        status TEXT DEFAULT 'Open',
        assigned_to INTEGER,
        fix_link TEXT,
        reporter_id INTEGER
    )`);

    // --- Populare Automată (Doar dacă nu există useri) ---
    const checkSql = "SELECT count(*) as count FROM users";
    db.get(checkSql, (err, row) => {
        if (row && row.count === 0) {
            console.log(">> Baza de date e goală. Se introduc date de test...");
            
            // 1. User MP (mp@test.com / 1234)
            db.run(`INSERT INTO users (email, password) VALUES ('mp@test.com', '1234')`);
            
            // 2. User TST (tst@test.com / 1234)
            db.run(`INSERT INTO users (email, password) VALUES ('tst@test.com', '1234')`);

            // 3. Proiect Demo
            db.run(`INSERT INTO projects (name, repository, owner_id) VALUES ('Magazin Online Demo', 'http://github.com/demo', 1)`);

            // 4. Legătura: Userul 1 este MP la Proiectul 1
            db.run(`INSERT INTO project_members (project_id, user_id, role) VALUES (1, 1, 'MP')`);

            console.log(">> Datele de test au fost create!");
        }
    });
});

// ==========================================
// 3. RUTE API (Backend Logic)
// ==========================================

// Login
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    const sql = `SELECT * FROM users WHERE email = ? AND password = ?`;
    
    db.get(sql, [email, password], (err, user) => {
        if (err) return res.status(500).json({ error: "Eroare server" });
        if (!user) return res.status(401).json({ error: "Email sau parolă greșită" });
        
        res.json({ 
            message: "Login reușit!", 
            user: { id: user.id, email: user.email } 
        });
    });
});

// Listare Proiecte
app.get('/api/projects', (req, res) => {
    const sql = `SELECT * FROM projects`;
    db.all(sql, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// ==========================================
// 4. START SERVER
// ==========================================
app.listen(PORT, () => {
    console.log(`Serverul rulează la http://localhost:${PORT}`);
});