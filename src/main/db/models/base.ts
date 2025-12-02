import {
  Model,
  ModelAttributes,
  DataTypes,
  BuildOptions,
  ModelAttributeColumnOptions,
} from "sequelize";
import { generateShortId } from "./utils";

/** Longueur standard pour toutes les clés primaires de type STRING. */
export const ID_LENGTH = 10;

/** Configuration de colonne de base pour toutes les clés primaires du projet. */
export const PRIMARY_KEY_CONFIG: ModelAttributeColumnOptions = {
  type: DataTypes.STRING(ID_LENGTH),
  primaryKey: true,
  unique: true,
  // La clé primaire DOIT être requise, surtout avec un defaultValue
  allowNull: false,
  defaultValue: generateShortId,
};

/**
 * Interface de base que chaque entité persistante doit implémenter.
 * * Utilise le nommage camelCase standard de Sequelize pour les timestamps.
 */
export interface BaseEntity {
  /** L'identifiant unique de l'entité. */
  id: string;
  /** Date de création (gérée automatiquement par Sequelize). */
  createdAt: Date;
  /** Date de dernière mise à jour (gérée automatiquement par Sequelize). */
  updatedAt: Date;
}

/**
 * Type utilitaire pour définir la statique de modèle de Sequelize de manière stricte.
 * @template Attributes - Les attributs de l'entité lue.
 * @template CreationAttributes - Les attributs requis pour la création.
 */
export type ModelStatic<
  Attributes extends {},
  CreationAttributes extends {} = Attributes,
> = typeof Model & {
  new (
    values?: object,
    options?: BuildOptions
  ): Model<Attributes, CreationAttributes> & Attributes;
};

/**
 * Attributs de base à étendre pour chaque modèle Sequelize.
 * * Note: createdAt et updatedAt sont généralement ajoutés par défaut par Sequelize,
 * * mais les définir ici garantit la cohérence du typage.
 */
export const BASE_ATTRIBUTES: ModelAttributes<Model<BaseEntity>> = {
  id: PRIMARY_KEY_CONFIG,
  // Sequelize gère ces colonnes si elles ne sont pas définies,
  // mais les définir en tant que 'date' assure que le type est explicite.
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  updatedAt: {
    type: DataTypes.DATE,
    allowNull: false,
  },
};

/**
 * Crée la définition complète d'une clé primaire, permettant d'étendre la configuration de base.
 * @template M - Le modèle Sequelize cible.
 * @param overrides - Options de colonne spécifiques à fusionner.
 * @returns La définition finale de la colonne clé primaire.
 */
export function primaryKeyColumn<M extends Model = Model<any, any>>(
  overrides: Partial<ModelAttributeColumnOptions<M>> = {}
): ModelAttributeColumnOptions<M> {
  return { ...PRIMARY_KEY_CONFIG, ...overrides };
}
