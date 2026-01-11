const express = require('express');
const router = express.Router();
const { Project, ProjectMember, User, Bug } = require('../database');
const { Op } = require('sequelize');

// Helper pentru cod random
const generateCode = () => Math.random().toString(36).substring(2, 8).toUpperCase();

// LISTARE PROIECTE (DOAR CELE ACTIVE)
router.get('/', async (req, res) => {
    try {
        // Presupunem ca avem userId in query sau header (in mod normal ar fi din token)
        // Dar aici luam toate proiectele si filtram unde userul e activ?
        // Momentan "Login" e pe frontend doar simulat, dar userul curent il stim in frontend.
        // Totusi, endpoint-ul asta returna TOATE proiectele.
        // Daca vrem sa filtram per user, ne trebuie user ID.
        // Voi modifica sa accepte ?userId=... sau sa returneze tot (dar cu status).
        // Cerinta: "Userul nu vede proiectul în lista principală până nu acceptă."

        const { userId } = req.query; // Astept userId din frontend

        let whereClause = {};
        if (userId) {
            // Daca mi se da userId, caut doar proiectele unde acest user e membru 'active'
            // Asta e mai complicat cu Sequelize simplu pe include, dar incercam:
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

        // Fallback: Returnam tot (pentru admin/debug) sau gol
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
                    include: [User] // Aici ar trebui sa vedem si cine a invitat?
                    // ProjectMember nu retine cine a invitat, dar stim cine e ownerul proiectului
                }
            ]
        });

        // Vrem sa stim si cine e ownerul ca sa afisam "Invited by X"
        // Ownerul e in Project.owner_id
        // Putem face un map sa aducem si numele ownerului
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

        // 1. Verificam permisiuni
        const member = await ProjectMember.findOne({
            where: { project_id: req.params.id, user_id: userId, role: 'MP' }
        });

        if (!member) {
            return res.status(403).json({ error: "Nu ai voie sa modifici proiectul (Doar Managerii pot)." });
        }

        // 2. Actualizam
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

        // Cel care crează este automat Manager (MP) și ACTIVE
        await ProjectMember.create({ project_id: project.id, user_id: owner_id, role: 'MP', status: 'active' });

        // Adaugam si membrii invitati (daca exista)
        if (members && members.length > 0) {
            for (const email of members) {
                const invitedUser = await User.findOne({ where: { email } });
                if (invitedUser) {
                    // Prevent adding owner again or duplicates (simple check)
                    if (invitedUser.id !== owner_id) {
                        // Invitam userii cu status PENDING
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
        const { userId, code } = req.body;
        const project = await Project.findOne({ where: { join_code: code } });

        if (!project) return res.status(404).json({ error: "Cod invalid!" });

        const existing = await ProjectMember.findOne({ where: { project_id: project.id, user_id: userId } });
        if (existing) return res.status(400).json({ error: "Ești deja membru." });

        await ProjectMember.create({ project_id: project.id, user_id: userId, role: 'MP' });

        res.json({ message: "Te-ai alăturat echipei!", project });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// JOIN CA TESTER (PUBLIC)
router.post('/:id/join', async (req, res) => {
    try {
        const { userId } = req.body;
        const existing = await ProjectMember.findOne({ where: { project_id: req.params.id, user_id: userId } });
        if (existing) return res.status(400).json({ error: "Ești deja membru." });

        await ProjectMember.create({ project_id: req.params.id, user_id: userId, role: 'TST' });
        res.json({ message: "Succes! Ești Tester." });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// INVITA MEMBRU (Doar MP)
router.post('/:id/invite', async (req, res) => {
    try {
        const { email, userId } = req.body;

        // 1. Check Permission
        const manager = await ProjectMember.findOne({
            where: { project_id: req.params.id, user_id: userId, role: 'MP' }
        });
        if (!manager) return res.status(403).json({ error: "Nu ai drepturi." });

        // 2. Find User
        const userToAdd = await User.findOne({ where: { email } });
        if (!userToAdd) return res.status(404).json({ error: "Utilizatorul nu există." });

        // 3. Check Existing
        const existing = await ProjectMember.findOne({
            where: { project_id: req.params.id, user_id: userToAdd.id }
        });
        if (existing) return res.status(400).json({ error: "Este deja membru." });

        // 4. Add as MP (Collaborator) - PENDING
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

        // Stergem intrarea sau setam rejected
        await member.destroy(); // Stergem direct ca sa nu ramana gunoi, sau update status='rejected'
        // Cerinta: "Decline: Șterge intrarea din baza de date (sau schimbă status în 'rejected')"
        // Aleg stergerea pentru curatenie, sau rejected daca vrem istoric. 
        // Voi sterge pentru simplitate.

        res.json({ message: "Ai refuzat invitația." });
    } catch (err) { res.status(500).json({ error: err.message }); }
});
