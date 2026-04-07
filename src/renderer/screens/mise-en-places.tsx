import { useCallback, useState } from "react";
import { Button } from "../components/ui/button"
import { TypographyH1 } from "../components/ui/typography"
import { useGenerateSeating } from "../libs/queries/seating"
import { withSchoolConfig } from "@/renderer/hooks/with-application-config";
import GlobalRoomManager from "../components/layouts/seatings/room-manager";

const MiseEnPlaceScreen = withSchoolConfig((params: { schoolId: string, yearId: string }) => {
    const [data, setData] = useState([])
    const mutation = useGenerateSeating()
    const onGenerate = useCallback(() => {
        mutation.mutateAsync({ ...params }).then(value => {
            console.log("Genration", value)
            setData(value)
        })
    }, [])
    return (
        <div className="">
            <TypographyH1>
                MiseEnPlace Screen
            </TypographyH1>
            <Button onClick={onGenerate}>
                Generate
            </Button>
            <div>
                <GlobalRoomManager sessionId={"123456"} rooms={data || []} />
            </div>
        </div>
    )
})


export default MiseEnPlaceScreen