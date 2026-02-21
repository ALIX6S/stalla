import { app } from "./app.js";
import { config } from "./config/index.js";
import { initDatabase } from "./models/index.js";
import { startDebtCronJob } from "./jobs/debtJob.js";

async function start() {
  let dbOk = false;
  try {
    await initDatabase();
    dbOk = true;
    startDebtCronJob();
  } catch (err) {
    console.error("MySQL non disponible:", err.message);
    console.error("Le serveur démarre quand même ; les routes API échoueront sans base.");
  }

  app.listen(config.port, () => {
    console.log(`Serveur STALLA démarré sur http://localhost:${config.port}`);
    if (!dbOk) console.log("Mode sans base de données (MySQL requis pour l'API).");
  });
}

start();
