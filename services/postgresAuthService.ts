import { User } from '../db/models';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';

// Type pour les données d'utilisateur
export interface UserData {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  address?: string;
  postalCode?: string;
  city?: string;
}

// Type pour les informations de connexion
export interface LoginCredentials {
  email: string;
  password: string;
}

// Type pour le résultat de connexion
export interface LoginResult {
  user: any;
  token: string;
}

// Type pour les erreurs d'authentification
export interface AuthError {
  code: string;
  message: string;
}

const SECRET_KEY = process.env.JWT_SECRET || 'your-secret-key';
const TOKEN_EXPIRATION = '24h';

/**
 * Enregistre un nouvel utilisateur
 */
export const registerUser = async (userData: UserData): Promise<any> => {
  try {
    // Vérifier si l'utilisateur existe déjà
    const existingUser = await User.findOne({ where: { email: userData.email } });
    if (existingUser) {
      throw {
        code: 'auth/email-already-in-use',
        message: 'Cet email est déjà utilisé.'
      };
    }

    // Créer un nouvel utilisateur
    const newUser = await User.create({
      id: uuidv4(),
      email: userData.email,
      password: userData.password, // Le hash est géré par les hooks Sequelize
      firstName: userData.firstName,
      lastName: userData.lastName,
      phoneNumber: userData.phoneNumber,
      address: userData.address,
      postalCode: userData.postalCode,
      city: userData.city
    });

    // Générer un token JWT
    const token = jwt.sign(
      { 
        id: newUser.id, 
        email: newUser.email,
        isAdmin: newUser.isAdmin 
      }, 
      SECRET_KEY, 
      { expiresIn: TOKEN_EXPIRATION }
    );

    return {
      user: {
        id: newUser.id,
        email: newUser.email,
        firstName: newUser.firstName,
        lastName: newUser.lastName
      },
      token
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Connecte un utilisateur existant
 */
export const loginUser = async (email: string, password: string): Promise<LoginResult> => {
  try {
    // Trouver l'utilisateur par email
    const user = await User.findOne({ where: { email } });
    if (!user) {
      throw {
        code: 'auth/user-not-found',
        message: 'Utilisateur non trouvé.'
      };
    }

    // Vérifier le mot de passe
    const isPasswordValid = await user.validPassword(password);
    if (!isPasswordValid) {
      throw {
        code: 'auth/wrong-password',
        message: 'Mot de passe incorrect.'
      };
    }

    // Mettre à jour la date de dernière connexion
    await user.update({ lastLogin: new Date() });

    // Générer un token JWT
    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email,
        isAdmin: user.isAdmin 
      }, 
      SECRET_KEY, 
      { expiresIn: TOKEN_EXPIRATION }
    );

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        isAdmin: user.isAdmin
      },
      token
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Déconnecte l'utilisateur (côté client)
 */
export const logoutUser = async (): Promise<void> => {
  // Avec JWT, la déconnexion est généralement gérée côté client
  // en supprimant le token du stockage local
  return Promise.resolve();
};

/**
 * Réinitialise le mot de passe d'un utilisateur
 */
export const resetPassword = async (email: string): Promise<void> => {
  try {
    // Trouver l'utilisateur par email
    const user = await User.findOne({ where: { email } });
    if (!user) {
      throw {
        code: 'auth/user-not-found',
        message: 'Utilisateur non trouvé.'
      };
    }

    // Générer un token de réinitialisation
    const resetToken = uuidv4();
    const expiresIn = new Date();
    expiresIn.setHours(expiresIn.getHours() + 1); // Expire dans 1 heure

    // Enregistrer le token dans la base de données
    await user.update({
      resetPasswordToken: resetToken,
      resetPasswordExpires: expiresIn
    });

    // Dans une application réelle, vous enverriez un email avec le lien de réinitialisation
    // contenant ce token

    return Promise.resolve();
  } catch (error) {
    throw error;
  }
};

/**
 * Valide un token de réinitialisation de mot de passe et change le mot de passe
 */
export const changePasswordWithToken = async (token: string, newPassword: string): Promise<void> => {
  try {
    // Trouver l'utilisateur avec ce token qui n'a pas encore expiré
    const user = await User.findOne({
      where: {
        resetPasswordToken: token,
        resetPasswordExpires: {
          [User.sequelize.Op.gt]: new Date() // Token non expiré
        }
      }
    });

    if (!user) {
      throw {
        code: 'auth/invalid-action-code',
        message: 'Ce lien de réinitialisation est invalide ou a expiré.'
      };
    }

    // Mettre à jour le mot de passe et effacer le token
    await user.update({
      password: newPassword, // Le hash est géré par les hooks Sequelize
      resetPasswordToken: null,
      resetPasswordExpires: null
    });

    return Promise.resolve();
  } catch (error) {
    throw error;
  }
};

/**
 * Vérifie si un token JWT est valide
 */
export const verifyToken = (token: string): any => {
  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    return decoded;
  } catch (error) {
    throw {
      code: 'auth/invalid-token',
      message: 'Token invalide ou expiré.'
    };
  }
};

/**
 * Obtient l'utilisateur actuel à partir de son token
 */
export const getCurrentUser = async (token: string): Promise<any> => {
  try {
    const decoded = verifyToken(token);
    const user = await User.findByPk(decoded.id, {
      attributes: { exclude: ['password', 'resetPasswordToken', 'resetPasswordExpires'] }
    });
    
    if (!user) {
      throw {
        code: 'auth/user-not-found',
        message: 'Utilisateur non trouvé.'
      };
    }
    
    return user;
  } catch (error) {
    throw error;
  }
};
