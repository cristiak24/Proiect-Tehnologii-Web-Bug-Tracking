const { sequelize, ProjectMember } = require('../database');

async function fixTesters() {
    try {
        await sequelize.authenticate();
        console.log('Connection has been established successfully.');

        const result = await ProjectMember.update(
            { status: 'active' },
            {
                where: {
                    role: 'TST',
                    status: ['pending', null] // Update pending or null statuses
                }
            }
        );

        console.log(`Updated ${result[0]} testers to active status.`);
    } catch (error) {
        console.error('Unable to connect to the database or update:', error);
    } finally {
        await sequelize.close();
    }
}

fixTesters();
