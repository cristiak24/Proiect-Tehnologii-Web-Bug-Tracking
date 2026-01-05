const express = require('express');
const router = express.Router();
const { Bug } = require('../database');

// CREARE BUG
router.post('/', async (req, res) => {
    try {
        const bug = await Bug.create(req.body);
        res.json(bug);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// ACTUALIZARE BUG (Status, Assignment)
router.put('/:id', async (req, res) => {
    try {
        const { assigned_to } = req.body;

        // Verificare alocare unică
        if (assigned_to) {
            const bug = await Bug.findByPk(req.params.id);
            if (bug.assigned_to && bug.assigned_to !== assigned_to) {
                // Aici am putea refuza cererea dacă regula e strictă
            }
        }

        await Bug.update(req.body, { where: { id: req.params.id } });
        res.json({ message: "Bug Actualizat" });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
