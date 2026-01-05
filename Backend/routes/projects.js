const express = require('express');
const router = express.Router();
const { Project, ProjectMember, User, Bug } = require('../database');
const { Op } = require('sequelize');

// Helper pentru cod random
const generateCode = () => Math.random().toString(36).substring(2, 8).toUpperCase();

// LISTARE PROIECTE
router.get('/', async (req, res) => {
    try {
        const projects = await Project.findAll({
            include: [
                { model: ProjectMember, include: [User] },
                { model: Bug }
            ]
        });
        res.json(projects);
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

// CREARE PROIECT
router.post('/', async (req, res) => {
    try {
        const { name, repository, owner_id, description, technologies } = req.body;
        const code = generateCode();

        const project = await Project.create({
            name,
            repository,
            owner_id,
            join_code: code,
            description,
            technologies
        });

        // Cel care crează este automat Manager (MP)
        await ProjectMember.create({ project_id: project.id, user_id: owner_id, role: 'MP' });

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

module.exports = router;
