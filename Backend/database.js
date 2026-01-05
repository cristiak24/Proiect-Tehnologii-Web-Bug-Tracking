const { Sequelize, DataTypes, Op } = require('sequelize');

// 1. CONFIGURARE BAZĂ DE DATE
// Se folosește SQLite pentru simplitate (fișier local)
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: './bugtracker.db',
    logging: false // Oprește log-urile SQL în consolă pentru claritate
});

// 2. DEFINIRE MODELE (Tabele)

// Model Utilizator
const User = sequelize.define('User', {
    email: { type: DataTypes.STRING, unique: true, allowNull: false },
    password: { type: DataTypes.STRING, allowNull: false }, // În producție ar trebui hash-uită!
    name: { type: DataTypes.STRING, defaultValue: 'Student' }
});

// Model Proiect
const Project = sequelize.define('Project', {
    name: { type: DataTypes.STRING, allowNull: false },
    repository: { type: DataTypes.STRING }, // Link către GitHub
    owner_id: { type: DataTypes.INTEGER }, // ID-ul celui care a creat proiectul
    join_code: { type: DataTypes.STRING, unique: true }, // Cod unic pentru alăturare
    description: { type: DataTypes.STRING },
    technologies: { type: DataTypes.STRING }
});

// Model Membru Proiect (Tabelă de legătură Many-to-Many cu roluri)
const ProjectMember = sequelize.define('ProjectMember', {
    project_id: { type: DataTypes.INTEGER },
    user_id: { type: DataTypes.INTEGER },
    role: { type: DataTypes.STRING } // 'MP' (Membru Proiect) sau 'TST' (Tester)
});

// Model Bug
const Bug = sequelize.define('Bug', {
    title: { type: DataTypes.STRING, allowNull: false, defaultValue: 'Untitled Bug' },
    description: { type: DataTypes.STRING },
    severity: { type: DataTypes.STRING }, // Low, Medium, Critical
    priority: { type: DataTypes.STRING }, // High (default la creare momentan)
    commit_link: { type: DataTypes.STRING }, // Link opțional către commit
    image_path: { type: DataTypes.STRING }, // Link către imagine
    status: { type: DataTypes.STRING, defaultValue: 'Open' }, // Open, In Progress, Resolved, Closed
    fix_link: { type: DataTypes.STRING }, // Link către PR-ul care rezolvă
    project_id: { type: DataTypes.INTEGER },
    reporter_id: { type: DataTypes.INTEGER }, // Cine a raportat
    assigned_to: { type: DataTypes.INTEGER } // Cine rezolvă (MP)
});

// Model Comentariu (NOU - Faza 2)
const Comment = sequelize.define('Comment', {
    text: { type: DataTypes.STRING, allowNull: false },
    image_path: { type: DataTypes.STRING }, // Imagine opțională
    project_id: { type: DataTypes.INTEGER },
    bug_id: { type: DataTypes.INTEGER },
    user_id: { type: DataTypes.INTEGER }
});

// 3. RELAȚII ÎNTRE TABELE

// Un Proiect are mulți Membri
Project.hasMany(ProjectMember, { foreignKey: 'project_id' });
ProjectMember.belongsTo(User, { foreignKey: 'user_id' }); // Putem accesa datele userului din membru

// Un Proiect are multe Bug-uri
Project.hasMany(Bug, { foreignKey: 'project_id' });
Bug.belongsTo(Project, { foreignKey: 'project_id' });

// Bug-ul aparține unui raportor (User)
Bug.belongsTo(User, { as: 'Reporter', foreignKey: 'reporter_id' });
Bug.belongsTo(User, { as: 'Assignee', foreignKey: 'assigned_to' });

// Comentarii
Bug.hasMany(Comment, { foreignKey: 'bug_id' });
Comment.belongsTo(User, { foreignKey: 'user_id' }); // Ca să știm cine a scris

// 4. INIȚIALIZARE ȘI POPULARE (SEED)
async function initDB() {
    try {
        // Disable foreign key checks to allow table recreation/alteration
        await sequelize.query('PRAGMA foreign_keys = OFF;');

        await sequelize.sync({ alter: true }); // 'alter: true' actualizează structura

        // Re-enable foreign key checks
        await sequelize.query('PRAGMA foreign_keys = ON;');

        console.log(">> Baza de Date Sincronizată.");

        // Verificăm dacă e goală și adăugăm date de start
        if (await User.count() === 0) {
            console.log(">> Se introduc date de test...");
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
            console.log(">> Date de test create cu succes!");
        }
    } catch (err) { console.error("Eroare la inițializare DB:", err); }
}

module.exports = { sequelize, User, Project, ProjectMember, Bug, Comment, Op, initDB };