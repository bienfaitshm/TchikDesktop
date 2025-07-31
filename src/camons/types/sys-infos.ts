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
  cpus: unknown[];
  networkInterfaces: NodeJS.Dict<unknown[]>;
  homedir: string;
  macAddresses: NetworkInterfaceMacInfo[];
}
