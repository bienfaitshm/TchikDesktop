
import { Button, ButtonProps } from "@/renderer/components/ui/button";
import { LucideBrainCircuit } from "lucide-react";

export const ButtonAi: React.FC<ButtonProps> = (props) => {
    return (
        <Button type="button" size="icon" variant="ghost" className="size-7" {...props}>
            <LucideBrainCircuit className="size-5" />
        </Button>
    )
}