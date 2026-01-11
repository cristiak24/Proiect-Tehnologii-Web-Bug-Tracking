const express = require('express');
const cors = require('cors');
const path = require('path');
const { initDB } = require('./database');

// Import rutele pe care le-am facut in folderul routes
const authRoutes = require('./routes/auth');
const projectRoutes = require('./routes/projects');
const bugRoutes = require('./routes/bugs');
const githubRoutes = require('./routes/github');
const commentRoutes = require('./routes/comments');
const uploadRoutes = require('./routes/upload');

const app = express();
const PORT = 3000;

// Middleware-uri standard
app.use(cors()); // Ca sa mearga request-urile de pe frontend (vite pe alt port)
app.use(express.json()); // Ca sa tinem minte sa parsam JSON-ul din request body

// Aici servesc fisierele statice, pt imaginile uploadate
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Dau drumul la baza de date
initDB();

// Aici leg rutele de aplicatie
app.use('/api', authRoutes); // Tot ce tine de login/register
app.use('/api/projects', projectRoutes); // Pentru proiecte
app.use('/api/bugs', bugRoutes); // Pentru bug-uri
app.use('/api/github', githubRoutes); // Proxy-ul pt API-ul de GitHub
app.use('/api/comments', commentRoutes); // Sectiunea de comentarii
app.use('/api/upload', uploadRoutes); // Upload de poze

// Pornesc serverul efectiv
app.listen(PORT, () => console.log(`Server la http://localhost:${PORT}`));