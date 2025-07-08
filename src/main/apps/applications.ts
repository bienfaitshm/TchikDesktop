import { server } from "@/camons/libs/electron-apis/server"

server.get("configuration", () => {
    return "bonjour le mode"
})
