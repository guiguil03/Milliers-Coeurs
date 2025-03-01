const { Sequelize } = require('sequelize');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env.local') });

const env = process.env.NODE_ENV || 'development';
const config = require('../db/config')[env];

// Créer l'instance de connexion Sequelize
const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  {
    host: config.host,
    port: config.port,
    dialect: config.dialect,
    logging: env === 'development' ? console.log : false,
    dialectOptions: config.dialectOptions
  }
);

// Tester la connexion
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Connexion à la base de données établie avec succès.');
  } catch (error) {
    console.error('❌ Impossible de se connecter à la base de données:', error);
  }
};

// Charger les modèles
const db = require('../db/models');

module.exports = {
  sequelize,
  testConnection,
  db
};
