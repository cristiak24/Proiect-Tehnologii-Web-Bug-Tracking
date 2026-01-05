const express = require('express');
const router = express.Router();

// Dat fiind că e un proxy simplu, scriem logica direct aici (sau am putea face un controller)
router.get('/repo-info', async (req, res) => {
    const { owner, repo } = req.query;
    if (!owner || !repo) return res.status(400).json({ error: "Proprietarul și Repozitoriul sunt obligatorii" });

    try {
        const response = await fetch(`https://api.github.com/repos/${owner}/${repo}`);
        if (!response.ok) {
            return res.status(response.status).json({ error: "Eroare GitHub API" });
        }
        const data = await response.json();
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: "Eșec la comunicarea cu GitHub" });
    }
});

module.exports = router;
