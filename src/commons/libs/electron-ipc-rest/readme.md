# IPC Layer Abstraction

Une couche de communication type **REST-over-IPC** entre le Renderer (Client) et le Main (Server) process d'Electron. Conçue pour la scalabilité et la testabilité.

## Cas d'utilisation

1. **CRUD Sécurisé :** Accéder à la base de données (SQLite/Realm) située dans le Main process depuis l'UI sans exposer directement les drivers SQL.
2. **Opérations Lourdes :** Déclencher des traitements d'image ou des I/O fichiers (Node.js fs) via une API asynchrone simple.
3. **Gestion Centralisée des Erreurs :** Capturer toutes les exceptions du backend et les transformer en codes d'erreur HTTP lisibles par l'UI (404, 500, 403).

## Architecture

* **Request/Response Model :** Utilise des verbes HTTP (GET, POST, etc.) pour mapper les canaux IPC.
* **Interceptors :** Similaire à Axios. Permet d'injecter des tokens d'auth ou de logger les requêtes sortantes.
* **Strong Typing :** Utilisation intensive de Generics TypeScript pour garantir que le type de retour du serveur correspond à ce que le client attend.

## Exemple d'utilisation

### Côté Serveur (Main Process)

```typescript
// main.ts
import { app, ipcMain } from 'electron';
import { IpcServer, HttpException, HttpStatus } from './ipc';

const server = new IpcServer(ipcMain);

// Route GET simple
server.get('/system/version', () => app.getVersion());

// Route POST avec validation et erreur typée
server.post<{ success: boolean }, { username: string }>('/users', async (req) => {
  if (!req.body.username) {
    throw new HttpException("Username required", HttpStatus.BAD_REQUEST);
  }
  await db.createUser(req.body.username);
  return { success: true };
});

server.listen();

```

### Côté Client (Renderer Process)

```typescript
// api.ts
import { IpcClient } from './ipc';

const client = new IpcClient(window.electron.ipcRenderer);

// Intercepteur pour logging
client.interceptors.request.use((req) => {
  console.log(`Sending ${req.method} to ${req.route}`);
  return req;
});

// Appel API
async function registerUser() {
  try {
    const res = await client.post('/users', { username: 'Neo' });
    console.log(res); // { success: true }
  } catch (err) {
    console.error(err.message); // "Username required"
  }
}

```
