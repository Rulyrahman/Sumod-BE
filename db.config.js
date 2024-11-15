const {Sequelize} = require('sequelize')

const sequelize = new Sequelize('sumod', 'root', '', {
    dialect: 'mysql',
    host: 'localhost',
    port: 3307, // Default port MySQL
    logging: console.log
});



module.exports = sequelize