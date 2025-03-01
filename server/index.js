const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { testConnection, db } = require('./database');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Tester la connexion à la base de données
testConnection();

// Routes d'authentification
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, firstName, lastName, phoneNumber, address, postalCode, city } = req.body;
    
    // Vérifier si l'email existe déjà
    const existingUser = await db.User.findOne({ where: { email } });
    
    if (existingUser) {
      return res.status(400).json({ 
        error: 'Cet email est déjà utilisé.' 
      });
    }
    
    // Créer un nouvel utilisateur
    const user = await db.User.create({
      email,
      password, // Le hachage est géré par les hooks Sequelize
      firstName,
      lastName,
      phoneNumber,
      address,
      postalCode,
      city
    });
    
    // Créer un token JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, isAdmin: user.isAdmin },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );
    
    res.status(201).json({
      message: 'Utilisateur créé avec succès',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName
      },
      token
    });
  } catch (error) {
    console.error('Erreur lors de l\'inscription:', error);
    res.status(500).json({ 
      error: 'Une erreur est survenue lors de l\'inscription.' 
    });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Trouver l'utilisateur par email
    const user = await db.User.findOne({ where: { email } });
    
    if (!user) {
      return res.status(401).json({ 
        error: 'Email ou mot de passe incorrect.' 
      });
    }
    
    // Vérifier le mot de passe
    const isPasswordValid = await user.validPassword(password);
    
    if (!isPasswordValid) {
      return res.status(401).json({ 
        error: 'Email ou mot de passe incorrect.' 
      });
    }
    
    // Mettre à jour la date de dernière connexion
    await user.update({ lastLogin: new Date() });
    
    // Créer un token JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, isAdmin: user.isAdmin },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );
    
    res.status(200).json({
      message: 'Connexion réussie',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        isAdmin: user.isAdmin
      },
      token
    });
  } catch (error) {
    console.error('Erreur lors de la connexion:', error);
    res.status(500).json({ 
      error: 'Une erreur est survenue lors de la connexion.' 
    });
  }
});

app.post('/api/auth/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    
    // Trouver l'utilisateur par email
    const user = await db.User.findOne({ where: { email } });
    
    if (!user) {
      // Pour des raisons de sécurité, nous ne révélons pas si l'email existe ou non
      return res.status(200).json({ 
        message: 'Si votre email est enregistré, vous recevrez un lien de réinitialisation.' 
      });
    }
    
    // Générer un token de réinitialisation
    const resetToken = require('crypto').randomBytes(32).toString('hex');
    const expiresIn = new Date();
    expiresIn.setHours(expiresIn.getHours() + 1); // Expire dans 1 heure
    
    // Enregistrer le token dans la base de données
    await user.update({
      resetPasswordToken: resetToken,
      resetPasswordExpires: expiresIn
    });
    
    // Ici, vous enverriez un email avec le lien de réinitialisation
    // Pour l'exemple, nous allons simplement retourner le token
    res.status(200).json({
      message: 'Si votre email est enregistré, vous recevrez un lien de réinitialisation.',
      // Ne pas inclure cette ligne en production:
      token: resetToken
    });
  } catch (error) {
    console.error('Erreur lors de la demande de réinitialisation de mot de passe:', error);
    res.status(500).json({ 
      error: 'Une erreur est survenue lors de la demande de réinitialisation.' 
    });
  }
});

app.post('/api/auth/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    
    // Trouver l'utilisateur avec ce token non expiré
    const user = await db.User.findOne({
      where: {
        resetPasswordToken: token,
        resetPasswordExpires: {
          [db.Sequelize.Op.gt]: new Date() // Token non expiré
        }
      }
    });
    
    if (!user) {
      return res.status(400).json({ 
        error: 'Ce lien de réinitialisation est invalide ou a expiré.' 
      });
    }
    
    // Mettre à jour le mot de passe et effacer le token
    await user.update({
      password: newPassword, // Le hachage est géré par les hooks Sequelize
      resetPasswordToken: null,
      resetPasswordExpires: null
    });
    
    res.status(200).json({ 
      message: 'Votre mot de passe a été mis à jour avec succès.' 
    });
  } catch (error) {
    console.error('Erreur lors de la réinitialisation du mot de passe:', error);
    res.status(500).json({ 
      error: 'Une erreur est survenue lors de la réinitialisation du mot de passe.' 
    });
  }
});

// Middleware pour vérifier l'authentification
const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (authHeader) {
    const token = authHeader.split(' ')[1];
    
    jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, user) => {
      if (err) {
        return res.status(403).json({ error: 'Token invalide ou expiré.' });
      }
      
      req.user = user;
      next();
    });
  } else {
    res.status(401).json({ error: 'Authentification requise.' });
  }
};

// Route protégée pour obtenir le profil utilisateur
app.get('/api/profile', authenticateJWT, async (req, res) => {
  try {
    const user = await db.User.findByPk(req.user.id, {
      attributes: { exclude: ['password', 'resetPasswordToken', 'resetPasswordExpires'] }
    });
    
    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé.' });
    }
    
    res.status(200).json(user);
  } catch (error) {
    console.error('Erreur lors de la récupération du profil:', error);
    res.status(500).json({ error: 'Une erreur est survenue lors de la récupération du profil.' });
  }
});

// Démarrer le serveur
app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});
