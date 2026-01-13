const express = require('express');
const router = express.Router();
const { Project, ProjectMember, User, Bug } = require('../database');
const { Op } = require('sequelize');

// Helper pentru cod random
const generateCode = () => Math.random().toString(36).substring(2, 8).toUpperCase();

// LISTARE PROIECTE (DOAR CELE ACTIVE)
router.get('/', async (req, res) => {
    try {

        const { userId } = req.query; // Aștept userId din frontend

        let whereClause = {};
        if (userId) {
            // Dacă primesc userId, caut doar proiectele unde acest user este membru 'active'
            const projects = await Project.findAll({
                include: [
                    {
                        model: ProjectMember,
                        where: { user_id: userId, status: 'active' }, // DOAR ACTIVE
                        include: [User]
                    },
                    { model: Bug }
                ]
            });
            return res.json(projects);
        }

        // Fallback: Returnăm tot (pentru admin/debug) sau listă goală
        const projects = await Project.findAll({
            include: [
                { model: ProjectMember, include: [User] },
                { model: Bug }
            ]
        });
        res.json(projects);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// LISTARE INVITATII (PENDING)
router.get('/invitations', async (req, res) => {
    try {
        const { userId } = req.query;
        if (!userId) return res.status(400).json({ error: "Lipseste userId" });

        const pendingProjects = await Project.findAll({
            include: [
                {
                    model: ProjectMember,
                    where: { user_id: userId, status: 'pending' }, // DOAR PENDING
                    include: [User]
                    // ProjectMember nu reține cine a invitat, dar știm cine este ownerul proiectului
                }
            ]
        });

        const result = await Promise.all(pendingProjects.map(async (p) => {
            const owner = await User.findByPk(p.owner_id);
            return {
                ...p.toJSON(),
                ownerName: owner ? owner.name : 'Unknown'
            };
        }));

        res.json(result);

    } catch (err) { res.status(500).json({ error: err.message }); }
});

// DETALII PROIECT (Singular) + BUGURI
router.get('/:id', async (req, res) => {
    try {
        const project = await Project.findOne({
            where: { id: req.params.id },
            include: [
                { model: ProjectMember, include: [User] },
                { model: Bug }
            ]
        });
        if (!project) return res.status(404).json({ error: "Proiect nu a fost găsit" });
        res.json(project);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET BUG-URILE UNUI PROIECT
router.get('/:id/bugs', async (req, res) => {
    try {
        const bugs = await Bug.findAll({ where: { project_id: req.params.id } });
        res.json(bugs);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// ACTUALIZARE PROIECT (Doar MP)
router.put('/:id', async (req, res) => {
    try {
        const { userId, name, repository, description, technologies } = req.body;

        // 1. Verificăm permisiuni
        const member = await ProjectMember.findOne({
            where: { project_id: req.params.id, user_id: userId, role: 'MP' }
        });

        if (!member) {
            return res.status(403).json({ error: "Nu ai voie sa modifici proiectul (Doar Managerii pot)." });
        }

        // 2. Actualizăm
        const project = await Project.findByPk(req.params.id);
        if (!project) return res.status(404).json({ error: "Proiect inexistent" });

        await project.update({ name, repository, description, technologies });

        res.json({ message: "Proiect actualizat!", project });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// CREARE PROIECT
router.post('/', async (req, res) => {
    try {
        const { name, repository, owner_id, description, technologies, members } = req.body;
        const code = generateCode();

        const project = await Project.create({
            name,
            repository,
            owner_id,
            join_code: code,
            description,
            technologies
        });

        // Cel care creează este automat Manager (MP) și ACTIVE
        await ProjectMember.create({ project_id: project.id, user_id: owner_id, role: 'MP', status: 'active' });

        // Adaugam si membrii invitati (daca exista)
        if (members && members.length > 0) {
            for (const email of members) {
                const invitedUser = await User.findOne({ where: { email } });
                if (invitedUser) {
                    // Prevenim adăugarea owner-ului din nou sau duplicate
                    if (invitedUser.id !== owner_id) {
                        // Invităm userii cu status PENDING
                        await ProjectMember.create({ project_id: project.id, user_id: invitedUser.id, role: 'MP', status: 'pending' });
                    }
                }
            }
        }

        res.json({ message: "Proiect creat!", project });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// JOIN CU COD
router.post('/join-code', async (req, res) => {
    try {
        console.log(`[POST /join-code] Request Body:`, req.body);
        const { userId, code } = req.body;

        if (!code) return res.status(400).json({ error: "Code is required" });

        const project = await Project.findOne({ where: { join_code: code } });
        if (!project) {
            console.warn(`[POST /join-code] Invalid code: ${code}`);
            return res.status(404).json({ error: "Cod invalid!" });
        }

        const existing = await ProjectMember.findOne({ where: { project_id: project.id, user_id: userId } });
        if (existing) {
            console.warn(`[POST /join-code] User ${userId} already member of project ${project.id}`);
            return res.status(400).json({ error: "Ești deja membru." });
        }

        // Rol implicit: 'TST', status: 'active' pentru a fi vizibil imediat
        console.log(`[POST /join-code] Adding user ${userId} to project ${project.id} as TST`);
        await ProjectMember.create({ project_id: project.id, user_id: userId, role: 'TST', status: 'active' });

        res.json({ message: "Te-ai alăturat echipei ca Tester!", project });
    } catch (err) {
        console.error(`[POST /join-code] ERROR:`, err);
        res.status(500).json({ error: err.message });
    }
});

// JOIN CA TESTER (PUBLIC)
router.post('/:id/join', async (req, res) => {
    try {
        console.log(`[POST /:id/join] Request received for Project ID: ${req.params.id}`);
        console.log(`[POST /:id/join] Request Body:`, req.body);

        const { userId } = req.body;
        if (!userId) {
            console.error("[POST /:id/join] Missing userId in body");
            return res.status(400).json({ error: "Missing userId" });
        }

        const projectId = req.params.id;

        const existing = await ProjectMember.findOne({ where: { project_id: projectId, user_id: userId } });
        if (existing) {
            console.warn(`[POST /:id/join] User ${userId} already member of project ${projectId}`);
            return res.status(400).json({ error: "Ești deja membru." });
        }

        // Status explicit: 'active'
        console.log(`[POST /:id/join] Creating ProjectMember: project_id=${projectId}, user_id=${userId}, role='TST'`);
        await ProjectMember.create({ project_id: projectId, user_id: userId, role: 'TST', status: 'active' });

        console.log(`[POST /:id/join] Success`);
        res.json({ message: "Succes! Ești Tester." });
    } catch (err) {
        console.error(`[POST /:id/join] ERROR:`, err);
        res.status(500).json({ error: err.message });
    }
});

// INVITA MEMBRU (Doar MP)
router.post('/:id/invite', async (req, res) => {
    try {
        const { email, userId } = req.body;

        // 1. Verificare Permisiuni
        const manager = await ProjectMember.findOne({
            where: { project_id: req.params.id, user_id: userId, role: 'MP' }
        });
        if (!manager) return res.status(403).json({ error: "Nu ai drepturi." });

        // 2. Căutare Utilizator
        const userToAdd = await User.findOne({ where: { email } });
        if (!userToAdd) return res.status(404).json({ error: "Utilizatorul nu există." });

        // 3. Verificare Existență
        const existing = await ProjectMember.findOne({
            where: { project_id: req.params.id, user_id: userToAdd.id }
        });
        if (existing) return res.status(400).json({ error: "Este deja membru." });

        // 4. Adăugare ca MP (Colaborator) - PENDING
        await ProjectMember.create({
            project_id: req.params.id,
            user_id: userToAdd.id,
            role: 'MP',
            status: 'pending'
        });

        res.json({ message: "Invitație trimisă!" });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;

// ACCEPT INVITATION
router.post('/:id/accept-invite', async (req, res) => {
    try {
        const { userId } = req.body;
        const member = await ProjectMember.findOne({
            where: { project_id: req.params.id, user_id: userId }
        });

        if (!member) return res.status(404).json({ error: "Invitație inexistentă." });

        await member.update({ status: 'active' });
        res.json({ message: "Ai acceptat invitația!" });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// DECLINE INVITATION
router.post('/:id/decline-invite', async (req, res) => {
    try {
        const { userId } = req.body;
        const member = await ProjectMember.findOne({
            where: { project_id: req.params.id, user_id: userId }
        });

        if (!member) return res.status(404).json({ error: "Invitație inexistentă." });

        // Ștergem intrarea 
        await member.destroy();

        res.json({ message: "Ai refuzat invitația." });
    } catch (err) { res.status(500).json({ error: err.message }); }
});
