/**
 * ({
        type,
        message: errorMessage,
        stack: errorStack,
})
 * @param error 
 */
export const sendErrorReport = (error: any) => {
  console.log(`Envoi du rapport vers le serveur...`, error);
  // Conseil : utilise une requête synchrone ou attends que l'opération se termine
  // si tu veux être sûr que le rapport parte avant l'exit.
};
