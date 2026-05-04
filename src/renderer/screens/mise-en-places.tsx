import { useCallback, useState } from "react";
import { Button } from "../components/ui/button"
import { TypographyH1 } from "../components/ui/typography"
import { useGenerateSeating } from "../libs/queries/seating"
import GlobalRoomManager from "../components/layouts/seatings/room-manager";
import { useSchoolContext } from "../hooks/app-config-router";

const MiseEnPlaceScreen = () => {
    const { schoolId, yearId } = useSchoolContext();
    const [data, setData] = useState([])
    const mutation = useGenerateSeating()

    const onGenerate = useCallback(() => {
        mutation.mutateAsync({ schoolId, yearId }).then(value => {
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
}

export default MiseEnPlaceScreen