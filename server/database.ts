import { Sequelize } from 'sequelize';
import path from 'path';
import dotenv from 'dotenv';
import type { Dialect } from 'sequelize';

dotenv.config({ path: path.resolve(__dirname, '..', '.env.local') });

const env = process.env.NODE_ENV || 'development';
// Utiliser import pour les fichiers JS/JSON peut nécessiter un setup TypeScript spécifique
// @ts-ignore
import config from '../db/config';

// Type pour la configuration
interface DbConfig {
  database: string;
  username: string;
  password: string;
  host: string;
  port: number;
  dialect: Dialect;
  dialectOptions: object;
}

// Créer l'instance de connexion Sequelize
const sequelize = new Sequelize(
  config[env].database,
  config[env].username,
  config[env].password,
  {
    host: config[env].host,
    port: config[env].port,
    dialect: config[env].dialect,
    logging: env === 'development' ? console.log : false,
    dialectOptions: config[env].dialectOptions
  }
);

// Tester la connexion
const testConnection = async (): Promise<void> => {
  try {
    await sequelize.authenticate();
    console.log('✅ Connexion à la base de données établie avec succès.');
  } catch (error) {
    console.error('❌ Impossible de se connecter à la base de données:', error);
  }
};

// Charger les modèles
// @ts-ignore - Ajout d'un ignore car l'import dynamique peut nécessiter une configuration TypeScript spécifique
import * as dbModels from '../db/models';
const db = dbModels;

export {
  sequelize,
  testConnection,
  db
};
