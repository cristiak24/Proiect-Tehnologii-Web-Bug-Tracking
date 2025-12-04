// Importăm User din fișierul de bază de date
const { User } = require('./database');

class AuthController {
    
    // Metoda de Înregistrare
    static async register(req, res) {
        try {
            const { email, password, name } = req.body;

            // VALIDĂRI (Backend Logic)
            if (!email || !password || !name) {
                return res.status(400).json({ error: "Toate câmpurile sunt obligatorii!" });
            }
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                return res.status(400).json({ error: "Email invalid!" });
            }
            if (password.length < 4) {
                return res.status(400).json({ error: "Parola prea scurtă!" });
            }

            // Creare User
            const user = await User.create(req.body);
            res.json({ message: "Cont creat!", userId: user.id });

        } catch (err) {
            res.status(400).json({ error: "Email deja folosit sau eroare server." });
        }
    }

    // Metoda de Login
    static async login(req, res) {
        try {
            const { email, password } = req.body;
            const user = await User.findOne({ where: { email, password } });
            
            if (!user) return res.status(401).json({ error: "Date incorecte." });
            
            res.json({ message: "OK", user });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }
}

module.exports = AuthController;