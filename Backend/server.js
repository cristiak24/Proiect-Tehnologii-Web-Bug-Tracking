const express = require('express');
const cors = require('cors');
const path = require('path');
const { initDB } = require('./database');

// Import rutele
const authRoutes = require('./routes/auth');
const projectRoutes = require('./routes/projects');
const bugRoutes = require('./routes/bugs');
const githubRoutes = require('./routes/github');
const commentRoutes = require('./routes/comments');
const uploadRoutes = require('./routes/upload');

const app = express();

// --- MODIFICARE 1: Port Dinamic ---
// Luăm portul de la Render SAU folosim 3000 dacă suntem local
const PORT = process.env.PORT || 3000;

app.use(cors()); 
app.use(express.json()); 

// Servire fișiere statice (uploads)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Inițializare DB
initDB();

// --- MODIFICARE 2: Rută pentru pagina principală (ca să nu mai dea eroare 404 pe Home) ---
app.get('/', (req, res) => {
    res.send('Backend-ul BugTracker rulează cu succes! Accesează /api/projects pentru date.');
});

// Rutele API
app.use('/api', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/bugs', bugRoutes);
app.use('/api/github', githubRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/upload', uploadRoutes);

// --- Pornire Server ---
// Folosim variabila PORT definită mai sus
app.listen(PORT, () => {
    console.log(`Serverul rulează pe portul ${PORT}`);
});