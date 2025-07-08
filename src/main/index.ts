import { app, shell, BrowserWindow } from "electron"
import { join } from "path"
import { electronApp, optimizer, is } from "@electron-toolkit/utils"
import icon from "../../resources/icon.png?asset"
import { server } from "@/camons/libs/electron-apis/server"
import { formatCurrency } from "@/camons/utils/format"
import "@/main/apps"

function createMainWindow(): void {
    const mainWindow = new BrowserWindow({
        width: 900,
        height: 670,
        show: false,
        autoHideMenuBar: true,
        ...(process.platform === "linux" ? { icon } : {}),
        webPreferences: {
            preload: join(__dirname, "../preload/index.js"),
            sandbox: false,
        },
    })

    server.listen(mainWindow, (routes) => {
        console.log("Format", formatCurrency(1255))
        console.log("server active", JSON.stringify(routes, null, 4))
    })

    mainWindow.once("ready-to-show", () => mainWindow.show())

    mainWindow.webContents.setWindowOpenHandler(({ url }) => {
        shell.openExternal(url)
        return { action: "deny" }
    })

    if (is.dev && process.env.ELECTRON_RENDERER_URL) {
        mainWindow.loadURL(process.env.ELECTRON_RENDERER_URL)
    } else {
        mainWindow.loadFile(join(__dirname, "../renderer/index.html"))
    }
}

app.whenReady().then(() => {
    electronApp.setAppUserModelId("com.electron")

    app.on("browser-window-created", (_, window) => {
        optimizer.watchWindowShortcuts(window)
    })

    createMainWindow()

    app.on("activate", () => {
        if (BrowserWindow.getAllWindows().length === 0) createMainWindow()
    })
})

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") app.quit()
})
