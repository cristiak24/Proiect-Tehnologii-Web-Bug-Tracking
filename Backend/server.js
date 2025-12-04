const express = require('express');
const { Sequelize, DataTypes } = require('sequelize');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend/public')));

// --- 1. CONFIGURARE DB ---
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: './bugtracker.db',
    logging: false
});

// --- 2. MODELE ---
const User = sequelize.define('User', {
    email: { type: DataTypes.STRING, unique: true, allowNull: false },
    password: { type: DataTypes.STRING, allowNull: false }
});

const Project = sequelize.define('Project', {
    name: { type: DataTypes.STRING, allowNull: false },
    repository: { type: DataTypes.STRING },
    owner_id: { type: DataTypes.INTEGER },
    join_code: { type: DataTypes.STRING, unique: true } // <--- NOU: Cod unic
});

const ProjectMember = sequelize.define('ProjectMember', {
    project_id: { type: DataTypes.INTEGER },
    user_id: { type: DataTypes.INTEGER },
    role: { type: DataTypes.STRING } // 'MP' sau 'TST'
});

const Bug = sequelize.define('Bug', {
    description: { type: DataTypes.STRING },
    severity: { type: DataTypes.STRING },
    priority: { type: DataTypes.STRING },
    commit_link: { type: DataTypes.STRING },
    status: { type: DataTypes.STRING, defaultValue: 'Open' },
    fix_link: { type: DataTypes.STRING },
    project_id: { type: DataTypes.INTEGER },
    reporter_id: { type: DataTypes.INTEGER },
    assigned_to: { type: DataTypes.INTEGER }
});

// --- 3. HELPER: Generare Cod Unic ---
function generateCode() {
    return Math.random().toString(36).substring(2, 8).toUpperCase(); // Ex: "A7X92B"
}

// --- 4. INIT DB ---
async function initDB() {
    try {
        await sequelize.sync(); 
        console.log(">> Baza de date sincronizată.");
        
        // Seed (Date de test)
        if (await User.count() === 0) {
            const mp = await User.create({ email: 'mp@test.com', password: '1234' });
            const tst = await User.create({ email: 'tst@test.com', password: '1234' });
            
            // Proiect 1 (MP e owner)
            const p1 = await Project.create({ 
                name: 'Magazin Online', 
                repository: 'http://github.com/demo',
                owner_id: mp.id,
                join_code: 'STORE1' 
            });
            await ProjectMember.create({ project_id: p1.id, user_id: mp.id, role: 'MP' });

            // Proiect 2 (Public, MP nu e membru încă)
            await Project.create({
                name: 'Aplicatie Chat',
                repository: 'http://github.com/chat',
                owner_id: tst.id, // Creat de altcineva
                join_code: 'CHAT99'
            });

            console.log(">> Date de test create!");
        }
    } catch (err) { console.error(err); }
}
initDB();

// --- 5. RUTE API REST ---

// Auth
app.post('/api/register', async (req, res) => {
    try {
        const user = await User.create(req.body);
        res.json({ message: "Cont creat!", userId: user.id });
    } catch (err) { res.status(400).json({ error: "Eroare creare cont." }); }
});

app.post('/api/login', async (req, res) => {
    try {
        const user = await User.findOne({ where: req.body });
        if (!user) return res.status(401).json({ error: "Date incorecte." });
        res.json({ message: "Login OK", user: { id: user.id, email: user.email } });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// Proiecte
app.get('/api/projects', async (req, res) => {
    // Returnăm toate proiectele + membrii lor (ca să filtrăm în frontend)
    try {
        const projects = await Project.findAll();
        // Pentru fiecare proiect, luăm și lista de membri simplificată
        const result = [];
        for (let p of projects) {
            const members = await ProjectMember.findAll({ where: { project_id: p.id } });
            result.push({ ...p.dataValues, members }); 
        }
        res.json(result);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/projects', async (req, res) => {
    try {
        const { name, repository, owner_id } = req.body;
        const code = generateCode();
        
        const project = await Project.create({ name, repository, owner_id, join_code: code });
        
        // Creatorul devine automat MP
        await ProjectMember.create({ project_id: project.id, user_id: owner_id, role: 'MP' });
        
        res.json({ message: "Proiect creat!", project });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// JOIN BY CODE (Devii MP)
app.post('/api/projects/join-code', async (req, res) => {
    try {
        const { userId, code } = req.body;
        
        const project = await Project.findOne({ where: { join_code: code } });
        if (!project) return res.status(404).json({ error: "Cod invalid!" });

        // Verificăm dacă e deja membru
        const existing = await ProjectMember.findOne({ where: { project_id: project.id, user_id: userId } });
        if (existing) return res.status(400).json({ error: "Ești deja membru în acest proiect." });

        // Adăugăm ca MP
        await ProjectMember.create({ project_id: project.id, user_id: userId, role: 'MP' });
        res.json({ message: "Te-ai alăturat ca MP!", projectName: project.name });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// JOIN AS TESTER (Din feed)
app.post('/api/projects/:id/join', async (req, res) => {
    try {
        const projectId = req.params.id;
        const { userId } = req.body;
        
        const existing = await ProjectMember.findOne({ where: { project_id: projectId, user_id: userId } });
        if (existing) return res.status(400).json({ error: "Ești deja membru." });

        await ProjectMember.create({ project_id: projectId, user_id: userId, role: 'TST' });
        res.json({ message: "Succes! Ești Tester." });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// Alte rute (Bug-uri, Roluri) rămân la fel ca înainte...
// (Copiază rutele de Bugs/Role din versiunea anterioară aici dacă lipsesc, 
// dar pentru simplitate în acest răspuns mă concentrez pe structura proiectelor)
// --- RUTELE DE BUGS ESENTIALE ---
app.get('/api/projects/:id/bugs', async (req, res) => {
    const bugs = await Bug.findAll({ where: { project_id: req.params.id } });
    res.json(bugs);
});
app.post('/api/bugs', async (req, res) => {
    const bug = await Bug.create(req.body);
    res.json(bug);
});
app.put('/api/bugs/:id', async (req, res) => {
    await Bug.update(req.body, { where: { id: req.params.id } });
    res.json({message: "Updated"});
});
app.get('/api/projects/:id/role', async (req, res) => {
    const m = await ProjectMember.findOne({ where: { project_id: req.params.id, user_id: req.query.userId }});
    res.json({ role: m ? m.role : null });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));