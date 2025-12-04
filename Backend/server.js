const express = require('express');
const { Sequelize, DataTypes, Op } = require('sequelize'); // Am adaugat Op pentru Search
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// --- 1. DB CONFIG ---
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: './bugtracker.db',
    logging: false
});

// --- 2. MODELE ---
const User = sequelize.define('User', {
    email: { type: DataTypes.STRING, unique: true, allowNull: false },
    password: { type: DataTypes.STRING, allowNull: false },
    name: { type: DataTypes.STRING, defaultValue: 'Student' } // Nume afisat
});

const Project = sequelize.define('Project', {
    name: { type: DataTypes.STRING, allowNull: false },
    repository: { type: DataTypes.STRING },
    owner_id: { type: DataTypes.INTEGER },
    join_code: { type: DataTypes.STRING, unique: true }
});

const ProjectMember = sequelize.define('ProjectMember', {
    project_id: { type: DataTypes.INTEGER },
    user_id: { type: DataTypes.INTEGER },
    role: { type: DataTypes.STRING }
});

// Relații (pentru interogări ușoare)
Project.hasMany(ProjectMember, { foreignKey: 'project_id' });
ProjectMember.belongsTo(User, { foreignKey: 'user_id' });

// --- 3. HELPER ---
const generateCode = () => Math.random().toString(36).substring(2, 8).toUpperCase();

// --- 4. INIT ---
async function initDB() {
    try {
        await sequelize.sync(); 
        console.log(">> DB Sincronizată.");
    } catch (err) { console.error(err); }
}
initDB();

// --- 5. RUTE API ---

// AUTH
app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ where: { email, password } });
        if (!user) return res.status(401).json({ error: "Date incorecte." });
        res.json({ message: "OK", user });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/register', async (req, res) => {
    try {
        const user = await User.create(req.body);
        res.json({ message: "Cont creat!", userId: user.id });
    } catch (err) { res.status(400).json({ error: "Eroare creare." }); }
});

// PROIECTE
app.get('/api/projects', async (req, res) => {
    try {
        // Returnăm proiectele cu tot cu membri
        const projects = await Project.findAll({
            include: [{ 
                model: ProjectMember,
                include: [User] // Să vedem și numele membrilor
            }]
        });
        res.json(projects);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// CREARE PROIECT (Automate MP + Join Code)
app.post('/api/projects', async (req, res) => {
    try {
        const { name, repository, owner_id } = req.body;
        const code = generateCode();
        
        const project = await Project.create({ name, repository, owner_id, join_code: code });
        await ProjectMember.create({ project_id: project.id, user_id: owner_id, role: 'MP' });
        
        res.json({ message: "Proiect creat!", project });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// JOIN BY CODE
app.post('/api/projects/join-code', async (req, res) => {
    try {
        const { userId, code } = req.body;
        const project = await Project.findOne({ where: { join_code: code } });
        
        if (!project) return res.status(404).json({ error: "Cod invalid!" });
        
        const existing = await ProjectMember.findOne({ where: { project_id: project.id, user_id: userId } });
        if (existing) return res.status(400).json({ error: "Ești deja membru." });

        // Cine intră cu cod devine MP (sau poți schimba în TST dacă preferi)
        // De obicei codul e dat colegilor de echipă (MP). Testerii dau Join din feed.
        await ProjectMember.create({ project_id: project.id, user_id: userId, role: 'MP' });
        
        res.json({ message: "Te-ai alăturat echipei!", project });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// JOIN DIN FEED (Tester)
app.post('/api/projects/:id/join', async (req, res) => {
    try {
        const { userId } = req.body;
        const existing = await ProjectMember.findOne({ where: { project_id: req.params.id, user_id: userId } });
        if (existing) return res.status(400).json({ error: "Ești deja membru." });

        await ProjectMember.create({ project_id: req.params.id, user_id: userId, role: 'TST' });
        res.json({ message: "Succes! Ești Tester." });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// SEARCH (Căutare Useri sau Proiecte)
app.get('/api/search', async (req, res) => {
    const query = req.query.q; // Ce scrie în search bar
    if(!query) return res.json({ users: [], projects: [] });

    try {
        const users = await User.findAll({
            where: { email: { [Op.like]: `%${query}%` } }
        });
        const projects = await Project.findAll({
            where: { name: { [Op.like]: `%${query}%` } }
        });
        res.json({ users, projects });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.listen(PORT, () => console.log(`Server la http://localhost:${PORT}`));