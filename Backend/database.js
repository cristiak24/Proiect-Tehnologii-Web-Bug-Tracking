const { Sequelize, DataTypes, Op } = require('sequelize');

// --- MODIFICARE 1: Conexiunea la Neon (PostgreSQL) ---

// 1. Încărcăm variabilele de mediu
// Dacă fișierul se numește fix ".env", nu e nevoie de { path: ... }
require('dotenv').config(); 

// 2. DEFINIM connectionString (Aici era eroarea, lipsea linia asta!)
const connectionString = process.env.DATABASE_URL;

// Opțional: Verificăm să nu fie gol, ca să nu ne chinuim cu erori ciudate
if (!connectionString) {
    console.error("EROARE: Nu am găsit DATABASE_URL! Verifică fișierul .env sau setările din Render.");
}

const sequelize = new Sequelize(connectionString, {
    dialect: 'postgres', 
    logging: false,
    dialectOptions: {
        ssl: {
            require: true,
            rejectUnauthorized: false 
        }
    }
});


// --- DEFINIREA MODELELOR (Ramane la fel) ---

// Tabela pentru useri
const User = sequelize.define('User', {
    email: { type: DataTypes.STRING, unique: true, allowNull: false },
    password: { type: DataTypes.STRING, allowNull: false },
    name: { type: DataTypes.STRING, defaultValue: 'Student' }
});

// Tabela pentru proiecte
const Project = sequelize.define('Project', {
    name: { type: DataTypes.STRING, allowNull: false },
    repository: { type: DataTypes.STRING },
    owner_id: { type: DataTypes.INTEGER },
    join_code: { type: DataTypes.STRING, unique: true },
    description: { type: DataTypes.STRING },
    technologies: { type: DataTypes.STRING }
});

// Tabela de legatura Many-to-Many
const ProjectMember = sequelize.define('ProjectMember', {
    project_id: { type: DataTypes.INTEGER },
    user_id: { type: DataTypes.INTEGER },
    role: { type: DataTypes.STRING },
    status: { type: DataTypes.STRING, defaultValue: 'pending' }
});

// Tabela principala pentru bug-uri
const Bug = sequelize.define('Bug', {
    title: { type: DataTypes.STRING, allowNull: false, defaultValue: 'Untitled Bug' },
    description: { type: DataTypes.STRING },
    severity: { type: DataTypes.STRING },
    priority: { type: DataTypes.STRING },
    commit_link: { type: DataTypes.STRING },
    image_path: { type: DataTypes.STRING },
    status: { type: DataTypes.STRING, defaultValue: 'Open' },
    fix_link: { type: DataTypes.STRING },
    project_id: { type: DataTypes.INTEGER },
    reporter_id: { type: DataTypes.INTEGER },
    assigned_to: { type: DataTypes.INTEGER }
});

// Tabela pentru comentarii
const Comment = sequelize.define('Comment', {
    text: { type: DataTypes.STRING, allowNull: false },
    image_path: { type: DataTypes.STRING },
    project_id: { type: DataTypes.INTEGER },
    bug_id: { type: DataTypes.INTEGER },
    user_id: { type: DataTypes.INTEGER }
});

// --- RELATII (Raman la fel) ---

Project.hasMany(ProjectMember, { foreignKey: 'project_id' });
ProjectMember.belongsTo(User, { foreignKey: 'user_id' });

Project.hasMany(Bug, { foreignKey: 'project_id' });
Bug.belongsTo(Project, { foreignKey: 'project_id' });

Bug.belongsTo(User, { as: 'Reporter', foreignKey: 'reporter_id' });
Bug.belongsTo(User, { as: 'Assignee', foreignKey: 'assigned_to' });

Bug.hasMany(Comment, { foreignKey: 'bug_id' });
Comment.belongsTo(User, { foreignKey: 'user_id' });

// --- INITIALIZARE DB (Modificata pentru Postgres) ---

async function initDB() {
    try {
        // --- MODIFICARE 2: Am scos PRAGMA (nu merge pe Postgres) ---
        
        // Testam conexiunea intai
        await sequelize.authenticate();
        console.log('>> Conexiunea cu Neon DB a reusit!');

        // Sincronizam modelele (alter: true va actualiza tabelele din Neon)
        await sequelize.sync({ alter: true });

        console.log(">> Gata, baza de date e sincronizata.");

        // Verificam daca e goala si bagam date de test
        if (await User.count() === 0) {
            console.log(">> Baza e goala, bag date de test...");
            const mp = await User.create({ email: 'mp@test.com', password: '1234', name: 'Membru Proiect' });
            const tst = await User.create({ email: 'tst@test.com', password: '1234', name: 'Tester' });

            const p1 = await Project.create({
                name: 'Magazin Online',
                repository: 'http://github.com/facebook/react',
                owner_id: mp.id,
                join_code: 'STORE1',
                description: 'Magazin complet cu coș de cumpărături și plăți.',
                technologies: 'React, Node.js'
            });
            await ProjectMember.create({ project_id: p1.id, user_id: mp.id, role: 'MP' });

            await Project.create({
                name: 'Aplicatie Chat',
                repository: 'http://github.com/chat',
                owner_id: tst.id,
                join_code: 'CHAT99',
                description: 'Chat în timp real pentru studenți.',
                technologies: 'Socket.io, Express'
            });
            console.log(">> Am terminat cu datele de test!");
        }
    } catch (err) { 
        console.error("A crapat la initializare DB:", err); 
    }
}

module.exports = { sequelize, User, Project, ProjectMember, Bug, Comment, Op, initDB };