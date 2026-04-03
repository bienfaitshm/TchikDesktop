import { SeatingSessionForm } from "../components/form/seatings/seating-sessions-form"
import { TypographyH1 } from "../components/ui/typography"

const LocalScreen = () => {
    return (
        <div className="h-screen flex justify-center items-center flex-col">
            <TypographyH1>
                Local Screen
            </TypographyH1>
            <SeatingSessionForm />
        </div>
    )
}

export default LocalScreen