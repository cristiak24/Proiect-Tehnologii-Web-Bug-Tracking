const { sequelize, User, Project, ProjectMember, Bug, Comment } = require('./database');

async function resetDatabase() {
    try {
        console.log(">> Stergem toate tabelele si le recream...");
        await sequelize.sync({ force: true });
        console.log(">> Baza de date a fost resetata!");

        console.log(">> Adaugam useri de test curati (ID-urile vor incepe de la 1 sau vor fi resetate)...");
        const mp = await User.create({ email: 'mp@test.com', password: '1234', name: 'Membru Proiect' });
        const tst = await User.create({ email: 'tst@test.com', password: '1234', name: 'Tester' });

        console.log(`>> Useri creati: MP (ID ${mp.id}), TST (ID ${tst.id})`);

        process.exit(0);
    } catch (err) {
        console.error("Eroare la resetare:", err);
        process.exit(1);
    }
}

resetDatabase();
