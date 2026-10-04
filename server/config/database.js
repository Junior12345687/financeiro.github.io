const {Sequelize} = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize({
    database: process.env.DB_NAME || 'financas',
    username: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    host: process.env.DB_HOST || 'localhost',
    dialect: 'mysql',
    logging: false,
});


(async () => {
    try {
        await sequelize.authenticate();
        console.log('✅ Conexão com o banco de dados estabelecida com sucesso.');

        await sequelize.sync({ alter: true });
        console.log('✅ Tabelas atualizadas com sucesso.');

    } catch (error) {
        console.error('❌ Não foi possível conectar ao banco de dados:', error);
    }
})();

module.exports = sequelize;