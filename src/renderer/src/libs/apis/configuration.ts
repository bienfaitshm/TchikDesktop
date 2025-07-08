import { clientApis } from "./client"

export const getConfiguration = () => {
    return clientApis.get("configuration")
}
