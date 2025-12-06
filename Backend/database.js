const { Sequelize, DataTypes, Op } = require('sequelize');

// 1. CONFIGURARE
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: './bugtracker.db',
    logging: false
});

// 2. DEFINIRE MODELE
const User = sequelize.define('User', {
    email: { type: DataTypes.STRING, unique: true, allowNull: false },
    password: { type: DataTypes.STRING, allowNull: false },
    name: { type: DataTypes.STRING, defaultValue: 'Student' }
});

const Project = sequelize.define('Project', {
    name: { type: DataTypes.STRING, allowNull: false },
    repository: { type: DataTypes.STRING },
    owner_id: { type: DataTypes.INTEGER },
    join_code: { type: DataTypes.STRING, unique: true },
    description: { type: DataTypes.STRING }, 
    technologies: { type: DataTypes.STRING } 
});

const ProjectMember = sequelize.define('ProjectMember', {
    project_id: { type: DataTypes.INTEGER },
    user_id: { type: DataTypes.INTEGER },
    role: { type: DataTypes.STRING }
});

const Bug = sequelize.define('Bug', {
    description: { type: DataTypes.STRING },
    severity: { type: DataTypes.STRING },
    priority: { type: DataTypes.STRING },
    commit_link: { type: DataTypes.STRING },
    status: { type: DataTypes.STRING, defaultValue: 'Open' },
    fix_link: { type: DataTypes.STRING },
    project_id: { type: DataTypes.INTEGER },
    reporter_id: { type: DataTypes.INTEGER },
    assigned_to: { type: DataTypes.INTEGER }
});

// 3. RELAȚII (AICI LIPSEA CEVA)
Project.hasMany(ProjectMember, { foreignKey: 'project_id' });
ProjectMember.belongsTo(User, { foreignKey: 'user_id' });

// AM ADĂUGAT ASTA PENTRU DASHBOARD 
Project.hasMany(Bug, { foreignKey: 'project_id' }); 
Bug.belongsTo(Project, { foreignKey: 'project_id' });

// 4. INIT & SEED
async function initDB() {
    try {
        await sequelize.sync(); 
        console.log(">> DB Sincronizată.");
        if (await User.count() === 0) {
            console.log(">> Se introduc date de test...");
            const mp = await User.create({ email: 'mp@test.com', password: '1234', name: 'Membru Proiect' });
            const tst = await User.create({ email: 'tst@test.com', password: '1234', name: 'Tester' });
            
            // Am adăugat descrieri și aici ca să apară frumos din prima
            const p1 = await Project.create({ 
                name: 'Magazin Online', 
                repository: 'http://github.com/demo', 
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
            console.log(">> Date de test create!");
        }
    } catch (err) { console.error(err); }
}

module.exports = { sequelize, User, Project, ProjectMember, Bug, Op, initDB };