// Importăm User din fișierul de bază de date
const { User } = require('./database');

class AuthController {

    // Functia care se ocupa de Inregistrare
    static async register(req, res) {
        try {
            const { email, password, name } = req.body;

            if (!email || !password || !name) {
                return res.status(400).json({ error: "Vezi ca nu ai completat tot!" });
            }
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                return res.status(400).json({ error: "Email-ul nu e valid!" });
            }
            if (password.length < 4) {
                return res.status(400).json({ error: "Pune si tu o parola mai lunga de 4 caractere." });
            }

            const user = await User.create(req.body);
            res.json({ message: "Gata, ti-am facut cont!", userId: user.id });

        } catch (err) {
            res.status(400).json({ error: "S-ar putea sa ai deja cont cu emailul asta." });
        }
    }

    // Functia de Login
    static async login(req, res) {
        try {
            const { email, password } = req.body;
            const user = await User.findOne({ where: { email, password } });

            if (!user) return res.status(401).json({ error: "Ai gresit userul sau parola." });

            res.json({ message: "OK", user });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }

    // UPDATE PROFILE
    static async updateProfile(req, res) {
        try {
            const { email, name, github, avatar } = req.body;
            const user = await User.findOne({ where: { email } });
            if (!user) return res.status(404).json({ error: "User not found" });

            await user.update({ name, github, avatar });
            res.json({ message: "Profil actualizat!", user });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }
}

module.exports = AuthController;