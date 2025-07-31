import { TypographyH1 } from "../components/ui/typography"
import { useGetSystemInfo } from "@/renderer/libs/queries/application"

const StudentScreen = () => {
    const { data: infos } = useGetSystemInfo()
    return (
        <div className="h-screen flex justify-center items-center">
            <TypographyH1>
                Student Screen
            </TypographyH1>
            <code>
                {JSON.stringify(infos, null, 4)}
            </code>
        </div>
    )
}

export default StudentScreen