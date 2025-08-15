import * as ExcelJS from "exceljs";

export async function remplirTemplateExcel(templatePath: string) {
  // 1. Charger le classeur existant (votre template)
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(templatePath);

  // 2. Sélectionner la feuille de calcul sur laquelle travailler (la première feuille)
  const worksheet = workbook.getWorksheet(1); // Ou par son nom : workbook.getWorksheet('Feuille1')

  // 3. Vos données à insérer
  const data = [
    { nom: "Client A", produit: "Produit X", quantite: 5, prixUnitaire: 100 },
    { nom: "Client B", produit: "Produit Y", quantite: 2, prixUnitaire: 250 },
    { nom: "Client C", produit: "Produit Z", quantite: 10, prixUnitaire: 50 },
  ];

  // 4. Insérer les données dans le modèle
  const startRow = 2; // Commencer à la ligne 2 pour ne pas écraser les en-têtes
  data.forEach((item, index) => {
    const row = worksheet?.getRow(startRow + index);
    if (row) {
      // Assigner les valeurs aux cellules
      row.getCell(1).value = item.nom;
      row.getCell(2).value = item.produit;
      row.getCell(3).value = item.quantite;
      row.getCell(4).value = item.prixUnitaire;
      // Calculer la cellule "Total"
      row.getCell(5).value = { formula: `C${row.number}*D${row.number}` };
    }
  });

  // 5. Sauvegarder le nouveau fichier
  // await workbook.xlsx.writeFile(outputPath);
  // console.log(`Fichier Excel généré avec succès à : ${outputPath}`);

  // 5 bis. Écrire le classeur dans un Buffer et le renvoyer
  const buffer = await workbook.xlsx.writeBuffer();
  return buffer;
}

// Exemple d'utilisation
// remplirTemplateExcel('path/to/votre_template.xlsx', 'path/to/votre_fichier_final.xlsx');
