import { DataTypes, Model, BuildOptions } from "sequelize";
import { sequelize } from "../config";

// =====================
// INTERFACES ATTRIBUTS
// =====================

export interface RoleAttributes {
  id_role: number;
  nom_role: string;
}

export interface UserAttributes {
  id_utilisateur: number;
  nom: string;
  postnom?: string;
  prenom?: string;
  email: string;
  password: string;
  date_naissance?: string;
  sexe?: string;
}

export interface SectionAttributes {
  id_section: number;
  nom_section: string;
}

export interface OptionAttributes {
  id_option: number;
  nom_option: string;
}

export interface AnneeEtudeAttributes {
  id_annee: number;
  nom_annee: string;
}

export interface ClasseAttributes {
  id_classe?: number;
  nom_identifiant: string;
  annee_scolaire: string;
  id_section?: number;
  id_option?: number;
  id_annee?: number;
}

// =====================
// TYPES MODELES
// =====================

type ModelStatic<T extends {}> = typeof Model & {
  new (values?: object, options?: BuildOptions): Model<T> & T;
};

// =====================
// DEFINITION DES MODELES
// =====================

const Role = sequelize.define(
  "Role",
  {
    id_role: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    nom_role: { type: DataTypes.STRING, allowNull: false, unique: true },
  },
  { tableName: "Roles" }
) as ModelStatic<RoleAttributes>;

/**
 * Représente le modèle User pour la gestion des utilisateurs dans l'application.
 *
 * Ce modèle mappe la table "Utilisateurs" de la base de données et définit les attributs principaux d'un utilisateur.
 *
 * Attributs :
 * - id_utilisateur : Identifiant unique de l'utilisateur (clé primaire, auto-incrémentée).
 * - nom : Nom de famille de l'utilisateur (obligatoire).
 * - postnom : Post-nom de l'utilisateur (optionnel).
 * - prenom : Prénom de l'utilisateur (optionnel).
 * - email : Adresse e-mail de l'utilisateur (obligatoire, unique, format valide requis).
 * - password : Mot de passe de l'utilisateur (obligatoire).
 * - date_naissance : Date de naissance de l'utilisateur (optionnelle, format AAAA-MM-JJ).
 * - sexe : Sexe de l'utilisateur (optionnel).
 *
 * Ce modèle utilise Sequelize pour l'ORM et assure la validation des données, notamment pour l'e-mail.
 *
 * @remarks
 * Utilisez ce modèle pour toutes les opérations CRUD liées aux utilisateurs.
 * Assurez-vous de ne jamais exposer le mot de passe en clair lors des réponses API.
 */
const User = sequelize.define(
  "User",
  {
    id_utilisateur: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nom: { type: DataTypes.STRING, allowNull: false },
    postnom: DataTypes.STRING,
    prenom: DataTypes.STRING,
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: { isEmail: true },
    },
    password: { type: DataTypes.STRING, allowNull: false },
    date_naissance: DataTypes.DATEONLY,
    sexe: DataTypes.STRING,
  },
  { tableName: "Utilisateurs" }
) as ModelStatic<UserAttributes>;

const Section = sequelize.define(
  "Section",
  {
    id_section: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nom_section: { type: DataTypes.STRING, allowNull: false, unique: true },
  },
  { tableName: "Sections", timestamps: false }
) as ModelStatic<SectionAttributes>;

const Option = sequelize.define(
  "Option",
  {
    id_option: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nom_option: { type: DataTypes.STRING, allowNull: false, unique: true },
  },
  { tableName: "Options", timestamps: false }
) as ModelStatic<OptionAttributes>;

const AnneeEtude = sequelize.define(
  "AnneeEtude",
  {
    id_annee: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nom_annee: { type: DataTypes.STRING, allowNull: false, unique: true },
  },
  { tableName: "AnneesEtudes" }
) as ModelStatic<AnneeEtudeAttributes>;

const Classe = sequelize.define(
  "Classe",
  {
    id_classe: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nom_identifiant: { type: DataTypes.STRING, allowNull: false },
    annee_scolaire: { type: DataTypes.STRING, allowNull: false },
    id_section: { type: DataTypes.INTEGER, allowNull: true },
    id_option: { type: DataTypes.INTEGER, allowNull: true },
    id_annee: { type: DataTypes.INTEGER, allowNull: true },
  },
  { tableName: "Classes" }
) as ModelStatic<ClasseAttributes>;

const Inscription = sequelize.define(
  "Inscription",
  {
    id_inscription: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    date_inscription: { type: DataTypes.DATEONLY, defaultValue: DataTypes.NOW },
  },
  { tableName: "Inscriptions" }
);

const ProfesseurClasse = sequelize.define(
  "ProfesseurClasse",
  {
    id_affectation: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    matiere_enseignee: DataTypes.STRING,
  },
  { tableName: "Professeur_Classes" }
);

const RelationParentEleve = sequelize.define(
  "RelationParentEleve",
  {
    id_relation: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    type_relation: { type: DataTypes.STRING, allowNull: false },
  },
  { tableName: "Relations_Parent_Eleve" }
);

// =====================
// ASSOCIATIONS
// =====================

// User <-> Role (Many-to-Many)
User.belongsToMany(Role, {
  through: "Utilisateur_Roles",
  foreignKey: "id_utilisateur",
  otherKey: "id_role",
});
Role.belongsToMany(User, {
  through: "Utilisateur_Roles",
  foreignKey: "id_role",
  otherKey: "id_utilisateur",
});

// Classe <-> Section/Option/AnneeEtude (One-to-Many)
Section.hasMany(Classe, { foreignKey: "id_section" });
Classe.belongsTo(Section, { foreignKey: "id_section" });

Option.hasMany(Classe, { foreignKey: "id_option" });
Classe.belongsTo(Option, { foreignKey: "id_option" });

AnneeEtude.hasMany(Classe, { foreignKey: "id_annee" });
Classe.belongsTo(AnneeEtude, { foreignKey: "id_annee" });

// User (Eleve) <-> Classe (Many-to-Many via Inscription)
User.belongsToMany(Classe, {
  through: Inscription,
  as: "Classes",
  foreignKey: "id_utilisateur_eleve",
  otherKey: "id_classe",
});
Classe.belongsToMany(User, {
  through: Inscription,
  as: "Eleves",
  foreignKey: "id_classe",
  otherKey: "id_utilisateur_eleve",
});

// User (Prof) <-> Classe (Many-to-Many via ProfesseurClasse)
User.belongsToMany(Classe, {
  as: "TaughtClasses",
  through: ProfesseurClasse,
  foreignKey: "id_utilisateur_prof",
  otherKey: "id_classe",
});
Classe.belongsToMany(User, {
  as: "Teachers",
  through: ProfesseurClasse,
  foreignKey: "id_classe",
  otherKey: "id_utilisateur_prof",
});

// User (Parent) <-> User (Eleve) (Many-to-Many)
User.belongsToMany(User, {
  as: "Children",
  through: RelationParentEleve,
  foreignKey: "id_utilisateur_parent",
  otherKey: "id_utilisateur_eleve",
});
User.belongsToMany(User, {
  as: "Parents",
  through: RelationParentEleve,
  foreignKey: "id_utilisateur_eleve",
  otherKey: "id_utilisateur_parent",
});

// =====================
// EXPORTS
// =====================

export {
  sequelize,
  User,
  Role,
  Section,
  Option,
  AnneeEtude,
  Classe,
  Inscription,
  ProfesseurClasse,
  RelationParentEleve,
};
