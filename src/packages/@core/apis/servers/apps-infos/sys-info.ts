import os from "node:os";

/**
 * @interface NetworkInterfaceMacInfo
 * @description Représente l'information MAC d'une interface réseau.
 * @property {string} name - Le nom de l'interface réseau (par exemple, "Ethernet", "Wi-Fi", "en0").
 * @property {string} mac - L'adresse MAC de l'interface réseau.
 */
export interface NetworkInterfaceMacInfo {
  name: string;
  mac: string;
}

/**
 * @interface SystemInformation
 * @description Représente une collection d'informations clés liées au système, obtenues à partir du module Node.js `os`.
 * @property {NodeJS.Platform} platform - La plateforme du système d'exploitation (par exemple, 'darwin', 'win32', 'linux').
 * @property {string} type - Le nom du système d'exploitation (par exemple, 'Linux', 'Darwin', 'Windows_NT').
 * @property {string} arch - L'architecture CPU du système d'exploitation (par exemple, 'x64', 'arm64').
 * @property {string} release - La version de la version du système d'exploitation.
 * @property {number} uptime - La durée de fonctionnement du système en secondes.
 * @property {string} hostname - Le nom d'hôte du système d'exploitation.
 * @property {number} totalmem - La quantité totale de mémoire système en octets.
 * @property {number} freemem - La quantité de mémoire système libre en octets.
 * @property {os.CpuInfo[]} cpus - Un tableau d'objets contenant des informations sur chaque CPU/cœur.
 * @property {NodeJS.Dict<os.NetworkInterfaceInfo[]>} networkInterfaces - Un objet contenant les interfaces réseau auxquelles une adresse réseau a été attribuée.
 * @property {string} homedir - Le chemin d'accès au répertoire personnel de l'utilisateur actuel.
 * @property {NetworkInterfaceMacInfo[]} macAddresses - Un tableau d'objets contenant les adresses MAC de toutes les interfaces réseau non internes.
 */
export interface SystemInformation {
  platform: NodeJS.Platform;
  type: string;
  arch: string;
  release: string;
  uptime: number;
  hostname: string;
  totalmem: number;
  freemem: number;
  cpus: os.CpuInfo[];
  networkInterfaces: NodeJS.Dict<os.NetworkInterfaceInfo[]>;
  homedir: string;
  macAddresses: NetworkInterfaceMacInfo[];
}

/**
 * @function getSystemInformation
 * @description Récupère un ensemble complet d'informations au niveau du système en utilisant le module `os` intégré de Node.js.
 * Cette fonction fournit des détails sur le système d'exploitation, le matériel et la configuration réseau,
 * y compris une liste des adresses MAC des interfaces réseau.
 * @returns {SystemInformation} Un objet contenant diverses informations système.
 *
 * @example
 * ```typescript
 * import { getSystemInformation } from './path/to/this/file';
 *
 * const sysInfo = getSystemInformation();
 *
 * console.log('Plateforme du système d\'exploitation :', sysInfo.platform);
 * console.log('Type du système d\'exploitation :', sysInfo.type);
 * console.log('Architecture du CPU :', sysInfo.arch);
 * console.log('Durée de fonctionnement du système (secondes) :', sysInfo.uptime);
 * console.log('Mémoire totale (octets) :', sysInfo.totalmem);
 * console.log('Mémoire libre (octets) :', sysInfo.freemem);
 * console.log('Nombre de CPU :', sysInfo.cpus.length);
 * console.log('Répertoire personnel :', sysInfo.homedir);
 *
 * console.log('\nAdresses MAC :');
 * if (sysInfo.macAddresses.length > 0) {
 * sysInfo.macAddresses.forEach((macInfo) => {
 * console.log(`  Interface: ${macInfo.name}, MAC: ${macInfo.mac}`);
 * });
 * } else {
 * console.log('  Aucune adresse MAC trouvée pour les interfaces non internes.');
 * }
 *
 * console.log('\nInterfaces réseau détaillées :');
 * for (const interfaceName in sysInfo.networkInterfaces) {
 * sysInfo.networkInterfaces[interfaceName]?.forEach((details) => {
 * console.log(`  Interface: ${interfaceName}, Famille: ${details.family}, Adresse: ${details.address}, MAC: ${details.mac}`);
 * });
 * }
 * ```
 */
export function getSystemInformation(): SystemInformation {
  const networkInterfaces = os.networkInterfaces();
  const macAddresses: NetworkInterfaceMacInfo[] = [];

  for (const name in networkInterfaces) {
    const interfaces = networkInterfaces[name];
    if (interfaces) {
      for (const iface of interfaces) {
        if (!iface.internal && iface.mac && iface.mac !== "00:00:00:00:00:00") {
          macAddresses.push({ name: name, mac: iface.mac });
        }
      }
    }
  }

  return {
    platform: os.platform(),
    type: os.type(),
    arch: os.arch(),
    release: os.release(),
    uptime: os.uptime(),
    hostname: os.hostname(),
    totalmem: os.totalmem(),
    freemem: os.freemem(),
    cpus: os.cpus(),
    networkInterfaces: networkInterfaces,
    homedir: os.homedir(),
    macAddresses: Array.from(new Set(macAddresses.map((m) => m.mac))).map(
      (mac) => macAddresses.find((m) => m.mac === mac)!
    ),
  };
}
