const express = require('express');
const cors = require('cors');
const path = require('path');
const { initDB } = require('./database');

// Importare Rute
const authRoutes = require('./routes/auth');
const projectRoutes = require('./routes/projects');
const bugRoutes = require('./routes/bugs');
const githubRoutes = require('./routes/github');
const commentRoutes = require('./routes/comments');
const uploadRoutes = require('./routes/upload');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Serve Static Files (Uploads)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Pornire Bază de Date
initDB();

// Rute API
app.use('/api', authRoutes); // /api/login, /api/register
app.use('/api/projects', projectRoutes); // /api/projects...
app.use('/api/bugs', bugRoutes); // /api/bugs...
app.use('/api/github', githubRoutes); // /api/github...
app.use('/api/comments', commentRoutes); // /api/comments...
app.use('/api/upload', uploadRoutes); // /api/upload

app.listen(PORT, () => console.log(`Server la http://localhost:${PORT}`));