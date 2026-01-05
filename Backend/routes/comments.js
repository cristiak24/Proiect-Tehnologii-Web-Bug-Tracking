const express = require('express');
const router = express.Router();
const { Comment, User } = require('../database');

// GET - Toate comentariile pentru un Bug
router.get('/:bugId', async (req, res) => {
    try {
        const comments = await Comment.findAll({
            where: { bug_id: req.params.bugId },
            include: [User], // Aducem și autorul
            order: [['createdAt', 'ASC']] // Cele vechi primele
        });
        res.json(comments);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST - Adăugare comentariu
router.post('/', async (req, res) => {
    try {
        const { text, bug_id, user_id, project_id, image_path } = req.body;

        if (!text) return res.status(400).json({ error: "Textul este obligatoriu" });

        const comment = await Comment.create({
            text,
            image_path,
            bug_id,
            user_id,
            project_id
        });

        // Returnăm comentariul cu tot cu User pentru afișare instantă
        const fullComment = await Comment.findByPk(comment.id, { include: [User] });
        res.json(fullComment);

    } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
