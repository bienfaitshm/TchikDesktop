import bcrypt from "bcryptjs";

/**
 * Nombre de "rounds" pour le salage.
 * 10 est le standard actuel : un bon compromis entre sécurité (temps de calcul)
 * et performance pour le serveur.
 */
const SALT_ROUNDS = 10;

/**
 * Hache un mot de passe en utilisant l'algorithme Bcrypt.
 * * @param password Le mot de passe en clair à sécuriser.
 * @returns Une promesse contenant le hash généré (incluant le sel).
 */
export const hashPassword = async (password: string): Promise<string> => {
  if (!password || password.trim() === "") {
    throw new Error("Le mot de passe ne peut pas être vide.");
  }
  return bcrypt.hash(password, SALT_ROUNDS);
};

/**
 * Vérifie si un mot de passe en clair correspond au hash stocké en base de données.
 * * @param password Le mot de passe en clair fourni par l'utilisateur lors de la connexion.
 * @param storedHash Le hash récupéré depuis la base de données.
 * @returns Une promesse résolue par un booléen (true si ça correspond).
 */
export const verifyPassword = async (
  password: string,
  storedHash: string,
): Promise<boolean> => {
  if (!password || !storedHash) {
    return false;
  }
  return bcrypt.compare(password, storedHash);
};
