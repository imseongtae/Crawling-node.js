const Sequelize = require('sequelize');
const env = process.env.NODE_ENV || 'development';
const config = require('../config/config.json')[env];
const db = {};

const sequelize = new Sequelize(
	config.database,
	config.username,
	config.password,
	config,
);

// db.Proxy = require('./proxy')(sequelize, Sequelize); // 사용하려는 모델을 연결
// db.Performance = require('./review')(sequelize, Sequelize);
db.Performance = require('./performance-information')(sequelize, Sequelize);
db.Review = require('./review')(sequelize, Sequelize);

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
