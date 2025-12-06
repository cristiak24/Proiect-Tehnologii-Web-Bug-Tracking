const express = require('express');
const cors = require('cors');

// 1. IMPORTĂM CE AM MUTAT ÎN ALTE FIȘIERE
const { initDB, User, Project, ProjectMember, Bug, Op } = require('./database');
const AuthController = require('./AuthController');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// 2. PORNIM BAZA DE DATE
initDB();

// 3. HELPER 
const generateCode = () => Math.random().toString(36).substring(2, 8).toUpperCase();

// 4. RUTELE API 

// AUTH
app.post('/api/register', AuthController.register);
app.post('/api/login', AuthController.login);

// PROIECTE (Versiunea ACTUALIZATĂ - include Bug-uri pentru bara de progres)
app.get('/api/projects', async (req, res) => {
    try {
        const projects = await Project.findAll({
            include: [
                { model: ProjectMember, include: [User] }
            ]
        });
        res.json(projects);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// CREARE PROIECT (Versiunea ACTUALIZATĂ - salvează descrierea și tehnologiile)
app.post('/api/projects', async (req, res) => {
    try {
        const { name, repository, owner_id, description, technologies } = req.body;
        const code = generateCode();
        
        const project = await Project.create({ 
            name, 
            repository, 
            owner_id, 
            join_code: code,
            description,   // SE SALVEAZĂ DESCRIEREA
            technologies   // SE SALVEAZĂ TEHNOLOGIILE
        });
        
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

        await ProjectMember.create({ project_id: project.id, user_id: userId, role: 'MP' });
        
        res.json({ message: "Te-ai alăturat echipei!", project });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// JOIN DIN FEED
app.post('/api/projects/:id/join', async (req, res) => {
    try {
        const { userId } = req.body;
        const existing = await ProjectMember.findOne({ where: { project_id: req.params.id, user_id: userId } });
        if (existing) return res.status(400).json({ error: "Ești deja membru." });

        await ProjectMember.create({ project_id: req.params.id, user_id: userId, role: 'TST' });
        res.json({ message: "Succes! Ești Tester." });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// SEARCH
app.get('/api/search', async (req, res) => {
    const query = req.query.q;
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

// BUG ROUTES
app.get('/api/projects/:id/bugs', async (req, res) => {
    try {
        const bugs = await Bug.findAll({ where: { project_id: req.params.id } });
        res.json(bugs);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/bugs', async (req, res) => {
    try {
        const bug = await Bug.create(req.body);
        res.json(bug);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/bugs/:id', async (req, res) => {
    try {
        await Bug.update(req.body, { where: { id: req.params.id } });
        res.json({ message: "Updated" });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.listen(PORT, () => console.log(`Server la http://localhost:${PORT}`));