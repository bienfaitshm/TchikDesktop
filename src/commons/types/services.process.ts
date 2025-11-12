// Correction du nom de la fonction pour la cohérence
export type ProcessedClassGenderCount = {
  classId: string;
  name: string;
  shortName: string;
  male: number;
  female: number;
  total: number;
};

// Définition du type de retour pour la clarté
export type ProcessedTotalStudentCount = {
  female: number;
  male: number;
  total: number;
};

// Définition du type de retour pour la clarté
export type ProcessedOptionStudentCount = {
  female: number;
  male: number;
  total: number;
  name: string;
  shortName: string;
};

// Correction du nom de la fonction et définition du type de retour
export type ProcessedSectionStudentCount = {
  female: number;
  male: number;
  total: number;
  section: string;
};
